import type { ApprovedTreatmentHeadID, L10n } from '@/types';

/**
 * Product facts — the single place where product statements live.
 * Every value here comes from the project brief or from the supplied reference drawings.
 * Nothing in this file is a clinical or regulatory claim.
 */

/** There is exactly ONE approved treatment head. Do not add entries. */
export const APPROVED_HEAD: {
  id: ApprovedTreatmentHeadID;
  name: L10n;
  grid: string;
  needleCount: number;
  needleType: L10n;
} = {
  id: 'DQ-HEAD-01',
  name: { en: 'DermiQ Treatment Head', ar: 'رأس DermiQ العلاجي' },
  grid: '3 × 3',
  needleCount: 9,
  needleType: { en: 'Hollow microneedles', ar: 'إبر دقيقة مجوّفة' },
};

/** Illustrative prototype dose range (demo data only — never a recommendation). */
export const DEMO_DOSE = { min: 0.1, max: 0.5, step: 0.1 } as const;
export const DEMO_DOSE_STEPS = [0.1, 0.2, 0.3, 0.4, 0.5] as const;

export const PEN = {
  lengthMm: 155,
} as const;

export interface LayerSpec {
  key: 'support' | 'flex' | 'contact';
  /** Name used by the brief. */
  name: L10n;
  /** Name printed on the reference drawing. */
  drawingName: L10n;
  role: L10n;
  /** Thickness as printed on the reference drawing (conceptual). */
  drawingValue: string;
}

export const HEAD_LAYERS: LayerSpec[] = [
  {
    key: 'support',
    name: { en: 'Structural Support Layer', ar: 'طبقة الدعم الهيكلي' },
    drawingName: { en: 'Rigid support ring', ar: 'حلقة الدعم الصلبة' },
    role: { en: 'The rigid part that seats the head on the pen.', ar: 'الجزء الصلب الذي يثبّت الرأس على القلم.' },
    drawingValue: '4.0 mm',
  },
  {
    key: 'flex',
    name: { en: 'Flexible TPU / Silicone Layer', ar: 'الطبقة المرنة (TPU / سيليكون)' },
    drawingName: { en: 'Flexible elastomeric ring', ar: 'الحلقة المطاطية المرنة' },
    role: { en: 'An elastic ring intended to let the head follow the curve of the scalp.', ar: 'حلقة مطاطية يُراد بها أن يتبع الرأس انحناء فروة الرأس.' },
    drawingValue: '3.2 mm',
  },
  {
    key: 'contact',
    name: { en: 'Needle Contact Layer', ar: 'طبقة تلامس الإبر' },
    drawingName: { en: 'Microneedle base plate', ar: 'قاعدة الإبر الدقيقة' },
    role: { en: 'The transparent plate that carries the nine hollow microneedles.', ar: 'القاعدة الشفافة التي تحمل الإبر التسع الدقيقة المجوّفة.' },
    drawingValue: '3.0 mm',
  },
];

export interface PartSpec { key: string; name: L10n; note: L10n }

export const CARTRIDGE_PARTS: PartSpec[] = [
  {
    key: 'medication',
    name: { en: 'Medication Chamber', ar: 'حجرة الدواء' },
    note: { en: 'Upper chamber. In the concept: triamcinolone acetonide, white powder.', ar: 'الحجرة العلوية. في المفهوم: تريامسينولون أسيتونيد، مسحوق أبيض.' },
  },
  {
    key: 'collar',
    name: { en: 'External Twist Collar', ar: 'الطوق الدوّار الخارجي' },
    note: { en: 'The purple ring on the outside of the cartridge body.', ar: 'الحلقة البنفسجية على جسم الخرطوشة من الخارج.' },
  },
  {
    key: 'stopper',
    name: { en: 'Internal Rubber Stopper', ar: 'السدادة المطاطية الداخلية' },
    note: { en: 'Inside the cartridge, between the two chambers.', ar: 'داخل الخرطوشة، بين الحجرتين.' },
  },
  {
    key: 'diluent',
    name: { en: 'Diluent Chamber', ar: 'حجرة المذيب' },
    note: { en: 'Lower chamber. In the concept: clear, colourless diluent (normal saline proposed).', ar: 'الحجرة السفلية. في المفهوم: مذيب شفاف عديم اللون (المقترح محلول ملحي طبيعي).' },
  },
];

export const PEN_PARTS: PartSpec[] = [
  {
    key: 'holder',
    name: { en: 'Transparent cartridge holder', ar: 'حامل الخرطوشة الشفاف' },
    note: { en: 'Keeps the cartridge visible while it is seated in the pen.', ar: 'يُبقي الخرطوشة ظاهرة وهي في موضعها داخل القلم.' },
  },
  {
    key: 'counter',
    name: { en: 'Mechanical dose counter window', ar: 'نافذة عدّاد الجرعة الميكانيكي' },
    note: { en: 'A physical window onto a printed counter. It is not a screen.', ar: 'نافذة حقيقية تطلّ على عدّاد مطبوع، وليست شاشة.' },
  },
  {
    key: 'selector',
    name: { en: 'Mechanical dose selector', ar: 'محدِّد الجرعة الميكانيكي' },
    note: { en: 'Turned by hand. There is nothing to charge and nothing to pair.', ar: 'يُدار باليد. لا شيء يُشحن ولا شيء يُقترن.' },
  },
  {
    key: 'drive',
    name: { en: 'Spring-driven drive rod', ar: 'ذراع دفع يعمل بنابض' },
    note: { en: 'Inside the body: a mechanical piston and spring. No motor.', ar: 'داخل الجسم: مكبس ميكانيكي ونابض، بلا محرّك.' },
  },
];
