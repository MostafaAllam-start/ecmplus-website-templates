"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { SAMPLES, SAMPLE_KEYS, factoryNames, fmt, plain } from "@/data/capture";
import { DMS, DMS_CODES2 } from "@/data/capture-tools";
import { withBase, type Lang } from "@/lib/site";
import type { CodeMode } from "./CaptureDocs";

const MARK = withBase("/assets/brand/ecmplus-mark.png");
interface FileRow { id: string; cat: number; n: number; name: string; code: string; type: string }

/** "ECM+ Documents · Archive": a mock of the Documents module's folder explorer showing the documents the factory filed. */
export default function CaptureDms({ lang, start, fid: startFid, onOpen }: { lang: Lang; start: number; code?: CodeMode; fid?: string; onOpen: (cat: number, folder: number, fid: string) => void }) {
  const t = (b: { en: string; ar: string }) => fmt(b, lang);
  const p = (b: { en: string; ar: string }) => plain(b, lang);
  const cats = factoryNames(lang);
  const files = useMemo<FileRow[]>(() => SAMPLE_KEYS.flatMap((k, c) => [0, 1].map((n) => ({
    id: `${c}-${n}`, cat: c, n, name: `${p(SAMPLES[k].name)} ${n + 1}`, code: n ? DMS_CODES2[c] : SAMPLES[k].code, type: p(SAMPLES[k].types[0]),
  }))), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const [folder, setFolder] = useState(start); // -1 = whole Archive
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  const [fid, setFid] = useState(startFid ?? `${start}-0`);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (startFid) listRef.current?.querySelector<HTMLElement>(`[data-fid="${startFid}"]`)?.focus(); }, [startFid]);
  const treeRef = useRef<HTMLUListElement>(null);

  const query = q.trim().toLowerCase();
  const list = files.filter((f) => (query ? `${f.name} ${f.code} ${f.type}`.toLowerCase().includes(query) : folder < 0 || f.cat === folder));
  const openRow = (f: FileRow) => { setFid(f.id); onOpen(f.cat, folder, f.id); };
  const items = [-1, ...(open ? [0, 1, 2, 3, 4] : [])];

  const pickFolder = (c: number) => { setFolder(c); setQ(""); const f = files.find((x) => x.cat === c); if (f) setFid(f.id); };
  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const cur = items.indexOf(Number((document.activeElement as HTMLElement | null)?.dataset.f ?? NaN));
    const focus = (n: number) => { treeRef.current?.querySelector<HTMLElement>(`[data-f="${items[n]}"]`)?.focus(); };
    const rtl = lang === "ar";
    const expand = rtl ? "ArrowLeft" : "ArrowRight";
    const collapse = rtl ? "ArrowRight" : "ArrowLeft";
    if (cur < 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); focus(Math.min(cur + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focus(Math.max(cur - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); focus(0); }
    else if (e.key === "End") { e.preventDefault(); focus(items.length - 1); }
    else if (e.key === expand && items[cur] === -1) { e.preventDefault(); setOpen(true); }
    else if (e.key === collapse && items[cur] === -1) { e.preventDefault(); setOpen(false); }
    else if (e.key === collapse && items[cur] >= 0) { e.preventDefault(); focus(0); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (items[cur] < 0) { setFolder(-1); setQ(""); } else pickFolder(items[cur]); }
  };

  const crumb = query ? p(DMS.results) : folder < 0 ? null : cats[folder];
  return (
    <div className="dms">
      <div className="dms__top">
        <span className="dms__brand"><img src={MARK} alt="" width="28" height="28" /><b>ECM+</b><span>{t(DMS.module)}</span></span>
        <nav className="dms__crumb" aria-label={p(DMS.archive)}>
          <span>{t(DMS.archive)}</span>{crumb ? <><i aria-hidden="true">›</i><span aria-current="page">{crumb}</span></> : null}
        </nav>
        <input className="dms__search" type="search" value={q} placeholder={p(DMS.search)} aria-label={p(DMS.search)} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="dms__body">
        <section className="dms__tree" aria-label={p(DMS.folders)}>
          <ul role="tree" aria-label={p(DMS.folders)} ref={treeRef} onKeyDown={onKey}>
            <li role="treeitem" aria-expanded={open} aria-selected={folder < 0 && !query}>
              <button type="button" data-f="-1" tabIndex={0} onClick={() => { setFolder(-1); setQ(""); setOpen((v) => !v || folder !== -1); }}>
                <span className="dms__ic dms__ic--root" aria-hidden="true"></span>{t(DMS.archive)}<em>{files.length}</em>
              </button>
              {open && (
                <ul role="group">
                  {cats.map((name, c) => (
                    <li role="treeitem" aria-selected={folder === c && !query} key={c}>
                      <button type="button" data-f={c} tabIndex={-1} onClick={() => pickFolder(c)} style={{ ["--cat" as string]: `var(--cap-cat${c})` }}>
                        <span className="dms__ic" aria-hidden="true"></span>{name}<em>{files.filter((f) => f.cat === c).length}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </section>
        <section className="dms__list" aria-label={p(DMS.results)}>
          <p className="dms__count">{p(DMS.count).replace("{n}", String(list.length))}</p>
          <div className="dms__scroll" ref={listRef}>
            <table>
              <thead><tr>{(["name", "code", "type", "date"] as const).map((c) => <th key={c} scope="col">{t(DMS.cols[c])}</th>)}</tr></thead>
              <tbody>
                {list.map((f) => (
                  <tr
                    key={f.id} data-fid={f.id} tabIndex={0} aria-label={f.name} aria-haspopup="dialog" className={f.id === fid ? "is-sel" : ""}
                    onClick={() => openRow(f)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openRow(f); } }}
                  >
                    <td><span className="dms__file"><span className="dms__dot" style={{ background: `var(--cap-cat${f.cat})` }} aria-hidden="true"></span>{f.name}</span></td>
                    <td><bdi>{f.code}</bdi></td>
                    <td>{f.type}</td>
                    <td><bdi>{DMS.date}</bdi></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="dms__empty">{t(DMS.empty)}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
