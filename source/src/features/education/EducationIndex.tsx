import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { EducationalArticle } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { FAQ } from '@/data/faq';
import { matchScore } from '@/utils/search';
import { articlesCount, questionsCount } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Empty, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Fwd } from '@/components/ui/icons';
import { Topo } from '@/components/brand/Brand';
import { FaqList } from '@/features/public/FaqList';
import { searchFaq } from '@/features/public/FaqPage';
import { ArticleCard } from './ArticleCard';

export type EduMode = 'public' | 'patient';
export const eduBase = (mode: EduMode) => (mode === 'public' ? '/guide' : '/patient/education');

function searchArticles(q: string, list: EducationalArticle[]): EducationalArticle[] {
  if (!q.trim()) return list;
  return list
    .map((a) => ({ a, s: matchScore(q, [
      { text: `${a.title.en} ${a.title.ar}`, weight: 5 },
      { text: `${a.summary.en} ${a.summary.ar}`, weight: 2 },
      { text: `${a.body.en} ${a.body.ar}`, weight: 1 },
    ]) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);
}

export function EducationIndex({ mode }: { mode: EduMode }) {
  const { t, L, lang } = useI18n();
  const e = t.edu;
  const base = eduBase(mode);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const catId = params.get('category') ?? '';
  const allArticles = useDb((s) => s.db.articles);
  const categories = useDb((s) => s.db.categories);
  const cats = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);
  const published = useMemo(() => allArticles.filter((a) => a.status === 'published').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [allArticles]);
  const isLocked = (a: EducationalArticle) => mode === 'public' && a.access === 'patient';
  const linkOf = (a: EducationalArticle) => `${base}/${a.slug}`;
  const cat = (id: string) => cats.find((c) => c.id === id);
  const set = (next: { q?: string; category?: string }) => {
    const p = new URLSearchParams();
    const nq = next.q ?? q, nc = next.category ?? catId;
    if (nq) p.set('q', nq);
    if (nc) p.set('category', nc);
    setParams(p, { replace: true });
  };

  const artResults = useMemo(() => searchArticles(q, published), [q, published]);
  const faqResults = useMemo(() => searchFaq(q), [q]);
  const featured = published.filter((a) => a.featured && !isLocked(a));
  const activeCat = cat(catId);

  const searchBox = (dark: boolean) => (
    <div className="relative max-w-2xl">
      <Search size={19} className={cn('pointer-events-none absolute start-4 top-1/2 -translate-y-1/2', dark ? 'text-ivory/60' : 'text-stone-700')} aria-hidden="true" />
      <input
        type="search" value={q} onChange={(ev) => set({ q: ev.target.value, category: ev.target.value ? '' : catId })} placeholder={e.searchPh} aria-label={e.searchLabel} data-testid="edu-search"
        className={cn('h-14 w-full rounded-full ps-12 pe-12 text-base outline-none transition-colors',
          dark ? 'border border-ivory/25 bg-ivory/[0.06] text-ivory placeholder:text-ivory/60 focus:border-ivory/70' : 'field')}
      />
      {q && (
        <button type="button" onClick={() => set({ q: '' })} aria-label={t.a.clear} className={cn('absolute end-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full', dark ? 'text-ivory/80 hover:bg-ivory/10' : 'text-stone-700 hover:bg-ink/[0.06]')}>
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );

  const row = (a: EducationalArticle) => (
    <li key={a.id}><ArticleCard article={a} category={cat(a.categoryId)} to={isLocked(a) ? '/login/patient' : linkOf(a)} size="row" locked={isLocked(a)} /></li>
  );

  let body: React.ReactNode;
  if (q.trim()) {
    const total = artResults.length + faqResults.length;
    body = (
      <div>
        <h2 className="display d3" aria-live="polite">{fmt(e.resultsFor, { q })}</h2>
        <p className="mt-2 text-[0.86rem] text-stone-700">{articlesCount(artResults.length, lang)} · {questionsCount(faqResults.length, lang)}</p>
        {total === 0 && <Empty title={e.noResults} body={e.noResultsBody} action={<Button variant="outline" size="sm" onClick={() => set({ q: '' })}>{t.a.clear}</Button>} />}
        {artResults.length > 0 && <ul className="mt-6 divide-y divide-ink/10 border-y rule">{artResults.map(row)}</ul>}
        {faqResults.length > 0 && (
          <div className="mt-12">
            <h3 className="eyebrow mb-4 text-brand">{e.questions}</h3>
            <FaqList key={q} items={faqResults} initialOpen={artResults.length === 0} />
          </div>
        )}
      </div>
    );
  } else if (activeCat) {
    const list = published.filter((a) => a.categoryId === activeCat.id);
    const isFaq = activeCat.id === 'cat-faq';
    body = (
      <div>
        <p className="tech num text-brand">{`0${activeCat.order}`}</p>
        <h2 className="display d2 mt-3">{L(activeCat.title)}</h2>
        <p className="mt-3 max-w-xl text-stone-800">{L(activeCat.description)}</p>
        {isFaq && <div className="mt-8"><FaqList items={FAQ} /></div>}
        {list.length > 0
          ? <ul className={cn('divide-y divide-ink/10 border-y rule', isFaq ? 'mt-10' : 'mt-8')}>{list.map(row)}</ul>
          : !isFaq && <Empty title={e.emptyCategory} />}
      </div>
    );
  } else {
    body = (
      <div className="grid gap-16">
        {featured[0] && (
          <section aria-labelledby="edu-featured">
            <h2 id="edu-featured" className="eyebrow text-stone-700">{e.featured}</h2>
            <div className="mt-5 grid gap-8 xl:grid-cols-2">
              <ArticleCard article={featured[0]} category={cat(featured[0].categoryId)} to={linkOf(featured[0])} size="lg" />
              <ul className="divide-y divide-ink/10 border-y rule xl:self-start">{featured.slice(1, 4).map(row)}</ul>
            </div>
          </section>
        )}
        {cats.map((c) => {
          const list = published.filter((a) => a.categoryId === c.id);
          const isFaq = c.id === 'cat-faq';
          return (
            <section key={c.id} aria-labelledby={`sec-${c.id}`}>
              <div className="flex items-end justify-between gap-6 border-b border-ink/30 pb-4">
                <div>
                  <p className="tech num text-brand">{`0${c.order}`}</p>
                  <h2 id={`sec-${c.id}`} className="display d3 mt-2">{L(c.title)}</h2>
                </div>
                <button type="button" onClick={() => set({ category: c.id })} className="group inline-flex shrink-0 items-center gap-2 pb-1 text-[0.86rem] font-semibold hover:text-brand">
                  {t.a.seeAll} <Fwd size={15} />
                </button>
              </div>
              <p className="mt-4 max-w-xl text-[0.95rem] text-stone-700">{L(c.description)}</p>
              {isFaq
                ? <div className="mt-5"><FaqList items={FAQ.slice(0, 4)} initialOpen={false} /></div>
                : list.length > 0 ? <ul className="mt-3 divide-y divide-ink/10">{list.map(row)}</ul> : <p className="mt-5 text-[0.9rem] text-stone-700">{e.emptyCategory}</p>}
            </section>
          );
        })}
      </div>
    );
  }

  const catNav = (
    <nav aria-label={e.categories}>
      <p className="eyebrow hidden text-stone-700 lg:block">{e.categories}</p>
      <ul className={cn('no-scrollbar flex gap-2 overflow-x-auto lg:mx-0 lg:mt-4 lg:block lg:border-t lg:px-0 rule', mode === 'public' ? '-mx-5 px-5' : '-mx-4 px-4 sm:-mx-6 sm:px-6')}>
        {[{ id: '', order: 0, title: e.all }, ...cats.map((c) => ({ id: c.id, order: c.order, title: L(c.title) }))].map((c) => {
          const on = !q && catId === c.id;
          return (
            <li key={c.id || 'all'} className="shrink-0 lg:border-b rule">
              <button type="button" onClick={() => setParams(c.id ? { category: c.id } : {}, { replace: true })} aria-current={on ? 'true' : undefined}
                className={cn(
                  'flex h-10 items-center gap-3 whitespace-nowrap rounded-full px-4 text-[0.86rem] font-semibold transition-colors lg:h-auto lg:w-full lg:whitespace-normal lg:rounded-none lg:px-0 lg:py-3 lg:text-start lg:text-[0.93rem]',
                  on ? 'bg-aubergine text-ivory lg:bg-transparent lg:text-brand' : 'bg-white/70 text-stone-800 ring-1 ring-inset ring-ink/10 hover:text-brand lg:bg-transparent lg:ring-0',
                )}>
                <span className="tech num hidden lg:inline">{c.order ? `0${c.order}` : '—'}</span>
                <span className="flex-1">{c.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {mode === 'public' ? (
        <section className="relative isolate overflow-hidden bg-aubergine text-ivory">
          <Topo seed={44} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" />
          <div className="page pb-12 pt-28 xl:pb-14 xl:pt-40">
            <p className="eyebrow text-metal-300">{e.guide}</p>
            <h1 className="display d2 mt-5">{t.pub.education.title}</h1>
            <p className="mt-5 max-w-2xl text-[1.05rem] text-ivory/70">{e.publicLead}</p>
            <div className="mt-9">{searchBox(true)}</div>
          </div>
        </section>
      ) : (
        <header className="pb-6">
          <h1 className="display d3">{e.center}</h1>
          <p className="mt-2 max-w-xl text-[0.95rem] text-stone-700">{e.centerLead}</p>
          <div className="mt-5">{searchBox(false)}</div>
        </header>
      )}

      <div className={mode === 'public' ? 'bg-ivory py-10 lg:py-16' : ''}>
        <div className={cn(mode === 'public' && 'page', 'grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14')}>
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">{catNav}</div>
          <div className="min-w-0">
            {body}
            <Notice className="mt-14">{t.note.sample} {t.note.advice}</Notice>
            {mode === 'public' && (
              <p className="mt-6 text-[0.86rem] text-stone-700">
                <Link to="/login/patient" className="font-semibold text-brand underline-offset-4 hover:underline">{t.pub.nav.patientLogin}</Link>
                <span className="mx-2" aria-hidden="true">·</span>{e.lockedBody}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
