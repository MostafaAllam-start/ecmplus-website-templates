"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Toaster, { type Outcome, type ToastItem } from "./Toast";

/**
 * Demo request, sent in the background so the page stays where it is, with the outcome shown as a
 * toast (ported from main.js). The handler at the form's action answers { "ok": true } (or
 * { "ok": false } for invalid input) when the request asks for JSON. Without JS the server-rendered
 * form posts normally; a handler that then redirects back with ?request=sent|invalid still gets its
 * toast here. The <form id="demo-form"> itself is rendered by the Contact section.
 */
export default function DemoForm({ lang }: { lang: "en" | "ar" }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((outcome: Outcome) => {
    setToasts((list) => [...list, { id: nextId.current++, outcome }]);
  }, []);
  const gone = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  useEffect(() => {
    // Back from a redirect-style handler: show its outcome once, then drop the flag so a reload doesn't repeat it.
    const params = new URLSearchParams(window.location.search);
    const redirected = params.get("request");
    if (redirected === "sent" || redirected === "invalid") {
      params.delete("request");
      const query = params.toString();
      history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
      show(redirected);
    }

    const form = document.getElementById("demo-form") as HTMLFormElement | null;
    if (!form || !window.fetch || !window.FormData) return;
    const onSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (submit) submit.disabled = true;
      form.setAttribute("aria-busy", "true");
      let outcome: Outcome;
      try {
        const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        let data: { ok?: boolean } | null = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        // A handler that redirects instead of answering JSON still reports its outcome in the final URL.
        const flag = /[?&]request=(sent|invalid)\b/.exec(response.url || "");
        outcome = data ? (data.ok ? "sent" : "invalid") : flag ? (flag[1] as Outcome) : "failed";
        if (outcome === "sent") form.reset();
      } catch {
        outcome = "failed";
      }
      show(outcome);
      if (submit) submit.disabled = false;
      form.removeAttribute("aria-busy");
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [show]);

  return <Toaster lang={lang} items={toasts} onGone={gone} />;
}
