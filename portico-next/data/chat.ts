// Chat with Your Documents — page copy and the fictional sample knowledge base (EN + AR).
// Strings are { en, ar } pairs; Latin names inside Arabic strings are wrapped in ‹…› (turned into <bdi> by `fmt`).
// Honesty rule: the sample collection, answers and page numbers are invented for demonstration, and no
// performance figures are claimed.
import type { Lang } from "@/lib/site";
import type { Bi } from "@/data/capture";

export type { Bi };
export { fmt, plain } from "@/data/capture";
const b = (en: string, ar: string): Bi => ({ en, ar });

export const META = {
  en: {
    name: "Chat with Your Documents",
    metaTitle: "Chat with Your Documents — AI Document Intelligence — ECM Plus",
    description: "Ask questions in natural language across your organization's documents and get answers with references to the original sources. OCR, semantic indexing and retrieval-augmented generation, with an interactive 3D explanation.",
  },
  ar: {
    name: "الدردشة مع وثائقكم",
    metaTitle: "الدردشة مع وثائقكم — ذكاء الوثائق بالذكاء الاصطناعي — ECM Plus",
    description: "اطرحوا أسئلتكم بلغتكم الطبيعية على وثائق مؤسستكم، واحصلوا على إجابات تشير إلى المصادر الأصلية. تعرّف ضوئي على النصوص وفهرسة دلالية وتوليد معزّز بالاسترجاع، مع شرح ثلاثي الأبعاد تفاعلي.",
  },
};

/* ---------- 1. Hero ---------- */
export const HERO = {
  crumbDocs: b("Document Management", "إدارة الوثائق"),
  eyebrow: b("Chat with Your Documents", "الدردشة مع وثائقكم"),
  kicker: b("AI-powered document intelligence", "ذكاء الوثائق بالذكاء الاصطناعي"),
  title: b("Stop Searching. Start Asking.", "توقفوا عن البحث. ابدؤوا بالسؤال."),
  lead: b(
    "Transform your organization's documents into an intelligent knowledge source. Ask questions in natural language, discover critical information, and receive contextual answers backed by your actual business documents — in seconds.",
    "حوّلوا وثائق مؤسستكم إلى مصدر معرفة ذكي. اطرحوا أسئلتكم بلغتكم الطبيعية، واكتشفوا المعلومات المهمة، واحصلوا على إجابات مبنية على وثائق أعمالكم الفعلية، خلال ثوانٍ.",
  ),
  request: b("Request a Demo", "اطلب عرضًا تجريبيًا"),
  explore: b("Explore How It Works", "استكشف آلية العمل"),
  mockQ: b("What are the payment terms in our latest agreement with ABC Company?", "ما شروط الدفع في أحدث اتفاقية مع شركة ‹ABC›؟"),
  mockA: b("Payment is due within 30 days of receiving the invoice.", "يُستحق الدفع خلال 30 يومًا من استلام الفاتورة."),
  mockSrc: b("ABC_Contract_2026.pdf · Page 8", "‹ABC_Contract_2026.pdf› · الصفحة 8"),
  imgAlt: b("Documents dissolving into a connected network of knowledge nodes", "وثيقة تتحول إلى شبكة مترابطة من عُقد المعرفة"),
  sampleNote: b("Sample documents and answers shown for demonstration.", "الوثائق والإجابات المعروضة نماذج للتوضيح."),
};

/* ---------- 2. The problem ---------- */
export const PROBLEM = {
  label: b("The challenge", "التحدي"),
  title: b("Knowledge Is Trapped in Documents", "المعرفة محبوسة داخل الوثائق"),
  lead: b(
    "Organizations accumulate thousands of documents that hold important information, yet most of it can only be reached by opening files one at a time.",
    "تتراكم لدى المؤسسات آلاف الوثائق التي تحمل معلومات مهمة، لكن الوصول إليها لا يتم في الغالب إلا بفتح الملفات واحدًا تلو الآخر.",
  ),
  pains: [
    { icon: "i-search", t: b("Finding information means opening documents", "الوصول إلى المعلومة يعني فتح الوثائق"), d: b("Employees search by file name, then read through lengthy files by hand.", "يبحث الموظف بحسب اسم الملف ثم يقرأ ملفات طويلة يدويًا.") },
    { icon: "i-track", t: b("Time goes into searching", "الوقت يضيع في البحث"), d: b("Valuable working hours are spent looking for answers instead of using them.", "تُصرف ساعات عمل ثمينة في البحث عن الإجابات بدل الاستفادة منها.") },
    { icon: "i-archive", t: b("Information is spread out", "المعلومات موزعة"), d: b("Documents sit across departments and repositories, with no single view.", "تتوزع الوثائق بين الإدارات والمستودعات دون رؤية موحدة.") },
    { icon: "i-link", t: b("Relationships stay hidden", "العلاقات خفية"), d: b("It is hard to see how a contract, its invoices and its appendices connect.", "يصعب إدراك الصلة بين العقد وفواتيره وملاحقه.") },
  ],
  before: { title: b("Before ECM+", "قبل ECM+"), items: [b("Manual searching", "بحث يدوي"), b("Opening multiple documents", "فتح وثائق متعددة"), b("Reading lengthy files", "قراءة ملفات طويلة"), b("Comparing information by hand", "مقارنة المعلومات يدويًا")] },
  after: { title: b("With ECM+", "مع ECM+"), items: [b("Ask a question", "اطرحوا سؤالًا"), b("Relevant information is retrieved", "تُسترجع المعلومات ذات الصلة"), b("Receive an intelligent answer", "احصلوا على إجابة ذكية"), b("Open the original sources", "افتحوا المصادر الأصلية")] },
};

