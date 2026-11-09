import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Ai({ t, links }: SectionProps<"ai">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section ai" id="ai" aria-labelledby="ai-title">
      <div className="wrap ai__grid">
        <div className="ai__copy">
          <div className="section-head" data-reveal="">
            <p className="eyebrow">
              <span className="eyebrow__no">03</span>
              <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
                <use href="#i-spark" />
              </svg>
              {R(t.k01)}
            </p>
            <h2 id="ai-title">{t.k02}</h2>
            <p className="section-lead">{t.k03}</p>
          </div>
          <ul className="ai__checks" data-reveal="">
            <li>
              <svg className="icon ai__check" aria-hidden="true" focusable="false">
                <use href="#i-check" />
              </svg>
              {t.k04}
            </li>
            <li>
              <svg className="icon ai__check" aria-hidden="true" focusable="false">
                <use href="#i-check" />
              </svg>
              {t.k05}
            </li>
          </ul>
        </div>
        <div className="aimock" aria-hidden="true" data-reveal="">
          <p className="aimock__bar">
            <svg className="icon" focusable="false">
              <use href="#i-spark" />
            </svg>
            {t.k06}
          </p>
          <div className="aimock__query">
            <svg className="icon" focusable="false">
              <use href="#i-search" />
            </svg>
            <span className="aimock__q">{t.k07}</span>
            <span className="aimock__go">
              <svg className="icon flip" focusable="false">
                <use href="#i-arrow" />
              </svg>
            </span>
          </div>
          <div className="aimock__hit">
            <span className="aimock__tag">
              <svg className="icon" focusable="false">
                <use href="#i-spark" />
              </svg>
              {t.k08}
            </span>
            <p className="aimock__title">{t.k09}</p>
            <p className="aimock__snip">{R(t.k10)}</p>
          </div>
          <div className="aimock__ocr">
            <svg className="icon aimock__ocr-icon" focusable="false">
              <use href="#i-ocr" />
            </svg>
            <p className="aimock__ocr-h">{t.k11}</p>
            <p className="aimock__ocr-l">{t.k12}</p>
            <p className="aimock__chips">
              <span>{t.k13}</span>
              <span>{t.k14}</span>
              <span>{t.k15}</span>
              <span>{t.k16}</span>
            </p>
          </div>
        </div>
        <ul className="ai__caps">
          <li className="ai__cap" data-reveal="">
            <svg className="icon ai__cap-icon" aria-hidden="true" focusable="false">
              <use href="#i-search" />
            </svg>
            <h3>{t.k17}</h3>
            <p>{t.k18}</p>
          </li>
          <li className="ai__cap" data-reveal="">
            <svg className="icon ai__cap-icon" aria-hidden="true" focusable="false">
              <use href="#i-tag" />
            </svg>
            <h3>{t.k19}</h3>
            <p>{t.k20}</p>
          </li>
          <li className="ai__cap" data-reveal="">
            <svg className="icon ai__cap-icon" aria-hidden="true" focusable="false">
              <use href="#i-ocr" />
            </svg>
            <h3>{t.k21}</h3>
            <p>{t.k22}</p>
          </li>
          <li className="ai__cap" data-reveal="">
            <svg className="icon ai__cap-icon" aria-hidden="true" focusable="false">
              <use href="#i-wave" />
            </svg>
            <h3>{t.k23}</h3>
            <p>{t.k24}</p>
          </li>
        </ul>
      </div>
    </section>
  );
}
