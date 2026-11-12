/**
 * Safe Web Storage access.
 * In sandboxed frames or privacy modes, touching window.localStorage can throw.
 * We fall back to an in-memory store so the prototype keeps working (without persistence).
 */
export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function probe(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    const s = window[kind];
    const k = '__dermiq_probe__';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

function memory(): KV {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

const ls = probe('localStorage');
const ss = probe('sessionStorage');

export const storageStatus = {
  persistent: ls !== null,
  /** Set when a write fails (for example, the browser quota is exhausted). */
  lastWriteFailed: false,
};

function wrap(native: Storage | null): KV {
  const fallback = memory();
  if (!native) return fallback;
  return {
    getItem(k) {
      try { return native.getItem(k); } catch { return fallback.getItem(k); }
    },
    setItem(k, v) {
      try { native.setItem(k, v); storageStatus.lastWriteFailed = false; }
      catch { storageStatus.lastWriteFailed = true; fallback.setItem(k, v); }
    },
    removeItem(k) {
      try { native.removeItem(k); } catch { fallback.removeItem(k); }
    },
  };
}

/** Shared between tabs of the same browser. Demo database + language. */
export const localKV: KV = wrap(ls);
/** Per-tab. Simulated sign-in session. */
export const sessionKV: KV = wrap(ss);

export const KEYS = {
  db: 'dermiq.db',
  lang: 'dermiq.lang',
  session: 'dermiq.session',
} as const;
