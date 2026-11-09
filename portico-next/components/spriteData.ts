// Icon sprite symbols, verbatim from templates/portico/index.html (EN and AR are identical).
export const SPRITE_SYMBOLS = String.raw`
    <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></symbol>
    <symbol id="i-chev" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></symbol>
    <symbol id="i-check" viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path d="M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5a7.5 7.5 0 1 0 10.1 10.1z"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1"/><path d="M4 6.5l8 6 8-6"/></symbol>
    <symbol id="i-flow" viewBox="0 0 24 24"><rect x="8" y="2.5" width="8" height="5" rx="1.2"/><path d="M12 7.5v2M12 9.5l3 3-3 3-3-3z"/><path d="M9 12.5H5.5v4M15 12.5h3.5v4"/><rect x="2.5" y="16.5" width="6" height="5" rx="1.2"/><rect x="15.5" y="16.5" width="6" height="5" rx="1.2"/></symbol>
    <symbol id="i-people" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.8-3 2.9-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.4 14.6c.4-.1.8-.1 1.1-.1 2.2 0 3.8 1.3 4.5 3.9"/></symbol>
    <symbol id="i-archive" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="4" rx="1"/><path d="M5 9v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 12.5h4"/></symbol>
    <symbol id="i-audit" viewBox="0 0 24 24"><path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M15 3.5V7h3.5M9 11h6M9 14h6M9 17h4"/></symbol>
    <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5V17"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 2.8v5.6c0 4.6-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5-7.5-9.6V5.8z"/><path d="M8.6 12l2.5 2.5 4.4-4.8"/></symbol>
    <symbol id="i-sign" viewBox="0 0 24 24"><path d="M4 16.5c2.5-.3 3.6-6.5 5.5-6.5 1.6 0 .2 5 2 5 1.4 0 2-3 3.4-3 1 0 1.1 1.6 2.1 1.6.7 0 1.3-.5 3-1.6"/><path d="M4 20h16"/></symbol>
    <symbol id="i-backup" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/></symbol>
    <symbol id="i-ticket" viewBox="0 0 24 24"><path d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4z"/><path d="M7.5 10.5h5M7.5 13.5h3.5M15.5 7v10"/></symbol>
    <symbol id="i-track" viewBox="0 0 24 24"><path d="M9.5 6.5h11M9.5 12h11M9.5 17.5h11"/><path d="M3.5 6.5l1.3 1.3 2.2-2.4M3.5 12l1.3 1.3 2.2-2.4"/><circle cx="5.2" cy="17.5" r="1.3"/></symbol>
    <symbol id="i-idea" viewBox="0 0 24 24"><path d="M4 5.5h16V16H10l-4.5 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/></symbol>
    <symbol id="i-suite" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.2"/></symbol>
    <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>
    <symbol id="i-building" viewBox="0 0 24 24"><path d="M4.5 20.5v-16a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14.5 9.5h4a1 1 0 0 1 1 1v10M3 20.5h18"/><path d="M8 7.5h3M8 11h3M8 14.5h3"/></symbol>
    <symbol id="s-bank" viewBox="0 0 24 24"><path d="M3 9.5L12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3.5 20.5h17"/></symbol>
    <symbol id="s-health" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></symbol>
    <symbol id="s-edu" viewBox="0 0 24 24"><path d="M2.5 9.5L12 5l9.5 4.5L12 14zM6.5 11.7v4.3c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.3M21.5 9.5v5"/></symbol>
    <symbol id="s-energy" viewBox="0 0 24 24"><path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/></symbol>
    <symbol id="i-demo" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="12.5" rx="1.5"/><path d="M10 8.5v5l4.2-2.5zM8 20.5h8M12 17v3.5"/></symbol>
    <!-- Module glyphs (as in the module seal) -->
    <symbol id="m-dms" viewBox="0 0 24 24"><path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4"/></symbol>
    <symbol id="m-cms" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></symbol>
    <symbol id="m-bpm" viewBox="0 0 24 24"><g fill="none" stroke="currentColor"><g stroke-width="1.3" stroke-linejoin="round"><circle cx="2.3" cy="12" r="1.1" stroke-width="1"/><rect x="5.6" y="8.5" width="3" height="7" rx="1.1"/><path d="M10.2 12L12.4 9.8L14.6 12L12.4 14.2z"/><rect x="15.2" y="2.5" width="3" height="6" rx="1.1"/><rect x="15.2" y="15.5" width="3" height="6" rx="1.1"/><circle cx="21.9" cy="12" r="1.1" stroke-width="1.6"/></g><g stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 12H4.6M4.2 11.36L5 12L4.2 12.64"/><path d="M8.6 12H9.2M8.7 11.36L9.5 12L8.7 12.64"/><path d="M12.4 9.8V5.5H14.2M13.8 4.86L14.6 5.5L13.8 6.14M12.4 14.2V18.5H14.2M13.8 17.86L14.6 18.5L13.8 19.14"/><path d="M18.2 5.5H21.9V9.6M21.26 9.7L21.9 10.5L22.54 9.7M18.2 18.5H21.9V14.4M21.26 14.3L21.9 13.5L22.54 14.3"/></g></g></symbol>
    <symbol id="m-mms" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8.5" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13 14.6a5 5 0 0 1 8.5 5.4"/></symbol>
    <!-- Neutral glyphs for services without a logo file; no trademark is drawn. -->
    <symbol id="t-sms" viewBox="0 0 24 24"><path d="M12 4.5c4.7 0 8.5 3 8.5 6.7S16.7 18 12 18c-1 0-2-.1-2.9-.4L5 19.5l1-3.5c-1.6-1.2-2.5-2.9-2.5-4.8C3.5 7.5 7.3 4.5 12 4.5z"/><path d="M8.5 11.3h.01M12 11.3h.01M15.5 11.3h.01" stroke-width="2.4"/></symbol>
    <!-- Illustrative 14×14 trace-code pattern; not an encoded code. -->
    <symbol id="dm" viewBox="0 0 16 16">
      <rect x="1" y="1" width="1" height="14"/><rect x="1" y="14" width="14" height="1"/>
      <rect x="3" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="7" y="1" width="1" height="1"/><rect x="9" y="1" width="1" height="1"/><rect x="11" y="1" width="1" height="1"/><rect x="13" y="1" width="1" height="1"/>
      <rect x="14" y="2" width="1" height="1"/><rect x="14" y="4" width="1" height="1"/><rect x="14" y="6" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/><rect x="14" y="10" width="1" height="1"/><rect x="14" y="12" width="1" height="1"/>
      <rect x="2" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="10" y="2" width="1" height="1"/><rect x="13" y="2" width="1" height="1"/>
      <rect x="2" y="3" width="2" height="1"/><rect x="5" y="3" width="2" height="1"/><rect x="10" y="3" width="3" height="1"/>
      <rect x="3" y="4" width="2" height="1"/><rect x="7" y="4" width="3" height="1"/><rect x="11" y="4" width="2" height="1"/>
      <rect x="4" y="5" width="2" height="1"/><rect x="8" y="5" width="3" height="1"/><rect x="13" y="5" width="1" height="1"/>
      <rect x="2" y="6" width="3" height="1"/><rect x="6" y="6" width="1" height="1"/><rect x="10" y="6" width="2" height="1"/>
      <rect x="3" y="7" width="1" height="1"/><rect x="5" y="7" width="1" height="1"/><rect x="8" y="7" width="2" height="1"/><rect x="11" y="7" width="2" height="1"/>
      <rect x="2" y="8" width="1" height="1"/><rect x="4" y="8" width="1" height="1"/><rect x="6" y="8" width="2" height="1"/><rect x="11" y="8" width="3" height="1"/>
      <rect x="2" y="9" width="1" height="1"/><rect x="5" y="9" width="2" height="1"/><rect x="10" y="9" width="1" height="1"/><rect x="12" y="9" width="2" height="1"/>
      <rect x="2" y="10" width="1" height="1"/><rect x="5" y="10" width="1" height="1"/><rect x="7" y="10" width="4" height="1"/><rect x="12" y="10" width="1" height="1"/>
      <rect x="5" y="11" width="1" height="1"/><rect x="7" y="11" width="1" height="1"/><rect x="10" y="11" width="4" height="1"/>
      <rect x="3" y="12" width="1" height="1"/><rect x="6" y="12" width="3" height="1"/><rect x="11" y="12" width="1" height="1"/><rect x="13" y="12" width="1" height="1"/>
      <rect x="3" y="13" width="3" height="1"/><rect x="8" y="13" width="2" height="1"/>
    </symbol>
    <!-- AI and news (24×24 stroke, as the module glyphs) -->
    <symbol id="i-spark" viewBox="0 0 24 24"><path d="M10.5 3.5l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9-4.9-1.9 4.9-1.9z"/><path d="M18 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4l5.1 5.1"/></symbol>
    <symbol id="i-ocr" viewBox="0 0 24 24"><path d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16"/><path d="M8 9h8M8 12h8M8 15h5"/></symbol>
    <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3.5 12V5a1.5 1.5 0 0 1 1.5-1.5h7l8.5 8.5-8.5 8.5z"/><circle cx="8" cy="8" r="1.3"/></symbol>
    <symbol id="i-wave" viewBox="0 0 24 24"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4"/></symbol>
    <symbol id="i-news" viewBox="0 0 24 24"><path d="M3.5 5h14.5v13a2 2 0 0 0 2 2h-15a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M18 9.5h2.5V18a2 2 0 0 1-2 2"/><rect x="6.5" y="8" width="4.5" height="4.5" rx=".5"/><path d="M14 8.5h1.5M14 12h1.5M6.5 15.5h9"/></symbol>
    <!-- Why ECM+ and getting started (24×24 stroke, as the module glyphs) -->
    <symbol id="i-portico" viewBox="0 0 24 24"><path d="M3.5 7.5 12 3.5l8.5 4M4.5 7.5h15M6.2 7.5v12M10.1 7.5v12M13.9 7.5v12M17.8 7.5v12M3.5 19.5h17"/></symbol>
    <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="12" r="4.5"/><path d="M12.5 12h8M17.5 12v3.5M20.5 12v2.5"/></symbol>
    <symbol id="i-server" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="6.5" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.5"/><path d="M7 7.25h.01M7 16.75h.01M10.5 7.25h6M10.5 16.75h6" stroke-width="2"/></symbol>
    <symbol id="i-trace" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M13.5 13.5h3v3h-3zM20.5 13.5v3M20.5 20.5h-3M17.5 17.5h.01" stroke-width="2"/></symbol>
    <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.9 2.5 2.9 14.5 0 17M12 3.5c-2.9 2.5-2.9 14.5 0 17"/></symbol>
    <symbol id="i-path" viewBox="0 0 24 24"><circle cx="5.5" cy="6" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6"/></symbol>
`;
