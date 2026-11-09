import type { Lang } from "@/lib/site";
import type { Linker } from "../shell/links";
import type { HomeCopy } from "./copy";

/** Props every home section receives: its slice of the copy dictionary, the link resolver and the language. */
export type SectionProps<S extends keyof HomeCopy> = {
  t: HomeCopy[S];
  links: Linker;
  lang: Lang;
};
