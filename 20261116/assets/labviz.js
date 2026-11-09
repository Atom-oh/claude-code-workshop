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
 * Edge: { id, from, to, label, via: [[x, y], ...] }
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
      self.edgeEls[e.id] = { g: g, pts: pts };
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
      var g = self.edgeEls[id].g;
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
    document.querySelectorAll("details.cmd-explain").forEach(setupExplainer);
    document.querySelectorAll(".code").forEach(setupBadge);
    document.querySelectorAll("figure.viz[data-viz]").forEach(function (fig) {
      var def = LabViz.defs[fig.getAttribute("data-viz")];
      if (def && !fig.classList.contains("lv-ready")) new Player(fig, def);
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
      { id: "claude", shape: "icon", icon: "EC2", label: "Claude Code", x: 360, y: 125 },
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
        on: ["claude", "tools", "pycalc", "e-exec"], flow: { edge: "e-exec", token: "python3" } },
      { cmd: "검증",
        caption: "프롬프트가 요청한 대로 다른 방법으로 다시 계산해 합계와 중복 고객을 확인합니다. 숫자가 어긋나면 수행 단계로 돌아가 고칩니다.",
        on: ["claude", "tools", "pycalc", "e-result"], flow: { edge: "e-result", token: "검산 결과" } },
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
      { id: "claude", shape: "icon", icon: "EC2", label: "Claude Code", x: 105, y: 190 },
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

  /* ---- end of diagram definitions ---- */

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
