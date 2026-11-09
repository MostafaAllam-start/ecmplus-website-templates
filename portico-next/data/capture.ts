// Document Capture page copy and sample data (ported from scripts/capture-page.mjs, then extended:
// five samples, eight steps). Strings are { en, ar } pairs; Latin names inside Arabic strings are
// wrapped in ‹…› and turned into <bdi> at render time (see `fmt`).
//
// Honesty rule: what the product does today is stated plainly (scanner upload, upload from a
// device / templates / Google Drive / OneDrive, mail filing, OCR, AI-filled index fields reviewed
// by staff, generated barcode/QR stamps, REST API, migration). Anything else is tagged
// "Demonstration" or "Potential integration", and the interactive part says it is a demonstration.
import type { Lang } from "@/lib/site";

export type Bi = { en: string; ar: string };
const b = (en: string, ar: string): Bi => ({ en, ar });

/** Pick a language and turn ‹x› markers into <bdi>x</bdi> (the form `rich()` renders). */
export const fmt = (s: Bi, lang: Lang): string => (lang === "ar" ? s.ar.replace(/‹([^›]*)›/g, "<bdi>$1</bdi>") : s.en);
/** Plain text of a string (for attributes). */
export const plain = (s: Bi, lang: Lang): string => (lang === "ar" ? s.ar.replace(/[‹›]/g, "") : s.en);

export type ZoneKey = "head" | "ref" | "body" | "total" | "sign" | "code";
export const ZONE_KEYS: ZoneKey[] = ["head", "ref", "body", "total", "sign", "code"];
export const ZONE_NAMES: Record<ZoneKey, Bi> = {
  head: b("Header", "الرؤوس"),
  ref: b("Reference details", "بيانات المرجع"),
  body: b("Content", "المحتوى"),
  total: b("Totals and key terms", "الإجماليات والبنود الأساسية"),
  sign: b("Signature", "التوقيع"),
  code: b("Code area", "منطقة الرمز"),
};

export type SampleKey = "invoice" | "contract" | "application" | "identity" | "correspondence";
export const SAMPLE_KEYS: SampleKey[] = ["invoice", "contract", "application", "identity", "correspondence"];

export interface FieldDef {
  key: string;
  type: "text" | "date" | "number";
  z: ZoneKey | "";
  v: string;
  en: string;
  ar: string;
}
export interface SampleDef {
  code: string;
  seed: number;
  pages: number;
  color: string;
  langs: Bi;
  name: Bi;
  via: Bi;
  folder: Bi;
  types: Bi[];
  fields: FieldDef[];
  excerpt: [string, "ltr" | "rtl"][];
}

