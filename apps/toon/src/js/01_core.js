'use strict';
/* ================= UTIL ================= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
function ctx2d(c) { return c.getContext('2d', { willReadFrequently: false }); }
function toast(msg, ms = 2000) { const t = $('#toast'); const tl = document.getElementById('timeline'); t.classList.toggle('hi', document.getElementById('editor').classList.contains('active')); const sc = document.getElementById('stepCard'); t.classList.toggle('hi2', !!(sc && sc.style.display === 'block' && !sc.classList.contains('mini'))); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms); }
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function hsvToRgb(h, s, v) { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; }
function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; }
function seeded(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
const LS = { get(k, d) { try { const v = localStorage.getItem('mnt_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('mnt_' + k, JSON.stringify(v)); } catch (e) { } } };

/* ================= BRUSHES ================= */
// stamp: hard|soft|pencil|crayon|square|sparkle|star|heart|dot
const BRUSHES = [
  { id: 'pencil', name: '연필', icon: '✏️', stamp: 'pencil', size: 4, max: 40, spacing: .18, flow: .85, pSize: .5, pAlpha: true, taper: 0, tip: '밑그림(스케치) 그릴 때 좋아요' },
  { id: 'sharp', name: '샤프', icon: '🖊️', stamp: 'hard', size: 2, max: 12, spacing: .2, flow: 1, pSize: .3, taper: 0, tip: '가늘고 일정한 선' },
  { id: 'gpen', name: 'G펜', icon: '🖋️', stamp: 'hard', size: 6, max: 40, spacing: .1, flow: 1, pSize: .8, taper: .35, tip: '웹툰 선화의 기본! 시작·끝이 뾰족해요' },
  { id: 'brushpen', name: '붓펜', icon: '🖌️', stamp: 'hard', size: 12, max: 60, spacing: .08, flow: 1, pSize: .95, taper: .6, tip: '굵기 변화가 커서 멋진 선' },
  { id: 'marker', name: '매직', icon: '🖍️', stamp: 'hard', size: 16, max: 120, spacing: .08, flow: 1, pSize: 0, taper: 0, tip: '밑색 칠하기, 굵기 일정' },
  { id: 'crayon', name: '크레용', icon: '🖍', stamp: 'crayon', size: 18, max: 80, spacing: .15, flow: .9, pSize: .3, taper: 0, tip: '거칠거칠 귀여운 느낌' },
  { id: 'water', name: '수채화', icon: '💧', stamp: 'soft', size: 40, max: 200, spacing: .08, flow: .09, pSize: .4, taper: 0, tip: '여러 번 겹쳐 칠하면 진해져요' },
  { id: 'air', name: '에어브러시', icon: '🌫️', stamp: 'soft', size: 90, max: 400, spacing: .06, flow: .035, pSize: 0, taper: 0, tip: '볼터치, 빛, 부드러운 그림자' },
  { id: 'hilite', name: '형광펜', icon: '🖊', stamp: 'square', size: 22, max: 80, spacing: .06, flow: 1, pSize: 0, taper: 0, alpha: .5, blend: 'multiply', tip: '겹쳐도 진해지지 않아요' },
  { id: 'tone', name: '톤 브러시', icon: '🔳', stamp: 'hard', size: 40, max: 200, spacing: .1, flow: 1, pSize: 0, taper: 0, pattern: 'dots', tip: '만화 망점 톤! 그림자나 옷 무늬에' },
  { id: 'sparkle', name: '반짝이', icon: '✨', stamp: 'sparkle', size: 22, max: 100, spacing: 1.4, flow: 1, pSize: 0, scatter: 1.2, sizeJit: .6, rotJit: 1, taper: 0, tip: '반짝반짝 효과' },
  { id: 'star', name: '별 도장', icon: '⭐', stamp: 'star', size: 24, max: 100, spacing: 1.6, flow: 1, pSize: 0, scatter: 1, sizeJit: .5, rotJit: 1, taper: 0, rainbow: true, tip: '알록달록 별 (무지개색)' },
  { id: 'heart', name: '하트 도장', icon: '💗', stamp: 'heart', size: 24, max: 100, spacing: 1.6, flow: 1, pSize: 0, scatter: 1, sizeJit: .5, rotJit: .4, taper: 0, tip: '하트 뿅뿅' },
  { id: 'dotline', name: '점선', icon: '┈', stamp: 'hard', size: 5, max: 30, spacing: 2.4, flow: 1, pSize: 0, taper: 0, tip: '점선, 바느질 선' },
  { id: 'smudge', name: '문지르기', icon: '👆', stamp: 'soft', size: 30, max: 150, spacing: .12, flow: .6, pSize: 0, taper: 0, smudge: true, tip: '손가락으로 색을 섞듯이' },
  { id: 'blur', name: '흐리게', icon: '🌀', stamp: 'soft', size: 40, max: 200, spacing: .25, flow: .5, pSize: 0, taper: 0, blur: true, tip: '경계를 부드럽게' },
];
const ERASERS = [
  { id: 'e_hard', name: '딱딱 지우개', icon: '🧽', stamp: 'hard', size: 20, max: 200, spacing: .1, flow: 1, pSize: .3, taper: 0, eraser: true },
  { id: 'e_soft', name: '말랑 지우개', icon: '☁️', stamp: 'soft', size: 60, max: 300, spacing: .08, flow: .25, pSize: 0, taper: 0, eraser: true },
  { id: 'e_pencil', name: '연필 지우개', icon: '✂️', stamp: 'hard', size: 4, max: 30, spacing: .15, flow: 1, pSize: .3, taper: 0, eraser: true },
];
const ALL_BRUSH = {}; BRUSHES.concat(ERASERS).forEach(b => ALL_BRUSH[b.id] = b);

