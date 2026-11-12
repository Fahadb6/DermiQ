import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { ASSETS, type ProductAsset } from '@/assets';
import { Ruler, NineDot } from '@/components/brand/Brand';
import { APPROVED_HEAD, PEN } from '@/data/product';
import { Ltr } from '@/components/ui/Bits';

/* ------------------------------------------------------------------
 * Product figures. Product images are never mirrored in RTL: the layout
 * around them flips, the object itself does not.
 * ------------------------------------------------------------------ */

export interface Mark {
  /** Position on the image, 0–1 from its top-left corner (physical, not mirrored). */
  x: number; y: number;
  /** x to use when the layout is right-to-left (labels swap sides; the image itself never mirrors). */
  xr?: number;
  side: 'start' | 'end';
  label: string;
  sub?: string;
}

/** Engineering-style annotation: leader lines on wide screens, numbered legend on phones. */
/** `width` must be a fixed CSS length (e.g. "21rem"); it never exceeds the available width. */
export function AnnotatedFigure({ asset, marks, width, className, tone = 'light' }: { asset: ProductAsset; marks: Mark[]; width: string; className?: string; tone?: 'light' | 'dark' }) {
  const { L, isRTL } = useI18n();
  const line = tone === 'light' ? 'bg-ink/35' : 'bg-ivory/40';
  const sub = tone === 'light' ? 'text-stone-700' : 'text-ivory/60';
  const physicalRight = (m: Mark) => (m.side === 'end') !== isRTL;
  const px = (m: Mark) => (isRTL && m.xr != null ? m.xr : m.x);

  const labels = (side: 'start' | 'end') => (
    <div className="relative hidden md:block" aria-hidden="true">
      {marks.filter((m) => m.side === side).map((m) => (
        <div key={m.label} className={cn('absolute inset-x-0 -translate-y-1/2', side === 'start' ? 'text-end' : 'text-start')} style={{ top: `${m.y * 100}%` }}>
          <p className="text-[0.86rem] font-bold leading-tight">{m.label}</p>
          {m.sub && <p className={cn('mt-0.5 text-[0.76rem] leading-snug', sub)}>{m.sub}</p>}
        </div>
      ))}
    </div>
  );

  return (
    <div className={className} style={{ '--fig-w': width } as React.CSSProperties}>
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_var(--fig-w)_minmax(0,1fr)] md:gap-x-6">
        {labels('start')}
        <div className="relative mx-auto w-[var(--fig-w)] max-w-full" dir="ltr">
          <img src={asset.src} alt={L(asset.alt)} width={asset.w} height={asset.h} loading="lazy" decoding="async" className="h-auto w-full select-none" draggable={false} />
          {marks.map((m, i) => (
            <div key={m.label} aria-hidden="true">
              <span
                className={cn('absolute hidden h-px md:block', line)}
                style={physicalRight(m) ? { top: `${m.y * 100}%`, left: `${px(m) * 100}%`, right: '-1.5rem' } : { top: `${m.y * 100}%`, left: '-1.5rem', right: `${(1 - px(m)) * 100}%` }}
              />
              <span
                className={cn(
                  'absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[0.62rem] font-bold md:h-[7px] md:w-[7px]',
                  tone === 'light' ? 'bg-aubergine text-ivory md:ring-2 md:ring-ivory' : 'bg-ivory text-aubergine md:ring-2 md:ring-aubergine',
                )}
                style={{ top: `${m.y * 100}%`, left: `${px(m) * 100}%` }}
              >
                <span className="num md:hidden">{i + 1}</span>
              </span>
            </div>
          ))}
        </div>
        {labels('end')}
      </div>
      {/* The legend is the accessible version on every screen; visible on phones only. */}
      <ol className="mt-6 grid gap-3 md:sr-only">
        {marks.map((m, i) => (
          <li key={m.label} className="flex gap-3">
            <span className={cn('num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold', tone === 'light' ? 'bg-aubergine text-ivory' : 'bg-ivory text-aubergine')}>{i + 1}</span>
            <span>
              <span className="block text-[0.9rem] font-bold leading-tight">{m.label}</span>
              {m.sub && <span className={cn('block text-[0.8rem]', sub)}>{m.sub}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Engineering-sheet frame with a title block. */
export function DrawingFrame({ n, title, children, className, bodyClass }: { n: string; title: string; children: React.ReactNode; className?: string; bodyClass?: string }) {
  const { lang, t } = useI18n();
  const tick = 'absolute h-2.5 w-2.5 border-ink/40';
  return (
    <figure className={cn('relative flex flex-col border border-ink/15 bg-ivory', className)}>
      <span className={cn(tick, '-left-px -top-px border-l border-t')} aria-hidden="true" />
      <span className={cn(tick, '-right-px -top-px border-r border-t')} aria-hidden="true" />
      <span className={cn(tick, '-bottom-px -left-px border-b border-l')} aria-hidden="true" />
      <span className={cn(tick, '-bottom-px -right-px border-b border-r')} aria-hidden="true" />
      <div className={cn('flex flex-1 items-center justify-center p-6 sm:p-9', bodyClass)}>{children}</div>
      <figcaption className="flex items-center gap-3 border-t border-ink/15 px-4 py-2.5 text-[0.76rem]">
        <span className="tech shrink-0 text-brand">{lang === 'ar' ? `شكل ${n}` : `Fig. ${n}`}</span>
        <span className="min-w-0 flex-1 font-semibold">{title}</span>
        <span className="hidden shrink-0 text-stone-700 sm:inline">{t.tag.conceptual}</span>
      </figcaption>
    </figure>
  );
}

/** The pen with a millimetre ruler beneath it — the hero object. */
export function PenRuler({ className, tone = 'dark', eager }: { className?: string; tone?: 'dark' | 'light'; eager?: boolean }) {
  const { L } = useI18n();
  const a = ASSETS.pen;
  return (
    <figure dir="ltr" className={cn('relative', className)}>
      <img
        src={a.src} alt={L(a.alt)} width={a.w} height={a.h} draggable={false}
        loading={eager ? 'eager' : 'lazy'} decoding="async" {...(eager ? { fetchpriority: 'high' } : {})}
        className={cn('relative h-auto w-full select-none', tone === 'dark' ? 'drop-shadow-[0_26px_28px_rgba(8,3,12,0.55)]' : 'drop-shadow-[0_22px_22px_rgba(33,19,41,0.22)]')}
      />
      <div className={cn('mt-[3.2%]', tone === 'dark' ? 'text-ivory/60' : 'text-ink/45')}>
        <Ruler mm={PEN.lengthMm} className="block h-[14px] w-full origin-left animate-draw sm:h-[18px]" />
        <div className="mt-1 flex justify-between">
          <span className="tech">0</span>
          <span className="tech">≈ {PEN.lengthMm} mm</span>
        </div>
      </div>
    </figure>
  );
}

/** The single approved head, as it appears in plans. Identical in the patient app and the physician portal. */
export function HeadTile({ className, size = 'md', tone = 'light', note = true }: { className?: string; size?: 'sm' | 'md' | 'lg'; tone?: 'light' | 'dark'; note?: boolean }) {
  const { L, t } = useI18n();
  const a = ASSETS.headArray;
  const img = size === 'lg' ? 'h-28 w-28' : size === 'sm' ? 'h-14 w-14' : 'h-20 w-20';
  return (
    <div className={cn('flex items-center gap-4', className)} data-testid="head-tile">
      <div className={cn('flex shrink-0 items-center justify-center rounded-2xl bg-ivory p-1.5 ring-1 ring-ink/10', img)}>
        <img src={a.src} alt={L(a.alt)} width={a.w} height={a.h} className="h-full w-full object-contain" loading="lazy" draggable={false} />
      </div>
      <div className="min-w-0">
        <p className={cn('font-bold leading-tight', size === 'sm' ? 'text-[0.9rem]' : 'text-base')}>{L(APPROVED_HEAD.name)}</p>
        <p className={cn('mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8rem]', tone === 'light' ? 'text-stone-700' : 'text-ivory/65')}>
          <Ltr mono className="font-medium">{APPROVED_HEAD.id}</Ltr>
          <span aria-hidden="true">·</span>
          <span>{t.terms.needles}</span>
        </p>
        {note && (
          <p className={cn('mt-1.5 inline-flex items-center gap-1.5 text-[0.76rem] font-semibold', tone === 'light' ? 'text-brand' : 'text-metal-300')}>
            <NineDot size={11} accent={null} /> {t.terms.oneHead}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Conceptual surface conformity — original schematic (not a reference render).
 * Shows the intended idea only: a rigid support, a flexible layer and a needle plate
 * over a concave, flat or convex surface.
 */
export function ConformArc({ bend, label }: { bend: -1 | 0 | 1; label: string }) {
  const W = 220, cx = W / 2;
  const sag = bend * 16; // + = convex (centre higher)
  const surfY = (x: number) => 118 - sag * (1 - ((x - cx) / 90) ** 2);
  const plateY = (x: number) => surfY(x) - 20;
  const curve = (fy: (x: number) => number, x0: number, x1: number) => {
    const pts: string[] = [];
    for (let x = x0; x <= x1; x += 6) pts.push(`${x} ${fy(x).toFixed(1)}`);
    pts.push(`${x1} ${fy(x1).toFixed(1)}`);
    return pts;
  };
  const plateTop = curve((x) => plateY(x) - 6, 50, 170);
  const plateBot = curve(plateY, 50, 170).reverse();
  const flexBot = curve((x) => plateY(x) - 6, 46, 174).reverse();
  const needles = [62, 86, 110, 134, 158];
  return (
    <figure className="text-center">
      <svg viewBox={`0 0 ${W} 150`} className="mx-auto h-auto w-full max-w-[15rem]" role="img" aria-label={label}>
        {/* surface */}
        <path d={`M${curve(surfY, 8, 212).join(' L')}`} fill="none" stroke="#A7A19C" strokeWidth="1.4" strokeLinecap="round" />
        <path d={`M${curve((x) => surfY(x) + 7, 8, 212).join(' L')}`} fill="none" stroke="#A7A19C" strokeWidth="0.7" strokeDasharray="2 4" strokeLinecap="round" />
        {/* needles */}
        {needles.map((x) => (
          <line key={x} x1={x} x2={x} y1={plateY(x)} y2={surfY(x) + 4} stroke="#68635F" strokeWidth="1.6" strokeLinecap="round" />
        ))}
        {/* flexible layer */}
        <path d={`M46 52 L174 52 L${flexBot.join(' L')} Z`} fill="#5B2393" opacity="0.92" />
        {/* needle plate */}
        <path d={`M${plateTop.join(' L')} L${plateBot.join(' L')} Z`} fill="#FBF9F5" stroke="#A7A19C" strokeWidth="0.9" />
        {/* rigid support */}
        <rect x="40" y="30" width="140" height="22" rx="5" fill="#FBF9F5" stroke="#BDB7B0" strokeWidth="1" />
      </svg>
      <figcaption className="mt-3 text-sm font-bold">{label}</figcaption>
    </figure>
  );
}

/** The pen with vertical leader lines (wide screens) or numbered points + legend (phones). */
export function PenAnnotated({ marks, tone = 'dark', className }: { marks: Array<{ x: number; y: number; label: string; sub?: string; up?: boolean }>; tone?: 'dark' | 'light'; className?: string }) {
  const { L } = useI18n();
  const a = ASSETS.pen;
  const line = tone === 'dark' ? 'bg-ivory/40' : 'bg-ink/35';
  const sub = tone === 'dark' ? 'text-ivory/60' : 'text-stone-700';
  const dot = tone === 'dark' ? 'bg-ivory text-aubergine' : 'bg-aubergine text-ivory';
  return (
    <div className={className}>
      <div dir="ltr" className="relative lg:py-28">
        <div className="relative">
          <img src={a.src} alt={L(a.alt)} width={a.w} height={a.h} loading="lazy" decoding="async" draggable={false}
            className={cn('h-auto w-full select-none', tone === 'dark' ? 'drop-shadow-[0_24px_26px_rgba(8,3,12,0.55)]' : 'drop-shadow-[0_20px_20px_rgba(33,19,41,0.2)]')} />
          {marks.map((m, i) => (
            <div key={m.label} aria-hidden="true">
              <span className={cn('absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[0.62rem] font-bold lg:h-[7px] lg:w-[7px]', dot)} style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}>
                <span className="num lg:hidden">{i + 1}</span>
              </span>
              <span className={cn('absolute hidden w-px -translate-x-1/2 lg:block', line)} style={m.up ? { left: `${m.x * 100}%`, bottom: `${(1 - m.y) * 100}%`, height: `calc(${m.y * 100}% + 2.25rem)` } : { left: `${m.x * 100}%`, top: `${m.y * 100}%`, height: `calc(${(1 - m.y) * 100}% + 2.25rem)` }} />
              <div dir="auto" className={cn('absolute hidden w-52 -translate-x-1/2 text-center lg:block', m.up ? 'bottom-[calc(100%+2.75rem)]' : 'top-[calc(100%+2.75rem)]')} style={{ left: `${m.x * 100}%` }}>
                <p className="text-[0.86rem] font-bold leading-tight">{m.label}</p>
                {m.sub && <p className={cn('mt-1 text-[0.76rem] leading-snug', sub)}>{m.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:sr-only">
        {marks.map((m, i) => (
          <li key={m.label} className="flex gap-3">
            <span className={cn('num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold', dot)}>{i + 1}</span>
            <span>
              <span className="block text-[0.9rem] font-bold leading-tight">{m.label}</span>
              {m.sub && <span className={cn('block text-[0.8rem]', sub)}>{m.sub}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
