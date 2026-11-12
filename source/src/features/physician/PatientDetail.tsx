import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import type { Patient } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { adherence, appointmentsOf, configDiff, configOf, followUpReasons, lastReported, nextAppointment, photosOf, planOf, sessionsOf, visibleSnapshot } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { ageFromYear, everyDays, fmtDate, fmtDateTime, fmtDose, fmtPct, relDay } from '@/utils/format';
import { Avatar, Badge, Empty, Ltr, Notice, Segmented, Toggle } from '@/components/ui/Bits';
import { Button, IconButton } from '@/components/ui/Button';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';
import { Bwd } from '@/components/ui/icons';
import { ApptTypeBadge, DateBlock, PlanPill } from '@/components/domain/Status';
import { PhotoCompare } from '@/components/domain/Photo';
import { ConfigurationTab } from './ConfigurationTab';
import { AppointmentList, AppointmentModal, PhotoGrid, SessionList } from './shared';
import { KV, Panel, usePhysician } from './ui';

const TABS = ['overview', 'configuration', 'sessions', 'progress', 'appointments', 'notes'] as const;
type Tab = typeof TABS[number];

export function PatientDetail() {
  const me = usePhysician();
  const { id } = useParams();
  const { t, L, lang } = useI18n();
  const d = t.ph.detail;
  const db = useDb((s) => s.db);
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const patient = db.patients.find((p) => p.id === id && p.physicianId === me.id);
  const tab: Tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? (params.get('tab') as Tab) : 'overview';

  if (!patient) {
    return <Empty title={d.notFound} body={d.notFoundBody} action={<Button to="/physician/patients" variant="outline" size="sm" square>{d.back}</Button>} />;
  }
  const plan = planOf(db, patient.id);
  const sessions = sessionsOf(db, patient.id);
  const photos = photosOf(db, patient.id).slice().sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const appts = appointmentsOf(db, patient.id);
  const notes = db.notes.filter((n) => n.patientId === patient.id);
  const pendingSessions = sessions.filter((s) => s.status === 'reported' && s.review !== 'reviewed').length;
  const pendingPhotos = photos.filter((p) => p.review === 'pending').length;

  return (
    <>
      <Link to="/physician/patients" className="mb-4 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-stone-800 hover:text-brand"><Bwd size={15} /> {d.back}</Link>
      <header className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-ink/15 pb-5">
        <Avatar name={L(patient.name)} size={60} className="!rounded-lg" />
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="display text-[1.9rem] leading-tight sm:text-[2.3rem]" data-testid="patient-name">{L(patient.name)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.84rem] text-stone-700">
            <Ltr mono className="font-semibold text-ink">{patient.id}</Ltr>
            <span>{fmt(d.age, { n: ageFromYear(patient.birthYear, now) })}</span>
            <span>{patient.gender === 'f' ? t.terms.female : t.terms.male}</span>
            <span>{L(patient.city)}</span>
            <span>{fmt(d.enrolled, { date: fmtDate(patient.enrolledAt, lang, 'medium') })}</span>
          </p>
        </div>
        {plan && <PlanPill status={plan.approvalStatus} />}
      </header>

      <div className="sticky top-14 z-10 -mx-4 border-b border-ink/10 bg-ivory/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Segmented<Tab> tone="clinical" label={d.tabsLabel} value={tab} onChange={(v) => setParams(v === 'overview' ? {} : { tab: v }, { replace: true })}
          options={TABS.map((k) => ({ value: k, label: d.tabs[k], count: k === 'sessions' ? pendingSessions || undefined : k === 'progress' ? pendingPhotos || undefined : undefined }))} />
      </div>

      <div className="pt-6" data-testid={`tab-${tab}`}>
        {tab === 'overview' && Overview({ patient })}
        {tab === 'configuration' && <ConfigurationTab patient={patient} />}
        {tab === 'sessions' && (sessions.length ? <><SessionList sessions={sessions} /><Notice className="mt-5">{t.note.reported}</Notice></> : <Empty title={d.sessionsEmpty} />)}
        {tab === 'progress' && (photos.length ? (
          <div className="grid gap-6">
            <PhotoGrid photos={photos} />
            <Panel title={t.a.compare}><div className="mx-auto max-w-3xl"><PhotoCompare photos={photos} square /></div></Panel>
          </div>
        ) : <Empty title={d.photosEmpty} />)}
        {tab === 'appointments' && <Appointments patient={patient} items={appts} />}
        {tab === 'notes' && <Notes patient={patient} notes={notes} />}
      </div>
    </>
  );

  function Overview({ patient }: { patient: Patient }) {
    const o = d.overview;
    const snap = visibleSnapshot(plan);
    const cfg = configOf(db, patient.id);
    const differs = !!(cfg && plan?.approved && configDiff(cfg, plan.approved).length > 0);
    const next = nextAppointment(db, patient.id, now);
    const adh = adherence(sessions, now);
    const reasons = followUpReasons(db, patient.id, now);
    const last = lastReported(db, patient.id);
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={o.patientSees} action={<Link to="?tab=configuration" className="text-[0.8rem] font-semibold text-brand underline-offset-4 hover:underline" data-testid="open-config">{o.openConfig}</Link>}>
          {snap ? (
            <dl className="divide-y divide-ink/10">
              <KV k={t.terms.dose}><span className="num text-[1.05rem]">{fmtDose(snap.doseMl, lang)}</span></KV>
              <KV k={t.terms.head}><Ltr mono>{snap.headId}</Ltr></KV>
              <KV k={t.terms.interval}>{everyDays(snap.intervalDays, lang)}</KV>
              <KV k={t.terms.followUp}>{snap.followUpDate ? fmtDate(snap.followUpDate, lang, 'medium') : '—'}</KV>
              <KV k={t.terms.revision}><span className="num">{snap.revision}</span></KV>
            </dl>
          ) : <p className="text-[0.9rem] text-stone-800">{o.noPlan}</p>}
          {differs && <Notice tone="warn" className="mt-4">{o.differs}</Notice>}
        </Panel>
        <Panel title={o.attention}>
          {reasons.length === 0 && pendingSessions === 0 && pendingPhotos === 0 && plan?.approvalStatus !== 'pending_approval' ? <p className="text-[0.9rem] text-stone-700">{o.nothing}</p> : (
            <ul className="grid gap-2 text-[0.9rem] font-semibold">
              {plan?.approvalStatus === 'pending_approval' && <li><Link className="text-brand underline-offset-4 hover:underline" to="?tab=configuration">{t.ph.dash.reasons.pending_approval}</Link></li>}
              {reasons.map((r) => <li key={r}><Link className="text-brand underline-offset-4 hover:underline" to={r === 'requires_review' ? '?tab=configuration' : r === 'missed' || r === 'undocumented' ? '?tab=sessions' : '?tab=appointments'}>{t.ph.dash.reasons[r]}</Link></li>)}
              {pendingSessions > 0 && <li><Link className="text-brand underline-offset-4 hover:underline" to="?tab=sessions">{t.ph.dash.reasons.session}</Link></li>}
              {pendingPhotos > 0 && <li><Link className="text-brand underline-offset-4 hover:underline" to="?tab=progress">{t.ph.dash.reasons.photo}</Link></li>}
            </ul>
          )}
        </Panel>
        <Panel title={o.next}>
          {next ? (
            <div className="flex items-center gap-4">
              <DateBlock at={next.at} square tone="brand" />
              <div><ApptTypeBadge type={next.type} /><p className="mt-1.5 font-bold"><span className="num">{fmtDateTime(next.at, lang)}</span></p><p className="text-[0.82rem] text-stone-700">{relDay(next.at, lang, now)}</p></div>
            </div>
          ) : <p className="text-[0.9rem] text-stone-700">{t.ph.patients.noAppt}</p>}
        </Panel>
        <Panel title={o.adherence} sub={t.pt.sessions.based}>
          <div className="flex items-end justify-between gap-6">
            <p className="display num text-[2.8rem] leading-none">{fmtPct(adh.pct, lang)}</p>
            <p className="num text-[0.86rem] text-stone-800">{adh.reported}/{adh.due}</p>
          </div>
          <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
            <KV k={o.lastReported}>{last ? <span className="num">{fmtDate(last.scheduledAt, lang, 'medium')}</span> : '—'}</KV>
            <KV k={t.session.missed}><span className="num">{adh.missed}</span></KV>
            <KV k={t.session.awaiting_documentation}><span className="num">{adh.undocumented}</span></KV>
          </dl>
        </Panel>
        <Panel title={o.summary} className="lg:col-span-2">
          <p className="max-w-3xl leading-relaxed">{L(patient.summary)}</p>
          <dl className="mt-4 grid gap-x-10 border-t border-ink/10 sm:grid-cols-2">
            <KV k={t.pt.settings.phone}><Ltr>{patient.phone}</Ltr></KV>
            <KV k={t.pt.settings.email}><Ltr>{patient.email}</Ltr></KV>
          </dl>
          <p className="mt-3 text-[0.76rem] text-stone-700">{t.note.fictional}</p>
        </Panel>
      </div>
    );
  }
}

