import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/misc';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'light' | 'outline-light' | 'soft' | 'ok';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-ivory hover:bg-brand-700 active:bg-brand-800',
  dark: 'bg-aubergine text-ivory hover:bg-aubergine-700',
  outline: 'border border-ink/20 text-ink hover:border-ink/45 hover:bg-ink/[0.03]',
  ghost: 'text-ink hover:bg-ink/[0.06]',
  danger: 'bg-bad text-white hover:brightness-110',
  light: 'bg-ivory text-aubergine hover:bg-white',
  'outline-light': 'border border-ivory/30 text-ivory hover:border-ivory/70 hover:bg-ivory/[0.07]',
  soft: 'bg-lavender-200 text-brand-800 hover:bg-lavender',
  ok: 'bg-ok text-white hover:brightness-110',
};
const SIZE: Record<Size, string> = {
  xs: 'h-8 px-3 text-[0.8rem] gap-1.5',
  sm: 'h-9 px-3.5 text-[0.85rem] gap-1.5',
  md: 'h-11 px-5 text-[0.93rem] gap-2',
  lg: 'h-[3.25rem] px-7 text-base gap-2.5',
};

interface Common {
  variant?: Variant;
  size?: Size;
  /** Clinical (physician) surfaces use tighter corners. */
  square?: boolean;
  block?: boolean;
  icon?: React.ReactNode;
  iconEnd?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
type ButtonProps = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: undefined; href?: undefined };
type LinkProps = Common & { to: string; state?: unknown; replace?: boolean; 'aria-label'?: string; onClick?: () => void; href?: undefined; target?: string };
type AnchorProps = Common & { href: string; to?: undefined; target?: string; rel?: string; 'aria-label'?: string; download?: string };

function classes({ variant = 'primary', size = 'md', square, block, className }: Common) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold transition-colors duration-200',
    'disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45',
    square ? 'rounded-md' : 'rounded-full',
    VARIANT[variant], SIZE[size], block && 'w-full', className,
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkProps | AnchorProps>(function Button(props, ref) {
  const { variant, size, square, block, icon, iconEnd, className, children, ...rest } = props as Common & Record<string, unknown>;
  const cls = classes({ variant, size, square, block, className });
  const inner = (
    <>
      {icon}
      {children != null && <span>{children}</span>}
      {iconEnd}
    </>
  );
  if ('to' in props && props.to !== undefined) {
    const { to, ...linkRest } = rest as { to: string } & Record<string, unknown>;
    return <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={cls} {...linkRest}>{inner}</Link>;
  }
  if ('href' in props && props.href !== undefined) {
    return <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>;
  }
  const { type = 'button', ...btnRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return <button ref={ref as React.Ref<HTMLButtonElement>} type={type} className={cls} {...btnRest}>{inner}</button>;
});

export function IconButton({
  label, children, className, tone = 'dark', ...rest
}: { label: string; tone?: 'dark' | 'light'; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button" aria-label={label} title={label}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40',
        tone === 'dark' ? 'text-ink hover:bg-ink/[0.07]' : 'text-ivory hover:bg-ivory/10',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
