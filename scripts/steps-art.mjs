// Spot illustrations for the "How it works" steps on the module pages.
// Each entry is the inner markup of <svg viewBox="0 0 120 80">: stroke line art in
// currentColor with a small set of classes that styles.css maps to the --sp-* tokens:
//   (none) ink outline            .a  gold stroke             .g  solid gold fill
//   .t     soft gold tint fill    .p  paper fill (surface)    .i  solid ink fill
//   .k     knockout (surface)     .m  muted stroke            .d  dashed stroke
//   .w / .w2  heavier stroke (ticks, magnifier handle)
// No text, letters or digits. Scenes listed in MIRROR_IN_RTL carry a reading-direction
// cue (rows that start at the left, a left-to-right timeline) and are flipped on RTL
// pages via .sp-step__svg--m; everything else is direction-neutral.
// Edit here, then run: node scripts/subpages.mjs

const f = (n) => String(Math.round(n * 100) / 100);
const cls = (c) => (c ? ` class="${c}"` : "");
const rect = (x, y, w, h, c = "", rx = 2.5) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}"${cls(c)}/>`;
const circle = (cx, cy, r, c = "") => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"${cls(c)}/>`;
const path = (d, c = "") => `<path d="${d}"${cls(c)}/>`;
const line = (x1, y1, x2, y2, c = "") => path(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`, c);
const rows = (x1, x2, ys, c = "m") => ys.map((y) => line(x1, y, x2, y, c)).join("");

const tick = (x, y, s = 1, c = "a w") => path(`M${f(x - 3.2 * s)} ${f(y + 0.2 * s)}l${f(2.3 * s)} ${f(2.3 * s)}l${f(4.4 * s)} ${f(-5 * s)}`, c);
const person = (cx, cy, s = 1, c = "") => circle(cx, cy - 4.2 * s, 2.8 * s, c) + path(`M${f(cx - 6.5 * s)} ${f(cy + 6 * s)}a${f(6.5 * s)} ${f(6.5 * s)} 0 0 1 ${f(13 * s)} 0`, c);
const sparkle = (cx, cy, r, c = "g") => path(`M${f(cx)} ${f(cy - r)}Q${f(cx)} ${f(cy)} ${f(cx + r)} ${f(cy)}Q${f(cx)} ${f(cy)} ${f(cx)} ${f(cy + r)}Q${f(cx)} ${f(cy)} ${f(cx - r)} ${f(cy)}Q${f(cx)} ${f(cy)} ${f(cx)} ${f(cy - r)}Z`, c);
const clock = (cx, cy, r, face = "p", hands = "") => circle(cx, cy, r, face) + path(`M${f(cx)} ${f(cy - r * 0.58)}V${f(cy)}H${f(cx + r * 0.46)}`, hands);
const arrowDown = (x, y1, y2, c = "a") => path(`M${f(x)} ${f(y1)}V${f(y2)}m-3-3l3 3 3-3`, c);
const arrowUp = (x, y1, y2, c = "a") => path(`M${f(x)} ${f(y1)}V${f(y2)}m-3 3l3-3 3 3`, c);
const badge = (cx, cy, r, s = r / 6.2) => circle(cx, cy, r, "a t") + tick(cx, cy, s);
const envelope = (x, y, w, h) => rect(x, y, w, h, "p", 2.5) + path(`M${f(x + 0.7)} ${f(y + 1.9)}L${f(x + w / 2)} ${f(y + h * 0.58)}L${f(x + w - 0.7)} ${f(y + 1.9)}`);
const sheet = (x, y, w, h, ys = [], inset = 8, rx = 3) => rect(x, y, w, h, "p", rx) + rows(x + inset, x + w - inset, ys);
const folder = (x, y, w, h) => path(`M${f(x)} ${f(y + h - 2.5)}V${f(y + 2.5)}a2.5 2.5 0 0 1 2.5-2.5h${f(w * 0.3)}l3.5 3.5H${f(x + w - 2.5)}a2.5 2.5 0 0 1 2.5 2.5v${f(h - 8.5)}a2.5 2.5 0 0 1-2.5 2.5H${f(x + 2.5)}a2.5 2.5 0 0 1-2.5-2.5z`, "p");
const shield = (cx, cy, r, c = "a t") => path(`M${f(cx)} ${f(cy - r)}l${f(r * 0.9)} ${f(r * 0.35)}v${f(r * 0.7)}c0 ${f(r * 0.6)} ${f(-r * 0.4)} ${f(r)} ${f(-r * 0.9)} ${f(r * 1.25)}c${f(-r * 0.5)} ${f(-r * 0.25)} ${f(-r * 0.9)} ${f(-r * 0.65)} ${f(-r * 0.9)} ${f(-r * 1.25)}v${f(-r * 0.7)}z`, c);
const bell = (cx, cy, s = 1, c = "a") => path(`M${f(cx - 4.5 * s)} ${f(cy + 2 * s)}v${f(-3 * s)}a${f(4.5 * s)} ${f(4.5 * s)} 0 0 1 ${f(9 * s)} 0v${f(3 * s)}l${f(1.8 * s)} ${f(2.3 * s)}H${f(cx - 6.3 * s)}z`, c) + path(`M${f(cx - 1.5 * s)} ${f(cy + 5.8 * s)}a${f(1.5 * s)} ${f(1.5 * s)} 0 0 0 ${f(3 * s)} 0`, c);
const calendar = (x, y, w, h, hi = 5, cols = 4, rowsN = 2) => {
  const head = y + h * 0.3;
  let s = rect(x, y, w, h, "p", 3) + line(x, head, x + w, head) + line(x + w * 0.3, y - 2.5, x + w * 0.3, y + 2.5) + line(x + w * 0.7, y - 2.5, x + w * 0.7, y + 2.5);
  let n = 0;
  for (let j = 0; j < rowsN; j++) for (let i = 0; i < cols; i++, n++) {
    const cx = x + (w * (i + 1)) / (cols + 1);
    const cy = head + ((y + h - head) * (j + 1)) / (rowsN + 1);
    s += n === hi ? circle(cx, cy, 3.2, "a t") + circle(cx, cy, 1.4, "g") : circle(cx, cy, 1.4, "i");
  }
  return s;
};
const checkRow = (x, y, x2, done, lineC = "m") => (done ? rect(x, y - 4.5, 9, 9, "a t", 2) + tick(x + 4.5, y, 1.05) : rect(x, y - 4.5, 9, 9, "", 2)) + line(x + 15, y, x2, y, lineC);

export const STEP_ART = {
  documents: [
    // Capture: phone, scanner and cloud feed sheets into the archive drawer.
    rect(26, 8, 14, 24, "p", 2.5) + rows(29.5, 36.5, [13, 17]) + circle(33, 28.5, 1, "i")
      + rect(46, 13, 28, 14, "p", 2.5) + line(50, 18.5, 70, 18.5) + circle(69.5, 23, 1.2, "g")
      + path("M76 30h22a5.5 5.5 0 0 0-3-10.8A8 8 0 0 0 80 19.4a4.6 4.6 0 0 0-3 5.4A5 5 0 0 0 76 30z", "p")
      + arrowDown(33, 35, 42) + arrowDown(60, 30, 42) + arrowDown(87, 33, 42)
      + rect(26, 44, 14, 10, "p", 1.2) + rect(53, 44, 14, 10, "p", 1.2) + rect(80, 44, 14, 10, "p", 1.2)
      + rect(18, 50, 84, 22, "p", 3) + line(54, 61, 66, 61),
    // Index: AI fills the index fields, a person confirms.
    sheet(22, 8, 54, 64) + rows(29, 38, [26, 40, 54]) + rect(42, 21.5, 27, 9, "a t", 1.5) + rect(42, 35.5, 27, 9, "a t", 1.5) + rect(42, 49.5, 27, 9, "", 1.5)
      + sparkle(76, 10, 5.5) + sparkle(84.5, 18.5, 2.6)
      + person(98, 44, 1.1) + circle(104, 61, 6.5, "p") + tick(104, 61, 1),
    // Protect: folder, shield with keyhole, access-trace eye.
    folder(18, 20, 64, 42) + shield(86, 46, 10) + circle(86, 44, 2.2, "g") + line(86, 46.2, 86, 51, "a")
      + circle(26, 60, 7, "p") + path("M20.5 60c2.5-3.6 8.5-3.6 11 0c-2.5 3.6-8.5 3.6-11 0z") + circle(26, 60, 1.5, "i"),
    // Find: a magnifier over the page with the matching line highlighted.
    sheet(28, 6, 50, 68, [18, 26, 34]) + rect(35, 39.5, 36, 7, "t", 1.5) + rows(36, 70, [43, 51, 59, 67])
      + circle(72, 46, 13, "a t") + path("M81.2 55.2l9.5 9.5", "a w2") + sparkle(66, 40, 3),
    // Retain: calendar and clock schedule a deletion (dashed sheet) or a notification (bell).
    calendar(12, 16, 44, 44, 5) + clock(84, 24, 12)
      + rect(66, 46, 28, 28, "p d", 2.5) + rows(72, 88, [55, 61, 67], "m d")
      + circle(102, 50, 7, "p") + bell(102, 49, 0.8),
  ],
  correspondence: [
    // Register: the letter gets a serial tag and a due date.
    sheet(30, 8, 52, 64, [34, 42, 50]) + rect(22, 14, 30, 10, "a t", 2.5) + circle(29, 19, 1.4, "g") + circle(35, 19, 1.4, "g") + circle(41, 19, 1.4, "g")
      + calendar(72, 42, 34, 30, 6),
    // Route: one letter fans out to people and a department, with the route drawn in gold.
    envelope(40, 6, 40, 24) + path("M60 32v7M60 39H26V50m-3-3l3 3 3-3M60 39V50m-3-3l3 3 3-3M60 39H94V50m-3-3l3 3 3-3", "a")
      + person(26, 62, 1.1) + person(94, 62, 1.1)
      + rect(50, 53, 20, 18, "p", 2) + circle(55, 58.5, 1.2, "i") + circle(60, 58.5, 1.2, "i") + circle(65, 58.5, 1.2, "i") + circle(55, 63.5, 1.2, "i") + circle(65, 63.5, 1.2, "i") + rect(58, 65, 4, 6, "", 1),
    // Review: approve (gold tick) or return (loop arrow).
    sheet(32, 8, 56, 64, [20, 28, 36, 44]) + badge(84, 58, 12, 1.6)
      + path("M36 54a8 8 0 1 0 8 8m-3 3l3-3 3 3"),
    // Dispatch: the printed letter carries the seal and leaves the printer.
    sheet(40, 14, 40, 34, [24, 31], 8, 2) + circle(66, 37, 7, "a t") + circle(66, 37, 3.8, "a d")
      + rect(26, 44, 68, 26, "p", 3) + line(36, 50.5, 84, 50.5, "m") + circle(86, 57, 1.8, "g") + line(36, 62, 84, 62, "m"),
    // Archive: the closed box with its sealed label.
    rect(24, 32, 72, 34, "p", 3) + rect(28, 46, 10, 4, "", 1.2) + rect(82, 46, 10, 4, "", 1.2) + rect(48, 42, 24, 14, "a t", 2) + tick(60, 49, 1.3)
      + rect(18, 22, 84, 12, "p", 2.5),
  ],
  processes: [
    // Design: start, task, decision, two branches, a timer.
    circle(60, 10, 3.5, "g") + line(60, 13.5, 60, 19) + rect(44, 19, 32, 12, "p", 2.5) + line(50, 25, 70, 25, "m") + line(60, 31, 60, 37)
      + path("M60 37l9 9-9 9-9-9z", "a t") + path("M51 46H26V58M69 46H94V58")
      + rect(12, 58, 28, 12, "p", 2.5) + line(18, 64, 34, 64, "m") + rect(80, 58, 28, 12, "p", 2.5) + line(86, 64, 96, 64, "m")
      + clock(104, 57, 5.5, "a t", "a"),
    // Build the forms: labelled fields, a dropdown, a ticked box, a toggle and an add button.
    rect(26, 6, 68, 68, "p", 3) + line(34, 15, 56, 15, "m")
      + line(34, 22, 48, 22, "m") + rect(34, 25, 52, 8, "", 1.5)
      + line(34, 39, 44, 39, "m") + rect(34, 42, 52, 8, "", 1.5) + path("M78.5 44.8l2.5 2.5 2.5-2.5")
      + rect(34, 55, 7, 7, "a t", 1.5) + tick(37.5, 58.5, 0.8) + line(45, 58.5, 62, 58.5, "m")
      + rect(70, 54.5, 16, 8, "g", 4) + circle(82, 58.5, 2.6, "k")
      + circle(90, 68, 7.5, "g") + path("M90 64.5v7M86.5 68h7", "k"),
    // Test: the flow runs step by step; done, running, pending.
    rect(42, 8, 36, 12, "p", 2.5) + line(48, 14, 66, 14, "m") + line(60, 20, 60, 34)
      + rect(42, 34, 36, 12, "a t", 2.5) + line(48, 40, 66, 40, "m") + line(60, 46, 60, 60, "d")
      + rect(42, 60, 36, 12, "p d", 2.5) + line(48, 66, 66, 66, "m d")
      + badge(86, 14, 5.5, 0.85) + badge(86, 40, 5.5, 0.85)
      + circle(26, 40, 9, "a t") + path("M23 35.2v9.6l8-4.8z", "g"),
    // Run: a request moves and tasks reach people.
    sheet(40, 6, 40, 22, [13, 19]) + circle(72, 13, 1.6, "g")
      + path("M60 30v5M60 35H36V44m-3-3l3 3 3-3M60 35H84V44m-3-3l3 3 3-3", "a")
      + person(36, 58, 1.15) + rect(46, 56, 16, 12, "p", 2) + tick(54, 62, 0.9)
      + person(84, 58, 1.15) + rect(94, 56, 16, 12, "p", 2) + rows(97, 107, [60, 64]),
    // Monitor: a task bar past its deadline marker escalates upward to the admin.
    rect(10, 12, 100, 58, "p", 3) + line(10, 22, 110, 22) + circle(16, 17, 1.2, "i") + circle(21, 17, 1.2, "i") + circle(26, 17, 1.2, "i")
      + rect(20, 50, 62, 7, "", 2) + rect(20, 50, 48, 7, "a t", 2)
      + line(58, 42, 58, 64, "d") + path("M58 42l6 2.5-6 2.5z", "i")
      + arrowUp(68, 48, 37) + bell(68, 27, 1)
      + person(96, 42, 1),
  ],
  meetings: [
    // Plan: a date, a free room, invitations.
    calendar(10, 18, 42, 40, 6) + rect(60, 20, 18, 44, "p", 2) + circle(74, 42, 1.3, "g") + badge(69, 14, 5.5, 0.85)
      + envelope(84, 34, 28, 20),
    // Meet: around the table, one on screen, attendance ticked.
    person(36, 46, 1.05) + person(56, 42, 1.05) + person(76, 46, 1.05) + '<ellipse cx="56" cy="58" rx="30" ry="9" class="p"/>'
      + rect(86, 8, 26, 20, "p", 2.5) + person(99, 22, 0.7) + path("M93 33h12M99 28v5")
      + badge(18, 38, 6.5, 0.95),
    // Decide: a ballot with every agenda item voted.
    rect(30, 6, 60, 68, "p", 3) + line(38, 16, 70, 16, "m") + checkRow(38, 30, 82, true) + checkRow(38, 46, 82, true) + checkRow(38, 62, 82, true),
    // Sign: the minutes, the signature, the pen, the verified seal.
    sheet(24, 6, 58, 68, [18, 26, 34]) + line(32, 60, 74, 60)
      + path("M34 57c3-9 6 3 10-4s5 7 10-1 5 4 9-2 2 2 6 0", "a w")
      + `<g transform="rotate(45 78.4 45.6)">${rect(76.15, 33.6, 4.5, 18, "p", 1.6)}${path("M76.15 51.6l2.25 4.5 2.25-4.5z", "g")}</g>`
      + shield(96, 62, 8) + tick(96, 63, 1),
    // Follow up: action items, assignees, a clock on the open ones.
    rect(22, 6, 60, 68, "p", 3) + checkRow(30, 22, 62, true) + person(70, 22, 0.6) + checkRow(30, 40, 62, false) + person(70, 40, 0.6) + checkRow(30, 58, 62, false) + person(70, 58, 0.6)
      + person(98, 40, 1.2) + clock(98, 62, 8, "a t", "a"),
  ],
};

// Scenes whose layout reads left-to-right (rows that start at the left, a timeline).
// The generator adds .sp-step__svg--m to these; CSS mirrors them on RTL pages.
export const MIRROR_IN_RTL = {
  documents: [1],
  correspondence: [0],
  processes: [1, 4],
  meetings: [2, 4],
};
