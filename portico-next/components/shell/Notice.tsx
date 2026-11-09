import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";
import { SHELL } from "./dict";
import type { Linker } from "./links";

export default function Notice({ lang, links }: { lang: Lang; links: Linker }) {
  const n = SHELL[lang].notice;
  return (
    <div className="notice">
      <div className="wrap notice__row">
        <span className="notice__badge">{n.badge}</span>
        <p className="notice__text">{rich(n.text)}</p>
        <a className="notice__link" href={links.href("#news")}>
          {n.link}
          <svg className="icon flip" aria-hidden="true" focusable="false"><use href="#i-arrow" /></svg>
        </a>
      </div>
    </div>
  );
}
