import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Start({ t, links }: SectionProps<"start">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section start" id="start" aria-labelledby="start-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">08</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-path" />
            </svg>
            {t.k01}
          </p>
          <h2 id="start-title">{t.k02}</h2>
          <p className="section-lead">{R(t.k03)}</p>
        </div>
        <ol className="route">
          <li className="route__step" data-reveal="">
            <span className="route__no" aria-hidden="true">01</span>
            <h3 className="route__title">{t.k04}</h3>
            <p className="route__text">{t.k05}</p>
          </li>
          <li className="route__step" data-reveal="">
            <span className="route__no" aria-hidden="true">02</span>
            <h3 className="route__title">{t.k06}</h3>
            <p className="route__text">{t.k07}</p>
          </li>
          <li className="route__step" data-reveal="">
            <span className="route__no" aria-hidden="true">03</span>
            <h3 className="route__title">{t.k08}</h3>
            <p className="route__text">{t.k09}</p>
          </li>
          <li className="route__step" data-reveal="">
            <span className="route__no" aria-hidden="true">04</span>
            <h3 className="route__title">{t.k10}</h3>
            <p className="route__text">{R(t.k11)}</p>
          </li>
          <li className="route__step" data-reveal="">
            <span className="route__no" aria-hidden="true">05</span>
            <h3 className="route__title">{t.k12}</h3>
            <p className="route__text">{R(t.k13)}</p>
          </li>
        </ol>
        <div className="route__next" data-reveal="">
          <p className="route__ask">{t.k14}</p>
          <p className="route__ask-l">{t.k15}</p>
          <a className="btn btn--gold" href="#contact" data-prefill={t.k16}>{t.k17}</a>
        </div>
      </div>
    </section>
  );
}