// The five fictional sample documents. `z` is the document zone a field is read from; an empty zone
// means staff enter the value.
export const SAMPLES: Record<SampleKey, SampleDef> = {
  invoice: {
    code: "DOC-2026-00418", seed: 418, pages: 1, color: "#A87B0E",
    langs: b("Arabic and English", "العربية والإنجليزية"),
    name: b("Supplier invoice", "فاتورة مورد"),
    via: b("Scanner (auto-feeder)", "الماسح الضوئي (التغذية التلقائية)"),
    folder: b("Finance / Supplier invoices 2026", "المالية / فواتير الموردين 2026"),
    types: [b("Supplier invoice", "فاتورة مورد"), b("Purchase order", "أمر شراء"), b("Delivery note", "إشعار تسليم")],
    fields: [
      { key: "supplier", type: "text", z: "head", v: "Al-Rawabi Office Supplies Co.", en: "Supplier", ar: "المورد" },
      { key: "number", type: "text", z: "ref", v: "INV-2026-0147", en: "Invoice number", ar: "رقم الفاتورة" },
      { key: "date", type: "date", z: "ref", v: "2026-03-12", en: "Invoice date", ar: "تاريخ الفاتورة" },
      { key: "due", type: "date", z: "ref", v: "2026-04-11", en: "Due date", ar: "تاريخ الاستحقاق" },
      { key: "total", type: "number", z: "total", v: "18975.00", en: "Total amount", ar: "المبلغ الإجمالي" },
      { key: "tax", type: "number", z: "total", v: "2475.00", en: "Tax (VAT 15%)", ar: "الضريبة (القيمة المضافة 15%)" },
      { key: "currency", type: "text", z: "total", v: "SAR", en: "Currency", ar: "العملة" },
      { key: "cost", type: "text", z: "", v: "", en: "Cost centre", ar: "مركز التكلفة" },
    ],
    excerpt: [["Al-Rawabi Office Supplies Co. — شركة الروابي للتجهيزات المكتبية", "ltr"], ["Tax invoice INV-2026-0147 · 12 Mar 2026", "ltr"], ["Total SAR 18,975.00", "ltr"]],
  },
  contract: {
    code: "DOC-2026-00419", seed: 419, pages: 3, color: "#1F3A5F",
    langs: b("English", "الإنجليزية"),
    name: b("Service contract", "عقد خدمات"),
    via: b("Upload from device", "الرفع من الجهاز"),
    folder: b("Legal / Contracts", "الشؤون القانونية / العقود"),
    types: [b("Service agreement", "اتفاقية خدمات"), b("Non-disclosure agreement", "اتفاقية عدم إفصاح"), b("Purchase order", "أمر شراء")],
    fields: [
      { key: "type", type: "text", z: "head", v: "Service agreement", en: "Contract type", ar: "نوع العقد" },
      { key: "ref", type: "text", z: "ref", v: "CT-2026-031", en: "Reference", ar: "المرجع" },
      { key: "parties", type: "text", z: "ref", v: "Northgate Holding; Meridian Data Services Ltd.", en: "Parties", ar: "الأطراف" },
      { key: "from", type: "date", z: "total", v: "2026-02-01", en: "Effective date", ar: "تاريخ السريان" },
      { key: "to", type: "date", z: "total", v: "2028-01-31", en: "Expiry date", ar: "تاريخ الانتهاء" },
      { key: "value", type: "number", z: "total", v: "420000.00", en: "Value (SAR)", ar: "القيمة (ريال)" },
      { key: "owner", type: "text", z: "", v: "", en: "Owner department", ar: "الإدارة المالكة" },
    ],
    excerpt: [["Server Maintenance Agreement", "ltr"], ["Contract CT-2026-031 · Northgate Holding and Meridian Data Services Ltd.", "ltr"], ["Expiry: 31 January 2028", "ltr"]],
  },
  application: {
    code: "DOC-2026-00420", seed: 420, pages: 2, color: "#B5522E",
    langs: b("Arabic", "العربية"),
    name: b("Job application", "طلب توظيف"),
    via: b("Outlook add-in", "إضافة Outlook"),
    folder: b("HR / Job applications", "الموارد البشرية / طلبات التوظيف"),
    types: [b("Job application", "طلب توظيف"), b("Employee file", "ملف موظف"), b("Leave request", "طلب إجازة")],
    fields: [
      { key: "ref", type: "text", z: "ref", v: "APP-2026-0233", en: "Application number", ar: "رقم الطلب" },
      { key: "name", type: "text", z: "ref", v: "ريم خالد الحربي", en: "Applicant name", ar: "اسم المتقدمة" },
      { key: "position", type: "text", z: "body", v: "محاسب أول", en: "Position applied for", ar: "الوظيفة المتقدَّم لها" },
      { key: "dept", type: "text", z: "body", v: "المالية", en: "Department", ar: "الإدارة" },
      { key: "date", type: "date", z: "total", v: "2026-04-02", en: "Application date", ar: "تاريخ الطلب" },
      { key: "reviewer", type: "text", z: "", v: "", en: "HR reviewer", ar: "مراجع الموارد البشرية" },
    ],
    excerpt: [["طلب توظيف — إدارة المالية", "rtl"], ["ريم خالد الحربي", "rtl"], ["الوظيفة: محاسب أول · رقم الطلب APP-2026-0233", "rtl"]],
  },
  identity: {
    code: "DOC-2026-00421", seed: 421, pages: 1, color: "#22736E",
    langs: b("English and Arabic", "الإنجليزية والعربية"),
    name: b("Identity document", "وثيقة هوية"),
    via: b("Scanner (flatbed)", "الماسح الضوئي (المسطّح)"),
    folder: b("Administration / Identity records", "الشؤون الإدارية / سجلات الهوية"),
    types: [b("Identity document", "وثيقة هوية"), b("Employee file", "ملف موظف"), b("Visitor pass", "تصريح زائر")],
    fields: [
      { key: "authority", type: "text", z: "head", v: "Civil Registry (sample)", en: "Issuing authority", ar: "جهة الإصدار" },
      { key: "name", type: "text", z: "ref", v: "Omar Saleh Al-Mansour", en: "Full name", ar: "الاسم الكامل" },
      { key: "id", type: "text", z: "ref", v: "1•••••••42", en: "ID number (masked)", ar: "رقم الهوية (مخفي)" },
      { key: "dob", type: "date", z: "ref", v: "1990-07-15", en: "Date of birth", ar: "تاريخ الميلاد" },
      { key: "issued", type: "date", z: "total", v: "2022-01-10", en: "Issue date", ar: "تاريخ الإصدار" },
      { key: "expiry", type: "date", z: "total", v: "2032-01-09", en: "Expiry date", ar: "تاريخ الانتهاء" },
    ],
    excerpt: [["SAMPLE · NOT A VALID DOCUMENT", "ltr"], ["Omar Saleh Al-Mansour · Civil Registry (sample)", "ltr"], ["ID 1•••••••42 · Expiry 2032-01-09", "ltr"]],
  },
  correspondence: {
    code: "DOC-2026-00422", seed: 422, pages: 1, color: "#6E6351",
    langs: b("Arabic", "العربية"),
    name: b("Official correspondence", "مراسلة رسمية"),
    via: b("Email capture", "الالتقاط من البريد"),
    folder: b("Correspondence / Incoming", "المراسلات / الوارد"),
    types: [b("Official correspondence", "مراسلة رسمية"), b("Circular", "تعميم"), b("Meeting minutes", "محضر اجتماع")],
    fields: [
      { key: "number", type: "text", z: "ref", v: "NRL/OUT/2026/1184", en: "Outgoing number", ar: "رقم الصادر" },
      { key: "date", type: "date", z: "ref", v: "2026-05-06", en: "Letter date", ar: "تاريخ الخطاب" },
      { key: "sender", type: "text", z: "head", v: "مكتب التراخيص في المنطقة الشمالية", en: "Sender", ar: "الجهة المرسلة" },
      { key: "recipient", type: "text", z: "ref", v: "Northgate Holding — Administration", en: "Recipient", ar: "الجهة المستلمة" },
      { key: "subject", type: "text", z: "body", v: "تجديد الرخصة التجارية", en: "Subject", ar: "الموضوع" },
      { key: "due", type: "date", z: "total", v: "2026-05-20", en: "Reply due date", ar: "موعد الرد" },
      { key: "assignee", type: "text", z: "", v: "", en: "Assigned to", ar: "المسؤول عن المتابعة" },
    ],
    excerpt: [["مكتب التراخيص في المنطقة الشمالية", "rtl"], ["الموضوع: تجديد الرخصة التجارية", "rtl"], ["رقم الصادر NRL/OUT/2026/1184 · 2026-05-06", "rtl"]],
  },
};

