/* ================= EDITOR UI ================= */
let OPEN_SHEET = null;
function openSheet(id) { closeSheets(true); OPEN_SHEET = id; const s = $('#' + id); renderSheet(id); s.classList.add('open'); $('#scrim').classList.add('on'); }
function closeSheets(keep) { $$('.sheet.open').forEach(s => s.classList.remove('open')); $('#scrim').classList.remove('on'); if (!keep) OPEN_SHEET = null; }
function refreshOpenSheet() { if (OPEN_SHEET && $('#' + OPEN_SHEET).classList.contains('open')) renderSheet(OPEN_SHEET); }
function renderSheet(id) { ({ shBrush: rBrush, shEraser: rEraser, shFill: rFill, shColor: rColor, shLayers: rLayers, shToon: rToon, shMore: rMore, shMenu: rMenu, shPages: rPages, shAnim: rAnim })[id](); }
function showHint(t, btn, fn) { $('#hintText').textContent = t; const b = $('#hintBtn'); b.textContent = btn || '취소'; b.onclick = () => { hideHint(); ST.placing = null; if (fn) fn(); }; $('#hintBar').style.display = 'flex'; }
function hideHint() { $('#hintBar').style.display = 'none'; }
function place(text, fn) { closeSheets(); ST.placing = { fn }; showHint(text, '취소'); }

function setTool(t) {
  if (typeof FLOAT !== 'undefined' && FLOAT && t !== 'lasso') commitFloat();
  if (['brush', 'eraser', 'fill', 'shape'].includes(t)) ST.prevTool = t;
  ST.tool = t; ST.dirty = true;
  if (t !== 'select') { ST.sel = null; }
  if (t !== 'panel') ST.selPanel = -1;
  $$('#bottombar button').forEach(b => b.classList.remove('on'));
  const map = { brush: 'tbBrush', eraser: 'tbEraser', fill: 'tbMore', shape: 'tbMore', picker: 'tbMore', hand: 'tbMore', move: 'tbMore', select: 'tbToon', panel: 'tbToon', vp: 'tbMore', xform: 'tbToon', lasso: 'tbLasso' };
  if (map[t]) $('#' + map[t]).classList.add('on');
  const b = ALL_BRUSH[ST.brushId]; $('#tbBrushName').textContent = b.name;
  $('#sideSliders').style.display = ['brush', 'eraser', 'shape'].includes(t) ? 'flex' : 'none';
  updSliders(); showObjBar(); updPanelBar(); showSelBar(); if (t === 'lasso') return;
  const hints = { select: '말풍선·글자를 눌러서 옮기고, 동그라미를 끌어 크기·꼬리를 바꿔요', panel: '칸을 눌러 고르고 점을 끌어 모양을 바꿔요', vp: '소실점을 끌어서 옮기세요', move: '끌어서 레이어 그림을 옮겨요', hand: '끌어서 화면을 옮겨요', picker: '그림을 눌러 색을 가져와요', xform: '상자 안을 끌면 이동 · ⤡크기 · ↻회전 · ↔↕늘이기 · ✛기준점' };
  if (hints[t] && !(t === 'xform' && ST.guide)) showHint(hints[t], '완료', () => setTool(ST.prevTool || 'brush')); else if (!ST.placing) hideHint();
  ST.dirty = true;
}
function showObjBar() { const on = ST.tool === 'select' && !!selObj(); $('#objBar').style.display = on ? 'flex' : 'none'; if (on) hideHint(); else if (ST.tool === 'select') showHint('말풍선·글자를 눌러서 골라요', '완료', () => setTool(ST.prevTool || 'brush')); }
function updPanelBar() { $('#panelBar').style.display = ST.tool === 'panel' ? 'flex' : 'none'; }
function setColor(c) { ST.color = c; $('#tbSw').style.background = c; const i = ST.recent.indexOf(c); if (i >= 0) ST.recent.splice(i, 1); ST.recent.unshift(c); ST.recent = ST.recent.slice(0, 16); LS.set('recent', ST.recent); }

/* ---------- brush sheet ---------- */
function brushPreview(cv, b) {
  const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
  if (b.smudge || b.blur) { const g = x.createLinearGradient(0, 0, cv.width, 0); g.addColorStop(0, '#ff7aa8'); g.addColorStop(1, '#6cb8ff'); x.fillStyle = g; x.fillRect(6, 10, cv.width - 12, cv.height - 20); return; }
  const sym = ST.sym; ST.sym = 'none';
  const size = Math.min(b.size * 1.0, cv.height * .55);
  const S = { brush: b, color: b.eraser ? '#888' : '#2d2a3a', size, ctx: x, rng: seeded(7), pen: false, dist: 0, since: 0, last: null, rect: { x0: 0, y0: 0, x1: 0, y1: 0 } };
  const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push({ x: 8 + t * (cv.width - 16), y: cv.height / 2 + Math.sin(t * Math.PI * 2) * cv.height * .22, p: 1 }); }
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  for (let i = 0; i < pts.length; i++) stampSeg(S, i ? pts[i - 1] : null, pts[i], total);
  if (b.pattern) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tonePattern('#2d2a3a', x); x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
  ST.sym = sym;
}
function brushGrid(list, cur, onPick) {
  const wrap = document.createElement('div'); wrap.className = 'grid-btns';
  list.forEach(b => { const bt = document.createElement('button'); bt.className = 'gb' + (b.id === cur ? ' on' : ''); const cv = mkCanvas(124, 60); bt.appendChild(cv); bt.insertAdjacentHTML('beforeend', `<span>${b.icon} ${b.name}</span>`); brushPreview(cv, b); bt.onclick = () => onPick(b); wrap.appendChild(bt); });
  return wrap;
}
function rBrush() {
  const el = $('#shBrushBody'); el.innerHTML = ''; const b = ALL_BRUSH[ST.brushId];
  el.insertAdjacentHTML('beforeend', `<div class="row"><label>손떨림 보정</label><input type="range" min="0" max="10" step="1" value="${ST.stab}" id="stabR"><span class="val" id="stabV">${ST.stab}</span></div><div class="tipline"><b>💡 ${b.name}</b> — ${b.tip || ''}</div>`);
  $('#stabR').oninput = e => { ST.stab = +e.target.value; $('#stabV').textContent = ST.stab; LS.set('stab', ST.stab); };
  el.appendChild(brushGrid(BRUSHES, ST.brushId, bb => { ST.brushId = bb.id; setTool('brush'); rBrush(); }));
  el.insertAdjacentHTML('beforeend', `<div class="tipline" style="margin-top:12px">손떨림 보정을 높이면 선이 매끈해져요 (선화는 4~7 추천). 펜으로 그리면 누르는 힘에 따라 굵기가 바뀌어요.</div>`);
}
function rEraser() {
  const el = $('#shEraserBody'); el.innerHTML = '';
  el.appendChild(brushGrid(ERASERS, ST.eraserId, bb => { ST.eraserId = bb.id; setTool('eraser'); rEraser(); }));
  el.insertAdjacentHTML('beforeend', `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn" id="clrLayer">🧹 이 레이어 전부 지우기</button></div><div class="tipline">지우개는 <b>지금 고른 레이어</b>만 지워요. 안 지워지면 레이어를 확인해 보세요!</div>`);
  $('#clrLayer').onclick = () => { clearLayer(); closeSheets(); };
}
function clearLayer() { const L = curLayer(); if (!SCR.before || SCR.before.width !== ST.doc.w || SCR.before.height !== ST.doc.h) SCR.before = mkCanvas(ST.doc.w, ST.doc.h); const bx = SCR.before.getContext('2d'); bx.globalCompositeOperation = 'copy'; bx.drawImage(L.canvas, 0, 0); bx.globalCompositeOperation = 'source-over'; L.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h); histPixels(ST.page, L, SCR.before, { x: 0, y: 0, w: ST.doc.w, h: ST.doc.h }); ST.dirty = true; toast('레이어를 비웠어요 (↶로 되돌릴 수 있어요)'); }
function rFill() {
  const el = $('#shFillBody');
  el.innerHTML = `<div class="sh-sec">무엇으로 채울까?</div><div class="seg" id="fMode"><button data-v="color">🎨 지금 색</button><button data-v="tone">🔳 망점 톤</button></div>
  <div class="sh-sec">어디를 기준으로?</div><div class="seg" id="fRef"><button data-v="all">모든 레이어 보기</button><button data-v="layer">이 레이어만</button></div>
  <div class="row"><label>허용 범위</label><input type="range" min="0" max="120" value="${ST.fillTol}" id="fTol"><span class="val" id="fTolV">${ST.fillTol}</span></div>
  <div class="row"><label>틈 메우기</label><input type="range" min="0" max="4" value="${ST.fillGrow}" id="fGrow"><span class="val" id="fGrowV">${ST.fillGrow}px</span></div>
  <div class="tipline"><b>💡 깔끔하게 칠하는 법</b><br>① 선화 레이어 아래에 새 레이어를 만들어요<br>② 그 레이어를 고르고 '모든 레이어 보기'로 채우기<br>③ 선 사이가 하얗게 남으면 '틈 메우기'를 올려요<br>선이 끊어져 있으면 색이 밖으로 새요! 선을 꼭 이어 주세요.</div>`;
  const seg = (id, key) => { $$('#' + id + ' button').forEach(b => { b.classList.toggle('on', b.dataset.v === ST[key]); b.onclick = () => { ST[key] = b.dataset.v; rFill(); }; }); };
  seg('fMode', 'fillMode'); seg('fRef', 'fillRef');
  $('#fTol').oninput = e => { ST.fillTol = +e.target.value; $('#fTolV').textContent = ST.fillTol; };
  $('#fGrow').oninput = e => { ST.fillGrow = +e.target.value; $('#fGrowV').textContent = ST.fillGrow + 'px'; };
}

