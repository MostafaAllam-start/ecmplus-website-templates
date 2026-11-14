import { PARTNERS_PAGE, staticPartnerViews } from "@/data/partners";
import { PartnerCards } from "./PartnerLive";
import { homePath, withBase, type Lang } from "@/lib/site";
import { rich } from "@/lib/rich";
import { Section, uiFor } from "../ModulePage";
import Shell from "../shell/Shell";

/** Partners (Portico): who delivers, localizes and integrates ECM+. */
export default function PartnersPage({ lang }: { lang: Lang }) {
  const ui = uiFor(lang);
  const c = PARTNERS_PAGE[lang];
  const home = withBase(homePath(lang));
  const r = (s: string) => rich(lang === "ar" ? s.replace(/‹([^›]*)›/g, "<bdi>$1</bdi>") : s);

  return (
    <Shell lang={lang} current="partners">
      <main id="main" className="sp sp--partners">
        <section className="sp-hero" aria-labelledby="page-title">
          <div className="wrap">
            <div className="sp-hero__copy">
              <nav className="sp-crumbs" aria-label={ui.crumbsLabel}>
                <ol><li><a href={home}>{ui.home}</a></li><li aria-current="page">{c.name}</li></ol>
              </nav>
              <p className="sp-eyebrow"><span>{c.eyebrow}</span></p>
              <h1 id="page-title">{r(c.title)}</h1>
              <p className="sp-lead">{r(c.lead)}</p>
            </div>
          </div>
        </section>
        <Section no="01" label={c.eyebrow} id="partners-title" title={c.name} alt>
          <PartnerCards fallback={staticPartnerViews(lang, withBase)} visit={c.visit} />
        </Section>
      </main>
    </Shell>
  );
}