/** Section 03 demo strings. */
export const DEMO = {
  label: b("Interactive demonstration, sample documents only", "عرض توضيحي تفاعلي بوثائق نموذجية فقط"),
  sectionTitle: b("Experience Intelligent Document Capture", "جرّبوا الالتقاط الذكي للوثائق"),
  stepsLabel: b("Demonstration steps", "خطوات العرض التوضيحي"),
  nojs: b("The interactive demonstration needs JavaScript. These are its eight steps:", "يحتاج العرض التوضيحي التفاعلي إلى جافاسكربت. هذه خطواته الثماني:"),
  titles: [
    b("Choose a sample", "اختيار وثيقة نموذجية"), b("Explore the document", "استعراض الوثيقة"), b("Recognition", "التعرّف على النص"),
    b("Classification", "التصنيف"), b("Extraction", "الاستخراج"), b("Index fields", "حقول الفهرسة"),
    b("Code stamp", "ختم الرمز"), b("Archive record", "سجل الأرشفة"),
  ],
  modalTitles: [
    b("Preview", "معاينة"), b("Scan", "المسح الضوئي"), b("Extraction", "الاستخراج"),
    b("Metadata", "البيانات الوصفية"), b("Barcode or QR", "الباركود أو QR"), b("Archive record", "سجل الأرشفة"),
  ],
  step: b("Step {n} of {N}: {t}", "الخطوة {n} من {N}: {t}"),
  proposed: b("Proposed by AI", "مقترح من الذكاء الاصطناعي"),
  edited: b("Edited by you", "عدّلتموه"),
  empty: b("Left for staff to fill", "متروك ليعبّئه الموظف"),
  next: b("Next", "التالي"), back: b("Back", "السابق"), save: b("Save to archive", "حفظ في الأرشيف"),
  saved: b("Saved to the archive (demonstration)", "تم الحفظ في الأرشيف (عرض توضيحي)"),
  again: b("Try another sample", "جرّبوا وثيقة أخرى"),
  factory: b("Back to the workflow", "العودة إلى المسار"),
  replay: b("Replay", "إعادة التشغيل"),
  close: b("Close", "إغلاق"),
  source: b("Source: {z}", "المصدر: {z}"),
  staff: b("Entered by staff", "يُدخلها الموظف"),
  reset: b("Reset", "استعادة"),
  catLabel: b("Open a category", "افتحوا فئة"),
  catHint: b("Each category runs its own short guided view in a window.", "تعرض كل فئة مسارًا موجزًا خاصًا بها في نافذة."),
  catGroup: b("Document categories", "فئات الوثائق"),
  suggested: b("suggested", "مقترح"),
  pages: (n: number) => (n === 1 ? b("1 page", "صفحة واحدة") : b(`${n} pages`, `${n} صفحات`)),
  pageOf: (n: number) => b(`Page 1 of ${n}`, `الصفحة 1 من ${n}`),
  docLabel: (name: Bi) => b(`Sample document: ${name.en.toLowerCase()}`, `وثيقة نموذجية: ${name.ar}`),
  signature: b("Authorized signature", "التوقيع المعتمد"),
  capturedVia: b("Captured via", "طريقة الالتقاط"),
  hintChoose: b("Choose a sample document. The samples are fictional and nothing is uploaded.", "اختاروا وثيقة نموذجية. الوثائق افتراضية ولا يُرفع أي شيء."),
  hintExplore: b("Select a part of the document to see where it sits on the page.", "اختاروا جزءًا من الوثيقة لتروا موضعه في الصفحة."),
  pagesLabel: b("Pages", "الصفحات"), language: b("Language", "اللغة"),
  reading: b("Reading the page…", "جارٍ قراءة الصفحة…"),
  recognized: b("Text recognized: ", "تم التعرّف على النص: "),
  excerptHint: b("An excerpt of the recognized text:", "مقتطف من النص المتعرَّف عليه:"),
  recogNote: b("ECM+ extracts the text of scanned and image files, so their content is searchable.", "تستخرج ‹ECM+› نص الملفات الممسوحة ضوئيًا والصور، فيصبح محتواها قابلًا للبحث."),
  suggestedType: b("Suggested type", "النوع المقترح"),
  typeLegend: b("Suggested document type", "نوع الوثيقة المقترح"),
  classNote: b("In ECM+ today, staff choose the document type; the AI then fills its index fields.", "في ‹ECM+› اليوم يختار الموظف نوع الوثيقة، ثم يعبّئ الذكاء الاصطناعي حقول الفهرسة."),
  extractHint: b("The page is read zone by zone, and each value found is listed with the part of the document it comes from.", "تُقرأ الصفحة منطقةً منطقة، وتُسرد كل قيمة مع الجزء الذي وُجدت فيه من الوثيقة."),
  extracting: b("Extracting values…", "جارٍ استخراج القيم…"),
  extractedN: b("{n} values extracted", "تم استخراج {n} قيم"),
  extractNote: b("The values are proposals. Staff review them in the next step before anything is saved.", "هذه القيم مقترحات يراجعها الموظف في الخطوة التالية قبل حفظ أي شيء."),
  fieldsHint: b("AI proposes the values. Edit any field before saving.", "يقترح الذكاء الاصطناعي القيم. عدّلوا أي حقل قبل الحفظ."),
  fieldsNote: b("Only empty fields are filled; staff review before saving.", "تُعبَّأ الحقول الفارغة فقط، ويراجعها الموظف قبل الحفظ."),
  stampNote: b("ECM+ generates the code and stamps it on the physical (paper) document. The digital file only carries the code as metadata. The code shown is a sample pattern and carries the ECM+ logo.", "تولّد ‹ECM+› الرمز وتختمه على الوثيقة الورقية الفعلية، أما الملف الرقمي فيحمل الرمز كبيانات وصفية فقط. الرمز المعروض نمط توضيحي ويحمل شعار ‹ECM+›."),
  codeChoice: b("Code to stamp on the paper", "الرمز المراد ختمه على الورق"),
  codeBarcode: b("Barcode", "الباركود"), codeQr: b("QR code", "رمز QR"),
  codeType: b("Code type", "نوع الرمز"),
  paper: b("Original paper", "الأوراق الأصلية"),
  paperFiled: b("Stamped with the code and filed in the {c} category box. The digital file keeps the code as metadata only.", "تُختم بالرمز وتُحفظ في صندوق فئة {c}. ويحتفظ الملف الرقمي بالرمز كبيانات وصفية فقط."),
  stampPotential: b("Reading codes on incoming paper to route or split batches", "قراءة الرموز على الورق الوارد لتوجيه الدفعات أو تقسيمها"),
  docType: b("Document type", "نوع الوثيقة"), folder: b("Folder", "المجلد"), code: b("Code", "الرمز"),
  recognition: b("Text recognition", "التعرّف على النص"), done: b("Done, ", "تم، "),
  permissions: b("Permissions", "الصلاحيات"), folderRules: b("Folder rules apply", "تسري قواعد المجلد"),
  ready: b("Your document is now ready to become part of your enterprise knowledge repository.", "وثيقتكم الآن جاهزة للانضمام إلى أرشيف مؤسستكم."),
  recordNote: b("Folder permissions, versions and the audit trail apply once the record is saved.", "تسري صلاحيات المجلدات والإصدارات وسجل التدقيق عند حفظ السجل."),
  tagDemo: b("Demonstration", "عرض توضيحي"),
  tagPotential: b("Potential integration", "تكامل محتمل"),
  watermark: b("SAMPLE · NOT A VALID DOCUMENT", "نموذج · وثيقة غير صالحة"),
  none: "—",
};

