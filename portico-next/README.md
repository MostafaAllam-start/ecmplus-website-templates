# Portico (Next.js)

Next.js 15 static export of the Portico website (English and Arabic/RTL), including the Document Capture page with its 3D factory.

## Run

```
npm i
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # static export into out/
node lib/factory/scene.test.mjs   # headless check of the factory scene
```

Build-time variables (all optional):

- `NEXT_PUBLIC_BASE_PATH` - sub-path the site is served from, e.g. `/my-repo` on GitHub Pages (applied as `basePath` and `assetPrefix`).
- `NEXT_PUBLIC_CONTACT_URL` - where the "Request a demo" and contact links point.

`npm run build` downloads the Google Fonts used by `next/font` at build time, so it needs network access. Offline, set `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` to a module that maps font CSS URLs to stub CSS (verification only; the fonts then fall back to system fonts).

## Document Capture factory

- `lib/factory/scene.ts` builds the Three.js scene. It imports types only; `three` is passed in, so the module is lazy-loaded with the library.
- `update(T)` is a pure function of the timeline position `T` (0 to 64 s). Every transform comes from itineraries (`Track`) built once, so seeking, looping and pausing need no state.
- Seven stages (`STAGE_BOXES`) each have a time window and an AABB; the camera (orthographic, isometric) damps toward the box of the current stage, or toward `overviewAabb`.
- Labels are anchors (`anchors()`) projected to screen space as DOM pills; the counter and the "poor scan flagged" badge come from `counter(T)`.
- `components/capture/CaptureFactory.tsx` owns the canvas, the transport bar, the stage nav and caption, hover and click picking of the category bins, and theme colours (read from `--cf-*` CSS variables in `app/capture-factory.css`, so light, dark and RTL follow the page).
- The factory loads only when WebGL works, `prefers-reduced-motion` is not set, and the frame is near the viewport; within 8 s it must be ready, otherwise (or on context loss) the page keeps the 2D demo (`.cap-demo`). `#cap-lab[data-factory]` is `loading`, `on` or `off`.
- Reduced motion never imports `three` or the scene chunk.

## Debugging

Open the capture page with `?capdebug` to expose `window.__capFactory`:

- `seek(t)` jumps to `t` seconds (pauses playback and snaps the camera).
- `overview(true | false)` toggles the whole-factory view.
- `bins()` returns the screen positions of the five category bins.
- `T` is the current time.
