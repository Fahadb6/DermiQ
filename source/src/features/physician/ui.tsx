import { Link, useOutletContext } from 'react-router-dom';
import type { Patient, Physician } from '@/types';
import { useI18n } from '@/services/i18n';
import { cn } from '@/utils/misc';
import { Avatar, Ltr } from '@/components/ui/Bits';

/** The signed-in physician, provided by PhysicianLayout. */
export function usePhysician(): Physician {
  return useOutletContext<Physician>();
}

export function PageHead({ title, lead, action, children }: { title: string; lead?: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-ink/15 pb-5">
      <div className="min-w-0">
        {children}
        <h1 className="display text-[1.9rem] leading-tight sm:text-[2.3rem]">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-[0.93rem] text-stone-700">{lead}</p>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, sub, action, children, className, pad = true, id }: { title?: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean; id?: string }) {
  return (
    <section id={id} className={cn('rounded-lg border border-ink/[0.13] bg-white', className)}>
      {title && (
        <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-3.5">
          <div className="min-w-0"><h2 className="text-[0.95rem] font-bold">{title}</h2>{sub && <p className="mt-0.5 text-[0.76rem] text-stone-700">{sub}</p>}</div>
          {action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export const TH = 'whitespace-nowrap px-4 py-3 text-start text-[0.74rem] font-semibold text-stone-700';
export const TD = 'px-4 py-3.5 align-middle text-[0.9rem]';

export function PatientCell({ patient, link = true, size = 34 }: { patient: Patient; link?: boolean; size?: number }) {
  const { L } = useI18n();
  const name = L(patient.name);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={name} size={size} className="!rounded-md" />
      <span className="min-w-0">
        {link ? <Link to={`/physician/patients/${patient.id}`} className="block truncate font-bold underline-offset-4 hover:text-brand hover:underline">{name}</Link> : <span className="block truncate font-bold">{name}</span>}
        <Ltr mono className="block text-[0.68rem] text-stone-700">{patient.id}</Ltr>
      </span>
    </span>
  );
}

/** Label / value pair for dense read-only records. */
export function KV({ k, children, className }: { k: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-6 py-2.5', className)}>
      <dt className="shrink-0 text-[0.84rem] text-stone-700">{k}</dt>
      <dd className="min-w-0 text-end text-[0.9rem] font-semibold">{children}</dd>
    </div>
  );
}