// ---- Cards and lists of the other sections ----
export type IconSpec = { kind: "path"; name: "scan" | "upload" | "camera" | "image" | "barcode" } | { kind: "sprite"; id: string };
export interface CardDef { icon: IconSpec; title: Bi; text: Bi; side?: { kind: "demo" | "potential"; text: Bi } }

export const ICON_PATHS: Record<string, string> = {
  scan: '<path d="M5 3.5h9l5 5v12H5z"/><path d="M14 3.5v5h5M2.5 14h19"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4.5 16v3.5h15V16"/>',
  camera: '<path d="M3.5 8h3.5l1.5-2.5h7L17 8h3.5v11h-17z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 16l5-5 4 4 3-3 5 5M15.5 9h.01"/>',
  barcode: '<path d="M4 5v14M6.5 5v14M10 5v14M12.5 5v14M16 5v14M19 5v14"/>',
};
const path = (name: "scan" | "upload" | "camera" | "image" | "barcode"): IconSpec => ({ kind: "path", name });
const sprite = (id: string): IconSpec => ({ kind: "sprite", id });

export const HERO = {
  crumbDocs: b("Document Management", "إدارة الوثائق"),
  eyebrow: b("Document Capture", "التقاط الوثائق"),
  title: b("Capture Everything. Understand Every Document.", "التقاط كل شيء وفهم كل وثيقة."),
  lead: b("A paper document is prepared, sorted by category and scanned. Poor scans are rescanned, then ECM+ reads the text in Arabic and English and proposes the index fields for staff to confirm. The digital copy is archived with a barcode or QR code, and the paper original is stored under the same code.", "تُحضَّر الوثيقة الورقية وتُصنَّف حسب فئتها ثم تُمسح ضوئيًا، وتُعاد الصفحات الرديئة إلى المسح من جديد. بعد ذلك تقرأ منظومة ‹ECM+› النص بالعربية والإنجليزية وتقترح حقول الفهرسة ليراجعها الفريق، لتُحفظ النسخة الرقمية في الأرشيف مع باركود أو رمز QR، وتُحفظ الوثيقة الورقية الأصلية بالرمز نفسه."),
  explore: b("Explore Document Capture", "استكشف التقاط الوثائق"),
  archived: b("Archived", "مؤرشف"),
};

