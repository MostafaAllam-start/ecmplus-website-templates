"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "ecmplus-theme";
const THEME_COLORS = { light: "#F4F2EE", dark: "#10141B" } as const;
type Theme = "light" | "dark";

const listeners = new Set<() => void>();
// Set when the visitor uses a toggle on this page (kept in memory in case storage is blocked).
let explicitTheme = false;
let storageBound = false;

const current = (): Theme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!storageBound) {
    storageBound = true;
    // A choice made in another tab or template follows here, unless this page made its own.
    window.addEventListener("storage", (event) => {
      if (event.key !== THEME_KEY || explicitTheme) return;
      apply(event.newValue === "dark" ? "dark" : "light");
    });
  }
  // The pre-paint head script may have set data-theme before hydration.
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[current()]);
  return () => {
    listeners.delete(listener);
  };
}

/** Both header toggles share the one document-level theme; the name stays fixed, aria-pressed carries state. */
export default function ThemeToggle({ label }: { label: string }) {
  const theme = useSyncExternalStore(subscribe, current, () => "light" as Theme);
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-pressed={theme === "dark"}
      aria-label={label}
      title={label}
      onClick={() => {
        const next: Theme = current() === "dark" ? "light" : "dark";
        explicitTheme = true;
        apply(next);
        try {
          window.localStorage.setItem(THEME_KEY, next);
        } catch {
          // Storage blocked: the choice lasts for this page view.
        }
      }}
    >
      <svg className="icon theme-toggle__sun" aria-hidden="true" focusable="false"><use href="#i-sun" /></svg>
      <svg className="icon theme-toggle__moon" aria-hidden="true" focusable="false"><use href="#i-moon" /></svg>
    </button>
  );
}
