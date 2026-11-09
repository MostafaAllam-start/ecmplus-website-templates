// Procedural Three.js world for the "Chat with Your Documents" page: an AI knowledge universe.
// Core three only, no assets. THREE is injected (dynamic import by the controller), so this file
// imports types only. update(T) is PURE in T: every pose, scale and colour is derived from T, so
// seek / restart / loop / stage navigation are trivial.
//
// Story (loop of DUR seconds):
//   S1  0 - 9   documents of every kind arrive and float as a cloud
//   S2  9 - 20  they pass a scanning gate one by one; text is highlighted and becomes small information blocks
//   S3  20 - 32 the blocks become knowledge nodes; connections grow into a network around the AI engine
//   S4  32 - 38 a question enters as a search signal and the engine interprets it
//   S5  38 - 48 relevant nodes light up, context streams to the engine, source cards appear
//   S6  48 - 60 the engine writes the answer; sources stay referenced; everything settles and loops
//
// World units are arbitrary; X is the storytelling axis. P(x) = FX * x (FX = -1 in RTL).
import type * as THREE_NS from 'three';

export interface KnowledgeColors { [token: string]: string }
export interface KnowledgeStage { t0: number; t1: number; pos: THREE_NS.Vector3; look: THREE_NS.Vector3 }
export type KnowledgeHit = { kind: 'doc' | 'node' | 'source'; id: number } | null;
export interface KnowledgeUi {
  /** Question card: opacity (0..1) and typing progress (0..1). */
  question: { a: number; type: number };
  /** Answer card: opacity (0..1) and typing progress (0..1). */
  answer: { a: number; type: number };
  /** 0..1: the three source cards are on stage. */
  sources: number;
  /** The "searching" line under the question is visible. */
  searching: boolean;
}
export interface KnowledgeScene {
  scene: THREE_NS.Scene;
  stages: KnowledgeStage[];
  duration: number;
  fov: number;
  update(T: number): void;
  setColors(c: KnowledgeColors): void;
  /** Nearest clickable thing under the ray (documents, knowledge nodes, source cards). */
  pickAny(raycaster: THREE_NS.Raycaster, T: number): KnowledgeHit;
  hover(kind: 'doc' | 'node' | 'source' | null, id: number): void;
  anchors(T: number): { id: string; pos: THREE_NS.Vector3 }[];
  ui(T: number): KnowledgeUi;
  /** Which group (0..7) a node belongs to, and its rank in the group (0 = hub). */
  nodeInfo(id: number): { group: number; rank: number };
  /** Kind (0..5) of a document: contract, invoice, report, application, correspondence, employee. */
  docKind(id: number): number;
  dispose(): void;
}
export interface KnowledgeOpts {
  rtl: boolean;
  colors: KnowledgeColors;
  coarse: boolean;
  makeCanvas?: (w: number, h: number) => HTMLCanvasElement;
  /** File names drawn on the three source cards. */
  sourceFiles?: { file: string; page: number }[];
}

type TH = typeof THREE_NS;

/* ------------------------------------------------------------------ constants */

export const DUR = 60;
const FOV = 38;
const NDOC = 18;
const NGRP = 8;
const PER = 9;
const NN = NGRP * PER;
const BLK = 5;
const STAGE_T = [0, 9, 20, 32, 38, 48, 60];
const W = (2 * Math.PI) / DUR; // one slow cycle per loop keeps every sway periodic

const E = { x: 3, y: 0, z: 0 }; // the AI engine
const GATE = { x: -6, y: 0, z: 0.6 }; // the scanning gate
const FLOOR_Y = -4.8;
const P0 = 9.3; // first document reaches the gate
const PSTEP = 0.5;
const REL_GROUPS = [0, 1, 2]; // groups the sample question is about
const OUT0 = 58.6; // the loop dissolves the network
const SRC_POS = [
  { x: 9.0, y: 2.7, z: 1.6 },
  { x: 9.0, y: 0.75, z: 1.6 },
  { x: 9.0, y: -1.2, z: 1.6 },
];
const SRC_FROM = [1, 2, 0]; // hub group each source card is pulled from
const Q0 = { x: -2.4, y: 5.4, z: 5 };

const DEFAULTS: KnowledgeColors = {
  bg: '#0b1020', accent: '#e8b84a', sky: '#6aa6ff', violet: '#9b8cff', teal: '#4cc9b0', rose: '#ff7a90',
  sand: '#d9c9a0', slate: '#8fa0bd', amber: '#ffb066', paper: '#e4eaf4', ink: '#2a3446',
};
// colour token of each document kind and of each node group
const KIND_TOK = ['accent', 'sky', 'violet', 'teal', 'rose', 'slate'];
const GRP_TOK = ['accent', 'sky', 'amber', 'teal', 'violet', 'rose', 'sand', 'slate'];
const GRP_DIR: [number, number, number][] = [
  [0.1, 0.78, 0.62], [0.98, 0.12, 0.3], [-0.98, 0.18, 0.3], [0.72, -0.62, -0.4],
  [0.0, -0.86, 0.5], [-0.8, -0.5, -0.3], [-0.35, 0.66, -0.72], [0.25, -0.2, -1],
];
const GRP_LINKS: [number, number][] = [[0, 1], [0, 2], [1, 2], [0, 4], [3, 4], [3, 1], [5, 4], [6, 1], [6, 2], [7, 6], [0, 3], [2, 4]];
// where the three bars of highlighted text sit on a sheet (centre-origin, unit sheet, v up) and how wide they are
const BARS: [number, number, number][] = [[-0.08, 0.34, 0.62], [0.02, 0.0, 0.7], [-0.1, -0.3, 0.55]];

