import { useId } from 'react';
import { Languages, Info, TriangleAlert } from 'lucide-react';
import { cn, hashString } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { NineDot } from '@/components/brand/Brand';
import { ChevBwd, ChevFwd } from './icons';

/* ---------------- Badge ---------------- */
export type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad' | 'dark' | 'outline' | 'metal' | 'light';
const TONE: Record<Tone, string> = {
  neutral: 'bg-stone-200 text-stone-800',
  brand: 'bg-lavender-200 text-brand-800',
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
  dark: 'bg-aubergine text-ivory',
  outline: 'border border-ink/20 text-stone-800',
  metal: 'bg-metal/15 text-metal-700',
  light: 'bg-ivory/10 text-ivory border border-ivory/20',
};
export function Badge({ tone = 'neutral', children, className, dot, icon }: { tone?: Tone; children: React.ReactNode; className?: string; dot?: boolean; icon?: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[0.2rem] text-[0.74rem] font-semibold leading-5', TONE[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}

/* ---------------- Inline note (prototype labels, disclaimers) ---------------- */
export function Notice({ tone = 'neutral', title, children, className, icon, ...rest }: { tone?: 'neutral' | 'warn' | 'brand' | 'dark'; title?: string; children: React.ReactNode; className?: string; icon?: React.ReactNode } & Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'className'>) {
  const cls = {
    neutral: 'border-ink/10 bg-ink/[0.025] text-stone-800',
    warn: 'border-warn/25 bg-warn-bg/60 text-ink',
    brand: 'border-brand/15 bg-lavender-100 text-ink',
    dark: 'border-ivory/15 bg-ivory/[0.05] text-ivory/85',
  }[tone];
  return (
    <div {...rest} className={cn('flex gap-3 rounded-xl border px-4 py-3 text-[0.84rem] leading-relaxed', cls, className)}>
      <span className={cn('mt-[0.15rem] shrink-0', tone === 'warn' ? 'text-warn' : tone === 'brand' ? 'text-brand' : 'opacity-60')}>
        {icon ?? (tone === 'warn' ? <TriangleAlert size={16} aria-hidden="true" /> : <Info size={16} aria-hidden="true" />)}
      </span>
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Language switch ---------------- */
export function LangSwitch({ tone = 'dark', className, compact }: { tone?: 'dark' | 'light'; className?: string; compact?: boolean }) {
  const { t, toggle, lang } = useI18n();
  return (
    <button
      type="button" onClick={toggle} aria-label={t.lang.toggleAria} lang={lang === 'ar' ? 'en' : 'ar'} data-testid="lang-switch"
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[0.85rem] font-semibold transition-colors',
        tone === 'dark' ? 'border-ink/15 text-ink hover:border-ink/40' : 'border-ivory/25 text-ivory hover:border-ivory/60',
        className,
      )}
    >
      <Languages size={16} aria-hidden="true" />
      {!compact && <span>{t.lang.toggle}</span>}
      {compact && <span className="keep-tracking">{lang === 'ar' ? 'EN' : 'ع'}</span>}
    </button>
  );
}

/* ---------------- Form field ---------------- */
export function Field({ label, hint, error, optional, children, className }: { label: string; hint?: string; error?: string | null; optional?: boolean; children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode; className?: string }) {
  const { t } = useI18n();
  const id = useId();
  const hintId = `${id}-h`;
  const errId = `${id}-e`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.84rem] font-semibold text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-stone-700">{t.tag.optional}</span>}
      </label>
      {children({ id, describedBy: error ? errId : hint ? hintId : undefined, invalid: !!error })}
      {error ? <p id={errId} role="alert" className="mt-1.5 text-[0.8rem] font-medium text-bad">{error}</p> : hint ? <p id={hintId} className="mt-1.5 text-[0.8rem] text-stone-700">{hint}</p> : null}
    </div>
  );
}

