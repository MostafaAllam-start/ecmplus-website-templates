// Copy for the "AI Knowledge Universe" scene on the Chat with Your Documents page.
// Strings are { en, ar } pairs; Latin names inside Arabic strings are wrapped in ‹…› and turned
// into <bdi> at render time (see `fmt` in data/capture.ts). Everything here is fictional sample
// data: no real company, contract or statistic.
import { fmt, type Bi } from "@/data/capture";
import type { Lang } from "@/lib/site";

const b = (en: string, ar: string): Bi => ({ en, ar });

export interface StageCopy { t: string; biz: string; tech: string; hint: string }
export interface SourceCopy { file: string; page: number; ref: string; kind: string; passage: string; before: string; after: string }
export interface GroupCopy { name: string; facts: string[] }

export interface SceneCopy {
  /** Accessible name of the whole figure. */
  label: string;
  kbLabel: string;
  stages: StageCopy[];
  /** Short pills projected over the canvas, by anchor id. */
  labels: Record<string, string>;
  question: string;
  answer: string;
  answerRefsTitle: string;
  sourcesTitle: string;
  sources: SourceCopy[];
  /** Hover text for the six document kinds. */
  docKinds: string[];
  /** Knowledge-node groups: what a click on a node reveals. */
  groups: GroupCopy[];
  extractedTitle: string;
  nodeHint: string;
  underHood: string;
  stageOf: string;
  pageWord: string;
  ui: {
    play: string; pause: string; replay: string; prev: string; next: string;
    navLabel: string; loading: string; fallback: string; close: string; open: string;
    searching: string; sourceDialog: string; fromDocument: string;
  };
}

const STAGES: Bi[][] = [];
const stage = (t: Bi, biz: Bi, tech: Bi, hint: Bi) => STAGES.push([t, biz, tech, hint]);

