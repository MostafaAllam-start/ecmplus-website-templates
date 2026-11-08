// Copy and data for the three factory dialogs: Document check (stage 1), Scanning screen (stage 3-4)
// and ECM+ Documents archive (stage 7). Everything here is a demonstration on fictional sample documents.
// Terminology follows the Documents module page (Documents, Document type, Folder, Version history, Audit trail).
import type { Bi } from "./capture";

const b = (en: string, ar: string): Bi => ({ en, ar });

export type CondKind = "clean" | "staple" | "clip" | "fold" | "torn" | "missing" | "faded";
/** Condition of each of the 10 factory sheets (index = sheet; category = index % 5). Sheet 6 is the folded contract on the manual table,
 *  sheets 0, 1, 2 and 4 carry the staples the prep worker removes, sheet 3 scans badly (its torn corner) and goes to rescan. */
export const SHEET_CONDS: CondKind[] = ["staple", "staple", "staple", "torn", "staple", "clip", "fold", "missing", "faded", "clean"];
export const BAD_SHEET = 3;
export const RESCAN_DONE_T = 35.3;

export interface CondDef { status: "ready" | "manual"; problem: Bi; explain: Bi; steps: Bi[] }
export const COND: Record<CondKind, CondDef> = {
  clean: {
    status: "ready", problem: b("No problem found", "لا توجد مشكلة"),
    explain: b("The sheet is flat, complete and clean. It only needs a quick check before it joins the ready stack.", "الورقة مسطّحة وكاملة ونظيفة، وتحتاج إلى فحص سريع فقط قبل انضمامها إلى الأوراق الجاهزة."),
    steps: [b("Check the sheet", "فحص الورقة"), b("Square the edges", "تسوية الحواف"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
  staple: {
    status: "ready", problem: b("Staple in the corner", "دبوس في الزاوية"),
    explain: b("A staple would jam the scanner feed and tear the page. The worker removes it and flattens the corner.", "قد يتسبب الدبوس في انحشار الماسح وتمزيق الصفحة. يزيله العامل ويفرد الزاوية."),
    steps: [b("Remove the staple", "إزالة الدبوس"), b("Flatten the corner", "فرد الزاوية"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
  clip: {
    status: "ready", problem: b("Paper clip attached", "مشبك ورق مرفق"),
    explain: b("A clip leaves the pages uneven and can scratch the scanner glass. The worker removes it and squares the pages.", "يترك المشبك الصفحات غير مستوية وقد يخدش زجاج الماسح. يزيله العامل ويسوّي الصفحات."),
    steps: [b("Remove the clip", "إزالة المشبك"), b("Flatten the sheet", "فرد الورقة"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
  fold: {
    status: "manual", problem: b("Folded sheet", "ورقة مطوية"),
    explain: b("A folded contract cannot go through the auto-feeder. It goes to the manual treatment table, is flattened by hand, then rejoins the flow.", "لا يمكن تمرير عقد مطوي عبر وحدة التغذية التلقائية. يُنقل إلى طاولة المعالجة اليدوية ويُفرد يدويًا ثم يعود إلى التدفق."),
    steps: [b("Take to the manual table", "نقلها إلى طاولة المعالجة اليدوية"), b("Flatten the sheet", "فرد الورقة"), b("Rejoin the ready stack", "إعادتها إلى الأوراق الجاهزة")],
  },
  torn: {
    status: "ready", problem: b("Torn corner", "زاوية ممزقة"),
    explain: b("The damaged corner can mis-feed. The worker supports it with a carrier sheet, and the scanner may still flag the page, which then goes to the rescan line.", "قد تتعثر الزاوية التالفة أثناء التغذية. يدعمها العامل بورقة حاملة، وقد يعلّم الماسح الصفحة فتنتقل إلى مسار إعادة المسح."),
    steps: [b("Smooth the torn corner", "تسوية الزاوية الممزقة"), b("Support it with a carrier sheet", "دعمها بورقة حاملة"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
  missing: {
    status: "ready", problem: b("Incomplete: a page is missing", "ناقصة: صفحة مفقودة"),
    explain: b("The set has one page fewer than its cover sheet states. The worker attaches a missing-page note so staff can find it before archiving.", "تحتوي المجموعة على صفحة أقل مما تذكره ورقة الغلاف. يرفق العامل ملاحظة بالصفحة المفقودة ليتتبعها الموظف قبل الأرشفة."),
    steps: [b("Count the pages", "عدّ الصفحات"), b("Attach a missing-page note", "إرفاق ملاحظة بالصفحة المفقودة"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
  faded: {
    status: "ready", problem: b("Faded print", "طباعة باهتة"),
    explain: b("Light print is hard to read. The worker marks the page so the scanner raises its contrast for it.", "الطباعة الفاتحة يصعب قراءتها. يعلّم العامل الصفحة ليرفع الماسح تباينها."),
    steps: [b("Mark the page for high contrast", "تعليم الصفحة للتباين العالي"), b("Flatten the sheet", "فرد الورقة"), b("Place on the ready stack", "وضعها على الأوراق الجاهزة")],
  },
};

export const CHECK = {
  title: b("Document check", "فحص الوثيقة"),
  sheetOf: b("Sheet {n} of {N}", "الورقة {n} من {N}"),
  statusReady: b("Ready", "جاهزة"), statusManual: b("Needs manual treatment", "تحتاج إلى معالجة يدوية"),
  problem: b("What is wrong", "المشكلة"), worker: b("What the worker does", "ما يفعله العامل"), outcome: b("Outcome", "النتيجة"),
  outReady: b("Ready to process: goes to the sorting line.", "جاهزة للمعالجة: تنتقل إلى خط الفرز."),
  outManual: b("Manual treatment area: handled by hand, then it rejoins the sorting line.", "منطقة المعالجة اليدوية: تُعالج يدويًا ثم تعود إلى خط الفرز."),
  doIt: b("Do it for me", "التنفيذ"), send: b("Send to manual treatment", "إرسال إلى المعالجة اليدوية"),
  prev: b("Previous sheet", "الورقة السابقة"), next: b("Next sheet", "الورقة التالية"),
  working: b("The worker is on it…", "العامل يعمل عليها…"),
  done: b("Done: the sheet is ready to process.", "تم: الورقة جاهزة للمعالجة."),
  sent: b("Sent to the manual treatment area.", "أُرسلت إلى منطقة المعالجة اليدوية."),
  marker: b("Problem", "المشكلة"),
  note: b("Preparation stage · demonstration on sample documents", "مرحلة التحضير · عرض توضيحي على وثائق نموذجية"),
};

export type ScanStatus = "ok" | "poor" | "rescanning" | "rescanned";
export const SCAN = {
  title: b("Scanning screen", "شاشة المسح"),
  grid: b("Scanned documents", "الوثائق الممسوحة"),
  status: { ok: b("Scanned OK", "مسح سليم"), poor: b("Poor scan, sent to rescan", "مسح رديء، أُرسل لإعادة المسح"), rescanning: b("Rescanning…", "جارٍ إعادة المسح…"), rescanned: b("Rescanned OK", "أُعيد مسحه بنجاح") } as Record<ScanStatus, Bi>,
  quality: b("Scan quality", "جودة المسح"),
  q: { ok: b("Good: sharp text, straight edges.", "جيدة: نص واضح وحواف مستقيمة."), poor: b("Poor: skewed edge and low contrast near the torn corner.", "رديئة: حافة مائلة وتباين منخفض قرب الزاوية الممزقة."), rescanning: b("Scanning the page again…", "جارٍ مسح الصفحة من جديد…"), rescanned: b("Good after the rescan.", "جيدة بعد إعادة المسح.") } as Record<ScanStatus, Bi>,
  nextSteps: b("Next steps", "الخطوات التالية"),
  steps: [b("Quality check", "فحص الجودة"), b("Rescan if needed", "إعادة المسح عند الحاجة"), b("Data extraction", "استخراج البيانات"), b("Metadata", "البيانات الوصفية"), b("Barcode / QR code", "الباركود / رمز QR"), b("Archive", "الأرشفة")],
  rescan: b("Send to rescan", "إرسال لإعادة المسح"),
  cont: b("Continue processing", "متابعة المعالجة"), openScan: b("Open scan step", "فتح خطوة المسح"),
  pick: b("Select a document", "اختاروا وثيقة"),
};

export const DMS = {
  title: b("ECM+ Documents · Archive", "وثائق ECM+‎ · الأرشيف"),
  module: b("Documents", "الوثائق"),
  archive: b("Archive", "الأرشيف"),
  folders: b("Folders", "المجلدات"),
  search: b("Search documents", "ابحثوا في الوثائق"),
  results: b("Search results", "نتائج البحث"),
  count: b("{n} documents", "{n} وثائق"),
  cols: { name: b("Name", "الاسم"), code: b("Code", "الرمز"), type: b("Document type", "نوع الوثيقة"), date: b("Date", "التاريخ") },
  archived: b("Archived", "مؤرشف"),
  details: b("Details", "التفاصيل"),
  index: b("Index fields", "حقول الفهرسة"),
  paper: b("Original paper", "الأوراق الأصلية"),
  box: b("Paper archive, box: {c}", "الأرشيف الورقي، صندوق: {c}"),
  audit: b("Audit trail", "سجل التدقيق"),
  auditRows: [b("Captured by scanner", "التُقطت بالماسح"), b("Index fields reviewed by staff", "راجع الموظف حقول الفهرسة"), b("Code stamped and filed", "خُتمت بالرمز وحُفظت")],
  version: b("Version history", "سجل الإصدارات"),
  versionRow: b("Version 1 · current", "الإصدار 1 · الحالي"),
  empty: b("No documents match.", "لا توجد وثائق مطابقة."),
  tag: b("Demonstration · sample documents only", "عرض توضيحي · وثائق نموذجية فقط"),
  date: "2026-05-12",
  pick: b("Select a document to see its details.", "اختاروا وثيقة لعرض تفاصيلها."),
  stampLabel: b("Code", "الرمز"),
};
export const DMS_CODES2 = ["DOC-2026-00423", "DOC-2026-00424", "DOC-2026-00425", "DOC-2026-00426", "DOC-2026-00427"];

export const TOOL_STR = {
  openDms: b("Open in ECM+ Documents", "الفتح في وثائق ECM+‎"),
};
