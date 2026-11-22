/* ================= STROKES ================= */
let STROKE = null;
const RAINBOW = ['#ff5c8a', '#ffb020', '#ffe14d', '#4cd964', '#4fb3ff', '#a06bff'];
function symXforms() {
  const W = ST.doc.w, H = ST.doc.h, cx = W / 2, cy = H / 2;
  const id = (x, y) => [x, y];
  switch (ST.sym) {
    case 'v': return [id, (x, y) => [2 * cx - x, y]];
    case 'h': return [id, (x, y) => [x, 2 * cy - y]];
    case 'quad': return [id, (x, y) => [2 * cx - x, y], (x, y) => [x, 2 * cy - y], (x, y) => [2 * cx - x, 2 * cy - y]];
    case 'k6': { const f = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); f.push((x, y) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); } return f; }
    default: return [id];
  }
}
function beginStroke(pt, pointerType) {
  const page = ST.page, layer = curLayer(), brush = curBrush();
  if (!layer.visible) { toast('숨긴 레이어에는 그릴 수 없어요 👁'); return false; }
  if (layer.kind === 'part') { if (brush.smudge || brush.blur) { toast('움직이는 파트에서는 문지르기·흐리게를 쓸 수 없어요'); return false; } if (!layerMatrix(layer, ST.frame).isInvertible) { toast('지금 크기가 0이라 그릴 수 없어요. 다른 프레임에서 그려요'); return false; } }
  const st = bs(brush.id);
  if (!SCR.stroke || SCR.stroke.width !== ST.doc.w || SCR.stroke.height !== ST.doc.h) { SCR.stroke = mkCanvas(ST.doc.w, ST.doc.h); SCR.before = mkCanvas(ST.doc.w, ST.doc.h); }
  const sx = SCR.stroke.getContext('2d'); sx.clearRect(0, 0, ST.doc.w, ST.doc.h);
  const bx = SCR.before.getContext('2d'); bx.globalCompositeOperation = 'copy'; bx.drawImage(layer.canvas, 0, 0); bx.globalCompositeOperation = 'source-over';
  let clipPoly = null;
  if (ST.clipPanel && page.panels.length) { const i = panelAt(pt.x, pt.y); if (i >= 0) clipPoly = page.panels[i].pts; }
  STROKE = {
    page, layer, brush, color: ST.color, alpha: st.alpha, size: st.size, canvas: SCR.stroke, ctx: sx, before: SCR.before,
    pts: [], dist: 0, last: null, sm: null, seed: (Math.random() * 1e9) | 0, rng: null, pen: pointerType === 'pen',
    rect: { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }, clipPoly, direct: !!(brush.smudge || brush.blur), shape: ST.tool === 'shape' ? ST.shape : (ST.ruler ? 'line' : null), start: { ...pt }, t0: performance.now(), liveReady: false,
  };
  STROKE.rng = seeded(STROKE.seed);
  if (STROKE.shape) { STROKE.pts = [pt]; replayShape(pt); }
  else addPoint(pt);
  ST.dirty = true; return true;
}
function addPoint(raw) {
  const S = STROKE; if (!S) return;
  if (S.shape) { replayShape(raw); ST.dirty = true; return; }
  const k = 1 / (1 + ST.stab * .85);
  if (!S.sm) S.sm = { ...raw }; else { S.sm.x += (raw.x - S.sm.x) * k; S.sm.y += (raw.y - S.sm.y) * k; S.sm.p += (raw.p - S.sm.p) * Math.min(1, k * 1.6); }
  pushPt({ x: S.sm.x, y: S.sm.y, p: S.sm.p });
  ST.dirty = true;
}
function pushPt(p) {
  const S = STROKE; const prev = S.pts[S.pts.length - 1]; S.pts.push(p);
  if (!prev) { stampSeg(S, null, p); return; }
  stampSeg(S, prev, p);
}
function stampParams(S, p, distAlong, total) {
  const b = S.brush; let size = S.size, alpha = b.flow;
  const pr = S.pen ? clamp(p.p, 0, 1) : 1;
  size *= 1 - (b.pSize || 0) * (1 - pr);
  if (b.pAlpha && S.pen) alpha *= .35 + .65 * pr;
  if (b.taper && !S.pen) {
    const tl = clamp(S.size * 5, 12, 140) * b.taper * 2;
    let f = Math.min(1, .12 + .88 * distAlong / tl);
    if (total != null) f = Math.min(f, .12 + .88 * Math.max(0, total - distAlong) / tl);
    size *= Math.min(1, f);
  }
  return { size: Math.max(.4, size), alpha };
}
function stampSeg(S, a, b, total) {
  const br = S.brush;
  if (!a) { const sp = stampParams(S, b, 0, total); stamp(S, b.x, b.y, sp.size, sp.alpha, null); S.last = { x: b.x, y: b.y }; S.since = 0; return; }
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); if (len < .01) return;
  let t = 0;
  while (true) {
    const sp0 = stampParams(S, { p: lerp(a.p, b.p, t) }, S.dist, total);
    const spacing = (br.spacing >= 1 ? S.size * br.spacing : Math.max(.5, sp0.size * br.spacing));
    const need = spacing - S.since; const remain = len * (1 - t);
    if (need > remain) { S.since += remain; S.dist += remain; break; }
    t += need / len; S.dist += need; S.since = 0;
    const px = a.x + dx * t, py = a.y + dy * t; const sp = stampParams(S, { p: lerp(a.p, b.p, t) }, S.dist, total);
    stamp(S, px, py, sp.size, sp.alpha, { x: S.last.x, y: S.last.y }); S.last = { x: px, y: py };
  }
}
function growRect(S, x, y, r) { const R = S.rect; R.x0 = Math.min(R.x0, x - r); R.y0 = Math.min(R.y0, y - r); R.x1 = Math.max(R.x1, x + r); R.y1 = Math.max(R.y1, y + r); }
function stamp(S, x, y, size, alpha, prev) {
  const b = S.brush, rng = S.rng;
  if (b.smudge || b.blur) { directStamp(S, x, y, size, alpha, prev); return; }
  let sz = size, ox = 0, oy = 0, rot = 0, col = S.color;
  if (b.sizeJit) sz *= 1 - b.sizeJit * rng();
  if (b.scatter) { const a = rng() * Math.PI * 2, r = rng() * S.size * b.scatter; ox = Math.cos(a) * r; oy = Math.sin(a) * r; }
  if (b.rotJit) rot = (rng() - .5) * Math.PI * b.rotJit;
  if (b.rainbow) col = RAINBOW[(rng() * RAINBOW.length) | 0];
  const img = makeStamp(b.stamp, b.pattern ? '#000000' : col);
  const x2 = S.ctx; x2.globalAlpha = clamp(alpha, 0, 1);
  const xf = symXforms();
  xf.forEach((f, i) => {
    const q = f(x + ox, y + oy); growRect(S, q[0], q[1], sz);
    if (b.stamp === 'square') { const ang = prev ? Math.atan2(y - prev.y, x - prev.x) : 0; x2.save(); x2.translate(q[0], q[1]); x2.rotate(-Math.PI / 4); x2.drawImage(img, -sz / 2, -sz / 2, sz, sz); x2.restore(); return; }
    if (rot) { x2.save(); x2.translate(q[0], q[1]); x2.rotate(rot * (i % 2 ? -1 : 1)); x2.drawImage(img, -sz / 2, -sz / 2, sz, sz); x2.restore(); }
    else x2.drawImage(img, q[0] - sz / 2, q[1] - sz / 2, sz, sz);
  });
  x2.globalAlpha = 1;
}
let _dT = null, _dS = null;
function directStamp(S, x, y, size, alpha, prev) {
  if (!prev) return; const d = Math.max(2, Math.ceil(size)), r = d / 2; const L = S.layer.ctx;
  if (!_dT || _dT.width < d) { _dT = mkCanvas(d + 8, d + 8); _dS = mkCanvas(d + 8, d + 8); }
  const T = _dT.getContext('2d'); T.clearRect(0, 0, _dT.width, _dT.height);
  if (S.brush.smudge) { T.drawImage(S.layer.canvas, prev.x - r, prev.y - r, d, d, 0, 0, d, d); }
  else { const q = Math.max(2, Math.round(d / 6)); const sx = _dS.getContext('2d'); sx.clearRect(0, 0, _dS.width, _dS.height); sx.imageSmoothingEnabled = true; sx.drawImage(S.layer.canvas, x - r, y - r, d, d, 0, 0, q, q); T.imageSmoothingEnabled = true; T.drawImage(_dS, 0, 0, q, q, 0, 0, d, d); }
  T.globalCompositeOperation = 'destination-in'; T.drawImage(makeStamp('soft', '#000000'), 0, 0, d, d); T.globalCompositeOperation = 'source-over';
  L.save(); if (S.clipPoly) { polyPath(L, S.clipPoly); L.clip(); }
  L.globalAlpha = alpha * (S.brush.smudge ? .9 : 1); if (S.layer.lock) L.globalCompositeOperation = 'source-atop'; L.drawImage(_dT, 0, 0, d, d, x - r, y - r, d, d); L.restore();
  growRect(S, x, y, d);
}
function shapeTarget(a, b) {
  // perspective snapping for lines
  if (STROKE.shape === 'line' && ST.persp && ST.vp) {
    const ang = Math.atan2(b.y - a.y, b.x - a.x), len = Math.hypot(b.x - a.x, b.y - a.y);
    const cands = [0, Math.PI / 2, Math.atan2(ST.vp.y - a.y, ST.vp.x - a.x)];
    let best = cands[0], bd = 9; cands.forEach(c => { for (const cc of [c, c + Math.PI, c - Math.PI]) { const d = Math.abs(((ang - cc + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (d < bd) { bd = d; best = cc; } } });
    const proj = len * Math.cos(ang - best); return { x: a.x + Math.cos(best) * proj, y: a.y + Math.sin(best) * proj, p: b.p };
  }
  return b;
}
function replayShape(cur) {
  const S = STROKE; const a = S.start; const b = shapeTarget(a, cur); S.end = b;
  S.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h); S.rng = seeded(S.seed); S.dist = 0; S.since = 0; S.last = null; S.rect = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
  const sh = S.shape; let pts = [];
  if (sh === 'line') pts = [a, b];
  else if (sh === 'rect' || sh === 'frect') pts = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }, a];
  else if (sh === 'ellipse' || sh === 'fellipse') { const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2; const n = Math.max(24, Math.round((rx + ry) / 3)); for (let i = 0; i <= n; i++) { const t = i / n * Math.PI * 2; pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry }); } }
  pts = pts.map(p => ({ x: p.x, y: p.y, p: 1 }));
  if (sh === 'frect' || sh === 'fellipse') {
    const x = S.ctx; x.fillStyle = S.brush.pattern ? '#000' : S.color; x.globalAlpha = 1; symXforms().forEach(f => { x.beginPath(); pts.forEach((p, i) => { const q = f(p.x, p.y); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); x.fill(); pts.forEach(p => { const q = f(p.x, p.y); growRect(S, q[0], q[1], 2); }); });
    S.pts = pts; return;
  }
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  for (let i = 0; i < pts.length; i++) stampSeg(S, i ? pts[i - 1] : null, pts[i], sh === 'line' ? total : null);
  S.pts = pts;
}
function replayFull(S, withEndTaper) {
  S.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h); S.rng = seeded(S.seed); S.dist = 0; S.since = 0; S.last = null;
  let total = 0; for (let i = 1; i < S.pts.length; i++) total += Math.hypot(S.pts[i].x - S.pts[i - 1].x, S.pts[i].y - S.pts[i - 1].y);
  for (let i = 0; i < S.pts.length; i++) stampSeg(S, i ? S.pts[i - 1] : null, S.pts[i], withEndTaper ? total : null);
}
function endStroke(lastRaw) {
  const S = STROKE; if (!S) return;
  if (!S.shape && !S.direct && lastRaw && S.sm) { // catch up stabilizer to finger
    const n = Math.min(10, 2 + ST.stab); const sx = S.sm.x, sy = S.sm.y; for (let i = 1; i <= n; i++) pushPt({ x: lerp(sx, lastRaw.x, i / n), y: lerp(sy, lastRaw.y, i / n), p: lerp(S.sm.p, lastRaw.p, i / n) * (S.pen ? 1 : 1) });
  }
  if (!S.shape && !S.direct && S.brush.taper && !S.pen && S.pts.length > 2) replayFull(S, true);
  const R = S.rect, rect = { x: R.x0 - 2, y: R.y0 - 2, w: R.x1 - R.x0 + 4, h: R.y1 - R.y0 + 4 };
  if (!S.direct) applyStrokeTo(S.layer.ctx, S);
  STROKE = null;
  if (R.x1 > R.x0) histPixels(S.page, S.layer, S.before, rect);
  S.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h); ST.dirty = true; ST.layerThumbDirty = true;
}
function cancelStroke() { const S = STROKE; if (!S) return; if (S.direct) { const L = S.layer.ctx; L.save(); L.globalCompositeOperation = 'copy'; L.drawImage(S.before, 0, 0); L.restore(); } S.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h); STROKE = null; ST.dirty = true; }

