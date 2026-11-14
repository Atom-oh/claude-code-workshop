/* Presenter view: spoken script first, [요약] and [출처] below it, and a step cue under the
 * arrow buttons (loaded once by stepviz.js).
 *
 * The compiled notes read "<cue emoji> [N min] [요약]" bullets, then the script, then "[출처]",
 * each a blank-line paragraph (README section 3). On stage the presenter reads the script, so
 * the view puts it at the top and moves the summary and sources under a divider in smaller,
 * dimmer text. The cue emoji and "[N min]" stay on a line above the script. A "↓" in the
 * script marks where the presenter presses ↓ for the next step, drawn as an orange badge. The .md sources and
 * the PDF are unchanged: this only reorders what the presenter window shows.
 *
 * common/ is overwritten by every compiler build, so this file patches
 * PresenterView.prototype.renderRichNotes at run time. If that method is gone, the notes keep
 * the compiler's own order and the console says so.
 */
(function () {
  'use strict';
  if (window.__fsiPresenterNotes) return;
  window.__fsiPresenterNotes = true;

  // First line of the summary paragraph, with whatever precedes the tag (cue emoji, [N min]).
  var SUMMARY = /^([^\n]*?)\[요약\]/;
  var SOURCES = /^\s*\[출처\]/;

  // Split on blank lines; returns null when there is nothing to move.
  function split(text) {
    var paras = String(text).split(/\n[ \t]*\n+/);
    var script = [], meta = [], lead = '';
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i];
      if (!p.trim()) continue;
      var m = SUMMARY.exec(p);
      if (m) {
        lead = m[1].trim();
        meta.push(p.slice(m[1].length));
      } else if (SOURCES.test(p)) {
        meta.push(p);
      } else {
        script.push(p);
      }
    }
    if (!meta.length || !script.length) return null;
    return { lead: lead, script: script.join('\n\n'), meta: meta.join('\n\n') };
  }

  function patch() {
    var PV = window.PresenterView || (typeof PresenterView !== 'undefined' ? PresenterView : null); // eslint-disable-line no-undef
    if (!PV || !PV.prototype) return false;
    if (PV.prototype.__fsiNotes) return true;
    var orig = PV.prototype.renderRichNotes;
    if (typeof orig !== 'function') return false;
    PV.prototype.renderRichNotes = function (text) {
      var parts = split(text || '');
      if (!parts) return orig.call(this, text);
      var top = orig.call(this, parts.script), bottom = orig.call(this, parts.meta);
      if (typeof top !== 'string' || typeof bottom !== 'string') return orig.call(this, text);
      var head = '';
      if (parts.lead) {
        head = orig.call(this, parts.lead);
        if (typeof head !== 'string') return orig.call(this, text);
        head = '<div class="fsi-notes-lead" style="font-size:0.82em;opacity:0.8;margin-bottom:0.5em;">' + head + '</div>';
      }
      return head + top +
        '<div class="fsi-notes-meta" style="margin-top:1.4em;padding-top:0.9em;border-top:1px solid #2d3250;' +
        'font-size:0.82em;opacity:0.72;">' + bottom + '</div>';
    };
    // "↓" in the script marks where the presenter presses ↓ for the next step on the slide.
    var reorder = PV.prototype.renderRichNotes;
    PV.prototype.renderRichNotes = function (text) {
      var html = reorder.call(this, text);
      if (typeof html !== 'string') return html;
      return html.replace(/↓/g, '<span class="fsi-step-mark" title="여기서 ↓" style="display:inline-block;' +
        'margin:0 0.15em;padding:0 0.35em;border-radius:4px;background:#ffb454;color:#1a1a2e;' +
        'font-weight:800;line-height:1.3;">↓</span>');
    };
    PV.prototype.__fsiNotes = true;
    return true;
  }

  /* Step cue under the arrow buttons: tells the presenter whether ↓ (or →) still has a step on
   * this slide, or the slide is done and the next press moves on. Scenes report their place through
   * a state() function on the handlers they register with deck.registerSlideAction (F.bindKeys);
   * Remarp fragments are read from the framework's fragment state. */
  function cueFor(fw) {
    var i = fw.currentSlide;
    var fr = fw.fragmentState && fw.fragmentState[i];
    if (fr && fr.fragments && fr.fragments.length && fr.currentIndex < fr.fragments.length - 1) {
      return { more: true, text: '→ 다음 항목 있음 (' + (fr.currentIndex + 1) + '/' + fr.fragments.length + ')' };
    }
    var act = fw.slideActions && fw.slideActions[i];
    if (act && typeof act.state === 'function') {
      var st = null;
      try { st = act.state(); } catch (e) { st = null; }
      if (st && st.total >= 1) {
        if (st.cur < st.total) return { more: true, text: '↓ 다음 단계 있음 (지금 ' + st.cur + '/' + st.total + ')' };
        return { more: false, text: '✓ 마지막 단계 (' + st.total + '/' + st.total + '), 누르면 다음 슬라이드' };
      }
    } else if (act && act.down) {
      return { more: true, text: '↓ 이 장에 단계가 있음' };
    }
    return { more: false, text: '✓ 단계 없음, 누르면 다음 슬라이드' };
  }

  function renderCue(pv) {
    var win = pv.presenterWindow;
    if (!win || win.closed || !pv.framework) return;
    var doc = win.document, nav = doc.querySelector('.presenter-nav');
    if (!nav) return;
    var box = doc.getElementById('fsi-step-cue');
    if (!box) {
      nav.style.flexWrap = 'wrap';
      box = doc.createElement('div');
      box.id = 'fsi-step-cue';
      box.setAttribute('role', 'status');
      box.style.cssText = 'flex-basis:100%;text-align:center;font-size:15px;font-weight:600;' +
        'padding:5px 10px;border-radius:6px;border:1px solid;';
      nav.appendChild(box);
    }
    var c = cueFor(pv.framework);
    if (box.textContent !== c.text) box.textContent = c.text;
    box.dataset.more = c.more ? '1' : '0';
    box.style.color = c.more ? '#ffb454' : '#7ee2a8';
    box.style.borderColor = c.more ? '#ffb454' : '#3f8f62';
    box.style.background = c.more ? 'rgba(255,180,84,0.10)' : 'rgba(126,226,168,0.08)';
  }

  function patchCue() {
    var PV = window.PresenterView || (typeof PresenterView !== 'undefined' ? PresenterView : null); // eslint-disable-line no-undef
    if (!PV || !PV.prototype || typeof PV.prototype.updatePresenterView !== 'function') return false;
    if (PV.prototype.__fsiCue) return true;
    var orig = PV.prototype.updatePresenterView;
    PV.prototype.updatePresenterView = function () {
      var r = orig.apply(this, arguments);
      var self = this;
      try { renderCue(self); } catch (e) { /* the cue is optional */ }
      // Clicks on the live slide or the preview change the step without a presenter update.
      if (!self.__fsiCueTimer) {
        self.__fsiCueTimer = setInterval(function () {
          if (!self.presenterWindow || self.presenterWindow.closed) { clearInterval(self.__fsiCueTimer); self.__fsiCueTimer = null; return; }
          try { renderCue(self); } catch (e) { /* ignore */ }
        }, 250);
      }
      return r;
    };
    PV.prototype.__fsiCue = true;
    return true;
  }

  var cueTries = 0;
  (function waitCue() {
    if (patchCue()) return;
    if (cueTries++ < 100) setTimeout(waitCue, 100);
  })();

  var tries = 0;
  (function wait() {
    if (patch()) return;
    if (tries++ < 100) { setTimeout(wait, 100); return; }
    if (typeof console !== 'undefined') {
      console.warn('[presenter-notes] PresenterView.renderRichNotes not found; notes keep the compiler order.');
    }
  })();
})();
