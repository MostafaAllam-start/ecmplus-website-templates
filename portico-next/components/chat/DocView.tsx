import { Fragment, type ReactNode } from "react";
import { DOCS, fmt, pick, type Bi } from "@/data/chat";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";

/** Text with ‹Latin› → <bdi> and [[highlighted passage]] → <mark>. */
export function hl(s: Bi, lang: Lang): ReactNode {
  const parts = fmt(s, lang).split(/(\[\[[\s\S]*?\]\])/);
  return parts.map((p, i) => {
    const m = /^\[\[([\s\S]*?)\]\]$/.exec(p);
    return m ? <mark className="ch-hl" key={i}>{rich(m[1])}</mark> : <Fragment key={i}>{rich(p)}</Fragment>;
  });
}

/** A sample source page: file bar, page heading and paragraphs, with the supporting passage highlighted. */
export default function DocView({ doc, page, lang, pageLabel }: { doc: string; page: number; lang: Lang; pageLabel: string }) {
  const d = DOCS[doc];
  const pg = d.pages[page] ?? Object.values(d.pages)[0];
  return (
    <article className="ch-doc" lang={lang}>
      <header className="ch-doc__bar">
        <span className="ch-doc__file" dir="ltr">{d.file}</span>
        <span className="ch-doc__kind">{pick(d.kind, lang)}</span>
      </header>
      <h4 className="ch-doc__title">{rich(fmt(d.title, lang))}</h4>
      <h5 className="ch-doc__head">{rich(fmt(pg.heading, lang))}</h5>
      {pg.paras.map((p, i) => <p key={i}>{hl(p, lang)}</p>)}
      <footer className="ch-doc__foot">{pageLabel} {page}</footer>
    </article>
  );
}