/* ---------- 3. How it works (the 3D scene owns its own copy: data/chat-scene.ts) ---------- */
export const HOW = {
  label: b("How it works", "آلية العمل"),
  title: b("From Documents to Answers, Step by Step", "من الوثائق إلى الإجابات، خطوة بخطوة"),
};

/* ---------- 4. Interactive assistant ---------- */
export type SourceRef = { doc: string; page: number; passage: Bi };
export type AnswerRow = { cells: Bi[] };
export interface QA {
  id: string;
  q: Bi;
  intro: Bi;
  table?: { head: Bi[]; rows: Bi[][] };
  bullets?: Bi[];
  sources: SourceRef[];
}

export const ASSISTANT = {
  label: b("Try the assistant", "جرّبوا المساعد"),
  title: b("Ask a Question. See the Answer and Its Sources.", "اطرحوا سؤالًا، وشاهدوا الإجابة ومصادرها"),
  lead: b("Choose a sample question. The assistant searches a fictional collection of contracts, invoices and agreements, and answers with references you can open.", "اختاروا سؤالًا نموذجيًا. يبحث المساعد في مجموعة وهمية من العقود والفواتير والاتفاقيات، ويجيب بمراجع يمكنكم فتحها."),
  note: b("Sample collection of fictional documents. No sign-in and no real knowledge base.", "مجموعة نموذجية من وثائق وهمية. دون تسجيل دخول ودون قاعدة معرفة حقيقية."),
  suggested: b("Sample questions", "أسئلة نموذجية"),
  name: b("ECM+ Assistant", "مساعد ‹ECM+›"),
  placeholder: b("Pick a sample question…", "اختاروا سؤالًا نموذجيًا…"),
  searching: [b("Searching 1,240 documents", "البحث في 1,240 وثيقة"), b("Retrieving relevant passages", "استرجاع المقاطع ذات الصلة"), b("Preparing the answer", "إعداد الإجابة")],
  sources: b("Sources", "المصادر"),
  page: b("Page", "الصفحة"),
  open: b("Open source", "فتح المصدر"),
  reset: b("Start over", "البدء من جديد"),
  you: b("You", "أنتم"),
  empty: b("Select a question to see the assistant at work.", "اختاروا سؤالًا لمشاهدة المساعد أثناء العمل."),
};

