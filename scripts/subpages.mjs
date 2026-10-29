// Build the module pages (Documents, Correspondence, Processes, Meetings) and the
// About page for every template and language.
//
//   node scripts/subpages.mjs
//
// Each page reuses its template's own home page: the <head>, header and footer are
// taken from it, with every relative URL re-resolved for the deeper folder, in-page
// anchors pointed back at the home page, and the language switch pointed at the
// matching page in the other language. The page body comes from
// scripts/subpages-content.mjs and uses the template's section markup and buttons;
// the shared .sp-* components are styled in each template's styles.css.
// Links on the home pages that targeted a module or About anchor are switched to the
// new pages (idempotent). Re-run after editing the content or a home page's chrome.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import { CTA_GLYPHS, GLYPHS, MODULES, PAGES, SERVICES, UI } from "./subpages-content.mjs";
import { STEP_ART, MIRROR_IN_RTL } from "./steps-art.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const SLUGS = [...MODULES, "about"];

const HERO_SIZES = "(min-width: 1180px) 560px, (min-width: 900px) 46vw, 100vw";
const PHOTO_HEIGHT = { "p02-archive": 900, "p03-correspondence": 1067, "p04-process": 1067, "p05-boardroom": 1067, "p07-headquarters": 973 };

const STAR = '<svg class="star" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M8 0l2.34 2.34h3.32v3.32L16 8l-2.34 2.34v3.32h-3.32L8 16l-2.34-2.34H2.34v-3.32L0 8l2.34-2.34V2.34h3.32z"/></svg>';
// Next-step arrow inside each step's illustration tile (CSS points it per layout and direction).
const NEXT = '<span class="sp-step__next" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>';
// ECM+ swoosh ring (geometry of assets/brand/ring.svg) drawn in the closing panel's own gold and ink; CSS colours the stops.
const CTA_RING = `<svg class="sp-cta__ring" viewBox="0 0 200 116" aria-hidden="true" focusable="false"><defs><linearGradient id="sp-cta-t" x1="0" y1="0" x2="1" y2="0"><stop class="g1" offset="0"/><stop class="g2" offset=".38"/><stop class="i2" offset=".78"/><stop class="i1" offset="1"/></linearGradient><linearGradient id="sp-cta-b" x1="0" y1="0" x2="1" y2="0"><stop class="i1" offset="0"/><stop class="i2" offset=".32"/><stop class="g2" offset=".68"/><stop class="g1" offset="1"/></linearGradient><mask id="sp-cta-m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="116"><rect width="200" height="116" fill="#000"/><ellipse cx="100" cy="58" rx="98" ry="55" fill="#fff" transform="rotate(-5 100 58)"/><ellipse cx="100" cy="58" rx="88" ry="44" fill="#000" transform="rotate(4 100 58)"/><polygon points="0,83 200,18.2 200,21.8 0,86.6" fill="#000"/></mask></defs><g mask="url(#sp-cta-m)"><polygon points="0,0 200,0 200,20 0,84.8" fill="url(#sp-cta-t)"/><polygon points="0,84.8 200,20 200,116 0,116" fill="url(#sp-cta-b)"/></g></svg>`;

