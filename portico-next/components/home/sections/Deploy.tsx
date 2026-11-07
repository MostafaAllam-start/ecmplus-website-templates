import { withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Deploy({ t, links }: SectionProps<"deploy">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section deploy" id="platform" aria-labelledby="platform-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">06</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-link" />
            </svg>
            {t.k01}
          </p>
          <h2 id="platform-title">{R(t.k02)}</h2>
          <p className="section-lead">{t.k03}</p>
        </div>
        <div className="deploy__grid">
          <div className="deploy__plate on-dark" data-reveal="">
            <div className="works">
              <h3 className="works__h" id="works-title">{t.k04}</h3>
              <ul className="works__list" aria-labelledby="works-title">
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/microsoft-teams.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k05)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/google-meet.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k06)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/zoom.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k07)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/beem.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k08)}
                </li>
                <li className="is-own">
                  <img className="works__logo works__logo--ecm ecmlogo__img--light" src={withBase("/assets/brand/ecmplus-ai-logo-272.webp")} alt="" width="545" height="302" loading="lazy" decoding="async" />
                  <img className="works__logo works__logo--ecm ecmlogo__img--dark" src={withBase("/assets/brand/ecmplus-ai-logo-dark-272.webp")} alt="" width="545" height="302" loading="lazy" decoding="async" />
                  {R(t.k09)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/gmail.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k10)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/microsoft-outlook.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k11)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/google-calendar.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k12)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/google-drive.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k13)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/onedrive.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k14)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/whatsapp.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {t.k15}
                </li>
                <li>
                  <svg className="icon works__logo works__logo--glyph" aria-hidden="true" focusable="false">
                    <use href="#t-sms" />
                  </svg>
                  {t.k16}
                </li>
                <li>
                  <img className="works__logo works__logo--wide" src={withBase("/assets/brands/nafath.png")} alt="" width="604" height="331" loading="lazy" decoding="async" />
                  {t.k17}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/microsoft-word.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k18)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/microsoft-excel.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k19)}
                </li>
                <li>
                  <img className="works__logo" src={withBase("/assets/brands/microsoft-powerpoint.svg")} alt="" width="18" height="18" loading="lazy" decoding="async" />
                  {R(t.k20)}
                </li>
              </ul>
            </div>
          </div>
          <dl className="facts">
            <div id="platform-datacentre" data-reveal="">
              <dt>{t.k21}</dt>
              <dd>{R(t.k22)}</dd>
            </div>
            <div id="platform-connect" data-reveal="">
              <dt>{t.k23}</dt>
              <dd>{t.k24}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
