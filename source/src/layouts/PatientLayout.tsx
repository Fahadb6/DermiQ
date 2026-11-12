import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, BookOpen, CalendarCheck, ClipboardList, Home, Images, LogOut, Settings } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useAuth } from '@/services/auth';
import { useDb } from '@/services/db';
import { storageStatus } from '@/services/storage';
import { cn } from '@/utils/misc';
import { Wordmark } from '@/components/brand/Brand';
import { Avatar, LangSwitch, Ltr, Notice } from '@/components/ui/Bits';
import { Toaster } from '@/components/ui/Toast';
import { useMyNotifications } from '@/components/domain/Notifications';

export function PatientLayout() {
  const { t, L } = useI18n();
  const n = t.pt.nav;
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const patient = useDb((s) => s.db.patients.find((p) => p.id === session?.profileId));
  const unread = useMyNotifications().filter((x) => !x.read).length;
  const { pathname } = useLocation();
  if (!patient) return null;
  const immersive = pathname.startsWith('/patient/walkthrough');

  const tabs = [
    { to: '/patient', end: true, icon: Home, label: n.home, long: n.home },
    { to: '/patient/plan', icon: ClipboardList, label: n.plan, long: n.planLong },
    { to: '/patient/sessions', icon: CalendarCheck, label: n.sessions, long: n.sessionsLong },
    { to: '/patient/progress', icon: Images, label: n.progress, long: n.progressLong },
    { to: '/patient/education', icon: BookOpen, label: n.education, long: n.educationLong },
  ];
  const extra = [
    { to: '/patient/reminders', icon: Bell, long: n.reminders, count: unread },
    { to: '/patient/settings', icon: Settings, long: n.settings, count: 0 },
  ];
  const railItem = ({ isActive }: { isActive: boolean }) => cn(
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.93rem] font-semibold transition-colors',
    isActive ? 'bg-aubergine text-ivory' : 'text-stone-800 hover:bg-ink/[0.05]',
  );

  return (
    <div className="min-h-dvh bg-porcelain text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">{t.a.skip}</a>

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-ink/10 bg-ivory px-4 py-6 lg:flex">
        <Link to="/patient" className="px-2" aria-label="DermiQ"><Wordmark /></Link>
        <p className="mt-1.5 px-2 text-[0.72rem] font-semibold text-stone-700">{n.appName}</p>
        <nav aria-label={n.main} className="mt-8 grid gap-1">
          {tabs.map((x) => <NavLink key={x.to} to={x.to} end={x.end} className={railItem}><x.icon size={18} aria-hidden="true" />{x.long}</NavLink>)}
          <div className="my-3 border-t rule" />
          {extra.map((x) => (
            <NavLink key={x.to} to={x.to} className={railItem}>
              <x.icon size={18} aria-hidden="true" /><span className="flex-1">{x.long}</span>
              {x.count > 0 && <span className="num rounded-full bg-brand px-2 py-0.5 text-[0.68rem] font-bold text-ivory">{x.count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="flex items-center gap-3 rounded-xl bg-porcelain p-3">
            <Avatar name={L(patient.name)} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.88rem] font-bold">{L(patient.name)}</p>
              <Ltr mono className="text-[0.68rem] text-stone-700">{patient.id}</Ltr>
            </div>
            <button type="button" onClick={logout} aria-label={t.a.signOut} title={t.a.signOut} className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-ink/[0.07]" data-testid="signout-rail">
              <LogOut size={17} className="flip-rtl" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 px-1 text-[0.68rem] leading-relaxed text-stone-700">{t.note.concept}</p>
        </div>
      </aside>

      <div className="lg:ps-64">
        {/* Top bar */}
        {!immersive && (
          <header className="sticky top-0 z-20 border-b border-ink/10 bg-porcelain/90 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
              <Link to="/patient" className="lg:hidden" aria-label="DermiQ"><Wordmark size="sm" /></Link>
              <p className="hidden text-[0.8rem] font-semibold text-stone-700 lg:block">{t.note.fictional}</p>
              <div className="flex items-center gap-1.5">
                <LangSwitch compact className="h-9" />
                <Link to="/patient/reminders" aria-label={unread ? `${n.reminders} — ${unread} ${t.notif.unread}` : n.reminders} className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/[0.06]" data-testid="bell">
                  <Bell size={19} aria-hidden="true" />
                  {unread > 0 && <span className="num absolute end-1 top-1 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-bold text-ivory">{unread}</span>}
                </Link>
                <Link to="/patient/settings" aria-label={n.settings} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/[0.06] lg:hidden"><Settings size={19} aria-hidden="true" /></Link>
              </div>
            </div>
          </header>
        )}

        <main id="main" className={cn('mx-auto w-full max-w-4xl px-4 sm:px-6', immersive ? 'py-0' : 'pb-28 pt-6 lg:pb-16 lg:pt-10')}>
          {!storageStatus.persistent && <Notice tone="warn" className="mb-5">{t.note.storageOff}</Notice>}
          <Outlet context={patient} />
          {!immersive && <p className="mt-12 text-center text-[0.72rem] text-stone-700 lg:hidden">{t.note.concept}</p>}
        </main>
      </div>

      {/* Mobile tabs */}
      {!immersive && (
        <nav aria-label={n.main} className="safe-b fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-ivory/95 backdrop-blur-md lg:hidden">
          <ul className="mx-auto grid max-w-lg grid-cols-5">
            {tabs.map((x) => (
              <li key={x.to}>
                <NavLink to={x.to} end={x.end} className={({ isActive }) => cn('relative flex h-[3.6rem] flex-col items-center justify-center gap-1 text-[0.66rem] font-semibold', isActive ? 'text-brand' : 'text-stone-700')}>
                  {({ isActive }) => (<>
                    {isActive && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brand" aria-hidden="true" />}
                    <x.icon size={20} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
                    {x.label}
                  </>)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <Toaster className={immersive ? '' : 'max-lg:bottom-20'} />
    </div>
  );
}