const TEMPLATES = {
  "portico": {
    homes: { en: "", ar: "ar/" },
    anchors: { documents: "documents", correspondence: "correspondence", processes: "processes", meetings: "meetings", about: "about" },
    suiteAnchor: "suite",
    wrap: "wrap",
    btn1: "btn btn--gold btn--lg",
    btn2: "btn btn--ghost-gold btn--lg",
    reveal: true,
    photos: true,
    head: (no, label, id, title) => `<div class="section-head" data-reveal>\n          <p class="eyebrow"><span class="eyebrow__no">${no}</span>${label}</p>\n          <h2 id="${id}">${title}</h2>\n        </div>`,
  },
  "ink-ledger": {
    homes: { en: "", ar: "ar/" },
    anchors: { documents: "documents", correspondence: "correspondence", processes: "processes", meetings: "meetings", about: "about" },
    suiteAnchor: "suite",
    wrap: "wrap",
    btn1: "btn btn--gold btn--lg",
    btn2: "btn btn--ghost btn--lg",
    reveal: true,
    head: (no, label, id, title) => `<div class="section-head" data-reveal>\n          <div class="section-head__text">\n            <p class="eyebrow"><span class="eyebrow__folio">${no}</span>${label}</p>\n            <h2 id="${id}">${title}</h2>\n          </div>\n        </div>`,
  },
  "paper-register": {
    homes: { en: "", ar: "ar/" },
    anchors: { dms: "documents", cms: "correspondence", bpm: "processes", mms: "meetings", about: "about" },
    suiteAnchor: "suite",
    wrap: "container",
    btn1: "btn btn--gold",
    btn2: "btn btn--outline",
    register: true,
  },
  "majlis-grid": {
    homes: { ar: "", en: "en/" },
    anchors: { dms: "documents", cms: "correspondence", bpm: "processes", mms: "meetings", about: "about" },
    suiteAnchor: "solutions",
    wrap: "wrap",
    btn1: "btn btn--gold btn--lg",
    btn2: "btn btn--line btn--lg",
    head: (no, label, id, title) => `<header class="section-head">\n          <div class="section-head__main">\n            <p class="eyebrow">${STAR}<span>${label}</span></p>\n            <h2 id="${id}">${title}</h2>\n          </div>\n        </header>`,
  },
};

const other = (lang) => (lang === "en" ? "ar" : "en");
const strip = (s) => s.replace(/<[^>]+>/g, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const name = (svc, lang) => (typeof svc.name === "string" ? svc.name : svc.name[lang]);

function rel(fromDir, toPath) {
  // Both are site-relative (no leading slash). Directories end with "/"; "" is the site root.
  const isDir = toPath === "" || toPath.endsWith("/");
  const r = posix.relative(fromDir.replace(/\/$/, "") || ".", toPath.replace(/\/$/, "") || ".");
  if (isDir) return r ? `${r}/` : "./";
  return r || "./";
}

// Re-resolve every relative URL in a chunk of the home page for the page folder.
function rebaseChunk(html, ctx) {
  const { homeDir, pageDir, homeDirs, lang, slug, tpl } = ctx;
  const fix = (url, tag) => {
    if (!url || /^(?:[a-z]+:|\/|data:)/i.test(url)) return url;
    if (url.startsWith("#")) {
      if (tag !== "a") return url; // sprite references (<use href="#…">) stay put
      const id = url.slice(1);
      if (!id || id === "main") return url;
      const target = tpl.anchors[id];
      if (target) return rel(pageDir, `${homeDir}${target}/`);
      return `${rel(pageDir, homeDir)}#${id}`;
    }
    const cut = url.search(/[?#]/);
    const pathPart = (cut < 0 ? url : url.slice(0, cut)).replace(/(^|\/)index\.html$/, "$1");
    const rest = cut < 0 ? "" : url.slice(cut);
    const isDir = pathPart === "" || pathPart === "." || pathPart === ".." || pathPart.endsWith("/");
    let resolved = posix.normalize(posix.join(homeDir, pathPart || ".")).replace(/\/+$/, "");
    if (resolved === ".") resolved = "";
    const target = isDir ? (resolved ? `${resolved}/` : "") : resolved;
    // The language switch: point at the same page in the other language.
    if (target === homeDirs[other(lang)]) return rel(pageDir, `${homeDirs[other(lang)]}${slug}/`) + rest;
    return rel(pageDir, target) + rest;
  };
  return html.replace(/<([a-zA-Z][\w-]*)(\s[^>]*?)?(\/?)>/g, (m, tag, attrs = "", selfClose) => {
    if (!attrs) return m;
    const t = tag.toLowerCase();
    let out = attrs.replace(/\s(href|src|poster|action)="([^"]*)"/g, (a, k, v) => ` ${k}="${fix(v, t)}"`);
    out = out.replace(/\ssrcset="([^"]*)"/g, (a, v) => ` srcset="${v.split(",").map((part) => {
      const [u, ...d] = part.trim().split(/\s+/);
      return [fix(u, t), ...d].join(" ");
    }).join(", ")}"`);
    if (t === "a" && /\shref="([^"]*)"/.test(out)) {
      const href = out.match(/\shref="([^"]*)"/)[1];
      if (href === "./" && !/\saria-current=/.test(out)) out += ' aria-current="page"';
    }
    return `<${tag}${out}${selfClose}>`;
  });
}