export const QAS: QA[] = [
  {
    id: "payment",
    q: b("What are the payment terms in our latest contract with ABC Company?", "ما شروط الدفع في أحدث عقد مع شركة ‹ABC›؟"),
    intro: b(
      "According to the latest agreement with ABC Company, payment is due within 30 days of receiving the invoice. Late payments carry a 1.5% monthly charge, and the payment terms appendix keeps the same period for change orders.",
      "وفق أحدث اتفاقية مع شركة ‹ABC›، يُستحق الدفع خلال 30 يومًا من استلام الفاتورة. وتترتب على التأخر رسوم شهرية بنسبة 1.5%، ويُبقي ملحق شروط الدفع المدة نفسها لأوامر التغيير.",
    ),
    sources: [
      { doc: "abc", page: 8, passage: b("Payment: the Buyer shall pay each undisputed invoice within thirty (30) days of receipt.", "الدفع: يسدد المشتري كل فاتورة غير متنازع عليها خلال ثلاثين (30) يومًا من استلامها.") },
      { doc: "terms", page: 2, passage: b("Change orders follow the same thirty (30) day period from receipt of the invoice.", "تخضع أوامر التغيير للمدة نفسها، ثلاثين (30) يومًا من استلام الفاتورة.") },
    ],
  },
  {
    id: "expiry",
    q: b("Which contracts will expire in the next three months?", "ما العقود التي ستنتهي خلال الأشهر الثلاثة القادمة؟"),
    intro: b(
      "Three agreements reach their end date between now and the end of January 2027. Two of them include automatic renewal unless notice is given.",
      "تنتهي ثلاث اتفاقيات بين اليوم ونهاية يناير 2027، ومنها اتفاقيتان تتجددان تلقائيًا ما لم يُرسَل إشعار.",
    ),
    table: {
      head: [b("Contract", "العقد"), b("Counterparty", "الطرف الآخر"), b("Ends", "تاريخ الانتهاء"), b("Renewal", "التجديد")],
      rows: [
        [b("Facilities Services", "خدمات المرافق"), b("Delta Facilities", "‹Delta Facilities›"), b("30 Nov 2026", "30 نوفمبر 2026"), b("Notice required", "يتطلب إشعارًا")],
        [b("IT Support", "الدعم التقني"), b("Nova IT", "‹Nova IT›"), b("15 Dec 2026", "15 ديسمبر 2026"), b("Automatic", "تلقائي")],
        [b("Logistics Delta", "الخدمات اللوجستية"), b("Delta Logistics", "‹Delta Logistics›"), b("25 Jan 2027", "25 يناير 2027"), b("Automatic", "تلقائي")],
      ],
    },
    sources: [
      { doc: "facilities", page: 1, passage: b("Term: from 1 December 2024 to 30 November 2026.", "المدة: من 1 ديسمبر 2024 إلى 30 نوفمبر 2026.") },
      { doc: "itsupport", page: 12, passage: b("This agreement renews automatically for twelve months unless either party gives ninety days' notice.", "تتجدد هذه الاتفاقية تلقائيًا لمدة اثني عشر شهرًا ما لم يُرسل أحد الطرفين إشعارًا قبل تسعين يومًا.") },
    ],
  },
  {
    id: "alpha",
    q: b("Find all invoices related to Project Alpha.", "ابحث عن جميع الفواتير المتعلقة بمشروع ‹Alpha›."),
    intro: b(
      "Four invoices reference Project Alpha, with a combined value of SAR 612,500. One is still unpaid.",
      "هناك أربع فواتير تشير إلى مشروع ‹Alpha› بقيمة إجمالية 612,500 ر.س، وإحداها غير مسددة بعد.",
    ),
    table: {
      head: [b("Invoice", "الفاتورة"), b("Date", "التاريخ"), b("Amount (SAR)", "المبلغ (ر.س)"), b("Status", "الحالة")],
      rows: [
        [b("INV-2026-0112", "‹INV-2026-0112›"), b("14 Feb 2026", "14 فبراير 2026"), b("150,000", "150,000"), b("Paid", "مسددة")],
        [b("INV-2026-0147", "‹INV-2026-0147›"), b("12 Mar 2026", "12 مارس 2026"), b("162,500", "162,500"), b("Paid", "مسددة")],
        [b("INV-2026-0233", "‹INV-2026-0233›"), b("20 May 2026", "20 مايو 2026"), b("150,000", "150,000"), b("Paid", "مسددة")],
        [b("INV-2026-0318", "‹INV-2026-0318›"), b("02 Sep 2026", "02 سبتمبر 2026"), b("150,000", "150,000"), b("Unpaid", "غير مسددة")],
      ],
    },
    sources: [
      { doc: "inv147", page: 1, passage: b("Project: Alpha. Invoice INV-2026-0147, total SAR 162,500.", "المشروع: ‹Alpha›. الفاتورة ‹INV-2026-0147›، الإجمالي 162,500 ر.س.") },
      { doc: "inv318", page: 1, passage: b("Project: Alpha. Invoice INV-2026-0318, due 02 October 2026.", "المشروع: ‹Alpha›. الفاتورة ‹INV-2026-0318›، تاريخ الاستحقاق 02 أكتوبر 2026.") },
    ],
  },
  {
    id: "compare",
    q: b("Compare the payment conditions of our main suppliers.", "قارن شروط الدفع لدى مورّدينا الرئيسيين."),
    intro: b(
      "ABC Company and Delta Logistics both require payment within 30 to 45 days, while Nova IT allows 60 days. Only Delta Logistics offers an early-payment discount.",
      "تشترط شركة ‹ABC› و‹Delta Logistics› السداد خلال 30 إلى 45 يومًا، بينما تمنح ‹Nova IT› مدة 60 يومًا. و‹Delta Logistics› وحدها تمنح خصمًا على السداد المبكر.",
    ),
    table: {
      head: [b("Supplier", "المورّد"), b("Payment period", "مدة السداد"), b("Early discount", "خصم السداد المبكر"), b("Late charge", "رسوم التأخير")],
      rows: [
        [b("ABC Company", "شركة ‹ABC›"), b("30 days", "30 يومًا"), b("None", "لا يوجد"), b("1.5% per month", "1.5% شهريًا")],
        [b("Delta Logistics", "‹Delta Logistics›"), b("45 days", "45 يومًا"), b("2% within 10 days", "2% خلال 10 أيام"), b("1% per month", "1% شهريًا")],
        [b("Nova IT", "‹Nova IT›"), b("60 days", "60 يومًا"), b("None", "لا يوجد"), b("No charge stated", "غير محددة")],
      ],
    },
    sources: [
      { doc: "abc", page: 8, passage: b("Payment: the Buyer shall pay each undisputed invoice within thirty (30) days of receipt.", "الدفع: يسدد المشتري كل فاتورة غير متنازع عليها خلال ثلاثين (30) يومًا من استلامها.") },
      { doc: "logistics", page: 5, passage: b("Invoices are payable within forty-five (45) days; a 2% discount applies if paid within ten (10) days.", "تُسدد الفواتير خلال خمسة وأربعين (45) يومًا، ويُطبق خصم 2% عند السداد خلال عشرة (10) أيام.") },
      { doc: "itsupport", page: 7, passage: b("Payment terms are sixty (60) days from the invoice date.", "مدة السداد ستون (60) يومًا من تاريخ الفاتورة.") },
    ],
  },
  {
    id: "obligations",
    q: b("What are the outstanding obligations in our supplier agreements?", "ما الالتزامات القائمة في اتفاقيات مورّدينا؟"),
    intro: b(
      "Three obligations are still open across the supplier agreements.",
      "ما زالت ثلاثة التزامات مفتوحة في اتفاقيات المورّدين.",
    ),
    bullets: [
      b("ABC Company: submit the annual compliance certificate by 31 December 2026.", "شركة ‹ABC›: تقديم شهادة الامتثال السنوية قبل 31 ديسمبر 2026."),
      b("Delta Logistics: confirm the revised delivery schedule within 30 days of the amendment.", "‹Delta Logistics›: تأكيد جدول التسليم المعدّل خلال 30 يومًا من التعديل."),
      b("Nova IT: renew the service-level report review every quarter.", "‹Nova IT›: مراجعة تقرير مستوى الخدمة كل ربع سنة."),
    ],
    sources: [
      { doc: "abc", page: 14, passage: b("The Supplier shall deliver an annual compliance certificate no later than 31 December each year.", "يقدّم المورّد شهادة امتثال سنوية في موعد أقصاه 31 ديسمبر من كل عام.") },
      { doc: "logistics", page: 9, passage: b("The revised delivery schedule is confirmed in writing within thirty (30) days of the amendment.", "يُؤكَّد جدول التسليم المعدّل كتابةً خلال ثلاثين (30) يومًا من التعديل.") },
    ],
  },
];

