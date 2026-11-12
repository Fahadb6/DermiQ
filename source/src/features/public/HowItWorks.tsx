import { Check, Stethoscope, UserRound, X } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { cn } from '@/utils/misc';
import { PageHero } from './PageHero';
import { Reveal } from '@/hooks/useReveal';
import { Button } from '@/components/ui/Button';

export function HowItWorks() {
  const { t } = useI18n();
  const h = t.pub.how;
  const steps = t.pub.journey.steps;
  const cols = ['physician', 'patient', 'platform'] as const;
  return (
    <>
      <PageHero eyebrow={h.eyebrow} title={h.title} intro={h.intro} seed={26} />

      <section className="bg-ivory py-20 lg:py-28">
        <div className="page">
          <Reveal as="h2" className="display d2">{h.rolesTitle}</Reveal>
          <Reveal delay={100} className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-[0.98rem]">
              <thead>
                <tr className="border-b border-ink/30 text-[0.82rem] text-stone-700">
                  <th scope="col" className="py-3 text-start font-semibold">{h.cols.action}</th>
                  {cols.map((c) => <th key={c} scope="col" className="w-[16%] py-3 text-center font-semibold">{h.cols[c]}</th>)}
                </tr>
              </thead>
              <tbody>
                {h.rows.map((r) => (
                  <tr key={r.k} className={cn('border-b rule', r.who === 'none' && 'bg-bad-bg/40')}>
                    <th scope="row" className="py-4 pe-4 text-start font-semibold">{r.k}</th>
                    {r.who === 'none' ? (
                      <td colSpan={3} className="py-4 text-center text-[0.9rem] font-bold text-bad">
                        <span className="inline-flex items-center gap-2"><X size={15} aria-hidden="true" />{h.noOne}</span>
                      </td>
                    ) : cols.map((c) => (
                      <td key={c} className="py-4 text-center">
                        {r.who === c
                          ? <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand text-ivory"><Check size={15} aria-hidden="true" /><span className="sr-only">{h.cols[c]}</span></span>
                          : <span className="text-stone-400" aria-hidden="true">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="bg-porcelain py-20 lg:py-28">
        <div className="page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="h2" className="display d2">{h.stepsTitle}</Reveal>
            <Reveal as="p" delay={80} className="mt-6 text-[0.9rem] text-stone-700">{t.pub.journey.note}</Reveal>
          </div>
          <ol className="border-t rule lg:col-span-8">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.k} delay={i * 50} className="grid gap-x-6 gap-y-1 border-b rule py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-baseline">
                <span className="tech num text-brand">{`0${i + 1}`}</span>
                <h3 className="display d4">{s.k}</h3>
                <p className="text-stone-800">{s.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink py-20 text-ivory lg:py-28">
        <div className="page grid gap-12 lg:grid-cols-12">
          <Reveal as="h2" className="display d2 lg:col-span-5">{h.limitsTitle}</Reveal>
          <ul className="border-t border-ivory/15 lg:col-span-7">
            {h.limits.map((l, i) => (
              <Reveal as="li" key={l} delay={i * 60} className="flex items-start gap-4 border-b border-ivory/15 py-5 text-[1.05rem]">
                <X size={18} className="mt-1 shrink-0 text-metal-300" aria-hidden="true" />
                <span>{l}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ivory py-20 lg:py-24">
        <div className="page flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="display d3">{h.try}</h2>
            <p className="mt-3 text-stone-800">{h.tryBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/login/patient" variant="primary" size="lg" icon={<UserRound size={18} aria-hidden="true" />}>{t.pub.nav.patientLogin}</Button>
            <Button to="/login/physician" variant="outline" size="lg" icon={<Stethoscope size={18} aria-hidden="true" />}>{t.pub.nav.physicianLogin}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
