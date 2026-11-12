import type { Lang } from '@/types';
import { dayDiff } from './dates';

/** Gregorian calendar + Latin digits in both languages, so IDs, doses and dates stay unambiguous. */
const LOCALE: Record<Lang, string> = { ar: 'ar-SA-u-ca-gregory-nu-latn', en: 'en-GB' };

type DateStyle = 'long' | 'medium' | 'short' | 'weekday' | 'weekdayLong' | 'time' | 'monthYear' | 'dayNum' | 'month' | 'full' | 'wd';

const OPTS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  short: { day: 'numeric', month: 'short' },
  weekday: { weekday: 'short', day: 'numeric', month: 'short' },
  weekdayLong: { weekday: 'long' },
  wd: { weekday: 'short' },
  time: { hour: 'numeric', minute: '2-digit', hour12: true },
  monthYear: { month: 'long', year: 'numeric' },
  dayNum: { day: 'numeric' },
  month: { month: 'long' },
};

const cache = new Map<string, Intl.DateTimeFormat>();
export function fmtDate(value: string | Date | null | undefined, lang: Lang, style: DateStyle = 'medium'): string {
  if (!value) return '—';
  const key = `${lang}:${style}`;
  let f = cache.get(key);
  if (!f) { f = new Intl.DateTimeFormat(LOCALE[lang], OPTS[style]); cache.set(key, f); }
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return f.format(d);
}
export function fmtDateTime(value: string | Date | null | undefined, lang: Lang): string {
  if (!value) return '—';
  return `${fmtDate(value, lang, 'medium')} · ${fmtDate(value, lang, 'time')}`;
}

export function fmtNum(n: number, lang: Lang, digits = 0): string {
  return new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}
export function fmtPct(n: number | null | undefined, _lang: Lang): string {
  if (n == null || Number.isNaN(n)) return '—';
  return `${Math.round(n)}%`;
}
/** Dose label. Illustrative prototype value — never a recommendation. */
export function fmtDose(ml: number | null | undefined, lang: Lang): string {
  if (ml == null) return '—';
  return `${ml.toFixed(1)} ${lang === 'ar' ? 'مل' : 'mL'}`;
}

/** Arabic count agreement for "day". */
export function dayUnit(n: number, lang: Lang): string {
  const a = Math.abs(n);
  if (lang === 'en') return a === 1 ? 'day' : 'days';
  if (a === 1) return 'يوم';
  if (a === 2) return 'يومان';
  if (a >= 3 && a <= 10) return 'أيام';
  return 'يومًا';
}

/** "in 5 days", "tomorrow", "3 days ago" … relative to today (calendar days). */
export function relDay(value: string | Date, lang: Lang, now: Date = new Date()): string {
  const n = dayDiff(now, value);
  if (lang === 'en') {
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n === -1) return 'yesterday';
    return n > 0 ? `in ${n} days` : `${-n} days ago`;
  }
  if (n === 0) return 'اليوم';
  if (n === 1) return 'غدًا';
  if (n === -1) return 'أمس';
  const a = Math.abs(n);
  const word = a === 2 ? 'يومين' : a <= 10 ? `${a} أيام` : `${a} يومًا`;
  return n > 0 ? `بعد ${word}` : `قبل ${word}`;
}

/** "every 28 days" */
export function everyDays(n: number | null | undefined, lang: Lang): string {
  if (n == null) return '—';
  if (lang === 'en') return n === 1 ? 'every day' : `every ${n} days`;
  if (n === 1) return 'كل يوم';
  if (n === 2) return 'كل يومين';
  return n <= 10 ? `كل ${n} أيام` : `كل ${n} يومًا`;
}

export function minutesRead(n: number, lang: Lang): string {
  if (lang === 'en') return `${n} min read`;
  if (n === 1) return 'دقيقة قراءة';
  if (n === 2) return 'دقيقتا قراءة';
  return n <= 10 ? `${n} دقائق قراءة` : `${n} دقيقة قراءة`;
}

export function ageFromYear(birthYear: number, now: Date = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function articlesCount(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 article' : `${n} articles`;
  if (n === 0) return 'لا مقالات';
  if (n === 1) return 'مقال واحد';
  if (n === 2) return 'مقالان';
  return n <= 10 ? `${n} مقالات` : `${n} مقالًا`;
}
export function questionsCount(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 question' : `${n} questions`;
  if (n === 0) return 'لا أسئلة';
  if (n === 1) return 'سؤال واحد';
  if (n === 2) return 'سؤالان';
  return n <= 10 ? `${n} أسئلة` : `${n} سؤالًا`;
}
export function sessionsCount(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 session' : `${n} sessions`;
  if (n === 0) return 'لا جلسات';
  if (n === 1) return 'جلسة واحدة';
  if (n === 2) return 'جلستان';
  return n <= 10 ? `${n} جلسات` : `${n} جلسة`;
}
export function photosCount(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 photo' : `${n} photos`;
  if (n === 0) return 'لا صور';
  if (n === 1) return 'صورة واحدة';
  if (n === 2) return 'صورتان';
  return n <= 10 ? `${n} صور` : `${n} صورة`;
}
export function patientsCount(n: number, lang: Lang): string {
  if (lang === 'en') return n === 1 ? '1 patient' : `${n} patients`;
  if (n === 0) return 'لا مرضى';
  if (n === 1) return 'مريض واحد';
  if (n === 2) return 'مريضان';
  return n <= 10 ? `${n} مرضى` : `${n} مريضًا`;
}