/* ---------- color sheet ---------- */
const PALETTES = [
  { n: '기본', c: ['#2d2a3a', '#ffffff', '#8a8a96', '#ff4d6d', '#ff8a3d', '#ffd23f', '#3ccf7a', '#2fa8ff', '#4b5bff', '#9b5cff', '#ff6fc8', '#8b5a3c'] },
  { n: '피부색', c: ['#fff1e6', '#ffe0cc', '#f9d0b4', '#f1bf9c', '#e0a47e', '#c98a63', '#a86b48', '#7c4a32', '#ffb3a7', '#f59b8c'] },
  { n: '머리색', c: ['#2b2230', '#4a3328', '#7a4e2d', '#b07a45', '#e9c27a', '#f5e2b0', '#c74b3a', '#ff9ac1', '#8ec5ff', '#b9a3ff', '#e8e8ee'] },
  { n: '파스텔', c: ['#ffd1dc', '#ffe5b4', '#fff5ba', '#d4f5d0', '#c9f0ff', '#d9d4ff', '#f6d3ff', '#ffe0f0', '#e2f7f1', '#fdf0e3'] },
  { n: '그림자용', c: ['#c9a7c7', '#b5a3d6', '#9d9fd1', '#e3a3a8', '#a79cb5', '#8f86a8', '#6f6a8a', '#d8b4a0'] },
  { n: '자연·배경', c: ['#87ceeb', '#5aa9e6', '#ffd59e', '#ff9e7a', '#7fc97f', '#4f9d69', '#a07855', '#d9c3a3', '#f4efe6', '#3a4a6b'] },
];
let HSV = [0, 0, 0];
function rColor() {
  const el = $('#shColorBody'); HSV = rgbToHsv(...hexToRgb(ST.color));
  el.innerHTML = `<div id="colorNow"><div class="big" id="cBig"></div><input id="cHex" value="${ST.color}" maxlength="7"><div style="flex:1"></div><button class="sbtn" id="cPick">🎯 스포이드</button></div>
  <div id="svBox"><canvas id="svCv" width="256" height="128"></canvas><div id="svKnob"></div></div><div id="hueBar"><div id="hueKnob"></div></div>
  <div class="sh-sec">최근 쓴 색</div><div class="swatches" id="cRecent"></div>
  <div class="sh-sec">어울리는 색 추천 <small style="color:#aaa;font-family:var(--fb)">(지금 색 기준)</small></div><div class="swatches" id="cHarm"></div>
  <div id="cPals"></div>`;
  const drawSV = () => { const c = $('#svCv'), x = c.getContext('2d'); const [r, g, b] = hsvToRgb(HSV[0], 1, 1); x.fillStyle = rgbToHex(r, g, b); x.fillRect(0, 0, 256, 128); let gr = x.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 128); gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, 256, 128); };
  const updKnobs = () => { $('#svKnob').style.left = (HSV[1] * 100) + '%'; $('#svKnob').style.top = ((1 - HSV[2]) * 100) + '%'; $('#hueKnob').style.left = (HSV[0] / 360 * 100) + '%'; $('#cBig').style.background = ST.color; $('#cHex').value = ST.color; $('#tbSw').style.background = ST.color; };
  const fromHSV = () => { const [r, g, b] = hsvToRgb(HSV[0], HSV[1], HSV[2]); ST.color = rgbToHex(r, g, b); updKnobs(); };
  const drag = (el2, fn) => { el2.onpointerdown = e => { el2.setPointerCapture(e.pointerId); el2._d = true; fn(e); }; el2.onpointermove = e => { if (el2._d) fn(e); }; el2.onpointerup = () => { el2._d = false; setColor(ST.color); harm(); }; };
  drag($('#svBox'), e => { const r = $('#svBox').getBoundingClientRect(); HSV[1] = clamp((e.clientX - r.left) / r.width, 0, 1); HSV[2] = clamp(1 - (e.clientY - r.top) / r.height, 0, 1); fromHSV(); });
  drag($('#hueBar'), e => { const r = $('#hueBar').getBoundingClientRect(); HSV[0] = clamp((e.clientX - r.left) / r.width, 0, .999) * 360; drawSV(); fromHSV(); });
  $('#cHex').onchange = e => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) { setColor(v.toLowerCase()); rColor(); } };
  $('#cPick').onclick = () => { closeSheets(); setTool('picker'); };
  const sw = (box, cols) => { box.innerHTML = ''; cols.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.onclick = () => { setColor(c); rColor(); }; box.appendChild(b); }); };
  sw($('#cRecent'), ST.recent);
  const harm = () => { const [h, s, v] = rgbToHsv(...hexToRgb(ST.color)); const mk = (hh, ss, vv) => rgbToHex(...hsvToRgb((hh + 360) % 360, clamp(ss, 0, 1), clamp(vv, 0, 1))); sw($('#cHarm'), [mk(h + 180, s, v), mk(h + 30, s, v), mk(h - 30, s, v), mk(h + 15 > 360 ? h : h + 12, s * 1.1 + .1, v * .72), mk(h, s * .45, Math.min(1, v * 1.15 + .1)), mk(h + 240 > 360 ? h - 120 : h + 120, s, v)]); };
  harm();
  const pals = $('#cPals'); PALETTES.forEach(p => { const d = document.createElement('div'); d.innerHTML = `<div class="sh-sec">${p.n}</div><div class="swatches"></div>`; sw(d.querySelector('.swatches'), p.c); pals.appendChild(d); });
  pals.insertAdjacentHTML('beforeend', `<div class="tipline" style="margin-top:12px"><b>💡 색 꿀팁</b> 그림자는 검정 대신 <b>보라·파랑</b>이 섞인 어두운 색을 쓰면 훨씬 예뻐요. 추천 색 중 4번째가 그림자용, 5번째가 빛(하이라이트)용이에요.</div>`);
  drawSV(); updKnobs();
}

