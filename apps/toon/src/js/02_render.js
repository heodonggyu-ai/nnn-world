/* ================= RENDER ================= */
const VIEW = { c: null, x: null, cw: 0, ch: 0, dpr: 1 };
const SCR = {};
function ensureScratch() {
  const W = ST.doc.w, H = ST.doc.h;
  ['grp', 'clp', 'live', 'pat', 'mask', 'comp'].forEach(k => { if (!SCR[k] || SCR[k].width !== W || SCR[k].height !== H) { SCR[k] = mkCanvas(W, H); } });
}
function resizeView() {
  const st = $('#stage'), r = st.getBoundingClientRect(); VIEW.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  VIEW.cw = r.width; VIEW.ch = r.height; VIEW.c.width = Math.round(r.width * VIEW.dpr); VIEW.c.height = Math.round(r.height * VIEW.dpr); ST.dirty = true;
}
function fitView() { const W = ST.doc.w, H = ST.doc.h, pad = 24; const s = Math.min((VIEW.cw - pad * 2 - 40) / W, (VIEW.ch - pad * 2) / H); Object.assign(ST.view, { x: 18, y: 0, s, r: 0 }); ST.dirty = true; }
function applyView(x) { const v = ST.view; x.translate(VIEW.cw / 2 + v.x, VIEW.ch / 2 + v.y); x.rotate(v.r); x.scale(v.s * v.flip, v.s); x.translate(-ST.doc.w / 2, -ST.doc.h / 2); }
function s2d(sx, sy) { const v = ST.view; let dx = sx - VIEW.cw / 2 - v.x, dy = sy - VIEW.ch / 2 - v.y; const c = Math.cos(-v.r), s = Math.sin(-v.r); let rx = dx * c - dy * s, ry = dx * s + dy * c; rx /= v.s * v.flip; ry /= v.s; return { x: rx + ST.doc.w / 2, y: ry + ST.doc.h / 2 }; }
function d2s(x, y) { const v = ST.view; let dx = (x - ST.doc.w / 2) * v.s * v.flip, dy = (y - ST.doc.h / 2) * v.s; const c = Math.cos(v.r), s = Math.sin(v.r); return { x: dx * c - dy * s + VIEW.cw / 2 + v.x, y: dx * s + dy * c + VIEW.ch / 2 + v.y }; }

function layerSource(l) { if (FLOAT && FLOAT.layer === l && SCR.flt) return SCR.flt; if (typeof STROKE !== 'undefined' && STROKE && STROKE.layer === l && STROKE.liveReady) return SCR.live; return l.canvas; }
function buildLive() {
  const S = STROKE; if (!S || S.direct) { if (S) S.liveReady = false; return; }
  const lx = SCR.live.getContext('2d'); lx.globalCompositeOperation = 'copy'; lx.globalAlpha = 1; lx.drawImage(S.layer.canvas, 0, 0); lx.globalCompositeOperation = 'source-over';
  applyStrokeTo(lx, S); S.liveReady = true;
}
function applyStrokeTo(x, S) {
  let src = S.canvas;
  if (S.brush.pattern) { const px = SCR.pat.getContext('2d'); px.globalCompositeOperation = 'copy'; px.drawImage(S.canvas, 0, 0); px.globalCompositeOperation = 'source-in'; px.fillStyle = tonePattern(S.color, px); px.fillRect(0, 0, SCR.pat.width, SCR.pat.height); px.globalCompositeOperation = 'source-over'; src = SCR.pat; }
  x.save();
  if (S.clipPoly) { polyPath(x, S.clipPoly); x.clip(); }
  if (S.layer.kind === 'part') { const m = layerMatrix(S.layer, ST.frame).inverse(); x.setTransform(m.a, m.b, m.c, m.d, m.e, m.f); }
  x.globalAlpha = S.alpha;
  x.globalCompositeOperation = S.brush.eraser ? 'destination-out' : (S.layer.lock ? 'source-atop' : (S.brush.blend || 'source-over'));
  x.drawImage(src, 0, 0); x.restore();
}
function polyPath(x, pts) { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); }

