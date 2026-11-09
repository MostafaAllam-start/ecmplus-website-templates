import type { CSSProperties } from "react";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Governance({ t, links }: SectionProps<"governance">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section governance" id="security" aria-labelledby="security-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">05</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-shield" />
            </svg>
            {t.k01}
          </p>
          <h2 id="security-title">{t.k02}</h2>
          <p className="section-lead">{t.k03}</p>
        </div>
        <div className="governance__grid">
          <div className="governance__media">
            <figure className="evidence" data-evidence="">
              <div className="evidence__stage" role="img" aria-label={t.k04}>
                <div className="paper" dir={t.k05 || undefined}>
                  <div className="paper__head">
                    <span className="paper__stamp">{t.k06}</span>
                    {" "}
                    <span className="paper__ref">{t.k07}</span>
                  </div>
                  <p className="paper__title">{t.k08}</p>
                  <div className="paper__lines">
                    <span style={{ "--w": "96%" } as CSSProperties} />
                    <span style={{ "--w": "88%" } as CSSProperties} />
                    <span style={{ "--w": "92%" } as CSSProperties} />
                    <span style={{ "--w": "64%" } as CSSProperties} />
                  </div>
                  <div className="paper__table">
                    <span />
                    <span />
                    <span />
                    {" "}
                    <span />
                    <span />
                    <span />
                    {" "}
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="paper__lines">
                    <span style={{ "--w": "90%" } as CSSProperties} />
                    <span style={{ "--w": "52%" } as CSSProperties} />
                  </div>
                  <div className="paper__mark" data-trace-from="">
                    <svg className="paper__markface" viewBox="0 0 112 76" aria-hidden="true" focusable="false">
                      <use className="dm-ink" href="#dm" x="42" y="8" width="28" height="28" />
                      <text className="dm-ink" x="56" y="52" textAnchor="middle">TR-7F3A-21C9</text>
                      <path className="brackets" d="M18 12V1h10M84 1h10v11M94 51v11H84M28 62H18V51" />
                    </svg>
                    <span className="paper__scan" />
                  </div>
                  <div className="paper__foot" dir={t.k09 || undefined}>
                    <div className="paper__sign">
                      <svg className="paper__sigmark" viewBox="0 0 120 36" aria-hidden="true" focusable="false">
                        <path d="M4 26c10-2 14-20 22-20 7 0 0 18 8 18 6 0 8-12 14-12 5 0 4 9 9 9 4 0 7-4 11-7M70 22c6 0 10-6 16-6 4 0 3 6 8 6 4 0 9-3 14-5" />
                      </svg>
                      <span className="paper__sigline" />
                      {" "}
                      <span className="paper__sigcap" lang={t.k10 || undefined} dir={t.k11 || undefined}>{t.k12}</span>
                    </div>
                  </div>
                </div>
                <svg className="trace" aria-hidden="true" focusable="false">
                  <path className="trace__path" pathLength="1" />
                  <circle className="trace__dot trace__dot--a" r="3.5" cx="-10" cy="-10" />
                  <circle className="trace__dot trace__dot--b" r="3.5" cx="-10" cy="-10" />
                </svg>
                <div className="tracecard" data-trace-to="" dir={t.k13 || undefined}>
                  <p className="tracecard__eyebrow">{t.k14}</p>
                  <p className="tracecard__id">{R(t.k15)}</p>
                  <dl className="tracecard__rows">
                    <div>
                      <dt>{t.k16}</dt>
                      <dd>{R(t.k17)}</dd>
                    </div>
                    <div>
                      <dt>{t.k18}</dt>
                      <dd>{R(t.k19)}</dd>
                    </div>
                    <div>
                      <dt>{t.k20}</dt>
                      <dd>{t.k21}</dd>
                    </div>
                    <div>
                      <dt>{t.k22}</dt>
                      <dd>{R(t.k23)}</dd>
                    </div>
                    <div>
                      <dt>{t.k24}</dt>
                      <dd>{R(t.k25)}</dd>
                    </div>
                  </dl>
                  <p className="tracecard__foot">{t.k26}</p>
                </div>
              </div>
            </figure>
          </div>
          <div className="governance__aside">
            <ul className="safeguards">
              <li data-reveal="">
                <h3>
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#i-audit" />
                  </svg>
                  {t.k27}
                </h3>
                <p>{t.k28}</p>
              </li>
              <li data-reveal="">
                <h3>
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#i-lock" />
                  </svg>
                  {t.k29}
                </h3>
                <p>{t.k30}</p>
              </li>
              <li data-reveal="">
                <h3>
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#i-sign" />
                  </svg>
                  {t.k31}
                </h3>
                <p>{t.k32}</p>
              </li>
              <li data-reveal="">
                <h3>
                  <svg className="icon" aria-hidden="true" focusable="false">
                    <use href="#i-backup" />
                  </svg>
                  {t.k33}
                </h3>
                <p>{t.k34}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