export const SECTION_COPY = {
  channels: { label: b("Capture channels", "طرق الالتقاط"), title: b("One Platform. Multiple Ways to Capture", "منصة واحدة. طرق متعددة للالتقاط") },
  intel: { label: b("Document intelligence", "ذكاء الوثائق"), title: b("Beyond Digitization. Into Document Intelligence.", "ما بعد الرقمنة: نحو ذكاء الوثائق.") },
  benefits: { label: b("Benefits", "الفوائد"), title: b("Turn Document Processing into Business Efficiency", "حوّلوا معالجة الوثائق إلى كفاءة في العمل") },
  adv: { label: b("Advanced capabilities", "قدرات متقدمة"), title: b("Built for high-volume, bilingual archives", "مصمّمة للأرشيفات ثنائية اللغة عالية الحجم") },
  dept: { label: b("By department", "حسب الإدارة"), title: b("The same capture, in every department", "الالتقاط نفسه في كل إدارة") },
};

export const CHANNELS: CardDef[] = [
  { icon: path("scan"), title: b("Scanning", "المسح الضوئي"), text: b("The local scanner service scans straight into the archive, page by page or through the auto-feeder.", "تمسح خدمة الماسح الضوئي المحلية الوثائق مباشرة إلى الأرشيف، صفحة صفحة أو عبر وحدة التغذية التلقائية.") },
  { icon: path("upload"), title: b("Digital upload", "الرفع الرقمي"), text: b("Upload from a device, start from a template or a blank document, or capture from Google Drive and OneDrive.", "رفع الملفات من الجهاز، أو البدء من قالب أو وثيقة فارغة، أو الالتقاط من ‹Google Drive› و‹OneDrive›.") },
  { icon: sprite("i-mail"), title: b("Email capture", "الالتقاط من البريد"), text: b("Gmail, Outlook or a business mailbox connects to the suite; emails are filed into a correspondence or the archive, and the Outlook add-in saves and routes them.", "يُربط ‹Gmail› أو ‹Outlook› أو البريد المؤسسي بالمنظومة، وتُحفظ الرسائل ضمن مراسلة أو في الأرشيف، وتحفظها إضافة ‹Outlook› وتحيلها.") },
  { icon: sprite("i-link"), title: b("External system integration", "التكامل مع الأنظمة الأخرى"), text: b("A REST API lets other systems file documents into the archive, and existing archives are migrated in.", "تتيح واجهة ‹REST› للأنظمة الأخرى حفظ الوثائق في الأرشيف، وتُنقل الأرشيفات القائمة إليه."), side: { kind: "potential", text: b("Possible through an integration: scheduled capture from shared folders", "ممكن عبر تكامل: الالتقاط المجدول من المجلدات المشتركة") } },
  { icon: path("camera"), title: b("Camera capture", "الالتقاط بالكاميرا"), text: b("Photographing a document from a phone or tablet and filing it like a scan.", "تصوير الوثيقة بهاتف أو جهاز لوحي وحفظها كما يُحفظ المسح الضوئي."), side: { kind: "potential", text: b("Not part of the product today", "ليس جزءًا من المنظومة اليوم") } },
];

