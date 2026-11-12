import { Link } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { upcomingAppointments } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { fmtDate, relDay } from '@/utils/format';
import { Badge, Empty, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { ApptTypeBadge, DateBlock } from '@/components/domain/Status';
import { NotificationList, useMyNotifications } from '@/components/domain/Notifications';
import { PageTitle, usePatient } from './ui';

export function PatientReminders() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const r = t.pt.reminders;
  const db = useDb((s) => s.db);
  const markAll = useDb((s) => s.markAllRead);
  const now = useNow();
  const upcoming = upcomingAppointments(db, patient.id, now);
  const items = useMyNotifications();
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageTitle title={r.title} lead={r.lead} />
      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="eyebrow mb-3 px-1 text-stone-700">{r.upcoming}</h2>
        {upcoming.length === 0 ? <Empty title={r.noUpcoming} body={r.noUpcomingBody} className="py-10" /> : (
          <ul className="grid gap-3" data-testid="upcoming-appointments">
            {upcoming.map((a, i) => (
              <li key={a.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-ink/10 sm:p-5">
                <DateBlock at={a.at} tone={i === 0 ? 'brand' : 'light'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><ApptTypeBadge type={a.type} />{i === 0 && <Badge tone="dark">{r.next}</Badge>}</div>
                  <p className="mt-2 font-bold">{fmtDate(a.at, lang, 'full')} · <span className="num">{fmtDate(a.at, lang, 'time')}</span></p>
                  <p className="mt-0.5 text-[0.86rem] text-stone-700">{relDay(a.at, lang, now)}</p>
                  {L(a.note) && <p className="mt-2 text-[0.9rem]">{L(a.note)}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 px-1 text-[0.8rem] text-stone-700">{r.setBy}</p>
      </section>

      <section aria-labelledby="notifications" className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
          <h2 id="notifications" className="eyebrow text-stone-700">{r.notifications}{unread > 0 && <span className="num ms-2 rounded-full bg-brand px-2 py-0.5 text-[0.68rem] text-ivory">{unread}</span>}</h2>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={unread === 0} icon={<CheckCheck size={16} aria-hidden="true" />} data-testid="mark-all-read">{t.a.markAllRead}</Button>
        </div>
        <NotificationList items={items} />
      </section>

      <Notice className="mt-8">{t.note.inApp} <Link to="/patient/settings" className="font-semibold text-brand underline-offset-4 hover:underline">{r.prefs}</Link></Notice>
    </>
  );
}