/* ---------------- Switch ---------------- */
export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={id} className="text-[0.93rem] font-semibold">{label}</p>
        {description && <p className="mt-0.5 text-[0.82rem] text-stone-700">{description}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-labelledby={id} disabled={disabled} onClick={() => onChange(!checked)}
        className={cn('mt-0.5 flex h-7 w-12 shrink-0 items-center rounded-full p-[3px] transition-colors disabled:opacity-40', checked ? 'bg-brand' : 'bg-stone-300')}
      >
        <span className={cn('h-[1.375rem] w-[1.375rem] rounded-full bg-white shadow transition-[margin] duration-200', checked ? 'ms-5' : 'ms-0')} />
      </button>
    </div>
  );
}

/* ---------------- Segmented filter ---------------- */
export function Segmented<T extends string>({ value, onChange, options, label, tone = 'light', size = 'md', className }: {
  value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string; count?: number }>; label: string; tone?: 'light' | 'clinical'; size?: 'sm' | 'md'; className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold transition-colors',
              size === 'sm' ? 'h-8 px-3 text-[0.8rem]' : 'h-10 px-4 text-[0.86rem]',
              tone === 'clinical' ? 'rounded-md' : 'rounded-full',
              on ? 'bg-aubergine text-ivory' : tone === 'clinical' ? 'bg-white text-stone-800 ring-1 ring-inset ring-ink/10 hover:ring-ink/30' : 'bg-white/70 text-stone-800 ring-1 ring-inset ring-ink/10 hover:ring-ink/30',
            )}
          >
            {o.label}
            {o.count != null && <span className={cn('num rounded-full px-1.5 text-[0.7rem] leading-5', on ? 'bg-ivory/15' : 'bg-ink/[0.07]')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function Empty({ title, body, action, className, tone = 'light' }: { title: string; body?: string; action?: React.ReactNode; className?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <NineDot size={34} className={tone === 'light' ? 'text-stone-300' : 'text-ivory/25'} accent={tone === 'light' ? '#C9B5E2' : '#B59A78'} />
      <p className="mt-5 text-base font-bold">{title}</p>
      {body && <p className={cn('mt-1.5 max-w-sm text-sm', tone === 'light' ? 'text-stone-700' : 'text-ivory/65')}>{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Pagination ---------------- */
export function Pagination({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  const { t } = useI18n();
  if (pages <= 1) return <p className="text-[0.8rem] text-stone-700"><span className="num">{total}</span> {t.terms.results}</p>;
  return (
    <nav aria-label={t.terms.page} className="flex items-center justify-between gap-4">
      <p className="text-[0.8rem] text-stone-700"><span className="num">{total}</span> {t.terms.results}</p>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label={t.a.prev} className="inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-inset ring-ink/15 hover:bg-ink/[0.04] disabled:opacity-35"><ChevBwd size={16} /></button>
        <span className="num px-2 text-[0.82rem] font-semibold" aria-current="page">{t.terms.page} {page} {t.terms.of} {pages}</span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label={t.a.next} className="inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 ring-inset ring-ink/15 hover:bg-ink/[0.04] disabled:opacity-35"><ChevFwd size={16} /></button>
      </div>
    </nav>
  );
}

/* ---------------- Monogram avatar (no photos of people anywhere) ---------------- */
const AVATAR = ['bg-lavender text-brand-800', 'bg-porcelain-300 text-ink', 'bg-aubergine-600 text-ivory', 'bg-metal-300 text-ink', 'bg-brand-200 text-brand-800', 'bg-stone-300 text-ink'];
export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const clean = name.replace(/^(Dr\.|د\.)\s*/u, '').trim();
  const parts = clean.split(/\s+/);
  const isArabic = /[\u0600-\u06FF]/.test(clean);
  const initials = isArabic ? (parts[0]?.[0] ?? '') : `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return (
    <span aria-hidden="true" style={{ width: size, height: size, fontSize: size * (isArabic ? 0.42 : 0.36) }}
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold leading-none', AVATAR[hashString(clean) % AVATAR.length], className)}>
      {initials}
    </span>
  );
}

/** Keeps IDs, emails and phone numbers readable inside right-to-left text. */
export function Ltr({ children, className, mono }: { children: React.ReactNode; className?: string; mono?: boolean }) {
  return <bdi dir="ltr" className={cn('ltr num', mono && 'font-mono text-[0.92em]', className)}>{children}</bdi>;
}
