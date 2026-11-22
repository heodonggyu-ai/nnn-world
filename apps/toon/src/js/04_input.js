/* ================= INPUT ================= */
const PTR = new Map(); let G = null, PAN = null, DRAG = null, LP = null, PICKING = false, TAPST = null;
function stageXY(e) { const r = VIEW.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function evPressure(e) { if (e.pointerType === 'pen') return e.pressure || .5; return 1; }
function initInput() {
  const c = VIEW.c;
  c.addEventListener('pointerdown', onDown); c.addEventListener('pointermove', onMove); c.addEventListener('pointerup', onUp); c.addEventListener('pointercancel', onUp); c.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !e.buttons) onUp(e); });
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => { e.preventDefault(); const p = stageXY(e); if (e.ctrlKey || !e.shiftKey) zoomAt(p, Math.exp(-e.deltaY * .0015)); else { ST.view.x -= e.deltaX; ST.view.y -= e.deltaY; ST.dirty = true; } }, { passive: false });
  document.addEventListener('keydown', e => {
    if (!$('#editor').classList.contains('active') || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); }
    else if (k === 'b') setTool('brush'); else if (k === 'e') setTool('eraser'); else if (k === 'g') setTool('fill'); else if (k === 'h') setTool('hand'); else if (k === 'i') setTool('picker');
    else if (k === 'delete' || k === 'backspace') { if (selObj()) objAction('del'); }
  });
}
function zoomAt(p, f) { const v = ST.view; const d = s2d(p.x, p.y); v.s = clamp(v.s * f, .05, 30); const q = d2s(d.x, d.y); v.x += p.x - q.x; v.y += p.y - q.y; ST.dirty = true; }
function onDown(e) {
  e.preventDefault(); try { VIEW.c.setPointerCapture(e.pointerId); } catch (_) { }
  const sp = stageXY(e); PTR.set(e.pointerId, { x: sp.x, y: sp.y, type: e.pointerType });
  if (PTR.size >= 2) { startGesture(); return; }
  const dp = s2d(sp.x, sp.y); dp.p = evPressure(e);
  TAPST = { sx: sp.x, sy: sp.y, t: performance.now(), moved: false };
  if (ST.placing) { return; }
  if (ST.playing) { stopPlay(); TAPST = null; return; }
  if (ST.tool === 'xform' || (ST.tool === 'move' && curLayer().kind === 'part')) { xformDown(dp, sp); return; }
  if (ST.tool === 'lasso') { lassoDown(dp, sp); return; }
  const t = ST.tool;
  if (t === 'hand' || (ST.penOnly && e.pointerType === 'touch' && ['brush', 'eraser', 'shape', 'fill', 'picker'].includes(t))) { PAN = { sx: sp.x, sy: sp.y, vx: ST.view.x, vy: ST.view.y }; return; }
  if (t === 'select') { selectDown(dp, sp); return; }
  if (t === 'panel') { panelDown(dp, sp); return; }
  if (t === 'vp') { ST.vp = { x: dp.x, y: dp.y }; ST.dirty = true; DRAG = { kind: 'vp' }; return; }
  if (t === 'picker') { PICKING = true; pickColor(dp.x, dp.y); return; }
  if (t === 'fill') return;
  if (t === 'move') { moveDown(dp); return; }
  if (t === 'brush' || t === 'eraser' || t === 'shape') {
    if (beginStroke(dp, e.pointerType) && e.pointerType !== 'pen' && t !== 'shape') {
      LP = setTimeout(() => { if (STROKE && TAPST && !TAPST.moved) { cancelStroke(); PICKING = true; pickColor(dp.x, dp.y); } }, 520);
    }
  }
}
function onMove(e) {
  if (!PTR.has(e.pointerId)) { return; }
  const sp = stageXY(e); PTR.set(e.pointerId, { x: sp.x, y: sp.y, type: e.pointerType });
  if (G) { moveGesture(); return; }
  if (TAPST && Math.hypot(sp.x - TAPST.sx, sp.y - TAPST.sy) > 7) { TAPST.moved = true; if (LP) { clearTimeout(LP); LP = null; } }
  if (PAN) { ST.view.x = PAN.vx + sp.x - PAN.sx; ST.view.y = PAN.vy + sp.y - PAN.sy; ST.dirty = true; return; }
  const dp = s2d(sp.x, sp.y);
  if (PICKING) { pickColor(dp.x, dp.y); return; }
  if (DRAG) { dragMove(dp, sp); return; }
  if (STROKE) {
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach(ev => { const s = stageXY(ev); const d = s2d(s.x, s.y); d.p = evPressure(ev); addPoint(d); });
  }
}
function onUp(e) {
  if (!PTR.has(e.pointerId)) return; PTR.delete(e.pointerId); if (LP) { clearTimeout(LP); LP = null; }
  const sp = stageXY(e); const dp = s2d(sp.x, sp.y); dp.p = evPressure(e);
  if (G) { if (PTR.size === 0) { const dt = performance.now() - G.t0; if (!G.moved && dt < 350) { G.n >= 3 ? (redo(), toast('↷ 다시하기', 900)) : (undo(), toast('↶ 되돌리기', 900)); } G = null; } return; }
  if (PAN) { PAN = null; return; }
  const tap = TAPST && !TAPST.moved && performance.now() - TAPST.t < 500; TAPST = null;
  if (ST.placing) { if (tap) { const pl = ST.placing; ST.placing = null; hideHint(); pl.fn(dp); } return; }
  if (PICKING) { PICKING = false; if (ST.tool === 'picker') setTool(ST.prevTool || 'brush'); return; }
  if (DRAG) { dragEnd(dp, tap); return; }
  if (ST.tool === 'fill' && tap) { floodFill(dp.x, dp.y); return; }
  if (ST.tool === 'select' && tap) { return; }
  if (STROKE) endStroke(dp);
}
function startGesture() {
  if (STROKE) { if (performance.now() - STROKE.t0 < 350 || STROKE.pts.length < 6) cancelStroke(); else endStroke(); }
  if (LP) { clearTimeout(LP); LP = null; }
  if (DRAG && DRAG.cancel) DRAG.cancel(); DRAG = null; PAN = null; PICKING = false;
  const p = [...PTR.values()]; const a = p[0], b = p[1];
  if (G) { G.n = Math.max(G.n, PTR.size); return; }
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  G = { n: PTR.size, t0: performance.now(), moved: false, d0: Math.hypot(b.x - a.x, b.y - a.y), a0: Math.atan2(b.y - a.y, b.x - a.x), s0: ST.view.s, r0: ST.view.r, mid0: mid, doc: s2d(mid.x, mid.y) };
}
function moveGesture() {
  const p = [...PTR.values()]; if (p.length < 2) return; const a = p[0], b = p[1];
  const d = Math.hypot(b.x - a.x, b.y - a.y), an = Math.atan2(b.y - a.y, b.x - a.x); const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (Math.abs(d - G.d0) > 10 || Math.hypot(mid.x - G.mid0.x, mid.y - G.mid0.y) > 10) G.moved = true; if (!G.moved) return;
  const v = ST.view; v.s = clamp(G.s0 * d / Math.max(1, G.d0), .05, 30);
  let r = G.r0 + (an - G.a0); const deg = r * 180 / Math.PI; const near = Math.round(deg / 90) * 90; if (Math.abs(deg - near) < 6) r = near * Math.PI / 180; v.r = r;
  v.x = 0; v.y = 0; const q = d2s(G.doc.x, G.doc.y); v.x = mid.x - q.x; v.y = mid.y - q.y; ST.dirty = true;
}