const stampCache = new Map();
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
function makeStamp(kind, color) {
  const key = kind + color; if (stampCache.has(key)) return stampCache.get(key);
  const S = 128, c = mkCanvas(S, S), x = ctx2d(c), r = S / 2;
  x.fillStyle = color; x.strokeStyle = color;
  const rnd = seeded(hashStr(key));
  if (kind === 'hard' || kind === 'dot') { x.beginPath(); x.arc(r, r, r - 1, 0, 7); x.fill(); }
  else if (kind === 'soft') { const [R, G, B] = hexToRgb(color); const g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, `rgba(${R},${G},${B},1)`); g.addColorStop(.5, `rgba(${R},${G},${B},.55)`); g.addColorStop(1, `rgba(${R},${G},${B},0)`); x.fillStyle = g; x.fillRect(0, 0, S, S); }
  else if (kind === 'pencil' || kind === 'crayon') {
    x.beginPath(); x.arc(r, r, r - 1, 0, 7); x.fill();
    const id = x.getImageData(0, 0, S, S), d = id.data; const k = kind === 'crayon' ? .55 : .35;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3]) { const n = rnd(); d[i + 3] = d[i + 3] * (n < k ? n * .5 : 1); } }
    if (kind === 'crayon') { // clumps
      x.putImageData(id, 0, 0); x.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(rnd() * S, rnd() * S, 3 + rnd() * 9, 0, 7); x.fill(); }
      x.globalCompositeOperation = 'source-over';
    } else x.putImageData(id, 0, 0);
  }
  else if (kind === 'square') { x.fillRect(S * .38, 0, S * .24, S); }
  else if (kind === 'sparkle') {
    x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .22 : r * .98; x.lineTo(r + Math.cos(a) * rr, r + Math.sin(a) * rr); }
    x.closePath(); x.fill(); x.globalAlpha = .9; x.fillStyle = '#fff'; x.beginPath(); x.arc(r, r, r * .14, 0, 7); x.fill();
  }
  else if (kind === 'star') { starPath(x, r, r, r * .98, r * .42, 5); x.fill(); }
  else if (kind === 'heart') { heartPath(x, r, r * 1.04, r * .95); x.fill(); }
  stampCache.set(key, c); if (stampCache.size > 80) stampCache.delete(stampCache.keys().next().value);
  return c;
}
function starPath(x, cx, cy, R, r, n) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); }
function heartPath(x, cx, cy, s) {
  x.beginPath(); x.moveTo(cx, cy + s * .7);
  x.bezierCurveTo(cx - s * 1.1, cy - s * .05, cx - s * .55, cy - s * .95, cx, cy - s * .38);
  x.bezierCurveTo(cx + s * .55, cy - s * .95, cx + s * 1.1, cy - s * .05, cx, cy + s * .7); x.closePath();
}
let _tonePat = null;
function tonePattern(color, ctx) { const key = color; if (_tonePat && _tonePat.k === key) return ctx.createPattern(_tonePat.c, 'repeat'); const c = mkCanvas(8, 8), x = ctx2d(c); x.fillStyle = color; x.beginPath(); x.arc(2, 2, 1.6, 0, 7); x.arc(6, 6, 1.6, 0, 7); x.fill(); _tonePat = { k: key, c }; return ctx.createPattern(c, 'repeat'); }

