// Local preview server for the ECM+ website templates.
//
//   node website/serve.mjs                 → http://localhost:3040
//   PORT=4000 node website/serve.mjs
//   SUPPORT_PORTAL_URL=https://support.example.com node website/serve.mjs
//
// It also stands in for the support redirect controller: every /support/* link
// on the site is mapped to the portal the same way the production controller
// should do it (see README.md). Without SUPPORT_PORTAL_URL it serves
// support/index.html, which explains that the controller takes over on the live site.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)));
const PORT = Number(process.env.PORT) || 3040;
const PORTAL = (process.env.SUPPORT_PORTAL_URL || "").replace(/\/+$/, "");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// Website intent → portal route. Mirrors the table in README.md.
const SUPPORT_ROUTES = {
  "": "",
  login: "login",
  tickets: "tickets",
  "tickets/new": "tickets",
  suggestions: "suggestions",
};

function portalTarget(url) {
  const intent = url.pathname.replace(/^\/support\/?/, "").replace(/\/+$/, "");
  const route = Object.hasOwn(SUPPORT_ROUTES, intent) ? SUPPORT_ROUTES[intent] : "";
  const lang = url.searchParams.get("lang") === "ar" ? "ar" : "en";
  return `${PORTAL}/${lang}${route ? `/${route}` : ""}`;
}

async function send(res, file, status = 200) {
  const body = await readFile(file);
  res.writeHead(status, {
    "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // malformed percent-encoding
  }
  const safe = normalize(decoded).replace(/^([/\\])+/, "");
  const file = join(ROOT, safe);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      const index = join(file, "index.html");
      await stat(index);
      return index;
    }
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/support" || url.pathname.startsWith("/support/")) {
      if (PORTAL) {
        res.writeHead(302, { Location: portalTarget(url), "Cache-Control": "no-store" });
        res.end();
        return;
      }
      await send(res, join(ROOT, "support", "index.html"));
      return;
    }

    // Directory URLs need a trailing slash so relative CSS/asset paths resolve.
    const file = await resolveFile(url.pathname);
    if (file && file.endsWith("index.html") && !url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      res.end();
      return;
    }
    if (file) {
      await send(res, file);
      return;
    }
    await send(res, join(ROOT, "404.html"), 404);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
}).listen(PORT, () => {
  console.log(`ECM+ website templates → http://localhost:${PORT}`);
  console.log(PORTAL ? `Support links redirect to ${PORTAL}` : "Support links show the redirect preview page");
});
