/* Ink Ledger — progressive enhancement for the ECM+ homepage template.
   The page reads completely without this file: menus fall back to plain links,
   every scenario panel is visible, and nothing is hidden for animation. */
(function () {
  "use strict";

  var doc = document;
  // Reveal styles only hide content once this script is actually running.
  // "reveal-ready" is added at the very end; if anything below throws first,
  // a CSS fail-safe shows every hidden item after 2.5 s.
  doc.documentElement.classList.add("reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktop = window.matchMedia("(min-width: 1200px)");

  function motionOK() {
    return !reduceMotion.matches;
  }

  // Older Safari only has the deprecated addListener on MediaQueryList.
  function onMediaChange(mq, handler) {
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  /* ------------------------------------------------------------------
     Theme: light by default, whatever the system prefers. Choosing dark
     sets data-theme="dark" and is stored under the key shared by every
     ECM+ template and the gallery.
     ------------------------------------------------------------------ */
  var root = doc.documentElement;
  var THEME_KEY = "ecmplus-theme";
  var themeToggles = Array.prototype.slice.call(doc.querySelectorAll(".theme-toggle"));
  var themeMetas = Array.prototype.slice.call(doc.querySelectorAll('meta[name="theme-color"]'));

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  // The toggle keeps one accessible name ("Dark mode"); aria-pressed carries the state.
  function syncTheme() {
    var dark = currentTheme() === "dark";
    themeToggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(dark));
    });
    themeMetas.forEach(function (meta) {
      meta.setAttribute("content", dark ? "#0B1220" : "#FFFFFF");
    });
  }

  themeToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // Storage blocked: the choice lasts for this page view.
      }
      syncTheme();
    });
  });

  syncTheme();

  /* ------------------------------------------------------------------
     Header: mobile disclosure + click-toggled menus
     ------------------------------------------------------------------ */
  var header = doc.querySelector(".site-header");
  var navToggle = doc.querySelector(".nav-toggle");
  var navPanel = navToggle ? doc.getElementById(navToggle.getAttribute("aria-controls")) : null;
  var navOpen = false;
  var openItem = null;

  function triggerOf(item) {
    return item.querySelector(".nav__trigger");
  }

  function closeMenu(item, returnFocus) {
    if (!item) return;
    var button = triggerOf(item);
    item.classList.remove("is-open");
    if (button) {
      button.setAttribute("aria-expanded", "false");
      if (returnFocus) button.focus();
    }
    if (openItem === item) openItem = null;
  }

  function openMenu(item) {
    if (openItem && openItem !== item) closeMenu(openItem, false);
    item.classList.add("is-open");
    triggerOf(item).setAttribute("aria-expanded", "true");
    openItem = item;
  }

  function setNav(open, returnFocus) {
    if (!navToggle || !navPanel) return;
    navOpen = open;
    navToggle.setAttribute("aria-expanded", String(open));
    navPanel.classList.toggle("is-open", open);
    if (!open) {
      if (openItem) closeMenu(openItem, false);
      if (returnFocus) navToggle.focus();
    }
  }

  Array.prototype.forEach.call(doc.querySelectorAll("[data-menu]"), function (item) {
    var button = triggerOf(item);
    var panel = button ? doc.getElementById(button.getAttribute("aria-controls")) : null;
    if (!button || !panel) return;

    button.addEventListener("click", function () {
      if (item.classList.contains("is-open")) closeMenu(item, false);
      else openMenu(item);
    });

    // On desktop, tabbing out of an open menu closes it.
    item.addEventListener("focusout", function (event) {
      if (!desktop.matches) return;
      var next = event.relatedTarget;
      if (next && !item.contains(next)) closeMenu(item, false);
    });

    // Following a link inside a menu closes the menu (and the mobile panel).
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu(item, false);
        setNav(false, false);
      }
    });
  });

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", function () {
      setNav(!navOpen, false);
    });
    navPanel.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link && !link.closest(".menu-panel")) setNav(false, false);
    });
  }

  doc.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (openItem) {
      closeMenu(openItem, true);
      event.preventDefault();
    } else if (navOpen) {
      setNav(false, true);
      event.preventDefault();
    }
  });

  doc.addEventListener("click", function (event) {
    if (openItem && !openItem.contains(event.target)) closeMenu(openItem, false);
    if (navOpen && header && !header.contains(event.target)) setNav(false, false);
  });

  onMediaChange(desktop, function () {
    setNav(false, false);
    if (openItem) closeMenu(openItem, false);
  });

  /* ------------------------------------------------------------------
     Scenario tabs (ARIA tabs, roving tabindex)
     ------------------------------------------------------------------ */
  var tabsRoot = doc.querySelector("[data-tabs]");
  if (tabsRoot) {
    var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return doc.getElementById(tab.getAttribute("aria-controls"));
    });

    panels.forEach(function (panel, i) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[i].id);
      panel.tabIndex = 0;
    });

    var selectTab = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    };

    var indexForHash = function (fragment) {
      for (var i = 0; i < panels.length; i += 1) {
        if ("#" + panels[i].id === fragment) return i;
      }
      return -1;
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        selectTab(i, false);
      });
      tab.addEventListener("keydown", function (event) {
        var rtl = getComputedStyle(tabsRoot).direction === "rtl";
        var forward = rtl ? "ArrowLeft" : "ArrowRight";
        var back = rtl ? "ArrowRight" : "ArrowLeft";
        var next = -1;
        if (event.key === forward) next = (i + 1) % tabs.length;
        else if (event.key === back) next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        if (next < 0) return;
        event.preventDefault();
        selectTab(next, true);
      });
    });

    // Links to a scenario (Solutions menu, module "Explore", footer) select its tab
    // before the browser scrolls, so the target is visible when it gets there.
    doc.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#scenario-"]');
      if (!link) return;
      var index = indexForHash(link.getAttribute("href"));
      if (index > -1) selectTab(index, false);
    });

    window.addEventListener("hashchange", function () {
      var index = indexForHash(window.location.hash);
      if (index > -1) selectTab(index, false);
    });

    var initial = indexForHash(window.location.hash);
    selectTab(initial > -1 ? initial : 0, false);
    if (initial > -1) {
      window.requestAnimationFrame(function () {
        panels[initial].scrollIntoView();
      });
    }
  }

  /* ------------------------------------------------------------------
     Works-with ticker: pause / play
     ------------------------------------------------------------------ */
  var ticker = doc.querySelector("[data-ticker]");
  var tickerButton = ticker ? ticker.querySelector(".ticker__toggle") : null;
  if (tickerButton) {
    tickerButton.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      tickerButton.setAttribute("aria-pressed", String(paused));
    });
  }

  /* ------------------------------------------------------------------
     Reveal on scroll (fade-up 300ms, 40ms stagger between siblings)
     ------------------------------------------------------------------ */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));
  var hasIO = "IntersectionObserver" in window;

  if (hasIO && motionOK()) {
    var counts = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var n = counts.get(parent) || 0;
      el.style.setProperty("--i", String(n));
      counts.set(parent, n + 1);
    });
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealIO.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) {
      revealIO.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ------------------------------------------------------------------
     Fact band count-up (only when motion is allowed). The real figures
     stay in the DOM until a number scrolls into view, so print and reader
     modes always show them; a number is zeroed only as it enters.
     ------------------------------------------------------------------ */
  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));
  if (counters.length && hasIO && motionOK()) {
    var finalValue = function (el) {
      return el.getAttribute("data-count");
    };
    var runCount = function (el) {
      var target = parseInt(finalValue(el), 10);
      var duration = 1100;
      var start = null;
      var frame = function (now) {
        if (el.getAttribute("data-counted") === "final") {
          el.textContent = finalValue(el);
          return;
        }
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    };
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (!entry.isIntersecting || el.hasAttribute("data-counted")) return;
        if (entry.intersectionRatio < 0.6) {
          // Entering from off-screen: start from zero just before the count runs.
          el.textContent = "0";
          return;
        }
        countIO.unobserve(el);
        el.setAttribute("data-counted", "");
        runCount(el);
      });
    }, { threshold: [0, 0.6] });
    counters.forEach(function (el) {
      countIO.observe(el);
    });
    // Printing mid-page: every figure shows its real value.
    window.addEventListener("beforeprint", function () {
      counters.forEach(function (el) {
        countIO.unobserve(el);
        el.setAttribute("data-counted", "final");
        el.textContent = finalValue(el);
      });
    });
  }

  /* ------------------------------------------------------------------
     Security: draw the trace from the trace code to the access record
     ------------------------------------------------------------------ */
  var evidence = doc.querySelector("[data-evidence]");
  if (evidence) {
    var stage = evidence.querySelector(".evidence__stage");
    var from = evidence.querySelector("[data-trace-from]");
    var to = evidence.querySelector("[data-trace-to]");
    var svg = evidence.querySelector(".trace");
    var path = svg.querySelector(".trace__path");
    var dotA = svg.querySelector(".trace__dot--a");
    var dotB = svg.querySelector(".trace__dot--b");

    var f = function (n) {
      return Math.round(n * 10) / 10;
    };

    // Horizontal-first elbow with rounded corners.
    var elbowH = function (x1, y1, x2, y2) {
      var mx = x1 + (x2 - x1) / 2;
      var dy = y2 - y1;
      var r = Math.min(12, Math.abs(dy) / 2, (x2 - x1) / 4);
      if (Math.abs(dy) < 2 || r < 1) return "M" + f(x1) + " " + f(y1) + " H" + f(x2);
      var sy = dy > 0 ? 1 : -1;
      return "M" + f(x1) + " " + f(y1) +
        " H" + f(mx - r) +
        " Q" + f(mx) + " " + f(y1) + " " + f(mx) + " " + f(y1 + sy * r) +
        " V" + f(y2 - sy * r) +
        " Q" + f(mx) + " " + f(y2) + " " + f(mx + r) + " " + f(y2) +
        " H" + f(x2);
    };

    var draw = function () {
      var s = stage.getBoundingClientRect();
      var a = from.getBoundingClientRect();
      var b = to.getBoundingClientRect();
      if (!s.width || !s.height) return;
      svg.setAttribute("viewBox", "0 0 " + f(s.width) + " " + f(s.height));
      var x1;
      var y1;
      var x2;
      var y2;
      var d;
      if (b.left >= a.right + 8) {
        // Record sits beside the page: leave the code to the right.
        x1 = a.right - s.left;
        y1 = a.top + a.height / 2 - s.top;
        x2 = b.left - s.left;
        y2 = b.top - s.top + Math.min(64, b.height / 3);
        d = elbowH(x1, y1, x2, y2);
      } else {
        // Record sits below the page: drop straight down from the code.
        x1 = a.left + a.width / 2 - s.left;
        y1 = a.bottom - s.top;
        x2 = x1;
        y2 = b.top - s.top;
        d = "M" + f(x1) + " " + f(y1) + " V" + f(y2);
      }
      path.setAttribute("d", d);
      svg.classList.add("is-drawn");
      dotA.setAttribute("cx", f(x1));
      dotA.setAttribute("cy", f(y1));
      dotB.setAttribute("cx", f(x2));
      dotB.setAttribute("cy", f(y2));
    };

    draw();
    if ("ResizeObserver" in window) {
      var traceRO = new ResizeObserver(draw);
      traceRO.observe(stage);
      traceRO.observe(from.closest(".paper") || from);
      traceRO.observe(to);
    } else {
      window.addEventListener("resize", draw);
    }
    // Web fonts arrive after first paint (display=swap); redraw when they land.
    if (doc.fonts) {
      if (doc.fonts.ready) doc.fonts.ready.then(draw);
      doc.fonts.addEventListener("loadingdone", draw);
    }

    if (hasIO && motionOK()) {
      // Watch the record card at a low threshold: on stacked phone layouts the
      // whole stage can be taller than two viewports, so a stage threshold
      // alone might never be reached.
      var traceIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || evidence.classList.contains("in")) return;
          draw();
          evidence.classList.add("in");
          traceIO.disconnect();
        });
      }, { threshold: 0.15 });
      traceIO.observe(to);
      traceIO.observe(from);
    } else {
      evidence.classList.add("in");
    }
  }

  /* ------------------------------------------------------------------
     Contact helpers: "Talk to our team" focuses the form; some links
     pre-fill an empty message so the request lands with context.
     ------------------------------------------------------------------ */
  var message = doc.getElementById("demo-message");
  doc.addEventListener("click", function (event) {
    var prefill = event.target.closest("[data-prefill]");
    if (prefill && message && !message.value.trim()) {
      message.value = prefill.getAttribute("data-prefill");
    }

    var focusLink = event.target.closest("[data-focus-target]");
    if (focusLink) {
      var field = doc.getElementById(focusLink.getAttribute("data-focus-target"));
      var form = field ? field.form : null;
      if (field && form) {
        event.preventDefault();
        form.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: "start" });
        field.focus({ preventScroll: true });
      }
    }
  });

  // Everything is wired up: the CSS fail-safe is no longer needed.
  doc.documentElement.classList.add("reveal-ready");
})();
