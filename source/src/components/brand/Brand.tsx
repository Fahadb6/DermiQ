import { useMemo } from 'react';
import { cn } from '@/utils/misc';
import { topoPaths, type TopoOptions } from '@/utils/topo';
import { useI18n } from '@/services/i18n';

/** 3 × 3 glyph — a direct reference to the single treatment head's needle arrangement. */
export function NineDot({ size = 20, className, accent = '#B59A78', pulse = false }: { size?: number; className?: string; accent?: string | null; pulse?: boolean }) {
  const dots = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const centre = r === 1 && c === 1;
      dots.push(
        <circle
          key={`${r}${c}`} cx={4 + c * 8} cy={4 + r * 8} r={2.35}
          fill={centre && accent ? accent : 'currentColor'}
          className={pulse ? 'animate-dot-pulse' : undefined}
          style={pulse ? { animationDelay: `${(r * 3 + c) * 90}ms`, transformOrigin: `${4 + c * 8}px ${4 + r * 8}px` } : undefined}
        />,
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {dots}
    </svg>
  );
}

/** The DermiQ wordmark. Always Latin, always left-to-right. */
export function Wordmark({ className, glyph = true, size = 'md' }: { className?: string; glyph?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const text = size === 'lg' ? 'text-[1.7rem]' : size === 'sm' ? 'text-[1.05rem]' : 'text-[1.3rem]';
  const g = size === 'lg' ? 22 : size === 'sm' ? 14 : 17;
  return (
    <span dir="ltr" className={cn('keep-tracking inline-flex items-center gap-2 font-sans font-extrabold leading-none tracking-[-0.045em]', text, className)}>
      {glyph && <NineDot size={g} />}
      <span>DermiQ</span>
    </span>
  );
}

/** Decorative contour field. aria-hidden — never presented as clinical imagery. */
export function Topo({
  seed = 7, className, stroke = 'currentColor', width = 1, opts, accentEvery = 0, accent,
}: { seed?: number; className?: string; stroke?: string; width?: number; opts?: TopoOptions; accentEvery?: number; accent?: string }) {
  const w = opts?.w ?? 1600, h = opts?.h ?? 1000;
  const paths = useMemo(() => topoPaths(seed, opts), [seed, opts]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <g fill="none" strokeWidth={width} vectorEffect="non-scaling-stroke">
        {paths.map((d, i) => (
          <path key={i} d={d} stroke={accentEvery && accent && i % accentEvery === 0 ? accent : stroke} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

/** Mono figure caption: "FIG. 02 — …" */
export function Fig({ n, children, className }: { n: string; children?: React.ReactNode; className?: string }) {
  const { lang } = useI18n();
  return (
    <p className={cn('flex items-baseline gap-2 text-[0.72rem] leading-5', className)}>
      <span className="tech shrink-0 opacity-80">{lang === 'ar' ? `شكل ${n}` : `Fig. ${n}`}</span>
      {children && <span className="opacity-70">— {children}</span>}
    </p>
  );
}

/** Engineering ruler in millimetres (decorative scale reference for the 155 mm pen). */
export function Ruler({ mm = 155, className }: { mm?: number; className?: string }) {
  const ticks = [];
  for (let i = 0; i <= mm; i += 5) {
    const major = i % 50 === 0 || i === mm;
    const mid = i % 10 === 0;
    ticks.push(<line key={i} x1={i} x2={i} y1={0} y2={major ? 7 : mid ? 4.5 : 2.6} stroke="currentColor" strokeWidth={major ? 0.5 : 0.32} />);
  }
  return (
    <svg viewBox={`-2 -1 ${mm + 4} 15`} className={className} aria-hidden="true" focusable="false" preserveAspectRatio="none" style={{ direction: 'ltr' }}>
      <line x1={0} x2={mm} y1={0} y2={0} stroke="currentColor" strokeWidth={0.32} />
      {ticks}
    </svg>
  );
}

/** Section index used across the public site: "02 — Philosophy". */
export function SectionIndex({ n, label, className }: { n: string; label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="tech num">{n}</span>
      <span className="h-px w-8 bg-current opacity-30" aria-hidden="true" />
      <span className="eyebrow">{label}</span>
    </div>
  );
}
