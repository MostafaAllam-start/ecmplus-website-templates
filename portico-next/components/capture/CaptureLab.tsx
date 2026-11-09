"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { DEMO, SAMPLES, SAMPLE_KEYS, fmt, plain, type SampleKey } from "@/data/capture";
import { rich } from "@/lib/rich";
import type { Lang } from "@/lib/site";
import CaptureDemo, { type CaptureDemoHandle, type DemoMode } from "./CaptureDemo";
import type { CodeMode } from "./CaptureDocs";
import CaptureModal from "./CaptureModal";
import CaptureDialog from "./CaptureDialog";
import CaptureCheck from "./CaptureCheck";
import CaptureScreen from "./CaptureScreen";
import CaptureDms from "./CaptureDms";
import { CHECK, DMS as DMS_STR, SCAN } from "@/data/capture-tools";

export type ToolKind = "check" | "scan" | "dms";
interface ToolState { kind: ToolKind; sheet: number; cat: number; T: number; fid?: string }

/**
 * Imperative handle on the demonstration, for the factory controller (or anything else under
 * <CaptureLab>) to drive it:
 *   const api = useCaptureDemo();
 *   api.start("invoice");                 // modal mode (default): opens the six-step category dialog
 *   api.start("invoice", { resume: true }) // re-open the dialog keeping progress if it is on "invoice"
 *   api.replay();                         // restart the current sample from its first step
 *   api.setMode("inline");                // start() now picks the sample in the inline 8-step wizard
 *   api.close();                          // close the dialog (focus returns to the opener)
 *   const off = api.onClose(() => ...);   // dialog closed (Esc, backdrop, X, "Back to the workflow")
 */
export interface CaptureDemoApi {
  /** `step` (modal demo step: 2 preview, 3 scan, 5 extraction, 6 metadata, 7 code, 8 record) opens the dialog there. */
  start(key: SampleKey, opts?: { resume?: boolean; step?: number }): void;
  replay(): void;
  setMode(mode: DemoMode): void;
  /** Barcode or QR: shared by the factory toolbar, the dialog and the inline wizard. */
  codeMode: CodeMode;
  setCodeMode(m: CodeMode): void;
  onCodeMode(cb: (m: CodeMode) => void): () => void;
  /** The factory controller publishes the dialog step that matches its current stage (category chips open there). */
  setStageStep(step: number | undefined): void;
  /** Open one of the factory dialogs: "check" (sheet), "scan" (sheet) or "dms" (category). One dialog at a time. */
  openTool(kind: ToolKind, o?: { sheet?: number; cat?: number; T?: number; fid?: string }): void;
  close(): void;
  onClose(cb: () => void): () => void;
  readonly mode: DemoMode;
  readonly isOpen: boolean;
}
const noop: CaptureDemoApi = {
  start() {}, replay() {}, setMode() {}, close() {}, onClose: () => () => {}, mode: "modal", isOpen: false,
  codeMode: "barcode", setCodeMode() {}, onCodeMode: () => () => {}, setStageStep() {}, openTool() {},
};
const Ctx = createContext<CaptureDemoApi>(noop);
export const useCaptureDemo = (): CaptureDemoApi => useContext(Ctx);

