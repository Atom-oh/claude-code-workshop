/* FSI decks: a "1분 미리보기" button on each chapter cover.
 * The first slide of every block (data-block="0N-…") is its cover. The button opens
 * the chapter's one-minute preview video (../media/chapters/chN-preview.mp4, the
 * landscape Short) in an in-deck player. While the player is open the deck gets no
 * keys (the video's own controls still do), Tab stays inside the player, and Esc,
 * the backdrop, ✕ or any slide change (e.g. from the presenter view) closes it; Esc,
 * the backdrop and ✕ return focus to the cover button (a slide change leaves focus alone).
 * Loaded once by assets/stepviz.js.
 */
(function () {
  'use strict';
  if (window.__fsiChapterVideo) return;
  window.__fsiChapterVideo = true;

  var BASE = '../media/chapters/';
  var modal = null;
  var video = null;
  var opener = null;
  var watch = null;

  function src(n) { return BASE + 'ch' + n + '-preview.mp4'; }

  // restoreFocus=false when the deck has already left the cover (slide change):
  // focusing the fading-out button would leave a later Space/Enter aimed at it.
  function close(restoreFocus) {
    if (!modal || modal.hidden) return;
    video.pause();
    modal.hidden = true;
    if (watch) { watch.disconnect(); watch = null; }
    if (restoreFocus !== false && opener && document.contains(opener)) opener.focus();
  }

  function open(n, btn) {
    if (!modal) build();
    opener = btn || null;
    // Close if the deck leaves this cover (keyboard elsewhere, presenter view, swipe).
    var slide = btn && btn.closest('.slide');
    if (slide && window.MutationObserver) {
      watch = new MutationObserver(function () { if (!slide.classList.contains('active')) close(false); });
      watch.observe(slide, { attributes: true, attributeFilter: ['class'] });
    }
    video.src = src(n);
    video.poster = BASE + 'ch' + n + '-preview.jpg';
    modal.querySelector('.fsi-cv-title').textContent = 'Chapter ' + n + ' · 1분 미리보기';
    modal.querySelector('.fsi-cv-open').href = src(n);
    modal.hidden = false;
    video.currentTime = 0;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay with sound may be blocked: controls stay */ });
    modal.querySelector('.fsi-cv-close').focus();
  }

  function build() {
    modal = document.createElement('div');
    modal.className = 'fsi-cv';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '챕터 미리보기 영상');
    modal.innerHTML =
      '<div class="fsi-cv-box">' +
      '<div class="fsi-cv-bar"><span class="fsi-cv-title"></span>' +
      '<a class="fsi-cv-open" target="_blank" rel="noopener">새 탭에서 열기</a>' +
      '<button type="button" class="fsi-cv-close" aria-label="닫기 (Esc)">✕</button></div>' +
      '<video class="fsi-cv-video" controls playsinline preload="none"></video>' +
      '</div>';
    document.body.appendChild(modal);
    video = modal.querySelector('video');
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.fsi-cv-close').addEventListener('click', close);
    // Inside the player: keys reach the focused control (Space/arrows on the video),
    // then stop here so the deck never sees them. Tab is kept inside the player.
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') {
        var f = [].slice.call(modal.querySelectorAll('button, a[href], video'));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
      e.stopPropagation();
    });
    // Focus outside the player (e.g. after a click on the page): hold deck shortcuts.
    window.addEventListener('keydown', function (e) {
      if (modal.hidden || modal.contains(e.target)) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      e.stopPropagation();
    }, true);
  }

  function init() {
    if (!document.querySelector('link[href$="assets/chapter-video.css"]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'assets/chapter-video.css';
      document.head.appendChild(l);
    }
    var seen = {};
    document.querySelectorAll('.slide-deck .slide[data-block]').forEach(function (slide) {
      var block = slide.getAttribute('data-block');
      if (seen[block]) return;
      seen[block] = true;
      var m = /^0?(\d)-/.exec(block);
      if (!m) return;
      var n = m[1];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fsi-cv-btn';
      btn.textContent = '▶ 1분 미리보기';
      btn.setAttribute('aria-label', 'Chapter ' + n + ' 1분 미리보기 영상 재생');
      btn.addEventListener('click', function (e) { e.stopPropagation(); open(n, btn); });
      btn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); open(n, btn); }
      });
      slide.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
