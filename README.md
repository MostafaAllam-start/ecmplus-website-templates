# ECM+ marketing website — templates

Static HTML/CSS templates for the ECM Plus (ECM+) brand website. No framework: each template
has a home page per language, five inner pages per language (Documents, Correspondence,
Processes, Meetings and About), one `styles.css` and one small `main.js`.

**Live preview:** https://mostafaallam-start.github.io/ecmplus-website-templates/

```
./
├── index.html                 template gallery (start here)
├── 404.html                   "page not available" page for the preview
├── serve.mjs                  local preview server + /support redirect stand-in
├── scripts/build-pages.mjs    builds the GitHub Pages version (see "Publishing")
├── scripts/subpages.mjs       generates the module and About pages (see "Inner pages")
├── scripts/subpages-content.mjs   their English and Arabic copy
├── .github/workflows/pages.yml
├── assets/brand/              ECM+ AI Powered logo (ecmplus-ai-logo*, ecmplus-logo.css),
│                              ECM+ logo (png/webp), ring.svg / ring-dark.svg, favicon.svg,
│                              CTC logo
├── assets/brands/             integration logos (Teams, Meet, Zoom, Gmail, Calendar, Drive,
│                              OneDrive, WhatsApp, Word, Excel, PowerPoint, Outlook, Nafath, Beem)
├── assets/photos/portico/     Portico photographs + CREDITS.md + PROMPTS.md (AI image briefs)
├── support/index.html         support redirect preview page (local and Pages preview only)
└── templates/
    ├── ink-ledger/            01 enterprise: OpenText-style IA, mega-menu, record-journey hero
    │   ├── index.html         English
    │   └── ar/index.html      Arabic (rtl), shares ../styles.css and ../main.js
    ├── paper-register/        02 editorial: Everteam-style IA, records-register layout
    │   ├── index.html         English
    │   └── ar/index.html      Arabic (rtl)
    ├── majlis-grid/           03 Arabic-first bento
    │   ├── index.html         Arabic (rtl), the default
    │   └── en/index.html      English
    └── portico/               04 photographic: the three templates' motion on institutional photos
        ├── index.html         English
        └── ar/index.html      Arabic (rtl)

Each language folder also holds documents/, correspondence/, processes/, meetings/ and about/,
for example templates/portico/ar/meetings/index.html.
```

| Template | Fonts | Light (default) → dark |
|---|---|---|
| Ink Ledger | Zilla Slab, IBM Plex Sans, IBM Plex Sans Arabic | ledger in daylight → ink navy with gold hairlines |
| Paper Register | Newsreader, Source Sans 3, Amiri, Noto Naskh Arabic | warm paper with gold rules → night register |
| Majlis Grid | Alexandria, Vazirmatn | light cards with an ECM content-network pattern and gold accents → deep navy |
| Portico | Manrope, Readex Pro | limestone with frosted plates over photographs → basalt |

## Languages and themes

- **Every template ships in English and Arabic** as two real pages (not a JavaScript toggle),
  so search engines index both. Each page links to the other with `hreflang`, carries its own
  canonical URL, and the Arabic page adds `?lang=ar` to every support link. Layouts use logical
  CSS properties, so they mirror right-to-left from one stylesheet. Codes, IDs and the logo stay
  left-to-right.
- **Switching language animates the layout flip** in every template. Both pages opt in to
  cross-document View Transitions (`@view-transition { navigation: auto; }`), and the header, logo,
  navigation and hero parts carry shared `view-transition-name`s, so they glide to their mirrored
  places. Ink Ledger and Portico flag the arrival in the `<head>` script (`pagereveal`), so the hero
  does not replay its entrance. Browsers without support just load the other page, and
  reduced-motion settings turn the animation off. View transitions need `http(s)`, not `file://`.
  Chrome reads the opt-in as soon as `<body>` starts. Ink Ledger, Paper Register and Portico hold
  the parser at an inline script until their stylesheet has loaded, so the rule can live there.
  Majlis Grid has no such script, so it declares the opt-in in an inline `<style>` in `<head>`.
  Without that, the flip is often skipped.
