import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { FaqItem } from '@/types';
import { useI18n } from '@/services/i18n';
import { FAQ } from '@/data/faq';
import { matchScore } from '@/utils/search';
import { questionsCount } from '@/utils/format';
import { PageHero } from './PageHero';
import { FaqList } from './FaqList';
import { Empty, Segmented } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Fwd } from '@/components/ui/icons';

type Topic = 'all' | FaqItem['topic'];

export function searchFaq(q: string, items: FaqItem[] = FAQ): FaqItem[] {
  if (!q.trim()) return items;
  return items
    .map((f) => ({ f, s: matchScore(q, [{ text: `${f.q.en} ${f.q.ar}`, weight: 3 }, { text: `${f.a.en} ${f.a.ar}`, weight: 1 }]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.f);
}

export function FaqPage() {
  const { t, lang } = useI18n();
  const f = t.pub.faq;
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<Topic>('all');
  const results = useMemo(() => searchFaq(q).filter((x) => topic === 'all' || x.topic === topic), [q, topic]);
  const topics: Topic[] = ['all', 'product', 'platform', 'appointments', 'privacy', 'condition'];
  return (
    <>
      <PageHero eyebrow={f.label} title={f.pageTitle} intro={f.pageLead} seed={33} compact />
      <section className="bg-ivory py-12 lg:py-20">
        <div className="page max-w-4xl">
          <div className="relative">
            <Search size={19} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-stone-700" aria-hidden="true" />
            <input
              type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={f.searchPh} aria-label={f.search}
              className="field h-14 rounded-full ps-12 pe-12 text-base"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} aria-label={t.a.clear} className="absolute end-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-700 hover:bg-ink/[0.06]">
                <X size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          <Segmented className="mt-5" label={f.topics.all} value={topic} onChange={setTopic} options={topics.map((v) => ({ value: v, label: f.topics[v] }))} />
          <p className="mt-6 text-[0.84rem] text-stone-700" aria-live="polite">{questionsCount(results.length, lang)}</p>
          <div className="mt-3">
            {results.length > 0
              ? <FaqList key={`${q}|${topic}`} items={results} initialOpen={!!q} />
              : <Empty title={f.none} body={f.noneBody} action={<Button variant="outline" size="sm" onClick={() => { setQ(''); setTopic('all'); }}>{t.a.clear}</Button>} />}
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] bg-lavender-100 p-7 sm:flex-row sm:items-center">
            <div>
              <p className="display d4">{f.still}</p>
              <p className="mt-1 text-[0.9rem] text-stone-800">{t.note.advice}</p>
            </div>
            <Button to="/contact" variant="dark" iconEnd={<Fwd size={17} />}>{t.pub.nav.contact}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
