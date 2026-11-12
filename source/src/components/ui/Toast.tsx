import { create } from 'zustand';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';
import type { ErrorCode, Result } from '@/services/db';

type Tone = 'ok' | 'bad' | 'info';
interface Item { id: number; tone: Tone; text: string }
interface ToastState { items: Item[]; push: (tone: Tone, text: string) => void; dismiss: (id: number) => void }

let seq = 0;
export const useToast = create<ToastState>((set, get) => ({
  items: [],
  push: (tone, text) => {
    const id = ++seq;
    set({ items: [...get().items.slice(-2), { id, tone, text }] });
    window.setTimeout(() => get().dismiss(id), tone === 'bad' ? 6500 : 4200);
  },
  dismiss: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
}));

/** Show the outcome of a store action. Returns true on success. */
export function useNotify() {
  const { t } = useI18n();
  const push = useToast((s) => s.push);
  return {
    ok: (text: string) => push('ok', text),
    info: (text: string) => push('info', text),
    bad: (text: string) => push('bad', text),
    error: (code: ErrorCode) => push('bad', t.err[code]),
    result: <T,>(r: Result<T>, success: string): boolean => {
      if (r.ok) { push('ok', success); return true; }
      push('bad', t.err[r.error]);
      return false;
    },
  };
}

const ICON = { ok: CircleCheck, bad: CircleAlert, info: Info };

export function Toaster({ className }: { className?: string }) {
  const { t } = useI18n();
  const items = useToast((s) => s.items);
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div aria-live="polite" role="status" className={cn('pointer-events-none fixed inset-x-0 z-[90] flex flex-col items-center gap-2 px-4', className ?? 'bottom-6')}>
      {items.map((i) => {
        const Icon = ICON[i.tone];
        return (
          <div key={i.id} className={cn(
            'pointer-events-auto flex w-full max-w-md animate-sheet-up items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lift',
            i.tone === 'bad' ? 'bg-bad text-white' : 'bg-aubergine text-ivory',
          )}>
            <Icon size={18} className={cn('mt-0.5 shrink-0', i.tone === 'ok' && 'text-metal-300')} aria-hidden="true" />
            <p className="min-w-0 flex-1 leading-relaxed">{i.text}</p>
            <button type="button" onClick={() => dismiss(i.id)} aria-label={t.a.close} className="-me-1 shrink-0 rounded-full p-1 opacity-70 hover:opacity-100">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
