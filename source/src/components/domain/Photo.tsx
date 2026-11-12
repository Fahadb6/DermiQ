import { useEffect, useMemo, useState } from 'react';
import type { ProgressPhoto } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { photoUrl } from '@/services/selectors';
import { dayDiff } from '@/utils/dates';
import { dayUnit, fmtDate } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Notice } from '@/components/ui/Bits';

export function PhotoThumb({ photo, className, tag = true, square }: { photo: ProgressPhoto; className?: string; tag?: boolean; square?: boolean }) {
  const { t, lang } = useI18n();
  return (
    <span className={cn('relative block aspect-square overflow-hidden bg-stone-200', square ? 'rounded-md' : 'rounded-xl', className)}>
      <img src={photoUrl(photo.src)} alt={fmt(t.pt.progress.photoOf, { date: fmtDate(photo.takenAt, lang, 'long') })} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      {tag && (
        <span className="absolute bottom-1.5 start-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-[0.6rem] font-semibold text-ivory backdrop-blur-sm">
          {photo.origin === 'demo' ? t.tag.synthetic : t.pt.progress.uploaded}
        </span>
      )}
    </span>
  );
}

/** Two dated photos side by side. Presentation only — nothing is measured or analysed. */
export function PhotoCompare({ photos, square }: { photos: ProgressPhoto[]; square?: boolean }) {
  const { t, lang } = useI18n();
  const p = t.pt.progress;
  const sorted = useMemo(() => [...photos].sort((a, b) => a.takenAt.localeCompare(b.takenAt)), [photos]);
  const [a, setA] = useState(sorted[0]?.id ?? '');
  const [b, setB] = useState(sorted[sorted.length - 1]?.id ?? '');
  useEffect(() => {
    if (!sorted.some((x) => x.id === a)) setA(sorted[0]?.id ?? '');
    if (!sorted.some((x) => x.id === b)) setB(sorted[sorted.length - 1]?.id ?? '');
  }, [sorted, a, b]);
  if (sorted.length < 2) return <Notice>{p.needTwo}</Notice>;
  const pa = sorted.find((x) => x.id === a) ?? sorted[0];
  const pb = sorted.find((x) => x.id === b) ?? sorted[sorted.length - 1];
  const days = Math.abs(dayDiff(pa.takenAt, pb.takenAt));
  const pane = (label: string, photo: ProgressPhoto, value: string, set: (v: string) => void, testid: string) => (
    <div className="min-w-0">
      <label className="block">
        <span className="eyebrow text-stone-700">{label}</span>
        <select value={value} onChange={(e) => set(e.target.value)} className={cn('field mt-2 h-11', square && '!rounded-md')} data-testid={testid}>
          {sorted.map((x) => <option key={x.id} value={x.id}>{fmtDate(x.takenAt, lang, 'long')}</option>)}
        </select>
      </label>
      <figure className="mt-3">
        <PhotoThumb photo={photo} square={square} />
        <figcaption className="mt-2 text-[0.82rem] text-stone-700"><span className="num font-bold text-ink">{fmtDate(photo.takenAt, lang, 'long')}</span></figcaption>
      </figure>
    </div>
  );
  return (
    <div data-testid="photo-compare">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {pane(p.before, pa, pa.id, setA, 'compare-a')}
        {pane(p.after, pb, pb.id, setB, 'compare-b')}
      </div>
      <p className="mt-4 text-center text-[0.86rem] font-semibold text-stone-800">{fmt(p.daysBetween, { n: `${days} ${dayUnit(days, lang)}` })}</p>
      <Notice className="mt-4">{t.note.photos}</Notice>
    </div>
  );
}