const SHOWN = b("Shown in the demonstration", "يظهر في العرض التوضيحي");
export const INTEL: CardDef[] = [
  { icon: path("image"), title: b("Image processing", "معالجة الصور"), text: b("Straightening, cropping and cleaning scanned pages before recognition.", "تعديل ميل الصفحات الممسوحة ضوئيًا وقصّها وتنقيتها قبل التعرّف."), side: { kind: "demo", text: SHOWN } },
  { icon: sprite("i-ocr"), title: b("Text recognition, Arabic and English", "التعرّف على النصوص بالعربية والإنجليزية"), text: b("OCR reads scanned and image files, so their content is searchable and opens at the matching page.", "يقرأ التعرّف الضوئي (‹OCR›) الملفات الممسوحة ضوئيًا والصور، فيصبح محتواها قابلًا للبحث ويُفتح عند الصفحة المطابقة.") },
  { icon: sprite("i-tag"), title: b("Classification", "التصنيف"), text: b("Suggesting the document type from its content. In ECM+ today, staff choose the type, and its index fields follow.", "اقتراح نوع الوثيقة من محتواها. في ‹ECM+› اليوم يختار الموظف النوع، فتتبعه حقول الفهرسة."), side: { kind: "demo", text: SHOWN } },
  { icon: sprite("i-spark"), title: b("Metadata extraction", "استخراج البيانات"), text: b("Auto fill from file reads the document and proposes values for the type’s index fields: text, numbers and dates. Only empty fields are filled, and staff review before saving. An invoice yields its number, date and total; a contract its parties and expiry; an employee file its name, number and hire date.", "تقرأ «التعبئة التلقائية من الملف» الوثيقة وتقترح قيم حقول الفهرسة لنوعها: نصوصًا وأرقامًا وتواريخ. تُعبَّأ الحقول الفارغة فقط، ويراجعها الموظف قبل الحفظ. فتعطي الفاتورة رقمها وتاريخها وإجماليها، والعقد أطرافه وتاريخ انتهائه، وملف الموظف اسمه ورقمه وتاريخ تعيينه.") },
  { icon: path("barcode"), title: b("Barcode and QR codes", "الباركود ورموز QR"), text: b("ECM+ generates a code for each document and stamps it on the pages.", "تولّد ‹ECM+› رمزًا لكل وثيقة وتختمه على صفحاتها."), side: { kind: "potential", text: b("Possible through an integration: reading codes on incoming paper to route or split batches", "ممكن عبر تكامل: قراءة الرموز على الورق الوارد لتوجيه الدفعات أو تقسيمها") } },
  { icon: sprite("i-shield"), title: b("Validation", "التحقق"), text: b("Checking proposed values against rules, such as a due date after the invoice date.", "مطابقة القيم المقترحة مع قواعد محددة، كأن يلي تاريخُ الاستحقاق تاريخَ الفاتورة."), side: { kind: "demo", text: SHOWN } },
];

export const BENEFITS: CardDef[] = [
  { icon: sprite("i-spark"), title: b("Less manual entry", "إدخال يدوي أقل"), text: b("Index fields are proposed from the file, so staff confirm rather than type.", "تُقترح حقول الفهرسة من الملف، فيكتفي الموظف بالتأكيد بدل الإدخال.") },
  { icon: sprite("i-search"), title: b("Searchable", "قابلة للبحث"), text: b("Recognized text and index fields make every captured document findable by meaning and by field.", "يجعل النص المتعرَّف عليه وحقول الفهرسة كل وثيقة ملتقطة قابلة للبحث بالمعنى وبالحقل.") },
  { icon: sprite("i-archive"), title: b("One archive for every channel", "أرشيف واحد لكل القنوات"), text: b("Paper, files, cloud drives and email land in the same document types and folders.", "يصل الورق والملفات ومحركات التخزين السحابية والبريد إلى أنواع الوثائق والمجلدات نفسها.") },
  { icon: sprite("i-lock"), title: b("Governed from capture", "محكومة منذ الالتقاط"), text: b("Folder permissions, versions and the audit trail apply the moment a document is saved.", "تسري صلاحيات المجلدات والإصدارات وسجل التدقيق لحظة حفظ الوثيقة.") },
];

export const CAPS: { text: Bi; tag?: "demo" | "potential" }[] = [
  { text: b("Auto-feeder scanning", "المسح الضوئي عبر وحدة التغذية التلقائية") },
  { text: b("Audio and video files", "ملفات الصوت والفيديو") },
  { text: b("Archive migration from existing systems", "نقل الأرشيفات من الأنظمة القائمة") },
  { text: b("REST API for other systems", "واجهة ‹REST API› للأنظمة الأخرى") },
  { text: b("Google Drive and OneDrive capture", "الالتقاط من ‹Google Drive› و‹OneDrive›") },
  { text: b("Outlook, Word, Excel and PowerPoint add-ins that save and route emails and files", "‹Add-ins› لتطبيقات ‹Outlook› و‹Word› و‹Excel› و‹PowerPoint› لحفظ الرسائل والملفات وإحالتها") },
  { text: b("Generated barcode and QR stamps", "أختام باركود و‹QR› مولَّدة") },
  { text: b("Batch splitting by barcode", "تقسيم الدفعات بالباركود"), tag: "potential" },
];

export const DEPTS: CardDef[] = [
  { icon: sprite("i-building"), title: b("Finance", "المالية"), text: b("Supplier invoices scanned in batches; invoice number, date and total proposed for review.", "تُمسح فواتير الموردين دفعات؛ وتُقترح أرقامها وتواريخها وإجمالياتها للمراجعة.") },
  { icon: sprite("i-people"), title: b("Human Resources", "الموارد البشرية"), text: b("Employee files captured in Arabic, with name, number and hire date proposed, under HR-only folder permissions.", "تُلتقط ملفات الموظفين بالعربية، مع اقتراح الاسم والرقم وتاريخ التعيين، ضمن صلاحيات مجلدات مقصورة على الموارد البشرية.") },
  { icon: sprite("i-ticket"), title: b("Procurement", "المشتريات"), text: b("Quotations and purchase orders arriving by email are filed from the inbox or the Outlook add-in.", "تُحفظ عروض الأسعار وأوامر الشراء الواردة بالبريد من صندوق الوارد أو إضافة ‹Outlook›.") },
  { icon: sprite("i-sign"), title: b("Legal", "الشؤون القانونية"), text: b("Contracts uploaded with parties, reference and expiry date proposed; retention rules can send scheduled notifications.", "تُرفع العقود مع اقتراح الأطراف والمرجع وتاريخ الانتهاء؛ ويمكن لقواعد الاحتفاظ إرسال تنبيهات مجدولة.") },
  { icon: sprite("i-mail"), title: b("Administration", "الشؤون الإدارية"), text: b("Incoming letters scanned and filed into correspondence, with their serial number and due date.", "تُمسح الخطابات الواردة وتُحفظ ضمن المراسلات برقمها التسلسلي وتاريخ استحقاقها.") },
];

