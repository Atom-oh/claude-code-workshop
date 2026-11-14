/*
 * FSI Claude Code workshop: shared interactive helpers for Remarp decks.
 *
 * StepViz is a port of the step-diagram pages used in the workshop
 * (ClaudeCode_Ch3_Admin_Visual.html and friends): each STEP redraws zones,
 * nodes and edges in an SVG, sends packets along the hot edges, and shows a
 * highlighted code snippet next to the diagram. Colours are theme tokens only,
 * so light and dark decks both work.
 *
 * Slide scripts queue work before this file has loaded:
 *   (window.__fsiq = window.__fsiq || []).push(F => F.stepviz('#id', STEPS));
 */
(function () {
  'use strict';
  if (window.FSI) return;

  const NS = 'http://www.w3.org/2000/svg';
  const TOKEN = {
    accent: 'var(--accent)', info: 'var(--info)', success: 'var(--success)',
    warning: 'var(--warning)', danger: 'var(--danger)',
    muted: 'var(--text-muted)', ink: 'var(--text-primary)'
  };
  const col = c => TOKEN[c] || TOKEN.info;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svgEl = (n, a) => { const e = document.createElementNS(NS, n); for (const k in (a || {})) e.setAttribute(k, a[k]); return e; };
  /* Sidebar thumbnails clone slides, so always look inside the live deck first. */
  const D = sel => document.querySelector('.slide-deck ' + sel) || document.querySelector(sel);
  const slideOf = el => el.closest('.slide');
  const slideIndex = el => Array.from(document.querySelectorAll('.slide-deck .slide')).indexOf(slideOf(el));
  const isActive = el => { const s = slideOf(el); return !!s && s.classList.contains('active'); };

  /* Register ArrowDown/ArrowUp for a slide once the deck exists. A handler
     returns true when it consumed the key and false to let the deck move on. */
  function bindKeys(el, handlers) {
    let tries = 0;
    (function attempt() {
      /* global deck */
      const d = (typeof deck !== 'undefined') ? deck : null;
      const idx = slideIndex(el);
      if (d && d.registerSlideAction && idx >= 0) { d.registerSlideAction(idx, handlers); return; }
      if (tries++ < 100) setTimeout(attempt, 50);
    })();
  }
  function onEnter(el, fn) {
    document.addEventListener('rp:slidechange', e => {
      if (e.detail && e.detail.index === slideIndex(el)) fn();
    });
  }
  function fitText(t, maxW, start, min) {
    let fs = start; t.style.fontSize = fs + 'px';
    try {
      while (t.getComputedTextLength() > maxW && fs > min) { fs -= 0.5; t.style.fontSize = fs + 'px'; }
      if (t.getComputedTextLength() > maxW) { t.setAttribute('textLength', maxW); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    } catch (_) { /* not rendered yet */ }
  }

  /* Index where a trailing comment starts, or -1. A comment is "#" at line
     start, or "//" / " # " after whitespace, and never inside quotes. */
  function commentAt(line) {
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") { q = ch; continue; }
      const pre = i === 0 || /\s/.test(line[i - 1]);
      if (!pre) continue;
      if (ch === '/' && line[i + 1] === '/') return i;
      if (ch === '#' && (line.slice(0, i).trim() === '' || line[i + 1] === ' ')) return i;
    }
    return -1;
  }

  /* ---------------- StepViz ---------------- */
  function stepviz(sel, STEPS, opt) {
    const root = typeof sel === 'string' ? D(sel) : sel;
    if (!root || !STEPS || !STEPS.length) return;
    opt = opt || {};
    /* opt.static: a still diagram. Steps stay (presenter-paced with ↓ ↑ and the buttons), but
       nothing moves on its own: no packets and no flowing edges (fsi.css .sv-static). */
    const STATIC = !!opt.static;
    const W = opt.w || 1180, H = opt.h || 470;
    root.classList.add('sv');
    if (STATIC) root.classList.add('sv-static');
    root.innerHTML =
      '<div class="sv-main">' +
        '<div class="sv-head"><span class="sv-kicker"></span><span class="sv-title"></span></div>' +
        '<p class="sv-body"></p>' +
        '<div class="sv-stage"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img">' +
          '<g class="sv-zones"></g><g class="sv-edges"></g><g class="sv-nodes"></g><g class="sv-pkts"></g></svg></div>' +
        (opt.legend ? '<div class="sv-legend">' + opt.legend.map(l => '<span><i data-c="' + l[0] + '"></i>' + l[1] + '</span>').join('') + '</div>' : '') +
      '</div>' +
      '<div class="sv-side">' +
        '<div class="sv-chd"></div><div class="sv-cpath"></div><pre class="sv-pre"></pre>' +
        '<div class="sv-note"></div><div class="sv-facts"></div>' +
        '<div class="sv-nav"><button type="button" class="sv-prev" aria-label="이전 단계">‹</button>' +
          '<div class="sv-dots"></div><span class="sv-count"></span>' +
          '<button type="button" class="sv-next" aria-label="다음 단계">›</button></div>' +
      '</div>';
    root.querySelectorAll('.sv-legend i').forEach(i => { i.style.background = col(i.dataset.c); });
    const q = c => root.querySelector(c);
    const svg = q('svg'), stage = q('.sv-stage');
    const Z = q('.sv-zones'), Ed = q('.sv-edges'), G = q('.sv-nodes'), P = q('.sv-pkts');
    STEPS.forEach((_, i) => { const d = document.createElement('i'); d.onclick = () => go(i); q('.sv-dots').appendChild(d); });

    let step = 0, pkts = [], t0 = performance.now(), last = t0, settleT = null;
    const center = n => [n.x + n.w / 2, n.y + n.h / 2];
    function edgePath(a, b, curve, side) {
      const [ax, ay] = center(a), [bx, by] = center(b), dy = by - ay, dx = bx - ax;
      if (side === 'b' || side === 't') {
        /* Arc between the bottoms (or tops) of two nodes, bowed by curve. */
        const sy = side === 'b' ? a.y + a.h : a.y, ey = side === 'b' ? b.y + b.h : b.y;
        const k = (curve || 120) * (side === 'b' ? 1 : -1);
        const cy = (side === 'b' ? Math.max(sy, ey) : Math.min(sy, ey)) + k;
        return 'M' + ax + ' ' + sy + ' C ' + ax + ' ' + cy + ' ' + bx + ' ' + cy + ' ' + bx + ' ' + ey;
      }
      let sx = ax, sy = ay, ex = bx, ey = by;
      const vertical = side ? side === 'v' : Math.abs(dy) > Math.abs(dx);
      if (vertical) { sy = dy > 0 ? a.y + a.h : a.y; ey = dy > 0 ? b.y : b.y + b.h; }
      else { sx = dx > 0 ? a.x + a.w : a.x; ex = dx > 0 ? b.x : b.x + b.w; }
      const mx = (sx + ex) / 2 + (vertical ? (curve || 0) : 0), my = (sy + ey) / 2 + (vertical ? 0 : (curve || 0));
      return 'M' + sx + ' ' + sy + ' Q ' + mx + ' ' + my + ' ' + ex + ' ' + ey;
    }

    function apply() {
      const s = STEPS[step];
      q('.sv-kicker').textContent = s.kicker || ('STEP ' + step);
      q('.sv-title').textContent = s.title || '';
      svg.setAttribute('aria-label', (s.kicker || ('STEP ' + step)) + ': ' + (s.title || '') + '. ' + String(s.body || '').replace(/<[^>]+>/g, ''));
      q('.sv-body').innerHTML = s.body || '';
      q('.sv-facts').innerHTML = (s.facts || []).map(f => '<div>' + f + '</div>').join('');
      Array.from(q('.sv-dots').children).forEach((d, i) => d.classList.toggle('on', i === step));
      q('.sv-count').textContent = (step + 1) + ' / ' + STEPS.length;

      Z.innerHTML = '';
      (s.zones || []).forEach(z => {
        const g = svgEl('g', { class: 'sv-zone' + (z.tone ? ' tone' : '') });
        if (z.tone) g.style.color = col(z.tone);
        g.appendChild(svgEl('rect', { x: z.x, y: z.y, width: z.w, height: z.h, rx: 16 }));
        const t = svgEl('text', { x: z.x + 18, y: z.y + 30 }); t.textContent = z.l || ''; g.appendChild(t);
        Z.appendChild(g);
      });

      const byId = {}; (s.nodes || []).forEach(n => { byId[n.id] = n; });
      const hot = s.hot || (s.nodes || []).map(n => n.id);
      G.innerHTML = '';
      (s.nodes || []).forEach(n => {
        const isHot = hot.includes(n.id);
        const g = svgEl('g', { class: 'sv-node' + (isHot ? ' hot' : '') });
        g.style.color = col(n.c); g.style.opacity = isHot ? 1 : 0.4;
        g.appendChild(svgEl('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: 12 }));
        const hasSub = !!n.s;
        const t = svgEl('text', { x: n.x + n.w / 2, y: n.y + (hasSub ? n.h / 2 - 4 : n.h / 2 + 9) });
        t.textContent = n.t; g.appendChild(t);
        let st = null;
        if (hasSub) { st = svgEl('text', { class: 'sub', x: n.x + n.w / 2, y: n.y + n.h / 2 + 24 }); st.textContent = n.s; g.appendChild(st); }
        if (n.ctx != null) {
          g.appendChild(svgEl('rect', { class: 'gauge-bg', x: n.x + 12, y: n.y + n.h - 12, width: n.w - 24, height: 5, rx: 2 }));
          const f = svgEl('rect', { class: 'gauge', x: n.x + 12, y: n.y + n.h - 12, width: 0, height: 5, rx: 2 });
          f.dataset.target = (n.w - 24) * n.ctx; g.appendChild(f);
        }
        G.appendChild(g);
        fitText(t, n.w - 20, 25, 18); if (st) fitText(st, n.w - 20, 20, 16);
      });

      Ed.innerHTML = '';
      const paths = [];
      (s.edges || []).forEach((e, i) => {
        const a = byId[e.f], b = byId[e.t]; if (!a || !b) return;
        const p = svgEl('path', { class: 'sv-edge' + (e.dash ? ' dash' : ' hot'), d: edgePath(a, b, e.curve, e.side) });
        p.style.color = col(e.c || 'muted'); Ed.appendChild(p);
        paths.push({ p, e, i });
        if (e.l) {
          const L = p.getTotalLength(), m = p.getPointAtLength(L * 0.5);
          const bg = svgEl('rect', { class: 'sv-elbg', x: 0, y: m.y - 14, width: 0, height: 28, rx: 6 });
          const t = svgEl('text', { class: 'sv-elab', x: m.x, y: m.y + 7 }); t.textContent = e.l;
          Ed.appendChild(bg); Ed.appendChild(t);
          let tw = 0; try { tw = t.getComputedTextLength(); } catch (_) { tw = e.l.length * 11; }
          bg.setAttribute('x', m.x - tw / 2 - 8); bg.setAttribute('width', tw + 16);
        }
      });

      P.innerHTML = '';
      pkts = paths.filter(x => !STATIC && !x.e.dash && x.e.pkt !== false).map(({ p, e, i }) => {
        const g = svgEl('g', { class: 'sv-pkt' });
        const c = svgEl('circle', { r: 8 }); c.style.fill = col(e.c || 'accent'); g.appendChild(c);
        P.appendChild(g);
        const order = e.o != null ? e.o : i;
        return { g, path: p, t: -order * (s.stagger != null ? s.stagger : 0.3), order };
      });
      s.__span = pkts.reduce((m, k) => Math.max(m, k.order), 0) * (s.stagger != null ? s.stagger : 0.3) + 1.2;

      const sn = s.snip || { lines: [] };
      q('.sv-chd').textContent = sn.hd || '';
      q('.sv-cpath').textContent = sn.path || '';
      q('.sv-pre').innerHTML = (sn.lines || []).map((l, i) => {
        const on = (sn.hl || []).includes(i + 1);
        const ci = commentAt(l);
        let t = ci < 0 ? esc(l) : esc(l.slice(0, ci)) + '<span class="c">' + esc(l.slice(ci)) + '</span>';
        return '<span class="' + (on ? 'on' : '') + '">' + t + '</span>';
      }).join('\n');
      q('.sv-pre').style.display = (sn.lines && sn.lines.length) ? '' : 'none';
      q('.sv-note').innerHTML = sn.note || '';

      stage.classList.remove('settled'); clearTimeout(settleT);
      settleT = setTimeout(() => stage.classList.add('settled'), 6000);
      t0 = performance.now();
      if (reduced()) { pkts.forEach(k => { k.t = 99; }); }
    }
    function go(i) { step = Math.max(0, Math.min(STEPS.length - 1, i)); apply(); }
    q('.sv-prev').onclick = () => go(step - 1);
    q('.sv-next').onclick = () => go(step + 1);

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (isActive(root) || !slideOf(root)) {
        const k = reduced() ? 1 : Math.max(0, Math.min(1, (now - t0) / 3000));
        root.querySelectorAll('.gauge').forEach(f => f.setAttribute('width', (+f.dataset.target * k).toFixed(1)));
        const s = STEPS[step];
        pkts.forEach(p => {
          p.t += dt * 0.55;
          if (s.loop && p.t > s.__span + 0.4) p.t -= s.__span + 0.4 + 0.3;
          const a = Math.min(1, Math.max(0, p.t) / 1.1);
          const L = p.path.getTotalLength(), pt = p.path.getPointAtLength(L * a);
          p.g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
          p.g.style.opacity = (p.t < 0 || a >= 1) ? 0 : 1;
        });
      }
      requestAnimationFrame(tick);
    }
    bindKeys(root, {
      down: () => { if (step < STEPS.length - 1) { go(step + 1); return true; } return false; },
      up: () => { if (step > 0) { go(step - 1); return true; } return false; },
      // an OVERVIEW first step counts as 0, so the count matches the STEP n labels
      state: () => { const b = /overview/i.test(STEPS[0].kicker || '') ? 0 : 1; return { cur: step + b, total: STEPS.length - 1 + b }; }
    });
    onEnter(root, () => go(0));
    go(0); requestAnimationFrame(tick);
    return { go };
  }

  /* ---------------- Pick: click an item, show its detail ----------------
     <div data-pick="name"> ... <button data-key="a">..</button> ... </div>
     <div data-pick-panel="name"><div data-for="a">..</div></div>
     ArrowDown/Up walk the items in order.                                  */
  function pick(name, opts) {
    opts = opts || {};
    const group = D('[data-pick="' + name + '"]');
    const panel = D('[data-pick-panel="' + name + '"]');
    if (!group) return;
    const items = Array.from(group.querySelectorAll('[data-key]'));
    let cur = -1;
    function show(i) {
      cur = i;
      const key = i >= 0 ? items[i].dataset.key : null;
      items.forEach((it, j) => { it.classList.toggle('on', j === i); it.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      group.classList.toggle('has-pick', i >= 0);
      if (panel) panel.querySelectorAll('[data-for]').forEach(d => d.classList.toggle('on', d.dataset.for === key));
      if (panel) panel.classList.toggle('has-pick', i >= 0);
      if (opts.onShow) opts.onShow(key, i);
    }
    items.forEach((it, i) => { it.addEventListener('click', () => show(cur === i && opts.toggle ? -1 : i)); });
    bindKeys(group, {
      down: () => { if (cur < items.length - 1) { show(cur + 1); return true; } return false; },
      up: () => { if (cur > 0) { show(cur - 1); return true; } if (cur === 0) { show(-1); return true; } return false; },
      state: () => ({ cur: cur + 1, total: items.length })
    });
    onEnter(group, () => show(opts.start != null ? opts.start : -1));
    show(opts.start != null ? opts.start : -1);
    return { show };
  }

  /* ---------------- Count up a number when the slide is entered -------- */
  function countUp(sel, to, opts) {
    opts = opts || {};
    const el = D(sel); if (!el) return;
    const dec = opts.decimals || 0, ms = opts.ms || 1400, suf = opts.suffix || '';
    function run() {
      const t0 = performance.now();
      const host = slideOf(el); if (host) host.classList.remove('counted');
      (function f(now) {
        const k = reduced() ? 1 : Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(dec) + suf;
        if (k < 1) requestAnimationFrame(f); else if (host) host.classList.add('counted');
      })(t0);
    }
    onEnter(el, run);
    el.textContent = to.toFixed(dec) + suf;
    if (host0(el)) run();
  }
  const host0 = el => isActive(el);

  /* ---------------- Quick check: click or ArrowDown reveals the answer ---- */
  function quickCheck(sel) {
    const el = D(sel); if (!el) return;
    const set = on => el.classList.toggle('revealed', on);
    el.querySelectorAll('.opt').forEach(o => o.addEventListener('click', () => set(true)));
    bindKeys(el, {
      down: () => { if (!el.classList.contains('revealed')) { set(true); return true; } return false; },
      up: () => { if (el.classList.contains('revealed')) { set(false); return true; } return false; },
      state: () => ({ cur: el.classList.contains('revealed') ? 1 : 0, total: 1 })
    });
    onEnter(el, () => set(false));
  }

  /* ---------------- Cycle: a button (or ArrowDown) steps through states --- */
  function cycle(sel, n, render) {
    const el = D(sel); if (!el) return;
    let i = 0;
    const go = k => { i = (k + n) % n; render(i); };
    el.querySelectorAll('[data-cycle]').forEach(b => b.addEventListener('click', () => go(i + 1)));
    bindKeys(el, {
      down: () => { if (i < n - 1) { go(i + 1); return true; } return false; },
      up: () => { if (i > 0) { go(i - 1); return true; } return false; },
      state: () => ({ cur: i, total: n - 1 })
    });
    onEnter(el, () => go(0));
    go(0);
    return { go };
  }

  const api = { stepviz, pick, countUp, quickCheck, cycle, bindKeys, onEnter, isActive, col };
  window.FSI = api;
  // Dark/light theme switch for every FSI deck (loaded once, next to this file).
  if (!window.__fsiTheme && !document.querySelector('script[src$="assets/theme-toggle.js"]')) {
    const t = document.createElement('script');
    t.src = 'assets/theme-toggle.js';
    document.head.appendChild(t);
  }

  // Chapter cover preview video button (loaded once, next to this file).
  if (!window.__fsiChapterVideo && !document.querySelector('script[src$="assets/chapter-video.js"]')) {
    const v = document.createElement('script');
    v.src = 'assets/chapter-video.js';
    document.head.appendChild(v);
  }

  // Hide/show tab for the left slide sidebar (loaded once, next to this file).
  if (!window.__fsiSidebar && !document.querySelector('script[src$="assets/sidebar-toggle.js"]')) {
    const sb = document.createElement('script');
    sb.src = 'assets/sidebar-toggle.js';
    document.head.appendChild(sb);
  }

  // Hide slides from the sidebar's right-click menu or H (loaded once, next to this file).
  if (!window.__fsiHideSlides && !document.querySelector('script[src$="assets/hide-slides.js"]')) {
    const hs = document.createElement('script');
    hs.src = 'assets/hide-slides.js';
    document.head.appendChild(hs);
  }

  // Shortcuts without Option: N notes, G overview, P/O/I/U/Y pen tools, C clear, 1-9 (loaded once).
  if (!window.__fsiDeckKeys && !document.querySelector('script[src$="assets/deck-keys.js"]')) {
    const dk = document.createElement('script');
    dk.src = 'assets/deck-keys.js';
    document.head.appendChild(dk);
  }

  // Presenter view shows the spoken script first, [요약] and [출처] below (loaded once).
  if (!window.__fsiPresenterNotes && !document.querySelector('script[src$="assets/presenter-notes.js"]')) {
    const pn = document.createElement('script');
    pn.src = 'assets/presenter-notes.js';
    document.head.appendChild(pn);
  }

  const q = window.__fsiq || [];
  window.__fsiq = { push: fn => { try { fn(api); } catch (e) { console.error('[FSI]', e); } } };
  q.forEach(fn => window.__fsiq.push(fn));
})();
