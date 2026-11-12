import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCheck, Plus } from 'lucide-react';
import type { SessionView } from '@/types';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { isUpcoming, sessionView } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { Empty, Notice, Segmented } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { NotificationList, useMyNotifications } from '@/components/domain/Notifications';
import { AppointmentList, AppointmentModal, PhotoGrid, SessionList } from './shared';
import { PageHead, usePhysician } from './ui';

function useMyPatients() {
  const me = usePhysician();
  const patients = useDb((s) => s.db.patients);
  return useMemo(() => patients.filter((p) => p.physicianId === me.id), [patients, me.id]);
}

function PatientSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t, L } = useI18n();
  const patients = useMyPatients();
  return (
    <label className="block w-full sm:w-64"><span className="sr-only">{t.ph.sessions.patient}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field h-10 !rounded-md" data-testid="patient-filter">
        <option value="">{t.ph.sessions.allPatients}</option>
        {patients.map((p) => <option key={p.id} value={p.id}>{L(p.name)}</option>)}
      </select>
    </label>
  );
}

function useFilters<V extends string>(views: readonly V[], fallback: V) {
  const [params, setParams] = useSearchParams();
  const patients = useMyPatients();
  const pid = patients.some((p) => p.id === params.get('patient')) ? (params.get('patient') as string) : '';
  const view = (views as readonly string[]).includes(params.get('view') ?? '') ? (params.get('view') as V) : fallback;
  const set = (patch: { patient?: string; view?: string }) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v && v !== fallback) next.set(k, v); else next.delete(k); }
    setParams(next, { replace: true });
  };
  return { pid, view, set, patients };
}

/* ------------------------------------------------------------ Reported sessions */
const S_VIEWS = ['queue', 'awaiting_documentation', 'missed', 'reviewed', 'upcoming', 'all'] as const;
export function SessionsQueue() {
  const { t } = useI18n();
  const s = t.ph.sessions;
  const db = useDb((x) => x.db);
  const now = useNow();
  const { pid, view, set, patients } = useFilters(S_VIEWS, 'queue');
  const all = useMemo(() => {
    const ids = new Set(patients.map((p) => p.id));
    return db.sessions.filter((x) => ids.has(x.patientId) && (!pid || x.patientId === pid)).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }, [db.sessions, patients, pid]);
  const of = (v: typeof S_VIEWS[number]) => v === 'all' ? all : all.filter((x) => sessionView(x, now) === (v === 'queue' ? 'pending_review' : (v as SessionView)));
  const shown = view === 'upcoming' ? of(view).slice().reverse() : of(view);
  const label = (v: typeof S_VIEWS[number]) => v === 'queue' ? s.queue : v === 'all' ? s.all : t.session[v as SessionView];
  return (
    <>
      <PageHead title={s.title} lead={s.lead} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented tone="clinical" label={s.filterLabel} value={view} onChange={(v) => set({ view: v })} options={S_VIEWS.map((v) => ({ value: v, label: label(v), count: of(v).length }))} />
        <PatientSelect value={pid} onChange={(v) => set({ patient: v })} />
      </div>
      {shown.length ? <SessionList sessions={shown} showPatient /> : <Empty title={s.empty} body={s.emptyBody} />}
      <Notice className="mt-6">{t.note.reported} {t.note.notConnected}</Notice>
    </>
  );
}

/* ------------------------------------------------------------ Progress photos */
const P_VIEWS = ['queue', 'all'] as const;
export function ProgressQueue() {
  const { t } = useI18n();
  const g = t.ph.progress;
  const db = useDb((x) => x.db);
  const { pid, view, set, patients } = useFilters(P_VIEWS, 'queue');
  const all = useMemo(() => {
    const ids = new Set(patients.map((p) => p.id));
    return db.photos.filter((x) => ids.has(x.patientId) && (!pid || x.patientId === pid)).sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  }, [db.photos, patients, pid]);
  const pending = all.filter((x) => x.review === 'pending');
  const shown = view === 'queue' ? pending : all;
  return (
    <>
      <PageHead title={g.title} lead={g.lead} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented tone="clinical" label={g.filterLabel} value={view} onChange={(v) => set({ view: v })} options={[{ value: 'queue', label: g.queue, count: pending.length }, { value: 'all', label: g.all, count: all.length }]} />
        <PatientSelect value={pid} onChange={(v) => set({ patient: v })} />
      </div>
      {shown.length ? <PhotoGrid photos={shown} showPatient /> : <Empty title={g.empty} body={g.emptyBody} />}
      <Notice className="mt-6">{t.note.photos} {t.note.synthetic}</Notice>
    </>
  );
}

/* ------------------------------------------------------------ Appointments */
const A_VIEWS = ['upcoming', 'past', 'cancelled'] as const;
export function AppointmentsPage() {
  const { t } = useI18n();
  const a = t.ph.appts;
  const db = useDb((x) => x.db);
  const now = useNow();
  const { pid, view, set, patients } = useFilters(A_VIEWS, 'upcoming');
  const [open, setOpen] = useState(false);
  const all = useMemo(() => {
    const ids = new Set(patients.map((p) => p.id));
    return db.appointments.filter((x) => ids.has(x.patientId) && (!pid || x.patientId === pid));
  }, [db.appointments, patients, pid]);
  const groups = {
    upcoming: all.filter((x) => isUpcoming(x, now)).sort((x, y) => x.at.localeCompare(y.at)),
    past: all.filter((x) => x.status !== 'cancelled' && !isUpcoming(x, now)).sort((x, y) => y.at.localeCompare(x.at)),
    cancelled: all.filter((x) => x.status === 'cancelled').sort((x, y) => y.at.localeCompare(x.at)),
  };
  return (
    <>
      <PageHead title={a.title} lead={a.lead} action={<Button square icon={<Plus size={17} aria-hidden="true" />} onClick={() => setOpen(true)} data-testid="new-appt">{a.new}</Button>} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented tone="clinical" label={a.filterLabel} value={view} onChange={(v) => set({ view: v })} options={A_VIEWS.map((v) => ({ value: v, label: a[v], count: groups[v].length }))} />
        <PatientSelect value={pid} onChange={(v) => set({ patient: v })} />
      </div>
      {groups[view].length ? <AppointmentList items={groups[view]} showPatient patients={patients} /> : <Empty title={a.empty} />}
      <Notice className="mt-6">{t.note.inApp}</Notice>
      <AppointmentModal open={open} onClose={() => setOpen(false)} patients={patients} patientId={pid || undefined} />
    </>
  );
}

/* ------------------------------------------------------------ Notifications */
export function PhysicianNotifications() {
  const { t } = useI18n();
  const markAll = useDb((x) => x.markAllRead);
  const items = useMyNotifications();
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <PageHead title={t.ph.notif.title} lead={t.ph.notif.lead}
        action={<Button square variant="outline" size="sm" onClick={markAll} disabled={unread === 0} icon={<CheckCheck size={16} aria-hidden="true" />} data-testid="mark-all-read">{t.a.markAllRead}</Button>} />
      <div className="max-w-3xl">
        <NotificationList items={items} clinical />
        {items.length > 0 && unread === 0 && <p className="mt-4 text-[0.84rem] text-stone-700">{t.notif.caughtUp}</p>}
        <Notice className="mt-6">{t.note.inApp}</Notice>
      </div>
    </>
  );
}
