// Dark/light theme toggle, shared across ccw-hands-on-lab pages.
// Runs before first paint (blocking <head> script) to avoid a flash of the wrong theme.
(function () {
  var KEY = "ccw-theme";
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  var theme = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = theme;

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.type = "button";
    var sync = function () {
      var isLight = document.documentElement.dataset.theme === "light";
      btn.textContent = isLight ? "☾" : "☀";
      btn.setAttribute("aria-label", isLight ? "다크 테마로 전환" : "라이트 테마로 전환");
      btn.setAttribute("aria-pressed", String(isLight));
    };
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) {}
      sync();
    });
    sync();
    document.body.appendChild(btn);
  });
})();
