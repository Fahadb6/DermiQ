import type { ArticleAccess, ArticleArt, ArticleStatus, EducationalCategory, L10n } from '@/types';

/**
 * Education Center content.
 * SAMPLE CONTENT — written for this prototype. It has not been reviewed by a real medical
 * professional. See MEDICAL_CONTENT_GOVERNANCE.md for the workflow real content must follow.
 *
 * Body markup (rendered by features/education/ArticleBody.tsx):
 *   "## "  heading      "> "  highlight      "- "  list item      "[fig:name]"  illustration
 */

export const CATEGORIES: EducationalCategory[] = [
  {
    id: 'cat-condition', order: 1,
    title: { en: 'Understanding Your Condition', ar: 'التعرف على الحالة' },
    description: { en: 'General, plain-language background to bring to the conversation with your physician.', ar: 'خلفية عامة بلغة مبسّطة تحملها معك إلى الحوار مع طبيبك.' },
  },
  {
    id: 'cat-dermiq', order: 2,
    title: { en: 'Understanding DermiQ', ar: 'التعرف على DermiQ' },
    description: { en: 'The pen, the cartridge, the single treatment head — and what the app does and does not do.', ar: 'القلم والخرطوشة والرأس العلاجي الواحد، وما يفعله التطبيق وما لا يفعله.' },
  },
  {
    id: 'cat-before', order: 3,
    title: { en: 'Before Your Appointment', ar: 'قبل الموعد' },
    description: { en: 'Arrive prepared: your questions, your plan, your dates.', ar: 'احضر مستعدًا: أسئلتك وخطتك ومواعيدك.' },
  },
  {
    id: 'cat-during', order: 4,
    title: { en: 'During Your Treatment Journey', ar: 'خلال رحلتك العلاجية' },
    description: { en: 'Documenting sessions and keeping a consistent photo record.', ar: 'توثيق الجلسات والحفاظ على سجل صور متّسق.' },
  },
  {
    id: 'cat-after', order: 5,
    title: { en: 'After Your Appointment', ar: 'بعد الموعد' },
    description: { en: 'What to note, what to ask, and what happens when a plan changes.', ar: 'ما الذي تدوّنه، وما الذي تسأل عنه، وماذا يحدث حين تتغيّر الخطة.' },
  },
  {
    id: 'cat-faq', order: 6,
    title: { en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' },
    description: { en: 'Short, searchable answers and a glossary of terms.', ar: 'إجابات قصيرة قابلة للبحث ومسرد للمصطلحات.' },
  },
];

export interface ArticleSeed {
  id: string;
  slug: string;
  categoryId: string;
  title: L10n;
  summary: L10n;
  body: L10n;
  readMinutes: number;
  access: ArticleAccess;
  status: ArticleStatus;
  featured: boolean;
  art: ArticleArt;
  related: string[];
  /** Days before "today" for created / updated / reviewed timestamps. */
  age: { created: number; updated: number; reviewed: number | null };
}

export const ARTICLE_SEEDS: ArticleSeed[] = [
  /* ------------------------------------------------------------ 1 · condition */
  {
    id: 'art-patchy', slug: 'patchy-hair-loss-explained', categoryId: 'cat-condition',
    title: { en: 'Patchy hair loss, explained plainly', ar: 'تساقط الشعر البقعي بلغة واضحة' },
    summary: {
      en: 'A calm, general introduction to alopecia areata — what the term means, what it does not mean, and why an individual assessment matters.',
      ar: 'مدخل هادئ وعام إلى الثعلبة البقعية: ماذا يعني المصطلح، وما الذي لا يعنيه، ولماذا يبقى التقييم الفردي هو الأساس.',
    },
    readMinutes: 4, access: 'public', status: 'published', featured: true, art: 'follicle',
    related: ['art-assessment', 'art-questions', 'art-glance'], age: { created: 96, updated: 21, reviewed: 20 },
    body: {
      en: `Alopecia areata is the medical name for a condition in which hair is lost in defined patches, most often on the scalp. It is generally understood as an autoimmune condition: the body's immune system affects hair follicles, and hair growth in that area pauses.

## What it is not
- It is not contagious. It cannot be passed to another person.
- It is not caused by poor hygiene or by something you did wrong.
- It does not look or behave the same way in every person.

> The course of the condition differs from one person to another. Only a physician who has examined you can describe your situation.

## Why assessment comes first
Several different conditions can cause hair loss, and they are managed in different ways. A dermatologist looks at the pattern, asks about your history, and decides whether any tests are needed before discussing options with you.

[fig:follicle]

## Where DermiQ fits
DermiQ is a design concept built around physician-supervised care. It does not diagnose, and it does not replace the conversation with your physician. This guide exists to help you arrive at that conversation better informed.`,
      ar: `الثعلبة البقعية هي الاسم الطبي لحالة يتساقط فيها الشعر على هيئة بقع محددة، وغالبًا في فروة الرأس. وتُفهم عمومًا على أنها حالة مناعية ذاتية: يؤثر جهاز المناعة في بصيلات الشعر فيتوقف نمو الشعر مؤقتًا في تلك المنطقة.

## ما الذي ليست عليه
- ليست معدية، ولا تنتقل من شخص إلى آخر.
- لا تنتج عن قلة النظافة ولا عن خطأ ارتكبته.
- لا تظهر ولا تتطور بالطريقة نفسها عند الجميع.

> يختلف مسار الحالة من شخص إلى آخر، والطبيب الذي فحصك هو وحده القادر على وصف حالتك.

## لماذا يأتي التقييم أولًا
لتساقط الشعر أسباب متعددة تختلف طرق التعامل معها. ينظر طبيب الجلدية إلى نمط التساقط، ويسأل عن تاريخك الصحي، ثم يقرر إن كانت هناك حاجة إلى فحوصات قبل أن يناقش معك الخيارات.

[fig:follicle]

## أين يقع DermiQ
DermiQ مفهوم تصميمي قائم على الرعاية بإشراف الطبيب. لا يشخّص الحالة، ولا يغني عن الحوار مع طبيبك. وُضع هذا الدليل ليساعدك على الوصول إلى ذلك الحوار وأنت أكثر إلمامًا.`,
    },
  },
  {
    id: 'art-assessment', slug: 'scalp-assessment', categoryId: 'cat-condition',
    title: { en: 'What happens in a scalp assessment', ar: 'ماذا يحدث في تقييم فروة الرأس' },
    summary: {
      en: 'A general outline of what a dermatology visit for hair loss usually involves, so the first appointment feels less unfamiliar.',
      ar: 'ملامح عامة لما تتضمنه عادةً زيارة عيادة الجلدية بسبب تساقط الشعر، ليكون الموعد الأول أقل غرابة.',
    },
    readMinutes: 3, access: 'public', status: 'published', featured: false, art: 'topo',
    related: ['art-patchy', 'art-questions'], age: { created: 90, updated: 34, reviewed: 33 },
    body: {
      en: `A first visit is mostly a conversation and a careful look. Knowing the general shape of it can make the appointment easier.

## The conversation
Your physician will usually ask when you first noticed the change, whether it has happened before, and about your general health and any medicines you take. Honest, complete answers help more than perfect ones.

## The examination
The scalp is examined closely, sometimes with a handheld magnifying instrument. Your physician may also look at other areas such as eyebrows or nails, because they can offer useful clues.

> Any tests, and any treatment decision, are your physician's judgement for your case. Nothing in this guide should be read as a recommendation.

## What you can bring
- A short list of your questions.
- The names of medicines and supplements you use.
- Earlier photos, if you have them, showing how the area has changed.`,
      ar: `الزيارة الأولى في معظمها حوار وفحص متأنٍّ. ومعرفة ملامحها العامة تجعل الموعد أيسر.

## الحوار
يسألك الطبيب عادةً متى لاحظت التغيّر أول مرة، وهل حدث من قبل، وعن صحتك العامة والأدوية التي تتناولها. الإجابات الصادقة والكاملة أنفع من الإجابات المثالية.

## الفحص
تُفحص فروة الرأس عن قرب، وقد يُستعان بأداة تكبير يدوية. وربما ينظر الطبيب إلى مناطق أخرى كالحاجبين أو الأظافر لأنها قد تقدّم دلائل مفيدة.

> أي فحوصات وأي قرار علاجي هو تقدير طبيبك لحالتك أنت. ولا يُقرأ شيء في هذا الدليل على أنه توصية.

## ما الذي يمكنك إحضاره
- قائمة قصيرة بأسئلتك.
- أسماء الأدوية والمكمّلات التي تستخدمها.
- صور سابقة، إن وُجدت، تبيّن كيف تغيّرت المنطقة.`,
    },
  },
  {
    id: 'art-family', slug: 'talking-with-family', categoryId: 'cat-condition',
    title: { en: 'Talking with family about hair loss', ar: 'الحديث مع العائلة عن تساقط الشعر' },
    summary: {
      en: 'Approved in the demo workflow and waiting to be published — shown here to illustrate the governance stages.',
      ar: 'مقال معتمد في مسار العرض التجريبي وبانتظار النشر، ويظهر هنا لإيضاح مراحل الحوكمة.',
    },
    readMinutes: 2, access: 'public', status: 'approved', featured: false, art: 'journey',
    related: ['art-patchy'], age: { created: 30, updated: 9, reviewed: 8 },
    body: {
      en: `Hair loss is visible, and the people close to you will often notice before you are ready to talk about it.

## Choosing your words
You decide how much to share. Some people find a single clear sentence enough: what the condition is called, that it is not contagious, and that a physician is looking after it.

> There is no correct way to have this conversation. Go at your own pace.`,
      ar: `تساقط الشعر أمر ظاهر، وكثيرًا ما يلاحظه المقرّبون منك قبل أن تكون مستعدًا للحديث عنه.

## اختيار كلماتك
أنت من يقرر مقدار ما تشاركه. يكتفي بعض الناس بجملة واحدة واضحة: اسم الحالة، وأنها غير معدية، وأن طبيبًا يتابعها.

> لا توجد طريقة صحيحة واحدة لهذا الحوار. امضِ فيه بالوتيرة التي تناسبك.`,
    },
  },

  /* ------------------------------------------------------------ 2 · DermiQ */
  {
    id: 'art-glance', slug: 'dermiq-at-a-glance', categoryId: 'cat-dermiq',
    title: { en: 'DermiQ at a glance', ar: 'DermiQ في لمحة' },
    summary: {
      en: 'Three physical parts and one digital companion — what the DermiQ concept consists of, and where its boundaries are.',
      ar: 'ثلاثة أجزاء مادية ورفيق رقمي واحد: ممّ يتكوّن مفهوم DermiQ، وأين تقع حدوده.',
    },
    readMinutes: 3, access: 'public', status: 'published', featured: true, art: 'pen',
    related: ['art-cartridge', 'art-head', 'art-app'], age: { created: 110, updated: 14, reviewed: 13 },
    body: {
      en: `DermiQ is a product concept with two halves: a mechanical treatment pen, and a digital platform that keeps the patient and the physician on the same page.

## The physical system
- A mechanical pen, about 155 mm long, with a transparent cartridge holder, a mechanical dose selector and a physical dose counter window.
- A dual-chamber cartridge that keeps a medication chamber and a diluent chamber separate inside one body.
- One approved treatment head carrying a 3 × 3 arrangement of hollow microneedles.

[fig:pen]

> The pen is entirely mechanical. It has no battery, no screen, no sensor and no wireless link.

## The digital companion
The platform holds the plan your physician approved, your appointments, the sessions you choose to document, and your progress photos. Because the pen is not electronic, the app never knows what the pen is doing — every session entry is something you report yourself.

## Its boundaries
DermiQ is a prototype concept. It has not been clinically validated or approved by any regulator, and nothing here is a claim about results.`,
      ar: `DermiQ مفهوم منتج له شقّان: قلم علاجي ميكانيكي، ومنصة رقمية تُبقي المريض والطبيب على اطلاع واحد.

## المنظومة المادية
- قلم ميكانيكي طوله نحو 155 ملم، له حامل خرطوشة شفاف ومحدِّد جرعة ميكانيكي ونافذة عدّاد جرعة حقيقية.
- خرطوشة ثنائية الحجرة تُبقي حجرة الدواء وحجرة المذيب منفصلتين داخل جسم واحد.
- رأس علاجي واحد معتمد يحمل إبرًا دقيقة مجوّفة مرتبة 3 × 3.

[fig:pen]

> القلم ميكانيكي بالكامل: لا بطارية فيه ولا شاشة ولا مستشعر ولا اتصال لاسلكي.

## الرفيق الرقمي
تحفظ المنصة الخطة التي اعتمدها طبيبك، ومواعيدك، والجلسات التي تختار توثيقها، وصور المتابعة. ولأن القلم غير إلكتروني، فالتطبيق لا يعلم ما يفعله القلم؛ وكل جلسة مسجّلة هي إفادة تدوّنها أنت بنفسك.

## حدوده
DermiQ مفهوم في مرحلة النموذج الأولي. لم يخضع لتحقق سريري ولم تعتمده أي جهة تنظيمية، ولا يتضمن ما ورد هنا أي ادعاء بشأن النتائج.`,
    },
  },
  {
    id: 'art-cartridge', slug: 'dual-chamber-cartridge', categoryId: 'cat-dermiq',
    title: { en: 'Inside the dual-chamber cartridge', ar: 'داخل الخرطوشة ثنائية الحجرة' },
    summary: {
      en: 'Two chambers, one stopper, one collar: the parts of the cartridge and the two conceptual states it is drawn in.',
      ar: 'حجرتان وسدادة وطوق: أجزاء الخرطوشة والحالتان المفاهيميتان اللتان تُرسم بهما.',
    },
    readMinutes: 3, access: 'public', status: 'published', featured: false, art: 'cartridge',
    related: ['art-glance', 'art-head'], age: { created: 104, updated: 17, reviewed: 16 },
    body: {
      en: `The DermiQ cartridge is designed as a single body with two chambers. Keeping the two contents apart until the moment of use is the whole idea of the design.

## The parts
- Medication chamber — the upper chamber. In the concept it holds triamcinolone acetonide as a white powder.
- Diluent chamber — the lower chamber. In the concept it holds a clear, colourless diluent; normal saline is the proposed option.
- Internal rubber stopper — sits inside the cartridge and keeps the two chambers separate.
- External twist collar — the purple ring on the outside of the cartridge body.

[fig:cartridge]

## Two states
Illustrations show the cartridge in two conceptual states: separated, with powder above and clear liquid below; and mixed, with the contents combined.

> This article describes a design. It is not a set of preparation instructions. Any preparation is carried out only as directed by the treating physician.

## What has not been established
The formulation, mixing ratio, stability, sterility and compatibility of this concept have not been validated. They are open questions for future development, not features.`,
      ar: `صُمّمت خرطوشة DermiQ جسمًا واحدًا بحجرتين. وإبقاء المحتويين منفصلين حتى لحظة الاستخدام هو فكرة التصميم كلها.

## الأجزاء
- حجرة الدواء: الحجرة العلوية. تحتوي في المفهوم على تريامسينولون أسيتونيد في صورة مسحوق أبيض.
- حجرة المذيب: الحجرة السفلية. تحتوي في المفهوم على مذيب شفاف عديم اللون، والمحلول الملحي الطبيعي هو الخيار المقترح.
- السدادة المطاطية الداخلية: تقع داخل الخرطوشة وتفصل بين الحجرتين.
- الطوق الدوّار الخارجي: الحلقة البنفسجية على جسم الخرطوشة من الخارج.

[fig:cartridge]

## حالتان
تُظهر الرسوم الخرطوشة في حالتين مفاهيميتين: منفصلة، والمسحوق في الأعلى والسائل الشفاف في الأسفل؛ وممزوجة، وقد اجتمع المحتويان.

> هذا المقال يصف تصميمًا، وليس تعليمات تحضير. ولا يجري أي تحضير إلا وفق توجيهات الطبيب المعالج.

## ما لم يثبت بعد
لم يُتحقق من تركيبة هذا المفهوم ولا من نسبة المزج ولا الثبات ولا التعقيم ولا التوافق. هي أسئلة مفتوحة لمراحل التطوير المقبلة، وليست خصائص للمنتج.`,
    },
  },
  {
    id: 'art-head', slug: 'one-treatment-head', categoryId: 'cat-dermiq',
    title: { en: 'One treatment head, by design', ar: 'رأس علاجي واحد، عن قصد' },
    summary: {
      en: 'Nine hollow microneedles in a 3 × 3 grid, three conceptual layers, and no menu of sizes.',
      ar: 'تسع إبر دقيقة مجوّفة في شبكة 3 × 3، وثلاث طبقات مفاهيمية، وبلا قائمة مقاسات.',
    },
    readMinutes: 3, access: 'public', status: 'published', featured: false, art: 'head',
    related: ['art-glance', 'art-cartridge'], age: { created: 101, updated: 25, reviewed: 24 },
    body: {
      en: `DermiQ has exactly one approved treatment head. There are no sizes to choose between and no alternative needle patterns.

## What the head looks like
The head carries nine hollow microneedles arranged in a 3 × 3 grid. Each needle is drawn as a hollow tube with a bevelled tip and a visible outlet, so that liquid can travel through a continuous channel.

[fig:head]

## Three conceptual layers
- Structural support layer — the rigid part that connects to the pen.
- Flexible TPU / silicone layer — an elastic ring intended to let the head follow the curve of the scalp.
- Needle contact layer — the transparent base plate that carries the needles.

> These are design intentions. How the head conforms to the skin, and how deep the needles reach, have not been clinically validated.

## Why only one
A single head keeps the plan simple: the head shown in your physician's configuration is the same head shown in your app. There is nothing to mix up.`,
      ar: `يأتي DermiQ برأس علاجي واحد معتمد لا غير. لا مقاسات للاختيار بينها، ولا أنماط بديلة للإبر.

## كيف يبدو الرأس
يحمل الرأس تسع إبر دقيقة مجوّفة مرتبة في شبكة 3 × 3. وتُرسم كل إبرة أنبوبًا مجوّفًا بطرف مشطوف ومخرج ظاهر، ليمرّ السائل عبر قناة متصلة.

[fig:head]

## ثلاث طبقات مفاهيمية
- طبقة الدعم الهيكلي: الجزء الصلب الذي يتصل بالقلم.
- الطبقة المرنة (TPU / سيليكون): حلقة مطاطية يُراد بها أن يتبع الرأس انحناء فروة الرأس.
- طبقة تلامس الإبر: القاعدة الشفافة التي تحمل الإبر.

> هذه مقاصد تصميمية. أما مدى مطابقة الرأس لسطح الجلد وعمق وصول الإبر فلم يخضعا لتحقق سريري.

## لماذا رأس واحد
الرأس الواحد يُبقي الخطة بسيطة: الرأس الظاهر في إعدادات طبيبك هو نفسه الظاهر في تطبيقك، فلا مجال للالتباس.`,
    },
  },
  {
    id: 'art-app', slug: 'what-the-app-does', categoryId: 'cat-dermiq',
    title: { en: 'What the app can and cannot do', ar: 'ما يستطيعه التطبيق وما لا يستطيعه' },
    summary: {
      en: 'A companion to care, not a controller of the device. A clear list of both sides.',
      ar: 'رفيق للرعاية وليس متحكمًا في الجهاز. قائمة واضحة بالجانبين.',
    },
    readMinutes: 2, access: 'public', status: 'published', featured: false, art: 'record',
    related: ['art-glance', 'art-document'], age: { created: 88, updated: 12, reviewed: 11 },
    body: {
      en: `The DermiQ app is a companion to your care, not a controller of the device. Being clear about that keeps everyone safe.

## What it does
- Shows the plan your physician approved: dose, treatment head and schedule.
- Shows your appointments and counts down to the next one.
- Lets you document a session yourself, and add a note for your physician.
- Stores progress photos so you and your physician can look at them side by side.
- Offers this education centre.

## What it does not do
- It does not connect to the pen. The pen is mechanical and sends no data.
- It does not detect, verify or confirm that a session took place.
- It does not calculate, recommend or change a dose.
- It does not analyse photos or judge whether treatment is working.

> A session marked as completed is a patient-reported entry. Your physician reviews it as such.`,
      ar: `تطبيق DermiQ رفيق لرعايتك وليس متحكمًا في الجهاز. ووضوح هذا الأمر يحفظ سلامة الجميع.

## ما الذي يفعله
- يعرض الخطة التي اعتمدها طبيبك: الجرعة والرأس العلاجي والجدول.
- يعرض مواعيدك ويعدّ الأيام حتى الموعد القادم.
- يتيح لك توثيق الجلسة بنفسك وإضافة ملاحظة لطبيبك.
- يحفظ صور المتابعة لتراها أنت وطبيبك جنبًا إلى جنب.
- يقدّم لك مركز التثقيف هذا.

## ما الذي لا يفعله
- لا يتصل بالقلم؛ فالقلم ميكانيكي ولا يرسل أي بيانات.
- لا يرصد إجراء الجلسة ولا يتحقق منه ولا يؤكده.
- لا يحسب الجرعة ولا يوصي بها ولا يغيّرها.
- لا يحلّل الصور ولا يحكم على فاعلية العلاج.

> الجلسة المسجّلة على أنها مكتملة هي إفادة من المريض، ويراجعها طبيبك على هذا الأساس.`,
    },
  },
  {
    id: 'art-pilot', slug: 'welcome-earlier-edition', categoryId: 'cat-dermiq',
    title: { en: 'Welcome to DermiQ (earlier edition)', ar: 'مرحبًا بك في DermiQ (نسخة سابقة)' },
    summary: {
      en: 'An archived introduction, kept in the library to show how superseded content is retired.',
      ar: 'مقدمة مؤرشفة أُبقيت في المكتبة لبيان كيف يُسحب المحتوى الذي حلّ غيره محلّه.',
    },
    readMinutes: 1, access: 'public', status: 'archived', featured: false, art: 'pen',
    related: ['art-glance'], age: { created: 200, updated: 110, reviewed: 150 },
    body: {
      en: `This earlier introduction was replaced by "DermiQ at a glance".

> Archived content is not shown to patients or the public. It stays in the library for the record.`,
      ar: `حلّ مقال «DermiQ في لمحة» محلّ هذه المقدمة السابقة.

> المحتوى المؤرشف لا يظهر للمرضى ولا للعموم، ويبقى في المكتبة للتوثيق.`,
    },
  },

  /* ------------------------------------------------------------ 3 · before */
  {
    id: 'art-questions', slug: 'preparing-your-questions', categoryId: 'cat-before',
    title: { en: 'Preparing your questions', ar: 'حضّر أسئلتك قبل الموعد' },
    summary: {
      en: 'Appointments are short. A few minutes of preparation makes the time count.',
      ar: 'المواعيد قصيرة، ودقائق قليلة من التحضير تجعل وقت الزيارة أثمن.',
    },
    readMinutes: 2, access: 'public', status: 'published', featured: true, art: 'calendar',
    related: ['art-plan', 'art-assessment'], age: { created: 80, updated: 19, reviewed: 18 },
    body: {
      en: `Appointments are short, and it is easy to forget what you meant to ask. A few minutes of preparation makes the time count.

## Questions worth writing down
- What do you expect from this plan, and over what period?
- What should I do if I cannot attend a scheduled session?
- Who do I contact between appointments, and how?
- Is there anything I should avoid or watch for?

## Things to have ready
- The date of your appointment — it is shown on your home screen.
- Any changes you have noticed since your last visit.
- New medicines or health changes your physician should know about.

> Your physician's answers apply to you. The answers a friend received, or something read online, may not.`,
      ar: `المواعيد قصيرة، ومن السهل أن تنسى ما أردت السؤال عنه. دقائق قليلة من التحضير تجعل وقت الزيارة أثمن.

## أسئلة تستحق التدوين
- ما المتوقع من هذه الخطة، وخلال أي مدة؟
- ماذا أفعل إن تعذّر عليّ حضور جلسة مجدولة؟
- بمن أتواصل بين المواعيد، وكيف؟
- هل هناك ما ينبغي تجنّبه أو الانتباه له؟

## ما يحسن تجهيزه
- تاريخ موعدك، وهو ظاهر في الشاشة الرئيسية.
- أي تغيّرات لاحظتها منذ زيارتك الأخيرة.
- الأدوية الجديدة أو التغيّرات الصحية التي ينبغي أن يعلم بها طبيبك.

> إجابات طبيبك تخصّك أنت. أما ما قيل لصديق أو ما قرأته على الإنترنت فقد لا ينطبق عليك.`,
    },
  },
  {
    id: 'art-plan', slug: 'reading-your-plan', categoryId: 'cat-before',
    title: { en: 'Reading your approved plan', ar: 'كيف تقرأ خطتك المعتمدة' },
    summary: {
      en: 'What each line on the read-only plan screen means — and what “digitally locked” does and does not do.',
      ar: 'معنى كل سطر في شاشة الخطة المخصّصة للقراءة، وما الذي يفعله «القفل الرقمي» وما لا يفعله.',
    },
    readMinutes: 2, access: 'patient', status: 'published', featured: false, art: 'record',
    related: ['art-changes', 'art-questions'], age: { created: 76, updated: 15, reviewed: 14 },
    body: {
      en: `Your treatment plan screen is read-only. Everything on it was entered and approved by your physician.

## What each line means
- Approved dose — the value your physician set for your plan. The app displays it; it never calculates it.
- Treatment head — DermiQ has one approved head, DQ-HEAD-01. It is the same for every plan.
- Schedule — the planned interval between sessions and your follow-up date.
- Approval status — whether the plan is approved, digitally locked, or being reviewed.

## About “digitally locked”
A locked plan cannot be edited in the software until your physician reopens it. The lock is a record-keeping safeguard. It has no effect on the physical pen, which is mechanical and cannot be controlled by the app.

> If anything on your plan is unclear or looks different from what you were told, ask your physician before your next session.`,
      ar: `شاشة الخطة العلاجية للقراءة فقط. كل ما فيها أدخله طبيبك واعتمده.

## معنى كل سطر
- الجرعة المعتمدة: القيمة التي حدّدها طبيبك لخطتك. التطبيق يعرضها ولا يحسبها أبدًا.
- الرأس العلاجي: يأتي DermiQ برأس معتمد واحد هو DQ-HEAD-01، وهو نفسه في كل الخطط.
- الجدول: الفاصل المخطط بين الجلسات وتاريخ المتابعة.
- حالة الاعتماد: هل الخطة معتمدة، أم مقفلة رقميًا، أم قيد المراجعة.

## عن «القفل الرقمي»
الخطة المقفلة لا يمكن تعديلها في النظام حتى يعيد طبيبك فتحها. القفل ضمانة لحفظ السجل، ولا أثر له في القلم نفسه؛ فالقلم ميكانيكي ولا يمكن للتطبيق التحكم فيه.

> إن بدا لك شيء في خطتك غير واضح أو مختلفًا عمّا قيل لك، فاسأل طبيبك قبل جلستك القادمة.`,
    },
  },
  {
    id: 'art-appt-types', slug: 'appointment-types', categoryId: 'cat-before',
    title: { en: 'Understanding appointment types', ar: 'أنواع المواعيد' },
    summary: {
      en: 'Waiting for medical review in the demo workflow — not yet visible to patients.',
      ar: 'بانتظار المراجعة الطبية في مسار العرض التجريبي، ولا يظهر للمرضى بعد.',
    },
    readMinutes: 1, access: 'patient', status: 'pending_review', featured: false, art: 'calendar',
    related: ['art-questions'], age: { created: 12, updated: 4, reviewed: null },
    body: {
      en: `Your app can show three kinds of appointment: a consultation, a treatment session, and a follow-up visit.

> Your clinic decides which kind each appointment is. If you are unsure what to expect, ask before the day.`,
      ar: `يعرض تطبيقك ثلاثة أنواع من المواعيد: استشارة، وجلسة علاجية، وزيارة متابعة.

> عيادتك هي التي تحدد نوع كل موعد. وإن لم تكن متأكدًا ممّا ينتظرك، فاسأل قبل يوم الموعد.`,
    },
  },

  /* ------------------------------------------------------------ 4 · during */
  {
    id: 'art-document', slug: 'documenting-a-session', categoryId: 'cat-during',
    title: { en: 'Documenting a session yourself', ar: 'توثيق الجلسة بنفسك' },
    summary: {
      en: 'The pen is mechanical, so the record exists only if you create it. How reporting works, and why accuracy matters.',
      ar: 'القلم ميكانيكي، فلا يوجد السجل إلا إذا أنشأته أنت. كيف يجري التسجيل، ولماذا تهمّ الدقة.',
    },
    readMinutes: 2, access: 'patient', status: 'published', featured: false, art: 'journey',
    related: ['art-app', 'art-photos'], age: { created: 70, updated: 10, reviewed: 9 },
    body: {
      en: `Because the pen is mechanical, the app cannot know that a session happened. The record exists only if you create it.

## How documentation works
- After the date of a scheduled session, it appears in Session History as awaiting your documentation.
- Choose “Report Session Completion”, confirm the statement, and add a note if you wish.
- The entry is saved as patient-reported and sent to your physician for review.

## Being accurate
Record what actually happened. If you did not attend, say so — a missed session is useful information for your physician, not a mark against you.

> Completing the educational walkthrough does not document a session. The two are deliberately separate.

## After you report
Your physician can review the entry and leave a note. You will see the review status change in your history.`,
      ar: `لأن القلم ميكانيكي، لا يستطيع التطبيق أن يعرف أن جلسة قد أُجريت. السجل لا يوجد إلا إذا أنشأته أنت.

## كيف يجري التوثيق
- بعد تاريخ الجلسة المجدولة، تظهر في سجل الجلسات بانتظار توثيقك.
- اختر «تسجيل إتمام الجلسة»، ثم أكّد الإقرار، وأضف ملاحظة إن شئت.
- يُحفظ الإدخال على أنه إفادة من المريض ويُرسل إلى طبيبك للمراجعة.

## الدقة أولًا
دوّن ما حدث فعلًا. وإن لم تحضر فاذكر ذلك؛ فالجلسة الفائتة معلومة تفيد طبيبك وليست مأخذًا عليك.

> إكمال الدليل التثقيفي لا يوثّق جلسة. الأمران منفصلان عن قصد.

## بعد التسجيل
يستطيع طبيبك مراجعة الإدخال وترك ملاحظة، وسترى حالة المراجعة تتغيّر في سجلك.`,
    },
  },
  {
    id: 'art-photos', slug: 'consistent-progress-photos', categoryId: 'cat-during',
    title: { en: 'Taking consistent progress photos', ar: 'صور متابعة متّسقة' },
    summary: {
      en: 'Photos are only comparable when they are taken the same way each time. A simple routine, and what a comparison can and cannot tell you.',
      ar: 'لا تصلح الصور للمقارنة إلا إذا التُقطت بالطريقة نفسها كل مرة. روتين بسيط، وما الذي تقوله المقارنة وما لا تقوله.',
    },
    readMinutes: 3, access: 'public', status: 'published', featured: true, art: 'topo',
    related: ['art-document', 'art-after'], age: { created: 66, updated: 8, reviewed: 7 },
    body: {
      en: `Photos are only useful to compare when they are taken in a similar way each time. Consistency matters more than camera quality.

## A simple routine
- Use the same place and similar lighting each time; daylight near a window works well.
- Keep the camera at a similar distance and angle.
- Make sure the area is in focus and not covered by styled hair.
- Take the photo at a regular point, such as before each appointment.

[fig:topo]

## Notes help
Add a short note with each photo: the date, the area, and anything you noticed. Your physician reads these alongside the images.

> A side-by-side comparison is a visual record. It is not a measurement, a diagnosis, or proof that a treatment is or is not working. Interpretation belongs to your physician.

## Privacy
In this prototype, photos you upload stay in this browser only. Do not upload real photos you would not want stored on this device.`,
      ar: `لا تفيد الصور في المقارنة إلا إذا التُقطت بطريقة متشابهة في كل مرة. الاتساق أهم من جودة الكاميرا.

## روتين بسيط
- استخدم المكان نفسه وإضاءة متقاربة في كل مرة؛ ضوء النهار قرب النافذة مناسب.
- أبقِ الكاميرا على مسافة وزاوية متقاربتين.
- تأكد أن المنطقة واضحة في الصورة وغير مغطاة بتصفيف الشعر.
- التقط الصورة في توقيت منتظم، كأن يكون قبل كل موعد.

[fig:topo]

## الملاحظات تفيد
أضف ملاحظة قصيرة مع كل صورة: التاريخ والمنطقة وما لاحظته. يقرأ طبيبك هذه الملاحظات مع الصور.

> المقارنة جنبًا إلى جنب سجل بصري، وليست قياسًا ولا تشخيصًا ولا دليلًا على نجاح العلاج أو إخفاقه. التفسير يعود إلى طبيبك.

## الخصوصية
في هذا النموذج الأولي تبقى الصور التي ترفعها في هذا المتصفح فقط. لا ترفع صورًا حقيقية لا ترغب في حفظها على هذا الجهاز.`,
    },
  },
  {
    id: 'art-travel', slug: 'travelling-during-treatment', categoryId: 'cat-during',
    title: { en: 'Travelling during your treatment journey', ar: 'السفر خلال رحلتك العلاجية' },
    summary: {
      en: 'An unfinished draft in the demo workflow — visible to the content team only.',
      ar: 'مسودة غير مكتملة في مسار العرض التجريبي، ولا يراها إلا فريق المحتوى.',
    },
    readMinutes: 1, access: 'patient', status: 'draft', featured: false, art: 'journey',
    related: [], age: { created: 5, updated: 2, reviewed: null },
    body: {
      en: `If you expect to be away around the date of a scheduled session, tell your clinic as early as you can.

> Draft. Wording to be completed and sent for medical review.`,
      ar: `إن توقعت أن تكون مسافرًا قرب تاريخ جلسة مجدولة، فأخبر عيادتك في أقرب وقت ممكن.

> مسودة. تُستكمل الصياغة ثم تُرسل للمراجعة الطبية.`,
    },
  },

  /* ------------------------------------------------------------ 5 · after */
  {
    id: 'art-after', slug: 'after-your-appointment', categoryId: 'cat-after',
    title: { en: 'After the visit: what to note and whom to ask', ar: 'بعد الزيارة: ما الذي تدوّنه ومن تسأل' },
    summary: {
      en: 'DermiQ gives no aftercare instructions of its own. Here is how to make sure you leave the clinic with the ones that apply to you.',
      ar: 'لا يقدّم DermiQ تعليمات عناية لاحقة من عنده. إليك كيف تغادر العيادة ومعك التعليمات التي تخصّك.',
    },
    readMinutes: 2, access: 'public', status: 'published', featured: false, art: 'calendar',
    related: ['art-document', 'art-changes'], age: { created: 60, updated: 16, reviewed: 15 },
    body: {
      en: `What you do after a visit is decided by your physician, not by this guide. DermiQ deliberately offers no aftercare instructions of its own.

## Before you leave the clinic
- Ask what to expect over the following days.
- Ask what would be a reason to get in touch, and how to do so.
- Confirm the date of your next appointment.

## Once you are home
- Document the session in the app while it is fresh.
- Write down anything you want to mention next time.
- Check that the next appointment appears on your home screen.

> If you feel unwell or are worried about a reaction, contact your physician or local medical services. Do not wait for the app — it is not monitored for emergencies.`,
      ar: `ما تفعله بعد الزيارة يقرّره طبيبك لا هذا الدليل. ويتعمّد DermiQ ألّا يقدّم تعليمات عناية لاحقة من عنده.

## قبل أن تغادر العيادة
- اسأل عمّا يُتوقع في الأيام التالية.
- اسأل عمّا يستدعي التواصل، وعن طريقة التواصل.
- تأكد من تاريخ موعدك القادم.

## حين تعود إلى المنزل
- وثّق الجلسة في التطبيق ما دامت تفاصيلها حاضرة.
- دوّن ما تودّ ذكره في المرة القادمة.
- تحقق من ظهور الموعد القادم في شاشتك الرئيسية.

> إن شعرت بتوعّك أو قلقت من أي عارض، فتواصل مع طبيبك أو مع الخدمات الطبية في منطقتك. لا تنتظر التطبيق؛ فهو غير مراقَب للحالات الطارئة.`,
    },
  },
  {
    id: 'art-changes', slug: 'when-your-plan-changes', categoryId: 'cat-after',
    title: { en: 'When your plan changes', ar: 'عندما تتغيّر خطتك' },
    summary: {
      en: 'You always see the latest version your physician approved — and never a draft. What each status means for you.',
      ar: 'ترى دائمًا آخر نسخة اعتمدها طبيبك، ولا ترى المسودات أبدًا. ماذا تعني كل حالة لك.',
    },
    readMinutes: 2, access: 'patient', status: 'published', featured: false, art: 'record',
    related: ['art-plan', 'art-after'], age: { created: 52, updated: 6, reviewed: 5 },
    body: {
      en: `Plans are reviewed and sometimes adjusted. The app is built so that you always see the latest version your physician approved — and nothing that is still being worked on.

## What you may see
- “Under physician review” — your physician has reopened the plan. The last approved version stays visible until a new one is approved.
- “Approved” — a new or updated version has been approved. Check the dose and schedule lines.
- “Digitally locked” — the approved version has been locked against edits in the software.

## What you will not see
Drafts. Values your physician is still considering are never shown in the patient app.

> A notification tells you when your plan changes. In this prototype, notifications appear inside the app only — no SMS, email or push message is sent.`,
      ar: `تُراجَع الخطط وقد تُعدَّل أحيانًا. وقد بُني التطبيق لتُعرض لك دائمًا آخر نسخة اعتمدها طبيبك، لا ما هو قيد الإعداد.

## ما قد تراه
- «قيد مراجعة الطبيب»: أعاد طبيبك فتح الخطة. تبقى آخر نسخة معتمدة ظاهرة إلى أن تُعتمد نسخة جديدة.
- «معتمدة»: اعتُمدت نسخة جديدة أو محدّثة. راجع سطرَي الجرعة والجدول.
- «مقفلة رقميًا»: قُفلت النسخة المعتمدة ضد التعديل في النظام.

## ما لن تراه
المسودات. القيم التي ما زال طبيبك يدرسها لا تظهر في تطبيق المريض مطلقًا.

> يصلك إشعار عند تغيّر خطتك. وفي هذا النموذج الأولي تظهر الإشعارات داخل التطبيق فقط؛ فلا تُرسل رسائل نصية ولا بريد إلكتروني ولا إشعارات فورية.`,
    },
  },

  /* ------------------------------------------------------------ 6 · faq */
  {
    id: 'art-glossary', slug: 'glossary', categoryId: 'cat-faq',
    title: { en: 'A short glossary', ar: 'مسرد موجز' },
    summary: {
      en: 'The terms used across DermiQ, in plain language.',
      ar: 'المصطلحات المستخدمة في DermiQ بلغة مبسّطة.',
    },
    readMinutes: 2, access: 'public', status: 'published', featured: false, art: 'record',
    related: ['art-glance', 'art-app'], age: { created: 58, updated: 11, reviewed: 10 },
    body: {
      en: `The terms used across DermiQ, in plain language.

## Product terms
- Dual-chamber cartridge — one cartridge body with two separate chambers.
- Medication chamber — the upper chamber of the cartridge.
- Diluent chamber — the lower chamber of the cartridge.
- Treatment head — the single approved microneedle head, DQ-HEAD-01.
- Dose counter window — the mechanical window on the pen that shows the selected value.

## Platform terms
- Approved plan — the version of your plan your physician has approved for you to see.
- Digitally locked — protected from edits in the software. It does not lock the pen.
- Patient-reported — entered by you, not verified by any device.
- Pending physician review — reported by you and waiting for your physician to look at it.

> If a word on your screen is not in this list, ask your care team what it means for you.`,
      ar: `المصطلحات المستخدمة في DermiQ بلغة مبسّطة.

## مصطلحات المنتج
- الخرطوشة ثنائية الحجرة: جسم خرطوشة واحد فيه حجرتان منفصلتان.
- حجرة الدواء: الحجرة العلوية من الخرطوشة.
- حجرة المذيب: الحجرة السفلية من الخرطوشة.
- الرأس العلاجي: رأس الإبر الدقيقة الوحيد المعتمد، DQ-HEAD-01.
- نافذة عدّاد الجرعة: نافذة ميكانيكية على القلم تُظهر القيمة المحددة.

## مصطلحات المنصة
- الخطة المعتمدة: نسخة خطتك التي اعتمدها طبيبك لتطّلع عليها.
- مقفلة رقميًا: محمية من التعديل داخل النظام، ولا تقفل القلم.
- بإفادة المريض: أدخلتها أنت ولم يتحقق منها أي جهاز.
- بانتظار مراجعة الطبيب: سجّلتها أنت وتنتظر اطلاع طبيبك عليها.

> إن ظهرت في شاشتك كلمة ليست في هذه القائمة، فاسأل فريق رعايتك عن معناها في حالتك.`,
    },
  },
];
