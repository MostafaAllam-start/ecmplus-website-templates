import type { ReactNode } from "react";
import type { Lang } from "@/lib/site";
import Reveal from "../client/Reveal";
import Footer from "./Footer";
import Header from "./Header";
import { createLinker } from "./links";
import { SHELL } from "./dict";
import Notice from "./Notice";
import SpriteSheet from "./SpriteSheet";

/**
 * Page chrome shared by every Portico page: skip link, icon sprite, announcement,
 * header, <main> content and footer. `current` is "home" or the page slug.
 */
export default function Shell({ lang, current, children }: { lang: Lang; current: string; children: ReactNode }) {
  const links = createLinker(lang, current);
  return (
    <>
      <a className="skip-link" href="#main">{SHELL[lang].skip}</a>
      <SpriteSheet />
      <Notice lang={lang} links={links} />
      <Header lang={lang} current={current} links={links} />
      {children}
      <Footer lang={lang} links={links} />
      <Reveal />
    </>
  );
}
