"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native <dialog> shell for the factory's tool dialogs (same look as the category modal: title, close, scrolling body). */
export default function CaptureDialog({
  open, onClose, title, titleId, closeLabel, className = "", children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  closeLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    const root = document.documentElement;
    if (open && !d.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      d.showModal();
      d.querySelector(".cap-modal__body")?.scrollTo(0, 0);
      root.classList.add("cap-modal-open");
    } else if (!open && d.open) {
      d.close();
    }
    if (!open && !document.querySelector("dialog[open]")) root.classList.remove("cap-modal-open");
  }, [open]);
  useEffect(() => () => { if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("cap-modal-open"); }, []);

  return (
    <dialog
      ref={dlg}
      className={`cap-modal cap-tool ${className}`}
      aria-labelledby={titleId}
      onClose={() => {
        if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("cap-modal-open");
        const o = opener.current;
        opener.current = null;
        if (o?.isConnected) o.focus();
        onClose();
      }}
      onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
    >
      <div className="cap-modal__box">
        <div className="cap-modal__bar">
          <h2 className="cap-modal__title" id={titleId}>{title}</h2>
          <button type="button" className="btn btn--ghost-gold cap-modal__btn cap-modal__x cap-ibtn" onClick={() => dlg.current?.close()} aria-label={closeLabel} data-tip={closeLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
            <span className="cap-modal__xt">{closeLabel}</span>
          </button>
        </div>
        <div className="cap-modal__body">{children}</div>
      </div>
    </dialog>
  );
}
