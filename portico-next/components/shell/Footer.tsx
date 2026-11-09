import { rich } from "@/lib/rich";
import { homePath, withBase, type Lang } from "@/lib/site";
import { SHELL } from "./dict";
import { BrandLogo } from "./Header";
import type { Linker } from "./links";

export default function Footer({ lang, links }: { lang: Lang; links: Linker }) {
  const f = SHELL[lang].footer;
  const h = SHELL[lang].header;
  return (
    <footer className="site-footer on-dark">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <a className="brand ecmlogo ecmlogo--lg ecmlogo--on-dark" href={withBase(homePath(lang))} aria-label={h.homeAria}>
              <BrandLogo sizes="(max-width: 420px) 145px, 174px" lazyLight lazyDark />
            </a>
            <p className="footer__tagline">{f.tagline}</p>
            <div className="footer__ctc" id="about">
              <img src={withBase("/assets/brand/ctc-logo.webp")} alt={f.ctc.alt} width={44} height={44} loading="lazy" />
              <p>{f.ctc.text}</p>
            </div>
          </div>

          <nav className="footer__nav" aria-label={f.navAria}>
            {f.columns.map((col) => (
              <div className="footer__col" key={col.title}>
                <h2>{col.title}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <a
                        href={links.href(l.href)}
                        aria-current={links.ariaCurrent(l.href)}
                        data-prefill={l.prefill}
                        rel={l.rel}
                      >
                        {rich(l.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer__bottom">
          <p>{rich(f.copyright)}</p>
          <ul className="footer__legal">
            {f.legal.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
