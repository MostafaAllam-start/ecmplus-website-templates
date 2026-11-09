"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Native <dialog> shell for the category flow: header (gold bar + category name, Replay, Close; same look as the tool dialogs), body.
 * `open` drives showModal()/close(); Esc and a click on the backdrop close it. While open the page
 * carries `cap-modal-open` (scroll lock) and, on close, focus returns to the element that opened it.
 */
export default function CaptureModal({
  open, onClose, title, replayLabel, closeLabel, onReplay, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  replayLabel: string;
  closeLabel: string;
  onReplay: () => void;
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
      root.classList.add("cap-modal-open");
    } else if (!open && d.open) {
      d.close();
    }
    if (!open && !document.querySelector("dialog[open]")) root.classList.remove("cap-modal-open");
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove("cap-modal-open"), []);

  return (
    <dialog
      ref={dlg}
      className="cap-modal cap-tool"
      aria-labelledby="cap-modal-title"
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
          <h2 className="cap-modal__title" id="cap-modal-title">
            <span>{title}</span>
          </h2>
          <button type="button" className="btn btn--ghost-gold cap-modal__btn cap-ibtn" onClick={onReplay} aria-label={replayLabel} data-tip={replayLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5" /></svg>
          </button>
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
