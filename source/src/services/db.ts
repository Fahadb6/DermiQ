import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Appointment, AppointmentType, ArticleStatus, ContactMessage, Database, ISODate, Notification, NotificationKind,
  NotificationPrefs, SessionRecord, Text,
} from '@/types';
import { buildSeed, SCHEMA_VERSION } from '@/data/seed';
import { uid } from '@/utils/misc';
import { KEYS, localKV, storageStatus } from './storage';
import { useAuth } from './auth';
import { configDiff, isConfigComplete } from './selectors';

/* ------------------------------------------------------------------
 * Centralised demo database (LocalStorage prototype).
 * The patient application and the physician portal read and write THIS store,
 * which is what makes the end-to-end flow real inside one browser.
 * ------------------------------------------------------------------ */

export type ErrorCode = 'forbidden' | 'not_found' | 'locked' | 'incomplete' | 'invalid_state' | 'not_due' | 'invalid' | 'storage';
export type Result<T = undefined> = { ok: true; value: T } | { ok: false; error: ErrorCode };
const ok = <T,>(value: T): Result<T> => ({ ok: true, value });
const done = (): Result => ({ ok: true, value: undefined });
const fail = (error: ErrorCode): { ok: false; error: ErrorCode } => ({ ok: false, error });

export interface ConfigInput {
  doseMl: number | null;
  headConfirmed: boolean;
  intervalDays: number | null;
  followUpDate: ISODate | null;
  notes: Text;
  /** Date/time of the next treatment appointment, or null to leave appointments untouched. */
  nextAppointmentAt: ISODate | null;
}
export interface AppointmentInput { patientId: string; at: ISODate; type: AppointmentType; note: Text }

const ARTICLE_FLOW: Record<ArticleStatus, ArticleStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'draft'],
  approved: ['published', 'draft'],
  published: ['archived', 'pending_review'],
  archived: ['draft'],
};
export function allowedArticleTransitions(s: ArticleStatus): ArticleStatus[] { return ARTICLE_FLOW[s]; }

const PREF_OF: Record<NotificationKind, keyof NotificationPrefs> = {
  plan_approved: 'planUpdates', plan_updated: 'planUpdates', plan_locked: 'planUpdates', plan_under_review: 'planUpdates',
  note_shared: 'planUpdates', plan_pending: 'planUpdates', followup_due: 'planUpdates',
  appointment_created: 'appointments', appointment_updated: 'appointments', appointment_cancelled: 'appointments',
  session_reviewed: 'sessions', session_reported: 'sessions', session_missed: 'sessions',
  photo_reviewed: 'photos', photo_uploaded: 'photos',
};
export function prefOfKind(kind: NotificationKind): keyof NotificationPrefs { return PREF_OF[kind]; }

function push(db: Database, n: Omit<Notification, 'id' | 'at' | 'read'>) {
  const prefs = n.audience === 'patient'
    ? db.patients.find((p) => p.id === n.recipientId)?.notificationPrefs
    : db.physicians.find((p) => p.id === n.recipientId)?.notificationPrefs;
  if (prefs && !prefs[PREF_OF[n.kind]]) return; // recipient switched this category off
  db.notifications = [{ ...n, id: uid('N'), at: new Date().toISOString(), read: false }, ...db.notifications];
}

/* ---------- permission helpers (client-side prototype enforcement) ---------- */
function physicianId(): string | null {
  const s = useAuth.getState().validate();
  return s && s.role === 'physician' ? s.profileId : null;
}
function isPatient(patientId: string): boolean {
  const s = useAuth.getState().validate();
  return !!s && s.role === 'patient' && s.profileId === patientId;
}

interface DbState {
  db: Database;
  // Treatment plan (physician only)
  saveConfiguration: (patientId: string, input: ConfigInput) => Result;
  approvePlan: (patientId: string) => Result;
  lockPlan: (patientId: string) => Result;
  reopenPlan: (patientId: string) => Result;
  // Appointments (physician only)
  createAppointment: (input: AppointmentInput) => Result<string>;
  updateAppointment: (id: string, patch: { at: ISODate; type: AppointmentType; note: Text }) => Result;
  cancelAppointment: (id: string) => Result;
  // Sessions
  reportSession: (sessionId: string, note: string) => Result;
  markSessionMissed: (sessionId: string, note: string) => Result;
  reviewSession: (sessionId: string, note: string) => Result;
  // Progress photos
  addPhoto: (patientId: string, input: { src: string; takenAt: ISODate; note: string }) => Result<string>;
  deletePhoto: (photoId: string) => Result;
  reviewPhoto: (photoId: string, note: string) => Result;
  // Physician notes
  addNote: (patientId: string, text: string, shared: boolean) => Result;
  removeNote: (noteId: string) => Result;
  // Notifications
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  // Preferences
  setPatientPrefs: (patientId: string, prefs: NotificationPrefs) => Result;
  setPhysicianPrefs: (prefs: NotificationPrefs) => Result;
  // Education governance
  transitionArticle: (articleId: string, to: ArticleStatus, note: string) => Result;
  // Public contact form (stored locally only)
  addMessage: (m: Omit<ContactMessage, 'id' | 'at'>) => Result;
  // Demo
  resetDemo: () => void;
}

