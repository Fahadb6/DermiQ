/**
 * DermiQ centralized product asset library.
 * Every product image used anywhere in the ecosystem is imported from here, so the pen,
 * the cartridge and the single treatment head look identical across all four experiences.
 * Sources: the supplied reference renders (see DESIGN_SYSTEM.md → "Asset provenance").
 */
import type { L10n } from '@/types';
import pen from './product/pen.webp';
import penCartridges from './product/pen-cartridges.webp';
import cartridge from './product/cartridge.webp';
import head34 from './product/head-34.webp';
import headArray from './product/head-array.webp';
import headTop from './product/head-top.webp';
import headSide from './product/head-side.webp';
import headMacro from './product/head-macro.webp';
import stateSeparated from './product/stage-separated.webp';
import stateTwist from './product/stage-twist.webp';
import stateMixed from './product/stage-mixed.webp';
import stateDetached from './product/stage-detached.webp';
import packaging from './product/packaging.webp';
import packagingWindow from './product/packaging-window.webp';
import loginPatient from './illustrations/login-patient.webp';
import loginPhysician from './illustrations/login-physician.webp';

export interface ProductAsset {
  src: string;
  w: number;
  h: number;
  alt: L10n;
  /** 'alpha' = cut-out (any surface) · 'light' = for light surfaces only · 'plate' = rectangular studio plate */
  kind: 'alpha' | 'light' | 'plate';
}

export const ASSETS = {
  pen: {
    src: pen, w: 1915, h: 260, kind: 'alpha',
    alt: { en: 'DermiQ mechanical pen, side view, with the cartridge seated in the transparent holder and the dose counter window showing 0.5 mL', ar: 'قلم DermiQ الميكانيكي من الجانب، والخرطوشة في موضعها داخل الحامل الشفاف، ونافذة عدّاد الجرعة تُظهر 0.5 mL' },
  },
  penCartridges: {
    src: penCartridges, w: 1264, h: 842, kind: 'plate',
    alt: { en: 'DermiQ pen with an empty transparent holder, above three separate dual-chamber cartridges', ar: 'قلم DermiQ بحامل شفاف فارغ، وتحته ثلاث خراطيش ثنائية الحجرة منفصلة' },
  },
  cartridge: {
    src: cartridge, w: 170, h: 488, kind: 'light',
    alt: { en: 'DermiQ dual-chamber cartridge: white powder in the upper chamber, purple twist collar, clear liquid in the lower chamber', ar: 'خرطوشة DermiQ ثنائية الحجرة: مسحوق أبيض في الحجرة العلوية، وطوق دوّار بنفسجي، وسائل شفاف في الحجرة السفلية' },
  },
  head34: {
    src: head34, w: 732, h: 629, kind: 'light',
    alt: { en: 'DermiQ treatment head, three-quarter view, showing the white support, purple flexible ring and transparent needle plate', ar: 'رأس DermiQ العلاجي بمنظور مائل، يُظهر الدعامة البيضاء والحلقة المرنة البنفسجية وقاعدة الإبر الشفافة' },
  },
  headArray: {
    src: headArray, w: 411, h: 414, kind: 'light',
    alt: { en: 'Underside of the DermiQ treatment head: nine hollow microneedles in a 3 × 3 grid', ar: 'الوجه السفلي لرأس DermiQ العلاجي: تسع إبر دقيقة مجوّفة في شبكة 3 × 3' },
  },
  headTop: {
    src: headTop, w: 422, h: 406, kind: 'light',
    alt: { en: 'DermiQ treatment head seen from above', ar: 'رأس DermiQ العلاجي من الأعلى' },
  },
  headSide: {
    src: headSide, w: 528, h: 395, kind: 'light',
    alt: { en: 'DermiQ treatment head, side elevation, showing three stacked layers and the needle tips', ar: 'رأس DermiQ العلاجي من الجانب، يُظهر ثلاث طبقات متراكبة وأطراف الإبر' },
  },
  headMacro: {
    src: headMacro, w: 588, h: 310, kind: 'light',
    alt: { en: 'Close-up of hollow microneedles with bevelled tips and visible outlets', ar: 'لقطة مقرّبة لإبر دقيقة مجوّفة بأطراف مشطوفة ومخارج ظاهرة' },
  },
  /* The four cartridge stages come from the owner's reference sheet "External Cartridge Preparation & Pen
     Integration", re-framed one stage per tile. Geometry and colours are as supplied. */
  stateSeparated: {
    src: stateSeparated, w: 900, h: 1500, kind: 'plate',
    alt: { en: 'DermiQ dual-chamber cartridge before mixing: white powder in the upper chamber, the purple twist-to-mix collar, and clear liquid in the lower chamber', ar: 'خرطوشة DermiQ ثنائية الحجرة قبل المزج: مسحوق أبيض في الحجرة العلوية، والطوق الدوّار البنفسجي، وسائل شفاف في الحجرة السفلية' },
  },
  stateTwist: {
    src: stateTwist, w: 900, h: 1500, kind: 'plate',
    alt: { en: 'A gloved hand turning the collar of the DermiQ cartridge while the two contents swirl together inside', ar: 'يد بقفاز تدير طوق خرطوشة DermiQ، والمحتويان يختلطان داخلها' },
  },
  stateMixed: {
    src: stateMixed, w: 900, h: 1500, kind: 'plate',
    alt: { en: 'DermiQ cartridge after mixing: both chambers hold an even, blue-tinted solution', ar: 'خرطوشة DermiQ بعد المزج: محلول متجانس مائل إلى الزرقة في الحجرتين' },
  },
  stateDetached: {
    src: stateDetached, w: 900, h: 1500, kind: 'plate',
    alt: { en: 'The empty upper chamber lifted off the DermiQ cartridge; the lower part, with its collar, holds the solution', ar: 'الحجرة العلوية الفارغة وقد فُصلت عن خرطوشة DermiQ، والجزء السفلي بطوقه يحتوي المحلول' },
  },
  packaging: {
    src: packaging, w: 1672, h: 941, kind: 'plate',
    alt: { en: 'DermiQ cartridge packaging concept: a white and purple carton with four cartridges visible through a window', ar: 'تصوّر عبوة خراطيش DermiQ: علبة بيضاء وبنفسجية تظهر من نافذتها أربع خراطيش' },
  },
  packagingWindow: {
    src: packagingWindow, w: 670, h: 423, kind: 'plate',
    alt: { en: 'Four DermiQ dual-chamber cartridges seen through the packaging window', ar: 'أربع خراطيش DermiQ ثنائية الحجرة من خلال نافذة العبوة' },
  },
} satisfies Record<string, ProductAsset>;

export type AssetKey = keyof typeof ASSETS;

/**
 * Editorial illustrations (not product imagery). The two sign-in figures were generated for this
 * project in the site palette; they depict no real person.
 */
export const ILLUSTRATIONS = {
  loginPatient: {
    src: loginPatient, w: 896, h: 1200, bg: '#DFD7EC',
    alt: { en: 'Illustration: a patient at home, checking his plan on a phone', ar: 'رسم توضيحي: مريض في منزله يتابع خطته على هاتفه' } as L10n,
  },
  loginPhysician: {
    src: loginPhysician, w: 896, h: 1200, bg: '#E0D8ED',
    alt: { en: 'Illustration: a physician reviewing a treatment plan on a tablet', ar: 'رسم توضيحي: طبيبة تراجع خطة علاجية على جهاز لوحي' } as L10n,
  },
};