/* ---------- layers sheet ---------- */
const BLENDS = [['source-over', '보통'], ['multiply', '곱하기 (그림자)'], ['screen', '스크린 (빛)'], ['overlay', '오버레이 (분위기)'], ['lighter', '더하기 (반짝)'], ['soft-light', '소프트 라이트'], ['color', '색만 바꾸기'], ['darken', '어둡게'], ['lighten', '밝게']];
function rLayers() {
  const el = $('#shLayersBody'), p = ST.page, L = curLayer();
  el.innerHTML = `<div class="layer-actions"><button data-a="add"><i>＋</i>새 레이어</button><button data-a="dup"><i>⧉</i>복제</button><button data-a="merge"><i>⤓</i>아래와 합치기</button><button data-a="photo"><i>🖼️</i>사진 넣기</button><button data-a="del"><i>🗑</i>삭제</button></div>
  <div class="layer-props"><div class="row"><label>이름</label><b style="flex:1;font-weight:400">${esc(L.name)}</b><button class="sbtn" data-a="rename">✏️</button><button class="sbtn" data-a="up">⬆</button><button class="sbtn" data-a="down">⬇</button></div>
  <div class="row"><label>불투명도</label><input type="range" min="0" max="100" value="${Math.round(L.opacity * 100)}" id="lOp"><span class="val" id="lOpV">${Math.round(L.opacity * 100)}%</span></div>
  <div class="row"><label>합성 방법</label><select class="dsel" id="lBl">${BLENDS.map(b => `<option value="${b[0]}" ${b[0] === L.blend ? 'selected' : ''}>${b[1]}</option>`).join('')}</select></div>
  <div class="tog" data-a="clip"><div>✂️ 클리핑 <small>아래 레이어 그림 안에만 칠해져요 (삐져나감 방지!)</small></div><div class="sw-tog ${L.clip ? 'on' : ''}"></div></div>
  <div class="tog" data-a="guide"><div>📐 따라 그리기용 <small>보면서 그리는 용도. 저장·내보내기에는 안 나와요</small></div><div class="sw-tog ${L.guide ? 'on' : ''}"></div></div>
  <div class="tog" data-a="lock"><div>🔒 투명 부분 잠금 <small>이미 그린 곳에만 색이 칠해져요</small></div><div class="sw-tog ${L.lock ? 'on' : ''}"></div></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="sbtn" data-a="flipH">↔ 좌우 뒤집기</button><button class="sbtn" data-a="flipV">↕ 상하 뒤집기</button><button class="sbtn" data-a="clear">🧹 비우기</button></div></div>
  <div id="lList"></div>
  <div class="tipline"><b>💡 레이어 순서 추천</b> (아래 → 위)<br>밑그림 → 밑색 → 그림자(곱하기+클리핑) → 빛(스크린+클리핑) → 선화 → 효과<br>밑그림은 불투명도를 30%쯤 낮추고 위에 새 레이어로 선화를 그려요!</div>`;
  const list = $('#lList');
  for (let i = p.layers.length - 1; i >= 0; i--) {
    const l = p.layers[i]; const d = document.createElement('div'); d.className = 'layer' + (i === p.active ? ' on' : '') + (l.clip ? ' clip' : '');
    const tc = mkCanvas(46, 46); const tx = tc.getContext('2d'); const sc = Math.min(46 / ST.doc.w, 46 / ST.doc.h); tx.drawImage(l.canvas, (46 - ST.doc.w * sc) / 2, (46 - ST.doc.h * sc) / 2, ST.doc.w * sc, ST.doc.h * sc);
    const th = document.createElement('div'); th.className = 'lt'; th.appendChild(tc); d.appendChild(th);
    d.insertAdjacentHTML('beforeend', `<div class="ln"><b>${l.kind === 'part' ? '🔑 ' : l.kind === 'frames' ? '🎞 ' : ''}${esc(l.name)}</b><small>${l.guide ? '📐 저장 안 됨 · ' : ''}${l.kind === 'part' ? '파트 · ' : l.kind === 'frames' ? '프레임 · ' : ''}${Math.round(l.opacity * 100)}% · ${(BLENDS.find(b => b[0] === l.blend) || ['', '보통'])[1].split(' ')[0]}${l.lock ? ' · 🔒' : ''}</small></div><button class="eye">${l.visible ? '👁' : '🚫'}</button>`);
    d.onclick = e => { if (e.target.classList.contains('eye')) { withStructHist(() => { l.visible = !l.visible; }); rLayers(); return; } p.active = i; rLayers(); ST.dirty = true; };
    list.appendChild(d);
  }
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => layerAction(b.dataset.a));
  let opSnap = null;
  $('#lOp').onpointerdown = () => { opSnap = pageSnap(p); };
  $('#lOp').oninput = e => { L.opacity = e.target.value / 100; $('#lOpV').textContent = e.target.value + '%'; ST.dirty = true; };
  $('#lOp').onchange = () => { if (opSnap) { const b = opSnap, a = pageSnap(p); pushHist({ undo() { pageRestore(p, b); }, redo() { pageRestore(p, a); } }); opSnap = null; } };
  $('#lBl').onchange = e => { withStructHist(() => { L.blend = e.target.value; }); rLayers(); };
}
function layerAction(a) {
  const p = ST.page, L = curLayer(), W = ST.doc.w, H = ST.doc.h; const anim = ST.doc.type === 'anim';
  if (anim && a === 'add') { withStructHist(() => { p.layers.splice(p.active + 1, 0, newAnimLayer('frames')); p.active++; }); setFrame(ST.frame); rLayers(); return; }
  if (anim && a === 'merge') { toast('애니메이션에서는 합치기 대신 레이어를 따로 써요'); return; }
  if (anim && a === 'dup') { withStructHist(() => { const n = newLayer(W, H, L.name + ' 복사'); Object.assign(n, { kind: L.kind, opacity: L.opacity, blend: L.blend, clip: L.clip, lock: L.lock }); if (L.kind === 'frames') { n.cels = {}; n.used = {}; Object.keys(L.cels).forEach(f => { if (!L.used[f]) return; const c = mkCanvas(W, H); c.getContext('2d').drawImage(L.cels[f], 0, 0); n.cels[f] = c; n.used[f] = true; }); } else { n.ctx.drawImage(L.canvas, 0, 0); n.keys = JSON.parse(JSON.stringify(L.keys || [])); n.pivot = { ...L.pivot }; } p.layers.splice(p.active + 1, 0, n); p.active++; }); setFrame(ST.frame); rLayers(); return; }
  if (a === 'add') { withStructHist(() => { p.layers.splice(p.active + 1, 0, newLayer(W, H)); p.active++; }); }
  else if (a === 'dup') { withStructHist(() => { const n = newLayer(W, H, L.name + ' 복사'); n.ctx.drawImage(L.canvas, 0, 0); Object.assign(n, { opacity: L.opacity, blend: L.blend, clip: L.clip, lock: L.lock }); p.layers.splice(p.active + 1, 0, n); p.active++; }); }
  else if (a === 'del') { if (p.layers.length <= 1) { toast('레이어가 하나는 있어야 해요'); return; } withStructHist(() => { p.layers.splice(p.active, 1); p.active = Math.max(0, p.active - 1); }); }
  else if (a === 'merge') {
    if (p.active === 0) { toast('맨 아래 레이어예요'); return; } const B = p.layers[p.active - 1];
    const bc = mkCanvas(W, H); bc.getContext('2d').drawImage(B.canvas, 0, 0);
    const x = B.ctx; x.save(); x.globalAlpha = L.opacity; x.globalCompositeOperation = L.clip ? 'source-atop' : L.blend; x.drawImage(L.canvas, 0, 0); x.restore();
    const ac = mkCanvas(W, H); ac.getContext('2d').drawImage(B.canvas, 0, 0); const idx = p.active, snapB = pageSnap(p);
    p.layers.splice(idx, 1); p.active = idx - 1; const snapA = pageSnap(p);
    pushHist({ undo() { B.ctx.clearRect(0, 0, W, H); B.ctx.drawImage(bc, 0, 0); pageRestore(p, snapB); gotoPageOf(p); }, redo() { B.ctx.clearRect(0, 0, W, H); B.ctx.drawImage(ac, 0, 0); pageRestore(p, snapA); gotoPageOf(p); } });
  }
  else if (a === 'up') { if (p.active < p.layers.length - 1) withStructHist(() => { const i = p.active; [p.layers[i], p.layers[i + 1]] = [p.layers[i + 1], p.layers[i]]; p.active++; }); }
  else if (a === 'down') { if (p.active > 0) withStructHist(() => { const i = p.active; [p.layers[i], p.layers[i - 1]] = [p.layers[i - 1], p.layers[i]]; p.active--; }); }
  else if (a === 'clip') { if (p.active === 0 && !L.clip) { toast('클리핑하려면 아래에 레이어가 있어야 해요'); return; } withStructHist(() => { L.clip = !L.clip; }); }
  else if (a === 'lock') withStructHist(() => { L.lock = !L.lock; });
  else if (a === 'guide') { withStructHist(() => { L.guide = !L.guide; }); toast(L.guide ? '📐 이 레이어는 저장할 때 빠져요' : '이 레이어도 저장돼요'); }
  else if (a === 'rename') { askText('레이어 이름', L.name, v => { withStructHist(() => { L.name = v || L.name; }); rLayers(); }); return; }
  else if (a === 'photo') { photoChoice(); return; }
  else if (a === 'clear') { clearLayer(); }
  else if (a === 'flipH' || a === 'flipV') { const bc = mkCanvas(W, H); bc.getContext('2d').drawImage(L.canvas, 0, 0); const x = L.ctx; x.save(); x.clearRect(0, 0, W, H); if (a === 'flipH') { x.translate(W, 0); x.scale(-1, 1); } else { x.translate(0, H); x.scale(1, -1); } x.drawImage(bc, 0, 0); x.restore(); histPixels(p, L, bc, { x: 0, y: 0, w: W, h: H }); }
  ST.dirty = true; rLayers();
}
let PHOTO_GUIDE = true;
function photoChoice() { openModal(`<h3>📷 사진 불러오기</h3><div class="size-grid"><button id="phG"><b>📐 따라 그리기용</b><small>반투명으로 깔고 위에 그려요. 저장할 땐 빠져요</small></button><button id="phA"><b>🖼 그림에 넣기</b><small>사진도 작품에 같이 저장돼요</small></button></div><div class="mbtns"><button class="btn sec sm" id="phX">취소</button></div>`); $('#phX').onclick = closeModal; $('#phG').onclick = () => { PHOTO_GUIDE = true; closeModal(); $('#fileImg').click(); }; $('#phA').onclick = () => { PHOTO_GUIDE = false; closeModal(); $('#fileImg').click(); }; }
function importPhotoLayer(file) {
  const url = URL.createObjectURL(file); const img = new Image();
  img.onload = () => { const W = ST.doc.w, H = ST.doc.h, p = ST.page; withStructHist(() => { const L = ST.doc.type === 'anim' ? newAnimLayer('part', '사진') : newLayer(W, H, '사진'); const s = Math.min(W / img.width, H / img.height); L.ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s); if (PHOTO_GUIDE) { L.opacity = .4; L.guide = true; L.name = '📐 따라 그릴 사진'; p.layers.splice(p.active, 0, L); const n = newLayer(W, H, '내 그림'); if (ST.doc.type === 'anim') { n.kind = 'frames'; n.cels = {}; n.used = {}; } p.layers.splice(p.active + 1, 0, n); p.active++; } else { p.layers.splice(p.active + 1, 0, L); p.active++; } }); if (ST.doc.type === 'anim') setFrame(ST.frame); URL.revokeObjectURL(url); ST.dirty = true; refreshOpenSheet(); toast(PHOTO_GUIDE ? '📐 반투명으로 깔았어요. "내 그림" 레이어에 따라 그려요!' : '🖼 사진을 넣었어요', 2800); };
  img.onerror = () => toast('사진을 열 수 없어요'); img.src = url;
}