export const CTA = {
  title: b("Make Every Document Work for Your Business.", "حوّلوا وثائقكم إلى أصل رقمي يخدم أعمالكم."),
  text: b("See capture on your own document types, in Arabic or English.", "مشاهدة الالتقاط على أنواع الوثائق الخاصة بكم، بالعربية أو الإنجليزية."),
  request: b("Request a Demo", "اطلب عرضًا تجريبيًا"),
  contact: b("Contact Our Team", "تواصلوا مع فريقنا"),
  prefill: b("We would like to discuss document capture with your team.", "نرغب في مناقشة التقاط الوثائق مع فريقكم."),
};

// ---- Document factory (animated 3D overview above the category chips) ----
// Stages 2 and 4 (sorting belts, a separate rescan line) and the zone-locating part of stage 5 are
// illustrations of a possible workflow, so they carry the "Demonstration" tag.
const STAGES: { t: Bi; d: Bi; demo?: boolean }[] = [
  { t: b("Preparation", "التحضير"), d: b("Paper files are opened, staples removed and folded sheets flattened before they go to the scanner.", "تُفتح الملفات الورقية وتُزال الدبابيس وتُفرد الأوراق المطوية قبل وصولها إلى الماسح.") },
  { t: b("Classification", "التصنيف"), d: b("Documents are sorted into five categories. In ECM+ today, staff choose the document type.", "تُفرز الوثائق في خمس فئات. في ‹ECM+› اليوم يختار الموظف نوع الوثيقة."), demo: true },
  { t: b("Scanning", "المسح الضوئي"), d: b("Pages are scanned in batches and uploaded to ECM+. A poor scan is flagged instead of passing through.", "تُمسح الصفحات على دفعات وتُرفع إلى ‹ECM+›. ويُعلَّم المسح الضوئي الرديء بدل تمريره.") },
  { t: b("Rescan and quality control", "إعادة المسح الضوئي ومراقبة الجودة"), d: b("A flagged page goes to a separate line, is scanned again and rejoins the flow.", "تنتقل الصفحة المعلَّمة إلى مسار منفصل وتُمسح من جديد ثم تعود إلى التدفق."), demo: true },
  { t: b("Extraction", "الاستخراج"), d: b("Text is recognized and values are read from the header, title, references, dates, body, table and footer.", "يُتعرَّف على النص وتُقرأ القيم من الرؤوس والعنوان والمراجع والتواريخ والمحتوى والجدول ونهاية الصفحة."), demo: true },
  { t: b("Metadata", "البيانات الوصفية"), d: b("AI proposes the index fields and staff review them. Only empty fields are filled.", "يقترح الذكاء الاصطناعي حقول الفهرسة ويراجعها الموظف، وتُعبَّأ الحقول الفارغة فقط.") },
  { t: b("Barcode and archive", "الباركود والأرشفة"), d: b("The digital documents move from the scanning screen to the ECM+ archive, and the record keeps its code as metadata. The barcode or QR code is printed and stamped only on the original paper, which is stored by category in the paper archive.", "تنتقل الوثائق الرقمية من شاشة المسح الضوئي إلى أرشيف ‹ECM+› ويحتفظ السجل برمزه كبيانات وصفية. أما الباركود أو رمز ‹QR› فيُطبع ويُختم على الأوراق الأصلية فقط، وتُخزَّن حسب الفئة في الأرشيف الورقي.") },
];
const CAT_NAMES: Bi[] = [
  b("Invoices", "الفواتير"), b("Contracts", "العقود"), b("Applications", "الطلبات"),
  b("Identification Documents", "وثائق الهوية"), b("Official Correspondence", "المراسلات الرسمية"),
];
export const FACTORY = {
  label: b("Animated overview of the document capture workflow, sample documents only", "عرض متحرك لمسار التقاط الوثائق بوثائق نموذجية فقط"),
  loading: b("Loading the animation…", "جارٍ تحميل العرض المتحرك…"),
  play: b("Play", "تشغيل"), pause: b("Pause", "إيقاف مؤقت"), restart: b("Restart", "إعادة من البداية"),
  overview: b("Overview", "نظرة عامة"),
  fullscreen: b("Full screen", "ملء الشاشة"), exitFullscreen: b("Exit full screen", "إنهاء ملء الشاشة"),
  navLabel: b("Workflow stages", "مراحل المسار"),
  collapse: b("Collapse details", "طيّ التفاصيل"), expand: b("Expand details", "عرض التفاصيل"),
  stageOf: b("Stage {n} of {N}: {t}", "المرحلة {n} من {N}: {t}"),
  archived: b("Digital archive {n} of {total}", "الأرشيف الرقمي {n} من {total}"),
  paperArchived: b("Paper archive {n} of {total}", "الأرشيف الورقي {n} من {total}"),
  codeLabel: b("Code stamp", "رمز الختم"),
  codeBarcode: b("Barcode", "الباركود"), codeQr: b("QR code", "رمز QR"),
  flagged: b("Poor scan flagged", "مسح رديء معلَّم"),
  opened: b("Opened {c}", "تم فتح {c}"),
  back: b("Back at the workflow", "العودة إلى المسار"),
  binHint: b("Select a category bin to open it", "اختاروا حاوية فئة لفتحها"),
  hints: [
    b("Select a sheet to see its condition and what the worker does", "اختاروا ورقة لتروا حالتها وما سيفعله الموظف بها"),
    b("Select a category bin to open its workflow", "اختاروا حاوية فئة لفتح مسارها"),
    b("Select the scanning screen to review the scanned documents", "اختاروا شاشة المسح الضوئي لمراجعة الوثائق الممسوحة ضوئيًا"),
    b("Select the flagged sheet or the screen to follow the rescan", "اختاروا الورقة المعلَّمة أو الشاشة لمتابعة إعادة المسح الضوئي"),
    b("Select the document to see the extracted fields", "اختاروا الوثيقة لرؤية الحقول المستخرجة"),
    b("Select the form to see how fields are filled from the document", "اختاروا النموذج لرؤية تعبئة الحقول من الوثيقة"),
    b("Select the archive screen or a box to open the archived document", "اختاروا شاشة الأرشيف أو صندوقًا لفتح الوثيقة المؤرشفة"),
  ] as Bi[],
  labels: {
    header: b("Header", "الرؤوس"), title: b("Title", "العنوان"), refs: b("References", "المراجع"), dates: b("Dates", "التواريخ"),
    body: b("Body", "المحتوى"), table: b("Table", "الجدول"), footer: b("Footer", "نهاية الصفحة"),
    manual: b("Manual preparation", "التحضير اليدوي"), rescan: b("Rescan line", "مسار إعادة المسح الضوئي"), digital: b("Scanning screen: digital documents", "شاشة المسح: الوثائق الرقمية"),
    originals: b("Original paper", "الأوراق الأصلية"), archive: b("ECM+ Documents archive", "أرشيف وثائق ECM+‎"),
    paperArchive: b("Original paper: code stamped, archived by category", "الأوراق الأصلية: مختومة بالرمز ومؤرشفة حسب الفئة"),
  } as Record<string, Bi>,
  stages: STAGES,
  cats: CAT_NAMES,
};

