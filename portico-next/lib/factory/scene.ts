// Procedural Three.js world for the Document Capture "factory" demonstration.
// Core three only, no assets. THREE is injected (dynamic import by the controller), so this file
// imports types only. update(T) is PURE in T: every transform is derived from T through itineraries
// (keyframe tracks that hold their last pose), so seek / restart / loop are trivial.
//
// World units are metres, flow is +X. P(x) = FX * x (FX = -1 in RTL). Positions below are written
// "pre-mirror"; every helper applies FX to X, and negates Y/Z rotations in RTL.
import type * as THREE_NS from 'three';

export interface FactoryColors { [token: string]: string }
export interface FactoryScene {
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
  /** Raycast every clickable document / container; nearest hit as { cat, kind } (kind: bin, paper, card, label, screen, form, dms, box; sheet = factory sheet index for paper and cards). */
  pickDoc?(raycaster: THREE_NS.Raycaster, T: number): { cat: number; kind: string; sheet?: number } | null;
  /** Which code the label printer stamps in stage 7 (barcode atlas or QR texture). */
  setCodeMode?(mode: 'barcode' | 'qr'): void;
  dispose(): void;
}
export interface FactoryOpts {
  rtl: boolean;
  colors: FactoryColors;
  coarse: boolean;
  /** Test/SSR hook: canvas factory used for procedural textures. Falls back to document.createElement. */
  makeCanvas?: (w: number, h: number) => HTMLCanvasElement;
  /** URL of the ECM+ logo mark drawn on the barcode / QR textures (loaded once; a drawn ring is used until then). */
  logoSrc?: string;
}

type TH = typeof THREE_NS;

/* ------------------------------------------------------------------ motion */

interface Pose { x: number; y: number; z: number; ry: number; rx: number; s: number }
type Ease = 'lin' | 'io' | 'out';
interface Key extends Pose { t: number; e: Ease; arc: number }
const EASES: Record<Ease, (u: number) => number> = {
  lin: (u) => u,
  io: (u) => u * u * (3 - 2 * u),
  out: (u) => 1 - (1 - u) * (1 - u),
};
const pz = (x: number, y: number, z: number, ry = 0, rx = 0, s = 1): Pose => ({ x, y, z, ry, rx, s });
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { const u = clamp01(v); return u * u * (3 - 2 * u); };

/** Itinerary: keyframes {t, pose, ease, arc}; holds the first/last pose outside its range. */
class Track {
  keys: Key[] = [];
  constructor(p: Pose) { this.keys.push({ ...p, t: 0, e: 'io', arc: 0 }); }
  private last() { return this.keys[this.keys.length - 1]; }
  to(t: number, p: Partial<Pose>, o: { arc?: number; e?: Ease } = {}): this {
    const l = this.last();
    this.keys.push({ ...l, ...p, t: Math.max(t, l.t), e: o.e ?? 'io', arc: o.arc ?? 0 });
    return this;
  }
  hold(t: number): this { return this.to(t, {}); }
  at(T: number, o: Pose): Pose {
    const ks = this.keys;
    let lo = 0;
    let hi = ks.length - 1;
    if (T <= ks[0].t) return cp(ks[0], o);
    if (T >= ks[hi].t) return cp(ks[hi], o);
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ks[m].t <= T) lo = m; else hi = m; }
    const a = ks[lo];
    const b = ks[lo + 1];
    const u = (T - a.t) / (b.t - a.t);
    const e = EASES[b.e](u);
    o.x = a.x + (b.x - a.x) * e;
    o.y = a.y + (b.y - a.y) * e + b.arc * Math.sin(Math.PI * u);
    o.z = a.z + (b.z - a.z) * e;
    o.ry = a.ry + (b.ry - a.ry) * e;
    o.rx = a.rx + (b.rx - a.rx) * e;
    o.s = a.s + (b.s - a.s) * e;
    return o;
  }
}
function cp(k: Pose, o: Pose): Pose { o.x = k.x; o.y = k.y; o.z = k.z; o.ry = k.ry; o.rx = k.rx; o.s = k.s; return o; }

/* ------------------------------------------------------------------ constants */

const DUR = 64;
const BY = 0.75; // belt surface height
const V = 2.4; // belt speed, m/s
const XARCH = -7.5;
const XSTART = XARCH - V * 1.5; // where sheets are fed onto the belt
const SW = 0.38; // sheet width (x)
const SD = 0.52; // sheet depth (z)
const PHI = 1.22; // lightbox tilt (rad)
const binX = (k: number) => -5.2 + 1.05 * k;
const BIN_Z = 1.5;
const SA = { x: 0.9, z: 1.5 }; // scanner A bed
const SB = { x: 3.0, z: 4.6 }; // scanner B
const C3Z = 4.6;
const LANE_Z = 5.5;
const SCR = { x: 6.2, y: 1.95, z: 0.9 }; // digital archive screen (centre of the face)
const SCR_W = 3.4;
const SCR_H = 1.9;
const scrX = (k: number) => SCR.x + (k - 2) * 0.66;
const PA = { x: 15.1, z: 4.9 }; // paper archive rack (five labelled category boxes)
const paX = (k: number) => PA.x + (k - 2) * 1.1;
const CART0 = { x: -0.4, z: 3.4 }; // paper cart parked beside the originals tray
const CART_TOP = 0.52;
const CART_LOAD = 47;
const CART_WAY = [{ t: 48.2, x: CART0.x, z: CART0.z }, { t: 48.8, x: CART0.x, z: 6.0 }, { t: 53.8, x: PA.x, z: 6.0 }];
const LB = { x: 10.4, y: 1.75, z: -1.3 }; // lightbox centre
const FORM = { x: 13.4, y: 2.5, z: -2.2 };
const PAD = { x: 12.6, z: 3.4 };
const CAB = { x: 15.8, z: 1.2 };
const DMS = { x: 15.8, y: 1.95, z: 1.2 }; // ECM+ Documents archive monitor
const DMS_W = 2.6;
const DMS_H = 1.6;
const archT = (i: number) => 10.5 + 0.85 * i;
const placeT = (i: number) => archT(i) - 1.5;
const tbT = (i: number) => archT(i) + (binX(i % 5) - XARCH) / V;
const tkT = (k: number) => 20 + 2.2 * k;
const WS5 = [38, 41.1, 42.3, 43.5, 44.7];
const WS6 = (k: number) => 46 + 1.4 * k;
const PS = (k: number) => 53 + 1.8 * k;
const HOP = (k: number) => PS(k) + 1.0; // original paper of category k is filed into its box
const FLAG_ON = tkT(3) + 1.9;
const FLAG_OFF = 35.3;
const BAD = 3; // sheet that scans badly (identity)
const FOLDED = 6; // folded contract
const FOLD_SWAP = 9.0;
const TRAY_ORDER = [0, 5, 1, 6, 2, 7, 8, 4, 9, 3];

const DEFAULTS: FactoryColors = {
  floor: '#e8e4da', belt: '#6b6f78', machine: '#c9ced6', accent: '#d9a21b', navy: '#1f3a5f',
  graphite: '#3a3f4a', ok: '#2f9e63', warn: '#e0a021', bad: '#d1453b',
  cat0: '#a87b0e', cat1: '#1f3a5f', cat2: '#b5522e', cat3: '#22736e', cat4: '#6e6351', bg: '#f4f2ee',
};

// Overlay zones on the lightbox card, as fractions of the card (centre origin, v up).
const OV = [
  { id: 'ov-header', u: 0, v: 0.41, w: 0.92, h: 0.14 },
  { id: 'ov-title', u: 0, v: 0.25, w: 0.7, h: 0.08 },
  { id: 'ov-refs', u: -0.22, v: 0.13, w: 0.5, h: 0.07 },
  { id: 'ov-dates', u: 0.27, v: 0.13, w: 0.34, h: 0.07 },
  { id: 'ov-body', u: 0, v: -0.02, w: 0.86, h: 0.2 },
  { id: 'ov-table', u: 0, v: -0.22, w: 0.86, h: 0.2 },
  { id: 'ov-footer', u: 0, v: -0.42, w: 0.8, h: 0.07 },
];
const CARD_SCALE = 2.4;
const SHEET_K = 1.3; // visual scale of loose sheets so they read at stage zoom
const QR_N = 21;
const BARS = [2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 2];

/* ------------------------------------------------------------------ factory */

