import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/misc';
import { useI18n } from '@/services/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Clinical surfaces use tighter corners. */
  square?: boolean;
}

const WIDTH = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };
const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Escape to close, focus restore, scroll lock. Sheet on phones. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', square }: Props) {
  const { t } = useI18n();
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el;
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (items.length === 0) { e.preventDefault(); return; }
      const a = items[0], z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === el)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      body.style.overflow = prevOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-aubergine-900/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-sheet-up flex-col bg-ivory text-ink shadow-lift outline-none',
          square ? 'rounded-t-xl sm:rounded-lg' : 'rounded-t-[1.75rem] sm:rounded-[1.5rem]', WIDTH[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b rule px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold leading-snug">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-stone-700">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={t.a.close} className="-me-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-700 hover:bg-ink/[0.06]">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
        {footer && <footer className="safe-b flex flex-wrap items-center justify-end gap-2.5 border-t rule px-5 pt-4 sm:px-7 sm:pb-5">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
