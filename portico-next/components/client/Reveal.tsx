"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveal on scroll, ported from main.js: plates fade up with a 40ms stagger between
 * siblings (CSS reads --i). Items inside a [data-reveal-group] reveal together when
 * the group comes into view. `reveal` is added when this runs and `reveal-ready` at
 * the end; if anything throws first, the CSS fail-safe shows everything after 2.5s.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionOK = () => !reduceMotion.matches;
    const all = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel));

    const revealEls = all("[data-reveal]");
    let io: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window && motionOK()) {
      const counts = new Map<Element | null, number>();
      revealEls.forEach((el) => {
        const parent = el.parentElement;
        const n = counts.get(parent) || 0;
        el.style.setProperty("--i", String(n));
        counts.set(parent, n + 1);
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const target = entry.target as HTMLElement;
            if (target.hasAttribute("data-reveal-group")) {
              target.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
            } else {
              target.classList.add("in");
            }
            observer.unobserve(target);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.12 },
      );
      io = observer;
      revealEls.forEach((el) => {
        if (!el.closest("[data-reveal-group]")) observer.observe(el);
      });
      all("[data-reveal-group]").forEach((group) => observer.observe(group));
    } else {
      revealEls.forEach((el) => el.classList.add("in"));
    }

    // Photo reveal: with scroll-driven animation, photos below the fold settle in as they enter.
    if (window.CSS?.supports?.("animation-timeline: view()") && motionOK()) {
      const viewport = window.innerHeight || root.clientHeight;
      all(".ph--reveal").forEach((photo) => {
        if (photo.getBoundingClientRect().top >= viewport) photo.classList.add("is-pending");
      });
    }

    root.classList.add("reveal-ready");
    return () => io?.disconnect();
  }, [pathname]);

  return null;
}
