(function () {
  "use strict";
  var KEY = "hol-theme";
  var root = document.documentElement;
  function apply(light) { root.classList.toggle("light", light); btn.textContent = light ? "다크" : "화이트"; btn.setAttribute("aria-pressed", light ? "true" : "false"); }
  var btn = document.getElementById("themeToggle");
  if (btn) {
    var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
    apply(saved === "light");
    btn.addEventListener("click", function () { var l = !root.classList.contains("light"); apply(l); try { localStorage.setItem(KEY, l ? "light" : "dark"); } catch (e) {} });
  }
  document.querySelectorAll(".code").forEach(function (box) {
    var b = box.querySelector(".copy"); if (!b) return;
    b.addEventListener("click", function () {
      var t = box.querySelector("pre").innerText;
      var done = function () { b.textContent = "복사됨"; setTimeout(function () { b.textContent = "복사"; }, 1400); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t).then(done, fallback); } else { fallback(); }
      function fallback() { var ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} document.body.removeChild(ta); }
    });
  });
  var page = location.pathname.split("/").pop() || "index";
  document.querySelectorAll(".checkpoint").forEach(function (cp, ci) {
    var boxes = cp.querySelectorAll("input[type=checkbox]"), out = cp.querySelector(".progress");
    function key(i) { return "wv2:" + page + ":" + ci + ":" + i; }
    function paint() { var n = 0; boxes.forEach(function (b) { if (b.checked) n++; }); if (out) out.textContent = n + " / " + boxes.length + " 완료"; }
    boxes.forEach(function (b, i) {
      try { b.checked = localStorage.getItem(key(i)) === "1"; } catch (e) {}
      b.addEventListener("change", function () { try { localStorage.setItem(key(i), b.checked ? "1" : "0"); } catch (e) {} paint(); });
    });
    paint();
  });
})();