stage(
  b("Document collection", "جمع الوثائق"),
  b("Contracts, invoices, reports, applications, correspondence and employee records from across the organization are brought together as one body of content.", "تُجمع العقود والفواتير والتقارير والطلبات والمراسلات وسجلات الموظفين من مختلف الإدارات في مستودع واحد من المحتوى."),
  b("The ECM+ repository is the source. Scanned pages and digital files are both queued for processing; nothing is retyped by hand.", "مستودع ‹ECM+› هو المصدر. تُدرج الصفحات الممسوحة والملفات الرقمية في قائمة المعالجة دون أي إعادة إدخال يدوي."),
  b("Hover over a document to see its type", "مرّروا المؤشر فوق أي وثيقة لمعرفة نوعها"),
);
stage(
  b("OCR and information extraction", "التعرّف على النص واستخراج المعلومات"),
  b("Each document is read. Text, names, numbers and dates are found, and the document is split into the sections that matter.", "تُقرأ كل وثيقة، فيُستخرج النص والأسماء والأرقام والتواريخ، وتُقسَّم إلى الأقسام ذات الأهمية."),
  b("OCR converts scanned page images into machine-readable text. Document processing then identifies the relevant parts and chunking breaks long documents into smaller, meaningful sections.", "يحوّل التعرّف الضوئي على النص (‹OCR›) صور الصفحات الممسوحة إلى نص مقروء آليًا، ثم تُحدَّد الأجزاء المهمة، ويقسّم التجزيء الوثائق الطويلة إلى مقاطع أصغر ذات معنى."),
  b("Each sheet is scanned and its text becomes small blocks of information", "تُمسح كل ورقة ضوئيًا ويتحول نصها إلى كتل صغيرة من المعلومات"),
);
stage(
  b("Knowledge processing and indexing", "معالجة المعرفة وفهرستها"),
  b("The extracted information becomes a connected knowledge base. A company links to its contracts and invoices, a contract number to related agreements, a supplier to its transactions.", "تتحول المعلومات المستخرجة إلى قاعدة معرفة مترابطة: تُربط الشركة بعقودها وفواتيرها، ورقم العقد بالاتفاقيات المتصلة به، والمورّد بمعاملاته."),
  b("Embeddings represent the meaning of each chunk as numbers, so similar content can be found by meaning rather than by exact words. Vector indexing organizes those representations for fast retrieval. New or updated documents are indexed as they arrive; the AI model is not retrained.", "تمثّل التضمينات (‹Embeddings›) معنى كل مقطع بأرقام، فيمكن العثور على المحتوى المتشابه بالمعنى لا بالألفاظ الحرفية، وينظّم الفهرس المتجهي (‹Vector Index›) هذه التمثيلات لاسترجاعها بسرعة. تُفهرس الوثائق الجديدة أو المحدَّثة فور وصولها دون إعادة تدريب النموذج."),
  b("Select a node to see the information behind it", "اختاروا أي عقدة لمعرفة المعلومات التي تمثلها"),
);
stage(
  b("Question understanding", "فهم السؤال"),
  b("A person asks in natural language, with no filenames and no exact keywords. The assistant works out what is being asked.", "يطرح المستخدم سؤاله بلغته الطبيعية دون أسماء ملفات أو كلمات مفتاحية دقيقة، ويحدّد المساعد المقصود منه."),
  b("The question is converted into the same kind of numeric representation as the document chunks, so it can be compared with them by meaning.", "يُحوَّل السؤال إلى التمثيل الرقمي نفسه الذي تُمثَّل به مقاطع الوثائق، لتتم مقارنته بها من حيث المعنى."),
  b("The question travels into the knowledge base as a search signal", "يتحرك السؤال داخل قاعدة المعرفة بوصفه إشارة بحث"),
);
stage(
  b("Semantic retrieval", "الاسترجاع الدلالي"),
  b("Only the relevant knowledge lights up. The most useful passages and the documents they come from are pulled forward; unrelated content stays in the background.", "تُضاء المعارف ذات الصلة وحدها، فتُستدعى المقاطع الأنفع والوثائق التي أتت منها، وتبقى المحتويات غير المرتبطة في الخلفية."),
  b("Semantic search finds the chunks closest in meaning to the question. Permission-aware retrieval only considers documents the asking user is authorized to see.", "يجد البحث الدلالي المقاطع الأقرب إلى السؤال في المعنى، ولا يأخذ الاسترجاع المراعي للصلاحيات في الحسبان سوى الوثائق المسموح للسائل بالاطلاع عليها."),
  b("Select a source card to preview the document", "اختاروا بطاقة مصدر لمعاينة الوثيقة"),
);
stage(
  b("AI-powered answer generation", "توليد الإجابة بالذكاء الاصطناعي"),
  b("The assistant replies in plain language and lists the documents and pages it relied on, so every answer can be checked against the original.", "يجيب المساعد بلغة واضحة ويعرض الوثائق والصفحات التي اعتمد عليها، فيمكن التحقق من كل إجابة بالرجوع إلى الأصل."),
  b("RAG (retrieval-augmented generation) gives the retrieved passages to a language model (LLM) as context before it writes the answer. The answer is grounded in your documents and carries citations.", "في أسلوب ‹RAG› (التوليد المعزَّز بالاسترجاع) تُمرَّر المقاطع المسترجعة إلى نموذج لغوي (‹LLM›) بوصفها سياقًا قبل أن يكتب الإجابة، فتستند إلى وثائقكم وتحمل إحالات إلى مصادرها."),
  b("Select a source to open the page the answer came from", "اختاروا مصدرًا لفتح الصفحة التي استُمدت منها الإجابة"),
);

const LABELS: Record<string, Bi> = {
  docs: b("Organizational documents", "وثائق المؤسسة"),
  gate: b("OCR and extraction", "التعرّف واستخراج المعلومات"),
  kb: b("Your Organizational Knowledge Base", "قاعدة المعرفة في مؤسستكم"),
  engine: b("AI engine", "محرّك الذكاء الاصطناعي"),
  abc: b("ABC Company", "شركة ‹ABC›"),
  contract: b("Contract CT-2026-031", "العقد ‹CT-2026-031›"),
  pay: b("Payment terms", "شروط الدفع"),
  supplier: b("Meridian Supplies", "‹Meridian Supplies›"),
  sources: b("Source documents", "الوثائق المصدر"),
  signal: b("Question signal", "إشارة السؤال"),
};

