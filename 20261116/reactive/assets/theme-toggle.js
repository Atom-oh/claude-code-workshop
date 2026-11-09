/* FSI decks: dark/light theme switch.
 * The decks are built dark (`theme.mode: dark`), and every FSI style uses theme
 * tokens, so switching only swaps the framework's `.theme-dark` / `.theme-light`
 * classes on the deck and on slides that carry one (the covers).
 * - Button (top right) or the T key toggles. Slide thumbnails follow too.
 * - ?theme=light|dark in the URL wins, then the last choice (localStorage), then dark.
 * - Other open windows of the deck (presenter view) follow through the storage event.
 * Loaded once by assets/stepviz.js.
 */
(function () {
  'use strict';
  if (window.__fsiTheme) return;
  window.__fsiTheme = true;

  var KEY = 'fsi-deck-theme';
  var btn = null;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode: keep it per page */ }
  }
  function valid(m) { return m === 'dark' || m === 'light'; }
  function initial() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('theme'); } catch (e) { /* old browsers */ }
    if (valid(q)) return q;
    var s = read();
    return valid(s) ? s : 'dark';
  }
  function current() {
    return document.documentElement.getAttribute('data-deck-theme') || 'dark';
  }

  function apply(mode) {
    var deck = document.querySelector('.slide-deck');
    if (!deck) return;
    var nodes = [deck].concat([].slice.call(document.querySelectorAll('.theme-dark, .theme-light, .sidebar-thumb-content')));
    nodes.forEach(function (n) {
      n.classList.remove('theme-dark', 'theme-light');
      n.classList.add('theme-' + mode);
    });
    document.documentElement.setAttribute('data-deck-theme', mode);
    if (btn) {
      var next = mode === 'dark' ? '라이트' : '다크';
      btn.textContent = mode === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', next + ' 테마로 바꾸기 (T)');
      btn.title = next + ' 테마로 바꾸기 (T)';
    }
    // The framework re-picks the logo and overlay scope on its next layout pass.
    window.dispatchEvent(new Event('resize'));
  }

  function toggle() {
    var mode = current() === 'dark' ? 'light' : 'dark';
    save(mode);
    apply(mode);
  }

  function init() {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fsi-theme-toggle';
    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); btn.blur(); });
    document.body.appendChild(btn);
    apply(initial());

    document.addEventListener('keydown', function (e) {
      if (e.key !== 't' && e.key !== 'T') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      toggle();
    });
    window.addEventListener('storage', function (e) {
      if (e.key === KEY && valid(e.newValue) && e.newValue !== current()) apply(e.newValue);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
