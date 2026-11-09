import { CAPTURE_META } from "@/data/capture-meta";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";
import Shell from "./shell/Shell";

const HOME_TITLE = {
  en: "From document to decision, in one suite.",
  ar: "من الوثيقة إلى القرار، في منظومة واحدة.",
} as const;

/** Stand-in for the home and Document Capture routes until they are ported (later steps). */
export default function Placeholder({ lang, current }: { lang: Lang; current: "home" | "capture" }) {
  const title = current === "home" ? HOME_TITLE[lang] : CAPTURE_META[lang].name;
  return (
    <Shell lang={lang} current={current}>
      <main id="main" tabIndex={-1} className={`sp sp--${current}`}>
        <section className="sp-hero" aria-labelledby="page-title">
          <div className="wrap sp-hero__grid">
            <div className="sp-hero__copy">
              <h1 id="page-title">{rich(title)}</h1>
              <p className="sp-lead">{lang === "en" ? "This page is ported in a later step." : "تُنقل هذه الصفحة في خطوة لاحقة."}</p>
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
