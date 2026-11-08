import type { Lang } from "@/lib/site";

/**
 * Header, footer and announcement copy, taken from the Portico home pages.
 * Link targets use the home page's own spelling: "documents/" (a page), "#contact"
 * (an anchor on the home page) or "/support" (another app on the site).
 * Latin names sit inside <bdi> (rendered by rich()).
 */
export interface FooterColumn {
  title: string;
  links: { href: string; label: string; prefill?: string; rel?: string }[];
}

export interface ShellDict {
  lang: Lang;
  dir: "ltr" | "rtl";
  skip: string;
  notice: { badge: string; text: string; link: string };
  header: {
    homeAria: string;
    switchTo: { label: string; lang: Lang };
    darkMode: string;
    menu: string;
    navAria: string;
    suite: string;
    modulesHeading: string;
    exploreSuite: string;
    solutions: string;
    capture: { title: string; desc: string };
    chat: { title: string; desc: string };
    about: string;
    support: { label: string; href: string };
    cta: string;
  };
  footer: {
    tagline: string;
    ctc: { alt: string; text: string };
    navAria: string;
    columns: FooterColumn[];
    copyright: string;
    legal: { href: string; label: string }[];
  };
}

export const SHELL: Record<Lang, ShellDict> = {
  en: {
    lang: "en",
    dir: "ltr",
    skip: "Skip to main content",
    notice: {
      badge: "New",
      text: "ECM+ enters the Iraqi market from ITEX Iraq 2026 in Baghdad",
      link: "Details",
    },
    header: {
      homeAria: "ECM+ Business Suite, home page",
      switchTo: { label: "العربية", lang: "ar" },
      darkMode: "Dark mode",
      menu: "Menu",
      navAria: "Main navigation",
      suite: "Suite",
      modulesHeading: "Modules",
      exploreSuite: "Explore the suite",
      solutions: "Solutions",
      capture: {
        title: "Document Capture",
        desc: "Scan, upload or file from email; OCR and AI-filled index fields.",
      },
      chat: {
        title: "Chat with Your Documents",
        desc: "Ask questions across your documents and get answers with sources.",
      },
      about: "About ECM Plus",
      support: { label: "Support", href: "/support" },
      cta: "Request a demo",
    },
    footer: {
      tagline: "A unified suite for the management of documents, correspondence, processes and meetings.",
      ctc: { alt: "CTC MENA, exclusive agent", text: "ECM Plus is a Canadian company. CTC MENA is its exclusive agent." },
      navAria: "Footer",
      columns: [
        {
          title: "Suite",
          links: [
            { href: "documents/", label: "Document Management" },
            { href: "correspondence/", label: "Administrative Communications" },
            { href: "processes/", label: "Business Process Automation" },
            { href: "meetings/", label: "Board and Committee Management" },
          ],
        },
        { title: "Solutions", links: [{ href: "capture/", label: "Document Capture" }, { href: "chat/", label: "Chat with Your Documents" }] },
        {
          title: "Sectors",
          links: [
            { href: "#sector-government", label: "Government" },
            { href: "#sector-finance", label: "Banking and finance" },
            { href: "#sector-healthcare", label: "Healthcare" },
            { href: "#sector-education", label: "Education" },
            { href: "#sector-energy", label: "Energy and construction" },
          ],
        },
        {
          title: "Resources",
          links: [
            { href: "#contact", label: "Product overview", prefill: "Please send us the ECM+ product overview." },
            { href: "#why", label: "Why ECM+" },
            { href: "#security", label: "Security" },
            { href: "#ai", label: "AI in ECM+" },
            { href: "#contact", label: "Integration guide", prefill: "Please send us the ECM+ integration guide." },
            { href: "#start", label: "Getting started" },
            { href: "#faq", label: "Frequently asked questions" },
            { href: "#contact", label: "Request a demo" },
          ],
        },
        {
          title: "Client portal",
          links: [
            { href: "/support", label: "Support centre" },
            { href: "/support/login", label: "Sign in to the client portal" },
            { href: "/support/tickets/new", label: "Submit a support ticket" },
            { href: "/support/tickets", label: "Track your tickets" },
            { href: "/support/suggestions", label: "Submit a suggestion or complaint" },
          ],
        },
        {
          title: "Company",
          links: [
            { href: "about/", label: "About ECM Plus" },
            { href: "#news", label: "News" },
            { href: "https://ctcmena.com", label: "CTC MENA, exclusive agent", rel: "noopener" },
            { href: "#contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ],
        },
      ],
      copyright: "© 2026 ECM Plus. All rights reserved.",
      legal: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    skip: "الانتقال إلى المحتوى الرئيسي",
    notice: {
      badge: "جديد",
      text: "<bdi>ECM+</bdi> تنطلق إلى السوق العراقي من معرض <bdi>ITEX Iraq 2026</bdi> في بغداد",
      link: "التفاصيل",
    },
    header: {
      homeAria: "ECM+ Business Suite — الصفحة الرئيسية",
      switchTo: { label: "English", lang: "en" },
      darkMode: "الوضع الداكن",
      menu: "القائمة",
      navAria: "التنقل الرئيسي",
      suite: "المنظومة",
      modulesHeading: "الأنظمة",
      exploreSuite: "استكشف المنظومة",
      solutions: "الحلول",
      capture: {
        title: "التقاط الوثائق",
        desc: "مسح ورفع وحفظ من البريد؛ تعرّف على النص وحقول فهرسة يعبّئها الذكاء الاصطناعي.",
      },
      chat: {
        title: "الدردشة مع وثائقكم",
        desc: "اطرحوا أسئلتكم على وثائقكم واحصلوا على إجابات بمصادرها.",
      },
      about: "عن <bdi>ECM Plus</bdi>",
      support: { label: "الدعم", href: "/support?lang=ar" },
      cta: "اطلب عرضًا تجريبيًا",
    },
    footer: {
      tagline: "منظومة موحّدة لإدارة الوثائق والمراسلات والإجراءات والاجتماعات.",
      ctc: { alt: "CTC MENA، الوكيل الحصري", text: "الوكيل الحصري والمسؤولة عن تعريب المنتج." },
      navAria: "روابط التذييل",
      columns: [
        {
          title: "المنظومة",
          links: [
            { href: "documents/", label: "إدارة الوثائق" },
            { href: "correspondence/", label: "الاتصالات الإدارية" },
            { href: "processes/", label: "أتمتة الإجراءات" },
            { href: "meetings/", label: "إدارة المجالس واللجان" },
          ],
        },
        { title: "الحلول", links: [{ href: "capture/", label: "التقاط الوثائق" }, { href: "chat/", label: "الدردشة مع وثائقكم" }] },
        {
          title: "القطاعات",
          links: [
            { href: "#sector-government", label: "الجهات الحكومية" },
            { href: "#sector-finance", label: "البنوك والقطاع المالي" },
            { href: "#sector-healthcare", label: "الرعاية الصحية" },
            { href: "#sector-education", label: "التعليم" },
            { href: "#sector-energy", label: "الطاقة والإنشاءات" },
          ],
        },
        {
          title: "الموارد",
          links: [
            { href: "#contact", label: "نظرة عامة على المنتج", prefill: "نرجو إرسال النظرة العامة على منظومة ECM+‎." },
            { href: "#why", label: "لماذا <bdi>ECM+</bdi>" },
            { href: "#security", label: "الأمان والحوكمة" },
            { href: "#ai", label: "الذكاء الاصطناعي" },
            { href: "#contact", label: "دليل التكامل", prefill: "نرجو إرسال دليل التكامل لمنظومة ECM+‎." },
            { href: "#start", label: "خطوات البدء" },
            { href: "#faq", label: "الأسئلة الشائعة" },
            { href: "#contact", label: "اطلب عرضًا تجريبيًا" },
          ],
        },
        {
          title: "بوابة العملاء",
          links: [
            { href: "/support?lang=ar", label: "مركز الدعم" },
            { href: "/support/login?lang=ar", label: "الدخول إلى بوابة العملاء" },
            { href: "/support/tickets/new?lang=ar", label: "تقديم تذكرة دعم" },
            { href: "/support/tickets?lang=ar", label: "متابعة التذاكر" },
            { href: "/support/suggestions?lang=ar", label: "تقديم اقتراح أو شكوى" },
          ],
        },
        {
          title: "الشركة",
          links: [
            { href: "about/", label: "عن <bdi>ECM Plus</bdi>" },
            { href: "#news", label: "الأخبار" },
            { href: "https://ctcmena.com", label: "<bdi>CTC MENA</bdi>، الوكيل الحصري", rel: "noopener" },
            { href: "#contact", label: "تواصل معنا" },
            { href: "/privacy", label: "الخصوصية" },
            { href: "/terms", label: "الشروط" },
          ],
        },
      ],
      copyright: "© 2026 <bdi>ECM Plus</bdi>. جميع الحقوق محفوظة.",
      legal: [
        { href: "/privacy", label: "الخصوصية" },
        { href: "/terms", label: "الشروط" },
      ],
    },
  },
};
