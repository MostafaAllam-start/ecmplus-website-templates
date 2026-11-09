import { withBase } from "@/lib/site";
import { rich } from "../rich";
import type { SectionProps } from "../types";

export default function News({ t, links }: SectionProps<"news">) {
  const R = (s: string) => rich(s, links);
  return (
    <section className="section news" id="news" aria-labelledby="news-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">
            <span className="eyebrow__no">10</span>
            <svg className="icon eyebrow__icon" aria-hidden="true" focusable="false">
              <use href="#i-news" />
            </svg>
            {t.k01}
          </p>
          <h2 id="news-title">{R(t.k02)}</h2>
        </div>
        <div className="news__grid">
          <article className="story story--lead" data-reveal="">
            <div className="ph ph--reveal story__ph">
              <img src={withBase("/assets/photos/portico/p11-itex-800.webp")} width="800" height="600" alt={t.k03} loading="lazy" decoding="async" />
            </div>
            <div className="story__plate">
              <p className="story__meta">{t.k04}</p>
              <h3 className="story__title">{R(t.k05)}</h3>
              <p className="story__detail">{t.k06}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