// draw page composite into ctx (doc coords). opts: {live, panels, objects, bg, frame}
function drawL(x, layer, src, fr) {
  if (layer.kind === 'part') { const m = layerMatrix(layer, fr); const P = layer._pose; x.save(); x.globalAlpha *= P.a; x.transform(m.a, m.b, m.c, m.d, m.e, m.f); x.drawImage(src, 0, 0); x.restore(); }
  else x.drawImage(src, 0, 0);
}
function compositePage(page, x, opts = {}) {
  const W = ST.doc.w, H = ST.doc.h, fr = opts.frame != null ? opts.frame : ST.frame;
  if (opts.bg !== false) { x.fillStyle = ST.doc.bg || '#fff'; x.fillRect(0, 0, W, H); }
  const L = page.layers; let i = 0;
  while (i < L.length) {
    const base = L[i]; let j = i + 1; while (j < L.length && L[j].clip) j++;
    if (!base.visible || (base.guide && !opts.live)) { i = j; continue; }
    const bsrc = opts.live ? layerSource(base) : base.canvas;
    if (j === i + 1) { x.save(); x.globalAlpha = base.opacity; x.globalCompositeOperation = base.blend; drawL(x, base, bsrc, fr); x.restore(); }
    else {
      const g = SCR.grp.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H); drawL(g, base, bsrc, fr);
      for (let k = i + 1; k < j; k++) {
        const cl = L[k]; if (!cl.visible || (cl.guide && !opts.live)) continue;
        const c = SCR.clp.getContext('2d'); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, W, H); drawL(c, cl, opts.live ? layerSource(cl) : cl.canvas, fr);
        c.globalCompositeOperation = 'destination-in'; drawL(c, base, bsrc, fr); c.globalCompositeOperation = 'source-over';
        g.globalAlpha = cl.opacity; g.globalCompositeOperation = cl.blend === 'source-over' ? 'source-atop' : cl.blend; g.drawImage(SCR.clp, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      }
      x.save(); x.globalAlpha = base.opacity; x.globalCompositeOperation = base.blend; x.drawImage(SCR.grp, 0, 0); x.restore();
    }
    i = j;
  }
  if (opts.panels !== false) drawPanels(x, page);
  if (opts.objects !== false) page.objects.forEach(o => drawObject(x, o));
}
function drawPanels(x, page) {
  if (!page.panels.length) return; const ps = page.pstyle, W = ST.doc.w, H = ST.doc.h;
  if (ps.mask) {
    const m = SCR.mask.getContext('2d'); m.globalCompositeOperation = 'copy'; m.fillStyle = ps.gutter || '#fff'; m.fillRect(0, 0, W, H);
    m.globalCompositeOperation = 'destination-out'; m.fillStyle = '#000'; page.panels.forEach(p => { polyPath(m, p.pts); m.fill(); }); m.globalCompositeOperation = 'source-over';
    x.drawImage(SCR.mask, 0, 0);
  }
  x.save(); x.lineJoin = 'miter'; x.strokeStyle = ps.color; x.lineWidth = ps.width;
  page.panels.forEach(p => { if (p.border === 'none') return; x.setLineDash(p.border === 'dashed' ? [ps.width * 3, ps.width * 2.2] : []); x.lineWidth = p.border === 'thick' ? ps.width * 2 : ps.width; polyPath(x, p.pts); x.stroke(); });
  x.restore();
}

function render() {
  if (!ST.doc) return; const x = VIEW.x, d = VIEW.dpr;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, VIEW.c.width, VIEW.c.height);
  x.setTransform(d, 0, 0, d, 0, 0);
  if (typeof STROKE !== 'undefined' && STROKE) buildLive();
  buildFloatLive();
  x.save(); applyView(x);
  x.shadowColor = '#0006'; x.shadowBlur = 18; x.fillStyle = '#fff'; x.fillRect(0, 0, ST.doc.w, ST.doc.h); x.shadowBlur = 0; x.shadowColor = 'transparent';
  x.imageSmoothingEnabled = ST.view.s < 1.5;
  compositePage(ST.page, x, { live: true });
  x.imageSmoothingEnabled = true;
  if (ST.doc.type === 'anim') drawAnimGuides(x);
  drawGuides(x);
  x.restore();
  drawOverlays(x);
}
function loop() { if (ST.dirty && $('#editor').classList.contains('active')) { ST.dirty = false; render(); } requestAnimationFrame(loop); }

