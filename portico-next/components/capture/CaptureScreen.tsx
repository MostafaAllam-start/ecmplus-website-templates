"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLES, SAMPLE_KEYS, fmt, plain } from "@/data/capture";
import { BAD_SHEET, RESCAN_DONE_T, SCAN, type ScanStatus } from "@/data/capture-tools";
import type { Lang } from "@/lib/site";
import CaptureDoc from "./CaptureDocs";

const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** "Scanning screen": a larger version of the factory's wall monitor: all 10 scanned documents, their scan status and the next steps. */
export default function CaptureScreen({
  lang, start, T, onContinue,
}: {
  lang: Lang; start: number; T: number; onContinue: (cat: number, step: number) => void;
}) {
  const [sel, setSel] = useState(start);
  const [st, setSt] = useState<ScanStatus[]>(() => Array.from({ length: 10 }, (_, i) => (i === BAD_SHEET ? (T >= RESCAN_DONE_T ? "rescanned" : "poor") : "ok")));
  const [live, setLive] = useState("");
  const timer = useRef(0);
  useEffect(() => { setSel(start); }, [start]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const t = (b: { en: string; ar: string }) => fmt(b, lang);
  const p = (b: { en: string; ar: string }) => plain(b, lang);
  const name = (i: number) => `${t(SAMPLES[SAMPLE_KEYS[i % 5]].name)} ${i >= 5 ? 2 : 1}`;

  const rescan = (i: number) => {
    if (st[i] !== "poor") return;
    const set = (v: ScanStatus) => setSt((a) => a.map((x, n) => (n === i ? v : x)));
    if (reduced()) { set("rescanned"); setLive(p(SCAN.status.rescanned)); return; }
    set("rescanning");
    timer.current = window.setTimeout(() => { set("rescanned"); setLive(p(SCAN.status.rescanned)); }, 1400);
  };
  const cur = st[sel];
  const stepNow = cur === "poor" || cur === "rescanning" ? 1 : 2;
  const cat = sel % 5;

  return (
    <div className="csc">
      <div className="csc__main">
        <h3 className="cdk__h">{t(SCAN.grid)}</h3>
        <div className="csc__grid" role="listbox" aria-label={p(SCAN.grid)}>
          {SAMPLE_KEYS.map((k, c) => (
            <div className="csc__grp" key={k} style={{ ["--cat" as string]: `var(--cap-cat${c})` }}>
              {[c, c + 5].map((i) => (
                <button
                  type="button" role="option" aria-selected={sel === i} key={i}
                  className={`csc__tile csc__tile--${st[i]}`} onClick={() => setSel(i)}
                >
                  <span className="csc__thumb" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
                  <span className="csc__name">{name(i)}</span>
                  <span className="csc__chip">{t(SCAN.status[st[i]])}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="csc__detail">
          <div className="csc__prev"><CaptureDoc k={SAMPLE_KEYS[cat]} lang={lang} hit="" /></div>
          <div className="csc__info">
            <h3 className="cdk__h">{name(sel)}</h3>
            <p className={`csc__chip csc__chip--${cur}`}>{t(SCAN.status[cur])}</p>
            <p className="csc__q"><b>{t(SCAN.quality)}:</b> {t(SCAN.q[cur])}</p>
            <div className="cdk__acts">
              {cur === "poor" || cur === "rescanning" ? (
                <button type="button" className="btn btn--ghost-gold" onClick={() => rescan(sel)} disabled={cur === "rescanning"}>{t(SCAN.rescan)}</button>
              ) : null}
              <button type="button" className="btn btn--gold" onClick={() => onContinue(cat, 5)}>{t(SCAN.cont)}</button>
              <button type="button" className="btn btn--ghost-gold" onClick={() => onContinue(cat, 3)}>{t(SCAN.openScan)}</button>
            </div>
            <p className="cap-sr" role="status" aria-live="polite">{live}</p>
          </div>
        </div>
      </div>
      <aside className="csc__side" aria-label={p(SCAN.nextSteps)}>
        <h3 className="cdk__h">{t(SCAN.nextSteps)}</h3>
        <ol className="csc__tl">
          {SCAN.steps.map((x, n) => (
            <li key={n} data-state={n < stepNow ? "done" : n === stepNow ? "now" : "next"} aria-current={n === stepNow ? "step" : undefined}><span aria-hidden="true"></span>{t(x)}</li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