function Appointments({ patient, items }: { patient: Patient; items: ReturnType<typeof appointmentsOf> }) {
  const { t } = useI18n();
  const a = t.ph.appts;
  const [open, setOpen] = useState(false);
  const sorted = items.slice().sort((x, y) => y.at.localeCompare(x.at));
  return (
    <>
      <div className="mb-4 flex justify-end"><Button square size="sm" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setOpen(true)} data-testid="new-appt">{a.new}</Button></div>
      {sorted.length ? <AppointmentList items={sorted} patients={[patient]} /> : <Empty title={t.ph.detail.apptsEmpty} />}
      <AppointmentModal open={open} onClose={() => setOpen(false)} patientId={patient.id} patients={[patient]} />
    </>
  );
}

function Notes({ patient, notes }: { patient: Patient; notes: Array<{ id: string; at: string; text: import('@/types').Text; shared: boolean }> }) {
  const { t, L, lang } = useI18n();
  const n = t.ph.detail.notes;
  const add = useDb((s) => s.addNote);
  const remove = useDb((s) => s.removeNote);
  const notify = useNotify();
  const [text, setText] = useState('');
  const [shared, setShared] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const sorted = notes.slice().sort((a, b) => b.at.localeCompare(a.at));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError(n.v); return; }
    setError('');
    if (notify.result(add(patient.id, text.trim(), shared), n.saved)) { setText(''); setShared(false); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <Panel title={n.add}>
        <form onSubmit={submit} noValidate className="grid gap-4">
          <div>
            <label htmlFor="note-text" className="sr-only">{n.add}</label>
            <textarea id="note-text" rows={4} maxLength={600} className="field !rounded-md py-3" placeholder={n.ph} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!error} aria-describedby="note-err" data-testid="note-text" />
            <p id="note-err" role="alert" className="mt-1 min-h-[1.2rem] text-[0.82rem] font-semibold text-bad">{error}</p>
          </div>
          <Toggle checked={shared} onChange={setShared} label={n.share} description={n.shareHint} />
          <div><Button type="submit" square data-testid="note-save">{n.save}</Button></div>
          <p className="text-[0.76rem] text-stone-700">{t.note.freeText}</p>
        </form>
      </Panel>
      <div>
        {sorted.length === 0 ? <Empty title={n.empty} className="py-10" /> : (
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/[0.13] bg-white" data-testid="notes-list">
            {sorted.map((x) => (
              <li key={x.id} className="flex items-start gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge tone={x.shared ? 'brand' : 'neutral'}>{x.shared ? t.tag.shared : t.tag.privateNote}</Badge><span className="num text-[0.78rem] text-stone-700">{fmtDateTime(x.at, lang)}</span></div>
                  <p className="mt-2 leading-relaxed">{L(x.text)}</p>
                </div>
                <IconButton label={t.a.remove} onClick={() => setRemoving(x.id)}><Trash2 size={16} aria-hidden="true" /></IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Confirm open={!!removing} onClose={() => setRemoving(null)} title={n.removeConfirm} body={n.removeBody} confirmLabel={t.a.remove} danger square
        onConfirm={() => { if (removing && notify.result(remove(removing), n.removed)) setRemoving(null); }} />
    </div>
  );
}