/* ------------------------------------------------------------------ helpers */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { const u = clamp01(v); return u * u * (3 - 2 * u); };
const easeOut = (v: number) => { const u = clamp01(v); return 1 - (1 - u) * (1 - u) * (1 - u); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
interface Pose { x: number; y: number; z: number; ry: number; rz: number; s: number; dim: number }

/* ------------------------------------------------------------------ the world */

export function createKnowledgeScene(THREE: TH, opts: KnowledgeOpts): KnowledgeScene {
  const FX = opts.rtl ? -1 : 1;
  const mkCanvas = opts.makeCanvas ?? ((w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  });
  let colors: KnowledgeColors = { ...DEFAULTS, ...opts.colors };
  const scene = new THREE.Scene();
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(o: T): T => { owned.push(o); return o; };
  const tok = (t: string) => new THREE.Color(colors[t] ?? DEFAULTS[t] ?? '#ff00ff');
  const regMats: { m: { color: THREE_NS.Color }; tok: string; k: number }[] = [];
  const basic = (t: string, extra: THREE_NS.MeshBasicMaterialParameters = {}, k = 1) => {
    const m = own(new THREE.MeshBasicMaterial({ color: tok(t).multiplyScalar(k), ...extra }));
    regMats.push({ m, tok: t, k });
    return m;
  };
  const coarse = opts.coarse;
  scene.fog = new THREE.Fog(tok('bg'), 34, 78);

  /* ---------- textures (procedural canvases) ---------- */
  function tex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
    const cv = mkCanvas(w, h);
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    draw(ctx, w, h);
    const t = own(new THREE.CanvasTexture(cv));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
  const INK = '#5d6a82';
  const SOFT = '#b9c3d6';
  const rl = (c: CanvasRenderingContext2D, x: number, y: number, w: number, n: number, gap: number, col = INK) => {
    c.fillStyle = col;
    for (let i = 0; i < n; i++) c.fillRect(x, y + i * gap, w * (i === n - 1 ? 0.6 : 1), 3);
  };
  const kindHex = (k: number) => colors[KIND_TOK[k]] ?? DEFAULTS[KIND_TOK[k]];
  const KIND_WORD = ['CONTRACT', 'INVOICE', 'REPORT', 'APPLICATION', 'LETTER', 'EMPLOYEE'];
  function paperTex(kind: number) {
    return tex(128, 176, (c, w, h) => {
      c.fillStyle = '#f4f6fb'; c.fillRect(0, 0, w, h);
      c.fillStyle = kindHex(kind); c.fillRect(0, 0, w, 6);
      c.fillStyle = INK; c.font = '700 10px sans-serif'; c.fillText(KIND_WORD[kind], 10, 24);
      if (kind === 0) { // contract: clauses and a signature
        for (let b = 0; b < 4; b++) { c.fillStyle = kindHex(0); c.fillRect(10, 38 + b * 26, 6, 6); rl(c, 22, 38 + b * 26, w - 34, 3, 8); }
        c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(14, 160); c.bezierCurveTo(30, 140, 36, 170, 52, 152); c.stroke();
      } else if (kind === 1) { // invoice: table and total
        c.fillStyle = SOFT; c.fillRect(10, 40, w - 20, 10);
        for (let r = 0; r < 6; r++) { c.fillStyle = INK; c.fillRect(14, 60 + r * 13, 56, 3); c.fillRect(w - 38, 60 + r * 13, 24, 3); }
        c.fillStyle = kindHex(1); c.fillRect(w - 56, 146, 46, 14);
      } else if (kind === 2) { // report: chart and text
        c.fillStyle = SOFT; c.fillRect(10, 40, w - 20, 54);
        [18, 30, 22, 40, 34].forEach((bh, i) => { c.fillStyle = kindHex(2); c.fillRect(18 + i * 20, 90 - bh, 12, bh); });
        rl(c, 10, 108, w - 20, 6, 10);
      } else if (kind === 3) { // application: photo and form fields
        c.fillStyle = SOFT; c.fillRect(w - 44, 34, 34, 42);
        c.fillStyle = INK; c.beginPath(); c.arc(w - 27, 50, 7, 0, 6.283); c.fill(); c.fillRect(w - 38, 60, 22, 10);
        for (let r = 0; r < 7; r++) { c.fillStyle = INK; c.fillRect(10, 90 + r * 11, 26, 3); c.fillStyle = SOFT; c.fillRect(42, 88 + r * 11, w - 52, 6); }
      } else if (kind === 4) { // letter: seal and lines
        c.fillStyle = kindHex(4); c.beginPath(); c.arc(w - 24, 28, 9, 0, 6.283); c.fill();
        rl(c, 10, 52, 54, 2, 8); rl(c, 10, 76, w - 20, 8, 11);
      } else { // employee record: avatar and fields
        c.fillStyle = SOFT; c.beginPath(); c.arc(30, 58, 16, 0, 6.283); c.fill();
        c.fillStyle = INK; c.beginPath(); c.arc(30, 53, 6, 0, 6.283); c.fill(); c.fillRect(22, 61, 16, 8);
        rl(c, 56, 48, w - 66, 4, 9);
        for (let r = 0; r < 5; r++) { c.fillStyle = INK; c.fillRect(10, 92 + r * 14, 30, 3); c.fillStyle = SOFT; c.fillRect(46, 90 + r * 14, w - 56, 7); }
      }
    });
  }
  const srcFiles = opts.sourceFiles ?? [{ file: 'ABC_Contract_2026.pdf', page: 8 }, { file: 'Supplier_Agreement.pdf', page: 3 }, { file: 'Payment_Terms_Appendix.pdf', page: 2 }];
  function sourceTex(i: number) {
    const { file, page } = srcFiles[i] ?? srcFiles[0];
    return tex(320, 224, (c, w, h) => {
      c.fillStyle = '#f4f6fb'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#16213a'; c.fillRect(0, 0, w, 44);
      c.fillStyle = colors.accent ?? DEFAULTS.accent; c.fillRect(0, 0, 5, h);
      c.fillStyle = '#d4503f'; c.fillRect(14, 11, 30, 22);
      c.fillStyle = '#ffffff'; c.font = '700 11px sans-serif'; c.fillText('PDF', 19, 26);
      c.fillStyle = '#ffffff'; c.font = '700 15px monospace';
      c.fillText(file.length > 24 ? file.slice(0, 23) + '…' : file, 54, 29);
      c.fillStyle = INK; c.font = '600 13px sans-serif'; c.fillText('p. ' + page, w - 54, 70);
      rl(c, 16, 62, 150, 2, 9, SOFT);
      rl(c, 16, 90, w - 32, 3, 11, SOFT);
      c.fillStyle = (colors.accent ?? DEFAULTS.accent) + '55'; c.fillRect(12, 128, w - 24, 22);
      c.fillStyle = INK; c.fillRect(16, 135, w - 60, 4); c.fillRect(16, 143, w - 120, 3);
      rl(c, 16, 164, w - 32, 3, 11, SOFT);
    });
  }
  const glowTex = tex(64, 64, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  });

  /* ---------- geometry bookkeeping ---------- */
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  const v3 = new THREE.Vector3();
  const setM = (mesh: THREE_NS.InstancedMesh, i: number, x: number, y: number, z: number, ry: number, rz: number, s: number, sx = 1, sy = 1) => {
    dummy.position.set(FX * x, y, z);
    dummy.rotation.set(0, FX * ry, FX * rz);
    dummy.scale.set(s * sx, s * sy, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  };
  const noCull = <T extends THREE_NS.Object3D>(o: T): T => { o.frustumCulled = false; return o; };

  /* ---------- environment: floor grid, rings, stars ---------- */
  {
    const pts: number[] = [];
    for (let x = -28; x <= 28; x += 2) pts.push(x, FLOOR_Y, -16, x, FLOOR_Y, 16);
    for (let z = -16; z <= 16; z += 2) pts.push(-28, FLOOR_Y, z, 28, FLOOR_Y, z);
    const g = own(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const m = own(new THREE.LineBasicMaterial({ color: tok('sky'), transparent: true, opacity: 0.1, depthWrite: false }));
    regMats.push({ m, tok: 'sky', k: 1 });
    scene.add(noCull(new THREE.LineSegments(g, m)));
  }
  const ringMeshes: { mesh: THREE_NS.Mesh; base: number }[] = [];
  const addFloorRing = (x: number, r: number, op: number) => {
    const g = own(new THREE.RingGeometry(r - 0.025, r + 0.025, 96));
    const m = basic('accent', { transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(FX * x, FLOOR_Y + 0.02, E.z);
    scene.add(noCull(mesh));
    ringMeshes.push({ mesh, base: op });
  };
  addFloorRing(E.x, 3.2, 0.5); addFloorRing(E.x, 5.2, 0.28); addFloorRing(E.x, 7.6, 0.15); addFloorRing(GATE.x, 2.6, 0.3);
  {
    const r = rng(7);
    const n = coarse ? 170 : 340;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = FX * (-30 + r() * 62); pos[i * 3 + 1] = -9 + r() * 20; pos[i * 3 + 2] = -34 + r() * 26; }
    const g = own(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = own(new THREE.PointsMaterial({ color: tok('sky'), size: 0.22, map: glowTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    regMats.push({ m, tok: 'sky', k: 1 });
    scene.add(noCull(new THREE.Points(g, m)));
  }

  /* ---------- scanning gate ---------- */
  const gate = new THREE.Group();
  gate.position.set(FX * GATE.x, GATE.y, GATE.z);
  gate.rotation.y = Math.PI / 2;
  scene.add(gate);
  const gateRing = new THREE.Mesh(own(new THREE.TorusGeometry(2.35, 0.05, 10, 72)), basic('accent', { transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  const gateRing2 = new THREE.Mesh(own(new THREE.TorusGeometry(1.95, 0.018, 8, 72)), basic('sky', { transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  const gateField = new THREE.Mesh(own(new THREE.CircleGeometry(2.3, 48)), basic('sky', { transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  [gateRing, gateRing2, gateField].forEach((m) => { noCull(m); gate.add(m); });

  /* ---------- documents: six kinds, three sheets each ---------- */
  const DW = 1.1;
  const DH = 1.5;
  const docGeo = own(new THREE.PlaneGeometry(DW, DH));
  const docMeshes: THREE_NS.InstancedMesh[] = [];
  for (let k = 0; k < 6; k++) {
    const m = own(new THREE.MeshBasicMaterial({ map: paperTex(k), side: THREE.DoubleSide, color: 0xffffff }));
    const im = new THREE.InstancedMesh(docGeo, m, 3);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(3 * 3).fill(1), 3);
    scene.add(noCull(im));
    docMeshes.push(im);
  }
  const docKindOf = (i: number) => i % 6;
  const docSlot = (i: number) => Math.floor(i / 6);
  const r1 = rng(11);
  const home: { x: number; y: number; z: number; ry: number; rz: number; fx: number; fy: number; fz: number }[] = [];
  for (let i = 0; i < NDOC; i++) {
    const c = i % 6;
    const row = Math.floor(i / 6);
    home.push({
      x: -14.6 + c * 1.3 + (r1() - 0.5) * 0.5, y: (row - 1) * 2.7 + (r1() - 0.5) * 0.5, z: -1.2 + r1() * 2.8,
      ry: (r1() - 0.5) * 0.7, rz: (r1() - 0.5) * 0.3,
      fx: -22 - r1() * 4, fy: (r1() - 0.5) * 6, fz: 6 + r1() * 4,
    });
  }
  const shelf = (i: number) => ({ x: -13.2 + (i % 6) * 0.62, y: -4.05 + Math.floor(i / 6) * 0.34, z: -3.2 - Math.floor(i / 6) * 0.5 });
  const P = (i: number) => P0 + PSTEP * i;
  const bobW = W * 7;
  const bob = (i: number, T: number) => ({ dy: 0.14 * Math.sin(bobW * T + i * 1.3), dx: 0.06 * Math.cos(bobW * T + i * 0.7) });

  const pose: Pose = { x: 0, y: 0, z: 0, ry: 0, rz: 0, s: 1, dim: 1 };
  function docPose(i: number, T: number, o: Pose = pose): Pose {
    const h = home[i];
    const st = 0.12 * i;
    const p = P(i);
    const tMove = p - 1.4;
    const sh = shelf(i);
    o.dim = 1;
    if (T < st) { o.x = h.fx; o.y = h.fy; o.z = h.fz; o.ry = h.ry; o.rz = h.rz; o.s = 0; return o; }
    if (T < tMove) {
      const u = easeOut((T - st) / 2.6);
      const b = bob(i, Math.min(T, tMove));
      const settle = smooth((T - st - 2.2) / 1.0);
      o.x = mix(h.fx, h.x, u) + b.dx * settle; o.y = mix(h.fy, h.y, u) + b.dy * settle; o.z = mix(h.fz, h.z, u);
      o.ry = h.ry; o.rz = h.rz; o.s = 0.4 + 0.6 * smooth((T - st) / 1.0);
      return o;
    }
    const b0 = bob(i, tMove);
    const hx = h.x + b0.dx;
    const hy = h.y + b0.dy;
    if (T < p) { // fly to the gate
      const u = smooth((T - tMove) / 1.4);
      o.x = mix(hx, GATE.x, u); o.y = mix(hy, GATE.y, u) + 0.8 * Math.sin(Math.PI * u); o.z = mix(h.z, GATE.z, u);
      o.ry = mix(h.ry, 0, u); o.rz = mix(h.rz, 0, u); o.s = mix(1, 1.25, u);
      return o;
    }
    const tLeave = p + 1.0;
    if (T < tLeave) { o.x = GATE.x; o.y = GATE.y; o.z = GATE.z; o.ry = 0; o.rz = 0; o.s = 1.25; return o; }
    const u = smooth((T - tLeave) / 1.4);
    o.x = mix(GATE.x, sh.x, u); o.y = mix(GATE.y, sh.y, u) + 0.6 * Math.sin(Math.PI * u); o.z = mix(GATE.z, sh.z, u);
    o.ry = mix(0, 0.25, u); o.rz = 0; o.s = mix(1.25, 0.42, u); o.dim = mix(1, 0.5, u);
    return o;
  }

  // scanning beam (one per sheet) and highlighted text bars (three per sheet)
  const beamGeo = own(new THREE.PlaneGeometry(1.6, 0.05));
  const beams = new THREE.InstancedMesh(beamGeo, basic('accent', { transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), NDOC);
  scene.add(noCull(beams));
  const barGeo = own(new THREE.PlaneGeometry(1, 0.1));
  const bars = new THREE.InstancedMesh(barGeo, basic('accent', { transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), NDOC * 3);
  scene.add(noCull(bars));

  /* ---------- knowledge nodes ---------- */
  const r2 = rng(23);
  const rel: THREE_NS.Vector3[] = []; // node offsets from the engine
  const nodeBase: number[] = [];
  const nodeGroup = (n: number) => Math.floor(n / PER);
  for (let g = 0; g < NGRP; g++) {
    const d = new THREE.Vector3(...GRP_DIR[g]).normalize().multiplyScalar(3.9);
    for (let m = 0; m < PER; m++) {
      const p = d.clone();
      if (m > 0) {
        // members spread on a small shell around the hub, pushed away from the engine
        const a = r2() * 6.283; const b = Math.acos(2 * r2() - 1); const rr = 0.85 + r2() * 0.55;
        p.add(new THREE.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)).multiplyScalar(rr));
        const len = p.length();
        if (len < 2.8) p.multiplyScalar(2.8 / len);
      }
      rel.push(p);
      nodeBase.push(m === 0 ? 0.3 : 0.14 + r2() * 0.05);
    }
  }
  const nodeGeo = own(new THREE.IcosahedronGeometry(1, 1));
  const nodes = new THREE.InstancedMesh(nodeGeo, own(new THREE.MeshBasicMaterial({ color: 0xffffff })), NN);
  nodes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NN * 3).fill(1), 3);
  scene.add(noCull(nodes));
  const glowMat = own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false }));
  const glows = new THREE.InstancedMesh(nodeGeo, glowMat, NN);
  glows.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NN * 3).fill(1), 3);
  scene.add(noCull(glows));
  const nodeRelevant = (n: number) => REL_GROUPS.includes(nodeGroup(n));

  // information blocks: five per sheet, from the highlighted text to its node
  const blockGeo = own(new THREE.BoxGeometry(0.17, 0.11, 0.05));
  const blocks = new THREE.InstancedMesh(blockGeo, own(new THREE.MeshBasicMaterial({ color: 0xffffff })), NDOC * BLK);
  blocks.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NDOC * BLK * 3).fill(1), 3);
  scene.add(noCull(blocks));
  const blkT0 = (i: number, j: number) => P(i) + 0.45 + 0.12 * j;
  const blkDur = (j: number) => 1.7 + 0.1 * j;
  const blkNode = (i: number, j: number) => (i * BLK + j) % NN;
  const blkStart: THREE_NS.Vector3[] = [];
  const appear = new Array<number>(NN).fill(1e9);
  for (let i = 0; i < NDOC; i++) {
    for (let j = 0; j < BLK; j++) {
      const bar = BARS[j % 3];
      const jit = (r2() - 0.5) * bar[2] * 0.6;
      blkStart.push(new THREE.Vector3(GATE.x + (bar[0] + jit) * DW * 1.25, GATE.y + bar[1] * DH * 1.25, GATE.z + 0.05));
      const n = blkNode(i, j);
      appear[n] = Math.min(appear[n], blkT0(i, j) + blkDur(j));
    }
  }
  for (let n = 0; n < NN; n++) if (appear[n] > 1e8) appear[n] = 20;

  // edges: group stars, a sparse ring in each group, links between groups, engine to every hub
  const edges: { a: number; b: number; t: number; w: number; rel: boolean }[] = [];
  const r3 = rng(41);
  const addEdge = (a: number, b: number, w: number) => {
    const ready = Math.max(a >= 0 ? appear[a] : 0, b >= 0 ? appear[b] : 0) + 0.4;
    const t = Math.max(ready, 20.4 + r3() * 8.2);
    const ga = a >= 0 ? nodeGroup(a) : -1;
    const gb = b >= 0 ? nodeGroup(b) : -1;
    const isRel = (ga < 0 || REL_GROUPS.includes(ga)) && (gb < 0 || REL_GROUPS.includes(gb));
    edges.push({ a, b, t, w, rel: isRel });
  };
  for (let g = 0; g < NGRP; g++) {
    for (let m = 1; m < PER; m++) addEdge(g * PER, g * PER + m, 0.7);
    for (let m = 1; m < PER; m += 2) addEdge(g * PER + m, g * PER + (m % (PER - 1)) + 1, 0.4);
  }
  for (const [a, b] of GRP_LINKS) addEdge(a * PER, b * PER, 0.85);
  for (let g = 0; g < NGRP; g++) addEdge(-1, g * PER, 0.55);
  const NE = edges.length;
  const edgePos = new Float32Array(NE * 6);
  const edgeCol = new Float32Array(NE * 6);
  const edgeGeo = own(new THREE.BufferGeometry());
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3).setUsage(THREE.DynamicDrawUsage));
  edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeCol, 3).setUsage(THREE.DynamicDrawUsage));
  const edgeLines = new THREE.LineSegments(edgeGeo, own(new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  scene.add(noCull(edgeLines));

  /* ---------- the AI engine ---------- */
  const engine = new THREE.Group();
  engine.position.set(FX * E.x, E.y, E.z);
  scene.add(engine);
  const coreMat = basic('accent', { transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const core = new THREE.Mesh(own(new THREE.IcosahedronGeometry(0.5, 1)), coreMat);
  const coreHalo = new THREE.Mesh(own(new THREE.SphereGeometry(0.9, 24, 16)), basic('accent', { transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  const lat = new THREE.LineSegments(own(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.1, 2))), own(new THREE.LineBasicMaterial({ color: tok('sky'), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })));
  regMats.push({ m: lat.material as unknown as { color: THREE_NS.Color }, tok: 'sky', k: 1 });
  const shell = new THREE.Mesh(own(new THREE.SphereGeometry(1.7, 40, 24)), basic('sky', { transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }));
  const panelGeo = own(new THREE.CylinderGeometry(2.25, 2.25, 3.4, 20, 1, true, 0, 1.0));
  const panelMat = basic('sky', { transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false });
  const panels = [0, 1, 2].map((k) => { const m = new THREE.Mesh(panelGeo, panelMat); m.rotation.y = (k * Math.PI * 2) / 3; return m; });
  const ringDefs: [number, number, number, number][] = [[2.6, 1.15, 0.2, 0.01], [3.15, 0.2, -0.35, 0.012], [3.7, -0.7, 0.5, 0.01]];
  const ringsE = ringDefs.map(([r, rx, rz, tube]) => {
    const m = new THREE.Mesh(own(new THREE.TorusGeometry(r, tube, 8, 96)), basic('accent', { transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.set(rx, 0, rz);
    return m;
  });
  [core, coreHalo, lat, shell, ...panels, ...ringsE].forEach((m) => { noCull(m); engine.add(m); });

  /* ---------- the question signal, ripple, context stream and source cards ---------- */
  const signal = new THREE.Mesh(own(new THREE.SphereGeometry(0.22, 16, 12)), basic('accent', { transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  const signalGlow = new THREE.Mesh(own(new THREE.SphereGeometry(0.55, 16, 12)), basic('accent', { transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
  signal.add(signalGlow);
  scene.add(noCull(signal)); noCull(signalGlow);
  const ripple = new THREE.Mesh(own(new THREE.SphereGeometry(1, 40, 20)), basic('accent', { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  ripple.position.set(FX * E.x, E.y, E.z);
  scene.add(noCull(ripple));

  const NF = coarse ? 54 : 108;
  const flowPos = new Float32Array(NF * 3);
  const flowCol = new Float32Array(NF * 3);
  const flowGeo = own(new THREE.BufferGeometry());
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3).setUsage(THREE.DynamicDrawUsage));
  flowGeo.setAttribute('color', new THREE.BufferAttribute(flowCol, 3).setUsage(THREE.DynamicDrawUsage));
  const flow = new THREE.Points(flowGeo, own(new THREE.PointsMaterial({ size: 0.34, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  scene.add(noCull(flow));
  const relNodes: number[] = [];
  for (let n = 0; n < NN; n++) if (nodeRelevant(n)) relNodes.push(n);
  const flowSeed = Array.from({ length: NF }, (_, k) => ({ n: relNodes[(k * 7) % relNodes.length], ph: (k * 0.61803) % 1, jx: (r3() - 0.5) * 0.5, jy: (r3() - 0.5) * 0.5 }));

  const SRC_W = 2.0;
  const SRC_H = 1.4;
  const srcGeo = own(new THREE.PlaneGeometry(SRC_W, SRC_H));
  const srcMeshes = [0, 1, 2].map((k) => {
    const m = new THREE.Mesh(srcGeo, own(new THREE.MeshBasicMaterial({ map: sourceTex(k), side: THREE.DoubleSide, transparent: true })));
    scene.add(noCull(m));
    return m;
  });

  /* ---------- state per frame ---------- */
  const nodePos: THREE_NS.Vector3[] = rel.map(() => new THREE.Vector3());
  let hovKind: 'doc' | 'node' | 'source' | null = null;
  let hovId = -1;
  const outK = (T: number) => smooth((T - OUT0) / 1.4);
  const engineEnergy = (T: number) => {
    let e = 0.34 + 0.16 * smooth((T - 12) / 10);
    e = Math.max(e, mix(0.5, 0.78, smooth((T - 32) / 3)));
    if (T >= 35.6) e = Math.max(e, mix(0.78, 0.95, smooth((T - 38) / 4)));
    if (T >= 48) e = 1;
    return e;
  };

  function update(Tin: number) {
    const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
    const out = outK(T);
    const sway = 0.22 * Math.sin(W * T);
    const cs = Math.cos(sway);
    const sn = Math.sin(sway);
    const k5 = smooth((T - 38.6) / 1.0);

    /* nodes */
    for (let n = 0; n < NN; n++) {
      const r = rel[n];
      nodePos[n].set(E.x + r.x * cs + r.z * sn, E.y + r.y, E.z - r.x * sn + r.z * cs);
      const g = nodeGroup(n);
      const appearK = smooth((T - appear[n]) / 0.5);
      let s = nodeBase[n] * appearK * (1 - out);
      s += nodeBase[n] * 1.6 * Math.exp(-Math.max(0, T - appear[n]) * 3) * (T >= appear[n] ? 1 : 0) * (1 - out);
      let br = 0.85;
      if (T >= 38.6) {
        const relv = nodeRelevant(n);
        s *= mix(1, relv ? 1.15 : 0.7, k5);
        br = mix(0.85, relv ? 1.1 : 0.22, k5);
      }
      if (hovKind === 'node' && hovId === n) { s *= 1.45; br = 1.4; }
      setM(nodes, n, nodePos[n].x, nodePos[n].y, nodePos[n].z, 0, 0, s);
      setM(glows, n, nodePos[n].x, nodePos[n].y, nodePos[n].z, 0, 0, s * 2.1);
      col.set(colors[GRP_TOK[g]] ?? DEFAULTS[GRP_TOK[g]]).multiplyScalar(br);
      nodes.setColorAt(n, col);
      col.multiplyScalar(0.9);
      glows.setColorAt(n, col);
    }
    nodes.instanceMatrix.needsUpdate = true; glows.instanceMatrix.needsUpdate = true;
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
    if (glows.instanceColor) glows.instanceColor.needsUpdate = true;

    /* edges */
    for (let e = 0; e < NE; e++) {
      const ed = edges[e];
      const pa = ed.a >= 0 ? nodePos[ed.a] : null;
      const pb = ed.b >= 0 ? nodePos[ed.b] : null;
      const ax = pa ? pa.x : E.x; const ay = pa ? pa.y : E.y; const az = pa ? pa.z : E.z;
      const bx = pb ? pb.x : E.x; const by = pb ? pb.y : E.y; const bz = pb ? pb.z : E.z;
      edgePos[e * 6] = FX * ax; edgePos[e * 6 + 1] = ay; edgePos[e * 6 + 2] = az;
      edgePos[e * 6 + 3] = FX * bx; edgePos[e * 6 + 4] = by; edgePos[e * 6 + 5] = bz;
      let br = smooth((T - ed.t) / 0.9) * ed.w * 0.42 * (1 - out);
      if (T >= 38.6) br *= mix(1, ed.rel ? 2.2 : 0.18, k5);
      // a bright pulse runs along an edge as it connects
      const pulse = Math.exp(-Math.abs(T - ed.t - 0.45) * 2.4) * 0.5 * (1 - out);
      br += pulse;
      const ca = ed.b >= 0 ? GRP_TOK[nodeGroup(ed.b)] : GRP_TOK[nodeGroup(ed.a)];
      col.set(colors[ca] ?? DEFAULTS[ca]).multiplyScalar(br);
      edgeCol[e * 6] = edgeCol[e * 6 + 3] = col.r;
      edgeCol[e * 6 + 1] = edgeCol[e * 6 + 4] = col.g;
      edgeCol[e * 6 + 2] = edgeCol[e * 6 + 5] = col.b;
    }
    edgeGeo.attributes.position.needsUpdate = true;
    edgeGeo.attributes.color.needsUpdate = true;

    /* documents, beams, bars, blocks */
    for (let i = 0; i < NDOC; i++) {
      const p = docPose(i, T);
      const k = docKindOf(i);
      const mesh = docMeshes[k];
      const hv = hovKind === 'doc' && hovId === i ? 1.12 : 1;
      let s = p.s * hv;
      if (p.dim < 1) s *= 1 - out;
      setM(mesh, docSlot(i), p.x, p.y, p.z, p.ry, p.rz, s);
      col.setScalar(p.dim * (hv > 1 ? 1.08 : 1));
      mesh.setColorAt(docSlot(i), col);
      // beam
      const pp = P(i);
      const bu = (T - pp) / 0.9;
      if (bu >= 0 && bu <= 1) {
        const v = 0.78 - 1.56 * bu;
        setM(beams, i, GATE.x, GATE.y + v * DH * 1.25, GATE.z + 0.03, 0, 0, 1.25 * smooth(Math.min(bu * 6, (1 - bu) * 6, 1)), 1.1);
      } else setM(beams, i, 0, 0, 0, 0, 0, 0);
      // highlighted bars
      for (let b = 0; b < 3; b++) {
        const [lu, lv, lw] = BARS[b];
        const tb = pp + 0.9 * (0.78 - lv) / 1.56;
        const vis = smooth((T - tb) / 0.25) * (1 - smooth((T - (pp + 1.05)) / 0.4));
        setM(bars, i * 3 + b, GATE.x + lu * DW * 1.25, GATE.y + lv * DH * 1.25, GATE.z + 0.025, 0, 0, vis * 1.25, lw * DW);
      }
      // blocks
      for (let j = 0; j < BLK; j++) {
        const idx = i * BLK + j;
        const t0 = blkT0(i, j);
        const d = blkDur(j);
        const u = (T - t0) / d;
        if (u <= 0 || u >= 1) { setM(blocks, idx, 0, 0, 0, 0, 0, 0); continue; }
        const e = smooth(u);
        const st = blkStart[idx];
        const np = nodePos[blkNode(i, j)];
        const bx = mix(st.x, np.x, e);
        const by = mix(st.y, np.y, e) + 1.1 * Math.sin(Math.PI * e);
        const bz = mix(st.z, np.z, e);
        const sc = smooth(u * 8) * (1 - smooth((u - 0.82) / 0.18)) * (1 - out);
        dummy.position.set(FX * bx, by, bz);
        dummy.rotation.set(u * 6, FX * u * 4, 0);
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        blocks.setMatrixAt(idx, dummy.matrix);
        col.set(kindHex(docKindOf(i)));
        blocks.setColorAt(idx, col);
      }
    }
    for (const m of docMeshes) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    beams.instanceMatrix.needsUpdate = true; bars.instanceMatrix.needsUpdate = true;
    blocks.instanceMatrix.needsUpdate = true; if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

    /* gate glow while sheets pass */
    let act = 0;
    for (let i = 0; i < NDOC; i++) { const u = T - P(i); if (u > -0.6 && u < 1.2) act = Math.max(act, 1 - Math.abs(u - 0.3) / 1.2); }
    (gateRing.material as THREE_NS.MeshBasicMaterial).opacity = 0.35 + 0.6 * clamp01(act);
    (gateField.material as THREE_NS.MeshBasicMaterial).opacity = 0.03 + 0.1 * clamp01(act);
    gateRing.rotation.z = W * T * 3;

    /* engine */
    const en = engineEnergy(T);
    const beat = T >= 48 && T < 56 ? 0.08 * Math.sin(T * 7) : 0;
    core.scale.setScalar(0.85 + 0.35 * en + beat);
    core.rotation.set(T * 0.6, T * 0.9, 0);
    coreHalo.scale.setScalar(0.9 + 0.5 * en + beat * 2);
    (coreHalo.material as THREE_NS.MeshBasicMaterial).opacity = 0.06 + 0.16 * en;
    (core.material as THREE_NS.MeshBasicMaterial).opacity = 0.55 + 0.45 * en;
    lat.rotation.set(W * T * 2, W * T * 3, 0);
    (lat.material as THREE_NS.LineBasicMaterial).opacity = 0.2 + 0.35 * en;
    shell.scale.setScalar(1 + 0.04 * Math.sin(W * T * 6) * en);
    panels.forEach((m, k) => { m.rotation.y = (k * Math.PI * 2) / 3 + W * T * (1 + 2 * (T >= 48 && T < 56 ? 1 : 0.2)); });
    ringsE.forEach((m, k) => { m.rotation.y = W * T * (k % 2 ? -3 : 4) * (0.5 + en); (m.material as THREE_NS.MeshBasicMaterial).opacity = 0.18 + 0.45 * en; });
    ringMeshes.forEach((r) => { (r.mesh.material as THREE_NS.MeshBasicMaterial).opacity = r.base * (0.5 + 0.8 * en); });

    /* the question signal and ripple */
    const sU = smooth((T - 33.8) / 1.8);
    const sVis = T >= 33.8 && T < 35.7 ? 1 : 0;
    signal.visible = sVis > 0;
    if (sVis) {
      signal.position.set(FX * mix(Q0.x, E.x, sU), mix(Q0.y, E.y, sU) + 0.9 * Math.sin(Math.PI * sU), mix(Q0.z, E.z, sU));
      signal.scale.setScalar(1 + 0.3 * Math.sin(T * 14));
    }
    const rU = clamp01((T - 35.6) / 2.4);
    ripple.visible = rU > 0 && rU < 1;
    if (ripple.visible) {
      ripple.scale.setScalar(mix(0.8, 7.4, easeOut(rU)));
      (ripple.material as THREE_NS.MeshBasicMaterial).opacity = 0.2 * (1 - rU);
    }

    /* context stream towards the engine */
    const fa = smooth((T - 40) / 1.2) * (1 - smooth((T - 52) / 2.0)) * (1 - out);
    for (let k = 0; k < NF; k++) {
      const fd = flowSeed[k];
      const u = (((T - 39.5) * 0.42 + fd.ph) % 1 + 1) % 1;
      const e = u * u * (3 - 2 * u);
      const np = nodePos[fd.n];
      const x = mix(np.x, E.x, e);
      const y = mix(np.y, E.y, e) + fd.jy * Math.sin(Math.PI * e) * 1.4;
      const z = mix(np.z, E.z, e) + fd.jx * Math.sin(Math.PI * e) * 1.4;
      flowPos[k * 3] = FX * x; flowPos[k * 3 + 1] = y; flowPos[k * 3 + 2] = z;
      const b = fa * Math.sin(Math.PI * u) * 1.1;
      col.set(colors.accent ?? DEFAULTS.accent).multiplyScalar(b);
      flowCol[k * 3] = col.r; flowCol[k * 3 + 1] = col.g; flowCol[k * 3 + 2] = col.b;
    }
    flowGeo.attributes.position.needsUpdate = true;
    flowGeo.attributes.color.needsUpdate = true;

    /* source cards */
    for (let k = 0; k < 3; k++) {
      const m = srcMeshes[k];
      const t0 = 42.4 + 0.5 * k;
      const u = smooth((T - t0) / 2.2);
      const from = nodePos[SRC_FROM[k] * PER];
      const to = SRC_POS[k];
      const sc = u * (1 - out) * (hovKind === 'source' && hovId === k ? 1.08 : 1);
      m.visible = sc > 0.001;
      m.position.set(FX * mix(from.x, to.x, u), mix(from.y, to.y, u) + 1.2 * Math.sin(Math.PI * u), mix(from.z, to.z, u));
      m.rotation.set(0, FX * mix(0.6, -0.18, u), 0);
      m.scale.setScalar(Math.max(sc, 0.0001));
      (m.material as THREE_NS.MeshBasicMaterial).opacity = clamp01(u * 1.4);
    }
    lastT = T;
  }
  let lastT = 0;

  /* ---------- stages and camera poses ---------- */
  const pz = (x: number, y: number, z: number) => new THREE.Vector3(FX * x, y, z);
  const CAMS: [[number, number, number], [number, number, number]][] = [
    [[-9, 3.2, 15.5], [-9.5, 0, 0]],
    [[-3, 3.4, 14.5], [-5.2, 0.2, 0]],
    [[3, 5, 19], [3, 0, 0]],
    [[3.5, 3.2, 15], [3, 0.6, 0]],
    [[7.2, 2.8, 14], [5.8, 0.2, 0]],
    [[8.6, 3.0, 12.6], [6.4, -0.2, 0]],
  ];
  const stages: KnowledgeStage[] = CAMS.map(([p, l], i) => ({ t0: STAGE_T[i], t1: STAGE_T[i + 1], pos: pz(...p), look: pz(...l) }));

  /* ---------- API ---------- */
  for (const m of [...docMeshes, beams, bars, nodes, glows, blocks]) m.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  update(0);

  const raycastOne = (ray: THREE_NS.Raycaster, obj: THREE_NS.Object3D) => ray.intersectObject(obj, false);

  return {
    scene, stages, duration: DUR, fov: FOV,
    update,
    setColors(c: KnowledgeColors) {
      colors = { ...DEFAULTS, ...colors, ...c };
      for (const r of regMats) r.m.color.copy(tok(r.tok)).multiplyScalar(r.k);
      (scene.fog as THREE_NS.Fog).color.copy(tok('bg'));
      update(lastT);
    },
    pickAny(ray, Tin) {
      const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
      scene.updateMatrixWorld();
      let best: { d: number; kind: 'doc' | 'node' | 'source'; id: number } | null = null;
      const consider = (d: number, kind: 'doc' | 'node' | 'source', id: number) => { if (!best || d < best.d) best = { d, kind, id }; };
      for (const h of raycastOne(ray, nodes).slice(0, 1)) if (h.instanceId !== undefined && h.instanceId < NN && T >= appear[h.instanceId]) consider(h.distance, 'node', h.instanceId);
      docMeshes.forEach((m, k) => {
        const hs = raycastOne(ray, m);
        if (hs.length && hs[0].instanceId !== undefined) consider(hs[0].distance, 'doc', hs[0].instanceId * 6 + k);
      });
      srcMeshes.forEach((m, k) => { if (m.visible && m.scale.x > 0.5) { const hs = raycastOne(ray, m); if (hs.length) consider(hs[0].distance, 'source', k); } });
      const b = best as { kind: 'doc' | 'node' | 'source'; id: number } | null;
      return b ? { kind: b.kind, id: b.id } : null;
    },
    hover(kind, id) { hovKind = kind; hovId = id; update(lastT); },
    anchors(Tin) {
      const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
      void T;
      const a = (id: string, x: number, y: number, z: number) => ({ id, pos: new THREE.Vector3(FX * x, y, z) });
      const hub = (g: number) => nodePos[g * PER];
      const out: { id: string; pos: THREE_NS.Vector3 }[] = [
        a('docs', -10.8, 3.5, 0), a('gate', GATE.x, GATE.y + 2.7, GATE.z), a('kb', E.x + 5.4, 5.1, 0),
        a('engine', E.x, -2.2, E.z), a('sources', SRC_POS[0].x, SRC_POS[0].y + 1.15, SRC_POS[0].z),
      ];
      const named: [string, number][] = [['abc', 0], ['contract', 1], ['pay', 2], ['supplier', 3]];
      for (const [id, g] of named) { const p = hub(g); out.push(a(id, p.x, p.y + 0.55, p.z)); }
      out.push({ id: 'signal', pos: signal.position.clone().add(new THREE.Vector3(0, 0.8, 0)) });
      return out;
    },
    ui(Tin) {
      const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
      const qa = smooth((T - 32.1) / 0.4) * (1 - smooth((T - 38.6) / 0.6));
      const aa = smooth((T - 51.4) / 0.5) * (1 - smooth((T - 59.0) / 0.8));
      return {
        question: { a: qa, type: clamp01((T - 32.5) / 2.2) },
        answer: { a: aa, type: clamp01((T - 52.0) / 3.4) },
        sources: smooth((T - 43.4) / 1.2) * (1 - outK(T)),
        searching: T >= 35.6 && T < 38.6,
      };
    },
    nodeInfo(id) { return { group: nodeGroup(id), rank: id % PER }; },
    docKind(id) { return docKindOf(id); },
    dispose() {
      scene.traverse((o) => {
        const m = o as THREE_NS.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else if (mat) mat.dispose();
        if ((o as THREE_NS.InstancedMesh).isInstancedMesh) (o as THREE_NS.InstancedMesh).dispose();
      });
      owned.forEach((o) => o.dispose());
      scene.clear();
    },
  };
}
