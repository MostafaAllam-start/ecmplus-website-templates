/* ECM+ "Paper Register" — progressive enhancement only.
   1. Theme toggle (light paper / "Night register"), remembered across ECM+ pages.
   2. Mobile navigation disclosure (Esc closes and returns focus, click outside closes).
   3. The "Approved" stamp presses once when it first comes into view.
   Light paper is the default; dark only when the visitor chooses it. Without this
   script the page stays light, the menu is always visible and the stamp simply sits
   in place. */
(function () {
  "use strict";

  var THEME_KEY = "ecmplus-theme";
  var root = document.documentElement;
  var themeButtons = Array.prototype.slice.call(document.querySelectorAll(".theme-toggle"));

  var effectiveTheme = function () {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  };

  var themeColorMetas = Array.prototype.slice.call(document.querySelectorAll('meta[name="theme-color"]'));

  // The button keeps a fixed name ("Dark mode"); aria-pressed carries the state.
  var syncTheme = function () {
    var dark = effectiveTheme() === "dark";
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", dark ? "true" : "false");
    });
    themeColorMetas.forEach(function (meta) {
      meta.setAttribute("content", dark ? "#15171B" : "#F6F1E7");
    });
  };

  themeButtons.forEach(function (button) {
    button.hidden = false;
    button.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage blocked: the choice lasts for this page view */
      }
      syncTheme();
    });
  });

  syncTheme();

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("site-menu");

  if (header && toggle && menu) {
    var desktop = window.matchMedia("(min-width: 1180px)");

    var isOpen = function () {
      return toggle.getAttribute("aria-expanded") === "true";
    };

    var setOpen = function (open, returnFocus) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      header.classList.toggle("is-open", open);
      if (!open && returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", function () {
      setOpen(!isOpen(), false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (isOpen() && !header.contains(event.target)) {
        setOpen(false, false);
      }
    });

    menu.addEventListener("click", function (event) {
      var link = event.target instanceof Element ? event.target.closest("a") : null;
      if (link && isOpen()) {
        setOpen(false, false);
      }
    });

    var onBreakpoint = function (event) {
      if (event.matches && isOpen()) {
        setOpen(false, false);
      }
    };
    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", onBreakpoint);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(onBreakpoint);
    }
  }

  var stamp = document.querySelector(".stamp--approved");
  if (stamp && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stamp.classList.add("is-stamped");
          observer.disconnect();
        }
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.6 });
    observer.observe(stamp);
  }
})();
