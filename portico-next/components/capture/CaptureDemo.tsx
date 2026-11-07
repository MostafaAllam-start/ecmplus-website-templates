"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  DEMO, SAMPLES, SAMPLE_KEYS, ZONE_KEYS, ZONE_NAMES, fmt, plain,
  type Bi, type FieldDef, type SampleKey, type ZoneKey,
} from "@/data/capture";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";
import CaptureDoc, { Stamp } from "./CaptureDocs";

/*
 * The Document Capture demonstration engine (a port of templates/portico/capture.js, extended).
 * A simulation on sample documents: nothing is uploaded.
 *
 * Eight steps in "inline" mode: 1 Choose, 2 Explore, 3 Recognition, 4 Classification, 5 Extraction,
 * 6 Index fields, 7 Code stamp, 8 Archive record. In "modal" mode steps 1 and 4 are skipped
 * (preview, scan, extraction, metadata, barcode, record) and the last button calls `onExit`.
 */

export type DemoMode = "inline" | "modal";
export interface CaptureDemoHandle {
  /** Inline: pick the sample and go to step 2. Modal: restart the six-step flow on `key`
   *  (or, with `resume`, keep the current progress when it is already on that sample). */
  start(key: SampleKey, opts?: { resume?: boolean }): void;
  /** Restart the current sample from its first step (no-op until a sample was started). */
  replay(): void;
  sample(): SampleKey | "";
}
interface Props {
  lang: Lang;
  mode: DemoMode;
  /** Prefix for element ids, so two instances can live on one page. */
  idp?: string;
  /** Modal mode: the last-step "Back to the factory" button. */
  onExit?: () => void;
}

type Vals = Record<string, string>;
interface S {
  sample: SampleKey | "";
  step: number;
  max: number;
  saved: boolean;
  rec: boolean;
  scanning: boolean;
  typing: boolean;
  extracting: boolean;
  extracted: Record<string, number>;
  filled: Record<string, boolean>;
  typed: Record<string, Record<string, boolean>>;
  vals: Record<string, Vals>;
  typeSel: Record<string, number>;
  hit: ZoneKey | "";
  zonePressed: ZoneKey | "";
  fieldHit: string;
  live: string;
  focusTick: number;
  focusTarget: "title" | "pick";
}
const initial = (): S => ({
  sample: "", step: 1, max: 1, saved: false, rec: false, scanning: false, typing: false, extracting: false,
  extracted: {}, filled: {}, typed: {}, vals: {}, typeSel: {}, hit: "", zonePressed: "", fieldHit: "",
  live: "", focusTick: 0, focusTarget: "title",
});

const SEQ: Record<DemoMode, number[]> = { inline: [1, 2, 3, 4, 5, 6, 7, 8], modal: [2, 3, 5, 6, 7, 8] };
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const t = (s: Bi, lang: Lang) => fmt(s, lang);
const label = (f: FieldDef, lang: Lang) => f[lang];

