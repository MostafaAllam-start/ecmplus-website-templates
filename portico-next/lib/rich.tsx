import { Fragment, type ReactNode } from "react";

/**
 * Copy strings carry one piece of inline markup: Latin names wrapped in <bdi>.
 * Turn them into real elements (no wrapper element, no dangerouslySetInnerHTML).
 */
export function rich(text: string): ReactNode {
  if (!text.includes("<bdi>")) return text;
  const parts = text.split(/(<bdi>[\s\S]*?<\/bdi>)/);
  return parts.map((part, i) => {
    const m = /^<bdi>([\s\S]*?)<\/bdi>$/.exec(part);
    return m ? <bdi key={i}>{m[1]}</bdi> : <Fragment key={i}>{part}</Fragment>;
  });
}

/** Strip inline markup (for metadata and JSON-LD). */
export const strip = (s: string): string => s.replace(/<[^>]+>/g, "");
