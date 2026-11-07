import { createElement, Fragment, type ReactNode } from "react";
import type { Linker } from "../shell/links";

/**
 * Home copy strings carry a small amount of inline markup: <bdi> for Latin names, <span lang dir>
 * for the other language, <mark>, <strong>, and <a> links (a bare "documents/" target is resolved
 * for the page's language). Turn them into real elements: no dangerouslySetInnerHTML.
 */
const TAG = /<(\/?)([a-z][a-z0-9]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>/g;
const ATTR = /([^\s=>/]+)(?:="([^"]*)")?/g;
const RENAME: Record<string, string> = { class: "className", for: "htmlFor" };

function props(raw: string, links: Linker): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const m of raw.matchAll(ATTR)) {
    const name = RENAME[m[1]] ?? m[1];
    const value = m[2] === undefined ? true : m[2].replace(/&quot;/g, '"');
    out[name] = name === "href" && typeof value === "string" && /^[a-z-]+\/$/.test(value) ? links.href(value) : value;
  }
  return out;
}

export function rich(text: string, links: Linker): ReactNode {
  if (!text.includes("<")) return text;
  type Frame = { tag: string; props: Record<string, string | boolean>; kids: ReactNode[] };
  const root: Frame = { tag: "", props: {}, kids: [] };
  const stack: Frame[] = [root];
  let last = 0;
  let key = 0;
  const top = () => stack[stack.length - 1];
  const close = () => {
    const f = stack.pop() as Frame;
    top().kids.push(createElement(f.tag, { ...f.props, key: key++ }, ...f.kids));
  };
  for (const m of text.matchAll(TAG)) {
    if (m.index > last) top().kids.push(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) close();
    else if (m[2] === "br" || m[4]) top().kids.push(createElement(m[2], { key: key++ }));
    else stack.push({ tag: m[2], props: props(m[3], links), kids: [] });
  }
  if (last < text.length) top().kids.push(text.slice(last));
  while (stack.length > 1) close();
  return createElement(Fragment, null, ...root.kids.map((k, i) => (typeof k === "string" ? createElement(Fragment, { key: `t${i}` }, k) : k)));
}