/* ================= STATE ================= */
const ST = {
  doc: null, page: null,
  tool: 'brush', brushId: 'gpen', eraserId: 'e_hard',
  color: '#2d2a3a', recent: LS.get('recent', ['#2d2a3a', '#ffffff', '#ff7aa8', '#6cb8ff', '#ffd166', '#5fd3b5']),
  bstate: LS.get('bstate', {}), // per brush {size, alpha}
  stab: LS.get('stab', 3),
  sym: 'none', ruler: false, grid: 'none', persp: false, vp: null, penOnly: LS.get('penOnly', false), clipPanel: LS.get('clipPanel', true),
  fillRef: 'all', fillTol: 30, fillMode: 'color', fillGrow: 1,
  shape: 'line',
  view: { x: 0, y: 0, s: 1, r: 0, flip: 1 },
  frame: 0, playing: false, onion: true, path: true,
  sel: null, // selected object id
  selPanel: -1,
  dirty: true, changed: false,
};
function bs(id) { const b = ALL_BRUSH[id]; if (!ST.bstate[id]) ST.bstate[id] = { size: b.size, alpha: b.alpha != null ? b.alpha : 1 }; return ST.bstate[id]; }
function curBrush() { return ALL_BRUSH[ST.tool === 'eraser' ? ST.eraserId : ST.brushId]; }

/* ================= DOCUMENT ================= */
let layerSeq = 1;
function newLayer(w, h, name) { const c = mkCanvas(w, h); return { id: uid(), name: name || ('레이어 ' + (layerSeq++)), canvas: c, ctx: c.getContext('2d'), visible: true, opacity: 1, blend: 'source-over', clip: false, lock: false, kind: 'normal' }; }
function newPage(w, h, opts = {}) {
  const p = { id: uid(), layers: [], active: 0, objects: [], panels: [], pstyle: { width: 5, color: '#1b1b1b', mask: true, gutter: '#ffffff' } };
  if (opts.sketch !== false) { p.layers.push(newLayer(w, h, '밑그림')); }
  p.layers.push(newLayer(w, h, opts.lineName || '선화'));
  p.active = p.layers.length - 1;
  return p;
}
function newDoc(type, w, h, title) {
  layerSeq = 1;
  const d = { id: uid(), type, title: title || (type === 'toon' ? '나의 웹툰' : '나의 그림'), w, h, bg: '#ffffff', pages: [], cur: 0, created: Date.now() };
  d.pages.push(newPage(w, h));
  return d;
}
function curLayer() { const p = ST.page; return p.layers[p.active]; }