/* ---------- select tool (objects) ---------- */
function selectDown(dp, sp) {
  const o = selObj();
  if (o) {
    const h = objHandles(o); const near = (p) => p && Math.hypot(p.x - sp.x, p.y - sp.y) < 24;
    if (near(h.tail)) { DRAG = objDrag(o, 'tail', dp); return; }
    if (near(h.scale)) { DRAG = objDrag(o, 'scale', dp); return; }
    if (near(h.rot)) { DRAG = objDrag(o, 'rot', dp); return; }
  }
  const hit = objAt(dp.x, dp.y);
  if (hit) { const dbl = ST.sel === hit.id && ST._lastTap && performance.now() - ST._lastTap < 400; ST.sel = hit.id; ST._lastTap = performance.now(); showObjBar(); DRAG = objDrag(hit, 'move', dp); DRAG.dbl = dbl; ST.dirty = true; return; }
  ST.sel = null; showObjBar(); ST.dirty = true; PAN = { sx: sp.x, sy: sp.y, vx: ST.view.x, vy: ST.view.y };
}
function objDrag(o, kind, dp) {
  const snap = JSON.stringify(ST.page.objects); const st = { x: o.x, y: o.y, w: o.w, h: o.h, rot: o.rot || 0, size: o.size, tail: o.tail ? { ...o.tail } : null };
  return { kind: 'obj', mode: kind, o, start: dp, st, snap, moved: false, cancel() { ST.page.objects = JSON.parse(snap); ST.dirty = true; } };
}
function dragMove(dp, sp) {
  const D = DRAG; D.moved = true;
  if (D.kind === 'vp') { ST.vp = { x: dp.x, y: dp.y }; ST.dirty = true; return; }
  if (D.kind === 'layermove') { const L = D.layer.ctx; L.save(); L.globalCompositeOperation = 'copy'; L.drawImage(D.before, Math.round(dp.x - D.start.x), Math.round(dp.y - D.start.y)); L.restore(); ST.dirty = true; return; }
  if (D.kind === 'panel') { panelDrag(D, dp); return; }
  if (D.kind === 'xform') { xformDrag(D, dp); return; }
  if (D.kind === 'lasso') { lassoMove(D, dp); return; }
  if (D.kind === 'float') { floatDrag(D, dp); return; }
  const o = D.o, st = D.st;
  if (D.mode === 'move') { o.x = st.x + dp.x - D.start.x; o.y = st.y + dp.y - D.start.y; }
  else if (D.mode === 'tail') { const l = objLocal(o, dp.x, dp.y); o.tail = { x: l.x, y: l.y }; }
  else if (D.mode === 'rot') { const a = Math.atan2(dp.y - o.y, dp.x - o.x) + Math.PI / 2; let deg = a * 180 / Math.PI; const n = Math.round(deg / 45) * 45; if (Math.abs(deg - n) < 5) deg = n; o.rot = deg * Math.PI / 180; }
  else if (D.mode === 'scale') {
    const l0 = objLocal({ x: st.x, y: st.y, rot: st.rot }, D.start.x, D.start.y), l1 = objLocal({ x: st.x, y: st.y, rot: st.rot }, dp.x, dp.y);
    if (o.kind === 'bubble') { o.w = Math.max(40, st.w * (l1.x / Math.max(10, l0.x))); o.h = Math.max(30, st.h * (l1.y / Math.max(10, l0.y))); if (st.tail) { o.tail = { x: st.tail.x * o.w / st.w, y: st.tail.y * o.h / st.h }; } }
    else { const f = Math.hypot(l1.x, l1.y) / Math.max(10, Math.hypot(l0.x, l0.y)); o.size = clamp(st.size * f, 8, 600); }
  }
  ST.dirty = true;
}
function dragEnd(dp, tap) {
  const D = DRAG; DRAG = null;
  if (D.kind === 'vp') return;
  if (D.kind === 'layermove') { if (D.moved) histPixels(ST.page, D.layer, D.before, { x: 0, y: 0, w: ST.doc.w, h: ST.doc.h }); ST.layerThumbDirty = true; return; }
  if (D.kind === 'panel') { panelDragEnd(D); return; }
  if (D.kind === 'xform') { xformEnd(D); return; }
  if (D.kind === 'lasso') { lassoEnd(D, dp); return; }
  if (D.kind === 'float') return;
  if (D.kind === 'obj') {
    if (D.moved) { const p = ST.page, b = D.snap, a = JSON.stringify(p.objects); pushHist({ undo() { p.objects = JSON.parse(b); gotoPageOf(p); }, redo() { p.objects = JSON.parse(a); gotoPageOf(p); } }); }
    else if (tap && D.dbl) editObjText(D.o);
  }
}
function moveDown(dp) {
  const L = curLayer(); if (!SCR.before || SCR.before.width !== ST.doc.w || SCR.before.height !== ST.doc.h) SCR.before = mkCanvas(ST.doc.w, ST.doc.h);
  const bx = SCR.before.getContext('2d'); bx.globalCompositeOperation = 'copy'; bx.drawImage(L.canvas, 0, 0); bx.globalCompositeOperation = 'source-over';
  DRAG = { kind: 'layermove', layer: L, before: SCR.before, start: dp, cancel() { const c = L.ctx; c.save(); c.globalCompositeOperation = 'copy'; c.drawImage(SCR.before, 0, 0); c.restore(); } };
}

