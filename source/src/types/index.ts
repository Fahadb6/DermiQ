/* ------------------------------------------------------------------
 * DermiQ shared data model (see DATA_MODEL.md)
 * One model is used by the patient application and the physician portal.
 * ------------------------------------------------------------------ */

export type Lang = 'ar' | 'en';
/** Bilingual value. Seeded/system content is always bilingual. */
export interface L10n { ar: string; en: string }
/** Free text: bilingual when seeded, a plain string when typed by a user. */
export type Text = string | L10n;

export type ID = string;
export type ISODate = string; // ISO-8601

export type Role = 'patient' | 'physician';

export interface User {
  id: ID;
  role: Role;
  email: string;
  /** Demonstration only. Simulated authentication — never production-secure. */
  demoPassword: string;
  /** PatientID or PhysicianID this account belongs to. */
  profileId: ID;
}

export interface Physician {
  id: ID;
  name: L10n;
  title: L10n;
  specialty: L10n;
  clinic: L10n;
  city: L10n;
  licenseNo: string; // fictional
  email: string;
  phone: string;
  /** May manage educational content (medical reviewer role). */
  canReviewContent: boolean;
  notificationPrefs: NotificationPrefs;
}

export interface NotificationPrefs {
  appointments: boolean;
  planUpdates: boolean;
  sessions: boolean;
  photos: boolean;
}

export interface Patient {
  id: ID;            // e.g. DQ-P-1001
  name: L10n;
  gender: 'f' | 'm';
  birthYear: number;
  city: L10n;
  phone: string;
  email: string;
  physicianId: ID;
  enrolledAt: ISODate;
  /** Short fictional clinical summary entered by the physician. */
  summary: L10n;
  avatarSeed: number;
  notificationPrefs: NotificationPrefs;
}

/* ---------------- Treatment ---------------- */

/** The ONE approved treatment head. There is no other value. */
export type ApprovedTreatmentHeadID = 'DQ-HEAD-01';

export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'locked' | 'requires_review';

/** Physician working copy. Becomes patient-visible only through approval. */
export interface TreatmentConfiguration {
  id: ID;
  planId: ID;
  patientId: ID;
  physicianId: ID;
  /** Illustrative prototype value, 0.1–0.5 mL. Not a dosing recommendation. */
  doseMl: number | null;
  headId: ApprovedTreatmentHeadID;
  headConfirmed: boolean;
  /** Planned interval between sessions, in days (physician-entered). */
  intervalDays: number | null;
  followUpDate: ISODate | null;
  notes: Text;
  savedAt: ISODate;
}

/** Snapshot the patient sees. Written only by "Approve treatment plan". */
export interface ApprovedPlanSnapshot {
  doseMl: number;
  headId: ApprovedTreatmentHeadID;
  intervalDays: number;
  followUpDate: ISODate | null;
  notes: Text;
  approvedAt: ISODate;
  approvedBy: ID;
  revision: number;
}

export interface TreatmentPlan {
  id: ID;                 // TreatmentPlanID
  patientId: ID;
  physicianId: ID;
  approvalStatus: PlanStatus;
  /** ApprovedDose / ApprovedTreatmentHeadID / TreatmentSchedule live here once approved. */
  approved: ApprovedPlanSnapshot | null;
  lockedAt: ISODate | null;
  lastUpdated: ISODate;
  createdAt: ISODate;
}

/* ---------------- Appointments & sessions ---------------- */

export type AppointmentType = 'treatment' | 'follow_up' | 'consultation';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: ID;
  patientId: ID;
  physicianId: ID;
  at: ISODate;
  type: AppointmentType;
  status: AppointmentStatus;
  note: Text;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Stored session status. Everything about completion is PATIENT-REPORTED. */
export type SessionStatus = 'scheduled' | 'reported' | 'missed';
export type ReviewState = 'none' | 'pending' | 'reviewed';

