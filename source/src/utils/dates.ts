/** Small date helpers (local time). No external dependency. */
export const DAY = 86_400_000;

export function startOfDay(d: Date | string): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
export function addDays(d: Date | string, n: number): Date {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
export function atTime(d: Date | string, h: number, m = 0): Date {
  const x = new Date(d); x.setHours(h, m, 0, 0); return x;
}
/** Whole-day difference between two dates (b - a), calendar based. */
export function dayDiff(a: Date | string, b: Date | string): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}
export function sameDay(a: Date | string, b: Date | string): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}
export function isPast(iso: string, now = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime();
}
export function beforeToday(iso: string, now = new Date()): boolean {
  return startOfDay(iso).getTime() < startOfDay(now).getTime();
}
/** yyyy-mm-dd for <input type="date"> (local). */
export function toDateInput(d: Date | string): string {
  const x = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
}
export function toTimeInput(d: Date | string): string {
  const x = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(x.getHours())}:${p(x.getMinutes())}`;
}
export function fromInputs(date: string, time = '09:00'): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}
/** Sunday-based start of week (Saudi working week starts on Sunday). */
export function startOfWeek(d: Date | string): Date {
  const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x;
}
export function startOfMonth(d: Date | string): Date {
  const x = startOfDay(d); x.setDate(1); return x;
}
