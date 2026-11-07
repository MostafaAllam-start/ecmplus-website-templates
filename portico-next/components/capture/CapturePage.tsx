import type { CSSProperties, ReactNode } from "react";
import {
  BENEFITS, CAPS, CHANNELS, CTA, DEMO, DEPTS, HERO, factoryCopy, ICON_PATHS, INTEL, SECTION_COPY, fmt, plain,
  type CardDef, type IconSpec,
} from "@/data/capture";
import { homePath, pagePath, withBase, type Lang } from "@/lib/site";
import { rich } from "@/lib/rich";
import { CtaWindow, Section, uiFor } from "../ModulePage";
import Shell from "../shell/Shell";
import CaptureFactory from "./CaptureFactory";
import CaptureLab from "./CaptureLab";

const BTN1 = "btn btn--gold btn--lg";
const BTN2 = "btn btn--ghost-gold btn--lg";
const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as CSSProperties });

function Icon({ icon }: { icon: IconSpec }) {
  return icon.kind === "path" ? (
    <svg className="sp-glyph cap-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ICON_PATHS[icon.name] }} />
  ) : (
    <svg className="sp-glyph cap-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`#${icon.id}`} /></svg>
  );
}

function Tag({ kind, lang }: { kind: "demo" | "potential"; lang: Lang }) {
  const s = plain(kind === "demo" ? DEMO.tagDemo : DEMO.tagPotential, lang);
  return <span className={`cap-tag cap-tag--${kind}`} title={s}>{s}</span>;
}

function Grid({ items, lang }: { items: CardDef[]; lang: Lang }) {
  return (
    <ul className="sp-grid cap-grid">
      {items.map((c, i) => (
        <li className="sp-card cap-card" key={i} {...reveal(i)}>
          <Icon icon={c.icon} />
          <h3 className="sp-card__title">{rich(fmt(c.title, lang))}</h3>
          <p>{rich(fmt(c.text, lang))}</p>
          {c.side ? (
            <p className="cap-side">{c.side.kind === "potential" ? null : <Tag kind={c.side.kind} lang={lang} />}<span>{rich(fmt(c.side.text, lang))}</span></p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** The Document Capture page (Portico). Section 03 is the interactive <CaptureLab>. */
export default function CapturePage({ lang }: { lang: Lang }) {
  const ui = uiFor(lang);
  const home = withBase(homePath(lang));
  const docs = withBase(pagePath(lang, "documents"));
  const f = (s: Parameters<typeof fmt>[0]) => rich(fmt(s, lang));
  const ctaTitle = fmt(CTA.title, lang);

  return (
    <Shell lang={lang} current="capture">
      <main id="main" className="sp sp--capture">
        <section className="sp-hero" aria-labelledby="page-title">
          <div className="wrap sp-hero__grid">
            <div className="sp-hero__copy">
              <nav className="sp-crumbs" aria-label={ui.crumbsLabel}>
                <ol><li><a href={home}>{ui.home}</a></li><li><a href={docs}>{f(HERO.crumbDocs)}</a></li><li aria-current="page">{f(HERO.eyebrow)}</li></ol>
              </nav>
              <p className="sp-eyebrow">
                <svg className="sp-glyph cap-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-ocr" /></svg>
                <span><bdi>DMS</bdi> · {f(HERO.eyebrow)}</span>
              </p>
              <h1 id="page-title">{f(HERO.title)}</h1>
              <p className="sp-lead">{f(HERO.lead)}</p>
              <div className="sp-actions">
                <a className={BTN1} href="#demo">{f(HERO.explore)}</a>
                <a className={BTN2} href={`${home}#contact`}>{ui.demo}</a>
              </div>
            </div>
            <div className="sp-hero__visual cap-art" aria-hidden="true">
              <span className="cap-mini cap-mini--1"><i></i><i></i><i></i><i></i></span>
              <span className="cap-mini cap-mini--2"><i></i><i></i><i></i><i></i></span>
              <span className="cap-mini cap-mini--3"><i></i><i></i><i></i><i></i></span>
              <span className="cap-art__line"></span>
              <span className="cap-art__chip"><bdi>DOC-2026-00418</bdi> · {f(HERO.archived)}</span>
            </div>
          </div>
        </section>

        <Section no="01" label={fmt(SECTION_COPY.channels.label, lang)} id="channels-title" title={fmt(SECTION_COPY.channels.title, lang)}>
          <Grid items={CHANNELS} lang={lang} />
        </Section>
        <Section no="02" label={fmt(SECTION_COPY.intel.label, lang)} id="intel-title" title={fmt(SECTION_COPY.intel.title, lang)} alt>
          <Grid items={INTEL} lang={lang} />
        </Section>
        <Section no="03" label={fmt(DEMO.label, lang)} id="demo-title" title={fmt(DEMO.sectionTitle, lang)} sid="demo">
          <CaptureLab lang={lang}>
            <CaptureFactory lang={lang} copy={factoryCopy(lang)} />
          </CaptureLab>
        </Section>
        <Section no="04" label={fmt(SECTION_COPY.benefits.label, lang)} id="benefits-title" title={fmt(SECTION_COPY.benefits.title, lang)} alt>
          <Grid items={BENEFITS} lang={lang} />
        </Section>
        <Section no="05" label={fmt(SECTION_COPY.adv.label, lang)} id="adv-title" title={fmt(SECTION_COPY.adv.title, lang)}>
          <ul className="cap-list">
            {CAPS.map((c, i) => (
              <li key={i} {...reveal(i)}>
                <svg className="cap-list__mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#i-check" /></svg>
                <span>{f(c.text)}</span>
                {c.tag ? <Tag kind={c.tag} lang={lang} /> : null}
              </li>
            ))}
          </ul>
        </Section>
        <Section no="06" label={fmt(SECTION_COPY.dept.label, lang)} id="dept-title" title={fmt(SECTION_COPY.dept.title, lang)} alt>
          <Grid items={DEPTS} lang={lang} />
        </Section>

        <section className="sp-cta" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="sp-cta__inner">
              <div className="sp-cta__copy">
                <p className="sp-cta__eyebrow"><span className="sp-cta__mark" aria-hidden="true"></span><span>{ui.ctaEyebrow}</span></p>
                <h2 id="cta-title">{rich(ctaTitle)}</h2>
                <p className="sp-cta__text">{f(CTA.text)}</p>
                <div className="sp-actions sp-cta__actions">
                  <a className={BTN1} href={`${home}#contact`}>{f(CTA.request)}</a>
                  <a className={`${BTN2} sp-cta__ghost`} href={`${home}#contact`} data-prefill={plain(CTA.prefill, lang)}>{f(CTA.contact)}</a>
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
