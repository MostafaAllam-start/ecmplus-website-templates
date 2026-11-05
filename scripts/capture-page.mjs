// The Document Capture page (Portico only): copy, sample documents and markup.
// Wired into scripts/subpages.mjs; styled by templates/portico/capture.css and driven by
// templates/portico/capture.js. Edit here, then run: node scripts/subpages.mjs
//
// Honesty rule: what the product does today is stated plainly (scanner upload, upload from a
// device / templates / Google Drive / OneDrive, mail filing, OCR, AI-filled index fields reviewed
// by staff, generated barcode/QR stamps, REST API, migration). Anything else is tagged
// "Demonstration" or "Potential integration", and the interactive part says it is a demonstration.

export const CAPTURE_META = {
  code: "DMS",
  en: {
    name: "Document Capture",
    short: "Document Capture",
    metaTitle: "Document Capture (DMS) — ECM Plus",
    description: "Bring paper, files and email into one archive, read their text in Arabic and English, and have AI propose the index fields for staff to confirm. Includes an interactive demonstration.",
  },
  ar: {
    name: "التقاط الوثائق",
    short: "التقاط الوثائق",
    metaTitle: "التقاط الوثائق (DMS) — ECM Plus",
    description: "اجمعوا الورق والملفات والبريد في أرشيف واحد، واقرؤوا نصوصها بالعربية والإنجليزية، ودعوا الذكاء الاصطناعي يقترح حقول الفهرسة ليؤكدها الموظف. يتضمن عرضًا توضيحيًا تفاعليًا.",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const Z = {
  scan: '<path d="M5 3.5h9l5 5v12H5z"/><path d="M14 3.5v5h5M2.5 14h19"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4.5 16v3.5h15V16"/>',
  camera: '<path d="M3.5 8h3.5l1.5-2.5h7L17 8h3.5v11h-17z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 16l5-5 4 4 3-3 5 5M15.5 9h.01"/>',
  barcode: '<path d="M4 5v14M6.5 5v14M10 5v14M12.5 5v14M16 5v14M19 5v14"/>',
  sprite: (id) => `<use href="#${id}"/>`,
};
const ic = (inner) => `<svg class="sp-glyph cap-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
const sp = (id) => ic(Z.sprite(id));

// Decorative codes (a sample pattern, not an encoded value).
function barcode(seed) {
  const w = [2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 2];
  let x = 0;
  let d = "";
  w.forEach((n, i) => { if (i % 2 === 0) d += `M${x} 0h${n}v20h-${n}z`; x += n; });
  return `<svg class="cap-barcode" viewBox="0 0 ${x} 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}
function qr(seed) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % 100 < 48; };
  const N = 21;
  let d = "";
  const finder = (r, c) => r < 7 && c < 7 ? (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) : null;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on;
    const f = finder(r, c) ?? finder(r, N - 1 - c) ?? finder(N - 1 - r, c);
    if (f !== null) on = f;
    else {
      const inQuiet = (r === 7 || c === 7 || r === N - 8 || c === N - 8) && (r < 8 || c < 8 || (r >= N - 8 && c < 8) || (c >= N - 8 && r < 8));
      on = inQuiet ? false : rnd();
    }
    if (on) d += `M${c} ${r}h1v1h-1z`;
  }
  return `<svg class="cap-qr" viewBox="0 0 ${N} ${N}" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}

// The three sample documents. Field labels and values; `z` is the document zone the field comes from.
const SAMPLES = {
  invoice: {
    code: "DOC-2026-00418", seed: 418, pages: 1, langs: { en: "Arabic and English", ar: "العربية والإنجليزية" },
    name: { en: "Supplier invoice", ar: "فاتورة مورد" },
    via: { en: "Scanner (auto-feeder)", ar: "الماسح الضوئي (التغذية التلقائية)" },
    folder: { en: "Finance / Supplier invoices 2026", ar: "المالية / فواتير الموردين 2026" },
    types: [{ en: "Supplier invoice", ar: "فاتورة مورد" }, { en: "Purchase order", ar: "أمر شراء" }, { en: "Delivery note", ar: "إشعار تسليم" }],
    fields: [
      { key: "supplier", type: "text", z: "head", v: "Al-Rawabi Office Supplies Co.", en: "Supplier", ar: "المورد" },
      { key: "number", type: "text", z: "ref", v: "INV-2026-0147", en: "Invoice number", ar: "رقم الفاتورة" },
      { key: "date", type: "date", z: "ref", v: "2026-03-12", en: "Invoice date", ar: "تاريخ الفاتورة" },
      { key: "due", type: "date", z: "ref", v: "2026-04-11", en: "Due date", ar: "تاريخ الاستحقاق" },
      { key: "total", type: "number", z: "total", v: "18975.00", en: "Total amount", ar: "المبلغ الإجمالي" },
      { key: "currency", type: "text", z: "total", v: "SAR", en: "Currency", ar: "العملة" },
      { key: "cost", type: "text", z: "", v: "", en: "Cost centre", ar: "مركز التكلفة" },
    ],
    excerpt: [["Al-Rawabi Office Supplies Co. — شركة الروابي للتجهيزات المكتبية", "ltr"], ["Tax invoice INV-2026-0147 · 12 Mar 2026", "ltr"], ["Total SAR 18,975.00", "ltr"]],
  },
  contract: {
    code: "DOC-2026-00419", seed: 419, pages: 3, langs: { en: "English", ar: "الإنجليزية" },
    name: { en: "Service contract", ar: "عقد خدمات" },
    via: { en: "Upload from device", ar: "الرفع من الجهاز" },
    folder: { en: "Legal / Contracts", ar: "الشؤون القانونية / العقود" },
    types: [{ en: "Service contract", ar: "عقد خدمات" }, { en: "Non-disclosure agreement", ar: "اتفاقية عدم إفصاح" }, { en: "Purchase order", ar: "أمر شراء" }],
    fields: [
      { key: "title", type: "text", z: "head", v: "Server Maintenance Agreement", en: "Title", ar: "العنوان" },
      { key: "party", type: "text", z: "ref", v: "Meridian Data Services Ltd.", en: "Counterparty", ar: "الطرف الآخر" },
      { key: "ref", type: "text", z: "ref", v: "CT-2026-031", en: "Reference", ar: "المرجع" },
      { key: "from", type: "date", z: "total", v: "2026-02-01", en: "Effective date", ar: "تاريخ السريان" },
      { key: "to", type: "date", z: "total", v: "2028-01-31", en: "Expiry date", ar: "تاريخ الانتهاء" },
      { key: "value", type: "number", z: "total", v: "420000.00", en: "Value (SAR)", ar: "القيمة (ريال)" },
      { key: "owner", type: "text", z: "", v: "", en: "Owner department", ar: "الإدارة المالكة" },
    ],
    excerpt: [["Server Maintenance Agreement", "ltr"], ["Contract CT-2026-031 · Northgate Holding and Meridian Data Services Ltd.", "ltr"], ["Expiry: 31 January 2028", "ltr"]],
  },
  employee: {
    code: "DOC-2026-00420", seed: 420, pages: 2, langs: { en: "Arabic", ar: "العربية" },
    name: { en: "Employee file", ar: "ملف موظف" },
    via: { en: "Outlook add-in", ar: "إضافة Outlook" },
    folder: { en: "HR / Employee files", ar: "الموارد البشرية / ملفات الموظفين" },
    types: [{ en: "Employee file", ar: "ملف موظف" }, { en: "Job application", ar: "طلب توظيف" }, { en: "Leave request", ar: "طلب إجازة" }],
    fields: [
      { key: "name", type: "text", z: "ref", v: "سارة محمد العتيبي", en: "Employee name", ar: "اسم الموظف" },
      { key: "no", type: "text", z: "ref", v: "EMP-4471", en: "Employee number", ar: "رقم الموظف" },
      { key: "dept", type: "text", z: "body", v: "الموارد البشرية", en: "Department", ar: "الإدارة" },
      { key: "job", type: "text", z: "body", v: "أخصائي توظيف", en: "Job title", ar: "المسمى الوظيفي" },
      { key: "hire", type: "date", z: "total", v: "2025-09-01", en: "Hire date", ar: "تاريخ التعيين" },
      { key: "end", type: "date", z: "", v: "", en: "Contract end date", ar: "تاريخ انتهاء العقد" },
    ],
    excerpt: [["ملف موظف — نموذج تعيين", "rtl"], ["سارة محمد العتيبي", "rtl"], ["رقم الموظف EMP-4471 · الموارد البشرية", "rtl"]],
  },
};

const SIG = '<svg class="cap-sig" viewBox="0 0 64 24" aria-hidden="true" focusable="false"><path d="M3 17c4-.5 5.7-11 8.8-11 2.6 0 .3 8.4 3.2 8.4 2.3 0 3.2-5 5.5-5 1.6 0 1.8 2.7 3.4 2.7 1.1 0 2.1-.8 4.8-2.7M3 21.5h34"/></svg>';

function stamp(s) {
  return `<span class="cap-stamp" aria-hidden="true">${barcode(s.seed)}${qr(s.seed)}<bdi class="cap-stamp__no">${s.code}</bdi></span>`;
}
function docShell(key, label, pageAttrs, inner, s, t) {
  return `<div class="cap-doc" data-for="${key}" role="group" aria-label="${esc(label)}">
            <div class="cap-doc__page" ${pageAttrs}>
