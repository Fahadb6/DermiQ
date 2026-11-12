import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheckBig, X } from 'lucide-react';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { planOf, visibleSnapshot } from '@/services/selectors';
import { APPROVED_HEAD, CARTRIDGE_PARTS, PEN_PARTS } from '@/data/product';
import { ASSETS } from '@/assets';
import { everyDays, fmtDose } from '@/utils/format';
import { cn } from '@/utils/misc';
import { NineDot } from '@/components/brand/Brand';
import { Badge, Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Bwd, Fwd } from '@/components/ui/icons';
import { SessionPill } from '@/components/domain/Status';
import { usePatient } from './ui';

/** Educational only. Nothing in this component writes a session record. */
export function Walkthrough() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const w = t.pt.walk;
  const db = useDb((s) => s.db);
  const snap = visibleSnapshot(planOf(db, patient.id));
  const total = w.steps.length;
  const [i, setI] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const done = i >= total;
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0); }, [i]);

  const img = (k: keyof typeof ASSETS, cls: string) => {
    const a = ASSETS[k];
    return <img src={a.src} alt={L(a.alt)} width={a.w} height={a.h} className={cls} />;
  };
  const visuals: React.ReactNode[] = [
    snap ? (
      <dl className="mx-auto grid w-full max-w-sm divide-y divide-ink/10 rounded-2xl bg-white px-5 ring-1 ring-ink/10">
        <div className="flex items-baseline justify-between gap-4 py-4"><dt className="text-[0.88rem] text-stone-700">{t.terms.dose}</dt><dd className="display num text-[2rem] leading-none">{fmtDose(snap.doseMl, lang)}</dd></div>
        <div className="flex items-center justify-between gap-4 py-4"><dt className="text-[0.88rem] text-stone-700">{t.terms.head}</dt><dd className="flex items-center gap-2 font-bold"><NineDot size={16} className="text-ink" /><Ltr mono>{APPROVED_HEAD.id}</Ltr></dd></div>
        <div className="flex items-baseline justify-between gap-4 py-4"><dt className="text-[0.88rem] text-stone-700">{t.terms.interval}</dt><dd className="font-bold">{everyDays(snap.intervalDays, lang)}</dd></div>
      </dl>
    ) : <Notice className="mx-auto max-w-sm">{w.planMissing}</Notice>,
    <div className="mx-auto flex max-w-md items-center gap-6">
      {img('cartridge', 'h-64 w-auto shrink-0')}
      <ul className="grid gap-3">
        {CARTRIDGE_PARTS.map((p) => (
          <li key={p.key} className="border-s-2 border-brand/40 ps-3">
            <p className="text-[0.92rem] font-bold leading-tight">{L(p.name)}</p>
            <p className="mt-0.5 text-[0.78rem] leading-snug text-stone-700">{L(p.note)}</p>
          </li>
        ))}
      </ul>
    </div>,
    <div className="mx-auto flex max-w-sm items-end justify-center gap-5 sm:gap-8">
      <figure className="text-center">{img('stateSeparated', 'mx-auto h-64 w-auto rounded-2xl ring-1 ring-ink/10 sm:h-72')}<figcaption className="mt-3 text-[0.8rem] font-bold">{w.separated}</figcaption></figure>
      <figure className="text-center">{img('stateMixed', 'mx-auto h-64 w-auto rounded-2xl ring-1 ring-ink/10 sm:h-72')}<figcaption className="mt-3 text-[0.8rem] font-bold">{w.mixed}</figcaption></figure>
    </div>,
    <div>
      <div dir="ltr" className="overflow-hidden rounded-2xl bg-aubergine py-12">
        <img src={ASSETS.pen.src} alt={L(ASSETS.pen.alt)} width={ASSETS.pen.w} height={ASSETS.pen.h} style={{ width: '190%', maxWidth: 'none', marginLeft: '-82%' }} />
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {PEN_PARTS.map((p) => <li key={p.key}><Badge tone="outline">{L(p.name)}</Badge></li>)}
      </ul>
    </div>,
    <div className="mx-auto flex max-w-sm items-center gap-6">
      <span className="block w-40 shrink-0 rounded-full bg-white p-4 ring-1 ring-ink/10">{img('headArray', 'h-auto w-full rounded-full')}</span>
      <div>
        <Ltr mono className="text-[0.86rem] font-bold">{APPROVED_HEAD.id}</Ltr>
        <p className="display num mt-2 text-[2.6rem] leading-none">3 × 3</p>
        <p className="mt-2 text-[0.84rem] text-stone-700">{t.terms.needles}</p>
      </div>
    </div>,
    <ol className="mx-auto grid max-w-xs gap-2">
      {(['awaiting_documentation', 'pending_review', 'reviewed'] as const).map((v, n) => (
        <li key={v} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-ink/10">
          <span className="tech num text-stone-700">{`0${n + 1}`}</span><SessionPill view={v} />
        </li>
      ))}
      <li className="pt-1 text-center text-[0.78rem] text-stone-700">{t.tag.patientReported} · {t.tag.notVerified}</li>
    </ol>,
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col py-4" data-testid="walkthrough">
      <header className="flex items-center justify-between gap-4">
        <Badge tone="brand">{w.educational}</Badge>
        <Link to="/patient" className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.86rem] font-semibold hover:bg-ink/[0.06]"><X size={17} aria-hidden="true" />{w.exit}</Link>
      </header>
      <div className="mt-5 flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.min(i + 1, total)} aria-label={w.title}>
        {w.steps.map((_, n) => <span key={n} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', n <= i || done ? 'bg-brand' : 'bg-ink/10')} />)}
      </div>

      {done ? (
        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <CircleCheckBig size={44} className="text-brand" aria-hidden="true" />
          <h1 ref={heading} tabIndex={-1} className="display d3 mt-6 outline-none">{w.doneTitle}</h1>
          <Notice tone="warn" className="mt-6 max-w-md text-start" data-testid="walk-not-recorded">{w.doneBody}</Notice>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/patient/sessions" data-testid="walk-to-sessions">{w.toSessions}</Button>
            <Button to="/patient" variant="outline">{w.toHome}</Button>
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-1 flex-col py-8" aria-live="polite">
            <p className="eyebrow num text-brand">{fmt(w.step, { n: i + 1, total })}</p>
            <h1 ref={heading} tabIndex={-1} className="display d3 mt-3 outline-none">{w.steps[i].k}</h1>
            <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-stone-800">{w.steps[i].b}</p>
            <div className="flex flex-1 flex-col justify-center py-9">{visuals[i]}</div>
            <Notice>{w.directed}</Notice>
          </section>
          <footer className="safe-b sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-ink/10 bg-porcelain/95 px-4 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6">
            <Button variant="ghost" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} icon={<Bwd size={17} />}>{t.a.back}</Button>
            <Button onClick={() => setI((v) => v + 1)} iconEnd={<Fwd size={17} />} data-testid="walk-next">{i === total - 1 ? w.finish : t.a.next}</Button>
          </footer>
        </>
      )}
    </div>
  );
}
