/* LabViz: step-through lab diagrams, per-command explainers and paste-target
 * badges for the November lab pages. No dependencies, no network.
 *
 * Markup (see tools/mydata/check_viz.py, which guards it):
 *   <figure class="viz" data-viz="NAME"><figcaption>static step list</figcaption></figure>
 *   <div class="code copyable">...</div>
 *   <details class="cmd-explain"><summary>... (붙여넣는 곳: 터미널)</summary>
 *     <ol><li data-lines="2-3">...</li></ol></details>
 *
 * Diagrams are registered below with literal calls
 *   LabViz.register("NAME", { title, viewBox, nodes, edges, steps })
 * The guard reads names with a regex over `LabViz.register("NAME"`, so keep the
 * name a string literal. Icons are file names under assets/aws-icons/ without
 * ".svg", written as `icon: "NAME"`.
 *
 * Node: { id, shape: "icon"|"group"|"folder"|"file"|"note", icon, label, sub,
 *         x, y (centre), w, h, appear (first step, 1-based), until (last step),
 *         tone: "ok"|"err"|"info" }   label/sub may contain "\n".
 * Edge: { id, from, to, label, via: [[x, y], ...], appear, until }
 *       appear/until (optional, 1-based steps) hide the edge outside that range.
 * Step: { cmd, caption, on: [node or edge ids], flow: { edge, token },
 *         marks: { nodeId: "check"|"lock"|"x"|null } }  marks accumulate.
 */
