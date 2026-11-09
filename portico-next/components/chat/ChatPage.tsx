import type { CSSProperties } from "react";
import {
  ASSISTANT, BENEFITS, CAPABILITIES, CAPS_SECTION, CTA, HERO, HOW, PROBLEM, SECURITY, TECH, TRUST, USES, fmt, plain, type Bi,
} from "@/data/chat";
import { homePath, pagePath, withBase, type Lang } from "@/lib/site";
import { rich } from "@/lib/rich";
import { CtaWindow, Section, uiFor } from "../ModulePage";
import Shell from "../shell/Shell";
import ChatAssistant from "./ChatAssistant";
import KnowledgeScene from "./KnowledgeScene";
import SourceExplorer from "./SourceExplorer";

const BTN1 = "btn btn--gold btn--lg";
const BTN2 = "btn btn--ghost-gold btn--lg";
const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as CSSProperties });

function Ic({ id, cls = "ch-ic" }: { id: string; cls?: string }) {
  return <svg className={`sp-glyph ${cls}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`#${id}`} /></svg>;
}

/** Chat with Your Documents (Portico solution page). Section 02 is the Three.js knowledge scene. */
export default function ChatPage({ lang }: { lang: Lang }) {
  const ui = uiFor(lang);
  const home = withBase(homePath(lang));
  const docs = withBase(pagePath(lang, "documents"));
  const f = (s: Bi) => rich(fmt(s, lang));
  const img = (n: string) => withBase(`/assets/photos/chat/${n}.webp`);

  return (
    <Shell lang={lang} current="chat">
      <main id="main" className="sp sp--chat">
        {/* 1. Hero */}
        <section className="sp-hero ch-hero" aria-labelledby="page-title">
          <div className="wrap sp-hero__grid">
            <div className="sp-hero__copy">
              <nav className="sp-crumbs" aria-label={ui.crumbsLabel}>
                <ol><li><a href={home}>{ui.home}</a></li><li><a href={docs}>{f(HERO.crumbDocs)}</a></li><li aria-current="page">{f(HERO.eyebrow)}</li></ol>
              </nav>
              <p className="sp-eyebrow"><Ic id="i-spark" cls="cap-ic" /><span>{f(HERO.kicker)}</span></p>
              <h1 id="page-title">{f(HERO.title)}</h1>
              <p className="sp-lead">{f(HERO.lead)}</p>
              <div className="sp-actions">
                <a className={BTN1} href={`${home}#contact`} data-prefill={plain(CTA.prefill, lang)}>{f(HERO.request)}</a>
                <a className={BTN2} href="#how">{f(HERO.explore)}</a>
              </div>
            </div>
            <div className="sp-hero__visual ch-art" role="img" aria-label={plain(HERO.imgAlt, lang)}>
              <img className="ch-art__img" src={img("document-flow")} alt="" width={1408} height={768} decoding="async" fetchPriority="high" />
              <div className="ch-art__chat" aria-hidden="true">
                <p className="ch-art__q">{f(HERO.mockQ)}</p>
                <p className="ch-art__a">{f(HERO.mockA)}</p>
                <p className="ch-art__s"><Ic id="i-check" cls="ch-art__ic" /><span dir="ltr">{plain(HERO.mockSrc, "en")}</span></p>
              </div>
              <p className="ch-art__note">{f(HERO.sampleNote)}</p>
            </div>
          </div>
        </section>

        {/* 2. The problem */}
        <Section no="01" label={fmt(PROBLEM.label, lang)} id="problem-title" title={fmt(PROBLEM.title, lang)}>
          <p className="sp-lead ch-lead" {...reveal(0)}>{f(PROBLEM.lead)}</p>
          <ul className="sp-grid cap-grid ch-pains">
            {PROBLEM.pains.map((p, i) => (
              <li className="sp-card cap-card" key={i} {...reveal(i)}>
                <Ic id={p.icon} cls="cap-ic" />
                <h3 className="sp-card__title">{f(p.t)}</h3>
                <p>{f(p.d)}</p>
              </li>
            ))}
          </ul>
          <div className="ch-ba" {...reveal(0)}>
            <div className="ch-ba__col ch-ba__col--before">
              <h3>{f(PROBLEM.before.title)}</h3>
              <ol>{PROBLEM.before.items.map((x, i) => <li key={i}><span aria-hidden="true">{i + 1}</span>{f(x)}</li>)}</ol>
            </div>
            <div className="ch-ba__arrow" aria-hidden="true"><Ic id="i-arrow" cls="ch-ba__ic" /></div>
            <div className="ch-ba__col ch-ba__col--after">
              <h3>{f(PROBLEM.after.title)}</h3>
              <ol>{PROBLEM.after.items.map((x, i) => <li key={i}><span aria-hidden="true">{i + 1}</span>{f(x)}</li>)}</ol>
            </div>
          </div>
        </Section>

        {/* 3. How it works: the 3D knowledge scene */}
        <Section no="02" label={fmt(HOW.label, lang)} id="how-title" title={fmt(HOW.title, lang)} alt sid="how">
          <KnowledgeScene lang={lang} />
        </Section>

        {/* 4. Interactive assistant */}
        <Section no="03" label={fmt(ASSISTANT.label, lang)} id="assistant-title" title={fmt(ASSISTANT.title, lang)} sid="assistant">
          <p className="sp-lead ch-lead" {...reveal(0)}>{f(ASSISTANT.lead)}</p>
          <ChatAssistant lang={lang} />
        </Section>

        {/* 5. Sources behind every answer */}
        <Section no="04" label={fmt(TRUST.label, lang)} id="trust-title" title={fmt(TRUST.title, lang)} alt sid="sources">
          <p className="sp-lead ch-lead" {...reveal(0)}>{f(TRUST.lead)}</p>
          <ul className="ch-points" {...reveal(1)}>
            {TRUST.points.map((p, i) => <li key={i}><Ic id="i-check" cls="ch-points__ic" />{f(p)}</li>)}
          </ul>
          <SourceExplorer lang={lang} />
        </Section>

        {/* 6. Key capabilities */}
        <Section no="05" label={fmt(CAPS_SECTION.label, lang)} id="caps-title" title={fmt(CAPS_SECTION.title, lang)}>
          <ul className="sp-grid cap-grid ch-caps">
            {CAPABILITIES.map((c, i) => (
              <li className="sp-card cap-card" key={i} {...reveal(i)}>
                <Ic id={c.icon} cls="cap-ic" />
                <h3 className="sp-card__title">{f(c.t)}</h3>
                <p>{f(c.d)}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Under the hood */}
        <Section no="06" label={fmt(TECH.label, lang)} id="tech-title" title={fmt(TECH.title, lang)} alt sid="architecture">
          <p className="sp-lead ch-lead" {...reveal(0)}>{f(TECH.lead)}</p>
          <ol className="ch-flow" {...reveal(1)}>
            {TECH.flow.map((s, i) => (
              <li key={i} className={i === 5 ? "ch-flow__q" : undefined}>
                <span className="ch-flow__n" aria-hidden="true">{i + 1}</span>
                <span>{f(s)}</span>
              </li>
            ))}
          </ol>
          <dl className="ch-gloss">
            {TECH.glossary.map((g, i) => (
              <div className="ch-gloss__i" key={g.k} {...reveal(i)}>
                <dt><bdi>{g.k}</bdi></dt>
                <dd>{f(g.d)}</dd>
              </div>
            ))}
          </dl>
          <p className="ch-callout" {...reveal(0)}><Ic id="i-backup" cls="ch-callout__ic" /><span>{f(TECH.note)}</span></p>
        </Section>

        {/* 7. Use cases */}
        <Section no="07" label={fmt(USES.label, lang)} id="uses-title" title={fmt(USES.title, lang)}>
          <ul className="sp-grid cap-grid ch-uses">
            {USES.items.map((u, i) => (
              <li className="sp-card cap-card" key={i} {...reveal(i)}>
                <Ic id={u.icon} cls="cap-ic" />
                <h3 className="sp-card__title">{f(u.t)}</h3>
                <ul className="ch-uses__list">{u.items.map((x, j) => <li key={j}>{f(x)}</li>)}</ul>
              </li>
            ))}
          </ul>
        </Section>

        {/* 8. Business benefits */}
        <Section no="08" label={fmt(BENEFITS.label, lang)} id="benefits-title" title={fmt(BENEFITS.title, lang)} alt>
          <ul className="cap-list ch-benefits">
            {BENEFITS.items.map((x, i) => (
              <li key={i} {...reveal(i)}>
                <svg className="cap-list__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#i-check" /></svg>
                <span>{f(x)}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 9. Security and governance */}
        <section className="section sp-section ch-sec" aria-labelledby="security-title">
          <div className="wrap ch-sec__grid">
            <div className="ch-sec__copy">
              <div className="section-head" data-reveal="">
                <p className="eyebrow"><span className="eyebrow__no">09</span>{f(SECURITY.label)}</p>
                <h2 id="security-title">{f(SECURITY.title)}</h2>
              </div>
              <p className="sp-lead ch-lead" {...reveal(0)}>{f(SECURITY.lead)}</p>
              <ul className="ch-sec__list">
                {SECURITY.items.map((s, i) => (
                  <li key={i} {...reveal(i)}>
                    <Ic id={s.icon} cls="ch-sec__ic" />
                    <div><h3>{f(s.t)}</h3><p>{f(s.d)}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ch-sec__art" aria-hidden="true">
              <img src={img("knowledge-core")} alt="" width={1599} height={900} loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        {/* 10. Final CTA */}
        <section className="sp-cta" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="sp-cta__inner">
              <div className="sp-cta__copy">
                <p className="sp-cta__eyebrow"><span className="sp-cta__mark" aria-hidden="true"></span><span>{ui.ctaEyebrow}</span></p>
                <h2 id="cta-title">{f(CTA.title)}</h2>
                <p className="sp-cta__text">{f(CTA.text)}</p>
                <div className="sp-actions sp-cta__actions">
                  <a className={BTN1} href={`${home}#contact`} data-prefill={plain(CTA.prefill, lang)}>{f(CTA.request)}</a>
                  <a className={`${BTN2} sp-cta__ghost`} href={`${home}#contact`}>{f(CTA.contact)}</a>
                </div>
              </div>
              <CtaWindow ui={ui} />
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}

