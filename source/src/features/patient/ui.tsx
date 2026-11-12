import { Link, useOutletContext } from 'react-router-dom';
import type { Patient } from '@/types';
import { cn } from '@/utils/misc';
import { ChevFwd } from '@/components/ui/icons';

/** The signed-in patient, provided by PatientLayout. */
export function usePatient(): Patient {
  return useOutletContext<Patient>();
}

export function Card({ children, className, as: As = 'section', ...rest }: { children: React.ReactNode; className?: string; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  return <As className={cn('rounded-2xl bg-white p-5 ring-1 ring-ink/10 sm:p-6', className)} {...rest}>{children}</As>;
}

export function PageTitle({ title, lead, action }: { title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="display d3">{title}</h1>
        {lead && <p className="mt-2 max-w-xl text-[0.95rem] text-stone-700">{lead}</p>}
      </div>
      {action}
    </header>
  );
}

export function CardTitle({ children, to, more }: { children: React.ReactNode; to?: string; more?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="eyebrow text-stone-700">{children}</h2>
      {to && more && <Link to={to} className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-brand underline-offset-4 hover:underline">{more}<ChevFwd size={14} /></Link>}
    </div>
  );
}

/** Label / value row for read-only summaries. */
export function Row({ k, children, className }: { k: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-6 py-3', className)}>
      <dt className="shrink-0 text-[0.88rem] text-stone-700">{k}</dt>
      <dd className="ms-auto min-w-0 text-end text-[0.95rem] font-semibold">{children}</dd>
    </div>
  );
}
