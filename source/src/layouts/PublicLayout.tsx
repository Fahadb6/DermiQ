import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, Stethoscope, UserRound, X } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import { Wordmark } from '@/components/brand/Brand';
import { LangSwitch, Ltr } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Toaster } from '@/components/ui/Toast';

function useNav() {
  const { t } = useI18n();
  const n = t.pub.nav;
  return [
    { to: '/', label: n.home, end: true },
    { to: '/about', label: n.about },
    { to: '/product', label: n.product },
    { to: '/philosophy', label: n.philosophy },
    { to: '/how-it-works', label: n.how },
    { to: '/guide', label: n.guide },
    { to: '/faq', label: n.faq },
    { to: '/contact', label: n.contact },
  ];
}

/** Hides on scroll-down, returns on scroll-up; solid once the page has moved. */
function useHeaderState() {
  const [state, setState] = useState({ solid: false, hidden: false });
  const last = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > last.current + 4;
      const goingUp = y < last.current - 4;
      setState((s) => {
        const solid = y > 24;
        const hidden = y > 320 ? (goingDown ? true : goingUp ? false : s.hidden) : false;
        return s.solid === solid && s.hidden === hidden ? s : { solid, hidden };
      });
      last.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

export function PublicLayout() {
  const { t } = useI18n();
  const nav = useNav();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { solid, hidden } = useHeaderState();
  const main = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <button type="button" onClick={() => main.current?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink">
        {t.a.skip}
      </button>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 text-ivory transition-[transform,background-color] duration-300 ease-precise',
          solid || open ? 'bg-aubergine' : 'bg-transparent',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        {/* Utility strip — desktop */}
        <div className="hidden border-b border-ivory/10 xl:block">
          <div className="page flex h-10 items-center justify-between gap-6 text-[0.78rem]">
            <p className="truncate text-ivory/50">{t.note.concept}</p>
            <div className="flex shrink-0 items-center gap-6">
              <LangSwitch tone="light" className="h-7 border-0 px-0 text-[0.78rem] hover:text-metal-300" />
              <span className="h-3 w-px bg-ivory/20" aria-hidden="true" />
              <Link to="/login/patient" className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-metal-300">
                <UserRound size={14} aria-hidden="true" /> {t.pub.nav.patientLogin}
              </Link>
              <Link to="/login/physician" className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-metal-300">
                <Stethoscope size={14} aria-hidden="true" /> {t.pub.nav.physicianLogin}
              </Link>
            </div>
          </div>
        </div>

        <div className="page flex h-16 items-center justify-between gap-6 xl:h-[4.25rem]">
          <Link to="/" aria-label={`DermiQ — ${t.pub.nav.home}`} className="shrink-0"><Wordmark /></Link>
          <nav aria-label={t.pub.nav.main} className="hidden items-center gap-x-7 xl:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => cn(
                  'relative py-2 text-[0.86rem] font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:bg-metal after:transition-transform after:duration-300',
                  isActive ? 'text-ivory after:scale-x-100' : 'text-ivory/70 after:scale-x-0 hover:text-ivory',
                )}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 xl:hidden">
            <LangSwitch tone="light" compact className="h-10 px-3" />
            <button
              type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="site-menu"
              aria-label={open ? t.a.closeMenu : t.a.openMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25"
            >
              {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

      </header>

      {/* Overlay menu — phone & tablet. It sits beside the header, not inside it: the header carries a
          transform (it slides away on scroll), and a transformed ancestor would become the containing
          block of this fixed panel and collapse it to zero height. */}
      {open && (
        <div id="site-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade overflow-y-auto overscroll-contain bg-aubergine text-ivory xl:hidden">
          <nav aria-label={t.pub.nav.main} className="page pb-10 pt-2">
            <ul>
              {nav.map((n, i) => (
                <li key={n.to} className="border-b border-ivory/10">
                  <NavLink to={n.to} end={n.end} className={({ isActive }) => cn('flex items-baseline gap-5 py-4', isActive ? 'text-ivory' : 'text-ivory/75')}>
                    <span className="tech num text-metal-300">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-[1.65rem]">{n.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button to="/login/patient" variant="light" size="lg" block icon={<UserRound size={18} aria-hidden="true" />}>{t.pub.nav.patientLogin}</Button>
              <Button to="/login/physician" variant="outline-light" size="lg" block icon={<Stethoscope size={18} aria-hidden="true" />}>{t.pub.nav.physicianLogin}</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <LangSwitch tone="light" />
              <p className="text-[0.72rem] text-ivory/60">{t.note.concept}</p>
            </div>
          </nav>
        </div>
      )}

      <main ref={main} id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  const nav = useNav();
  const f = t.pub.footer;
  const linkCls = 'text-[0.92rem] text-ivory/70 transition-colors hover:text-ivory';
  return (
    <footer className="bg-ink text-ivory">
      <div className="page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark size="lg" />
            <p className="eyebrow mt-4 text-metal-300">{t.brand.tagline}</p>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-ivory/65">{f.about}</p>
            <div className="mt-7">
              <p className="eyebrow mb-3 text-ivory/60">{t.lang.label}</p>
              <LangSwitch tone="light" />
            </div>
          </div>
          <nav aria-label={f.explore} className="lg:col-span-3 lg:col-start-6">
            <h2 className="eyebrow text-ivory/60">{f.explore}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
              {nav.map((n) => <li key={n.to}><Link to={n.to} className={linkCls}>{n.label}</Link></li>)}
            </ul>
          </nav>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            <nav aria-label={f.access}>
              <h2 className="eyebrow text-ivory/60">{f.access}</h2>
              <ul className="mt-5 grid gap-3">
                <li><Link to="/login/patient" className={linkCls}>{t.pub.nav.patientLogin}</Link></li>
                <li><Link to="/login/physician" className={linkCls}>{t.pub.nav.physicianLogin}</Link></li>
                <li><Link to="/guide" className={linkCls}>{t.pub.nav.guide}</Link></li>
              </ul>
            </nav>
            <div>
              <h2 className="eyebrow text-ivory/60">{f.support}</h2>
              <ul className="mt-5 grid gap-3 text-[0.92rem] text-ivory/70">
                <li><Ltr>support@dermiq.demo</Ltr></li>
                <li><Ltr>+966 12 000 0100</Ltr></li>
                <li>{f.supportHours}</li>
                <li className="text-[0.78rem] text-ivory/60">{f.supportNote}</li>
              </ul>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                <li><Link to="/contact" className={linkCls}>{t.pub.nav.contact}</Link></li>
                <li><Link to="/faq" className={linkCls}>{t.pub.nav.faq}</Link></li>
                <li><Link to="/privacy" className={linkCls}>{t.pub.nav.privacy}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-ivory/10 pt-8 lg:grid-cols-12">
          <h2 className="eyebrow text-ivory/60 lg:col-span-2">{f.disclaimers}</h2>
          <div className="grid gap-4 text-[0.8rem] leading-relaxed text-ivory/55 md:grid-cols-3 lg:col-span-10">
            <p>{f.d1}</p>
            <p>{f.d2}</p>
            <p>{f.d3}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-[0.75rem] text-ivory/60">
          <p><span className="num">© 2026</span> · {f.rights}</p>
          <p>{t.note.concept}</p>
        </div>
      </div>
    </footer>
  );
}
