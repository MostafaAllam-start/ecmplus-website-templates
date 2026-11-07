"use client";

import { useEffect } from "react";

/**
 * Contact helpers: links carrying data-prefill (in the page and the footer) pre-fill an
 * empty #demo-message so the request lands with context (ported from main.js).
 */
export default function ContactPrefill() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const prefill = (event.target as Element | null)?.closest?.("[data-prefill]");
      const message = document.getElementById("demo-message") as HTMLTextAreaElement | null;
      if (prefill && message && !message.value.trim()) message.value = prefill.getAttribute("data-prefill") ?? "";
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
