import { CONTACT_URL, srcSetWithBase, withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function Contact({ t, links, lang }: SectionProps<"contact">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="ph ph--bleed contact__ph">
        <img srcSet={srcSetWithBase("/assets/photos/portico/p10-contact-800.webp 800w, /assets/photos/portico/p10-contact-1200.webp 1200w, /assets/photos/portico/p10-contact-1600.webp 1600w")} sizes="100vw" src={withBase("/assets/photos/portico/p10-contact-1600.webp")} width="1600" height="900" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="contact__wash" aria-hidden="true" />
      <div className="wrap">
        <div className="plate contact__plate" data-reveal="">
          <div className="contact__intro">
            <p className="eyebrow">
              <span className="eyebrow__no">11</span>
              <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
                <use href="#i-demo" />
              </svg>
              {t.k01}
            </p>
            <h2 id="contact-title">{R(t.k02)}</h2>
            <p className="section-lead">{t.k03}</p>
            <div className="faq" id="faq">
              <h3 className="faq__h">{t.k04}</h3>
              <details>
                <summary>
                  <span>{R(t.k05)}</span>
                </summary>
                <p>{R(t.k06)}</p>
              </details>
              <details>
                <summary>
                  <span>{t.k07}</span>
                </summary>
                <p>{t.k08}</p>
              </details>
              <details>
                <summary>
                  <span>{t.k09}</span>
                </summary>
                <p>{R(t.k10)}</p>
              </details>
            </div>
          </div>
          <form className="demo-form" id="demo-form" action={CONTACT_URL} method="post" aria-labelledby="demo-form-title">
            <input type="hidden" name="lang" value={lang} />
            <h3 className="demo-form__h" id="demo-form-title">{t.k11}</h3>
            <div className="field">
              <label htmlFor="demo-name">{R(t.k12)}</label>
              <input id="demo-name" name="name" type="text" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="demo-email">{R(t.k13)}</label>
              <input id="demo-email" name="email" type="email" autoComplete="email" inputMode="email" required aria-describedby="demo-email-hint" dir={t.k14 || undefined} />
              <p className="field__hint" id="demo-email-hint">{t.k15}</p>
            </div>
            <div className="field field--full">
              <label htmlFor="demo-org">{R(t.k16)}</label>
              <input id="demo-org" name="organization" type="text" autoComplete="organization" required />
            </div>
            <fieldset className="field field--full">
              <legend>{t.k17}</legend>
              <div className="checks">
                <label className="check">
                  <input type="checkbox" name="modules" value="documents" />
                  <span>{t.k18}</span>
                </label>
                <label className="check">
                  <input type="checkbox" name="modules" value="correspondence" />
                  <span>{t.k19}</span>
                </label>
                <label className="check">
                  <input type="checkbox" name="modules" value="processes" />
                  <span>{t.k20}</span>
                </label>
                <label className="check">
                  <input type="checkbox" name="modules" value="meetings" />
                  <span>{t.k21}</span>
                </label>
              </div>
            </fieldset>
            <div className="field field--full">
              <label htmlFor="demo-message">{t.k22}</label>
              <textarea id="demo-message" name="message" rows={4} autoComplete="off" aria-describedby="demo-message-hint" />
              <p className="field__hint" id="demo-message-hint">{t.k23}</p>
            </div>
            <div className="demo-form__foot">
              <button className="btn btn--gold btn--lg" type="submit">{t.k24}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
