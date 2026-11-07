// Headless check for lib/factory/scene.ts. Run: node lib/factory/scene.test.mjs
// Transpiles scene.ts with the local TypeScript, runs it against three with a fake 2D canvas.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const require = createRequire(join(root, 'package.json'));
const ts = require('typescript');
const THREE = await import(pathToFileURL(require.resolve('three')).href);

const out = ts.transpileModule(readFileSync(join(here, 'scene.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const file = join(mkdtempSync(join(tmpdir(), 'factory-')), 'scene.mjs');
writeFileSync(file, out);
const { createFactoryScene } = await import(pathToFileURL(file).href);

const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
const makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx });
const colors = { floor: '#e8e4da', belt: '#6b6f78', machine: '#c9ced6', accent: '#c8962e', navy: '#1d2a44', graphite: '#3a3f4a', ok: '#2f9e63', warn: '#e0a021', bad: '#d1453b', cat0: '#3b82c4', cat1: '#8e5bc4', cat2: '#e07a2f', cat3: '#2fa39a', cat4: '#c4467a', bg: '#f5f3ee' };

let failed = 0;
const check = (c, m) => { if (!c) { failed++; console.error('FAIL', m); } };

for (const rtl of [false, true]) {
  const f = createFactoryScene(THREE, { rtl, colors, coarse: false, makeCanvas });
  check(f.duration === 64, 'duration');
  // never throws, no NaN in any instance matrix / mesh position
  const snapshot = () => {
    const a = [];
    f.scene.traverse((o) => {
      if (o.isInstancedMesh) a.push(...o.instanceMatrix.array);
      else if (o.isMesh) a.push(...o.position.toArray(), o.rotation.x, o.rotation.y, o.rotation.z, o.scale.x, o.visible ? 1 : 0);
    });
    return a;
  };
  for (let T = 0; T <= 64.0001; T += 0.1) {
    f.update(T);
    if (snapshot().some((v) => !Number.isFinite(v))) { check(false, `non-finite at T=${T.toFixed(1)} rtl=${rtl}`); break; }
  }
  // determinism / purity
  f.update(20.3); const a1 = snapshot();
  f.update(47.7); f.update(5.1); f.update(20.3); const a2 = snapshot();
  check(a1.length === a2.length && a1.every((v, i) => v === a2[i]), `determinism rtl=${rtl}`);
  f.update(-5); f.update(1e9); f.update(NaN);
  // counts
  let draws = 0, tris = 0, texBytes = 0;
  const seen = new Set();
  f.scene.traverse((o) => {
    if (o.isMesh || o.isLineSegments) {
      draws++;
      const g = o.geometry;
      const per = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      tris += per * (o.isInstancedMesh ? o.count : 1);
      const m = o.material;
      if (m.map && !seen.has(m.map)) { seen.add(m.map); texBytes += m.map.image.width * m.map.image.height * 4; }
    }
  });
  console.log(`rtl=${rtl} drawCalls=${draws} tris=${Math.round(tris)} texMB=${(texBytes / 1048576).toFixed(2)}`);
  check(draws <= 110, 'draw calls');
  check(tris <= 50000, 'triangles');
  // API
  const ids = f.anchors().map((x) => x.id);
  for (const id of ['manual', 'rescan', 'digital', 'originals', 'archive', 'cat0', 'cat4', 'header', 'footer', 'stage1', 'stage7']) check(ids.includes(id), 'anchor ' + id);
  check(f.stages.length === 7, 'stages');
  // stage windows tile the timeline: contiguous, ordered, and stage 3 (scanning, last card shelved at 31.3) ends before stage 4 starts
  check(f.stages[0].t0 === 0 && f.stages.every((s, i) => s.t1 > s.t0 && (i === 0 || s.t0 === f.stages[i - 1].t1)), 'stage windows contiguous');
  check(Math.abs(f.stages[2].t1 - 31.3) < 1e-9 && f.stages[3].t0 === f.stages[2].t1, 'stage 3/4 boundary');
  check(f.stages[6].t1 <= f.duration, 'last stage within duration');
  check(f.counter(63).archived === 10 && f.counter(0).archived === 0 && f.counter(30).flagged && !f.counter(40).flagged, 'counter');
  // pick: ray straight down onto bin 2
  const bin2 = f.anchors().find((x) => x.id === 'cat2').pos;
  const rc = new THREE.Raycaster(new THREE.Vector3(bin2.x, 5, bin2.z), new THREE.Vector3(0, -1, 0));
  check(f.pick(rc) === 2, 'pick bin2 got ' + f.pick(rc));
  const miss = new THREE.Raycaster(new THREE.Vector3(0, 5, -5), new THREE.Vector3(0, -1, 0));
  check(f.pick(miss) === -1, 'pick miss');
  f.hover(2); f.hover(-1); f.setColors({ ...colors, accent: '#ff0000', bg: '#101820' }); f.update(40);
  f.dispose();
}
if (failed) { console.error(failed + ' check(s) failed'); process.exit(1); }
console.log('scene.test OK');
