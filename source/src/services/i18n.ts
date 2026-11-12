import { create } from 'zustand';
import type { Lang, Text } from '@/types';
import { en } from '@/locales/en';
import { ar } from '@/locales/ar';
import { KEYS, localKV } from './storage';
import { pick } from '@/utils/misc';

/** The English dictionary defines the shape; Arabic must satisfy it (compile-time completeness). */
export type Dict = typeof en;
const DICTS: Record<Lang, Dict> = { en, ar };

/** Arabic-first: every experience opens in Arabic unless the visitor chose otherwise. */
export const DEFAULT_LANG: Lang = 'ar';

function initial(): Lang {
  const saved = localKV.getItem(KEYS.lang);
  return saved === 'en' || saved === 'ar' ? saved : DEFAULT_LANG;
}

function applyToDocument(lang: Lang) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

export const useLang = create<LangState>((set, get) => ({
  lang: initial(),
  setLang: (lang) => {
    localKV.setItem(KEYS.lang, lang);
    applyToDocument(lang);
    set({ lang });
  },
  toggle: () => get().setLang(get().lang === 'ar' ? 'en' : 'ar'),
}));

applyToDocument(useLang.getState().lang);

// Keep the language in step across tabs of the same browser.
window.addEventListener('storage', (e) => {
  if (e.key === KEYS.lang && (e.newValue === 'ar' || e.newValue === 'en') && e.newValue !== useLang.getState().lang) {
    applyToDocument(e.newValue);
    useLang.setState({ lang: e.newValue });
  }
});

/** Replace {name} placeholders. */
export function fmt(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

export function useI18n() {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const toggle = useLang((s) => s.toggle);
  const isRTL = lang === 'ar';
  return {
    lang,
    isRTL,
    dir: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    t: DICTS[lang],
    /** Resolve bilingual or free text for the current language. */
    L: (v: Text | null | undefined) => pick(v, lang),
    setLang,
    toggle,
  };
}
