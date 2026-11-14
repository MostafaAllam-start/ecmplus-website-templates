import { homePath, withBase, type Lang } from "@/lib/site";
import { uiFor } from "./ModulePage";
import Shell from "./shell/Shell";
import { SHELL } from "./shell/dict";

const COPY = {
  en: {
    name: "Support Portal",
    title: "Support Portal",
    lead: "Customers and partners sign in to the ECM+ support portal to open and follow tickets. If the portal is not reachable from this address yet, the ECM+ team can help directly.",
    contact: "Contact the ECM+ team",
  },
  ar: {
    name: "بوابة الدعم",
    title: "بوابة الدعم",
    lead: "يدخل العملاء والشركاء إلى بوابة دعم ECM+ لفتح التذاكر ومتابعتها. وإن لم تكن البوابة متاحة من هذا العنوان بعد، يسعد فريق ECM+ بمساعدتكم مباشرة.",
    contact: "تواصلوا مع فريق ECM+",
  },
};

/** Landing for /support: the two portals, and a way to reach the team. The portals themselves live in the support app. */
export default function SupportPage({ lang }: { lang: Lang }) {
  const ui = uiFor(lang);
  const c = COPY[lang];
  const h = SHELL[lang].header;
  const home = withBase(homePath(lang));
  return (
    <Shell lang={lang} current="support">
      <main id="main" className="sp sp--support">
        <section className="sp-hero" aria-labelledby="page-title">
          <div className="wrap">
            <div className="sp-hero__copy">
              <nav className="sp-crumbs" aria-label={ui.crumbsLabel}>
                <ol><li><a href={home}>{ui.home}</a></li><li aria-current="page">{c.name}</li></ol>
              </nav>
              <h1 id="page-title">{c.title}</h1>
              <p className="sp-lead">{c.lead}</p>
              <div className="sp-actions">
                <a className="btn btn--gold btn--lg" href={h.customerPortal.href}>{h.customerPortal.label}</a>
                <a className="btn btn--ghost-gold btn--lg" href={`${home}#contact`}>{c.contact}</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
