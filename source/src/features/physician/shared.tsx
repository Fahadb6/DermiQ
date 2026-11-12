import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import type { Appointment, AppointmentType, Patient, ProgressPhoto, SessionRecord, SessionView } from '@/types';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { isUpcoming, sessionView } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { fromInputs, toDateInput, toTimeInput } from '@/utils/dates';
import { fmtDate, fmtDateTime, relDay } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Badge, Field, Notice } from '@/components/ui/Bits';
import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';
import { ApptTypeBadge, DateBlock, SessionPill, SourceTag } from '@/components/domain/Status';
import { PhotoThumb } from '@/components/domain/Photo';
import { KV, PatientCell } from './ui';

const LIST = 'divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/[0.13] bg-white';

/* ---------------------------------------------------------------- Sessions */

export function SessionList({ sessions, showPatient }: { sessions: SessionRecord[]; showPatient?: boolean }) {
  const { t, L, lang } = useI18n();
  const s = t.ph.sessions;
  const patients = useDb((x) => x.db.patients);
  const reviewSession = useDb((x) => x.reviewSession);
  const notify = useNotify();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const current = sessions.find((x) => x.id === openId) ?? null;
  const patientOf = (id: string) => patients.find((p) => p.id === id);
  useEffect(() => setNote(''), [openId]);
  const submit = () => { if (current && notify.result(reviewSession(current.id, note.trim()), s.reviewed)) setOpenId(null); };

  return (
    <>
      <ul className={LIST} data-testid="session-list">
        {sessions.map((x) => {
          const v: SessionView = sessionView(x, now);
          const p = patientOf(x.patientId);
          return (
            <li key={x.id} className="grid items-center gap-x-5 gap-y-3 px-4 py-3.5 md:grid-cols-[minmax(0,13rem)_minmax(0,11rem)_minmax(0,1fr)_auto]" data-testid={`ph-session-${x.id}`} data-view={v}>
              {showPatient && p ? <PatientCell patient={p} /> : <span className="num text-[0.9rem] font-bold">{fmtDate(x.scheduledAt, lang, 'full')}</span>}
              <div>
                {showPatient && <p className="num text-[0.86rem] font-semibold">{fmtDateTime(x.scheduledAt, lang)}</p>}
                {!showPatient && <p className="num text-[0.84rem] text-stone-700">{fmtDate(x.scheduledAt, lang, 'time')}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-2"><SessionPill view={v} /></div>
              </div>
              <div className="min-w-0 text-[0.86rem]">
                <SourceTag session={x} />
                {L(x.patientNote) && <p className="mt-1 truncate text-stone-800" title={L(x.patientNote)}>{L(x.patientNote)}</p>}
                {L(x.physicianNote) && <p className="mt-1 truncate text-brand" title={L(x.physicianNote)}>{L(x.physicianNote)}</p>}
              </div>
              <div className="md:text-end">
                {v === 'pending_review'
                  ? <Button size="sm" square onClick={() => setOpenId(x.id)} data-testid="review-session">{t.a.review}</Button>
                  : <Button size="sm" square variant="ghost" onClick={() => setOpenId(x.id)}>{t.a.details}</Button>}
              </div>
            </li>
          );
        })}
      </ul>

      <Modal open={!!current} onClose={() => setOpenId(null)} title={s.reviewTitle} square
        footer={current && sessionView(current, now) === 'pending_review'
          ? <><Button variant="ghost" square onClick={() => setOpenId(null)}>{t.a.cancel}</Button><Button square onClick={submit} data-testid="review-session-submit">{s.markReviewed}</Button></>
          : <Button variant="outline" square onClick={() => setOpenId(null)}>{t.a.close}</Button>}>
        {current && (
          <div className="grid gap-5">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              <KV k={s.col.patient}>{L(patientOf(current.patientId)?.name)}</KV>
              <KV k={s.col.scheduled}><span className="num">{fmtDateTime(current.scheduledAt, lang)}</span></KV>
              <KV k={s.col.state}><SessionPill view={sessionView(current, now)} /></KV>
              {current.reportedAt && <KV k={s.reportedAt}><span className="num">{fmtDateTime(current.reportedAt, lang)}</span></KV>}
              <KV k={s.col.source}><SourceTag session={current} /></KV>
            </dl>
            <div>
              <h3 className="text-[0.8rem] font-semibold text-stone-700">{s.col.note}</h3>
              <p className="mt-1.5 rounded-md bg-porcelain px-4 py-3 text-[0.93rem]">{L(current.patientNote) || s.noNote}</p>
            </div>
            {sessionView(current, now) === 'pending_review' ? (
              <Field label={s.reviewNote} optional>
                {(f) => <textarea id={f.id} rows={3} maxLength={400} className="field !rounded-md py-3" placeholder={s.reviewNotePh} value={note} onChange={(e) => setNote(e.target.value)} data-testid="review-session-note" />}
              </Field>
            ) : L(current.physicianNote) ? (
              <div><h3 className="text-[0.8rem] font-semibold text-stone-700">{s.reviewNote}</h3><p className="mt-1.5 border-s-2 border-brand ps-4 text-[0.93rem]">{L(current.physicianNote)}</p></div>
            ) : null}
            <Notice>{t.note.reported}</Notice>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ---------------------------------------------------------------- Photos */

export function PhotoGrid({ photos, showPatient }: { photos: ProgressPhoto[]; showPatient?: boolean }) {
  const { t, L, lang } = useI18n();
  const g = t.ph.progress;
  const patients = useDb((x) => x.db.patients);
  const reviewPhoto = useDb((x) => x.reviewPhoto);
  const notify = useNotify();
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const current = photos.find((x) => x.id === openId) ?? null;
  const patientOf = (id: string) => patients.find((p) => p.id === id);
  useEffect(() => setNote(''), [openId]);
  const submit = () => { if (current && notify.result(reviewPhoto(current.id, note.trim()), g.reviewed)) setOpenId(null); };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" data-testid="ph-photo-grid">
        {photos.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => setOpenId(x.id)} className="block w-full rounded-lg border border-ink/[0.13] bg-white p-2 text-start transition-colors hover:border-brand" data-testid={`ph-photo-${x.id}`}>
              <PhotoThumb photo={x} square />
              <span className="block px-1 pb-1 pt-2.5">
                {showPatient && <span className="block truncate text-[0.86rem] font-bold">{L(patientOf(x.patientId)?.name)}</span>}
                <span className="num block text-[0.8rem] text-stone-800">{fmtDate(x.takenAt, lang, 'medium')}</span>
                <Badge tone={x.review === 'reviewed' ? 'ok' : 'warn'} dot className="mt-1.5">{t.photoReview[x.review]}</Badge>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal open={!!current} onClose={() => setOpenId(null)} title={g.reviewTitle} size="lg" square
        footer={current?.review === 'pending'
          ? <><Button variant="ghost" square onClick={() => setOpenId(null)}>{t.a.cancel}</Button><Button square onClick={submit} data-testid="review-photo-submit">{g.markReviewed}</Button></>
          : <Button variant="outline" square onClick={() => setOpenId(null)}>{t.a.close}</Button>}>
        {current && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <PhotoThumb photo={current} square />
              <p className="mt-2 text-[0.74rem] text-stone-700">{current.origin === 'demo' ? t.note.synthetic : t.note.photos}</p>
            </div>
            <div className="grid content-start gap-4">
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                <KV k={t.terms.patient}>{L(patientOf(current.patientId)?.name)}</KV>
                <KV k={g.taken}><span className="num">{fmtDate(current.takenAt, lang, 'long')}</span></KV>
                <KV k={t.terms.status}><Badge tone={current.review === 'reviewed' ? 'ok' : 'warn'} dot>{t.photoReview[current.review]}</Badge></KV>
              </dl>
              <div><h3 className="text-[0.8rem] font-semibold text-stone-700">{g.patientNote}</h3><p className="mt-1.5 rounded-md bg-porcelain px-4 py-3 text-[0.93rem]">{L(current.patientNote) || t.terms.noNote}</p></div>
              {current.review === 'pending' ? (
                <Field label={g.note} optional>
                  {(f) => <textarea id={f.id} rows={3} maxLength={400} className="field !rounded-md py-3" placeholder={g.notePh} value={note} onChange={(e) => setNote(e.target.value)} data-testid="review-photo-note" />}
                </Field>
              ) : (
                <div><h3 className="text-[0.8rem] font-semibold text-stone-700">{g.yourNote}</h3><p className="mt-1.5 border-s-2 border-brand ps-4 text-[0.93rem]">{L(current.physicianNote) || t.terms.noNote}</p></div>
              )}
              <Link to={`/physician/patients/${current.patientId}?tab=progress`} onClick={() => setOpenId(null)} className="text-[0.84rem] font-semibold text-brand underline-offset-4 hover:underline">{g.compare}</Link>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* ---------------------------------------------------------------- Appointments */

const TYPES: AppointmentType[] = ['treatment', 'follow_up', 'consultation'];

export function AppointmentModal({ open, onClose, editing, patientId, patients }: { open: boolean; onClose: () => void; editing?: Appointment | null; patientId?: string; patients: Patient[] }) {
  const { t, L } = useI18n();
  const a = t.ph.appts;
  const create = useDb((x) => x.createAppointment);
  const update = useDb((x) => x.updateAppointment);
  const notify = useNotify();
  const [pid, setPid] = useState('');
  const [type, setType] = useState<AppointmentType>('treatment');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<{ pid?: string; date?: string }>({});
  useEffect(() => {
    if (!open) return;
    setErr({});
    if (editing) { setPid(editing.patientId); setType(editing.type); setDate(toDateInput(editing.at)); setTime(toTimeInput(editing.at)); setNote(L(editing.note)); }
    else { setPid(patientId ?? ''); setType('treatment'); setDate(''); setTime('10:00'); setNote(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, patientId]);

  const submit = () => {
    const e: { pid?: string; date?: string } = {};
    if (!pid) e.pid = a.v.patient;
    const at = date && time ? fromInputs(date, time) : null;
    if (!at || Number.isNaN(at.getTime())) e.date = a.v.date;
    else if (at.getTime() <= Date.now()) e.date = a.v.future;
    setErr(e);
    if (e.pid || e.date || !at) return;
    const iso = at.toISOString();
    const keepNote = editing && note === L(editing.note) ? editing.note : note.trim();
    const ok = editing
      ? notify.result(update(editing.id, { at: iso, type, note: keepNote }), a.updated)
      : notify.result(create({ patientId: pid, at: iso, type, note: note.trim() }), a.created);
    if (ok) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? a.edit : a.new} square
      footer={<><Button variant="ghost" square onClick={onClose}>{t.a.cancel}</Button><Button square onClick={submit} data-testid="appt-submit">{editing ? a.saveChanges : a.create}</Button></>}>
      <div className="grid gap-4">
        <Field label={a.patient} error={err.pid}>
          {(f) => (
            <select id={f.id} className="field h-11 !rounded-md" value={pid} onChange={(e) => setPid(e.target.value)} disabled={!!editing || !!patientId} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="appt-patient">
              <option value="">{a.choosePatient}</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{L(p.name)} — {p.id}</option>)}
            </select>
          )}
        </Field>
        <Field label={a.type}>
          {(f) => (
            <select id={f.id} className="field h-11 !rounded-md" value={type} onChange={(e) => setType(e.target.value as AppointmentType)} data-testid="appt-type">
              {TYPES.map((k) => <option key={k} value={k}>{t.apptType[k]}</option>)}
            </select>
          )}
        </Field>
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
          <Field label={a.date} error={err.date}>
            {(f) => <input id={f.id} type="date" min={toDateInput(new Date())} className="field h-11 !rounded-md" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="appt-date" />}
          </Field>
          <Field label={a.time}>
            {(f) => <input id={f.id} type="time" className="field h-11 !rounded-md" value={time} onChange={(e) => setTime(e.target.value)} data-testid="appt-time" />}
          </Field>
        </div>
        <Field label={a.note} optional>
          {(f) => <textarea id={f.id} rows={2} maxLength={300} className="field !rounded-md py-3" value={note} onChange={(e) => setNote(e.target.value)} data-testid="appt-note" />}
        </Field>
        {type === 'treatment' && <Notice>{a.treatmentNote}</Notice>}
        <Notice>{t.note.inApp}</Notice>
      </div>
    </Modal>
  );
}

export function AppointmentList({ items, showPatient, patients }: { items: Appointment[]; showPatient?: boolean; patients: Patient[] }) {
  const { t, L, lang } = useI18n();
  const a = t.ph.appts;
  const cancel = useDb((x) => x.cancelAppointment);
  const notify = useNotify();
  const now = useNow();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const patientOf = (id: string) => patients.find((p) => p.id === id);
  return (
    <>
      <ul className={LIST} data-testid="appt-list">
        {items.map((x) => {
          const up = isUpcoming(x, now);
          const p = patientOf(x.patientId);
          return (
            <li key={x.id} className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5', x.status === 'cancelled' && 'bg-porcelain/50')} data-testid={`appt-${x.id}`}>
              <DateBlock at={x.at} square tone={up ? 'brand' : 'light'} className={x.status === 'cancelled' ? 'opacity-50' : ''} />
              <div className="min-w-0 flex-1 basis-48">
                {showPatient && p && <Link to={`/physician/patients/${p.id}`} className="block truncate font-bold underline-offset-4 hover:text-brand hover:underline">{L(p.name)}</Link>}
                <p className={cn('text-[0.86rem]', showPatient ? 'text-stone-700' : 'font-bold')}><span className="num">{fmtDate(x.at, lang, 'time')}</span> · {x.status === 'cancelled' ? t.apptStatus.cancelled : up ? relDay(x.at, lang, now) : t.apptStatus.past}</p>
                {L(x.note) && <p className="mt-0.5 truncate text-[0.82rem] text-stone-700" title={L(x.note)}>{L(x.note)}</p>}
              </div>
              <ApptTypeBadge type={x.type} />
              {up && (
                <div className="flex gap-1">
                  <IconButton label={`${a.edit} — ${L(p?.name)}`} onClick={() => setEditing(x)} data-testid="appt-edit"><Pencil size={16} aria-hidden="true" /></IconButton>
                  <IconButton label={`${a.cancelAppt} — ${L(p?.name)}`} onClick={() => setCancelling(x)} data-testid="appt-cancel"><X size={17} aria-hidden="true" /></IconButton>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <AppointmentModal open={!!editing} onClose={() => setEditing(null)} editing={editing} patients={patients} />
      <Confirm open={!!cancelling} onClose={() => setCancelling(null)} title={a.cancelTitle} body={a.cancelBody} confirmLabel={a.cancelAppt} danger square
        onConfirm={() => { if (cancelling && notify.result(cancel(cancelling.id), a.cancelledMsg)) setCancelling(null); }} />
    </>
  );
}
