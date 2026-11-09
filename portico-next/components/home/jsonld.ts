import { SITE, absUrl, type Lang } from "@/lib/site";

const LOGO = `${SITE}/assets/brand/ecmplus-ai-logo.png`;

/** Organization, CTC MENA and SoftwareApplication graph of the home page (from the home <head>). */
export function homeJsonLd(lang: Lang) {
  const ar = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "ECM Plus",
        url: `${SITE}/`,
        logo: LOGO,
        address: { "@type": "PostalAddress", addressCountry: "CA" },
      },
      {
        "@type": "Organization",
        "@id": "https://ctcmena.com/#organization",
        name: "CTC MENA",
        url: "https://ctcmena.com",
        description: ar
          ? "الوكيل الحصري لشركة ECM Plus والمسؤول عن تعريب المنتج."
          : "Exclusive agent for ECM Plus, responsible for its Arabization.",
      },
      {
        "@type": "SoftwareApplication",
        name: "ECM+ Business Suite",
        alternateName: "ECM Plus",
        url: absUrl(lang),
        image: LOGO,
        description: ar
          ? "إدارة الوثائق والمراسلات الرسمية وأتمتة الإجراءات وإدارة الاجتماعات في منظومة واحدة ثنائية اللغة تعمل على خوادم المؤسسة."
          : "Document management, official correspondence, process automation and meeting management in one bilingual suite, hosted on the organization's own servers.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web browser",
        inLanguage: ar ? ["ar", "en"] : ["en", "ar"],
        publisher: { "@id": `${SITE}/#organization` },
      },
    ],
  };
}
