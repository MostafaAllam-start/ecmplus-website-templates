import type { Metadata, Viewport } from "next";
import { CAPTURE_META } from "@/data/capture-meta";
import { META as CHAT_META } from "@/data/chat";
import { PAGES, PORTICO_NAMES, type Lang } from "@/data/content";
import { strip } from "./rich";
import { SITE, absUrl, other, withBase } from "./site";

const OG_IMAGE = `${SITE}/assets/brand/ecmplus-ai-logo.png`;
const LOCALE: Record<Lang, string> = { en: "en_US", ar: "ar_SA" };

// <meta name="theme-color"> and color-scheme (ThemeToggle keeps theme-color in step with the theme).
export const viewport: Viewport = {
  themeColor: "#F4F2EE",
  colorScheme: "light",
};

/** The home pages' own title, description and share copy (templates/portico/index.html, ar/index.html). */
const HOME = {
  en: {
    title: "ECM Plus — Documents, correspondence, processes, meetings",
    description:
      "ECM Plus (ECM+) unites document management, official correspondence, process automation and meetings in one bilingual suite on your own servers.",
    ogTitle: "ECM Plus — From document to decision, in one suite",
    ogDescription:
      "Document management, official correspondence, process automation and meetings in one bilingual suite, hosted on your organization's servers, with every view recorded.",
    twDescription:
      "Document management, official correspondence, process automation and meetings in one bilingual suite, hosted on your organization's servers.",
  },
  ar: {
    title: "ECM Plus — الوثائق والمراسلات والإجراءات والاجتماعات",
    description:
      "تجمع ECM Plus إدارة الوثائق والمراسلات الرسمية وأتمتة الإجراءات والاجتماعات في منظومة واحدة ثنائية اللغة تعمل على خوادم مؤسستكم.",
    ogTitle: "ECM Plus — من الوثيقة إلى القرار، في منظومة واحدة",
    ogDescription:
      "إدارة الوثائق والمراسلات الرسمية وأتمتة الإجراءات والاجتماعات في منظومة واحدة ثنائية اللغة تعمل على خوادم مؤسستكم، مع تسجيل كل عرض.",
    twDescription:
      "إدارة الوثائق والمراسلات الرسمية وأتمتة الإجراءات والاجتماعات في منظومة واحدة ثنائية اللغة تعمل على خوادم مؤسستكم.",
  },
} as const;

function build(
  lang: Lang,
  slug: string,
  t: { title: string; description: string; ogTitle?: string; ogDescription?: string; twDescription?: string },
): Metadata {
  const url = absUrl(lang, slug);
  const ogTitle = t.ogTitle ?? t.title;
  const ogDescription = t.ogDescription ?? t.description;
  return {
    title: { absolute: t.title },
    description: t.description,
    alternates: {
      canonical: url,
      languages: { en: absUrl("en", slug), ar: absUrl("ar", slug), "x-default": absUrl("en", slug) },
    },
    openGraph: {
      type: "website",
      siteName: "ECM Plus",
      locale: LOCALE[lang],
      alternateLocale: [LOCALE[other(lang)]],
      url,
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: t.twDescription ?? t.description,
      images: [OG_IMAGE],
    },
  };
}

export function homeMetadata(lang: Lang): Metadata {
  return build(lang, "", HOME[lang]);
}

/** Metadata for a module / About page (title, description, canonical, hreflang, Open Graph, Twitter). */
export function pageMetadata(lang: Lang, slug: string): Metadata {
  const c = { ...PAGES[slug][lang], ...PORTICO_NAMES[lang]?.[slug] };
  const title = strip(c.metaTitle);
  return build(lang, slug, { title, description: strip(c.description) });
}

export function chatMetadata(lang: Lang): Metadata {
  const c = CHAT_META[lang];
  return build(lang, "chat", { title: strip(c.metaTitle), description: strip(c.description) });
}

export function captureMetadata(lang: Lang): Metadata {
  const c = CAPTURE_META[lang];
  return build(lang, "capture", { title: strip(c.metaTitle), description: strip(c.description) });
}


