// Headless check for lib/knowledge/scene.ts. Run: node lib/knowledge/scene.test.mjs
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
const file = join(mkdtempSync(join(tmpdir(), 'knowledge-')), 'scene.mjs');
writeFileSync(file, out);
const { createKnowledgeScene, DUR } = await import(pathToFileURL(file).href);

const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
const makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx });
let failed = 0;
const check = (c, m) => { if (!c) { failed++; console.error('FAIL', m); } };

for (const rtl of [false, true]) {
  for (const coarse of [false, true]) {
    const k = createKnowledgeScene(THREE, { rtl, colors: {}, coarse, makeCanvas });
    check(k.duration === DUR && DUR === 60, 'duration');
    const snap = () => {
      const a = [];
      k.scene.traverse((o) => {
        if (o.isInstancedMesh) a.push(...o.instanceMatrix.array);
        else if (o.isMesh) a.push(...o.position.toArray(), o.scale.x, o.visible ? 1 : 0);
        else if (o.isLineSegments && o.geometry.attributes.position) a.push(...o.geometry.attributes.position.array.slice(0, 12));
      });
      return a;
    };
    for (let T = 0; T <= 60.0001; T += 0.1) {
      k.update(T);
      if (snap().some((v) => !Number.isFinite(v))) { check(false, `non-finite at T=${T.toFixed(1)}`); break; }
    }
    k.update(25.3); const a1 = snap();
    k.update(47.7); k.update(5.1); k.update(25.3); const a2 = snap();
    check(a1.length === a2.length && a1.every((v, i) => v === a2[i]), `determinism rtl=${rtl}`);
    k.update(-5); k.update(1e9); k.update(NaN);
    let draws = 0, tris = 0;
    k.scene.traverse((o) => {
      if (o.isMesh || o.isLineSegments || o.isPoints) {
        draws++;
        const g = o.geometry;
        const per = g.index ? g.index.count / 3 : g.attributes.position.count / 3;
        tris += per * (o.isInstancedMesh ? o.count : 1);
      }
    });
    console.log(`rtl=${rtl} coarse=${coarse} drawCalls=${draws} tris=${Math.round(tris)}`);
    check(draws < 90, 'draw calls < 90');
    check(k.stages.length === 6 && k.stages[0].t0 === 0 && k.stages[5].t1 === 60 && k.stages.every((s, i) => i === 0 || s.t0 === k.stages[i - 1].t1), 'stage windows');
    const ids = k.anchors(40).map((x) => x.id);
    for (const id of ['docs', 'gate', 'kb', 'engine', 'sources', 'abc', 'contract', 'pay', 'supplier']) check(ids.includes(id), 'anchor ' + id);
    const u = k.ui(53); check(u.answer.a > 0.9 && u.answer.type > 0.2, 'answer visible at 53');
    check(k.ui(33).question.a > 0.9 && k.ui(1).question.a === 0 && k.ui(45).sources > 0.9 && k.ui(5).sources === 0, 'ui windows');
    // pick a node from the front at T=30
    k.update(30);
    const nodeA = k.anchors(30).find((x) => x.id === 'abc').pos;
    const ray = new THREE.Raycaster(new THREE.Vector3(nodeA.x, nodeA.y - 0.55, 30), new THREE.Vector3(0, 0, -1));
    const hit = k.pickAny(ray, 30);
    check(hit && hit.kind === 'node', 'pick node ' + JSON.stringify(hit));
    check(k.nodeInfo(0).group === 0 && k.nodeInfo(10).group === 1 && k.nodeInfo(10).rank === 1, 'nodeInfo');
    check(k.docKind(0) === 0 && k.docKind(7) === 1, 'docKind');
    // a sheet resting in the cloud at T=2
    k.update(7);
    k.hover('doc', 3); k.hover('node', 5); k.hover('source', 1); k.hover(null, -1);
    k.setColors({ accent: '#ff0000', bg: '#000000' }); k.update(40);
    k.dispose();
  }
}
if (failed) { console.error(failed + ' check(s) failed'); process.exit(1); }
console.log('scene.test OK');
