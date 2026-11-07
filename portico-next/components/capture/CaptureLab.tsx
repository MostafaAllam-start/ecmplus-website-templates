"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { DEMO, SAMPLES, SAMPLE_KEYS, fmt, plain, type SampleKey } from "@/data/capture";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";
import CaptureDemo, { type CaptureDemoHandle, type DemoMode } from "./CaptureDemo";
import CaptureModal from "./CaptureModal";

/**
 * Imperative handle on the demonstration, for the factory controller (or anything else under
 * <CaptureLab>) to drive it:
 *   const api = useCaptureDemo();
 *   api.start("invoice");                 // modal mode (default): opens the six-step category dialog
 *   api.start("invoice", { resume: true }) // re-open the dialog keeping progress if it is on "invoice"
 *   api.replay();                         // restart the current sample from its first step
 *   api.setMode("inline");                // start() now picks the sample in the inline 8-step wizard
 *   api.close();                          // close the dialog (focus returns to the opener)
 *   const off = api.onClose(() => ...);   // dialog closed (Esc, backdrop, X, "Back to the factory")
 */
export interface CaptureDemoApi {
  start(key: SampleKey, opts?: { resume?: boolean }): void;
  replay(): void;
  setMode(mode: DemoMode): void;
  close(): void;
  onClose(cb: () => void): () => void;
  readonly mode: DemoMode;
  readonly isOpen: boolean;
}
const noop: CaptureDemoApi = {
  start() {}, replay() {}, setMode() {}, close() {}, onClose: () => () => {}, mode: "modal", isOpen: false,
};
const Ctx = createContext<CaptureDemoApi>(noop);
export const useCaptureDemo = (): CaptureDemoApi => useContext(Ctx);

/** Section 03 body (`#cap-lab`): category chips, the inline demonstration and the category dialog. */
export default function CaptureLab({ lang, children }: { lang: Lang; children?: ReactNode }) {
  const [mode, setModeState] = useState<DemoMode>("modal");
  const modeRef = useRef<DemoMode>("modal");
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [cat, setCat] = useState<SampleKey>("invoice");
  const [nonce, setNonce] = useState(0);
  const pending = useRef<{ key: SampleKey; resume: boolean } | null>(null);
  const inlineRef = useRef<CaptureDemoHandle>(null);
  const modalRef = useRef<CaptureDemoHandle>(null);
  const listeners = useRef(new Set<() => void>());

  const setOpenBoth = (v: boolean) => { openRef.current = v; setOpen(v); };

  // The dialog is mounted on first use; once its demo exists, start the pending flow.
  useEffect(() => {
    const p = pending.current;
    if (!p || !open || !modalRef.current) return;
    pending.current = null;
    modalRef.current.start(p.key, { resume: p.resume });
  }, [open, nonce]);

  const start = useCallback((key: SampleKey, opts?: { resume?: boolean }) => {
    if (modeRef.current === "inline") {
      inlineRef.current?.start(key);
      document.getElementById("cap-demo")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    pending.current = { key, resume: !!opts?.resume };
    setCat(key);
    setMounted(true);
    setOpenBoth(true);
    setNonce((n) => n + 1);
  }, []);

  const api = useMemo<CaptureDemoApi>(() => ({
    start,
    replay() {
      (modeRef.current === "modal" ? modalRef : inlineRef).current?.replay();
    },
    setMode(m) { modeRef.current = m; setModeState(m); },
    close() { setOpenBoth(false); },
    onClose(cb) { listeners.current.add(cb); return () => { listeners.current.delete(cb); }; },
    get mode() { return modeRef.current; },
    get isOpen() { return openRef.current; },
  }), [start]);

  const handleClose = () => {
    const was = openRef.current;
    setOpenBoth(false);
    if (was) listeners.current.forEach((cb) => cb());
  };

  const catName = plain(SAMPLES[cat].name, lang);
  return (
    <Ctx.Provider value={api}>
      <div className="cap-lab" id="cap-lab" data-mode={mode}>
        {children}
        <div className="cap-cats js-only" role="group" aria-labelledby="cap-cats-label">
          <p className="cap-cats__label" id="cap-cats-label">{fmt(DEMO.catLabel, lang)}<span>{fmt(DEMO.catHint, lang)}</span></p>
          <div className="cap-cats__row">
            {SAMPLE_KEYS.map((k) => (
              <button type="button" className="cap-cat" aria-haspopup="dialog" data-cat={k} key={k} onClick={() => start(k)}>
                <span className="cap-cat__dot" style={{ background: SAMPLES[k].color }} aria-hidden="true"></span>
                {rich(fmt(SAMPLES[k].name, lang))}
              </button>
            ))}
          </div>
        </div>
        <CaptureDemo ref={inlineRef} lang={lang} mode="inline" />
        {mounted && (
          <CaptureModal
            open={open}
            onClose={handleClose}
            title={catName}
            color={SAMPLES[cat].color}
            replayLabel={fmt(DEMO.replay, lang)}
            closeLabel={fmt(DEMO.close, lang)}
            onReplay={() => modalRef.current?.replay()}
          >
            <CaptureDemo ref={modalRef} lang={lang} mode="modal" idp="m-" onExit={() => api.close()} />
          </CaptureModal>
        )}
      </div>
    </Ctx.Provider>
  );
}
