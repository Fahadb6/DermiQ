import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { PlanStatus } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { adherence, followUpReasons, nextAppointment, planOf, sessionsOf, visibleSnapshot } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { matchScore } from '@/utils/search';
import { fmtDate, fmtDose, fmtPct, patientsCount } from '@/utils/format';
import { Empty, Pagination } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { ChevFwd } from '@/components/ui/icons';
import { PlanPill } from '@/components/domain/Status';
import { PageHead, PatientCell, TD, TH, usePhysician } from './ui';

const PAGE = 5;
const STATUSES: PlanStatus[] = ['draft', 'pending_approval', 'approved', 'locked', 'requires_review'];
type Sort = 'name' | 'next' | 'adherence' | 'updated';

export function Patients() {
  const me = usePhysician();
  const { t, L, lang } = useI18n();
  const p = t.ph.patients;
  const db = useDb((s) => s.db);
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = (STATUSES as string[]).includes(params.get('status') ?? '') ? (params.get('status') as PlanStatus) : '';
  const sort = (['name', 'next', 'adherence', 'updated'] as string[]).includes(params.get('sort') ?? '') ? (params.get('sort') as Sort) : 'name';
  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const list = db.patients.filter((x) => x.physicianId === me.id).map((patient) => {
      const plan = planOf(db, patient.id);
      return {
        patient, plan, snap: visibleSnapshot(plan), next: nextAppointment(db, patient.id, now),
        adh: adherence(sessionsOf(db, patient.id), now), flags: followUpReasons(db, patient.id, now).length,
        score: q.trim() ? matchScore(q, [{ text: `${patient.name.ar} ${patient.name.en}`, weight: 3 }, { text: patient.id, weight: 2 }]) : 1,
      };
    }).filter((r) => r.score > 0 && (!status || r.plan?.approvalStatus === status));
    const cmp: Record<Sort, (a: typeof list[number], b: typeof list[number]) => number> = {
      name: (a, b) => L(a.patient.name).localeCompare(L(b.patient.name), lang),
      next: (a, b) => (a.next?.at ?? '9999').localeCompare(b.next?.at ?? '9999'),
      adherence: (a, b) => (a.adh.pct ?? 101) - (b.adh.pct ?? 101),
      updated: (a, b) => (b.plan?.lastUpdated ?? '').localeCompare(a.plan?.lastUpdated ?? ''),
    };
    return list.sort(cmp[sort]);
  }, [db, me.id, now, q, status, sort, L, lang]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1));
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <>
      <PageHead title={p.title} lead={p.lead} action={<p className="text-[0.84rem] font-semibold text-stone-800">{patientsCount(rows.length, lang)}</p>} />
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem_13rem]">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-700" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => set({ q: e.target.value })} placeholder={p.searchPh} aria-label={p.searchLabel} className="field h-11 !rounded-md ps-10" data-testid="patient-search" />
        </div>
        <label className="block"><span className="sr-only">{p.status}</span>
          <select value={status} onChange={(e) => set({ status: e.target.value })} className="field h-11 !rounded-md" data-testid="status-filter">
            <option value="">{p.status}: {t.terms.all}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{t.plan[s]}</option>)}
          </select>
        </label>
        <label className="block"><span className="sr-only">{p.sort}</span>
          <select value={sort} onChange={(e) => set({ sort: e.target.value === 'name' ? '' : e.target.value })} className="field h-11 !rounded-md" data-testid="sort">
            <option value="name">{p.sort}: {p.sortName}</option><option value="next">{p.sort}: {p.sortNext}</option>
            <option value="adherence">{p.sort}: {p.sortAdherence}</option><option value="updated">{p.sort}: {p.sortUpdated}</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <Empty title={p.none} body={p.noneBody} action={<Button variant="outline" size="sm" square onClick={() => setParams({}, { replace: true })}>{p.clear}</Button>} />
      ) : (
        <>
          {/* Table — md and up */}
          <div className="hidden overflow-x-auto rounded-lg border border-ink/[0.13] bg-white md:block">
            <table className="w-full min-w-[46rem] border-collapse" data-testid="patients-table">
              <thead><tr className="border-b border-ink/15 bg-porcelain/60">
                <th scope="col" className={TH}>{p.col.patient}</th><th scope="col" className={TH}>{p.col.plan}</th><th scope="col" className={TH}>{p.col.dose}</th>
                <th scope="col" className={TH}>{p.col.next}</th><th scope="col" className={TH}>{p.col.adherence}</th><th scope="col" className={TH}>{p.col.flags}</th><th scope="col" className={TH}><span className="sr-only">{t.a.openPatient}</span></th>
              </tr></thead>
              <tbody className="divide-y divide-ink/10">
                {shown.map((r) => (
                  <tr key={r.patient.id} className="transition-colors hover:bg-lavender-100/50" data-testid={`row-${r.patient.id}`}>
                    <td className={TD}><PatientCell patient={r.patient} /></td>
                    <td className={TD}>{r.plan && <PlanPill status={r.plan.approvalStatus} />}</td>
                    <td className={TD}>{r.snap ? <span className="num font-bold">{fmtDose(r.snap.doseMl, lang)}</span> : <span className="text-stone-700">{p.noDose}</span>}</td>
                    <td className={TD}>{r.next ? <><span className="num font-semibold">{fmtDate(r.next.at, lang, 'medium')}</span><span className="block text-[0.76rem] text-stone-700">{t.apptType[r.next.type]}</span></> : <span className="text-stone-700">{p.noAppt}</span>}</td>
                    <td className={TD}><span className="num font-bold">{fmtPct(r.adh.pct, lang)}</span>{r.adh.due > 0 && <span className="num ms-2 text-[0.76rem] text-stone-700">{r.adh.reported}/{r.adh.due}</span>}</td>
                    <td className={TD}>{r.flags > 0 ? <span className="num inline-flex h-6 min-w-6 items-center justify-center rounded bg-warn-bg px-1.5 text-[0.76rem] font-bold text-warn">{r.flags}</span> : <span className="text-stone-700">—</span>}</td>
                    <td className={TD}><Link to={`/physician/patients/${r.patient.id}`} className="inline-flex items-center gap-1 whitespace-nowrap text-[0.84rem] font-bold text-brand underline-offset-4 hover:underline">{t.a.open}<ChevFwd size={14} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cards — small screens */}
          <ul className="grid gap-3 md:hidden">
            {shown.map((r) => (
              <li key={r.patient.id}>
                <Link to={`/physician/patients/${r.patient.id}`} className="block rounded-lg border border-ink/[0.13] bg-white p-4">
                  <div className="flex items-start justify-between gap-3"><PatientCell patient={r.patient} link={false} />{r.plan && <PlanPill status={r.plan.approvalStatus} />}</div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-[0.8rem]">
                    <div><dt className="text-stone-700">{p.col.dose}</dt><dd className="num mt-1 font-bold">{r.snap ? fmtDose(r.snap.doseMl, lang) : '—'}</dd></div>
                    <div><dt className="text-stone-700">{p.col.next}</dt><dd className="num mt-1 font-bold">{r.next ? fmtDate(r.next.at, lang, 'short') : '—'}</dd></div>
                    <div><dt className="text-stone-700">{p.col.adherence}</dt><dd className="num mt-1 font-bold">{fmtPct(r.adh.pct, lang)}</dd></div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="num text-[0.8rem] text-stone-700">{fmt(p.showing, { a: (page - 1) * PAGE + 1, b: Math.min(rows.length, page * PAGE), n: rows.length })}</p>
            <Pagination page={page} pages={pages} total={rows.length} onPage={(n) => set({ page: n > 1 ? String(n) : '' })} />
          </div>
        </>
      )}
    </>
  );
}
