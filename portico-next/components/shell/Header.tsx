import { rich } from "@/lib/rich";
import ModuleBadge from "../ModuleBadge";
import { srcSetWithBase, withBase, homePath, type Lang } from "@/lib/site";
import { MODULES, PAGES, PORTICO_NAMES } from "@/data/content";
import NavMenus from "../client/NavMenus";
import ThemeToggle from "../client/ThemeToggle";
import { SHELL } from "./dict";
import { staticPartnerViews } from "@/data/partners";
import { PartnersMenuList } from "../partners/PartnerLive";
import LangSwitch from "./LangSwitch";
import type { Linker } from "./links";

const MODULE_GLYPH: Record<string, string> = {
  documents: "m-dms",
  correspondence: "m-cms",
  processes: "m-bpm",
  meetings: "m-mms",
};

const LOGO = "/assets/brand/ecmplus-ai-logo";

export function BrandLogo({
  sizes,
  lazyDark = true,
  lazyLight = false,
}: {
  sizes: string;
  lazyDark?: boolean;
  lazyLight?: boolean;
}) {
  const set = (dark: boolean) =>
    srcSetWithBase(`${LOGO}${dark ? "-dark" : ""}-272.webp 272w, ${LOGO}${dark ? "-dark" : ""}-545.webp 545w`);
  return (
    <>
      <img
        className="ecmlogo__img ecmlogo__img--light"
        src={withBase(`${LOGO}-272.webp`)}
        srcSet={set(false)}
        sizes={sizes}
        width={545}
        height={302}
        alt=""
        loading={lazyLight ? "lazy" : undefined}
      />
      <img
        className="ecmlogo__img ecmlogo__img--dark"
        src={withBase(`${LOGO}-dark-272.webp`)}
        srcSet={set(true)}
        sizes={sizes}
        width={545}
        height={302}
        alt=""
        loading={lazyDark ? "lazy" : undefined}
      />
    </>
  );
}

export default function Header({ lang, current, links }: { lang: Lang; current: string; links: Linker }) {
  const h = SHELL[lang].header;
  const homeHref = withBase(homePath(lang));
  const Icon = ({ id, cls }: { id: string; cls: string }) => (
    <svg className={cls} aria-hidden="true" focusable="false"><use href={`#${id}`} /></svg>
  );
  const item = (t: string, label: React.ReactNode) => (
    <a className="nav__link" href={links.href(t)} aria-current={links.ariaCurrent(t)}>{label}</a>
  );
  const aboutLabel = lang === "ar" ? <span>{rich(h.about)}</span> : rich(h.about);

  return (
    <header className="site-header">
      <NavMenus />
      <div className="wrap header__bar">
        <a className="brand ecmlogo" href={homeHref} aria-label={h.homeAria}>
          <BrandLogo sizes="(max-width: 420px) 80px, 94px" lazyLight={false} lazyDark />
        </a>

        <div className="header__quick">
          <LangSwitch lang={lang} current={current} />
          <ThemeToggle label={h.darkMode} />
        </div>

        <button className="nav-toggle js-only" type="button" aria-expanded="false" aria-controls="site-panel">
          <span className="nav-toggle__bars" aria-hidden="true"><span></span></span>
          <span>{h.menu}</span>
        </button>

        <div className="header__panel" id="site-panel">
          <nav className="nav" aria-label={h.navAria}>
            <ul className="nav__list">
              <li className="nav__item">{item("about/", aboutLabel)}</li>
              <li className="nav__item" data-menu="">
                <a className="nav__link nojs-only" href={links.href("#suite")}>{h.products}</a>
                <button className="nav__link nav__trigger js-only" type="button" aria-expanded="false" aria-controls="menu-products">
                  {h.products}<Icon id="i-chev" cls="icon nav__chev" />
                </button>
                <div className="menu-panel dropdown dropdown--suite" id="menu-products">
                  <p className="dropdown__h">{h.modulesHeading}</p>
                  <ul className="dropdown__list">
                    {MODULES.map((slug) => (
                      <li key={slug}>
                        <a href={links.href(`${slug}/`)} aria-current={links.ariaCurrent(`${slug}/`)}>
                          <Icon id={MODULE_GLYPH[slug]} cls="icon dropdown__icon" />
                          <span className="dropdown__t">
                            {rich(PORTICO_NAMES[lang][slug].short as string)}
                            <ModuleBadge code={PAGES[slug].code as string} className="dropdown__code" />
                          </span>
                          <span className="dropdown__d">{rich(PAGES[slug][lang].line as string)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="dropdown__h">{h.productsSolutions}</p>
                  <ul className="dropdown__list">
                    <li>
                      <a href={links.href("capture/")} aria-current={links.ariaCurrent("capture/")}>
                        <Icon id="i-ocr" cls="icon dropdown__icon" />
                        <span className="dropdown__t">{h.capture.title}<ModuleBadge code="DMS" className="dropdown__code" /></span>
                        <span className="dropdown__d">{h.capture.desc}</span>
                      </a>
                    </li>
                    <li>
                      <a href={links.href("chat/")} aria-current={links.ariaCurrent("chat/")}>
                        <Icon id="i-spark" cls="icon dropdown__icon" />
                        <span className="dropdown__t">{h.chat.title}<ModuleBadge code="DMS" className="dropdown__code" /></span>
                        <span className="dropdown__d">{h.chat.desc}</span>
                      </a>
                    </li>
                  </ul>
                  <a className="dropdown__all" href={links.href("#suite")}>
                    {h.exploreSuite}<Icon id="i-arrow" cls="icon flip" />
                  </a>
                </div>
              </li>
              <li className="nav__item" data-menu="">
                <a className="nav__link nojs-only" href={links.href("partners/")} aria-current={links.ariaCurrent("partners/")}>{h.partners}</a>
                <button className="nav__link nav__trigger js-only" type="button" aria-expanded="false" aria-controls="menu-partners">
                  {h.partners}<Icon id="i-chev" cls="icon nav__chev" />
                </button>
                <div className="menu-panel dropdown dropdown--partners dropdown--logos" id="menu-partners">
                  <PartnersMenuList fallback={staticPartnerViews(lang, withBase)} hrefBase={links.href("partners/")} />
                  <a className="dropdown__all" href={links.href("partners/")}>
                    {h.partnersAll}<Icon id="i-arrow" cls="icon flip" />
                  </a>
                </div>
              </li>
              <li className="nav__item">{item("#news", h.news)}</li>
              <li className="nav__item" data-menu="">
                <a className="nav__link nojs-only" href={h.support.href}>{h.supportPortal}</a>
                <button className="nav__link nav__trigger js-only" type="button" aria-expanded="false" aria-controls="menu-support">
                  {h.supportPortal}<Icon id="i-chev" cls="icon nav__chev" />
                </button>
                <div className="menu-panel dropdown dropdown--partners" id="menu-support">
                  <ul className="dropdown__list dropdown__list--plain">
                    <li><a href={h.partnerPortal.href}><span className="dropdown__t">{h.partnerPortal.label}</span></a></li>
                    <li><a href={h.customerPortal.href}><span className="dropdown__t">{h.customerPortal.label}</span></a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          <div className="header__utility">
            <LangSwitch lang={lang} current={current} />
            <ThemeToggle label={h.darkMode} />
          </div>

          <a className="btn btn--gold header__cta" href={links.href("#contact")}>{h.cta}</a>
        </div>
      </div>
    </header>
  );
}
