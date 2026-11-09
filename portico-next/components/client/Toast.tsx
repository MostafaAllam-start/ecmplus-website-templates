"use client";

import { useEffect, useRef, useState } from "react";

export type Outcome = "sent" | "invalid" | "failed";

export type ToastItem = { id: number; outcome: Outcome };

// The portal's icons: a check in a circle, and an X in an octagon.
const ICON_OK = (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>
);
const ICON_ERROR = (
  <>
    <path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </>
);

export const TOAST_COPY = {
  en: {
    label: "Notifications",
    sent: "Thank you. Your request has been received, and our team will contact you shortly.",
    invalid: "We couldn't send your request. Please check the required fields and try again.",
    failed: "We couldn't send your request right now. Please try again later.",
  },
  ar: {
    label: "الإشعارات",
    sent: "شكراً لك، تم استلام طلبك وسيتواصل معك فريقنا قريباً.",
    invalid: "تعذّر إرسال الطلب. يرجى التحقق من الحقول المطلوبة والمحاولة مرة أخرى.",
    failed: "تعذّر إرسال الطلب حالياً. يرجى المحاولة لاحقاً.",
  },
} as const;

const motionOK = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One toast: fades in, stays 4 s (paused while the pointer is over it), then fades out and goes. */
function Toast({ item, text, onGone }: { item: ToastItem; text: string; onGone: (id: number) => void }) {
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const remaining = useRef(4000);
  const started = useRef(0);

  const dismiss = () => {
    setShown(false);
    setTimeout(() => onGone(item.id), motionOK() ? 400 : 0);
  };

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setShown(true));
    });
    started.current = Date.now();
    timer.current = setTimeout(dismiss, remaining.current);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <li
      className={`toast${shown ? " is-shown" : ""}`}
      role={item.outcome === "sent" ? "status" : "alert"}
      onMouseEnter={() => {
        clearTimeout(timer.current);
        remaining.current -= Date.now() - started.current;
      }}
      onMouseLeave={() => {
        started.current = Date.now();
        timer.current = setTimeout(dismiss, Math.max(remaining.current, 1000));
      }}
    >
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {item.outcome === "sent" ? ICON_OK : ICON_ERROR}
      </svg>
      <span>{text}</span>
    </li>
  );
}

/** The toast list; nothing is rendered until the first toast. */
export default function Toaster({ lang, items, onGone }: { lang: "en" | "ar"; items: ToastItem[]; onGone: (id: number) => void }) {
  if (!items.length) return null;
  const copy = TOAST_COPY[lang];
  return (
    <ol className="toaster" aria-label={copy.label}>
      {items.map((item) => (
        <Toast key={item.id} item={item} text={copy[item.outcome]} onGone={onGone} />
      ))}
    </ol>
  );
}
