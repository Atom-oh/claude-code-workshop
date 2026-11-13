/* Sidebar toggle for the November lab and capstone pages.
   Hides the left table of contents (aside.side on lab pages, aside.sidenav on capstone pages)
   so the content gets the full width, and remembers the choice per browser under "fsi-sidebar".
   Load it in <head> so the saved state applies before the first paint. */
(function () {
  "use strict";
  var KEY = "fsi-sidebar", root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "hidden") root.classList.add("sb-hidden");

  var css =
    // Desktop only: below 861px the lab pages turn aside.side into the ☰ drawer, which must keep working.
    "@media (min-width:861px){html.sb-hidden .layout{grid-template-columns:minmax(0,1fr)!important}" +
    "html.sb-hidden .layout>aside.side,html.sb-hidden .layout>aside.sidenav{display:none!important}}" +
    ".sb-toggle{position:fixed;left:14px;bottom:14px;z-index:60;display:inline-flex;align-items:center;gap:6px;" +
    "font:600 13px/1 system-ui,-apple-system,'Segoe UI',sans-serif;padding:9px 13px;border-radius:999px;cursor:pointer;" +
    "color:var(--ink,var(--text,#e6e6e6));background:var(--panel,var(--bg-card,#1c2330));" +
    "border:1px solid var(--line,#3a4250);box-shadow:0 2px 10px rgba(0,0,0,.25)}" +
    ".sb-toggle:hover{border-color:var(--accent,var(--orange,#ff9900))}" +
    ".sb-toggle:focus-visible{outline:2px solid var(--accent,var(--orange,#ff9900));outline-offset:2px}" +
    ".sb-toggle[hidden]{display:none}" +
    "@media print{.sb-toggle{display:none}}";
  var st = document.createElement("style");
  st.id = "sb-toggle-css";
  st.textContent = css;
  (document.head || root).appendChild(st);

  function init() {
    var side = document.querySelector(".layout > aside.side, .layout > aside.sidenav");
    if (!side) return;
    if (!side.id) side.id = "page-sidebar";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sb-toggle";
    btn.setAttribute("aria-controls", side.id);
    function label() {
      var hidden = root.classList.contains("sb-hidden");
      btn.textContent = hidden ? "» 목차 보기" : "« 목차 숨기기";
      btn.setAttribute("aria-expanded", hidden ? "false" : "true");
      btn.title = hidden ? "왼쪽 목차를 다시 엽니다" : "왼쪽 목차를 숨기고 본문을 넓게 봅니다";
    }
    // Show the button only where the sidebar is part of the layout (narrow screens already drop it).
    function fit() {
      var was = root.classList.contains("sb-hidden");
      if (was) root.classList.remove("sb-hidden");
      var cs = getComputedStyle(side);
      var shown = cs.display !== "none" && cs.position !== "fixed" && window.innerWidth >= 861;
      if (was) root.classList.add("sb-hidden");
      btn.hidden = !shown;
    }
    btn.addEventListener("click", function () {
      var hidden = root.classList.toggle("sb-hidden");
      try { localStorage.setItem(KEY, hidden ? "hidden" : "shown"); } catch (e) {}
      label();
    });
    label();
    document.body.appendChild(btn);
    fit();
    window.addEventListener("resize", fit);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
