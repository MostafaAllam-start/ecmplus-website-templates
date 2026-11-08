"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import type * as THREE_NS from "three";
import { SAMPLE_KEYS, type FactoryCopy } from "@/data/capture";
import { withBase, type Lang } from "@/lib/site";
import { useCaptureDemo, type CaptureDemoApi } from "./CaptureLab";

/* ---- Scene contract (lib/factory/scene.ts) ---- */
type FactoryColors = Record<string, string>;
interface FactoryScene {
  scene: THREE_NS.Scene;
  stages: { t0: number; t1: number; aabb: THREE_NS.Box3 }[];
  overviewAabb: THREE_NS.Box3;
  duration: number;
  update(T: number): void;
  setColors(c: FactoryColors): void;
  pick(raycaster: THREE_NS.Raycaster): number;
  hover(cat: number): void;
  anchors(): { id: string; pos: THREE_NS.Vector3 }[];
  counter(T: number): { archived: number; total: number; flagged: boolean; paper?: number };
  pickDoc?(raycaster: THREE_NS.Raycaster, T: number): { cat: number; kind: string; sheet?: number } | null;
  setCodeMode?(mode: "barcode" | "qr"): void;
  dispose(): void;
}
interface SceneModule {
  createFactoryScene(THREE: typeof THREE_NS, opts: { rtl: boolean; colors: FactoryColors; coarse: boolean; logoSrc?: string }): FactoryScene;
}
const loadScene = (): Promise<SceneModule> => import("@/lib/factory/scene");

const COLOR_TOKENS = ["floor", "belt", "machine", "accent", "navy", "graphite", "ok", "warn", "bad", "cat0", "cat1", "cat2", "cat3", "cat4", "bg"];
const OV_IDS = new Set(["header", "title", "refs", "dates", "body", "table", "footer"]);
const AREA_IDS = new Set(["manual", "rescan", "digital", "originals", "archive", "paperArchive"]);
// Modal step (preview 2, scan 3, extraction 5, metadata 6, code 7, record 8) that matches each factory stage.
const STAGE_STEP = [2, 2, 3, 3, 5, 6, 7];
// Which stage indices (0-based) each label belongs to; unlisted ids follow the stage box.
const LABEL_STAGES: Record<string, number[]> = {
  manual: [0], cat0: [1], cat1: [1], cat2: [1], cat3: [1], cat4: [1], originals: [2], digital: [2, 3], rescan: [3],
  header: [4], title: [4], refs: [4], dates: [4], body: [4], table: [4], footer: [4], archive: [6], paperArchive: [6],
};
const ELEV = (32 * Math.PI) / 180;
const AZ = (35 * Math.PI) / 180;
const LOAD_TIMEOUT = 8000;

type Status = "idle" | "loading" | "on" | "off";
const tpl = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