/* ================= HISTORY ================= */
const HIST = { list: [], idx: -1, max: 40 };
function pushHist(entry) {
  HIST.list.splice(HIST.idx + 1); HIST.list.push(entry);
  if (HIST.list.length > HIST.max) HIST.list.shift(); HIST.idx = HIST.list.length - 1;
  ST.changed = true; updUndo();
}
function undo() { if (typeof FLOAT !== 'undefined' && FLOAT) { cancelFloat(); toast('↶ 옮기기 전으로 돌렸어요', 1200); return; } if (HIST.idx < 0) return; const e = HIST.list[HIST.idx--]; e.undo(); afterHist(); }
function redo() { if (typeof FLOAT !== 'undefined' && FLOAT) commitFloat(); if (HIST.idx >= HIST.list.length - 1) return; const e = HIST.list[++HIST.idx]; e.redo(); afterHist(); }
function afterHist() { ST.changed = true; ST.dirty = true; updUndo(); refreshOpenSheet(); if (typeof updTimeline === 'function') updTimeline(); }
function clearHist() { HIST.list = []; HIST.idx = -1; updUndo(); }
function updUndo() { const u = $('#btnUndo'), r = $('#btnRedo'); if (u) { u.disabled = HIST.idx < 0; r.disabled = HIST.idx >= HIST.list.length - 1; } }
// pixel region history
function histPixels(page, layer, before, rect) {
  if (layer.kind === 'part') rect = { x: 0, y: 0, w: ST.doc.w, h: ST.doc.h };
  rect = intRect(rect, ST.doc.w, ST.doc.h); if (!rect) return;
  const c = layer.ctx, fr = ST.frame;
  const b = before.getContext('2d').getImageData(rect.x, rect.y, rect.w, rect.h);
  const a = c.getImageData(rect.x, rect.y, rect.w, rect.h);
  layer._v = (layer._v || 0) + 1; if (layer.kind === 'frames') layer.used[fr] = true;
  pushHist({ undo() { c.putImageData(b, rect.x, rect.y); layer._v++; histGoto(page, fr); }, redo() { c.putImageData(a, rect.x, rect.y); layer._v++; histGoto(page, fr); } });
  if (typeof updTimeline === 'function') updTimeline();
}
function histGoto(p, fr) { gotoPageOf(p); if (ST.doc && ST.doc.type === 'anim' && fr != null && fr !== ST.frame) setFrame(fr); }
function intRect(r, W, H) { let x0 = Math.floor(Math.max(0, r.x)), y0 = Math.floor(Math.max(0, r.y)), x1 = Math.ceil(Math.min(W, r.x + r.w)), y1 = Math.ceil(Math.min(H, r.y + r.h)); if (x1 <= x0 || y1 <= y0) return null; return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
// snapshot of page structure (layers list/props + objects + panels)
function pageSnap(p) { return { layers: p.layers.map(l => ({ l, visible: l.visible, opacity: l.opacity, blend: l.blend, clip: l.clip, lock: l.lock, name: l.name, kind: l.kind, guide: !!l.guide, cels: l.cels ? { ...l.cels } : null, used: l.used ? { ...l.used } : null, keys: l.keys ? JSON.stringify(l.keys) : null, pivot: l.pivot ? { ...l.pivot } : null })), active: p.active, objects: JSON.stringify(p.objects), panels: JSON.stringify(p.panels), pstyle: JSON.stringify(p.pstyle), anim: ST.doc && ST.doc.anim ? { ...ST.doc.anim } : null }; }
function pageRestore(p, s) { p.layers = s.layers.map(o => { const l = o.l; Object.assign(l, { visible: o.visible, opacity: o.opacity, blend: o.blend, clip: o.clip, lock: o.lock, name: o.name, kind: o.kind, guide: o.guide }); if (o.cels) { l.cels = { ...o.cels }; l.used = { ...o.used }; } if (o.keys) l.keys = JSON.parse(o.keys); if (o.pivot) l.pivot = { ...o.pivot }; return l; }); p.active = Math.min(s.active, p.layers.length - 1); p.objects = JSON.parse(s.objects); p.panels = JSON.parse(s.panels); p.pstyle = JSON.parse(s.pstyle); if (s.anim && ST.doc) { ST.doc.anim = { ...s.anim }; setFrame(Math.min(ST.frame, ST.doc.anim.frames - 1), true); } }
function withStructHist(fn) { const p = ST.page, b = pageSnap(p); fn(); const a = pageSnap(p); pushHist({ undo() { pageRestore(p, b); gotoPageOf(p); }, redo() { pageRestore(p, a); gotoPageOf(p); } }); ST.dirty = true; if (typeof updTimeline === 'function') updTimeline(); }
function gotoPageOf(p) { const i = ST.doc.pages.indexOf(p); if (i >= 0 && i !== ST.doc.cur) setPage(i, true); }
