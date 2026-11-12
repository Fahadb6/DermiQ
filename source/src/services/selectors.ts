import { inlineAsset } from '@/utils/embed';
import type {
  Appointment, ApprovedPlanSnapshot, Database, EducationalArticle, PlanStatus, ProgressPhoto, SessionRecord, SessionView,
  TreatmentConfiguration, TreatmentPlan,
} from '@/types';
import { DAY, startOfDay } from '@/utils/dates';
import { DEMO_DOSE_STEPS } from '@/data/product';
import { pick } from '@/utils/misc';

/* ---------------- Plans ---------------- */

/** Statuses in which the patient can see an approved snapshot. Drafts are never exposed. */
export const PATIENT_VISIBLE: PlanStatus[] = ['approved', 'locked', 'requires_review'];
export const ACTIVE_PLAN: PlanStatus[] = ['approved', 'locked'];

export function visibleSnapshot(plan: TreatmentPlan | null | undefined): ApprovedPlanSnapshot | null {
  if (!plan || !plan.approved) return null;
  return PATIENT_VISIBLE.includes(plan.approvalStatus) ? plan.approved : null;
}

export function planOf(db: Database, patientId: string): TreatmentPlan | undefined {
  return db.plans.find((p) => p.patientId === patientId);
}
export function configOf(db: Database, patientId: string): TreatmentConfiguration | undefined {
  return db.configurations.find((c) => c.patientId === patientId);
}

export function isValidDose(v: number | null | undefined): v is number {
  return v != null && DEMO_DOSE_STEPS.some((d) => Math.abs(d - v) < 1e-9);
}
export function isConfigComplete(c: Pick<TreatmentConfiguration, 'doseMl' | 'headConfirmed' | 'intervalDays'>): boolean {
  return isValidDose(c.doseMl) && c.headConfirmed && c.intervalDays != null && c.intervalDays >= 1 && c.intervalDays <= 365;
}
function sameDate(a: string | null, b: string | null): boolean {
  if (!a || !b) return a === b || (!a && !b);
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}
/** Which fields of the working configuration differ from what the patient currently sees. */
export function configDiff(c: TreatmentConfiguration, a: ApprovedPlanSnapshot | null): Array<'dose' | 'interval' | 'followUp' | 'notes'> {
  if (!a) return ['dose', 'interval', 'followUp', 'notes'];
  const out: Array<'dose' | 'interval' | 'followUp' | 'notes'> = [];
  if (c.doseMl !== a.doseMl) out.push('dose');
  if (c.intervalDays !== a.intervalDays) out.push('interval');
  if (!sameDate(c.followUpDate, a.followUpDate)) out.push('followUp');
  if (pick(c.notes, 'en') !== pick(a.notes, 'en') || pick(c.notes, 'ar') !== pick(a.notes, 'ar')) out.push('notes');
  return out;
}

/* ---------------- Appointments ---------------- */

export function appointmentsOf(db: Database, patientId: string): Appointment[] {
  return db.appointments.filter((a) => a.patientId === patientId).sort((a, b) => a.at.localeCompare(b.at));
}
export function isUpcoming(a: Appointment, now: Date = new Date()): boolean {
  return a.status === 'scheduled' && new Date(a.at).getTime() >= now.getTime();
}
export function upcomingAppointments(db: Database, patientId: string, now: Date = new Date()): Appointment[] {
  return appointmentsOf(db, patientId).filter((a) => isUpcoming(a, now));
}
export function nextAppointment(db: Database, patientId: string, now: Date = new Date()): Appointment | null {
  return upcomingAppointments(db, patientId, now)[0] ?? null;
}

/* ---------------- Sessions ---------------- */

export function sessionView(s: SessionRecord, now: Date = new Date()): SessionView {
  if (s.status === 'missed') return 'missed';
  if (s.status === 'reported') return s.review === 'reviewed' ? 'reviewed' : 'pending_review';
  return new Date(s.scheduledAt).getTime() > now.getTime() ? 'upcoming' : 'awaiting_documentation';
}
export function sessionsOf(db: Database, patientId: string): SessionRecord[] {
  return db.sessions.filter((s) => s.patientId === patientId).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}
/** The next scheduled treatment session that has not yet happened. */
export function nextSession(db: Database, patientId: string, now: Date = new Date()): SessionRecord | null {
  const list = db.sessions
    .filter((s) => s.patientId === patientId && sessionView(s, now) === 'upcoming')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return list[0] ?? null;
}
export function lastReported(db: Database, patientId: string): SessionRecord | null {
  const list = db.sessions
    .filter((s) => s.patientId === patientId && s.status === 'reported')
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  return list[0] ?? null;
}

export interface Adherence {
  /** Sessions whose scheduled time has passed. */
  due: number;
  reported: number;
  missed: number;
  undocumented: number;
  /** reported ÷ due × 100. Based on PATIENT-REPORTED entries — not device data. */
  pct: number | null;
}
export function adherence(sessions: SessionRecord[], now: Date = new Date()): Adherence {
  const due = sessions.filter((s) => new Date(s.scheduledAt).getTime() <= now.getTime());
  const reported = due.filter((s) => s.status === 'reported').length;
  const missed = due.filter((s) => s.status === 'missed').length;
  const undocumented = due.filter((s) => s.status === 'scheduled').length;
  return { due: due.length, reported, missed, undocumented, pct: due.length ? (reported / due.length) * 100 : null };
}

/* ---------------- Follow-up flags ---------------- */

export type FollowUpReason = 'requires_review' | 'no_appointment' | 'followup_overdue' | 'missed' | 'undocumented';

export function followUpReasons(db: Database, patientId: string, now: Date = new Date()): FollowUpReason[] {
  const out: FollowUpReason[] = [];
  const plan = planOf(db, patientId);
  if (!plan) return out;
  if (plan.approvalStatus === 'requires_review') out.push('requires_review');
  const snap = visibleSnapshot(plan);
  if (snap && !nextAppointment(db, patientId, now)) out.push('no_appointment');
  if (snap?.followUpDate && startOfDay(snap.followUpDate).getTime() < startOfDay(now).getTime() && !nextAppointment(db, patientId, now)) out.push('followup_overdue');
  const sessions = sessionsOf(db, patientId);
  const recentMissed = sessions.filter((s) => s.status === 'missed' && now.getTime() - new Date(s.scheduledAt).getTime() < 45 * DAY).length;
  if (recentMissed >= 2) out.push('missed');
  const stale = sessions.some((s) => sessionView(s, now) === 'awaiting_documentation' && now.getTime() - new Date(s.scheduledAt).getTime() > 3 * DAY);
  if (stale) out.push('undocumented');
  return out;
}

/* ---------------- Photos ---------------- */

export function photosOf(db: Database, patientId: string): ProgressPhoto[] {
  return db.photos.filter((p) => p.patientId === patientId).sort((a, b) => a.takenAt.localeCompare(b.takenAt));
}
export function photoUrl(src: string): string {
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')) return src;
  return inlineAsset(src) ?? `${import.meta.env.BASE_URL}${src}`;
}

/* ---------------- Education ---------------- */

/** What a reader may see: published only; patient-only articles need a signed-in patient/physician. */
export function readableArticles(db: Database, signedIn: boolean): EducationalArticle[] {
  return db.articles.filter((a) => a.status === 'published' && (a.access === 'public' || signedIn));
}