export function createFactoryScene(THREE: TH, opts: FactoryOpts): FactoryScene {
  const FX = opts.rtl ? -1 : 1;
  const mkCanvas = opts.makeCanvas ?? ((w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  });
  let colors: FactoryColors = { ...DEFAULTS, ...opts.colors };
  const scene = new THREE.Scene();
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(o: T): T => { owned.push(o); return o; };

  const regMats: { m: { color: THREE_NS.Color }; tok: string }[] = [];
  const tokColor = (tok: string) => new THREE.Color(colors[tok] ?? DEFAULTS[tok] ?? '#ff00ff');
  const lambert = (tok: string, extra: THREE_NS.MeshLambertMaterialParameters = {}) => {
    const m = own(new THREE.MeshLambertMaterial({ color: tokColor(tok), ...extra }));
    if (extra.color === undefined) regMats.push({ m, tok });
    return m;
  };
  const basic = (tok: string | null, extra: THREE_NS.MeshBasicMaterialParameters = {}) => {
    const m = own(new THREE.MeshBasicMaterial({ color: tok ? tokColor(tok) : 0xffffff, ...extra }));
    if (tok) regMats.push({ m, tok });
    return m;
  };

  /* ---------- textures (procedural canvases) ---------- */
  function tex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
    const cv = mkCanvas(w, h);
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    draw(ctx, w, h);
    const t = own(new THREE.CanvasTexture(cv));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  // ECM+ logo mark: loaded once (browser only), the textures that carry it redraw when it arrives
  let logoImg: HTMLImageElement | null = null;
  const logoRedraws: (() => void)[] = [];
  if (opts.logoSrc && typeof Image !== 'undefined') {
    try {
      const im = new Image();
      im.onload = () => { logoImg = im; logoRedraws.forEach((fn) => fn()); };
      im.src = opts.logoSrc;
    } catch { /* keep the drawn ring */ }
  }
  function drawLogo(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
    if (logoImg) { c.drawImage(logoImg, x, y, size, size); return; }
    c.fillStyle = '#ffffff'; c.fillRect(x, y, size, size);
    c.strokeStyle = '#d9a21b'; c.lineWidth = size * 0.14;
    c.beginPath(); c.ellipse(x + size / 2, y + size / 2, size * 0.38, size * 0.26, -0.15, 0, 6.283); c.stroke();
    c.fillStyle = '#3a3f4a'; c.fillRect(x + size * 0.3, y + size * 0.45, size * 0.4, size * 0.1);
  }
  function logoTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
    const cv = mkCanvas(w, h);
    const ctx = cv.getContext('2d') as CanvasRenderingContext2D;
    draw(ctx, w, h);
    const t = own(new THREE.CanvasTexture(cv));
    t.colorSpace = THREE.SRGBColorSpace;
    logoRedraws.push(() => { draw(ctx, w, h); t.needsUpdate = true; });
    return t;
  }
  const GREY = '#8b9099';
  const LIGHT = '#d5d8de';
  function lines(c: CanvasRenderingContext2D, x: number, y: number, w: number, n: number, gap: number, col = GREY) {
    c.fillStyle = col;
    for (let i = 0; i < n; i++) c.fillRect(x, y + i * gap, w * (i === n - 1 ? 0.6 : 1), 3);
  }
  function paper(kind: number) {
    return tex(128, 176, (c, w, h) => {
      c.fillStyle = '#fbfaf6'; c.fillRect(0, 0, w, h);
      c.strokeStyle = LIGHT; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
      if (kind === 0) { // invoice: header, table, total
        c.fillStyle = '#5b6372'; c.fillRect(10, 10, 50, 8);
        c.fillStyle = GREY; c.fillRect(w - 46, 10, 36, 4); c.fillRect(w - 46, 18, 36, 4);
        c.fillStyle = LIGHT; c.fillRect(10, 52, w - 20, 10);
        c.strokeStyle = GREY; c.lineWidth = 1; c.strokeRect(10, 52, w - 20, 88);
        for (let r = 0; r < 6; r++) { c.fillStyle = GREY; c.fillRect(14, 70 + r * 12, 54, 3); c.fillRect(w - 40, 70 + r * 12, 26, 3); }
        c.fillStyle = '#5b6372'; c.fillRect(w - 56, 148, 46, 12);
      } else if (kind === 1) { // contract: title and clauses
        c.fillStyle = '#5b6372'; c.fillRect(30, 12, w - 60, 7);
        for (let b = 0; b < 4; b++) {
          c.fillStyle = '#5b6372'; c.fillRect(10, 36 + b * 28, 8, 8);
          lines(c, 24, 36 + b * 28, w - 36, 3, 8);
        }
        c.fillStyle = GREY; c.fillRect(14, 156, 40, 2); c.fillRect(w - 54, 156, 40, 2);
      } else if (kind === 2) { // application: photo box + form lines
        c.fillStyle = '#5b6372'; c.fillRect(10, 12, 44, 6);
        c.fillStyle = LIGHT; c.fillRect(w - 44, 10, 34, 42);
        c.strokeStyle = GREY; c.lineWidth = 1; c.strokeRect(w - 44, 10, 34, 42);
        c.fillStyle = GREY; c.beginPath(); c.arc(w - 27, 26, 7, 0, 6.283); c.fill(); c.fillRect(w - 38, 36, 22, 10);
        for (let r = 0; r < 7; r++) { c.fillStyle = GREY; c.fillRect(10, 66 + r * 14, 30, 3); c.fillStyle = LIGHT; c.fillRect(46, 64 + r * 14, w - 56, 7); }
      } else if (kind === 3) { // identity card on a page
        c.fillStyle = '#5b6372'; c.fillRect(10, 12, 60, 6);
        c.fillStyle = '#e8ebf0'; c.fillRect(12, 44, w - 24, 78);
        c.strokeStyle = GREY; c.lineWidth = 2; c.strokeRect(12, 44, w - 24, 78);
        c.fillStyle = LIGHT; c.fillRect(20, 54, 30, 38);
        c.fillStyle = GREY; c.beginPath(); c.arc(35, 66, 7, 0, 6.283); c.fill(); c.fillRect(25, 76, 20, 12);
        lines(c, 58, 58, w - 78, 5, 11);
        c.fillStyle = '#5b6372'; c.fillRect(20, 104, w - 40, 6);
        lines(c, 10, 138, w - 20, 3, 10);
      } else { // letter
        c.fillStyle = '#5b6372'; c.beginPath(); c.arc(22, 24, 10, 0, 6.283); c.fill();
        c.fillStyle = GREY; c.fillRect(40, 18, 50, 4); c.fillRect(40, 27, 36, 3);
        c.fillStyle = GREY; c.fillRect(w - 44, 52, 34, 3);
        lines(c, 12, 70, w - 24, 8, 11);
        c.fillStyle = '#5b6372'; c.fillRect(12, 160, 36, 3);
      }
    });
  }
  const paperTex = [0, 1, 2, 3, 4].map(paper);
  const cardTex = tex(64, 88, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#9aa0aa'; c.fillRect(6, 8, w - 12, 8);
    lines(c, 6, 28, w - 12, 5, 9);
    c.fillStyle = '#c3c8d0'; c.fillRect(6, 62, w - 12, 18);
  });
  const barcodeTex = logoTex(256, 96, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    const total = BARS.reduce((a, b) => a + b, 0);
    const k = (w - 20) / total;
    let x = 10;
    c.fillStyle = '#111111';
    BARS.forEach((n, i) => { if (i % 2 === 0) c.fillRect(x, 6, Math.max(1, n * k), 50); x += n * k; });
    drawLogo(c, (w - 32) / 2, 59, 32); // ECM+ mark centred under the bars
  });
  const qrTex = logoTex(128, 128, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    const m = 6; const cell = (w - 2 * m) / QR_N;
    let sd = 418;
    const rnd = () => { sd = (sd * 1103515245 + 12345) & 0x7fffffff; return sd % 100 < 48; };
    const finder = (r: number, q: number): boolean | null => (r < 7 && q < 7 ? (r === 0 || r === 6 || q === 0 || q === 6 || (r >= 2 && r <= 4 && q >= 2 && q <= 4)) : null);
    c.fillStyle = '#111111';
    for (let r = 0; r < QR_N; r++) for (let q = 0; q < QR_N; q++) {
      let on: boolean;
      const f = finder(r, q) ?? finder(r, QR_N - 1 - q) ?? finder(QR_N - 1 - r, q);
      if (f !== null) on = f;
      else {
        const quiet = (r === 7 || q === 7 || r === QR_N - 8 || q === QR_N - 8) && (r < 8 || q < 8 || (r >= QR_N - 8 && q < 8) || (q >= QR_N - 8 && r < 8));
        on = quiet ? false : rnd();
      }
      if (on) c.fillRect(m + q * cell, m + r * cell, cell + 0.5, cell + 0.5);
    }
    // ECM+ mark on a white quiet-zone square: 7.4 of 21 modules per side (12% of the area, within error correction)
    const side = cell * 7.4; const lx = (w - side) / 2;
    c.fillStyle = '#ffffff'; c.fillRect(lx, lx, side, side);
    drawLogo(c, lx + cell * 0.4, lx + cell * 0.4, side - cell * 0.8);
  });
  // digital archive screen: five category columns, redrawn only when a column's state changes
  const scrCv = mkCanvas(512, 288);
  const scrCtx = scrCv.getContext('2d') as CanvasRenderingContext2D;
  const scrTex = own(new THREE.CanvasTexture(scrCv));
  scrTex.colorSpace = THREE.SRGBColorSpace;
  let scrKey = '';
  let scrSt: number[] = [0, 0, 0, 0, 0];
  function drawScreen(c: CanvasRenderingContext2D, w: number, h: number, st: number[]) {
    c.fillStyle = '#151a22'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1f3a5f'; c.fillRect(0, 0, w, 36);
    drawLogo(c, 8, 5, 26);
    c.fillStyle = '#8fa0bd'; c.fillRect(44, 15, 84, 6); c.fillRect(w - 70, 15, 56, 6);
    const pxm = w / SCR_W;
    for (let k = 0; k < 5; k++) {
      const col = colors['cat' + k] ?? DEFAULTS['cat' + k];
      const cx = w / 2 + FX * (k - 2) * 0.66 * pxm;
      c.fillStyle = col; c.fillRect(cx - 0.31 * pxm, 46, 0.62 * pxm, 10);
      for (let r = 0; r < 2; r++) {
        const cy = h / 2 - (0.22 - r * 0.6) * pxm;
        c.globalAlpha = st[k] === 1 ? 0.12 : 0.45; c.strokeStyle = col; c.lineWidth = 2;
        c.strokeRect(cx - 0.17 * pxm, cy - 0.23 * pxm, 0.34 * pxm, 0.46 * pxm);
        c.globalAlpha = 1;
      }
      c.fillStyle = '#2d4c77'; c.fillRect(cx - 0.31 * pxm, h - 24, 0.62 * pxm, 9);
      if (st[k] > 0) { c.fillStyle = st[k] === 2 ? (colors.ok ?? DEFAULTS.ok) : col; c.fillRect(cx - 0.31 * pxm, h - 24, 0.62 * pxm, 9); }
    }
  }
  function refreshScreen(st: number[], force = false) {
    const key = st.join('');
    if (!force && key === scrKey) return;
    scrKey = key; scrSt = st.slice();
    drawScreen(scrCtx, 512, 288, st);
    scrTex.needsUpdate = true;
  }
  logoRedraws.push(() => refreshScreen(scrSt, true));
  // ECM+ Documents explorer on the archive monitor: folder tree with counts, and a file list that fills as documents are filed
  const dmsCv = mkCanvas(520, 320);
  const dmsCtx = dmsCv.getContext('2d') as CanvasRenderingContext2D;
  const dmsTex = own(new THREE.CanvasTexture(dmsCv));
  dmsTex.colorSpace = THREE.SRGBColorSpace;
  let dmsKey = '';
  let dmsSt: number[] = [0, 0, 0, 0, 0];
  function drawDms(c: CanvasRenderingContext2D, w: number, h: number, st: number[]) {
    const X = (x: number, ww: number) => (FX < 0 ? w - x - ww : x);
    c.fillStyle = '#f6f4ef'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1f3a5f'; c.fillRect(0, 0, w, 34);
    drawLogo(c, X(8, 24), 5, 24);
    c.fillStyle = '#c9d3e6'; c.fillRect(X(40, 70), 14, 70, 6);
    c.fillStyle = '#e9e5dc'; c.fillRect(X(0, 150), 34, 150, h - 34);
    let last = -1;
    st.forEach((v, k) => { if (v > 0) last = k; });
    for (let k = 0; k < 5; k++) {
      const y = 50 + k * 40;
      if (k === last) { c.fillStyle = '#fbeec4'; c.fillRect(X(4, 142), y - 8, 142, 32); }
      c.fillStyle = colors['cat' + k] ?? DEFAULTS['cat' + k]; c.fillRect(X(14, 22), y, 22, 16);
      c.fillStyle = '#8b9099'; c.fillRect(X(44, 66), y + 5, 66, 6);
      c.fillStyle = '#1f3a5f'; c.font = '600 14px sans-serif'; c.textAlign = FX < 0 ? 'left' : 'right';
      c.fillText(String(st[k] * 1), FX < 0 ? X(118, 20) + 0 : 138, y + 13);
    }
    c.fillStyle = '#d7d2c6'; c.fillRect(X(170, 340), 46, 340, 22);
    let row = 0;
    for (let k = 0; k < 5; k++) for (let j = 0; j < st[k]; j++) {
      const y = 76 + row * 26; row++;
      c.fillStyle = row % 2 ? '#ffffff' : '#efece4'; c.fillRect(X(170, 340), y, 340, 24);
      c.fillStyle = colors['cat' + k] ?? DEFAULTS['cat' + k]; c.fillRect(X(176, 12), y + 6, 12, 12);
      c.fillStyle = '#8b9099'; c.fillRect(X(196, 120), y + 9, 120, 6);
      c.fillStyle = '#111111'; c.fillRect(X(330, 28), y + 5, 28, 14);
      c.fillStyle = colors.ok ?? DEFAULTS.ok; c.fillRect(X(470, 34), y + 6, 34, 12);
    }
  }
  function refreshDms(st: number[], force = false) {
    const key = st.join('');
    if (!force && key === dmsKey) return;
    dmsKey = key; dmsSt = st.slice();
    drawDms(dmsCtx, 520, 320, st);
    dmsTex.needsUpdate = true;
  }
  logoRedraws.push(() => refreshDms(dmsSt, true));
  function beltTex(len: number) {
    const t = tex(64, 8, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#c9cdd3'; c.fillRect(w / 2, 0, w / 2, h);
    });
    t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(len / 0.4, 1);
    return t;
  }

  /* ---------- geometry helpers ---------- */
  const dummy = new THREE.Object3D();
  dummy.rotation.order = 'YXZ';
  const tmpC = new THREE.Color();
  const WHITE = new THREE.Color(0xffffff);

  function flat(w: number, d: number) { // plane in XZ, texture top toward -Z
    const g = own(new THREE.PlaneGeometry(w, d));
    g.rotateX(-Math.PI / 2);
    return g;
  }
  function mergeGeos(gs: THREE_NS.BufferGeometry[]) {
    const pos: number[] = []; const nor: number[] = []; const uv: number[] = []; const idx: number[] = [];
    for (const g of gs) {
      const base = pos.length / 3;
      const p = g.attributes.position; const n = g.attributes.normal; const u = g.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
        uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(base + g.index.getX(i));
      else for (let i = 0; i < p.count; i++) idx.push(base + i);
      g.dispose();
    }
    const out = own(new THREE.BufferGeometry());
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    out.setIndex(idx);
    return out;
  }
  const mQ = new THREE.Quaternion(); const mE = new THREE.Euler(0, 0, 0, 'YXZ');
  const mV = new THREE.Vector3(); const mS = new THREE.Vector3(1, 1, 1); const mM = new THREE.Matrix4();
  /** Place a (possibly symmetric) geometry in the mirrored world. */
  function placeGeo(g: THREE_NS.BufferGeometry, x: number, y: number, z: number, ry = 0, rx = 0) {
    mE.set(rx, FX * ry, 0, 'YXZ');
    mQ.setFromEuler(mE);
    mM.compose(mV.set(FX * x, y, z), mQ, mS);
    g.applyMatrix4(mM);
    return g;
  }
  const groups: Record<string, THREE_NS.BufferGeometry[]> = {};
  const sbox = (tok: string, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rx = 0) => {
    (groups[tok] ??= []).push(placeGeo(new THREE.BoxGeometry(w, h, d), x, y, z, ry, rx));
  };
  const scyl = (tok: string, r: number, h: number, x: number, y: number, z: number) => {
    (groups[tok] ??= []).push(placeGeo(new THREE.CylinderGeometry(r, r, h, 10), x, y, z));
  };
  const table = (x: number, z: number, w: number, d: number) => {
    sbox('machine', w, 0.08, d, x, 0.86, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) sbox('graphite', 0.08, 0.82, 0.08, x + sx * (w / 2 - 0.08), 0.41, z + sz * (d / 2 - 0.08));
  };

  /* ---------- static world ---------- */
  sbox('floor', 37, 0.2, 13, 0, -0.1, 0);
  sbox('accent', 36, 0.012, 0.08, 0, 0.006, -5.7);
  sbox('accent', 36, 0.012, 0.08, 0, 0.006, 5.9);

  // S1 preparation
  sbox('graphite', 1.5, 0.15, 1.2, -15.2, 0.075, -1.6); // pallet
  sbox('navy', 1.0, 0.22, 0.8, -15.2, 0.26, -1.6); // folder
  table(-12.6, -1.8, 1.9, 0.95); // prep table
  sbox('graphite', 0.4, 0.04, 0.3, -11.95, 0.92, -1.6); // staple tray
  table(-9.6, -2.9, 1.4, 0.9); // manual-treatment table
  sbox('accent', 0.5, 0.05, 0.05, -9.6, 1.0, -3.3); // manual flag marker on table

  // belt C1 / sorting belt: rails, legs
  sbox('graphite', 10.8, 0.1, 0.06, -6.0, 0.7, -0.4);
  sbox('graphite', 5.6, 0.1, 0.06, -8.6, 0.7, 0.4);
  for (let x = -11; x <= -0.8; x += 2.0) sbox('graphite', 0.1, 0.65, 0.6, x, 0.325, 0);

  // S2 title-reader arch
  for (const sz of [-1, 1]) sbox('navy', 0.1, 1.0, 0.1, XARCH, 1.25, sz * 0.58);
  sbox('navy', 0.2, 0.14, 1.3, XARCH, 1.77, 0);
  sbox('accent', 0.1, 0.1, 0.24, XARCH, 1.62, 0);
  // gantry rail
  sbox('graphite', 7.6, 0.12, 0.12, -1.9, 2.0, BIN_Z);
  for (const px of [-5.7, -1.9, 1.9]) sbox('navy', 0.12, 2.0, 0.12, px, 1.0, 2.35);
  for (const px of [-5.7, -1.9, 1.9]) sbox('navy', 0.12, 0.12, 0.9, px, 2.0, 1.95);

  // S3 scanner A, trays
  sbox('machine', 1.1, 0.9, 1.0, SA.x, 0.45, SA.z);
  sbox('navy', 0.8, 0.02, 0.7, SA.x, 0.91, SA.z);
  sbox('graphite', 1.1, 0.06, 0.1, SA.x, 0.95, SA.z - 0.55);
  sbox('machine', 0.4, 0.5, 0.4, 0.9, 0.25, 3.2);
  sbox('graphite', 0.7, 0.08, 0.7, 0.9, 0.52, 3.2); // originals tray
  sbox('machine', 0.3, 0.5, 0.3, 2.4, 0.25, 2.7);
  sbox('bad', 0.6, 0.06, 0.6, 2.4, 0.57, 2.7); // reject tray
  // digital rail (solid base under the glow strip)
  sbox('graphite', 6.2, 0.04, 0.2, 7.1, 0.02, 2.15);

  // S4 belt C3 + return lane + scanner B + QC desk
  sbox('graphite', 3.7, 0.1, 0.06, 3.05, 0.7, C3Z - 0.33);
  sbox('graphite', 3.7, 0.1, 0.06, 3.05, 0.7, C3Z + 0.33);
  sbox('graphite', 3.7, 0.1, 0.06, 3.05, 0.7, LANE_Z + 0.23);
  for (const lx of [1.4, 3.05, 4.7]) { sbox('graphite', 0.1, 0.65, 0.6, lx, 0.325, C3Z); sbox('graphite', 0.1, 0.65, 0.4, lx, 0.325, LANE_Z); }
  for (const sz of [-1, 1]) sbox('navy', 0.1, 0.9, 0.1, SB.x, 1.1, C3Z + sz * 0.45);
  sbox('navy', 0.35, 0.15, 1.0, SB.x, 1.6, C3Z);
  table(6.0, 3.9, 1.5, 0.7);
  sbox('navy', 0.8, 0.5, 0.05, 6.0, 1.15, 3.75); // QC monitor

  // S5 lightbox
  sbox('navy', 1.9, 0.08, 1.75, LB.x, LB.y, LB.z, 0, PHI);
  sbox('graphite', 0.12, 1.2, 0.12, LB.x - 0.8, 0.6, LB.z - 0.55);
  sbox('graphite', 0.12, 1.2, 0.12, LB.x + 0.8, 0.6, LB.z - 0.55);
  sbox('graphite', 1.9, 0.1, 0.4, LB.x, 0.05, LB.z - 0.35);

  // S6 metadata desk + form panel frame
  table(13.4, -0.2, 1.9, 0.8);
  sbox('navy', 0.8, 0.5, 0.05, 13.4, 1.25, -0.45); // monitor
  sbox('navy', 2.4, 2.3, 0.08, FORM.x, FORM.y, FORM.z);
  sbox('accent', 2.2, 0.16, 0.02, FORM.x, FORM.y + 0.95, FORM.z + 0.05);
  for (let r = 0; r < 6; r++) sbox('graphite', 1.8, 0.14, 0.02, FORM.x + 0.05, FORM.y + 0.6 - r * 0.33, FORM.z + 0.05);
  sbox('graphite', 0.1, 1.4, 0.1, FORM.x, 1.0, FORM.z - 0.1); // panel stalk

  // S7 printer + archive cabinet
  sbox('machine', 1.2, 0.8, 0.9, PAD.x, 0.4, PAD.z);
  sbox('navy', 0.08, 0.8, 0.08, PAD.x - 0.55, 1.2, PAD.z - 0.35);
  sbox('navy', 0.08, 0.8, 0.08, PAD.x + 0.55, 1.2, PAD.z - 0.35);
  sbox('navy', 1.2, 0.1, 0.14, PAD.x, 1.62, PAD.z - 0.35);
  sbox('navy', DMS_W + 0.3, DMS_H + 0.3, 0.1, DMS.x, DMS.y, DMS.z);
  sbox('graphite', 0.2, 0.8, 0.12, DMS.x, 0.65, DMS.z - 0.05);
  sbox('graphite', 1.2, 0.08, 0.7, DMS.x, 0.04, DMS.z);

  // digital archive screen (bezel, neck, base) and the paper archive rack
  sbox('navy', SCR_W + 0.3, SCR_H + 0.3, 0.1, SCR.x, SCR.y, SCR.z);
  sbox('graphite', 0.2, 0.7, 0.12, SCR.x, 0.6, SCR.z - 0.05);
  sbox('graphite', 1.2, 0.08, 0.7, SCR.x, 0.04, SCR.z);
  sbox('machine', 5.7, 0.08, 1.0, PA.x, 0.46, PA.z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) sbox('graphite', 0.1, 0.42, 0.1, PA.x + sx * 2.75, 0.21, PA.z + sz * 0.42);
  sbox('navy', 5.7, 0.5, 0.05, PA.x, 0.75, PA.z - 0.48);

  const staticMeshes: THREE_NS.Mesh[] = [];
  for (const tok of Object.keys(groups)) {
    const mesh = new THREE.Mesh(mergeGeos(groups[tok]), lambert(tok));
    scene.add(mesh); staticMeshes.push(mesh);
  }

  /* ---------- belts (scrolling stripes; texture offset is a pure function of T) ---------- */
  const belts: { tex: THREE_NS.CanvasTexture; sign: number }[] = [];
  function belt(x0: number, x1: number, z: number, w: number, lane: boolean) {
    const t = beltTex(x1 - x0);
    const m = new THREE.Mesh(placeGeo(flat(x1 - x0, w), (x0 + x1) / 2, BY, z), lambert('belt', { map: t }));
    scene.add(m);
    belts.push({ tex: t, sign: lane ? -1 : 1 });
  }
  belt(-11.4, -0.6, 0, 0.7, false);
  belt(1.2, 4.9, C3Z, 0.6, false);
  belt(1.2, 4.9, LANE_Z, 0.4, true);

  /* ---------- instancing helpers ---------- */
  function inst(geo: THREE_NS.BufferGeometry, mat: THREE_NS.Material, n: number) {
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    scene.add(m);
    return m;
  }
  function setM(m: THREE_NS.InstancedMesh, i: number, x: number, y: number, z: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number) {
    dummy.position.set(FX * x, y, z);
    dummy.rotation.set(rx, FX * ry, FX * rz);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
  }
  const catCols: THREE_NS.Color[] = [0, 1, 2, 3, 4].map((k) => tokColor('cat' + k));
  const instColorFns: (() => void)[] = [];

  /* ---------- bins (picking), halos ---------- */
  const binGeo = (() => {
    const gs: THREE_NS.BufferGeometry[] = [];
    const add = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); gs.push(g);
    };
    add(0.85, 0.06, 0.85, 0, 0.03, 0);
    add(0.85, 0.6, 0.05, 0, 0.3, 0.4); add(0.85, 0.6, 0.05, 0, 0.3, -0.4);
    add(0.05, 0.6, 0.85, 0.4, 0.3, 0); add(0.05, 0.6, 0.85, -0.4, 0.3, 0);
    return mergeGeos(gs);
  })();
  const bins = inst(binGeo, lambert('floor', { color: 0xffffff }), 5);
  for (let k = 0; k < 5; k++) setM(bins, k, binX(k), 0, BIN_Z, 0, 0, 0, 1, 1, 1);
  bins.computeBoundingSphere();
  let hovered = -1;
  const halo = inst(own(new THREE.RingGeometry(0.5, 0.6, 20).rotateX(-Math.PI / 2)), basic('accent', { transparent: true, opacity: 0.9, depthWrite: false }), 5);
  function applyHover() {
    for (let k = 0; k < 5; k++) {
      tmpC.copy(catCols[k]);
      if (k === hovered) tmpC.lerp(WHITE, 0.35);
      bins.setColorAt(k, tmpC);
      setM(halo, k, binX(k), 0.64, BIN_Z, 0, 0, 0, k === hovered ? 1 : 0, 1, k === hovered ? 1 : 0);
    }
    if (bins.instanceColor) bins.instanceColor.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
  }
  instColorFns.push(applyHover);

  /* ---------- digital platforms, drawers ---------- */
  const screenMesh = new THREE.Mesh(own(new THREE.PlaneGeometry(SCR_W, SCR_H)), basic(null, { map: scrTex }));
  screenMesh.position.set(FX * SCR.x, SCR.y, SCR.z + 0.055);
  scene.add(screenMesh);
  const formHit = new THREE.Mesh(own(new THREE.PlaneGeometry(2.4, 2.3)), basic(null, { visible: false, side: THREE.DoubleSide }));
  formHit.position.set(FX * FORM.x, FORM.y, FORM.z + 0.09);
  scene.add(formHit);
  // paper archive boxes, colour-coded like the bins, with a label on the front (same code as the stamped stack)
  const paBoxGeo = (() => {
    const gs: THREE_NS.BufferGeometry[] = [];
    const add = (w: number, h: number, d: number, x: number, y: number, z: number) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); gs.push(g); };
    add(0.9, 0.04, 0.8, 0, 0.02, 0);
    add(0.9, 0.26, 0.04, 0, 0.13, 0.38); add(0.9, 0.4, 0.04, 0, 0.2, -0.38);
    add(0.04, 0.3, 0.8, 0.43, 0.15, 0); add(0.04, 0.3, 0.8, -0.43, 0.15, 0);
    return mergeGeos(gs);
  })();
  const paBoxes = inst(paBoxGeo, lambert('floor', { color: 0xffffff }), 5);
  for (let k = 0; k < 5; k++) setM(paBoxes, k, paX(k), 0.5, PA.z, 0, 0, 0, 1, 1, 1);
  instColorFns.push(() => { for (let k = 0; k < 5; k++) paBoxes.setColorAt(k, catCols[k]); if (paBoxes.instanceColor) paBoxes.instanceColor.needsUpdate = true; });
  const boxLabelMat = basic(null, { map: barcodeTex });
  const boxLabels = inst(own(new THREE.PlaneGeometry(1, 1)), boxLabelMat, 5);
  const dmsMesh = new THREE.Mesh(own(new THREE.PlaneGeometry(DMS_W, DMS_H)), basic(null, { map: dmsTex }));
  dmsMesh.position.set(FX * DMS.x, DMS.y, DMS.z + 0.055);
  scene.add(dmsMesh);

  /* ---------- paper: 5 categories x 2 sheets, folded-sheet halves ---------- */
  const sheetGeo = flat(SW, SD);
  const paperMesh = [0, 1, 2, 3, 4].map((c) => inst(sheetGeo, basic(null, { map: paperTex[c], side: THREE.DoubleSide }), 2));
  const halfGeo = (left: boolean) => {
    const g = own(new THREE.PlaneGeometry(SW / 2, SD));
    g.rotateX(-Math.PI / 2);
    g.translate(left ? -SW / 4 : SW / 4, 0, 0);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.5 + (left ? 0 : 0.5));
    return g;
  };
  const halfMat = basic(null, { map: paperTex[1], side: THREE.DoubleSide });
  const halfL = new THREE.Mesh(halfGeo(true), halfMat);
  const halfR = new THREE.Mesh(halfGeo(false), halfMat);
  scene.add(halfL, halfR);

  // digital cards (tinted by category)
  const cards = inst(flat(SW, SD), basic(null, { map: cardTex, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide }), 10);
  instColorFns.push(() => {
    for (let i = 0; i < 10; i++) { tmpC.copy(WHITE).lerp(catCols[i % 5], 0.55); cards.setColorAt(i, tmpC); }
    if (cards.instanceColor) cards.instanceColor.needsUpdate = true;
  });

  // barcode labels
  const labelMat = basic(null, { map: barcodeTex, side: THREE.DoubleSide });
  const labels = inst(flat(0.3, 0.1125), labelMat, 5);
  let codeMode: 'barcode' | 'qr' = 'barcode';
  let lastT = 0;

  // staples (3) + clip (1)
  const staples = inst(own(new THREE.BoxGeometry(0.1, 0.02, 0.035)), basic('graphite'), 4);
  const STAPLE = [
    { sheet: 0, tr: 3.0, ox: -0.12, oz: -0.2 },
    { sheet: 1, tr: 3.6, ox: -0.12, oz: -0.2 },
    { sheet: 2, tr: 4.2, ox: -0.12, oz: -0.2 },
    { sheet: 4, tr: 5.4, ox: 0.1, oz: -0.22 },
  ];

  // overlays on the lightbox card, link lines, rows
  const overlays = inst(flat(1, 1), basic('accent', { transparent: true, opacity: 0.55, depthWrite: false }), 7);
  const rowFill = inst(own(new THREE.BoxGeometry(1.8, 0.1, 0.02).translate(FX * 0.9, 0, 0)), basic('accent'), 6);
  const DASH = 12;
  const linkGeo = own(new THREE.BufferGeometry());
  const linkPos = new Float32Array(6 * DASH * 2 * 3);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, own(new THREE.LineBasicMaterial({ color: tokColor('accent') })));
  regMats.push({ m: links.material as THREE_NS.LineBasicMaterial, tok: 'accent' });
  links.frustumCulled = false; scene.add(links);
  const approve = new THREE.Mesh(own(new THREE.BoxGeometry(0.32, 0.32, 0.03)), basic('ok'));
  approve.position.set(FX * FORM.x, FORM.y - 0.95, FORM.z + 0.07);
  scene.add(approve);

  // lightbox glow, rail glow
  const lbN = new THREE.Vector3(0, Math.cos(PHI), Math.sin(PHI));
  const lbGlow = new THREE.Mesh(flat(1.7, 1.55), basic('accent', { transparent: true, opacity: 0.3, depthWrite: false }));
  lbGlow.renderOrder = 1; cards.renderOrder = 2; overlays.renderOrder = 3; // glow under the card, highlights over it
  lbGlow.rotation.x = PHI;
  lbGlow.position.set(FX * LB.x, LB.y + lbN.y * 0.05, LB.z + lbN.z * 0.05);
  scene.add(lbGlow);
  const railGlow = new THREE.Mesh(flat(6.2, 0.14), basic('accent', { transparent: true, opacity: 0.4, depthWrite: false }));
  railGlow.position.set(FX * 7.1, 0.05, 2.15);
  scene.add(railGlow);

  /* ---------- small machines: carriage, paddles, arch flash, scanner bars/LEDs, lid, printer head, flag ---------- */
  const carriage = new THREE.Mesh(mergeGeos([
    new THREE.BoxGeometry(0.5, 0.2, 0.4),
    new THREE.BoxGeometry(0.04, 0.3, 0.04).translate(-0.15, -0.25, 0),
    new THREE.BoxGeometry(0.04, 0.3, 0.04).translate(0.15, -0.25, 0),
    new THREE.BoxGeometry(0.5, 0.05, 0.4).translate(0, -0.42, 0),
  ]), lambert('accent'));
  scene.add(carriage);

  const cart = new THREE.Mesh(mergeGeos([
    new THREE.BoxGeometry(1.5, 0.06, 0.85).translate(0, 0.49, 0),
    new THREE.BoxGeometry(1.5, 0.16, 0.04).translate(0, 0.6, -0.4),
    new THREE.BoxGeometry(0.05, 0.5, 0.05).translate(-0.7, 0.75, -0.4),
    new THREE.BoxGeometry(0.05, 0.5, 0.05).translate(0.7, 0.75, -0.4),
    new THREE.BoxGeometry(1.45, 0.05, 0.05).translate(0, 1.0, -0.4),
    new THREE.BoxGeometry(0.14, 0.14, 0.08).translate(-0.62, 0.1, 0.3),
    new THREE.BoxGeometry(0.14, 0.14, 0.08).translate(0.62, 0.1, 0.3),
    new THREE.BoxGeometry(0.14, 0.14, 0.08).translate(-0.62, 0.1, -0.3),
    new THREE.BoxGeometry(0.14, 0.14, 0.08).translate(0.62, 0.1, -0.3),
    new THREE.BoxGeometry(0.1, 0.36, 0.1).translate(0, 0.29, 0),
  ]), lambert('navy'));
  scene.add(cart);

  const paddleGeo = own(new THREE.BoxGeometry(0.9, 0.24, 0.05).translate(FX * 0.45, 0, 0));
  const paddles = inst(paddleGeo, lambert('accent'), 5);

  const archFlash = new THREE.Mesh(own(new THREE.PlaneGeometry(1.1, 0.9).rotateY(Math.PI / 2)), basic('accent', { transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  archFlash.position.set(FX * XARCH, 1.2, 0);
  scene.add(archFlash);

  const barGeo = own(new THREE.BoxGeometry(0.03, 0.03, 0.8));
  const barA = new THREE.Mesh(barGeo, basic('accent'));
  const barB = new THREE.Mesh(own(new THREE.BoxGeometry(0.03, 0.03, 0.55)), basic('accent'));
  scene.add(barA, barB);
  const ledGeo = own(new THREE.BoxGeometry(0.1, 0.06, 0.04));
  const ledA = new THREE.Mesh(ledGeo, basic('ok'));
  const ledB = new THREE.Mesh(ledGeo, basic('ok'));
  ledA.position.set(FX * (SA.x + 0.35), 0.7, SA.z + 0.51);
  ledB.position.set(FX * SB.x, 1.6, C3Z + 0.51);
  scene.add(ledA, ledB);
  const qcScreen = new THREE.Mesh(own(new THREE.BoxGeometry(0.62, 0.36, 0.01)), basic('navy'));
  qcScreen.position.set(FX * 6.0, 1.15, 3.78);
  scene.add(qcScreen);
  const deskScreen = new THREE.Mesh(own(new THREE.BoxGeometry(0.62, 0.36, 0.01)), basic('accent'));
  deskScreen.position.set(FX * 13.4, 1.25, -0.42);
  scene.add(deskScreen);

  const lid = new THREE.Mesh(own(new THREE.BoxGeometry(1.0, 0.03, 0.8).translate(0, 0, 0.4)), lambert('navy'));
  lid.position.set(FX * -15.2, 0.37, -2.0);
  scene.add(lid);
  const printHead = new THREE.Mesh(own(new THREE.BoxGeometry(0.9, 0.1, 0.5)), lambert('accent'));
  scene.add(printHead);
  const flagGeo = mergeGeos([
    new THREE.BoxGeometry(0.03, 0.8, 0.03).translate(0, 0.4, 0),
    new THREE.BoxGeometry(0.34, 0.22, 0.03).translate(FX * 0.18, 0.66, 0),
  ]);
  const flag = new THREE.Mesh(flagGeo, basic('bad'));
  const foldFlag = new THREE.Mesh(flagGeo, basic('warn'));
  scene.add(flag, foldFlag);

  /* ---------- workers (hidden rigs copied into 6 instanced parts) ---------- */
  const WORKERS = [
    { x: -12.6, z: -2.8, ry: 0, tok: 'navy', skin: '#e0ac86', win: [[1.5, 8.5, 5], [9.0, 17.2, 3.5]], look: 0.25 },
    { x: -9.6, z: -3.9, ry: 0, tok: 'ok', skin: '#c68642', win: [[4.8, 8.2, 6]], look: 0.2 },
    { x: -5.4, z: -1.6, ry: 0, tok: 'graphite', skin: '#f1c27d', win: [[10.3, 21, 2]], look: 0.7 },
    { x: 6.0, z: 4.9, ry: Math.PI, tok: 'navy', skin: '#8d5524', win: [[33.8, 35.6, 4]], look: 0.2 },
    { x: 13.4, z: 0.7, ry: Math.PI, tok: 'accent', skin: '#e0ac86', win: [[46, 52.8, 9]], look: 0.2 },
    { x: PA.x, z: 3.7, ry: 0, tok: 'navy', skin: '#c68642', win: [[53.4, 62, 5]], look: 0.2 },
  ];
  type Rig = { root: THREE_NS.Object3D; torso: THREE_NS.Object3D; head: THREE_NS.Object3D; armL: THREE_NS.Object3D; armR: THREE_NS.Object3D; legL: THREE_NS.Object3D; legR: THREE_NS.Object3D };
  const rigs: Rig[] = WORKERS.map(() => {
    const root = new THREE.Object3D(); const torso = new THREE.Object3D(); const head = new THREE.Object3D();
    const armL = new THREE.Object3D(); const armR = new THREE.Object3D(); const legL = new THREE.Object3D(); const legR = new THREE.Object3D();
    torso.position.set(0, 0.8, 0); head.position.set(0, 0.64, 0);
    armL.position.set(-0.3 * FX, 0.5, 0); armR.position.set(0.3 * FX, 0.5, 0);
    legL.position.set(-0.1 * FX, 0.8, 0); legR.position.set(0.1 * FX, 0.8, 0);
    torso.add(head, armL, armR); root.add(torso, legL, legR);
    return { root, torso, head, armL, armR, legL, legR };
  });
  const wGeo = {
    torso: own(new THREE.BoxGeometry(0.46, 0.55, 0.26).translate(0, 0.27, 0)),
    head: own(new THREE.SphereGeometry(0.16, 8, 6).translate(0, 0.1, 0)),
    arm: own(new THREE.BoxGeometry(0.12, 0.5, 0.12).translate(0, -0.25, 0)),
    leg: own(new THREE.BoxGeometry(0.16, 0.8, 0.16).translate(0, -0.4, 0)),
  };
  const wMat = lambert('graphite', { color: 0xffffff });
  const wTorso = inst(wGeo.torso, wMat, WORKERS.length);
  const wHead = inst(wGeo.head, wMat, WORKERS.length);
  const wArmL = inst(wGeo.arm, wMat, WORKERS.length);
  const wArmR = inst(wGeo.arm, wMat, WORKERS.length);
  const wLegL = inst(wGeo.leg, wMat, WORKERS.length);
  const wLegR = inst(wGeo.leg, wMat, WORKERS.length);
  instColorFns.push(() => {
    WORKERS.forEach((w, i) => {
      tmpC.copy(tokColor(w.tok));
      wTorso.setColorAt(i, tmpC); wArmL.setColorAt(i, tmpC); wArmR.setColorAt(i, tmpC);
      wHead.setColorAt(i, tmpC.set(w.skin));
      wLegL.setColorAt(i, tmpC.copy(tokColor('graphite'))); wLegR.setColorAt(i, tmpC);
    });
    for (const m of [wTorso, wHead, wArmL, wArmR, wLegL, wLegR]) if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  const winEnv = (T: number, w: number[][]) => {
    let a = 0;
    for (const [t0, t1] of w) a = Math.max(a, smooth((T - t0) / 0.4) * (1 - smooth((T - (t1 - 0.4)) / 0.4)));
    return a;
  };

  /* ---------- blob shadows ---------- */
  const STATIC_BLOBS: [number, number, number][] = [
    [SA.x, SA.z, 1.3], [SB.x, C3Z, 1.1], [6.0, 3.9, 1.7], [13.4, -0.2, 2.1], [-12.6, -1.8, 2.2], [-9.6, -2.9, 1.7],
    [-15.2, -1.6, 1.8], [PAD.x, PAD.z, 1.5], [CAB.x, CAB.z, 1.9], [LB.x, LB.z - 0.4, 2.2], [0.9, 3.2, 0.9],
    ...[0, 1, 2, 3, 4].map((k) => [binX(k), BIN_Z, 1.05] as [number, number, number]),
  ];
  const NB = STATIC_BLOBS.length + WORKERS.length + 10;
  const blobs = inst(own(new THREE.CircleGeometry(0.5, 14).rotateX(-Math.PI / 2)), basic(null, { color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false }), NB);
  STATIC_BLOBS.forEach(([x, z, s], i) => setM(blobs, i, x, 0.012, z, 0, 0, 0, s, 1, s));

  /* ---------- itineraries (built once) ---------- */
  const trayIdx = (i: number) => TRAY_ORDER.indexOf(i);
  const traySlot = (i: number) => { const n = trayIdx(i); return pz(0.9 + ((n % 3) - 1) * 0.03, 0.57 + 0.013 * n, 3.2 + (n % 2 ? 0.02 : -0.02), ((n % 4) - 1.5) * 0.05); };
  const binSlot = (i: number) => pz(binX(i % 5) + ((i % 3) - 1) * 0.03, 0.17 + (i >= 5 ? 0.016 : 0), BIN_Z + (i % 2 ? 0.03 : -0.03), ((i % 4) - 1.5) * 0.08);
  const tableSlot = (i: number) => pz(-12.7 + ((i % 3) - 1) * 0.04, 0.91 + 0.012 * i, -1.8 + (i % 2 ? 0.03 : -0.03), ((i % 4) - 1.5) * 0.05);
  const folderSlot = (i: number) => pz(-15.2, 0.4 + 0.012 * (9 - i), -1.6, ((i % 3) - 1) * 0.03);
  const platSlot = (k: number, c: number, s = 0.85) => pz(scrX(k), SCR.y + 0.22 - c * 0.6, SCR.z + 0.085, 0, Math.PI / 2, s); // tile slot on the screen face
  const paSlot = (i: number) => pz(paX(i % 5) + (i >= 5 ? 0.03 : -0.03), 0.57 + 0.02 * (i >= 5 ? 1 : 0), PA.z - 0.12 + (i >= 5 ? 0.02 : -0.02), (i >= 5 ? 0.06 : -0.05));
  const lbPoint = (u: number, v: number, n: number) => ({
    x: LB.x + u,
    y: LB.y + v * Math.sin(PHI) + n * Math.cos(PHI),
    z: LB.z - v * Math.cos(PHI) + n * Math.sin(PHI),
  });

  const sheetTracks: Track[] = [];
  for (let i = 0; i < 10; i++) {
    const k = i % 5; const c = i >= 5 ? 1 : 0; const tk = tkT(k); const bx = binX(k);
    const t = new Track(i === FOLDED ? tableSlot(i) : folderSlot(i));
    if (i !== FOLDED) { const ta = 1.7 + 0.38 * i; t.hold(ta - 0.5).to(ta, tableSlot(i), { arc: 0.45 }); }
    const tb = tbT(i);
    t.hold(placeT(i) - 0.45)
      .to(placeT(i), pz(XSTART, BY + 0.012, 0), { arc: 0.5 })
      .to(archT(i), pz(XARCH, BY + 0.012, 0), { e: 'lin' })
      .to(tb, pz(bx, BY + 0.012, 0), { e: 'lin' })
      .to(tb + 0.5, binSlot(i), { arc: 0.3, e: 'out' })
      .hold(tk).to(tk + 0.3, pz(bx, 1.45 + 0.015 * c, BIN_Z))
      .to(tk + 1.2, pz(SA.x, 1.45 + 0.015 * c, SA.z))
      .to(tk + 1.45, pz(SA.x, 0.935 + 0.015 * c, SA.z))
      .hold(tk + 1.9);
    if (i === BAD) {
      t.to(tk + 2.4, pz(2.4, 0.62, 2.7), { arc: 0.4 }).hold(30.0)
        .to(31.0, pz(1.4, BY + 0.012, C3Z), { arc: 0.8 })
        .to(32.6, pz(SB.x, BY + 0.012, C3Z), { e: 'lin' }).hold(33.6)
        .to(34.4, pz(4.4, BY + 0.012, C3Z), { e: 'lin' }).hold(FLAG_OFF)
        .to(35.7, pz(4.7, BY + 0.012, LANE_Z), { arc: 0.3 })
        .to(36.9, pz(1.4, BY + 0.012, LANE_Z), { e: 'lin' })
        .to(37.5, traySlot(i), { arc: 0.7 });
    } else {
      t.to(tk + 2.4, traySlot(i), { arc: 0.5 });
    }
    // after the scan the originals are filed: onto the cart, to the rack, into the category box
    const ox = (k - 2) * 0.2; const oz = c ? 0.05 : -0.05;
    const ls = CART_LOAD + 0.05 * i;
    t.hold(ls).to(ls + 0.5, pz(CART0.x + ox, CART_TOP + 0.014 * c + 0.003 * k, CART0.z + oz), { arc: 0.6 });
    for (const w of CART_WAY) t.to(w.t, { x: w.x + ox, z: w.z + oz });
    t.hold(HOP(k)).to(HOP(k) + 0.5, paSlot(i), { arc: 0.7 });
    sheetTracks.push(t);
  }
  const cartTrack = new Track(pz(CART0.x, 0, CART0.z));
  cartTrack.hold(CART_WAY[0].t);
  for (const w of CART_WAY) cartTrack.to(w.t, { x: w.x, z: w.z });

  // folded contract halves: hinge point itinerary + fold angle
  const MAN = pz(-9.6, 0.93, -2.9);
  const halvesTrack = new Track(folderSlot(FOLDED));
  { const ta = 1.7 + 0.38 * FOLDED; halvesTrack.hold(ta - 0.5).to(ta, tableSlot(FOLDED), { arc: 0.45 }).hold(4.8).to(5.6, MAN, { arc: 0.5 }).hold(7.4).to(8.9, tableSlot(FOLDED), { arc: 0.5 }); }
  const foldAngle = (T: number) => 1.2 * (1 - smooth((T - 5.8) / 1.6)); // 1.2 rad tent -> flat

  const carriageTrack = new Track(pz(binX(0), 2.0, BIN_Z));
  for (let k = 0; k < 5; k++) {
    const tk = tkT(k);
    carriageTrack.hold(tk).to(tk + 0.3, {}).to(tk + 1.2, pz(SA.x, 2.0, BIN_Z)).hold(tk + 1.45);
    if (k < 4) carriageTrack.to(tkT(k + 1), pz(binX(k + 1), 2.0, BIN_Z));
  }
  carriageTrack.to(31.0, pz(binX(0), 2.0, BIN_Z));

  // stage 7: the digital tile lifts off the scanning screen and arcs across to the ECM+ Documents monitor (no stamping)
  function s7(t: Track, k: number, dy: number) {
    const ps = PS(k);
    t.hold(ps).to(ps + 1.05, pz(DMS.x - 0.9 + 0.45 * k, DMS.y - 0.1 + dy, DMS.z + 0.09, 0, Math.PI / 2, 0.5), { arc: 1.3 })
      .to(ps + 1.3, { s: 0 });
  }
  const cardTracks: Track[] = [];
  for (let i = 0; i < 10; i++) {
    const k = i % 5; const c = i >= 5 ? 1 : 0; const tk = tkT(k);
    const t = new Track(pz(SA.x, 1.0, SA.z, 0, 0, 0));
    t.hold(tk + 1.85).to(tk + 1.92, pz(SA.x, 1.05, SA.z, 0, 0, 1)).to(tk + 2.5, platSlot(k, c), { arc: 0.7 });
    if (c === 0) {
      const lbp = lbPoint(0, 0, 0.1);
      const onLb = pz(lbp.x, lbp.y, lbp.z, 0, PHI, CARD_SCALE);
      const next5 = k < 4 ? WS5[k + 1] : 45.65 + 0.35;
      t.hold(WS5[k]).to(WS5[k] + 0.55, onLb, { arc: 0.8 })
        .hold(next5 - 0.35).to(next5 + 0.05, platSlot(k, 0), { arc: 0.6 });
      const w6 = WS6(k);
      t.hold(w6 - 0.2).to(w6 + 0.4, onLb, { arc: 0.8 })
        .hold(w6 + 1.05).to(w6 + 1.45, platSlot(k, 0), { arc: 0.6 });
    }
    s7(t, k, 0.03 * c);
    cardTracks.push(t);
  }
  const labelTracks: Track[] = [];
  // the label printer prints the code label, then it is stamped onto the ORIGINAL paper (top sheet of the category) and rides with it into the box
  for (let k = 0; k < 5; k++) {
    const ps = PS(k); const paper = sheetTracks[k + 5]; const pp = pz(0, 0, 0);
    const t = new Track(pz(PAD.x, 0.9, PAD.z, 0, 0, 0));
    t.hold(ps - 0.3).to(ps - 0.2, { s: 1 }).hold(ps + 0.3);
    const a = paper.at(ps + 0.85, pp);
    t.to(ps + 0.85, pz(a.x, a.y + 0.02, a.z, 0, 0, 1), { arc: 0.9 });
    for (let u = ps + 0.95; u <= HOP(k) + 0.5; u += 0.1) { const q = paper.at(u, pp); t.to(u, pz(q.x, q.y + 0.02, q.z, 0, 0, 1)); }
    t.to(HOP(k) + 0.65, { s: 0 });
    labelTracks.push(t);
  }

  /* ---------- per-frame scratch ---------- */
  const pose: Pose = pz(0, 0, 0);
  const sheetPoses: Pose[] = Array.from({ length: 10 }, () => pz(0, 0, 0));
  const hinge = new THREE.Vector3();

  const rowY = (r: number) => FORM.y + 0.6 - r * 0.33;
  const rowTarget = [1, 2, 3, 4, 5, 6]; // overlay -> form row

  const ovLit = (T: number, j: number): number => {
    for (let k = 0; k < 5; k++) {
      const ws = WS5[k];
      const we = k < 4 ? WS5[k + 1] : 46;
      if (T >= ws && T < we) return k === 0 ? clamp01((T - (ws + 0.7 + 0.35 * j)) / 0.2) : clamp01((T - (ws + 0.6 + 0.08 * j)) / 0.1);
    }
    for (let k = 0; k < 5; k++) { const ws = WS6(k); if (T >= ws && T < ws + 1.4) return clamp01((T - ws - 0.05 * j) / 0.2); }
    return 0;
  };

  function update(Tin: number) {
    const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
    lastT = T;

    // belts
    belts.forEach((b) => { b.tex.offset.x = -FX * b.sign * ((T * V) / 0.4); });

    // sheets
    let bi = STATIC_BLOBS.length + WORKERS.length;
    for (let i = 0; i < 10; i++) {
      const p = sheetTracks[i].at(T, sheetPoses[i]);
      const vis = i === FOLDED ? T >= FOLD_SWAP : true;
      const s = vis ? 1 : 0;
      setM(paperMesh[i % 5], i >= 5 ? 1 : 0, p.x, p.y, p.z, 0, p.ry, 0, s * SHEET_K, s * SHEET_K, s * SHEET_K);
      setM(blobs, bi++, p.x, 0.014, p.z, 0, 0, 0, 0, 1, 0);
    }
    paperMesh.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
    // halves
    {
      const p = halvesTrack.at(T, pose);
      const vis = T < FOLD_SWAP;
      const a = vis ? foldAngle(T) : 0;
      halfL.visible = vis; halfR.visible = vis;
      hinge.set(FX * p.x, p.y + (SW / 2) * SHEET_K * Math.sin(a) + 0.002, p.z);
      halfL.position.copy(hinge); halfR.position.copy(hinge);
      halfL.scale.setScalar(SHEET_K); halfR.scale.setScalar(SHEET_K);
      halfL.rotation.set(0, FX * p.ry, a); halfR.rotation.set(0, FX * p.ry, -a);
    }
    // blobs for workers handled below; staples
    for (let j = 0; j < 4; j++) {
      const st = STAPLE[j];
      const sp = sheetTracks[st.sheet];
      if (T < st.tr) {
        const p = sp.at(T, pose);
        setM(staples, j, p.x + st.ox, p.y + 0.012, p.z + st.oz, 0, 0, 0, 1, 1, 1);
      } else {
        const p0 = sp.at(st.tr, pose);
        const sx = p0.x + st.ox; const sy = p0.y + 0.012; const sz = p0.z + st.oz;
        const u = clamp01((T - st.tr) / 0.5); const e = smooth(u);
        const tx = -11.95 + (j - 1.5) * 0.07; const ty = 0.96; const tz = -1.6 + (j % 2 ? 0.05 : -0.05);
        setM(staples, j, sx + (tx - sx) * e, sy + (ty - sy) * e + 0.5 * Math.sin(Math.PI * u), sz + (tz - sz) * e, 0, 0, 0, 1, 1, 1);
      }
    }
    staples.instanceMatrix.needsUpdate = true;

    // digital cards
    for (let i = 0; i < 10; i++) {
      const p = cardTracks[i].at(T, pose);
      const s = p.s;
      setM(cards, i, p.x, p.y, p.z, p.rx, p.ry, 0, s, s, s);
      // the category tint fades out as the card is enlarged on the lightbox, so the page stays legible
      tmpC.copy(WHITE).lerp(catCols[i % 5], 0.55 * (1 - smooth((s - 1) / 1.2)));
      cards.setColorAt(i, tmpC);
    }
    cards.instanceMatrix.needsUpdate = true;
    if (cards.instanceColor) cards.instanceColor.needsUpdate = true;
    for (let k = 0; k < 5; k++) {
      const p = labelTracks[k].at(T, pose);
      const qr = codeMode === 'qr';
      setM(labels, k, p.x, p.y, p.z, 0, 0, 0, p.s * (qr ? 0.5 : 1), p.s, p.s * (qr ? 1.334 : 1));
      // the same label on the front of the category box once its paper is filed
      const lu = smooth((T - (HOP(k) + 0.4)) / 0.3);
      setM(boxLabels, k, paX(k), 0.63, PA.z + 0.42, 0, 0, 0, lu * (qr ? 0.22 : 0.52), lu * (qr ? 0.22 : 0.195), lu);
    }
    labels.instanceMatrix.needsUpdate = true;
    boxLabels.instanceMatrix.needsUpdate = true;
    { const p = cartTrack.at(T, pose); cart.position.set(FX * p.x, 0, p.z); }
    refreshScreen([0, 1, 2, 3, 4].map((k) => (T >= PS(k) + 0.3 ? 2 : T >= tkT(k) + 2.5 ? 1 : 0)));

    // lid
    lid.rotation.x = -1.9 * smooth((T - 0.2) / 1.0);

    // carriage
    { const p = carriageTrack.at(T, pose); carriage.position.set(FX * p.x, p.y, p.z); }

    // paddles
    for (let k = 0; k < 5; k++) {
      let ang = 0;
      for (const i of [k, k + 5]) {
        const tb = tbT(i);
        const a = smooth((T - (tb - 0.2)) / 0.15) * (1 - smooth((T - (tb + 0.12)) / 0.38));
        ang = Math.max(ang, a);
      }
      setM(paddles, k, binX(k) - 0.45, BY + 0.13, -0.5, 0, -1.15 * ang, 0, 1, 1, 1);
    }
    paddles.instanceMatrix.needsUpdate = true;

    // arch flash
    {
      let op = 0; let cat = 0;
      for (let i = 0; i < 10; i++) {
        const u = (T - (archT(i) - 0.1)) / 0.6;
        if (u > 0 && u < 1) { op = 0.75 * (1 - u) * Math.min(1, u * 8); cat = i % 5; }
      }
      const m = archFlash.material as THREE_NS.MeshBasicMaterial;
      m.opacity = op; m.color.copy(catCols[cat]);
      archFlash.visible = op > 0.001;
    }

    // scanner bars and LEDs
    {
      let sweep = -1; let swSign = 0;
      for (let k = 0; k < 5; k++) { const u = (T - (tkT(k) + 1.45)) / 0.45; if (u >= 0 && u <= 1) sweep = u; }
      barA.visible = sweep >= 0;
      if (sweep >= 0) barA.position.set(FX * (SA.x - 0.4 + 0.8 * sweep), 0.97, SA.z);
      const ub = (T - 33.0) / 0.45;
      barB.visible = ub >= 0 && ub <= 1;
      if (barB.visible) barB.position.set(FX * (SB.x - 0.25 + 0.5 * ub), 1.0, C3Z);
      swSign = sweep >= 0 ? 1 : 0;
      const ma = ledA.material as THREE_NS.MeshBasicMaterial;
      ma.color.copy(tokColor(T >= FLAG_ON && T < FLAG_ON + 1.6 ? 'warn' : swSign ? 'accent' : 'ok'));
      const mb = ledB.material as THREE_NS.MeshBasicMaterial;
      mb.color.copy(tokColor(T >= 32.6 && T < 33.45 ? 'warn' : 'ok'));
      const mq = qcScreen.material as THREE_NS.MeshBasicMaterial;
      mq.color.copy(tokColor(T >= FLAG_OFF ? 'ok' : T >= 33.6 ? 'warn' : 'navy'));
    }

    // flag over the bad scan
    {
      const p = sheetTracks[BAD].at(T, pose);
      const on = T >= FLAG_ON && T < 37.5;
      flag.visible = on;
      flagAnchor.pos.set(FX * p.x, p.y + 0.9, p.z);
      const pop = T >= FLAG_OFF ? 1 + 0.4 * Math.sin(Math.PI * clamp01((T - FLAG_OFF) / 0.5)) : smooth((T - FLAG_ON) / 0.25);
      flag.position.set(FX * p.x, p.y + 0.03, p.z);
      flag.scale.setScalar(on ? pop * 1.15 : 0.001);
      (flag.material as THREE_NS.MeshBasicMaterial).color.copy(tokColor(T >= FLAG_OFF ? 'ok' : 'bad'));
      // amber flag over the folded contract until the manual table has flattened it
      const hp = halvesTrack.at(T, pose);
      const fon = T >= 3.4 && T < FOLD_SWAP;
      foldFlag.visible = fon;
      foldFlag.position.set(FX * hp.x, hp.y + 0.03, hp.z);
      foldFlag.scale.setScalar(1.6 * smooth((T - 3.4) / 0.3) * (1 - smooth((T - 8.5) / 0.4)) + 0.001);
    }

    // lightbox / rail glow
    {
      const live = T >= 38 && T < 53;
      (lbGlow.material as THREE_NS.MeshBasicMaterial).opacity = live ? 0.16 + 0.05 * Math.sin(T * 4) : 0.1;
      (railGlow.material as THREE_NS.MeshBasicMaterial).opacity = T >= 38 && T < 46 ? 0.55 + 0.25 * Math.sin(T * 6) : 0.25;
    }

    // overlays
    for (let j = 0; j < 7; j++) {
      const o = OV[j]; const lit = ovLit(T, j);
      const q = lbPoint(o.u * 0.912, o.v * 1.248, 0.16);
      setM(overlays, j, q.x, q.y, q.z, PHI, 0, 0, o.w * 0.912 * lit, 1, o.h * 1.248 * lit);
    }
    overlays.instanceMatrix.needsUpdate = true;

    // metadata: link lines and rows, approve mark
    {
      let k = -1;
      for (let q = 0; q < 5; q++) if (T >= WS6(q) && T < WS6(q) + 1.4) k = q;
      if (T >= 53) k = -2; else if (k < 0 && T >= 46) k = 4;
      const u = k >= 0 ? T - WS6(k) : k === -2 ? 9 : 0;
      for (let r = 0; r < 6; r++) {
        const delay = 0.3 + 0.07 * r;
        const lp = k >= 0 ? clamp01((u - delay) / 0.3) : 0;
        const fill = k === -2 ? 1 : k >= 0 ? clamp01((u - delay - 0.3) / 0.15) : 0;
        setM(rowFill, r, FORM.x - 0.85, rowY(r), FORM.z + 0.07, 0, 0, 0, Math.max(0.0001, fill), 1, 1);
        const o = OV[rowTarget[r]];
        const a = lbPoint(o.u * 0.912, o.v * 1.248, 0.17);
        const bx = FORM.x - 0.95; const by = rowY(r); const bz = FORM.z + 0.07;
        for (let d = 0; d < DASH; d++) {
          const on = lp > 0 && d / DASH < lp * 0.999;
          const f0 = d / DASH; const f1 = (d + 0.55) / DASH;
          const o6 = (r * DASH + d) * 6;
          if (on) {
            linkPos[o6] = FX * (a.x + (bx - a.x) * f0); linkPos[o6 + 1] = a.y + (by - a.y) * f0; linkPos[o6 + 2] = a.z + (bz - a.z) * f0;
            linkPos[o6 + 3] = FX * (a.x + (bx - a.x) * f1); linkPos[o6 + 4] = a.y + (by - a.y) * f1; linkPos[o6 + 5] = a.z + (bz - a.z) * f1;
          } else linkPos.fill(0, o6, o6 + 6);
        }
      }
      linkGeo.attributes.position.needsUpdate = true;
      rowFill.instanceMatrix.needsUpdate = true;
      const ap = k >= 0 ? smooth((u - 1.15) / 0.15) : k === -2 ? 0 : 0;
      approve.scale.setScalar(Math.max(0.0001, ap));
      approve.visible = ap > 0.001;
    }

    // printer head
    {
      let d = 0;
      for (let k = 0; k < 5; k++) { const ps = PS(k); const u = (T - (ps - 0.3)) / 0.5; if (u >= 0 && u <= 1) d = Math.max(d, 1 - Math.abs(u * 2 - 1)); }
      printHead.position.set(FX * PAD.x, 1.55 - 0.45 * d, PAD.z - 0.1);
      refreshDms([0, 1, 2, 3, 4].map((k) => (T >= PS(k) + 1.1 ? 2 : 0)));
    }

    // workers
    let wb = STATIC_BLOBS.length;
    WORKERS.forEach((w, i) => {
      const r = rigs[i];
      const act = winEnv(T, w.win);
      const f = w.win.length ? w.win[0][2] : 4;
      r.root.position.set(FX * w.x, 0, w.z);
      r.root.rotation.y = FX * w.ry;
      r.torso.rotation.x = 0.15 * act;
      r.head.rotation.y = FX * w.look * Math.sin(T * 0.7 + i) * (0.6 + 0.4 * act);
      r.armL.rotation.x = -0.15 - 0.6 * act + 0.3 * act * Math.sin(T * f);
      r.armR.rotation.x = -0.15 - 0.6 * act + 0.3 * act * Math.sin(T * f + 1.7);
      r.armL.rotation.z = FX * 0.05; r.armR.rotation.z = -FX * 0.05;
      r.root.updateMatrixWorld(true);
      wTorso.setMatrixAt(i, r.torso.matrixWorld);
      wHead.setMatrixAt(i, r.head.matrixWorld);
      wArmL.setMatrixAt(i, r.armL.matrixWorld);
      wArmR.setMatrixAt(i, r.armR.matrixWorld);
      wLegL.setMatrixAt(i, r.legL.matrixWorld);
      wLegR.setMatrixAt(i, r.legR.matrixWorld);
      setM(blobs, wb++, w.x, 0.013, w.z, 0, 0, 0, 0.9, 1, 0.9);
    });
    for (const m of [wTorso, wHead, wArmL, wArmR, wLegL, wLegR]) m.instanceMatrix.needsUpdate = true;
    blobs.instanceMatrix.needsUpdate = true;
  }

  /* ---------- colors ---------- */
  function applyColors() {
    for (const r of regMats) r.m.color.copy(tokColor(r.tok));
    for (let k = 0; k < 5; k++) catCols[k].copy(tokColor('cat' + k));
    scene.background = tokColor('bg');
    for (const fn of instColorFns) fn();
  }
  // overlays/rows use an instanced material tinted by its own colour; keep instance colour white-neutral
  for (let j = 0; j < 7; j++) overlays.setColorAt(j, WHITE);
  for (let r = 0; r < 6; r++) rowFill.setColorAt(r, WHITE);
  const overlayFix = () => { for (let j = 0; j < 7; j++) overlays.setColorAt(j, WHITE); if (overlays.instanceColor) overlays.instanceColor.needsUpdate = true; };
  applyColors();
  overlayFix();

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-6 * FX, 12, 8);
  scene.add(sun);

  /* ---------- stages, anchors ---------- */
  const bx3 = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
    new THREE.Box3(new THREE.Vector3(Math.min(FX * x0, FX * x1), y0, z0), new THREE.Vector3(Math.max(FX * x0, FX * x1), y1, z1));
  const STAGE_BOXES: [number, number, THREE_NS.Box3][] = [
    [0, 10, bx3(-16.2, -8.4, 0, 2.2, -4.8, 0.8)],
    [10, 20, bx3(-8.6, -0.2, 0, 2.4, -2.0, 2.4)],
    [20, 31.3, bx3(-1.3, 8.2, 0, 3.1, 0.2, 4.0)],
    [31.3, 38, bx3(0.6, 7.2, 0, 2.2, 2.2, 6.2)],
    [38, 46, bx3(5.4, 12.2, 0, 3.1, -2.4, 1.4)],
    [46, 53, bx3(6.6, 15.8, 0, 4.0, -3.2, 1.6)],
    [53, 62, bx3(11.0, 18.0, 0, 3.8, -2.2, 6.4)],
  ];
  const stages = STAGE_BOXES.map(([t0, t1, aabb]) => ({ t0, t1, aabb }));
  const overviewAabb = bx3(-18, 18, 0, 3.8, -6, 6);

  const anchorList: { id: string; pos: THREE_NS.Vector3 }[] = [];
  const addA = (id: string, x: number, y: number, z: number) => anchorList.push({ id, pos: new THREE.Vector3(FX * x, y, z) });
  addA('manual', -9.6, 1.6, -2.9);
  addA('rescan', SB.x, 1.9, C3Z);
  addA('digital', SCR.x, SCR.y + 1.25, SCR.z);
  addA('originals', 0.9, 1.0, 3.2);
  addA('archive', DMS.x, DMS.y + 1.25, DMS.z);
  addA('paperArchive', PA.x, 1.55, PA.z);
  for (let k = 0; k < 5; k++) addA('cat' + k, binX(k), 0.9, BIN_Z);
  // overlay-zone labels fan out to the left/right of the card so they never cover it
  const FAN: Record<string, [number, number]> = {
    'ov-header': [-0.95, 0.51], 'ov-title': [0.95, 0.36], 'ov-refs': [-0.95, 0.14], 'ov-dates': [0.95, 0.12],
    'ov-body': [-0.95, -0.12], 'ov-table': [0.95, -0.3], 'ov-footer': [-0.95, -0.52],
  };
  for (const o of OV) { const [fu, fv] = FAN[o.id]; const q = lbPoint(fu, fv, 0.2); addA(o.id.replace('ov-', ''), q.x, q.y, q.z); }
  const flagAnchor = { id: 'flagged', pos: new THREE.Vector3(FX * SA.x, 1.4, SA.z) };
  anchorList.push(flagAnchor);
  STAGE_BOXES.forEach(([, , b], i) => {
    const c = b.getCenter(new THREE.Vector3());
    anchorList.push({ id: 'stage' + (i + 1), pos: new THREE.Vector3(c.x, b.max.y + 0.2, c.z) });
  });

  /* ---------- API ---------- */
  for (const m of [...paperMesh, cards, labels, paBoxes]) m.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  applyHover();
  update(0);

  return {
    scene, stages, overviewAabb, duration: DUR,
    update,
    setColors(c: FactoryColors) { colors = { ...DEFAULTS, ...colors, ...c }; applyColors(); overlayFix(); },
    pick(raycaster: THREE_NS.Raycaster) {
      bins.updateMatrixWorld();
      const hits = raycaster.intersectObject(bins, false);
      const id = hits.length ? hits[0].instanceId : undefined;
      return id === undefined ? -1 : id;
    },
    hover(cat: number) { hovered = cat >= 0 && cat < 5 ? cat : -1; applyHover(); },
    anchors() { return anchorList.map((a) => ({ id: a.id, pos: a.pos.clone() })); },
    counter(Tin: number) {
      let n = 0;
      for (let k = 0; k < 5; k++) if (Tin >= PS(k) + 1.1) n += 2;
      let p = 0;
      for (let k = 0; k < 5; k++) if (Tin >= HOP(k) + 0.5) p += 2;
      return { archived: n, total: 10, flagged: Tin >= FLAG_ON && Tin < FLAG_OFF, paper: p };
    },
    setCodeMode(mode: 'barcode' | 'qr') {
      codeMode = mode === 'qr' ? 'qr' : 'barcode';
      const m = codeMode === 'qr' ? qrTex : barcodeTex;
      labelMat.map = m; boxLabelMat.map = m;
      labelMat.needsUpdate = true; boxLabelMat.needsUpdate = true;
      update(lastT);
    },
    pickDoc(raycaster: THREE_NS.Raycaster, Tin: number) {
      const T = Math.min(DUR, Math.max(0, Number.isFinite(Tin) ? Tin : 0));
      scene.updateMatrixWorld();
      let best: { d: number; cat: number; kind: string; sheet?: number } | null = null;
      const consider = (obj: THREE_NS.Object3D, kind: string, catOf: (id: number | undefined) => number, sheetOf?: (id: number | undefined) => number) => {
        const hs = raycaster.intersectObject(obj, false);
        if (hs.length && (!best || hs[0].distance < best.d)) best = { d: hs[0].distance, cat: catOf(hs[0].instanceId), kind, sheet: sheetOf ? sheetOf(hs[0].instanceId) : undefined };
      };
      const curCat = () => {
        let k = 0;
        if (T >= 46) { for (let q = 0; q < 5; q++) if (T >= WS6(q)) k = q; }
        else if (T >= 38) { for (let q = 0; q < 5; q++) if (T >= WS5[q]) k = q; }
        else { for (let q = 0; q < 5; q++) if (T >= tkT(q) + 2.5) k = q; }
        return k;
      };
      const id = (i: number | undefined) => (i ?? 0) % 5;
      consider(bins, 'bin', id);
      paperMesh.forEach((m, c) => consider(m, 'paper', () => c, (i) => (i ?? 0) * 5 + c));
      consider(cards, 'card', id, (i) => i ?? 0);
      consider(labels, 'label', id);
      consider(paBoxes, 'box', id);
      consider(halfL, 'paper', () => 1, () => FOLDED);
      consider(halfR, 'paper', () => 1, () => FOLDED);
      consider(dmsMesh, 'dms', () => { let k = 0; for (let q = 0; q < 5; q++) if (T >= PS(q) + 1.1) k = q; return k; });
      consider(screenMesh, 'screen', curCat);
      consider(formHit, 'form', curCat);
      const b = best as { cat: number; kind: string; sheet?: number } | null;
      return b ? { cat: b.cat, kind: b.kind, sheet: b.sheet } : null;
    },
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
