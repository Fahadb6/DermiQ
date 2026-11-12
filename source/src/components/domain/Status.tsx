import { BadgeCheck, CalendarClock, CircleDashed, Eye, FileClock, Hourglass, LockKeyhole, SquarePen, Stethoscope, TriangleAlert, UserRound } from 'lucide-react';
import type { AppointmentType, ArticleStatus, PlanStatus, SessionRecord, SessionView } from '@/types';
import { useI18n } from '@/services/i18n';
import { Badge, type Tone } from '@/components/ui/Bits';
import { cn } from '@/utils/misc';

const PLAN_TONE: Record<PlanStatus, Tone> = { draft: 'neutral', pending_approval: 'warn', approved: 'ok', locked: 'dark', requires_review: 'warn' };
const PLAN_ICON: Record<PlanStatus, React.ElementType> = { draft: CircleDashed, pending_approval: Hourglass, approved: BadgeCheck, locked: LockKeyhole, requires_review: TriangleAlert };

/** Plan status. `audience="patient"` uses patient-facing wording (never "draft"). */
export function PlanPill({ status, audience = 'physician', className }: { status: PlanStatus; audience?: 'patient' | 'physician'; className?: string }) {
  const { t } = useI18n();
  const Icon = PLAN_ICON[status];
  return (
    <Badge tone={PLAN_TONE[status]} className={className} icon={<Icon size={12} aria-hidden="true" />}>
      {audience === 'patient' ? t.planPatient[status] : t.plan[status]}
    </Badge>
  );
}

const SESSION_TONE: Record<SessionView, Tone> = { upcoming: 'brand', awaiting_documentation: 'warn', pending_review: 'metal', reviewed: 'ok', missed: 'bad' };
const SESSION_ICON: Record<SessionView, React.ElementType> = { upcoming: CalendarClock, awaiting_documentation: SquarePen, pending_review: Eye, reviewed: BadgeCheck, missed: TriangleAlert };
export function SessionPill({ view, className }: { view: SessionView; className?: string }) {
  const { t } = useI18n();
  const Icon = SESSION_ICON[view];
  return <Badge tone={SESSION_TONE[view]} className={className} icon={<Icon size={12} aria-hidden="true" />}>{t.session[view]}</Badge>;
}

/** Makes the SOURCE of a session record explicit: it is always a manual entry, never device data. */
export function SourceTag({ session, className }: { session: SessionRecord; className?: string }) {
  const { t } = useI18n();
  if (!session.recordedBy) return null;
  const byPatient = session.recordedBy === 'patient';
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[0.74rem] font-semibold text-stone-700', className)}>
      {byPatient ? <UserRound size={12} aria-hidden="true" /> : <Stethoscope size={12} aria-hidden="true" />}
      {byPatient ? (session.status === 'reported' ? t.tag.patientReported : t.tag.byPatient) : t.tag.byPhysician}
    </span>
  );
}

const APPT_TONE: Record<AppointmentType, Tone> = { treatment: 'brand', follow_up: 'metal', consultation: 'outline' };
export function ApptTypeBadge({ type, className }: { type: AppointmentType; className?: string }) {
  const { t } = useI18n();
  return <Badge tone={APPT_TONE[type]} className={className}>{t.apptType[type]}</Badge>;
}

const ARTICLE_TONE: Record<ArticleStatus, Tone> = { draft: 'neutral', pending_review: 'warn', approved: 'brand', published: 'ok', archived: 'outline' };
export function ArticlePill({ status }: { status: ArticleStatus }) {
  const { t } = useI18n();
  return <Badge tone={ARTICLE_TONE[status]} icon={status === 'pending_review' ? <FileClock size={12} aria-hidden="true" /> : undefined} dot={status !== 'pending_review'}>{t.article[status]}</Badge>;
}

/** Calendar tile: weekday, day numeral, month. */
export function DateBlock({ at, tone = 'light', square, className }: { at: string; tone?: 'light' | 'dark' | 'brand'; square?: boolean; className?: string }) {
  const { lang } = useI18n();
  return (
    <time dateTime={at} className={cn(
      'flex h-[3.75rem] w-[3.5rem] shrink-0 flex-col items-center justify-center leading-none',
      square ? 'rounded-md' : 'rounded-xl',
      tone === 'light' && 'bg-porcelain text-ink ring-1 ring-inset ring-ink/10',
      tone === 'dark' && 'bg-ivory/10 text-ivory ring-1 ring-inset ring-ivory/15',
      tone === 'brand' && 'bg-brand text-ivory',
      className,
    )}>
      <span className="text-[0.62rem] font-semibold opacity-75">{fmtShort(at, lang, 'wd')}</span>
      <span className="num mt-1 text-[1.3rem] font-bold">{fmtShort(at, lang, 'dayNum')}</span>
      <span className="mt-1 text-[0.62rem] font-semibold opacity-75">{fmtShort(at, lang, 'mon')}</span>
    </time>
  );
}
const SHORT: Record<string, Intl.DateTimeFormatOptions> = { wd: { weekday: 'short' }, dayNum: { day: 'numeric' }, mon: { month: 'short' } };
function fmtShort(at: string, lang: 'ar' | 'en', k: 'wd' | 'dayNum' | 'mon') {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', SHORT[k]).format(new Date(at));
}