interface Controls {
  seek(t: number): void;
  request(): void;
  seekStage(i: number): void;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The animated 3D document factory above the category chips. Lazily loads `three` and the scene,
 * drives one clock T, and falls back (data-factory="off" on #cap-lab) to the 2D demonstration when
 * motion is reduced, WebGL or the import fails, loading takes over 8 s, or the context is lost.
 */
export default function CaptureFactory({ lang, copy }: { lang: Lang; copy: FactoryCopy }) {
  const api = useCaptureDemo();
  const apiRef = useRef(api);
  apiRef.current = api;
  const copyRef = useRef(copy);
  copyRef.current = copy;

  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const archivedRef = useRef<HTMLSpanElement>(null);
  const flaggedRef = useRef<HTMLSpanElement>(null);
  const paperRef = useRef<HTMLSpanElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLOListElement>(null);
  const ctl = useRef<Controls | null>(null);

  const [status, setStatusState] = useState<Status>("idle");
  const [playing, setPlayingState] = useState(true);
  const [overview, setOverviewState] = useState(false);
  const [active, setActive] = useState(0);
  const [full, setFull] = useState(false);
  const [capOpen, setCapOpen] = useState(true);
  useEffect(() => {
    let v: string | null = null;
    try { v = sessionStorage.getItem("cf-cap-open"); } catch { /* ignore */ }
    setCapOpen(v === null ? !window.matchMedia("(max-width: 600px)").matches : v === "1");
  }, []);
  const fullRef = useRef(false);
  const scrollY = useRef(0);
  const [live, setLive] = useState("");
  const playingRef = useRef(true);
  const overviewRef = useRef(false);
  const liveN = useRef(0);

  const announce = useCallback((msg: string) => {
    liveN.current += 1;
    setLive(msg + (liveN.current % 2 ? "" : " "));
  }, []);
  const setPlay = useCallback((v: boolean) => {
    playingRef.current = v;
    setPlayingState(v);
    ctl.current?.request();
  }, []);

  /* ---- the whole runtime lives in one effect ---- */
  useEffect(() => {
    const lab = document.getElementById("cap-lab");
    const frame = frameRef.current!;
    const host = hostRef.current!;
    const stageEl = stageRef.current!;
    const labelsEl = labelsRef.current!;
    const root = document.documentElement;
    const rtl = lang === "ar";
    const FX = rtl ? -1 : 1;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let statusNow: Status = "idle";
    const setStatus = (s: Status) => {
      statusNow = s;
      setStatusState(s);
      lab?.setAttribute("data-factory", s);
      if (s === "on") apiRef.current.setMode("modal");
      if (s === "off") apiRef.current.setMode("inline");
    };

    let T = 0;
    let visible = true;
    let modalOpen = false;
    let wasPlaying = false;
    let dead = false; // effect cleaned up
    let booting = false;
    let bootToken = 0;

    // Per-build objects, null while torn down.
    let THREE: typeof THREE_NS | null = null;
    let renderer: THREE_NS.WebGLRenderer | null = null;
    let fs: FactoryScene | null = null;
    let camera: THREE_NS.OrthographicCamera | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let raf = 0;
    let last = 0;
    let snap = true;
    let hovered = -1;
    let hoverSig = "";
    let slow = 0;
    let dpr = 1;
    let dprCap = 1;
    let curStage = 0;
    let camTarget: THREE_NS.Vector3 | null = null;
    let camHH = 10;
    let size = { w: 0, h: 0 };
    let cleanups: (() => void)[] = [];
    const labelEls = new Map<string, HTMLElement>();
    let projV: THREE_NS.Vector3 | null = null;
    let lastArch = "";
    let lastPaper = "";
    let lastFlag = false;

    const readColors = (): FactoryColors => {
      const cs = getComputedStyle(frame);
      const out: FactoryColors = {};
      for (const k of COLOR_TOKENS) out[k] = cs.getPropertyValue(`--cf-${k}`).trim();
      return out;
    };

    const request = () => {
      if (!raf && renderer && !dead) raf = requestAnimationFrame(frameFn);
    };

    const stageAt = (t: number) => {
      const st = fs?.stages;
      if (!st) return 0;
      for (let i = 0; i < st.length; i++) if (t >= st[i].t0 && t < st[i].t1) return i;
      return st.length - 1;
    };

    // Camera direction (from target towards the camera) and its screen basis.
    const az = FX * AZ;
    const dirX = Math.sin(az) * Math.cos(ELEV);
    const dirY = Math.sin(ELEV);
    const dirZ = Math.cos(az) * Math.cos(ELEV);
    const rightX = Math.cos(az);
    const rightZ = -Math.sin(az);

    const fit = (box: THREE_NS.Box3, aspect: number) => {
      const c = box.getCenter(new THREE!.Vector3());
      // screen up = cross(right, forward), forward = -dir
      const fx = -dirX, fy = -dirY, fz = -dirZ;
      const ux = 0 * fz - rightZ * fy;
      const uy = rightZ * fx - rightX * fz;
      const uz = rightX * fy - 0 * fx;
      let mx = 0, my = 0;
      for (let i = 0; i < 8; i++) {
        const px = (i & 1 ? box.max.x : box.min.x) - c.x;
        const py = (i & 2 ? box.max.y : box.min.y) - c.y;
        const pz = (i & 4 ? box.max.z : box.min.z) - c.z;
        mx = Math.max(mx, Math.abs(px * rightX + pz * rightZ));
        my = Math.max(my, Math.abs(px * ux + py * uy + pz * uz));
      }
      // Portrait frames crop the box ends a little rather than leaving the height mostly empty.
      return { c, hh: Math.max(my, mx / Math.max(aspect, 0.95)) * 1.06 + 0.4 };
    };

    const applyCamera = () => {
      if (!camera || !camTarget) return;
      const aspect = size.w / Math.max(size.h, 1);
      const D = 220;
      camera.position.set(camTarget.x + dirX * D, camTarget.y + dirY * D, camTarget.z + dirZ * D);
      camera.lookAt(camTarget);
      camera.left = -camHH * aspect;
      camera.right = camHH * aspect;
      camera.top = camHH;
      camera.bottom = -camHH;
      camera.near = 1;
      camera.far = 600;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    };

    const frameFn = (now: number) => {
      raf = 0;
      if (!renderer || !fs || !camera || !THREE) return;
      const rawDt = last ? now - last : 16;
      const dt = Math.min(rawDt / 1000, 0.1);
      last = now;
      const running = playingRef.current && !modalOpen && visible && !document.hidden;
      if (running) {
        T += dt;
        if (T >= fs.duration) T -= fs.duration;
        slow = rawDt > 33 ? slow + 1 : 0;
        if (slow >= 30 && dpr > 1) {
          dpr = 1;
          slow = 0;
          renderer.setPixelRatio(1);
          renderer.setSize(size.w, size.h, false);
        }
      }
      const si = stageAt(T);
      if (si !== curStage) {
        curStage = si;
        setActive(si);
      }

      // Damped camera following the active stage (or the overview).
      const aspect = size.w / Math.max(size.h, 1);
      const want = fit(overviewRef.current ? fs.overviewAabb : fs.stages[si].aabb, aspect);
      let settling = false;
      if (!camTarget) camTarget = want.c.clone();
      if (snap) {
        camTarget.copy(want.c);
        camHH = want.hh;
        snap = false;
      } else {
        const k = 1 - Math.exp(-3.5 * dt);
        camTarget.lerp(want.c, k);
        camHH += (want.hh - camHH) * k;
        settling = camTarget.distanceTo(want.c) > 0.02 || Math.abs(want.hh - camHH) > 0.02;
        if (!settling) {
          camTarget.copy(want.c);
          camHH = want.hh;
        }
      }
      applyCamera();
      fs.update(T);
      renderer.render(fs.scene, camera);
      updateOverlays(si);
      if (running || settling) request();
      else last = 0;
    };

    const updateOverlays = (si: number) => {
      if (!fs || !camera || !THREE) return;
      const c = fs.counter(T);
      const arch = c.archived > 0 ? tpl(copyRef.current.archived, { n: c.archived, total: c.total }) : "";
      if (arch !== lastArch && archivedRef.current) {
        lastArch = arch;
        archivedRef.current.textContent = arch;
        archivedRef.current.hidden = !arch;
      }
      const pap = c.paper ? tpl(copyRef.current.paperArchived, { n: c.paper, total: c.total }) : "";
      if (pap !== lastPaper && paperRef.current) {
        lastPaper = pap;
        paperRef.current.textContent = pap;
        paperRef.current.hidden = !pap;
      }
      if (c.flagged !== lastFlag && flaggedRef.current) {
        lastFlag = c.flagged;
        flaggedRef.current.hidden = !c.flagged;
      }
      const tv = (projV ||= new THREE.Vector3());
      const box = overviewRef.current ? null : fs.stages[si].aabb.clone().expandByScalar(2);
      const used = new Set<string>();
      for (const a of fs.anchors()) {
        const text = copyRef.current.labels[a.id];
        if (!text) continue;
        let el = labelEls.get(a.id);
        if (!el) {
          el = document.createElement("span");
          el.className = "cf__label";
          el.textContent = text;
          labelsEl.appendChild(el);
          labelEls.set(a.id, el);
        }
        used.add(a.id);
        tv.copy(a.pos).project(camera);
        const x = (tv.x * 0.5 + 0.5) * size.w;
        const y = (-tv.y * 0.5 + 0.5) * size.h;
        const inView = x > 0 && x < size.w && y > 0 && y < size.h && tv.z < 1;
        const relevant = a.id === "flagged" ? c.flagged : overviewRef.current ? a.id.startsWith("cat") || AREA_IDS.has(a.id) : (LABEL_STAGES[a.id] ? LABEL_STAGES[a.id].includes(si) : box!.containsPoint(a.pos));
        // the card is too small to label zone by zone; the overview is too small for the crowded west-side area labels
        const narrowHide = size.w < 600 && (OV_IDS.has(a.id) || (overviewRef.current && (a.id === "manual" || a.id === "rescan" || a.id === "originals")));
        const on = inView && relevant && !narrowHide;
        const isBin = a.id.startsWith("cat");
        const ov = overviewRef.current;
        // overview: bins sit a metre apart, so use the first word of each name and fan the pills over three heights
        const shown = ov && isBin ? text.split(/\s+/)[0] : text;
        if (el.textContent !== shown) el.textContent = shown;
        // Later bins sit lower on screen, so in overview the lift falls with the bin index and the pills never stack.
        const kBin = isBin ? Number(a.id.slice(3)) % 3 : 0;
        let lift = 0;
        if (isBin && ov) lift = 14 + (4 - Number(a.id.slice(3))) * 22;
        else if (isBin && size.w < 600) lift = kBin * 22;
        else if (ov && a.id === "originals") lift = -36; // sits right under "Rescan line": hang it below its marker
        el.style.transform = `translate3d(${x.toFixed(1)}px,${(y - lift).toFixed(1)}px,0) translate(-50%,-130%)`;
        el.classList.toggle("is-on", on);
      }
      for (const [id, el] of labelEls) if (!used.has(id)) el.classList.remove("is-on");
    };

    const pickAt = (e: PointerEvent | MouseEvent): { cat: number; kind: string; sheet?: number } | null => {
      if (!THREE || !fs || !camera || !canvas) return null;
      const r = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      if (fs.pickDoc) return fs.pickDoc(ray, T);
      const b = fs.pick(ray);
      return b >= 0 ? { cat: b, kind: "bin" } : null;
    };

    const onModalOpen = () => {
      if (modalOpen) return;
      modalOpen = true;
      if (playingRef.current) {
        wasPlaying = true;
        setPlay(false);
      }
    };
    const offClose = apiRef.current.onClose(() => {
      modalOpen = false;
      if (wasPlaying) {
        wasPlaying = false;
        setPlay(true);
      }
      announce(copyRef.current.back);
      last = 0;
      request();
    });
    const classObs = new MutationObserver(() => {
      if (root.classList.contains("cap-modal-open")) onModalOpen();
    });
    classObs.observe(root, { attributes: true, attributeFilter: ["class"] });

    const teardown = () => {
      bootToken++;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      cleanups.forEach((f) => f());
      cleanups = [];
      try { fs?.dispose(); } catch { /* ignore */ }
      if (renderer) {
        try { renderer.dispose(); renderer.forceContextLoss(); } catch { /* ignore */ }
      }
      canvas?.remove();
      for (const el of labelEls.values()) el.remove();
      labelEls.clear();
      fs = null; renderer = null; camera = null; canvas = null; camTarget = null;
      last = 0; hovered = -1; hoverSig = ""; snap = true; lastArch = ""; lastPaper = ""; lastFlag = false;
    };

    const fail = () => {
      if (dead || statusNow === "off") return;
      teardown();
      booting = false;
      ctl.current = null;
      setStatus("off");
    };

    const init = (three: typeof THREE_NS, mod: SceneModule) => {
      THREE = three;
      const colors = readColors();
      canvas = document.createElement("canvas");
      canvas.className = "cf__canvas";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
      renderer = new three.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      dprCap = coarse ? 1.5 : 2;
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(colors.bg);
      fs = mod.createFactoryScene(three, { rtl, colors, coarse, logoSrc: withBase("/assets/brand/ecmplus-mark.png") });
      fs.setCodeMode?.(apiRef.current.codeMode);
      const offCode = apiRef.current.onCodeMode((m) => { fs?.setCodeMode?.(m); request(); });
      cleanups.push(offCode);
      camera = new three.OrthographicCamera(-1, 1, 1, -1, 1, 600);
      camTarget = null;
      snap = true;

      const onLost = (e: Event) => { e.preventDefault(); fail(); };
      canvas.addEventListener("webglcontextlost", onLost);
      const cv = canvas;
      cleanups.push(() => cv.removeEventListener("webglcontextlost", onLost));

      const ro = new ResizeObserver(() => {
        const w = stageEl.clientWidth, h = stageEl.clientHeight;
        if (!w || !h || !renderer) return;
        size = { w, h };
        renderer.setSize(w, h, false);
        snap = true;
        request();
      });
      ro.observe(stageEl);
      cleanups.push(() => ro.disconnect());

      const io = new IntersectionObserver((es) => {
        const v = es.some((e) => e.isIntersecting);
        if (v !== visible) { visible = v; last = 0; if (v) request(); }
      });
      io.observe(frame);
      cleanups.push(() => io.disconnect());

      const onVis = () => { last = 0; if (!document.hidden) request(); };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

      const themeObs = new MutationObserver(() => {
        if (!fs || !renderer) return;
        const c = readColors();
        fs.setColors(c);
        renderer.setClearColor(c.bg);
        request();
      });
      themeObs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      cleanups.push(() => themeObs.disconnect());

      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch" || !fs || !cv) return;
        const h = pickAt(e);
        const c = h ? h.cat : -1;
        const sig = h ? `${h.kind}${h.cat}` : "";
        if (sig !== hoverSig) {
          hoverSig = sig;
          hovered = c;
          fs.hover(c);
          cv.style.cursor = h ? "pointer" : "";
          request();
        }
      };
      const onLeave = () => {
        if (hovered >= 0 && fs) { hovered = -1; hoverSig = ""; fs.hover(-1); cv.style.cursor = ""; request(); }
      };
      const onClick = (e: MouseEvent) => {
        const h = pickAt(e);
        if (!h || h.cat < 0 || h.cat >= SAMPLE_KEYS.length) return;
        // stage 1 sheets -> Document check; the scanning monitor -> Scanning screen; archived items -> ECM+ Documents;
        // otherwise a bin opens the category from the start and a document opens the step that matches the stage
        const si = curStage;
        let tool: Parameters<CaptureDemoApi["openTool"]> | null = null;
        if (h.kind === "paper" && si <= 1 && h.sheet !== undefined) tool = ["check", { sheet: h.sheet }];
        else if ((h.kind === "card" || h.kind === "screen") && (si === 2 || si === 3)) tool = ["scan", { sheet: h.sheet ?? h.cat, T }];
        else if (h.kind === "dms" || h.kind === "box" || ((h.kind === "paper" || h.kind === "card") && si === 6)) tool = ["dms", { cat: h.cat }];
        onModalOpen();
        apiRef.current.setMode("modal");
        playBtnRef.current?.focus({ preventScroll: true }); // the dialog returns focus here on close
        if (tool) { apiRef.current.openTool(...tool); return; }
        const step = h.kind === "bin" ? undefined : h.kind === "label" ? 7 : STAGE_STEP[si];
        apiRef.current.start(SAMPLE_KEYS[h.cat], { step });
      };
      cv.addEventListener("pointermove", onMove);
      cv.addEventListener("pointerleave", onLeave);
      cv.addEventListener("click", onClick);
      cleanups.push(() => {
        cv.removeEventListener("pointermove", onMove);
        cv.removeEventListener("pointerleave", onLeave);
        cv.removeEventListener("click", onClick);
      });

      ctl.current = {
        request,
        seekStage(i) {
          if (!fs) return;
          T = Math.min(fs.stages[i].t0 + 0.001, fs.duration - 0.001);
          request();
        },
        seek(t) {
          T = Math.max(0, Math.min(t, (fs?.duration ?? 1) - 0.001));
          request();
        },
      };
      if (new URLSearchParams(window.location.search).has("capdebug")) {
        (window as unknown as { __capFactory: unknown }).__capFactory = {
          seek(t: number, snapCam = true) {
            setPlay(false);
            T = Math.max(0, Math.min(t, (fs?.duration ?? 1) - 0.001));
            if (snapCam) snap = true;
            last = performance.now();
            frameFn(last);
            return T;
          },
          overview(v: boolean) { overviewRef.current = v; setOverviewState(v); snap = true; last = performance.now(); frameFn(last); },
          bins() {
            const r = canvas!.getBoundingClientRect();
            return fs!.anchors().filter((a) => a.id.startsWith("cat")).map((a) => {
              const v = a.pos.clone(); v.y = 0.35; v.project(camera!);
              return [Math.round(r.left + (v.x * 0.5 + 0.5) * r.width), Math.round(r.top + (-v.y * 0.5 + 0.5) * r.height)];
            });
          },
          openTool(...a: Parameters<CaptureDemoApi["openTool"]>) { apiRef.current.setMode("modal"); apiRef.current.openTool(...a); },
          get T() { return T; },
        };
      }
      size = { w: stageEl.clientWidth, h: stageEl.clientHeight };
      if (size.w) renderer.setSize(size.w, size.h, false);
      curStage = stageAt(T);
      setActive(curStage);
      booting = false;
      setStatus("on");
      request();
    };

    const boot = async () => {
      if (dead || booting || renderer) return;
      booting = true;
      const token = ++bootToken;
      const timer = window.setTimeout(() => { if (token === bootToken) fail(); }, LOAD_TIMEOUT);
      try {
        const [three, mod] = await Promise.all([import("three"), loadScene()]);
        if (dead || token !== bootToken) return;
        window.clearTimeout(timer);
        init(three as unknown as typeof THREE_NS, mod);
      } catch {
        window.clearTimeout(timer);
        if (!dead && token === bootToken) fail();
      }
    };

    /* ---- entry: capability checks, then lazy load on proximity ---- */
    let loadIO: IntersectionObserver | null = null;
    const onReduce = () => { if (mqReduce.matches) fail(); };
    mqReduce.addEventListener("change", onReduce);
    if (mqReduce.matches || !hasWebGL()) {
      setStatus("off");
    } else {
      setStatus("loading");
      loadIO = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { loadIO?.disconnect(); loadIO = null; void boot(); }
      }, { rootMargin: "600px 0px" });
      loadIO.observe(frame);
    }

    const onPageHide = () => { if (statusNow === "on") { teardown(); ctl.current = null; setStatus("loading"); } };
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted && statusNow === "loading" && !renderer) void boot(); };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      dead = true;
      loadIO?.disconnect();
      mqReduce.removeEventListener("change", onReduce);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      classObs.disconnect();
      offClose();
      teardown();
      ctl.current = null;
      lab?.removeAttribute("data-factory");
    };
  }, [lang, announce, setPlay]);

  // Publish the dialog step that matches the current stage, so a category chip opens there.
  useEffect(() => {
    api.setStageStep(status === "on" ? STAGE_STEP[active] : undefined);
    return () => api.setStageStep(undefined);
  }, [api, status, active]);

  /* ---- full screen: the whole #cap-lab (factory, chips, dialog host); CSS pseudo full screen where the API is missing ---- */
  useEffect(() => {
    const lab = document.getElementById("cap-lab");
    const root = document.documentElement;
    const d = document as Document & { webkitFullscreenElement?: Element | null };
    const sync = () => {
      const native = (d.fullscreenElement || d.webkitFullscreenElement) === lab;
      const pseudo = !!lab?.classList.contains("cap-pfs");
      const v = native || pseudo;
      if (v === fullRef.current) return;
      fullRef.current = v;
      lab?.classList.toggle("is-fs", v);
      setFull(v);
      if (!v) { root.classList.remove("cap-pfs-lock"); window.scrollTo(0, scrollY.current); }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && lab?.classList.contains("cap-pfs") && !document.querySelector("dialog[open]")) {
        lab.classList.remove("cap-pfs");
        sync();
      }
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      document.removeEventListener("keydown", onKey);
      lab?.classList.remove("cap-pfs", "is-fs");
      root.classList.remove("cap-pfs-lock");
    };
  }, []);
  const toggleFull = async () => {
    const lab = document.getElementById("cap-lab") as (HTMLElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!lab) return;
    const d = document as Document & { webkitExitFullscreen?: () => void };
    const root = document.documentElement;
    const settle = () => document.dispatchEvent(new Event("fullscreenchange"));
    if (fullRef.current) {
      if (lab.classList.contains("cap-pfs")) { lab.classList.remove("cap-pfs"); settle(); return; }
      try { if (d.exitFullscreen) await d.exitFullscreen(); else d.webkitExitFullscreen?.(); } catch { /* ignore */ }
      return;
    }
    scrollY.current = window.scrollY;
    try {
      if (lab.requestFullscreen) await lab.requestFullscreen();
      else if (lab.webkitRequestFullscreen) lab.webkitRequestFullscreen();
      else throw new Error("no api");
    } catch {
      lab.classList.add("cap-pfs");
      root.classList.add("cap-pfs-lock");
      settle();
    }
  };

  /* ---- UI handlers ---- */
  const on = status === "on";
  const toggleOverview = () => {
    const v = !overviewRef.current;
    overviewRef.current = v;
    setOverviewState(v);
    ctl.current?.request();
  };
  const seekStage = (i: number) => {
    const st = copy.stages[i];
    ctl.current?.seekStage(i);
    setActive(i);
    if (overviewRef.current) { overviewRef.current = false; setOverviewState(false); }
    announce(tpl(copy.stageOf, { n: i + 1, N: copy.stages.length, t: st.t }));
  };
  const onNavKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const btns = Array.from(navRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const fwd = rtl(lang) ? "ArrowLeft" : "ArrowRight";
    const back = rtl(lang) ? "ArrowRight" : "ArrowLeft";
    let n = -1;
    if (e.key === fwd || e.key === "ArrowDown") n = Math.min(i + 1, btns.length - 1);
    else if (e.key === back || e.key === "ArrowUp") n = Math.max(i - 1, 0);
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = btns.length - 1;
    if (n >= 0) { e.preventDefault(); btns[n].focus(); }
  };

  const toggleCap = () => setCapOpen((v) => { const n = !v; try { sessionStorage.setItem("cf-cap-open", n ? "1" : "0"); } catch {} return n; });
  const cur = copy.stages[active] ?? copy.stages[0];
  return (
    <div className="cf" ref={frameRef} data-state={status}>
      <div
        className="cf__stage" ref={stageRef} role="img"
        aria-label={copy.label} aria-describedby={capOpen ? "cf-caption" : undefined}
      >
        <div className="cf__host" ref={hostRef} aria-hidden="true"></div>
        <p className="cf__loading" aria-hidden="true">{copy.loading}</p>
        <div className="cf__labels" ref={labelsRef} aria-hidden="true"></div>
        <div className="cf__counter" aria-hidden="true">
          <span ref={archivedRef} hidden></span>
          <span ref={paperRef} hidden></span>
          <span ref={flaggedRef} className="cf__flag" hidden>{copy.flagged}</span>
        </div>
        <p className="cf__hint" aria-hidden="true">{copy.hints?.[active] ?? copy.binHint}</p>
        <div className="cf__caption" data-open={capOpen ? "true" : "false"}>
          <p className="cf__caption-t">
            <span>{tpl(copy.stageOf, { n: active + 1, N: copy.stages.length, t: cur.t })}</span>
            {cur.tag ? <span className="cap-tag cap-tag--demo" title={cur.tag}>{cur.tag}</span> : null}
            <button type="button" className="cf__caption-x" aria-expanded={capOpen} aria-controls="cf-caption" aria-label={capOpen ? copy.collapse : copy.expand} title={capOpen ? copy.collapse : copy.expand} onClick={toggleCap}>
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 10l5-5 5 5" /></svg>
            </button>
          </p>
          <div className="cf__caption-body" id="cf-caption">
            <div><p className="cf__caption-d">{cur.d}</p></div>
          </div>
        </div>
        <div className="cf__bar" role="group" aria-label={copy.label}>
          <button type="button" className="cf__btn" ref={playBtnRef} aria-pressed={playing} title={playing ? copy.pause : copy.play} aria-label={playing ? copy.pause : copy.play} disabled={!on} onClick={() => setPlay(!playingRef.current)}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" data-ic="play"><path d="M4 2.5v11l9-5.5z" /></svg>
          </button>
          <button type="button" className="cf__btn" title={copy.restart} aria-label={copy.restart} disabled={!on} onClick={() => { ctl.current?.seek(0); announce(copy.stages[0].t); }}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2a6 6 0 1 0 6 6h-1.8A4.2 4.2 0 1 1 8 3.8V6l3.5-3L8 0z" /></svg>
          </button>
          <button type="button" className="cf__btn" aria-pressed={overview} title={copy.overview} aria-label={copy.overview} disabled={!on} onClick={toggleOverview}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1 1h6v6H1zm8 0h6v6H9zM1 9h6v6H1zm8 0h6v6H9z" /></svg>
          </button>
          <button type="button" className="cf__btn" aria-pressed={full} title={full ? copy.exitFullscreen : copy.fullscreen} aria-label={full ? copy.exitFullscreen : copy.fullscreen} onClick={toggleFull}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">{full ? <path d="M6 1v5H1V4.5h3.5V1zm4 0h1.5v3.5H15V6h-5zM1 10h5v5H4.5v-3.5H1zm9 0h5v1.5h-3.5V15H10z" /> : <path d="M1 1h5v1.5H2.5V6H1zm9 0h5v5h-1.5V2.5H10zM1 10h1.5v3.5H6V15H1zm12.5 0H15v5h-5v-1.5h3.5z" />}</svg>
          </button>
        </div>
      </div>
      <ol className="cf__nav" ref={navRef} aria-label={copy.navLabel} onKeyDown={onNavKey}>
        {copy.stages.map((s, i) => (
          <li key={i}>
            <button
              type="button" className={`cf__step${i < active ? " is-done" : ""}`}
              aria-current={i === active && !overview ? "step" : undefined} disabled={!on}
              onClick={() => seekStage(i)}
            >
              <span className="cf__step-n" aria-hidden="true">{i + 1}</span>
              <span>{s.t}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </div>
  );
}

function rtl(lang: Lang) { return lang === "ar"; }
