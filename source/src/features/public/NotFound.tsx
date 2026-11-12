import { useI18n } from '@/services/i18n';
import { NineDot } from '@/components/brand/Brand';
import { Button } from '@/components/ui/Button';

export function NotFound({ to = '/', dark = true }: { to?: string; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <section className={dark ? 'bg-aubergine text-ivory' : ''}>
      <div className="page flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
        <NineDot size={44} className={dark ? 'text-ivory/60' : 'text-stone-400'} />
        <p className="tech mt-8 opacity-60">404</p>
        <h1 className="display d2 mt-3">{t.nf.title}</h1>
        <p className="mt-4 max-w-sm opacity-70">{t.nf.body}</p>
        <Button to={to} variant={dark ? 'light' : 'dark'} className="mt-8">{t.nf.home}</Button>
      </div>
    </section>
  );
}
