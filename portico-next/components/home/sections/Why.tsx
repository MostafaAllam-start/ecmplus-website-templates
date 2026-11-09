import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Why({ t, links }: SectionProps<"why">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section why" id="why" aria-labelledby="why-title">
      <div className="wrap why__grid">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">02</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-portico" />
            </svg>
            {R(t.k01)}
          </p>
          <h2 id="why-title">{R(t.k02)}</h2>
          <p className="section-lead">{R(t.k03)}</p>
        </div>
        <ul className="pillars">
          <li className="pillar" data-reveal="">
            <span className="pillar__icon" aria-hidden="true">
              <svg className="icon" focusable="false">
                <use href="#i-ocr" />
              </svg>
            </span>
            <h3 className="pillar__title">{R(t.k04)}</h3>
            <p className="pillar__text">{R(t.k05)}</p>
            <p className="pillar__fact">{t.k06}</p>
          </li>
          <li className="pillar" data-reveal="">
            <span className="pillar__icon" aria-hidden="true">
              <svg className="icon" focusable="false">
                <use href="#i-spark" />
              </svg>
            </span>
            <h3 className="pillar__title">{t.k07}</h3>
            <p className="pillar__text">{R(t.k08)}</p>
            <p className="pillar__fact">{R(t.k09)}</p>
          </li>
          <li className="pillar" data-reveal="">
            <span className="pillar__icon" aria-hidden="true">
              <svg className="icon" focusable="false">
                <use href="#i-trace" />
              </svg>
            </span>
            <h3 className="pillar__title">{t.k10}</h3>
            <p className="pillar__text">{t.k11}</p>
            <p className="pillar__fact">{t.k12}</p>
          </li>
          <li className="pillar" data-reveal="">
            <span className="pillar__icon" aria-hidden="true">
              <svg className="icon" focusable="false">
                <use href="#i-link" />
              </svg>
            </span>
            <h3 className="pillar__title">{t.k13}</h3>
            <p className="pillar__text">{R(t.k14)}</p>
            <p className="pillar__fact">{R(t.k15)}</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
