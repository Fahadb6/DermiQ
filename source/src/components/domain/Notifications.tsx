import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Bell, CalendarClock, CircleCheckBig, CircleX, Eye, FileClock, Image, LockKeyhole, StickyNote, TriangleAlert } from 'lucide-react';
import type { Notification, NotificationKind } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { useAuth } from '@/services/auth';
import { fmtDate, fmtDateTime, relDay } from '@/utils/format';
import { cn } from '@/utils/misc';
import { Empty } from '@/components/ui/Bits';

const ICON: Record<NotificationKind, React.ElementType> = {
  plan_approved: BadgeCheck, plan_updated: BadgeCheck, plan_locked: LockKeyhole, plan_under_review: Eye,
  appointment_created: CalendarClock, appointment_updated: CalendarClock, appointment_cancelled: CircleX,
  session_reviewed: CircleCheckBig, photo_reviewed: Image, note_shared: StickyNote,
  session_reported: CircleCheckBig, session_missed: TriangleAlert, photo_uploaded: Image, plan_pending: FileClock, followup_due: TriangleAlert,
};

export function useNotificationText() {
  const { t, lang, L } = useI18n();
  const patients = useDb((s) => s.db.patients);
  return (n: Notification) => {
    const tpl = t.notif.kinds[n.kind];
    const params: Record<string, string> = {
      patient: L(patients.find((p) => p.id === n.patientId)?.name ?? ''),
      date: typeof n.params.at === 'string' ? fmtDateTime(n.params.at, lang) : '',
    };
    return { title: fmt(tpl.t, params), body: fmt(tpl.b, params) };
  };
}

/** Notifications addressed to the signed-in user, newest first. */
export function useMyNotifications(): Notification[] {
  const all = useDb((s) => s.db.notifications);
  const session = useAuth((s) => s.session);
  return useMemo(
    () => (session ? all.filter((n) => n.audience === session.role && n.recipientId === session.profileId).sort((a, b) => b.at.localeCompare(a.at)) : []),
    [all, session],
  );
}

/** Notification list shared by the patient app and the physician portal. */
export function NotificationList({ items, clinical, limit, onOpen }: { items: Notification[]; clinical?: boolean; limit?: number; onOpen?: () => void }) {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const markRead = useDb((s) => s.markRead);
  const text = useNotificationText();
  const list = limit ? items.slice(0, limit) : items;
  if (list.length === 0) return <Empty title={t.notif.empty} className="py-10" />;
  return (
    <ul className={cn('divide-y divide-ink/10', clinical ? 'border-y rule' : 'overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10')} data-testid="notification-list">
      {list.map((n) => {
        const Icon = ICON[n.kind] ?? Bell;
        const { title, body } = text(n);
        return (
          <li key={n.id} className={cn('group flex items-start gap-1', !n.read && 'bg-lavender-100/60')}>
            <button type="button" className="flex min-w-0 flex-1 items-start gap-3.5 px-4 py-4 text-start" onClick={() => { markRead(n.id); onOpen?.(); nav(n.link); }}>
              <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center', clinical ? 'rounded-md' : 'rounded-full', n.read ? 'bg-ink/[0.05] text-stone-700' : 'bg-brand text-ivory')}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className={cn('text-[0.93rem] leading-snug', n.read ? 'font-semibold' : 'font-bold')}>{title}</span>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"><span className="sr-only">{t.notif.unread}</span></span>}
                </span>
                <span className="mt-1 block text-[0.86rem] leading-relaxed text-stone-700">{body}</span>
                <span className="mt-1.5 block text-[0.75rem] text-stone-700">{fmtDate(n.at, lang, 'short')} · {relDay(n.at, lang)}</span>
              </span>
            </button>
            <button type="button" onClick={() => markRead(n.id, !n.read)} className="me-2 mt-3.5 hidden shrink-0 rounded-md px-2 py-1.5 text-[0.72rem] font-semibold text-stone-700 opacity-0 transition-opacity hover:bg-ink/[0.06] focus-visible:opacity-100 group-hover:opacity-100 md:block">
              {n.read ? t.a.markUnread : t.a.markRead}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
