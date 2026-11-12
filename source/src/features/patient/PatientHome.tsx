import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, ClipboardList, Eye, Images, SquarePen, StickyNote } from 'lucide-react';
import { useI18n, fmt } from '@/services/i18n';
import { useDb } from '@/services/db';
import { nextAppointment, nextSession, planOf, sessionsOf, sessionView, visibleSnapshot } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { APPROVED_HEAD } from '@/data/product';
import { everyDays, fmtDate, fmtDose, relDay } from '@/utils/format';
import { NineDot, Topo } from '@/components/brand/Brand';
import { Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { ChevFwd, Fwd } from '@/components/ui/icons';
import { ApptTypeBadge, DateBlock, PlanPill } from '@/components/domain/Status';
import { NotificationList, useMyNotifications } from '@/components/domain/Notifications';
import { Card, CardTitle, usePatient } from './ui';

export function PatientHome() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const h = t.pt.home;
  const db = useDb((s) => s.db);
  const now = useNow();
  const plan = planOf(db, patient.id);
  const snap = visibleSnapshot(plan);
  const next = nextSession(db, patient.id, now);
  const appt = nextAppointment(db, patient.id, now);
  const awaiting = sessionsOf(db, patient.id).filter((s) => sessionView(s, now) === 'awaiting_documentation');
  const notifications = useMyNotifications();
  const physician = db.physicians.find((p) => p.id === patient.physicianId);
  const note = db.notes.filter((n) => n.patientId === patient.id && n.shared).sort((a, b) => b.at.localeCompare(a.at))[0];
  const hour = now.getHours();
  const first = L(patient.name).split(' ')[0];
  const showAppt = appt && (!next || appt.id !== next.appointmentId);

  const shortcuts = [
    { to: '/patient/plan', icon: ClipboardList, k: t.pt.nav.planLong, b: h.planSub },
    { to: '/patient/sessions', icon: CalendarCheck, k: t.pt.nav.sessionsLong, b: h.sessionsSub },
    { to: '/patient/progress', icon: Images, k: t.pt.nav.progressLong, b: h.progressSub },
    { to: '/patient/education', icon: BookOpen, k: t.pt.nav.educationLong, b: h.educationSub },
  ];

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.86rem] text-stone-700">{fmtDate(now, lang, 'full')}</p>
          <h1 className="display d3 mt-1.5"><span className="text-stone-700">{hour < 12 ? h.morning : hour < 18 ? h.afternoon : h.evening}</span> {first}</h1>
        </div>
        {plan && <PlanPill status={plan.approvalStatus} audience="patient" />}
      </header>

      {plan?.approvalStatus === 'requires_review' && <Notice tone="warn" icon={<Eye size={18} aria-hidden="true" />}>{h.reviewBanner}</Notice>}

      {/* Next session ticket */}
      {snap ? (
        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-aubergine text-ivory shadow-plate" aria-labelledby="next-session" data-testid="next-session">
          <Topo seed={patient.avatarSeed + 5} className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-ivory/[0.07]" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 id="next-session" className="eyebrow text-metal-300">{h.nextSession}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-metal/50 px-2.5 py-1 text-[0.68rem] font-semibold text-metal-300">
                <NineDot size={12} accent="#D3C2AA" className="text-metal-300" /> {h.seal}
              </span>
            </div>
            {next ? (
              <div className="mt-5 flex items-end gap-5">
                <p className="display num text-[5.5rem] leading-[0.8] sm:text-[7rem]">{fmtDate(next.scheduledAt, lang, 'dayNum')}</p>
                <div className="pb-1">
                  <p className="display d4">{fmtDate(next.scheduledAt, lang, 'weekdayLong')}</p>
                  <p className="mt-1 text-[0.95rem] text-ivory/75">{fmtDate(next.scheduledAt, lang, 'monthYear')} · <span className="num">{fmtDate(next.scheduledAt, lang, 'time')}</span></p>
                  <p className="mt-2 inline-flex rounded-full bg-ivory/10 px-3 py-1 text-[0.8rem] font-semibold">{relDay(next.scheduledAt, lang, now)}</p>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <p className="display d4">{h.noSessionTitle}</p>
                <p className="mt-2 max-w-md text-[0.93rem] text-ivory/70">{h.noSessionBody}</p>
              </div>
            )}
          </div>
          <div className="relative border-t border-dashed border-ivory/25">
            <span className="absolute -top-3 start-[-0.75rem] h-6 w-6 rounded-full bg-porcelain" aria-hidden="true" />
            <span className="absolute -top-3 end-[-0.75rem] h-6 w-6 rounded-full bg-porcelain" aria-hidden="true" />
            <dl className="grid grid-cols-3 gap-4 px-6 pt-6 sm:px-8">
              <div><dt className="text-[0.72rem] text-ivory/60">{t.terms.dose}</dt><dd className="num mt-1.5 text-[1.15rem] font-bold" data-testid="home-dose">{fmtDose(snap.doseMl, lang)}</dd></div>
              <div><dt className="text-[0.72rem] text-ivory/60">{t.terms.head}</dt><dd className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap text-[0.78rem] font-bold sm:text-[0.86rem]"><NineDot size={13} className="shrink-0" /><Ltr mono>{APPROVED_HEAD.id}</Ltr></dd></div>
              <div><dt className="text-[0.72rem] text-ivory/60">{t.terms.interval}</dt><dd className="mt-1.5 text-[0.95rem] font-bold">{everyDays(snap.intervalDays, lang)}</dd></div>
            </dl>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
              {next && <Button to="/patient/walkthrough" variant="light" size="lg" iconEnd={<Fwd size={18} />} data-testid="start-session">{h.start}</Button>}
              <p className="max-w-[17rem] text-[0.78rem] leading-relaxed text-ivory/60">{next ? h.startNote : fmt(h.approvedBy, { name: L(physician?.name) })}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-ink/25 bg-ivory p-6 sm:p-8" data-testid="plan-pending">
          <NineDot size={26} accent={null} className="text-stone-400" />
          <h2 className="display d4 mt-4">{h.pendingTitle}</h2>
          <p className="mt-2 max-w-lg text-[0.95rem] text-stone-700">{h.pendingBody}</p>
          <Button to="/patient/education" variant="outline" size="sm" className="mt-5">{t.pt.nav.educationLong}</Button>
        </section>
      )}

      {awaiting.map((s) => (
        <section key={s.id} className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-2xl bg-warn-bg p-5 ring-1 ring-warn/25" data-testid="awaiting-card">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warn text-ivory"><SquarePen size={19} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1 basis-56">
            <h2 className="font-bold">{h.awaitingTitle}</h2>
            <p className="mt-1 text-[0.9rem] text-stone-800">{fmt(h.awaitingBody, { date: fmtDate(s.scheduledAt, lang, 'long') })}</p>
          </div>
          <Button to={`/patient/sessions?report=${s.id}`} variant="dark" size="sm">{h.report}</Button>
        </section>
      ))}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle to="/patient/reminders" more={h.allReminders}>{h.nextAppointment}</CardTitle>
          {showAppt && appt ? (
            <div className="flex items-start gap-4">
              <DateBlock at={appt.at} />
              <div className="min-w-0">
                <ApptTypeBadge type={appt.type} />
                <p className="mt-2 font-bold">{fmtDate(appt.at, lang, 'weekdayLong')} · <span className="num">{fmtDate(appt.at, lang, 'time')}</span></p>
                <p className="mt-0.5 text-[0.86rem] text-stone-700">{relDay(appt.at, lang, now)}{L(appt.note) ? ` — ${L(appt.note)}` : ''}</p>
              </div>
            </div>
          ) : appt ? (
            <p className="text-[0.92rem] text-stone-800">{t.apptType[appt.type]} · {fmtDate(appt.at, lang, 'long')}</p>
          ) : (
            <div><p className="font-bold">{h.noAppointment}</p><p className="mt-1 text-[0.88rem] text-stone-700">{h.noAppointmentBody}</p></div>
          )}
        </Card>

        {note ? (
          <Card className="bg-lavender-100 ring-brand/15">
            <CardTitle to="/patient/plan" more={t.a.viewAll}>{h.physicianNote}</CardTitle>
            <blockquote className="flex gap-3">
              <StickyNote size={18} className="mt-1 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="leading-relaxed">{L(note.text)}</p>
                <footer className="mt-2 text-[0.8rem] text-stone-700">{L(physician?.name)} · {fmtDate(note.at, lang, 'medium')}</footer>
              </div>
            </blockquote>
          </Card>
        ) : (
          <Card><CardTitle>{h.physicianNote}</CardTitle><p className="text-[0.92rem] text-stone-700">{t.pt.plan.noNotes}</p></Card>
        )}
      </div>

      <nav aria-label={h.shortcuts}>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {shortcuts.map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-ink/10 transition-shadow hover:ring-brand/50">
                <span className="flex items-center justify-between"><s.icon size={20} className="text-brand" aria-hidden="true" /><ChevFwd size={16} className="text-stone-500 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" /></span>
                <span className="mt-5 text-[0.95rem] font-bold leading-tight">{s.k}</span>
                <span className="mt-1 text-[0.78rem] text-stone-700">{s.b}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="updates">
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <h2 id="updates" className="eyebrow text-stone-700">{h.updates}</h2>
          <Link to="/patient/reminders" className="text-[0.82rem] font-semibold text-brand underline-offset-4 hover:underline">{h.allReminders}</Link>
        </div>
        {notifications.length ? <NotificationList items={notifications} limit={2} /> : <p className="px-1 text-[0.9rem] text-stone-700">{h.noUpdates}</p>}
      </section>

      <Notice>{t.note.notConnected} {t.note.inApp}</Notice>
    </div>
  );
}
