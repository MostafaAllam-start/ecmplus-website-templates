import type { CSSProperties, ReactNode } from "react";
import ReactDOM from "react-dom";
import { GLYPHS, MODULES, PAGES, PORTICO_NAMES, PORTICO_UI, SERVICES, UI, WORKS, type PageCopy, type UiStrings } from "@/data/content";
import { MIRROR_IN_RTL, STEP_ART } from "@/data/steps-art";
import { rich, strip } from "@/lib/rich";
import { absUrl, homePath, pagePath, withBase, type Lang } from "@/lib/site";
import Shell from "./shell/Shell";

/** Slugs rendered by ModulePage (capture is its own page). */
export const MODULE_SLUGS = [...MODULES, "about"] as const;

const HERO_SIZES = "(min-width: 1180px) 560px, (min-width: 900px) 46vw, 100vw";
const PHOTO_HEIGHT: Record<string, number> = {
  "p02-archive": 900,
  "p03-correspondence": 1067,
  "p04-process": 1067,
  "p05-boardroom": 1067,
  "p07-headquarters": 973,
};

// Portico: gold primary button, ghost-gold secondary, photographic heroes, integration cards.
const BTN1 = "btn btn--gold btn--lg";
const BTN2 = "btn btn--ghost-gold btn--lg";

/** A page's copy with Portico's own module names. */
export const copyFor = (slug: string, lang: Lang): PageCopy => ({ ...PAGES[slug][lang], ...PORTICO_NAMES[lang]?.[slug] });
export const uiFor = (lang: Lang): UiStrings => ({ ...UI[lang], ...PORTICO_UI[lang] });

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as CSSProperties });
const html = (h: string) => ({ __html: h });
const name = (s: { name: string | { en: string; ar: string } }, lang: Lang) => (typeof s.name === "string" ? s.name : s.name[lang]);
const label = (n: string, lang: Lang) => (lang === "ar" && /^[\x00-\x7F+]+$/.test(n) ? <bdi>{n}</bdi> : n);

function Glyph({ slug, cls = "sp-glyph" }: { slug: string; cls?: string }) {
  // Portico draws the BPM module with the ECM+ app's own one-colour icon (the m-bpm sprite symbol).
  if (slug === "processes") {
    return <svg className={cls} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#m-bpm" /></svg>;
  }
  return <svg className={cls} viewBox="0 0 24 24" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={html(GLYPHS[slug])} />;
}

export function Section({
  no, label: lab, id, title, alt, mod, sid, children,
}: { no: string; label: string; id: string; title: string; alt?: boolean; mod?: string; sid?: string; children: ReactNode }) {
  return (
    <section id={sid} className={`section sp-section${alt ? " sp-section--alt" : ""}${mod ? ` sp-section--${mod}` : ""}`} aria-labelledby={id}>
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow"><span className="eyebrow__no">{no}</span>{rich(lab)}</p>
          <h2 id={id}>{rich(title)}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export function CtaWindow({ ui }: { ui: UiStrings }) {
  const nav = ui.ctaNav ?? ui.ctaApp.nav;
  return (
    <div className="sp-cta__app" aria-hidden="true">
      <div className="sp-cta__win">
        <div className="sp-cta__bar">
          <span className="sp-cta__dots"><span></span><span></span><span></span></span>
          <bdi className="sp-cta__brand">ECM+</bdi>
        </div>
        <div className="sp-cta__body">
          <ul className="sp-cta__nav">
            {nav.map((n, i) => <li key={n} className={i === 0 ? "is-on" : undefined}>{n}</li>)}
          </ul>
          <div className="sp-cta__main">
            <div className="sp-cta__tiles"><span></span><span></span><span></span></div>
            <ul className="sp-cta__rows">
              {ui.ctaApp.rows.map(([title, status, tone]) => (
                <li key={title}>
                  <svg className="sp-cta__file" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v5h5" /></svg>
                  <span className="sp-cta__row-title">{title}</span>
                  <span className={`sp-cta__chip${tone ? ` sp-cta__chip--${tone}` : ""}`}>{status}</span>
                </li>
              ))}
            </ul>
            <div className="sp-cta__stepper"><span className="is-done"></span><span className="is-done"></span><span className="is-now"></span><span></span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaptureLink({ lang }: { lang: Lang }) {
  const href = withBase(pagePath(lang, "capture"));
  return lang === "en" ? (
    <p>New: <a href={href}>Document Capture</a> shows how paper, files and email become indexed, searchable documents.</p>
  ) : (
    <p>جديد: تعرضُ صفحة <a href={href}>التقاط الوثائق</a> كيف تتحول الورقيات والملفات والرسائل إلى وثائق مفهرسة وقابلة للبحث.</p>
  );
}

/** JSON-LD for the breadcrumb trail (Home > Suite > page, or Home > page for About). */
export function breadcrumbJsonLd(lang: Lang, slug: string) {
  const c = copyFor(slug, lang);
  const home = absUrl(lang);
  const crumbs: [string, string][] =
    slug === "about"
      ? [[UI[lang].home, home], [strip(c.short), absUrl(lang, slug)]]
      : [[UI[lang].home, home], [UI[lang].suite, `${home}#suite`], [strip(c.short), absUrl(lang, slug)]];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: u })),
  };
}