/* ================= FILL ================= */
function floodFill(px, py) {
  const W = ST.doc.w, H = ST.doc.h, x0 = px | 0, y0 = py | 0; if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;
  const page = ST.page, layer = curLayer(); if (!layer.visible) { toast('숨긴 레이어예요'); return; }
  ensureScratch(); const rc = SCR.comp.getContext('2d'); rc.clearRect(0, 0, W, H);
  if (ST.fillRef === 'all') compositePage(page, rc, { bg: false, objects: false }); else rc.drawImage(layer.canvas, 0, 0);
  const src = rc.getImageData(0, 0, W, H).data; const i0 = (y0 * W + x0) * 4; const tr = src[i0], tg = src[i0 + 1], tb = src[i0 + 2], ta = src[i0 + 3]; const tol = ST.fillTol * 2.2;
  const match = i => { const a = src[i + 3]; if (ta < 8 && a < 8) return true; return Math.abs(src[i] - tr) + Math.abs(src[i + 1] - tg) + Math.abs(src[i + 2] - tb) + Math.abs(a - ta) * 1.2 <= tol * 2; };
  const mask = new Uint8Array(W * H); const stack = [x0, y0]; let minx = x0, maxx = x0, miny = y0, maxy = y0, count = 0;
  while (stack.length) {
    let y = stack.pop(), x = stack.pop(); let i = y * W + x;
    while (x >= 0 && !mask[i] && match(i * 4)) { x--; i--; } x++; i++;
    let up = false, dn = false;
    while (x < W && !mask[i] && match(i * 4)) {
      mask[i] = 1; count++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      if (y > 0) { const j = i - W; if (!mask[j] && match(j * 4)) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false; }
      if (y < H - 1) { const j = i + W; if (!mask[j] && match(j * 4)) { if (!dn) { stack.push(x, y + 1); dn = true; } } else dn = false; }
      x++; i++;
    }
  }
  if (!count) return;
  const g = ST.fillGrow; if (g > 0) { for (let k = 0; k < g; k++) { const m2 = mask.slice(); for (let y = Math.max(1, miny - 1); y <= Math.min(H - 2, maxy + 1); y++) for (let x = Math.max(1, minx - 1); x <= Math.min(W - 2, maxx + 1); x++) { const i = y * W + x; if (!mask[i] && (mask[i - 1] || mask[i + 1] || mask[i - W] || mask[i + W])) m2[i] = 1; } mask.set(m2); minx = Math.max(0, minx - 1); miny = Math.max(0, miny - 1); maxx = Math.min(W - 1, maxx + 1); maxy = Math.min(H - 1, maxy + 1); } }
  const bw = maxx - minx + 1, bh = maxy - miny + 1; const mc = mkCanvas(bw, bh), mx = mc.getContext('2d'); const id = mx.createImageData(bw, bh); const [r, gg, b] = hexToRgb(ST.color);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { if (mask[(y + miny) * W + x + minx]) { const o = (y * bw + x) * 4; id.data[o] = r; id.data[o + 1] = gg; id.data[o + 2] = b; id.data[o + 3] = 255; } }
  mx.putImageData(id, 0, 0);
  if (ST.fillMode === 'tone') { mx.globalCompositeOperation = 'source-in'; mx.translate(-minx, -miny); mx.fillStyle = tonePattern(ST.color, mx); mx.fillRect(minx, miny, bw, bh); }
  const before = SCR.before && SCR.before.width === W && SCR.before.height === H ? SCR.before : (SCR.before = mkCanvas(W, H)); if (!SCR.stroke || SCR.stroke.width !== W || SCR.stroke.height !== H) SCR.stroke = mkCanvas(W, H);
  const bx = before.getContext('2d'); bx.globalCompositeOperation = 'copy'; bx.drawImage(layer.canvas, 0, 0); bx.globalCompositeOperation = 'source-over';
  const L = layer.ctx; L.save(); if (layer.kind === 'part') { const m = layerMatrix(layer, ST.frame).inverse(); L.setTransform(m.a, m.b, m.c, m.d, m.e, m.f); } L.globalAlpha = bs(ST.brushId).alpha; if (layer.lock) L.globalCompositeOperation = 'source-atop'; L.drawImage(mc, minx, miny); L.restore();
  histPixels(page, layer, before, { x: minx, y: miny, w: bw, h: bh }); ST.dirty = true; ST.layerThumbDirty = true;
}
function pickColor(px, py) {
  ensureScratch(); const W = ST.doc.w, H = ST.doc.h; const x = px | 0, y = py | 0; if (x < 0 || y < 0 || x >= W || y >= H) return;
  const c = SCR.comp.getContext('2d'); c.clearRect(0, 0, W, H); compositePage(ST.page, c, { live: true }); const d = c.getImageData(x, y, 1, 1).data; setColor(rgbToHex(d[0], d[1], d[2])); toast('🎯 색을 가져왔어요');
}
