import { Check, Minus } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { PageHero } from './PageHero';
import { Reveal } from '@/hooks/useReveal';
import { Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Fwd } from '@/components/ui/icons';
import { PenRuler } from '@/components/product/Figures';
import { cn } from '@/utils/misc';

export function About() {
  const { t } = useI18n();
  const a = t.pub.about;
  const links = ['/', '/login/patient', '/login/physician', '/guide'];
  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} seed={5}>
        <div className="mt-14 hidden sm:block"><PenRuler /></div>
      </PageHero>

      <section className="bg-ivory py-20 lg:py-28">
        <div className="page">
          <Reveal as="p" className="display d3 max-w-4xl">{a.intro}</Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:gap-16">
            {[{ title: a.isTitle, items: a.is, yes: true }, { title: a.notTitle, items: a.not, yes: false }].map((col, i) => (
              <Reveal key={col.title} delay={i * 100}>
                <h2 className="eyebrow text-brand">{col.title}</h2>
                <ul className="mt-5 border-t rule">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-4 border-b rule py-4 text-[1.02rem]">
                      <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full', col.yes ? 'bg-brand text-ivory' : 'border border-ink/25 text-stone-700')}>
                        {col.yes ? <Check size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
                      </span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-porcelain py-20 lg:py-28">
        <div className="page">
          <Reveal as="h2" className="display d2 max-w-2xl">{a.ecoTitle}</Reveal>
          <ol className="mt-12 grid border-t rule sm:grid-cols-2 lg:grid-cols-4">
            {a.eco.map((e, i) => (
              <Reveal as="li" key={e.k} delay={i * 80} className={cn('border-b rule py-8 lg:border-b-0', i > 0 && 'lg:border-s lg:ps-8', i % 2 === 1 && 'sm:max-lg:border-s sm:max-lg:ps-8', 'lg:pe-8')}>
                <p className="tech num text-stone-700">{`0${i + 1}`}</p>
                <h3 className="display d4 mt-6">{e.k}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-stone-800">{e.b}</p>
                <Button to={links[i]} variant="ghost" size="sm" className="-ms-3.5 mt-4 text-brand" iconEnd={<Fwd size={15} />}>{t.a.open}</Button>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ivory py-20 lg:py-28">
        <div className="page grid gap-12 lg:grid-cols-12">
          <Reveal as="h2" className="display d2 lg:col-span-5">{a.statusTitle}</Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <dl className="border-t rule">
              {a.status.map((s) => (
                <div key={s.k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 border-b rule py-4">
                  <dt className="text-stone-700">{s.k}</dt>
                  <dd className="font-bold">{s.v}</dd>
                </div>
              ))}
            </dl>
            <Notice className="mt-8" tone="brand">{a.conditionNote}</Notice>
          </Reveal>
        </div>
      </section>
    </>
  );
}