export const useDb = create<DbState>()(
  persist(
    (set, get) => {
      /** Run a mutation on a shallow copy; commit only when it succeeds. */
      const commit = <T,>(fn: (db: Database) => Result<T>): Result<T> => {
        const draft: Database = { ...get().db };
        const r = fn(draft);
        if (r.ok) set({ db: draft });
        return r;
      };
      const nowIso = () => new Date().toISOString();

      return {
        db: buildSeed(new Date()),

        /* ============ Treatment configuration & plan ============ */
        saveConfiguration: (patientId, input) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          const plan = db.plans.find((p) => p.patientId === patientId);
          const cfg = db.configurations.find((c) => c.patientId === patientId);
          if (!plan || !cfg) return fail('not_found');
          if (plan.approvalStatus === 'locked') return fail('locked');
          if (input.doseMl != null && (input.doseMl < 0.1 - 1e-9 || input.doseMl > 0.5 + 1e-9)) return fail('invalid');
          if (input.intervalDays != null && (input.intervalDays < 1 || input.intervalDays > 365)) return fail('invalid');

          const next = { ...cfg, doseMl: input.doseMl, headConfirmed: input.headConfirmed, intervalDays: input.intervalDays, followUpDate: input.followUpDate, notes: input.notes, savedAt: nowIso() };
          db.configurations = db.configurations.map((c) => (c.id === cfg.id ? next : c));

          let status = plan.approvalStatus;
          if (plan.approved) {
            // An approved version exists: any difference must be approved again before the patient sees it.
            if (configDiff(next, plan.approved).length > 0) status = 'requires_review';
          } else {
            status = isConfigComplete(next) ? 'pending_approval' : 'draft';
          }
          const becameReview = status === 'requires_review' && plan.approvalStatus !== 'requires_review';
          db.plans = db.plans.map((p) => (p.id === plan.id ? { ...p, approvalStatus: status, lastUpdated: nowIso() } : p));
          if (becameReview) push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'plan_under_review', params: {}, link: '/patient/plan' });

          // Next treatment appointment (single source of truth = appointments table)
          if (input.nextAppointmentAt) {
            const now = Date.now();
            const existing = db.appointments
              .filter((a) => a.patientId === patientId && a.type === 'treatment' && a.status === 'scheduled' && new Date(a.at).getTime() >= now)
              .sort((a, b) => a.at.localeCompare(b.at))[0];
            if (!existing) {
              const apptId = uid('AP');
              db.appointments = [...db.appointments, { id: apptId, patientId, physicianId: dr, at: input.nextAppointmentAt, type: 'treatment', status: 'scheduled', note: '', createdAt: nowIso(), updatedAt: nowIso() }];
              db.sessions = [...db.sessions, newSession(patientId, plan.id, apptId, input.nextAppointmentAt)];
              push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'appointment_created', params: { at: input.nextAppointmentAt }, link: '/patient' });
            } else if (existing.at !== input.nextAppointmentAt) {
              db.appointments = db.appointments.map((a) => (a.id === existing.id ? { ...a, at: input.nextAppointmentAt as string, updatedAt: nowIso() } : a));
              db.sessions = db.sessions.map((s) => (s.appointmentId === existing.id && s.status === 'scheduled' ? { ...s, scheduledAt: input.nextAppointmentAt as string } : s));
              push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'appointment_updated', params: { at: input.nextAppointmentAt }, link: '/patient' });
            }
          }
          return done();
        }),

        approvePlan: (patientId) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          const plan = db.plans.find((p) => p.patientId === patientId);
          const cfg = db.configurations.find((c) => c.patientId === patientId);
          if (!plan || !cfg) return fail('not_found');
          if (plan.approvalStatus === 'locked') return fail('locked');
          if (!isConfigComplete(cfg)) return fail('incomplete');
          const revision = (plan.approved?.revision ?? 0) + 1;
          const at = nowIso();
          db.plans = db.plans.map((p) => p.id !== plan.id ? p : {
            ...p, approvalStatus: 'approved', lockedAt: null, lastUpdated: at,
            approved: { doseMl: cfg.doseMl as number, headId: 'DQ-HEAD-01', intervalDays: cfg.intervalDays as number, followUpDate: cfg.followUpDate, notes: cfg.notes, approvedAt: at, approvedBy: dr, revision },
          });
          push(db, { audience: 'patient', recipientId: patientId, patientId, kind: revision > 1 ? 'plan_updated' : 'plan_approved', params: { rev: revision }, link: '/patient/plan' });
          return done();
        }),

        lockPlan: (patientId) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          const plan = db.plans.find((p) => p.patientId === patientId);
          if (!plan) return fail('not_found');
          if (plan.approvalStatus !== 'approved' || !plan.approved) return fail('invalid_state');
          const at = nowIso();
          db.plans = db.plans.map((p) => (p.id === plan.id ? { ...p, approvalStatus: 'locked', lockedAt: at, lastUpdated: at } : p));
          push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'plan_locked', params: {}, link: '/patient/plan' });
          return done();
        }),

        reopenPlan: (patientId) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          const plan = db.plans.find((p) => p.patientId === patientId);
          if (!plan) return fail('not_found');
          if (plan.approvalStatus !== 'approved' && plan.approvalStatus !== 'locked') return fail('invalid_state');
          db.plans = db.plans.map((p) => (p.id === plan.id ? { ...p, approvalStatus: 'requires_review', lockedAt: null, lastUpdated: nowIso() } : p));
          push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'plan_under_review', params: {}, link: '/patient/plan' });
          return done();
        }),

        /* ============ Appointments ============ */
        createAppointment: (input) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          const plan = db.plans.find((p) => p.patientId === input.patientId);
          if (!plan) return fail('not_found');
          if (Number.isNaN(new Date(input.at).getTime())) return fail('invalid');
          const id = uid('AP');
          const at = nowIso();
          db.appointments = [...db.appointments, { id, patientId: input.patientId, physicianId: dr, at: input.at, type: input.type, status: 'scheduled', note: input.note, createdAt: at, updatedAt: at }];
          if (input.type === 'treatment') db.sessions = [...db.sessions, newSession(input.patientId, plan.id, id, input.at)];
          push(db, { audience: 'patient', recipientId: input.patientId, patientId: input.patientId, kind: 'appointment_created', params: { at: input.at }, link: '/patient' });
          return ok(id);
        }),

        updateAppointment: (id, patch) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          const appt = db.appointments.find((a) => a.id === id);
          if (!appt) return fail('not_found');
          if (appt.status === 'cancelled') return fail('invalid_state');
          if (Number.isNaN(new Date(patch.at).getTime())) return fail('invalid');
          const plan = db.plans.find((p) => p.patientId === appt.patientId);
          const linked = db.sessions.find((s) => s.appointmentId === id);
          // A session the patient already reported keeps its record; only undocumented ones follow the appointment.
          if (linked && linked.status !== 'scheduled' && patch.type !== 'treatment') return fail('invalid_state');
          const upcoming = new Date(patch.at).getTime() >= Date.now();
          const next: Appointment = { ...appt, at: patch.at, type: patch.type, note: patch.note, status: upcoming ? 'scheduled' : appt.status, updatedAt: nowIso() };
          db.appointments = db.appointments.map((a) => (a.id === id ? next : a));
          if (patch.type === 'treatment') {
            if (linked) db.sessions = db.sessions.map((s) => (s.id === linked.id && s.status === 'scheduled' ? { ...s, scheduledAt: patch.at } : s));
            else if (plan) db.sessions = [...db.sessions, newSession(appt.patientId, plan.id, id, patch.at)];
          } else if (linked) {
            db.sessions = db.sessions.filter((s) => s.id !== linked.id);
          }
          push(db, { audience: 'patient', recipientId: appt.patientId, patientId: appt.patientId, kind: 'appointment_updated', params: { at: patch.at }, link: '/patient' });
          return done();
        }),

        cancelAppointment: (id) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          const appt = db.appointments.find((a) => a.id === id);
          if (!appt) return fail('not_found');
          if (appt.status === 'cancelled') return fail('invalid_state');
          db.appointments = db.appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled', updatedAt: nowIso() } : a));
          // Remove the undocumented session that belonged to this appointment.
          db.sessions = db.sessions.filter((s) => !(s.appointmentId === id && s.status === 'scheduled'));
          push(db, { audience: 'patient', recipientId: appt.patientId, patientId: appt.patientId, kind: 'appointment_cancelled', params: { at: appt.at }, link: '/patient' });
          return done();
        }),

        /* ============ Sessions (always patient-reported) ============ */
        reportSession: (sessionId, note) => commit((db) => {
          const s = db.sessions.find((x) => x.id === sessionId);
          if (!s) return fail('not_found');
          if (!isPatient(s.patientId)) return fail('forbidden');
          if (s.status !== 'scheduled') return fail('invalid_state');
          if (new Date(s.scheduledAt).getTime() > Date.now()) return fail('not_due');
          const at = nowIso();
          db.sessions = db.sessions.map((x) => x.id !== sessionId ? x : { ...x, status: 'reported', recordedBy: 'patient', reportedAt: at, patientNote: note.trim(), review: 'pending' });
          const patient = db.patients.find((p) => p.id === s.patientId);
          if (patient) push(db, { audience: 'physician', recipientId: patient.physicianId, patientId: s.patientId, kind: 'session_reported', params: {}, link: `/physician/sessions?patient=${s.patientId}` });
          return done();
        }),

        markSessionMissed: (sessionId, note) => commit((db) => {
          const s = db.sessions.find((x) => x.id === sessionId);
          if (!s) return fail('not_found');
          const dr = physicianId();
          const patient = isPatient(s.patientId);
          if (!dr && !patient) return fail('forbidden');
          if (s.status !== 'scheduled') return fail('invalid_state');
          if (new Date(s.scheduledAt).getTime() > Date.now()) return fail('not_due');
          const at = nowIso();
          db.sessions = db.sessions.map((x) => x.id !== sessionId ? x : {
            ...x, status: 'missed', recordedBy: dr ? 'physician' : 'patient', reportedAt: at,
            patientNote: patient ? note.trim() : x.patientNote, physicianNote: dr ? note.trim() : x.physicianNote,
          });
          const p = db.patients.find((y) => y.id === s.patientId);
          if (patient && p) push(db, { audience: 'physician', recipientId: p.physicianId, patientId: s.patientId, kind: 'session_missed', params: {}, link: `/physician/sessions?patient=${s.patientId}` });
          return done();
        }),

        reviewSession: (sessionId, note) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          const s = db.sessions.find((x) => x.id === sessionId);
          if (!s) return fail('not_found');
          if (s.status !== 'reported') return fail('invalid_state');
          db.sessions = db.sessions.map((x) => x.id !== sessionId ? x : { ...x, review: 'reviewed', reviewedAt: nowIso(), reviewedBy: dr, physicianNote: note.trim() });
          push(db, { audience: 'patient', recipientId: s.patientId, patientId: s.patientId, kind: 'session_reviewed', params: { at: s.scheduledAt }, link: '/patient/sessions' });
          return done();
        }),

        /* ============ Progress photos ============ */
        addPhoto: (patientId, input) => {
          const before = get().db;
          const r = commit<string>((db) => {
            if (!isPatient(patientId)) return fail('forbidden');
            const patient = db.patients.find((p) => p.id === patientId);
            if (!patient) return fail('not_found');
            const id = uid('PH');
            db.photos = [...db.photos, { id, patientId, takenAt: input.takenAt, uploadedAt: nowIso(), src: input.src, origin: 'upload', patientNote: input.note.trim(), review: 'pending', physicianNote: '', reviewedAt: null }];
            push(db, { audience: 'physician', recipientId: patient.physicianId, patientId, kind: 'photo_uploaded', params: {}, link: `/physician/progress?patient=${patientId}` });
            return ok(id);
          });
          // LocalStorage has a small quota. If the write failed, roll back rather than pretend it was saved.
          if (r.ok && storageStatus.lastWriteFailed) {
            set({ db: before });
            return fail('storage');
          }
          return r;
        },

        deletePhoto: (photoId) => commit((db) => {
          const ph = db.photos.find((p) => p.id === photoId);
          if (!ph) return fail('not_found');
          if (!isPatient(ph.patientId)) return fail('forbidden');
          if (ph.origin !== 'upload' || ph.review !== 'pending') return fail('invalid_state');
          db.photos = db.photos.filter((p) => p.id !== photoId);
          return done();
        }),

        reviewPhoto: (photoId, note) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          const ph = db.photos.find((p) => p.id === photoId);
          if (!ph) return fail('not_found');
          db.photos = db.photos.map((p) => (p.id === photoId ? { ...p, review: 'reviewed', physicianNote: note.trim(), reviewedAt: nowIso() } : p));
          push(db, { audience: 'patient', recipientId: ph.patientId, patientId: ph.patientId, kind: 'photo_reviewed', params: { at: ph.takenAt }, link: '/patient/progress' });
          return done();
        }),

        /* ============ Physician notes ============ */
        addNote: (patientId, text, shared) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          if (!text.trim()) return fail('invalid');
          if (!db.patients.some((p) => p.id === patientId)) return fail('not_found');
          db.notes = [{ id: uid('PN'), patientId, physicianId: dr, at: nowIso(), text: text.trim(), shared }, ...db.notes];
          if (shared) push(db, { audience: 'patient', recipientId: patientId, patientId, kind: 'note_shared', params: {}, link: '/patient/plan' });
          return done();
        }),
        removeNote: (noteId) => commit((db) => {
          if (!physicianId()) return fail('forbidden');
          db.notes = db.notes.filter((n) => n.id !== noteId);
          return done();
        }),

        /* ============ Notifications ============ */
        markRead: (id, read = true) => {
          const s = useAuth.getState().session;
          if (!s) return;
          const db = get().db;
          set({ db: { ...db, notifications: db.notifications.map((n) => (n.id === id && n.recipientId === s.profileId ? { ...n, read } : n)) } });
        },
        markAllRead: () => {
          const s = useAuth.getState().session;
          if (!s) return;
          const db = get().db;
          set({ db: { ...db, notifications: db.notifications.map((n) => (n.recipientId === s.profileId && n.audience === s.role ? { ...n, read: true } : n)) } });
        },

        /* ============ Preferences ============ */
        setPatientPrefs: (patientId, prefs) => commit((db) => {
          if (!isPatient(patientId)) return fail('forbidden');
          db.patients = db.patients.map((p) => (p.id === patientId ? { ...p, notificationPrefs: prefs } : p));
          return done();
        }),
        setPhysicianPrefs: (prefs) => commit((db) => {
          const dr = physicianId();
          if (!dr) return fail('forbidden');
          db.physicians = db.physicians.map((p) => (p.id === dr ? { ...p, notificationPrefs: prefs } : p));
          return done();
        }),

        /* ============ Education governance ============ */
        transitionArticle: (articleId, to, note) => commit((db) => {
          const dr = physicianId();
          const me = db.physicians.find((p) => p.id === dr);
          if (!dr || !me || !me.canReviewContent) return fail('forbidden');
          const art = db.articles.find((a) => a.id === articleId);
          if (!art) return fail('not_found');
          if (!ARTICLE_FLOW[art.status].includes(to)) return fail('invalid_state');
          const at = nowIso();
          db.articles = db.articles.map((a) => a.id !== articleId ? a : {
            ...a, status: to, updatedAt: at,
            ...(to === 'approved' ? { reviewer: me.name, reviewDate: at } : {}),
            ...(to === 'draft' ? { reviewer: null, reviewDate: null } : {}),
          });
          db.articleReviews = [{ id: uid('AR'), articleId, from: art.status, to, by: me.name, at, note: note.trim() }, ...db.articleReviews];
          return done();
        }),

        /* ============ Public contact form ============ */
        addMessage: (m) => commit((db) => {
          db.messages = [{ ...m, id: uid('MSG'), at: nowIso() }, ...db.messages];
          return done();
        }),

        /* ============ Demo ============ */
        resetDemo: () => set({ db: buildSeed(new Date()) }),
      };
    },
    {
      name: KEYS.db,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localKV),
      partialize: (s) => ({ db: s.db }),
      // Any older demo database is replaced by a fresh seed.
      migrate: () => ({ db: buildSeed(new Date()) }),
      merge: (persisted, current) => {
        const p = persisted as { db?: Database } | undefined;
        if (!p?.db || p.db.schemaVersion !== SCHEMA_VERSION) return current;
        return { ...current, db: p.db };
      },
    },
  ),
);

function newSession(patientId: string, planId: string, appointmentId: string, at: string): SessionRecord {
  return {
    id: uid('SR'), patientId, planId, appointmentId, scheduledAt: at, status: 'scheduled', recordedBy: null, reportedAt: null,
    patientNote: '', review: 'none', reviewedAt: null, reviewedBy: null, physicianNote: '',
  };
}

// First visit: write the seed so every tab of this browser shares one database.
if (localKV.getItem(KEYS.db) == null) useDb.setState({ db: useDb.getState().db });

// Same-browser tab sync (patient tab <-> physician tab). This is NOT cross-device sync.
window.addEventListener('storage', (e) => {
  if (e.key === KEYS.db) void useDb.persist.rehydrate();
});

export function errorKey(code: ErrorCode): ErrorCode { return code; }