/* ---------- toon sheet ---------- */
let TOON_TAB = 'panel', TPL_CAT = 'basic', TPL_SEL = null;
const SFX = ['쾅!', '쿵', '두근두근', '휙', '슝~', '와아아!', '헉!', '짜잔!', '꺄아!', '부들부들', '반짝', '쨍그랑', '뚜벅뚜벅', '빠직', '스윽', '탁!', '콰광!!', '꿀꺽', '흠칫', '깜짝!', '킥킥', '하하하', '……', '?!', '뿅', '사르르', '쪼르르', '야옹', '멍멍!', '쿨쿨'];
const MARKS = ['💢', '💦', '💧', '❤️', '💕', '💗', '✨', '❗', '❓', '⁉️', '💤', '🎵', '💡', '💫', '🔥', '⭐', '💥', '💨', '😳', '🌸', '⚡', '🍀', '👀', '💔'];
function rToon() {
  const el = $('#shToonBody');
  const tabs = [['panel', '▦ 칸 나누기'], ['bubble', '💬 말풍선'], ['text', '🔤 글자·효과음'], ['fx', '✳️ 효과'], ['mark', '💢 만화기호'], ['tips', '💡 꿀팁']];
  el.innerHTML = `<div class="tabs">${tabs.map(t => `<button data-t="${t[0]}" class="${t[0] === TOON_TAB ? 'on' : ''}">${t[1]}</button>`).join('')}</div><div id="toonInner"></div>`;
  el.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { TOON_TAB = b.dataset.t; rToon(); });
  const box = $('#toonInner');
  if (TOON_TAB === 'panel') {
    const ps = ST.page.pstyle;
    box.innerHTML = `<div class="tabs" id="tplCats">${TEMPLATE_CATS.map(c => `<button data-c="${c.id}" class="${c.id === TPL_CAT ? 'on' : ''}">${c.name}</button>`).join('')}</div><div id="tplDesc"></div><div class="tpl-grid" id="tplGrid"></div>
    <div class="sh-sec">칸 설정</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="sbtn acc" id="pEdit">✋ 칸 모양 고치기</button><button class="sbtn" id="pClear">✕ 칸 모두 지우기</button></div>
    <div class="row"><label>테두리 굵기</label><input type="range" min="0" max="16" value="${ps.width}" id="pW"><span class="val" id="pWV">${ps.width}</span></div>
    <div class="row"><label>칸 밖 색</label><div class="seg" id="pG"><button data-v="#ffffff">⬜ 흰색</button><button data-v="#111111">⬛ 검정</button><button data-v="#fdf3e1">📜 크림</button></div></div>
    <div class="tog" id="pMask"><div>칸 밖 가리기 <small>칸 밖으로 삐져나온 그림을 가려줘요</small></div><div class="sw-tog ${ps.mask ? 'on' : ''}"></div></div>
    <div class="tog" id="pClip"><div>칸 안에만 그리기 <small>선을 칸 안에서 시작하면 그 칸 밖으로 안 나가요</small></div><div class="sw-tog ${ST.clipPanel ? 'on' : ''}"></div></div>`;
    $$('#tplCats button').forEach(b => b.onclick = () => { TPL_CAT = b.dataset.c; TPL_SEL = null; rToon(); });
    const g = $('#tplGrid'); TEMPLATES.filter(t => t.cat === TPL_CAT).forEach(t => { const b = document.createElement('button'); b.className = 'tpl' + (TPL_SEL === t ? ' on' : ''); b.innerHTML = tplSVG(t) + esc(t.name); b.onclick = () => { TPL_SEL = t; rToon(); }; g.appendChild(b); });
    if (TPL_SEL) { $('#tplDesc').innerHTML = `<div class="tpl-desc"><b>${esc(TPL_SEL.name)}</b><br>${esc(TPL_SEL.desc)}<div style="margin-top:8px;display:flex;gap:6px"><button class="sbtn acc" id="tplUse">✔ 이 칸 쓰기</button><button class="sbtn" id="tplAddPg">＋ 새 화면에 쓰기</button></div></div>`; $('#tplUse').onclick = () => { applyTemplate(TPL_SEL); closeSheets(); }; $('#tplAddPg').onclick = () => { addPage(ST.doc.cur + 1); applyTemplate(TPL_SEL, true); closeSheets(); }; }
    else $('#tplDesc').innerHTML = `<div class="tipline">칸 모양을 눌러 보면 <b>언제 쓰면 좋은지</b> 알려줘요. 웹툰은 위에서 아래로 읽으니까 칸 사이 여백도 연출이에요!</div>`;
    $('#pEdit').onclick = () => { if (!ST.page.panels.length) { toast('먼저 칸 모양을 골라 주세요'); return; } closeSheets(); setTool('panel'); };
    $('#pClear').onclick = () => { withStructHist(() => { ST.page.panels = []; }); rToon(); };
    let wSnap = null; $('#pW').onpointerdown = () => wSnap = pageSnap(ST.page); $('#pW').oninput = e => { ps.width = +e.target.value; $('#pWV').textContent = ps.width; ST.dirty = true; }; $('#pW').onchange = () => { if (wSnap) { const p = ST.page, b = wSnap, a = pageSnap(p); pushHist({ undo() { pageRestore(p, b); }, redo() { pageRestore(p, a); } }); wSnap = null; } };
    $$('#pG button').forEach(b => { b.classList.toggle('on', b.dataset.v === ps.gutter); b.onclick = () => { withStructHist(() => { ps.gutter = b.dataset.v; }); rToon(); }; });
    $('#pMask').onclick = () => { withStructHist(() => { ps.mask = !ps.mask; }); rToon(); };
    $('#pClip').onclick = () => { ST.clipPanel = !ST.clipPanel; LS.set('clipPanel', ST.clipPanel); rToon(); };
  }
  else if (TOON_TAB === 'bubble') {
    box.innerHTML = `<div class="tipline">말풍선을 고르고 → 그림에서 넣을 곳을 탭! <b>주황 점</b>을 끌면 꼬리가 말하는 사람 쪽으로 가요.</div><div class="bub-grid" id="bubGrid"></div>
    <div class="tipline" style="margin-top:12px"><b>💡 말풍선 규칙</b><br>• 위→아래, 왼쪽→오른쪽 순서로 읽어요. 먼저 말하는 사람을 위에!<br>• 한 말풍선엔 2~3줄까지만. 길면 두 개로 나눠요.<br>• 꼬리는 말하는 사람 <b>입</b>을 향하게. 얼굴을 가리지 않게 해요.</div>`;
    const g = $('#bubGrid'); BUBBLES.forEach(bd => { const b = document.createElement('button'); b.className = 'gb'; const cv = mkCanvas(140, 92); b.appendChild(cv); b.insertAdjacentHTML('beforeend', `<span>${bd.name}<br><small style="color:#aaa">${bd.desc}</small></span>`); const o = { id: 'pv' + bd.id, kind: 'bubble', shape: bd.id, x: 70, y: 42, w: 92, h: 56, text: bd.id === 'narration' ? '그날 밤' : '안녕!', font: 'Jua', size: 20, strokeW: 2.5, tail: { x: -22, y: 44 } }; const x = cv.getContext('2d'); drawObject(x, o); b.onclick = () => place('말풍선을 넣을 곳을 탭하세요', pt => addBubble(pt, bd.id)); g.appendChild(b); });
  }
  else if (TOON_TAB === 'text') {
    box.innerHTML = `<div style="display:flex;gap:8px;margin-bottom:10px"><button class="sbtn acc" id="tAdd">🔤 글자 넣기</button><button class="sbtn" id="tSel">👆 말풍선·글자 고치기</button></div>
    <div class="sh-sec">효과음 (눌러서 넣기)</div><div class="sfx-grid" id="sfxGrid"></div>
    <div class="tipline" style="margin-top:12px"><b>💡 효과음 꿀팁</b> 큰 소리는 <b>크고 굵게</b>, 작은 소리는 작고 가늘게! 살짝 기울이면 움직임이 살아나요. 효과음은 말풍선 없이 그림 위에 바로 써요.</div>`;
    $('#tAdd').onclick = () => place('글자를 넣을 곳을 탭하세요', pt => addText(pt, { text: '글자', font: 'Jua', size: 48, color: ST.color }));
    $('#tSel').onclick = () => { closeSheets(); setTool('select'); };
    const g = $('#sfxGrid'); SFX.forEach(s => { const b = document.createElement('button'); b.textContent = s; b.onclick = () => place(`'${s}' 를 넣을 곳을 탭하세요`, pt => addText(pt, { text: s, font: 'Black Han Sans', size: 96, color: '#1b1b1b', outline: '#ffffff', outlineW: 9, rot: -.14, shadow: false, sfx: true })); g.appendChild(b); });
  }
  else if (TOON_TAB === 'fx') {
    box.innerHTML = `<div class="row"><label>양 (빽빽함)</label><input type="range" min="15" max="150" value="${FX.density}" id="fxD"><span class="val" id="fxDV">${FX.density}</span></div>
    <div class="row"><label>굵기·크기</label><input type="range" min="1" max="16" value="${FX.width}" id="fxW"><span class="val" id="fxWV">${FX.width}</span></div>
    <div class="row"><label>색</label><div class="seg" id="fxC"><button data-v="black">검정</button><button data-v="white">흰색</button><button data-v="mine">지금 색</button></div></div>
    <div class="row"><label>속도선 방향</label><div class="seg" id="fxA"><button data-v="0">⟷</button><button data-v="90">↕</button><button data-v="30">⟋</button><button data-v="-30">⟍</button></div></div>
    <div class="grid-btns" id="fxGrid"></div><div class="tipline" style="margin-top:12px">효과는 <b>새 레이어</b>로 만들어져서 마음에 안 들면 ↶ 되돌리거나 지우개로 지우면 돼요. 칸을 탭하면 그 칸 안에만 들어가요!</div>`;
    $('#fxD').oninput = e => { FX.density = +e.target.value; $('#fxDV').textContent = FX.density; };
    $('#fxW').oninput = e => { FX.width = +e.target.value; $('#fxWV').textContent = FX.width; };
    $$('#fxC button').forEach(b => { b.classList.toggle('on', b.dataset.v === FX.color); b.onclick = () => { FX.color = b.dataset.v; rToon(); }; });
    $$('#fxA button').forEach(b => { b.classList.toggle('on', +b.dataset.v === FX.angle); b.onclick = () => { FX.angle = +b.dataset.v; rToon(); }; });
    const g = $('#fxGrid'); EFFECTS.forEach(ef => { const b = document.createElement('button'); b.className = 'gb'; b.innerHTML = `<i>${ef.icon}</i>${ef.name}<small style="color:#aaa;font-size:10.5px">${ef.desc}</small>`; b.onclick = () => place(ef.tap, pt => applyEffect(ef.id, pt)); g.appendChild(b); });
  }
  else if (TOON_TAB === 'mark') {
    box.innerHTML = `<div class="tipline">만화기호는 감정을 한눈에 보여줘요! 💢 화남 · 💦 당황 · 😳 부끄 · 💤 졸림 · ❗ 깨달음</div><div class="emo-grid" id="emoGrid"></div>
    <div class="sh-sec">글자 기호</div><div class="sfx-grid" id="markTxt"></div>`;
    const g = $('#emoGrid'); MARKS.forEach(m => { const b = document.createElement('button'); b.textContent = m; b.onclick = () => place('기호를 넣을 곳을 탭하세요', pt => addText(pt, { text: m, font: 'Jua', size: 72 })); g.appendChild(b); });
    const t = $('#markTxt'); [['///', '#ff6f91'], ['…', '#222'], ['!?', '#222'], ['!!', '#e5383b'], ['?', '#222'], ['♪', '#222'], ['~♡', '#ff5c8a'], ['ㅠㅠ', '#3a86ff'], ['ㅋㅋ', '#222'], ['훌쩍', '#3a86ff']].forEach(([m, c]) => { const b = document.createElement('button'); b.textContent = m; b.style.color = c === '#222' ? '#fff' : c; b.onclick = () => place('넣을 곳을 탭하세요', pt => addText(pt, { text: m, font: 'Jua', size: 64, color: c, outline: '#fff', outlineW: 5 })); t.appendChild(b); });
  }
  else if (TOON_TAB === 'tips') {
    box.innerHTML = TOON_TIPS.map(t => `<div class="tipline">${t}</div>`).join('') + `<button class="sbtn acc" id="goSchool" style="margin-top:8px">🎓 배우기 탭에서 더 보기</button>`;
    $('#goSchool').onclick = () => { closeSheets(); leaveEditor(() => homeTab('school')); };
  }
}
function applyTemplate(t, fresh) { const p = ST.page; withStructHist(() => { p.panels = tplToPanels(t); }); ST.dirty = true; toast(`▦ '${t.name}' 칸을 넣었어요`); }
function addBubble(pt, shape) {
  const o = { id: uid(), kind: 'bubble', shape, x: pt.x, y: pt.y, w: 260, h: 160, rot: 0, text: shape === 'narration' ? '그날 아침...' : '대사를 써요', font: ST.lastFont || 'Jua', size: 34, color: null, fill: null, stroke: '#111', strokeW: shape === 'flash' ? 2 : 3, tail: shape === 'narration' ? null : { x: -70, y: 140 } };
  bubbleFitSize(o); if (o.tail) o.tail = { x: -o.w * .22, y: o.h * .5 + 60 };
  withStructHist(() => { ST.page.objects.push(o); }); setTool('select'); ST.sel = o.id; showObjBar(); editObjText(o, true);
}
function addText(pt, props) { const o = Object.assign({ id: uid(), kind: 'text', x: pt.x, y: pt.y, rot: 0, text: '글자', font: 'Jua', size: 48, color: '#111', outline: '#ffffff', outlineW: 0, shadow: false }, props); withStructHist(() => { ST.page.objects.push(o); }); setTool('select'); ST.sel = o.id; showObjBar(); if (props.text === '글자') editObjText(o, true); }
function objAction(a) {
  const o = selObj(); const p = ST.page; if (!o && a !== 'done') return;
  if (a === 'edit' || a === 'style') editObjText(o);
  else if (a === 'dup') { const n = JSON.parse(JSON.stringify(o)); n.id = uid(); n.x += 30; n.y += 30; withStructHist(() => p.objects.push(n)); ST.sel = n.id; }
  else if (a === 'front') { withStructHist(() => { p.objects = p.objects.filter(q => q !== o); p.objects.push(o); }); toast('맨 앞으로 왔어요'); }
  else if (a === 'del') { withStructHist(() => { p.objects = p.objects.filter(q => q.id !== o.id); }); ST.sel = null; }
  else if (a === 'done') { ST.sel = null; setTool(ST.prevTool || 'brush'); }
  ST.dirty = true; showObjBar();
}
function panelAction(a) {
  const p = ST.page;
  if (a === 'add') { const W = ST.doc.w, H = ST.doc.h; withStructHist(() => { p.panels.push({ pts: [[W * .2, H * .35], [W * .8, H * .35], [W * .8, H * .6], [W * .2, H * .6]], border: 'solid' }); }); ST.selPanel = p.panels.length - 1; }
  else if (a === 'del') { if (ST.selPanel < 0) { toast('지울 칸을 먼저 눌러요'); return; } withStructHist(() => { p.panels.splice(ST.selPanel, 1); }); ST.selPanel = -1; }
  else if (a === 'border') { if (ST.selPanel < 0) { toast('칸을 먼저 눌러요'); return; } const order = ['solid', 'thick', 'dashed', 'none'], names = { solid: '보통 테두리', thick: '굵은 테두리', dashed: '점선 테두리', none: '테두리 없음' }; withStructHist(() => { const q = p.panels[ST.selPanel]; q.border = order[(order.indexOf(q.border || 'solid') + 1) % 4]; toast(names[q.border]); }); }
  else if (a === 'mask') { withStructHist(() => { p.pstyle.mask = !p.pstyle.mask; }); toast(p.pstyle.mask ? '칸 밖을 가려요' : '칸 밖도 보여요'); }
  else if (a === 'done') setTool(ST.prevTool || 'brush');
  ST.dirty = true;
}