export interface FactoryCopy {
  label: string; loading: string; play: string; pause: string; restart: string; overview: string; fullscreen: string; exitFullscreen: string; navLabel: string; collapse: string; expand: string;
  stageOf: string; archived: string; paperArchived: string; codeLabel: string; codeBarcode: string; codeQr: string; flagged: string; opened: string; back: string; binHint: string; hints: string[]; tagDemo: string;
  labels: Record<string, string>;
  stages: { t: string; d: string; tag: string }[];
  cats: string[];
}
/** Resolve the factory strings for one language (plain text, safe to pass to a client component). */
export const factoryCopy = (lang: Lang): FactoryCopy => {
  const p = (s: Bi) => plain(s, lang);
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries(FACTORY.labels)) labels[k] = p(v);
  FACTORY.cats.forEach((c, i) => { labels[`cat${i}`] = p(c); });
  labels.flagged = p(FACTORY.flagged);
  return {
    label: p(FACTORY.label), loading: p(FACTORY.loading), play: p(FACTORY.play), pause: p(FACTORY.pause), restart: p(FACTORY.restart),
    overview: p(FACTORY.overview), fullscreen: p(FACTORY.fullscreen), exitFullscreen: p(FACTORY.exitFullscreen), navLabel: p(FACTORY.navLabel), collapse: p(FACTORY.collapse), expand: p(FACTORY.expand), stageOf: p(FACTORY.stageOf), archived: p(FACTORY.archived),
    paperArchived: p(FACTORY.paperArchived), codeLabel: p(FACTORY.codeLabel), codeBarcode: p(FACTORY.codeBarcode), codeQr: p(FACTORY.codeQr),
    flagged: p(FACTORY.flagged), opened: p(FACTORY.opened), back: p(FACTORY.back), binHint: p(FACTORY.binHint), hints: FACTORY.hints.map(p), tagDemo: p(DEMO.tagDemo),
    labels,
    stages: FACTORY.stages.map((s) => ({ t: p(s.t), d: p(s.d), tag: s.demo ? p(DEMO.tagDemo) : "" })),
    cats: FACTORY.cats.map(p),
  };
};

/** Plain names of the five factory categories (bins, boxes, archive folders). */
export const factoryNames = (lang: Lang): string[] => FACTORY.cats.map((c) => plain(c, lang));
