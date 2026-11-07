"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Native <dialog> shell for the category flow: header (category dot + name, Replay, Close), body.
 * `open` drives showModal()/close(); Esc and a click on the backdrop close it. While open the page
 * carries `cap-modal-open` (scroll lock) and, on close, focus returns to the element that opened it.
 */
export default function CaptureModal({
  open, onClose, title, color, replayLabel, closeLabel, onReplay, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  color: string;
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
    if (!open) root.classList.remove("cap-modal-open");
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove("cap-modal-open"), []);

  return (
    <dialog
      ref={dlg}
      className="cap-modal"
      aria-labelledby="cap-modal-title"
      onClose={() => {
        document.documentElement.classList.remove("cap-modal-open");
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
            <span className="cap-cat__dot" style={{ background: color }} aria-hidden="true"></span>
            <span>{title}</span>
          </h2>
          <button type="button" className="btn btn--ghost-gold cap-modal__btn" onClick={onReplay}>{replayLabel}</button>
          <button type="button" className="btn btn--ghost-gold cap-modal__btn cap-modal__x" onClick={() => dlg.current?.close()} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
            <span className="cap-modal__xt">{closeLabel}</span>
          </button>
        </div>
        <div className="cap-modal__body">{children}</div>
      </div>
    </dialog>
  );
}