/* ---------- Source documents (fictional) ---------- */
// A paragraph's text marks the passage the answer relies on with [[…]].
export interface PageDef { heading: Bi; paras: Bi[] }
export interface DocDef { file: string; title: Bi; kind: Bi; pages: Record<number, PageDef> }

export const DOCS: Record<string, DocDef> = {
  abc: {
    file: "ABC_Contract_2026.pdf",
    title: b("Master Supply Agreement — ABC Company", "اتفاقية التوريد الرئيسية — شركة ‹ABC›"),
    kind: b("Contract", "عقد"),
    pages: {
      8: {
        heading: b("8. Payment", "8. الدفع"),
        paras: [
          b("8.1 [[The Buyer shall pay each undisputed invoice within thirty (30) days of receipt.]] Invoices are issued monthly in arrears.", "8.1 [[يسدد المشتري كل فاتورة غير متنازع عليها خلال ثلاثين (30) يومًا من استلامها.]] وتصدر الفواتير شهريًا بعد انتهاء الشهر."),
          b("8.2 Late payments carry a charge of one and a half percent (1.5%) per month on the overdue amount.", "8.2 تترتب على الدفعات المتأخرة رسوم قدرها واحد ونصف بالمئة (1.5%) شهريًا من المبلغ المتأخر."),
          b("8.3 Disputed amounts must be notified in writing within ten (10) days of receipt.", "8.3 يجب الإشعار كتابةً بالمبالغ المتنازع عليها خلال عشرة (10) أيام من الاستلام."),
        ],
      },
      14: {
        heading: b("14. Compliance", "14. الامتثال"),
        paras: [
          b("14.1 [[The Supplier shall deliver an annual compliance certificate no later than 31 December each year.]]", "14.1 [[يقدّم المورّد شهادة امتثال سنوية في موعد أقصاه 31 ديسمبر من كل عام.]]"),
          b("14.2 The Buyer may audit supporting records on thirty (30) days' notice.", "14.2 يحق للمشتري تدقيق السجلات الداعمة بإشعار مدته ثلاثون (30) يومًا."),
        ],
      },
    },
  },
  terms: {
    file: "Payment_Terms_Appendix.pdf",
    title: b("Appendix B — Payment Terms", "الملحق (ب) — شروط الدفع"),
    kind: b("Appendix", "ملحق"),
    pages: {
      2: {
        heading: b("B.2 Change orders", "ب.2 أوامر التغيير"),
        paras: [
          b("B.2.1 Approved change orders are invoiced separately from the monthly service charge.", "ب.2.1 تُفوتَر أوامر التغيير المعتمدة بصورة منفصلة عن رسوم الخدمة الشهرية."),
          b("B.2.2 [[Change orders follow the same thirty (30) day period from receipt of the invoice.]]", "ب.2.2 [[تخضع أوامر التغيير للمدة نفسها، ثلاثين (30) يومًا من استلام الفاتورة.]]"),
        ],
      },
    },
  },
  facilities: {
    file: "Facilities_Services_Agreement.pdf",
    title: b("Facilities Services Agreement", "اتفاقية خدمات المرافق"),
    kind: b("Contract", "عقد"),
    pages: {
      1: {
        heading: b("1. Term", "1. المدة"),
        paras: [
          b("1.1 [[The term runs from 1 December 2024 to 30 November 2026.]]", "1.1 [[تسري هذه الاتفاقية من 1 ديسمبر 2024 إلى 30 نوفمبر 2026.]]"),
          b("1.2 Renewal requires written notice from either party at least sixty (60) days before the end date.", "1.2 يتطلب التجديد إشعارًا كتابيًا من أحد الطرفين قبل تاريخ الانتهاء بستين (60) يومًا على الأقل."),
        ],
      },
    },
  },
  itsupport: {
    file: "IT_Support_Contract.pdf",
    title: b("IT Support Contract — Nova IT", "عقد الدعم التقني — ‹Nova IT›"),
    kind: b("Contract", "عقد"),
    pages: {
      7: {
        heading: b("7. Fees and payment", "7. الرسوم والدفع"),
        paras: [
          b("7.1 [[Payment terms are sixty (60) days from the invoice date.]]", "7.1 [[مدة السداد ستون (60) يومًا من تاريخ الفاتورة.]]"),
          b("7.2 Fees are fixed for the initial term and reviewed on renewal.", "7.2 تبقى الرسوم ثابتة خلال المدة الأولية وتُراجع عند التجديد."),
        ],
      },
      12: {
        heading: b("12. Term and renewal", "12. المدة والتجديد"),
        paras: [
          b("12.1 The initial term ends on 15 December 2026.", "12.1 تنتهي المدة الأولية في 15 ديسمبر 2026."),
          b("12.2 [[This agreement renews automatically for twelve months unless either party gives ninety days' notice.]]", "12.2 [[تتجدد هذه الاتفاقية تلقائيًا لمدة اثني عشر شهرًا ما لم يُرسل أحد الطرفين إشعارًا قبل تسعين يومًا.]]"),
        ],
      },
    },
  },
  logistics: {
    file: "Delta_Logistics_Agreement.pdf",
    title: b("Logistics Services Agreement — Delta Logistics", "اتفاقية الخدمات اللوجستية — ‹Delta Logistics›"),
    kind: b("Contract", "عقد"),
    pages: {
      5: {
        heading: b("5. Invoicing", "5. الفوترة"),
        paras: [
          b("5.1 [[Invoices are payable within forty-five (45) days; a 2% discount applies if paid within ten (10) days.]]", "5.1 [[تُسدد الفواتير خلال خمسة وأربعين (45) يومًا، ويُطبق خصم 2% عند السداد خلال عشرة (10) أيام.]]"),
          b("5.2 Late payments carry a charge of one percent (1%) per month.", "5.2 تترتب على الدفعات المتأخرة رسوم قدرها واحد بالمئة (1%) شهريًا."),
        ],
      },
      9: {
        heading: b("9. Amendments", "9. التعديلات"),
        paras: [
          b("9.1 [[The revised delivery schedule is confirmed in writing within thirty (30) days of the amendment.]]", "9.1 [[يُؤكَّد جدول التسليم المعدّل كتابةً خلال ثلاثين (30) يومًا من التعديل.]]"),
        ],
      },
    },
  },
  inv147: {
    file: "INV-2026-0147.pdf",
    title: b("Invoice INV-2026-0147", "الفاتورة ‹INV-2026-0147›"),
    kind: b("Invoice", "فاتورة"),
    pages: {
      1: {
        heading: b("Invoice summary", "ملخص الفاتورة"),
        paras: [
          b("Supplier: Meridian Data Services Ltd. · Date: 12 March 2026", "المورّد: ‹Meridian Data Services Ltd.› · التاريخ: 12 مارس 2026"),
          b("[[Project: Alpha. Invoice INV-2026-0147, total SAR 162,500.]]", "[[المشروع: ‹Alpha›. الفاتورة ‹INV-2026-0147›، الإجمالي 162,500 ر.س.]]"),
          b("Status: paid on 29 March 2026.", "الحالة: سُددت في 29 مارس 2026."),
        ],
      },
    },
  },
  inv318: {
    file: "INV-2026-0318.pdf",
    title: b("Invoice INV-2026-0318", "الفاتورة ‹INV-2026-0318›"),
    kind: b("Invoice", "فاتورة"),
    pages: {
      1: {
        heading: b("Invoice summary", "ملخص الفاتورة"),
        paras: [
          b("Supplier: Meridian Data Services Ltd. · Date: 02 September 2026", "المورّد: ‹Meridian Data Services Ltd.› · التاريخ: 02 سبتمبر 2026"),
          b("[[Project: Alpha. Invoice INV-2026-0318, due 02 October 2026.]]", "[[المشروع: ‹Alpha›. الفاتورة ‹INV-2026-0318›، تاريخ الاستحقاق 02 أكتوبر 2026.]]"),
          b("Status: awaiting payment.", "الحالة: بانتظار السداد."),
        ],
      },
    },
  },
};