const GROUPS: [Bi, Bi[]][] = [
  [b("ABC Company", "شركة ‹ABC›"), [
    b("Client: ABC Company", "العميل: شركة ‹ABC›"), b("Linked to 2 contracts and 3 invoices", "مرتبطة بعقدين وثلاث فواتير"), b("Account owner: Procurement", "مسؤول الحساب: المشتريات"),
  ]],
  [b("Contract CT-2026-031", "العقد ‹CT-2026-031›"), [
    b("Effective 1 Feb 2026, expires 31 Jan 2028", "ساري من 1 فبراير 2026 حتى 31 يناير 2028"), b("Type: service agreement", "النوع: اتفاقية خدمات"), b("Related: Payment Terms Appendix", "ذو صلة: ملحق شروط الدفع"),
  ]],
  [b("Payment terms", "شروط الدفع"), [
    b("Net 30 days from invoice receipt", "الدفع خلال 30 يومًا من استلام الفاتورة"), b("Clause 8.2, page 8", "البند 8.2، الصفحة 8"), b("Appendix page 2: late-payment handling", "الصفحة 2 من الملحق: معالجة التأخر في السداد"),
  ]],
  [b("Meridian Supplies", "‹Meridian Supplies›"), [
    b("Supplier since 2024", "مورّد منذ 2024"), b("Supplier agreement SA-2025-114", "اتفاقية التوريد ‹SA-2025-114›"), b("Quarterly invoicing", "فوترة ربع سنوية"),
  ]],
  [b("Invoices", "الفواتير"), [
    b("Invoice INV-2026-0147", "الفاتورة ‹INV-2026-0147›"), b("Issued 12 Mar 2026", "صادرة بتاريخ 12 مارس 2026"), b("Status: awaiting payment", "الحالة: بانتظار السداد"),
  ]],
  [b("Project Alpha", "مشروع ألفا"), [
    b("Project Alpha: phase 2 deliverables", "مشروع ألفا: مخرجات المرحلة الثانية"), b("Linked invoices and purchase orders", "فواتير وأوامر شراء مرتبطة"), b("Owner: Operations", "المسؤول: العمليات"),
  ]],
  [b("Key dates", "التواريخ الرئيسية"), [
    b("Renewal notice: 31 Oct 2027", "إشعار التجديد: 31 أكتوبر 2027"), b("Expiry: 31 Jan 2028", "الانتهاء: 31 يناير 2028"), b("Review date: 1 Aug 2026", "موعد المراجعة: 1 أغسطس 2026"),
  ]],
  [b("Employee records", "سجلات الموظفين"), [
    b("Policy: annual leave", "السياسة: الإجازة السنوية"), b("Access: Human Resources only", "الصلاحية: الموارد البشرية فقط"), b("Record type: employment file", "نوع السجل: ملف توظيف"),
  ]],
];

const SOURCES: { file: string; page: number; ref: Bi; kind: Bi; before: Bi; passage: Bi; after: Bi }[] = [
  {
    file: "ABC_Contract_2026.pdf", page: 8,
    ref: b("ABC_Contract_2026.pdf — Page 8", "‹ABC_Contract_2026.pdf› — الصفحة 8"),
    kind: b("Service agreement", "اتفاقية خدمات"),
    before: b("8.1 Fees. The Client shall pay the Provider the fees set out in Schedule A.", "8.1 الأتعاب. يدفع العميل لمزوّد الخدمة الأتعاب الواردة في الجدول (أ)."),
    passage: b("8.2 Payment. The Client shall pay each invoice within thirty (30) days of receipt.", "8.2 الدفع. يسدّد العميل كل فاتورة خلال ثلاثين (30) يومًا من تاريخ استلامها."),
    after: b("8.3 Disputed amounts. Undisputed amounts remain payable on the due date.", "8.3 المبالغ المتنازع عليها. تبقى المبالغ غير المتنازع عليها مستحقة في موعدها."),
  },
  {
    file: "Supplier_Agreement.pdf", page: 3,
    ref: b("Supplier_Agreement.pdf — Page 3", "‹Supplier_Agreement.pdf› — الصفحة 3"),
    kind: b("Supplier agreement", "اتفاقية توريد"),
    before: b("3.1 Orders. Purchase orders are confirmed by the Supplier within two business days.", "3.1 الطلبات. يؤكد المورّد أوامر الشراء خلال يومي عمل."),
    passage: b("3.2 Invoicing. The Supplier invoices quarterly in arrears; payment follows the agreed terms.", "3.2 الفوترة. يصدر المورّد فواتيره كل ربع سنة بأثر رجعي، ويتم السداد وفق الشروط المتفق عليها."),
    after: b("3.3 Records. Both parties keep copies of all invoices and delivery notes.", "3.3 السجلات. يحتفظ الطرفان بنسخ من جميع الفواتير ومحاضر التسليم."),
  },
  {
    file: "Payment_Terms_Appendix.pdf", page: 2,
    ref: b("Payment_Terms_Appendix.pdf — Page 2", "‹Payment_Terms_Appendix.pdf› — الصفحة 2"),
    kind: b("Appendix", "ملحق"),
    before: b("2.1 Scope. This appendix applies to all invoices issued under the Agreement.", "2.1 النطاق. يسري هذا الملحق على جميع الفواتير الصادرة بموجب الاتفاقية."),
    passage: b("2.2 Payment term. Net 30 days from the date the invoice is received by the Client.", "2.2 مدة الدفع. 30 يومًا صافية من تاريخ استلام العميل للفاتورة."),
    after: b("2.3 Late payment is handled under clause 8.2 of the Agreement.", "2.3 يُعالَج التأخر في السداد وفق البند 8.2 من الاتفاقية."),
  },
];