function svgGlyph(slug, cls = "sp-glyph") {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${GLYPHS[slug]}</svg>`;
}

function buildMain(tName, tpl, lang, slug, ctx) {
  const ui = UI[lang];
  const page = PAGES[slug];
  const c = page[lang];
  const home = rel(ctx.pageDir, ctx.homeDir);
  const sib = (s) => rel(ctx.pageDir, `${ctx.homeDir}${s}/`);
  const assets = rel(ctx.pageDir, "assets/");
  const reveal = (i) => (tpl.reveal ? ` data-reveal style="--i:${i}"` : "");
  const W = tpl.wrap;

  const section = (no, label, id, title, body, alt) => {
    const cls = `section sp-section${alt ? " sp-section--alt" : ""}`;
    if (tpl.register) {
      return `    <section class="${cls}" aria-labelledby="${id}">
      <div class="container register">
        <div class="register__margin">
          <span class="register__no" aria-hidden="true">${no}</span>
          <span class="register__label">${label}</span>
        </div>
        <div class="register__body">
          <h2 id="${id}" class="h2">${title}</h2>
${body}
        </div>
      </div>
    </section>`;
    }
    return `    <section class="${cls}" aria-labelledby="${id}">
      <div class="${W}">
        ${tpl.head(no, label, id, title)}
${body}
      </div>
    </section>`;
  };

  const prose = (paras) => `        <div class="sp-prose">\n${paras.map((p) => `          <p>${p}</p>`).join("\n")}\n        </div>`;
  const grid = (items) => `        <ul class="sp-grid">\n${items.map(([h, p], i) => `          <li class="sp-card"${reveal(i)}><h3 class="sp-card__title">${h}</h3><p>${p}</p></li>`).join("\n")}\n        </ul>`;
  const art = (i, last) => `<div class="sp-step__art"><svg class="sp-step__svg${MIRROR_IN_RTL[slug]?.includes(i) ? " sp-step__svg--m" : ""}" viewBox="0 0 120 80" aria-hidden="true" focusable="false">${STEP_ART[slug][i]}</svg>${last ? "" : NEXT}</div>`;
  const steps = (items) => `        <ol class="sp-steps">\n${items.map(([h, p], i) => `          <li class="sp-step"${reveal(i)}>${art(i, i === items.length - 1)}<span class="sp-step__no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><h3 class="sp-step__title">${h}</h3><p>${p}</p></li>`).join("\n")}\n        </ol>`;
  const chips = (keys) => `        <ul class="sp-chips">\n${keys.map((k) => {
    const s = SERVICES[k];
    let mark = '<span class="sp-chip__dot" aria-hidden="true"></span>';
    if (s.ecm) mark = `<img class="sp-chip__logo sp-chip__logo--wide ecmlogo__img--light" src="${assets}brand/ecmplus-ai-logo-272.webp" alt="" width="545" height="302" loading="lazy" decoding="async"><img class="sp-chip__logo sp-chip__logo--wide ecmlogo__img--dark" src="${assets}brand/ecmplus-ai-logo-dark-272.webp" alt="" width="545" height="302" loading="lazy" decoding="async">`;
    else if (s.logo) mark = `<img class="sp-chip__logo${s.wide ? " sp-chip__logo--wide" : ""}" src="${assets}${s.logo}" alt="" width="${s.wide ? 604 : 18}" height="${s.wide ? 331 : 18}" loading="lazy" decoding="async">`;
    else if (s.glyph) mark = `<svg class="sp-chip__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${s.glyph}</svg>`;
    const n = name(s, lang);
    const label = lang === "ar" && /^[\x00-\x7F+]+$/.test(n) ? `<bdi>${n}</bdi>` : n;
    return `          <li class="sp-chip">${mark}${label}</li>`;
  }).join("\n")}\n        </ul>`;
  const related = (keys) => `        <ul class="sp-related">\n${keys.map((k, i) => {
    const m = PAGES[k][lang];
    return `          <li${reveal(i)}><a class="sp-related__link" href="${sib(k)}">${svgGlyph(k, "sp-glyph sp-related__icon")}<span class="sp-related__code"><bdi>${PAGES[k].code}</bdi></span><span class="sp-related__name">${m.name}</span><span class="sp-related__line">${m.line}</span></a></li>`;
  }).join("\n")}\n        </ul>`;

  const crumbs = slug === "about"
    ? `<li><a href="${home}">${ui.home}</a></li><li aria-current="page">${c.short}</li>`
    : `<li><a href="${home}">${ui.home}</a></li><li><a href="${home}#${tpl.suiteAnchor}">${ui.suite}</a></li><li aria-current="page">${c.short}</li>`;
  const eyebrow = slug === "about"
    ? `<p class="sp-eyebrow"><span>${c.eyebrow}</span></p>`
    : `<p class="sp-eyebrow">${svgGlyph(slug)}<span><bdi>${page.code}</bdi> · ${c.name}</span></p>`;

  let visual;
  if (tpl.photos) {
    const p = page.photo;
    const src = (w) => `${assets}photos/portico/${p}-${w}.webp`;
    visual = `      <figure class="sp-hero__visual sp-photo"><img src="${src(1200)}" srcset="${src(800)} 800w, ${src(1200)} 1200w, ${src(1600)} 1600w" sizes="${HERO_SIZES}" width="1600" height="${PHOTO_HEIGHT[p]}" alt="" fetchpriority="high" decoding="async"></figure>`;
  } else if (slug === "about") {
    visual = `      <div class="sp-hero__visual sp-emblem sp-emblem--logo" aria-hidden="true"><img class="ecmlogo__img--light" src="${assets}brand/ecmplus-ai-logo-545.webp" alt="" width="545" height="302"><img class="ecmlogo__img--dark" src="${assets}brand/ecmplus-ai-logo-dark-545.webp" alt="" width="545" height="302"></div>`;
  } else {
    const alt = PAGES[slug][other(lang)].name;
    visual = `      <div class="sp-hero__visual sp-emblem" aria-hidden="true"><span class="sp-emblem__ring">${svgGlyph(slug)}</span><span class="sp-emblem__code">${page.code}</span><span class="sp-emblem__name">${c.name}</span><span class="sp-emblem__alt" lang="${other(lang)}" dir="${other(lang) === "ar" ? "rtl" : "ltr"}">${alt}</span></div>`;
  }

  const hero = `    <section class="sp-hero" aria-labelledby="page-title">
      <div class="${W} sp-hero__grid">
        <div class="sp-hero__copy">
          <nav class="sp-crumbs" aria-label="${ui.crumbsLabel}"><ol>${crumbs}</ol></nav>
          ${eyebrow}
          <h1 id="page-title">${c.h1}</h1>
          <p class="sp-lead">${c.lead}</p>
          <div class="sp-actions"><a class="${tpl.btn1}" href="${home}#contact">${ui.demo}</a><a class="${tpl.btn2}" href="${home}#${tpl.suiteAnchor}">${ui.explore}</a></div>
        </div>
${visual}
      </div>
    </section>`;

  const ctaSecond = slug === "about"
    ? `<a class="${tpl.btn2} sp-cta__ghost" href="/support${lang === "ar" ? "?lang=ar" : ""}">${ui.supportCentre}</a>`
    : `<a class="${tpl.btn2} sp-cta__ghost" href="${home}#${tpl.suiteAnchor}">${ui.explore}</a>`;
  const ctaFacts = ui.ctaFacts.map(([g, h, p]) => `            <li><svg class="sp-glyph sp-cta__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${CTA_GLYPHS[g]}</svg><span><strong>${h}</strong>${p}</span></li>`).join("\n");
  const cta = `    <section class="sp-cta" aria-labelledby="cta-title">
      <div class="${W}">
        <div class="sp-cta__inner">
          ${CTA_RING}
          <div class="sp-cta__copy">
            <p class="sp-cta__eyebrow"><span class="sp-cta__mark" aria-hidden="true"></span><span>${ui.ctaEyebrow}</span></p>
            <h2 id="cta-title">${ui.ctaTitle}</h2>
            <p class="sp-cta__text">${ui.ctaText}</p>
            <div class="sp-actions sp-cta__actions"><a class="${tpl.btn1}" href="${home}#contact">${ui.demo}</a>${ctaSecond}</div>
          </div>
          <div class="sp-cta__brief">
            <p class="sp-cta__brief-title">${ui.ctaBriefTitle}</p>
            <ul class="sp-cta__facts">
${ctaFacts}
            </ul>
          </div>
        </div>
      </div>
    </section>`;

  let sections;
  if (slug === "about") {
    const partner = `        <div class="sp-partner"${reveal(0)}><img class="sp-partner__logo" src="${assets}brand/ctc-logo.webp" alt="CTC MENA" width="200" height="200" loading="lazy"><p>${c.partner}</p></div>`;
    const support = `        <div class="sp-support">\n          <p class="sp-text">${c.support}</p>\n          <ul class="sp-links">\n${c.supportLinks.map(([href, label]) => `            <li><a href="${href}">${label}</a></li>`).join("\n")}\n          </ul>\n        </div>`;
    sections = [
      section("01", c.whoLabel, "who-title", c.whoTitle, prose(c.who)),
      section("02", c.suiteLabel, "suite-title", c.suiteTitle, related(MODULES), true),
      section("03", c.valuesLabel, "values-title", c.valuesTitle, grid(c.values)),
      section("04", c.partnerLabel, "partner-title", c.partnerTitle, partner, true),
      section("05", c.supportLabel, "support-title", c.supportTitle, support),
    ];
  } else {
    sections = [
      section("01", ui.overview, "overview-title", c.overviewTitle, prose(c.overview)),
      section("02", ui.capabilities, "capabilities-title", ui.capabilitiesTitle, grid(c.capabilities), true),
      section("03", ui.how, "how-title", c.howTitle, steps(c.steps)),
      section("04", ui.worksWith, "works-title", ui.worksWithTitle, chips(page.services), true),
      section("05", ui.related, "related-title", ui.relatedTitle, related(MODULES.filter((m) => m !== slug))),
    ];
  }

  return `  <main id="main" class="sp sp--${slug}">\n${hero}\n\n${sections.join("\n\n")}\n\n${cta}\n  </main>`;
}

