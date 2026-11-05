/* Document Capture demonstration (Portico). A simulation on sample documents: nothing is uploaded.
   Reads #capture-data (field values, labels, strings); the markup comes from scripts/capture-page.mjs. */
(function () {
  "use strict";
  var root = document.getElementById("cap-demo");
  var dataEl = document.getElementById("capture-data");
  if (!root || !dataEl) return;

  var D = JSON.parse(dataEl.textContent);
  var U = D.ui;
  var N = 7;
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var st = { sample: "", step: 1, max: 1, filled: {}, saved: false };
  var timers = [];
  var typing = false;

  var steps = [].slice.call(root.querySelectorAll(".cap-step"));
  var picks = [].slice.call(root.querySelectorAll(".cap-pick"));
  var title = root.querySelector(".cap-stage__title");
  var live = root.querySelector("[data-live]");
  var back = root.querySelector("[data-back]");
  var next = root.querySelector("[data-next]");

  function $(sel, from) { return (from || root).querySelector(sel); }
  function $$(sel, from) { return [].slice.call((from || root).querySelectorAll(sel)); }
  function later(fn, ms) { var id = window.setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(window.clearTimeout); timers = []; }
  function group() { return st.sample ? $('.cap-fields[data-for="' + st.sample + '"]') : null; }
  function suggested(key) {
    var f = D.samples[st.sample].fields;
    for (var i = 0; i < f.length; i++) if (f[i].key === key) return f[i].v;
    return "";
  }

  /* ---- field chips ---- */
  function chip(input) {
    var row = input.closest(".cap-field");
    var c = $("[data-chip]", row);
    var r = $("[data-reset]", row);
    var sug = suggested(input.getAttribute("data-key"));
    var v = input.value;
    var state = "";
    if (v === sug) state = sug ? "proposed" : "";
    else state = "edited";
    c.setAttribute("data-state", state);
    c.textContent = state === "proposed" ? U.proposed : state === "edited" ? U.edited : "";
    r.hidden = state !== "edited";
  }
  function clearZoneHits() { $$(".is-hit").forEach(function (e) { e.classList.remove("is-hit"); }); }

  /* ---- AI-proposed values: typed in (instant under reduced motion) ---- */
  function setBusy(g, on) {
    g.setAttribute("aria-busy", on ? "true" : "false");
    $$("input", g).forEach(function (i) { i.disabled = on; });
  }
  function finishTyping() {
    if (!typing) return;
    clearTimers();
    var g = group();
    if (g) {
      $$("input", g).forEach(function (i) { i.value = suggested(i.getAttribute("data-key")); chip(i); });
      setBusy(g, false);
      st.filled[st.sample] = true;
    }
    typing = false;
  }
  function fillFields() {
    var g = group();
    if (!g || st.filled[st.sample]) return;
    var inputs = $$("input", g);
    if (reduce) {
      inputs.forEach(function (i) { i.value = suggested(i.getAttribute("data-key")); chip(i); });
      st.filled[st.sample] = true;
      return;
    }
    typing = true;
    setBusy(g, true);
    var k = 0;
    (function nextField() {
      if (k >= inputs.length) { setBusy(g, false); st.filled[st.sample] = true; typing = false; render(); return; }
      var input = inputs[k++];
      var val = suggested(input.getAttribute("data-key"));
      if (!val || input.type === "date") { input.value = val; chip(input); later(nextField, 90); return; }
      var n = 0;
      (function ch() {
        n++;
        input.value = val.slice(0, n);
        if (n < val.length) later(ch, 22); else { chip(input); later(nextField, 90); }
      })();
    })();
  }

  /* ---- recognition sweep ---- */
  function recognise() {
    if (root.hasAttribute("data-rec")) return;
    if (reduce) { root.setAttribute("data-rec", ""); $("[data-recog-lang]").textContent = D.samples[st.sample].lang; return; }
    root.classList.add("is-scanning");
    later(function () {
      root.classList.remove("is-scanning");
      root.setAttribute("data-rec", "");
    }, 900);
  }

  /* ---- archive record ---- */
  function fillRecord() {
    var rec = $('.cap-record[data-for="' + st.sample + '"]');
    var g = group();
    if (!rec || !g) return;
    $$("[data-rf]", rec).forEach(function (dd) {
      var i = $('[data-key="' + dd.getAttribute("data-rf") + '"]', g);
      dd.textContent = i && i.value ? i.value : U.none;
    });
    var checked = $('.cap-types[data-for="' + st.sample + '"] input:checked');
    if (checked) $("[data-doctype]", rec).textContent = checked.value;
  }

  /* ---- render ---- */
  function render(focus) {
    root.setAttribute("data-step", String(st.step));
    root.setAttribute("data-sample", st.sample);
    if (st.saved) root.setAttribute("data-saved", ""); else root.removeAttribute("data-saved");
    if (st.step < 3) { root.removeAttribute("data-rec"); root.classList.remove("is-scanning"); }
    steps.forEach(function (b, i) {
      var n = i + 1;
      if (n === st.step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      var off = n > st.max || (!st.sample && n > 1);
      if (off) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
      b.classList.toggle("is-done", n < st.step);
    });
    picks.forEach(function (p) { p.setAttribute("aria-pressed", String(p.getAttribute("data-pick") === st.sample)); });
    var t = U.titles[st.step - 1];
    if (title) title.textContent = t;
    var msg = U.step.replace("{n}", st.step).replace("{t}", t);
    if (st.step === N && st.saved) msg += ". " + U.saved;
    if (live) live.textContent = msg;
    back.setAttribute("aria-disabled", st.step === 1 ? "true" : "false");
    if (st.step === N) next.textContent = st.saved ? U.again : U.save; else next.textContent = U.next;
    next.setAttribute("aria-disabled", (st.step === 1 && !st.sample) || typing ? "true" : "false");
    if (st.sample) { var code = $("[data-code]"); if (code) code.textContent = D.samples[st.sample].code; }
    if (st.step === 3 && st.sample) { var l = $("[data-recog-lang]"); if (l) l.textContent = D.samples[st.sample].lang; }
    if (st.step === N) fillRecord();
    if (focus && title) title.focus({ preventScroll: false });
  }

  function go(n, focus) {
    if (n < 1 || n > N) return;
    if (n > 1 && !st.sample) return;
    if (n > st.max) return;
    finishTyping();
    clearTimers();
    clearZoneHits();
    $$(".cap-zonebtn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    st.step = n;
    render(focus);
    if (n === 3) { recognise(); render(false); }
    if (n === 5) { fillFields(); render(false); }
  }
  function advance() {
    if (st.step === N) {
      if (!st.saved) { st.saved = true; render(false); } else restart();
      return;
    }
    if (st.step === 1 && !st.sample) return;
    if (typing) return;
    st.max = Math.max(st.max, st.step + 1);
    go(st.step + 1, true);
  }
  function restart() {
    finishTyping();
    clearTimers();
    st = { sample: "", step: 1, max: 1, filled: {}, saved: false };
    $$(".cap-field input").forEach(function (i) { i.value = ""; i.disabled = false; });
    $$("[data-chip]").forEach(function (c) { c.textContent = ""; c.removeAttribute("data-state"); });
    $$("[data-reset]").forEach(function (r) { r.hidden = true; });
    $$(".cap-types").forEach(function (g) { var f = g.querySelector("input"); if (f) f.checked = true; });
    clearZoneHits();
    render(true);
    if (picks[0]) picks[0].focus();
  }
  function choose(key) {
    if (st.sample !== key) { finishTyping(); clearTimers(); root.removeAttribute("data-rec"); }
    st.sample = key;
    st.max = Math.max(st.max, 2);
    go(2, true);
  }

  /* ---- events ---- */
  root.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t || !root.contains(t)) return;
    if (t.classList.contains("cap-step")) {
      if (t.getAttribute("aria-disabled") === "true") return;
      go(Number(t.getAttribute("data-go")), true);
    } else if (t.classList.contains("cap-pick")) {
      choose(t.getAttribute("data-pick"));
    } else if (t === next) {
      if (t.getAttribute("aria-disabled") !== "true") advance();
    } else if (t === back) {
      if (t.getAttribute("aria-disabled") !== "true") go(st.step - 1, true);
    } else if (t.classList.contains("cap-zonebtn")) {
      var on = t.getAttribute("aria-pressed") !== "true";
      clearZoneHits();
      $$(".cap-zonebtn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      if (on) {
        t.setAttribute("aria-pressed", "true");
        var z = $('.cap-doc[data-for="' + st.sample + '"] [data-zone="' + t.getAttribute("data-zonebtn") + '"]');
        if (z) z.classList.add("is-hit");
      }
    } else if (t.hasAttribute("data-reset")) {
      var input = $("input", t.closest(".cap-field"));
      input.value = suggested(input.getAttribute("data-key"));
      chip(input);
      input.focus();
    }
  });
  root.addEventListener("input", function (e) {
    if (e.target.matches(".cap-field input") && st.filled[st.sample]) chip(e.target);
  });
  root.addEventListener("focusin", function (e) {
    var row = e.target.closest && e.target.closest(".cap-field");
    if (!row || !e.target.matches("input")) return;
    clearZoneHits();
    row.classList.add("is-hit");
    var z = row.getAttribute("data-z");
    var el = z && $('.cap-doc[data-for="' + st.sample + '"] [data-zone="' + z + '"]');
    if (el) el.classList.add("is-hit");
  });
  root.addEventListener("focusout", function (e) {
    var row = e.target.closest && e.target.closest(".cap-field");
    if (row) clearZoneHits();
  });

  render(false);
})();
