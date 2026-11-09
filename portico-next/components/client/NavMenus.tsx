"use client";

import { useEffect } from "react";

/**
 * Header behaviour ported from main.js: the mobile disclosure and the click-toggled
 * dropdowns (Suite, Solutions). The markup is rendered by the server Header; this
 * island only toggles `is-open` and the aria state, so the page reads without it.
 */
export default function NavMenus() {
  useEffect(() => {
    const doc = document;
    const header = doc.querySelector<HTMLElement>(".site-header");
    const navToggle = doc.querySelector<HTMLElement>(".nav-toggle");
    const navPanel = navToggle ? doc.getElementById(navToggle.getAttribute("aria-controls") || "") : null;
    const desktop = window.matchMedia("(min-width: 1100px)");
    let navOpen = false;
    let openItem: HTMLElement | null = null;
    const cleanups: Array<() => void> = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const on = (t: EventTarget, type: string, fn: (e: any) => void) => {
      t.addEventListener(type, fn);
      cleanups.push(() => t.removeEventListener(type, fn));
    };

    const triggerOf = (item: HTMLElement) => item.querySelector<HTMLElement>(".nav__trigger");

    function closeMenu(item: HTMLElement | null, returnFocus: boolean) {
      if (!item) return;
      const button = triggerOf(item);
      item.classList.remove("is-open");
      if (button) {
        button.setAttribute("aria-expanded", "false");
        if (returnFocus) button.focus();
      }
      if (openItem === item) openItem = null;
    }

    function openMenu(item: HTMLElement) {
      if (openItem && openItem !== item) closeMenu(openItem, false);
      item.classList.add("is-open");
      triggerOf(item)?.setAttribute("aria-expanded", "true");
      openItem = item;
    }

    function setNav(open: boolean, returnFocus: boolean) {
      if (!navToggle || !navPanel) return;
      navOpen = open;
      navToggle.setAttribute("aria-expanded", String(open));
      navPanel.classList.toggle("is-open", open);
      if (!open) {
        if (openItem) closeMenu(openItem, false);
        if (returnFocus) navToggle.focus();
      }
    }

    doc.querySelectorAll<HTMLElement>("[data-menu]").forEach((item) => {
      const button = triggerOf(item);
      const panel = button ? doc.getElementById(button.getAttribute("aria-controls") || "") : null;
      if (!button || !panel) return;

      on(button, "click", () => {
        if (item.classList.contains("is-open")) closeMenu(item, false);
        else openMenu(item);
      });

      // On desktop, tabbing out of an open menu closes it.
      on(item, "focusout", (event: FocusEvent) => {
        if (!desktop.matches) return;
        const next = event.relatedTarget as Node | null;
        if (next && !item.contains(next)) closeMenu(item, false);
      });

      // Following a link inside the menu closes it (and the mobile panel).
      on(panel, "click", (event: MouseEvent) => {
        if ((event.target as Element).closest("a")) {
          closeMenu(item, false);
          setNav(false, false);
        }
      });
    });

    if (navToggle && navPanel) {
      on(navToggle, "click", () => setNav(!navOpen, false));
      on(navPanel, "click", (event: MouseEvent) => {
        const link = (event.target as Element).closest("a");
        if (link && !link.closest(".menu-panel")) setNav(false, false);
      });
    }

    on(doc, "keydown", (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openItem) {
        closeMenu(openItem, true);
        event.preventDefault();
      } else if (navOpen) {
        setNav(false, true);
        event.preventDefault();
      }
    });

    on(doc, "click", (event: MouseEvent) => {
      const target = event.target as Node;
      if (openItem && !openItem.contains(target)) closeMenu(openItem, false);
      if (navOpen && header && !header.contains(target)) setNav(false, false);
    });

    on(desktop, "change", () => {
      setNav(false, false);
      if (openItem) closeMenu(openItem, false);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
