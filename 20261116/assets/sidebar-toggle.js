/* Sidebar toggle for the November lab and capstone pages.
   Hides the left column (aside.side on lab pages: the lab list; aside.sidenav on capstone pages:
   the table of contents) so the content gets the full width, and remembers the choice per browser
   under "fsi-sidebar". Load it in <head> so the saved state applies before the first paint.
   Shown: the button sits at the top of the sidebar. Hidden: a narrow tab on the left edge, with a
   matching left gutter on .layout so it never covers content. Desktop only (>=861px); below that
   the lab pages use their own ☰ drawer and capstone pages drop the sidebar. */
(function () {
  "use strict";
  var KEY = "fsi-sidebar", root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "hidden") root.classList.add("sb-hidden");

  var css =
    "@media (min-width:861px){" +
    "html.sb-hidden .layout{grid-template-columns:minmax(0,1fr)!important;padding-left:56px!important}" +
    "html.sb-hidden .layout>aside.side,html.sb-hidden .layout>aside.sidenav{display:none!important}}" +
    ".sb-toggle{display:flex;align-items:center;gap:6px;width:100%;margin:0 0 12px;padding:7px 10px;cursor:pointer;" +
    "font:600 12.5px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;border-radius:8px;text-align:left;" +
    "color:var(--muted,var(--dim,#9aa3b2));background:transparent;border:1px solid var(--line,#3a4250)}" +
    ".sb-toggle:hover{color:var(--ink,var(--text,#e6e6e6));border-color:var(--accent,var(--orange,#ff9900))}" +
    ".sb-toggle:focus-visible{outline:2px solid var(--accent,var(--orange,#ff9900));outline-offset:2px}" +
    ".sb-toggle.sb-tab{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:60;width:34px;margin:0;" +
    "padding:12px 0;justify-content:center;writing-mode:vertical-rl;border-left:0;border-radius:0 10px 10px 0;" +
    "color:var(--ink,var(--text,#e6e6e6));background:var(--panel,var(--bg-card,#1c2330));box-shadow:0 2px 10px rgba(0,0,0,.2)}" +
    ".sb-toggle[hidden]{display:none!important}" +
    "@media print{.sb-toggle{display:none!important}}";
  var st = document.createElement("style");
  st.id = "sb-toggle-css";
  st.textContent = css;
  (document.head || root).appendChild(st);

  function init() {
    var side = document.querySelector(".layout > aside.side, .layout > aside.sidenav");
    if (!side) return;
    var layout = side.parentNode;
    if (!side.id) side.id = "page-sidebar";
    var lab = side.classList.contains("side"), what = lab ? "실습 목록" : "목차", obj = lab ? "실습 목록을" : "목차를";
    var mq = window.matchMedia ? window.matchMedia("(min-width:861px)") : null;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sb-toggle";
    btn.setAttribute("aria-controls", side.id);

    // Usable only where the page itself shows the sidebar in its layout (not the lab ☰ drawer, and not
    // the capstone single-column range, which hides the sidenav below about 900px).
    function usable() {
      if (mq ? !mq.matches : window.innerWidth < 861) return false;
      var was = root.classList.contains("sb-hidden");
      if (was) root.classList.remove("sb-hidden");
      var cs = getComputedStyle(side), ok = cs.display !== "none" && cs.position !== "fixed";
      if (was) root.classList.add("sb-hidden");
      return ok;
    }
    function render() {
      var hidden = root.classList.contains("sb-hidden");
      btn.innerHTML = hidden
        ? '<span aria-hidden="true">»</span> ' + what + " 보기"
        : '<span aria-hidden="true">«</span> ' + what + " 숨기기";
      btn.setAttribute("aria-expanded", hidden ? "false" : "true");
      btn.title = hidden ? "왼쪽 " + obj + " 다시 엽니다" : "왼쪽 " + obj + " 숨기고 본문을 넓게 봅니다";
      btn.classList.toggle("sb-tab", hidden);
      // Shown: first item inside the sidebar. Hidden: right before .layout, so tab order stays early.
      if (hidden) { if (btn.parentNode !== layout.parentNode || btn.nextSibling !== layout) layout.parentNode.insertBefore(btn, layout); }
      else if (side.firstChild !== btn) side.insertBefore(btn, side.firstChild);
      btn.hidden = !usable();
    }
    function set(hidden, store) {
      root.classList.toggle("sb-hidden", hidden);
      if (store) { try { localStorage.setItem(KEY, hidden ? "hidden" : "shown"); } catch (e) {} }
      render();
    }
    btn.addEventListener("click", function () {
      var hidden = !root.classList.contains("sb-hidden");
      set(hidden, true);
      if (!hidden) { try { btn.focus(); } catch (e) {} }
    });
    window.addEventListener("storage", function (e) { if (e.key === KEY) set(e.newValue === "hidden", false); });
    window.addEventListener("resize", function () { btn.hidden = !usable(); });
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