export const DOC_ORDER = ["abc", "terms", "facilities", "itsupport", "logistics", "inv147", "inv318"] as const;

/* ---------- 5. Sources behind every answer ---------- */
export const TRUST = {
  label: b("Trust and traceability", "الثقة وقابلية التتبع"),
  title: b("Every Answer Shows Where It Came From", "كل إجابة تُظهر مصدرها"),
  lead: b("An answer is only useful if it can be checked. Select a citation to open the original page with the supporting passage highlighted.", "لا تفيد الإجابة ما لم يمكن التحقق منها. اختاروا أحد المراجع لفتح الصفحة الأصلية مع إبراز المقطع الداعم."),
  answer: b("Answer", "الإجابة"),
  citations: b("Citations", "المراجع"),
  original: b("Original document", "الوثيقة الأصلية"),
  highlighted: b("Highlighted passage", "المقطع المُبرز"),
  points: [
    b("Identify the documents used", "تحديد الوثائق المستخدمة"),
    b("Open the referenced document", "فتح الوثيقة المشار إليها"),
    b("Go straight to the right page", "الانتقال مباشرة إلى الصفحة المناسبة"),
    b("See the highlighted passage in context", "رؤية المقطع المُبرز في سياقه"),
  ],
  pageOf: (n: number, total: number): Bi => b(`Page ${n} of ${total}`, `الصفحة ${n} من ${total}`),
};

