import { useI18n } from '@/services/i18n';
import { ASSETS } from '@/assets';
import { cn } from '@/utils/misc';
import { PageHero } from './PageHero';
import { Reveal } from '@/hooks/useReveal';
import { NineDot, Topo } from '@/components/brand/Brand';
import { PenRuler } from '@/components/product/Figures';

export function Philosophy() {
  const { t, L } = useI18n();
  const p = t.pub.philosophyPage;
  const visuals = [
    <div key="a" className="relative isolate overflow-hidden rounded-[1.5rem] bg-aubergine px-6 py-14 sm:px-10">
      <Topo seed={14} className="absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" />
      <PenRuler />
    </div>,
    <div key="b" className="drafting flex items-center justify-center rounded-[1.5rem] border border-ink/10 bg-ivory p-10">
      <img src={ASSETS.head34.src} alt={L(ASSETS.head34.alt)} width={ASSETS.head34.w} height={ASSETS.head34.h} loading="lazy" className="h-auto w-full max-w-sm" />
    </div>,
    <div key="c" className="relative overflow-hidden rounded-[1.5rem] bg-lavender-200 p-10">
      <Topo seed={21} className="absolute inset-0 h-full w-full text-brand/30" opts={{ levels: 13, bumps: 5 }} />
      <svg viewBox="0 0 400 220" className="relative h-auto w-full" aria-hidden="true">
        <path d="M24 180 C 90 180, 90 110, 150 110 S 220 50, 280 70 S 340 30, 376 30" fill="none" stroke="#211329" strokeWidth="1.4" />
        {[[24, 180], [150, 110], [280, 70], [376, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 3 ? 8 : 5} fill={i === 3 ? '#5B2393' : '#211329'} />)}
      </svg>
    </div>,
  ];
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} intro={p.intro} seed={17} />
      <section className="bg-ivory py-12 lg:py-20">
        <div className="page">
          {p.sections.map((s, i) => (
            <div key={s.k} className="grid gap-10 border-b rule py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
              <Reveal className={cn('lg:col-span-6', i % 2 === 1 && 'lg:order-2')}>
                <p className="flex items-center gap-4"><span className="tech num text-stone-700">{`0${i + 1}`}</span><span className="eyebrow text-brand">{s.k}</span></p>
                <h2 className="display d2 mt-7">{s.h}</h2>
                <p className="mt-6 max-w-xl text-[1.08rem] leading-relaxed text-stone-800">{s.b}</p>
              </Reveal>
              <Reveal delay={120} className={cn('self-center lg:col-span-6', i % 2 === 1 && 'lg:order-1')}>{visuals[i]}</Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-porcelain py-20 lg:py-28">
        <div className="page grid gap-12 lg:grid-cols-12">
          <Reveal as="h2" className="display d2 lg:col-span-4">{p.decisionsTitle}</Reveal>
          <ol className="border-t rule lg:col-span-8">
            {p.decisions.map((d, i) => (
              <Reveal as="li" key={d.k} delay={i * 60} className="grid gap-x-6 gap-y-1 border-b rule py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline">
                <span className="tech num text-stone-700">{`0${i + 1}`}</span>
                <h3 className="display d4">{d.k}</h3>
                <p className="text-stone-800">{d.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-aubergine py-20 text-ivory lg:py-28">
        <Topo seed={2} className="absolute inset-0 -z-10 h-full w-full text-ivory/[0.08]" accentEvery={4} accent="rgba(181,154,120,0.25)" />
        <div className="page grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h2 className="display d2">{p.signatureTitle}</h2>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ivory/70">{p.signature}</p>
          </div>
          <div className="flex items-center justify-center lg:col-span-5"><NineDot size={170} className="text-ivory" pulse /></div>
        </div>
      </section>
    </>
  );
}
