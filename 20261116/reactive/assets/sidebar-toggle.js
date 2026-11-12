/* FSI decks: a hide/show button for the left slide-thumbnail sidebar.
 * The framework already toggles the sidebar with the S key but shows no control,
 * and the sidebar comes back on every load. This adds:
 * - a small tab on the sidebar's edge (‹ hides, › shows), hidden in fullscreen,
 *   overview and print;
 * - the choice saved in localStorage (fsi-deck-sidebar), shared by all six decks;
 * - S with a Korean input method active (e.key is then 'ㄴ', which the framework
 *   keymap does not match).
 * Loaded once by assets/stepviz.js.
 */
(function () {
  'use strict';
  if (window.__fsiSidebar) return;
  window.__fsiSidebar = true;

  var KEY = 'fsi-deck-sidebar';    // 'hidden' | 'shown'
  var btn = null;

  function fw() { return (typeof deck !== 'undefined') ? deck : null; } // the SlideFramework global
  function visible() { return document.body.classList.contains('sidebar-visible'); }
  function save(v) { try { localStorage.setItem(KEY, v ? 'shown' : 'hidden'); } catch (e) { /* private mode */ } }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function sync() {
    if (!btn) return;
    var v = visible();
    btn.classList.toggle('is-open', v);
    btn.textContent = v ? '‹' : '›';
    var label = v ? '슬라이드 목록 숨기기 (S)' : '슬라이드 목록 보이기 (S)';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    btn.title = label;
  }

  function toggle() {
    var f = fw();
    if (!f || document.fullscreenElement) return;
    f.toggleSidebar();
    save(visible());
    sync();
  }

  function init() {
    var f = fw();
    if (!f || !f.sidebar) return;

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fsi-sidebar-toggle';
    btn.setAttribute('aria-keyshortcuts', 'S');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
      if (e.detail > 0) btn.blur(); // pointer click: give arrow keys back to the deck
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
    document.body.appendChild(btn);

    if (saved() === 'hidden' && visible() && !document.fullscreenElement) f.hideSidebar();
    sync();

    // The framework's S key, fullscreen exit and resize all flip the body class.
    new MutationObserver(function () {
      var was = btn.classList.contains('is-open');
      sync();
      // Remember an S-key toggle (not the automatic hide/restore around fullscreen).
      if (was !== visible() && !document.fullscreenElement && !document.body.dataset.fsiFsJustExited) save(visible());
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    document.addEventListener('fullscreenchange', function () {
      if (document.fullscreenElement) return;
      // The framework restores the sidebar it hid on entering fullscreen; honour a saved "hidden".
      document.body.dataset.fsiFsJustExited = '1';
      setTimeout(function () {
        delete document.body.dataset.fsiFsJustExited;
        if (saved() === 'hidden' && visible()) { f.hideSidebar(); sync(); }
      }, 0);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 's' || e.key === 'S') return;           // the framework handles these
      if (e.code !== 'KeyS' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.body.classList.contains('rp-search-open')) return;
      toggle();
    });
  }

  // SlideFramework builds the sidebar on DOMContentLoaded; run after it.
  function later() { setTimeout(init, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later);
  else later();
})();
