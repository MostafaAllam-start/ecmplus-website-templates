"use client";

import { useEffect, useState } from "react";
import { PARTNERS_API, portalPartnerViews, type PartnerView, type PortalPartner } from "@/data/partners";
import { rich } from "@/lib/rich";

type State = { status: "loading" | "ready"; items: PartnerView[] };

const text = (s: string) => s.replace(/<[^>]+>/g, "");

/**
 * The partners to show. With NEXT_PUBLIC_PARTNERS_API set (the support portal build), they are read from
 * the portal, which lists the partners seeded for its ECM+ scope; skeletons stand in while that loads, and
 * the built-in list is used if the portal does not answer. Without it, the built-in list is used as it is.
 */
function usePartners(fallback: PartnerView[]): State {
  const [state, setState] = useState<State>(PARTNERS_API ? { status: "loading", items: [] } : { status: "ready", items: fallback });
  useEffect(() => {
    if (!PARTNERS_API) return;
    const ctl = new AbortController();
    fetch(PARTNERS_API, { signal: ctl.signal, headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? (r.json() as Promise<PortalPartner[]>) : Promise.reject(new Error(String(r.status)))))
      .then((rows) => setState({ status: "ready", items: rows.length ? portalPartnerViews(rows) : fallback }))
      .catch((e) => { if (e?.name !== "AbortError") setState({ status: "ready", items: fallback }); });
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

/** The header's Partners dropdown list. */
export function PartnersMenuList({ fallback, hrefBase }: { fallback: PartnerView[]; hrefBase: string }) {
  const { status, items } = usePartners(fallback);
  if (status === "loading") {
    return (
      <ul className="dropdown__list dropdown__list--plain" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i}>
            <span className="dropdown__skel" aria-hidden="true">
              <span className="skel skel--logo"></span>
              <span className="skel skel--line"></span>
              <span className="skel skel--line skel--short"></span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="dropdown__list dropdown__list--plain">
      {items.map((p) => (
        <li key={p.slug}>
          <a href={`${hrefBase}#${p.slug}`}>
            <span className="dropdown__logo" aria-hidden="true">
              {p.logo ? <img src={p.logo} alt="" width={56} height={36} loading="lazy" decoding="async" /> : <b>{text(p.short)}</b>}
            </span>
            <span className="dropdown__t">{rich(p.short)}</span>
            <span className="dropdown__d">{rich(p.role)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The partners page cards. */
export function PartnerCards({ fallback, visit }: { fallback: PartnerView[]; visit: string }) {
  const { status, items } = usePartners(fallback);
  if (status === "loading") {
    return (
      <ul className="pt-grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li className="pt-card" key={i} aria-hidden="true">
            <span className="skel skel--tile"></span>
            <span className="skel skel--line"></span>
            <span className="skel skel--line skel--short"></span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="pt-grid">
      {items.map((p) => (
        <li className="pt-card" id={p.slug} key={p.slug}>
          {p.logo ? (
            <div className="pt-logo"><img src={p.logo} alt={text(p.name)} width={440} height={440} loading="lazy" decoding="async" /></div>
          ) : (
            <div className="pt-logo pt-logo--name" aria-hidden="true">{text(p.short)}</div>
          )}
          <h3>{rich(p.name)}</h3>
          <p>{rich(p.role)}</p>
          {p.url ? <a className="pt-link" href={p.url} target="_blank" rel="noopener noreferrer">{visit}</a> : null}
        </li>
      ))}
    </ul>
  );
}
