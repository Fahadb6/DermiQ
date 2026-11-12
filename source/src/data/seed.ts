import type {
  Appointment, AppointmentType, ApprovedPlanSnapshot, ArticleReview, ArticleStatus, Database, EducationalArticle,
  L10n, Notification, NotificationKind, Patient, PhysicianNote, PlanStatus, ProgressPhoto, Role, SessionRecord,
  TreatmentConfiguration, TreatmentPlan, User,
} from '@/types';
import { addDays, atTime } from '@/utils/dates';
import { ARTICLE_SEEDS, CATEGORIES } from './education';

/**
 * DEMO DATA — every person, clinic, note and image below is fictional.
 * Dates are generated relative to "today" so the demo always looks current.
 * Doses are illustrative prototype values (0.1–0.5 mL), not recommendations.
 */

export const SCHEMA_VERSION = 1;
export const PHYSICIAN_ID = 'DQ-DR-01';
export const DEMO_PASSWORD = 'Demo#2026';

const l = (ar: string, en: string): L10n => ({ ar, en });
const EMPTY: L10n = { ar: '', en: '' };

const CONTENT_TEAM = l('فريق محتوى DermiQ (افتراضي)', 'DermiQ Content Team (fictional)');
const DR_NAME = l('د. لينا الحربي', 'Dr. Lina Al-Harbi');

interface SessionSeed {
  /** day offset from today (negative = past) */
  d: number;
  hour?: number;
  state: 'reported' | 'missed' | 'scheduled';
  by?: 'patient' | 'physician';
  review?: 'pending' | 'reviewed';
  patientNote?: L10n;
  physicianNote?: L10n;
}
interface ApptSeed { d: number; hour: number; min?: number; type: AppointmentType; note?: L10n }
interface PhotoSeed { d: number; file: string; note: L10n; review: 'pending' | 'reviewed'; physicianNote?: L10n }
interface NoteSeed { d: number; text: L10n; shared: boolean }

interface PatientSeed {
  n: number; // 1001…
  name: L10n; gender: 'f' | 'm'; birthYear: number; city: L10n; email: string; enrolled: number; summary: L10n;
  plan: {
    status: PlanStatus;
    config: { doseMl: number | null; headConfirmed: boolean; intervalDays: number | null; followUp: number | null; notes: L10n; saved: number };
    approved?: { doseMl: number; intervalDays: number; followUp: number | null; notes: L10n; at: number; revision: number };
    lockedAt?: number;
    lastUpdated: number;
  };
  sessions: SessionSeed[];
  extraAppointments: ApptSeed[];
  photos: PhotoSeed[];
  notes: NoteSeed[];
}