/* ---------- 6. Key capabilities ---------- */
export interface CardDef { icon: string; t: Bi; d: Bi }
export const CAPS_SECTION = {
  label: b("Capabilities", "القدرات"),
  title: b("Built for How People Actually Ask", "مصمَّمة لطريقة طرح الأسئلة الفعلية"),
};
export const CAPABILITIES: CardDef[] = [
  { icon: "i-search", t: b("Natural language search", "بحث بلغة طبيعية"), d: b("Ask questions naturally instead of guessing exact keywords or file names.", "اطرحوا الأسئلة بصياغتكم الطبيعية بدل تخمين الكلمات المفتاحية أو أسماء الملفات.") },
  { icon: "i-ocr", t: b("Semantic document search", "بحث دلالي في الوثائق"), d: b("Find information by meaning and context, not only by matching words.", "ابحثوا بالمعنى والسياق، لا بمطابقة الكلمات وحدها.") },
  { icon: "i-link", t: b("Cross-document intelligence", "ذكاء عابر للوثائق"), d: b("Discover facts and relationships that span several documents.", "اكتشفوا معلومات وعلاقات تمتد عبر عدة وثائق.") },
  { icon: "i-check", t: b("Answers with source references", "إجابات بمراجع المصادر"), d: b("Every answer points back to the original documents and pages.", "تشير كل إجابة إلى الوثائق والصفحات الأصلية.") },
  { icon: "i-archive", t: b("Document comparison", "مقارنة الوثائق"), d: b("Compare agreements, invoices, policies and other records side by side.", "قارنوا الاتفاقيات والفواتير والسياسات وغيرها من السجلات جنبًا إلى جنب.") },
  { icon: "i-globe", t: b("Multilingual interaction", "تفاعل متعدد اللغات"), d: b("Work with the assistant in the supported languages, including Arabic and English.", "تعاملوا مع المساعد باللغات المدعومة، ومنها العربية والإنجليزية.") },
  { icon: "i-lock", t: b("Permission-aware retrieval", "استرجاع يراعي الصلاحيات"), d: b("People only retrieve information from documents they are authorized to access.", "لا يسترجع المستخدمون إلا معلومات من وثائق يحق لهم الاطلاع عليها.") },
  { icon: "i-backup", t: b("Continuous knowledge updates", "تحديث مستمر للمعرفة"), d: b("The searchable knowledge base stays in step as documents are added or updated.", "تبقى قاعدة المعرفة القابلة للبحث متزامنة مع إضافة الوثائق أو تحديثها.") },
];