export default function ModulePage({ lang, slug }: { lang: Lang; slug: string }) {
  const ui = uiFor(lang);
  const page = PAGES[slug];
  const c = copyFor(slug, lang);
  const home = withBase(homePath(lang));
  const sib = (s: string) => withBase(pagePath(lang, s));
  const asset = (p: string) => withBase(`/assets/${p}`);
  const isAbout = slug === "about";

  // The hero photograph is the largest paint: fetch it first, with the same candidates as the <img>.
  const photo = page.photo as string;
  const photoSrc = (w: number) => asset(`photos/portico/${photo}-${w}.webp`);
  const photoSet = [800, 1200, 1600].map((w) => `${photoSrc(w)} ${w}w`).join(", ");
  ReactDOM.preload(photoSrc(1200), { as: "image", imageSrcSet: photoSet, imageSizes: HERO_SIZES, fetchPriority: "high", type: "image/webp" });

  const ld = JSON.stringify(breadcrumbJsonLd(lang, slug)).replace(/</g, "\\u003c");

  const crumbs = isAbout ? (
    <>
      <li><a href={home}>{ui.home}</a></li>
      <li aria-current="page">{rich(c.short)}</li>
    </>
  ) : (
    <>
      <li><a href={home}>{ui.home}</a></li>
      <li><a href={`${home}#suite`}>{ui.suite}</a></li>
      <li aria-current="page">{rich(c.short)}</li>
    </>
  );

  const eyebrow = isAbout ? (
    <p className="sp-eyebrow"><span>{rich(c.eyebrow as string)}</span></p>
  ) : (
    <p className="sp-eyebrow"><Glyph slug={slug} /><span><bdi>{page.code}</bdi> · {rich(c.name as string)}</span></p>
  );

  const hero = (
    <section className="sp-hero" aria-labelledby="page-title">
      <div className="wrap sp-hero__grid">
        <div className="sp-hero__copy">
          <nav className="sp-crumbs" aria-label={ui.crumbsLabel}><ol>{crumbs}</ol></nav>
          {eyebrow}
          <h1 id="page-title">{rich(c.h1)}</h1>
          <p className="sp-lead">{rich(c.lead)}</p>
          <div className="sp-actions">
            <a className={BTN1} href={`${home}#contact`}>{ui.demo}</a>
            <a className={BTN2} href={`${home}#suite`}>{ui.explore}</a>
          </div>
        </div>
        <figure className="sp-hero__visual sp-photo">
          <img
            src={photoSrc(1200)}
            srcSet={photoSet}
            sizes={HERO_SIZES}
            width={1600}
            height={PHOTO_HEIGHT[photo]}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  );

  const prose = (paras: ReactNode[]) => (
    <div className="sp-prose">{paras.map((p, i) => (typeof p === "string" ? <p key={i}>{rich(p)}</p> : p))}</div>
  );
  const grid = (items: [string, string][]) => (
    <ul className="sp-grid">
      {items.map(([h, p], i) => (
        <li className="sp-card" key={h} {...reveal(i)}><h3 className="sp-card__title">{rich(h)}</h3><p>{rich(p)}</p></li>
      ))}
    </ul>
  );
  const steps = (items: [string, string][]) => (
    <ol className="sp-steps">
      {items.map(([h, p], i) => (
        <li className="sp-step" key={h} {...reveal(i)}>
          <div className="sp-step__art">
            <svg
              className={`sp-step__svg${MIRROR_IN_RTL[slug]?.includes(i) ? " sp-step__svg--m" : ""}`}
              viewBox="0 0 120 80"
              aria-hidden="true"
              focusable="false"
              dangerouslySetInnerHTML={html(STEP_ART[slug][i])}
            />
            {i === items.length - 1 ? null : (
              <span className="sp-step__next" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h15M13 6l6 6-6 6" /></svg></span>
            )}
          </div>
          <span className="sp-step__no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="sp-step__title">{rich(h)}</h3>
          <p>{rich(p)}</p>
        </li>
      ))}
    </ol>
  );
  // Integration cards: a logo on a white plate, the service name and what it does here.
  const cards = (keys: string[]) => (
    <ul className="sp-works">
      {keys.map((k, i) => {
        const s = SERVICES[k];
        let mark: ReactNode = null;
        if (s.ecm) {
          mark = <img className="sp-work__wide" src={asset("brand/ecmplus-ai-logo-272.webp")} alt="" width={545} height={302} loading="lazy" decoding="async" />;
        } else if (s.logo) {
          mark = <img className={s.wide ? "sp-work__wide" : undefined} src={asset(s.logo)} alt="" width={s.wide ? 604 : 24} height={s.wide ? 331 : 24} loading="lazy" decoding="async" />;
        } else if (s.glyph) {
          mark = <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={html(s.glyph)} />;
        }
        return (
          <li className="sp-work" key={k} {...reveal(i)}>
            <span className="sp-work__mark" aria-hidden="true">{mark}</span>
            <h3 className="sp-work__name">{label(name(s, lang), lang)}</h3>
            <p className="sp-work__text">{rich(WORKS[slug][lang][k])}</p>
          </li>
        );
      })}
    </ul>
  );
  const related = (keys: string[]) => (
    <ul className="sp-related">
      {keys.map((k, i) => {
        const m = copyFor(k, lang);
        return (
          <li key={k} {...reveal(i)}>
            <a className="sp-related__link" href={sib(k)}>
              <Glyph slug={k} cls="sp-glyph sp-related__icon" />
              <span className="sp-related__code"><bdi>{PAGES[k].code}</bdi></span>
              <span className="sp-related__name">{rich(m.name as string)}</span>
              <span className="sp-related__line">{rich(m.line as string)}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );

  let sections: ReactNode;
  if (isAbout) {
    sections = (
      <>
        <Section no="01" label={c.whoLabel!} id="who-title" title={c.whoTitle!}>{prose(c.who!)}</Section>
        <Section no="02" label={c.suiteLabel!} id="suite-title" title={c.suiteTitle!} alt>{related([...MODULES])}</Section>
        <Section no="03" label={c.valuesLabel!} id="values-title" title={c.valuesTitle!}>{grid(c.values!)}</Section>
        <Section no="04" label={c.partnerLabel!} id="partner-title" title={c.partnerTitle!} alt>
          <div className="sp-partner" {...reveal(0)}>
            <img className="sp-partner__logo" src={asset("brand/ctc-logo.webp")} alt="CTC MENA" width={200} height={200} loading="lazy" />
            <p>{rich(c.partner!)}</p>
          </div>
        </Section>
        <Section no="05" label={c.supportLabel!} id="support-title" title={c.supportTitle!}>
          <div className="sp-support">
            <p className="sp-text">{rich(c.support!)}</p>
            <ul className="sp-links">
              {c.supportLinks!.map(([href, text]) => <li key={href}><a href={href}>{rich(text)}</a></li>)}
            </ul>
          </div>
        </Section>
      </>
    );
  } else {
    const overview: ReactNode[] = [...c.overview!];
    if (slug === "documents") overview.push(<CaptureLink key="capture" lang={lang} />);
    sections = (
      <>
        <Section no="01" label={ui.overview} id="overview-title" title={c.overviewTitle!}>{prose(overview)}</Section>
        <Section no="02" label={ui.capabilities} id="capabilities-title" title={ui.capabilitiesTitle} alt>{grid(c.capabilities!)}</Section>
        <Section no="03" label={ui.how} id="how-title" title={c.howTitle!}>{steps(c.steps!)}</Section>
        <Section no="04" label={ui.worksWith} id="works-title" title={ui.worksWithTitle} alt mod="works">{cards(page.services!)}</Section>
        <Section no="05" label={ui.related} id="related-title" title={ui.relatedTitle}>{related(MODULES.filter((m) => m !== slug))}</Section>
      </>
    );
  }

  const ctaSecond = isAbout ? (
    <a className={`${BTN2} sp-cta__ghost`} href={`/support${lang === "ar" ? "?lang=ar" : ""}`}>{ui.supportCentre}</a>
  ) : (
    <a className={`${BTN2} sp-cta__ghost`} href={`${home}#suite`}>{ui.explore}</a>
  );

  return (
    <Shell lang={lang} current={slug}>
      <script type="application/ld+json" dangerouslySetInnerHTML={html(ld)} />
      <main id="main" className={`sp sp--${slug}`}>
        {hero}
        {sections}
        <section className="sp-cta" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="sp-cta__inner">
              <div className="sp-cta__copy">
                <p className="sp-cta__eyebrow"><span className="sp-cta__mark" aria-hidden="true"></span><span>{ui.ctaEyebrow}</span></p>
                <h2 id="cta-title">{rich(ui.ctaTitle)}</h2>
                <p className="sp-cta__text">{ui.ctaText}</p>
                <div className="sp-actions sp-cta__actions">
                  <a className={BTN1} href={`${home}#contact`}>{ui.demo}</a>
                  {ctaSecond}
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