export interface SessionRecord {
  id: ID;
  patientId: ID;
  planId: ID;
  appointmentId: ID | null;
  scheduledAt: ISODate;
  status: SessionStatus;
  /** Who recorded the status: the patient (manual report) or the physician (e.g. marked missed). */
  recordedBy: 'patient' | 'physician' | null;
  reportedAt: ISODate | null;
  patientNote: Text;
  review: ReviewState;
  reviewedAt: ISODate | null;
  reviewedBy: ID | null;
  physicianNote: Text;
}

/** Derived, display-level state of a session. */
export type SessionView = 'upcoming' | 'awaiting_documentation' | 'pending_review' | 'reviewed' | 'missed';

/* ---------------- Progress photos ---------------- */

export interface ProgressPhoto {
  id: ID;
  patientId: ID;
  takenAt: ISODate;
  uploadedAt: ISODate;
  /** URL of a synthetic demo image, or a data URL for a prototype upload. */
  src: string;
  origin: 'demo' | 'upload';
  patientNote: Text;
  review: 'pending' | 'reviewed';
  physicianNote: Text;
  reviewedAt: ISODate | null;
}

/* ---------------- Notes, notifications ---------------- */

export interface PhysicianNote {
  id: ID;
  patientId: ID;
  physicianId: ID;
  at: ISODate;
  text: Text;
  /** Shared notes are visible in the patient application. */
  shared: boolean;
}

export type NotificationKind =
  // to patient
  | 'plan_approved' | 'plan_updated' | 'plan_locked' | 'plan_under_review'
  | 'appointment_created' | 'appointment_updated' | 'appointment_cancelled'
  | 'session_reviewed' | 'photo_reviewed' | 'note_shared'
  // to physician
  | 'session_reported' | 'session_missed' | 'photo_uploaded'
  | 'plan_pending' | 'followup_due';

export interface Notification {
  id: ID;
  audience: Role;
  recipientId: ID;
  patientId: ID;
  kind: NotificationKind;
  /** Values interpolated into the bilingual template at render time. */
  params: Record<string, string | number>;
  at: ISODate;
  read: boolean;
  /** In-app route to open. */
  link: string;
}

/* ---------------- Education ---------------- */

export type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
export type ArticleAccess = 'public' | 'patient';
export type ArticleArt = 'topo' | 'follicle' | 'pen' | 'cartridge' | 'head' | 'journey' | 'calendar' | 'record';

export interface EducationalCategory {
  id: ID;
  order: number;
  title: L10n;
  description: L10n;
}

export interface EducationalArticle {
  id: ID;
  slug: string;
  categoryId: ID;
  title: L10n;
  summary: L10n;
  /** Lightweight markup: "## heading", "> highlight", "- list item", "[fig:pen]" + paragraphs. */
  body: L10n;
  readMinutes: number;
  access: ArticleAccess;
  status: ArticleStatus;
  featured: boolean;
  art: ArticleArt;
  author: L10n;
  reviewer: L10n | null;
  reviewDate: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  related: ID[];
  /** Demonstration article that has NOT been through real medical review. */
  sample: boolean;
}

export interface ArticleReview {
  id: ID;
  articleId: ID;
  from: ArticleStatus | null;
  to: ArticleStatus;
  by: L10n;
  at: ISODate;
  note: Text;
}

export interface FaqItem {
  id: ID;
  topic: 'condition' | 'product' | 'platform' | 'appointments' | 'privacy';
  q: L10n;
  a: L10n;
  onHome?: boolean;
}

export interface ContactMessage {
  id: ID;
  name: string;
  email: string;
  topic: string;
  message: string;
  at: ISODate;
}

/* ---------------- Database root ---------------- */

export interface Database {
  schemaVersion: number;
  seededAt: ISODate;
  users: User[];
  physicians: Physician[];
  patients: Patient[];
  plans: TreatmentPlan[];
  configurations: TreatmentConfiguration[];
  appointments: Appointment[];
  sessions: SessionRecord[];
  photos: ProgressPhoto[];
  notes: PhysicianNote[];
  notifications: Notification[];
  categories: EducationalCategory[];
  articles: EducationalArticle[];
  articleReviews: ArticleReview[];
  messages: ContactMessage[];
}
