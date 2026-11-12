import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, type LucideProps } from 'lucide-react';
import { cn } from '@/utils/misc';

/** Direction-aware icons: they mirror automatically in RTL. */
export const Fwd = (p: LucideProps) => <ArrowRight {...p} className={cn('flip-rtl', p.className)} aria-hidden="true" />;
export const Bwd = (p: LucideProps) => <ArrowLeft {...p} className={cn('flip-rtl', p.className)} aria-hidden="true" />;
export const ChevFwd = (p: LucideProps) => <ChevronRight {...p} className={cn('flip-rtl', p.className)} aria-hidden="true" />;
export const ChevBwd = (p: LucideProps) => <ChevronLeft {...p} className={cn('flip-rtl', p.className)} aria-hidden="true" />;
export const UpFwd = (p: LucideProps) => <ArrowUpRight {...p} className={cn('flip-rtl', p.className)} aria-hidden="true" />;
