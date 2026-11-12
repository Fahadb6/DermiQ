import { Link } from 'react-router-dom';
import { BadgeCheck, Eye, LockKeyhole, MessageCircleQuestion } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { nextSession, planOf, visibleSnapshot } from '@/services/selectors';
import { useNow } from '@/hooks/useNow';
import { everyDays, fmtDate, fmtDateTime } from '@/utils/format';
import { cn } from '@/utils/misc';
import { NineDot } from '@/components/brand/Brand';
import { Badge, Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { HeadTile } from '@/components/product/Figures';
import { PlanPill } from '@/components/domain/Status';
import { Card, CardTitle, PageTitle, Row, usePatient } from './ui';

export function PatientPlan() {
  const patient = usePatient();
  const { t, L, lang } = useI18n();
  const p = t.pt.plan;
  const db = useDb((s) => s.db);
  const now = useNow();
  const plan = planOf(db, patient.id);
  const snap = visibleSnapshot(plan);
  const next = nextSession(db, patient.id, now);
  const physician = db.physicians.find((x) => x.id === patient.physicianId);
  const notes = db.notes.filter((n) => n.patientId === patient.id && n.shared).sort((a, b) => b.at.localeCompare(a.at));

  if (!plan || !snap) {
    return (
      <>
        <PageTitle title={p.title} />
        <section className="rounded-[1.75rem] border border-dashed border-ink/25 bg-ivory p-7 sm:p-10" data-testid="plan-not-ready">
          <NineDot size={30} accent={null} className="text-stone-400" />
          <h2 className="display d4 mt-5">{p.notReadyTitle}</h2>
          <p className="mt-3 max-w-lg text-stone-800">{p.notReadyBody}</p>
          {plan && <PlanPill status={plan.approvalStatus} audience="patient" className="mt-5" />}
          <h3 className="eyebrow mt-9 text-stone-700">{p.whatNext}</h3>
          <ul className="mt-3 grid gap-2 text-[0.95rem]">
            <li><Link to="/patient" className="font-semibold text-brand underline-offset-4 hover:underline">{p.nextA}</Link></li>
            <li><Link to="/patient/education" className="font-semibold text-brand underline-offset-4 hover:underline">{p.nextB}</Link></li>
          </ul>
        </section>
      </>
    );
  }

  const st = plan.approvalStatus;
  const state = st === 'locked' ? { icon: LockKeyhole, k: p.lockedTitle, b: p.lockedBody, cls: 'bg-aubergine text-ivory' }
    : st === 'requires_review' ? { icon: Eye, k: p.reviewTitle, b: p.reviewBody, cls: 'bg-warn-bg text-ink ring-1 ring-warn/25' }
    : { icon: BadgeCheck, k: p.approvedTitle, b: p.approvedBody, cls: 'bg-ok-bg text-ink ring-1 ring-ok/20' };

  return (
    <>
      <PageTitle title={p.title} lead={p.lead} action={<Badge tone="outline" icon={<LockKeyhole size={12} aria-hidden="true" />}>{t.tag.readOnly}</Badge>} />
      <div className="grid gap-5" data-testid="patient-plan">
        <section className={cn('flex items-start gap-4 rounded-2xl p-5', state.cls)} data-testid="plan-state" data-status={st}>
          <state.icon size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-bold">{state.k}</h2>
            <p className={cn('mt-1 text-[0.9rem]', st === 'locked' ? 'text-ivory/75' : 'text-stone-800')}>{state.b}</p>
            {st === 'locked' && <p className="mt-2 text-[0.78rem] text-ivory/60">{t.note.lock}</p>}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Card className="flex flex-col justify-between">
            <CardTitle>{t.terms.dose}</CardTitle>
            <p className="flex items-baseline gap-3" data-testid="plan-dose">
              <span className="display num text-[5.5rem] leading-[0.85] sm:text-[6.5rem]">{snap.doseMl.toFixed(1)}</span>
              <span className="display d4 text-stone-700">{lang === 'ar' ? 'مل' : 'mL'}</span>
            </p>
            <p className="mt-5 text-[0.86rem] text-stone-700">{p.doseNote}</p>
          </Card>
          <Card>
            <CardTitle>{t.terms.head}</CardTitle>
            <HeadTile />
            <p className="mt-4 text-[0.86rem] text-stone-700">{p.headNote}</p>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardTitle>{p.schedule}</CardTitle>
            <dl className="divide-y divide-ink/10">
              <Row k={p.interval}>{everyDays(snap.intervalDays, lang)}</Row>
              <Row k={p.nextSession}>{next ? <span className="num">{fmtDateTime(next.scheduledAt, lang)}</span> : <span className="text-stone-700">{p.notScheduled}</span>}</Row>
              <Row k={p.followUp}>{snap.followUpDate ? fmtDate(snap.followUpDate, lang, 'long') : <span className="text-stone-700">{t.terms.notSet}</span>}</Row>
            </dl>
          </Card>
          <Card>
            <CardTitle>{p.approval}</CardTitle>
            <dl className="divide-y divide-ink/10">
              {/* the status pill never breaks inside; on a 320 px screen it drops under its label instead */}
              <Row k={p.status} className="flex-wrap gap-y-1.5"><PlanPill status={st} audience="patient" /></Row>
              <Row k={t.terms.approvedOn}>{fmtDate(snap.approvedAt, lang, 'long')}</Row>
              <Row k={t.terms.revision}><span className="num">{snap.revision}</span></Row>
              {plan.lockedAt && st === 'locked' && <Row k={t.terms.lockedOn}>{fmtDate(plan.lockedAt, lang, 'long')}</Row>}
              <Row k={p.physician}>{L(physician?.name)}</Row>
            </dl>
          </Card>
        </div>

        {L(snap.notes) && (
          <Card>
            <CardTitle>{p.planNotes}</CardTitle>
            <p className="max-w-2xl leading-relaxed">{L(snap.notes)}</p>
          </Card>
        )}

        <Card>
          <CardTitle>{p.sharedNotes}</CardTitle>
          {notes.length === 0 ? <p className="text-[0.92rem] text-stone-700">{p.noNotes}</p> : (
            <ul className="grid gap-5">
              {notes.map((n) => (
                <li key={n.id} className="border-s-2 border-brand ps-4">
                  <p className="leading-relaxed">{L(n.text)}</p>
                  <p className="mt-1.5 text-[0.8rem] text-stone-700">{L(physician?.name)} · {fmtDate(n.at, lang, 'long')}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-wrap items-center gap-x-6 gap-y-4 bg-ivory">
          <MessageCircleQuestion size={22} className="shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1 basis-60">
            <p className="font-semibold">{p.question}</p>
            <p className="mt-1 text-[0.84rem] text-stone-700">{L(physician?.name)} · {L(physician?.clinic)} · <Ltr>{physician?.phone}</Ltr></p>
          </div>
          <Button to="/patient/education/reading-your-plan" variant="outline" size="sm">{p.learn}</Button>
        </Card>
        <Notice>{t.note.dose}</Notice>
      </div>
    </>
  );
}
