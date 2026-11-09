import { srcSetWithBase, withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Hero({ t, links }: SectionProps<"hero">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="hero on-photo" aria-labelledby="hero-title">
      <div className="ph ph--bleed hero__ph">
        <img srcSet={srcSetWithBase("/assets/photos/portico/p01-suite-800.webp 800w, /assets/photos/portico/p01-suite-1200.webp 1200w, /assets/photos/portico/p01-suite-1600.webp 1600w")} sizes="100vw" src={withBase("/assets/photos/portico/p01-suite-1600.webp")} width="1600" height="900" alt="" decoding="async" fetchPriority="high" />
      </div>
      <div className="scrim" aria-hidden="true" />
      <div className="hero__visual" aria-hidden="true">
        <div className="hero__net">
          <svg className="seal-net" viewBox="-200 -150 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <defs>
              <pattern id="seal-dots" width="14" height="14" x="-7" y="-7" patternUnits="userSpaceOnUse">
                <circle cx="7" cy="7" r=".8" />
              </pattern>
              <radialGradient id="seal-fade" r=".6">
                <stop offset="0" stopColor="#fff" />
                <stop offset=".6" stopColor="#fff" stopOpacity=".5" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="seal-mask">
                <rect x="-200" y="-150" width="400" height="300" fill="url(#seal-fade)" />
              </mask>
            </defs>
            <g mask="url(#seal-mask)">
              <rect className="seal-net__dots" x="-200" y="-150" width="400" height="300" fill="url(#seal-dots)" />
              <path className="seal-net__mesh" d="M72.1 -29.8L29.8 -72.1M29.8 -72.1L-29.8 -72.1M-29.8 -72.1L-72.1 -29.8M-72.1 -29.8L-72.1 29.8M-72.1 29.8L-29.8 72.1M-29.8 72.1L29.8 72.1M29.8 72.1L72.1 29.8M72.1 29.8L72.1 -29.8M72.1 -29.8L109.1 -63M29.8 -72.1L63 -109.1M-29.8 -72.1L-63 -109.1M-72.1 -29.8L-109.1 -63M-72.1 29.8L-109.1 63M-29.8 72.1L-63 109.1M29.8 72.1L63 109.1M72.1 29.8L109.1 63M126 0L171.9 -46.1M126 0L171.9 46.1M109.1 -63L171.9 -46.1M109.1 -63L125.9 -125.9M63 -109.1L125.9 -125.9M63 -109.1L46.1 -171.9M0 -126L46.1 -171.9M0 -126L-46.1 -171.9M-63 -109.1L-46.1 -171.9M-63 -109.1L-125.9 -125.9M-109.1 -63L-125.9 -125.9M-109.1 -63L-171.9 -46.1M-126 0L-171.9 -46.1M-126 0L-171.9 46.1M-109.1 63L-171.9 46.1M-109.1 63L-125.9 125.9M-63 109.1L-125.9 125.9M-63 109.1L-46.1 171.9M0 126L-46.1 171.9M0 126L46.1 171.9M63 109.1L46.1 171.9M63 109.1L125.9 125.9M109.1 63L125.9 125.9M109.1 63L171.9 46.1" />
              <path className="seal-net__traces" d="M55 55L92 92H200M-55 55L-92 92H-200M55 -55L92 -92H200M-55 -55L-92 -92H-200" />
              <g className="seal-net__nodes">
                <circle className="n n--live" cx="72.1" cy="-29.8" r="2.6" />
                <circle className="n" cx="29.8" cy="-72.1" r="2.6" />
                <circle className="n" cx="-29.8" cy="-72.1" r="2.6" />
                <circle className="n n--live" cx="-72.1" cy="-29.8" r="2.6" />
                <circle className="n" cx="-72.1" cy="29.8" r="2.6" />
                <circle className="n" cx="-29.8" cy="72.1" r="2.6" />
                <circle className="n n--live" cx="29.8" cy="72.1" r="2.6" />
                <circle className="n" cx="72.1" cy="29.8" r="2.6" />
                <circle className="n" cx="126" cy="0" r="2" />
                <circle className="n n--live" cx="109.1" cy="-63" r="2" />
                <circle className="n" cx="63" cy="-109.1" r="2" />
                <circle className="n" cx="0" cy="-126" r="2" />
                <circle className="n" cx="-63" cy="-109.1" r="2" />
                <circle className="n n--live" cx="-109.1" cy="-63" r="2" />
                <circle className="n" cx="-126" cy="0" r="2" />
                <circle className="n" cx="-109.1" cy="63" r="2" />
                <circle className="n" cx="-63" cy="109.1" r="2" />
                <circle className="n n--live" cx="0" cy="126" r="2" />
                <circle className="n" cx="63" cy="109.1" r="2" />
                <circle className="n" cx="109.1" cy="63" r="2" />
                <circle className="pad" cx="150" cy="92" r="3" />
                <circle className="pad" cx="-150" cy="92" r="3" />
                <circle className="pad" cx="150" cy="-92" r="3" />
                <circle className="pad" cx="-150" cy="-92" r="3" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div className="wrap hero__grid">
        <div className="hero__copy hero__plate">
          <span className="brand ecmlogo ecmlogo--on-dark hero__logo" role="img" aria-label="ECM+ Business Suite, AI Powered" data-reveal="">
            <img className="ecmlogo__img ecmlogo__img--light" src={withBase("/assets/brand/ecmplus-ai-logo-272.webp")} srcSet={srcSetWithBase("/assets/brand/ecmplus-ai-logo-272.webp 272w, /assets/brand/ecmplus-ai-logo-545.webp 545w")} sizes="166px" width="545" height="302" alt="" loading="lazy" />
            <img className="ecmlogo__img ecmlogo__img--dark" src={withBase("/assets/brand/ecmplus-ai-logo-dark-272.webp")} srcSet={srcSetWithBase("/assets/brand/ecmplus-ai-logo-dark-272.webp 272w, /assets/brand/ecmplus-ai-logo-dark-545.webp 545w")} sizes="166px" width="545" height="302" alt="" />
          </span>
          <h1 id="hero-title" data-reveal="">{t.k01}</h1>
          <p className="hero__lead" data-reveal="">{R(t.k02)}</p>
          <div className="hero__ctas" data-reveal="">
            <a className="btn btn--gold btn--lg" href="#contact">{t.k03}</a>
            {" "}
            <a className="btn btn--ghost-light btn--lg" href="#suite">{t.k04}</a>
          </div>
          <ol className="hero__path" aria-label={t.k05} data-reveal="">
            <li>
              <a href={links.href("documents/")}>
                <span className="hero__node">
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#m-dms" />
                  </svg>
                </span>
                {t.k06}
              </a>
            </li>
            <li>
              <a href={links.href("correspondence/")}>
                <span className="hero__node">
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#m-cms" />
                  </svg>
                </span>
                {t.k07}
              </a>
            </li>
            <li>
              <a href={links.href("processes/")}>
                <span className="hero__node">
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#m-bpm" />
                  </svg>
                </span>
                {t.k08}
              </a>
            </li>
            <li>
              <a href={links.href("meetings/")}>
                <span className="hero__node">
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#m-mms" />
                  </svg>
                </span>
                {t.k09}
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
