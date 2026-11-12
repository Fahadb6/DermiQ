import { create } from 'zustand';
import type { Role, User } from '@/types';
import { KEYS, sessionKV } from './storage';

/**
 * SIMULATED AUTHENTICATION — prototype only.
 * Credentials are demo values checked in the browser; there is no server, no hashing and
 * no real security. The session lives in sessionStorage (per tab), so a physician tab and a
 * patient tab can be open side by side to demonstrate the shared data flow.
 */
export interface Session {
  userId: string;
  role: Role;
  profileId: string;
  email: string;
  startedAt: string;
  expiresAt: string;
}

const TTL_MS = 8 * 60 * 60 * 1000; // sessions end after 8 hours, or when the tab is closed

function read(): Session | null {
  try {
    const raw = sessionKV.getItem(KEYS.session);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.expiresAt || new Date(s.expiresAt).getTime() <= Date.now()) {
      sessionKV.removeItem(KEYS.session);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export type LoginFailure = 'invalid' | 'wrong_portal';
export type LoginResult = { ok: true; session: Session } | { ok: false; reason: LoginFailure };

interface AuthState {
  session: Session | null;
  /** True when the last session ended because it expired (shown once on the sign-in screen). */
  expired: boolean;
  login: (users: User[], role: Role, email: string, password: string) => LoginResult;
  logout: () => void;
  /** Re-validate expiry; called by route guards. */
  validate: () => Session | null;
  clearExpired: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  session: read(),
  expired: false,
  login: (users, role, email, password) => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.demoPassword !== password) return { ok: false, reason: 'invalid' };
    if (user.role !== role) return { ok: false, reason: 'wrong_portal' };
    const now = Date.now();
    const session: Session = {
      userId: user.id, role: user.role, profileId: user.profileId, email: user.email,
      startedAt: new Date(now).toISOString(), expiresAt: new Date(now + TTL_MS).toISOString(),
    };
    sessionKV.setItem(KEYS.session, JSON.stringify(session));
    set({ session, expired: false });
    return { ok: true, session };
  },
  logout: () => {
    sessionKV.removeItem(KEYS.session);
    set({ session: null, expired: false });
  },
  validate: () => {
    const s = get().session;
    if (s && new Date(s.expiresAt).getTime() <= Date.now()) {
      sessionKV.removeItem(KEYS.session);
      set({ session: null, expired: true });
      return null;
    }
    return s;
  },
  clearExpired: () => set({ expired: false }),
}));
