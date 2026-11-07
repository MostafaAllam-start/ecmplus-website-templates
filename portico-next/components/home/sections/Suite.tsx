import { srcSetWithBase, withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Suite({ t, links }: SectionProps<"suite">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section suite" id="suite" aria-labelledby="suite-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">01</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-suite" />
            </svg>
            {t.k01}
          </p>
          <h2 id="suite-title">{t.k02}</h2>
          <p className="section-lead">{R(t.k03)}</p>
        </div>
        <ul className="cards">
          <li className="card" id="documents" data-reveal="">
            <p className="card__tab">
              <svg className="icon card__tab-icon" aria-hidden="true" focusable="false">
                <use href="#m-dms" />
              </svg>
              <bdi>DMS</bdi>
            </p>
            <div className="ph ph--reveal card__ph">
              <img srcSet={srcSetWithBase("/assets/photos/portico/p02-archive-800.webp 800w, /assets/photos/portico/p02-archive-1200.webp 1200w, /assets/photos/portico/p02-archive-1600.webp 1600w")} sizes="(min-width: 1180px) 300px, (min-width: 640px) 50vw, 100vw" src={withBase("/assets/photos/portico/p02-archive-800.webp")} width="1600" height="900" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="card__plate">
              <p className="card__verb">{R(t.k04)}</p>
              <h3 className="card__name">
                <a href={links.href("documents/")}>{t.k05}</a>
              </h3>
              <p className="card__line">{t.k06}</p>
              <ul className="card__caps">
                <li>
                  <a href={links.href("capture/")}>{R(t.k07)}</a>
                </li>
                <li>{t.k08}</li>
                <li>{t.k09}</li>
              </ul>
            </div>
          </li>
          <li className="card" id="correspondence" data-reveal="">
            <p className="card__tab">
              <svg className="icon card__tab-icon" aria-hidden="true" focusable="false">
                <use href="#m-cms" />
              </svg>
              <bdi>CMS</bdi>
            </p>
            <div className="ph ph--reveal card__ph">
              <img srcSet={srcSetWithBase("/assets/photos/portico/p03-correspondence-800.webp 800w, /assets/photos/portico/p03-correspondence-1200.webp 1200w, /assets/photos/portico/p03-correspondence-1600.webp 1600w")} sizes="(min-width: 1180px) 300px, (min-width: 640px) 50vw, 100vw" src={withBase("/assets/photos/portico/p03-correspondence-800.webp")} width="1600" height="1067" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="card__plate">
              <p className="card__verb">{R(t.k10)}</p>
              <h3 className="card__name">
                <a href={links.href("correspondence/")}>{t.k11}</a>
              </h3>
              <p className="card__line">{t.k12}</p>
              <ul className="card__caps">
                <li>{t.k13}</li>
                <li>{t.k14}</li>
                <li>{t.k15}</li>
              </ul>
            </div>
          </li>
          <li className="card" id="processes" data-reveal="">
            <p className="card__tab">
              <svg className="icon card__tab-icon" aria-hidden="true" focusable="false">
                <use href="#m-bpm" />
              </svg>
              <bdi>BPM</bdi>
            </p>
            <div className="ph ph--reveal card__ph card__ph--process">
              <img srcSet={srcSetWithBase("/assets/photos/portico/p04-process-800.webp 800w, /assets/photos/portico/p04-process-1200.webp 1200w, /assets/photos/portico/p04-process-1600.webp 1600w")} sizes="(min-width: 1180px) 300px, (min-width: 640px) 50vw, 100vw" src={withBase("/assets/photos/portico/p04-process-800.webp")} width="1600" height="1067" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="card__plate">
              <p className="card__verb">{R(t.k16)}</p>
              <h3 className="card__name">
                <a href={links.href("processes/")}>{t.k17}</a>
              </h3>
              <p className="card__line">{t.k18}</p>
              <ul className="card__caps">
                <li>{R(t.k19)}</li>
                <li>{t.k20}</li>
                <li>{t.k21}</li>
              </ul>
            </div>
          </li>
          <li className="card" id="meetings" data-reveal="">
            <p className="card__tab">
              <svg className="icon card__tab-icon" aria-hidden="true" focusable="false">
                <use href="#m-mms" />
              </svg>
              <bdi>MMS</bdi>
            </p>
            <div className="ph ph--reveal card__ph card__ph--boardroom">
              <img srcSet={srcSetWithBase("/assets/photos/portico/p05-boardroom-800.webp 800w, /assets/photos/portico/p05-boardroom-1200.webp 1200w, /assets/photos/portico/p05-boardroom-1600.webp 1600w")} sizes="(min-width: 1180px) 300px, (min-width: 640px) 50vw, 100vw" src={withBase("/assets/photos/portico/p05-boardroom-800.webp")} width="1600" height="1067" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="card__plate">
              <p className="card__verb">{R(t.k22)}</p>
              <h3 className="card__name">
                <a href={links.href("meetings/")}>{t.k23}</a>
              </h3>
              <p className="card__line">{t.k24}</p>
              <ul className="card__caps">
                <li>{t.k25}</li>
                <li>{t.k26}</li>
                <li>{t.k27}</li>
                <li>{t.k28}</li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