const CaptureDemo = forwardRef<CaptureDemoHandle, Props>(function CaptureDemo({ lang, mode, idp = "", onExit }, ref) {
  const [s, setS] = useState<S>(initial);
  const sRef = useRef(s);
  sRef.current = s;
  const timers = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);
  const seq = SEQ[mode];
  const modal = mode === "modal";
  const samples = modal ? (s.sample ? [s.sample] : []) : SAMPLE_KEYS;
  const sample = s.sample;

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const titleOf = (n: number) => {
    const i = Math.max(0, seq.indexOf(n));
    return t(modal ? DEMO.modalTitles[i] : DEMO.titles[n - 1], lang);
  };
  const stepMsg = (n: number) =>
    plain(DEMO.step, lang).replace("{n}", String(seq.indexOf(n) + 1)).replace("{N}", String(seq.length)).replace("{t}", titleOf(n));

  const patchVals = (k: SampleKey, key: string, v: string) =>
    setS((p) => ({ ...p, vals: { ...p.vals, [k]: { ...p.vals[k], [key]: v } } }));

  /* ---- AI-proposed values: typed in (instant under reduced motion) ---- */
  const fillAll = (k: SampleKey) =>
    setS((p) => {
      const vals: Vals = {};
      const typed: Record<string, boolean> = {};
      SAMPLES[k].fields.forEach((f) => { vals[f.key] = f.v; typed[f.key] = true; });
      return { ...p, vals: { ...p.vals, [k]: vals }, typed: { ...p.typed, [k]: typed }, filled: { ...p.filled, [k]: true }, typing: false };
    });
  const finishTyping = () => {
    if (!sRef.current.typing || !sRef.current.sample) return;
    clearTimers();
    fillAll(sRef.current.sample);
  };
  const finishExtraction = () => {
    const cur = sRef.current;
    if (!cur.extracting || !cur.sample) return;
    clearTimers();
    const n = SAMPLES[cur.sample].fields.filter((f) => f.z).length;
    setS((p) => ({ ...p, extracting: false, hit: "", extracted: { ...p.extracted, [cur.sample]: n } }));
  };

  const fillFields = (k: SampleKey) => {
    if (sRef.current.filled[k]) return;
    if (reduced()) { fillAll(k); return; }
    const fields = SAMPLES[k].fields;
    setS((p) => ({ ...p, typing: true, vals: { ...p.vals, [k]: Object.fromEntries(fields.map((f) => [f.key, ""])) } }));
    let i = 0;
    const nextField = () => {
      if (i >= fields.length) {
        setS((p) => ({ ...p, typing: false, filled: { ...p.filled, [k]: true } }));
        return;
      }
      const f = fields[i++];
      const markTyped = () => setS((p) => ({ ...p, typed: { ...p.typed, [k]: { ...p.typed[k], [f.key]: true } } }));
      if (!f.v || f.type === "date") { patchVals(k, f.key, f.v); markTyped(); later(nextField, 90); return; }
      let n = 0;
      const ch = () => {
        n++;
        patchVals(k, f.key, f.v.slice(0, n));
        if (n < f.v.length) later(ch, 22); else { markTyped(); later(nextField, 90); }
      };
      ch();
    };
    nextField();
  };

  /* ---- recognition sweep ---- */
  const recognise = () => {
    if (sRef.current.rec) return;
    if (reduced()) { setS((p) => ({ ...p, rec: true })); return; }
    setS((p) => ({ ...p, scanning: true }));
    later(() => setS((p) => ({ ...p, scanning: false, rec: true })), 900);
  };

  /* ---- extraction: values appear one by one, each lighting its zone on the page ---- */
  const extract = (k: SampleKey) => {
    const items = SAMPLES[k].fields.filter((f) => f.z);
    if (reduced() || (sRef.current.extracted[k] ?? 0) >= items.length) {
      setS((p) => ({ ...p, extracted: { ...p.extracted, [k]: items.length }, extracting: false }));
      return;
    }
    setS((p) => ({ ...p, extracting: true, extracted: { ...p.extracted, [k]: 0 } }));
    items.forEach((f, i) => {
      later(() => setS((p) => ({ ...p, extracted: { ...p.extracted, [k]: i + 1 }, hit: f.z as ZoneKey })), 300 + i * 450);
    });
    later(() => setS((p) => ({ ...p, extracting: false, hit: "", live: plain(DEMO.extractedN, lang).replace("{n}", String(items.length)) })), 300 + items.length * 450);
  };

  /* ---- navigation ---- */
  const go = (n: number, focus: boolean, opts: { sample?: SampleKey; unlock?: boolean } = {}) => {
    const cur = sRef.current;
    const k = opts.sample ?? cur.sample;
    if (!seq.includes(n)) return;
    if (n > 1 && !k) return;
    const max = Math.max(cur.max, opts.unlock ? n : 0);
    if (n > max) return;
    finishTyping();
    finishExtraction();
    clearTimers();
    setS((p) => ({
      ...p,
      sample: k, step: n, max,
      hit: "", zonePressed: "", fieldHit: "", scanning: false, typing: false, extracting: false,
      rec: n < 3 ? false : p.rec,
      saved: modal && n === 8 ? true : p.saved,
      live: stepMsg(n) + (modal && n === 8 ? `. ${plain(DEMO.saved, lang)}` : ""),
      focusTick: focus ? p.focusTick + 1 : p.focusTick,
      focusTarget: "title",
    }));
    if (n === 3) recognise();
    if (n === 5 && k) extract(k);
    if (n === 6 && k) fillFields(k);
  };

  const restart = () => {
    clearTimers();
    setS((p) => ({ ...initial(), focusTick: p.focusTick + 1, focusTarget: "pick" }));
  };

  const advance = () => {
    const cur = sRef.current;
    if (cur.step === 8) {
      if (modal) { onExit?.(); return; }
      if (!cur.saved) setS((p) => ({ ...p, saved: true, live: `${stepMsg(8)}. ${plain(DEMO.saved, lang)}` }));
      else restart();
      return;
    }
    if (cur.step === 1 && !cur.sample) return;
    if (cur.typing) return;
    const n = seq[seq.indexOf(cur.step) + 1];
    go(n, true, { unlock: true });
  };
  const retreat = () => {
    const i = seq.indexOf(sRef.current.step);
    if (i > 0) go(seq[i - 1], true);
  };

  const choose = (k: SampleKey) => {
    const cur = sRef.current;
    if (cur.sample !== k) { finishTyping(); clearTimers(); setS((p) => ({ ...p, rec: false })); }
    go(2, true, { sample: k, unlock: true });
  };

  const start = (k: SampleKey, opts?: { resume?: boolean }) => {
    const cur = sRef.current;
    if (!modal) { choose(k); return; }
    if (opts?.resume && cur.sample === k && seq.includes(cur.step)) {
      setS((p) => ({ ...p, focusTick: p.focusTick + 1, focusTarget: "title" }));
      return;
    }
    clearTimers();
    setS((p) => ({ ...initial(), sample: k, step: 2, max: 2, live: stepMsg(2), focusTick: p.focusTick + 1, focusTarget: "title" }));
  };
  useImperativeHandle(ref, () => ({
    start,
    replay: () => { const k = sRef.current.sample; if (k) start(k); },
    sample: () => sRef.current.sample,
  }));

  /* Move focus after a step change (title) or a restart (first sample button). */
  useEffect(() => {
    if (!s.focusTick) return;
    if (s.focusTarget === "pick") rootRef.current?.querySelector<HTMLElement>(".cap-pick")?.focus();
    else titleRef.current?.focus();
  }, [s.focusTick, s.focusTarget]);

  /* ---- derived ---- */
  const suggested = (k: SampleKey, key: string) => SAMPLES[k].fields.find((f) => f.key === key)?.v ?? "";
  const chipState = (k: SampleKey, key: string) => {
    if (!s.typed[k]?.[key]) return "";
    const v = s.vals[k]?.[key] ?? "";
    const sug = suggested(k, key);
    return v === sug ? (sug ? "proposed" : "") : "edited";
  };
  const showZone = (z: ZoneKey | "", fieldKey = "") => {
    setS((p) => ({ ...p, hit: z, fieldHit: fieldKey }));
    if (z) {
      const el = docsRef.current?.querySelector(`.cap-doc[data-for="${sample}"] [data-zone="${z}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    }
  };

  const lastLabel = s.step === 8 ? (modal ? t(DEMO.factory, lang) : s.saved ? t(DEMO.again, lang) : t(DEMO.save, lang)) : t(DEMO.next, lang);
  const nextDisabled = (s.step === 1 && !sample) || s.typing;
  const backDisabled = seq.indexOf(s.step) <= 0;
  const tag = (kind: "demo" | "potential") => (
    <span className={`cap-tag cap-tag--${kind}`} title={plain(kind === "demo" ? DEMO.tagDemo : DEMO.tagPotential, lang)}>{t(kind === "demo" ? DEMO.tagDemo : DEMO.tagPotential, lang)}</span>
  );
  const dataProps: Record<string, string> = { "data-step": String(s.step), "data-sample": sample };
  if (s.rec) dataProps["data-rec"] = "";
  if (s.saved) dataProps["data-saved"] = "";
  const id = (x: string) => `${idp}${x}`;

  return (
    <div
      ref={rootRef}
      className={`cap-demo${modal ? " cap-demo--modal" : ""}${s.scanning ? " is-scanning" : ""}`}
      id={id("cap-demo")}
      {...dataProps}
    >
      <p className="cap-nojs nojs-only">{t(DEMO.nojs, lang)}</p>
      <ol className="cap-nojs nojs-only">{DEMO.titles.map((x, i) => <li key={i}>{rich(t(x, lang))}</li>)}</ol>
      <ol className="cap-stepper js-only" aria-label={plain(DEMO.stepsLabel, lang)}>
        {seq.map((n, i) => {
          const off = n > s.max || (!sample && n > 1);
          return (
            <li key={n}>
              <button
                type="button"
                className={`cap-step${n < s.step ? " is-done" : ""}`}
                data-go={n}
                aria-current={n === s.step ? "step" : undefined}
                aria-disabled={off ? "true" : undefined}
                onClick={() => { if (!off) go(n, true); }}
              >
                <span className="cap-step__n" aria-hidden="true">{i + 1}</span>
                <span className="cap-step__t">{rich(t(modal ? DEMO.modalTitles[i] : DEMO.titles[n - 1], lang))}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="cap-stage">
        <header className="cap-stage__head">
          <h3 className="cap-stage__title js-only" tabIndex={-1} ref={titleRef}>{rich(titleOf(s.step))}</h3>
          <p className="cap-tag cap-tag--demo cap-tag--banner">{t(DEMO.label, lang)}</p>
          <span className="cap-sr" role="status" aria-live="polite">{s.live}</span>
        </header>
        <div className="cap-stage__grid">
          <div className="cap-docs" ref={docsRef}>
            {samples.map((k) => <CaptureDoc key={k} k={k} lang={lang} hit={sample === k ? s.hit : ""} />)}
          </div>
          <div className="cap-panels">
            {!modal && (
              <div className="cap-panel" data-panel="1">
                <p className="cap-hint">{t(DEMO.hintChoose, lang)}</p>
                <div className="cap-picks">
                  {SAMPLE_KEYS.map((k) => {
                    const d = SAMPLES[k];
                    return (
                      <button type="button" className="cap-pick" data-pick={k} aria-pressed={sample === k} key={k} onClick={() => choose(k)}>
                        <span className="cap-pick__mini" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
                        <span className="cap-pick__name">{t(d.name, lang)}</span>
                        <span className="cap-pick__meta">{t(d.langs, lang)} · {t(DEMO.pages(d.pages), lang)}</span>
                        <span className="cap-pick__via">{t(DEMO.capturedVia, lang)}: {t(d.via, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="cap-panel" data-panel="2">
              <p className="cap-hint">{t(DEMO.hintExplore, lang)}</p>
              <div className="cap-zonebtns">
                {ZONE_KEYS.map((z) => (
                  <button
                    type="button" className="cap-zonebtn" data-zonebtn={z} key={z} aria-pressed={s.zonePressed === z}
                    onClick={() => {
                      const on = s.zonePressed !== z;
                      setS((p) => ({ ...p, zonePressed: on ? z : "", hit: on ? z : "", fieldHit: "" }));
                    }}
                  >{t(ZONE_NAMES[z], lang)}</button>
                ))}
              </div>
              {samples.map((k) => {
                const d = SAMPLES[k];
                return (
                  <dl className="cap-meta" data-for={k} key={k}>
                    <div><dt>{t(DEMO.pagesLabel, lang)}</dt><dd>{d.pages}</dd></div>
                    <div><dt>{t(DEMO.language, lang)}</dt><dd>{t(d.langs, lang)}</dd></div>
                    <div><dt>{t(DEMO.capturedVia, lang)}</dt><dd>{t(d.via, lang)}</dd></div>
                  </dl>
                );
              })}
            </div>
            <div className="cap-panel" data-panel="3">
              <p className="cap-recog">
                <span className="cap-recog__run">{t(DEMO.reading, lang)}</span>
                <span className="cap-recog__done">{t(DEMO.recognized, lang)}<strong>{sample ? t(SAMPLES[sample].langs, lang) : ""}</strong></span>
              </p>
              <p className="cap-hint">{t(DEMO.excerptHint, lang)}</p>
              {samples.map((k) => (
                <div className="cap-excerpt" data-for={k} key={k}>
                  {SAMPLES[k].excerpt.map(([l, d], i) => <p dir={d} lang={d === "rtl" ? "ar" : "en"} key={i}>{l}</p>)}
                </div>
              ))}
              <p className="cap-note">{rich(t(DEMO.recogNote, lang))}</p>
            </div>
            {!modal && (
              <div className="cap-panel" data-panel="4">
                <p className="cap-hint">{tag("demo")} {t(DEMO.suggestedType, lang)}:</p>
                {SAMPLE_KEYS.map((k) => (
                  <fieldset className="cap-types" data-for={k} key={k}>
                    <legend className="cap-sr">{t(DEMO.typeLegend, lang)}</legend>
                    {SAMPLES[k].types.map((ty, i) => (
                      <label className="cap-type" key={i}>
                        <input
                          type="radio" name={`${idp}type-${k}`} value={t(ty, lang)}
                          checked={(s.typeSel[k] ?? 0) === i}
                          onChange={() => setS((p) => ({ ...p, typeSel: { ...p.typeSel, [k]: i } }))}
                        />
                        <span>{t(ty, lang)}{i === 0 ? <> <em>{t(DEMO.suggested, lang)}</em></> : null}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
                <p className="cap-note">{rich(t(DEMO.classNote, lang))}</p>
              </div>
            )}
            <div className="cap-panel" data-panel="5">
              <p className="cap-hint">{t(DEMO.extractHint, lang)}</p>
              <p className="cap-recog" aria-hidden="true">
                {s.extracting
                  ? t(DEMO.extracting, lang)
                  : sample ? <span className="cap-recog__ok">{plain(DEMO.extractedN, lang).replace("{n}", String(SAMPLES[sample].fields.filter((f) => f.z).length))}</span> : null}
              </p>
              {samples.map((k) => {
                const items = SAMPLES[k].fields.filter((f) => f.z);
                const shown = s.extracted[k] ?? 0;
                return (
                  <ol className="cap-extract" data-for={k} key={k}>
                    {items.slice(0, shown).map((f) => (
                      <li className={`cap-ex${s.hit === f.z && sample === k && s.fieldHit === f.key ? " is-hit" : ""}`} key={f.key}>
                        <span className="cap-ex__l">{label(f, lang)}</span>
                        <b className="cap-ex__v" dir="auto">{f.v}</b>
                        <button
                          type="button" className="cap-zonechip"
                          onClick={() => showZone(f.z as ZoneKey, f.key)}
                        >{t(ZONE_NAMES[f.z as ZoneKey], lang)}</button>
                      </li>
                    ))}
                  </ol>
                );
              })}
              <p className="cap-note">{t(DEMO.extractNote, lang)}</p>
            </div>
            <div className="cap-panel" data-panel="6">
              <p className="cap-hint">{t(DEMO.fieldsHint, lang)}</p>
              {samples.map((k) => (
                <div className="cap-fields" data-for={k} key={k} aria-busy={s.typing && sample === k ? "true" : "false"}>
                  {SAMPLES[k].fields.map((f) => {
                    const st = chipState(k, f.key);
                    const fid = id(`f-${k}-${f.key}`);
                    return (
                      <div className={`cap-field${s.fieldHit === f.key && sample === k ? " is-hit" : ""}`} data-z={f.z} key={f.key}>
                        <label htmlFor={fid}>{label(f, lang)}</label>
                        <input
                          id={fid} data-key={f.key} dir="auto" autoComplete="off"
                          type={f.type === "date" ? "date" : "text"}
                          inputMode={f.type === "number" ? "decimal" : undefined}
                          placeholder={f.v ? undefined : plain(DEMO.empty, lang)}
                          value={s.vals[k]?.[f.key] ?? ""}
                          disabled={s.typing && sample === k}
                          onChange={(e) => { if (s.filled[k]) patchVals(k, f.key, e.target.value); }}
                          onFocus={() => showZone(f.z, f.key)}
                          onBlur={() => setS((p) => ({ ...p, hit: "", fieldHit: "" }))}
                        />
                        <span className="cap-chip" data-state={st || undefined}>{st === "proposed" ? t(DEMO.proposed, lang) : st === "edited" ? t(DEMO.edited, lang) : ""}</span>
                        <button
                          type="button" className="cap-reset" hidden={st !== "edited"}
                          onClick={() => { patchVals(k, f.key, f.v); (document.getElementById(fid) as HTMLInputElement | null)?.focus(); }}
                        >{t(DEMO.reset, lang)}</button>
                        <span className="cap-src">
                          {f.z ? (
                            <button type="button" className="cap-srcbtn" onClick={() => showZone(f.z as ZoneKey, f.key)}>
                              {plain(DEMO.source, lang).replace("{z}", plain(ZONE_NAMES[f.z as ZoneKey], lang))}
                            </button>
                          ) : (
                            <span className="cap-src__staff">{t(DEMO.staff, lang)}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <p className="cap-note">{t(DEMO.fieldsNote, lang)}</p>
            </div>
            <div className="cap-panel" data-panel="7">
              <div className="cap-stampdemo">
                <Stamp lg seed={sample ? SAMPLES[sample].seed : 418} code={sample ? SAMPLES[sample].code : ""} dataCode />
              </div>
              <p className="cap-note">{rich(t(DEMO.stampNote, lang))}</p>
              <p className="cap-side cap-side--dim">{tag("potential")}<span>{t(DEMO.stampPotential, lang)}</span></p>
            </div>
            <div className="cap-panel" data-panel="8">
              {samples.map((k) => {
                const d = SAMPLES[k];
                const sel = d.types[s.typeSel[k] ?? 0];
                return (
                  <dl className="cap-record" data-for={k} key={k}>
                    <div><dt>{t(DEMO.docType, lang)}</dt><dd>{t(sel, lang)}</dd></div>
                    <div><dt>{t(DEMO.folder, lang)}</dt><dd>{t(d.folder, lang)}</dd></div>
                    {d.fields.map((f) => <div key={f.key}><dt>{label(f, lang)}</dt><dd>{s.vals[k]?.[f.key] || DEMO.none}</dd></div>)}
                    <div><dt>{t(DEMO.code, lang)}</dt><dd><bdi>{d.code}</bdi></dd></div>
                    <div><dt>{t(DEMO.capturedVia, lang)}</dt><dd>{t(d.via, lang)}</dd></div>
                    <div><dt>{t(DEMO.recognition, lang)}</dt><dd>{t(DEMO.done, lang)}{t(d.langs, lang)}</dd></div>
                    <div><dt>{t(DEMO.permissions, lang)}</dt><dd>{t(DEMO.folderRules, lang)}</dd></div>
                  </dl>
                );
              })}
              <p className="cap-done" role="status">{t(DEMO.ready, lang)}</p>
              <p className="cap-note">{t(DEMO.recordNote, lang)}</p>
            </div>
          </div>
        </div>
        <div className="cap-stage__foot js-only">
          <button type="button" className="btn btn--ghost-gold" data-back aria-disabled={backDisabled ? "true" : "false"} onClick={() => { if (!backDisabled) retreat(); }}>{t(DEMO.back, lang)}</button>
          <button type="button" className="btn btn--gold" data-next aria-disabled={nextDisabled ? "true" : "false"} onClick={() => { if (!nextDisabled) advance(); }}>{lastLabel}</button>
        </div>
      </div>
    </div>
  );
});

export default CaptureDemo;
