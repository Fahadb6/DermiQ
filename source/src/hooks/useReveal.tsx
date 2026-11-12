import { useEffect, useRef, type ElementType } from 'react';
import { cn } from '@/utils/misc';

/** Adds `.in` when the element scrolls into view (CSS handles the motion and reduced-motion). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('in'); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({ as, delay = 0, className, children, ...rest }: { as?: ElementType; delay?: number; className?: string; children?: React.ReactNode } & Record<string, unknown>) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={cn('reveal', className)} style={{ '--d': `${delay}ms` } as React.CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
