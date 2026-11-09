"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLES, SAMPLE_KEYS, fmt, plain } from "@/data/capture";
import { CHECK, COND, SHEET_CONDS } from "@/data/capture-tools";
import type { Lang } from "@/lib/site";
import CaptureDoc from "./CaptureDocs";

const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const tpl = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

/** "Document check": one factory sheet shown large, its problem highlighted, what the worker does, and the actions. */
export default function CaptureCheck({ lang, start }: { lang: Lang; start: number }) {
  const [i, setI] = useState(start);
  const [fixed, setFixed] = useState<Record<number, boolean>>({});
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState<Record<number, number>>({}); // 0 idle, 1..3 working, 4 done
  const [live, setLive] = useState("");
  const timers = useRef<number[]>([]);
  useEffect(() => { setI(start); }, [start]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const N = SHEET_CONDS.length;
  const kind = SHEET_CONDS[i];
  const cond = COND[kind];
  const key = SAMPLE_KEYS[i % 5];
  const s = SAMPLES[key];
  const st = step[i] ?? 0;
  const working = st > 0 && st < 4;
  const isFixed = !!fixed[i];
  const manual = !!sent[i] || (cond.status === "manual" && !isFixed);
  const t = (b: { en: string; ar: string }) => fmt(b, lang);
  const p = (b: { en: string; ar: string }) => plain(b, lang);

  const act = () => {
    if (working || isFixed) return;
    const n = i;
    setSent((m) => ({ ...m, [n]: false }));
    if (reduced()) { setStep((m) => ({ ...m, [n]: 4 })); setFixed((m) => ({ ...m, [n]: true })); setLive(p(CHECK.done)); return; }
    [1, 2, 3].forEach((k) => timers.current.push(window.setTimeout(() => setStep((m) => ({ ...m, [n]: k })), (k - 1) * 900)));
    timers.current.push(window.setTimeout(() => { setStep((m) => ({ ...m, [n]: 4 })); setFixed((m) => ({ ...m, [n]: true })); setLive(p(CHECK.done)); }, 2700));
  };
  const send = () => { if (working) return; setSent((m) => ({ ...m, [i]: true })); setFixed((m) => ({ ...m, [i]: false })); setStep((m) => ({ ...m, [i]: 0 })); setLive(p(CHECK.sent)); };
  const go = (d: number) => setI((v) => (v + d + N) % N);

  return (
    <div className="cdk" data-kind={kind} data-fixed={isFixed ? "" : undefined} data-working={working ? "" : undefined}>
      <div className="cdk__stage">
        <div className="cdk__paper">
          <div className="cdk__sheet">
            <CaptureDoc k={key} lang={lang} hit="" />
            <span className="cdk__mark" aria-hidden="true"><i></i><b>{t(CHECK.marker)}</b></span>
          </div>
        </div>
        <div className="cdk__nav">
          <button type="button" className="btn btn--ghost-gold" onClick={() => go(-1)}>{t(CHECK.prev)}</button>
          <span className="cdk__count">{tpl(p(CHECK.sheetOf), { n: i + 1, N })} · {t(s.name)}</span>
          <button type="button" className="btn btn--ghost-gold" onClick={() => go(1)}>{t(CHECK.next)}</button>
        </div>
      </div>
      <div className="cdk__side">
        <p className="cap-tag cap-tag--demo cap-tag--banner">
          <svg className="icon cap-tag__ic" aria-hidden="true" focusable="false"><use href="#i-demo" /></svg>
          <span>{t(CHECK.note)}</span>
        </p>
        <p className={`cdk__status cdk__status--${manual ? "manual" : "ready"}`} role="status">
          <span aria-hidden="true"></span>{manual ? t(CHECK.statusManual) : t(CHECK.statusReady)}
        </p>
        <h3 className="cdk__h">{t(CHECK.problem)}</h3>
        <p className="cdk__problem"><b>{t(cond.problem)}</b></p>
        <p className="cdk__explain">{t(cond.explain)}</p>
        <h3 className="cdk__h">{t(CHECK.worker)}</h3>
        <ol className="cdk__steps">
          {cond.steps.map((x, n) => (
            <li key={n} data-state={st >= 4 || st > n + 1 ? "done" : st === n + 1 ? "active" : "idle"}><span aria-hidden="true">{n + 1}</span>{t(x)}</li>
          ))}
        </ol>
        <h3 className="cdk__h">{t(CHECK.outcome)}</h3>
        <p className="cdk__out">{manual ? t(CHECK.outManual) : t(CHECK.outReady)}</p>
        <div className="cdk__acts">
          <button type="button" className="btn btn--gold" onClick={act} disabled={working || isFixed} aria-disabled={working || isFixed}>{working ? t(CHECK.working) : t(CHECK.doIt)}</button>
          <button type="button" className="btn btn--ghost-gold" onClick={send} disabled={working || !!sent[i]}>{t(CHECK.send)}</button>
        </div>
        <p className="cap-sr" role="status" aria-live="polite">{live}</p>
      </div>
    </div>
  );
}
