/* ================= SELECTION & TRANSFORM ================= */
let FLOAT = null, SEL = null; // SEL = in-progress selection path
ST.selShape = 'free';
function flSize() { return { w: FLOAT.src.width, h: FLOAT.src.height }; }
ST.selAllFrames = false;
function selCel(L, f) { if (L.kind === 'frames') { if (!L.cels[f]) L.cels[f] = mkCanvas(ST.doc.w, ST.doc.h); return L.cels[f]; } return L.canvas; }
function makeFloat(pts, quiet) {
  const L = curLayer(), W = ST.doc.w, H = ST.doc.h;
  if (L.kind === 'part') { toast('🔑 파트 레이어는 ✥ 파트 움직이기로 움직여요'); return; }
  if (!L.visible) { toast('숨긴 레이어예요 👁'); return; }
  const multi = ST.doc.type === 'anim' && L.kind === 'frames' && ST.selAllFrames;
  const frames = multi ? [...new Set([ST.frame, ...Object.keys(L.used).map(Number).filter(f => f < ST.doc.anim.frames)])] : [ST.doc.type === 'anim' ? ST.frame : 0];
  const bb = polyBBox(pts); const r = intRect({ x: bb.x - 1, y: bb.y - 1, w: bb.w + 2, h: bb.h + 2 }, W, H); if (!r || r.w < 3 || r.h < 3) return;
  const raw = {}; let a = r.w, b = r.h, c = -1, e = -1;
  frames.forEach(f => {
    const src = mkCanvas(r.w, r.h), sx = src.getContext('2d'); sx.drawImage(selCel(L, f), -r.x, -r.y);
    sx.globalCompositeOperation = 'destination-in'; sx.fillStyle = '#000'; sx.beginPath(); pts.forEach((p, i) => i ? sx.lineTo(p[0] - r.x, p[1] - r.y) : sx.moveTo(p[0] - r.x, p[1] - r.y)); sx.closePath(); sx.fill(); sx.globalCompositeOperation = 'source-over';
    const d = sx.getImageData(0, 0, r.w, r.h).data; for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (d[(y * r.w + x) * 4 + 3] > 0) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > e) e = y; }
    raw[f] = src;
  });
  if (c < 0) { if (!quiet) toast('여기엔 그림이 없어요. 📚 레이어를 확인해 보세요'); return; }
  const tw = c - a + 1, th = e - b + 1; const srcs = {}, befores = {};
  frames.forEach(f => {
    const t = mkCanvas(tw, th); t.getContext('2d').drawImage(raw[f], -a, -b); srcs[f] = t;
    const cel = selCel(L, f); const bf = mkCanvas(W, H); bf.getContext('2d').drawImage(cel, 0, 0); befores[f] = bf;
    const lx = cel.getContext('2d'); lx.save(); lx.globalCompositeOperation = 'destination-out'; lx.fillStyle = '#000'; lx.beginPath(); pts.forEach((p, i) => i ? lx.lineTo(p[0], p[1]) : lx.moveTo(p[0], p[1])); lx.closePath(); lx.fill(); lx.restore();
  });
  const cur = frames[0];
  FLOAT = { layer: L, page: ST.page, frame: ST.frame, frames, srcs, befores, src: srcs[cur], before: befores[cur], M: new DOMMatrix().translate(r.x + a, r.y + b), mode: 'basic', grid: null, G: 1, poly: pts, multi };
  showSelBar(); ST.dirty = true;
  if (multi) toast(`🎞 ${frames.length}장을 한꺼번에 골랐어요. 옮기면 모두 같이 움직여요!`, 2400);
}
function fullPoly() { const W = ST.doc.w, H = ST.doc.h; return [[0, 0], [W, 0], [W, H], [0, H]]; }
function selectAll() {
  const L = curLayer(); if (L.kind === 'part') { toast('🔑 파트 레이어는 ✥ 파트 움직이기로 움직여요'); return; }
  if (FLOAT) commitFloat(); if (ST.tool !== 'lasso') setTool('lasso'); makeFloat(fullPoly());
}
function toggleAllFrames() {
  ST.selAllFrames = !ST.selAllFrames;
  if (FLOAT) { const poly = FLOAT.poly; cancelFloat(); makeFloat(poly); }
  else { showSelBar(); toast(ST.selAllFrames ? '🎞 이제 모든 장을 한꺼번에 골라요' : '지금 장만 골라요'); }
}
/* ----- geometry ----- */
function flLocalPts() { const { w, h } = flSize(); return { c: [[0, 0], [w, 0], [w, h], [0, h]], m: [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]], ctr: [w / 2, h / 2] }; }
function flTP(x, y) { const p = FLOAT.M.transformPoint(new DOMPoint(x, y)); return { x: p.x, y: p.y }; }
function flToGrid(G) { const { w, h } = flSize(); const g = []; for (let i = 0; i <= G; i++) { const row = []; for (let j = 0; j <= G; j++) { const p = flTP(w * j / G, h * i / G); row.push([p.x, p.y]); } g.push(row); } return g; }
function flOutline() { // doc-space outline polygon
  if (FLOAT.mode === 'basic') return flLocalPts().c.map(p => { const q = flTP(p[0], p[1]); return [q.x, q.y]; });
  const g = FLOAT.grid, G = FLOAT.G, o = []; for (let j = 0; j <= G; j++) o.push(g[0][j]); for (let i = 1; i <= G; i++) o.push(g[i][G]); for (let j = G - 1; j >= 0; j--) o.push(g[G][j]); for (let i = G - 1; i > 0; i--) o.push(g[i][0]); return o;
}
function setFloatMode(m) {
  if (!FLOAT) return; if (m === FLOAT.mode) return;
  if (m === 'basic') { if (FLOAT.mode !== 'basic') { // keep: approximate by corners -> fit affine with 3 corners
      const g = FLOAT.grid, G = FLOAT.G, { w, h } = flSize(); const p0 = g[0][0], p1 = g[0][G], p3 = g[G][0];
      FLOAT.M = new DOMMatrix([(p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]]); FLOAT.grid = null; FLOAT.G = 1; } }
  else { const G = m === 'warp' ? 3 : 1; if (FLOAT.mode === 'basic') FLOAT.grid = flToGrid(G); else if (FLOAT.G !== G) { // resample grid
      const old = FLOAT.grid, OG = FLOAT.G; const ng = []; for (let i = 0; i <= G; i++) { const row = []; for (let j = 0; j <= G; j++) row.push(gridAt(old, OG, j / G, i / G)); ng.push(row); } FLOAT.grid = ng; }
    FLOAT.G = G; }
  FLOAT.mode = m; ST.dirty = true; showSelBar();
}
function gridAt(g, G, u, v) { // bilinear over grid; u,v in 0..1
  const fx = Math.min(G - 1e-9, u * G), fy = Math.min(G - 1e-9, v * G); const j = Math.floor(fx), i = Math.floor(fy), s = fx - j, t = fy - i;
  const A = g[i][j], B = g[i][j + 1], C = g[i + 1][j + 1], D = g[i + 1][j];
  return [(A[0] * (1 - s) + B[0] * s) * (1 - t) + (D[0] * (1 - s) + C[0] * s) * t, (A[1] * (1 - s) + B[1] * s) * (1 - t) + (D[1] * (1 - s) + C[1] * s) * t];
}
/* ----- rendering ----- */
function drawTri(x, img, s0, s1, s2, d0, d1, d2) {
  const s11 = s1[0] - s0[0], s12 = s2[0] - s0[0], s21 = s1[1] - s0[1], s22 = s2[1] - s0[1]; const det = s11 * s22 - s12 * s21; if (Math.abs(det) < 1e-9) return;
  const d11 = d1[0] - d0[0], d12 = d2[0] - d0[0], d21 = d1[1] - d0[1], d22 = d2[1] - d0[1];
  const a = (d11 * s22 - d12 * s21) / det, c = (-d11 * s12 + d12 * s11) / det, b = (d21 * s22 - d22 * s21) / det, d = (-d21 * s12 + d22 * s11) / det;
  const e = d0[0] - (a * s0[0] + c * s0[1]), f = d0[1] - (b * s0[0] + d * s0[1]);
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3; const ex = p => { const vx = p[0] - cx, vy = p[1] - cy, l = Math.hypot(vx, vy) || 1; return [p[0] + vx / l * 1.1, p[1] + vy / l * 1.1]; };
  const q0 = ex(d0), q1 = ex(d1), q2 = ex(d2);
  x.save(); x.beginPath(); x.moveTo(q0[0], q0[1]); x.lineTo(q1[0], q1[1]); x.lineTo(q2[0], q2[1]); x.closePath(); x.clip(); x.transform(a, b, c, d, e, f); x.drawImage(img, 0, 0); x.restore();
}
function drawFloat(x, F = FLOAT) {
  const img = F.src, w = img.width, h = img.height;
  if (F.mode === 'basic') { x.save(); const m = F.M; x.transform(m.a, m.b, m.c, m.d, m.e, m.f); x.drawImage(img, 0, 0); x.restore(); return; }
  const G = F.G, S = G === 1 ? 10 : 5, N = G * S;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const u0 = j / N, u1 = (j + 1) / N, v0 = i / N, v1 = (i + 1) / N;
    const A = gridAt(F.grid, G, u0, v0), B = gridAt(F.grid, G, u1, v0), C = gridAt(F.grid, G, u1, v1), D = gridAt(F.grid, G, u0, v1);
    const sA = [u0 * w, v0 * h], sB = [u1 * w, v0 * h], sC = [u1 * w, v1 * h], sD = [u0 * w, v1 * h];
    drawTri(x, img, sA, sB, sC, A, B, C); drawTri(x, img, sA, sC, sD, A, C, D);
  }
}
function buildFloatLive() { if (!FLOAT) return; if (!SCR.flt || SCR.flt.width !== ST.doc.w || SCR.flt.height !== ST.doc.h) SCR.flt = mkCanvas(ST.doc.w, ST.doc.h); const x = SCR.flt.getContext('2d'); x.globalCompositeOperation = 'copy'; x.drawImage(FLOAT.layer.canvas, 0, 0); x.globalCompositeOperation = 'source-over'; drawFloat(x); }
function drawSelOverlays(x) {
  if (SEL && SEL.pts.length > 1) { x.save(); x.lineWidth = 2; x.setLineDash([6, 5]); x.strokeStyle = '#fff'; x.beginPath(); SEL.pts.forEach((p, i) => { const s = d2s(p[0], p[1]); i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); }); x.closePath(); x.stroke(); x.strokeStyle = '#ff3d7f'; x.lineDashOffset = 6; x.stroke(); x.restore(); }
  if (!FLOAT) return; const hs = flHandles();
  x.save(); x.strokeStyle = '#ff7aa8'; x.lineWidth = 1.6; x.setLineDash([5, 4]); x.beginPath(); flOutline().forEach((p, i) => { const s = d2s(p[0], p[1]); i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); }); x.closePath(); x.stroke(); x.setLineDash([]);
  if (FLOAT.mode === 'warp') { x.strokeStyle = '#a78bfa99'; x.lineWidth = 1; const g = FLOAT.grid, G = FLOAT.G; for (let i = 0; i <= G; i++) { x.beginPath(); for (let j = 0; j <= G; j++) { const s = d2s(g[i][j][0], g[i][j][1]); j ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); } x.stroke(); x.beginPath(); for (let j = 0; j <= G; j++) { const s = d2s(g[j][i][0], g[j][i][1]); j ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y); } x.stroke(); } }
  hs.forEach(h => { const col = { corner: '#ff7aa8', side: '#5fd3b5', rot: '#a78bfa', pt: '#ffb020' }[h.k]; x.fillStyle = col; x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.beginPath(); x.arc(h.x, h.y, h.k === 'side' ? 10 : h.k === 'pt' ? 8 : 12, 0, 7); x.fill(); x.stroke(); const ic = { corner: '⤡', side: h.ax === 'x' ? '↔' : '↕', rot: '↻', pt: '' }[h.k]; if (ic) { x.fillStyle = '#fff'; x.font = '12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ic, h.x, h.y + 1); } });
  x.restore();
}
function flHandles() {
  const F = FLOAT, out = []; const S = (p) => d2s(p[0], p[1]);
  if (F.mode === 'basic') {
    const L = flLocalPts(); L.c.forEach((p, i) => { const q = flTP(p[0], p[1]); const s = S([q.x, q.y]); out.push({ k: 'corner', i, x: s.x, y: s.y, lp: p, ap: L.c[(i + 2) % 4] }); });
    L.m.forEach((p, i) => { const q = flTP(p[0], p[1]); const s = S([q.x, q.y]); out.push({ k: 'side', i, ax: i % 2 ? 'x' : 'y', x: s.x, y: s.y, lp: p, ap: L.m[(i + 2) % 4] }); });
    const top = flTP(L.m[0][0], L.m[0][1]), cen = flTP(L.ctr[0], L.ctr[1]); const ts = S([top.x, top.y]), cs = S([cen.x, cen.y]); const ux = ts.x - cs.x, uy = ts.y - cs.y, ul = Math.hypot(ux, uy) || 1; out.push({ k: 'rot', x: ts.x + ux / ul * 36, y: ts.y + uy / ul * 36 });
  } else { F.grid.forEach((row, i) => row.forEach((p, j) => { const s = S(p); out.push({ k: 'pt', i, j, x: s.x, y: s.y }); })); }
  return out;
}
/* ----- interaction ----- */
function lassoDown(dp, sp) {
  if (FLOAT) {
    const hs = flHandles(); let best = null, bd = 32; hs.forEach(h => { const d = Math.hypot(h.x - sp.x, h.y - sp.y); if (d < bd) { bd = d; best = h; } });
    const M0 = FLOAT.M, g0 = FLOAT.grid ? JSON.parse(JSON.stringify(FLOAT.grid)) : null; const cancel = function () { FLOAT.M = M0; FLOAT.grid = g0; ST.dirty = true; };
    if (best) { DRAG = { kind: 'float', h: best, start: dp, M0, g0, cancel }; return; }
    DRAG = { kind: 'float', h: { k: 'move' }, start: dp, M0, g0, cancel }; return;
  }
  SEL = { pts: [[dp.x, dp.y]], start: dp }; DRAG = { kind: 'lasso', cancel() { SEL = null; ST.dirty = true; } };
}
function floatDrag(D, dp) {
  const F = FLOAT, h = D.h; D.moved = true;
  if (h.k === 'move') { const dx = dp.x - D.start.x, dy = dp.y - D.start.y; if (F.mode === 'basic') F.M = new DOMMatrix().translate(dx, dy).multiply(D.M0); else F.grid = D.g0.map(r => r.map(p => [p[0] + dx, p[1] + dy])); }
  else if (h.k === 'pt') { F.grid = D.g0.map(r => r.map(p => p.slice())); F.grid[h.i][h.j] = [dp.x, dp.y]; }
  else if (h.k === 'rot') { const L = flLocalPts(); const cp = D.M0.transformPoint(new DOMPoint(L.ctr[0], L.ctr[1])); let deg = (Math.atan2(dp.y - cp.y, dp.x - cp.x) - Math.atan2(D.start.y - cp.y, D.start.x - cp.x)) * 180 / Math.PI; const n = Math.round(deg / 15) * 15; if (Math.abs(deg - n) < 3) deg = n; F.M = new DOMMatrix().translate(cp.x, cp.y).rotate(deg).translate(-cp.x, -cp.y).multiply(D.M0); }
  else { // corner / side scale in local space
    const p = D.M0.inverse().transformPoint(new DOMPoint(dp.x, dp.y)); const a = h.ap, hp = h.lp; let sx = 1, sy = 1;
    if (h.k === 'corner') { const vx = hp[0] - a[0], vy = hp[1] - a[1]; let s = ((p.x - a[0]) * vx + (p.y - a[1]) * vy) / (vx * vx + vy * vy); if (Math.abs(s) < .02) s = .02 * Math.sign(s || 1); sx = sy = s; }
    else if (h.ax === 'x') { sx = (p.x - a[0]) / ((hp[0] - a[0]) || 1); if (Math.abs(sx) < .02) sx = .02 * Math.sign(sx || 1); }
    else { sy = (p.y - a[1]) / ((hp[1] - a[1]) || 1); if (Math.abs(sy) < .02) sy = .02 * Math.sign(sy || 1); }
    F.M = D.M0.translate(a[0], a[1]).scale(sx, sy).translate(-a[0], -a[1]);
  }
  ST.dirty = true;
}
function lassoEnd(D, dp) {
  if (D.kind !== 'lasso' || !SEL) return; let pts = SEL.pts; SEL = null;
  if (ST.selShape === 'rect' && D.startPt) { const a = D.startPt, b = [dp.x, dp.y]; pts = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]; }
  const bb = polyBBox(pts); if (pts.length < 4 || bb.w * ST.view.s < 14 || bb.h * ST.view.s < 14) { ST.dirty = true; makeFloat(fullPoly()); return; } makeFloat(pts);
}
function lassoMove(D, dp) { if (!SEL) return; if (ST.selShape === 'rect') { const a = SEL.start; SEL.pts = [[a.x, a.y], [dp.x, a.y], [dp.x, dp.y], [a.x, dp.y]]; D.startPt = [a.x, a.y]; } else { const l = SEL.pts[SEL.pts.length - 1]; if (Math.hypot(l[0] - dp.x, l[1] - dp.y) > 2 / ST.view.s) SEL.pts.push([dp.x, dp.y]); } ST.dirty = true; }
/* ----- commit / cancel / actions ----- */
function finishFloat(F, draw) {
  const W = ST.doc.w, H = ST.doc.h, L = F.layer;
  if (!F.multi) { if (draw) drawFloat(L.ctx, F); histPixels(F.page, L, F.before, { x: 0, y: 0, w: W, h: H }); return; }
  const recs = F.frames.map(f => { const cel = selCel(L, f), x = cel.getContext('2d'); if (draw) drawFloat(x, { ...F, src: F.srcs[f] }); L.used[f] = true; return { x, b: F.befores[f].getContext('2d').getImageData(0, 0, W, H), a: x.getImageData(0, 0, W, H), f }; });
  L._v = (L._v || 0) + 1; const fr = F.frame;
  pushHist({ undo() { recs.forEach(r => r.x.putImageData(r.b, 0, 0)); L._v++; histGoto(F.page, fr); }, redo() { recs.forEach(r => r.x.putImageData(r.a, 0, 0)); L._v++; histGoto(F.page, fr); } });
  updTimeline();
}
function commitFloat() { const F = FLOAT; if (!F) return; FLOAT = null; finishFloat(F, true); ST.dirty = true; ST.layerThumbDirty = true; showSelBar(); }
function cancelFloat() { const F = FLOAT; if (!F) return; FLOAT = null; F.frames.forEach(f => { const x = selCel(F.layer, f).getContext('2d'); x.save(); x.globalCompositeOperation = 'copy'; x.drawImage(F.befores[f], 0, 0); x.restore(); }); ST.dirty = true; showSelBar(); }
function stampFloat() { const F = FLOAT; if (!F) return; F.frames.forEach(f => drawFloat(selCel(F.layer, f).getContext('2d'), { ...F, src: F.srcs[f] })); toast('⧉ 도장 찍었어요! 계속 옮겨서 또 찍을 수 있어요'); ST.dirty = true; }
function deleteFloat() { const F = FLOAT; if (!F) return; FLOAT = null; finishFloat(F, false); showSelBar(); ST.dirty = true; toast('🗑 지웠어요'); }
function flipFloat(ax) { const F = FLOAT; if (!F) return; const { w, h } = flSize();
  if (F.mode === 'basic') F.M = ax === 'x' ? F.M.translate(w, 0).scale(-1, 1) : F.M.translate(0, h).scale(1, -1);
  else F.grid = ax === 'x' ? F.grid.map(r => r.slice().reverse()) : F.grid.slice().reverse();
  ST.dirty = true; }
function floatToNextFrame() {
  const F = FLOAT; if (!F || ST.doc.type !== 'anim') return; if (F.multi) { toast('모든 장 선택일 때는 쓸 수 없어요'); return; } const keep = { src: F.src, M: F.M, mode: F.mode, grid: F.grid ? JSON.parse(JSON.stringify(F.grid)) : null, G: F.G, layer: F.layer };
  commitFloat(); const nf = ST.frame + 1; if (nf >= ST.doc.anim.frames) insertFrame(nf); else setFrame(nf);
  const L = keep.layer; const idx = ST.page.layers.indexOf(L); if (idx >= 0) ST.page.active = idx; if (L.kind === 'frames') bindCel(L, ST.frame);
  const before = mkCanvas(ST.doc.w, ST.doc.h); before.getContext('2d').drawImage(L.canvas, 0, 0);
  FLOAT = { layer: L, page: ST.page, frame: ST.frame, frames: [ST.frame], srcs: { [ST.frame]: keep.src }, befores: { [ST.frame]: before }, src: keep.src, before, M: keep.M, mode: keep.mode, grid: keep.grid, G: keep.G, poly: fullPoly(), multi: false };
  showSelBar(); ST.dirty = true; toast(`➡ ${ST.frame + 1}번 프레임에 붙였어요. 조금 옮겨서 움직임을 만들어요!`, 2600);
}
function floatToPart() {
  const F = FLOAT; if (!F || ST.doc.type !== 'anim') return; if (F.multi) { toast('모든 장 선택일 때는 쓸 수 없어요'); return; } const outl = flOutline(); const bb = polyBBox(outl);
  const art = mkCanvas(ST.doc.w, ST.doc.h); drawFloat(art.getContext('2d'));
  FLOAT = null; histPixels(F.page, F.layer, F.before, { x: 0, y: 0, w: ST.doc.w, h: ST.doc.h }); hideSelBar();
  withStructHist(() => { const l = newAnimLayer('part', '파트 ' + (ST.page.layers.length + 1)); l.ctx.drawImage(art, 0, 0); l.pivot = { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2 }; const i = ST.page.layers.indexOf(F.layer); ST.page.layers.splice(i + 1, 0, l); ST.page.active = i + 1; });
  setTool('xform'); toast('🔑 파트로 만들었어요! 끌어서 키프레임으로 움직여요', 2800);
}
function showSelBar() {
  const b = $('#selBar'); if (!b) return; if (ST.tool !== 'lasso' && !FLOAT) { b.style.display = 'none'; return; } hideHint(); const an = ST.doc && ST.doc.type === 'anim';
  if (!FLOAT) {
    b.className = 'floatbar idle';
    b.innerHTML = `<div class="sb-tip">✂️ 둘레를 그려서 고르기 · <b>톡 치면 전체</b></div><div class="sb-row"><button data-s="free" class="${ST.selShape === 'free' ? 'on' : ''}"><i>➰</i>올가미</button><button data-s="rect" class="${ST.selShape === 'rect' ? 'on' : ''}"><i>⬚</i>네모</button><button data-s="all" class="hl"><i>▣</i>전체 선택</button>${an ? `<button data-s="af" class="${ST.selAllFrames ? 'on' : ''}"><i>🎞</i>${ST.selAllFrames ? '모든 장 ✔' : '모든 장'}</button>` : ''}<button data-s="exit"><i>✕</i>닫기</button></div>`;
  } else {
    b.className = 'floatbar';
    b.innerHTML = `<div class="sb-tip">어디든 끌면 이동 · 점을 끌면 크기·회전${FLOAT.multi ? ` · <b>🎞 ${FLOAT.frames.length}장 함께</b>` : ''}</div><div class="sb-row"><button data-s="basic" class="${FLOAT.mode === 'basic' ? 'on' : ''}"><i>⤡</i>기본</button><button data-s="free2" class="${FLOAT.mode === 'free' ? 'on' : ''}"><i>◇</i>모서리</button><button data-s="warp" class="${FLOAT.mode === 'warp' ? 'on' : ''}"><i>〰</i>휘기</button><button data-s="flip"><i>⇋</i>뒤집기</button><button data-s="more"><i>⋯</i>더보기</button></div>
    <div class="sb-row">${an && !FLOAT.multi ? '<button data-s="next"><i>➡</i>다음 장에</button>' : ''}<button data-s="cancel"><i>↺</i>취소</button><button data-s="ok" class="hl wide"><i>✔</i>완료</button></div>`;
  }
  b.style.display = 'flex';
  b.querySelectorAll('button').forEach(bt => bt.onclick = () => { const s = bt.dataset.s;
    if (s === 'free' || s === 'rect') { ST.selShape = s; showSelBar(); } else if (s === 'all') selectAll(); else if (s === 'af') toggleAllFrames(); else if (s === 'exit') setTool(ST.prevTool || 'brush');
    else if (s === 'basic') setFloatMode('basic'); else if (s === 'free2') setFloatMode('free'); else if (s === 'warp') setFloatMode('warp'); else if (s === 'flip') flipFloat('x');
    else if (s === 'more') selMoreMenu();
    else if (s === 'next') floatToNextFrame(); else if (s === 'cancel') { cancelFloat(); toast('원래대로 돌려놨어요'); } else if (s === 'ok') commitFloat(); });
}
function selMoreMenu() {
  const an = ST.doc.type === 'anim';
  openModal(`<h3>선택한 그림</h3><div class="size-grid"><button data-m="fy"><b>⇵ 위아래 뒤집기</b></button><button data-m="stamp"><b>⧉ 도장 찍기</b><small>복사본을 남기고 계속 옮기기</small></button>${an && !FLOAT.multi ? '<button data-m="part"><b>🔑 파트로 만들기</b><small>키프레임으로 움직이기</small></button>' : ''}${an && FLOAT.layer.kind === 'frames' ? `<button data-m="af"><b>🎞 ${ST.selAllFrames ? '지금 장만 고르기' : '모든 장 함께 고르기'}</b><small>모든 프레임을 같이 옮겨요</small></button>` : ''}<button data-m="del"><b>🗑 지우기</b></button></div><div class="mbtns"><button class="btn sec sm" id="smX">닫기</button></div>`);
  $('#smX').onclick = closeModal;
  $('#modal').querySelectorAll('[data-m]').forEach(b => b.onclick = () => { closeModal(); const m = b.dataset.m; if (m === 'fy') flipFloat('y'); else if (m === 'stamp') stampFloat(); else if (m === 'part') floatToPart(); else if (m === 'af') toggleAllFrames(); else if (m === 'del') deleteFloat(); });
}
function hideSelBar() { showSelBar(); }
function selSheetButtons() { return `<button class="gb ${ST.tool === 'lasso' && ST.selShape === 'free' ? 'on' : ''}" data-sel="free"><i>✂️</i>올가미 선택</button><button class="gb ${ST.tool === 'lasso' && ST.selShape === 'rect' ? 'on' : ''}" data-sel="rect"><i>⬚</i>네모 선택</button><button class="gb" data-sel="all"><i>▣</i>레이어 전체</button>`; }
function bindSelButtons(root) { root.querySelectorAll('[data-sel]').forEach(b => b.onclick = () => { closeSheets(); const v = b.dataset.sel; if (v === 'all') { selectAll(); return; } ST.selShape = v; setTool('lasso'); }); }
