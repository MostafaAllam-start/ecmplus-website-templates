/** A module code badge (DMS, CMS, BPM, MMS) with its icon. Reused by the header menu and the sector cards. */
const ICON: Record<string, string> = { DMS: "m-dms", CMS: "m-cms", BPM: "m-bpm", MMS: "m-mms" };

export default function ModuleBadge({ code, className = "" }: { code: string; className?: string }) {
  const id = ICON[code];
  return (
    <span className={`mod-badge ${className}`.trim()}>
      {id ? (
        <svg className="icon mod-badge__ic" aria-hidden="true" focusable="false"><use href={`#${id}`} /></svg>
      ) : null}
      <bdi>{code}</bdi>
    </span>
  );
}
