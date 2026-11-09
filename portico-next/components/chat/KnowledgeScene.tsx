"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { sceneCopy, type SceneCopy } from "@/data/chat-scene";
import type { KnowledgeHit, KnowledgeScene as KScene } from "@/lib/knowledge/scene";
import { rich, strip } from "@/lib/rich";
import { withBase, type Lang } from "@/lib/site";

interface SceneModule {
  createKnowledgeScene(THREE: typeof THREE_NS, opts: {
    rtl: boolean; colors: Record<string, string>; coarse: boolean; sourceFiles?: { file: string; page: number }[];
  }): KScene;
}
const loadScene = (): Promise<SceneModule> => import("@/lib/knowledge/scene");

const LOAD_TIMEOUT = 8000;
// Anchor ids shown as pills over the canvas, and the stages (0-based) each belongs to.
const LABEL_STAGES: Record<string, number[]> = {
  docs: [0], gate: [1], kb: [2], engine: [3, 4, 5], abc: [2, 4], contract: [2, 4], pay: [2, 4], supplier: [2], sources: [4, 5], signal: [3],
};
const NARROW_HIDE = new Set(["abc", "contract", "pay", "supplier", "docs", "sources", "signal"]);
const ANSWER_REFS = [0, 2]; // sources quoted under the answer

type Status = "idle" | "loading" | "on" | "off";
const tpl = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

interface Controls { request(): void; seek(t: number): void; seekStage(i: number): void }

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

const I = {
  play: <path d="M4 2.5v11l9-5.5z" />,
  pause: <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />,
  replay: <path d="M8 2a6 6 0 1 0 6 6h-1.8A4.2 4.2 0 1 1 8 3.8V6l3.5-3L8 0z" />,
  prev: <path d="M10 2.5 4.5 8l5.5 5.5-1.2 1.2L2.1 8l6.7-6.7z" />,
  next: <path d="M6 2.5 11.5 8 6 13.5l1.2 1.2L13.9 8 7.2 1.3z" />,
  close: <path d="M3 3l10 10M13 3 3 13" />,
};

/**
 * The AI knowledge universe: a 3D story of documents becoming a knowledge base that answers questions.
 * Lazily loads `three` and the scene, drives one clock T, and falls back (data-state="off") to a still
 * image when motion is reduced, WebGL or the import fails, or loading takes over 8 s. All explanatory
 * text lives outside the canvas, so the stage list and panel read the same with or without the animation.
 */
