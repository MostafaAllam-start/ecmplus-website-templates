export type Lang = "en" | "ar";

/** GitHub Pages serves the site under /<repo>; empty when served from a domain root. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const SITE = "https://ecmplus.org";

/** Prefix a site path (/assets/..., /ar/...) for raw <a href>, srcSet and <link> use. */
export function withBase(path: string): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  return BASE + (path.startsWith("/") ? path : `/${path}`);
}

/** Rewrite every URL in a srcset string through withBase. */
export function srcSetWithBase(srcSet: string): string {
  return srcSet
    .split(",")
    .map((part) => {
      const [url, ...d] = part.trim().split(/\s+/);
      return [withBase(url), ...d].join(" ");
    })
    .join(", ");
}

export const other = (lang: Lang): Lang => (lang === "en" ? "ar" : "en");
/** Site path of a language's home page (trailing slash). */
export const homePath = (lang: Lang): string => (lang === "en" ? "/" : "/ar/");
export const pagePath = (lang: Lang, slug: string): string => `${homePath(lang)}${slug}/`;
/** Canonical absolute URL of a page ("" slug is the home page). */
export const absUrl = (lang: Lang, slug = ""): string => `${SITE}${homePath(lang)}${slug ? `${slug}/` : ""}`;

/** Where the demo-request form posts. A static export has no server of its own, so deployments point this at their handler. */
export const CONTACT_URL = process.env.NEXT_PUBLIC_CONTACT_URL || "/contact";