/* ---------- object edit modal ---------- */
function openModal(html) { $('#modal').innerHTML = html; polishModal($('#modal')); $('#modalWrap').classList.add('on'); $('#modal').scrollTop = 0; }
function polishModal(m) {
  const h = m.querySelector('h3'); if (h && h.firstChild && h.firstChild.nodeType === 3) h.firstChild.nodeValue = h.firstChild.nodeValue.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
  m.querySelectorAll('.size-grid button').forEach(b => { const sm = b.querySelector('small'); const mt = sm && sm.textContent.match(/(\d+)\s*[×x]\s*(\d+)/); if (!mt) return; const w = +mt[1], hh = +mt[2], k = 22 / Math.max(w, hh); const r = document.createElement('i'); r.className = 'ratio'; r.style.width = Math.max(8, Math.round(w * k)) + 'px'; r.style.height = Math.max(8, Math.round(hh * k)) + 'px'; b.classList.add('has-ratio'); b.prepend(r); });
}
function closeModal() { $('#modalWrap').classList.remove('on'); }
function askText(title, val, cb) { openModal(`<h3>${esc(title)}</h3><input type="text" id="askIn" value="${esc(val)}"><div class="mbtns"><button class="btn sec sm" id="askNo">취소</button><button class="btn sm" id="askOk">확인</button></div>`); setTimeout(() => $('#askIn').focus(), 50); $('#askNo').onclick = closeModal; $('#askOk').onclick = () => { closeModal(); cb($('#askIn').value.trim()); }; }
function confirmBox(msg, okLabel, cb) { openModal(`<h3>${esc(msg)}</h3><div class="mbtns"><button class="btn sec sm" id="cfNo">취소</button><button class="btn sm" id="cfOk">${esc(okLabel)}</button></div>`); $('#cfNo').onclick = closeModal; $('#cfOk').onclick = () => { closeModal(); cb(); }; }
const TXT_COLORS = ['#111111', '#ffffff', '#e5383b', '#ff5c8a', '#ff8a3d', '#ffd23f', '#3ccf7a', '#2fa8ff', '#6c4bff', '#8b5a3c'];
const FILL_COLORS = ['#ffffff', '#111111', '#fff7c2', '#ffe3ef', '#e3f2ff', '#eafbe7', '#f1ebff', 'transparent'];
function editObjText(o, isNew) {
  const p = ST.page, snap = JSON.stringify(p.objects); const bub = o.kind === 'bubble';
  const chips = (arr, cur, key) => arr.map(v => `<button class="chip ${v[0] === cur ? 'on' : ''}" data-k="${key}" data-v="${esc(v[0])}" style="${key === 'font' ? `font-family:'${v[0]}'` : ''}">${esc(v[1])}</button>`).join('');
  const colors = (arr, cur, key) => arr.map(c => `<button data-k="${key}" data-v="${c}" class="${c === cur ? 'on' : ''}" style="background:${c === 'transparent' ? 'repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/10px 10px' : c}"></button>`).join('');
  openModal(`<h3>${bub ? '💬 말풍선 고치기' : '🔤 글자 고치기'}</h3>
  <div class="mrow"><textarea id="oTxt" placeholder="여기에 써요 (줄바꿈 가능)">${esc(o.text)}</textarea></div>
  <div class="mrow"><label>글씨체</label><div class="chips">${chips(FONTS.map(f => [f.f, f.n]), o.font, 'font')}</div></div>
  <div class="mrow"><label>글자 크기 <b id="oSzV">${Math.round(o.size)}</b></label><input type="range" min="12" max="${bub ? 90 : 260}" value="${o.size}" id="oSz"></div>
  <div class="mrow"><label>글자 색</label><div class="colors">${colors(TXT_COLORS, o.color || (o.shape === 'dark' ? '#ffffff' : '#111111'), 'color')}</div></div>
  ${bub ? `<div class="mrow"><label>말풍선 모양</label><div class="chips">${chips(BUBBLES.map(b => [b.id, b.name]), o.shape, 'shape')}</div></div>
  <div class="mrow"><label>말풍선 색</label><div class="colors">${colors(FILL_COLORS, o.fill || (o.shape === 'dark' ? '#111111' : '#ffffff'), 'fill')}</div></div>
  <div class="mrow"><label>테두리 굵기 <b id="oSwV">${o.strokeW}</b></label><input type="range" min="0" max="10" step=".5" value="${o.strokeW}" id="oSw"></div>
  <div class="mrow"><label><input type="checkbox" id="oFit" checked> 글자에 맞춰 말풍선 크기 자동 조절</label></div>
  <div class="mrow"><label><input type="checkbox" id="oTail" ${o.tail ? 'checked' : ''}> 꼬리 보이기</label></div>`
      : `<div class="mrow"><label>테두리(외곽선) 색</label><div class="colors">${colors(TXT_COLORS, o.outline || '#ffffff', 'outline')}</div></div>
  <div class="mrow"><label>테두리 굵기 <b id="oOwV">${o.outlineW || 0}</b></label><input type="range" min="0" max="20" value="${o.outlineW || 0}" id="oOw"></div>
  <div class="mrow"><label><input type="checkbox" id="oBold" ${o.bold ? 'checked' : ''}> 굵게</label> &nbsp; <label><input type="checkbox" id="oSh" ${o.shadow ? 'checked' : ''}> 그림자</label></div>`}
  <div class="mbtns">${isNew ? '<button class="btn sec sm" id="oDel">🗑 빼기</button>' : ''}<button class="btn sm" id="oOk">완료</button></div>`);
  const upd = () => { if (bub && $('#oFit') && $('#oFit').checked) { const ow = o.w, oh = o.h; bubbleFitSize(o); if (o.tail) o.tail = { x: o.tail.x * o.w / ow, y: o.tail.y * o.h / oh }; } ST.dirty = true; };
  $('#oTxt').oninput = e => { o.text = e.target.value; upd(); };
  $('#oSz').oninput = e => { o.size = +e.target.value; $('#oSzV').textContent = o.size; upd(); };
  if ($('#oSw')) $('#oSw').oninput = e => { o.strokeW = +e.target.value; $('#oSwV').textContent = o.strokeW; upd(); };
  if ($('#oOw')) $('#oOw').oninput = e => { o.outlineW = +e.target.value; $('#oOwV').textContent = o.outlineW; upd(); };
  if ($('#oBold')) $('#oBold').onchange = e => { o.bold = e.target.checked; upd(); };
  if ($('#oSh')) $('#oSh').onchange = e => { o.shadow = e.target.checked; upd(); };
  if ($('#oTail')) $('#oTail').onchange = e => { o.tail = e.target.checked ? { x: -o.w * .22, y: o.h * .5 + 60 } : null; upd(); };
  $('#modal').querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const k = b.dataset.k, v = b.dataset.v; o[k] = v; if (k === 'font') { ST.lastFont = v; document.fonts && document.fonts.load(`20px "${v}"`).then(() => { upd(); }); }
    if (k === 'shape') { if (v === 'dark') { o.fill = '#111111'; o.color = '#ffffff'; } else if (o.fill === '#111111') { o.fill = '#ffffff'; o.color = '#111111'; } if (v === 'narration') o.tail = null; }
    $('#modal').querySelectorAll(`[data-k="${k}"]`).forEach(q => q.classList.toggle('on', q === b)); upd();
  });
  const finish = () => { closeModal(); const a = JSON.stringify(p.objects); if (a !== snap) { pushHist({ undo() { p.objects = JSON.parse(snap); gotoPageOf(p); }, redo() { p.objects = JSON.parse(a); gotoPageOf(p); } }); } ST.dirty = true; };
  $('#oOk').onclick = finish;
  if ($('#oDel')) $('#oDel').onclick = () => { p.objects = p.objects.filter(q => q.id !== o.id); ST.sel = null; finish(); showObjBar(); };
  if (isNew) setTimeout(() => { const t = $('#oTxt'); t.focus(); t.select(); }, 80);
}