/* ---------- Under the hood ---------- */
export const TECH = {
  label: b("Under the hood", "تحت الغطاء"),
  title: b("The Architecture in One Line of Sight", "البنية في نظرة واحدة"),
  lead: b("A small chain of well-understood steps turns a document repository into something you can question.", "سلسلة قصيرة من خطوات مفهومة تحوّل مستودع الوثائق إلى مصدر يمكن مساءلته."),
  flow: [
    b("ECM+ document repository", "مستودع وثائق ‹ECM+›"),
    b("OCR and document processing", "التعرّف الضوئي ومعالجة الوثائق"),
    b("Text extraction and chunking", "استخراج النص وتقسيمه"),
    b("Embedding generation", "توليد التمثيلات الرقمية"),
    b("Vector / semantic indexing", "الفهرسة الدلالية"),
    b("User question", "سؤال المستخدم"),
    b("Relevant context retrieval", "استرجاع السياق ذي الصلة"),
    b("LLM / RAG response generation", "توليد الإجابة (نموذج لغوي وتوليد معزّز بالاسترجاع)"),
    b("Answer with document citations", "إجابة بمراجع الوثائق"),
  ],
  glossary: [
    { k: "OCR", d: b("Converts scanned document images into machine-readable text.", "يحوّل صور الوثائق الممسوحة إلى نص تقرؤه الآلة.") },
    { k: "Chunking", d: b("Breaks lengthy documents into smaller, meaningful sections.", "يقسّم الوثائق الطويلة إلى أقسام أصغر ذات معنى.") },
    { k: "Embeddings", d: b("Represent content in a form that allows similarity searches by meaning.", "تمثّل المحتوى بصيغة تتيح البحث عن التشابه بالمعنى.") },
    { k: "Vector indexing", d: b("Organizes those representations so the right passages are found quickly.", "ينظّم هذه التمثيلات ليسهل العثور على المقاطع المناسبة سريعًا.") },
    { k: "RAG", d: b("Retrieves relevant passages from your documents and gives them to the AI model as context before it answers.", "يسترجع المقاطع ذات الصلة من وثائقكم ويقدّمها للنموذج سياقًا قبل أن يجيب.") },
    { k: "LLM", d: b("Understands the question and writes a natural language answer from the retrieved context.", "يفهم السؤال ويكتب إجابة بلغة طبيعية من السياق المسترجع.") },
  ],
  note: b(
    "The AI model does not have to be retrained from scratch each time a document is added. New or updated documents are processed and indexed into the knowledge base.",
    "لا يلزم إعادة تدريب النموذج من الصفر كلما أُضيفت وثيقة. تُعالَج الوثائق الجديدة أو المحدّثة وتُفهرَس في قاعدة المعرفة.",
  ),
};

/* ---------- 7. Use cases ---------- */
export interface UseCase { icon: string; t: Bi; items: Bi[] }
export const USES = {
  label: b("Use cases", "حالات الاستخدام"),
  title: b("One Assistant, Every Department", "مساعد واحد لكل الإدارات"),
  items: [
    { icon: "i-shield", t: b("Legal", "الشؤون القانونية"), items: [b("Find specific clauses across contracts", "العثور على بنود محددة عبر العقود"), b("Identify contract expiration dates", "معرفة تواريخ انتهاء العقود"), b("Compare agreements", "مقارنة الاتفاقيات"), b("Discover contractual obligations", "اكتشاف الالتزامات التعاقدية")] },
    { icon: "i-audit", t: b("Finance", "المالية"), items: [b("Find invoices and payment conditions", "العثور على الفواتير وشروط الدفع"), b("Retrieve financial information", "استرجاع المعلومات المالية"), b("Compare supplier transactions", "مقارنة معاملات المورّدين"), b("Identify outstanding payments", "تحديد الدفعات القائمة")] },
    { icon: "i-people", t: b("Human Resources", "الموارد البشرية"), items: [b("Search employee policies", "البحث في سياسات الموظفين"), b("Retrieve information from HR documents", "استرجاع معلومات من وثائق الموارد البشرية"), b("Find employee records, according to access permissions", "العثور على سجلات الموظفين وفق صلاحيات الوصول")] },
    { icon: "i-ticket", t: b("Procurement", "المشتريات"), items: [b("Compare supplier agreements", "مقارنة اتفاقيات المورّدين"), b("Find purchasing conditions", "العثور على شروط الشراء"), b("Discover supplier-related information", "اكتشاف المعلومات المتعلقة بالمورّدين")] },
    { icon: "i-path", t: b("Management", "الإدارة العليا"), items: [b("Discover organizational information", "اكتشاف معلومات المؤسسة"), b("Ask questions across business records", "طرح أسئلة عبر سجلات الأعمال"), b("Make better-informed decisions", "اتخاذ قرارات أفضل استنادًا إلى المعلومات")] },
  ] as UseCase[],
};

