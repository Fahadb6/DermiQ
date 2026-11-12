import type { FaqItem } from '@/types';

/** Sample FAQ content. Fictional prototype copy — has not been through real medical review. */
export const FAQ: FaqItem[] = [
  {
    id: 'faq-electronic', topic: 'product', onHome: true,
    q: { en: 'Is the DermiQ pen electronic?', ar: 'هل قلم DermiQ إلكتروني؟' },
    a: {
      en: 'No. The pen is a mechanical concept: a spring-driven mechanism, a mechanical dose selector and a physical dose counter window. It has no battery, screen, sensor, Bluetooth or Wi-Fi.',
      ar: 'لا. القلم مفهوم ميكانيكي: آلية تعمل بنابض، ومحدِّد جرعة ميكانيكي، ونافذة عدّاد جرعة حقيقية. لا بطارية فيه ولا شاشة ولا مستشعر ولا بلوتوث ولا واي فاي.',
    },
  },
  {
    id: 'faq-app-knows', topic: 'platform', onHome: true,
    q: { en: 'Does the app know when the pen is used?', ar: 'هل يعلم التطبيق متى يُستخدم القلم؟' },
    a: {
      en: 'No. The pen sends no data. A session appears as completed only when you report it yourself, and it is always labelled patient-reported.',
      ar: 'لا. القلم لا يرسل أي بيانات. لا تظهر الجلسة مكتملة إلا إذا سجّلتها أنت بنفسك، وتُوسم دائمًا بأنها «بإفادة المريض».',
    },
  },
  {
    id: 'faq-heads', topic: 'product', onHome: true,
    q: { en: 'How many treatment heads are there?', ar: 'كم عدد الرؤوس العلاجية؟' },
    a: {
      en: 'One. DermiQ has a single approved treatment head with nine hollow microneedles in a 3 × 3 arrangement. There are no sizes or alternative patterns to choose from.',
      ar: 'رأس واحد. يأتي DermiQ برأس علاجي معتمد واحد فيه تسع إبر دقيقة مجوّفة مرتبة 3 × 3، ولا توجد مقاسات أو أنماط بديلة للاختيار بينها.',
    },
  },
  {
    id: 'faq-dose', topic: 'platform', onHome: true,
    q: { en: 'Who decides the dose?', ar: 'من يحدّد الجرعة؟' },
    a: {
      en: 'The physician, and only the physician. The platform displays the approved value; it never calculates, recommends or adjusts a dose. Doses shown in this prototype are illustrative demo data.',
      ar: 'الطبيب وحده. المنصة تعرض القيمة المعتمدة فقط، ولا تحسب الجرعة ولا توصي بها ولا تعدّلها. والجرعات الظاهرة في هذا النموذج الأولي بيانات تجريبية للإيضاح.',
    },
  },
  {
    id: 'faq-approved', topic: 'platform', onHome: true,
    q: { en: 'Is DermiQ an approved medical device?', ar: 'هل DermiQ جهاز طبي معتمد؟' },
    a: {
      en: 'No. DermiQ is a concept prototype. It has not been clinically validated or approved by any regulatory authority, and this website makes no claim about treatment results.',
      ar: 'لا. DermiQ نموذج مفاهيمي أولي، لم يخضع لتحقق سريري ولم تعتمده أي جهة تنظيمية، ولا يتضمن هذا الموقع أي ادعاء بشأن نتائج العلاج.',
    },
  },
  {
    id: 'faq-storage', topic: 'privacy', onHome: true,
    q: { en: 'Where is the data stored?', ar: 'أين تُحفظ البيانات؟' },
    a: {
      en: 'In this prototype, all data — including the fictional demo records — is stored in your browser’s local storage on this device. Nothing is sent to a server, and nothing syncs between devices.',
      ar: 'في هذا النموذج الأولي تُحفظ البيانات كلها، ومنها السجلات التجريبية الوهمية، في التخزين المحلي لمتصفحك على هذا الجهاز. لا يُرسل شيء إلى خادم، ولا مزامنة بين الأجهزة.',
    },
  },
  {
    id: 'faq-cartridge', topic: 'product',
    q: { en: 'What is inside the cartridge?', ar: 'ماذا تحتوي الخرطوشة؟' },
    a: {
      en: 'In the concept, the upper medication chamber holds triamcinolone acetonide as a white powder and the lower diluent chamber holds a clear, colourless diluent (normal saline is proposed). The formulation, ratio, stability and sterility have not been validated.',
      ar: 'في المفهوم، تحتوي حجرة الدواء العلوية على تريامسينولون أسيتونيد في صورة مسحوق أبيض، وتحتوي حجرة المذيب السفلية على مذيب شفاف عديم اللون (والمقترح محلول ملحي طبيعي). ولم يُتحقق بعد من التركيبة ولا من النسبة ولا الثبات ولا التعقيم.',
    },
  },
  {
    id: 'faq-locked', topic: 'platform',
    q: { en: 'What does “digitally locked” mean?', ar: 'ما معنى «مقفلة رقميًا»؟' },
    a: {
      en: 'It means the approved plan cannot be edited in the software until the physician reopens it. It is a record-keeping control only and has no effect on the physical pen.',
      ar: 'أي إن الخطة المعتمدة لا يمكن تعديلها داخل النظام حتى يعيد الطبيب فتحها. هو ضبط لحفظ السجل فقط، ولا أثر له في القلم نفسه.',
    },
  },
  {
    id: 'faq-walkthrough', topic: 'platform',
    q: { en: 'Does the walkthrough record a session?', ar: 'هل يسجّل الدليل التثقيفي جلسة؟' },
    a: {
      en: 'No. The session-preparation walkthrough is educational. Finishing it does not register a session and does not confirm that any physical preparation took place.',
      ar: 'لا. دليل الاستعداد للجلسة تثقيفي بحت. إكماله لا يسجّل جلسة ولا يؤكد حصول أي تحضير فعلي.',
    },
  },
  {
    id: 'faq-photos', topic: 'platform',
    q: { en: 'Can photo comparison show whether treatment is working?', ar: 'هل تبيّن مقارنة الصور نجاح العلاج؟' },
    a: {
      en: 'No. Side-by-side photos are a visual record for the patient and the physician. The platform does not analyse images, measure change or diagnose.',
      ar: 'لا. الصور المتجاورة سجل بصري للمريض والطبيب. المنصة لا تحلّل الصور ولا تقيس التغيّر ولا تشخّص.',
    },
  },
  {
    id: 'faq-reminders', topic: 'appointments',
    q: { en: 'Are reminders sent by SMS or email?', ar: 'هل تُرسل التذكيرات برسائل نصية أو بالبريد؟' },
    a: {
      en: 'Not in this prototype. Reminders and notifications appear inside the app only. No SMS, email or push notification is sent.',
      ar: 'ليس في هذا النموذج الأولي. تظهر التذكيرات والإشعارات داخل التطبيق فقط، ولا تُرسل رسائل نصية ولا بريد إلكتروني ولا إشعارات فورية.',
    },
  },
  {
    id: 'faq-change-appt', topic: 'appointments',
    q: { en: 'Can a patient change an appointment in the app?', ar: 'هل يستطيع المريض تغيير موعده من التطبيق؟' },
    a: {
      en: 'No. Appointments are created and changed by the physician’s clinic. The app shows the current date and announces any change.',
      ar: 'لا. المواعيد تنشئها عيادة الطبيب وتعدّلها. يعرض التطبيق التاريخ الحالي ويُعلم المريض بأي تغيير.',
    },
  },
  {
    id: 'faq-missed', topic: 'appointments',
    q: { en: 'What if a session is missed?', ar: 'ماذا لو فاتت جلسة؟' },
    a: {
      en: 'Record it honestly in Session History and contact the clinic. What happens next is the physician’s decision; the app does not reschedule or adjust the plan.',
      ar: 'تُسجَّل بصدق في سجل الجلسات ويجري التواصل مع العيادة. ما يحدث بعد ذلك قرار الطبيب؛ فالتطبيق لا يعيد الجدولة ولا يعدّل الخطة.',
    },
  },
  {
    id: 'faq-fictional', topic: 'privacy',
    q: { en: 'Are the patients in the demo real?', ar: 'هل المرضى الظاهرون في العرض حقيقيون؟' },
    a: {
      en: 'No. Every patient, physician, clinic, note and photo in the demo is fictional. The scalp images are computer-generated illustrations.',
      ar: 'لا. كل مريض وطبيب وعيادة وملاحظة وصورة في العرض وهمي. وصور فروة الرأس رسوم مولّدة حاسوبيًا.',
    },
  },
  {
    id: 'faq-advice', topic: 'condition',
    q: { en: 'Does this website give medical advice?', ar: 'هل يقدّم هذا الموقع نصيحة طبية؟' },
    a: {
      en: 'No. The content is general education and does not replace a consultation. For anything about your own condition or treatment, speak to your physician.',
      ar: 'لا. المحتوى تثقيف عام ولا يغني عن الاستشارة. وفي كل ما يخص حالتك أو علاجك، تحدّث إلى طبيبك.',
    },
  },
  {
    id: 'faq-contagious', topic: 'condition',
    q: { en: 'Is alopecia areata contagious?', ar: 'هل الثعلبة البقعية معدية؟' },
    a: {
      en: 'No. It is generally understood as an autoimmune condition and cannot be passed from person to person. A dermatologist can explain what is known about an individual case.',
      ar: 'لا. تُفهم عمومًا على أنها حالة مناعية ذاتية ولا تنتقل من شخص إلى آخر. ويستطيع طبيب الجلدية أن يوضح ما يُعرف عن كل حالة بعينها.',
    },
  },
];