/* ---------- more (tools) sheet ---------- */
function rMore() {
  const el = $('#shMoreBody');
  const tools = [['fill', '🪣', '채우기'], ['picker', '🎯', '스포이드'], ['hand', '✋', '화면 이동'], ['move', '✥', '레이어 옮기기'], ['select', '👆', '말풍선 고르기'], ['panel', '▦', '칸 고치기']];
  const shapes = [['line', '╱', '직선'], ['rect', '▭', '네모'], ['ellipse', '◯', '동그라미'], ['frect', '■', '꽉찬 네모'], ['fellipse', '●', '꽉찬 원']];
  el.innerHTML = `<div class="grid-btns">${tools.map(t => `<button class="gb ${ST.tool === t[0] ? 'on' : ''}" data-tool="${t[0]}"><i>${t[1]}</i>${t[2]}</button>`).join('')}</div>
  <div class="sh-sec">✂️ 선택해서 옮기기·변형</div><div class="grid-btns" id="mSel">${selSheetButtons()}</div>
  <div class="sh-sec">도형 (지금 브러시로 그려요)</div><div class="grid-btns">${shapes.map(t => `<button class="gb ${ST.tool === 'shape' && ST.shape === t[0] ? 'on' : ''}" data-shape="${t[0]}"><i>${t[1]}</i>${t[2]}</button>`).join('')}</div>
  <div class="sh-sec">보조 도구</div>
  <div class="tog" id="tRuler"><div>📏 직선자 <small>무엇을 그려도 곧은 직선이 돼요</small></div><div class="sw-tog ${ST.ruler ? 'on' : ''}"></div></div>
  <div class="row" style="margin-top:10px"><label>🪞 대칭자</label><div class="seg" id="tSym"><button data-v="none">끄기</button><button data-v="v">좌우</button><button data-v="h">상하</button><button data-v="quad">4방향</button><button data-v="k6">만화경</button></div></div>
  <div class="row"><label>▦ 격자</label><div class="seg" id="tGrid"><button data-v="none">끄기</button><button data-v="thirds">3분할 (구도)</button><button data-v="grid">바둑판</button></div></div>
  <div class="tog" id="tPersp"><div>🏙️ 원근 격자 <small>배경(방, 길, 건물) 그릴 때. 직선자와 같이 쓰면 선이 소실점에 착 붙어요</small></div><div class="sw-tog ${ST.persp ? 'on' : ''}"></div></div>
  ${ST.persp ? '<button class="sbtn" id="tVp" style="margin:6px 0">📍 소실점 옮기기</button>' : ''}
  <div class="tog" id="tPen"><div>✒️ 펜으로만 그리기 <small>손가락은 화면 이동만 (손바닥 닿아도 OK)</small></div><div class="sw-tog ${ST.penOnly ? 'on' : ''}"></div></div>
  <div class="sh-sec">화면</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="sbtn" id="tFit">🔍 화면 맞춤</button><button class="sbtn" id="tFlip">↔ 좌우 반전 보기 ${ST.view.flip < 0 ? '(켜짐)' : ''}</button><button class="sbtn" id="tRot">⟲ 회전 초기화</button><button class="sbtn" id="tRef">🖼️ 참고 이미지 창</button></div>
  <div class="tipline" style="margin-top:12px"><b>💡 손가락 제스처</b><br>두 손가락 벌리기/돌리기 = 확대·회전 · 두 손가락 톡 = 되돌리기 · 세 손가락 톡 = 다시하기 · 그리다가 꾹 누르고 있기 = 스포이드<br><b>좌우 반전 보기</b>로 그림을 뒤집어 보면 어색한 곳이 잘 보여요!</div>`;
  el.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { const t = b.dataset.tool; if (t === 'fill' && ST.tool === 'fill') { openSheet('shFill'); return; } if (t === 'fill') { closeSheets(); setTool('fill'); toast('🪣 칠할 곳을 톡! (도구 → 채우기를 한 번 더 누르면 설정)', 2200); return; } if (t === 'panel' && !ST.page.panels.length) { toast('먼저 웹툰 → 칸 나누기에서 칸을 넣어요'); return; } closeSheets(); setTool(t); });
  bindSelButtons($('#mSel'));
  el.querySelectorAll('[data-shape]').forEach(b => b.onclick = () => { ST.shape = b.dataset.shape; closeSheets(); setTool('shape'); toast('끌어서 도형을 그려요'); });
  $('#tRuler').onclick = () => { ST.ruler = !ST.ruler; rMore(); };
  $$('#tSym button').forEach(b => { b.classList.toggle('on', b.dataset.v === ST.sym); b.onclick = () => { ST.sym = b.dataset.v; ST.dirty = true; rMore(); }; });
  $$('#tGrid button').forEach(b => { b.classList.toggle('on', b.dataset.v === ST.grid); b.onclick = () => { ST.grid = b.dataset.v; ST.dirty = true; rMore(); }; });
  $('#tPersp').onclick = () => { ST.persp = !ST.persp; ST.dirty = true; rMore(); };
  if ($('#tVp')) $('#tVp').onclick = () => { closeSheets(); setTool('vp'); };
  $('#tPen').onclick = () => { ST.penOnly = !ST.penOnly; LS.set('penOnly', ST.penOnly); rMore(); };
  $('#tFit').onclick = () => { fitView(); closeSheets(); };
  $('#tFlip').onclick = () => { ST.view.flip *= -1; ST.dirty = true; rMore(); };
  $('#tRot').onclick = () => { ST.view.r = 0; ST.dirty = true; };
  $('#tRef').onclick = () => $('#fileRef').click();
}