function drawGuides(x) {
  const W = ST.doc.w, H = ST.doc.h, lw = 1 / ST.view.s;
  x.save(); x.lineWidth = lw;
  if (ST.grid === 'thirds' || ST.grid === 'grid') {
    x.strokeStyle = '#6cb8ffaa'; const n = ST.grid === 'thirds' ? 3 : 8; x.beginPath();
    for (let i = 1; i < n; i++) { x.moveTo(W * i / n, 0); x.lineTo(W * i / n, H); }
    const m = ST.grid === 'thirds' ? 3 : Math.round(8 * H / W); for (let i = 1; i < m; i++) { x.moveTo(0, H * i / m); x.lineTo(W, H * i / m); } x.stroke();
  }
  if (ST.persp) {
    const vp = ST.vp || (ST.vp = { x: W / 2, y: H * .4 }); x.strokeStyle = '#ff7aa888'; x.beginPath();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.moveTo(vp.x, vp.y); x.lineTo(vp.x + Math.cos(a) * 4000, vp.y + Math.sin(a) * 4000); }
    x.stroke(); x.strokeStyle = '#ff3d7f'; x.lineWidth = lw * 2; x.beginPath(); x.moveTo(0, vp.y); x.lineTo(W, vp.y); x.stroke();
    x.fillStyle = '#ff3d7f'; x.beginPath(); x.arc(vp.x, vp.y, 9 * lw, 0, 7); x.fill();
  }
  if (ST.sym !== 'none') {
    x.strokeStyle = '#a78bfacc'; x.lineWidth = lw * 2; x.setLineDash([8 * lw, 6 * lw]); x.beginPath();
    if (ST.sym === 'v' || ST.sym === 'quad') { x.moveTo(W / 2, 0); x.lineTo(W / 2, H); }
    if (ST.sym === 'h' || ST.sym === 'quad') { x.moveTo(0, H / 2); x.lineTo(W, H / 2); }
    if (ST.sym === 'k6') { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; x.moveTo(W / 2 - Math.cos(a) * 3000, H / 2 - Math.sin(a) * 3000); x.lineTo(W / 2 + Math.cos(a) * 3000, H / 2 + Math.sin(a) * 3000); } }
    x.stroke(); x.setLineDash([]);
  }
  // panel edit
  if (ST.tool === 'panel') {
    ST.page.panels.forEach((p, i) => {
      x.strokeStyle = i === ST.selPanel ? '#ff3d7f' : '#a78bfa'; x.lineWidth = lw * (i === ST.selPanel ? 3 : 1.5); x.setLineDash(i === ST.selPanel ? [] : [6 * lw, 4 * lw]); polyPath(x, p.pts); x.stroke(); x.setLineDash([]);
      const c = polyCenter(p.pts); x.fillStyle = '#a78bfa'; x.font = `${18 * lw}px Jua`; x.textAlign = 'center'; x.fillText(String(i + 1), c[0], c[1]);
    });
  }
  x.restore();
}
function drawOverlays(x) {
  // selected object handles (screen space)
  const o = selObj(); if (o) {
    const hs = objHandles(o); x.save(); x.strokeStyle = '#ff7aa8'; x.lineWidth = 1.5; x.setLineDash([5, 4]);
    x.beginPath(); hs.box.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.closePath(); x.stroke(); x.setLineDash([]);
    const dot = (p, col, ic) => { x.fillStyle = col; x.beginPath(); x.arc(p.x, p.y, 13, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.stroke(); if (ic) { x.fillStyle = '#fff'; x.font = '14px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ic, p.x, p.y + 1); } };
    dot(hs.scale, '#ff7aa8', '⤡'); dot(hs.rot, '#a78bfa', '↻'); if (hs.tail) dot(hs.tail, '#ffb020', '◆');
    x.restore();
  }
  if (ST.tool === 'panel' && ST.selPanel >= 0) {
    const p = ST.page.panels[ST.selPanel]; if (p) {
      x.save(); const hs = panelHandles(p);
      hs.forEach(h => { x.fillStyle = h.kind === 'v' ? '#fff' : '#ff7aa8'; x.strokeStyle = '#ff3d7f'; x.lineWidth = 2.5; x.beginPath(); x.arc(h.x, h.y, h.kind === 'v' ? 10 : 13, 0, 7); x.fill(); x.stroke(); if (h.kind === 's') { x.fillStyle = '#fff'; x.font = '14px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⤡', h.x, h.y + 1); } });
      x.restore();
    }
  }
  if (ST.doc.type === 'anim') drawAnimOverlays(x);
  drawSelOverlays(x);
}
function polyCenter(pts) { let x = 0, y = 0; pts.forEach(p => { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
function polyBBox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; pts.forEach(p => { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); }); return { x: a, y: b, w: c - a, h: d - b }; }
function ptInPoly(x, y, pts) { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins; } return ins; }
function panelAt(x, y) { const P = ST.page.panels; for (let i = P.length - 1; i >= 0; i--) if (ptInPoly(x, y, P[i].pts)) return i; return -1; }

/* ================= OBJECTS (bubbles / text) ================= */
const BUBBLES = [
  { id: 'oval', name: '기본 대사', desc: '평범한 대화' },
  { id: 'round', name: '둥근 네모', desc: '차분한 대화' },
  { id: 'shout', name: '외침', desc: '소리 지를 때!' },
  { id: 'flash', name: '번쩍', desc: '깜짝 놀람, 충격' },
  { id: 'cloud', name: '생각', desc: '마음속 생각' },
  { id: 'whisper', name: '속삭임', desc: '작은 목소리 (점선)' },
  { id: 'wobble', name: '덜덜', desc: '무섭거나 떨릴 때' },
  { id: 'heart', name: '하트', desc: '사랑, 설렘' },
  { id: 'electric', name: '전화·기계', desc: '전화, TV, 로봇 목소리' },
  { id: 'narration', name: '해설 상자', desc: '시간·장소 설명' },
  { id: 'dark', name: '검은 말풍선', desc: '무서운 목소리, 비밀' },
  { id: 'soft', name: '몽글', desc: '귀엽고 부드럽게' },
];
const FONTS = [
  { f: 'Jua', n: '주아 (기본 대사)' }, { f: 'Do Hyeon', n: '도현 (또렷)' }, { f: 'Gowun Dodum', n: '고운돋움 (차분)' }, { f: 'Gaegu', n: '개구 (손글씨)' },
  { f: 'Nanum Pen Script', n: '나눔펜 (일기)' }, { f: 'Gamja Flower', n: '감자꽃 (귀염)' }, { f: 'Hi Melody', n: '하이멜로디' }, { f: 'Yeon Sung', n: '연성 (옛날)' }, { f: 'Black Han Sans', n: '검은고딕 (효과음)' },
];
function selObj() { if (!ST.sel || !ST.page) return null; return ST.page.objects.find(o => o.id === ST.sel) || null; }
function fontStr(o) { return `${o.bold ? '700 ' : ''}${o.size}px "${o.font}", "Jua", sans-serif`; }
function measureText(o) {
  const x = VIEW.mx || (VIEW.mx = mkCanvas(4, 4).getContext('2d')); x.font = fontStr(o);
  const lines = String(o.text || ' ').split('\n'); let w = 0; lines.forEach(l => w = Math.max(w, x.measureText(l || ' ').width));
  return { w, h: lines.length * o.size * 1.22, lines };
}
function bubbleFitSize(o) { const m = measureText(o); const k = { oval: [1.5, 1.7], cloud: [1.6, 1.9], shout: [1.75, 2.1], flash: [1.8, 2.1], wobble: [1.55, 1.75], heart: [1.9, 2.3], whisper: [1.5, 1.7], soft: [1.5, 1.7] }[o.shape] || [1.25, 1.45]; o.w = Math.max(60, m.w * k[0] + 24); o.h = Math.max(50, m.h * k[1] + 16); }
function shapePath(x, o) {
  const w = o.w / 2, h = o.h / 2, sh = o.shape; x.beginPath();
  if (sh === 'oval' || sh === 'whisper') x.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  else if (sh === 'round' || sh === 'dark') { const r = Math.min(w, h) * .55; roundRectPath(x, -w, -h, w * 2, h * 2, r); }
  else if (sh === 'narration' || sh === 'electric0') x.rect(-w, -h, w * 2, h * 2);
  else if (sh === 'shout' || sh === 'flash') {
    const rnd = seeded(hashStr(o.id)); const n = sh === 'flash' ? 44 : 20; const inr = sh === 'flash' ? .84 : .72;
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2; const r = i % 2 ? inr + rnd() * .05 : 1.08 + rnd() * (sh === 'flash' ? .12 : .18); x.lineTo(Math.cos(a) * w * r, Math.sin(a) * h * r); } x.closePath();
  }
  else if (sh === 'cloud' || sh === 'soft') {
    const n = sh === 'soft' ? 9 : Math.max(9, Math.round((w + h) / 22)); const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([Math.cos(a) * w * .9, Math.sin(a) * h * .9]); }
    x.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const a = (i + .5) / n * Math.PI * 2, k = sh === 'soft' ? 1.16 : 1.25; x.quadraticCurveTo(Math.cos(a) * w * k, Math.sin(a) * h * k, q[0], q[1]); } x.closePath();
  }
  else if (sh === 'wobble') { const n = 120; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = 1 + .045 * Math.sin(a * 22); x.lineTo(Math.cos(a) * w * r, Math.sin(a) * h * r); } x.closePath(); }
  else if (sh === 'heart') { x.save(); x.scale(w / 1.0, h / .9); heartPathRaw(x); x.restore(); }
  else if (sh === 'electric') { const zz = 12, stp = Math.max(6, Math.round(w / 14)); x.moveTo(-w, -h); for (let i = 1; i <= stp; i++) x.lineTo(-w + w * 2 * i / stp - (i < stp ? w / stp : 0), -h + (i % 2 ? -zz / 2 : 0)); x.lineTo(w, -h); x.lineTo(w, h); for (let i = 1; i <= stp; i++) x.lineTo(w - w * 2 * i / stp + (i < stp ? w / stp : 0), h + (i % 2 ? zz / 2 : 0)); x.lineTo(-w, h); x.closePath(); }
  else x.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
}
function heartPathRaw(x) { // unit heart roughly in [-1,1]x[-.9,.9]
  x.moveTo(0, .9); x.bezierCurveTo(-1.25, .05, -.75, -1.15, 0, -.45); x.bezierCurveTo(.75, -1.15, 1.25, .05, 0, .9); x.closePath();
}
function roundRectPath(x, a, b, w, h, r) { r = Math.min(r, w / 2, h / 2); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function tailPath(x, o) {
  if (!o.tail || o.shape === 'narration') return false; const tx = o.tail.x, ty = o.tail.y; const w = o.w / 2, h = o.h / 2;
  const a = Math.atan2(ty / h, tx / w); const d = o.shape === 'shout' || o.shape === 'flash' ? .16 : .22;
  const k = .82; const p1 = [Math.cos(a - d) * w * k, Math.sin(a - d) * h * k], p2 = [Math.cos(a + d) * w * k, Math.sin(a + d) * h * k];
  x.beginPath(); x.moveTo(p1[0], p1[1]);
  if (o.shape === 'heart' || o.shape === 'soft' || o.shape === 'oval' || o.shape === 'round' || o.shape === 'dark' || o.shape === 'whisper') { x.quadraticCurveTo((p1[0] + tx) / 2 + (p2[0] - p1[0]) * .15, (p1[1] + ty) / 2 + (p2[1] - p1[1]) * .15, tx, ty); x.quadraticCurveTo((p2[0] + tx) / 2, (p2[1] + ty) / 2, p2[0], p2[1]); }
  else if (o.shape === 'electric') { const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2; const ux = tx - mx, uy = ty - my; x.lineTo(mx + ux * .45 + uy * .12, my + uy * .45 - ux * .12); x.lineTo(mx + ux * .4 - uy * .05, my + uy * .4 + ux * .05); x.lineTo(tx, ty); x.lineTo(mx + ux * .55 + uy * .02, my + uy * .55 - ux * .02); x.lineTo(mx + ux * .5 - uy * .14, my + uy * .5 + ux * .14); x.lineTo(p2[0], p2[1]); }
  else { x.lineTo(tx, ty); x.lineTo(p2[0], p2[1]); }
  x.closePath(); return true;
}
function drawObject(x, o) {
  x.save(); x.translate(o.x, o.y); x.rotate(o.rot || 0);
  if (o.kind === 'bubble') {
    const sw = o.strokeW != null ? o.strokeW : 3; const fill = o.fill || (o.shape === 'dark' ? '#111' : '#fff'), stroke = o.stroke || '#111';
    x.lineJoin = 'round'; x.strokeStyle = stroke; x.lineWidth = sw * 2;
    if (o.shape === 'whisper') x.setLineDash([sw * 3, sw * 2.5]);
    if (sw > 0) { shapePath(x, o); x.stroke(); if (o.shape === 'cloud') cloudTail(x, o, 'stroke'); else if (tailPath(x, o)) x.stroke(); }
    x.setLineDash([]); x.fillStyle = fill;
    shapePath(x, o); x.fill(); if (o.shape === 'cloud') cloudTail(x, o, 'fill'); else if (tailPath(x, o)) x.fill();
    if (o.shape === 'cloud') { /* bubbles */ }
    drawTextLines(x, o, o.color || (o.shape === 'dark' ? '#fff' : '#111'));
  } else {
    const m = measureText(o); o.w = m.w + 10; o.h = m.h + 6;
    if (o.outlineW > 0) { x.lineJoin = 'round'; x.strokeStyle = o.outline || '#fff'; x.lineWidth = o.outlineW * 2; drawTextLines(x, o, null, true); }
    if (o.shadow) { x.save(); x.translate(o.size * .06, o.size * .07); drawTextLines(x, o, '#00000055'); x.restore(); }
    drawTextLines(x, o, o.color || '#111');
  }
  x.restore();
}
function cloudTail(x, o, mode) {
  if (!o.tail) return; const tx = o.tail.x, ty = o.tail.y, a = Math.atan2(ty / (o.h / 2), tx / (o.w / 2)); const bx = Math.cos(a) * o.w / 2 * 1.02, by = Math.sin(a) * o.h / 2 * 1.02;
  const r0 = Math.min(o.w, o.h) * .1; for (let i = 0; i < 3; i++) { const t = (i + 1) / 3.2; const r = r0 * (1 - i * .28); x.beginPath(); x.ellipse(lerp(bx, tx, t), lerp(by, ty, t), r, r * .85, 0, 0, 7); mode === 'fill' ? x.fill() : x.stroke(); }
}
function drawTextLines(x, o, color, strokeOnly) {
  const m = measureText(o); x.font = fontStr(o); x.textAlign = 'center'; x.textBaseline = 'middle';
  const lh = o.size * 1.22, y0 = -m.h / 2 + lh / 2 + (o.kind === 'bubble' ? o.size * .04 : 0);
  if (color) x.fillStyle = color;
  m.lines.forEach((l, i) => { if (strokeOnly) x.strokeText(l, 0, y0 + i * lh); else x.fillText(l, 0, y0 + i * lh); });
}
function objLocal(o, px, py) { const dx = px - o.x, dy = py - o.y, c = Math.cos(-(o.rot || 0)), s = Math.sin(-(o.rot || 0)); return { x: dx * c - dy * s, y: dx * s + dy * c }; }
function objWorld(o, lx, ly) { const c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0); return { x: o.x + lx * c - ly * s, y: o.y + lx * s + ly * c }; }
function objAt(px, py) { const O = ST.page.objects; for (let i = O.length - 1; i >= 0; i--) { const o = O[i], l = objLocal(o, px, py); if (Math.abs(l.x) <= o.w / 2 + 6 && Math.abs(l.y) <= o.h / 2 + 6) return o; } return null; }
function objHandles(o) {
  const w = o.w / 2, h = o.h / 2; const cs = [[-w, -h], [w, -h], [w, h], [-w, h]].map(p => { const q = objWorld(o, p[0], p[1]); return d2s(q.x, q.y); });
  const sc = cs[2]; const tq = objWorld(o, 0, -h - 34 / ST.view.s); const rot = d2s(tq.x, tq.y);
  let tail = null; if (o.kind === 'bubble' && o.tail && o.shape !== 'narration') { const q = objWorld(o, o.tail.x, o.tail.y); tail = d2s(q.x, q.y); }
  return { box: cs, scale: sc, rot, tail };
}
function panelHandles(p) {
  const hs = []; if (p.pts.length <= 8 && !p.curve) p.pts.forEach((q, i) => { const s = d2s(q[0], q[1]); hs.push({ kind: 'v', i, x: s.x, y: s.y }); });
  const b = polyBBox(p.pts); const s = d2s(b.x + b.w, b.y + b.h); if (p.curve || p.pts.length > 8) hs.push({ kind: 's', x: s.x + 18, y: s.y + 18 }); else hs.push({ kind: 's', x: s.x + 26, y: s.y + 26 });
  return hs;
}
