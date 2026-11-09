/* FSI decks: dark/light theme switch. Dark is the default; light is the projector
 * mode (higher contrast), shared with the eDM, portal and labs through fsi-theme.
 * The decks are built dark (`theme.mode: dark`), and every FSI style uses theme
 * tokens, so switching only swaps the framework's `.theme-dark` / `.theme-light`
 * classes on the deck and on slides that carry one (the covers).
 * - Button (top right) or the T key toggles. Slide thumbnails follow too.
 * - ?theme=light|dark in the URL wins (and is saved), then the site-wide choice
 *   (fsi-theme), then this deck's older key, then dark.
 * - An open presenter view is repainted; other tabs of the deck follow through
 *   the storage event.
 * Loaded once by assets/stepviz.js.
 */
(function () {
  'use strict';
  if (window.__fsiTheme) return;
  window.__fsiTheme = true;

  var KEY = 'fsi-theme';           // shared by every page of the event site
  var LEGACY = 'fsi-deck-theme';   // read once for choices saved before the shared key
  var btn = null;

  function read() {
    try { return localStorage.getItem(KEY) || localStorage.getItem(LEGACY); } catch (e) { return null; }
  }
  function save(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode: keep it per page */ }
  }
  function valid(m) { return m === 'dark' || m === 'light'; }
  function initial() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('theme'); } catch (e) { /* old browsers */ }
    if (valid(q)) { save(q); return q; }
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
      var next = mode === 'dark' ? '프로젝터 모드(라이트)로 전환' : '다크 모드로 전환';
      btn.textContent = mode === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', next + ' (T)');
      btn.title = next + ' (T)';
    }
    repaintPresenter();
  }

  // The presenter window copies <html> classes once and redraws its previews only on
  // slide changes, so push the new theme to it now.
  function repaintPresenter() {
    var fw = (typeof deck !== 'undefined') ? deck : null; // the SlideFramework global
    var pv = fw && fw.presenterView;
    var w = pv && pv.presenterWindow;
    if (!w || w.closed) return;
    try {
      w.document.documentElement.className = document.documentElement.className;
      pv.updatePresenterView();
    } catch (e) { /* window closed mid-update */ }
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
    btn.setAttribute('aria-keyshortcuts', 'T');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
      if (e.detail > 0) btn.blur(); // pointer click: give arrow keys back to the deck
    });
    // The deck maps Space to "next slide"; keep Space and Enter on the button.
    btn.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    document.body.appendChild(btn);
    apply(initial());

    document.addEventListener('keydown', function (e) {
      // e.code also matches with a Korean input method active (e.key is then 'ㅅ').
      if (e.key !== 't' && e.key !== 'T' && e.code !== 'KeyT') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
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
