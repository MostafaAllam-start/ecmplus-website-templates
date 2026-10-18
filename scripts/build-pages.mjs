// Build the site for GitHub Pages.
//
//   node scripts/build-pages.mjs [outDir] [basePath]
//
// A project site lives under /<repository>/, so every root-relative link
// (/support/…, /privacy, /terms, /contact, /assets/…) is prefixed with that base.
// The source keeps root-relative links because on the production host a
// controller answers /support/* (see README.md). Each support route also gets
// its own copy of the local explanation page, so the links resolve statically.

import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = resolve(process.argv[2] || join(SRC, "_site"));
const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1] || "ecmplus-website-templates";
const BASE = (process.argv[3] ?? `/${repo}`).replace(/\/+$/, "");

const SKIP = new Set(["_site", "node_modules", "scripts", ".github", ".git", "content", "serve.mjs", "README.md"]);
const SUPPORT_ROUTES = ["login", "tickets", "tickets/new", "suggestions"];

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

// Prefix root-relative href/src/action values (but not protocol-relative "//").
function rebase(html) {
  return html.replace(/\b(href|src|action)="\/(?!\/)/g, `$1="${BASE}/`);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const entry of await readdir(SRC, { withFileTypes: true })) {
  if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
  await cp(join(SRC, entry.name), join(OUT, entry.name), { recursive: true });
}

let rewritten = 0;
for (const file of await walk(OUT)) {
  if (!file.endsWith(".html")) continue;
  const before = await readFile(file, "utf8");
  const after = rebase(before);
  if (after !== before) {
    await writeFile(file, after);
    rewritten += 1;
  }
}

const supportPage = await readFile(join(OUT, "support", "index.html"), "utf8");
for (const route of SUPPORT_ROUTES) {
  const target = join(OUT, "support", ...route.split("/"), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, supportPage);
}

await writeFile(join(OUT, ".nojekyll"), "");
console.log(`Built ${relative(process.cwd(), OUT) || "."}${sep} with base "${BASE}" (${rewritten} pages rebased).`);
