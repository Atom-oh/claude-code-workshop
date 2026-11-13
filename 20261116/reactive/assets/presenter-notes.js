/* Presenter view: spoken script first, [요약] and [출처] below it (loaded once by stepviz.js).
 *
 * The compiled notes read "<cue emoji> [N min] [요약]" bullets, then the script, then "[출처]",
 * each a blank-line paragraph (README section 3). On stage the presenter reads the script, so
 * the view puts it at the top and moves the summary and sources under a divider in smaller,
 * dimmer text. The cue emoji and "[N min]" stay on a line above the script. The .md sources and
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
    PV.prototype.__fsiNotes = true;
    return true;
  }

  var tries = 0;
  (function wait() {
    if (patch()) return;
    if (tries++ < 100) { setTimeout(wait, 100); return; }
    if (typeof console !== 'undefined') {
      console.warn('[presenter-notes] PresenterView.renderRichNotes not found; notes keep the compiler order.');
    }
  })();
})();
