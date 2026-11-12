import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { PageHero } from './PageHero';
import { Button } from '@/components/ui/Button';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';

export function Privacy() {
  const { t } = useI18n();
  const p = t.pub.privacy;
  const reset = useDb((s) => s.resetDemo);
  const notify = useNotify();
  const [ask, setAsk] = useState(false);
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} intro={p.intro} seed={52} compact />
      <section className="bg-ivory py-14 lg:py-20">
        <div className="page max-w-4xl">
          <dl className="border-t rule">
            {p.blocks.map((b, i) => (
              <div key={b.k} className="grid gap-x-8 gap-y-2 border-b rule py-7 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,2fr)]">
                <span className="tech num text-stone-700">{`0${i + 1}`}</span>
                <dt className="text-[1.08rem] font-bold">{b.k}</dt>
                <dd className="leading-relaxed text-stone-800">{b.b}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 rounded-[1.5rem] bg-porcelain p-7 sm:p-9">
            <h2 className="display d3">{p.eraseTitle}</h2>
            <p className="mt-3 max-w-xl text-stone-800">{p.eraseBody}</p>
            <Button className="mt-6" variant="outline" icon={<RotateCcw size={17} aria-hidden="true" />} onClick={() => setAsk(true)}>{p.erase}</Button>
          </div>
        </div>
      </section>
      <Confirm open={ask} onClose={() => setAsk(false)} title={p.eraseConfirmTitle} body={p.eraseConfirmBody} confirmLabel={p.erase} danger
        onConfirm={() => { reset(); setAsk(false); notify.ok(p.erased); }} />
    </>
  );
}
