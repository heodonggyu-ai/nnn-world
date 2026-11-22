/* ================= ANIMATION ================= */
const EASES = [
  { id: 'linear', n: '일정하게', d: '같은 빠르기 (기계, 회전)' },
  { id: 'in', n: '점점 빠르게', d: '떨어질 때, 출발할 때' },
  { id: 'out', n: '점점 느리게', d: '올라갈 때, 멈출 때' },
  { id: 'inout', n: '부드럽게', d: '천천히 출발 → 천천히 멈춤' },
  { id: 'back', n: '띠용 (넘쳤다 돌아옴)', d: '뿅! 등장, 탄력' },
  { id: 'bounce', n: '통통 튀며 멈춤', d: '떨어져서 통통' },
  { id: 'step', n: '딱 끊기', d: '다음 키까지 그대로 멈춤' },
];
function ease(id, t) {
  switch (id) {
    case 'in': return t * t * t;
    case 'out': return 1 - Math.pow(1 - t, 3);
    case 'inout': return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'back': { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
    case 'bounce': { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; }
    case 'step': return 0;
    default: return t;
  }
}
const POSE0 = { x: 0, y: 0, sx: 1, sy: 1, r: 0, a: 1 };
function getPose(l, f) {
  const K = l.keys; if (!K || !K.length) return { ...POSE0 };
  if (f <= K[0].f) return { ...POSE0, ...K[0] }; const last = K[K.length - 1]; if (f >= last.f) return { ...POSE0, ...last };
  let i = 0; while (K[i + 1].f < f) i++; const a = K[i], b = K[i + 1]; if (f === b.f) return { ...POSE0, ...b };
  const t = ease(a.ease || 'linear', (f - a.f) / (b.f - a.f)); const o = {};
  ['x', 'y', 'sx', 'sy', 'r', 'a'].forEach(k => o[k] = lerp(a[k] != null ? a[k] : POSE0[k], b[k] != null ? b[k] : POSE0[k], t));
  return o;
}
function layerMatrix(l, f) {
  const P = getPose(l, f); l._pose = P; const c = l.pivot || { x: ST.doc.w / 2, y: ST.doc.h / 2 };
  return new DOMMatrix().translate(c.x + P.x, c.y + P.y).rotate(P.r).scale(P.sx || 1e-4, P.sy || 1e-4).translate(-c.x, -c.y);
}
function sortKeys(l) { l.keys.sort((a, b) => a.f - b.f); }
function setKey(l, f, vals) {
  if (!l.keys) l.keys = [];
  if (!l.keys.length && f > 0) l.keys.push({ f: 0, ...POSE0, ease: 'inout' });
  let k = l.keys.find(q => q.f === f);
  if (!k) { const cur = getPose(l, f); k = { f, ...cur, ease: (l.keys.find(q => q.f < f) || {}).ease || 'inout' }; l.keys.push(k); sortKeys(l); }
  Object.assign(k, vals); return k;
}

/* ---------- frames & cels ---------- */
function newAnimLayer(kind, name) { const l = newLayer(ST.doc ? ST.doc.w : 480, ST.doc ? ST.doc.h : 480, name); l.kind = kind; if (kind === 'frames') { l.cels = {}; l.used = {}; } else { l.keys = []; l.pivot = { x: (ST.doc ? ST.doc.w : 480) / 2, y: (ST.doc ? ST.doc.h : 480) / 2 }; } return l; }
function bindCel(l, f) { if (!l.cels[f]) l.cels[f] = mkCanvas(ST.doc.w, ST.doc.h); l.canvas = l.cels[f]; l.ctx = l.canvas.getContext('2d'); }
function setFrame(f, silent) {
  if (!ST.doc || ST.doc.type !== 'anim') return; if (FLOAT && FLOAT.frame !== clamp(f, 0, ST.doc.anim.frames - 1)) commitFloat(); const N = ST.doc.anim.frames; ST.frame = clamp(f, 0, N - 1);
  ST.doc.pages.forEach(p => p.layers.forEach(l => { if (l.kind === 'frames') bindCel(l, ST.frame); }));
  ST.dirty = true; updTimeline(); if (!silent && OPEN_SHEET === 'shLayers') refreshOpenSheet();
}
function animSnapHist(fn) { withStructHist(fn); setFrame(ST.frame, true); }
function insertFrame(at, copyFrom) {
  if (ST.doc.anim.frames >= 72) { toast('프레임은 72장까지 만들 수 있어요'); return; }
  animSnapHist(() => {
    ST.page.layers.forEach(l => {
      if (l.kind === 'frames') { const c = {}, u = {}; Object.keys(l.cels).forEach(k => { const n = +k; c[n >= at ? n + 1 : n] = l.cels[k]; if (l.used[k]) u[n >= at ? n + 1 : n] = true; }); if (copyFrom != null && l.used[copyFrom]) { const src = l.cels[copyFrom]; const cc = mkCanvas(ST.doc.w, ST.doc.h); cc.getContext('2d').drawImage(src, 0, 0); c[at] = cc; u[at] = true; } else delete c[at]; l.cels = c; l.used = u; }
      else if (l.keys) l.keys.forEach(k => { if (k.f >= at) k.f++; });
    });
    ST.doc.anim.frames++;
  });
  setFrame(at);
}
function deleteFrame(at) {
  if (ST.doc.anim.frames <= 1) { toast('프레임이 하나는 있어야 해요'); return; }
  animSnapHist(() => {
    ST.page.layers.forEach(l => {
      if (l.kind === 'frames') { const c = {}, u = {}; Object.keys(l.cels).forEach(k => { const n = +k; if (n === at) return; c[n > at ? n - 1 : n] = l.cels[k]; if (l.used[k]) u[n > at ? n - 1 : n] = true; }); l.cels = c; l.used = u; }
      else if (l.keys) { l.keys = l.keys.filter(k => k.f !== at); l.keys.forEach(k => { if (k.f > at) k.f--; }); }
    });
    ST.doc.anim.frames--;
  });
  setFrame(Math.min(at, ST.doc.anim.frames - 1));
}
function setFrameCount(n) { n = clamp(n, 1, 72); if (n === ST.doc.anim.frames) return; animSnapHist(() => { ST.doc.anim.frames = n; ST.page.layers.forEach(l => { if (l.keys) l.keys = l.keys.filter(k => k.f < n); }); }); setFrame(Math.min(ST.frame, n - 1)); }

/* ---------- playback ---------- */
let PLAY = null;
function startPlay() {
  if (STROKE) endStroke(); if (ST.playing) return; ST.playing = true; let dir = 1; const A = ST.doc.anim;
  PLAY = setInterval(() => {
    if (!ST.doc || ST.doc.type !== 'anim') { stopPlay(); return; }
    let f = ST.frame + dir; const N = A.frames;
    if (A.loop === 'pingpong') { if (f >= N) { dir = -1; f = N - 2; } if (f < 0) { dir = 1; f = 1; } f = clamp(f, 0, N - 1); }
    else if (f >= N) f = 0;
    setFrame(f, true);
  }, 1000 / A.fps);
  updTimeline();
}
function stopPlay() { if (PLAY) clearInterval(PLAY); PLAY = null; ST.playing = false; updTimeline(); ST.dirty = true; }
function togglePlay() { ST.playing ? stopPlay() : startPlay(); }

/* ---------- timeline UI ---------- */
function updTimeline() {
  const tl = $('#timeline'); if (!tl) return; if (!ST.doc || ST.doc.type !== 'anim') { tl.style.display = 'none'; return; }
  tl.style.display = 'block'; const A = ST.doc.anim, N = A.frames, p = ST.page;
  $('#tlPlay').textContent = ST.playing ? '❚❚' : '▶'; $('#tlNum').textContent = `${ST.frame + 1}/${N}`; $('#tlOnion').classList.toggle('on', ST.onion); $('#tlFps').textContent = A.fps + 'fps';
  const L = curLayer(); const kb = $('#tlKey'); kb.style.display = L && L.kind === 'part' ? '' : 'none'; if (L && L.kind === 'part') kb.classList.toggle('on', !!(L.keys || []).find(k => k.f === ST.frame));
  if (ST.playing) { const g = $('#tlGrid'); g.querySelectorAll('.tl-c.cur').forEach(c => c.classList.remove('cur')); g.querySelectorAll(`.tl-c[data-f="${ST.frame}"]`).forEach(c => c.classList.add('cur')); return; }
  const g = $('#tlGrid'); let h = `<div class="tl-row tl-head"><div class="tl-lab"></div>`;
  for (let f = 0; f < N; f++) h += `<div class="tl-c tl-n ${f === ST.frame ? 'cur' : ''}" data-f="${f}">${f + 1}</div>`;
  h += '</div>';
  for (let i = p.layers.length - 1; i >= 0; i--) {
    const l = p.layers[i]; h += `<div class="tl-row ${i === p.active ? 'act' : ''}" data-l="${i}"><div class="tl-lab">${l.kind === 'part' ? '◆ ' : ''}${esc(l.name)}</div>`;
    const keyset = {}; (l.keys || []).forEach(k => keyset[k.f] = k); const k0 = l.keys && l.keys.length ? l.keys[0].f : -1, k1 = l.keys && l.keys.length ? l.keys[l.keys.length - 1].f : -1;
    for (let f = 0; f < N; f++) {
      let cls = 'tl-c', inner = '';
      if (l.kind === 'frames') { if (l.used[f]) { cls += ' full'; inner = '●'; } }
      else { if (keyset[f]) { cls += ' key'; inner = '◆'; } else if (f > k0 && f < k1) cls += ' tween'; }
      if (f === ST.frame) cls += ' cur';
      h += `<div class="${cls}" data-f="${f}" data-l="${i}">${inner}</div>`;
    }
    h += '</div>';
  }
  g.innerHTML = h;
  const cur = g.querySelector('.tl-head .cur'); if (cur && !ST._scrub) { const gr = g.getBoundingClientRect(), cr = cur.getBoundingClientRect(); if (cr.right > gr.right - 10 || cr.left < gr.left + 80) g.scrollLeft += cr.left - gr.left - gr.width / 2; }
}
function initTimeline() {
  const G = $('#tlGrid'); let SC = null;
  const frameAtX = cx => { const r = G.getBoundingClientRect(); return clamp(Math.floor((cx - r.left + G.scrollLeft - 84) / 26), 0, ST.doc.anim.frames - 1); };
  G.addEventListener('pointerdown', e => { if (!ST.doc || ST.doc.type !== 'anim' || e.target.closest('.tl-lab')) return; SC = { x: e.clientX, id: e.pointerId, moved: false }; });
  G.addEventListener('pointermove', e => {
    if (!SC || e.pointerId !== SC.id) return;
    if (!SC.moved) { if (Math.abs(e.clientX - SC.x) < 6) return; SC.moved = true; try { G.setPointerCapture(e.pointerId); } catch (_) { } if (ST.playing) stopPlay(); G.classList.add('scrub'); }
    e.preventDefault(); const r = G.getBoundingClientRect();
    if (e.clientX > r.right - 28) G.scrollLeft += 10; else if (e.clientX < r.left + 84 + 18) G.scrollLeft -= 10;
    const f = frameAtX(e.clientX); if (f !== ST.frame) { ST._scrub = true; setFrame(f, true); ST._scrub = false; }
  });
  const endSc = e => { if (!SC || (e && e.pointerId !== SC.id)) return; if (SC.moved) { G._justScrubbed = true; setTimeout(() => G._justScrubbed = false, 200); G.classList.remove('scrub'); updTimeline(); } SC = null; };
  G.addEventListener('pointerup', endSc); G.addEventListener('pointercancel', endSc);
  G.addEventListener('click', e => {
    if (G._justScrubbed) { G._justScrubbed = false; return; }
    const c = e.target.closest('.tl-c'); const row = e.target.closest('.tl-row');
    if (ST.playing) stopPlay();
    if (row && row.dataset.l != null) { const li = +row.dataset.l; const was = ST.page.active === li && c && +c.dataset.f === ST.frame; ST.page.active = li; if (c) setFrame(+c.dataset.f); else updTimeline(); const l = ST.page.layers[li]; if (was && l.kind === 'part' && c.classList.contains('key')) openKeyEditor(); ST.dirty = true; refreshOpenSheet(); return; }
    if (c) setFrame(+c.dataset.f);
  });
  $('#tlPlay').onclick = togglePlay;
  $('#tlPrev').onclick = () => { stopPlay(); setFrame(ST.frame - 1 < 0 ? ST.doc.anim.frames - 1 : ST.frame - 1); };
  $('#tlNext').onclick = () => { stopPlay(); setFrame((ST.frame + 1) % ST.doc.anim.frames); };
  $('#tlOnion').onclick = () => { ST.onion = !ST.onion; ST.dirty = true; updTimeline(); toast(ST.onion ? '🧅 어니언 스킨: 앞(빨강)·뒤(초록) 프레임이 비쳐요' : '어니언 스킨 끔'); };
  $('#tlAdd').onclick = () => { stopPlay(); insertFrame(ST.frame + 1); toast('＋ 빈 프레임을 넣었어요'); };
  $('#tlDup').onclick = () => { stopPlay(); insertFrame(ST.frame + 1, ST.frame); toast('⧉ 지금 프레임을 복사했어요 (조금씩 고쳐 그려요!)'); };
  $('#tlDel').onclick = () => { stopPlay(); deleteFrame(ST.frame); };
  $('#tlKey').onclick = () => { const l = curLayer(); if (l.kind !== 'part') return; if ((l.keys || []).find(k => k.f === ST.frame)) openKeyEditor(); else { withStructHist(() => setKey(l, ST.frame, {})); toast('🔑 키를 넣었어요. 파트를 움직이면 자동으로 저장돼요'); } };
  $('#tlFps').onclick = () => openSheet('shAnim');
}

/* ---------- onion skin & motion path ---------- */
let _tint = null;
function drawTinted(x, src, col, alpha) {
  if (!_tint || _tint.width !== ST.doc.w || _tint.height !== ST.doc.h) _tint = mkCanvas(ST.doc.w, ST.doc.h);
  const t = _tint.getContext('2d'); t.globalCompositeOperation = 'copy'; t.drawImage(src, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = col; t.fillRect(0, 0, _tint.width, _tint.height); t.globalCompositeOperation = 'source-over';
  x.save(); x.globalAlpha = alpha; x.drawImage(_tint, 0, 0); x.restore();
}
function drawAnimGuides(x) {
  if (ST.playing) return; const L = curLayer(); const f = ST.frame, N = ST.doc.anim.frames;
  if (ST.onion && L.kind === 'frames') {
    [[f - 2, '#ff3d6e', .12], [f + 2, '#20c46b', .1], [f - 1, '#ff3d6e', .3], [f + 1, '#20c46b', .25]].forEach(([g, c, a]) => { let gg = g; if (ST.doc.anim.loop !== 'pingpong') gg = (g + N) % N; if (gg < 0 || gg >= N || gg === f) return; if (L.used[gg] && L.cels[gg]) drawTinted(x, L.cels[gg], c, a); });
  }
  if (false) {
    [[f - 1, '#ff3d6e', .22], [f + 1, '#20c46b', .2]].forEach(([g, c, a]) => { if (g < 0 || g >= N) return; x.save(); const m = layerMatrix(L, g); x.transform(m.a, m.b, m.c, m.d, m.e, m.f); drawTinted(x, L.canvas, c, a); x.restore(); });
  }
  if (ST.path && L.kind === 'part' && L.keys && L.keys.length > 1) {
    const lw = 1 / ST.view.s; const c = L.pivot; x.save(); x.strokeStyle = '#a78bfa88'; x.lineWidth = lw * 2; x.setLineDash([4 * lw, 4 * lw]); x.beginPath();
    const pts = []; for (let g = 0; g < N; g++) { const P = getPose(L, g); pts.push([c.x + P.x, c.y + P.y]); }
    pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.setLineDash([]);
    const keyF = new Set(L.keys.map(k => k.f));
    pts.forEach((p, g) => { x.fillStyle = g === f ? '#ff3d7f' : keyF.has(g) ? '#ffb020' : '#a78bfa'; x.beginPath(); if (keyF.has(g)) { const r = 7 * lw; x.moveTo(p[0], p[1] - r); x.lineTo(p[0] + r, p[1]); x.lineTo(p[0], p[1] + r); x.lineTo(p[0] - r, p[1]); x.closePath(); } else x.arc(p[0], p[1], (g === f ? 6 : 3.5) * lw, 0, 7); x.fill(); });
    x.restore();
  }
}

/* ---------- part transform tool ---------- */
function partBBox(l) {
  if (l._bb && l._bbv === (l._v || 0) && l._bbc === l.canvas) return l._bb;
  const W = l.canvas.width, H = l.canvas.height; const s = Math.min(1, 240 / Math.max(W, H)); const w = Math.max(1, Math.round(W * s)), h = Math.max(1, Math.round(H * s));
  const c = mkCanvas(w, h), x = c.getContext('2d'); x.drawImage(l.canvas, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data;
  let a = w, b = h, cc = -1, dd = -1; for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 8) { if (i < a) a = i; if (i > cc) cc = i; if (y < b) b = y; if (y > dd) dd = y; }
  const bb = cc < 0 ? { x: W * .3, y: H * .3, w: W * .4, h: H * .4, empty: true } : { x: a / s - 2, y: b / s - 2, w: (cc - a + 1) / s + 4, h: (dd - b + 1) / s + 4 };
  l._bb = bb; l._bbv = l._v || 0; l._bbc = l.canvas; return bb;
}
function partHandles(l) {
  const m = layerMatrix(l, ST.frame), bb = partBBox(l);
  const tp = (x, y) => { const p = m.transformPoint(new DOMPoint(x, y)); return d2s(p.x, p.y); };
  const box = [tp(bb.x, bb.y), tp(bb.x + bb.w, bb.y), tp(bb.x + bb.w, bb.y + bb.h), tp(bb.x, bb.y + bb.h)];
  const topMid = tp(bb.x + bb.w / 2, bb.y); const cen = tp(bb.x + bb.w / 2, bb.y + bb.h / 2); const ux = topMid.x - cen.x, uy = topMid.y - cen.y, ul = Math.hypot(ux, uy) || 1;
  const rot = { x: topMid.x + ux / ul * 34, y: topMid.y + uy / ul * 34 };
  const P = l._pose; const pv = d2s(l.pivot.x + P.x, l.pivot.y + P.y);
  return { box, scale: box[2], rot, pivot: pv, sxh: tp(bb.x + bb.w, bb.y + bb.h / 2), syh: tp(bb.x + bb.w / 2, bb.y + bb.h) };
}
function drawAnimOverlays(x) {
  const l = curLayer(); if (!l || l.kind !== 'part' || ST.playing) return; if (!(ST.tool === 'xform' || ST.tool === 'move')) return;
  const h = partHandles(l); x.save(); x.strokeStyle = '#ff7aa8'; x.lineWidth = 1.5; x.setLineDash([5, 4]); x.beginPath(); h.box.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.closePath(); x.stroke(); x.setLineDash([]);
  const dot = (p, col, ic, r = 13) => { x.fillStyle = col; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.stroke(); if (ic) { x.fillStyle = '#fff'; x.font = '13px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ic, p.x, p.y + 1); } };
  dot(h.scale, '#ff7aa8', '⤡'); dot(h.rot, '#a78bfa', '↻'); dot(h.sxh, '#5fd3b5', '↔', 11); dot(h.syh, '#5fd3b5', '↕', 11);
  x.fillStyle = '#ffb020'; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc(h.pivot.x, h.pivot.y, 9, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(h.pivot.x - 14, h.pivot.y); x.lineTo(h.pivot.x + 14, h.pivot.y); x.moveTo(h.pivot.x, h.pivot.y - 14); x.lineTo(h.pivot.x, h.pivot.y + 14); x.strokeStyle = '#ffb020'; x.stroke();
  x.restore();
}
function xformDown(dp, sp) {
  const l = curLayer(); if (l.kind !== 'part') { toast('🔑 파트 레이어를 골라야 움직일 수 있어요'); return; }
  const h = partHandles(l); const near = (p, r = 24) => Math.hypot(p.x - sp.x, p.y - sp.y) < r; const P = getPose(l, ST.frame);
  let mode = null; if (near(h.pivot, 16)) mode = 'pivot'; else if (near(h.rot)) mode = 'rot'; else if (near(h.scale)) mode = 'scale'; else if (near(h.sxh, 20)) mode = 'sx'; else if (near(h.syh, 20)) mode = 'sy';
  else if (ptInPoly(sp.x, sp.y, h.box.map(p => [p.x, p.y]))) mode = 'move';
  if (!mode) { PAN = { sx: sp.x, sy: sp.y, vx: ST.view.x, vy: ST.view.y }; return; }
  DRAG = { kind: 'xform', mode, l, start: dp, P, snap: pageSnap(ST.page), piv0: { ...l.pivot }, keys0: JSON.parse(JSON.stringify(l.keys || [])), c: { x: l.pivot.x + P.x, y: l.pivot.y + P.y }, moved: false, cancel() { pageRestore(ST.page, this.snap); } };
}
function xformDrag(D, dp) {
  D.moved = true; const l = D.l, P = D.P, c = D.c; const f = ST.frame;
  if (D.mode === 'move') setKey(l, f, { x: P.x + dp.x - D.start.x, y: P.y + dp.y - D.start.y });
  else if (D.mode === 'rot') { const a0 = Math.atan2(D.start.y - c.y, D.start.x - c.x), a1 = Math.atan2(dp.y - c.y, dp.x - c.x); let r = P.r + (a1 - a0) * 180 / Math.PI; const n = Math.round(r / 15) * 15; if (Math.abs(r - n) < 3) r = n; setKey(l, f, { r }); }
  else if (D.mode === 'scale') { const k = Math.hypot(dp.x - c.x, dp.y - c.y) / Math.max(4, Math.hypot(D.start.x - c.x, D.start.y - c.y)); setKey(l, f, { sx: Math.max(.02, P.sx * k), sy: Math.max(.02, P.sy * k) }); }
  else if (D.mode === 'sx' || D.mode === 'sy') { const ang = P.r * Math.PI / 180; const ax = D.mode === 'sx' ? [Math.cos(ang), Math.sin(ang)] : [-Math.sin(ang), Math.cos(ang)]; const d0 = (D.start.x - c.x) * ax[0] + (D.start.y - c.y) * ax[1], d1 = (dp.x - c.x) * ax[0] + (dp.y - c.y) * ax[1]; const k = d1 / (Math.abs(d0) < 4 ? 4 * Math.sign(d0 || 1) : d0); setKey(l, f, D.mode === 'sx' ? { sx: Math.max(.02, P.sx * k) } : { sy: Math.max(.02, P.sy * k) }); }
  else if (D.mode === 'pivot') {
    // move pivot: keep picture still -> compensate every key
    const m = layerMatrix({ ...l, keys: D.keys0, pivot: D.piv0 }, f).inverse(); const q = m.transformPoint(new DOMPoint(dp.x, dp.y)); const cN = { x: q.x, y: q.y }, cO = D.piv0;
    l.pivot = cN; l.keys = D.keys0.map(k => { const r = (k.r || 0) * Math.PI / 180, sx = k.sx != null ? k.sx : 1, sy = k.sy != null ? k.sy : 1; const vx = (cN.x - cO.x) * sx, vy = (cN.y - cO.y) * sy; const rx = vx * Math.cos(r) - vy * Math.sin(r), ry = vx * Math.sin(r) + vy * Math.cos(r); return { ...k, x: (k.x || 0) + (cO.x - cN.x) + rx, y: (k.y || 0) + (cO.y - cN.y) + ry }; });
  }
  ST.dirty = true;
}
function xformEnd(D) { if (!D.moved) return; const p = ST.page, b = D.snap, a = pageSnap(p); pushHist({ undo() { pageRestore(p, b); }, redo() { pageRestore(p, a); } }); updTimeline(); markMission('key'); }

/* ---------- key editor ---------- */
function openKeyEditor() {
  const l = curLayer(); if (l.kind !== 'part') return; const p = ST.page, snap = pageSnap(p); const f = ST.frame;
  const k = setKey(l, f, {}); const W = ST.doc.w;
  const sl = (id, lab, min, max, step, val, unit = '') => `<div class="mrow"><label>${lab} <b id="${id}V">${Math.round(val * 100) / 100}${unit}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
  openModal(`<h3>🔑 ${f + 1}번 프레임 키 — ${esc(l.name)}</h3>
  ${sl('kx', '← 가로 위치 →', -W, W, 1, k.x)}${sl('ky', '↑ 세로 위치 ↓', -ST.doc.h, ST.doc.h, 1, k.y)}
  ${sl('ks', '크기 (%)', 0, 300, 1, Math.round(Math.sqrt(k.sx * k.sy) * 100))}${sl('ksx', '가로로 늘이기 (%)', 0, 300, 1, Math.round(k.sx * 100))}${sl('ksy', '세로로 늘이기 (%)', 0, 300, 1, Math.round(k.sy * 100))}
  ${sl('kr', '회전 (도)', -720, 720, 1, Math.round(k.r))}${sl('ka', '투명도 (%)', 0, 100, 1, Math.round(k.a * 100))}
  <div class="mrow"><label>다음 키까지 움직이는 방법</label><div class="chips">${EASES.map(e => `<button class="chip ${e.id === (k.ease || 'linear') ? 'on' : ''}" data-e="${e.id}">${e.n}</button>`).join('')}</div><p id="kEd" style="font-size:12.5px;color:#77738a;margin:6px 2px 0">${EASES.find(e => e.id === (k.ease || 'linear')).d}</p></div>
  <div class="mbtns"><button class="btn sec sm" id="kDel">🗑 키 지우기</button><button class="btn sm" id="kOk">완료</button></div>`);
  const upd = () => { ST.dirty = true; updTimeline(); };
  const bind = (id, fn, fmt) => { $('#' + id).oninput = e => { const v = +e.target.value; fn(v); $('#' + id + 'V').textContent = fmt ? fmt(v) : v; upd(); }; };
  bind('kx', v => k.x = v); bind('ky', v => k.y = v); bind('kr', v => k.r = v); bind('ka', v => k.a = v / 100);
  bind('ks', v => { const cur = Math.sqrt(k.sx * k.sy) || 1; const r = (v / 100) / cur; k.sx = Math.max(0, k.sx * r); k.sy = Math.max(0, k.sy * r); $('#ksx').value = Math.round(k.sx * 100); $('#ksxV').textContent = Math.round(k.sx * 100); $('#ksy').value = Math.round(k.sy * 100); $('#ksyV').textContent = Math.round(k.sy * 100); });
  bind('ksx', v => k.sx = v / 100); bind('ksy', v => k.sy = v / 100);
  $('#modal').querySelectorAll('[data-e]').forEach(b => b.onclick = () => { k.ease = b.dataset.e; $('#modal').querySelectorAll('[data-e]').forEach(q => q.classList.toggle('on', q === b)); $('#kEd').textContent = EASES.find(e => e.id === k.ease).d; upd(); });
  const fin = () => { closeModal(); const a = pageSnap(p); pushHist({ undo() { pageRestore(p, snap); }, redo() { pageRestore(p, a); } }); upd(); };
  $('#kOk').onclick = fin; $('#kDel').onclick = () => { l.keys = l.keys.filter(q => q !== k); fin(); toast('키를 지웠어요'); };
}

/* ---------- anim sheet ---------- */
function rAnim() {
  const el = $('#shAnimBody'), A = ST.doc.anim, L = curLayer();
  el.innerHTML = `<div class="sh-sec">재생</div>
  <div class="row"><label>빠르기</label><input type="range" min="2" max="24" value="${A.fps}" id="aFps"><span class="val" id="aFpsV">${A.fps}fps</span></div>
  <div class="row"><label>프레임 수</label><button class="sbtn" id="aFm">－</button><b style="min-width:40px;text-align:center;font-family:var(--fh)">${A.frames}</b><button class="sbtn" id="aFp">＋</button><span style="color:#aaa;font-size:12.5px">= ${(A.frames / A.fps).toFixed(1)}초</span></div>
  <div class="row"><label>반복</label><div class="seg" id="aLoop"><button data-v="loop">🔁 계속 반복</button><button data-v="pingpong">↔ 왔다갔다</button></div></div>
  <div class="tog" id="aOn"><div>🧅 어니언 스킨 <small>앞 프레임(빨강) · 뒤 프레임(초록)이 비쳐 보여요</small></div><div class="sw-tog ${ST.onion ? 'on' : ''}"></div></div>
  <div class="tog" id="aPath"><div>⋯ 움직임 경로 점 <small>파트가 지나가는 길을 점으로 보여줘요. 점 사이가 넓으면 빠름!</small></div><div class="sw-tog ${ST.path ? 'on' : ''}"></div></div>
  <div class="sh-sec">🔑 키프레임 파트</div>
  <div class="tipline">파트 = 한 번 그리고 <b>움직이기만</b> 하는 그림 (공, 하트, 팔...). 처음과 끝 위치만 정하면 중간은 앱이 자동으로 만들어요!</div>
  <div class="sh-sec">✂️ 그린 그림 골라서 움직이기·변형</div><div class="grid-btns" id="aSel">${selSheetButtons()}</div><div class="tipline">고른 다음 <b>➡ 다음 장</b>을 누르면 다음 프레임에 그대로 붙어요. 조금씩 옮기며 계속 누르면 한 장씩 애니가 쉽게 만들어져요!</div>
  <div class="sh-sec">🔑 파트 도구</div><div class="grid-btns"><button class="gb ${ST.tool === 'xform' ? 'on' : ''}" id="aX"><i>✥</i>파트 움직이기</button><button class="gb" id="aNP"><i>＋</i>새 파트 레이어</button><button class="gb" id="aNF"><i>🎞</i>새 프레임 레이어</button><button class="gb" id="aConv"><i>🔄</i>이 레이어를 파트로</button><button class="gb" id="aKey"><i>🔑</i>지금 키 고치기</button></div>
  <div class="sh-sec">💾 저장</div><div class="grid-btns"><button class="gb" id="aGif"><i>🎞️</i>GIF (흰 배경)</button><button class="gb" id="aGifT"><i>✨</i>GIF (투명 배경)</button><button class="gb" id="aSprite"><i>🧩</i>프레임 모음 PNG</button><button class="gb" id="aPng"><i>🖼️</i>이 프레임만</button></div>
  <div class="sh-sec">🎓 따라하기 예제</div><div class="grid-btns" id="aEx"></div>
  <div class="tipline" style="margin-top:12px"><b>💡</b> 12fps = 1초에 12장. 이모티콘은 8~12fps, 부드러운 애니는 24fps. 처음엔 <b>12fps</b>로 연습해요!</div>`;
  bindSelButtons($('#aSel'));
  $('#aFps').oninput = e => { A.fps = +e.target.value; $('#aFpsV').textContent = A.fps + 'fps'; ST.changed = true; if (ST.playing) { stopPlay(); startPlay(); } updTimeline(); };
  $('#aFm').onclick = () => { setFrameCount(A.frames - 1); rAnim(); }; $('#aFp').onclick = () => { setFrameCount(A.frames + 1); rAnim(); };
  $$('#aLoop button').forEach(b => { b.classList.toggle('on', b.dataset.v === (A.loop || 'loop')); b.onclick = () => { A.loop = b.dataset.v; ST.changed = true; rAnim(); }; });
  $('#aOn').onclick = () => { ST.onion = !ST.onion; ST.dirty = true; rAnim(); updTimeline(); };
  $('#aPath').onclick = () => { ST.path = !ST.path; ST.dirty = true; rAnim(); };
  $('#aX').onclick = () => { closeSheets(); if (curLayer().kind !== 'part') { const i = ST.page.layers.findIndex(l => l.kind === 'part'); if (i >= 0) ST.page.active = i; else { toast('먼저 파트 레이어를 만들어요'); return; } } setTool('xform'); };
  $('#aNP').onclick = () => { withStructHist(() => { const l = newAnimLayer('part', '파트 ' + (ST.page.layers.length + 1)); ST.page.layers.splice(ST.page.active + 1, 0, l); ST.page.active++; }); closeSheets(); setTool('brush'); toast('🔑 새 파트에 그림을 그린 다음, ✥ 파트 움직이기로 움직여요!', 3000); };
  $('#aNF').onclick = () => { withStructHist(() => { const l = newAnimLayer('frames', '그림 ' + (ST.page.layers.length + 1)); ST.page.layers.splice(ST.page.active + 1, 0, l); ST.page.active++; }); setFrame(ST.frame); closeSheets(); };
  $('#aConv').onclick = () => { const l = curLayer(); if (l.kind === 'part') { toast('이미 파트예요'); return; } withStructHist(() => { const src = l.cels[ST.frame]; const c = mkCanvas(ST.doc.w, ST.doc.h); c.getContext('2d').drawImage(src, 0, 0); l.kind = 'part'; l.canvas = c; l.ctx = c.getContext('2d'); l.keys = []; l.pivot = { x: ST.doc.w / 2, y: ST.doc.h / 2 }; l.cels = null; l.used = null; }); const bb = partBBox(l); if (!bb.empty) l.pivot = { x: bb.x + bb.w / 2, y: bb.y + bb.h / 2 }; closeSheets(); setTool('xform'); toast('🔄 지금 프레임 그림으로 파트를 만들었어요'); };
  $('#aKey').onclick = () => { if (curLayer().kind !== 'part') { toast('파트 레이어를 먼저 골라요'); return; } closeSheets(); openKeyEditor(); };
  $('#aGif').onclick = () => { closeSheets(); exportGIF(false); }; $('#aGifT').onclick = () => { closeSheets(); exportGIF(true); };
  $('#aSprite').onclick = () => { closeSheets(); exportSprite(); }; $('#aPng').onclick = () => { closeSheets(); exportPage(0); };
  const ex = $('#aEx'); ANIM_EXAMPLES.forEach(E => { const b = document.createElement('button'); b.className = 'gb'; b.innerHTML = `<i>${E.em}</i>${E.name}<small style="color:#aaa;font-size:10.5px">${LVN[EX_LV[E.id] || 2]} · ${E.kind === 'key' ? '키프레임' : '한 장씩'}</small>`; b.onclick = () => confirmBox(`'${E.name}' 예제를 새 작품으로 열까요?`, '열기', () => { closeSheets(); leaveEditor(() => startExample(E.id)); }); ex.appendChild(b); });
}

/* ---------- GIF encoder ---------- */
function buildPalette(frames, transparent) {
  const hist = new Uint32Array(32768); for (const fr of frames) { const d = fr.data; for (let i = 0; i < d.length; i += 4) { if (transparent && d[i + 3] < 128) continue; hist[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]++; } }
  const cols = []; for (let i = 0; i < 32768; i++) if (hist[i]) cols.push([(i >> 10) & 31, (i >> 5) & 31, i & 31, hist[i]]);
  const maxC = transparent ? 255 : 256; let boxes = [cols];
  while (boxes.length < maxC) {
    let bi = -1, bs = 0, ax = 0; boxes.forEach((b, i) => { if (b.length < 2) return; for (let c = 0; c < 3; c++) { let mn = 99, mx = -1; b.forEach(q => { if (q[c] < mn) mn = q[c]; if (q[c] > mx) mx = q[c]; }); const sc = (mx - mn) * Math.log(1 + b.reduce((s, q) => s + q[3], 0)); if (sc > bs) { bs = sc; bi = i; ax = c; } } });
    if (bi < 0) break; const b = boxes[bi].sort((p, q) => p[ax] - q[ax]); const tot = b.reduce((s, q) => s + q[3], 0); let acc = 0, cut = 1; for (let i = 0; i < b.length - 1; i++) { acc += b[i][3]; if (acc >= tot / 2) { cut = i + 1; break; } }
    boxes.splice(bi, 1, b.slice(0, cut), b.slice(cut));
  }
  const pal = boxes.filter(b => b.length).map(b => { let r = 0, g = 0, bb = 0, n = 0; b.forEach(q => { r += q[0] * q[3]; g += q[1] * q[3]; bb += q[2] * q[3]; n += q[3]; }); return [Math.round(r / n * 255 / 31), Math.round(g / n * 255 / 31), Math.round(bb / n * 255 / 31)]; });
  if (transparent) pal.unshift([255, 255, 255]); while (pal.length < 256) pal.push([0, 0, 0]); return pal;
}
function gifLZW(idx) {
  const minCode = 8, clear = 256, eoi = 257; let codeSize = 9, next = 258; const dict = new Map(); const out = []; let cur = 0, bits = 0;
  const emit = c => { cur |= c << bits; bits += codeSize; while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; } };
  emit(clear); let prefix = idx[0];
  for (let i = 1; i < idx.length; i++) { const k = idx[i], key = (prefix << 8) | k; const v = dict.get(key); if (v !== undefined) { prefix = v; continue; } emit(prefix); if (next === 4096) { emit(clear); dict.clear(); codeSize = 9; next = 258; } else { if (next >= (1 << codeSize)) codeSize++; dict.set(key, next++); } prefix = k; }
  emit(prefix); emit(eoi); if (bits > 0) out.push(cur & 255); return out;
}
function encodeGIF(frames, w, h, delayCs, transparent) {
  const pal = buildPalette(frames, transparent); const start = transparent ? 1 : 0; const cache = new Int16Array(32768).fill(-1);
  const near = key => { let c = cache[key]; if (c >= 0) return c; const r = ((key >> 10) & 31) * 8.2, g = ((key >> 5) & 31) * 8.2, b = (key & 31) * 8.2; let bd = 1e9; for (let i = start; i < 256; i++) { const p = pal[i]; const d = (p[0] - r) ** 2 * .3 + (p[1] - g) ** 2 * .59 + (p[2] - b) ** 2 * .11; if (d < bd) { bd = d; c = i; } } cache[key] = c; return c; };
  const B = []; const str = s => { for (let i = 0; i < s.length; i++) B.push(s.charCodeAt(i)); }; const u16 = v => B.push(v & 255, (v >> 8) & 255);
  str('GIF89a'); u16(w); u16(h); B.push(0xF7, 0, 0); pal.forEach(p => B.push(p[0], p[1], p[2]));
  B.push(0x21, 0xFF, 11); str('NETSCAPE2.0'); B.push(3, 1, 0, 0, 0);
  for (const fr of frames) {
    const d = fr.data, n = w * h, idx = new Uint8Array(n);
    for (let i = 0; i < n; i++) { const o = i * 4; if (transparent && d[o + 3] < 128) idx[i] = 0; else idx[i] = near(((d[o] >> 3) << 10) | ((d[o + 1] >> 3) << 5) | (d[o + 2] >> 3)); }
    B.push(0x21, 0xF9, 4, transparent ? (2 << 2) | 1 : (1 << 2), delayCs & 255, (delayCs >> 8) & 255, 0, 0);
    B.push(0x2C); u16(0); u16(0); u16(w); u16(h); B.push(0);
    B.push(8); const data = gifLZW(idx); for (let i = 0; i < data.length; i += 255) { const ch = data.slice(i, i + 255); B.push(ch.length); for (const v of ch) B.push(v); } B.push(0);
  }
  B.push(0x3B); return new Uint8Array(B);
}
function animFrameOrder() { const N = ST.doc.anim.frames; const o = []; for (let i = 0; i < N; i++) o.push(i); if (ST.doc.anim.loop === 'pingpong') for (let i = N - 2; i > 0; i--) o.push(i); return o; }
function renderAnimFrame(f, transparent, scale = 1) { const keep = ST.frame; setFrame(f, true); const c = mkCanvas(ST.doc.w * scale, ST.doc.h * scale), x = c.getContext('2d'); x.scale(scale, scale); compositePage(ST.page, x, { bg: !transparent, frame: f }); setFrame(keep, true); return c; }
async function exportGIF(transparent) {
  if (FLOAT) commitFloat(); if (STROKE) endStroke(); stopPlay(); toast('🎞️ GIF 만드는 중... 잠깐만요!', 4000); await new Promise(r => setTimeout(r, 50));
  const s = Math.min(1, 720 / Math.max(ST.doc.w, ST.doc.h)); const order = animFrameOrder(); const frames = order.map(f => { const c = renderAnimFrame(f, transparent, s); return c.getContext('2d').getImageData(0, 0, c.width, c.height); });
  const bytes = encodeGIF(frames, frames[0].width, frames[0].height, Math.max(2, Math.round(100 / ST.doc.anim.fps)), transparent);
  const blob = new Blob([bytes], { type: 'image/gif' }); markMission('gif');
  await saveFile(`${safeName(ST.doc.title)}.gif`, blob, [blob]);
  return blob;
}
async function exportSprite() {
  const N = ST.doc.anim.frames, cols = Math.min(N, 6), rows = Math.ceil(N / cols), s = Math.min(1, 300 / ST.doc.w); const w = ST.doc.w * s, h = ST.doc.h * s;
  const c = mkCanvas(w * cols, h * rows), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  for (let f = 0; f < N; f++) { x.drawImage(renderAnimFrame(f, false, s), (f % cols) * w, Math.floor(f / cols) * h); x.fillStyle = '#ff7aa8'; x.font = '16px Jua'; x.fillText(String(f + 1), (f % cols) * w + 6, Math.floor(f / cols) * h + 20); x.strokeStyle = '#ddd'; x.strokeRect((f % cols) * w, Math.floor(f / cols) * h, w, h); }
  const b = await toBlob(c); saveFile(`${safeName(ST.doc.title)}_프레임.png`, b, [b]);
}
let PV_TIMER = null;
function openAnimPreview() {
  stopPlay(); const D = ST.doc; $('#pvTitle').textContent = D.title; const strip = $('#pvStrip'); strip.innerHTML = '';
  $$('.screen').forEach(s => s.classList.remove('active')); $('#preview').classList.add('active');
  const s = Math.min(1, 720 / D.w); const frames = animFrameOrder().map(f => renderAnimFrame(f, false, s));
  const cv = mkCanvas(frames[0].width, frames[0].height); cv.style.cssText = 'width:100%;display:block;background:#fff'; strip.appendChild(cv);
  strip.insertAdjacentHTML('beforeend', `<div class="end">🔁 계속 반복 재생 중 · ${D.anim.fps}fps · ${D.anim.frames}프레임<br><small>💾 버튼을 누르면 GIF로 저장돼요</small></div>`);
  let i = 0; const x = cv.getContext('2d'); clearInterval(PV_TIMER); PV_TIMER = setInterval(() => { if (!$('#preview').classList.contains('active')) { clearInterval(PV_TIMER); return; } x.clearRect(0, 0, cv.width, cv.height); x.drawImage(frames[i], 0, 0); i = (i + 1) % frames.length; }, 1000 / D.anim.fps);
  markMission('preview');
}
