import { Link } from 'react-router-dom';
import { BookOpen, LockKeyhole, Stethoscope, UserRound, X } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { ASSETS } from '@/assets';
import { FAQ } from '@/data/faq';
import { CARTRIDGE_PARTS, HEAD_LAYERS } from '@/data/product';
import { NineDot, SectionIndex, Topo } from '@/components/brand/Brand';
import { AnnotatedFigure, DrawingFrame, PenRuler, type Mark } from '@/components/product/Figures';
import { Button } from '@/components/ui/Button';
import { Fwd, UpFwd } from '@/components/ui/icons';
import { Ltr } from '@/components/ui/Bits';
import { Reveal } from '@/hooks/useReveal';
import { FaqList } from '../FaqList';
import { ArticleCard } from '@/features/education/ArticleCard';
import { fmtDose, everyDays } from '@/utils/format';

/* ================================================================== 01 · Hero */
function Hero() {
  const { t } = useI18n();
  const h = t.pub.hero;
  const access = [
    { to: '/login/patient', k: t.pub.nav.patientAccess, b: h.patientSub, icon: UserRound },
    { to: '/login/physician', k: t.pub.nav.physicianAccess, b: h.physicianSub, icon: Stethoscope },
    { to: '/guide', k: t.pub.nav.guide, b: h.guideSub, icon: BookOpen },
  ];
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-aubergine text-ivory">
      <Topo seed={11} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" accentEvery={6} accent="rgba(181,154,120,0.2)" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_78%_62%,rgba(91,35,147,0.5),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-aubergine-900/70 to-transparent" />

      <div className="page relative z-10 flex flex-1 flex-col pt-24 sm:pt-28 xl:pt-[8.75rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
          {/* The statement never gives up width: beside it, the introduction is the part that narrows. */}
          <div className="lg:shrink-0">
            <p className="tech animate-rise text-[0.72rem] text-lavender-400 sm:text-[0.78rem]">{h.eyebrow}</p>
            {/* Three statements, one per line (`.d-hero` sizes them to fit). The spaces keep them apart for screen readers and copy-paste. */}
            <h1 className="display d-hero mt-4 animate-rise sm:mt-5" style={{ animationDelay: '90ms' }}>
              <span className="block min-[320px]:whitespace-nowrap">{h.l1}</span>{' '}
              <span className="block min-[320px]:whitespace-nowrap">{h.l2}</span>{' '}
              <span className="block text-lavender-400 min-[320px]:whitespace-nowrap">{h.l3}</span>
            </h1>
          </div>
          <p className="max-w-xl animate-rise text-[1.02rem] leading-relaxed text-ivory/75 lg:min-w-0 lg:max-w-[25rem] lg:flex-1 lg:pb-3" style={{ animationDelay: '220ms' }}>{h.lead}</p>
        </div>

        {/* The object — level and shown whole at every width; it is never tilted or cropped. */}
        <div className="mt-10 animate-rise sm:mt-12 lg:mt-10" style={{ animationDelay: '320ms' }}>
          <PenRuler eager />
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-ivory/60 sm:text-[0.72rem]">
            <span className="tech text-metal-300">Fig. 01</span>
            <span aria-hidden="true">—</span>
            <span>{h.fig}</span>
          </p>
        </div>
      </div>

      <div className="page relative z-10 pb-8 pt-8 sm:pt-9 lg:pb-8">
        <nav aria-label={h.access} className="grid border-t border-ivory/15 sm:grid-cols-3">
          {access.map((a, i) => (
            <Link
              key={a.to} to={a.to}
              className={cn(
                'group flex items-center gap-4 border-b border-ivory/15 py-4 transition-colors sm:border-b-0 sm:py-5 sm:pe-6',
                i > 0 && 'sm:border-s sm:border-ivory/15 sm:ps-6',
              )}
            >
              <span className="tech num text-metal-300">{`0${i + 1}`}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.08rem] font-bold leading-tight transition-colors group-hover:text-metal-300">{a.k}</span>
                <span className="mt-1 block text-[0.82rem] text-ivory/55">{a.b}</span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ivory/25 transition-colors group-hover:border-metal-300 group-hover:bg-metal-300 group-hover:text-aubergine">
                <Fwd size={17} />
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

/* ================================================================== 02 · Philosophy */
const PillarGlyph = ({ i }: { i: number }) => {
  if (i === 0) {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="32" cy="32" r="19" />
        <circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none" />
        <path d="M32 4v14M32 46v14M4 32h14M46 32h14" />
      </svg>
    );
  }
  if (i === 1) {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M4 24c12-12 44-12 56 0" />
        <path d="M4 36c12-12 44-12 56 0" />
        <path d="M4 48c12-12 44-12 56 0" strokeDasharray="1 5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M6 50C18 50 18 30 30 30S42 14 58 14" />
      <circle cx="6" cy="50" r="3" fill="currentColor" stroke="none" />
      <circle cx="30" cy="30" r="3" fill="currentColor" stroke="none" />
      <circle cx="58" cy="14" r="4.5" />
    </svg>
  );
};

function Philosophy() {
  const { t } = useI18n();
  const p = t.pub.philosophy;
  return (
    <section className="bg-ivory py-24 lg:py-36">
      <div className="page">
        <Reveal><SectionIndex n="01" label={p.label} className="text-brand" /></Reveal>
        <Reveal as="p" delay={80} className="display d2 mt-10 max-w-[19ch] lg:max-w-[22ch]">{p.statementA}</Reveal>
        <Reveal as="p" delay={160} className="display d2 mt-3 max-w-[22ch] text-stone-600 lg:ms-[16%] lg:mt-5">{p.statementB}</Reveal>

        <div className="mt-20 grid border-t rule md:grid-cols-3 lg:mt-28">
          {p.pillars.map((x, i) => (
            <Reveal key={x.k} delay={i * 110} className={cn('border-b rule py-9 md:border-b-0 md:py-12', i > 0 && 'md:border-s md:ps-10', i < 2 && 'md:pe-10')}>
              <div className="flex items-start justify-between text-brand">
                <PillarGlyph i={i} />
                <span className="tech num text-stone-700">{`0${i + 1}`}</span>
              </div>
              <h3 className="display d3 mt-9">{x.k}</h3>
              <p className="mt-4 max-w-sm leading-relaxed text-stone-800">{x.b}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <Link to="/philosophy" className="group inline-flex items-center gap-3 border-b border-ink/30 pb-1.5 font-semibold transition-colors hover:border-brand hover:text-brand">
            {p.more} <Fwd size={17} className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== 03 · The system */
function SystemSection() {
  const { t, L } = useI18n();
  const s = t.pub.system;
  const thumbs = [
    <div key="pen" className="relative h-full w-full overflow-hidden rounded-2xl bg-aubergine" dir="ltr">
      <img src={ASSETS.pen.src} alt="" width={ASSETS.pen.w} height={ASSETS.pen.h} loading="lazy" className="absolute top-1/2 w-[760%] max-w-none -translate-y-1/2" style={{ left: '-551%' }} />
    </div>,
    <div key="cart" className="flex h-full w-full items-center justify-center rounded-2xl bg-ivory p-2 ring-1 ring-ink/10">
      <img src={ASSETS.cartridge.src} alt="" width={ASSETS.cartridge.w} height={ASSETS.cartridge.h} loading="lazy" className="h-full w-auto" />
    </div>,
    <div key="head" className="flex h-full w-full items-center justify-center rounded-2xl bg-ivory p-2 ring-1 ring-ink/10">
      <img src={ASSETS.headArray.src} alt="" width={ASSETS.headArray.w} height={ASSETS.headArray.h} loading="lazy" className="h-full w-auto" />
    </div>,
  ];
  return (
    <section className="bg-porcelain py-24 lg:py-36">
      <div className="page grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <Reveal as="figure">
            <div className="overflow-hidden rounded-[1.75rem] bg-lavender-200 shadow-plate">
              <img src={ASSETS.penCartridges.src} alt={L(ASSETS.penCartridges.alt)} width={ASSETS.penCartridges.w} height={ASSETS.penCartridges.h} loading="lazy" decoding="async" className="h-auto w-full" />
            </div>
            <figcaption className="mt-4 flex items-baseline gap-2 text-[0.78rem] text-stone-700">
              <span className="tech text-brand">Fig. 02</span>
              <span aria-hidden="true">—</span>
              <span>{s.plate}</span>
            </figcaption>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <Reveal><SectionIndex n="02" label={s.label} className="text-brand" /></Reveal>
          <Reveal as="h2" delay={80} className="display d2 mt-8">{s.title}</Reveal>
          <Reveal as="p" delay={140} className="mt-5 max-w-md text-[1.05rem] text-stone-800">{s.lead}</Reveal>
          <ol className="mt-10 border-t rule">
            {s.items.map((it, i) => (
              <Reveal as="li" key={it.k} delay={i * 90} className="grid grid-cols-[auto_1fr_5.5rem] items-center gap-5 border-b rule py-6">
                <span className="tech num self-start pt-1 text-stone-700">{`0${i + 1}`}</span>
                <div>
                  <h3 className="text-[1.12rem] font-bold leading-snug">{it.k}</h3>
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-stone-800">{it.b}</p>
                </div>
                <div className="h-[5.5rem] w-[5.5rem]">{thumbs[i]}</div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-9">
            <Button to="/product" variant="dark" size="lg" iconEnd={<Fwd size={18} />}>{s.more}</Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== 04 · Inside the design */
export function useHeadMarks(): Mark[] {
  const { L, t } = useI18n();
  const [support, flex, contact] = HEAD_LAYERS;
  return [
    { x: 0.1, xr: 0.9, y: 0.17, side: 'start', label: L(support.name), sub: L(support.drawingName) },
    { x: 0.92, xr: 0.08, y: 0.455, side: 'end', label: L(flex.name), sub: L(flex.drawingName) },
    { x: 0.09, xr: 0.91, y: 0.675, side: 'start', label: L(contact.name), sub: L(contact.drawingName) },
    { x: 0.835, xr: 0.21, y: 0.86, side: 'end', label: t.pub.inside.needle, sub: t.pub.inside.needleSub },
  ];
}
export function useCartridgeMarks(withNotes = false): Mark[] {
  const { L } = useI18n();
  const [med, collar, stopper, dil] = CARTRIDGE_PARTS;
  const sub = (v: (typeof CARTRIDGE_PARTS)[number]) => (withNotes ? L(v.note) : undefined);
  return [
    { x: 0.3, xr: 0.7, y: 0.27, side: 'start', label: L(med.name), sub: sub(med) },
    { x: 0.86, xr: 0.14, y: 0.5, side: 'end', label: L(collar.name), sub: sub(collar) },
    { x: 0.5, y: 0.632, side: 'start', label: L(stopper.name), sub: sub(stopper) },
    { x: 0.72, xr: 0.28, y: 0.83, side: 'end', label: L(dil.name), sub: sub(dil) },
  ];
}

function Inside() {
  const { t, L } = useI18n();
  const s = t.pub.inside;
  const headMarks = useHeadMarks();
  const cartMarks = useCartridgeMarks();
  return (
    <section className="drafting bg-ivory py-24 lg:py-36">
      <div className="page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal><SectionIndex n="03" label={s.label} className="text-brand" /></Reveal>
            <Reveal as="h2" delay={80} className="display d2 mt-8">{s.title}</Reveal>
          </div>
          <Reveal as="p" delay={140} className="text-[1.05rem] text-stone-800 lg:col-span-5">{s.lead}</Reveal>
        </div>

        <Reveal className="mt-14">
          <DrawingFrame n="03" title={s.headTitle} bodyClass="py-12 lg:py-20">
            <AnnotatedFigure asset={ASSETS.headSide} marks={headMarks} width="24rem" className="w-full max-w-4xl" />
          </DrawingFrame>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <DrawingFrame n="04" title={s.cartTitle} className="h-full" bodyClass="py-12">
              <AnnotatedFigure asset={ASSETS.cartridge} marks={cartMarks} width="9rem" className="w-full" />
            </DrawingFrame>
          </Reveal>
          <div className="grid gap-6">
            <Reveal delay={100}>
              <DrawingFrame n="05" title={s.arrayCap} className="h-full">
                <img src={ASSETS.headArray.src} alt={L(ASSETS.headArray.alt)} width={ASSETS.headArray.w} height={ASSETS.headArray.h} loading="lazy" className="h-auto w-40 sm:w-44" />
              </DrawingFrame>
            </Reveal>
            <Reveal delay={180}>
              <DrawingFrame n="06" title={s.macroCap} className="h-full" bodyClass="!p-0">
                <img src={ASSETS.headMacro.src} alt={L(ASSETS.headMacro.alt)} width={ASSETS.headMacro.w} height={ASSETS.headMacro.h} loading="lazy" className="h-full max-h-64 w-full bg-stone-200 object-cover" />
              </DrawingFrame>
            </Reveal>
          </div>
        </div>
        <Reveal as="p" className="mt-6 max-w-2xl text-[0.84rem] text-stone-700">{s.note}</Reveal>
      </div>
    </section>
  );
}

/* ================================================================== 05 · Precision by design */
function Precision() {
  const { t, L } = useI18n();
  const s = t.pub.precision;
  return (
    <section className="relative isolate overflow-hidden bg-ink py-24 text-ivory lg:py-36">
      <NineDot size={720} className="pointer-events-none absolute -end-52 -top-40 -z-10 text-ivory/[0.025]" accent={null} />
      <div className="page">
        <Reveal><SectionIndex n="04" label={s.label} className="text-metal-300" /></Reveal>
        <Reveal as="h2" delay={80} className="display d2 mt-8 max-w-3xl">{s.title}</Reveal>

        <dl className="mt-16 grid border-t border-ivory/15 lg:grid-cols-5">
          {s.figs.map((f, i) => (
            <Reveal key={i} delay={i * 80} className={cn('flex items-baseline justify-between gap-6 border-b border-ivory/15 py-6 lg:block lg:border-b-0 lg:py-10', i > 0 && 'lg:border-s lg:border-ivory/15 lg:ps-7')}>
              <dd className="display order-2 shrink-0 text-[3.4rem] leading-none lg:text-[clamp(3.4rem,5.4vw,5.6rem)]" dir="ltr">
                <span className={cn('num', f.v === '0' && 'text-metal-300')}>{f.v}</span>
                {f.u && <span className="tech ms-2 align-top text-ivory/55">{f.u}</span>}
              </dd>
              <dt className="order-1 max-w-[13rem] text-[0.93rem] leading-relaxed text-ivory/70 lg:mt-6">{f.b}</dt>
            </Reveal>
          ))}
        </dl>

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h3 className="eyebrow text-metal-300">{s.absentTitle}</h3>
            <ul className="mt-6 grid grid-cols-2 gap-x-6">
              {s.absent.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-ivory/10 py-3.5 text-[0.98rem] text-ivory/80">
                  <X size={15} className="shrink-0 text-metal-300" aria-hidden="true" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-md leading-relaxed text-ivory/65">{s.closing}</p>
          </Reveal>
          <Reveal as="figure" delay={140} className="lg:col-span-7">
            <div className="overflow-hidden rounded-[1.5rem]">
              <img src={ASSETS.packaging.src} alt={L(ASSETS.packaging.alt)} width={ASSETS.packaging.w} height={ASSETS.packaging.h} loading="lazy" decoding="async" className="h-auto w-full" />
            </div>
            <figcaption className="mt-4 flex items-baseline gap-2 text-[0.78rem] text-ivory/55">
              <span className="tech text-metal-300">Fig. 07</span>
              <span aria-hidden="true">—</span>
              <span>{s.packCap}</span>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== 06 · Connected experience */
function MiniRow({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink/10 py-2.5 text-[0.82rem] last:border-b-0">
      <span className="text-stone-700">{k}</span>
      <span className={cn('font-bold', mono && 'font-mono text-[0.78rem]')}>{v}</span>
    </div>
  );
}

function Connected() {
  const { t, lang, L } = useI18n();
  const s = t.pub.connected;
  const dose = fmtDose(0.3, lang);
  const Connector = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center gap-2 py-3 xl:flex-1 xl:flex-row xl:py-0">
      <span className="h-7 w-px bg-ink/25 xl:h-px xl:w-auto xl:flex-1" aria-hidden="true" />
      <span className="whitespace-nowrap text-[0.78rem] font-semibold text-stone-700">{label}</span>
      <span className="h-7 w-px bg-ink/25 xl:h-px xl:w-auto xl:flex-1" aria-hidden="true" />
    </div>
  );
  return (
    <section className="bg-porcelain py-24 lg:py-36">
      <div className="page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal><SectionIndex n="05" label={s.label} className="text-brand" /></Reveal>
            <Reveal as="h2" delay={80} className="display d2 mt-8">{s.title}</Reveal>
          </div>
          <Reveal as="p" delay={140} className="text-[1.05rem] text-stone-800 lg:col-span-5">{s.lead}</Reveal>
        </div>

        <Reveal className="mt-16">
          {/* Side by side only where both miniatures, the plan and the two English labels fit (xl); stacked below that. */}
          <div className="flex flex-col items-stretch xl:flex-row xl:items-center">
            {/* Physician portal — miniature */}
            <div className="mx-auto w-full max-w-sm xl:mx-0 xl:w-[21rem] xl:shrink-0">
              <p className="mb-3 flex items-center gap-2 text-[0.82rem] font-bold"><Stethoscope size={15} className="text-brand" aria-hidden="true" />{s.physician.k}</p>
              <div className="rounded-lg border border-ink/15 bg-white p-4 shadow-plate" aria-hidden="true">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <span className="text-[0.86rem] font-bold">{L({ en: 'Treatment Configuration', ar: 'إعدادات العلاج' })}</span>
                  <Ltr mono className="text-[0.7rem] text-stone-700">DQ-P-1001</Ltr>
                </div>
                <MiniRow k={t.terms.dose} v={<span className="num">{dose}</span>} />
                <MiniRow k={t.terms.head} v="DQ-HEAD-01" mono />
                <MiniRow k={t.terms.interval} v={everyDays(28, lang)} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-aubergine px-2.5 py-1 text-[0.7rem] font-semibold text-ivory"><LockKeyhole size={11} />{t.plan.locked}</span>
                  <span className="rounded-md px-3 py-1.5 text-[0.72rem] font-semibold ring-1 ring-inset ring-ink/20">{L({ en: 'Update plan', ar: 'تحديث الخطة' })}</span>
                </div>
              </div>
              <p className="mt-3 text-[0.84rem] leading-relaxed text-stone-700">{s.physician.b}</p>
            </div>

            <Connector label={s.sets} />

            {/* Shared plan */}
            <div className="mx-auto flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full bg-brand text-center text-ivory shadow-lift">
              <NineDot size={26} accent="#D3C2AA" />
              <p className="mt-2.5 px-4 text-[0.92rem] font-bold leading-tight">{s.plan}</p>
            </div>

            <Connector label={s.sees} />

            {/* Patient app — miniature */}
            <div className="mx-auto w-full max-w-sm xl:mx-0 xl:w-[21rem] xl:shrink-0">
              <p className="mb-3 flex items-center gap-2 text-[0.82rem] font-bold"><UserRound size={15} className="text-brand" aria-hidden="true" />{s.patient.k}</p>
              <div className="rounded-[1.5rem] border border-ink/10 bg-ivory p-3 shadow-plate" aria-hidden="true">
                <div className="rounded-[1.1rem] bg-aubergine p-4 text-ivory">
                  <p className="text-[0.7rem] text-ivory/60">{t.terms.nextAppointment}</p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="display text-[2.4rem] leading-none"><span className="num">26</span></p>
                    <p className="num text-end text-[0.76rem] text-ivory/70">{dose}<br /><span className="font-mono text-[0.68rem]">DQ-HEAD-01</span></p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between rounded-full border border-ink/15 px-4 py-2 text-[0.76rem] font-semibold">
                  <span>{L({ en: 'Report Session Completion', ar: 'تسجيل إتمام الجلسة' })}</span>
                  <span className="rounded-full bg-lavender-200 px-2 py-0.5 text-[0.66rem] text-brand-800">{t.tag.patientReported}</span>
                </div>
              </div>
              <p className="mt-3 text-[0.84rem] leading-relaxed text-stone-700">{s.patient.b}</p>
            </div>
          </div>
          <p className="mt-6 text-center text-[0.76rem] text-stone-700">{s.demo}</p>
        </Reveal>

        {/* The broken link */}
        <Reveal className="mt-4 flex flex-col items-center" aria-hidden="true">
          <span className="h-8 border-s border-dashed border-ink/35" />
          <span className="my-2 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-ivory px-3.5 py-1.5 text-[0.76rem] font-bold">
            <X size={13} className="text-bad" /> {s.noLink}
          </span>
          <span className="h-8 border-s border-dashed border-ink/35" />
        </Reveal>

        <Reveal className="relative isolate mt-2 overflow-hidden rounded-[1.75rem] bg-aubergine px-6 py-12 text-ivory sm:px-12 lg:px-16 lg:py-16">
          <Topo seed={4} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.06]" />
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow text-metal-300">{s.pen.k}</p>
              <p className="display d3 mt-4">{s.statement}</p>
              <p className="mt-4 text-ivory/65">{s.pen.b}</p>
            </div>
            <div className="lg:col-span-7"><PenRuler /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== 07 · The journey */
function Journey() {
  const { t } = useI18n();
  const s = t.pub.journey;
  const lift = [44, 12, 30, 0, 22, 6, 36]; // px — the path rises and falls like a contour
  return (
    <section className="relative isolate overflow-hidden bg-aubergine py-24 text-ivory lg:py-36">
      <Topo seed={23} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.06]" accentEvery={5} accent="rgba(181,154,120,0.16)" />
      <div className="page">
        <Reveal><SectionIndex n="06" label={s.label} className="text-metal-300" /></Reveal>
        <Reveal as="h2" delay={80} className="display d2 mt-8 max-w-3xl">{s.title}</Reveal>

        {/* Wide: a rising and falling path */}
        <ol className="relative mt-20 hidden grid-cols-7 xl:grid">
          <svg className="flip-rtl pointer-events-none absolute inset-x-0 top-0 h-16 w-full" viewBox="0 0 700 64" preserveAspectRatio="none" aria-hidden="true">
            <path
              d={`M${lift.map((y, i) => `${50 + i * 100} ${y + 8}`).join(' L')}`}
              fill="none" stroke="rgba(244,240,233,0.3)" strokeWidth="1" vectorEffect="non-scaling-stroke"
            />
          </svg>
          {s.steps.map((st, i) => (
            <Reveal as="li" key={st.k} delay={i * 80} className="relative px-3 text-center">
              <span className="mx-auto block h-4 w-4 rounded-full border border-metal-300 bg-aubergine p-[3px]" style={{ marginTop: lift[i] }} aria-hidden="true">
                <span className={cn('block h-full w-full rounded-full', i === 6 ? 'bg-metal-300' : 'bg-ivory')} />
              </span>
              <div style={{ marginTop: 64 - lift[i] }}>
                <p className="tech num text-metal-300">{`0${i + 1}`}</p>
                <h3 className="mt-3 text-[1.02rem] font-bold leading-snug">{st.k}</h3>
                <p className="mt-2 text-[0.86rem] leading-relaxed text-ivory/60">{st.b}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Narrow: a vertical line */}
        <ol className="relative mt-14 xl:hidden">
          <span className="absolute bottom-3 start-[0.45rem] top-3 w-px bg-ivory/20" aria-hidden="true" />
          {s.steps.map((st, i) => (
            <Reveal as="li" key={st.k} delay={i * 50} className="relative grid grid-cols-[1rem_1fr] gap-6 pb-9 last:pb-0 sm:gap-8">
              <span className="relative mt-1.5 block h-4 w-4 rounded-full border border-metal-300 bg-aubergine p-[3px]" aria-hidden="true">
                <span className={cn('block h-full w-full rounded-full', i === 6 ? 'bg-metal-300' : 'bg-ivory')} />
              </span>
              <div className="sm:grid sm:grid-cols-[3rem_14rem_1fr] sm:items-baseline sm:gap-4">
                <p className="tech num text-metal-300">{`0${i + 1}`}</p>
                <h3 className="mt-1 text-[1.1rem] font-bold leading-snug sm:mt-0">{st.k}</h3>
                <p className="mt-1.5 max-w-md text-[0.92rem] leading-relaxed text-ivory/60 sm:mt-0">{st.b}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 flex flex-col gap-6 border-t border-ivory/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[0.86rem] text-ivory/55">{s.note}</p>
          <Button to="/how-it-works" variant="outline-light" iconEnd={<Fwd size={17} />}>{s.more}</Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== 08 · Patient education */
function Education() {
  const { t, L } = useI18n();
  const s = t.pub.education;
  const articles = useDb((x) => x.db.articles);
  const categories = useDb((x) => x.db.categories);
  const featured = articles.filter((a) => a.status === 'published' && a.access === 'public' && a.featured).slice(0, 4);
  const cat = (id: string) => categories.find((c) => c.id === id);
  return (
    <section className="bg-ivory py-24 lg:py-36">
      <div className="page grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal><SectionIndex n="07" label={s.label} className="text-brand" /></Reveal>
            <Reveal as="h2" delay={80} className="display d2 mt-8">{s.title}</Reveal>
            <Reveal as="p" delay={140} className="mt-5 max-w-md text-[1.05rem] text-stone-800">{s.lead}</Reveal>
            <Reveal as="ol" delay={200} className="mt-10 border-t rule">
              {[...categories].sort((a, b) => a.order - b.order).map((c) => (
                <li key={c.id} className="border-b rule">
                  <Link to={`/guide?category=${c.id}`} className="group flex items-center gap-5 py-3.5">
                    <span className="tech num text-stone-700">{`0${c.order}`}</span>
                    <span className="flex-1 font-semibold transition-colors group-hover:text-brand">{L(c.title)}</span>
                    <UpFwd size={16} className="text-stone-500 transition-colors group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </Reveal>
            <Reveal className="mt-9">
              <Button to="/guide" variant="primary" size="lg" iconEnd={<Fwd size={18} />}>{s.cta}</Button>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="eyebrow text-stone-700">{s.featured}</p>
          {featured[0] && (
            <Reveal className="mt-5">
              <ArticleCard article={featured[0]} category={cat(featured[0].categoryId)} to={`/guide/${featured[0].slug}`} size="lg" />
            </Reveal>
          )}
          <div className="mt-8 divide-y divide-ink/10 border-t rule">
            {featured.slice(1).map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                <ArticleCard article={a} category={cat(a.categoryId)} to={`/guide/${a.slug}`} size="row" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== 09 · FAQ */
function FaqSection() {
  const { t } = useI18n();
  const s = t.pub.faq;
  return (
    <section className="bg-porcelain py-24 lg:py-36">
      <div className="page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal><SectionIndex n="08" label={s.label} className="text-brand" /></Reveal>
          <Reveal as="h2" delay={80} className="display d2 mt-8">{s.title}</Reveal>
          <Reveal className="mt-8">
            <Button to="/faq" variant="outline" iconEnd={<Fwd size={17} />}>{s.all}</Button>
          </Reveal>
        </div>
        <Reveal delay={120} className="lg:col-span-8">
          <FaqList items={FAQ.filter((f) => f.onHome)} />
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== 10 · Final statement */
function Final() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden bg-aubergine py-28 text-ivory lg:py-44">
      <Topo seed={31} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_50%_100%,rgba(91,35,147,0.55),transparent_70%)]" />
      <div className="page text-center">
        <Reveal><NineDot size={40} className="mx-auto text-ivory" /></Reveal>
        <Reveal as="p" delay={100} className="display d2 mx-auto mt-10 max-w-[19ch] text-balance sm:max-w-none">
          <span className="block">{t.pub.final.l1}</span>{' '}
          <span className="mt-3 block text-lavender-400 sm:mt-2">{t.pub.final.l2}</span>
        </Reveal>
        <Reveal delay={200} className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/login/patient" variant="light" size="lg" icon={<UserRound size={18} aria-hidden="true" />}>{t.pub.nav.patientAccess}</Button>
          <Button to="/login/physician" variant="outline-light" size="lg" icon={<Stethoscope size={18} aria-hidden="true" />}>{t.pub.nav.physicianAccess}</Button>
        </Reveal>
        <Reveal as="p" delay={260} className="mx-auto mt-10 max-w-md text-[0.8rem] text-ivory/60">{t.note.concept}</Reveal>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <SystemSection />
      <Inside />
      <Precision />
      <Connected />
      <Journey />
      <Education />
      <FaqSection />
      <Final />
    </>
  );
}
