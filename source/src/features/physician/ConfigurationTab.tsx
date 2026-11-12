import { useMemo, useState } from 'react';
import { BadgeCheck, LockKeyhole, RefreshCcw, Save } from 'lucide-react';
import type { Appointment, Patient, Text, TreatmentConfiguration, TreatmentPlan } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { configOf, isConfigComplete, planOf, visibleSnapshot } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { APPROVED_HEAD, DEMO_DOSE_STEPS } from '@/data/product';
import { fromInputs, toDateInput, toTimeInput } from '@/utils/dates';
import { everyDays, fmtDate, fmtDateTime, fmtDose } from '@/utils/format';
import { cn } from '@/utils/misc';
import { NineDot } from '@/components/brand/Brand';
import { Badge, Empty, Field, Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';
import { HeadTile } from '@/components/product/Figures';
import { PlanPill } from '@/components/domain/Status';
import { KV, Panel } from './ui';

export function ConfigurationTab({ patient }: { patient: Patient }) {
  const { t } = useI18n();
  const db = useDb((s) => s.db);
  const now = useNow();
  const plan = planOf(db, patient.id);
  const cfg = configOf(db, patient.id);
  const nextTreat = useMemo(() => db.appointments
    .filter((a) => a.patientId === patient.id && a.type === 'treatment' && a.status === 'scheduled' && new Date(a.at).getTime() > now.getTime())
    .sort((a, b) => a.at.localeCompare(b.at))[0] ?? null, [db.appointments, patient.id, now]);
  if (!plan || !cfg) return <Empty title={t.err.not_found} />;
  // Remount whenever the stored record changes, so the form always starts from what is saved.
  return <ConfigForm key={`${cfg.savedAt}|${plan.approvalStatus}|${nextTreat?.at ?? ''}`} patient={patient} plan={plan} cfg={cfg} nextTreat={nextTreat} />;
}

type Dialog = null | 'diff' | 'approve' | 'lock' | 'update';

function ConfigForm({ patient, plan, cfg, nextTreat }: { patient: Patient; plan: TreatmentPlan; cfg: TreatmentConfiguration; nextTreat: Appointment | null }) {
  const { t, L, lang } = useI18n();
  const c = t.ph.detail.config;
  const save = useDb((s) => s.saveConfiguration);
  const approve = useDb((s) => s.approvePlan);
  const lock = useDb((s) => s.lockPlan);
  const reopen = useDb((s) => s.reopenPlan);
  const notify = useNotify();
  const status = plan.approvalStatus;
  const locked = status === 'locked';
  const snap = visibleSnapshot(plan);
  const approved = plan.approved;

  const initNextDate = nextTreat ? toDateInput(nextTreat.at) : '';
  const initNextTime = nextTreat ? toTimeInput(nextTreat.at) : '10:00';
  const initFollow = cfg.followUpDate ? toDateInput(cfg.followUpDate) : '';
  const [dose, setDose] = useState<number | null>(cfg.doseMl);
  const [headOk, setHeadOk] = useState(cfg.headConfirmed);
  const [interval, setIntervalV] = useState(cfg.intervalDays != null ? String(cfg.intervalDays) : '');
  const [nextDate, setNextDate] = useState(initNextDate);
  const [nextTime, setNextTime] = useState(initNextTime);
  const [followUp, setFollowUp] = useState(initFollow);
  const [notes, setNotes] = useState<string | null>(null); // null = untouched (keeps the bilingual seed text)
  const [err, setErr] = useState<{ interval?: string; next?: string; follow?: string }>({});
  const [dialog, setDialog] = useState<Dialog>(null);

  const intervalNum = interval.trim() === '' ? null : Number(interval);
  const nextChanged = nextDate !== initNextDate || (nextDate !== '' && nextTime !== initNextTime);
  const notesChanged = notes !== null && notes.trim() !== L(cfg.notes).trim();
  const dirty = dose !== cfg.doseMl || headOk !== cfg.headConfirmed || intervalNum !== cfg.intervalDays || followUp !== initFollow || notesChanged || nextChanged;
  const working = {
    doseMl: dose,
    intervalDays: intervalNum,
    followUpDate: followUp === initFollow ? cfg.followUpDate : followUp ? fromInputs(followUp, '09:00').toISOString() : null,
    notes: (notesChanged ? (notes ?? '').trim() : cfg.notes) as Text,
  };
  const complete = isConfigComplete(cfg);
  const canApprove = (status === 'pending_approval' || status === 'requires_review') && complete && !dirty;
  const canLock = status === 'approved' && !dirty;
  const canUpdate = status === 'approved' || status === 'locked';
  const unit = lang === 'ar' ? 'مل' : 'mL';

  const onSave = () => {
    const e: typeof err = {};
    if (intervalNum != null && (!Number.isInteger(intervalNum) || intervalNum < 1 || intervalNum > 365)) e.interval = c.v.interval;
    let nextAt: string | null = null;
    if (nextChanged && nextDate) {
      const d = fromInputs(nextDate, nextTime || '10:00');
      if (Number.isNaN(d.getTime()) || d.getTime() <= Date.now()) e.next = c.v.nextPast; else nextAt = d.toISOString();
    }
    if (followUp !== initFollow && followUp && followUp < toDateInput(new Date())) e.follow = c.v.followPast;
    setErr(e);
    if (e.interval || e.next || e.follow) return;
    notify.result(save(patient.id, { doseMl: working.doseMl, headConfirmed: headOk, intervalDays: working.intervalDays, followUpDate: working.followUpDate, notes: working.notes, nextAppointmentAt: nextAt }), c.saved);
  };

  const sameDay = (a: string | null, b: string | null) => (a ? toDateInput(a) : '') === (b ? toDateInput(b) : '');
  const diffRows = [
    { k: c.dose, a: approved ? fmtDose(approved.doseMl, lang) : '—', b: working.doseMl == null ? c.doseUnset : fmtDose(working.doseMl, lang), changed: !approved || approved.doseMl !== working.doseMl },
    { k: t.terms.head, a: approved ? APPROVED_HEAD.id : '—', b: APPROVED_HEAD.id, changed: false },
    { k: c.interval, a: approved ? everyDays(approved.intervalDays, lang) : '—', b: everyDays(working.intervalDays, lang), changed: !approved || approved.intervalDays !== working.intervalDays },
    { k: c.followUp, a: approved?.followUpDate ? fmtDate(approved.followUpDate, lang, 'medium') : '—', b: working.followUpDate ? fmtDate(working.followUpDate, lang, 'medium') : '—', changed: !approved || !sameDay(approved.followUpDate, working.followUpDate) },
    { k: c.notes, a: approved ? L(approved.notes) || '—' : '—', b: L(working.notes) || '—', changed: !approved || L(approved.notes).trim() !== L(working.notes).trim() },
  ];
  const anyChange = diffRows.some((r) => r.changed);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" data-testid="config-tab" data-status={status}>
      <Panel title={c.title} sub={c.lead} action={<PlanPill status={status} />}>
        <div className={cn('mb-6 flex items-start gap-3 rounded-md px-4 py-3 text-[0.88rem]', locked ? 'bg-aubergine text-ivory' : status === 'approved' ? 'bg-ok-bg' : status === 'draft' ? 'bg-porcelain' : 'bg-warn-bg')} data-testid="config-state">
          {locked ? <LockKeyhole size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : <NineDot size={15} accent={null} className="mt-1 shrink-0" />}
          <p>{c.state[status]}{locked && <> {c.lockedMsg}</>}</p>
        </div>

        <fieldset disabled={locked} className="grid gap-7 disabled:opacity-70">
          <legend className="sr-only">{c.title}</legend>

          <div>
            <div className="flex flex-wrap items-center gap-3"><h3 className="text-[0.9rem] font-bold" id="dose-label">{c.dose}</h3><Badge tone="outline">{t.tag.illustrative}</Badge></div>
            <div role="radiogroup" aria-labelledby="dose-label" className="mt-3 grid max-w-xl grid-cols-5 gap-2">
              {DEMO_DOSE_STEPS.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={dose === v} onClick={() => setDose(v)} data-testid={`dose-${v.toFixed(1)}`}
                  className={cn('flex h-16 flex-col items-center justify-center rounded-md border text-center transition-colors', dose === v ? 'border-brand bg-brand text-ivory' : 'border-ink/20 bg-white hover:border-ink/50')}>
                  <span className="num text-[1.2rem] font-bold leading-none">{v.toFixed(1)}</span>
                  <span className="mt-1 text-[0.68rem] opacity-80">{unit}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 max-w-xl text-[0.8rem] text-stone-700">{c.doseHint} {t.note.dose}</p>
          </div>

          <div className="border-t border-ink/10 pt-6">
            <h3 className="text-[0.9rem] font-bold">{c.head}</h3>
            <div className="mt-3 max-w-xl"><HeadTile /></div>
            <label className="mt-3 flex max-w-xl cursor-pointer items-start gap-3 rounded-md border border-ink/15 bg-porcelain/50 px-4 py-3">
              <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-brand" checked={headOk} onChange={(e) => setHeadOk(e.target.checked)} data-testid="head-confirm" />
              <span className="text-[0.9rem]">{fmt(c.headConfirm, { id: APPROVED_HEAD.id })}</span>
            </label>
            <p className="mt-2 text-[0.8rem] text-stone-700">{c.headOnly}</p>
          </div>

          <div className="grid gap-5 border-t border-ink/10 pt-6 sm:grid-cols-2">
            <Field label={`${c.interval} (${c.intervalUnit})`} hint={c.intervalHint} error={err.interval}>
              {(f) => <input id={f.id} type="number" inputMode="numeric" min={1} max={365} step={1} dir="ltr" className="field num h-11 !rounded-md text-start" value={interval} onChange={(e) => setIntervalV(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="interval" />}
            </Field>
            <Field label={c.followUp} optional error={err.follow}>
              {(f) => <input id={f.id} type="date" className="field h-11 !rounded-md" value={followUp} onChange={(e) => setFollowUp(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="followup" />}
            </Field>
            <div className="sm:col-span-2">
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 sm:max-w-md">
                <Field label={c.nextDate} optional error={err.next}>
                  {(f) => <input id={f.id} type="date" min={toDateInput(new Date())} className="field h-11 !rounded-md" value={nextDate} onChange={(e) => setNextDate(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="next-date" />}
                </Field>
                <Field label={c.nextTime}>
                  {(f) => <input id={f.id} type="time" className="field h-11 !rounded-md" value={nextTime} onChange={(e) => setNextTime(e.target.value)} data-testid="next-time" />}
                </Field>
              </div>
              <p className="mt-1 text-[0.8rem] text-stone-700">{c.nextHint}</p>
            </div>
            <Field label={c.notes} optional hint={c.notesHint} className="sm:col-span-2">
              {(f) => <textarea id={f.id} rows={3} maxLength={500} className="field !rounded-md py-3" value={notes ?? L(cfg.notes)} onChange={(e) => setNotes(e.target.value)} aria-describedby={f.describedBy} data-testid="plan-notes" />}
            </Field>
          </div>
        </fieldset>

        <div className="mt-7 border-t border-ink/15 pt-5">
          <div className="flex flex-wrap gap-2.5">
            <Button square onClick={onSave} disabled={locked || !dirty} icon={<Save size={16} aria-hidden="true" />} data-testid="save-config">{c.save}</Button>
            <Button square variant="outline" onClick={() => setDialog('diff')} data-testid="review-changes">{c.review}</Button>
            <span className="mx-1 hidden w-px self-stretch bg-ink/15 sm:block" aria-hidden="true" />
            <Button square variant="dark" onClick={() => setDialog('approve')} disabled={!canApprove} icon={<BadgeCheck size={16} aria-hidden="true" />} data-testid="approve-plan">{c.approve}</Button>
            <Button square variant="outline" onClick={() => setDialog('lock')} disabled={!canLock} icon={<LockKeyhole size={16} aria-hidden="true" />} data-testid="lock-plan">{c.lock}</Button>
            <Button square variant="outline" onClick={() => setDialog('update')} disabled={!canUpdate} icon={<RefreshCcw size={16} aria-hidden="true" />} data-testid="update-plan">{c.update}</Button>
          </div>
          <p className="mt-3 min-h-[1.25rem] text-[0.82rem] font-semibold text-stone-800" aria-live="polite" data-testid="config-hint">
            {locked ? c.lockedMsg : dirty ? `${c.dirty}. ${c.saveFirst}` : !complete && !approved ? c.incomplete : ''}
          </p>
        </div>
      </Panel>

      <aside className="grid content-start gap-6">
        <Panel title={c.preview}>
          {snap ? (
            <div data-testid="patient-preview">
              <div className="rounded-lg bg-aubergine p-5 text-ivory">
                <p className="text-[0.72rem] text-ivory/60">{t.terms.dose}</p>
                <p className="display num mt-1 text-[2.6rem] leading-none" data-testid="preview-dose">{fmtDose(snap.doseMl, lang)}</p>
                <dl className="mt-5 grid gap-2 border-t border-ivory/15 pt-4 text-[0.82rem]">
                  <div className="flex justify-between gap-4"><dt className="text-ivory/60">{t.terms.head}</dt><dd className="flex items-center gap-1.5 font-bold"><NineDot size={12} /><Ltr mono>{snap.headId}</Ltr></dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ivory/60">{t.terms.interval}</dt><dd className="font-bold">{everyDays(snap.intervalDays, lang)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ivory/60">{t.terms.followUp}</dt><dd className="font-bold">{snap.followUpDate ? fmtDate(snap.followUpDate, lang, 'medium') : '—'}</dd></div>
                </dl>
              </div>
              <p className="mt-3 text-[0.78rem] text-stone-700">{fmt(c.previewRev, { rev: snap.revision, date: fmtDate(snap.approvedAt, lang, 'medium') })}</p>
            </div>
          ) : <p className="text-[0.88rem] text-stone-800" data-testid="patient-preview-none">{c.previewNone}</p>}
        </Panel>
        <Panel title={c.record}>
          <dl className="divide-y divide-ink/10">
            <KV k={t.terms.status}><PlanPill status={status} /></KV>
            <KV k={t.terms.revision}><span className="num">{approved?.revision ?? '—'}</span></KV>
            <KV k={t.terms.approvedOn}><span className="num">{approved ? fmtDate(approved.approvedAt, lang, 'medium') : '—'}</span></KV>
            <KV k={t.terms.lockedOn}><span className="num">{plan.lockedAt && locked ? fmtDate(plan.lockedAt, lang, 'medium') : '—'}</span></KV>
            <KV k={c.lastSaved}><span className="num">{fmtDateTime(cfg.savedAt, lang)}</span></KV>
            <KV k={c.created}><span className="num">{fmtDate(plan.createdAt, lang, 'medium')}</span></KV>
          </dl>
        </Panel>
        <Notice icon={<LockKeyhole size={17} aria-hidden="true" />}>{t.note.lock}</Notice>
      </aside>

      <Modal open={dialog === 'diff'} onClose={() => setDialog(null)} title={c.diffTitle} description={c.diffLead} size="lg" square footer={<Button square variant="outline" onClick={() => setDialog(null)}>{t.a.close}</Button>}>
        {!approved ? <Notice className="mb-4">{c.diffFirst}</Notice> : !anyChange ? <Notice className="mb-4">{c.diffNone}</Notice> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-[0.9rem]" data-testid="diff-table">
            <thead><tr className="border-b border-ink/20 text-start text-[0.76rem] text-stone-700">
              <th scope="col" className="py-2 pe-4 text-start font-semibold">{c.field}</th><th scope="col" className="py-2 pe-4 text-start font-semibold">{c.current}</th><th scope="col" className="py-2 text-start font-semibold">{c.proposed}</th>
            </tr></thead>
            <tbody className="divide-y divide-ink/10">
              {diffRows.map((r) => (
                <tr key={r.k} className={r.changed && approved ? 'bg-warn-bg/60' : ''} data-changed={r.changed}>
                  <th scope="row" className="py-3 pe-4 text-start align-top font-semibold">{r.k}{r.changed && approved && <Badge tone="warn" className="ms-2">{c.changed}</Badge>}</th>
                  <td className="py-3 pe-4 align-top text-stone-800">{r.a}</td>
                  <td className="py-3 align-top font-semibold">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dirty && <p className="mt-4 text-[0.82rem] font-semibold text-warn">{c.dirty}. {c.saveFirst}</p>}
      </Modal>

      <Confirm open={dialog === 'approve'} onClose={() => setDialog(null)} title={c.approveTitle} body={c.approveBody} confirmLabel={c.approve} square
        onConfirm={() => { notify.result(approve(patient.id), c.approved); setDialog(null); }}>
        <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
          <KV k={c.dose}><span className="num">{fmtDose(cfg.doseMl, lang)}</span></KV>
          <KV k={t.terms.head}><Ltr mono>{APPROVED_HEAD.id}</Ltr></KV>
          <KV k={c.interval}>{everyDays(cfg.intervalDays, lang)}</KV>
        </dl>
      </Confirm>
      <Confirm open={dialog === 'lock'} onClose={() => setDialog(null)} title={c.lockTitle} body={t.note.lock} confirmLabel={c.lock} square
        onConfirm={() => { notify.result(lock(patient.id), c.locked); setDialog(null); }} />
      <Confirm open={dialog === 'update'} onClose={() => setDialog(null)} title={c.updateTitle} body={c.updateBody} confirmLabel={c.update} square
        onConfirm={() => { notify.result(reopen(patient.id), c.reopened); setDialog(null); }} />
    </div>
  );
}
