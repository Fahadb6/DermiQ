import { Topo } from '@/components/brand/Brand';
import { cn } from '@/utils/misc';

/** Dark masthead shared by the inner public pages. */
export function PageHero({ eyebrow, title, intro, seed = 3, children, compact }: { eyebrow: string; title: string; intro?: string; seed?: number; children?: React.ReactNode; compact?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-aubergine text-ivory">
      <Topo seed={seed} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" accentEvery={5} accent="rgba(181,154,120,0.2)" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_10%,rgba(91,35,147,0.4),transparent_70%)]" />
      <div className={cn('page', compact ? 'pb-10 pt-28 xl:pb-12 xl:pt-40' : 'pb-16 pt-32 xl:pb-24 xl:pt-48')}>
        <p className="eyebrow animate-rise text-metal-300">{eyebrow}</p>
        <h1 className={cn('display mt-5 max-w-5xl animate-rise', compact ? 'd3' : 'd2')} style={{ animationDelay: '80ms' }}>{title}</h1>
        {intro && <p className="mt-6 max-w-2xl animate-rise text-[1.08rem] leading-relaxed text-ivory/70" style={{ animationDelay: '160ms' }}>{intro}</p>}
        {children}
      </div>
    </section>
  );
}
