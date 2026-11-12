import type { ArticleArt as Art } from '@/types';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { ASSETS } from '@/assets';
import { NineDot, Topo } from '@/components/brand/Brand';

/** Decorative hair-follicle schematic (original illustration, not a clinical image). */
function Follicles({ className }: { className?: string }) {
  const f = (x: number, depth: number, o: number, hair = true) => (
    <g key={x} opacity={o}>
      {hair && <path d={`M${x - 26} 6 C ${x - 18} 40, ${x - 6} 66, ${x} 96`} fill="none" stroke="#211329" strokeWidth="2.2" strokeLinecap="round" />}
      <path d={`M${x - 5} 96 C ${x - 9} ${96 + depth * 0.5}, ${x - 13} ${96 + depth * 0.8}, ${x - 12} ${96 + depth} C ${x - 11} ${118 + depth}, ${x + 13} ${118 + depth}, ${x + 12} ${96 + depth} C ${x + 13} ${96 + depth * 0.8}, ${x + 8} ${96 + depth * 0.5}, ${x + 5} 96`}
        fill="none" stroke="#5B2393" strokeWidth="1.5" />
      <ellipse cx={x} cy={104 + depth} rx="4.5" ry="6" fill="#B59A78" opacity="0.8" />
    </g>
  );
  return (
    <svg viewBox="0 0 400 250" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <path d="M-10 96 C 60 84, 130 106, 200 96 S 340 86, 410 98" fill="none" stroke="#211329" strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M-10 114 C 60 102, 130 124, 200 114 S 340 104, 410 116" fill="none" stroke="#211329" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 6" />
      {[150, 176, 206, 238].map((y, i) => (
        <path key={y} d={`M-10 ${y} C 80 ${y - 14 - i * 2}, 150 ${y + 12}, 220 ${y - 2} S 350 ${y - 12}, 410 ${y + 4}`} fill="none" stroke="#5B2393" strokeOpacity={0.14 - i * 0.02} strokeWidth="1" />
      ))}
      {f(96, 62, 1)}
      {f(198, 84, 1)}
      {f(300, 54, 0.4, false)}
    </svg>
  );
}

function JourneyPath({ className }: { className?: string }) {
  const pts = [[30, 190], [84, 150], [140, 168], [196, 112], [250, 132], [306, 74], [366, 52]];
  return (
    <svg viewBox="0 0 400 250" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <path d={`M${pts.map((p) => p.join(' ')).join(' L')}`} fill="none" stroke="#F4F0E9" strokeOpacity="0.35" strokeWidth="1.2" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 6 ? 7 : 4.5} fill={i === 6 ? '#B59A78' : '#F4F0E9'} />
          <text x={x} y={y + 24} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#F4F0E9" fillOpacity="0.55">{`0${i + 1}`}</text>
        </g>
      ))}
    </svg>
  );
}

function CalendarDots({ className }: { className?: string }) {
  const cells = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    const n = r * 7 + c;
    const hit = n === 17;
    cells.push(<circle key={n} cx={74 + c * 42} cy={45 + r * 40} r={hit ? 13 : 3.2} fill={hit ? '#5B2393' : '#211329'} fillOpacity={hit ? 1 : n < 17 ? 0.5 : 0.22} />);
  }
  return (
    <svg viewBox="0 0 400 250" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {cells}
      <circle cx={74 + 3 * 42} cy={45 + 2 * 40} r="21" fill="none" stroke="#5B2393" strokeOpacity="0.35" />
    </svg>
  );
}

function RecordLines({ className }: { className?: string }) {
  const rows = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 400 250" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {rows.map((r) => (
        <g key={r} transform={`translate(70 ${46 + r * 38})`}>
          <circle cx="0" cy="0" r="8" fill={r < 3 ? '#5B2393' : 'none'} stroke="#5B2393" strokeWidth="1.4" strokeOpacity={r < 3 ? 1 : 0.4} />
          {r < 3 && <path d="M-3.5 0 L-1 2.8 L4 -2.8" fill="none" stroke="#FBF9F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="26" y="-3" width={[190, 150, 220, 130, 170][r]} height="6" rx="3" fill="#211329" fillOpacity={r < 3 ? 0.55 : 0.18} />
          <rect x="26" y="9" width={[110, 80, 140, 70, 90][r]} height="4" rx="2" fill="#211329" fillOpacity="0.14" />
        </g>
      ))}
    </svg>
  );
}

/** Cover art for an article. Purely decorative (alt text is empty by design). */
export function ArticleArt({ art, seed = 1, className }: { art: Art; seed?: number; className?: string }) {
  const { L } = useI18n();
  const base = cn('relative h-full w-full overflow-hidden', className);
  switch (art) {
    case 'pen':
      return (
        <div className={cn(base, 'bg-aubergine')}>
          <Topo seed={seed + 2} className="absolute inset-0 h-full w-full text-ivory/[0.08]" opts={{ w: 800, h: 500, levels: 8 }} />
          <img src={ASSETS.pen.src} alt="" width={ASSETS.pen.w} height={ASSETS.pen.h} loading="lazy" dir="ltr"
            className="absolute left-[8%] top-1/2 w-[150%] max-w-none -translate-y-1/2 drop-shadow-[0_18px_18px_rgba(8,3,12,0.5)]" />
        </div>
      );
    case 'cartridge':
      return (
        <div className={cn(base, 'flex items-center justify-center bg-lavender-200')}>
          <img src={ASSETS.cartridge.src} alt="" width={ASSETS.cartridge.w} height={ASSETS.cartridge.h} loading="lazy" className="h-[86%] w-auto" />
          <img src={ASSETS.cartridge.src} alt="" width={ASSETS.cartridge.w} height={ASSETS.cartridge.h} loading="lazy" className="ms-[9%] h-[86%] w-auto opacity-35" />
        </div>
      );
    case 'head':
      return (
        <div className={cn(base, 'flex items-center justify-center bg-porcelain-200')}>
          <NineDot size={220} className="absolute -end-8 -top-10 text-ink/[0.05]" accent={null} />
          <img src={ASSETS.headArray.src} alt="" width={ASSETS.headArray.w} height={ASSETS.headArray.h} loading="lazy" className="relative h-[82%] w-auto" />
        </div>
      );
    case 'follicle':
      return <div className={cn(base, 'bg-porcelain-200')}><Follicles className="absolute inset-0 h-full w-full" /></div>;
    case 'journey':
      return (
        <div className={cn(base, 'bg-aubergine-800')}>
          <Topo seed={seed + 9} className="absolute inset-0 h-full w-full text-ivory/[0.06]" opts={{ w: 800, h: 500, levels: 8 }} />
          <JourneyPath className="absolute inset-0 h-full w-full" />
        </div>
      );
    case 'calendar':
      return <div className={cn(base, 'bg-lavender-100')}><CalendarDots className="absolute inset-0 h-full w-full" /></div>;
    case 'record':
      return <div className={cn(base, 'bg-stone-100')}><RecordLines className="absolute inset-0 h-full w-full" /></div>;
    case 'topo':
    default:
      return (
        <div className={cn(base, 'bg-lavender-200')} title={L({ en: '', ar: '' }) || undefined}>
          <Topo seed={seed + 4} className="absolute inset-0 h-full w-full text-brand/40" opts={{ w: 800, h: 500, levels: 12, bumps: 4 }} accentEvery={4} accent="rgba(33,19,41,0.55)" />
        </div>
      );
  }
}
