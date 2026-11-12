import { useState } from 'react';
import { CircleCheck, Stethoscope, TriangleAlert, UserRound } from 'lucide-react';
import { useI18n } from '@/services/i18n';
import { useDb } from '@/services/db';
import { PageHero } from './PageHero';
import { Field, Ltr, Notice } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact() {
  const { t } = useI18n();
  const c = t.pub.contact;
  const addMessage = useDb((s) => s.addMessage);
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const errors = {
    name: form.name.trim().length < 2 ? c.v.name : null,
    email: !EMAIL.test(form.email.trim()) ? c.v.email : null,
    message: form.message.trim().length < 10 ? c.v.message : null,
  };
  const valid = !errors.name && !errors.email && !errors.message;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    addMessage({ name: form.name.trim(), email: form.email.trim(), topic: form.topic, message: form.message.trim() });
    setSent(true);
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} intro={c.intro} seed={41} compact />
      <section className="bg-ivory py-14 lg:py-20">
        <div className="page grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            {sent ? (
              <div role="status" className="rounded-[1.5rem] border border-ok/25 bg-ok-bg/60 p-8">
                <CircleCheck size={28} className="text-ok" aria-hidden="true" />
                <h2 className="display d3 mt-5">{c.sentTitle}</h2>
                <p className="mt-3 max-w-md text-stone-800">{c.sentBody}</p>
                <Button className="mt-6" variant="outline" onClick={() => { setSent(false); setTouched(false); setForm({ name: '', email: '', topic: 'general', message: '' }); }}>{c.another}</Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={c.name} error={touched ? errors.name : null}>
                    {(a) => <input id={a.id} className="field" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={a.invalid} aria-describedby={a.describedBy} />}
                  </Field>
                  <Field label={c.email} error={touched ? errors.email : null}>
                    {(a) => <input id={a.id} type="email" dir="ltr" className="field text-start" value={form.email} onChange={set('email')} autoComplete="email" aria-invalid={a.invalid} aria-describedby={a.describedBy} />}
                  </Field>
                </div>
                <Field label={c.topic}>
                  {(a) => (
                    <select id={a.id} className="field" value={form.topic} onChange={set('topic')}>
                      {(Object.keys(c.topics) as Array<keyof typeof c.topics>).map((k) => <option key={k} value={k}>{c.topics[k]}</option>)}
                    </select>
                  )}
                </Field>
                <Field label={c.message} error={touched ? errors.message : null}>
                  {(a) => <textarea id={a.id} rows={6} className="field resize-y" value={form.message} onChange={set('message')} aria-invalid={a.invalid} aria-describedby={a.describedBy} />}
                </Field>
                <Notice>{c.prototype}</Notice>
                <div><Button type="submit" size="lg">{c.send}</Button></div>
              </form>
            )}
          </div>
          <aside className="grid content-start gap-10 lg:col-span-5">
            <div>
              <h2 className="eyebrow text-brand">{c.supportTitle}</h2>
              <dl className="mt-4 border-t rule">
                <div className="flex justify-between gap-6 border-b rule py-3.5"><dt className="text-stone-700">{c.supportEmail}</dt><dd><Ltr className="font-semibold">support@dermiq.demo</Ltr></dd></div>
                <div className="flex justify-between gap-6 border-b rule py-3.5"><dt className="text-stone-700">{c.supportPhone}</dt><dd><Ltr className="font-semibold">+966 12 000 0100</Ltr></dd></div>
                <div className="flex justify-between gap-6 border-b rule py-3.5"><dt className="text-stone-700">{c.hours}</dt><dd className="font-semibold">{t.pub.footer.supportHours}</dd></div>
              </dl>
              <p className="mt-3 text-[0.8rem] text-stone-700">{t.pub.footer.supportNote}</p>
            </div>
            <Notice tone="warn" title={c.urgentTitle} icon={<TriangleAlert size={16} aria-hidden="true" />}>{c.urgent}</Notice>
            <div>
              <h2 className="eyebrow text-brand">{c.accessTitle}</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button to="/login/patient" variant="outline" icon={<UserRound size={17} aria-hidden="true" />}>{t.pub.nav.patientLogin}</Button>
                <Button to="/login/physician" variant="outline" icon={<Stethoscope size={17} aria-hidden="true" />}>{t.pub.nav.physicianLogin}</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
