/*
 * FSI flow scenes: a sketched cutaway (cabinet projection) with a moving camera,
 * a glowing packet that follows real paths, numbered callouts on leader lines,
 * and small line-art figures from the vendored line-art library.
 *
 * One scene = one plain data object (see 02-ch2-bedrock-safe.md). The scene
 * plays as one continuous loop that starts on the full picture (so the PDF
 * export and prefers-reduced-motion show the complete scene), walks through
 * its phases with the camera following the action, and returns to the full
 * picture. Clicking the stage pauses and resumes.
 *
 *   import('./assets/flowscene.js').then(m => m.mount('#c2-pl', SPEC));
 *
 * Colours are theme tokens only, so dark and light decks both work.
 */
import { el, pen, blot, paint, limb, shoe, place, inkDefs, PEN, PAPER, curve } from './lineart/ink.js';
import { gait } from './lineart/gait.js';
import { ease, clamp, spring } from './lineart/motion.js';

const NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const D = sel => document.querySelector('.slide-deck ' + sel) || document.querySelector(sel);

export function mount(sel, S) {
  const host = D(sel);
  if (!host || host.dataset.fsMounted) return;
  host.dataset.fsMounted = '1';
  const slide = host.closest('.slide');
  const stage = host.querySelector('.fs-stage');
  const W = S.W || 900, H = S.H || 520, K = S.K || 30, OX = S.OX || 34, OY = S.OY || 380;
  const pj = (x, y, z = 0) => [OX + x * K + y * K * 0.5, OY - y * K * 0.3 - z * K];
  const P = (...a) => a.map(p => pj(...p).map(v => v.toFixed(1)).join(',')).join(' ');

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': S.aria || '' });
  stage.appendChild(svg);
  const { filter } = inkDefs(svg, sel.replace(/\W/g, ''));
  svg.style.color = 'var(--text-primary)';
  const defs = svg.querySelector('defs');
  const gid = sel.replace(/\W/g, '') + '-glow';
  const glow = el('filter', { id: gid, x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs);
  el('feGaussianBlur', { stdDeviation: 3.2, result: 'b' }, glow);
  const mg = el('feMerge', {}, glow); el('feMergeNode', { in: 'b' }, mg); el('feMergeNode', { in: 'SourceGraphic' }, mg);
  const L0 = el('g', { filter }, svg), L1 = el('g', { filter }, svg), L2 = el('g', {}, svg), L3 = el('g', {}, svg);

  function box(parent, [x, y, z, w, d, h], cls = '') {
    const g = el('g', { class: 'fs-box ' + cls }, parent);
    el('polygon', { class: 'fs-face fs-front', points: P([x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]) }, g);
    el('polygon', { class: 'fs-face fs-side', points: P([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]) }, g);
    el('polygon', { class: 'fs-face fs-top', points: P([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]) }, g);
    return g;
  }
  const txt = (parent, [x, y], s, cls = 'fs-lbl', anchor = 'middle') => {
    const t = el('text', { x: x.toFixed(1), y: y.toFixed(1), class: cls, 'text-anchor': anchor }, parent); t.textContent = s; return t;
  };

  // zones (ground slabs) and their labels
  (S.zones || []).forEach(z => { box(L0, z.box, 'fs-zone'); if (z.label) txt(L3, pj(...z.labelAt), z.label, z.sub ? 'fs-sub' : 'fs-lbl', 'start'); });

  // parts: boxes, ellipses (clouds), pipes, rings
  const parts = {};
  for (const id in (S.parts || {})) {
    const def = S.parts[id], g = el('g', { class: 'fs-part' }, L1);
    (def.boxes || []).forEach((b, i) => box(g, b, 'b' + i));
    (def.pipes || []).forEach(([a, b]) => {
      const A = pj(...a), B = pj(...b);
      el('path', { d: `M${A} L${B}`, stroke: 'currentColor', 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none' }, g);
      el('path', { d: `M${A} L${B}`, stroke: 'var(--surface-2)', 'stroke-width': 11, 'stroke-linecap': 'round', fill: 'none' }, g);
    });
    (def.clouds || []).forEach(([c, rx, ry, label]) => { const p = pj(...c); el('ellipse', { cx: p[0], cy: p[1], rx, ry, class: 'fs-face fs-top' }, g); if (label) txt(g, [p[0], p[1] + 4], label); });
    (def.rings || []).forEach(([c, rx, ry]) => { const p = pj(...c); el('ellipse', { cx: p[0], cy: p[1], rx, ry, class: 'fs-ring' }, g); });
    parts[id] = g;
  }

  // marks (an X on a blocked path), text tags (shown in some phases)
  const marks = {};
  (S.marks || []).forEach(m => {
    const g = el('g', { class: 'fs-mark', opacity: 0 }, L3); const [x, y] = pj(...m.at);
    pen(g, 3).setAttribute('d', `M${x - 11} ${y - 11} L${x + 11} ${y + 11} M${x + 11} ${y - 11} L${x - 11} ${y + 11}`);
    marks[m.id] = g;
  });
  const tags = {};
  (S.tags || []).forEach(t => { tags[t.id] = txt(L3, pj(...t.at), t.text, t.cls || 'fs-mono', t.anchor || 'middle'); });

  // wires: polylines with interpolation between named waypoints
  const wires = {};
  for (const id in (S.wires || {})) {
    const w = S.wires[id], Sx = w.pts.map(p => pj(...p));
    const node = el('path', { d: 'M' + Sx.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L'), class: 'fs-wire ' + (w.cls || '') }, L2);
    const cum = [0]; for (let i = 1; i < Sx.length; i++) cum.push(cum[i - 1] + Math.hypot(Sx[i][0] - Sx[i - 1][0], Sx[i][1] - Sx[i - 1][1]));
    const at = (i, j, u) => {
      const s = cum[i] + (cum[j] - cum[i]) * u; let k = 1;
      while (k < Sx.length - 1 && cum[k] < s) k++;
      const r = (s - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1);
      return [Sx[k - 1][0] + (Sx[k][0] - Sx[k - 1][0]) * r, Sx[k - 1][1] + (Sx[k][1] - Sx[k - 1][1]) * r];
    };
    wires[id] = { node, at, n: Sx.length, pts: Sx };
  }
  const dot = el('circle', { r: 6.5, class: 'fs-dot', filter: `url(#${gid})` }, L3);

  // callouts: numbered boxes joined to a part by a leader line
  const calls = {};
  (S.callouts || []).forEach(c => {
    const g = el('g', { class: 'fs-call' }, L3);
    const [ax, ay] = pj(...c.anchor), [bx, by] = c.at;
    el('path', { d: `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx} ${by}`, class: 'fs-leader' }, g);
    el('circle', { cx: ax.toFixed(1), cy: ay.toFixed(1), r: 2.6, class: 'fs-pin' }, g);
    const w = Math.max(c.title.length * 12.5, (c.sub || '').length * 6.4) + 34;
    el('rect', { x: bx - 4, y: by - 15, width: w, height: c.sub ? 36 : 22, rx: 6, class: 'fs-callbox' }, g);
    const bd = el('g', { class: 'fs-badge' }, g); el('circle', { cx: bx + 8, cy: by - 4, r: 8 }, bd); txt(bd, [bx + 8, by], String(c.n), 'fs-badge-n');
    txt(g, [bx + 22, by + 0.5], c.title, 'fs-lbl', 'start'); if (c.sub) txt(g, [bx + 22, by + 15], c.sub, 'fs-sub', 'start');
    calls[c.id] = g;
  });

  // line-art figures: standing typists, walkers between two points, a raised hand
  const figs = (S.figures || []).map(f => makeFigure(L3, f));
  function makeFigure(parent, f) {
    const g = el('g', { filter }, parent);
    const farArm = limb(g, 3.6), legs = [limb(g, 4.2), limb(g, 4.2)], shoes = [blot(g), blot(g)];
    const body = paint(g, f.colour || 'var(--accent)');
    const head = el('ellipse', { rx: 3.8, ry: 4.6, fill: PAPER, stroke: 'currentColor', 'stroke-width': PEN }, g); head.classList.add('pp');
    const nearArm = limb(g, 3.6);
    const walk = gait({ kind: 'walk' }), raise = spring(30, 7);
    const typing = curve([[0, 0], [0.15, -2], [0.3, 0], [0.5, -1.5], [0.65, 0], [0.82, -2.2]], 1);
    let x = f.at[0], phase = 0;
    return {
      f, draw(t, dt, ph, act) {
        const want = (f.goto && ph && f.goto[ph.key] != null) ? f.goto[ph.key] : f.at[0];
        const moving = Math.abs(want - x) > 0.02;
        if (moving) { phase += dt / walk.period; x += Math.sign(want - x) * Math.min(Math.abs(want - x), walk.speed * 0.028 * dt); }
        const [sx, sy] = pj(x, f.at[1], f.at[2]);
        place(g, sx, sy, moving ? (want > x ? 1 : -1) : (f.dir || 1), f.scale || 0.9);
        const p = walk.pose(phase, moving ? 1 : 0);
        p.feet.forEach((fo, i) => { legs[i].draw([p.hip, fo.knee, fo.ankle], [0.3, 0.8]); shoe(shoes[i], fo.ankle, fo.pitch); });
        g.insertBefore(legs[p.front].g, body); g.insertBefore(shoes[p.front], body);
        const b = p.bob;
        body.setAttribute('d', `M35 ${42 + b} Q41 ${38.4 + b} 47 ${42 + b} L47.5 ${73 + b} Q40 ${76 + b} 32.5 ${73 + b}Z`);
        head.setAttribute('cx', 43); head.setAttribute('cy', 31.4 + b);
        const tp = act === 'type' ? typing(t * 2.2) : 0;
        const r = raise.step(act === 'raise' ? 1 : 0, dt);
        farArm.draw([[40, 43 + b], [50, 60 + b], [60, 66 + tp + b]], [0.2, 0.5]);
        const hand = act === 'type' || f.pose === 'type' ? [63, 65 - tp + b] : [52 - 2 * r, 70 - 40 * r + b];
        nearArm.draw([[43, 44 + b], [53 - 4 * r, 61 - 16 * r + b], hand], [0.2, 0.4]);
      },
    };
  }

  // side panel
  const $ = c => host.querySelector(c);
  const stepEl = $('.fs-step'), titleEl = $('.fs-title'), sayEl = $('.fs-say'), pre = $('.fs-code'), checksEl = $('.fs-checks');
  if (pre) pre.innerHTML = (S.code || []).map(l => `<span class="ln">${esc(l) || ' '}</span>`).join('');
  const lns = pre ? [...pre.querySelectorAll('.ln')] : [];
  if (checksEl) checksEl.innerHTML = (S.checks || []).map(c => `<div><i></i>${esc(c)}</div>`).join('');
  const chk = checksEl ? [...checksEl.children] : [];
  const prog = $('.fs-prog i');

  // camera
  function frameOf(ids, minW) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    const add = n => { const b = n.getBBox(); if (!b.width && !b.height) return; x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); };
    if (!ids) { add(L0); add(L1); add(L2); add(L3); }
    else ids.forEach(id => { if (parts[id]) add(parts[id]); if (calls[id]) add(calls[id]); if (tags[id]) add(tags[id]); });
    if (x0 > x1) return [0, 0, W, H];
    const pad = ids ? 46 : 18; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    let w = x1 - x0, h = y1 - y0; const r = W / H;
    if (w / h < r) { const nw = h * r; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / r; y0 -= (nh - h) / 2; h = nh; }
    if (ids) { const cx = x0 + w / 2, cy = y0 + h / 2; w = Math.max(w, W * (minW || 0.26)); h = w / r; x0 = cx - w / 2; y0 = cy - h / 2; }
    return [x0, y0, w, h];
  }
  let OVER = frameOf(null);
  const PH = [{ key: 'all', d: S.hold || 2.6, label: S.overview.label, title: S.overview.title, say: S.overview.say, lines: S.overview.lines || [], all: true }]
    .concat(S.phases.map((p, i) => Object.assign({ key: p.key || ('p' + (i + 1)) }, p)));
  function segFrame(ph) {
    // the packet's travel in this phase: every waypoint between span[0] and span[1]
    const pk = ph.packet; if (!pk || !wires[pk.wire]) return null;
    const w = wires[pk.wire], [a, b] = pk.span || [0, w.n - 1], lo = Math.min(a, b), hi = Math.max(a, b);
    return w.pts.slice(lo, hi + 1);
  }
  function computeFrames() {
    OVER = frameOf(null);
  PH.forEach(ph => {
      if (ph.all) { ph.frame = OVER; return; }
      const base = frameOf(ph.cam || ph.focus, ph.zoom), seg = segFrame(ph);
      if (!seg || ph.segment === false) { ph.frame = base; return; }
      // grow the frame so the whole segment fits, keeping the aspect ratio
      let [x0, y0, w, h] = base, x1 = x0 + w, y1 = y0 + h; const pad = 40;
      seg.forEach(([x, y]) => { x0 = Math.min(x0, x - pad); y0 = Math.min(y0, y - pad); x1 = Math.max(x1, x + pad); y1 = Math.max(y1, y + pad); });
      w = x1 - x0; h = y1 - y0; const r = W / H;
      if (w / h < r) { const nw = h * r; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / r; y0 -= (nh - h) / 2; h = nh; }
      ph.frame = [x0, y0, w, h];
    });
  }
  computeFrames();
  let framesReady = svg.getBBox().width > 0;
  const CYCLE = PH.reduce((a, p) => a + p.d, 0);
  let cam = OVER.slice();
  svg.setAttribute('viewBox', OVER.map(v => v.toFixed(1)).join(' '));

  let cur = -1;
  function enter(i) {
    if (i === cur) return; cur = i; const ph = PH[i];
    if (stepEl) stepEl.textContent = ph.label || '';
    if (titleEl) titleEl.textContent = ph.title || '';
    if (sayEl) sayEl.innerHTML = ph.say || '';
    lns.forEach((ln, k) => ln.classList.toggle('on', (ph.all ? (S.overview.lines || lns.map((_, j) => j + 1)) : (ph.lines || [])).includes(k + 1)));
    for (const id in parts) { const on = ph.all || (ph.focus || []).includes(id); parts[id].classList.toggle('dim', !on); parts[id].classList.toggle('on', !ph.all && ph.focus && ph.focus[0] === id); }
    for (const id in calls) { calls[id].classList.toggle('dim', !(ph.all || ph.badge === id)); calls[id].classList.toggle('on', ph.badge === id); }
    for (const id in wires) wires[id].node.classList.toggle('on', ph.all ? !wires[id].node.classList.contains('fs-alt') : (ph.packet && ph.packet.wire === id));
    if (checksEl) checksEl.classList.toggle('dim', !(ph.checks || ph.all));
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Step mode (default): each click on the stage, or ArrowDown, plays the next phase once and
  // holds its end state; ArrowUp goes back. The scene opens on the full picture. mode: 'auto'
  // keeps the old continuous loop.
  const STEP = S.mode !== 'auto';
  let clock = 0, paused = false, last = 0, idx = 0, phaseStart = 0, lastDraw = 0;
  // A step change draws at once: the presenter view mirrors the live slide's DOM, and a deck
  // window behind the presenter window may get no animation frames at all until it is focused.
  const go = n => { idx = Math.max(0, Math.min(PH.length - 1, n)); phaseStart = performance.now(); draw(performance.now()); };
  stage.addEventListener('click', () => { if (STEP) go(idx < PH.length - 1 ? idx + 1 : 0); else paused = !paused; });
  if (STEP && window.FSI && window.FSI.bindKeys) {
    window.FSI.bindKeys(host, {
      down: () => { if (idx < PH.length - 1) { go(idx + 1); return true; } return false; },
      up: () => { if (idx > 0) { go(idx - 1); return true; } return false; },
      // the overview is step 0, so the count matches the phase labels (1 출발 ... 10 응답)
      state: () => ({ cur: idx, total: PH.length - 1 })
    });
  }
  const active = () => !slide || slide.classList.contains('active');
  // .active is added about 350 ms after rp:slidechange, so match the event's slide index instead.
  const myIndex = () => Array.from(document.querySelectorAll('.slide-deck .slide')).indexOf(slide);
  document.addEventListener('rp:slidechange', e => {
    if (e.detail && e.detail.index === myIndex()) { clock = 0; paused = false; go(0); }
  });

  function frame(now) { requestAnimationFrame(frame); draw(now); }
  // Fallback when animation frames stop (occluded or background window): wall-clock timers.
  setInterval(() => { if (performance.now() - lastDraw > 150) draw(performance.now()); }, 100);

  function draw(now) {
    // real elapsed time, so a sparse frame rate never slows the scene; dt feeds only the smoothing
    const dt = Math.min(0.5, last ? Math.max(0, now - last) / 1000 : 0); last = now; lastDraw = now;
    if (!active()) return;
    // the slide may have been hidden when the scene mounted (getBBox is 0 then): measure now
    if (!framesReady && svg.getBBox().width > 0) { computeFrames(); framesReady = true; cam = OVER.slice(); }
    let i, s;
    if (STEP) { i = still ? 0 : idx; s = still ? 0 : Math.min((now - phaseStart) / 1000, PH[i].d); }
    else {
      if (!paused && !still) clock += dt;
      s = still ? 0 : clock % CYCLE; i = 0;
      while (s >= PH[i].d) { s -= PH[i].d; i++; }
    }
    enter(i);
    const ph = PH[i], lead = (STEP && !ph.all) ? (ph.lead != null ? ph.lead : 0.9) : 0;
    const u = clamp((s - lead) / Math.max(0.1, ph.d - lead), 0, 1), t = now / 1000;
    if (prog) prog.style.width = (still ? 100 : STEP ? (i / (PH.length - 1)) * 100 : ((clock % CYCLE) / CYCLE) * 100).toFixed(1) + '%';

    // packet
    let q = null, colour = 'var(--accent)';
    const pk = ph.packet;
    if (pk) {
      const w = wires[pk.wire], [a, b] = pk.span || [0, w.n - 1];
      if (pk.mode === 'pingpong') q = u < 0.5 ? w.at(a, b, ease(u / 0.5)) : w.at(b, a, ease((u - 0.5) / 0.5));
      else if (pk.mode === 'wait') q = w.at(a, b, u < (pk.hold || 0.8) ? (pk.waitAt || 0.5) : (pk.waitAt || 0.5) + (1 - (pk.waitAt || 0.5)) * ease((u - (pk.hold || 0.8)) / (1 - (pk.hold || 0.8))));
      else if (pk.mode === 'block') q = w.at(a, b, ease(clamp(u / (pk.stopAt || 0.6), 0, 1)));
      else q = w.at(a, b, ease(u));
      colour = pk.mode === 'block' && u > (pk.stopAt || 0.6) ? 'var(--danger)' : (pk.colour || colour);
    }
    if (q) { dot.setAttribute('cx', q[0].toFixed(1)); dot.setAttribute('cy', q[1].toFixed(1)); dot.style.fill = colour; dot.style.opacity = 1; }
    else dot.style.opacity = 0;

    for (const id in marks) marks[id].setAttribute('opacity', ph.all || (pk && pk.mode === 'block' && pk.mark === id && u > (pk.stopAt || 0.6)) ? 1 : 0);
    for (const id in tags) { const tg = (S.tags.find(x => x.id === id) || {}).show || []; tags[id].style.opacity = ph.all || tg.includes(ph.key) ? 1 : 0; }

    // sequential checks (e.g. IAM evaluation) light up in this phase
    const lit = ph.checks ? Math.floor(clamp(u / (pk && pk.hold || 0.8), 0, 1) * (chk.length + 0.0001)) : (ph.all || (S.checksDoneAfter && PH.findIndex(p => p.key === S.checksDoneAfter) < i) ? chk.length : 0);
    chk.forEach((c, k) => c.classList.toggle('ok', k < lit));
    if (S.frame) S.frame({ parts, marks, tags, wires, svg, lit, ph, u, t, all: !!ph.all });

    figs.forEach(fg => fg.draw(t, Math.min(dt, 0.05), ph, (fg.f.act || {})[ph.key] || null));

    if (still) svg.setAttribute('viewBox', OVER.map(v => v.toFixed(1)).join(' '));
    else {
      // fixed per phase: the camera moves only when the phase changes, never while the packet travels
      const tg = ph.frame, rate = 4.2;
      const k = 1 - Math.exp(-dt * rate);
      cam = cam.map((v, j) => v + (tg[j] - v) * k);
      svg.setAttribute('viewBox', cam.map(v => v.toFixed(1)).join(' '));
    }
  }
  requestAnimationFrame(frame);
}