/* ---------- menu ---------- */
function rMenu() {
  const el = $('#shMenuBody'); const toon = ST.doc.type === 'toon';
  el.innerHTML = `<div class="grid-btns">
   <button class="gb" data-m="save"><i>💾</i>저장하기</button>
   <button class="gb" data-m="png"><i>🖼️</i>이 화면 이미지로</button>
   ${toon ? '<button class="gb" data-m="long"><i>📜</i>웹툰 길게 이어서</button><button class="gb" data-m="each"><i>🗂️</i>화면마다 따로</button>' : ''}
   ${ST.doc.type === 'anim' ? '<button class="gb" data-m="gif"><i>🎞️</i>GIF 저장</button><button class="gb" data-m="gift"><i>✨</i>투명 GIF</button><button class="gb" data-m="sprite"><i>🧩</i>프레임 모음</button>' : ''}
   <button class="gb" data-m="title"><i>✏️</i>제목 바꾸기</button>
   <button class="gb" data-m="photo"><i>📷</i>사진 불러오기</button>
   <button class="gb" data-m="backup"><i>📦</i>백업 파일</button>
   <button class="gb" data-m="help"><i>❓</i>사용법</button>
   <button class="gb" data-m="tip"><i>💡</i>꿀팁</button>
   <button class="gb" data-m="home"><i>🏠</i>나가기</button></div>
   <div class="tipline" style="margin-top:12px">작품은 이 기기 브라우저에 저장돼요. 소중한 작품은 가끔 <b>📦 백업 파일</b>로도 저장해 두세요!</div>`;
  el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => menuAction(b.dataset.m));
}
function menuAction(m) {
  closeSheets(); if (FLOAT) commitFloat();
  if (m === 'save') saveDoc(true);
  else if (m === 'png') exportPage(ST.doc.cur);
  else if (m === 'long') exportLong();
  else if (m === 'gif') exportGIF(false); else if (m === 'gift') exportGIF(true); else if (m === 'sprite') exportSprite();
  else if (m === 'each') exportEach();
  else if (m === 'title') askText('작품 제목', ST.doc.title, v => { if (v) { ST.doc.title = v; ST.changed = true; toast('제목: ' + v); } });
  else if (m === 'photo') photoChoice();
  else if (m === 'backup') exportBackup(ST.doc);
  else if (m === 'help') showHelp(); else if (m === 'tip') $('#btnTip').onclick();
  else if (m === 'home') leaveEditor();
}
function showHelp() {
  openModal(`<h3>❓ 사용법</h3><div style="line-height:1.75;font-size:14.5px">
  <b>🖌 그리기</b> — 아래 브러시를 한 번 더 누르면 브러시 종류가 나와요. 왼쪽 막대로 <b>크기</b>와 <b>진하기</b>를 바꿔요.<br>
  <b>✌ 두 손가락</b> — 벌리면 확대, 돌리면 회전, 톡 치면 되돌리기. 세 손가락 톡은 다시하기.<br>
  <b>☝ 꾹 누르기</b> — 그리던 손가락을 가만히 누르고 있으면 그 색을 가져와요 (스포이드).<br>
  <b>✂️ 선택</b> — 도구 → 올가미/네모 선택으로 그림을 고르면 옮기기·크기·회전·늘이기·뒤집기, 모서리 변형, 휘기를 할 수 있어요. 애니에서는 ➡ 다음 장으로 이어 붙여요.<br>
  <b>📚 레이어</b> — 투명한 종이를 겹치는 거예요. 선화와 색칠을 다른 레이어에 하면 고치기 쉬워요.<br>
  <b>✂️ 클리핑</b> — 색칠 레이어 위에 그림자 레이어를 만들고 클리핑을 켜면 밖으로 안 삐져나가요.<br>
  <b>💬 웹툰</b> — 칸 나누기, 말풍선, 효과음, 집중선, 만화기호를 넣어요.<br>
  <b>📑 화면</b> — 웹툰은 여러 화면을 위아래로 이어 붙여요. 위의 ＋로 화면을 추가해요.<br>
  <b>👁 미리보기</b> — 진짜 웹툰처럼 스크롤해서 읽어봐요.<br>
  <b>🎞 애니메이션</b> — 아래 타임라인에서 프레임을 고르고 ▶로 재생! 🔑 파트는 ✥로 끌어서 움직이면 키가 자동으로 생겨요. ◆를 두 번 누르면 키를 고칠 수 있어요.</div><div class="mbtns"><button class="btn sm" id="hOk">알겠어요!</button></div>`);
  $('#hOk').onclick = closeModal;
}

