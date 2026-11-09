"use client";

import { useEffect } from "react";

/** Sector scroller: a keyboard stop (tabindex 0) only while it actually scrolls (ported from main.js). */
export default function SectorScroller() {
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".sectors__scroller");
    if (!scroller) return;
    const sync = () => {
      if (scroller.scrollWidth > scroller.clientWidth + 1) scroller.setAttribute("tabindex", "0");
      else scroller.removeAttribute("tabindex");
    };
    sync();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(sync);
      ro.observe(scroller);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return null;
}
