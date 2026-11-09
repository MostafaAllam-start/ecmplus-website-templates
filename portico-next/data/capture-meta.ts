// Page metadata for the Document Capture page, copied from scripts/capture-page.mjs (original untouched).
export interface CaptureMeta { name: string; short: string; metaTitle: string; description: string }

export const CAPTURE_META: { code: string; en: CaptureMeta; ar: CaptureMeta } = {
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
    description: "اجمعوا الورق والملفات والبريد في أرشيف واحد، واقرؤوا نصوصها بالعربية والإنجليزية، ودعوا الذكاء الاصطناعي يقترح حقول الفهرسة ليراجعها فريقكم. يتضمن عرضًا توضيحيًا تفاعليًا.",
  },
};
