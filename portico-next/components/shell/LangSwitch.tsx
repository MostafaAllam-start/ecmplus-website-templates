import { homePath, pagePath, withBase, type Lang } from "@/lib/site";
import { SHELL } from "./dict";

/**
 * Language switch: a plain <a> (not next/link) so the browser does a full navigation
 * and the cross-document view transition keeps working. Points at the same page in
 * the other language ("home" or a page slug).
 */
export default function LangSwitch({ lang, current }: { lang: Lang; current: string }) {
  const to = SHELL[lang].header.switchTo;
  const path = current === "home" ? homePath(to.lang) : pagePath(to.lang, current);
  return (
    <a className="lang-switch" href={withBase(path)} lang={to.lang} hrefLang={to.lang}>
      {to.label}
    </a>
  );
}
