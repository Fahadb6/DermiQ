import { Suspense, lazy, useEffect, useRef } from 'react';
import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { EMBEDDED } from '@/utils/embed';
import type { Role } from '@/types';
import { useAuth } from '@/services/auth';
import { useI18n } from '@/services/i18n';
import { NineDot } from '@/components/brand/Brand';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Home } from '@/features/public/home/Home';
import { About } from '@/features/public/About';
import { Product } from '@/features/public/Product';
import { Philosophy } from '@/features/public/Philosophy';
import { HowItWorks } from '@/features/public/HowItWorks';
import { FaqPage } from '@/features/public/FaqPage';
import { Contact } from '@/features/public/Contact';
import { Privacy } from '@/features/public/Privacy';
import { NotFound } from '@/features/public/NotFound';
import { EducationIndex } from '@/features/education/EducationIndex';
import { ArticleView } from '@/features/education/ArticleView';
import { Login } from '@/features/authentication/Login';

// The two signed-in areas load on demand, so public visitors never download them.
const PatientArea = lazy(() => import('./PatientArea'));
const PhysicianArea = lazy(() => import('./PhysicianArea'));

function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-porcelain" role="status" aria-live="polite">
      <NineDot size={34} pulse className="text-aubergine" />
      <span className="sr-only">DermiQ</span>
    </div>
  );
}

/** Client-side route guard. Prototype enforcement only — see docs/SECURITY_NOTES.md. */
function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const validate = useAuth((s) => s.validate);
  const location = useLocation();
  useEffect(() => {
    validate();
    const id = window.setInterval(validate, 60_000);
    return () => window.clearInterval(id);
  }, [validate, location.pathname]);
  if (!session || session.role !== role) {
    return <Navigate to={`/login/${role}`} replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}

/** Scroll to the top and move focus to the page on every real navigation. */
function RouteEffects() {
  const { pathname } = useLocation();
  const { t, lang } = useI18n();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    if (main) { if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
  }, [pathname]);
  useEffect(() => {
    const seg = pathname.split('/').filter(Boolean);
    const pub: Record<string, string> = {
      about: t.pub.nav.about, product: t.pub.nav.product, philosophy: t.pub.nav.philosophy, 'how-it-works': t.pub.nav.how, guide: t.pub.nav.guide,
      faq: t.pub.nav.faq, contact: t.pub.nav.contact, privacy: t.pub.nav.privacy,
    };
    const pt: Record<string, string> = {
      plan: t.pt.nav.planLong, walkthrough: t.pt.walk.title, sessions: t.pt.nav.sessionsLong, reminders: t.pt.nav.reminders, progress: t.pt.nav.progressLong,
      education: t.pt.nav.educationLong, settings: t.pt.nav.settings,
    };
    const ph: Record<string, string> = {
      patients: t.ph.nav.patients, sessions: t.ph.nav.sessions, progress: t.ph.nav.progress, appointments: t.ph.nav.appointments,
      notifications: t.ph.nav.notifications, content: t.ph.nav.content, settings: t.ph.nav.settings,
    };
    let title = '';
    if (seg[0] === 'patient') title = pt[seg[1]] ?? t.pt.nav.home;
    else if (seg[0] === 'physician') title = ph[seg[1]] ?? t.ph.nav.dashboard;
    else if (seg[0] === 'login') title = seg[1] === 'physician' ? t.pub.nav.physicianLogin : t.pub.nav.patientLogin;
    else if (seg[0]) title = pub[seg[0]] ?? t.nf.title;
    document.title = title ? `${title} · DermiQ` : `DermiQ — ${t.brand.tagline}`;
  }, [pathname, lang, t]);
  return null;
}

/** Hash routing wherever the page has a URL; in-memory routing inside sandboxed preview frames. */
const Router = EMBEDDED ? MemoryRouter : HashRouter;

export function App() {
  return (
    <Router>
      <RouteEffects />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="product" element={<Product />} />
          <Route path="philosophy" element={<Philosophy />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="guide" element={<EducationIndex mode="public" />} />
          <Route path="guide/:slug" element={<ArticleView mode="public" />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="login" element={<Navigate to="/login/patient" replace />} />
        <Route path="login/patient" element={<Login role="patient" />} />
        <Route path="login/physician" element={<Login role="physician" />} />
        <Route path="patient/*" element={<RequireRole role="patient"><Suspense fallback={<Loading />}><PatientArea /></Suspense></RequireRole>} />
        <Route path="physician/*" element={<RequireRole role="physician"><Suspense fallback={<Loading />}><PhysicianArea /></Suspense></RequireRole>} />
      </Routes>
    </Router>
  );
}
