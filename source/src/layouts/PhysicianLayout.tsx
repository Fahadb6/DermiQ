import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, CalendarClock, ClipboardCheck, Images, LayoutDashboard, Library, LogOut, Menu, Settings, Users, X } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useAuth } from '@/services/auth';
import { useDb } from '@/services/db';
import { storageStatus } from '@/services/storage';
import { cn } from '@/utils/misc';
import { Wordmark } from '@/components/brand/Brand';
import { Avatar, Badge, LangSwitch, Notice } from '@/components/ui/Bits';
import { Toaster } from '@/components/ui/Toast';
import { useMyNotifications } from '@/components/domain/Notifications';

export function PhysicianLayout() {
  const { t, L } = useI18n();
  const n = t.ph.nav;
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const physician = useDb((s) => s.db.physicians.find((p) => p.id === session?.profileId));
  const toReview = useDb((s) => s.db.sessions.filter((x) => x.status === 'reported' && x.review !== 'reviewed').length);
  const photos = useDb((s) => s.db.photos.filter((x) => x.review === 'pending').length);
  const unread = useMyNotifications().filter((x) => !x.read).length;
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  if (!physician) return null;

  const items = [
    { to: '/physician', end: true, icon: LayoutDashboard, label: n.dashboard, count: 0 },
    { to: '/physician/patients', icon: Users, label: n.patients, count: 0 },
    { to: '/physician/sessions', icon: ClipboardCheck, label: n.sessions, count: toReview },
    { to: '/physician/progress', icon: Images, label: n.progress, count: photos },
    { to: '/physician/appointments', icon: CalendarClock, label: n.appointments, count: 0 },
    { to: '/physician/notifications', icon: Bell, label: n.notifications, count: unread },
    { to: '/physician/content', icon: Library, label: n.content, count: 0 },
    { to: '/physician/settings', icon: Settings, label: n.settings, count: 0 },
  ];

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-ivory">{t.a.skip}</a>
      {open && <button type="button" className="fixed inset-0 z-30 bg-ink/50 lg:hidden" aria-label={t.a.closeMenu} onClick={() => setOpen(false)} />}

      <aside id="ph-nav" className={cn(
        'fixed inset-y-0 start-0 z-40 flex w-64 flex-col bg-ink text-ivory transition-[transform,visibility] duration-300 ease-precise lg:visible lg:translate-x-0',
        open ? 'visible translate-x-0' : 'max-lg:invisible max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full',
      )}>
        <div className="flex h-14 items-center justify-between px-5">
          <Link to="/physician" aria-label="DermiQ"><Wordmark size="sm" /></Link>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ivory/10 lg:hidden" aria-label={t.a.closeMenu} onClick={() => setOpen(false)}><X size={18} aria-hidden="true" /></button>
        </div>
        <p className="px-5 text-[0.7rem] font-semibold text-ivory/50">{n.workspace}</p>
        <nav aria-label={n.main} className="scroll-slim mt-5 flex-1 overflow-y-auto px-3">
          <ul className="grid gap-0.5">
            {items.map((x) => (
              <li key={x.to}>
                <NavLink to={x.to} end={x.end} className={({ isActive }) => cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.9rem] font-semibold transition-colors',
                  isActive ? 'bg-ivory/[0.09] text-ivory' : 'text-ivory/65 hover:bg-ivory/[0.05] hover:text-ivory',
                )}>
                  {({ isActive }) => (<>
                    {isActive && <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-metal" aria-hidden="true" />}
                    <x.icon size={17} aria-hidden="true" />
                    <span className="flex-1">{x.label}</span>
                    {x.count > 0 && <span className="num rounded bg-brand-400 px-1.5 py-0.5 text-[0.66rem] font-bold text-white">{x.count}</span>}
                  </>)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-ivory/10 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={L(physician.name)} size={36} className="!rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.86rem] font-bold">{L(physician.name)}</p>
              <p className="truncate text-[0.7rem] text-ivory/55">{L(physician.clinic)}</p>
            </div>
            <button type="button" onClick={logout} aria-label={t.a.signOut} title={t.a.signOut} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ivory/70 hover:bg-ivory/10 hover:text-ivory" data-testid="signout-rail">
              <LogOut size={17} className="flip-rtl" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-ink/10 bg-ivory/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-ink/[0.06] lg:hidden" aria-label={t.a.openMenu} aria-expanded={open} aria-controls="ph-nav" onClick={() => setOpen(true)} data-testid="ph-menu"><Menu size={20} aria-hidden="true" /></button>
            <Badge tone="outline" className="hidden sm:inline-flex">{t.tag.prototype} · {t.tag.demo}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <LangSwitch compact className="h-9 !rounded-md" />
            <Link to="/physician/notifications" aria-label={unread ? `${n.notifications} — ${unread} ${t.notif.unread}` : n.notifications} className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-ink/[0.06]" data-testid="bell">
              <Bell size={19} aria-hidden="true" />
              {unread > 0 && <span className="num absolute end-1 top-1 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-bold text-ivory">{unread}</span>}
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {!storageStatus.persistent && <Notice tone="warn" className="mb-5">{t.note.storageOff}</Notice>}
          <Outlet context={physician} />
          <p className="mt-14 border-t border-ink/10 pt-4 text-[0.72rem] text-stone-700">{t.note.concept} · {t.note.fictional}</p>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
