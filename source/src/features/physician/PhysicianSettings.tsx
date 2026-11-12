import { useState } from 'react';
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
import { KV, PageHead, Panel, usePhysician } from './ui';

const KEYS: Array<'planUpdates' | 'sessions' | 'photos'> = ['planUpdates', 'sessions', 'photos'];

export function PhysicianSettings() {
  const me = usePhysician();
  const { t, L, lang, setLang } = useI18n();
  const s = t.ph.settings;
  const logout = useAuth((x) => x.logout);
  const setPrefs = useDb((x) => x.setPhysicianPrefs);
  const reset = useDb((x) => x.resetDemo);
  const notify = useNotify();
  const [ask, setAsk] = useState(false);
  const prefs: NotificationPrefs = me.notificationPrefs;
  return (
    <>
      <PageHead title={s.title} />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <Panel title={s.profile}>
          <div className="flex items-center gap-4">
            <Avatar name={L(me.name)} size={52} className="!rounded-lg" />
            <div><p className="display d4">{L(me.name)}</p><p className="text-[0.86rem] text-stone-700">{L(me.title)}</p></div>
          </div>
          <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
            <KV k={s.specialty}>{L(me.specialty)}</KV>
            <KV k={s.clinic}>{L(me.clinic)}</KV>
            <KV k={s.license}><Ltr mono>{me.licenseNo}</Ltr></KV>
            <KV k={s.email}><Ltr>{me.email}</Ltr></KV>
            <KV k={s.phone}><Ltr>{me.phone}</Ltr></KV>
            <KV k={s.contentRole}>{me.canReviewContent ? s.yes : s.no}</KV>
          </dl>
          <p className="mt-3 text-[0.76rem] text-stone-700">{t.note.fictional}</p>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title={s.language}>
            <div role="radiogroup" aria-label={t.lang.label} className="grid grid-cols-2 gap-2">
              {(['ar', 'en'] as const).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)} lang={l} data-testid={`lang-${l}`}
                  className={cn('h-11 rounded-md border text-[0.93rem] font-bold transition-colors', lang === l ? 'border-ink bg-ink text-ivory' : 'border-ink/20 bg-white hover:border-ink/50')}>{t.lang[l]}</button>
              ))}
            </div>
          </Panel>
          <Panel title={s.notifications}>
            <div className="divide-y divide-ink/10">
              {KEYS.map((k) => (
                <div key={k} className="py-3 first:pt-0">
                  <Toggle checked={prefs[k]} label={s.prefs[k].k} description={s.prefs[k].b} onChange={(v) => notify.result(setPrefs({ ...prefs, [k]: v }), s.saved)} />
                </div>
              ))}
            </div>
            <Notice className="mt-3">{t.note.inApp}</Notice>
          </Panel>
          <Panel title={s.data}>
            <p className="text-[0.88rem] text-stone-800">{t.note.storage}</p>
            <p className="mt-2 text-[0.88rem] text-stone-800">{t.note.auth} {t.auth.twoTabs}</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button square variant="outline" size="sm" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={() => setAsk(true)} data-testid="reset-demo">{s.reset}</Button>
              <Button square variant="dark" size="sm" icon={<LogOut size={16} className="flip-rtl" aria-hidden="true" />} onClick={logout} data-testid="signout">{s.signOut}</Button>
            </div>
          </Panel>
        </div>
      </div>
      <Confirm open={ask} onClose={() => setAsk(false)} title={t.pub.privacy.eraseConfirmTitle} body={t.pub.privacy.eraseConfirmBody} confirmLabel={t.pub.privacy.erase} danger square
        onConfirm={() => { reset(); setAsk(false); notify.ok(t.pub.privacy.erased); }} />
    </>
  );
}