/* ---------- pages ---------- */
function setPage(i, silent) { if (FLOAT) commitFloat(); ST.doc.cur = clamp(i, 0, ST.doc.pages.length - 1); ST.page = ST.doc.pages[ST.doc.cur]; ST.sel = null; ST.selPanel = -1; updPageNav(); ST.dirty = true; if (!silent) refreshOpenSheet(); showObjBar(); }
function updPageNav() { const n = ST.doc.pages.length; $('#pgLabel').textContent = (ST.doc.cur + 1) + '/' + n; $('#pageNav').style.display = ST.doc.type === 'toon' ? 'flex' : 'none'; $('#pgPrev').disabled = ST.doc.cur === 0; $('#pgNext').disabled = ST.doc.cur >= n - 1; }
function addPage(at, dupFrom) {
  const W = ST.doc.w, H = ST.doc.h; let p;
  if (dupFrom) { p = { id: uid(), layers: dupFrom.layers.map(l => { const n = newLayer(W, H, l.name); n.ctx.drawImage(l.canvas, 0, 0); Object.assign(n, { opacity: l.opacity, blend: l.blend, clip: l.clip, lock: l.lock, visible: l.visible }); return n; }), active: dupFrom.active, objects: JSON.parse(JSON.stringify(dupFrom.objects)).map(o => (o.id = uid(), o)), panels: JSON.parse(JSON.stringify(dupFrom.panels)), pstyle: { ...dupFrom.pstyle } }; }
  else p = newPage(W, H);
  if (ST.doc.pages.length >= 30) { toast('화면은 30개까지 만들 수 있어요'); return; }
  ST.doc.pages.splice(at, 0, p); ST.changed = true; setPage(at); toast(`📄 ${at + 1}번 화면`);
}
function rPages() {
  const el = $('#shPagesBody'); const D = ST.doc;
  el.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><button class="sbtn acc" data-g="after">＋ 뒤에 추가</button><button class="sbtn" data-g="before">＋ 앞에 추가</button><button class="sbtn" data-g="dup">⧉ 복제</button><button class="sbtn" data-g="up">◀ 앞으로</button><button class="sbtn" data-g="down">▶ 뒤로</button><button class="sbtn" data-g="del">🗑 삭제</button></div><div class="pg-list" id="pgList"></div><div class="tipline" style="margin-top:12px">화면들은 미리보기·저장할 때 <b>위에서 아래로 이어 붙어요</b>. 한 화면에 2~3칸 정도가 웹툰에서 읽기 좋아요.</div>`;
  const list = $('#pgList');
  D.pages.forEach((p, i) => { const d = document.createElement('div'); d.className = 'pg-item' + (i === D.cur ? ' on' : ''); const c = mkCanvas(100, 160); const x = c.getContext('2d'); x.scale(100 / D.w, 160 / D.h); compositePage(p, x, {}); d.appendChild(c); d.insertAdjacentHTML('beforeend', `<span>${i + 1}번</span>`); d.onclick = () => { setPage(i); rPages(); }; list.appendChild(d); });
  el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    const g = b.dataset.g, i = D.cur;
    if (g === 'after') addPage(i + 1); else if (g === 'before') addPage(i); else if (g === 'dup') addPage(i + 1, D.pages[i]);
    else if (g === 'up' && i > 0) { [D.pages[i - 1], D.pages[i]] = [D.pages[i], D.pages[i - 1]]; setPage(i - 1); ST.changed = true; }
    else if (g === 'down' && i < D.pages.length - 1) { [D.pages[i + 1], D.pages[i]] = [D.pages[i], D.pages[i + 1]]; setPage(i + 1); ST.changed = true; }
    else if (g === 'del') { if (D.pages.length <= 1) { toast('화면이 하나는 있어야 해요'); return; } confirmBox(`${i + 1}번 화면을 지울까요? (되돌릴 수 없어요)`, '지우기', () => { D.pages.splice(i, 1); ST.changed = true; setPage(Math.min(i, D.pages.length - 1)); rPages(); }); return; }
    rPages();
  });
}

/* ---------- tips ---------- */
const TOON_TIPS = [
  '<b>한 칸에 한 가지!</b> 한 칸에는 한 가지 행동이나 한 가지 대사만 넣으면 읽기 쉬워요.',
  '<b>여백 = 시간</b> 칸 사이가 멀수록 시간이 흐르거나 긴장되는 느낌이에요. 반전 직전엔 여백을 길게!',
  '<b>첫 칸은 장소 보여주기</b> 이야기가 시작될 때 어디인지 넓게 보여주면 독자가 바로 이해해요.',
  '<b>큰 칸 = 중요한 장면</b> 가장 보여주고 싶은 장면은 크게, 나머지는 작게.',
  '<b>얼굴은 가리지 않기</b> 말풍선이 인물 얼굴을 가리면 감정이 안 보여요.',
  '<b>대화 방향 지키기</b> A가 왼쪽, B가 오른쪽에 있었다면 계속 그 자리를 지켜요 (180도 규칙).',
  '<b>클로즈업으로 감정 전달</b> 슬프거나 놀란 순간엔 얼굴을 크게!',
  '<b>마지막 칸은 궁금하게</b> 다음 화가 보고 싶도록 끝내면 최고의 웹툰이에요.',
  '<b>배경은 간단하게도 OK</b> 폰 화면은 작아서, 배경을 다 그리지 않고 색이나 효과만 넣어도 좋아요.',
  '<b>선화 레이어는 따로!</b> 밑그림 위에 새 레이어를 만들어 G펜으로 따라 그리면 깔끔해요.',
  '<b>효과음은 그림의 일부</b> "쾅!"은 크고 기울게, "톡"은 작게. 소리 크기 = 글자 크기!',
  '<b>표정 먼저!</b> 이야기를 쓸 때 각 칸 인물의 표정을 먼저 정하면 감정이 살아나요.',
];
const DRAW_TIPS = [
  '🔄 그림을 좌우로 뒤집어 보면(도구 → 좌우 반전 보기) 어색한 곳이 잘 보여요!',
  '✏️ 밑그림은 연한 색으로 크게크게, 선화는 손떨림 보정을 올리고 천천히.',
  '✂️ 그림자는 새 레이어 + 곱하기 + 클리핑 = 절대 안 삐져나가요.',
  '🎨 그림자 색은 검정 대신 보라나 파랑이 섞인 색이 예뻐요.',
  '💡 빛은 한 방향에서! 빛이 오는 반대쪽에 그림자를 넣어요.',
  '👀 눈은 얼굴 가운데쯤에 있어요. 생각보다 아래!',
  '🖐 손 그리기가 어려우면 내 손을 보고 그려보세요. 사진 불러오기도 좋아요.',
  '🌈 색을 너무 많이 쓰면 복잡해요. 캐릭터마다 대표 색 1~2개를 정해 봐요.',
];
