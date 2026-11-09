import type { ReactNode } from "react";
import { manrope, readex } from "@/lib/fonts";
import type { Lang } from "@/lib/site";

// Theme before first paint (a stored choice), and the language flip: arriving through a
// cross-document view transition shows the hero at once (pagereveal fires before the first frame).
const PRE_PAINT = `(function () {
  try {
    var t = localStorage.getItem("ecmplus-theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) { /* storage blocked: stay light */ }
  window.addEventListener("pagereveal", function (e) {
    if (e.viewTransition) document.documentElement.classList.add("flip-in");
  });
})();`;

const JS_CLASS = `document.documentElement.classList.add("js");`;

/** The <html>/<body> shell of a root layout; one per language, so lang and dir are static. */
export default function RootDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    // data-theme, `js`, `reveal`, `flip-in` are set on <html> by the scripts above and the islands.
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={`${manrope.variable} ${readex.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
