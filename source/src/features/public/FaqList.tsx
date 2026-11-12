import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/types';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';

export function FaqList({ items, initialOpen = true }: { items: FaqItem[]; initialOpen?: boolean }) {
  const { L } = useI18n();
  const base = useId();
  const [open, setOpen] = useState<string | null>(initialOpen ? items[0]?.id ?? null : null);
  return (
    <dl className="border-t rule">
      {items.map((it) => {
        const on = open === it.id;
        const pid = `${base}-${it.id}`;
        return (
          <div key={it.id} className="border-b rule">
            <dt>
              <button
                type="button" aria-expanded={on} aria-controls={pid} onClick={() => setOpen(on ? null : it.id)}
                className="group flex w-full items-start justify-between gap-6 py-5 text-start"
              >
                <span className={cn('text-[1.06rem] font-bold leading-snug transition-colors', on ? 'text-brand' : 'group-hover:text-brand')}>{L(it.q)}</span>
                <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors', on ? 'border-brand bg-brand text-ivory' : 'border-ink/20')}>
                  <Plus size={15} className={cn('transition-transform duration-300', on && 'rotate-45')} aria-hidden="true" />
                </span>
              </button>
            </dt>
            <dd id={pid} aria-hidden={!on} className={cn('grid transition-[grid-template-rows] duration-300 ease-precise', on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pe-10 leading-relaxed text-stone-800">{L(it.a)}</p>
              </div>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