export default function KnowledgeScene({ lang }: { lang: Lang }) {
  const copy: SceneCopy = useMemo(() => sceneCopy(lang), [lang]);
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const N = copy.stages.length;

  const frameRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const qRef = useRef<HTMLDivElement>(null);
  const qTextRef = useRef<HTMLParagraphElement>(null);
  const qSearchRef = useRef<HTMLParagraphElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const aTextRef = useRef<HTMLParagraphElement>(null);
  const aRefsRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const ctl = useRef<Controls | null>(null);

  const [status, setStatusState] = useState<Status>("idle");
  const [playing, setPlayingState] = useState(true);
  const [active, setActive] = useState(0);
  const [chip, setChip] = useState<{ x: number; y: number; name: string; fact: string; color: number } | null>(null);
  const [srcOpen, setSrcOpen] = useState<number | null>(null);
  const [live, setLive] = useState("");
  const playingRef = useRef(true);
  const liveN = useRef(0);
  const dialogOpenRef = useRef(false);
  const chipTimer = useRef(0);

  const announce = useCallback((msg: string) => {
    liveN.current += 1;
    setLive(msg + (liveN.current % 2 ? "" : " "));
  }, []);
  const setPlay = useCallback((v: boolean) => {
    playingRef.current = v;
    setPlayingState(v);
    ctl.current?.request();
  }, []);

  /* ---- the whole runtime lives in one effect ---- */
  useEffect(() => {
    const frame = frameRef.current!;
    const host = hostRef.current!;
    const stageEl = stageRef.current!;
    const labelsEl = labelsRef.current!;
    const rtl = lang === "ar";
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let statusNow: Status = "idle";
    const setStatus = (s: Status) => {
      statusNow = s;
      setStatusState(s);
    };

    let T = 0;
    let visible = true;
    let dead = false;
    let booting = false;
    let bootToken = 0;

    let THREE: typeof THREE_NS | null = null;
    let renderer: THREE_NS.WebGLRenderer | null = null;
    let ks: KScene | null = null;
    let camera: THREE_NS.PerspectiveCamera | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let raf = 0;
    let last = 0;
    let snap = true;
    let slow = 0;
    let dpr = 1;
    let curStage = 0;
    let size = { w: 0, h: 0 };
    let cleanups: (() => void)[] = [];
    const labelEls = new Map<string, HTMLElement>();
    let camPos: THREE_NS.Vector3 | null = null;
    let camLook: THREE_NS.Vector3 | null = null;
    let tmpPos: THREE_NS.Vector3 | null = null;
    let tmpLook: THREE_NS.Vector3 | null = null;
    let projV: THREE_NS.Vector3 | null = null;
    let orbit = { yaw: 0, pitch: 0 };
    let par = { x: 0, y: 0 };
    let parT = { x: 0, y: 0 };
    let drag: { id: number; x: number; y: number; moved: boolean } | null = null;
    let hoverSig = "";
    const lastUi = { q: "", a: "", qa: -1, aa: -1, refs: false, search: false };

    const request = () => {
      if (!raf && renderer && !dead) raf = requestAnimationFrame(frameFn);
    };
    const stageAt = (t: number) => {
      const st = ks?.stages;
      if (!st) return 0;
      for (let i = 0; i < st.length; i++) if (t >= st[i].t0 && t < st[i].t1) return i;
      return st.length - 1;
    };

    const applyCamera = (dt: number) => {
      if (!camera || !ks || !THREE) return false;
      const si = curStage;
      const aspect = size.w / Math.max(size.h, 1);
      const want = ks.stages[si];
      tmpPos!.copy(want.pos);
      tmpLook!.copy(want.look);
      // narrow frames pull back so the stage still fits horizontally
      const f = aspect < 1.4 ? Math.min(2.3, 1.4 / aspect) : 1;
      tmpPos!.sub(tmpLook!).multiplyScalar(f).add(tmpLook!);
      let settling = false;
      if (snap) {
        camPos!.copy(tmpPos!); camLook!.copy(tmpLook!); snap = false;
      } else {
        const k = 1 - Math.exp(-3.2 * dt);
        camPos!.lerp(tmpPos!, k); camLook!.lerp(tmpLook!, k);
        settling = camPos!.distanceTo(tmpPos!) > 0.02 || camLook!.distanceTo(tmpLook!) > 0.02;
      }
      // drag orbit eases back once released; pointer parallax follows the cursor
      if (!drag) { const kk = Math.exp(-0.9 * dt); orbit.yaw *= kk; orbit.pitch *= kk; }
      const kp = 1 - Math.exp(-5 * dt);
      par.x += (parT.x - par.x) * kp; par.y += (parT.y - par.y) * kp;
      const orbiting = Math.abs(orbit.yaw) > 0.002 || Math.abs(orbit.pitch) > 0.002 || Math.abs(parT.x - par.x) > 0.002 || Math.abs(parT.y - par.y) > 0.002;
      const d = camPos!.clone().sub(camLook!);
      d.applyAxisAngle(projV!.set(0, 1, 0), orbit.yaw + par.x * -0.06);
      const axis = new THREE.Vector3().crossVectors(projV!.set(0, 1, 0), d).normalize();
      d.applyAxisAngle(axis, orbit.pitch + par.y * 0.035);
      camera.position.copy(camLook!).add(d);
      camera.lookAt(camLook!);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      return settling || orbiting;
    };

    const frameFn = (now: number) => {
      raf = 0;
      if (!renderer || !ks || !camera || !THREE) return;
      const rawDt = last ? now - last : 16;
      const dt = Math.min(rawDt / 1000, 0.1);
      last = now;
      const running = playingRef.current && !dialogOpenRef.current && visible && !document.hidden;
      if (running) {
        T += dt;
        if (T >= ks.duration) T -= ks.duration;
        slow = rawDt > 33 ? slow + 1 : 0;
        if (slow >= 30 && dpr > 1) {
          dpr = 1; slow = 0;
          renderer.setPixelRatio(1);
          renderer.setSize(size.w, size.h, false);
        }
      }
      const si = stageAt(T);
      if (si !== curStage) { curStage = si; setActive(si); }
      const busy = applyCamera(dt);
      ks.update(T);
      renderer.render(ks.scene, camera);
      updateOverlays(si);
      if (running || busy) request();
      else last = 0;
    };

    const setText = (el: HTMLElement | null, key: "q" | "a", text: string) => {
      if (el && lastUi[key] !== text) { lastUi[key] = text; el.textContent = text; }
    };
    const updateOverlays = (si: number) => {
      if (!ks || !camera || !THREE) return;
      const c = copyRef.current;
      const u = ks.ui(T);
      // question and answer cards (typed in as the clock runs)
      const qFull = strip(c.question);
      const aFull = strip(c.answer);
      setText(qTextRef.current, "q", qFull.slice(0, Math.ceil(qFull.length * u.question.type)));
      setText(aTextRef.current, "a", aFull.slice(0, Math.ceil(aFull.length * u.answer.type)));
      const qa = Math.round(u.question.a * 100) / 100;
      if (qa !== lastUi.qa && qRef.current) { lastUi.qa = qa; qRef.current.style.opacity = String(qa); qRef.current.classList.toggle("is-on", qa > 0.02); }
      const aa = Math.round(u.answer.a * 100) / 100;
      if (aa !== lastUi.aa && aRef.current) { lastUi.aa = aa; aRef.current.style.opacity = String(aa); aRef.current.classList.toggle("is-on", aa > 0.02); }
      const refsOn = u.answer.type > 0.97 && aa > 0.3;
      if (refsOn !== lastUi.refs && aRefsRef.current) { lastUi.refs = refsOn; aRefsRef.current.classList.toggle("is-on", refsOn); aRefsRef.current.toggleAttribute("inert", !refsOn); }
      if (u.searching !== lastUi.search && qSearchRef.current) { lastUi.search = u.searching; qSearchRef.current.classList.toggle("is-on", u.searching); }

      // projected pills
      const tv = (projV ||= new THREE.Vector3());
      const used = new Set<string>();
      for (const a of ks.anchors(T)) {
        const text = c.labels[a.id];
        if (!text) continue;
        let el = labelEls.get(a.id);
        if (!el) {
          el = document.createElement("span");
          el.className = "ks__label";
          el.textContent = strip(text);
          labelsEl.appendChild(el);
          labelEls.set(a.id, el);
        }
        used.add(a.id);
        tv.copy(a.pos).project(camera);
        const x = (tv.x * 0.5 + 0.5) * size.w;
        const y = (-tv.y * 0.5 + 0.5) * size.h;
        const inView = x > 24 && x < size.w - 24 && y > 24 && y < size.h - 70 && tv.z < 1;
        const relevant = (LABEL_STAGES[a.id] ?? []).includes(si);
        const hide = size.w < 600 && NARROW_HIDE.has(a.id);
        const on = inView && relevant && !hide;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-120%)`;
        el.classList.toggle("is-on", on);
      }
      for (const [id, el] of labelEls) if (!used.has(id)) el.classList.remove("is-on");
    };

    const pickAt = (e: PointerEvent | MouseEvent): KnowledgeHit => {
      if (!THREE || !ks || !camera || !canvas) return null;
      const r = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(ndc, camera);
      camera.updateMatrixWorld();
      return ks.pickAny(ray, T);
    };

    const showTip = (text: string, e: PointerEvent | MouseEvent) => {
      const tip = tipRef.current;
      if (!tip) return;
      const r = stageEl.getBoundingClientRect();
      tip.textContent = text;
      tip.style.transform = `translate3d(${(e.clientX - r.left).toFixed(0)}px,${(e.clientY - r.top).toFixed(0)}px,0) translate(-50%,-140%)`;
      tip.classList.add("is-on");
    };
    const hideTip = () => tipRef.current?.classList.remove("is-on");
    const hitText = (h: NonNullable<KnowledgeHit>) => {
      const c = copyRef.current;
      if (h.kind === "doc") return c.docKinds[ks!.docKind(h.id)] ?? "";
      if (h.kind === "source") return strip(c.sources[h.id]?.ref ?? "");
      const g = ks!.nodeInfo(h.id).group;
      return strip(c.groups[g]?.name ?? "");
    };

    const teardown = () => {
      bootToken++;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      cleanups.forEach((f) => f());
      cleanups = [];
      try { ks?.dispose(); } catch { /* ignore */ }
      if (renderer) { try { renderer.dispose(); renderer.forceContextLoss(); } catch { /* ignore */ } }
      canvas?.remove();
      for (const el of labelEls.values()) el.remove();
      labelEls.clear();
      ks = null; renderer = null; camera = null; canvas = null;
      last = 0; snap = true; hoverSig = "";
      lastUi.q = ""; lastUi.a = ""; lastUi.qa = -1; lastUi.aa = -1;
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
      canvas = document.createElement("canvas");
      canvas.className = "ks__canvas";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
      renderer = new three.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: "high-performance" });
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x0b1020);
      ks = mod.createKnowledgeScene(three, {
        rtl, colors: {}, coarse,
        sourceFiles: copyRef.current.sources.map((s) => ({ file: s.file, page: s.page })),
      });
      camera = new three.PerspectiveCamera(ks.fov, 16 / 9, 0.1, 200);
      camPos = new three.Vector3(); camLook = new three.Vector3(); tmpPos = new three.Vector3(); tmpLook = new three.Vector3(); projV = new three.Vector3();
      snap = true;

      const cv = canvas;
      const onLost = (e: Event) => { e.preventDefault(); fail(); };
      cv.addEventListener("webglcontextlost", onLost);
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

      const onMove = (e: PointerEvent) => {
        const r = stageEl.getBoundingClientRect();
        if (drag && e.pointerId === drag.id) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; hideTip(); cv.style.cursor = "grabbing"; }
          if (drag.moved) {
            orbit.yaw = Math.max(-0.45, Math.min(0.45, orbit.yaw + dx * 0.004));
            orbit.pitch = Math.max(-0.22, Math.min(0.22, orbit.pitch + dy * 0.003));
            drag.x = e.clientX; drag.y = e.clientY;
            request();
            return;
          }
        }
        if (e.pointerType === "touch") return;
        parT.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        parT.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        const h = pickAt(e);
        const sig = h ? `${h.kind}${h.id}` : "";
        if (sig !== hoverSig) {
          hoverSig = sig;
          ks?.hover(h ? h.kind : null, h ? h.id : -1);
          cv.style.cursor = h ? "pointer" : "grab";
        }
        if (h) showTip(hitText(h), e); else hideTip();
        request();
      };
      const onLeave = () => {
        parT.x = 0; parT.y = 0;
        if (hoverSig) { hoverSig = ""; ks?.hover(null, -1); }
        cv.style.cursor = "";
        hideTip();
        request();
      };
      const onDown = (e: PointerEvent) => {
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        try { cv.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      };
      const onUp = (e: PointerEvent) => {
        const d = drag;
        drag = null;
        try { cv.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        cv.style.cursor = hoverSig ? "pointer" : "grab";
        if (!d || d.moved) { request(); return; }
        const h = pickAt(e);
        if (!h) { setChip(null); return; }
        if (h.kind === "source") { openSource(h.id); return; }
        if (h.kind === "node") {
          const c = copyRef.current;
          const info = ks!.nodeInfo(h.id);
          const g = c.groups[info.group];
          const r = stageEl.getBoundingClientRect();
          setChip({ x: e.clientX - r.left, y: e.clientY - r.top, name: strip(g.name), fact: strip(g.facts[h.id % g.facts.length]), color: info.group });
          window.clearTimeout(chipTimer.current);
          chipTimer.current = window.setTimeout(() => setChip(null), 7000);
          return;
        }
        if (e.pointerType === "touch") { showTip(hitText(h), e); window.setTimeout(hideTip, 2200); }
      };
      cv.addEventListener("pointermove", onMove);
      cv.addEventListener("pointerleave", onLeave);
      cv.addEventListener("pointerdown", onDown);
      cv.addEventListener("pointerup", onUp);
      cv.addEventListener("pointercancel", onUp);
      cleanups.push(() => {
        cv.removeEventListener("pointermove", onMove);
        cv.removeEventListener("pointerleave", onLeave);
        cv.removeEventListener("pointerdown", onDown);
        cv.removeEventListener("pointerup", onUp);
        cv.removeEventListener("pointercancel", onUp);
      });

      ctl.current = {
        request,
        seekStage(i) {
          if (!ks) return;
          T = Math.min(ks.stages[i].t0 + 0.001, ks.duration - 0.001);
          setChip(null);
          request();
        },
        seek(t) {
          T = Math.max(0, Math.min(t, (ks?.duration ?? 1) - 0.001));
          setChip(null);
          request();
        },
      };
      if (new URLSearchParams(window.location.search).has("ksdebug")) {
        (window as unknown as { __ks: unknown }).__ks = {
          seek(t: number) { setPlay(false); T = t; snap = true; last = performance.now(); frameFn(last); return T; },
          project(id: string) {
            const a = ks!.anchors(T).find((x) => x.id === id);
            if (!a || !camera) return null;
            const v = a.pos.clone().project(camera);
            const r = canvas!.getBoundingClientRect();
            return [Math.round(r.left + (v.x * 0.5 + 0.5) * r.width), Math.round(r.top + (-v.y * 0.5 + 0.5) * r.height)];
          },
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
      window.clearTimeout(chipTimer.current);
      teardown();
      ctl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, setPlay]);

  /* ---- source preview dialog (pauses the clock while open) ---- */
  const openSource = (i: number) => {
    dialogOpenRef.current = true;
    setSrcOpen(i);
  };
  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    if (srcOpen !== null && !d.open) d.showModal();
    else if (srcOpen === null && d.open) d.close();
  }, [srcOpen]);
  const closeSource = () => {
    dialogOpenRef.current = false;
    setSrcOpen(null);
    ctl.current?.request();
    playBtnRef.current?.focus({ preventScroll: true });
  };

  const on = status === "on";
  const goStage = (i: number) => {
    const n = (i + N) % N;
    if (on) ctl.current?.seekStage(n);
    else setActive(n);
    announce(tpl(copy.stageOf, { n: n + 1, N, t: strip(copy.stages[n].t) }));
  };
  const cur = copy.stages[active] ?? copy.stages[0];
  const dlgSrc = srcOpen !== null ? copy.sources[srcOpen] : null;

  return (
    <section className="ks" ref={frameRef} data-state={status} aria-label={strip(copy.label)}>
      <div className="ks__main">
        <div className="ks__stage" ref={stageRef} role="group" aria-label={strip(copy.label)}>
          <div className="ks__host" ref={hostRef} aria-hidden="true"></div>
          {status === "off" ? (
            <figure className="ks__still">
              <img src={withBase("/assets/photos/chat/document-flow.webp")} alt="" width={1408} height={768} loading="lazy" decoding="async" />
              <figcaption>{rich(copy.ui.fallback)}</figcaption>
            </figure>
          ) : null}
          <p className="ks__loading" aria-hidden="true">{copy.ui.loading}</p>
          <div className="ks__labels" ref={labelsRef} aria-hidden="true"></div>

          <div className="ks__caption">
            <p className="ks__caption-t">{tpl(copy.stageOf, { n: active + 1, N, t: strip(cur.t) })}</p>
          </div>
          <p className="ks__hint" aria-hidden="true">{strip(cur.hint)}</p>

          <div className="ks__q" ref={qRef} aria-hidden="true">
            <span className="ks__q-who" aria-hidden="true">?</span>
            <div>
              <p className="ks__q-t" ref={qTextRef}></p>
              <p className="ks__q-s" ref={qSearchRef}>{copy.ui.searching}</p>
            </div>
          </div>

          <div className="ks__a" ref={aRef}>
            <p className="ks__a-t" ref={aTextRef} aria-hidden="true"></p>
            <div className="ks__a-refs" ref={aRefsRef} inert>
              <span className="ks__a-rt">{copy.answerRefsTitle}</span>
              {ANSWER_REFS.map((si) => (
                <button type="button" key={si} className="ks__ref" onClick={() => openSource(si)} title={copy.ui.open}>
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 1.5h6.5L13 5v9.5H3zM9 1.5V5h4" /></svg>
                  <span>{rich(copy.sources[si].ref)}</span>
                </button>
              ))}
            </div>
          </div>

          {chip ? (
            <div className="ks__chip" role="status" style={{ left: 0, top: 0, transform: `translate3d(${chip.x.toFixed(0)}px,${chip.y.toFixed(0)}px,0) translate(-50%,16px)` }} data-g={chip.color}>
              <p className="ks__chip-h">{copy.extractedTitle}</p>
              <p className="ks__chip-n">{chip.name}</p>
              <p className="ks__chip-f">{chip.fact}</p>
            </div>
          ) : null}
          <div className="ks__tip" ref={tipRef} aria-hidden="true"></div>

          <div className="ks__bar" role="group" aria-label={strip(copy.label)}>
            <button type="button" className="ks__btn" onClick={() => goStage(active - 1)} aria-label={copy.ui.prev} title={copy.ui.prev}>
              <svg className="ks__flip" viewBox="0 0 16 16" aria-hidden="true" focusable="false">{I.prev}</svg>
            </button>
            <button type="button" className="ks__btn" ref={playBtnRef} aria-pressed={playing} disabled={!on}
              title={playing ? copy.ui.pause : copy.ui.play} aria-label={playing ? copy.ui.pause : copy.ui.play} onClick={() => setPlay(!playingRef.current)}>
              <svg className={playing ? "" : "ks__flip"} viewBox="0 0 16 16" aria-hidden="true" focusable="false">{playing ? I.pause : I.play}</svg>
            </button>
            <button type="button" className="ks__btn" disabled={!on} title={copy.ui.replay} aria-label={copy.ui.replay}
              onClick={() => { ctl.current?.seek(0); setActive(0); setPlay(true); announce(strip(copy.stages[0].t)); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">{I.replay}</svg>
            </button>
            <button type="button" className="ks__btn" onClick={() => goStage(active + 1)} aria-label={copy.ui.next} title={copy.ui.next}>
              <svg className="ks__flip" viewBox="0 0 16 16" aria-hidden="true" focusable="false">{I.next}</svg>
            </button>
          </div>
        </div>

        <aside className="ks__side">
          <ol className="ks__nav" aria-label={copy.ui.navLabel}>
            {copy.stages.map((s, i) => (
              <li key={i}>
                <button type="button" className={`ks__step${i < active ? " is-done" : ""}`} aria-current={i === active ? "step" : undefined} onClick={() => goStage(i)}>
                  <span className="ks__step-n" aria-hidden="true">{i + 1}</span>
                  <span>{rich(s.t)}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="ks__panel">
            <p className="ks__panel-n">{tpl(copy.stageOf, { n: active + 1, N, t: "" }).replace(/:\s*$/, "")}</p>
            <h3 className="ks__panel-t">{rich(cur.t)}</h3>
            <p className="ks__panel-b">{rich(cur.biz)}</p>
            <div className="ks__tech">
              <p className="ks__tech-h">{copy.underHood}</p>
              <p className="ks__tech-b">{rich(cur.tech)}</p>
            </div>
          </div>
        </aside>
      </div>

      <dialog ref={dlgRef} className="ks-dlg" aria-labelledby="ks-dlg-t" onClose={closeSource} onClick={(e) => { if (e.target === dlgRef.current) dlgRef.current?.close(); }}>
        {dlgSrc ? (
          <div className="ks-dlg__box">
            <div className="ks-dlg__bar">
              <h3 id="ks-dlg-t" className="ks-dlg__t">{rich(dlgSrc.ref)}</h3>
              <button type="button" className="ks__btn ks-dlg__x" onClick={() => dlgRef.current?.close()} aria-label={copy.ui.close} title={copy.ui.close}>
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="ks__stroke">{I.close}</svg>
              </button>
            </div>
            <div className="ks-dlg__body">
              <p className="ks-dlg__kind">{rich(dlgSrc.kind)} · {copy.ui.sourceDialog}</p>
              <div className="ks-doc">
                <p className="ks-doc__p">{rich(dlgSrc.before)}</p>
                <p className="ks-doc__p ks-doc__hit"><mark>{rich(dlgSrc.passage)}</mark></p>
                <p className="ks-doc__p">{rich(dlgSrc.after)}</p>
                <p className="ks-doc__foot">{copy.pageWord} {dlgSrc.page}</p>
              </div>
              <p className="ks-dlg__cap">{copy.ui.fromDocument}</p>
            </div>
          </div>
        ) : null}
      </dialog>
      <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </section>
  );
}