/* ---------- panel edit ---------- */
function panelDown(dp, sp) {
  const P = ST.page.panels; const sel = P[ST.selPanel];
  if (sel) {
    const hs = panelHandles(sel); for (const h of hs) if (Math.hypot(h.x - sp.x, h.y - sp.y) < 24) { DRAG = { kind: 'panel', mode: h.kind, vi: h.i, p: sel, start: dp, orig: JSON.parse(JSON.stringify(sel.pts)), bb: polyBBox(sel.pts), snap: JSON.stringify(P) }; return; }
  }
  const i = panelAt(dp.x, dp.y); ST.selPanel = i; ST.dirty = true; updPanelBar();
  if (i >= 0) DRAG = { kind: 'panel', mode: 'move', p: P[i], start: dp, orig: JSON.parse(JSON.stringify(P[i].pts)), snap: JSON.stringify(P) };
  else PAN = { sx: sp.x, sy: sp.y, vx: ST.view.x, vy: ST.view.y };
}
function snapv(v, step) { return Math.round(v / step) * step; }
function panelDrag(D, dp) {
  D.moved = true; const dx = dp.x - D.start.x, dy = dp.y - D.start.y; const W = ST.doc.w, H = ST.doc.h; const sn = 8;
  if (D.mode === 'move') D.p.pts = D.orig.map(q => [q[0] + snapv(dx, sn), q[1] + snapv(dy, sn)]);
  else if (D.mode === 'v') { D.p.pts = D.orig.map(q => q.slice()); D.p.pts[D.vi] = [clamp(snapv(dp.x, sn), 0, W), clamp(snapv(dp.y, sn), 0, H)]; }
  else if (D.mode === 's') { const b = D.bb; const nx = Math.max(30, b.w + dx), ny = Math.max(30, b.h + dy); D.p.pts = D.orig.map(q => [b.x + (q[0] - b.x) * nx / b.w, b.y + (q[1] - b.y) * ny / b.h]); }
  ST.dirty = true;
}
function panelDragEnd(D) { if (!D.moved) return; const p = ST.page, b = D.snap, a = JSON.stringify(p.panels); pushHist({ undo() { p.panels = JSON.parse(b); gotoPageOf(p); }, redo() { p.panels = JSON.parse(a); gotoPageOf(p); } }); }

