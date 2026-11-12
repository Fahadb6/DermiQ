import { Link } from 'react-router-dom';
import { cn } from '@/utils/misc';

/** Charts are plain HTML/CSS (no canvas), so they mirror correctly in RTL and every value is real, selectable text. */

export interface Segment { label: string; value: number; color: string }

export function Legend({ items, className }: { items: Array<{ label: string; color: string; value?: number | string }>; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-1.5 text-[0.78rem]', className)}>
      {items.map((s) => (
        <li key={s.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} aria-hidden="true" />
          <span className="text-stone-800">{s.label}</span>
          {s.value !== undefined && <span className="num font-bold">{s.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/** One horizontal bar split into parts. */
export function StackBar({ data, empty }: { data: Segment[]; empty: string }) {
  const total = data.reduce((n, s) => n + s.value, 0);
  if (!total) return <p className="text-[0.86rem] text-stone-700">{empty}</p>;
  return (
    <div>
      <div className="flex h-9 overflow-hidden rounded-md" aria-hidden="true">
        {data.filter((s) => s.value > 0).map((s) => (
          <span key={s.label} className="flex items-center justify-center border-e-2 border-white text-[0.74rem] font-bold text-white last:border-e-0" style={{ width: `${(s.value / total) * 100}%`, background: s.color }}>
            <span className="num">{s.value}</span>
          </span>
        ))}
      </div>
      <Legend className="mt-4" items={data.map((s) => ({ label: s.label, color: s.color, value: s.value }))} />
    </div>
  );
}

/** Stacked columns over a few categories. */
export function ColumnChart({ groups, series, empty, height = 150 }: { groups: Array<{ label: string; values: number[] }>; series: Array<{ label: string; color: string }>; empty: string; height?: number }) {
  const sums = groups.map((g) => g.values.reduce((a, b) => a + b, 0));
  const top = Math.max(...sums, 0);
  if (!top) return <p className="text-[0.86rem] text-stone-700">{empty}</p>;
  const max = top <= 4 ? 4 : Math.ceil(top / 2) * 2;
  const ticks = [max, max / 2, 0];
  return (
    <div>
      <Legend items={series} />
      <div className="mt-4 flex gap-3">
        <div className="flex flex-col justify-between pb-6 text-end text-[0.68rem] text-stone-700" style={{ height: height + 24 }} aria-hidden="true">
          {ticks.map((v) => <span key={v} className="num leading-none">{v}</span>)}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height }} aria-hidden="true">
            {ticks.map((v) => <span key={v} className="block border-t border-ink/10" />)}
          </div>
          <ul className="relative flex items-end gap-2">
            {groups.map((g, gi) => (
              <li key={g.label + gi} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full max-w-[3.25rem] flex-col-reverse justify-start" style={{ height }}>
                  {g.values.map((v, si) => v > 0 && (
                    <span key={si} className="block w-full first:rounded-b-none last:rounded-t-[3px]" style={{ height: `${(v / max) * 100}%`, background: series[si].color }} aria-hidden="true" />
                  ))}
                </div>
                <span className="mt-2 block h-4 max-w-full truncate text-[0.66rem] text-stone-700">{g.label}</span>
                <span className="sr-only">{series.map((s, si) => `${s.label} ${g.values[si]}`).join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Labelled horizontal bars on a 0–100 scale. */
export function HBarList({ rows, empty }: { rows: Array<{ id: string; label: string; pct: number | null; display: string; to?: string }>; empty: string }) {
  if (!rows.length) return <p className="text-[0.86rem] text-stone-700">{empty}</p>;
  return (
    <ul className="grid gap-3.5">
      {rows.map((r) => (
        <li key={r.id}>
          <div className="flex items-baseline justify-between gap-4 text-[0.84rem]">
            {r.to ? <Link to={r.to} className="truncate font-semibold underline-offset-4 hover:text-brand hover:underline">{r.label}</Link> : <span className="truncate font-semibold">{r.label}</span>}
            <span className={cn('num shrink-0', r.pct == null ? 'text-stone-700' : 'font-bold')}>{r.display}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]" aria-hidden="true">
            {r.pct != null && <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, r.pct))}%` }} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
