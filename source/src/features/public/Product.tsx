import { useState } from 'react';
import { useI18n } from '@/services/i18n';
import { cn } from '@/utils/misc';
import { ASSETS, type AssetKey } from '@/assets';
import { APPROVED_HEAD, HEAD_LAYERS, PEN_PARTS } from '@/data/product';
import { PageHero } from './PageHero';
import { Reveal } from '@/hooks/useReveal';
import { Ltr, Notice } from '@/components/ui/Bits';
import { NineDot, SectionIndex } from '@/components/brand/Brand';
import { AnnotatedFigure, ConformArc, DrawingFrame, PenAnnotated } from '@/components/product/Figures';
import { useCartridgeMarks } from './home/Home';

type View = 'array' | 'threeq' | 'top' | 'side' | 'macro';
const VIEW_ASSET: Record<View, AssetKey> = { array: 'headArray', threeq: 'head34', top: 'headTop', side: 'headSide', macro: 'headMacro' };

export function Product() {
  const { t, L } = useI18n();
  const p = t.pub.product;
  const [view, setView] = useState<View>('array');
  const cartMarks = useCartridgeMarks(true);
  const [holder, counter, selector] = PEN_PARTS;
  const penMarks = [
    { x: 0.405, y: 0.38, up: true, label: L(holder.name) },
    { x: 0.795, y: 0.55, up: false, label: L(counter.name) },
    { x: 0.89, y: 0.22, up: true, label: L(selector.name) },
  ];
  const asset = ASSETS[VIEW_ASSET[view]];
  /* The four cartridge views are the owner's reference sheet, one stage per tile. */
  const stageKeys = ['stateSeparated', 'stateTwist', 'stateMixed', 'stateDetached'] as const satisfies readonly AssetKey[];
  const penTiles = [
    <div key="c" className="relative h-full overflow-hidden bg-aubergine" dir="ltr"><img src={ASSETS.pen.src} alt={L(ASSETS.pen.alt)} width={ASSETS.pen.w} height={ASSETS.pen.h} loading="lazy" className="absolute top-1/2 w-[250%] max-w-none -translate-y-1/2" style={{ left: '-56%' }} /></div>,
    <div key="d" className="h-full bg-lavender-200"><img src={ASSETS.penCartridges.src} alt={L(ASSETS.penCartridges.alt)} width={ASSETS.penCartridges.w} height={ASSETS.penCartridges.h} loading="lazy" className="h-full w-full object-cover" /></div>,
  ];

  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} intro={p.intro} seed={8} />

      {/* ---------- Pen ---------- */}
      <section className="relative bg-aubergine pb-24 text-ivory lg:pb-32">
        <div className="page border-t border-ivory/15 pt-16 lg:pt-20">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <SectionIndex n="01" label={p.penLength} className="text-metal-300" />
              <h2 className="display d2 mt-7">{p.penTitle}</h2>
            </div>
            <p className="text-[1.05rem] text-ivory/70 lg:col-span-6">{p.penLead}</p>
          </div>
          <Reveal className="mt-12 lg:mt-4"><PenAnnotated marks={penMarks} /></Reveal>
          <dl className="mt-12 grid border-t border-ivory/15 sm:grid-cols-2 lg:mt-4 lg:grid-cols-4">
            {PEN_PARTS.map((part, i) => (
              <div key={part.key} className={cn('border-b border-ivory/15 py-6 lg:border-b-0 lg:pe-6', i > 0 && 'lg:border-s lg:border-ivory/15 lg:ps-6')}>
                <dt className="font-bold">{L(part.name)}</dt>
                <dd className="mt-2 text-[0.9rem] leading-relaxed text-ivory/65">{L(part.note)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-[0.8rem] text-ivory/50">{t.note.conceptImage}</p>
        </div>
      </section>

      {/* ---------- Cartridge ---------- */}
      <section className="drafting bg-ivory py-24 lg:py-32">
        <div className="page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionIndex n="02" label={t.pub.system.items[1].k} className="text-brand" />
              <h2 className="display d2 mt-7">{p.cartTitle}</h2>
              <p className="mt-5 text-[1.05rem] text-stone-800">{p.cartLead}</p>
              <Notice tone="warn" className="mt-8">{p.cartOpen}</Notice>
            </div>
            <Reveal className="lg:col-span-7">
              <DrawingFrame n="01" title={t.pub.inside.cartTitle} bodyClass="py-12">
                <AnnotatedFigure asset={ASSETS.cartridge} marks={cartMarks} width="9.5rem" className="w-full" />
              </DrawingFrame>
            </Reveal>
          </div>

          <h3 className="display d3 mt-24">{p.statesTitle}</h3>
          <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {p.states.map((st, i) => {
              const a = ASSETS[stageKeys[i]];
              return (
                <Reveal as="li" key={st.k} delay={i * 80}>
                  <figure>
                    <div className="aspect-[3/5] overflow-hidden rounded-2xl border border-ink/10 bg-[#E5E0F3]">
                      <img src={a.src} alt={L(a.alt)} width={a.w} height={a.h} loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
                    </div>
                    <figcaption className="mt-4">
                      <p className="tech num text-stone-700">{`0${i + 1}`}</p>
                      <p className="mt-2 font-bold">{st.k}</p>
                      <p className="mt-1 text-[0.88rem] leading-relaxed text-stone-700">{st.b}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </ol>
          <p className="mt-8 max-w-3xl text-[0.86rem] leading-relaxed text-stone-700">{p.statesNote}</p>

          <p className="eyebrow mt-16 text-stone-700">{p.withPenLabel}</p>
          <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2">
            {p.withPen.map((st, i) => (
              <Reveal as="li" key={st.k} delay={i * 80}>
                <figure>
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-ink/10">{penTiles[i]}</div>
                  <figcaption className="mt-4">
                    <p className="font-bold">{st.k}</p>
                    <p className="mt-1 text-[0.88rem] leading-relaxed text-stone-700">{st.b}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Head ---------- */}
      <section className="bg-porcelain py-24 lg:py-32">
        <div className="page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionIndex n="03" label={APPROVED_HEAD.id} className="text-brand" />
              <h2 className="display d2 mt-7">{p.headTitle}</h2>
              <p className="mt-5 text-[1.05rem] text-stone-800">{p.headLead}</p>
              <dl className="mt-8 border-t rule">
                <div className="flex items-center justify-between gap-6 border-b rule py-4"><dt className="text-stone-700">{t.terms.headId}</dt><dd><Ltr mono className="font-bold">{APPROVED_HEAD.id}</Ltr></dd></div>
                <div className="flex items-center justify-between gap-6 border-b rule py-4"><dt className="text-stone-700">{L(APPROVED_HEAD.needleType)}</dt><dd className="num font-bold">{APPROVED_HEAD.needleCount} · {APPROVED_HEAD.grid}</dd></div>
              </dl>
              <p className="mt-6 flex items-center gap-3 font-bold text-brand"><NineDot size={18} accent={null} />{p.onlyOne}</p>
            </div>
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-ivory">
                <div className="drafting flex aspect-[4/3] items-center justify-center p-8 sm:p-12">
                  <img key={view} src={asset.src} alt={L(asset.alt)} width={asset.w} height={asset.h} className="max-h-full w-auto max-w-full animate-fade object-contain" />
                </div>
                <div role="tablist" aria-label={p.headTitle} className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-ink/10 p-2">
                  {(Object.keys(VIEW_ASSET) as View[]).map((v) => (
                    <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
                      className={cn('h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[0.85rem] font-semibold transition-colors', view === v ? 'bg-aubergine text-ivory' : 'text-stone-800 hover:bg-ink/[0.06]')}>
                      {p.views[v]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <h3 className="display d3 mt-24">{p.layersTitle}</h3>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-start text-[0.95rem]">
              <thead>
                <tr className="border-b border-ink/30 text-[0.8rem] text-stone-700">
                  <th scope="col" className="py-3 pe-4 text-start font-semibold">{p.layerCol.layer}</th>
                  <th scope="col" className="py-3 pe-4 text-start font-semibold">{p.layerCol.drawing}</th>
                  <th scope="col" className="py-3 pe-4 text-start font-semibold">{p.layerCol.role}</th>
                  <th scope="col" className="py-3 text-end font-semibold">{p.layerCol.value}</th>
                </tr>
              </thead>
              <tbody>
                {HEAD_LAYERS.map((l) => (
                  <tr key={l.key} className="border-b rule align-top">
                    <th scope="row" className="py-4 pe-4 text-start font-bold">{L(l.name)}</th>
                    <td className="py-4 pe-4 text-stone-800">{L(l.drawingName)}</td>
                    <td className="max-w-xs py-4 pe-4 text-stone-800">{L(l.role)}</td>
                    <td className="py-4 text-end"><Ltr mono>{l.drawingValue}</Ltr><span className="block text-[0.72rem] text-stone-700">{t.tag.refDrawing}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[0.86rem] text-stone-700">{p.layersNote}</p>

          <h3 className="display d3 mt-24">{p.conformTitle}</h3>
          <div className="mt-10 grid gap-10 rounded-[1.5rem] border border-ink/10 bg-ivory p-8 sm:grid-cols-3 sm:p-12">
            <ConformArc bend={-1} label={p.conform.concave} />
            <ConformArc bend={0} label={p.conform.flat} />
            <ConformArc bend={1} label={p.conform.convex} />
          </div>
          <Notice className="mt-6 max-w-3xl">{p.conformNote}</Notice>
        </div>
      </section>

      {/* ---------- Packaging ---------- */}
      <section className="bg-ink py-24 text-ivory lg:py-32">
        <div className="page grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-4">
            <SectionIndex n="04" label={t.tag.concept} className="text-metal-300" />
            <h2 className="display d2 mt-7">{p.packTitle}</h2>
            <p className="mt-5 text-[1.05rem] text-ivory/70">{p.packLead}</p>
            <p className="mt-6 text-[0.84rem] text-ivory/50">{t.note.conceptImage}</p>
          </div>
          <Reveal as="figure" className="lg:col-span-8">
            <img src={ASSETS.packaging.src} alt={L(ASSETS.packaging.alt)} width={ASSETS.packaging.w} height={ASSETS.packaging.h} loading="lazy" className="h-auto w-full rounded-[1.5rem]" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
