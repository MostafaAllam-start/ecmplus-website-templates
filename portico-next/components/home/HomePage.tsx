import ReactDOM from "react-dom";
import { srcSetWithBase, withBase, type Lang } from "@/lib/site";
import ContactPrefill from "../client/ContactPrefill";
import DemoForm from "../client/DemoForm";
import SectorScroller from "../client/SectorScroller";
import TraceEvidence from "../client/TraceEvidence";
import { createLinker } from "../shell/links";
import Shell from "../shell/Shell";
import { COPY } from "./copy";
import { homeJsonLd } from "./jsonld";
import Ai from "./sections/Ai";
import Contact from "./sections/Contact";
import Deploy from "./sections/Deploy";
import Governance from "./sections/Governance";
import Hero from "./sections/Hero";
import Lifecycle from "./sections/Lifecycle";
import News from "./sections/News";
import Sectors from "./sections/Sectors";
import Start from "./sections/Start";
import Suite from "./sections/Suite";
import Support from "./sections/Support";
import Why from "./sections/Why";

const HERO_SET = [800, 1200, 1600].map((w) => `/assets/photos/portico/p01-suite-${w}.webp ${w}w`).join(", ");

/** The Portico home page, one component for both languages (copy in ./copy.ts). */
export default function HomePage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const links = createLinker(lang, "home");
  const p = { links, lang };
  // The hero photograph is the largest paint: fetch it first, with the same candidates as the <img>.
  ReactDOM.preload(withBase("/assets/photos/portico/p01-suite-1600.webp"), {
    as: "image",
    imageSrcSet: srcSetWithBase(HERO_SET),
    imageSizes: "100vw",
    fetchPriority: "high",
    type: "image/webp",
  });
  const ld = JSON.stringify(homeJsonLd(lang)).replace(/</g, "\u003c");

  return (
    <Shell lang={lang} current="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <main id="main" tabIndex={-1}>
        <Hero t={t.hero} {...p} />
        <Suite t={t.suite} {...p} />
        <Why t={t.why} {...p} />
        <Ai t={t.ai} {...p} />
        <Lifecycle t={t.lifecycle} {...p} />
        <Governance t={t.governance} {...p} />
        <Deploy t={t.deploy} {...p} />
        <Sectors t={t.sectors} {...p} />
        <Start t={t.start} {...p} />
        <Support t={t.support} {...p} />
        <News t={t.news} {...p} />
        <Contact t={t.contact} {...p} />
      </main>
      <TraceEvidence />
      <SectorScroller />
      <ContactPrefill />
      <DemoForm lang={lang} />
    </Shell>
  );
}
