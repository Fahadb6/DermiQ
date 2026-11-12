import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { SessionRecord, SessionView } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { adherence, sessionsOf, sessionView } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { fmtDate, fmtPct } from '@/utils/format';
import { Empty, Field, Notice, Segmented } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useNotify } from '@/components/ui/Toast';
import { DateBlock, SessionPill, SourceTag } from '@/components/domain/Status';
import { Card, PageTitle, usePatient } from './ui';

type Filter = 'all' | SessionView;
const ORDER: SessionView[] = ['awaiting_documentation', 'upcoming', 'pending_review', 'reviewed', 'missed'];

export function PatientSessions() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const s = t.pt.sessions;
  const db = useDb((x) => x.db);
  const reportSession = useDb((x) => x.reportSession);
  const markMissed = useDb((x) => x.markSessionMissed);
  const notify = useNotify();
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>('all');
  const [missedId, setMissedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  const rows = useMemo(() => sessionsOf(db, patient.id).map((x) => ({ x, v: sessionView(x, now) })), [db, patient.id, now]);
  const adh = adherence(rows.map((r) => r.x), now);
  const counts = (v: Filter) => (v === 'all' ? rows.length : rows.filter((r) => r.v === v).length);
  const shown = filter === 'all' ? rows : rows.filter((r) => r.v === filter);
  const reportId = params.get('report');
  const reporting = rows.find((r) => r.x.id === reportId && r.v === 'awaiting_documentation')?.x ?? null;
  const missing = rows.find((r) => r.x.id === missedId)?.x ?? null;

  useEffect(() => { setConfirmed(false); setNote(''); setTouched(false); }, [reportId, missedId]);
  const closeReport = () => setParams({}, { replace: true });
  const openReport = (id: string) => setParams({ report: id }, { replace: true });

  const submitReport = () => {
    setTouched(true);
    if (!reporting || !confirmed) return;
    if (notify.result(reportSession(reporting.id, note.trim()), s.reported)) closeReport();
  };
  const submitMissed = () => {
    if (!missing) return;
    if (notify.result(markMissed(missing.id, note.trim()), s.missedDone)) setMissedId(null);
  };

  const card = ({ x, v }: { x: SessionRecord; v: SessionView }) => (
    <li key={x.id} className="rounded-2xl bg-white p-4 ring-1 ring-ink/10 sm:p-5" data-testid={`session-${x.id}`} data-view={v}>
      <div className="flex items-start gap-4">
        <DateBlock at={x.scheduledAt} tone={v === 'upcoming' ? 'brand' : 'light'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <SessionPill view={v} />
            <SourceTag session={x} />
          </div>
          <p className="mt-2 font-bold">{fmtDate(x.scheduledAt, lang, 'full')} · <span className="num">{fmtDate(x.scheduledAt, lang, 'time')}</span></p>
          {x.reportedAt && <p className="mt-0.5 text-[0.8rem] text-stone-700">{fmt(s.reportedOn, { date: fmtDate(x.reportedAt, lang, 'medium') })}{x.reviewedAt ? ` · ${fmt(s.reviewedOn, { date: fmtDate(x.reviewedAt, lang, 'medium') })}` : ''}</p>}
          {v === 'upcoming' && <p className="mt-1 text-[0.84rem] text-stone-700">{fmt(s.notYet, { date: fmtDate(x.scheduledAt, lang, 'short') })}</p>}
          {L(x.patientNote) && <p className="mt-3 text-[0.9rem]"><span className="font-semibold text-stone-700">{s.yourNote}: </span>{L(x.patientNote)}</p>}
          {L(x.physicianNote) && <p className="mt-2 border-s-2 border-brand ps-3 text-[0.9rem]"><span className="font-semibold text-brand">{s.physicianNote}: </span>{L(x.physicianNote)}</p>}
          {v === 'awaiting_documentation' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => openReport(x.id)} data-testid="report-btn">{s.report}</Button>
              <Button size="sm" variant="outline" onClick={() => setMissedId(x.id)} data-testid="missed-btn">{s.missed}</Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <>
      <PageTitle title={s.title} lead={s.lead} />
      <Card className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <h2 className="eyebrow text-stone-700">{s.summary}</h2>
            <p className="mt-2 text-[1.05rem] font-bold" data-testid="adherence-text">{fmt(s.summaryOf, { a: adh.reported, b: adh.due })}</p>
          </div>
          <p className="display num text-[2.6rem] leading-none" data-testid="adherence-pct">{fmtPct(adh.pct, lang)}</p>
        </div>
        {adh.due > 0 && (
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-ink/[0.07]" aria-hidden="true">
            <span className="bg-brand" style={{ width: `${(adh.reported / adh.due) * 100}%` }} />
            <span className="bg-bad/70" style={{ width: `${(adh.missed / adh.due) * 100}%` }} />
            <span className="bg-warn/60" style={{ width: `${(adh.undocumented / adh.due) * 100}%` }} />
          </div>
        )}
        <p className="mt-3 text-[0.8rem] text-stone-700">{s.based}. {t.note.reported}</p>
      </Card>

      <Segmented<Filter> label={s.filterLabel} value={filter} onChange={setFilter}
        options={[{ value: 'all' as Filter, label: s.all, count: counts('all') }, ...ORDER.filter((v) => counts(v) > 0).map((v) => ({ value: v as Filter, label: t.session[v], count: counts(v) }))]} />

      {rows.length === 0 ? <Empty title={s.empty} body={s.emptyBody} />
        : shown.length === 0 ? <Empty title={s.emptyFilter} />
        : <ul className="mt-4 grid gap-3">{shown.map(card)}</ul>}

      <p className="mt-8 text-center text-[0.86rem]">
        <Link to="/patient/education/documenting-a-session" className="font-semibold text-brand underline-offset-4 hover:underline">{s.learn}</Link>
      </p>

      <Modal open={!!reporting} onClose={closeReport} title={s.reportTitle} description={reporting ? fmt(s.reportLead, { date: fmtDate(reporting.scheduledAt, lang, 'full') }) : undefined}
        footer={<><Button variant="ghost" onClick={closeReport}>{t.a.cancel}</Button><Button onClick={submitReport} data-testid="report-submit">{s.submit}</Button></>}>
        <div className="grid gap-5">
          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-porcelain p-4 ring-1 ring-inset ring-ink/10">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-brand" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} aria-invalid={touched && !confirmed} aria-describedby="confirm-err" data-testid="report-confirm" />
              <span className="text-[0.93rem] leading-relaxed">{s.confirm}</span>
            </label>
            <p id="confirm-err" role="alert" className="mt-2 min-h-[1.2rem] text-[0.82rem] font-semibold text-bad">{touched && !confirmed ? s.confirmRequired : ''}</p>
          </div>
          <Field label={s.noteLabel} optional>
            {(f) => <textarea id={f.id} rows={3} maxLength={400} className="field py-3" placeholder={s.notePh} value={note} onChange={(e) => setNote(e.target.value)} data-testid="report-note" />}
          </Field>
          <Notice>{t.note.reported}</Notice>
        </div>
      </Modal>

      <Modal open={!!missing} onClose={() => setMissedId(null)} title={s.missedTitle} description={missing ? fmt(s.missedLead, { date: fmtDate(missing.scheduledAt, lang, 'full') }) : undefined}
        footer={<><Button variant="ghost" onClick={() => setMissedId(null)}>{t.a.cancel}</Button><Button variant="dark" onClick={submitMissed} data-testid="missed-submit">{s.missedSubmit}</Button></>}>
        <div className="grid gap-5">
          <p className="text-[0.95rem] text-stone-800">{s.missedBody}</p>
          <Field label={s.missedNote} optional>
            {(f) => <textarea id={f.id} rows={3} maxLength={400} className="field py-3" value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
        </div>
      </Modal>
    </>
  );
}
