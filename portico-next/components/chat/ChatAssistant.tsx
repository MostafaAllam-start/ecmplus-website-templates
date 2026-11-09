"use client";

import { useEffect, useRef, useState } from "react";
import CaptureDialog from "../capture/CaptureDialog";
import DocView from "./DocView";
import { ASSISTANT, DOCS, QAS, fmt, pick, type QA } from "@/data/chat";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";

type Phase = "idle" | "searching" | "done";

export function AnswerBody({ qa, lang }: { qa: QA; lang: Lang }) {
  return (
    <>
      <p className="ch-ans__text">{rich(fmt(qa.intro, lang))}</p>
      {qa.table ? (
        <div className="ch-tablewrap">
          <table className="ch-table">
            <thead><tr>{qa.table.head.map((h, i) => <th key={i} scope="col">{rich(fmt(h, lang))}</th>)}</tr></thead>
            <tbody>{qa.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{rich(fmt(c, lang))}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : null}
      {qa.bullets ? <ul className="ch-bullets">{qa.bullets.map((x, i) => <li key={i}>{rich(fmt(x, lang))}</li>)}</ul> : null}
    </>
  );
}

/** Section 04: a scripted enterprise-assistant demonstration over a fictional document collection. */
export default function ChatAssistant({ lang }: { lang: Lang }) {
  const [sel, setSel] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState<{ doc: string; page: number } | null>(null);
  const timers = useRef<number[]>([]);
  const feed = useRef<HTMLDivElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const ask = (i: number) => {
    clear();
    setSel(i);
    setStep(0);
    if (reduce.current) { setPhase("done"); return; }
    setPhase("searching");
    const gap = 650;
    ASSISTANT.searching.forEach((_, k) => timers.current.push(window.setTimeout(() => setStep(k), k * gap)));
    timers.current.push(window.setTimeout(() => setPhase("done"), ASSISTANT.searching.length * gap + 250));
  };
  const reset = () => { clear(); setSel(null); setPhase("idle"); setStep(0); };

  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: reduce.current ? "auto" : "smooth" });
  }, [phase, sel]);

  const qa = sel === null ? null : QAS[sel];
  const pageLabel = pick(ASSISTANT.page, lang);

  return (
    <div className="ch-chat" data-phase={phase}>
      <div className="ch-chat__win" role="region" aria-label={pick(ASSISTANT.name, lang).replace(/[‹›]/g, "")}>
        <div className="ch-chat__bar">
          <span className="ch-chat__dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span className="ch-chat__name">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-spark" /></svg>
            {rich(fmt(ASSISTANT.name, lang))}
          </span>
          <button type="button" className="ch-chat__reset" onClick={reset} disabled={sel === null}>{pick(ASSISTANT.reset, lang)}</button>
        </div>
        <div className="ch-chat__feed" ref={feed} aria-live="polite">
          {qa === null ? <p className="ch-chat__empty">{pick(ASSISTANT.empty, lang)}</p> : (
            <>
              <div className="ch-msg ch-msg--user">
                <span className="ch-msg__who">{pick(ASSISTANT.you, lang)}</span>
                <p>{rich(fmt(qa.q, lang))}</p>
              </div>
              <div className="ch-msg ch-msg--ai">
                <span className="ch-msg__who">{rich(fmt(ASSISTANT.name, lang))}</span>
                {phase === "searching" ? (
                  <ul className="ch-search">
                    {ASSISTANT.searching.map((s, k) => (
                      <li key={k} className={k < step ? "is-done" : k === step ? "is-now" : ""}><i aria-hidden="true"></i>{pick(s, lang)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="ch-ans">
                    <AnswerBody qa={qa} lang={lang} />
                    <p className="ch-ans__label">{pick(ASSISTANT.sources, lang)}</p>
                    <ul className="ch-srcs">
                      {qa.sources.map((s, i) => (
                        <li key={i}>
                          <button type="button" className="ch-src" onClick={() => setOpen({ doc: s.doc, page: s.page })}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h8l4 4v14H6z M14 3v4h4" /></svg>
                            <span className="ch-src__f" dir="ltr">{DOCS[s.doc].file}</span>
                            <span className="ch-src__p">{pageLabel} {s.page}</span>
                          </button>
                          <p className="ch-src__q">&ldquo;{rich(fmt(s.passage, lang))}&rdquo;</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="ch-chat__input" aria-hidden="true">
          <span>{qa ? "" : pick(ASSISTANT.placeholder, lang)}</span>
          <svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
      </div>

      <aside className="ch-chat__side">
        <h3 className="ch-chat__h">{pick(ASSISTANT.suggested, lang)}</h3>
        <ul className="ch-qs">
          {QAS.map((q, i) => (
            <li key={q.id}>
              <button type="button" className="ch-q" aria-pressed={sel === i} onClick={() => ask(i)} disabled={phase === "searching"}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-search" /></svg>
                <span>{rich(fmt(q.q, lang))}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="ch-note">{rich(fmt(ASSISTANT.note, lang))}</p>
      </aside>

      <CaptureDialog
        open={open !== null} onClose={() => setOpen(null)}
        title={open ? DOCS[open.doc].file : ""} titleId="ch-doc-title" closeLabel={lang === "ar" ? "إغلاق" : "Close"} className="ch-dialog"
      >
        {open ? <DocView doc={open.doc} page={open.page} lang={lang} pageLabel={pageLabel} /> : null}
      </CaptureDialog>
    </div>
  );
}
