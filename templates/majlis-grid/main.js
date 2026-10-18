/* ECM+ · Majlis Grid — shared by the Arabic and English pages.
   Everything here is an enhancement: without it the page still reads in full
   (static date, nav as a wrapped list, Support as an in-page link). */
(function () {
  "use strict";

  var root = document.documentElement;
  var isArabic = root.lang === "ar";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dual date: Hijri (Umm al-Qura) + Gregorian, Western digits ---------- */
  var HIJRI_LOCALE = isArabic ? "ar-SA-u-ca-islamic-umalqura-nu-latn" : "en-GB-u-ca-islamic-umalqura-nu-latn";
  var GREGORIAN_LOCALE = isArabic ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB-u-ca-gregory-nu-latn";

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  // Returns the date parts, or null when the engine can't do this calendar.
  function dateParts(locale, date) {
    var format = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" });
    var wanted = locale.indexOf("islamic-umalqura") > -1 ? "islamic-umalqura" : "gregory";
    return format.resolvedOptions().calendar === wanted ? format.formatToParts(date) : null;
  }

  function fillDate(el, parts, date) {
    parts.forEach(function (part) {
      var slot = el.querySelector('[data-part="' + part.type + '"]');
      if (slot) slot.textContent = part.value;
    });
    el.setAttribute("datetime", date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()));
  }

  function renderDates() {
    var hijri = document.querySelector('[data-cal="hijri"]');
    var gregorian = document.querySelector('[data-cal="gregory"]');
    if (!hijri || !gregorian || !window.Intl || !Intl.DateTimeFormat.prototype.formatToParts) return;
    var now = new Date();
    try {
      var hijriParts = dateParts(HIJRI_LOCALE, now);
      var gregorianParts = dateParts(GREGORIAN_LOCALE, now);
      // Only claim "today" once both calendars formatted; otherwise the static example stays.
      if (hijriParts && gregorianParts) {
        fillDate(hijri, hijriParts, now);
        fillDate(gregorian, gregorianParts, now);
        var weekday = document.querySelector('[data-date="weekday"]');
        var label = document.querySelector('[data-date="label"]');
        if (weekday) {
          weekday.textContent = new Intl.DateTimeFormat(GREGORIAN_LOCALE, { weekday: "long" }).format(now);
          weekday.hidden = false;
        }
        if (label && label.getAttribute("data-today")) label.textContent = label.getAttribute("data-today");
      }
    } catch {
      /* keep the static fallback in the HTML */
    }
    var nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    window.setTimeout(renderDates, nextMidnight - now);
  }

  renderDates();

  /* ---------- Theme: light by default; dark only when the visitor chooses it ---------- */
  // The inline <head> script applies a stored choice before first paint (no flash, and the
  // language flip keeps the theme). This part drives the toggle and the browser theme colour.
  var THEME_KEY = "ecmplus-theme";
  var THEME_COLORS = { light: "#F4F6F8", dark: "#0A1220" };
  var themeToggles = Array.prototype.slice.call(document.querySelectorAll(".theme-toggle"));
  var themeMetas = Array.prototype.slice.call(document.querySelectorAll('meta[name="theme-color"]'));
  // Set when the visitor uses the toggle on this page (kept in memory in case storage is blocked).
  var explicitTheme = false;

  // Older Safari only has addListener on MediaQueryList.
  function onMediaChange(query, handler) {
    if (query.addEventListener) {
      query.addEventListener("change", handler);
    } else if (query.addListener) {
      query.addListener(handler);
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  // The toggle keeps one fixed name ("Dark mode"); aria-pressed carries the state.
  function syncTheme() {
    var theme = currentTheme();
    themeToggles.forEach(function (button) {
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });
    themeMetas.forEach(function (meta) {
      meta.setAttribute("content", THEME_COLORS[theme]);
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    syncTheme();
  }

  function setTheme(theme) {
    explicitTheme = true;
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
  }

  themeToggles.forEach(function (button) {
    button.hidden = false;
    button.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      // A short cross-fade where supported; instant under reduced motion.
      if (document.startViewTransition && !reduceMotion) {
        var fade = document.startViewTransition(function () {
          setTheme(next);
        });
        // If the browser skips the fade, the theme has still been applied.
        fade.ready.catch(function () {});
      } else {
        setTheme(next);
      }
    });
  });

  // A choice made in another tab or template follows here, unless this page made its own.
  window.addEventListener("storage", function (event) {
    if (event.key !== THEME_KEY || explicitTheme) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
  });
  syncTheme();

  /* ---------- Header: mobile disclosure + Support menu ---------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navPanel = document.getElementById("mg-nav");
  var menuButton = document.querySelector(".menu-button");
  var menu = menuButton ? document.getElementById(menuButton.getAttribute("aria-controls")) : null;
  var menuFallback = document.querySelector(".menu-fallback");
  var desktop = window.matchMedia("(min-width: 1080px)");

  function isOpen(button) {
    return !!button && button.getAttribute("aria-expanded") === "true";
  }

  function setMenu(open, returnFocus) {
    if (!menuButton || !menu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    if (!open && returnFocus) menuButton.focus();
  }

  function setNav(open, returnFocus) {
    if (!navToggle || !header) return;
    navToggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    if (!open) {
      setMenu(false);
      if (returnFocus) navToggle.focus();
    }
  }

  if (header && navToggle && navPanel) {
    header.classList.add("has-js");
    navToggle.hidden = false;
    navToggle.addEventListener("click", function () {
      setNav(!isOpen(navToggle));
    });
    onMediaChange(desktop, function () {
      setNav(false);
    });
  }

  if (menuButton && menu && menuFallback) {
    menuFallback.hidden = true;
    menuButton.hidden = false;
    menuButton.addEventListener("click", function () {
      setMenu(!isOpen(menuButton));
    });
    // Tabbing out of the Support menu closes it.
    menuButton.parentElement.addEventListener("focusout", function (event) {
      if (event.relatedTarget && !menuButton.parentElement.contains(event.relatedTarget)) setMenu(false);
    });
  }

  if (navPanel) {
    // Following a link (in-page anchors included) closes whatever is open.
    navPanel.addEventListener("click", function (event) {
      if (!event.target.closest("a")) return;
      setMenu(false);
      if (isOpen(navToggle)) setNav(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (isOpen(menuButton)) {
      setMenu(false, true);
    } else if (isOpen(navToggle)) {
      setNav(false, true);
    }
  });

  document.addEventListener("click", function (event) {
    if (isOpen(menuButton) && !menuButton.parentElement.contains(event.target)) setMenu(false);
    if (isOpen(navToggle) && header && !header.contains(event.target)) setNav(false);
  });

  /* ---------- The flip: remember that we left through a view transition ---------- */
  var FLIP_KEY = "mg-flip";
  var arrivedByFlip = false;
  try {
    arrivedByFlip = Date.now() - Number(sessionStorage.getItem(FLIP_KEY) || 0) < 5000;
    sessionStorage.removeItem(FLIP_KEY);
  } catch {
    /* storage unavailable: worst case the hero tiles also stagger in */
  }

  window.addEventListener("pageswap", function (event) {
    if (!event.viewTransition) return;
    try {
      sessionStorage.setItem(FLIP_KEY, String(Date.now()));
    } catch {
      /* storage unavailable */
    }
  });

  /* ---------- Tile stagger: 60ms steps on load; below the fold, scroll position reveals tiles ---------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".bento > .tile"));
  if (reduceMotion || !tiles.length) return;
  // CSS ties below-the-fold reveals to the scroll position, so nothing waits on a script.
  var scrollReveal = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));

  // If the first paint already happened (or the hero just arrived mid-flip),
  // leave what is on screen alone; only tiles below the fold wait their turn.
  var painted = !!(window.performance && performance.getEntriesByType && performance.getEntriesByType("paint").length);
  var leaveVisible = painted || arrivedByFlip;
  var viewport = window.innerHeight || root.clientHeight;

  root.classList.add("motion");
  tiles.forEach(function (tile) {
    var rect = tile.getBoundingClientRect();
    if (rect.top < viewport && rect.bottom > 0) {
      if (!leaveVisible) tile.classList.add("is-in");
    } else if (scrollReveal) {
      tile.classList.add("is-pending");
    }
  });
})();