function buildHead(head, ctx, lang, slug) {
  const c = PAGES[slug][lang];
  const urls = {};
  for (const m of head.matchAll(/<link rel="alternate" hreflang="([\w-]+)" href="([^"]+)">/g)) urls[m[1]] = m[2];
  if (!urls[lang] || !urls[other(lang)]) throw new Error(`${ctx.homeDir}: the home page needs hreflang alternates for both languages`);
  const pageUrl = (l) => `${urls[l]}${slug}/`;
  const title = strip(c.metaTitle);
  const desc = esc(strip(c.description));
  const crumbs = slug === "about"
    ? [[UI[lang].home, urls[lang]], [strip(c.short), pageUrl(lang)]]
    : [[UI[lang].home, urls[lang]], [UI[lang].suite, `${urls[lang]}#${ctx.tpl.suiteAnchor}`], [strip(c.short), pageUrl(lang)]];
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: u })),
  }, null, 2).replace(/\n/g, "\n  ");
  let h = head
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${pageUrl(lang)}$2`)
    .replace(/<link rel="alternate" hreflang="([\w-]+)" href="([^"]+)">/g, (m, l, u) => `<link rel="alternate" hreflang="${l}" href="${u}${slug}/">`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${pageUrl(lang)}$2`)
    .replace(/(<meta (?:property|name)="(?:og|twitter):title" content=")[^"]*(">)/g, `$1${esc(title)}$2`)
    .replace(/(<meta (?:property|name)="(?:og|twitter):description" content=")[^"]*(">)/g, `$1${desc}$2`)
    .replace(/<link rel="preload" as="image"[^>]*>/g, "<!--sp-preload-->")
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\r?\n/g, "");
  h = rebaseChunk(h, ctx);
  // Portico: preload this page's own hero photograph instead of the home page's.
  const photo = PAGES[slug].photo;
  const assets = rel(ctx.pageDir, "assets/");
  const preload = ctx.tpl.photos && photo
    ? `<link rel="preload" as="image" type="image/webp" imagesrcset="${[800, 1200, 1600].map((w) => `${assets}photos/portico/${photo}-${w}.webp ${w}w`).join(", ")}" imagesizes="${HERO_SIZES}" fetchpriority="high">`
    : "";
  h = h.replace(/[ \t]*<!-- The hero photograph[^\n]*-->\n(?=[ \t]*<!--sp-preload-->)/, preload ? "$&" : "").replace(/[ \t]*<!--sp-preload-->\n?/, preload ? `  ${preload}\n` : "");
  return h.replace(/<\/head>/, `  <script type="application/ld+json">\n  ${ld}\n  </script>\n</head>`);
}

let written = 0;
for (const [tName, tpl] of Object.entries(TEMPLATES)) {
  const homeDirs = Object.fromEntries(Object.entries(tpl.homes).map(([l, d]) => [l, `templates/${tName}/${d}`]));

  // 1. Home pages: module and About anchors become links to the new pages.
  for (const [lang, dir] of Object.entries(homeDirs)) {
    const file = `${ROOT}${dir}index.html`;
    let html = await readFile(file, "utf8");
    const before = html;
    html = html.replace(/(<a\b[^>]*?\shref=")#([\w-]+)(")/g, (m, a, id, b) => (tpl.anchors[id] ? `${a}${tpl.anchors[id]}/${b}` : m));
    if (html !== before) await writeFile(file, html);
  }

  // 2. The new pages.
  for (const [lang, homeDir] of Object.entries(homeDirs)) {
    const homeHtml = await readFile(`${ROOT}${homeDir}index.html`, "utf8");
    const nl = homeHtml.includes("\r\n") ? "\r\n" : "\n";
    const src = homeHtml.replace(/\r\n/g, "\n");
    const headEnd = src.indexOf("</head>") + "</head>".length;
    const mainStart = src.search(/\n[ \t]*<main\b/);
    const mainEnd = src.indexOf("</main>") + "</main>".length;
    if (headEnd < 7 || mainStart < 0 || mainEnd < 7) throw new Error(`${homeDir}index.html: expected </head>, <main> and </main>`);
    for (const slug of SLUGS) {
      const pageDir = `${homeDir}${slug}/`;
      const ctx = { homeDir, pageDir, homeDirs, lang, slug, tpl };
      const head = buildHead(src.slice(0, headEnd), ctx, lang, slug);
      const bodyStart = rebaseChunk(src.slice(headEnd, mainStart), ctx);
      const bodyEnd = rebaseChunk(src.slice(mainEnd), ctx);
      const main = buildMain(tName, tpl, lang, slug, ctx);
      const html = `${head}${bodyStart}\n${main}${bodyEnd}`.replace(/\n/g, nl);
      await mkdir(`${ROOT}${pageDir}`, { recursive: true });
      await writeFile(`${ROOT}${pageDir}index.html`, html);
      written += 1;
    }
  }
}
console.log(`Wrote ${written} pages.`);