const DOC_KINDS: Bi[] = [
  b("Contract", "عقد"), b("Invoice", "فاتورة"), b("Report", "تقرير"),
  b("Application", "طلب"), b("Correspondence", "مراسلة"), b("Employee record", "سجل موظف"),
];

/** Plain strings for one language, with ‹Latin› markers already turned into <bdi> (render with rich()). */
export function sceneCopy(lang: Lang): SceneCopy {
  const f = (s: Bi) => fmt(s, lang);
  const ui = (en: string, ar: string) => f(b(en, ar));
  return {
    label: ui("Interactive 3D animation: how documents become a knowledge base that answers questions", "رسم ثلاثي الأبعاد تفاعلي: كيف تتحول الوثائق إلى قاعدة معرفة تجيب عن الأسئلة"),
    kbLabel: f(LABELS.kb),
    stages: STAGES.map(([t, biz, tech, hint]) => ({ t: f(t), biz: f(biz), tech: f(tech), hint: f(hint) })),
    labels: Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [k, f(v)])),
    question: ui("What are the payment terms in our latest agreement with ABC Company?","ما شروط الدفع في أحدث اتفاقية مع شركة ‹ABC›؟"),
    answer: ui("According to the latest agreement with ABC Company, payment is due within 30 days of receiving the invoice.", "وفق أحدث اتفاقية مع شركة ‹ABC›، يُستحق الدفع خلال 30 يومًا من استلام الفاتورة."),
    answerRefsTitle: ui("References", "المراجع"),
    sourcesTitle: ui("Sources used", "المصادر المستخدمة"),
    sources: SOURCES.map((s) => ({ file: s.file, page: s.page, ref: f(s.ref), kind: f(s.kind), passage: f(s.passage), before: f(s.before), after: f(s.after) })),
    docKinds: DOC_KINDS.map(f),
    groups: GROUPS.map(([n, facts]) => ({ name: f(n), facts: facts.map(f) })),
    extractedTitle: ui("Extracted information", "المعلومات المستخرجة"),
    nodeHint: ui("Select a node to see the information behind it", "اختاروا عقدة لمعرفة المعلومات التي تمثلها"),
    underHood: ui("Under the hood", "خلف الكواليس"),
    stageOf: ui("Stage {n} of {N}: {t}", "المرحلة {n} من {N}: {t}"),
    pageWord: ui("Page", "الصفحة"),
    ui: {
      play: ui("Play", "تشغيل"), pause: ui("Pause", "إيقاف مؤقت"), replay: ui("Replay from the start", "إعادة العرض من البداية"),
      prev: ui("Previous stage", "المرحلة السابقة"), next: ui("Next stage", "المرحلة التالية"),
      navLabel: ui("Processing stages", "مراحل المعالجة"),
      loading: ui("Loading the animation…", "جارٍ تحميل الرسم المتحرك…"),
      fallback: ui("The animation is shown as a still image on this device. The stages below describe the same process.", "يظهر الرسم المتحرك صورةً ثابتة على هذا الجهاز، وتصف المراحل أدناه العملية نفسها."),
      close: ui("Close", "إغلاق"), open: ui("Open source", "فتح المصدر"),
      searching: ui("Searching the knowledge base…", "جارٍ البحث في قاعدة المعرفة…"),
      sourceDialog: ui("Source document preview (sample)", "معاينة الوثيقة المصدر (نموذج)"),
      fromDocument: ui("Passage used for the answer", "المقطع المستخدم في الإجابة"),
    },
  };
}
