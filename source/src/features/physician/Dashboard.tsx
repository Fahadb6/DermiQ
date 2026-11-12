import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Patient, PlanStatus } from '@/types';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { ACTIVE_PLAN, adherence, followUpReasons, planOf, sessionsOf } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { DAY, addDays, startOfDay } from '@/utils/dates';
import { fmtDate, fmtPct, relDay } from '@/utils/format';
import { Empty } from '@/components/ui/Bits';
import { ChevFwd } from '@/components/ui/icons';
import { ColumnChart, HBarList, StackBar } from '@/components/charts/Charts';
import { ApptTypeBadge, DateBlock } from '@/components/domain/Status';
import { PageHead, Panel, PatientCell, usePhysician } from './ui';

const PLAN_COLOR: Record<PlanStatus, string> = { draft: '#A7A19C', pending_approval: '#82570E', approved: '#2F6B55', locked: '#211329', requires_review: '#B59A78' };
const PLAN_ORDER: PlanStatus[] = ['locked', 'approved', 'requires_review', 'pending_approval', 'draft'];
type Reason = keyof ReturnType<typeof useI18n>['t']['ph']['dash']['reasons'];

export function Dashboard() {
  const me = usePhysician();
  const { t, L, lang } = useI18n();
  const d = t.ph.dash;
  const db = useDb((s) => s.db);
  const now = useNow();

  const data = useMemo(() => {
    const patients = db.patients.filter((p) => p.physicianId === me.id);
    const ids = new Set(patients.map((p) => p.id));
    const plans = patients.map((p) => planOf(db, p.id)).filter((p): p is NonNullable<typeof p> => !!p);
    const sessions = db.sessions.filter((s) => ids.has(s.patientId));
    const toReview = sessions.filter((s) => s.status === 'reported' && s.review !== 'reviewed');
    const photos = db.photos.filter((p) => ids.has(p.patientId) && p.review === 'pending');
    const weekEnd = now.getTime() + 7 * DAY;
    const week = db.appointments
      .filter((a) => ids.has(a.patientId) && a.status === 'scheduled' && new Date(a.at).getTime() >= now.getTime() && new Date(a.at).getTime() < weekEnd)
      .sort((a, b) => a.at.localeCompare(b.at));

    const queue: Array<{ key: string; patient: Patient; reason: Reason; to: string }> = [];
    for (const p of patients) {
      const plan = planOf(db, p.id);
      const cfg = `/physician/patients/${p.id}?tab=configuration`;
      if (plan?.approvalStatus === 'pending_approval') queue.push({ key: `${p.id}-pa`, patient: p, reason: 'pending_approval', to: cfg });
      if (plan?.approvalStatus === 'requires_review') queue.push({ key: `${p.id}-rr`, patient: p, reason: 'requires_review', to: cfg });
      if (toReview.some((s) => s.patientId === p.id)) queue.push({ key: `${p.id}-s`, patient: p, reason: 'session', to: `/physician/sessions?patient=${p.id}` });
      if (photos.some((x) => x.patientId === p.id)) queue.push({ key: `${p.id}-p`, patient: p, reason: 'photo', to: `/physician/progress?patient=${p.id}` });
      for (const r of followUpReasons(db, p.id, now)) {
        if (r === 'requires_review') continue;
        queue.push({ key: `${p.id}-${r}`, patient: p, reason: r, to: `/physician/patients/${p.id}${r === 'no_appointment' || r === 'followup_overdue' ? '?tab=appointments' : '?tab=sessions'}` });
      }
    }

    const day0 = startOfDay(now);
    const apptWeeks = [0, 1, 2, 3].map((w) => {
      const a = addDays(day0, w * 7).getTime(), b = a + 7 * DAY;
      const inWeek = db.appointments.filter((x) => ids.has(x.patientId) && x.status === 'scheduled' && new Date(x.at).getTime() >= Math.max(a, now.getTime()) && new Date(x.at).getTime() < b);
      return { label: fmtDate(new Date(a), lang, 'short'), values: (['treatment', 'follow_up', 'consultation'] as const).map((k) => inWeek.filter((x) => x.type === k).length) };
    });
    const sessionWeeks = [7, 6, 5, 4, 3, 2, 1, 0].map((w) => {
      const b = now.getTime() - w * 7 * DAY, a = b - 7 * DAY;
      const inWeek = sessions.filter((s) => { const x = new Date(s.scheduledAt).getTime(); return x > a && x <= b; });
      return { label: fmtDate(new Date(a + DAY), lang, 'short'), values: [inWeek.filter((s) => s.status === 'reported').length, inWeek.filter((s) => s.status === 'missed').length] };
    });
    const adh = patients.map((p) => {
      const a = adherence(sessionsOf(db, p.id), now);
      return { id: p.id, label: L(p.name), pct: a.pct, display: a.pct == null ? d.charts.noDue : `${fmtPct(a.pct, lang)} · ${a.reported}/${a.due}`, to: `/physician/patients/${p.id}?tab=sessions` };
    }).sort((x, y) => (y.pct ?? -1) - (x.pct ?? -1));

    return { patients, plans, toReview, photos, week, queue, apptWeeks, sessionWeeks, adh };
  }, [db, me.id, now, lang, L, d.charts.noDue]);

  const hour = now.getHours();
  const count = (st: PlanStatus[]) => data.plans.filter((p) => st.includes(p.approvalStatus)).length;
  const kpis = [
    { k: d.kpi.active, sub: d.kpi.activeSub, v: count(ACTIVE_PLAN), to: '/physician/patients' },
    { k: d.kpi.pending, sub: d.kpi.pendingSub, v: count(['pending_approval', 'requires_review']), to: '/physician/patients?status=pending_approval' },
    { k: d.kpi.sessions, sub: d.kpi.sessionsSub, v: data.toReview.length, to: '/physician/sessions' },
    { k: d.kpi.photos, sub: d.kpi.photosSub, v: data.photos.length, to: '/physician/progress' },
    { k: d.kpi.week, sub: d.kpi.weekSub, v: data.week.length, to: '/physician/appointments' },
  ];
  const byId = (id: string) => data.patients.find((p) => p.id === id);

  return (
    <>
      <PageHead title={`${hour < 12 ? d.morning : hour < 18 ? d.afternoon : d.evening} ${L(me.name)}`} lead={d.lead}>
        <p className="mb-1 text-[0.8rem] text-stone-700">{fmtDate(now, lang, 'full')}</p>
      </PageHead>

      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink/[0.13] bg-ink/[0.13] md:grid-cols-5" data-testid="kpis">
        {kpis.map((k, i) => (
          <li key={k.k} className={i === 4 ? 'max-md:col-span-2' : ''}>
            <Link to={k.to} className="group flex h-full flex-col bg-white p-4 transition-colors hover:bg-lavender-100 sm:p-5">
              <span className="text-[0.8rem] font-semibold text-stone-800">{k.k}</span>
              <span className="display num mt-3 text-[2.6rem] leading-none">{k.v}</span>
              <span className="mt-2 flex items-center justify-between text-[0.72rem] text-stone-700">{k.sub}<ChevFwd size={14} className="opacity-0 transition-opacity group-hover:opacity-100" /></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Panel title={d.attention} pad={false} action={<span className="num rounded bg-ink px-2 py-0.5 text-[0.72rem] font-bold text-ivory">{data.queue.length}</span>}>
          {data.queue.length === 0 ? <Empty title={d.attentionEmpty} body={d.attentionEmptyBody} className="py-10" /> : (
            <ul className="divide-y divide-ink/10" data-testid="attention-queue">
              {data.queue.map((q) => (
                <li key={q.key}>
                  <Link to={q.to} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-lavender-100/70">
                    <span className="min-w-0 flex-1"><PatientCell patient={q.patient} link={false} size={32} /></span>
                    <span className="hidden text-end text-[0.84rem] font-semibold text-stone-800 sm:block">{d.reasons[q.reason]}</span>
                    <ChevFwd size={16} className="shrink-0 text-stone-700" />
                    <span className="sr-only sm:hidden">{d.reasons[q.reason]}</span>
                  </Link>
                  <p className="px-5 pb-3 text-[0.8rem] font-semibold text-stone-800 sm:hidden" aria-hidden="true">{d.reasons[q.reason]}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={d.week} pad={false} action={<Link to="/physician/appointments" className="text-[0.8rem] font-semibold text-brand underline-offset-4 hover:underline">{d.allAppointments}</Link>}>
          {data.week.length === 0 ? <p className="p-5 text-[0.9rem] text-stone-700">{d.weekEmpty}</p> : (
            <ul className="divide-y divide-ink/10">
              {data.week.map((a) => {
                const p = byId(a.patientId);
                return (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                    <DateBlock at={a.at} square />
                    <div className="min-w-0 flex-1">
                      {p && <Link to={`/physician/patients/${p.id}`} className="block truncate font-bold underline-offset-4 hover:text-brand hover:underline">{L(p.name)}</Link>}
                      <p className="mt-0.5 text-[0.8rem] text-stone-700"><span className="num">{fmtDate(a.at, lang, 'time')}</span> · {relDay(a.at, lang, now)}</p>
                    </div>
                    <ApptTypeBadge type={a.type} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title={d.charts.plans} sub={d.charts.plansSub}>
          <StackBar empty={d.charts.noData} data={PLAN_ORDER.map((s) => ({ label: t.plan[s], value: count([s]), color: PLAN_COLOR[s] }))} />
        </Panel>
        <Panel title={d.charts.appts} sub={d.charts.apptsSub}>
          <ColumnChart empty={d.charts.noData} groups={data.apptWeeks}
            series={[{ label: t.apptType.treatment, color: '#5B2393' }, { label: t.apptType.follow_up, color: '#B59A78' }, { label: t.apptType.consultation, color: '#BDB7B0' }]} />
        </Panel>
        <Panel title={d.charts.sessions} sub={d.charts.sessionsSub}>
          <ColumnChart empty={d.charts.noData} groups={data.sessionWeeks} series={[{ label: d.charts.reported, color: '#5B2393' }, { label: d.charts.missed, color: '#9C3A3A' }]} />
        </Panel>
        <Panel title={d.charts.adherence} sub={d.charts.adherenceSub}>
          <HBarList empty={d.charts.noData} rows={data.adh} />
          <p className="mt-4 text-[0.74rem] text-stone-700">{t.note.reported}</p>
        </Panel>
      </div>
    </>
  );
}
