"use client";

import { useEffect } from "react";

const f = (n: number) => Math.round(n * 10) / 10;

// Horizontal-first elbow with rounded corners.
function elbowH(x1: number, y1: number, x2: number, y2: number): string {
  const mx = x1 + (x2 - x1) / 2;
  const dy = y2 - y1;
  const r = Math.min(12, Math.abs(dy) / 2, (x2 - x1) / 4);
  if (Math.abs(dy) < 2 || r < 1) return `M${f(x1)} ${f(y1)} H${f(x2)}`;
  const sy = dy > 0 ? 1 : -1;
  return (
    `M${f(x1)} ${f(y1)} H${f(mx - r)} Q${f(mx)} ${f(y1)} ${f(mx)} ${f(y1 + sy * r)} ` +
    `V${f(y2 - sy * r)} Q${f(mx)} ${f(y2)} ${f(mx + r)} ${f(y2)} H${f(x2)}`
  );
}

/**
 * Governance: draws the trace from the trace code to the access record (ported from main.js).
 * The markup is server-rendered inside [data-evidence]; this island measures it, draws the path
 * and adds `in` once the record or the code scrolls into view.
 */
export default function TraceEvidence() {
  useEffect(() => {
    const evidence = document.querySelector<HTMLElement>("[data-evidence]");
    if (!evidence) return;
    const stage = evidence.querySelector<HTMLElement>(".evidence__stage");
    const from = evidence.querySelector<HTMLElement>("[data-trace-from]");
    const to = evidence.querySelector<HTMLElement>("[data-trace-to]");
    const svg = evidence.querySelector<SVGSVGElement>(".trace");
    const path = svg?.querySelector(".trace__path");
    const dotA = svg?.querySelector(".trace__dot--a");
    const dotB = svg?.querySelector(".trace__dot--b");
    if (!stage || !from || !to || !svg || !path || !dotA || !dotB) return;

    const draw = () => {
      const s = stage.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      if (!s.width || !s.height) return;
      svg.setAttribute("viewBox", `0 0 ${f(s.width)} ${f(s.height)}`);
      let x1: number, y1: number, x2: number, y2: number, d: string;
      if (b.left >= a.right + 8) {
        // Record sits beside the page: leave the code to the right.
        x1 = a.right - s.left;
        y1 = a.top + a.height / 2 - s.top;
        x2 = b.left - s.left;
        y2 = b.top - s.top + Math.min(64, b.height / 3);
        d = elbowH(x1, y1, x2, y2);
      } else {
        // Record sits below the page: drop straight down from the code.
        x1 = a.left + a.width / 2 - s.left;
        y1 = a.bottom - s.top;
        x2 = x1;
        y2 = b.top - s.top;
        d = `M${f(x1)} ${f(y1)} V${f(y2)}`;
      }
      path.setAttribute("d", d);
      svg.classList.add("is-drawn");
      dotA.setAttribute("cx", String(f(x1)));
      dotA.setAttribute("cy", String(f(y1)));
      dotB.setAttribute("cx", String(f(x2)));
      dotB.setAttribute("cy", String(f(y2)));
    };

    draw();
    const cleanups: Array<() => void> = [];
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(draw);
      ro.observe(stage);
      ro.observe(from.closest(".paper") || from);
      ro.observe(to);
      cleanups.push(() => ro.disconnect());
    } else {
      window.addEventListener("resize", draw);
      cleanups.push(() => window.removeEventListener("resize", draw));
    }
    // Web fonts arrive after first paint (display=swap); redraw when they land.
    if (document.fonts) {
      document.fonts.ready?.then(draw);
      document.fonts.addEventListener("loadingdone", draw);
      cleanups.push(() => document.fonts.removeEventListener("loadingdone", draw));
    }

    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Watch the record and the code at a low threshold: on stacked phone layouts
      // the whole stage can be taller than the viewport.
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || evidence.classList.contains("in")) return;
            draw();
            evidence.classList.add("in");
            io.disconnect();
          });
        },
        { threshold: 0.15 },
      );
      io.observe(to);
      io.observe(from);
      cleanups.push(() => io.disconnect());
    } else {
      evidence.classList.add("in");
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