${inner}
              <div class="cap-doc__foot"><div class="cap-z" data-zone="sign">${SIG}<span class="cap-doc__sigcap">${t("Authorized signature", "التوقيع المعتمد")}</span></div><div class="cap-z cap-stampbox" data-zone="code">${stamp(s)}</div></div>
              <span class="cap-doc__sweep" aria-hidden="true"></span>
            </div>
            <p class="cap-doc__cap">${t(`Page 1 of ${s.pages} · sample document`, `الصفحة 1 من ${s.pages} · وثيقة نموذجية`)}</p>
          </div>`;
}
function docs(t) {
  const S = SAMPLES;
  const invoice = docShell("invoice", t("Sample document: supplier invoice", "وثيقة نموذجية: فاتورة مورد"), 'lang="en" dir="ltr"', `              <div class="cap-z cap-doc__head" data-zone="head"><div><b class="cap-doc__org">Al-Rawabi Office Supplies Co.</b><b class="cap-doc__org" lang="ar" dir="rtl">شركة الروابي للتجهيزات المكتبية</b></div><div class="cap-doc__kind">TAX INVOICE<span lang="ar" dir="rtl">فاتورة ضريبية</span></div></div>
              <div class="cap-z cap-doc__refs" data-zone="ref"><span>Invoice No. <b>INV-2026-0147</b></span><span>Date <b>12 Mar 2026</b></span><span>Due <b>11 Apr 2026</b></span><span>Bill to <b>Northgate Holding</b></span></div>
              <div class="cap-z" data-zone="body"><table class="cap-doc__tbl"><tr><th>Item</th><th>Qty</th><th>Amount</th></tr><tr><td>Printer paper, A4 (box)</td><td>120</td><td>5,040.00</td></tr><tr><td>Toner cartridges</td><td>18</td><td>6,480.00</td></tr><tr><td>Office chairs</td><td>12</td><td>4,980.00</td></tr></table></div>
              <div class="cap-z cap-doc__tot" data-zone="total"><span>Subtotal<b>16,500.00</b></span><span>VAT 15%<b>2,475.00</b></span><span class="cap-doc__grand">Total SAR<b>18,975.00</b></span></div>`, S.invoice, t);
  const contract = docShell("contract", t("Sample document: service contract", "وثيقة نموذجية: عقد خدمات"), 'lang="en" dir="ltr"', `              <div class="cap-z cap-doc__head" data-zone="head"><div><b class="cap-doc__org">Server Maintenance Agreement</b><span class="cap-doc__sub">Northgate Holding · Meridian Data Services Ltd.</span></div><div class="cap-doc__kind">CONTRACT</div></div>
              <div class="cap-z cap-doc__refs" data-zone="ref"><span>Reference <b>CT-2026-031</b></span><span>Client <b>Northgate Holding</b></span><span>Provider <b>Meridian Data Services Ltd.</b></span></div>
              <div class="cap-z cap-doc__clauses" data-zone="body"><p><b>1. Scope.</b> The Provider maintains the Client's production servers, applies security updates and responds to incidents.</p><p><b>2. Service levels.</b> Critical incidents are acknowledged within one hour and resolved within eight hours.</p><p><b>3. Payment.</b> The Client pays quarterly in arrears within thirty days of invoice.</p></div>
              <div class="cap-z cap-doc__tot" data-zone="total"><span>Effective<b>1 Feb 2026</b></span><span>Expiry<b>31 Jan 2028</b></span><span class="cap-doc__grand">Value SAR<b>420,000.00</b></span></div>`, S.contract, t);
  const employee = docShell("employee", t("Sample document: employee file", "وثيقة نموذجية: ملف موظف"), 'lang="ar" dir="rtl"', `              <div class="cap-z cap-doc__head" data-zone="head"><div><b class="cap-doc__org">ملف موظف — نموذج تعيين</b><span class="cap-doc__sub">الموارد البشرية</span></div><span class="cap-doc__photo" aria-hidden="true"></span></div>
              <div class="cap-z cap-doc__refs" data-zone="ref"><span>الاسم <b>سارة محمد العتيبي</b></span><span>رقم الموظف <b dir="ltr">EMP-4471</b></span><span>رقم الهوية <b dir="ltr">10•• •••• ••</b></span></div>
              <div class="cap-z cap-doc__clauses" data-zone="body"><p><b>الإدارة:</b> الموارد البشرية</p><p><b>المسمى الوظيفي:</b> أخصائي توظيف</p><p><b>جهة العمل:</b> المقر الرئيسي، الرياض</p></div>
              <div class="cap-z cap-doc__tot" data-zone="total"><span>تاريخ التعيين<b dir="ltr">2025-09-01</b></span><span class="cap-doc__grand">نوع العقد<b>دوام كامل</b></span></div>`, S.employee, t);
  return `${invoice}\n          ${contract}\n          ${employee}`;
}

export function buildCaptureMain(ctx, h) {
  const { lang, ui, tpl, home, section, reveal, W, ctaWindow, crumbHome, crumbDocs } = h;
  const t = (en, ar) => (lang === "ar" ? ar.replace(/‹([^›]*)›/g, "<bdi>$1</bdi>") : en);
  const tag = (kind) => kind === "demo"
    ? `<span class="cap-tag cap-tag--demo" title="${t("Demonstration", "عرض توضيحي")}">${t("Demonstration", "عرض توضيحي")}</span>`
    : `<span class="cap-tag cap-tag--potential" title="${t("Potential integration", "تكامل محتمل")}">${t("Potential integration", "تكامل محتمل")}</span>`;
  const DEMO_LABEL = t("Interactive demonstration, sample documents only", "عرض توضيحي تفاعلي بوثائق نموذجية فقط");

  const card = (icon, title, text, extra = "", i = 0) => `          <li class="sp-card cap-card"${reveal(i)}>${icon}<h3 class="sp-card__title">${title}</h3><p>${text}</p>${extra}</li>`;
  const grid = (items, cls = "") => `        <ul class="sp-grid cap-grid${cls}">\n${items.join("\n")}\n        </ul>`;
  const side = (kind, text) => `<p class="cap-side">${tag(kind)}<span>${text}</span></p>`;

  // ---- Hero
  const hero = `    <section class="sp-hero" aria-labelledby="page-title">
      <div class="${W} sp-hero__grid">
        <div class="sp-hero__copy">
          <nav class="sp-crumbs" aria-label="${ui.crumbsLabel}"><ol><li><a href="${crumbHome}">${ui.home}</a></li><li><a href="${crumbDocs}">${t("Document Management", "إدارة الوثائق")}</a></li><li aria-current="page">${t("Document Capture", "التقاط الوثائق")}</li></ol></nav>
          <p class="sp-eyebrow">${sp("i-ocr")}<span><bdi>DMS</bdi> · ${t("Document Capture", "التقاط الوثائق")}</span></p>
          <h1 id="page-title">${t("Capture Everything. Understand Every Document.", "التقطوا كل شيء. وافهموا كل وثيقة.")}</h1>
          <p class="sp-lead">${t("ECM+ brings paper, files and emails into one archive, reads their text in Arabic and English, and proposes the index fields for staff to confirm.", "تجمع منظومة ‹ECM+› الورق والملفات ورسائل البريد في أرشيف واحد، وتقرأ نصوصها بالعربية والإنجليزية، وتقترح حقول الفهرسة ليؤكدها الموظف.")}</p>
          <div class="sp-actions"><a class="${tpl.btn1}" href="#demo">${t("Explore Document Capture", "استكشف التقاط الوثائق")}</a><a class="${tpl.btn2}" href="${home}#contact">${ui.demo}</a></div>
        </div>
        <div class="sp-hero__visual cap-art" aria-hidden="true">
          <span class="cap-mini cap-mini--1"><i></i><i></i><i></i><i></i></span>
          <span class="cap-mini cap-mini--2"><i></i><i></i><i></i><i></i></span>
          <span class="cap-mini cap-mini--3"><i></i><i></i><i></i><i></i></span>
          <span class="cap-art__line"></span>
          <span class="cap-art__chip"><bdi>DOC-2026-00418</bdi> · ${t("Archived", "مؤرشف")}</span>
        </div>
      </div>
    </section>`;

  // ---- 01 Channels
  const channels = grid([
    card(ic(Z.scan), t("Scanning", "المسح الضوئي"), t("The local scanner service scans straight into the archive, page by page or through the auto-feeder.", "تمسح خدمة الماسح الضوئي المحلية الوثائق مباشرة إلى الأرشيف، صفحة صفحة أو عبر وحدة التغذية التلقائية."), "", 0),
    card(ic(Z.upload), t("Digital upload", "الرفع الرقمي"), t("Upload from a device, start from a template or a blank document, or capture from Google Drive and OneDrive.", "رفع الملفات من الجهاز، أو البدء من قالب أو وثيقة فارغة، أو الالتقاط من ‹Google Drive› و‹OneDrive›."), "", 1),
    card(sp("i-mail"), t("Email capture", "الالتقاط من البريد"), t("Gmail, Outlook or a business mailbox connects to the suite; emails are filed into a correspondence or the archive, and the Outlook add-in saves and routes them.", "يُربط ‹Gmail› أو ‹Outlook› أو البريد المؤسسي بالمنظومة، وتُحفظ الرسائل ضمن مراسلة أو في الأرشيف، وتحفظها إضافة ‹Outlook› وتحيلها."), "", 2),
    card(sp("i-link"), t("External system integration", "التكامل مع الأنظمة الأخرى"), t("A REST API lets other systems file documents into the archive, and existing archives are migrated in.", "تتيح واجهة ‹REST› للأنظمة الأخرى حفظ الوثائق في الأرشيف، وتُنقل الأرشيفات القائمة إليه."), side("potential", t("Scheduled capture from shared folders", "الالتقاط المجدول من المجلدات المشتركة")), 3),
    card(ic(Z.camera), t("Camera capture", "الالتقاط بالكاميرا"), t("Photographing a document from a phone or tablet and filing it like a scan.", "تصوير الوثيقة بهاتف أو جهاز لوحي وحفظها كما يُحفظ المسح الضوئي."), side("potential", t("Not part of the product today", "ليس جزءًا من المنظومة اليوم")), 4),
  ]);

  // ---- 02 Intelligence
  const intel = grid([
    card(ic(Z.image), t("Image processing", "معالجة الصور"), t("Straightening, cropping and cleaning scanned pages before recognition.", "تعديل ميل الصفحات الممسوحة وقصّها وتنقيتها قبل التعرّف."), side("demo", t("Shown in the demonstration", "يظهر في العرض التوضيحي")), 0),
    card(sp("i-ocr"), t("Text recognition, Arabic and English", "التعرّف على النصوص بالعربية والإنجليزية"), t("OCR reads scanned and image files, so their content is searchable and opens at the matching page.", "يقرأ التعرّف الضوئي (‹OCR›) الملفات الممسوحة والصور، فيصبح محتواها قابلًا للبحث ويُفتح عند الصفحة المطابقة."), "", 1),
    card(sp("i-tag"), t("Classification", "التصنيف"), t("Suggesting the document type from its content. In ECM+ today, staff choose the type, and its index fields follow.", "اقتراح نوع الوثيقة من محتواها. في ‹ECM+› اليوم يختار الموظف النوع، فتتبعه حقول الفهرسة."), side("demo", t("Shown in the demonstration", "يظهر في العرض التوضيحي")), 2),
    card(sp("i-spark"), t("Metadata extraction", "استخراج البيانات"), t("Auto fill from file reads the document and proposes values for the type’s index fields: text, numbers and dates. Only empty fields are filled, and staff review before saving. An invoice yields its number, date and total; a contract its parties and expiry; an employee file its name, number and hire date.", "تقرأ «التعبئة التلقائية من الملف» الوثيقة وتقترح قيم حقول الفهرسة لنوعها: نصوصًا وأرقامًا وتواريخ. تُعبَّأ الحقول الفارغة فقط، ويراجعها الموظف قبل الحفظ. فتعطي الفاتورة رقمها وتاريخها وإجماليها، والعقد أطرافه وتاريخ انتهائه، وملف الموظف اسمه ورقمه وتاريخ تعيينه."), "", 3),
    card(ic(Z.barcode), t("Barcode and QR codes", "الباركود ورموز QR"), t("ECM+ generates a code for each document and stamps it on the pages.", "تولّد ‹ECM+› رمزًا لكل وثيقة وتختمه على صفحاتها."), side("potential", t("Reading codes on incoming paper to route or split batches", "قراءة الرموز على الورق الوارد لتوجيه الدفعات أو تقسيمها")), 4),
    card(sp("i-shield"), t("Validation", "التحقق"), t("Checking proposed values against rules, such as a due date after the invoice date.", "مطابقة القيم المقترحة مع قواعد محددة، كأن يلي تاريخُ الاستحقاق تاريخَ الفاتورة."), side("demo", t("Shown in the demonstration", "يظهر في العرض التوضيحي")), 5),
  ]);

  // ---- 03 Demo
  const stepTitles = [
    t("Choose a sample", "اختيار وثيقة نموذجية"), t("Explore the document", "استعراض الوثيقة"), t("Recognition", "التعرّف على النص"),
    t("Classification", "التصنيف"), t("Index fields", "حقول الفهرسة"), t("Code stamp", "ختم الرمز"), t("Archive record", "سجل الأرشفة"),
  ];
  const stepper = stepTitles.map((s, i) => `<li><button type="button" class="cap-step" data-go="${i + 1}"><span class="cap-step__n" aria-hidden="true">${i + 1}</span><span class="cap-step__t">${s}</span></button></li>`).join("");
  const nojs = stepTitles.map((s) => `<li>${s}</li>`).join("");

  const picks = Object.entries(SAMPLES).map(([k, s]) => `<button type="button" class="cap-pick" data-pick="${k}" aria-pressed="false"><span class="cap-pick__mini" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="cap-pick__name">${s.name[lang]}</span><span class="cap-pick__meta">${s.langs[lang]} · ${t(s.pages === 1 ? "1 page" : `${s.pages} pages`, s.pages === 1 ? "صفحة واحدة" : `${s.pages} صفحات`)}</span><span class="cap-pick__via">${t("Captured via", "طريقة الالتقاط")}: ${s.via[lang]}</span></button>`).join("\n            ");

  const zones = [
    ["head", t("Header", "الترويسة")], ["ref", t("Reference details", "بيانات المرجع")], ["body", t("Content", "المحتوى")],
    ["total", t("Totals and key terms", "الإجماليات والبنود الأساسية")], ["sign", t("Signature", "التوقيع")], ["code", t("Code area", "منطقة الرمز")],
  ];
  const zoneBtns = zones.map(([k, l]) => `<button type="button" class="cap-zonebtn" data-zonebtn="${k}" aria-pressed="false">${l}</button>`).join("");

  const perSample = (fn) => Object.entries(SAMPLES).map(([k, s]) => fn(k, s)).join("\n              ");
  const metaRows = perSample((k, s) => `<dl class="cap-meta" data-for="${k}"><div><dt>${t("Pages", "الصفحات")}</dt><dd>${s.pages}</dd></div><div><dt>${t("Language", "اللغة")}</dt><dd>${s.langs[lang]}</dd></div><div><dt>${t("Captured via", "طريقة الالتقاط")}</dt><dd>${s.via[lang]}</dd></div></dl>`);
  const excerpts = perSample((k, s) => `<div class="cap-excerpt" data-for="${k}">${s.excerpt.map(([l, d]) => `<p dir="${d}" lang="${d === "rtl" ? "ar" : "en"}">${l}</p>`).join("")}</div>`);
  const typeSets = perSample((k, s) => `<fieldset class="cap-types" data-for="${k}"><legend class="cap-sr">${t("Suggested document type", "نوع الوثيقة المقترح")}</legend>${s.types.map((ty, i) => `<label class="cap-type"><input type="radio" name="type-${k}" value="${esc(ty[lang])}"${i === 0 ? " checked" : ""}><span>${ty[lang]}${i === 0 ? ` <em>${t("suggested", "مقترح")}</em>` : ""}</span></label>`).join("")}</fieldset>`);
  const fieldSets = perSample((k, s) => `<div class="cap-fields" data-for="${k}">${s.fields.map((f) => `<div class="cap-field" data-z="${f.z}"><label for="f-${k}-${f.key}">${f[lang]}</label><input id="f-${k}-${f.key}" data-key="${f.key}" type="${f.type === "date" ? "date" : "text"}"${f.type === "number" ? ' inputmode="decimal"' : ""} dir="auto" autocomplete="off"${f.v ? "" : ` placeholder="${t("Left for staff to fill", "متروك ليعبّئه الموظف")}"`}><span class="cap-chip" data-chip></span><button type="button" class="cap-reset" data-reset hidden>${t("Reset", "استعادة")}</button></div>`).join("")}</div>`);
  const records = perSample((k, s) => `<dl class="cap-record" data-for="${k}">
                <div><dt>${t("Document type", "نوع الوثيقة")}</dt><dd data-doctype>${s.types[0][lang]}</dd></div>
                <div><dt>${t("Folder", "المجلد")}</dt><dd>${s.folder[lang]}</dd></div>
                ${s.fields.map((f) => `<div><dt>${f[lang]}</dt><dd data-rf="${f.key}"></dd></div>`).join("")}
                <div><dt>${t("Code", "الرمز")}</dt><dd><bdi>${s.code}</bdi></dd></div>
                <div><dt>${t("Captured via", "طريقة الالتقاط")}</dt><dd>${s.via[lang]}</dd></div>
                <div><dt>${t("Text recognition", "التعرّف على النص")}</dt><dd>${t("Done, ", "تم، ")}${s.langs[lang]}</dd></div>
                <div><dt>${t("Permissions", "الصلاحيات")}</dt><dd>${t("Folder rules apply", "تسري قواعد المجلد")}</dd></div>
              </dl>`);

  const panels = `
            <div class="cap-panel" data-panel="1">
              <p class="cap-hint">${t("Choose a sample document. The samples are fictional and nothing is uploaded.", "اختاروا وثيقة نموذجية. الوثائق افتراضية ولا يُرفع أي شيء.")}</p>
              <div class="cap-picks">
            ${picks}
              </div>
            </div>
            <div class="cap-panel" data-panel="2">
              <p class="cap-hint">${t("Select a part of the document to see where it sits on the page.", "اختاروا جزءًا من الوثيقة لتروا موضعه في الصفحة.")}</p>
              <div class="cap-zonebtns">${zoneBtns}</div>
              ${metaRows}
            </div>
            <div class="cap-panel" data-panel="3">
              <p class="cap-recog"><span class="cap-recog__run">${t("Reading the page…", "جارٍ قراءة الصفحة…")}</span><span class="cap-recog__done">${t("Text recognized: ", "تم التعرّف على النص: ")}<strong data-recog-lang></strong></span></p>
              <p class="cap-hint">${t("An excerpt of the recognized text:", "مقتطف من النص المتعرَّف عليه:")}</p>
              ${excerpts}
              <p class="cap-note">${t("ECM+ extracts the text of scanned and image files, so their content is searchable.", "تستخرج ‹ECM+› نص الملفات الممسوحة والصور، فيصبح محتواها قابلًا للبحث.")}</p>
            </div>
            <div class="cap-panel" data-panel="4">
              <p class="cap-hint">${tag("demo")} ${t("Suggested type", "النوع المقترح")}:</p>
              ${typeSets}
              <p class="cap-note">${t("In ECM+ today, staff choose the document type; the AI then fills its index fields.", "في ‹ECM+› اليوم يختار الموظف نوع الوثيقة، ثم يعبّئ الذكاء الاصطناعي حقول الفهرسة.")}</p>
            </div>
            <div class="cap-panel" data-panel="5">
              <p class="cap-hint">${t("AI proposes the values. Edit any field before saving.", "يقترح الذكاء الاصطناعي القيم. عدّلوا أي حقل قبل الحفظ.")}</p>
              ${fieldSets}
              <p class="cap-note">${t("Only empty fields are filled; staff review before saving.", "تُعبَّأ الحقول الفارغة فقط، ويراجعها الموظف قبل الحفظ.")}</p>
            </div>
            <div class="cap-panel" data-panel="6">
              <div class="cap-stampdemo"><span class="cap-stamp cap-stamp--lg" aria-hidden="true">${barcode(418)}${qr(418)}<bdi class="cap-stamp__no" data-code></bdi></span></div>
              <p class="cap-note">${t("ECM+ generates the code and stamps it on the document. The QR shown is a sample pattern.", "تولّد ‹ECM+› الرمز وتختمه على الوثيقة. رمز ‹QR› المعروض نمط توضيحي.")}</p>
              <p class="cap-side cap-side--dim">${tag("potential")}<span>${t("Reading codes on incoming paper to route or split batches", "قراءة الرموز على الورق الوارد لتوجيه الدفعات أو تقسيمها")}</span></p>
            </div>
            <div class="cap-panel" data-panel="7">
              ${records}
              <p class="cap-done" role="status">${t("Your document is now ready to become part of your enterprise knowledge repository.", "أصبحت وثيقتكم الآن جاهزة لتكون جزءًا من مستودع المعرفة في مؤسستكم.")}</p>
              <p class="cap-note">${t("Folder permissions, versions and the audit trail apply once the record is saved.", "تسري صلاحيات المجلدات والإصدارات وسجل التدقيق عند حفظ السجل.")}</p>
            </div>`;

  const data = {
    ui: {
      step: t("Step {n} of 7: {t}", "الخطوة {n} من 7: {t}"),
      titles: stepTitles,
      proposed: t("Proposed by AI", "مقترح من الذكاء الاصطناعي"),
      edited: t("Edited by you", "عدّلتموه"),
      empty: t("Left for staff to fill", "متروك ليعبّئه الموظف"),
      none: "—",
      next: t("Next", "التالي"), back: t("Back", "السابق"), save: t("Save to archive", "حفظ في الأرشيف"),
      saved: t("Saved to the archive (demonstration)", "تم الحفظ في الأرشيف (عرض توضيحي)"), again: t("Try another sample", "جرّبوا وثيقة أخرى"),
    },
    samples: Object.fromEntries(Object.entries(SAMPLES).map(([k, s]) => [k, { code: s.code, lang: s.langs[lang], fields: s.fields.map((f) => ({ key: f.key, v: f.v })) }])),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  const demoBody = `        <div class="cap-demo" id="cap-demo" data-step="1" data-sample="">
          <p class="cap-nojs nojs-only">${t("The interactive demonstration needs JavaScript. These are its seven steps:", "يحتاج العرض التوضيحي التفاعلي إلى جافاسكربت. هذه خطواته السبع:")}</p>
          <ol class="cap-nojs nojs-only">${nojs}</ol>
          <ol class="cap-stepper js-only" aria-label="${t("Demonstration steps", "خطوات العرض التوضيحي")}">${stepper}</ol>
          <div class="cap-stage">
            <header class="cap-stage__head">
              <h3 class="cap-stage__title js-only" tabindex="-1"></h3>
              <p class="cap-tag cap-tag--demo cap-tag--banner">${DEMO_LABEL}</p>
              <span class="cap-sr" role="status" aria-live="polite" data-live></span>
            </header>
            <div class="cap-stage__grid">
              <div class="cap-docs">
          ${docs(t)}
              </div>
              <div class="cap-panels">${panels}
              </div>
            </div>
            <div class="cap-stage__foot js-only">
              <button type="button" class="btn btn--ghost-gold" data-back>${t("Back", "السابق")}</button>
              <button type="button" class="btn btn--gold" data-next>${t("Next", "التالي")}</button>
            </div>
          </div>
          <script type="application/json" id="capture-data">${json}</script>
        </div>`;
  const demo = section("03", DEMO_LABEL, "demo-title", t("Experience Intelligent Document Capture", "جرّبوا الالتقاط الذكي للوثائق"), demoBody).replace("<section ", '<section id="demo" ');

  // ---- 04 Benefits, 05 Advanced, 06 Departments
  const benefits = grid([
    card(sp("i-spark"), t("Less manual entry", "إدخال يدوي أقل"), t("Index fields are proposed from the file, so staff confirm rather than type.", "تُقترح حقول الفهرسة من الملف، فيكتفي الموظف بالتأكيد بدل الإدخال."), "", 0),
    card(sp("i-search"), t("Searchable from day one", "قابلة للبحث منذ اليوم الأول"), t("Recognized text and index fields make every captured document findable by meaning and by field.", "يجعل النص المتعرَّف عليه وحقول الفهرسة كل وثيقة ملتقطة قابلة للبحث بالمعنى وبالحقل."), "", 1),
    card(sp("i-archive"), t("One archive for every channel", "أرشيف واحد لكل القنوات"), t("Paper, files, cloud drives and email land in the same document types and folders.", "يصل الورق والملفات ومحركات التخزين السحابية والبريد إلى أنواع الوثائق والمجلدات نفسها."), "", 2),
    card(sp("i-lock"), t("Governed from capture", "محكومة منذ الالتقاط"), t("Folder permissions, versions and the audit trail apply the moment a document is saved.", "تسري صلاحيات المجلدات والإصدارات وسجل التدقيق لحظة حفظ الوثيقة."), "", 3),
  ]);

  const caps = [
    [t("Auto-feeder scanning", "المسح عبر وحدة التغذية التلقائية")],
    [t("Voice and video notes captured beside documents", "ملاحظات صوتية ومرئية تُلتقط إلى جانب الوثائق")],
    [t("Archive migration from existing systems", "نقل الأرشيفات من الأنظمة القائمة")],
    [t("REST API for other systems", "واجهة ‹REST› للأنظمة الأخرى")],
    [t("Google Drive and OneDrive capture", "الالتقاط من ‹Google Drive› و‹OneDrive›")],
    [t("Outlook add-in that saves and routes emails", "إضافة ‹Outlook› لحفظ الرسائل وإحالتها")],
    [t("Generated barcode and QR stamps", "أختام باركود و‹QR› مولَّدة")],
    [t("Batch splitting by barcode", "تقسيم الدفعات بالباركود"), "potential"],
    [t("Rule-based validation", "التحقق وفق القواعد"), "demo"],
    [t("Scheduled folder capture", "الالتقاط المجدول من المجلدات"), "potential"],
  ];
  const capList = `        <ul class="cap-list">\n${caps.map(([txt, k], i) => `          <li${reveal(i)}><svg class="cap-list__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#i-check"/></svg><span>${txt}</span>${k ? tag(k) : ""}</li>`).join("\n")}\n        </ul>`;

  const deps = grid([
    card(sp("i-building"), t("Finance", "المالية"), t("Supplier invoices scanned in batches; invoice number, date and total proposed for review.", "تُمسح فواتير الموردين دفعات؛ وتُقترح أرقامها وتواريخها وإجمالياتها للمراجعة."), "", 0),
    card(sp("i-people"), t("Human Resources", "الموارد البشرية"), t("Employee files captured in Arabic, with name, number and hire date proposed, under HR-only folder permissions.", "تُلتقط ملفات الموظفين بالعربية، مع اقتراح الاسم والرقم وتاريخ التعيين، ضمن صلاحيات مجلدات مقصورة على الموارد البشرية."), "", 1),
    card(sp("i-ticket"), t("Procurement", "المشتريات"), t("Quotations and purchase orders arriving by email are filed from the inbox or the Outlook add-in.", "تُحفظ عروض الأسعار وأوامر الشراء الواردة بالبريد من صندوق الوارد أو إضافة ‹Outlook›."), "", 2),
    card(sp("i-sign"), t("Legal", "الشؤون القانونية"), t("Contracts uploaded with parties, reference and expiry date proposed; retention rules can send scheduled notifications.", "تُرفع العقود مع اقتراح الأطراف والمرجع وتاريخ الانتهاء؛ ويمكن لقواعد الاحتفاظ إرسال تنبيهات مجدولة."), "", 3),
    card(sp("i-mail"), t("Administration", "الشؤون الإدارية"), t("Incoming letters scanned and filed into correspondence, with their serial number and due date.", "تُمسح الخطابات الواردة وتُحفظ ضمن المراسلات برقمها التسلسلي وتاريخ استحقاقها."), "", 4),
  ]);

  const ctaTitle = t("Make Every Document Work for Your Business.", "اجعلوا كل وثيقة تعمل لصالح أعمالكم.");
  const prefill = esc(t("We would like to discuss document capture with your team.", "نرغب في مناقشة التقاط الوثائق مع فريقكم."));
  const cta = `    <section class="sp-cta" aria-labelledby="cta-title">
      <div class="${W}">
        <div class="sp-cta__inner">
          <div class="sp-cta__copy">
            <p class="sp-cta__eyebrow"><span class="sp-cta__mark" aria-hidden="true"></span><span>${ui.ctaEyebrow}</span></p>
            <h2 id="cta-title">${ctaTitle}</h2>
            <p class="sp-cta__text">${t("See capture on your own document types, in Arabic or English.", "شاهدوا الالتقاط على أنواع وثائقكم، بالعربية أو الإنجليزية.")}</p>
            <div class="sp-actions sp-cta__actions"><a class="${tpl.btn1}" href="${home}#contact">${t("Request a Demo", "اطلب عرضًا تجريبيًا")}</a><a class="${tpl.btn2} sp-cta__ghost" href="${home}#contact" data-prefill="${prefill}">${t("Contact Our Team", "تواصلوا مع فريقنا")}</a></div>
          </div>
          ${ctaWindow(ui)}
        </div>
      </div>
    </section>`;

  const sections = [
    section("01", t("Capture channels", "قنوات الالتقاط"), "channels-title", t("One Platform. Multiple Ways to Capture", "منصة واحدة. طرق متعددة للالتقاط"), channels),
    section("02", t("Document intelligence", "ذكاء الوثائق"), "intel-title", t("Beyond Digitization. Into Document Intelligence.", "ما بعد الرقمنة: نحو ذكاء الوثائق."), intel, true),
    demo,
    section("04", t("Benefits", "الفوائد"), "benefits-title", t("Turn Document Processing into Business Efficiency", "حوّلوا معالجة الوثائق إلى كفاءة في العمل"), benefits, true),
    section("05", t("Advanced capabilities", "قدرات متقدمة"), "adv-title", t("Built for high-volume, bilingual archives", "مصمّمة للأرشيفات ثنائية اللغة عالية الحجم"), capList),
    section("06", t("By department", "حسب الإدارة"), "dept-title", t("The same capture, in every department", "الالتقاط نفسه في كل إدارة"), deps, true),
  ];
  return `  <main id="main" class="sp sp--capture">\n${hero}\n\n${sections.join("\n\n")}\n\n${cta}\n  </main>`;
}
