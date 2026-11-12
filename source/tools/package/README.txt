DermiQ — علم الدقة · The Science of Precision
نموذج مفاهيمي · بيانات تجريبية وهمية · ليس جهازًا طبيًا معتمدًا
Concept prototype · fictional demo data · not an approved medical device
=====================================================================

هذا المجلد هو الموقع نفسه — ارفعه كما هو
-----------------------------------------
  الرفع على Netlify:
    1) فك الضغط عن الحزمة.
    2) اسحب المجلد الناتج كله (المجلد الذي بداخله index.html مباشرة) إلى Netlify:
       صفحة موقعك ← Deploys ← منطقة السحب والإفلات.
  لا تدخل أي مجلد فرعي، ولا تختر ملفات بعينها: المجلد كله كما هو.

  لماذا كانت تظهر «Page not found»؟
    Netlify يفتح الملف index.html الموجود في أعلى المجلد المرفوع فقط. في الحزم السابقة كان الموقع
    داخل مجلد فرعي اسمه site، فلم يجد Netlify صفحة رئيسية. الآن index.html في أعلى الحزمة.

ماذا في الحزمة؟
---------------
  index.html · assets/ · demo/ · favicon.svg   الموقع (نسخة الإنتاج).
  _redirects · 404.html                        أي عنوان خاطئ يعود إلى الصفحة الرئيسية بدل «Page not found».
  DermiQ-standalone.html                       المنصة كاملة في ملف واحد — افتحه بالضغط عليه مرتين. بلا تثبيت ولا إنترنت.
  source/                                      الكود المصدري كاملًا مع سكربتات الاختبار وأدوات تجهيز الصور.
  docs/                                        التوثيق (البنية، نموذج البيانات، نظام التصميم، حوكمة المحتوى الطبي، الأمان، الصور، تقرير الاختبارات).
  serve.mjs                                    لتشغيل الموقع على جهازك.

  بعد الرفع على Netlify لا يرى الزوار إلا الموقع: المجلدان source و docs وهذا الملف محجوبة عنهم
  (بقواعد الملف _redirects).

ما الجديد في هذه النسخة (11 نوفمبر 2026)
----------------------------------------
  • القلم في الجوال مستقيم وكامل مثل اللابتوب.
  • «أربعة مشاهد للخرطوشة» في صفحة المنتج أصبحت من لوحة التصميم المرجعية (قبل المزج، المزج الخارجي، بعد المزج، فصل الحجرة العلوية).
  • صفحتا الدخول: رسم لمريض في دخول المريض، ورسم لطبيبة في دخول الطبيب، في اللغتين.
  • نصوص الواجهة الرئيسية والجملة الختامية الجديدة.
  • زر القائمة (الخطوط الثلاثة) في الجوال يفتح القائمة كاملة.
  • الحزمة نفسها صارت قابلة للرفع مباشرة (index.html في أعلاها).

كيف أشغّله على جهازي؟
---------------------
  1) الأسهل: افتح DermiQ-standalone.html في المتصفح.
  2) نسخة الإنتاج: داخل هذا المجلد نفّذ   node serve.mjs   ثم افتح http://localhost:4173
     ملاحظة: index.html لا يعمل بفتحه مباشرة من القرص — استخدم الملف الواحد لذلك.
  3) للتطوير: داخل مجلد source نفّذ   npm install   ثم   npm run dev   وافتح http://localhost:5173

الحسابات التجريبية — كلمة المرور للجميع: Demo#2026
---------------------------------------------------
  الطبيبة   dr.lina@dermiq.demo
  المرضى    sara@dermiq.demo · faisal@dermiq.demo · noura@dermiq.demo
            khalid@dermiq.demo · reem@dermiq.demo · omar@dermiq.demo
  في صفحتي الدخول أزرار تملأ البيانات بضغطة واحدة.
  جرّب: افتح الطبيبة في تبويب والمريض في تبويب آخر، واعتمد خطة — تظهر عند المريض فورًا.

تنبيه
-----
  لا يوجد خادم ولا مصادقة حقيقية، والبيانات محفوظة في المتصفح فقط. لا تُدخل بيانات مرضى حقيقية.
  المحتوى الطبي نموذجي ولم يراجعه مختص.

=====================================================================
ENGLISH

This folder is the website — upload it as it is
  Netlify: unzip the package, then drag the whole resulting folder (the one that has index.html directly
  inside it) onto your site's Deploys page. Do not open a sub-folder and do not pick individual files.

  Why "Page not found" used to appear: Netlify serves the index.html at the top level of what you upload.
  Earlier packages kept the website inside a sub-folder called site, so Netlify found no home page.
  index.html is now at the top of the package.

What is inside
  index.html, assets/, demo/, favicon.svg   The website (production build).
  _redirects, 404.html                      Any wrong address returns to the home page.
  DermiQ-standalone.html                    The whole platform in one file — double-click it. No install, no internet.
  source/                                   Full source code, QA scripts and the asset-preparation tools.
  docs/                                     Architecture, data model, design system, medical content governance,
                                            security, asset notes and the QA report.
  serve.mjs                                 Runs the website on your own computer.

  Once uploaded to Netlify, visitors see only the website: source/, docs/ and this file are blocked
  (by the rules in _redirects).

What is new in this version (11 November 2026)
  • The pen on phones is level and complete, as on a laptop.
  • "Four views of the cartridge" on the Product page now come from the reference design sheet.
  • Sign-in pages: a patient illustration on Patient Access, a physician illustration on Physician Access, both languages.
  • New home statement and closing lines.
  • The menu button on phones opens the full menu.
  • The package itself can now be uploaded directly (index.html is at its top level).

How to run it locally
  1) Easiest: open DermiQ-standalone.html in a browser.
  2) Production build: inside this folder run   node serve.mjs   then open http://localhost:4173
     (index.html does not run when opened straight from disk.)
  3) Development: inside source/ run   npm install   then   npm run dev   (http://localhost:5173)

Demo accounts — password for all: Demo#2026
  Physician  dr.lina@dermiq.demo
  Patients   sara@ · faisal@ · noura@ · khalid@ · reem@ · omar@   …@dermiq.demo

There is no server and no real authentication; data stays in the browser. Do not enter real patient data.
