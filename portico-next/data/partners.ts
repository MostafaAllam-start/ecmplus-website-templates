// Partners shown in the header menu and on /partners. Logos are the ones published on ecmpluss.com/partners
// (public/assets/partners); SAP and Odoo have no logo file here, so they render as name tiles.
import type { Lang } from "@/lib/site";

export type Bi = { en: string; ar: string };
const b = (en: string, ar: string): Bi => ({ en, ar });

export interface Partner {
  slug: string;
  name: Bi;
  short: Bi;
  role: Bi;
  logo?: string;
  url?: string;
}

export const PARTNERS: Partner[] = [
  { slug: "ctc", name: b("CTC MENA", "‹CTC MENA›"), short: b("CTC MENA", "‹CTC MENA›"), role: b("Exclusive agent and Arabic localization", "الوكيل الحصري والمسؤولة عن التعريب"), logo: "/assets/partners/ctc.png" },
  { slug: "spi-digital", name: b("SPI Digital UK", "‹SPI Digital UK›"), short: b("SPI Digital", "‹SPI Digital›"), role: b("Technology partner", "شريك تقني"), logo: "/assets/partners/spi-digital.png", url: "https://s-p-i-digital.uk/" },
  { slug: "cmz", name: b("CMZ (Content Management Zone)", "‹CMZ› (منطقة إدارة المحتوى)"), short: b("CMZ", "‹CMZ›"), role: b("Content management partner", "شريك إدارة المحتوى"), logo: "/assets/partners/cmz.png" },
  { slug: "etdp", name: b("Electrical Transmission & Distribution Partnership", "شراكة نقل الكهرباء وتوزيعها"), short: b("Electrical T&D Partnership", "شراكة نقل الكهرباء وتوزيعها"), role: b("Industry partner", "شريك قطاعي"), logo: "/assets/partners/etdp.png" },
  { slug: "sap", name: b("SAP", "‹SAP›"), short: b("SAP", "‹SAP›"), role: b("ERP partner", "شريك أنظمة تخطيط الموارد"), logo: "/assets/partners/sap.svg" },
  { slug: "odoo", name: b("Odoo", "‹Odoo›"), short: b("Odoo", "‹Odoo›"), role: b("ERP partner", "شريك أنظمة تخطيط الموارد"), logo: "/assets/partners/odoo.svg" },
];

export const PARTNERS_PAGE = {
  en: {
    name: "Partners",
    metaTitle: "Partners — ECM Plus",
    description: "The companies that deliver, localize and integrate ECM Plus: CTC MENA, SPI Digital UK, CMZ, the Electrical Transmission & Distribution Partnership, SAP and Odoo.",
    eyebrow: "Partners",
    title: "The Partners Behind ECM+",
    lead: "ECM+ is delivered, localized and connected to other business systems with the help of these partners.",
    visit: "Visit website",
  },
  ar: {
    name: "الشركاء",
    metaTitle: "الشركاء — ECM Plus",
    description: "الشركات التي تقدّم ECM Plus وتعرّبه وتربطه بالأنظمة الأخرى: CTC MENA وSPI Digital UK وCMZ وشراكة نقل الكهرباء وتوزيعها وSAP وOdoo.",
    eyebrow: "الشركاء",
    title: "الشركاء الذين يقفون خلف ‹ECM+›",
    lead: "تُقدَّم ‹ECM+› وتُعرَّب وتُربط بأنظمة الأعمال الأخرى بمساعدة هؤلاء الشركاء.",
    visit: "زيارة الموقع",
  },
};

export const fmt = (s: Bi, lang: Lang): string => (lang === "ar" ? s.ar.replace(/‹([^›]*)›/g, "<bdi>$1</bdi>") : s.en);
export const plain = (s: Bi | string, lang: Lang): string => (typeof s === "string" ? s : (lang === "ar" ? s.ar : s.en).replace(/[‹›]/g, ""));

/** A partner as the header menu and the partners page show it (strings already in the page language). */
export interface PartnerView {
  slug: string;
  /** Full name; Latin names in Arabic copy are wrapped in <bdi>. */
  name: string;
  /** Short name for the menu. */
  short: string;
  role: string;
  /** A ready-to-use image src (site assets get the base path, portal files stay root-relative). */
  logo?: string;
  url?: string;
}

/** Where the portal lists the partners seeded for its ECM+ scope. Empty: the site shows its built-in list. */
export const PARTNERS_API = process.env.NEXT_PUBLIC_PARTNERS_API || "";

/** The built-in list, resolved for a language. `base` turns an asset path into a src. */
export function staticPartnerViews(lang: Lang, base: (p: string) => string): PartnerView[] {
  return PARTNERS.map((p) => ({
    slug: p.slug,
    name: fmt(p.name, lang),
    short: fmt(p.short, lang),
    role: fmt(p.role, lang),
    logo: p.logo ? base(p.logo) : undefined,
    url: p.url,
  }));
}

/** A partner row from the portal API. */
export interface PortalPartner { id: number; name: string; logo: string; details: string }

export function portalPartnerViews(rows: PortalPartner[]): PartnerView[] {
  return rows.map((r) => ({ slug: `partner-${r.id}`, name: r.name, short: r.name, role: r.details, logo: r.logo || undefined }));
}
