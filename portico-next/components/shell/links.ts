import { homePath, pagePath, withBase, type Lang } from "@/lib/site";

/** "documents/" style targets: a page under the language's home. */
const PAGE_TARGET = /^([a-z]+)\/$/;

/**
 * Resolves the link targets written in the shell dictionaries for a given page.
 * `current` is "home" or a page slug. On a sub-page, in-page anchors (#suite, #contact)
 * point back at the home page; a link to the page itself carries aria-current="page".
 */
export function createLinker(lang: Lang, current: string) {
  const onHome = current === "home";
  return {
    href(target: string): string {
      if (target.startsWith("#")) {
        return target === "#main" || onHome ? target : `${withBase(homePath(lang))}${target}`;
      }
      const page = PAGE_TARGET.exec(target);
      if (page) return withBase(pagePath(lang, page[1]));
      return target; // /support, /privacy, https://…: not part of this site's pages
    },
    isCurrent(target: string): boolean {
      const page = PAGE_TARGET.exec(target);
      return !onHome && !!page && page[1] === current;
    },
    ariaCurrent(target: string): "page" | undefined {
      return this.isCurrent(target) ? "page" : undefined;
    },
  };
}

export type Linker = ReturnType<typeof createLinker>;
