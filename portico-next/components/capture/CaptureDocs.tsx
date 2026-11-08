import type { ReactNode } from "react";
import { DEMO, SAMPLES, plain, type SampleKey, type ZoneKey } from "@/data/capture";
import { withBase, type Lang } from "@/lib/site";

export type CodeMode = "barcode" | "qr";
const MARK = withBase("/assets/brand/ecmplus-mark.png"); // the ECM+ logo mark carried by both codes

// Decorative codes (a sample pattern, not an encoded value).
function barcodePath(): { d: string; w: number } {
  const w = [2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 2];
  let x = 0;
  let d = "";
  w.forEach((n, i) => { if (i % 2 === 0) d += `M${x} 0h${n}v20h-${n}z`; x += n; });
  return { d, w: x };
}
const BAR = barcodePath();

export function Barcode() {
  return (
    <svg className="cap-barcode" viewBox={`0 0 ${BAR.w} 35`} aria-hidden="true" focusable="false">
      <path d={BAR.d} />
      <image href={MARK} x={BAR.w / 2 - 7} y="21" width="14" height="14" />
    </svg>
  );
}

const qrCache = new Map<number, string>();
function qrPath(seed: number): string {
  const hit = qrCache.get(seed);
  if (hit) return hit;
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % 100 < 48; };
  const N = 21;
  let d = "";
  const finder = (r: number, c: number): boolean | null =>
    r < 7 && c < 7 ? (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) : null;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on: boolean;
    const f = finder(r, c) ?? finder(r, N - 1 - c) ?? finder(N - 1 - r, c);
    if (f !== null) on = f;
    else {
      const inQuiet = (r === 7 || c === 7 || r === N - 8 || c === N - 8) && (r < 8 || c < 8 || (r >= N - 8 && c < 8) || (c >= N - 8 && r < 8));
      on = inQuiet ? false : rnd();
    }
    if (on) d += `M${c} ${r}h1v1h-1z`;
  }
  qrCache.set(seed, d);
  return d;
}
export function Qr({ seed }: { seed: number }) {
  // ECM+ mark on a white quiet-zone square: 7.4 of 21 modules per side (about 12% of the area)
  return (
    <svg className="cap-qr" viewBox="0 0 21 21" aria-hidden="true" focusable="false">
      <path d={qrPath(seed)} />
      <rect x="6.8" y="6.8" width="7.4" height="7.4" rx="1.4" className="cap-qr__zone" />
      <image href={MARK} x="7.2" y="7.2" width="6.6" height="6.6" />
    </svg>
  );
}

/** The code stamp: barcode + QR + number. `lg` is the large stamp of the "Code stamp" step. */
export function Stamp({ seed, code, lg, dataCode, mode = "barcode" }: { seed: number; code: string; lg?: boolean; dataCode?: boolean; mode?: CodeMode }) {
  return (
    <span className={`cap-stamp${lg ? " cap-stamp--lg" : ""}`} data-kind={mode} aria-hidden="true">
      {mode === "qr" ? <Qr seed={seed} /> : <Barcode />}<bdi className="cap-stamp__no" {...(dataCode ? { "data-code": "" } : {})}>{code}</bdi>
    </span>
  );
}

const SIG = (
  <svg className="cap-sig" viewBox="0 0 64 24" aria-hidden="true" focusable="false"><path d="M3 17c4-.5 5.7-11 8.8-11 2.6 0 .3 8.4 3.2 8.4 2.3 0 3.2-5 5.5-5 1.6 0 1.8 2.7 3.4 2.7 1.1 0 2.1-.8 4.8-2.7M3 21.5h34" /></svg>
);

