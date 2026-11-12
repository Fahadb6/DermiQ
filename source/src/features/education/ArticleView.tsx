import { Link, useParams } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { fmtDate, minutesRead } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Badge, Empty, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Bwd } from '@/components/ui/icons';
import { Topo } from '@/components/brand/Brand';
import { ArticleBody } from './ArticleBody';
import { ArticleCard } from './ArticleCard';
import { eduBase, type EduMode } from './EducationIndex';

export function ArticleView({ mode }: { mode: EduMode }) {
  const { slug } = useParams();
  const { t, L, lang } = useI18n();
  const e = t.edu;
  const base = eduBase(mode);
  const articles = useDb((s) => s.db.articles);
  const categories = useDb((s) => s.db.categories);
  const article = articles.find((a) => a.slug === slug);
  const pub = mode === 'public';
  const back = (
    <Link to={base} className={cn('inline-flex items-center gap-2 text-[0.86rem] font-semibold', pub ? 'text-ivory/75 hover:text-ivory' : 'text-brand')}>
      <Bwd size={16} /> {pub ? e.backGuide : e.backCenter}
    </Link>
  );

  const shell = (head: React.ReactNode, body: React.ReactNode) => pub ? (
    <>
      <section className="relative isolate overflow-hidden bg-aubergine text-ivory">
        <Topo seed={47} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" />
        <div className="page pb-12 pt-28 xl:pb-16 xl:pt-40"><div className="mx-auto max-w-read">{head}</div></div>
      </section>
      <div className="bg-ivory py-12 lg:py-16"><div className="page"><div className="mx-auto max-w-read">{body}</div></div></div>
    </>
  ) : (
    <div className="mx-auto max-w-read"><header className="border-b rule pb-8">{head}</header><div className="pt-8">{body}</div></div>
  );

  if (!article || article.status !== 'published') {
    return shell(back, <Empty title={e.notFound} body={e.notFoundBody} action={<Button to={base} variant="outline" size="sm">{e.browse}</Button>} />);
  }
  if (pub && article.access === 'patient') {
    return shell(
      <>{back}<h1 className="display d2 mt-8">{L(article.title)}</h1><p className="mt-5 text-[1.05rem] text-ivory/70">{L(article.summary)}</p></>,
      <div className="rounded-[1.5rem] bg-lavender-100 p-8 text-center">
        <LockKeyhole size={26} className="mx-auto text-brand" aria-hidden="true" />
        <p className="display d4 mt-4">{e.lockedTitle}</p>
        <p className="mt-2 text-stone-800">{e.lockedBody}</p>
        <Button to="/login/patient" className="mt-6">{e.signInToRead}</Button>
      </div>,
    );
  }

  const category = categories.find((c) => c.id === article.categoryId);
  const related = article.related
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a && a.status === 'published' && (!pub || a.access === 'public'))
    .slice(0, 3);

  const head = (
    <>
      {back}
      {category && <p className={cn('eyebrow mt-8', pub ? 'text-metal-300' : 'text-brand')}>{L(category.title)}</p>}
      <h1 className={cn('display mt-4', pub ? 'd2' : 'd3')}>{L(article.title)}</h1>
      <p className={cn('mt-5 text-[1.08rem] leading-relaxed', pub ? 'text-ivory/70' : 'text-stone-800')}>{L(article.summary)}</p>
      <dl className={cn('mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[0.84rem]', pub ? 'text-ivory/60' : 'text-stone-700')}>
        <div><dt className="sr-only">{t.terms.time}</dt><dd>{minutesRead(article.readMinutes, lang)}</dd></div>
        <div className="flex gap-2"><dt>{e.lastUpdated}</dt><dd className={cn('font-semibold', pub ? 'text-ivory' : 'text-ink')}>{fmtDate(article.updatedAt, lang, 'long')}</dd></div>
        <div className="flex items-center gap-2"><dt>{e.reviewStatus}</dt><dd><Badge tone={pub ? 'light' : 'ok'} dot>{t.article[article.status]}</Badge></dd></div>
      </dl>
    </>
  );

  const body = (
    <article>
      {article.sample && <Notice tone="warn" className="mb-9" title={t.tag.sample}>{t.note.sample}</Notice>}
      <ArticleBody body={L(article.body)} />
      <footer className="mt-12 border-t rule pt-6">
        <dl className="grid gap-4 text-[0.86rem] sm:grid-cols-3">
          <div><dt className="text-stone-700">{e.author}</dt><dd className="mt-1 font-semibold">{L(article.author)}</dd></div>
          <div><dt className="text-stone-700">{e.reviewedBy}</dt><dd className="mt-1 font-semibold">{article.reviewer ? L(article.reviewer) : e.notReviewed}</dd></div>
          <div><dt className="text-stone-700">{e.reviewDate}</dt><dd className="mt-1 font-semibold">{fmtDate(article.reviewDate, lang, 'long')}</dd></div>
        </dl>
        <p className="mt-4 text-[0.78rem] text-stone-700">{e.demoReview}</p>
        <Notice className="mt-6">{t.note.advice}</Notice>
      </footer>
      {related.length > 0 && (
        <aside className="mt-14" aria-labelledby="related">
          <h2 id="related" className="eyebrow text-brand">{e.related}</h2>
          <ul className="mt-3 divide-y divide-ink/10 border-y rule">
            {related.map((a) => <li key={a.id}><ArticleCard article={a} to={`${base}/${a.slug}`} size="row" /></li>)}
          </ul>
        </aside>
      )}
    </article>
  );
  return shell(head, body);
}
