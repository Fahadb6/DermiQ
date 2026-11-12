import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, RotateCcw } from 'lucide-react';
import type { NotificationPrefs } from '@/types';
import { useI18n } from '@/services/i18n';
import { useAuth } from '@/services/auth';
import { useDb } from '@/services/db';
import { cn } from '@/utils/misc';
import { Avatar, Ltr, Notice, Toggle } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import { Confirm } from '@/components/ui/Confirm';
import { useNotify } from '@/components/ui/Toast';
import { Card, CardTitle, PageTitle, Row, usePatient } from './ui';

const KEYS: Array<keyof NotificationPrefs> = ['appointments', 'planUpdates', 'sessions', 'photos'];

export function PatientSettings() {
  const patient = usePatient();
  const { t, L, lang, setLang } = useI18n();
  const s = t.pt.settings;
  const logout = useAuth((x) => x.logout);
  const setPrefs = useDb((x) => x.setPatientPrefs);
  const reset = useDb((x) => x.resetDemo);
  const physician = useDb((x) => x.db.physicians.find((p) => p.id === patient.physicianId));
  const notify = useNotify();
  const [ask, setAsk] = useState(false);

  return (
    <>
      <PageTitle title={s.title} />
      <div className="grid gap-5">
        <Card>
          <CardTitle>{s.profile}</CardTitle>
          <div className="flex items-center gap-4">
            <Avatar name={L(patient.name)} size={56} />
            <div><p className="display d4">{L(patient.name)}</p><Ltr mono className="text-[0.76rem] text-stone-700">{patient.id}</Ltr></div>
          </div>
          <dl className="mt-4 divide-y divide-ink/10">
            <Row k={s.email}><Ltr>{patient.email}</Ltr></Row>
            <Row k={s.phone}><Ltr>{patient.phone}</Ltr></Row>
            <Row k={s.city}>{L(patient.city)}</Row>
          </dl>
          <p className="mt-3 text-[0.8rem] text-stone-700">{s.profileNote} {t.note.fictional}</p>
        </Card>

        <Card>
          <CardTitle>{s.language}</CardTitle>
          <div role="radiogroup" aria-label={t.lang.label} className="grid grid-cols-2 gap-2">
            {(['ar', 'en'] as const).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)} lang={l} data-testid={`lang-${l}`}
                className={cn('h-12 rounded-xl text-[0.95rem] font-bold ring-1 ring-inset transition-colors', lang === l ? 'bg-aubergine text-ivory ring-aubergine' : 'bg-ivory ring-ink/15 hover:ring-ink/40')}>
                {t.lang[l]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[0.8rem] text-stone-700">{t.lang.hint}</p>
        </Card>

        <Card>
          <CardTitle>{s.notifications}</CardTitle>
          <div className="divide-y divide-ink/10">
            {KEYS.map((k) => (
              <div key={k} className="py-3">
                <Toggle checked={patient.notificationPrefs[k]} label={s.prefs[k].k} description={s.prefs[k].b}
                  onChange={(v) => notify.result(setPrefs(patient.id, { ...patient.notificationPrefs, [k]: v }), s.saved)} />
              </div>
            ))}
          </div>
          <Notice className="mt-4">{t.note.inApp}</Notice>
        </Card>

        {physician && (
          <Card>
            <CardTitle>{s.physician}</CardTitle>
            <div className="flex items-center gap-4">
              <Avatar name={L(physician.name)} size={48} />
              <div className="min-w-0">
                <p className="font-bold">{L(physician.name)}</p>
                <p className="text-[0.86rem] text-stone-700">{L(physician.specialty)} · {L(physician.clinic)}</p>
                <Ltr className="text-[0.84rem] text-stone-700">{physician.phone}</Ltr>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardTitle>{s.data}</CardTitle>
          <p className="text-[0.9rem] text-stone-800">{t.note.storage}</p>
          <p className="mt-2 text-[0.9rem] text-stone-800">{t.note.auth}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={() => setAsk(true)} data-testid="reset-demo">{s.reset}</Button>
            <Button to="/privacy" variant="ghost" size="sm">{t.pub.nav.privacy}</Button>
          </div>
        </Card>

        <Button variant="dark" size="lg" block onClick={logout} icon={<LogOut size={18} className="flip-rtl" aria-hidden="true" />} data-testid="signout">{s.signOut}</Button>
        <p className="text-center text-[0.74rem] text-stone-700">{s.version} · <Link to="/" className="underline underline-offset-4">dermiq</Link></p>
      </div>
      <Confirm open={ask} onClose={() => setAsk(false)} title={t.pub.privacy.eraseConfirmTitle} body={t.pub.privacy.eraseConfirmBody} confirmLabel={t.pub.privacy.erase} danger
        onConfirm={() => { reset(); setAsk(false); notify.ok(t.pub.privacy.erased); }} />
    </>
  );
}
