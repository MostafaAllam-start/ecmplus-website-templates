import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Lifecycle({ t, links }: SectionProps<"lifecycle">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section lifecycle" id="lifecycle" aria-labelledby="lifecycle-title">
      <div className="wrap lifecycle__grid">
        <div className="section-head lifecycle__head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">04</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-flow" />
            </svg>
            {t.k01}
          </p>
          <h2 id="lifecycle-title">{t.k02}</h2>
          <p className="section-lead">{R(t.k03)}</p>
        </div>
        <div className="lifecycle__plate" data-reveal="">
          <div className="ledger">
            <div className="ledger__track" aria-hidden="true">
              <div className="ledger__slot">
                <span className="bookmark" />
              </div>
            </div>
            <ol className="ledger__rows">
              <li className="ledger__row" id="stage-capture">
                <span className="ledger__no" aria-hidden="true">01</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k04}</h3>
                  <p className="ledger__entry">{R(t.k05)}</p>
                  <ul className="ledger__mods" aria-label={t.k06}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-dms" />
                      </svg>
                      {R(t.k07)}
                    </li>
                  </ul>
                </div>
              </li>
              <li className="ledger__row" id="stage-register">
                <span className="ledger__no" aria-hidden="true">02</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k08}</h3>
                  <p className="ledger__entry">{t.k09}</p>
                  <ul className="ledger__mods" aria-label={t.k10}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-cms" />
                      </svg>
                      {R(t.k11)}
                    </li>
                  </ul>
                </div>
              </li>
              <li className="ledger__row" id="stage-route">
                <span className="ledger__no" aria-hidden="true">03</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k12}</h3>
                  <p className="ledger__entry">{t.k13}</p>
                  <ul className="ledger__mods" aria-label={t.k14}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-cms" />
                      </svg>
                      {R(t.k15)}
                    </li>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-bpm" />
                      </svg>
                      {R(t.k16)}
                    </li>
                  </ul>
                </div>
              </li>
              <li className="ledger__row" id="stage-approve">
                <span className="ledger__no" aria-hidden="true">04</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k17}</h3>
                  <p className="ledger__entry">{t.k18}</p>
                  <ul className="ledger__mods" aria-label={t.k19}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-cms" />
                      </svg>
                      {R(t.k20)}
                    </li>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-mms" />
                      </svg>
                      {R(t.k21)}
                    </li>
                  </ul>
                </div>
              </li>
              <li className="ledger__row" id="stage-archive">
                <span className="ledger__no" aria-hidden="true">05</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k22}</h3>
                  <p className="ledger__entry">{t.k23}</p>
                  <ul className="ledger__mods" aria-label={t.k24}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-dms" />
                      </svg>
                      {R(t.k25)}
                    </li>
                  </ul>
                </div>
              </li>
              <li className="ledger__row" id="stage-retain">
                <span className="ledger__no" aria-hidden="true">06</span>
                <div className="ledger__body">
                  <h3 className="ledger__stage">{t.k26}</h3>
                  <p className="ledger__entry">{t.k27}</p>
                  <ul className="ledger__mods" aria-label={t.k28}>
                    <li className="chip">
                      <svg className="icon chip__icon" aria-hidden="true" focusable="false">
                        <use href="#m-dms" />
                      </svg>
                      {R(t.k29)}
                    </li>
                  </ul>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
