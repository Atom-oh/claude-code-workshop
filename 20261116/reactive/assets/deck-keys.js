/* FSI deck shortcuts without Option (loaded once by assets/stepviz.js).
 *
 *   N           presenter view with notes   (was P)
 *   G           slide overview              (was O)
 *   P O I U Y   laser, pen, highlighter, eraser, magnifier   (was Option+P/O/I/U/Y)
 *   C           clear this slide's drawing  (was Option+T; T stays the theme switch)
 *   1-9         stroke size 1-3, colour 4-9, magnifier zoom 1-3   (was Option+1-9)
 *   C and 1-9 act only while the pen is on, so digits stay free for slides otherwise.
 *   F S H T, arrows, Space, Esc, /   unchanged
 *
 * common/ is overwritten by every compiler build, so this file patches the framework at run
 * time instead of editing it: SlideFramework.prototype.getKeyAction (used by the deck and the
 * presenter window) and the shared DeckPen controller's handleKey (the pen keys of both
 * windows go through it). Option chords keep working. P and O leave the framework only once the
 * pen patch is in place, so a compiler change that breaks the patch leaves the old keys working
 * and logs a console warning instead of failing silently.
 */
(function () {
  'use strict';
  if (window.__fsiDeckKeys) return;
  window.__fsiDeckKeys = true;

  // Framework actions by e.key. Korean IME jamo (ㅜ = N, ㅎ = G) are listed so the keys also
  // work while the Korean input method is on.
  var ACTIONS = { n: 'presenter', N: 'presenter', 'ㅜ': 'presenter', g: 'overview', G: 'overview', 'ㅎ': 'overview' };
  // Keys the framework must no longer take once the pen owns them.
  var FREED = { p: 1, P: 1, o: 1, O: 1 };
  var penReady = false;   // pen wrapper in place
  var fwReady = false;    // framework key map in place (N/G exist)
  // Plain key code -> the Option chord code deck-pen understands. TOOLS work any time;
  // C and the digits only while the pen is on.
  var TOOLS = { KeyP: 'KeyP', KeyO: 'KeyO', KeyI: 'KeyI', KeyU: 'KeyU', KeyY: 'KeyY' };

  function typing(t) {
    return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''));
  }
  function searchOpen(t) {
    var doc = (t && t.ownerDocument) || document;
    return !!(doc.body && doc.body.classList.contains('rp-search-open'));
  }

  function patchFramework() {
    var FW = window.SlideFramework || (typeof SlideFramework !== 'undefined' ? SlideFramework : null); // eslint-disable-line no-undef
    if (!FW || !FW.prototype) return false;
    if (FW.prototype.__fsiKeys) { fwReady = true; return true; }
    var orig = FW.prototype.getKeyAction;
    if (typeof orig !== 'function') return false;
    FW.prototype.getKeyAction = function (key) {
      if (Object.prototype.hasOwnProperty.call(ACTIONS, key)) return ACTIONS[key];
      if (penReady && fwReady && FREED[key]) return null;
      return orig.call(this, key);
    };
    FW.prototype.__fsiKeys = true;
    fwReady = true;
    return true;
  }

  function patchPen() {
    var pen = window.DeckPen;
    var c = pen && pen.controller;
    if (!c) return false;
    if (c.__fsiKeys) return true;
    var orig = c.handleKey;
    if (typeof orig !== 'function') return false;
    c.handleKey = function (event) {
      // Only while N/G exist too: otherwise P/O must stay the presenter view and overview.
      if (fwReady && event && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
          !typing(event.target) && !searchOpen(event.target)) {
        var code = TOOLS[event.code] || null;
        if (!code && c.active) {
          if (event.code === 'KeyC') code = 'KeyT';
          else if (/^Digit[1-9]$/.test(event.code || '')) code = event.code;
        }
        if (code) {
          return orig.call(c, {
            type: event.type || 'keydown', code: code, key: event.key, keyCode: event.keyCode,
            repeat: event.repeat, isComposing: event.isComposing, target: event.target,
            altKey: true, ctrlKey: false, metaKey: false, shiftKey: false,
            getModifierState: function (m) { return m === 'Alt'; },
            preventDefault: function () { event.preventDefault(); },
            stopImmediatePropagation: function () { event.stopImmediatePropagation(); },
            stopPropagation: function () { event.stopPropagation(); }
          });
        }
      }
      return orig.call(c, event);
    };
    c.__fsiKeys = true;
    penReady = true;
    return true;
  }

  function patchHint() {
    var hints = document.querySelectorAll('.nav-hint');
    for (var i = 0; i < hints.length; i++) {
      if (!fwReady) continue;   // framework hint (P/O) stays true
      hints[i].textContent = penReady
        ? '← → Space  |  F: Fullscreen  |  N: Notes  |  G: Overview  |  P O I U Y: Pen  |  C: Clear'
        : '← → Space  |  F: Fullscreen  |  N: Notes  |  G: Overview';
    }
  }

  patchFramework();
  // The pen controller and the hint exist only after the framework's DOMContentLoaded setup.
  var tries = 0;
  (function wait() {
    var fw = patchFramework();
    var pen = patchPen();
    if (document.readyState !== 'loading') patchHint();
    if (!fw || !pen) {
      if (tries++ < 100) { setTimeout(wait, 100); return; }
      if (typeof console !== 'undefined') {
        var missing = [];
        if (!fw) missing.push('SlideFramework.getKeyAction');
        if (!pen) missing.push('DeckPen.controller.handleKey');
        console.warn('[deck-keys] ' + missing.join(' and ') + ' not found; ' +
          (fw ? 'N/G work, ' : 'N/G are off, ') +
          'single-key pen shortcuts are off, P/O keep their framework meaning (presenter view, overview), Option chords still work.');
      }
    }
  })();
})();
