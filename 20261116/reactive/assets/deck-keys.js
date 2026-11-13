/* FSI deck shortcuts without Option (loaded once by assets/stepviz.js).
 *
 *   N           presenter view with notes   (was P)
 *   G           slide overview              (was O)
 *   P O I U Y   laser, pen, highlighter, eraser, magnifier   (was Option+P/O/I/U/Y)
 *   C           clear this slide's drawing  (was Option+T; T stays the theme switch)
 *   1-9         stroke size 1-3, colour 4-9, magnifier zoom 1-3   (was Option+1-9)
 *   F S H T, arrows, Space, Esc, /   unchanged
 *
 * common/ is overwritten by every compiler build, so this file patches the framework at run
 * time instead of editing it: SlideFramework.prototype.getKeyAction (used by the deck and the
 * presenter window) and the shared DeckPen controller's handleKey (the pen keys of both
 * windows go through it). Option chords keep working.
 */
(function () {
  'use strict';
  if (window.__fsiDeckKeys) return;
  window.__fsiDeckKeys = true;

  // Framework actions by e.key. Korean IME jamo (ㅜ = N, ㅎ = G) are listed so the keys also
  // work while the Korean input method is on.
  var ACTIONS = { n: 'presenter', N: 'presenter', 'ㅜ': 'presenter', g: 'overview', G: 'overview', 'ㅎ': 'overview' };
  // Keys the framework must no longer take: P and O now belong to the pen.
  var FREED = { p: 1, P: 1, o: 1, O: 1 };
  // Plain key code -> the Option chord code deck-pen understands.
  var PEN = { KeyP: 'KeyP', KeyO: 'KeyO', KeyI: 'KeyI', KeyU: 'KeyU', KeyY: 'KeyY', KeyC: 'KeyT' };

  function typing(t) {
    return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''));
  }
  function searchOpen(t) {
    var doc = (t && t.ownerDocument) || document;
    return !!(doc.body && doc.body.classList.contains('rp-search-open'));
  }

  function patchFramework() {
    var FW = window.SlideFramework || (typeof SlideFramework !== 'undefined' ? SlideFramework : null); // eslint-disable-line no-undef
    if (!FW || !FW.prototype || FW.prototype.__fsiKeys) return !!FW;
    var orig = FW.prototype.getKeyAction;
    FW.prototype.getKeyAction = function (key) {
      if (Object.prototype.hasOwnProperty.call(ACTIONS, key)) return ACTIONS[key];
      if (FREED[key]) return null;
      return orig.call(this, key);
    };
    FW.prototype.__fsiKeys = true;
    return true;
  }

  function patchPen() {
    var pen = window.DeckPen;
    var c = pen && pen.controller;
    if (!c || c.__fsiKeys) return !!c;
    var orig = c.handleKey;
    c.handleKey = function (event) {
      if (event && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
          !typing(event.target) && !searchOpen(event.target)) {
        var code = PEN[event.code] || (/^Digit[1-9]$/.test(event.code || '') ? event.code : null);
        if (code) {
          return orig.call(c, {
            code: code, key: event.key, keyCode: event.keyCode, repeat: event.repeat,
            isComposing: event.isComposing, target: event.target,
            altKey: true, ctrlKey: false, metaKey: false, shiftKey: false,
            preventDefault: function () { event.preventDefault(); },
            stopImmediatePropagation: function () { event.stopImmediatePropagation(); },
            stopPropagation: function () { event.stopPropagation(); }
          });
        }
      }
      return orig.call(c, event);
    };
    c.__fsiKeys = true;
    return true;
  }

  function patchHint() {
    var hints = document.querySelectorAll('.nav-hint');
    for (var i = 0; i < hints.length; i++) {
      hints[i].textContent = '← → Space  |  F: Fullscreen  |  N: Notes  |  G: Overview  |  P O I U: Pen';
    }
  }

  patchFramework();
  // The pen controller and the hint exist only after the framework's DOMContentLoaded setup.
  var tries = 0;
  (function wait() {
    var fw = patchFramework();
    var pen = patchPen();
    if (document.readyState !== 'loading') patchHint();
    if ((!fw || !pen) && tries++ < 100) setTimeout(wait, 100);
  })();
})();
