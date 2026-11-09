"use client";

import { useState } from "react";
import DocView from "./DocView";
import { AnswerBody } from "./ChatAssistant";
import { ASSISTANT, DOCS, QAS, TRUST, fmt, pick } from "@/data/chat";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";

/** Section 05: the answer and its citations on one side, the original page with the highlighted passage on the other. */
export default function SourceExplorer({ lang }: { lang: Lang }) {
  const [q, setQ] = useState(0);
  const [c, setC] = useState(0);
  const qa = QAS[q];
  const src = qa.sources[Math.min(c, qa.sources.length - 1)];
  const doc = DOCS[src.doc];
  const pages = Object.keys(doc.pages).map(Number).sort((a, b) => a - b);
  const pageLabel = pick(ASSISTANT.page, lang);

  return (
    <div className="ch-split">
      <div className="ch-split__l">
        <div className="ch-tabs" role="tablist" aria-label={pick(ASSISTANT.suggested, lang)}>
          {[0, 1, 2, 3].map((i) => (
            <button key={i} type="button" role="tab" aria-selected={q === i} className="ch-tab" onClick={() => { setQ(i); setC(0); }}>
              {rich(fmt(QAS[i].q, lang))}
            </button>
          ))}
        </div>
        <div className="ch-answer">
          <p className="ch-ans__label">{pick(TRUST.answer, lang)}</p>
          <AnswerBody qa={qa} lang={lang} />
          <p className="ch-ans__label">{pick(TRUST.citations, lang)}</p>
          <ol className="ch-cites">
            {qa.sources.map((s, i) => (
              <li key={i}>
                <button type="button" className="ch-cite" aria-current={i === c ? "true" : undefined} onClick={() => setC(i)}>
                  <b>{i + 1}</b>
                  <span className="ch-cite__f" dir="ltr">{DOCS[s.doc].file}</span>
                  <span className="ch-cite__p">{pageLabel} {s.page}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="ch-split__r">
        <div className="ch-viewer__bar">
          <span>{pick(TRUST.original, lang)}</span>
          <span>{rich(fmt(TRUST.pageOf(pages.indexOf(src.page) + 1, pages.length), lang))}</span>
        </div>
        <DocView doc={src.doc} page={src.page} lang={lang} pageLabel={pageLabel} />
        <p className="ch-viewer__hint"><mark className="ch-hl">{pick(TRUST.highlighted, lang)}</mark></p>
      </div>
    </div>
  );
}