/* ---------- 8. Benefits ---------- */
export const BENEFITS = {
  label: b("Business value", "القيمة للأعمال"),
  title: b("What Changes for Your Teams", "ما الذي يتغير لدى فرقكم"),
  items: [
    b("Faster information discovery", "اكتشاف أسرع للمعلومات"),
    b("Reduced manual document searching", "تقليل البحث اليدوي في الوثائق"),
    b("Improved employee productivity", "تحسين إنتاجية الموظفين"),
    b("Better use of organizational knowledge", "استفادة أفضل من معرفة المؤسسة"),
    b("More informed business decisions", "قرارات أعمال أكثر استنارة"),
    b("Greater visibility across organizational records", "رؤية أوسع عبر سجلات المؤسسة"),
    b("Secure access to distributed document information", "وصول آمن إلى معلومات الوثائق الموزعة"),
  ],
};

/* ---------- 9. Security and governance ---------- */
export const SECURITY = {
  label: b("Security and governance", "الأمان والحوكمة"),
  title: b("Intelligence That Respects Your Permissions", "ذكاء يحترم الصلاحيات"),
  lead: b("Document intelligence only works if it follows the rules your organization already has. A person never receives an answer built from a document they could not open themselves.", "لا يصلح ذكاء الوثائق ما لم يلتزم بالقواعد المعمول بها في المؤسسة. لا يحصل المستخدم على إجابة مبنية على وثيقة لا يحق له فتحها."),
  items: [
    { icon: "i-lock", t: b("Existing access permissions", "صلاحيات الوصول القائمة"), d: b("The assistant works within the permissions already set on documents and folders.", "يعمل المساعد ضمن الصلاحيات المحددة مسبقًا على الوثائق والمجلدات.") },
    { icon: "i-shield", t: b("Permission-aware retrieval", "استرجاع يراعي الصلاحيات"), d: b("Passages from documents a user cannot access are never retrieved for them.", "لا تُسترجع للمستخدم مقاطع من وثائق لا يحق له الوصول إليها.") },
    { icon: "i-trace", t: b("Controlled sensitive information", "تحكم في المعلومات الحساسة"), d: b("Sensitive content stays behind the same controls that protect it today.", "يبقى المحتوى الحساس خلف الضوابط نفسها التي تحميه اليوم.") },
    { icon: "i-link", t: b("Source traceability", "تتبّع المصادر"), d: b("Every answer links back to the documents and pages it relied on.", "ترتبط كل إجابة بالوثائق والصفحات التي اعتمدت عليها.") },
    { icon: "i-archive", t: b("Organizational data governance", "حوكمة بيانات المؤسسة"), d: b("Knowledge stays inside the governance framework that already applies to your records.", "تبقى المعرفة ضمن إطار الحوكمة المطبّق على سجلاتكم.") },
  ],
};

/* ---------- 10. Final call to action ---------- */
export const CTA = {
  title: b("Your Organization Already Has the Answers. It's Time to Ask.", "مؤسستكم تملك الإجابات بالفعل. حان وقت السؤال."),
  text: b("Unlock the knowledge hidden in your documents and give your teams a smarter way to discover information.", "اكتشفوا المعرفة المخبأة في وثائقكم، وامنحوا فرقكم طريقة أذكى للوصول إلى المعلومات."),
  request: b("Request a Personalized Demo", "اطلب عرضًا تجريبيًا مخصصًا"),
  contact: b("Talk to our team", "تواصلوا مع فريقنا"),
  prefill: b("Chat with Your Documents", "الدردشة مع وثائقكم"),
};

export const pick = (s: Bi, lang: Lang): string => (lang === "ar" ? s.ar : s.en);