(function () {
  "use strict";

  var LabViz = window.LabViz || {};
  LabViz.defs = LabViz.defs || {};
  LabViz.register = function (name, def) {
    LabViz.defs[name] = def;
  };
  window.LabViz = LabViz;

  var SVGNS = "http://www.w3.org/2000/svg";
  var STEP_MS = 1600;
  var FLOW_MS = 1100;
  var uid = 0;

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ---------- command explainers ---------- */

  // Split a code block into one inline span per line. The original text is kept
  // in data-raw first, and the newlines stay as text nodes, so textContent and
  // innerText do not change; the page's copy button reads data-raw.
  function wrapLines(code) {
    if (code.dataset.raw != null) return;
    // Only plain-text blocks are wrapped: rebuilding from textContent would
    // drop any child markup (e.g. a <span> from a syntax highlighter).
    if (code.children.length) return;
    var raw = code.textContent;
    code.dataset.raw = raw;
    var trailing = /\n$/.test(raw);
    var lines = (trailing ? raw.slice(0, -1) : raw).split("\n");
    code.textContent = "";
    lines.forEach(function (text, i) {
      var span = document.createElement("span");
      span.className = "lv-ln";
      span.setAttribute("data-ln", String(i + 1));
      span.textContent = text;
      code.appendChild(span);
      if (i < lines.length - 1 || trailing) code.appendChild(document.createTextNode("\n"));
    });
  }

  function parseLines(spec) {
    var out = [];
    String(spec || "").replace(/\s/g, "").split(",").forEach(function (part) {
      var m = /^(\d+)(?:-(\d+))?$/.exec(part);
      if (!m) return;
      var lo = +m[1], hi = +(m[2] || m[1]);
      for (var n = lo; n <= hi; n++) out.push(n);
    });
    return out;
  }

  function lineLabel(spec) {
    return String(spec).replace(/\s/g, "").split(",").map(function (p) {
      return p.replace("-", "–");
    }).join(", ") + "행";
  }

  function setupExplainer(det) {
    var block = det.previousElementSibling;
    if (!block || !block.classList.contains("code")) return;
    var code = block.querySelector("pre code") || block.querySelector("pre");
    if (!code || det.classList.contains("lv-ready")) return;
    det.classList.add("lv-ready");
    wrapLines(code);
    block.classList.add("lv-explained");
    var spans = code.querySelectorAll(".lv-ln");
    det.querySelectorAll("li[data-lines]").forEach(function (li) {
      var nums = parseLines(li.getAttribute("data-lines"));
      var ref = document.createElement("span");
      ref.className = "lv-ref";
      ref.textContent = lineLabel(li.getAttribute("data-lines"));
      li.insertBefore(ref, li.firstChild);
      li.tabIndex = 0;
      function on() {
        block.classList.add("lv-hl-on");
        nums.forEach(function (n) {
          if (spans[n - 1]) spans[n - 1].classList.add("lv-hl");
        });
        li.classList.add("lv-active");
      }
      function off() {
        block.classList.remove("lv-hl-on");
        spans.forEach(function (s) { s.classList.remove("lv-hl"); });
        li.classList.remove("lv-active");
      }
      li.addEventListener("mouseenter", on);
      li.addEventListener("mouseleave", function () { if (document.activeElement !== li) off(); });
      li.addEventListener("focus", on);
      li.addEventListener("blur", off);
    });
  }

  /* ---------- paste-target badges ---------- */

  var PASTE = {
    terminal: "터미널에 붙여넣기",
    claude: "Claude 입력창에 붙여넣기",
    browser: "브라우저에 붙여넣기",
    file: "파일 내용(직접 붙여넣지 않음)"
  };

  function pasteKind(block, head) {
    var forced = block.getAttribute("data-paste");
    if (forced && PASTE[forced]) return forced;
    var label = ((head.querySelector("span") || head).textContent || "").trim().toLowerCase();
    var code = block.querySelector("pre");
    var text = code ? code.textContent : "";
    if (/<<-?\s*['"]?[A-Za-z_]+/.test(text)) return "terminal"; // heredoc writes the file from the shell
    if (/^(bash|sh|zsh|shell|terminal|console)$/.test(label)) return "terminal";
    if (/^(text|prompt|claude)$/.test(label)) return "claude";
    if (/^(json|yaml|yml|toml|md|markdown|ini)$/.test(label)) return "file";
    return null;
  }

  function setupBadge(block) {
    if (!block.classList.contains("copyable") && !block.hasAttribute("data-paste")) return;
    var head = block.querySelector(".code-head");
    if (!head || head.querySelector(".lv-paste")) return;
    var kind = pasteKind(block, head);
    if (!kind) return;
    var badge = document.createElement("span");
    badge.className = "lv-paste lv-paste-" + kind;
    badge.textContent = PASTE[kind];
    var label = head.querySelector("span");
    if (label && label.nextSibling) head.insertBefore(badge, label.nextSibling);
    else head.appendChild(badge);
  }

  /* ---------- diagrams ---------- */

  function el(tag, attrs, parent) {
    var node = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function texts(parent, x, y, str, cls, lh, anchor) {
    String(str).split("\n").forEach(function (line, i) {
      var t = el("text", { x: x, y: y + i * lh, "class": cls, "text-anchor": anchor || "middle" }, parent);
      t.textContent = line;
    });
    return String(str).split("\n").length;
  }

  function box(n) {
    if ((n.shape || "icon") === "icon") return { w: 60, h: 60 };
    return { w: n.w || 120, h: n.h || 60 };
  }

  // Point where the ray from the node centre toward (tx, ty) leaves its box.
  function clip(n, tx, ty) {
    var b = box(n), dx = tx - n.x, dy = ty - n.y;
    if (!dx && !dy) return [n.x, n.y];
    var s = Math.min(dx ? (b.w / 2) / Math.abs(dx) : Infinity, dy ? (b.h / 2) / Math.abs(dy) : Infinity);
    return [n.x + dx * s, n.y + dy * s];
  }

  function drawNode(n, g) {
    var shape = n.shape || "icon", b = box(n);
    var x0 = n.x - b.w / 2, y0 = n.y - b.h / 2;
    if (shape === "icon") {
      el("image", { href: "assets/aws-icons/" + n.icon + ".svg", x: n.x - 24, y: n.y - 24, width: 48, height: 48 }, g);
      var count = n.label ? texts(g, n.x, n.y + 46, n.label, "lv-label", 18) : 0;
      if (n.sub) texts(g, n.x, n.y + 46 + count * 18 + 2, n.sub, "lv-sub lv-mono", 16);
    } else if (shape === "group") {
      el("rect", { x: x0, y: y0, width: b.w, height: b.h, rx: 14, "class": "lv-box" }, g);
      if (n.icon) {
        el("image", { href: "assets/aws-icons/" + n.icon + ".svg", x: x0 + 12, y: y0 + 10, width: 34, height: 34 }, g);
        texts(g, x0 + 54, y0 + 32, n.label, "lv-label", 18, "start");
      } else {
        texts(g, x0 + 16, y0 + 26, n.label, "lv-label lv-mono", 18, "start");
      }
    } else {
      if (shape === "folder") {
        el("path", {
          d: "M" + x0 + " " + (y0 + b.h) + "V" + (y0 + 4) + "q0 -4 4 -4H" + (x0 + 38) + "l8 10H" + (x0 + b.w - 4) +
             "q4 0 4 4V" + (y0 + b.h) + "Z",
          "class": "lv-box"
        }, g);
      } else if (shape === "file") {
        el("path", { d: "M" + x0 + " " + y0 + "H" + (x0 + b.w - 16) + "L" + (x0 + b.w) + " " + (y0 + 16) +
          "V" + (y0 + b.h) + "H" + x0 + "Z", "class": "lv-box" }, g);
        el("path", { d: "M" + (x0 + b.w - 16) + " " + y0 + "V" + (y0 + 16) + "H" + (x0 + b.w), "class": "lv-fold" }, g);
      } else {
        el("rect", { x: x0, y: y0, width: b.w, height: b.h, rx: 8, "class": "lv-box lv-notebox" }, g);
      }
      var lines = String(n.label || "").split("\n").length + (n.sub ? String(n.sub).split("\n").length : 0);
      var lh = shape === "note" ? 17 : 18;
      var top = n.y + (shape === "folder" ? 5 : 0) - ((lines - 1) * lh) / 2 + 5;
      var used = texts(g, n.x, top, n.label || "", shape === "note" ? "lv-note" : "lv-label lv-mono", lh);
      if (n.sub) texts(g, n.x, top + used * lh, n.sub, "lv-sub lv-mono", lh);
    }
  }

  function drawMark(kind, n, g) {
    var b = box(n), cx = n.x + b.w / 2 - 6, cy = n.y - b.h / 2 + 6;
    if ((n.shape || "icon") === "folder") cy += 10;
    var m = el("g", { "class": "lv-mark lv-mark-" + kind, transform: "translate(" + cx + " " + cy + ")" }, g);
    if (kind === "lock") {
      el("circle", { r: 13, "class": "lv-mark-bg" }, m);
      el("path", { d: "M-4.5 -1V-4.5a4.5 4.5 0 0 1 9 0V-1", "class": "lv-mark-line" }, m);
      el("rect", { x: -7, y: -1, width: 14, height: 10, rx: 2, "class": "lv-mark-fill" }, m);
    } else {
      el("circle", { r: 12, "class": "lv-mark-fill" }, m);
      el("path", { d: kind === "check" ? "M-5 0l3.5 3.5L5.5 -4" : "M-4 -4l8 8M4 -4l-8 8", "class": "lv-mark-ink" }, m);
    }
    var title = el("title", {}, m);
    title.textContent = { check: "지문 일치", lock: "읽기 전용", x: "불일치" }[kind] || kind;
  }

  function Player(fig, def) {
    this.fig = fig;
    this.def = def;
    this.idx = 0;
    this.timer = null;
    this.raf = null;
    this.playing = false;
    this.id = "lv" + (++uid);
    this.build();
    this.show(0, false);
  }

  Player.prototype.build = function () {
    var self = this, def = this.def, fig = this.fig;
    var cap = fig.querySelector("figcaption");
    if (cap) cap.classList.add("lv-sr");
    fig.classList.add("lv-ready");

    var stage = document.createElement("div");
    stage.className = "lv-stage";
    var svg = el("svg", { viewBox: def.viewBox, "class": "lv-svg", role: "img", "aria-label": def.title || "" });
    stage.appendChild(svg);
    var defs = el("defs", {}, svg);
    ["", "-on"].forEach(function (suffix) {
      var mk = el("marker", { id: self.id + "-arr" + suffix, viewBox: "0 0 10 10", refX: 9, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse", "class": "lv-arrow" + suffix }, defs);
      el("path", { d: "M0 0L10 5L0 10z" }, mk);
    });

    this.nodes = {};
    this.nodeEls = {};
    this.edgeEls = {};
    var layerGroups = el("g", {}, svg), layerEdges = el("g", {}, svg), layerNodes = el("g", {}, svg);
    def.nodes.forEach(function (n) {
      self.nodes[n.id] = n;
      var g = el("g", { "class": "lv-node lv-" + (n.shape || "icon") + (n.tone ? " lv-tone-" + n.tone : ""), "data-id": n.id },
        n.shape === "group" ? layerGroups : layerNodes);
      drawNode(n, g);
      self.nodeEls[n.id] = g;
    });
    (def.edges || []).forEach(function (e) {
      var a = self.nodes[e.from], b = self.nodes[e.to], via = e.via || [];
      var first = via[0] || [b.x, b.y], last = via[via.length - 1] || [a.x, a.y];
      var pts = [clip(a, first[0], first[1])].concat(via, [clip(b, last[0], last[1])]);
      var g = el("g", { "class": "lv-edge-g", "data-id": e.id }, layerEdges);
      el("path", { d: "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L"), "class": "lv-edge",
        "marker-end": "url(#" + self.id + "-arr)" }, g);
      if (e.label) {
        var mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2;
        var lines = String(e.label).split("\n").length;
        texts(g, mx, my - 10 - (lines - 1) * 16, e.label, "lv-edge-label lv-mono", 16);
      }
      self.edgeEls[e.id] = { g: g, pts: pts, def: e };
    });
    this.token = el("g", { "class": "lv-token", visibility: "hidden" }, svg);
    el("rect", { x: -64, y: -13, width: 128, height: 26, rx: 13 }, this.token);
    this.tokenText = el("text", { x: 0, y: 4.5, "text-anchor": "middle", "class": "lv-mono" }, this.token);

    var caption = document.createElement("div");
    caption.className = "lv-cap";
    caption.setAttribute("aria-live", "polite");
    this.caption = caption;

    var bar = document.createElement("div");
    bar.className = "lv-controls";
    function button(text, aria, fn, cls) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lv-btn" + (cls ? " " + cls : "");
      b.textContent = text;
      b.setAttribute("aria-label", aria);
      b.addEventListener("click", fn);
      bar.appendChild(b);
      return b;
    }
    this.btnFirst = button("↺ 처음", "처음 단계로", function () { self.stop(); self.show(0, false); });
    this.btnPrev = button("◀ 이전", "이전 단계", function () { self.stop(); self.show(self.idx - 1, false); });
    this.btnPlay = button("▶ 재생", "단계 자동 재생", function () { self.playing ? self.stop() : self.play(); }, "lv-play");
    this.btnNext = button("다음 ▶", "다음 단계", function () { self.stop(); self.show(self.idx + 1, true); });
    var dots = document.createElement("div");
    dots.className = "lv-dots";
    this.dots = def.steps.map(function (s, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "lv-dot";
      d.setAttribute("aria-label", (i + 1) + "단계로 이동");
      d.addEventListener("click", function () { self.stop(); self.show(i, i === self.idx + 1); });
      dots.appendChild(d);
      return d;
    });
    bar.appendChild(dots);

    fig.insertBefore(stage, cap || null);
    fig.insertBefore(caption, cap || null);
    fig.insertBefore(bar, cap || null);
  };

  Player.prototype.stateAt = function (idx) {
    var marks = {};
    for (var i = 0; i <= idx; i++) {
      var m = this.def.steps[i].marks || {};
      for (var k in m) marks[k] = m[k];
    }
    return marks;
  };

  Player.prototype.show = function (idx, animate) {
    var self = this, steps = this.def.steps;
    idx = Math.max(0, Math.min(steps.length - 1, idx));
    this.idx = idx;
    var step = steps[idx], n1 = idx + 1, on = step.on || [];
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.token.setAttribute("visibility", "hidden");

    var flow = step.flow && this.edgeEls[step.flow.edge];
    var moving = !!(animate && flow && !reducedMotion());
    var marks = this.stateAt(idx);

    Object.keys(this.nodeEls).forEach(function (id) {
      var n = self.nodes[id], g = self.nodeEls[id];
      var visible = (n.appear || 0) <= n1 && (n.until == null || n1 <= n.until);
      g.classList.toggle("lv-hidden", !visible);
      g.classList.toggle("lv-pending", moving && visible && n.appear === n1);
      g.classList.toggle("lv-on", on.indexOf(id) >= 0);
      g.classList.toggle("lv-dim", n.shape !== "group" && on.length > 0 && on.indexOf(id) < 0);
      var old = g.querySelector(".lv-mark");
      if (old) g.removeChild(old);
      if (marks[id]) drawMark(marks[id], n, g);
    });
    Object.keys(this.edgeEls).forEach(function (id) {
      var active = on.indexOf(id) >= 0 || !!(step.flow && step.flow.edge === id);
      var g = self.edgeEls[id].g, ed = self.edgeEls[id].def;
      g.classList.toggle("lv-hidden", !((ed.appear || 0) <= n1 && (ed.until == null || n1 <= ed.until)));
      g.classList.toggle("lv-on", active);
      g.querySelector(".lv-edge").setAttribute("marker-end", "url(#" + self.id + "-arr" + (active ? "-on" : "") + ")");
    });

    this.caption.textContent = "";
    var num = document.createElement("span");
    num.className = "lv-num";
    num.textContent = n1 + " / " + steps.length;
    this.caption.appendChild(num);
    if (step.cmd) {
      var c = document.createElement("code");
      c.textContent = step.cmd;
      this.caption.appendChild(c);
    }
    var t = document.createElement("span");
    t.className = "lv-text";
    t.textContent = step.caption;
    this.caption.appendChild(t);

    this.dots.forEach(function (d, i) {
      if (i === idx) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
      d.classList.toggle("lv-done", i < idx);
    });
    this.btnFirst.disabled = idx === 0;
    this.btnPrev.disabled = idx === 0;
    this.btnNext.disabled = idx === steps.length - 1;

    if (moving) this.move(flow.pts, step.flow.token || "");
  };

  Player.prototype.move = function (pts, label) {
    var self = this, lens = [], total = 0;
    for (var i = 1; i < pts.length; i++) {
      var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      lens.push(l);
      total += l;
    }
    this.tokenText.textContent = label;
    this.token.setAttribute("visibility", label ? "visible" : "hidden");
    var start = null;
    function at(d) {
      for (var j = 0; j < lens.length; j++) {
        if (d <= lens[j] || j === lens.length - 1) {
          var f = lens[j] ? Math.min(1, d / lens[j]) : 1;
          return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f];
        }
        d -= lens[j];
      }
    }
    function frame(ts) {
      if (start == null) start = ts;
      var p = Math.min(1, (ts - start) / FLOW_MS);
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var xy = at(e * total);
      self.token.setAttribute("transform", "translate(" + xy[0] + " " + xy[1] + ")");
      if (p < 1) {
        self.raf = requestAnimationFrame(frame);
      } else {
        self.raf = null;
        self.token.setAttribute("visibility", "hidden");
        self.fig.querySelectorAll(".lv-pending").forEach(function (g) { g.classList.remove("lv-pending"); });
      }
    }
    this.raf = requestAnimationFrame(frame);
  };

  Player.prototype.play = function () {
    var self = this, last = this.def.steps.length - 1;
    this.playing = true;
    this.btnPlay.textContent = "❚❚ 멈춤";
    this.btnPlay.setAttribute("aria-label", "자동 재생 멈춤");
    this.show(this.idx >= last ? 0 : this.idx, true);
    function tick() {
      if (!self.playing) return;
      if (self.idx >= last) { self.stop(); return; }
      self.show(self.idx + 1, true);
      if (self.idx >= last) self.stop();
      else self.timer = setTimeout(tick, STEP_MS);
    }
    this.timer = setTimeout(tick, STEP_MS);
  };

  Player.prototype.stop = function () {
    this.playing = false;
    clearTimeout(this.timer);
    this.timer = null;
    this.btnPlay.textContent = "▶ 재생";
    this.btnPlay.setAttribute("aria-label", "단계 자동 재생");
  };

  /* ---------- start ---------- */

  function init() {
    document.querySelectorAll("details.cmd-explain").forEach(function (d) {
      try { setupExplainer(d); } catch (e) { console.warn("labviz: explainer setup failed", e); }
    });
    document.querySelectorAll(".code").forEach(function (c) {
      try { setupBadge(c); } catch (e) { console.warn("labviz: badge setup failed", e); }
    });
    document.querySelectorAll("figure.viz[data-viz]").forEach(function (fig) {
      try {
        var def = LabViz.defs[fig.getAttribute("data-viz")];
        if (def && !fig.classList.contains("lv-ready")) new Player(fig, def);
      } catch (e) { console.warn("labviz: figure failed", fig.getAttribute("data-viz"), e); }
    });
  }
  LabViz.init = init;

  /* ====================================================================
   * Diagram definitions. Each chapter appends its own delimited section.
   * ==================================================================== */

  /* ---- Preflight: CHECK 06 kit download ---- */
  LabViz.register("kit-download", {
    title: "S3의 마이데이터 키트가 EC2(ccb-endpoint)로 복사되고 풀리는 과정",
    viewBox: "0 0 800 400",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 532, y: 202, w: 506, h: 364 },
      { id: "mydata", shape: "group", label: "~/claude-lab/mydata", x: 535, y: 277, w: 470, h: 196 },
      { id: "s3", shape: "icon", icon: "S3-Bucket", label: "Workshop Studio\n에셋 버킷 (공개)", sub: "mydata-kit.zip", x: 90, y: 110 },
      { id: "tmp", shape: "file", label: "/tmp", sub: "mydata-kit.zip", x: 360, y: 110, w: 120, h: 60, appear: 1 },
      { id: "raw", shape: "folder", label: "raw/", x: 384, y: 248, w: 120, h: 64, appear: 2 },
      { id: "pseudo", shape: "folder", label: "pseudo/", x: 527, y: 248, w: 120, h: 64, appear: 2 },
      { id: "checkpoints", shape: "folder", label: "checkpoints/", x: 670, y: 248, w: 120, h: 64, appear: 2 },
      { id: "oknote", shape: "note", tone: "ok", label: "모두 맞으면\n→ 체크섬 OK", x: 425, y: 338, w: 150, h: 50, appear: 3, until: 3 },
      { id: "errnote", shape: "note", tone: "err", label: "하나라도 다르면 → FAILED\n여기서 멈춤", x: 630, y: 338, w: 220, h: 50, appear: 3, until: 3 },
      { id: "rawnote", shape: "note", tone: "err", label: "DLP 시연용\n가짜 원본(주민번호 등)", x: 384, y: 336, w: 170, h: 50, appear: 5 },
      { id: "pseudonote", shape: "note", tone: "ok", label: "분석용\n가명처리 데이터", x: 527, y: 336, w: 120, h: 50, appear: 5 }
    ],
    edges: [
      { id: "e-cp", from: "s3", to: "tmp", label: "aws s3 cp\n--no-sign-request" },
      { id: "e-unzip", from: "tmp", to: "mydata", label: "unzip", via: [[535, 110]] }
    ],
    steps: [
      { cmd: "aws s3 cp --no-sign-request",
        caption: "키트(zip 파일)가 S3에서 EC2의 /tmp로 복사됩니다. 공개 객체라서 자격 증명(로그인 정보) 없이 받습니다.",
        on: ["s3", "tmp", "e-cp"], flow: { edge: "e-cp", token: "mydata-kit.zip" } },
      { cmd: "unzip",
        caption: "zip이 ~/claude-lab/mydata 안에서 raw/ · pseudo/ · checkpoints/ 세 폴더로 펼쳐집니다.",
        on: ["tmp", "e-unzip", "raw", "pseudo", "checkpoints"], flow: { edge: "e-unzip", token: "mydata-kit.zip" } },
      { cmd: "sha256sum -c",
        caption: "파일마다 지문(SHA-256 값)을 목록과 비교합니다. 하나라도 다르면 빨간 FAILED가 나오고 거기서 멈춥니다.",
        on: ["raw", "pseudo", "checkpoints", "oknote", "errnote"], marks: { raw: "check", pseudo: "check", checkpoints: "check" } },
      { cmd: "chmod -R a-w",
        caption: "raw/와 pseudo/에 자물쇠를 겁니다. 읽기 전용이라 실수로 원본을 고칠 수 없습니다.",
        on: ["raw", "pseudo"], marks: { raw: "lock", pseudo: "lock" } },
      { caption: "raw/는 DLP 시연용 가짜 원본(주민번호 등)이고, pseudo/는 분석에 쓰는 가명처리 데이터입니다.",
        on: ["raw", "pseudo", "rawnote", "pseudonote"] }
    ]
  });

  /* ==== Ch1 ======================================================== */

  /* ---- Ch1 TASK 01: the agent loop ---- */
  LabViz.register("agent-loop", {
    title: "Claude Code가 모델과 도구를 오가며 수집, 수행, 검증을 반복하는 에이전트 루프",
    viewBox: "0 0 800 440",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 360, y: 232, w: 390, h: 384 },
      { id: "tools", shape: "group", label: "도구: Read · Bash", x: 360, y: 305, w: 350, h: 134 },
      { id: "user", shape: "note", tone: "info", label: "사용자\n(터미널)", x: 80, y: 120, w: 110, h: 60 },
      { id: "claude", shape: "note", label: "Claude Code\n(터미널 프로그램)", x: 360, y: 125, w: 150, h: 58 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델 Opus 5.5)", x: 700, y: 125 },
      { id: "customers", shape: "file", label: "customers.csv", x: 285, y: 330, w: 130, h: 50 },
      { id: "pensions", shape: "file", label: "pensions.csv", x: 435, y: 330, w: 130, h: 50 },
      { id: "pycalc", shape: "note", tone: "info", label: "python3 집계 코드 (Bash로 실행)", x: 360, y: 405, w: 330, h: 32, appear: 5 }
    ],
    edges: [
      { id: "e-prompt", from: "user", to: "claude", label: "프롬프트" },
      { id: "e-ask", from: "claude", to: "bedrock", label: "요청", via: [[470, 98], [610, 98]] },
      { id: "e-resp", from: "bedrock", to: "claude", label: "응답", via: [[610, 150], [470, 150]] },
      { id: "e-exec", from: "claude", to: "tools", via: [[320, 195], [320, 238]] },
      { id: "e-result", from: "tools", to: "claude", via: [[400, 238], [400, 195]] },
      { id: "e-answer", from: "claude", to: "user", via: [[300, 175], [105, 175]] }
    ],
    steps: [
      { cmd: "프롬프트 전송",
        caption: "사용자가 터미널에서 프롬프트를 입력합니다. Claude Code가 이 글을 받아 작업을 시작합니다.",
        on: ["user", "claude", "e-prompt"], flow: { edge: "e-prompt", token: "프롬프트" } },
      { cmd: "모델이 결정",
        caption: "Claude Code가 프롬프트를 Bedrock의 모델에 보냅니다. 모델은 \"파일 앞부분부터 보자\"고 정하고, 읽기 도구를 쓰라는 답을 돌려줍니다.",
        on: ["claude", "bedrock", "e-ask", "e-resp"], flow: { edge: "e-resp", token: "Read로 읽기" } },
      { cmd: "수집",
        caption: "Claude Code가 Read와 Bash 도구로 customers.csv와 pensions.csv의 맨 앞 5행을 읽습니다. 도구는 이 PC 안에서 실행됩니다.",
        on: ["claude", "tools", "customers", "pensions", "e-exec"], flow: { edge: "e-exec", token: "Read · Bash" } },
      { cmd: "결과를 모델에 다시",
        caption: "도구가 읽은 결과가 Claude Code로 돌아오고, 다시 모델에 전달됩니다. 모델은 이 결과를 보고 다음 행동을 정합니다.",
        on: ["tools", "claude", "bedrock", "e-result", "e-ask"], flow: { edge: "e-result", token: "앞 5행" } },
      { cmd: "수행",
        caption: "1,000행이 넘는 파일을 눈으로 읽을 수는 없습니다. 모델이 Python 집계 코드를 짜고, Claude Code가 Bash로 실행해 연령대별 수치를 계산합니다.",
        on: ["claude", "bedrock", "e-ask", "e-resp", "tools", "pycalc", "e-exec"], flow: { edge: "e-exec", token: "python3" } },
      { cmd: "검증",
        caption: "프롬프트가 요청한 대로 다른 방법으로 다시 계산해 합계와 중복 고객을 확인합니다. 숫자가 어긋나면 수행 단계로 돌아가 고칩니다.",
        on: ["claude", "bedrock", "e-ask", "e-resp", "tools", "pycalc", "e-result"], flow: { edge: "e-result", token: "검산 결과" } },
      { cmd: "답 표시",
        caption: "검증을 통과한 숫자로 표를 만들어 터미널에 보여줍니다. 한 번의 프롬프트 안에서 수집, 수행, 검증이 이렇게 돌았습니다.",
        on: ["claude", "user", "e-answer"], flow: { edge: "e-answer", token: "연령대별 표" } }
    ]
  });

  /* ---- Ch1 TASK 02 Step 3: the session file ---- */
  LabViz.register("session-file", {
    title: "Claude Code가 대화와 도구 결과를 PC의 JSONL 파일에 평문으로 남기는 과정",
    viewBox: "0 0 800 360",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 400, y: 190, w: 760, h: 320 },
      { id: "claude", shape: "note", label: "Claude Code\n(터미널 프로그램)", x: 105, y: 190, w: 150, h: 58 },
      { id: "dir", shape: "group", label: "~/.claude/projects/*ch1-loop*/", x: 410, y: 215, w: 330, h: 150 },
      { id: "jsonl", shape: "file", label: "<session>.jsonl", sub: "한 줄에 JSON 하나", x: 410, y: 238, w: 220, h: 60 },
      { id: "grepnote", shape: "note", tone: "info", label: "터미널\ngrep -o '고객0'", x: 670, y: 150, w: 170, h: 54, appear: 3 },
      { id: "nextnote", shape: "note", tone: "ok", label: "2장에서 다룹니다\n보존 기간 · DLP", x: 670, y: 270, w: 170, h: 54, appear: 4 }
    ],
    edges: [
      { id: "e-write", from: "claude", to: "jsonl", label: "메시지 · 도구 결과\n기록", via: [[260, 238]] },
      { id: "e-grep", from: "grepnote", to: "jsonl", label: "찾기", via: [[540, 238]] }
    ],
    steps: [
      { cmd: "기록",
        caption: "Claude Code는 대화를 하는 동안 내가 보낸 글, 모델의 답, 도구가 읽은 결과를 이 PC의 세션 파일에 한 줄씩 덧붙입니다.",
        on: ["claude", "jsonl", "e-write"], flow: { edge: "e-write", token: "메시지" } },
      { cmd: "평문",
        caption: "세션 파일은 암호화하거나 가리지 않은 평문 텍스트입니다. 도구가 읽은 고객 행도 그대로 들어갑니다.",
        on: ["dir", "jsonl"] },
      { cmd: "grep",
        caption: "grep -o '고객0'은 파일에서 \"고객0\"이 나오는 곳을 모두 찾습니다. wc -l로 세면 고객 행이 몇 번 저장됐는지 알 수 있습니다.",
        on: ["jsonl", "grepnote", "e-grep"], flow: { edge: "e-grep", token: "고객0" } },
      { cmd: "그래서",
        caption: "숫자가 0이 아니면 고객 데이터가 PC에 원문으로 남은 것입니다. 얼마나 오래 둘지(cleanupPeriodDays)와 막는 방법(DLP)은 2장에서 다룹니다.",
        on: ["jsonl", "nextnote"] }
    ]
  });

  /* ==== end Ch1 ===================================================== */

  /* ==== Ch2 Lab 1 ================================================== */

  /* ---- Ch2 TASK 01: how a request reaches the model ---- */
  LabViz.register("bedrock-path", {
    title: "Claude Code의 요청이 IAM 역할과 Bedrock 추론 프로파일을 거쳐 모델에 닿는 길, 그리고 게이트웨이 모드의 다른 길",
    viewBox: "0 0 800 400",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint\n(실습 PC)", x: 120, y: 205, w: 200, h: 250 },
      { id: "claude", shape: "note", label: "Claude Code\n(터미널 프로그램)", x: 120, y: 218, w: 150, h: 58 },
      { id: "iam", shape: "icon", icon: "IAM", label: "IAM 역할\n(인스턴스 역할)", x: 330, y: 218 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n추론 프로파일", sub: "global. · us. · apac.", x: 540, y: 218 },
      { id: "model", shape: "note", tone: "info", label: "모델\nClaude 5.5", x: 722, y: 218, w: 112, h: 58 },
      { id: "gateway", shape: "note", label: "Claude Apps Gateway\n(게이트웨이 모드)", x: 330, y: 360, w: 200, h: 54 }
    ],
    edges: [
      { id: "e-sig", from: "claude", to: "iam", label: "SigV4 서명" },
      { id: "e-prof", from: "iam", to: "bedrock", label: "모델 ID 요청" },
      { id: "e-model", from: "bedrock", to: "model", label: "호출" },
      { id: "e-gw1", from: "claude", to: "gateway", label: "로그인", via: [[120, 360]] },
      { id: "e-gw2", from: "gateway", to: "bedrock", label: "허용 모델만", via: [[540, 360]] }
    ],
    steps: [
      { cmd: "Claude Code",
        caption: "Claude Code는 ccb-endpoint 안에서 도는 프로그램입니다. 질문을 처리하려면 Bedrock에 요청을 보내야 합니다. settings.json의 CLAUDE_CODE_USE_BEDROCK=1과 AWS_REGION=us-east-1이 이 길을 정합니다.",
        on: ["claude"] },
      { cmd: "IAM 역할",
        caption: "요청은 이 PC에 붙은 IAM 역할(인스턴스 역할)의 권한으로 서명됩니다. 이 랩 환경에는 키를 나눠 주는 경로가 없고, 이 역할이 bedrock:InvokeModel 같은 권한을 가집니다.",
        on: ["claude", "iam", "e-sig"], flow: { edge: "e-sig", token: "SigV4 서명" } },
      { cmd: "추론 프로파일",
        caption: "요청에는 모델 ID가 들어 있고, 이 환경은 global.anthropic.claude-*-5-5처럼 global. 프로파일로 고정했습니다. 추론 프로파일은 요청을 받아 어느 리전의 모델이 처리할지 정해 주는 입구입니다. global.은 전 세계, us.는 미국, apac.은 아시아 태평양 범위이고, 서울 리전 고객은 apac.을 고정하는 것이 기본입니다.",
        on: ["iam", "bedrock", "e-prof"], flow: { edge: "e-prof", token: "모델 ID" } },
      { cmd: "모델",
        caption: "프로파일이 고른 곳의 모델이 답을 만들어 같은 길로 돌려줍니다. 모델 ID를 고정하지 않으면 Bedrock의 기본 주 모델인 Opus 5.5가 쓰이고 Opus 단가로 청구됩니다.",
        on: ["bedrock", "model", "e-model"], flow: { edge: "e-model", token: "모델 호출" } },
      { cmd: "게이트웨이 모드",
        caption: "use_gateway로 바꾸면 Claude Code는 Bedrock으로 바로 가지 않고 Claude Apps Gateway에 로그인해 요청을 보냅니다. 게이트웨이가 로그인한 사람의 그룹에 허용된 모델만 Bedrock으로 넘기므로, 사용자에게 Bedrock IAM 권한과 로컬 관리자 권한을 주지 않아야 게이트웨이를 우회하지 못합니다.",
        on: ["claude", "gateway", "bedrock", "model", "e-gw1", "e-gw2", "e-model"], flow: { edge: "e-gw1", token: "로그인 · 요청" } }
    ]
  });

  /* ---- Ch2 TASK 03: the three settings layers and deny beats allow ---- */
  LabViz.register("policy-layers", {
    title: "managed, user, project 세 설정 층에서 raw/ 읽기 요청은 거부되고 pseudo/ 읽기 요청은 허용되는 과정",
    viewBox: "0 0 800 450",
    nodes: [
      { id: "managed", shape: "group", label: "managed · 보안 담당자 배포", x: 485, y: 95, w: 590, h: 150 },
      { id: "project", shape: "group", label: "project · 팀 저장소", x: 485, y: 245, w: 590, h: 120 },
      { id: "user", shape: "group", label: "user · 분석가 개인", x: 485, y: 375, w: 590, h: 110 },
      { id: "mfile", shape: "file", label: "/etc/claude-code/\nmanaged-settings.json", sub: "deny: raw/**", x: 335, y: 112, w: 200, h: 82 },
      { id: "dfile", shape: "file", label: "managed-settings.d/\n10-security.json", sub: "ask: git push", x: 585, y: 112, w: 200, h: 82 },
      { id: "ufile", shape: "file", label: "~/.claude/\nsettings.json", x: 335, y: 386, w: 200, h: 60 },
      { id: "unote", shape: "note", tone: "info", label: "분석가가 넣은 allow\nRead(…/raw/**)", x: 610, y: 386, w: 190, h: 54, appear: 4, until: 4 },
      { id: "pfile", shape: "file", label: ".claude/\nsettings.json", x: 335, y: 258, w: 200, h: 60 },
      { id: "req", shape: "note", tone: "info", label: "Read 요청\n(Claude 도구)", x: 75, y: 112, w: 118, h: 56 },
      { id: "deny1", shape: "note", tone: "err", label: "거부\n(deny raw/**)", x: 75, y: 245, w: 118, h: 56, appear: 2, until: 2 },
      { id: "ok1", shape: "note", tone: "ok", label: "허용\n(걸리는 deny 없음)", x: 75, y: 245, w: 118, h: 56, appear: 3, until: 3 },
      { id: "deny2", shape: "note", tone: "err", label: "여전히 거부\n(deny가 먼저)", x: 75, y: 245, w: 118, h: 56, appear: 4, until: 4 },
      { id: "merge", shape: "note", tone: "ok", label: "deny + ask\n함께 적용", x: 75, y: 245, w: 118, h: 56, appear: 5, until: 5 }
    ],
    edges: [
      { id: "e-req", from: "req", to: "mfile" }
    ],
    steps: [
      { cmd: "세 층",
        caption: "Claude Code는 설정 파일을 세 층에서 읽습니다. 보안 담당자는 /etc/claude-code/ 아래 managed 파일을 배포하고, 팀은 프로젝트 저장소의 .claude/settings.json에 설정을 담고, 분석가는 자기 홈의 ~/.claude/settings.json을 고칩니다. 그림의 위쪽 층일수록 우선합니다. 다만 deny는 어느 층에 있든 allow보다 먼저 평가됩니다.",
        on: ["managed", "user", "project", "mfile", "dfile", "ufile", "pfile", "req"] },
      { cmd: "raw/ 요청",
        caption: "분석가가 Read 도구로 raw/customers.csv를 읽으려 합니다. 세 층의 규칙을 합치면 managed의 deny Read(…/raw/**)에 걸려 거부됩니다.",
        on: ["req", "e-req", "managed", "mfile", "deny1"], flow: { edge: "e-req", token: "raw/ 요청" } },
      { cmd: "pseudo/ 요청",
        caption: "같은 도구로 pseudo/customers.csv를 읽으면 걸리는 deny가 없어 허용됩니다. 원본만 막고 분석 작업은 그대로 할 수 있습니다.",
        on: ["req", "e-req", "managed", "user", "project", "ok1"], flow: { edge: "e-req", token: "pseudo/ 요청" } },
      { cmd: "allow로 덮어쓰기",
        caption: "분석가가 자기 settings.json에 raw/ 읽기 allow를 넣어도 소용없습니다. 규칙은 모든 층에서 합쳐진 뒤 deny가 먼저 평가되므로 raw/ 읽기는 여전히 거부됩니다.",
        on: ["req", "e-req", "user", "ufile", "unote", "managed", "mfile", "deny2"], flow: { edge: "e-req", token: "raw/ 요청" } },
      { cmd: "drop-in 조각",
        caption: "TASK 04에서는 managed-settings.d/ 아래에 조각 파일을 더합니다. 본 파일의 deny와 조각의 ask가 한 정책으로 합쳐져 함께 적용됩니다.",
        on: ["managed", "mfile", "dfile", "merge"] }
    ]
  });

  /* ==== end Ch2 Lab 1 =============================================== */

  /* ==== Ch2 Lab 2 ================================================== */

  /* ---- Ch2 Lab 2 TASK 01: the DLP hook pipeline ---- */
  LabViz.register("dlp-hook", {
    title: "프롬프트나 도구 입력이 훅과 dlp-guard.sh를 거쳐 exit 2로 차단되거나 exit 0으로 통과하는 과정",
    viewBox: "0 0 900 430",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 525, y: 245, w: 720, h: 340 },
      { id: "in-gen", shape: "note", label: "입력\n프롬프트 또는\n도구 입력", x: 77, y: 165, w: 150, h: 66, appear: 1, until: 3 },
      { id: "in-rrn", shape: "note", tone: "info", label: "프롬프트\n고객 900101-1234567\n의 가입 이력…", x: 77, y: 165, w: 150, h: 66, appear: 4, until: 4 },
      { id: "in-card", shape: "note", tone: "info", label: "Write 도구 입력\n(파일 내용에\n카드번호)", x: 77, y: 165, w: 150, h: 66, appear: 5, until: 5 },
      { id: "in-pseudo", shape: "note", tone: "info", label: "프롬프트\npseudo/customers.csv\n연령대 요약", x: 77, y: 165, w: 150, h: 66, appear: 6, until: 6 },
      { id: "claude", shape: "note", label: "Claude Code\n(터미널 프로그램)", x: 275, y: 165, w: 140, h: 60 },
      { id: "hook", shape: "note", label: "훅 호출\nUserPromptSubmit\nPreToolUse", x: 470, y: 165, w: 200, h: 66 },
      { id: "guard", shape: "note", label: "dlp-guard.sh\n/opt/dlp", x: 705, y: 165, w: 150, h: 60 },
      { id: "check", shape: "note", label: "jq로 입력을 꺼내\ngrep -E로 패턴 검사", x: 705, y: 270, w: 200, h: 62 },
      { id: "block", shape: "note", tone: "err", label: "패턴 있음 → exit 2 차단\noperation blocked by hook", x: 545, y: 360, w: 250, h: 56 },
      { id: "pass", shape: "note", tone: "ok", label: "패턴 없음 →\nexit 0 통과", x: 790, y: 360, w: 160, h: 56 },
      { id: "toolres", shape: "note", tone: "info", label: "도구 실행 결과\n(훅은 보지 못함)", x: 285, y: 360, w: 200, h: 56 }
    ],
    edges: [
      { id: "e-in", from: "in-gen", to: "claude" },
      { id: "e-claude", from: "claude", to: "hook" },
      { id: "e-hook", from: "hook", to: "guard" },
      { id: "e-chk", from: "guard", to: "check" },
      { id: "e-block", from: "check", to: "block" },
      { id: "e-pass", from: "check", to: "pass" },
      { id: "e-res", from: "claude", to: "toolres" }
    ],
    steps: [
      { cmd: "입력",
        caption: "검사는 두 가지 입력에서 시작합니다. 하나는 분석가가 Claude에 보내는 프롬프트이고, 다른 하나는 Claude가 실행하려는 도구 호출(Bash·Write·Edit·WebFetch)의 입력입니다.",
        on: ["in-gen", "e-in", "claude"] },
      { cmd: "훅 호출",
        caption: "managed 정책에 등록한 훅이 호출됩니다. 프롬프트를 처리하기 전에는 UserPromptSubmit이, Bash·Write·Edit·WebFetch 도구를 실행하기 직전에는 PreToolUse가 /opt/dlp/dlp-guard.sh를 부르고, 입력 내용을 JSON으로 넘깁니다.",
        on: ["claude", "hook", "guard", "e-claude", "e-hook"] },
      { cmd: "dlp-guard.sh",
        caption: "스크립트는 jq로 JSON에서 .prompt를(도구 호출이면 .tool_input을) 꺼내 글자로 만들고, grep -E로 주민등록번호·카드번호·휴대폰·계좌번호·AWS 키 패턴과 비교합니다. 결과는 종료 코드로 알립니다. exit 2는 차단, exit 0은 통과입니다.",
        on: ["guard", "check", "e-chk"] },
      { cmd: "주민번호 프롬프트",
        caption: "고객 900101-1234567이 든 프롬프트는 주민등록번호 패턴에 맞아 exit 2로 끝납니다. 프롬프트 처리가 막히고 UserPromptSubmit operation blocked by hook이 표시되며, 보낸 문장은 입력창에 그대로 돌아옵니다.",
        on: ["in-rrn", "e-in", "claude", "e-claude", "hook", "e-hook", "guard", "e-chk", "check", "e-block", "block"],
        flow: { edge: "e-block", token: "exit 2" }, marks: { block: "x" } },
      { cmd: "카드번호 Write",
        caption: "cards.csv를 읽는 것은 통과합니다. Read는 이 훅의 대상이 아닙니다. 하지만 읽은 카드번호를 Write 도구로 notes.txt에 쓰려 하면, PreToolUse가 Write의 입력(파일 내용)을 검사해 패턴을 찾고 PreToolUse:Write hook error … DLP로 차단합니다.",
        on: ["in-card", "e-in", "claude", "e-claude", "hook", "e-hook", "guard", "e-chk", "check", "e-block", "block"],
        flow: { edge: "e-block", token: "exit 2" }, marks: { block: "x" } },
      { cmd: "pseudo 분석",
        caption: "가명 토큰(CI_…)만 다루는 pseudo/ 분석 요청에는 패턴이 없어 grep이 일치하지 않고 exit 0으로 통과합니다. 분석팀의 일상 업무는 그대로 진행됩니다.",
        on: ["in-pseudo", "e-in", "claude", "e-claude", "hook", "e-hook", "guard", "e-chk", "check", "e-pass", "pass"],
        flow: { edge: "e-pass", token: "exit 0" }, marks: { block: null, pass: "check" } },
      { cmd: "훅이 보는 것",
        caption: "훅은 도구에 들어가는 입력만 봅니다. Read로 읽은 파일 내용이나 도구 실행 결과는 검사하지 않고, 그 내용이 모델 컨텍스트에 들어가는 것도 막지 못합니다. Bash 리다이렉션(awk … > notes.txt)도 명령 문자열에 카드번호가 없으면 통과합니다. 민감 파일 자체는 permissions.deny의 Read(...)와 샌드박스로 막습니다.",
        on: ["claude", "e-res", "toolres"],
        flow: { edge: "e-res", token: "실행 결과" }, marks: { pass: null } }
    ]
  });

  /* ---- Ch2 Lab 2 TASK 02: fail-open vs fail-closed ---- */
  LabViz.register("fail-open-closed", {
    title: "jq 없음, 스크립트 없음, 스크립트 멈춤 같은 고장에서 고치기 전(fail-open)은 통과하고 고친 뒤(fail-closed)는 차단되는 과정",
    viewBox: "0 0 900 440",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 450, y: 240, w: 860, h: 360 },
      { id: "claude", shape: "note", label: "Claude Code\n(터미널 프로그램)", x: 110, y: 150, w: 140, h: 60 },
      { id: "hook", shape: "note", label: "훅 호출\n(managed 정책)", x: 310, y: 150, w: 170, h: 60 },
      { id: "guard", shape: "note", label: "dlp-guard.sh\n/opt/dlp", x: 530, y: 150, w: 150, h: 60 },
      { id: "f-ask", shape: "note", tone: "info", label: "고장 나면?\n(jq · 스크립트 · 멈춤)", x: 530, y: 260, w: 230, h: 58, appear: 1, until: 1 },
      { id: "f-jq", shape: "note", tone: "err", label: "jq 없음\n(명령을 찾지 못함)", x: 530, y: 260, w: 230, h: 58, appear: 2, until: 3 },
      { id: "f-gone", shape: "note", tone: "err", label: "스크립트 없음 · 시작 못함\n또는 멈춤(시간 초과)", x: 530, y: 260, w: 230, h: 58, appear: 4, until: 5 },
      { id: "open", shape: "note", tone: "err", label: "fail-open (고치기 전)\nexit 2가 아니면 비차단 오류 → 작업 계속", x: 230, y: 360, w: 340, h: 60 },
      { id: "closed", shape: "note", tone: "ok", label: "fail-closed (고친 뒤)\n오류도 exit 2 또는 onFailure: block → 차단", x: 680, y: 360, w: 340, h: 60 }
    ],
    edges: [
      { id: "e-claude", from: "claude", to: "hook" },
      { id: "e-hook", from: "hook", to: "guard" },
      { id: "e-fail", from: "guard", to: "f-ask", label: "고장" },
      { id: "e-open", from: "f-ask", to: "open" },
      { id: "e-closed", from: "f-ask", to: "closed" }
    ],
    steps: [
      { cmd: "정상일 때",
        caption: "정상일 때는 훅이 dlp-guard.sh를 부르고, 스크립트가 패턴을 찾으면 exit 2로 차단합니다. 그런데 이 줄 중간이 고장 나면 어떻게 될까요? 세 가지 고장을 차례로 봅니다. jq 없음, 스크립트 없음, 스크립트 멈춤입니다.",
        on: ["claude", "e-claude", "hook", "e-hook", "guard", "f-ask"] },
      { cmd: "jq 없음 · 고치기 전",
        caption: "jq가 없는 PC를 흉내 내면(sed로 jq를 jq-missing으로 바꿈) 스크립트가 jq를 못 찾아 TEXT가 비고, grep이 패턴을 못 찾아 exit=0으로 끝납니다. 훅에서 차단은 exit 2뿐이고 그 밖의 오류는 비차단 오류라서, 주민등록번호가 든 프롬프트도 그대로 통과합니다. 이것이 fail-open입니다.",
        on: ["guard", "e-fail", "f-jq", "e-open", "open"],
        flow: { edge: "e-open", token: "exit=0" }, marks: { open: "x" } },
      { cmd: "jq 없음 · 고친 뒤",
        caption: "고친 스크립트는 command -v jq로 jq가 있는지 먼저 확인하고, 없으면 exit 2로 막습니다. jq 실행이 실패해도, grep 종료 코드가 0(일치)·1(불일치) 이외의 오류여도 exit 2입니다. 통과는 grep이 확실히 불일치(1)일 때뿐입니다. 이것이 fail-closed입니다.",
        on: ["guard", "e-fail", "f-jq", "e-closed", "closed"],
        flow: { edge: "e-closed", token: "exit 2" }, marks: { open: null, closed: "check" } },
      { cmd: "스크립트 없음·멈춤 · 고치기 전",
        caption: "스크립트를 고쳐도, 스크립트 파일이 없거나 시작하지 못하거나 시간 초과가 되면 스크립트 안의 처리는 실행되지 않습니다. 이때도 그대로 통과합니다.",
        on: ["guard", "e-fail", "f-gone", "e-open", "open"],
        flow: { edge: "e-open", token: "비차단 오류" }, marks: { closed: null, open: "x" } },
      { cmd: "onFailure: block",
        caption: "훅 설정에 \"onFailure\": \"block\"(v2.1.295+)을 넣으면 이런 실패도 차단으로 처리됩니다. 스크립트를 치운 뒤에는 민감정보가 없는 프롬프트도 UserPromptSubmit operation blocked by hook … blocking because onFailure is \"block\"으로 막힙니다.",
        on: ["guard", "e-fail", "f-gone", "e-closed", "closed"],
        flow: { edge: "e-closed", token: "onFailure: block" }, marks: { open: null, closed: "check" } }
    ]
  });

  /* ==== end Ch2 Lab 2 =============================================== */

  /* ==== Ch3 ======================================================== */

  /* ---- Ch3 TASK 04: three dispatch patterns ---- */
  LabViz.register("subagent-dispatch", {
    title: "메인 Claude가 서브에이전트 3종에게 자동, 명시, 병렬로 일을 나눠 맡기고 요약만 돌려받아 segments.md를 쓰는 과정",
    viewBox: "0 0 1010 535",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 490, y: 275, w: 680, h: 490 },
      { id: "user", shape: "note", tone: "info", label: "사용자\n(터미널)", x: 70, y: 120, w: 100, h: 54 },
      { id: "main", shape: "note", label: "메인 Claude\n(Claude Code · Opus 5.5)", x: 490, y: 120, w: 230, h: 58 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 920, y: 120 },
      { id: "sa", shape: "group", label: "spending-analyst\n별도 컨텍스트 창", x: 270, y: 400, w: 210, h: 210 },
      { id: "sa-f1", shape: "file", label: "카드 소비", sub: "card_spend_monthly.csv", x: 270, y: 383, w: 190, h: 56 },
      { id: "sa-f2", shape: "file", label: "계좌 잔액", sub: "bank_accounts.csv", x: 270, y: 449, w: 190, h: 56 },
      { id: "pa", shape: "group", label: "portfolio-analyst\n별도 컨텍스트 창", x: 490, y: 400, w: 210, h: 210 },
      { id: "pa-f1", shape: "file", label: "증권 · 보험", sub: "securities.csv\ninsurance.csv", x: 490, y: 386, w: 190, h: 62 },
      { id: "pa-f2", shape: "file", label: "연금 · 계좌", sub: "pensions.csv\nbank_accounts.csv", x: 490, y: 456, w: 190, h: 62 },
      { id: "rr", shape: "group", label: "risk-reviewer\n별도 컨텍스트 창", x: 710, y: 400, w: 210, h: 210 },
      { id: "rr-f1", shape: "file", label: "점검 대상", sub: "분석 결과 · 제안서", x: 710, y: 383, w: 190, h: 56 },
      { id: "rr-f2", shape: "file", label: "근거 확인", sub: "pseudo/ 파일", x: 710, y: 449, w: 190, h: 56 },
      { id: "seg", shape: "file", label: "segments.md", sub: "149 · 121 · 120명", x: 420, y: 235, w: 110, h: 50, appear: 9 }
    ],
    edges: [
      { id: "e-req", from: "user", to: "main", label: "요청" },
      { id: "e-ask", from: "main", to: "bedrock", via: [[700, 106], [860, 106]] },
      { id: "e-resp", from: "bedrock", to: "main", via: [[860, 134], [700, 134]] },
      { id: "e-sa", from: "main", to: "sa", via: [[270, 150], [270, 290]] },
      { id: "r-sa", from: "sa", to: "main", via: [[300, 290], [300, 170]] },
      { id: "e-pa", from: "main", to: "pa", via: [[500, 150], [500, 290]] },
      { id: "r-pa", from: "pa", to: "main", via: [[530, 290], [530, 150]] },
      { id: "e-rr", from: "main", to: "rr", via: [[710, 150], [710, 290]] },
      { id: "r-rr", from: "rr", to: "main", via: [[680, 290], [680, 170]] },
      { id: "e-sub", from: "ec2", to: "bedrock", via: [[880, 390], [995, 390], [995, 120]] },
      { id: "e-write", from: "main", to: "seg", via: [[420, 150], [420, 195]], appear: 9 }
    ],
    steps: [
      { cmd: "준비",
        caption: "에이전트 정의 파일 3개가 .claude/agents/에 있습니다. 서브에이전트마다 자기 컨텍스트 창(대화 기억 공간), 도구, 모델(sonnet)을 따로 갖고, 읽는 데이터도 다릅니다.",
        on: ["main", "sa", "pa", "rr"] },
      { cmd: "A 자동 · 요청",
        caption: "패턴 A입니다. 사용자가 에이전트 이름 없이 \"40~55세 고소득 고객이 IRP를 얼마나 갖고 있는지 분석해 주세요\"라고 요청합니다. 요청은 메인 Claude가 받습니다.",
        on: ["user", "e-req", "main"], flow: { edge: "e-req", token: "분석 요청" } },
      { cmd: "A 자동 · 모델이 고름",
        caption: "Claude Code가 요청과 각 에이전트의 description을 모델에 보내고, 모델이 가장 맞는 portfolio-analyst를 고릅니다. 집계 한 번이면 위임하지 않고 메인이 직접 처리하기도 하므로 자동 위임은 보장되지 않습니다.",
        on: ["main", "bedrock", "e-ask", "e-resp"], flow: { edge: "e-resp", token: "portfolio-analyst" } },
      { cmd: "A 자동 · 위임",
        caption: "메인이 portfolio-analyst에게 일을 맡깁니다. 이 에이전트는 자기 컨텍스트 창에서 securities, insurance, pensions, bank_accounts 파일을 읽고 집계하며, 서브에이전트도 각자 Bedrock 모델(sonnet)로 생각합니다.",
        on: ["main", "e-pa", "pa", "pa-f1", "pa-f2", "bedrock", "e-sub"], flow: { edge: "e-pa", token: "위임" } },
      { cmd: "A 자동 · 요약 반환",
        caption: "긴 읽기와 집계는 에이전트의 컨텍스트 창에서 끝나고, 메인에는 요약만 돌아옵니다. 메인 컨텍스트가 무거워지지 않습니다.",
        on: ["pa", "r-pa", "main"], flow: { edge: "r-pa", token: "요약만" } },
      { cmd: "B 명시",
        caption: "패턴 B입니다. 사용자가 \"risk-reviewer 에이전트를 사용해서\"처럼 이름을 직접 지정합니다. 메인은 다른 에이전트를 따져 보지 않고 risk-reviewer에게 맡기고, 이 에이전트는 읽기 도구만 있어 점검 결과만 돌려줍니다. 호출을 만드는 일에는 메인의 모델이 쓰입니다.",
        on: ["user", "e-req", "main", "bedrock", "e-ask", "e-resp", "e-rr", "rr", "rr-f1", "rr-f2"], flow: { edge: "e-rr", token: "risk-reviewer" }, marks: { rr: "lock" } },
      { cmd: "C 병렬 · 동시 위임",
        caption: "패턴 C입니다. 세 작업이 서로 독립이라 모델이 Agent 호출 3개를 한 번에 내고, 메인이 세 에이전트를 동시에 띄웁니다. 세 에이전트도 각자 Bedrock 모델로 생각합니다. 총 시간은 가장 오래 걸린 쪽 기준이고, 비용은 합산됩니다.",
        on: ["main", "bedrock", "e-ask", "e-resp", "e-sa", "e-pa", "e-rr", "e-sub", "sa", "pa", "rr", "sa-f1", "sa-f2", "pa-f1", "pa-f2", "rr-f1", "rr-f2"],
        flow: { edge: "e-pa", token: "동시에 3개" } },
      { cmd: "C 병렬 · 요약 반환",
        caption: "세 에이전트는 각자 컨텍스트 창에서 일하고 요약만 돌려줍니다. 메인 컨텍스트에는 요약 세 개만 쌓입니다. 에이전트마다 Bedrock 모델을 따로 호출하므로 비용은 합산됩니다.",
        on: ["sa", "pa", "rr", "r-sa", "r-pa", "r-rr", "main", "bedrock", "e-sub"], flow: { edge: "r-pa", token: "요약만" } },
      { cmd: "segments.md 저장",
        caption: "세 에이전트에는 Write 도구가 없어서 메인이 요약을 모아 segments.md를 씁니다. 참고 결과는 (a) 149명, (b) 121명, (c) 120명이고, 숫자는 실행마다 다를 수 있습니다. 표와 서비스 제안 문장은 메인의 모델이 요약을 보고 씁니다.",
        on: ["main", "bedrock", "e-ask", "e-resp", "e-write", "seg"], flow: { edge: "e-write", token: "Write" } }
    ]
  });

  /* ---- Ch3 TASK 02: tool isolation ---- */
  LabViz.register("tool-isolation", {
    title: "tools에 Write가 없는 risk-reviewer가 저장 요청을 거부하고, sed로 Write를 추가한 뒤 새 세션에서 허용되고, mv로 읽기 전용으로 되돌리는 과정",
    viewBox: "0 0 900 500",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 515, y: 270, w: 730, h: 440 },
      { id: "user", shape: "note", tone: "info", label: "사용자\n(Claude 입력창)", x: 70, y: 225, w: 110, h: 54 },
      { id: "main", shape: "note", label: "메인 Claude\n(Claude Code)", x: 255, y: 225, w: 140, h: 58 },
      { id: "term", shape: "note", tone: "info", label: "터미널\n(~/claude-lab/ch4)", x: 255, y: 385, w: 150, h: 58 },
      { id: "rr", shape: "group", label: "risk-reviewer (서브에이전트)", x: 590, y: 225, w: 440, h: 200 },
      { id: "rr-a", shape: "note", label: "tools: Read, Grep, Glob", x: 590, y: 200, w: 400, h: 44, appear: 1, until: 3 },
      { id: "rr-b", shape: "note", tone: "info", label: "tools: Read, Grep, Glob, Write", x: 590, y: 200, w: 400, h: 44, appear: 4, until: 6 },
      { id: "rr-c", shape: "note", label: "tools: Read, Grep, Glob", x: 590, y: 200, w: 400, h: 44, appear: 7 },
      { id: "t-read", shape: "note", label: "Read", x: 455, y: 275, w: 76, h: 44 },
      { id: "t-grep", shape: "note", label: "Grep", x: 540, y: 275, w: 76, h: 44 },
      { id: "t-glob", shape: "note", label: "Glob", x: 625, y: 275, w: 76, h: 44 },
      { id: "w-no", shape: "note", tone: "err", label: "Write\n(목록 밖)", x: 735, y: 275, w: 84, h: 44, appear: 3, until: 3 },
      { id: "w-yes", shape: "note", tone: "ok", label: "Write\n(추가)", x: 735, y: 275, w: 84, h: 44, appear: 4, until: 6 },
      { id: "disk", shape: "group", label: "작업 폴더", x: 590, y: 410, w: 440, h: 80 },
      { id: "n-no", shape: "note", tone: "err", label: "review-notes.md\n만들어지지 않음", x: 730, y: 418, w: 150, h: 48, appear: 3, until: 5 },
      { id: "n-yes", shape: "note", tone: "ok", label: "review-notes.md\n저장됨", x: 730, y: 418, w: 150, h: 48, appear: 6, until: 6 }
    ],
    edges: [
      { id: "e-req", from: "user", to: "main", label: "요청" },
      { id: "e-del", from: "main", to: "rr", label: "위임" },
      { id: "e-write", from: "rr", to: "disk", label: "Write", appear: 6, until: 6 },
      { id: "e-term", from: "term", to: "rr" }
    ],
    steps: [
      { cmd: "tools: Read, Grep, Glob",
        caption: "risk-reviewer 정의 파일의 tools에는 읽기 도구 셋만 적혀 있습니다. 목록에 없는 도구는 시도 자체가 차단되므로 읽기 전용 에이전트입니다.",
        on: ["rr", "rr-a", "t-read", "t-grep", "t-glob"], marks: { "rr-a": "lock" } },
      { cmd: "일부러 권한 밖 요청",
        caption: "사용자가 \"점검하고 결과를 review-notes.md로 저장해 주세요\"라고 요청합니다. 점검은 읽기라 가능하지만 저장은 Write가 필요합니다.",
        on: ["user", "e-req", "main", "e-del", "rr", "rr-a"], flow: { edge: "e-del", token: "점검 + 저장" } },
      { cmd: "Write 거부",
        caption: "risk-reviewer가 Write를 불러 보지만 도구 목록에 없어서 \"No such tool available\" 오류가 납니다. 다른 쓰기 수단도 없어 review-notes.md는 만들어지지 않습니다.",
        on: ["rr", "rr-a", "w-no", "n-no", "disk"], marks: { "w-no": "x" } },
      { cmd: "sed로 Write 추가",
        caption: "터미널에서 sed -i.bak가 tools 줄에 Write를 붙이고 원본을 risk-reviewer.md.bak에 남깁니다. 그러나 이미 뜬 인스턴스는 처음 받은 도구 권한을 유지하고 메인도 \"저장 불가\"를 기억하므로, 같은 요청을 반복하면 여전히 거부됩니다.",
        on: ["term", "e-term", "rr", "rr-b", "w-yes"], flow: { edge: "e-term", token: "sed -i.bak" } },
      { cmd: "/exit 후 재진입",
        caption: "/exit로 세션을 나갔다가 claude로 다시 들어옵니다. 새 세션은 정의 파일을 다시 읽어서 새 인스턴스가 Write 권한을 받습니다. /clear로 맥락만 비워도 같은 효과입니다.",
        on: ["term", "e-term", "main", "rr", "rr-b", "w-yes"], flow: { edge: "e-term", token: "/exit → claude" } },
      { cmd: "재시도: 허용",
        caption: "같은 요청을 새 위임으로 다시 보내면 Write가 통과해 review-notes.md가 저장됩니다. 의도적으로 권한을 준 결과입니다.",
        on: ["user", "main", "e-del", "rr", "rr-b", "w-yes", "e-write", "disk", "n-yes"],
        flow: { edge: "e-write", token: "Write 호출" }, marks: { "w-yes": "check", "n-yes": "check" } },
      { cmd: "mv로 원상 복구",
        caption: "mv가 .bak을 원래 이름으로 되돌려 tools가 다시 Read, Grep, Glob이 되고, rm -f가 review-notes.md를 지웁니다. 이 읽기 전용 정의가 이후 TASK에서 쓰는 최종 버전입니다.",
        on: ["term", "e-term", "rr", "rr-c"], flow: { edge: "e-term", token: "mv .bak 복원" }, marks: { "rr-c": "lock" } }
    ]
  });

  /* ==== end Ch3 ===================================================== */

  /* ==== Ch4 ======================================================== */

  /* ---- Ch4 TASK 02: four ingredients become the asset-team-kit folder ---- */
  LabViz.register("plugin-bundle", {
    title: "Ch3의 에이전트 3종, retirement-gap 스킬, Ch2의 DLP 스크립트를 복사하고 Claude가 plugin.json과 hooks.json을 써서 asset-team-kit 플러그인 폴더를 만드는 과정",
    viewBox: "0 0 1000 590",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 500, y: 250, w: 980, h: 440 },
      { id: "ing-agents", shape: "folder", label: "에이전트 3종 (Ch3)", sub: "ch4/.claude/agents/*.md", x: 150, y: 135, w: 230, h: 66 },
      { id: "ing-skill", shape: "file", label: "retirement-gap 스킬", sub: "SKILL.md (TASK 01)", x: 150, y: 205, w: 230, h: 56 },
      { id: "ing-dlp", shape: "file", label: "DLP 스크립트 (Ch2)", sub: "/opt/dlp/dlp-guard.sh", x: 150, y: 275, w: 230, h: 56 },
      { id: "ing-claude", shape: "note", label: "Claude Code\n(플러그인 폴더에서 실행)", x: 150, y: 385, w: 230, h: 58, appear: 4 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 150, y: 520, appear: 4 },
      { id: "kit", shape: "group", label: "asset-team-kit/  (플러그인 폴더)", x: 710, y: 265, w: 520, h: 390 },
      { id: "k-agents", shape: "folder", label: "agents/", sub: "에이전트 3개 .md", x: 710, y: 135, w: 440, h: 56, appear: 1 },
      { id: "k-skill", shape: "file", label: "skills/retirement-gap/SKILL.md", x: 710, y: 205, w: 440, h: 50, appear: 2 },
      { id: "k-script", shape: "file", label: "scripts/dlp-guard.sh", sub: "실행 권한 755", x: 710, y: 275, w: 440, h: 56, appear: 3 },
      { id: "k-plugin", shape: "file", label: ".claude-plugin/plugin.json", sub: "이름 · 버전 · 설명", x: 710, y: 345, w: 440, h: 56, appear: 4 },
      { id: "k-hooks", shape: "file", label: "hooks/hooks.json", sub: "이벤트 → dlp-guard.sh", x: 710, y: 415, w: 440, h: 56, appear: 4 }
    ],
    edges: [
      { id: "e-agents", from: "ing-agents", to: "k-agents", label: "cp" },
      { id: "e-skill", from: "ing-skill", to: "k-skill", label: "cp" },
      { id: "e-dlp", from: "ing-dlp", to: "k-script", label: "cp + chmod 755" },
      { id: "e-ask", from: "ing-claude", to: "bedrock", label: "생성 요청", appear: 4 },
      { id: "e-plugin", from: "ing-claude", to: "k-plugin", appear: 4 },
      { id: "e-hooks", from: "ing-claude", to: "k-hooks", appear: 4 },
      { id: "e-ref", from: "k-hooks", to: "k-script", via: [[950, 415], [950, 275]], appear: 6, until: 6 }
    ],
    steps: [
      { cmd: "cp 에이전트 3개",
        caption: "Ch3에서 만든 에이전트 정의 파일 세 개(spending-analyst, portfolio-analyst, risk-reviewer)를 플러그인의 agents/ 폴더로 복사합니다.",
        on: ["ing-agents", "e-agents", "k-agents", "kit"], flow: { edge: "e-agents", token: "agents/*.md" } },
      { cmd: "cp SKILL.md",
        caption: "TASK 01의 retirement-gap 스킬을 skills/retirement-gap/ 폴더로 복사합니다. 폴더 이름이 스킬 이름과 같아야 합니다.",
        on: ["ing-skill", "e-skill", "k-skill", "kit"], flow: { edge: "e-skill", token: "SKILL.md" } },
      { cmd: "cp + chmod 755",
        caption: "Ch2 Lab 2의 DLP 스크립트를 scripts/로 복사하고 실행 권한(755)을 줍니다. 훅이 이 스크립트를 실행하므로 실행 권한이 있어야 합니다.",
        on: ["ing-dlp", "e-dlp", "k-script", "kit"], flow: { edge: "e-dlp", token: "dlp-guard.sh" } },
      { cmd: "Claude에게 나머지를 시키기",
        caption: "플러그인 폴더에서 Claude를 열어 plugin.json과 hooks.json을 만들게 합니다. 파일 내용을 생각해 쓰는 것은 모델이므로 Amazon Bedrock이 켜집니다. 막히면 정답지 블록으로 같은 파일을 직접 씁니다.",
        on: ["ing-claude", "bedrock", "e-ask", "e-plugin", "e-hooks", "k-plugin", "k-hooks", "kit"], flow: { edge: "e-ask", token: "파일 내용 생성" } },
      { cmd: "plugin.json",
        caption: "plugin.json은 플러그인의 신분증입니다. name은 asset-team-kit이고, 이 이름이 스킬 이름 앞에 붙어 /asset-team-kit:retirement-gap이 됩니다. version은 0.1.0, description은 한국어 설명입니다.",
        on: ["k-plugin", "kit"] },
      { cmd: "hooks.json",
        caption: "hooks.json은 UserPromptSubmit(프롬프트를 보낼 때)과 PreToolUse(도구를 쓰기 전, Bash|Write|Edit|WebFetch)에서 ${CLAUDE_PLUGIN_ROOT}/scripts/dlp-guard.sh를 실행하라고 적습니다. 변수는 플러그인이 설치된 폴더로 바뀝니다.",
        on: ["k-hooks", "e-ref", "k-script", "kit"], flow: { edge: "e-ref", token: "${CLAUDE_PLUGIN_ROOT}" } },
      { cmd: "claude plugin validate",
        caption: "validate가 폴더 구조와 두 JSON 파일을 검사합니다. 경고가 남아도 마지막 줄이 Validation passed with warnings면 통과이고, 이 폴더가 TASK 03에서 마켓플레이스에 올라가는 플러그인입니다.",
        on: ["k-agents", "k-skill", "k-script", "k-plugin", "k-hooks", "kit"], marks: { kit: "check" } }
    ]
  });

  /* ---- Ch4 TASK 03-04: marketplace catalog -> install -> pension-product.md -> plugin hook vs managed hook ---- */
  LabViz.register("marketplace-install", {
    title: "fsi-local 마켓플레이스 카탈로그를 동료 폴더에서 등록하고 asset-team-kit을 설치해 기획서를 만들고, 플러그인 훅이 주민번호 프롬프트를 막지만 사용자가 끌 수 있어 managed 훅이 따로 필요한 이유",
    viewBox: "0 0 1100 610",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 450, y: 305, w: 880, h: 560 },
      { id: "mk", shape: "group", label: "marketplace/ (카탈로그 폴더)", x: 150, y: 190, w: 250, h: 230 },
      { id: "mk-json", shape: "file", label: "marketplace.json", sub: ".claude-plugin/ · fsi-local", x: 150, y: 170, w: 220, h: 60 },
      { id: "mk-plug", shape: "folder", label: "plugins/asset-team-kit/", sub: "TASK 02의 플러그인", x: 150, y: 260, w: 220, h: 66 },
      { id: "col", shape: "group", label: "colleague/ (동료 폴더)", x: 600, y: 315, w: 540, h: 500 },
      { id: "c-claude", shape: "note", label: "동료의 Claude Code\n(새 세션)", x: 440, y: 300, w: 190, h: 58 },
      { id: "c-inst", shape: "note", tone: "ok", label: "asset-team-kit\n설치됨 (user 범위)", x: 440, y: 150, w: 190, h: 58, appear: 3 },
      { id: "c-skill", shape: "note", label: "/asset-team-kit:\nretirement-gap", x: 730, y: 130, w: 200, h: 56, appear: 4 },
      { id: "c-agents", shape: "note", label: "@asset-team-kit:\n에이전트 3개", x: 730, y: 205, w: 200, h: 56, appear: 4 },
      { id: "c-md", shape: "file", label: "pension-product.md", sub: "집계만 · 식별자 없음", x: 730, y: 345, w: 200, h: 60, appear: 5 },
      { id: "c-hook", shape: "note", label: "플러그인 훅\ndlp-guard.sh", x: 730, y: 450, w: 200, h: 56, appear: 6 },
      { id: "c-block", shape: "note", tone: "err", label: "차단: This hook comes from the\nasset-team-kit@fsi-local plugin", x: 440, y: 450, w: 290, h: 56, appear: 6, until: 6 },
      { id: "c-off", shape: "note", tone: "err", label: "/plugin에서 끄면\n이 훅도 사라짐", x: 730, y: 520, w: 200, h: 50, appear: 7 },
      { id: "mg", shape: "note", tone: "ok", label: "managed 훅 (Ch2 Lab 2)\nmanaged-settings.json\n사용자가 끌 수 없음", x: 150, y: 480, w: 220, h: 76, appear: 7 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 1010, y: 300 }
    ],
    edges: [
      { id: "e-add", from: "c-claude", to: "mk-json", label: "marketplace add", appear: 2, until: 2 },
      { id: "e-inst", from: "mk-plug", to: "c-inst", label: "install", appear: 3, until: 3 },
      { id: "e-skill", from: "c-inst", to: "c-skill", appear: 4, until: 4 },
      { id: "e-agents", from: "c-inst", to: "c-agents", appear: 4, until: 4 },
      { id: "e-model", from: "c-claude", to: "bedrock", label: "모델 호출", appear: 5, until: 5 },
      { id: "e-write", from: "c-claude", to: "c-md", label: "Write", appear: 5, until: 5 },
      { id: "e-hook", from: "c-claude", to: "c-hook", label: "프롬프트 검사", via: [[440, 380], [630, 450]], appear: 6, until: 6 },
      { id: "e-mg", from: "mg", to: "c-claude", label: "항상 적용", appear: 7 }
    ],
    steps: [
      { cmd: "marketplace.json",
        caption: "마켓플레이스는 플러그인 목록을 적은 카탈로그 파일입니다. TASK 03에서 이름을 fsi-local로 하고, plugins 목록에 asset-team-kit과 그 위치(./plugins/asset-team-kit)를 적습니다.",
        on: ["mk", "mk-json", "mk-plug"] },
      { cmd: "/plugin marketplace add",
        caption: "동료 폴더에서 새 Claude 세션을 열고 카탈로그 폴더를 등록합니다. 아직 플러그인은 설치되지 않았고, \"Successfully added marketplace: fsi-local\"이 나옵니다.",
        on: ["c-claude", "e-add", "mk-json", "col"], flow: { edge: "e-add", token: "카탈로그 등록" } },
      { cmd: "/plugin install asset-team-kit@fsi-local",
        caption: "설치 범위를 묻고, 기본값 user 범위로 Enter를 누르면 플러그인이 설치되어 바로 켜집니다(\"Plugin is now active\"). 설치 한 줄에 에이전트, 스킬, 훅이 함께 따라옵니다.",
        on: ["mk-plug", "e-inst", "c-inst", "col"], flow: { edge: "e-inst", token: "asset-team-kit" } },
      { cmd: "@asset · /retire",
        caption: "입력창에 @asset을 치면 플러그인 이름이 붙은 에이전트 세 개가, /retire를 치면 /asset-team-kit:retirement-gap 스킬이 보입니다. 동료 폴더에는 이 파일들이 없었는데 설치로 따라온 것입니다.",
        on: ["c-inst", "e-skill", "e-agents", "c-skill", "c-agents", "col"], flow: { edge: "e-skill", token: "스킬 · 에이전트" } },
      { cmd: "pension-product.md",
        caption: "요청 한 번으로 메인이 retirement-gap 스킬로 격차 표를 만들고, portfolio-analyst와 risk-reviewer에게 분석과 점검을 맡긴 뒤 pension-product.md를 씁니다. 메인과 서브에이전트가 모두 Bedrock 모델로 생각하고, 파일은 메인이 씁니다.",
        on: ["c-claude", "e-model", "bedrock", "e-write", "c-md", "c-agents", "c-skill", "col"], flow: { edge: "e-write", token: "Write" } },
      { cmd: "고객 900101-1234567 조회해줘",
        caption: "주민번호 형식의 프롬프트를 보냅니다. 플러그인의 UserPromptSubmit 훅이 모델에 가기 전에 검사해 차단하고, \"This hook comes from the asset-team-kit@fsi-local plugin.\"을 표시합니다. 모델 호출은 일어나지 않습니다.",
        on: ["c-claude", "e-hook", "c-hook", "c-block", "col"], flow: { edge: "e-hook", token: "프롬프트" }, marks: { "c-block": "x" } },
      { cmd: "플러그인 훅 vs managed 훅",
        caption: "플러그인 훅은 팀의 안전망입니다. 사용자가 /plugin에서 플러그인을 끄거나 지우면 훅도 함께 사라집니다. 조직이 반드시 지켜야 하는 DLP는 Ch2 Lab 2처럼 managed 정책의 훅으로 강제합니다.",
        on: ["c-hook", "c-off", "mg", "e-mg", "c-claude"], marks: { mg: "lock" } }
    ]
  });

  /* ==== end Ch4 ===================================================== */

  /* ==== Ch5 ======================================================== */

  /* ---- Ch5 TASK 01-02: the same head -n 400 request, before and after the filter hook ---- */
  LabViz.register("context-budget", {
    title: "head -n 400 결과 약 20,000자가 컨텍스트 창에 그대로 들어가는 경우와, PreToolUse 필터 훅이 명령을 머리글과 50행으로 바꿔 약 2,600자만 들어가는 경우의 비교",
    viewBox: "0 0 1000 540",
    nodes: [
      { id: "cc", shape: "note", label: "Claude Code\n(ccb-endpoint에서 실행)", x: 105, y: 55, w: 190, h: 56 },
      { id: "cmd1", shape: "note", label: "Bash(head -n 400 pseudo/card_transactions.csv)\n원래 명령 · 도구 호출 화면에도 이 명령이 보입니다", x: 465, y: 55, w: 400, h: 56, appear: 1 },
      { id: "hook", shape: "note", tone: "info", label: "PreToolUse 훅\nfilter-tx-output.sh", x: 890, y: 100, w: 200, h: 60, appear: 2 },
      { id: "cmd2", shape: "note", tone: "ok", label: "실제로 실행되는 명령\nhead -n 51 pseudo/card_transactions.csv; echo \"[필터] 전체 …행 중 …\"", x: 430, y: 135, w: 470, h: 56, appear: 2 },
      { id: "wa", shape: "group", label: "컨텍스트 창 · TASK 01 (훅 없음)", x: 430, y: 255, w: 820, h: 120, appear: 1 },
      { id: "fa", shape: "note", label: "고정 부분\nCLAUDE.md 등", x: 100, y: 284, w: 140, h: 46, appear: 1 },
      { id: "ba", shape: "note", tone: "err", label: "head -n 400 결과\n약 20,000자", x: 380, y: 284, w: 400, h: 46, appear: 1 },
      { id: "marker", shape: "note", tone: "info", label: "약 30,000자부터는\n파일로 저장하고\n미리보기만 표시", x: 720, y: 284, w: 160, h: 58, appear: 4, until: 4 },
      { id: "wb", shape: "group", label: "컨텍스트 창 · TASK 02 (필터 훅 후)", x: 430, y: 405, w: 820, h: 120, appear: 3 },
      { id: "fb", shape: "note", label: "고정 부분\nCLAUDE.md 등", x: 100, y: 434, w: 140, h: 46, appear: 3 },
      { id: "sb", shape: "note", tone: "ok", label: "약\n2,600자", x: 215, y: 434, w: 70, h: 46, appear: 3 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 925, y: 300 }
    ],
    edges: [
      { id: "e-run", from: "cc", to: "cmd1", label: "Bash 호출", appear: 1 },
      { id: "e-in", from: "cmd1", to: "hook", label: "검사", appear: 2 },
      { id: "e-out", from: "hook", to: "cmd2", label: "바꿔 줌", appear: 2 },
      { id: "e-ma", from: "wa", to: "bedrock", label: "입력", appear: 1, until: 1 },
      { id: "e-mb", from: "wb", to: "bedrock", label: "입력", appear: 3, until: 3 }
    ],
    steps: [
      { cmd: "TASK 01 · 기준선",
        caption: "훅이 없을 때 Claude Code가 head -n 400을 그대로 실행하면, 거래 400행(약 20,000자)이 도구 결과로 컨텍스트 창에 들어갑니다. 이 대화 전체가 모델(Amazon Bedrock)에 입력으로 가서 세 줄 요약이 만들어집니다. 그림의 막대 길이는 대략적인 비교용입니다.",
        on: ["cc", "e-run", "cmd1", "wa", "fa", "ba", "e-ma", "bedrock"], flow: { edge: "e-run", token: "Bash 호출" } },
      { cmd: "TASK 02 · 훅이 명령을 바꿈",
        caption: "PreToolUse 훅이 실행 직전의 Bash 명령을 읽습니다. 거래 CSV를 그대로 여는 명령이면 머리글 1줄과 50행, 전체 행 수를 알리는 echo로 바꿉니다. 화면에는 원래 명령이 표시되지만, 실제로 실행되는 것은 바뀐 명령입니다.",
        on: ["cmd1", "e-in", "hook", "e-out", "cmd2"], flow: { edge: "e-out", token: "updatedInput" } },
      { cmd: "TASK 02 · 같은 요청, 작은 결과",
        caption: "같은 요청이지만 컨텍스트에는 머리글, 거래 50행, 요약 1줄만 들어갑니다. 약 20,000자가 약 2,600자로 줄어듭니다. 모델은 이것만 읽고 요약하므로 /context의 Messages 토큰이 TASK 01보다 줄어듭니다.",
        on: ["cc", "cmd2", "wb", "fb", "sb", "e-mb", "bedrock"], flow: { edge: "e-mb", token: "머리글 + 50행" } },
      { cmd: "왜 400행인가",
        caption: "cat으로 파일 전체를 열면 훅이 없어도 Claude Code가 약 30,000자를 넘는 Bash 출력을 파일에 저장하고 미리보기만 보여 줍니다. 그러면 훅 전후 차이가 흐려지므로, 이 랩은 한도 안에 들어오는 앞 400행(약 20,000자)으로 비교합니다.",
        on: ["wa", "ba", "marker"] },
      { cmd: "비교",
        caption: "요약 내용은 거의 같고 컨텍스트에 들어간 양은 약 20,000자와 약 2,600자로 다릅니다. 고정 부분은 두 경우 모두 그대로입니다. 훅은 앞 50행만 보여 주는 정책이므로, 합계처럼 전체가 필요한 질문은 python3 집계 스크립트로 풉니다.",
        on: ["wa", "fa", "ba", "wb", "fb", "sb"] }
    ]
  });

  /* ---- Ch5 TASK 04: /compact, SessionStart(compact) hook and the auto-compact window ---- */
  LabViz.register("compaction", {
    title: "긴 대화가 /compact로 요약 블록 하나로 접히고, SessionStart(compact) 훅이 사내 규정 한 줄을 다시 붙이며, auto-compact window가 자동 압축 시점을 정하는 과정",
    viewBox: "0 0 1000 540",
    nodes: [
      { id: "cc", shape: "note", label: "Claude Code\n(ccb-endpoint에서 실행)", x: 105, y: 55, w: 190, h: 56 },
      { id: "hook", shape: "note", tone: "info", label: "SessionStart 훅 (compact matcher)\n압축 직후 다시 실행", x: 560, y: 55, w: 300, h: 56, appear: 4 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 930, y: 60 },
      { id: "w", shape: "group", label: "컨텍스트 창 (Messages)", x: 440, y: 215, w: 880, h: 150 },
      { id: "fixed", shape: "note", label: "고정 부분\nCLAUDE.md 등", x: 100, y: 245, w: 150, h: 56 },
      { id: "old", shape: "note", tone: "err", label: "오래된 대화 · 도구 결과\n(길게 쌓인 기록)", x: 395, y: 245, w: 440, h: 56, appear: 1, until: 2 },
      { id: "sum", shape: "note", tone: "ok", label: "요약\n(/compact 지시대로 남긴 내용)", x: 290, y: 245, w: 220, h: 56, appear: 3 },
      { id: "rule", shape: "note", tone: "info", label: "[사내 규정] 고객 주민등록번호·카드번호·\n계좌번호·휴대폰 번호는 출력하거나 파일에 쓰지 않는다", x: 665, y: 245, w: 390, h: 56, appear: 4 },
      { id: "ar", shape: "group", label: "자동 압축 시점 · 1M 컨텍스트 모델", x: 440, y: 420, w: 880, h: 140, appear: 5 },
      { id: "ruler", shape: "note", label: "컨텍스트 창 1M 토큰", x: 440, y: 440, w: 800, h: 26, appear: 5 },
      { id: "t400", shape: "note", tone: "ok", label: "", x: 360, y: 440, w: 5, h: 44, appear: 5 },
      { id: "t967", shape: "note", tone: "err", label: "", x: 814, y: 440, w: 5, h: 44, appear: 5 },
      { id: "l400", shape: "note", tone: "ok", label: "400K\n/autocompact 400k", x: 360, y: 497, w: 170, h: 44, appear: 5 },
      { id: "l967", shape: "note", tone: "err", label: "약 967K (기본)\n창 1M − 버퍼 33K", x: 740, y: 497, w: 170, h: 44, appear: 5 }
    ],
    edges: [
      { id: "e-sum", from: "cc", to: "bedrock", label: "요약 요청", via: [[105, 20], [930, 20]], appear: 2, until: 2 },
      { id: "e-hook", from: "hook", to: "rule", label: "echo", appear: 4 }
    ],
    steps: [
      { cmd: "긴 대화",
        caption: "대화와 도구 결과가 길게 쌓여 컨텍스트 창이 오래된 기록으로 차 있습니다. CLAUDE.md처럼 매 요청에 실리는 고정 부분은 따로 있습니다.",
        on: ["w", "fixed", "old"] },
      { cmd: "/compact 지시",
        caption: "/compact 뒤에 \"확인한 파일 구조와 열 이름, 계산 결과, 남은 할 일만 남겨줘\"처럼 남길 것을 적습니다. 오래된 기록을 읽고 요약하는 일은 모델이 하므로 Amazon Bedrock이 켜집니다.",
        on: ["cc", "e-sum", "bedrock", "old", "w"], flow: { edge: "e-sum", token: "오래된 기록" } },
      { cmd: "압축 완료",
        caption: "오래된 기록이 요약 블록 하나로 접히고 Messages가 줄어듭니다. 루트 CLAUDE.md는 디스크에서 다시 주입됩니다. 접두부가 바뀌므로 다음 요청에서 캐시를 새로 쌓아, 캐시 적중률이 낮아집니다(실습 환경에서 88%에서 64%).",
        on: ["w", "fixed", "sum"] },
      { cmd: "SessionStart(compact) 훅",
        caption: "압축 직후 SessionStart 훅이 다시 실행되어 echo한 \"[사내 규정]\" 한 줄이 컨텍스트에 추가됩니다. 요약은 손실 압축이라 규정이 빠질 수 있으므로, 사라지면 안 되는 규칙은 이 훅으로 다시 넣습니다.",
        on: ["hook", "e-hook", "rule", "w", "fixed", "sum"], flow: { edge: "e-hook", token: "[사내 규정]" } },
      { cmd: "auto-compact window",
        caption: "자동 압축은 auto-compact window에서 버퍼를 뺀 지점에 닿을 때 일어납니다. 1M 모델은 약 967K입니다. /autocompact 400k로 창을 400K로 낮추면 더 일찍 압축되어 요청당 입력이 작아지지만, 압축 횟수가 늘 수 있어 항상 싸지지는 않습니다.",
        on: ["ar", "ruler", "t400", "t967", "l400", "l967"] }
    ]
  });

  /* ==== end Ch5 ===================================================== */

  /* ==== Ch6 ======================================================== */

  /* ---- Ch6 TASK 01: OpenTelemetry from Claude Code to the local Collector, scrub_logs, exporters ---- */
  LabViz.register("telemetry-path", {
    title: "Claude Code가 OpenTelemetry로 같은 PC의 Collector에 사용량을 보내고, scrub_logs가 프롬프트 본문을 지운 뒤 내 계정 CloudWatch와 워크샵 중앙 대시보드로 내보내는 경로",
    viewBox: "0 0 1000 440",
    nodes: [
      { id: "ec2", shape: "group", icon: "EC2-Instance", label: "ccb-endpoint (실습 PC)", x: 385, y: 225, w: 750, h: 380 },
      { id: "cc", shape: "note", label: "Claude Code\nenv의 OTEL_* 설정", x: 110, y: 150, w: 170, h: 60 },
      { id: "attr", shape: "note", tone: "ok", label: "남는 것\nuser.email · team.id\n토큰 · 비용 지표", x: 110, y: 262, w: 170, h: 74, appear: 1 },
      { id: "drop", shape: "note", tone: "err", label: "scrub_logs가 지우는 것\n프롬프트 본문", x: 110, y: 362, w: 170, h: 54, appear: 3 },
      { id: "col", shape: "group", label: "otelcol (같은 PC의 Collector)", x: 505, y: 235, w: 440, h: 330, appear: 2 },
      { id: "recv", shape: "note", label: "수신 127.0.0.1:4318", x: 505, y: 150, w: 380, h: 46, appear: 2 },
      { id: "scrub", shape: "note", tone: "info", label: "scrub_logs\n이벤트 로그에서 프롬프트 본문 삭제", x: 505, y: 230, w: 380, h: 60, appear: 3 },
      { id: "exp", shape: "note", label: "exporters\n내 계정 CloudWatch · 중앙 대시보드", x: 505, y: 320, w: 380, h: 56, appear: 4 },
      { id: "cw", shape: "icon", icon: "CloudWatch", label: "Amazon CloudWatch\n(내 계정)", x: 885, y: 110, appear: 4 },
      { id: "dash", shape: "note", label: "워크샵 중앙 대시보드\n(clickhouse로 이중 전송)", x: 885, y: 290, w: 200, h: 70, appear: 4 }
    ],
    edges: [
      { id: "e-cc", from: "cc", to: "recv", label: "OTel", appear: 2 },
      { id: "e-rs", from: "recv", to: "scrub", appear: 3 },
      { id: "e-se", from: "scrub", to: "exp", appear: 4 },
      { id: "e-cw", from: "exp", to: "cw", appear: 4 },
      { id: "e-dash", from: "exp", to: "dash", appear: 4 }
    ],
    steps: [
      { cmd: "OTel 설정",
        caption: "이 PC의 Claude Code는 ~/.claude/settings.json의 env에 있는 TELEMETRY, OTEL_ 값으로 사용량을 OpenTelemetry(OTel)로 내보냅니다. OTEL_RESOURCE_ATTRIBUTES의 user.email, team.id가 대시보드에서 사람과 팀별로 묶는 키입니다.",
        on: ["cc", "attr"] },
      { cmd: "Collector가 받음",
        caption: "사용량은 같은 PC에서 도는 Collector(otelcol, 127.0.0.1:4318)가 받습니다. systemctl is-active로 otelcol이 active인지 확인합니다.",
        on: ["cc", "e-cc", "recv", "col", "ec2"], flow: { edge: "e-cc", token: "사용량 · 이벤트" } },
      { cmd: "scrub_logs",
        caption: "scrub_logs가 이벤트 로그에서 프롬프트 본문을 삭제한 뒤 다음으로 넘깁니다. 비용은 보되 내용은 남기지 않는 DLP 설정입니다.",
        on: ["recv", "e-rs", "scrub", "drop", "col"], flow: { edge: "e-rs", token: "이벤트 로그" } },
      { cmd: "exporters",
        caption: "exporters가 내 계정의 CloudWatch와 워크샵 중앙 대시보드로 내보냅니다. exporters에 clickhouse가 보이면 중앙 대시보드로도 이중 전송 중입니다.",
        on: ["scrub", "e-se", "exp", "e-cw", "cw", "e-dash", "dash", "col"], flow: { edge: "e-cw", token: "지표 · 로그" } },
      { cmd: "대시보드에서 보기",
        caption: "대시보드는 user.email, team.id로 사람과 팀별로 묶어 claude_code.token.usage, claude_code.cost.usage 같은 지표를 보여 줍니다. 프롬프트 본문은 이미 지워진 뒤라 대시보드에 남지 않습니다.",
        on: ["attr", "cw", "dash", "drop"] }
    ]
  });

  /* ---- Ch6 TASK 02-03: login, group policy (models + spend limit), Bedrock or blocked ---- */
  LabViz.register("gateway-policy", {
    title: "alice와 bob이 Claude Apps Gateway에 로그인하면 그룹 정책이 허용 모델과 지출 한도를 확인하고, 허용된 요청만 Amazon Bedrock으로 가며, bob에게 1센트 한도를 걸면 요청이 차단되는 과정",
    viewBox: "0 0 1000 560",
    nodes: [
      { id: "alice", shape: "note", label: "alice@workshop.example\n자산분석팀 · power-users", x: 115, y: 95, w: 200, h: 56, appear: 1 },
      { id: "bob", shape: "note", label: "bob@workshop.example\n타 부서 · standard-users", x: 115, y: 205, w: 200, h: 56, appear: 3 },
      { id: "admin", shape: "note", tone: "info", label: "관리자 (Terminal 2)\nAdmin API로 한도 조작", x: 115, y: 470, w: 200, h: 62, appear: 4 },
      { id: "gw", shape: "group", label: "Claude Apps Gateway", x: 520, y: 270, w: 400, h: 440 },
      { id: "login", shape: "note", label: "로그인 · 사용자 식별\n사내 IdP (이 랩은 Cognito)", x: 520, y: 150, w: 340, h: 62 },
      { id: "policy", shape: "note", label: "그룹 정책 확인\n허용 모델 · 일일 지출 한도", x: 520, y: 265, w: 340, h: 70 },
      { id: "d-alice", shape: "note", tone: "ok", label: "power-users (alice)\n허용: Opus, Sonnet, Haiku 5.5\n일일 한도 $200", x: 520, y: 385, w: 340, h: 82, appear: 2, until: 2 },
      { id: "d-bob", shape: "note", tone: "info", label: "standard-users (bob)\n허용: Sonnet, Haiku 5.5 (Opus 없음)\n일일 한도 $50", x: 520, y: 385, w: 340, h: 82, appear: 3, until: 3 },
      { id: "d-bob1", shape: "note", tone: "info", label: "bob 사용자 한도 1센트\n(그룹 한도보다 우선)", x: 520, y: 385, w: 340, h: 82, appear: 4, until: 4 },
      { id: "d-over", shape: "note", tone: "err", label: "오늘 쓴 금액이 한도보다 큼\n예: $0.08 / $0.01", x: 520, y: 385, w: 340, h: 82, appear: 5, until: 5 },
      { id: "d-back", shape: "note", tone: "ok", label: "한도 삭제\n그룹 한도로 복귀", x: 520, y: 385, w: 340, h: 82, appear: 6 },
      { id: "bedrock", shape: "icon", icon: "Bedrock", label: "Amazon Bedrock\n(모델)", x: 880, y: 150 },
      { id: "blocked", shape: "note", tone: "err", label: "차단 (bob)\nspend limit reached (daily)\n\"You have reached your\nspend limit. Contact your\nadministrator …\"", x: 870, y: 385, w: 220, h: 112, appear: 5, until: 5 }
    ],
    edges: [
      { id: "e-alice", from: "alice", to: "login", label: "로그인", appear: 1, until: 2 },
      { id: "e-bob", from: "bob", to: "login", appear: 3 },
      { id: "e-lp", from: "login", to: "policy", appear: 1 },
      { id: "e-ok", from: "policy", to: "bedrock", label: "허용", appear: 2, until: 3 },
      { id: "e-ok2", from: "policy", to: "bedrock", label: "허용", appear: 6, until: 6 },
      { id: "e-block", from: "policy", to: "blocked", label: "차단", appear: 5, until: 5 },
      { id: "e-admin", from: "admin", to: "policy", label: "POST\nspend_limits", via: [[250, 265]], appear: 4, until: 4 },
      { id: "e-admin2", from: "admin", to: "policy", label: "DELETE", via: [[250, 265]], appear: 6, until: 6 }
    ],
    steps: [
      { cmd: "use_gateway · alice 로그인",
        caption: "use_gateway가 managed settings에 forceLoginMethod를 넣어, 이 PC의 Claude Code는 게이트웨이 로그인 없이는 쓸 수 없습니다. alice가 브라우저에서 코드를 확인하고 로그인하면 게이트웨이가 사내 IdP(이 랩은 Cognito)로 사용자를 식별합니다.",
        on: ["alice", "e-alice", "login", "gw"], flow: { edge: "e-alice", token: "로그인" } },
      { cmd: "alice의 요청",
        caption: "alice는 power-users 그룹이라 /model에 Opus, Sonnet, Haiku 5.5가 모두 보입니다. 이 목록은 내 settings.json이 아니라 게이트웨이가 그룹 정책으로 내려준 것입니다. 한도($200) 안의 요청은 게이트웨이가 Bedrock을 대신 호출합니다.",
        on: ["alice", "e-alice", "login", "e-lp", "policy", "d-alice", "e-ok", "bedrock", "gw"], flow: { edge: "e-ok", token: "질문" } },
      { cmd: "bob 로그인과 요청",
        caption: "bob은 standard-users 그룹이라 Opus가 없고 Sonnet과 Haiku 5.5만 쓸 수 있으며 일일 한도는 $50입니다. 질문 하나를 보내 지출 기록을 만듭니다. 이 요청은 정책을 통과해 Bedrock까지 갑니다.",
        on: ["bob", "e-bob", "login", "e-lp", "policy", "d-bob", "e-ok", "bedrock", "gw"], flow: { edge: "e-ok", token: "질문" } },
      { cmd: "관리자가 1센트 한도를 걺",
        caption: "두 번째 터미널의 관리자가 Admin API로 bob에게만 하루 1센트(amount \"1\") 사용자 한도를 만듭니다. 사용자 한도는 그룹 한도보다 우선합니다. 이 단계에서는 모델 호출이 없습니다.",
        on: ["admin", "e-admin", "policy", "d-bob1", "gw"], flow: { edge: "e-admin", token: "한도 1센트" } },
      { cmd: "bob의 요청이 차단됨",
        caption: "bob이 질문을 보내면 정책 확인에서 오늘 쓴 금액이 새 한도보다 커서 거절됩니다. 요청은 Bedrock에 닿지 않고 \"You have reached your spend limit\" 메시지가 돌아옵니다.",
        on: ["bob", "e-bob", "login", "e-lp", "policy", "d-over", "e-block", "blocked", "gw"], flow: { edge: "e-block", token: "거절" } },
      { cmd: "한도 삭제 · 원복",
        caption: "관리자가 DELETE로 한도를 지우면 bob은 원래 그룹 한도로 돌아가고 질문이 다시 통과해 Bedrock이 응답합니다. 마지막으로 use_bedrock_direct로 기본 모드에 돌아옵니다.",
        on: ["admin", "e-admin2", "policy", "d-back", "bob", "e-ok2", "bedrock", "gw"], flow: { edge: "e-admin2", token: "DELETE" } }
    ]
  });

  /* ==== end Ch6 ===================================================== */

  /* ---- end of diagram definitions ---- */

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
