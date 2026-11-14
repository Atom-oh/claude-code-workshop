/* FSI decks: hide slides before presenting (like PowerPoint's "Hide Slide").
 * - Right-click a thumbnail in the left sidebar: "슬라이드 숨기기" / "다시 보이기",
 *   plus "숨긴 슬라이드 모두 보이기". The H key toggles the current slide.
 * - A hidden slide is skipped by next/prev everywhere: arrows, Space, swipe, the
 *   presenter view and fullscreen. Clicking its thumbnail (or #N in the URL) still
 *   opens it, so it stays reachable for questions.
 * - Hidden slides are dimmed and tagged in the sidebar; a badge marks the live
 *   slide while it is hidden (not in fullscreen).
 * - Saved in localStorage (fsi-hidden-slides) by chapter and slide number within
 *   the chapter, so a chapter deck and the merged index.html share the choice;
 *   other open tabs follow. PDF/PPTX exports ignore it and keep every slide.
 * Compiler 3.0.10+ has native hiding: this file then drives the framework's list and only adds
 * the right-click menu and the badge (old fsi-hidden-slides entries are moved over once).
 * Loaded once by assets/stepviz.js.
 */
(function () {
  'use strict';
  if (window.__fsiHideSlides) return;
  window.__fsiHideSlides = true;

  var KEY = 'fsi-hidden-slides';
  var hidden = {};          // slide key -> true
  var keys = [];            // index -> key
  var menu = null, badge = null, f = null;
  // Compiler 3.0.10 and later hide slides natively (sidebar eye, H, presenter "Hide slide") and
  // skip them in navigation. Then this file only keeps its extras (right-click menu, badge) and
  // reads and writes the framework's own list, so every control agrees.
  var NATIVE = false;

  function fw() { return (typeof deck !== 'undefined') ? deck : null; } // the SlideFramework global
  function load() {
    hidden = {};
    try { (JSON.parse(localStorage.getItem(KEY) || '[]') || []).forEach(function (k) { hidden[k] = true; }); } catch (e) { /* bad value or private mode */ }
  }
  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(Object.keys(hidden))); } catch (e) { /* private mode: this page only */ }
  }
  function isHidden(i) { return NATIVE ? !!f.isHidden(i) : !!hidden[keys[i]]; }
  function count() { var n = 0; for (var i = 0; i < keys.length; i++) if (isHidden(i)) n++; return n; }

  function setHidden(i, on) {
    if (i < 0 || i >= keys.length) return;
    if (NATIVE) { f.setHidden(i, !!on); paint(); return; }
    if (on) hidden[keys[i]] = true; else delete hidden[keys[i]];
    store();
    paint();
  }

  function paint() {
    if (f && f.sidebar) {
      f.sidebar.querySelectorAll('.sidebar-thumb').forEach(function (t) {
        var h = isHidden(+t.dataset.index);
        t.classList.toggle('fsi-slide-hidden', h);
        t.title = h ? '숨긴 슬라이드: 발표 중 건너뜀 (오른쪽 클릭으로 다시 보이기)' : '';
      });
    }
    if (badge && f) badge.hidden = !isHidden(f.currentSlide);
    try { if (f && f.presenterView && f.presenterView.presenterWindow && !f.presenterView.presenterWindow.closed) f.presenterView.updatePresenterView(); } catch (e) { /* closed */ }
  }

  // Next/previous slide that is not hidden, or null when none is left that way.
  function step(from, dir) {
    for (var i = from + dir; i >= 0 && i < keys.length; i += dir) if (!isHidden(i)) return i;
    return null;
  }

  var returnFocus = null;
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    var r = returnFocus; returnFocus = null;
    if (r && document.contains(r) && r.focus) r.focus(); else if (document.activeElement && menu.contains(document.activeElement)) document.activeElement.blur();
  }
  function openMenu(i, x, y) {
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'fsi-hide-menu';
      menu.setAttribute('role', 'menu');
      document.body.appendChild(menu);
      document.addEventListener('mousedown', function (e) { if (menu && !menu.contains(e.target)) closeMenu(); }, true);
      // While the menu is open it owns the keyboard: arrows move between items,
      // Escape or Tab closes it, and nothing reaches the deck.
      document.addEventListener('keydown', function (e) {
        if (!menu || menu.hidden) return;
        var btns = Array.prototype.slice.call(menu.querySelectorAll('button'));
        var at = btns.indexOf(document.activeElement);
        if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeMenu(); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          var d = e.key === 'ArrowDown' ? 1 : -1;
          btns[(at + d + btns.length) % btns.length].focus();
          e.preventDefault();
        } else if (e.key === 'Home' || e.key === 'End') { btns[e.key === 'Home' ? 0 : btns.length - 1].focus(); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') { return; }
        else if (/^(Arrow|Page)/.test(e.key)) { e.preventDefault(); }
        else return;
        e.stopPropagation();
      }, true);
      window.addEventListener('blur', closeMenu);
      window.addEventListener('resize', closeMenu);
    }
    if (menu.hidden) returnFocus = document.activeElement !== document.body ? document.activeElement : null;
    var h = isHidden(i);
    var items = [[h ? '슬라이드 다시 보이기' : '슬라이드 숨기기', function () { setHidden(i, !h); }]];
    if (count() > 0) {
      items.push(['숨긴 슬라이드 모두 보이기 (' + count() + '장)', function () {
        if (NATIVE) { for (var j = 0; j < keys.length; j++) if (f.isHidden(j)) f.setHidden(j, false); paint(); return; }
        keys.forEach(function (k) { delete hidden[k]; }); store(); paint();
      }]);
    }
    menu.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'fsi-hide-menu-hd';
    head.textContent = '슬라이드 ' + (i + 1);
    menu.appendChild(head);
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.textContent = it[0];
      b.addEventListener('click', function (e) { e.stopPropagation(); it[1](); closeMenu(); });
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
      menu.appendChild(b);
    });
    menu.hidden = false;
    var r = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, window.innerWidth - r.width - 8) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - r.height - 8) + 'px';
    menu.querySelector('button').focus();
  }

  function init() {
    f = fw();
    if (!f || !f.slides) return;

    // Key = chapter block + slide number inside that block.
    var seen = {};
    keys = Array.prototype.map.call(f.slides, function (s) {
      var b = s.dataset.block || location.pathname.split('/').pop();
      seen[b] = (seen[b] || 0) + 1;
      return b + ':' + seen[b];
    });
    load();

    NATIVE = typeof f.toggleHidden === 'function' && typeof f.setHidden === 'function' && typeof f.isHidden === 'function';
    if (NATIVE) {
      // One-time move of slides hidden with the old key into the framework's list.
      var moved = false;
      for (var m = 0; m < keys.length; m++) if (hidden[keys[m]]) { if (!f.isHidden(m)) f.setHidden(m, true); moved = true; }
      if (moved) { try { localStorage.removeItem(KEY); } catch (e) { /* private mode */ } }
      hidden = {};
      initExtras();
      document.addEventListener('rp:hiddenchange', paint);
      paint();
      return;
    }

    // Skip hidden slides on next/prev (keys, Space, swipe, presenter view, step-through ends).
    var show = f.showSlide.bind(f);
    f.next = function () { var i = step(f.currentSlide, 1); if (i !== null) show(i); };
    f.prev = function () { var i = step(f.currentSlide, -1); if (i !== null) show(i); };

    // Presenter view: its "Next" preview should be the next slide that will show.
    var pvPatched = null;
    function patchPresenter() {
      var pv = f.presenterView;
      if (!pv || pv === pvPatched || !pv.updatePresenterView) return;
      pvPatched = pv;
      var orig = pv.updatePresenterView.bind(pv);
      pv.updatePresenterView = function () {
        orig();
        try {
          if (!pv.presenterWindow || pv.presenterWindow.closed) return;
          var doc = pv.presenterWindow.document, el = doc.getElementById('p-next');
          if (!el || !isHidden(f.currentSlide + 1)) return;
          var n = step(f.currentSlide, 1);
          if (n === null) el.innerHTML = '<div class="end-message">End of presentation</div>';
          else pv._renderSlidePreview(doc, el, f.slides[n], true);
        } catch (e) { /* presenter window closed mid-update */ }
      };
    }
    var origOpen = f.openPresenterView && f.openPresenterView.bind(f);
    if (origOpen) f.openPresenterView = function () { var r = origOpen(); patchPresenter(); try { f.presenterView && f.presenterView.updatePresenterView(); } catch (e) {} return r; };
    patchPresenter();

    initExtras();
    document.addEventListener('keydown', function (e) {
      // e.code also matches with a Korean input method active (e.key is then 'ㅗ').
      if (e.key !== 'h' && e.key !== 'H' && e.code !== 'KeyH') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.body.classList.contains('rp-search-open')) return;
      setHidden(f.currentSlide, !isHidden(f.currentSlide));
    });

    window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); paint(); } });
    paint();
  }

  // Right-click menu on sidebar thumbnails and the "hidden" badge (both modes).
  function initExtras() {
    badge = document.createElement('div');
    badge.className = 'fsi-hidden-badge';
    badge.hidden = true;
    badge.textContent = '숨긴 슬라이드 (발표 중 건너뜀)';
    document.body.appendChild(badge);
    document.addEventListener('rp:slidechange', paint);

    if (f.sidebar) {
      f.sidebar.addEventListener('contextmenu', function (e) {
        var t = e.target.closest('.sidebar-thumb');
        if (!t) return;
        e.preventDefault();
        openMenu(+t.dataset.index, e.clientX, e.clientY);
      });
    }

  }

  // SlideFramework builds the deck and sidebar on DOMContentLoaded; run after it.
  function later() { setTimeout(init, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later);
  else later();
})();