- **Every page has light and dark modes, and light is the default.** Pages open light,
  whatever the device setting, and switch to dark only when the visitor presses the theme button
  ("Dark mode" / "الوضع الداكن", with an on/off state). The choice is saved in `localStorage` under
  `ecmplus-theme`, so it carries across all templates and the gallery. An inline script in `<head>`
  applies it before the first paint, so there's no flash. Colours live in CSS custom properties:
  light values on `:root`, dark values under `:root[data-theme="dark"]` (screen only, so printing
  is always light).
- All copy follows a formal enterprise register in both languages. Have a native Arabic speaker
  review the Arabic pages before launch.

## Inner pages

Every template has a detail page for each module (Documents, Correspondence, Processes and
Meetings) and an About ECM Plus page, in both languages: 40 pages in all. They are generated:

```bash
node scripts/subpages.mjs
```

- The copy lives in `scripts/subpages-content.mjs`, one source for all four templates. Every claim
  comes from the internal copy deck. Edit it there, then run the script again.
- Each page reuses its template's own home page. The script copies the `<head>`, header and footer,
  re-resolves relative links for the deeper folder, points in-page anchors back at the home page,
  and sends the language switch to the same page in the other language. Canonical, `hreflang` and
  Open Graph URLs follow the page, and a breadcrumb replaces the home page's structured data.
  After changing a home page's header or footer, run the script again so the inner pages follow.
- The page body uses each template's own section headings and buttons. The shared `.sp-*`
  components are styled at the end of each `styles.css` through `--sp-*` tokens mapped to that
  template's colours and fonts, so light and dark modes carry over.
- On the home pages, links to a module or About anchor point at the new pages. The script updates
  them, and running it again is harmless. The module cards (Portico), "Explore" links (Ink Ledger),
  folder links (Paper Register) and "Module details" links (Majlis Grid) also open them.

## Logo

