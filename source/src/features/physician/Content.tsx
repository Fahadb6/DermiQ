import { Fragment, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { ArticleStatus } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { allowedArticleTransitions, useDb } from '@/services/db';
import { fmtDate, fmtDateTime } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Badge, Empty, Field, Ltr, Notice, Segmented } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useNotify } from '@/components/ui/Toast';
import { ChevFwd } from '@/components/ui/icons';
import { ArticlePill } from '@/components/domain/Status';
import { ArticleBody } from '@/features/education/ArticleBody';
import { PageHead, TD, TH, usePhysician } from './ui';

const FLOW: ArticleStatus[] = ['draft', 'pending_review', 'approved', 'published', 'archived'];
type Filter = 'all' | ArticleStatus;

export function ContentPage() {
  const me = usePhysician();
  const { t, L, lang } = useI18n();
  const c = t.ph.content;
  const db = useDb((s) => s.db);
  const transition = useDb((s) => s.transitionArticle);
  const notify = useNotify();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteErr, setNoteErr] = useState('');
  const articles = useMemo(() => [...db.articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [db.articles]);
  const shown = filter === 'all' ? articles : articles.filter((a) => a.status === filter);
  const current = articles.find((a) => a.id === openId) ?? null;
  const history = current ? db.articleReviews.filter((r) => r.articleId === current.id).sort((a, b) => b.at.localeCompare(a.at)) : [];
  const cat = (id: string) => L(db.categories.find((x) => x.id === id)?.title);
  useEffect(() => { setNote(''); setNoteErr(''); }, [openId]);

  const go = (to: ArticleStatus) => {
    if (!current) return;
    if (!note.trim()) { setNoteErr(c.noteRequired); return; }
    if (notify.result(transition(current.id, to, note.trim()), fmt(c.done, { status: t.article[to] }))) { setNote(''); setNoteErr(''); }
  };

  return (
    <>
      <PageHead title={c.title} lead={c.lead} />
      <ol className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.8rem] font-semibold" aria-label={c.workflow}>
        {FLOW.map((s, i) => (
          <Fragment key={s}>
            <li className="rounded border border-ink/15 bg-white px-2.5 py-1.5"><span className="num me-1.5 text-stone-700">{i + 1}</span>{c.flow[i]}</li>
            {i < FLOW.length - 1 && <li aria-hidden="true" className="text-stone-700"><ChevFwd size={14} /></li>}
          </Fragment>
        ))}
      </ol>
      <Notice tone="warn" className="mb-6">{c.demoReviewer}</Notice>

      <Segmented<Filter> tone="clinical" label={c.filterLabel} value={filter} onChange={setFilter}
        options={[{ value: 'all' as Filter, label: c.all, count: articles.length }, ...FLOW.map((s) => ({ value: s as Filter, label: t.article[s], count: articles.filter((a) => a.status === s).length }))]} />

      {shown.length === 0 ? <Empty title={t.edu.emptyCategory} /> : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-ink/[0.13] bg-white">
          <table className="w-full min-w-[52rem] border-collapse" data-testid="content-table">
            <thead><tr className="border-b border-ink/15 bg-porcelain/60">
              <th scope="col" className={TH}>{c.col.title}</th><th scope="col" className={TH}>{c.col.status}</th><th scope="col" className={TH}>{c.col.access}</th>
              <th scope="col" className={TH}>{c.col.reviewer}</th><th scope="col" className={TH}>{c.col.reviewDate}</th><th scope="col" className={TH}>{c.col.updated}</th><th scope="col" className={TH}><span className="sr-only">{t.a.open}</span></th>
            </tr></thead>
            <tbody className="divide-y divide-ink/10">
              {shown.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-lavender-100/50" data-testid={`article-${a.slug}`} data-status={a.status}>
                  <td className={cn(TD, 'max-w-[22rem]')}>
                    <button type="button" onClick={() => setOpenId(a.id)} className="block text-start font-bold underline-offset-4 hover:text-brand hover:underline">{L(a.title)}</button>
                    <span className="mt-0.5 block text-[0.76rem] text-stone-700">{cat(a.categoryId)}</span>
                  </td>
                  <td className={TD}><ArticlePill status={a.status} /></td>
                  <td className={cn(TD, 'whitespace-nowrap text-[0.84rem]')}>{c.access[a.access]}</td>
                  <td className={cn(TD, 'text-[0.84rem]')}>{a.reviewer ? L(a.reviewer) : <span className="text-stone-700">{c.notReviewed}</span>}</td>
                  <td className={cn(TD, 'num whitespace-nowrap text-[0.84rem]')}>{fmtDate(a.reviewDate, lang, 'medium')}</td>
                  <td className={cn(TD, 'num whitespace-nowrap text-[0.84rem]')}>{fmtDate(a.updatedAt, lang, 'medium')}</td>
                  <td className={TD}><Button size="sm" square variant="outline" onClick={() => setOpenId(a.id)} data-testid="open-article">{t.a.open}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!current} onClose={() => setOpenId(null)} title={current ? L(current.title) : ''} size="xl" square footer={<Button square variant="outline" onClick={() => setOpenId(null)}>{t.a.close}</Button>}>
        {current && (
          <div className="grid gap-7">
            <section className="rounded-md border border-ink/15 bg-porcelain/50 p-4" aria-labelledby="wf">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h3 id="wf" className="text-[0.9rem] font-bold">{c.workflow}</h3>
                <ArticlePill status={current.status} />
                <span className={cn('inline-flex items-center gap-1.5 text-[0.8rem] font-semibold', current.status === 'published' ? 'text-ok' : 'text-stone-700')} data-testid="article-visibility">
                  {current.status === 'published' ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}{current.status === 'published' ? c.visible : c.hidden}
                </span>
                <span className="text-[0.8rem] text-stone-700">{c.access[current.access]}</span>
              </div>
              {me.canReviewContent ? (
                <div className="mt-4 grid gap-3">
                  <Field label={c.note} error={noteErr}>
                    {(f) => <input id={f.id} className="field h-11 !rounded-md" placeholder={c.notePh} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} aria-invalid={f.invalid} aria-describedby={f.describedBy} data-testid="article-note" />}
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    {allowedArticleTransitions(current.status).map((to, i) => (
                      <Button key={to} square size="sm" variant={i === 0 ? 'primary' : 'outline'} onClick={() => go(to)} data-testid={`to-${to}`}>{c.to[to]}</Button>
                    ))}
                  </div>
                </div>
              ) : <Notice className="mt-4">{c.noPermission}</Notice>}
            </section>

            <section aria-labelledby="pv">
              <h3 id="pv" className="text-[0.9rem] font-bold">{c.preview}</h3>
              <div className="mt-3 grid gap-5 lg:grid-cols-2">
                {(['ar', 'en'] as const).map((l) => (
                  <div key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'} className="rounded-md border border-ink/15 bg-white p-5">
                    <p className="text-[0.72rem] font-semibold text-brand">{l === 'ar' ? c.arabic : c.english}</p>
                    <h4 className="display d4 mt-2">{current.title[l]}</h4>
                    <p className="mt-2 text-[0.92rem] text-stone-800">{current.summary[l]}</p>
                    <div className="mt-4 border-t border-ink/10 pt-4 text-[0.92rem]"><ArticleBody body={current.body[l]} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="hs">
              <h3 id="hs" className="text-[0.9rem] font-bold">{c.history}</h3>
              <dl className="mt-3 grid gap-x-10 border-y border-ink/10 text-[0.86rem] sm:grid-cols-3">
                <div className="flex justify-between gap-4 py-2.5 sm:block"><dt className="text-stone-700">{c.author}</dt><dd className="font-semibold">{L(current.author)}</dd></div>
                <div className="flex justify-between gap-4 py-2.5 sm:block"><dt className="text-stone-700">{c.col.reviewer}</dt><dd className="font-semibold">{current.reviewer ? L(current.reviewer) : c.notReviewed}</dd></div>
                <div className="flex justify-between gap-4 py-2.5 sm:block"><dt className="text-stone-700">{c.col.reviewDate}</dt><dd className="num font-semibold">{fmtDate(current.reviewDate, lang, 'medium')}</dd></div>
              </dl>
              {history.length === 0 ? <p className="mt-3 text-[0.86rem] text-stone-700">{c.noHistory}</p> : (
                <ol className="mt-3 grid gap-3" data-testid="article-history">
                  {history.map((r) => (
                    <li key={r.id} className="border-s-2 border-ink/20 ps-4 text-[0.86rem]">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {r.from ? <><Badge tone="neutral">{t.article[r.from]}</Badge><ChevFwd size={13} /></> : <span className="text-stone-700">{c.start}</span>}
                        <Badge tone="brand">{t.article[r.to]}</Badge>
                      </p>
                      <p className="mt-1 text-stone-700">{L(r.by)} · <span className="num">{fmtDateTime(r.at, lang)}</span></p>
                      {L(r.note) && <p className="mt-1">{L(r.note)}</p>}
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-4 text-[0.76rem] text-stone-700"><Ltr mono>{current.slug}</Ltr> · {t.note.sample}</p>
            </section>
          </div>
        )}
      </Modal>
    </>
  );
}