/* ---------- vertical sliders ---------- */
function initSliders() {
  const mk = (el, get, set, fmt) => {
    const upd = () => { const t = get(); el.querySelector('.knob').style.bottom = `calc(${t} * (100% - 34px) + 3px)`; el.querySelector('.fill').style.height = (t * 100) + '%'; el.querySelector('.knob').textContent = fmt(); };
    const h = e => { const r = el.getBoundingClientRect(); const t = clamp(1 - (e.clientY - r.top - 14) / (r.height - 28), 0, 1); set(t); upd(); showDot(); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture(e.pointerId); el._on = true; h(e); });
    el.addEventListener('pointermove', e => { if (el._on) h(e); });
    el.addEventListener('pointerup', e => { el._on = false; hideDot(); LS.set('bstate', ST.bstate); });
    el.addEventListener('pointercancel', e => { el._on = false; hideDot(); });
    el._upd = upd; upd();
  };
  mk($('#vsSize'), () => { const b = curBrush(), s = bs(b.id).size; return Math.log(s) / Math.log(b.max); }, t => { const b = curBrush(); bs(b.id).size = Math.max(1, Math.round(Math.pow(b.max, t) * 10) / 10); }, () => { const s = bs(curBrush().id).size; return s < 10 ? s.toFixed(1).replace('.0', '') : Math.round(s); });
  mk($('#vsAlpha'), () => bs(curBrush().id).alpha, t => { bs(curBrush().id).alpha = Math.max(.02, Math.round(t * 100) / 100); }, () => Math.round(bs(curBrush().id).alpha * 100));
}
function updSliders() { $('#vsSize')._upd && $('#vsSize')._upd(); $('#vsAlpha')._upd && $('#vsAlpha')._upd(); }
function showDot() { const b = curBrush(), st = bs(b.id); const d = $('#brushPreviewDot'); const px = Math.max(2, st.size * ST.view.s); d.style.width = d.style.height = px + 'px'; d.style.background = b.eraser ? 'transparent' : ST.color; d.style.opacity = st.alpha; d.style.display = 'block'; }
function hideDot() { $('#brushPreviewDot').style.display = 'none'; }