The header and footer logo is the product's own **ECM+ Business Suite, AI Powered** logo
(`public/assets/images/ecm.png` in the ECM+ frontend), trimmed and exported as
`assets/brand/ecmplus-ai-logo-{272,545}.webp`, plus `ecmplus-ai-logo.png` for social
previews and search results. `ecmplus-ai-logo-dark-*` is a version for dark surfaces: the
graphite lettering and ring are lightened, and the gold is unchanged. Each logo link holds both
images and `assets/brand/ecmplus-logo.css` (loaded after each page's own stylesheet) shows the
right one for the theme. Search for `class="brand ecmlogo`. Add `ecmlogo--lg` for the footer size
and `ecmlogo--on-dark` on a surface that stays dark in light mode.

The record card in the Ink Ledger journey carries the same logo. The module seals (the
background of Majlis Grid's title card and Portico's hero) and the Ink Ledger platform row still
use the swoosh ring: HTML text over `ring.svg`, or `ring-dark.svg` on dark backgrounds.

## Run it locally

From the repository root:

```bash
node serve.mjs
```

Open http://localhost:3040. Change the port with `PORT=4000`.

## Support links → redirect controller

The site never hard-codes the support portal's address. Every support link points at a
`/support/*` route on the website's own host, and a controller on that host redirects to
the portal (the Next.js app in `MostafaAllam-start/ticketing-support`). Moving the portal
then only means changing one setting.

| Link on the site | Meaning | Portal route the controller should send to |
|---|---|---|
| `/support` | Support centre | `{portal}/{lang}` |
| `/support/login` | Sign in to the client portal | `{portal}/{lang}/login` |
| `/support/tickets` | Track your tickets | `{portal}/{lang}/tickets` |
| `/support/tickets/new` | Submit a support ticket | `{portal}/{lang}/tickets` (new-ticket flow) |
| `/support/suggestions` | Submit a suggestion or complaint | `{portal}/{lang}/suggestions` |

`lang` comes from `?lang=ar` (Arabic pages add it) and defaults to `en`, matching the
portal's `/[locale]/…` routes. Unknown paths should fall back to the portal home.
Use a `302` so the target can change without browsers caching it.

### Example: ASP.NET Core

```csharp
[ApiController]
[Route("support")]
public class SupportRedirectController(IConfiguration config) : ControllerBase
{
    private static readonly Dictionary<string, string> Routes = new(StringComparer.OrdinalIgnoreCase)
    {
        [""] = "", ["login"] = "login", ["tickets"] = "tickets",
        ["tickets/new"] = "tickets", ["suggestions"] = "suggestions",
    };

    [HttpGet("{**intent}")]
    public IActionResult Go(string? intent, [FromQuery] string? lang)
    {
        var portal = config["SupportPortal:BaseUrl"]!.TrimEnd('/');
        var locale = lang == "ar" ? "ar" : "en";
        var route = Routes.GetValueOrDefault((intent ?? "").Trim('/'), "");
        return Redirect($"{portal}/{locale}{(route.Length > 0 ? "/" + route : "")}");
    }
}
```

Only ever redirect to the configured portal base. Never take the destination from the
query string, so the route can't be used as an open redirect.

### Locally

`serve.mjs` behaves like the controller. To test the real hop, point it at a running portal:

```bash
SUPPORT_PORTAL_URL=http://localhost:3100 node serve.mjs
```

Without the variable it serves `support/index.html`, a short page (English, or Arabic with
`?lang=ar`) explaining that the controller takes over on the live site.

## Publishing (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which builds the site with
`scripts/build-pages.mjs` and deploys it to GitHub Pages. A project site lives under
`/ecmplus-website-templates/`, so the build:

- prefixes every root-relative link (`/support/…`, `/privacy`, `/terms`, `/contact`, `/assets/…`)
  with that path. The source keeps root-relative links for the production host;
- writes a copy of the support explanation page for each support route, so the links resolve
  without a controller;
- leaves out `README.md`, `serve.mjs` and the build tooling.

To build locally: `node scripts/build-pages.mjs _site`. The preview has no server, so the
privacy and terms links show the 404 page, and the demo-request forms cannot be submitted.

## Before going live

- **Domain**: canonical and Open Graph tags use `https://ecmplus.org/`. The Office add-in
  manifests use that domain, but the in-app support dialog uses `ecmpluss.com`. Confirm which is right.
- **Logo**: the header and footer logo is the product's raster logo, and its dark version is
  derived from it. The ring and `favicon.svg` are SVG renditions of the raster logo
  (`assets/brand/ecmplus-logo.png`). Swap in official vectors, including a reversed version for
  dark backgrounds, when design has them.
- **Forms**: the demo-request forms post to `/contact` and need a handler.
- **Integration logos**: `assets/brands/` holds the Microsoft Teams, Google Meet, Zoom, Gmail,
  Google Calendar, Google Drive, OneDrive and WhatsApp marks from the CC0 "SVG Logos" set, the
  current Microsoft Word, Excel, PowerPoint and Outlook icons from the MIT "theSVG" set, and the
  Nafath logo used in the ECM+ product, and the Beem icon from beem.sa. All are used unmodified
  beside each service's name, and ECM+ Meet carries the ECM+ logo. They remain their owners'
  trademarks, so check each brand's guidelines before launch. SMS appears as a neutral glyph.
- **Photographs** (Portico): free Unsplash photos, listed with their photographers in
  `assets/photos/portico/CREDITS.md`. `PROMPTS.md` holds an image brief per file, so they can be
  replaced by generated or commissioned images with the same names and proportions.
- **Claims**: every product claim comes from an internal copy deck that was checked against the
  ECM+ frontend and backend. There are no customer names, logos, testimonials or certifications,
  because none were verifiable. Add real ones only with permission.
