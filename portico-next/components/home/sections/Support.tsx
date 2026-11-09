import { srcSetWithBase, withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Support({ t, links }: SectionProps<"support">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section support" id="support" aria-labelledby="support-title">
      <div className="wrap support__grid">
        <div className="ph ph--reveal support__ph">
          <img srcSet={srcSetWithBase("/assets/photos/portico/p09-support-800.webp 800w, /assets/photos/portico/p09-support-1200.webp 1200w, /assets/photos/portico/p09-support-1600.webp 1600w")} sizes="(min-width: 960px) 520px, 100vw" src={withBase("/assets/photos/portico/p09-support-800.webp")} width="1600" height="1067" alt="" loading="lazy" decoding="async" />
        </div>
        <div className="support__plate" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">09</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-ticket" />
            </svg>
            {t.k01}
          </p>
          <h2 id="support-title">{R(t.k02)}</h2>
          <p className="section-lead">{R(t.k03)}</p>
          <div className="status-strip">
            <p className="status-strip__label" id="ticket-status-label">{t.k04}</p>
            <ol className="status" aria-labelledby="ticket-status-label">
              <li>
                <span className="status__chip status__chip--open">{R(t.k05)}</span>
              </li>
              <li>
                <span className="status__chip status__chip--progress">{R(t.k06)}</span>
              </li>
              <li>
                <span className="status__chip status__chip--closed">{R(t.k07)}</span>
              </li>
            </ol>
          </div>
          <ul className="actions">
            <li className="action">
              <svg className="icon action__icon" aria-hidden="true" focusable="false">
                <use href="#i-ticket" />
              </svg>
              <h3>
                <a href={t.k08}>{t.k09}</a>
              </h3>
              <p>{R(t.k10)}</p>
              <svg className="icon action__arrow flip" aria-hidden="true" focusable="false">
                <use href="#i-arrow" />
              </svg>
            </li>
            <li className="action">
              <svg className="icon action__icon" aria-hidden="true" focusable="false">
                <use href="#i-track" />
              </svg>
              <h3>
                <a href={t.k11}>{t.k12}</a>
              </h3>
              <p>{t.k13}</p>
              <svg className="icon action__arrow flip" aria-hidden="true" focusable="false">
                <use href="#i-arrow" />
              </svg>
            </li>
            <li className="action">
              <svg className="icon action__icon" aria-hidden="true" focusable="false">
                <use href="#i-idea" />
              </svg>
              <h3>
                <a href={t.k14}>{t.k15}</a>
              </h3>
              <p>{t.k16}</p>
              <svg className="icon action__arrow flip" aria-hidden="true" focusable="false">
                <use href="#i-arrow" />
              </svg>
            </li>
          </ul>
          <div className="support__ctas">
            <a className="btn btn--ink btn--lg" href={t.k17}>{t.k18}</a>
          </div>
          <p className="support__note">{R(t.k19)}</p>
        </div>
      </div>
    </section>
  );
}