function Shell({ k, lang, hit, rtl, code, children }: { k: SampleKey; lang: Lang; hit: ZoneKey | ""; rtl?: boolean; code: CodeMode; children: ReactNode }) {
  const s = SAMPLES[k];
  const label = plain(DEMO.docLabel(s.name), lang);
  return (
    <div className="cap-doc" data-for={k} role="group" aria-label={label}>
      <div className="cap-doc__page" lang={rtl ? "ar" : "en"} dir={rtl ? "rtl" : "ltr"}>
        {children}
        <div className="cap-doc__foot">
          <div className={`cap-z${hit === "sign" ? " is-hit" : ""}`} data-zone="sign">{SIG}<span className="cap-doc__sigcap">{plain(DEMO.signature, lang)}</span></div>
          <div className={`cap-z cap-stampbox${hit === "code" ? " is-hit" : ""}`} data-zone="code"><Stamp seed={s.seed} code={s.code} mode={code} /></div>
        </div>
        <span className="cap-doc__sweep" aria-hidden="true"></span>
      </div>
      <p className="cap-doc__cap">{plain(DEMO.pageOf(s.pages), lang)}</p>
    </div>
  );
}

/** A sample paper document. Zones carry data-zone so the demo can highlight them. */
export default function CaptureDoc({ k, lang, hit, code = "barcode" }: { k: SampleKey; lang: Lang; hit: ZoneKey | ""; code?: CodeMode }) {
  const z = (zone: ZoneKey, extra = "") => ({ className: `cap-z${extra ? ` ${extra}` : ""}${hit === zone ? " is-hit" : ""}`, "data-zone": zone });
  switch (k) {
    case "invoice":
      return (
        <Shell k={k} lang={lang} hit={hit} code={code}>
          <div {...z("head", "cap-doc__head")}><div><b className="cap-doc__org">Al-Rawabi Office Supplies Co.</b><b className="cap-doc__org" lang="ar" dir="rtl">شركة الروابي للتجهيزات المكتبية</b></div><div className="cap-doc__kind">TAX INVOICE<span lang="ar" dir="rtl">فاتورة ضريبية</span></div></div>
          <div {...z("ref", "cap-doc__refs")}><span>Invoice No. <b>INV-2026-0147</b></span><span>Date <b>12 Mar 2026</b></span><span>Due <b>11 Apr 2026</b></span><span>Bill to <b>Northgate Holding</b></span></div>
          <div {...z("body")}><table className="cap-doc__tbl"><tbody><tr><th>Item</th><th>Qty</th><th>Amount</th></tr><tr><td>Printer paper, A4 (box)</td><td>120</td><td>5,040.00</td></tr><tr><td>Toner cartridges</td><td>18</td><td>6,480.00</td></tr><tr><td>Office chairs</td><td>12</td><td>4,980.00</td></tr></tbody></table></div>
          <div {...z("total", "cap-doc__tot")}><span>Subtotal<b>16,500.00</b></span><span>VAT 15%<b>2,475.00</b></span><span className="cap-doc__grand">Total SAR<b>18,975.00</b></span></div>
        </Shell>
      );
    case "contract":
      return (
        <Shell k={k} lang={lang} hit={hit} code={code}>
          <div {...z("head", "cap-doc__head")}><div><b className="cap-doc__org">Server Maintenance Agreement</b><span className="cap-doc__sub">Service agreement · Northgate Holding · Meridian Data Services Ltd.</span></div><div className="cap-doc__kind">CONTRACT</div></div>
          <div {...z("ref", "cap-doc__refs")}><span>Reference <b>CT-2026-031</b></span><span>Client <b>Northgate Holding</b></span><span>Provider <b>Meridian Data Services Ltd.</b></span></div>
          <div {...z("body", "cap-doc__clauses")}><p><b>1. Scope.</b> The Provider maintains the Client&apos;s production servers, applies security updates and responds to incidents.</p><p><b>2. Service levels.</b> Critical incidents are acknowledged within one hour and resolved within eight hours.</p><p><b>3. Payment.</b> The Client pays quarterly in arrears within thirty days of invoice.</p></div>
          <div {...z("total", "cap-doc__tot")}><span>Effective<b>1 Feb 2026</b></span><span>Expiry<b>31 Jan 2028</b></span><span className="cap-doc__grand">Value SAR<b>420,000.00</b></span></div>
        </Shell>
      );
    case "application":
      return (
        <Shell k={k} lang={lang} hit={hit} rtl code={code}>
          <div {...z("head", "cap-doc__head")}><div><b className="cap-doc__org">طلب توظيف</b><span className="cap-doc__sub">إدارة المالية · الموارد البشرية</span></div><span className="cap-doc__photo" aria-hidden="true"></span></div>
          <div {...z("ref", "cap-doc__refs")}><span>الاسم <b>ريم خالد الحربي</b></span><span>رقم الطلب <b dir="ltr">APP-2026-0233</b></span><span>رقم الهوية <b dir="ltr">10•• •••• ••</b></span></div>
          <div {...z("body", "cap-doc__clauses")}><p><b>الوظيفة المتقدَّم لها:</b> محاسب أول</p><p><b>الإدارة:</b> المالية</p><p><b>المؤهل:</b> بكالوريوس في المحاسبة</p></div>
          <div {...z("total", "cap-doc__tot")}><span>تاريخ الطلب<b dir="ltr">2026-04-02</b></span><span className="cap-doc__grand">الحالة<b>قيد المراجعة</b></span></div>
        </Shell>
      );
    case "identity":
      return (
        <Shell k={k} lang={lang} hit={hit} code={code}>
          <div {...z("head", "cap-doc__head")}><div><b className="cap-doc__org">Civil Registry (sample)</b><span className="cap-doc__sub">Identity card · fictional issuer</span></div><div className="cap-doc__kind">IDENTITY CARD<span lang="ar" dir="rtl">بطاقة هوية</span></div></div>
          <div {...z("ref", "cap-doc__refs")}><span>Full name <b>Omar Saleh Al-Mansour</b></span><span>ID No. <b>1•••••••42</b></span><span>Date of birth <b>1990-07-15</b></span></div>
          <div {...z("body", "cap-doc__idbody")}><span className="cap-doc__photo" aria-hidden="true"></span><p>This card is a fictional sample made for the demonstration. It is not an identity document.</p></div>
          <div {...z("total", "cap-doc__tot")}><span>Issued<b>2022-01-10</b></span><span className="cap-doc__grand">Expiry<b>2032-01-09</b></span></div>
          <span className="cap-doc__wm" aria-hidden="true">{plain(DEMO.watermark, "en")}<span lang="ar" dir="rtl">{plain(DEMO.watermark, "ar")}</span></span>
        </Shell>
      );
    case "correspondence":
      return (
        <Shell k={k} lang={lang} hit={hit} rtl code={code}>
          <div {...z("head", "cap-doc__head")}><div><b className="cap-doc__org">مكتب التراخيص في المنطقة الشمالية</b><span className="cap-doc__sub">خطاب صادر</span></div><div className="cap-doc__kind">LETTER<span lang="ar" dir="rtl">خطاب رسمي</span></div></div>
          <div {...z("ref", "cap-doc__refs")}><span>رقم الصادر <b dir="ltr">NRL/OUT/2026/1184</b></span><span>التاريخ <b dir="ltr">2026-05-06</b></span><span>إلى <b dir="ltr">Northgate Holding — Administration</b></span></div>
          <div {...z("body", "cap-doc__clauses")}><p><b>الموضوع:</b> تجديد الرخصة التجارية</p><p>تحية طيبة، نفيدكم بقرب انتهاء الرخصة التجارية للشركة، ونأمل استكمال مستندات التجديد في الموعد المحدد.</p></div>
          <div {...z("total", "cap-doc__tot")}><span className="cap-doc__grand">موعد الرد<b dir="ltr">2026-05-20</b></span></div>
        </Shell>
      );
  }
}
