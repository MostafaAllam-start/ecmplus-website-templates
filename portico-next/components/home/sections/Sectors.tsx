import { srcSetWithBase, withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Sectors({ t, links }: SectionProps<"sectors">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="sectors" id="sectors" aria-labelledby="sectors-title">
      <div className="band on-photo">
        <div className="ph ph--bleed band__ph">
          <img srcSet={srcSetWithBase("/assets/photos/portico/p08-skyline-800.webp 800w, /assets/photos/portico/p08-skyline-1200.webp 1200w, /assets/photos/portico/p08-skyline-1600.webp 1600w")} sizes="100vw" src={withBase("/assets/photos/portico/p08-skyline-1600.webp")} width="1600" height="1067" alt="" loading="lazy" decoding="async" />
        </div>
        <div className="scrim" aria-hidden="true" />
        <div className="wrap band__copy" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">07</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-building" />
            </svg>
            {t.k01}
          </p>
          <h2 id="sectors-title">{t.k02}</h2>
          <p className="section-lead">{t.k03}</p>
        </div>
      </div>
      <div className="wrap sectors__wrap">
        <div className="sectors__scroller" role="region" aria-label={t.k04} tabIndex={0} data-reveal-group="">
          <ul className="sectors__list">
            <li className="sector" id="sector-government" data-reveal="">
              <h3 className="sector__title">{t.k05}</h3>
              <p className="sector__text">{t.k06}</p>
              <ul className="sector__mods" aria-label={t.k07}>
                <li>
                  <a href={links.href("correspondence/")}>
                    <bdi>CMS</bdi>
                  </a>
                </li>
                <li>
                  <a href={links.href("meetings/")}>
                    <bdi>MMS</bdi>
                  </a>
                </li>
              </ul>
            </li>
            <li className="sector" id="sector-finance" data-reveal="">
              <h3 className="sector__title">{t.k08}</h3>
              <p className="sector__text">{t.k09}</p>
              <ul className="sector__mods" aria-label={t.k10}>
                <li>
                  <a href={links.href("documents/")}>
                    <bdi>DMS</bdi>
                  </a>
                </li>
                <li>
                  <a href={links.href("processes/")}>
                    <bdi>BPM</bdi>
                  </a>
                </li>
              </ul>
            </li>
            <li className="sector" id="sector-healthcare" data-reveal="">
              <h3 className="sector__title">{t.k11}</h3>
              <p className="sector__text">{t.k12}</p>
              <ul className="sector__mods" aria-label={t.k13}>
                <li>
                  <a href={links.href("documents/")}>
                    <bdi>DMS</bdi>
                  </a>
                </li>
              </ul>
            </li>
            <li className="sector" id="sector-education" data-reveal="">
              <h3 className="sector__title">{t.k14}</h3>
              <p className="sector__text">{t.k15}</p>
              <ul className="sector__mods" aria-label={t.k16}>
                <li>
                  <a href={links.href("meetings/")}>
                    <bdi>MMS</bdi>
                  </a>
                </li>
                <li>
                  <a href={links.href("documents/")}>
                    <bdi>DMS</bdi>
                  </a>
                </li>
              </ul>
            </li>
            <li className="sector" id="sector-energy" data-reveal="">
              <h3 className="sector__title">{t.k17}</h3>
              <p className="sector__text">{R(t.k18)}</p>
              <ul className="sector__mods" aria-label={t.k19}>
                <li>
                  <a href={links.href("documents/")}>
                    <bdi>DMS</bdi>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