const PATIENTS: PatientSeed[] = [
  {
    n: 1001, name: l('سارة القحطاني', 'Sara Al-Qahtani'), gender: 'f', birthYear: 1994, city: l('جدة', 'Jeddah'),
    email: 'sara@dermiq.demo', enrolled: 66,
    summary: l('بقعتان في المنطقة الجدارية. تتابع خطتها بانتظام وتوثّق جلساتها.', 'Two patches, parietal area. Follows the plan regularly and documents her sessions.'),
    plan: {
      status: 'locked',
      config: { doseMl: 0.3, headConfirmed: true, intervalDays: 28, followUp: 5, notes: l('الاستمرار على الجدول المعتمد. تُراجع الخطة في زيارة المتابعة.', 'Continue with the approved schedule. Plan to be reviewed at the follow-up visit.'), saved: 31 },
      approved: { doseMl: 0.3, intervalDays: 28, followUp: 5, notes: l('الاستمرار على الجدول المعتمد. تُراجع الخطة في زيارة المتابعة.', 'Continue with the approved schedule. Plan to be reviewed at the follow-up visit.'), at: 31, revision: 2 },
      lockedAt: 31, lastUpdated: 31,
    },
    sessions: [
      { d: -58, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت الجلسة في موعدها.', 'Session took place as scheduled.'), physicianNote: l('تم الاطلاع. شكرًا على التوثيق.', 'Seen. Thank you for documenting.') },
      { d: -30, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('لا ملاحظات.', 'Nothing to add.'), physicianNote: l('تمت المراجعة في الزيارة.', 'Reviewed at the visit.') },
      { d: -2, state: 'scheduled' },
      { d: 26, hour: 10, state: 'scheduled' },
    ],
    extraAppointments: [{ d: 5, hour: 10, min: 30, type: 'follow_up', note: l('زيارة متابعة ومراجعة الصور.', 'Follow-up visit and photo review.') }],
    photos: [
      { d: -59, file: 'scalp-p1-1.webp', note: l('الصورة الأولى قبل بدء الخطة.', 'First photo, before the plan started.'), review: 'reviewed', physicianNote: l('سُجّلت صورةً أولية للمقارنة.', 'Recorded as the baseline image.') },
      { d: -30, file: 'scalp-p1-2.webp', note: l('الإضاءة نفسها، قرب النافذة.', 'Same lighting, near the window.'), review: 'reviewed', physicianNote: l('صورة واضحة. استمري بالزاوية نفسها.', 'Clear image. Keep the same angle.') },
      { d: -3, file: 'scalp-p1-3.webp', note: l('قبل موعد هذا الأسبوع.', 'Before this week’s appointment.'), review: 'reviewed', physicianNote: l('تم الاطلاع. نناقشها في زيارة المتابعة.', 'Seen. We will discuss it at the follow-up visit.') },
    ],
    notes: [
      { d: -30, shared: true, text: l('رُوجعت الخطة في زيارة اليوم. الاستمرار على الجدول المعتمد، وحُجزت زيارة متابعة.', 'Plan reviewed at today’s visit. Continue with the approved schedule; a follow-up visit is booked.') },
      { d: -58, shared: false, text: l('وُثّقت الحالة الأولية. نوقشت التوقعات وطريقة التوثيق في التطبيق.', 'Baseline documented. Discussed expectations and the documentation routine in the app.') },
    ],
  },
  {
    n: 1002, name: l('فيصل العتيبي', 'Faisal Al-Otaibi'), gender: 'm', birthYear: 1988, city: l('مكة المكرمة', 'Makkah'),
    email: 'faisal@dermiq.demo', enrolled: 52,
    summary: l('بقعة واحدة في المنطقة القذالية. فاتته جلسة واحدة وأُعيدت جدولتها.', 'Single patch, occipital area. One session missed and rescheduled.'),
    plan: {
      status: 'approved',
      config: { doseMl: 0.2, headConfirmed: true, intervalDays: 21, followUp: 18, notes: l('متابعة الالتزام بالمواعيد.', 'Monitor attendance.'), saved: 46 },
      approved: { doseMl: 0.2, intervalDays: 21, followUp: 18, notes: l('متابعة الالتزام بالمواعيد.', 'Monitor attendance.'), at: 46, revision: 1 },
      lastUpdated: 46,
    },
    sessions: [
      { d: -45, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('الجلسة الأولى.', 'First session.'), physicianNote: l('سُجّلت الجلسة الأولى.', 'First session recorded.') },
      { d: -24, state: 'missed', by: 'physician', physicianNote: l('لم يحضر. تتواصل العيادة لإعادة الجدولة.', 'Did not attend. Clinic to contact for rescheduling.') },
      { d: -3, state: 'reported', by: 'patient', review: 'pending', patientNote: l('حضرت الجلسة، وأرفقت صورة جديدة.', 'Attended the session and added a new photo.') },
      { d: 18, hour: 13, state: 'scheduled' },
    ],
    extraAppointments: [],
    photos: [
      { d: -46, file: 'scalp-p2-1.webp', note: l('قبل الجلسة الأولى.', 'Before the first session.'), review: 'reviewed', physicianNote: l('صورة أولية.', 'Baseline image.') },
      { d: -24, file: 'scalp-p2-2.webp', note: l('صورة منتصف المدة.', 'Mid-period photo.'), review: 'reviewed', physicianNote: l('تم الاطلاع.', 'Seen.') },
      { d: -3, file: 'scalp-p2-3.webp', note: l('بعد الجلسة الأخيرة بيوم.', 'One day after the latest session.'), review: 'pending' },
    ],
    notes: [
      { d: -45, shared: true, text: l('سُجّلت الجلسة الأولى. نرجو الاستمرار في توثيق كل جلسة في التطبيق.', 'First session recorded. Please keep documenting each session in the app.') },
      { d: -24, shared: false, text: l('لم يحضر الموعد. تتواصل العيادة معه لإعادة الجدولة.', 'Did not attend. Clinic to contact him for rescheduling.') },
    ],
  },
  {
    n: 1003, name: l('نورة الزهراني', 'Noura Al-Zahrani'), gender: 'f', birthYear: 2001, city: l('جدة', 'Jeddah'),
    email: 'noura@dermiq.demo', enrolled: 12,
    summary: l('مريضة جديدة بعد الاستشارة الأولى. الإعدادات جاهزة وبانتظار الاعتماد.', 'New patient after the first consultation. Configuration prepared, awaiting approval.'),
    plan: {
      status: 'pending_approval',
      config: { doseMl: 0.4, headConfirmed: true, intervalDays: 28, followUp: 37, notes: l('إعدادات أولية بعد الاستشارة.', 'Initial configuration after consultation.'), saved: 11 },
      lastUpdated: 11,
    },
    sessions: [{ d: 9, hour: 11, state: 'scheduled' }],
    extraAppointments: [{ d: -12, hour: 12, type: 'consultation', note: l('استشارة أولى.', 'First consultation.') }],
    photos: [
      { d: -12, file: 'scalp-p3-1.webp', note: l('التُقطت يوم الاستشارة.', 'Taken on the day of the consultation.'), review: 'reviewed', physicianNote: l('صورة أولية.', 'Baseline image.') },
      { d: -1, file: 'scalp-p3-2.webp', note: l('الزاوية نفسها بعد أسبوعين تقريبًا.', 'Same angle, about two weeks later.'), review: 'pending' },
    ],
    notes: [{ d: -12, shared: false, text: l('استشارة أولى. أُعدّت الإعدادات وهي بانتظار الاعتماد.', 'Initial consultation. Configuration prepared; awaiting approval.') }],
  },
  {
    n: 1004, name: l('خالد الغامدي', 'Khalid Al-Ghamdi'), gender: 'm', birthYear: 1979, city: l('الطائف', 'Taif'),
    email: 'khalid@dermiq.demo', enrolled: 6,
    summary: l('إحالة جديدة. لم تُعدّ الخطة بعد، والاستشارة مجدولة.', 'New referral. No plan configured yet; consultation scheduled.'),
    plan: {
      status: 'draft',
      config: { doseMl: null, headConfirmed: false, intervalDays: null, followUp: null, notes: EMPTY, saved: 6 },
      lastUpdated: 6,
    },
    sessions: [],
    extraAppointments: [{ d: 2, hour: 9, min: 30, type: 'consultation', note: l('استشارة أولى.', 'First consultation.') }],
    photos: [{ d: -6, file: 'scalp-p4-1.webp', note: l('صورة أرسلتها قبل الاستشارة.', 'Photo sent ahead of the consultation.'), review: 'pending' }],
    notes: [{ d: -6, shared: false, text: l('إحالة جديدة. حُجزت الاستشارة.', 'New referral. Consultation booked.') }],
  },
  {
    n: 1005, name: l('ريم الشهري', 'Reem Al-Shehri'), gender: 'f', birthYear: 1997, city: l('جدة', 'Jeddah'),
    email: 'reem@dermiq.demo', enrolled: 70,
    summary: l('فاتتها جلستان متتاليتان. أُعيد فتح الخطة للمراجعة ولا يوجد موعد قادم.', 'Two consecutive sessions missed. Plan reopened for review; no upcoming appointment.'),
    plan: {
      status: 'requires_review',
      config: { doseMl: 0.5, headConfirmed: true, intervalDays: 14, followUp: -4, notes: l('تُراجع الخطة عند التواصل القادم.', 'Review plan at next contact.'), saved: 5 },
      approved: { doseMl: 0.5, intervalDays: 14, followUp: -4, notes: l('جدول كل أسبوعين.', 'Fortnightly schedule.'), at: 63, revision: 1 },
      lastUpdated: 5,
    },
    sessions: [
      { d: -62, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت.', 'Done.'), physicianNote: l('تم الاطلاع.', 'Seen.') },
      { d: -48, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت الجلسة.', 'Session done.'), physicianNote: l('تم الاطلاع.', 'Seen.') },
      { d: -34, state: 'missed', by: 'physician', physicianNote: l('لم تحضر.', 'Did not attend.') },
      { d: -20, state: 'missed', by: 'patient', patientNote: l('تعذّر عليّ الحضور بسبب السفر.', 'I could not attend because I was travelling.') },
      { d: -6, state: 'scheduled' },
    ],
    extraAppointments: [],
    photos: [
      { d: -63, file: 'scalp-p5-1.webp', note: l('قبل البدء.', 'Before starting.'), review: 'reviewed', physicianNote: l('صورة أولية.', 'Baseline image.') },
      { d: -35, file: 'scalp-p5-2.webp', note: l('بعد شهر تقريبًا.', 'About a month in.'), review: 'reviewed', physicianNote: l('تم الاطلاع. شكرًا.', 'Seen. Thank you.') },
      { d: -7, file: 'scalp-p5-3.webp', note: l('آخر صورة.', 'Latest photo.'), review: 'reviewed', physicianNote: l('تم الاطلاع.', 'Seen.') },
    ],
    notes: [
      { d: -5, shared: false, text: l('جلستان فائتتان. أُعيد فتح الخطة للمراجعة عند التواصل القادم.', 'Two missed sessions. Plan reopened for review at next contact.') },
      { d: -48, shared: true, text: l('وصلت الصور، شكرًا. نرجو الاستمرار في التقاطها بالإضاءة نفسها.', 'Photos received, thank you. Please keep taking them in the same lighting.') },
    ],
  },
  {
    n: 1006, name: l('عمر بكر', 'Omar Bakr'), gender: 'm', birthYear: 1991, city: l('المدينة المنورة', 'Madinah'),
    email: 'omar@dermiq.demo', enrolled: 100,
    summary: l('أقدم مرضى العرض التجريبي. خطة مقفلة والتزام كامل بالتوثيق.', 'Longest-standing demo patient. Locked plan and complete documentation.'),
    plan: {
      status: 'locked',
      config: { doseMl: 0.1, headConfirmed: true, intervalDays: 30, followUp: 12, notes: l('حُدّثت الخطة وقُفلت بعد المراجعة.', 'Plan updated and locked after review.'), saved: 36 },
      approved: { doseMl: 0.1, intervalDays: 30, followUp: 12, notes: l('حُدّثت الخطة وقُفلت بعد المراجعة.', 'Plan updated and locked after review.'), at: 36, revision: 3 },
      lockedAt: 36, lastUpdated: 36,
    },
    sessions: [
      { d: -95, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت.', 'Done.'), physicianNote: l('تم الاطلاع.', 'Seen.') },
      { d: -65, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت.', 'Done.'), physicianNote: l('تم الاطلاع.', 'Seen.') },
      { d: -35, state: 'reported', by: 'patient', review: 'reviewed', patientNote: l('تمت الجلسة، وناقشنا الخطة.', 'Session done; we discussed the plan.'), physicianNote: l('رُوجعت الخطة وحُدّثت.', 'Plan reviewed and updated.') },
      { d: -5, state: 'reported', by: 'patient', review: 'pending', patientNote: l('تمت الجلسة في موعدها.', 'Session took place on time.') },
      { d: 25, hour: 9, state: 'scheduled' },
    ],
    extraAppointments: [{ d: 12, hour: 15, type: 'follow_up', note: l('متابعة دورية.', 'Routine follow-up.') }],
    photos: [
      { d: -96, file: 'scalp-p6-1.webp', note: l('الصورة الأولى.', 'First photo.'), review: 'reviewed', physicianNote: l('صورة أولية.', 'Baseline image.') },
      { d: -35, file: 'scalp-p6-2.webp', note: l('يوم المراجعة.', 'Day of the review.'), review: 'reviewed', physicianNote: l('تم الاطلاع.', 'Seen.') },
    ],
    notes: [{ d: -36, shared: true, text: l('حُدّثت الخطة وقُفلت بعد مراجعة اليوم.', 'Plan updated and locked after today’s review.') }],
  },
];

/** Move a date off the Saudi weekend (Fri/Sat): future dates forward, past dates backward. */
function workday(now: Date, offset: number): number {
  let o = offset;
  for (let i = 0; i < 3; i++) {
    const day = addDays(now, o).getDay();
    if (day !== 5 && day !== 6) break;
    o += offset >= 0 ? 1 : -1;
  }
  return o;
}

export function buildSeed(now: Date = new Date()): Database {
  const iso = (offset: number, h = 10, m = 0) => atTime(addDays(now, offset), h, m).toISOString();
  const pid = (n: number) => `DQ-P-${n}`;

  const users: User[] = [
    { id: 'U-DR-01', role: 'physician', email: 'dr.lina@dermiq.demo', demoPassword: DEMO_PASSWORD, profileId: PHYSICIAN_ID },
  ];
  const patients: Patient[] = [];
  const plans: TreatmentPlan[] = [];
  const configurations: TreatmentConfiguration[] = [];
  const appointments: Appointment[] = [];
  const sessions: SessionRecord[] = [];
  const photos: ProgressPhoto[] = [];
  const notes: PhysicianNote[] = [];
  const notifications: Notification[] = [];

  let nId = 0;
  const notify = (audience: Role, recipientId: string, patientId: string, kind: NotificationKind, daysAgo: number, read: boolean, link: string, params: Record<string, string | number> = {}) => {
    nId += 1;
    notifications.push({ id: `N-${String(nId).padStart(3, '0')}`, audience, recipientId, patientId, kind, params, at: iso(-daysAgo, 9 + (nId % 7), (nId * 13) % 60), read, link });
  };

  for (const p of PATIENTS) {
    const id = pid(p.n);
    const planId = `TP-${p.n}`;
    users.push({ id: `U-P-${p.n}`, role: 'patient', email: p.email, demoPassword: DEMO_PASSWORD, profileId: id });
    patients.push({
      id, name: p.name, gender: p.gender, birthYear: p.birthYear, city: p.city,
      phone: `+966 50 000 ${String(p.n).slice(-4)}`, email: p.email, physicianId: PHYSICIAN_ID,
      enrolledAt: iso(-p.enrolled, 9), summary: p.summary, avatarSeed: p.n,
      notificationPrefs: { appointments: true, planUpdates: true, sessions: true, photos: true },
    });

    const a = p.plan.approved;
    const approved: ApprovedPlanSnapshot | null = a
      ? {
          doseMl: a.doseMl, headId: 'DQ-HEAD-01', intervalDays: a.intervalDays,
          followUpDate: a.followUp == null ? null : iso(workday(now, a.followUp), 9),
          notes: a.notes, approvedAt: iso(-a.at, 14), approvedBy: PHYSICIAN_ID, revision: a.revision,
        }
      : null;
    plans.push({
      id: planId, patientId: id, physicianId: PHYSICIAN_ID, approvalStatus: p.plan.status, approved,
      lockedAt: p.plan.lockedAt == null ? null : iso(-p.plan.lockedAt, 14, 20),
      lastUpdated: iso(-p.plan.lastUpdated, 14, 20), createdAt: iso(-p.enrolled, 9),
    });
    const c = p.plan.config;
    configurations.push({
      id: `TC-${p.n}`, planId, patientId: id, physicianId: PHYSICIAN_ID, doseMl: c.doseMl, headId: 'DQ-HEAD-01',
      headConfirmed: c.headConfirmed, intervalDays: c.intervalDays,
      followUpDate: c.followUp == null ? null : iso(workday(now, c.followUp), 9), notes: c.notes, savedAt: iso(-c.saved, 14),
    });

    // Treatment sessions (each is linked to a treatment appointment)
    p.sessions.forEach((s, i) => {
      const off = workday(now, s.d);
      const hour = s.hour ?? 10;
      const at = iso(off, hour, i % 2 ? 30 : 0);
      const apptId = `AP-${p.n}-T${i + 1}`;
      const past = off < 0;
      appointments.push({
        id: apptId, patientId: id, physicianId: PHYSICIAN_ID, at, type: 'treatment',
        status: past ? 'completed' : 'scheduled', note: EMPTY, createdAt: iso(Math.min(off - 14, -1), 11), updatedAt: iso(Math.min(off - 14, -1), 11),
      });
      sessions.push({
        id: `SR-${p.n}-${i + 1}`, patientId: id, planId, appointmentId: apptId, scheduledAt: at,
        status: s.state, recordedBy: s.state === 'scheduled' ? null : s.by ?? 'patient',
        reportedAt: s.state === 'scheduled' ? null : iso(off, hour + 6, 12),
        patientNote: s.patientNote ?? EMPTY,
        review: s.state === 'reported' ? s.review ?? 'pending' : 'none',
        reviewedAt: s.review === 'reviewed' ? iso(off + 1, 9, 40) : null,
        reviewedBy: s.review === 'reviewed' ? PHYSICIAN_ID : null,
        physicianNote: s.physicianNote ?? EMPTY,
      });
    });
    p.extraAppointments.forEach((e, i) => {
      const off = workday(now, e.d);
      appointments.push({
        id: `AP-${p.n}-X${i + 1}`, patientId: id, physicianId: PHYSICIAN_ID, at: iso(off, e.hour, e.min ?? 0), type: e.type,
        status: off < 0 ? 'completed' : 'scheduled', note: e.note ?? EMPTY, createdAt: iso(Math.min(off - 10, -1), 12), updatedAt: iso(Math.min(off - 10, -1), 12),
      });
    });
    p.photos.forEach((ph, i) => {
      photos.push({
        id: `PH-${p.n}-${i + 1}`, patientId: id, takenAt: iso(ph.d, 8, 15), uploadedAt: iso(ph.d, 8, 20), src: `demo/${ph.file}`, origin: 'demo',
        patientNote: ph.note, review: ph.review, physicianNote: ph.physicianNote ?? EMPTY, reviewedAt: ph.review === 'reviewed' ? iso(ph.d + 1, 10, 5) : null,
      });
    });
    p.notes.forEach((nt, i) => {
      notes.push({ id: `PN-${p.n}-${i + 1}`, patientId: id, physicianId: PHYSICIAN_ID, at: iso(nt.d, 15, 10), text: nt.text, shared: nt.shared });
    });
  }

  // ---- Notifications (in-app only)
  const firstUpcoming = (patientId: string) =>
    appointments.filter((x) => x.patientId === patientId && x.status === 'scheduled').sort((x, y) => x.at.localeCompare(y.at))[0];

  notify('physician', PHYSICIAN_ID, pid(1006), 'session_reported', 5, false, `/physician/sessions?patient=${pid(1006)}`);
  notify('physician', PHYSICIAN_ID, pid(1002), 'session_reported', 3, false, `/physician/sessions?patient=${pid(1002)}`);
  notify('physician', PHYSICIAN_ID, pid(1003), 'photo_uploaded', 1, false, `/physician/progress?patient=${pid(1003)}`);
  notify('physician', PHYSICIAN_ID, pid(1002), 'photo_uploaded', 3, false, `/physician/progress?patient=${pid(1002)}`);
  notify('physician', PHYSICIAN_ID, pid(1004), 'photo_uploaded', 6, true, `/physician/progress?patient=${pid(1004)}`);
  notify('physician', PHYSICIAN_ID, pid(1003), 'plan_pending', 11, false, `/physician/patients/${pid(1003)}?tab=configuration`);
  notify('physician', PHYSICIAN_ID, pid(1005), 'followup_due', 4, false, `/physician/patients/${pid(1005)}`);
  notify('physician', PHYSICIAN_ID, pid(1005), 'session_missed', 20, true, `/physician/sessions?patient=${pid(1005)}`);

  const pn = (n: number, kind: NotificationKind, daysAgo: number, read: boolean, link: string, params: Record<string, string | number> = {}) =>
    notify('patient', pid(n), pid(n), kind, daysAgo, read, link, params);
  const apptParam = (n: number) => ({ at: firstUpcoming(pid(n))?.at ?? iso(1) });

  pn(1001, 'appointment_created', 2, false, '/patient', apptParam(1001));
  pn(1001, 'photo_reviewed', 2, false, '/patient/progress');
  pn(1001, 'session_reviewed', 29, true, '/patient/sessions');
  pn(1001, 'plan_locked', 31, true, '/patient/plan');
  pn(1001, 'note_shared', 30, true, '/patient/plan');
  pn(1002, 'appointment_created', 3, false, '/patient', apptParam(1002));
  pn(1002, 'plan_approved', 46, true, '/patient/plan');
  pn(1003, 'appointment_created', 11, false, '/patient', apptParam(1003));
  pn(1004, 'appointment_created', 6, false, '/patient', apptParam(1004));
  pn(1005, 'plan_under_review', 5, false, '/patient/plan');
  pn(1005, 'photo_reviewed', 6, true, '/patient/progress');
  pn(1006, 'appointment_created', 5, false, '/patient', apptParam(1006));
  pn(1006, 'plan_locked', 36, true, '/patient/plan');
  notifications.sort((x, y) => y.at.localeCompare(x.at));

  // ---- Education
  const articles: EducationalArticle[] = ARTICLE_SEEDS.map((s) => ({
    id: s.id, slug: s.slug, categoryId: s.categoryId, title: s.title, summary: s.summary, body: s.body,
    readMinutes: s.readMinutes, access: s.access, status: s.status, featured: s.featured, art: s.art,
    author: CONTENT_TEAM,
    reviewer: s.age.reviewed == null ? null : DR_NAME,
    reviewDate: s.age.reviewed == null ? null : iso(-s.age.reviewed, 13),
    createdAt: iso(-s.age.created, 10), updatedAt: iso(-s.age.updated, 16),
    related: s.related, sample: true,
  }));

  const articleReviews: ArticleReview[] = [];
  let rId = 0;
  const review = (articleId: string, from: ArticleStatus | null, to: ArticleStatus, by: L10n, daysAgo: number, note: L10n) => {
    rId += 1;
    articleReviews.push({ id: `AR-${String(rId).padStart(3, '0')}`, articleId, from, to, by, at: iso(-daysAgo, 12, rId % 50), note });
  };
  for (const s of ARTICLE_SEEDS) {
    const r = s.age.reviewed;
    review(s.id, null, 'draft', CONTENT_TEAM, s.age.created, l('أُنشئت المسودة.', 'Draft created.'));
    if (s.status === 'draft') continue;
    review(s.id, 'draft', 'pending_review', CONTENT_TEAM, (r ?? s.age.updated) + 2, l('أُرسلت للمراجعة الطبية.', 'Submitted for medical review.'));
    if (s.status === 'pending_review' || r == null) continue;
    review(s.id, 'pending_review', 'approved', DR_NAME, r, l('رُوجعت الصياغة واعتُمدت (مراجعة تجريبية).', 'Wording reviewed and approved (demo review).'));
    if (s.status === 'approved') continue;
    review(s.id, 'approved', 'published', CONTENT_TEAM, Math.max(r - 1, 0), l('نُشر المقال.', 'Published.'));
    if (s.status === 'archived') review(s.id, 'published', 'archived', CONTENT_TEAM, s.age.updated, l('حلّ مقال أحدث محلّه.', 'Superseded by a newer article.'));
  }
  articleReviews.sort((x, y) => y.at.localeCompare(x.at));

  return {
    schemaVersion: SCHEMA_VERSION,
    seededAt: now.toISOString(),
    users,
    physicians: [
      {
        id: PHYSICIAN_ID, name: DR_NAME,
        title: l('استشارية الأمراض الجلدية', 'Consultant Dermatologist'),
        specialty: l('الأمراض الجلدية واضطرابات الشعر', 'Dermatology and hair disorders'),
        clinic: l('عيادة ميدان الجلدية (وهمية)', 'Meydan Dermatology Clinic (fictional)'),
        city: l('جدة', 'Jeddah'),
        licenseNo: 'DEMO-0000', email: 'dr.lina@dermiq.demo', phone: '+966 12 000 0101', canReviewContent: true,
        notificationPrefs: { appointments: true, planUpdates: true, sessions: true, photos: true },
      },
    ],
    patients, plans, configurations, appointments, sessions, photos, notes, notifications,
    categories: CATEGORIES,
    articles, articleReviews,
    messages: [],
  };
}
