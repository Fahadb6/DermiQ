import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import type { Role } from '@/types';
import { useI18n, fmt } from '@/services/i18n';
import { useAuth } from '@/services/auth';
import { useDb } from '@/services/db';
import { DEMO_PASSWORD } from '@/data/seed';
import { ILLUSTRATIONS } from '@/assets';
import { cn } from '@/utils/misc';
import { Topo, Wordmark } from '@/components/brand/Brand';
import { Avatar, Field, LangSwitch, Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Bwd } from '@/components/ui/icons';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Login({ role }: { role: Role }) {
  const { t, L } = useI18n();
  const a = t.auth;
  const copy = a[role];
  const nav = useNavigate();
  const location = useLocation();
  const users = useDb((s) => s.db.users);
  const patients = useDb((s) => s.db.patients);
  const physicians = useDb((s) => s.db.physicians);
  const { session, login, logout, expired, clearExpired } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  useEffect(() => { setFailure(null); setTouched(false); setEmail(''); setPassword(''); }, [role]);
  useEffect(() => () => clearExpired(), [clearExpired]);

  const home = role === 'patient' ? '/patient' : '/physician';
  if (session && session.role === role) return <Navigate to={home} replace />;

  const nameOf = (profileId: string) => L(patients.find((p) => p.id === profileId)?.name ?? physicians.find((p) => p.id === profileId)?.name ?? '');
  const errors = {
    email: !email.trim() ? a.v.emailRequired : !EMAIL.test(email.trim()) ? a.v.emailInvalid : null,
    password: !password ? a.v.passwordRequired : password.length < 6 ? a.v.passwordShort : null,
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailure(null);
    if (errors.email || errors.password) return;
    const r = login(users, role, email, password);
    if (r.ok) {
      const from = (location.state as { from?: string } | null)?.from;
      nav(from && from.startsWith(home) ? from : home, { replace: true });
    } else {
      setFailure(r.reason === 'invalid' ? a.fail.invalid : role === 'patient' ? a.fail.wrongPatient : a.fail.wrongPhysician);
    }
  };
  const demo = users.filter((u) => u.role === role);
  const other = role === 'patient' ? '/login/physician' : '/login/patient';
  const art = role === 'patient' ? ILLUSTRATIONS.loginPatient : ILLUSTRATIONS.loginPhysician;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel. The panel is as tall as the page; its content stays in view while the form scrolls. */}
      <aside className="relative isolate hidden bg-aubergine text-ivory lg:block">
        <Topo seed={role === 'patient' ? 61 : 67} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" accentEvery={5} accent="rgba(181,154,120,0.2)" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_50%_70%,rgba(91,35,147,0.5),transparent_70%)]" />
        <div className="sticky top-0 flex h-dvh min-h-[44rem] flex-col justify-between p-12 xl:p-14">
          <Link to="/" aria-label="DermiQ" className="self-start"><Wordmark size="lg" /></Link>
          {/* Who signs in here: a patient on the patient page, a physician on the physician page. */}
          <figure className="mx-auto my-6 w-full max-w-[min(23rem,34vh)]" data-testid={`login-art-${role}`}>
            {/* An arch: the top radius is half the width, written as percentages so the lower corners keep theirs. */}
            <div className="overflow-hidden shadow-lift ring-1 ring-ivory/15" style={{ background: art.bg, borderRadius: '50% 50% 2rem 2rem / 37.34% 37.34% 2rem 2rem' }}>
              <img src={art.src} alt={L(art.alt)} width={art.w} height={art.h} decoding="async" draggable={false} className="block h-auto w-full select-none" />
            </div>
          </figure>
          <div>
            {/* The site's three-line statement; sized from the viewport so each sentence keeps to one line in the panel. */}
            <p className="display d3" style={{ fontSize: 'clamp(1.5rem, 2.35vw, 2.6rem)' }}>
              <span className="block whitespace-nowrap">{t.pub.hero.l1}</span>{' '}
              <span className="block whitespace-nowrap">{t.pub.hero.l2}</span>{' '}
              <span className="block whitespace-nowrap text-lavender-400">{t.pub.hero.l3}</span>
            </p>
            <p className="mt-4 text-[0.8rem] text-ivory/60">{t.note.concept}</p>
          </div>
        </div>
      </aside>

      {/* Form */}
      <main className="flex flex-col bg-ivory">
        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[0.86rem] font-semibold text-stone-800 hover:text-brand"><Bwd size={16} /> {a.backHome}</Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="lg:hidden" aria-label="DermiQ"><Wordmark size="sm" /></Link>
            <LangSwitch compact className="h-9" />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-14 pt-6 sm:px-0">
          {/* The same figure, as a band, where the side panel is not shown (phone and tablet). */}
          <div className="mb-7 overflow-hidden rounded-2xl ring-1 ring-ink/10 lg:hidden" style={{ background: art.bg }} data-testid={`login-art-band-${role}`}>
            <img
              src={art.src} alt={L(art.alt)} width={art.w} height={art.h} decoding="async" draggable={false}
              className="block h-44 w-full select-none object-cover sm:h-60" style={{ objectPosition: role === 'patient' ? '50% 34%' : '50% 14%' }}
            />
          </div>
          <p className="eyebrow text-brand">{copy.eyebrow}</p>
          <h1 className="display d2 mt-4">{copy.title}</h1>
          <p className="mt-4 text-stone-800">{copy.lead}</p>

          {expired && <Notice tone="warn" className="mt-6">{t.sessionExpired}</Notice>}
          {session && session.role !== role && (
            <Notice tone="brand" className="mt-6">
              <p>{fmt(a.already, { name: nameOf(session.profileId) })}</p>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <Link className="font-bold text-brand underline-offset-4 hover:underline" to={session.role === 'patient' ? '/patient' : '/physician'}>{a.goTo}</Link>
                <button type="button" className="font-bold text-brand underline-offset-4 hover:underline" onClick={logout}>{a.switchAccount}</button>
              </div>
            </Notice>
          )}

          <form onSubmit={submit} noValidate className="mt-8 grid gap-5" data-testid="login-form">
            {failure && <div role="alert" className="flex gap-3 rounded-xl border border-bad/30 bg-bad-bg px-4 py-3 text-[0.9rem] font-medium text-bad"><ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{failure}</div>}
            <Field label={a.email} error={touched ? errors.email : null}>
              {(f) => <input id={f.id} name="email" type="email" dir="ltr" autoComplete="username" className="field h-12 text-start" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} />}
            </Field>
            <Field label={a.password} error={touched ? errors.password : null}>
              {(f) => (
                <div className="relative">
                  <input id={f.id} name="password" type={show ? 'text' : 'password'} dir="ltr" autoComplete="current-password" className="field h-12 pe-12 text-start" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={f.invalid} aria-describedby={f.describedBy} />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.a.hidePassword : t.a.showPassword} aria-pressed={show} className="absolute end-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-700 hover:bg-ink/[0.06]">
                    {show ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </Field>
            <Button type="submit" size="lg" block>{a.submit}</Button>
            <div className="text-center">
              <button type="button" className="text-[0.84rem] font-semibold text-stone-700 underline-offset-4 hover:text-brand hover:underline" aria-expanded={forgot} onClick={() => setForgot((v) => !v)}>{a.forgot}</button>
              {forgot && <p className="mt-2 text-[0.84rem] text-stone-700">{a.forgotBody}</p>}
            </div>
          </form>

          <section className="mt-9 rounded-2xl border border-ink/10 bg-porcelain p-4" aria-labelledby="demo-accounts">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="demo-accounts" className="text-[0.9rem] font-bold">{a.demo.title}</h2>
              <p className="text-[0.76rem] text-stone-700">{a.demo.password}: <Ltr mono className="font-bold text-ink">{DEMO_PASSWORD}</Ltr></p>
            </div>
            <p className="mt-1 text-[0.8rem] text-stone-700">{a.demo.lead}</p>
            <ul className={cn('mt-3 grid gap-1.5', demo.length > 3 && 'sm:grid-cols-2')}>
              {demo.map((u) => {
                const name = nameOf(u.profileId);
                return (
                  <li key={u.id}>
                    <button type="button" data-testid={`demo-${u.profileId}`} onClick={() => { setEmail(u.email); setPassword(u.demoPassword); setFailure(null); }}
                      className="flex w-full items-center gap-3 rounded-xl bg-ivory px-3 py-2 text-start ring-1 ring-inset ring-ink/10 transition-colors hover:ring-brand">
                      <Avatar name={name} size={30} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.86rem] font-bold">{name}</span>
                        <Ltr className="block truncate text-[0.72rem] text-stone-700">{u.email}</Ltr>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <Notice className="mt-5" title={a.simulatedTitle}>{a.simulatedBody} {a.sessionNote}</Notice>
          <p className="mt-6 text-center text-[0.9rem] text-stone-800">
            {copy.other}{' '}
            <Link to={other} className="font-bold text-brand underline-offset-4 hover:underline">{copy.otherCta}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
