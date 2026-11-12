import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import type { EducationalArticle, EducationalCategory } from '@/types';
import { cn, hashString } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { fmtDate, minutesRead } from '@/utils/format';
import { ArticleArt } from './ArticleArt';

export function ArticleCard({ article, category, to, size = 'md', locked, className }: {
  article: EducationalArticle; category?: EducationalCategory; to: string; size?: 'lg' | 'md' | 'row'; locked?: boolean; className?: string;
}) {
  const { L, lang, t } = useI18n();
  const meta = (
    <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] text-stone-700">
      <span>{minutesRead(article.readMinutes, lang)}</span>
      <span aria-hidden="true">·</span>
      <span>{fmtDate(article.updatedAt, lang, 'medium')}</span>
      {locked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-2 py-0.5 font-semibold text-stone-800">
          <LockKeyhole size={11} aria-hidden="true" /> {t.edu.patientOnly}
        </span>
      )}
    </p>
  );
  if (size === 'row') {
    return (
      <Link to={to} className={cn('group grid grid-cols-[5.5rem_1fr] items-center gap-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6', className)}>
        <div className="aspect-[4/3] overflow-hidden rounded-xl"><ArticleArt art={article.art} seed={hashString(article.id) % 50} /></div>
        <div className="min-w-0">
          {category && <p className="eyebrow text-brand">{L(category.title)}</p>}
          <h3 className="mt-1 text-[1.08rem] font-bold leading-snug transition-colors group-hover:text-brand">{L(article.title)}</h3>
          <p className="mt-1 line-clamp-2 text-[0.9rem] text-stone-700">{L(article.summary)}</p>
          {meta}
        </div>
      </Link>
    );
  }
  return (
    <Link to={to} className={cn('group block', className)}>
      <div className={cn('overflow-hidden rounded-[1.25rem]', size === 'lg' ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
        <div className="h-full w-full transition-transform duration-700 ease-precise group-hover:scale-[1.03]">
          <ArticleArt art={article.art} seed={hashString(article.id) % 50} />
        </div>
      </div>
      <div className="mt-5">
        {category && <p className="eyebrow text-brand">{L(category.title)}</p>}
        <h3 className={cn('display mt-2 transition-colors group-hover:text-brand', size === 'lg' ? 'd3' : 'd4')}>{L(article.title)}</h3>
        {size === 'lg' && <p className="mt-3 max-w-xl text-stone-800">{L(article.summary)}</p>}
        {meta}
      </div>
    </Link>
  );
}