/** Section 01 body (`#cap-lab`): category chips, the inline demonstration and the category dialog. */
export default function CaptureLab({ lang, children }: { lang: Lang; children?: ReactNode }) {
  const [mode, setModeState] = useState<DemoMode>("modal");
  const modeRef = useRef<DemoMode>("modal");
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [cat, setCat] = useState<SampleKey>("invoice");
  const [nonce, setNonce] = useState(0);
  const pending = useRef<{ key: SampleKey; resume: boolean; step?: number } | null>(null);
  const [code, setCodeState] = useState<CodeMode>("barcode");
  const codeRef = useRef<CodeMode>("barcode");
  const codeListeners = useRef(new Set<(m: CodeMode) => void>());
  const stageStep = useRef<number | undefined>(undefined);
  const [tool, setTool] = useState<ToolState | null>(null);
  const [toolMounted, setToolMounted] = useState(false);
  const toolOpenRef = useRef(false);
  const modalSilent = useRef(false);
  const returnDms = useRef<{ folder: number; fid: string } | null>(null);
  const toolSilent = useRef(false);
  const setCode = useCallback((m: CodeMode) => {
    if (codeRef.current === m) return;
    codeRef.current = m;
    setCodeState(m);
    codeListeners.current.forEach((cb) => cb(m));
  }, []);
  const inlineRef = useRef<CaptureDemoHandle>(null);
  const modalRef = useRef<CaptureDemoHandle>(null);
  const listeners = useRef(new Set<() => void>());

  const setOpenBoth = (v: boolean) => { openRef.current = v; setOpen(v); };

  // The dialog is mounted on first use; once its demo exists, start the pending flow.
  useEffect(() => {
    const p = pending.current;
    if (!p || !open || !modalRef.current) return;
    pending.current = null;
    modalRef.current.start(p.key, { resume: p.resume, step: p.step });
  }, [open, nonce]);

  const start = useCallback((key: SampleKey, opts?: { resume?: boolean; step?: number }) => {
    if (modeRef.current === "inline") {
      inlineRef.current?.start(key);
      document.getElementById("cap-demo")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    pending.current = { key, resume: !!opts?.resume, step: opts?.step };
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
    get codeMode() { return codeRef.current; },
    setCodeMode: setCode,
    onCodeMode(cb) { codeListeners.current.add(cb); return () => { codeListeners.current.delete(cb); }; },
    setStageStep(n) { stageStep.current = n; },
    openTool(kind, o = {}) {
      if (openRef.current) { modalSilent.current = true; setOpenBoth(false); }
      returnDms.current = null;
      toolOpenRef.current = true;
      setTool({ kind, sheet: o.sheet ?? 0, cat: o.cat ?? 0, T: o.T ?? 0, fid: o.fid });
      setToolMounted(true);
    },
    close() { setOpenBoth(false); },
    onClose(cb) { listeners.current.add(cb); return () => { listeners.current.delete(cb); }; },
    get mode() { return modeRef.current; },
    get isOpen() { return openRef.current; },
  }), [start, setCode]);

  const keepLock = () => { if (document.querySelector("dialog[open]")) document.documentElement.classList.add("cap-modal-open"); };
  const handleToolClose = () => {
    keepLock();
    toolOpenRef.current = false;
    setTool(null);
    if (toolSilent.current) { toolSilent.current = false; return; }
    listeners.current.forEach((cb) => cb());
  };
  const toolToModal = (cat: number, step: number) => {
    if (toolOpenRef.current) toolSilent.current = true;
    toolOpenRef.current = false;
    setTool(null);
    start(SAMPLE_KEYS[cat], { step });
  };
  const modalToDms = (cat: number) => api.openTool("dms", { cat });
  // a row in the archive opens that document in the category dialog (record step); closing it brings the archive back
  const dmsToModal = (cat: number, folder: number, fid: string) => {
    if (toolOpenRef.current) toolSilent.current = true;
    toolOpenRef.current = false;
    setTool(null);
    start(SAMPLE_KEYS[cat], { step: 8 });
    returnDms.current = { folder, fid };
  };
  const handleClose = () => {
    keepLock();
    const back = returnDms.current;
    if (back && !modalSilent.current) {
      returnDms.current = null;
      setOpenBoth(false);
      api.openTool("dms", { cat: back.folder, fid: back.fid });
      return;
    }
    if (modalSilent.current) { modalSilent.current = false; setOpenBoth(false); return; }
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
              <button type="button" className="cap-cat" aria-haspopup="dialog" data-cat={k} key={k} onClick={() => start(k, { step: modeRef.current === "modal" ? stageStep.current : undefined })}>
                <span className="cap-cat__dot" style={{ background: `var(--cap-cat${SAMPLE_KEYS.indexOf(k)})` }} aria-hidden="true"></span>
                {rich(fmt(SAMPLES[k].name, lang))}
              </button>
            ))}
          </div>
        </div>
        <CaptureDemo ref={inlineRef} lang={lang} mode="inline" code={code} onCode={setCode} onDms={modalToDms} />
        {mounted && (
          <CaptureModal
            open={open}
            onClose={handleClose}
            title={catName}
            replayLabel={fmt(DEMO.replay, lang)}
            closeLabel={fmt(DEMO.close, lang)}
            onReplay={() => modalRef.current?.replay()}
          >
            <CaptureDemo ref={modalRef} lang={lang} mode="modal" idp="m-" code={code} onCode={setCode} onDms={modalToDms} onExit={() => api.close()} />
          </CaptureModal>
        )}
        {toolMounted && (
          <CaptureDialog
            open={!!tool}
            onClose={handleToolClose}
            titleId="cap-tool-title"
            title={tool ? plain(tool.kind === "check" ? CHECK.title : tool.kind === "scan" ? SCAN.title : DMS_STR.title, lang) : ""}
            closeLabel={fmt(DEMO.close, lang)}
            className={tool ? `cap-tool--${tool.kind}` : ""}
          >
            {tool?.kind === "check" && <CaptureCheck lang={lang} start={tool.sheet} />}
            {tool?.kind === "scan" && <CaptureScreen lang={lang} start={tool.sheet} T={tool.T} onContinue={toolToModal} />}
            {tool?.kind === "dms" && <CaptureDms lang={lang} start={tool.cat} fid={tool.fid} onOpen={dmsToModal} />}
          </CaptureDialog>
        )}
      </div>
    </Ctx.Provider>
  );
}
