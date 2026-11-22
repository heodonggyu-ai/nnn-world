/* ================= EFFECTS ================= */
const EFFECTS = [
  { id: 'focus', name: '집중선', icon: '✳️', desc: '탭한 곳을 중심으로 선이 모여요. 놀람, 등장, 깨달음!', tap: '중심이 될 곳을 탭하세요' },
  { id: 'impact', name: '충격 배경', icon: '💥', desc: '검은 배경 + 흰 집중선. 엄청난 충격!', tap: '중심을 탭하세요' },
  { id: 'speed', name: '속도선', icon: '💨', desc: '빠르게 움직이는 느낌. 방향을 골라요.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'gloom', name: '우울 세로선', icon: '🌧️', desc: '위에서 내려오는 선 = 시무룩, 충격받음.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'sparkle', name: '반짝 배경', icon: '✨', desc: '멋진 등장, 기쁨, 설렘.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'flower', name: '꽃 배경', icon: '🌸', desc: '순정만화처럼 두근두근.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'bubbles', name: '방울 배경', icon: '🫧', desc: '몽글몽글 귀여운 분위기.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'rain', name: '비', icon: '☔', desc: '슬픈 장면, 비 오는 날.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'snow', name: '눈', icon: '❄️', desc: '겨울, 조용한 장면.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'grad', name: '그늘 그라데이션', icon: '🌗', desc: '위가 어두워지는 무거운 분위기 (색 선택 가능).', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'tone', name: '망점 톤', icon: '🔳', desc: '만화책 같은 점 무늬로 칸 채우기.', tap: '효과를 넣을 칸을 탭하세요' },
  { id: 'blush', name: '부끄 빗금', icon: '😳', desc: '볼에 그리는 빗금 (탭한 곳에 작게).', tap: '볼 위치를 탭하세요' },
];
const FX = { density: 60, width: 5, color: 'black', angle: 0 };
function fxColor() { return FX.color === 'black' ? '#141414' : FX.color === 'white' ? '#ffffff' : ST.color; }
function applyEffect(id, pt) {
  const page = ST.page, W = ST.doc.w, H = ST.doc.h; const pi = panelAt(pt.x, pt.y); const poly = pi >= 0 ? page.panels[pi].pts : [[0, 0], [W, 0], [W, H], [0, H]]; const bb = polyBBox(poly);
  const eff = EFFECTS.find(e => e.id === id);
  withStructHist(() => {
    const L = newLayer(W, H, eff.name); const x = L.ctx; const rnd = seeded((Math.random() * 1e9) | 0);
    x.save(); if (id !== 'blush') { polyPath(x, poly); x.clip(); }
    const col = fxColor(), dens = FX.density / 60, lw = FX.width;
    if (id === 'focus' || id === 'impact') {
      if (id === 'impact') { x.fillStyle = '#111'; x.fillRect(bb.x, bb.y, bb.w, bb.h); }
      const c = id === 'impact' ? '#fff' : col; const R = Math.hypot(bb.w, bb.h) * 1.2; const inner = Math.min(bb.w, bb.h) * .28; const n = Math.round(110 * dens);
      x.fillStyle = c; for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r0 = inner * (.7 + rnd() * .6), hw = lw * (.4 + rnd() * 1.1) * 1.4; const ca = Math.cos(a), sa = Math.sin(a); x.beginPath(); x.moveTo(pt.x + ca * r0, pt.y + sa * r0); x.lineTo(pt.x + ca * R - sa * hw, pt.y + sa * R + ca * hw); x.lineTo(pt.x + ca * R + sa * hw, pt.y + sa * R - ca * hw); x.closePath(); x.fill(); }
    }
    else if (id === 'speed') {
      const a = FX.angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a); const span = Math.hypot(bb.w, bb.h); const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2; const n = Math.round(70 * dens); x.fillStyle = col;
      for (let i = 0; i < n; i++) { const off = (rnd() - .5) * span, along = (rnd() - .5) * span * .8, len = span * (.25 + rnd() * .55), hw = lw * (.2 + rnd() * .8); const mx = cx - sa * off + ca * along, my = cy + ca * off + sa * along; x.beginPath(); x.moveTo(mx - ca * len / 2, my - sa * len / 2); x.lineTo(mx - sa * hw, my + ca * hw); x.lineTo(mx + ca * len / 2, my + sa * len / 2); x.lineTo(mx + sa * hw, my - ca * hw); x.closePath(); x.fill(); }
    }
    else if (id === 'gloom') { x.fillStyle = col; const n = Math.round(bb.w / 6 * dens); for (let i = 0; i < n; i++) { const gx = bb.x + rnd() * bb.w, len = bb.h * (.15 + rnd() * .45), hw = lw * (.15 + rnd() * .3); x.beginPath(); x.moveTo(gx - hw, bb.y); x.lineTo(gx + hw, bb.y); x.lineTo(gx, bb.y + len); x.closePath(); x.fill(); } }
    else if (id === 'sparkle') { const n = Math.round(40 * dens); for (let i = 0; i < n; i++) { const sx = bb.x + rnd() * bb.w, sy = bb.y + rnd() * bb.h, s = (6 + rnd() * 26) * lw / 5; x.fillStyle = FX.color === 'mine' ? ST.color : ['#ffe066', '#ffffff', '#ffd1e8', '#c9e6ff'][(rnd() * 4) | 0]; x.strokeStyle = '#00000022'; x.lineWidth = 1; x.beginPath(); for (let k = 0; k < 8; k++) { const aa = k * Math.PI / 4, rr = k % 2 ? s * .18 : s; x.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); } x.closePath(); x.fill(); x.stroke(); } }
    else if (id === 'flower') { const n = Math.round(22 * dens); const cols = ['#ffd1e1', '#ffe3ec', '#ffc2d6', '#fff0b3', '#e5d9ff']; for (let i = 0; i < n; i++) { const fx = bb.x + rnd() * bb.w, fy = bb.y + rnd() * bb.h, s = (10 + rnd() * 26) * lw / 5, r0 = rnd() * 6; x.fillStyle = cols[(rnd() * cols.length) | 0]; x.strokeStyle = '#e08aa8'; x.lineWidth = 1.2; for (let k = 0; k < 5; k++) { const aa = r0 + k * Math.PI * 2 / 5; x.beginPath(); x.ellipse(fx + Math.cos(aa) * s * .55, fy + Math.sin(aa) * s * .55, s * .5, s * .32, aa, 0, 7); x.fill(); x.stroke(); } x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(fx, fy, s * .22, 0, 7); x.fill(); } }
    else if (id === 'bubbles') { const n = Math.round(30 * dens); for (let i = 0; i < n; i++) { const bx = bb.x + rnd() * bb.w, by = bb.y + rnd() * bb.h, r = (5 + rnd() * 30) * lw / 5; x.strokeStyle = FX.color === 'mine' ? ST.color : '#9fc9ff'; x.lineWidth = 2; x.fillStyle = '#e8f3ff88'; x.beginPath(); x.arc(bx, by, r, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.arc(bx - r * .35, by - r * .35, r * .2, 0, 7); x.fill(); } }
    else if (id === 'rain') { x.strokeStyle = FX.color === 'black' ? '#7d8ca3' : col; x.lineCap = 'round'; const n = Math.round(160 * dens); for (let i = 0; i < n; i++) { const rx = bb.x + rnd() * (bb.w + 100) - 50, ry = bb.y + rnd() * bb.h, len = 20 + rnd() * 40; x.lineWidth = lw * .3 * (.5 + rnd()); x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - len * .3, ry + len); x.stroke(); } }
    else if (id === 'snow') { const n = Math.round(120 * dens); for (let i = 0; i < n; i++) { const r = (1.5 + rnd() * 5) * lw / 5; x.fillStyle = '#ffffff'; x.strokeStyle = '#a9bdd6'; x.lineWidth = 1.2; x.beginPath(); x.arc(bb.x + rnd() * bb.w, bb.y + rnd() * bb.h, r, 0, 7); x.fill(); x.stroke(); } }
    else if (id === 'grad') { const c = FX.color === 'white' ? '#ffffff' : FX.color === 'mine' ? ST.color : '#1d1530'; const [r, g, b] = hexToRgb(c); const gr = x.createLinearGradient(0, bb.y, 0, bb.y + bb.h); gr.addColorStop(0, `rgba(${r},${g},${b},.85)`); gr.addColorStop(.6, `rgba(${r},${g},${b},.15)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(bb.x, bb.y, bb.w, bb.h); }
    else if (id === 'tone') { x.fillStyle = tonePattern(FX.color === 'black' ? '#888888' : col, x); x.fillRect(bb.x, bb.y, bb.w, bb.h); L.opacity = .8; }
    else if (id === 'blush') { x.strokeStyle = FX.color === 'black' ? '#ff6f91' : col; x.lineCap = 'round'; x.lineWidth = Math.max(2, lw * .6); const s = 18 + lw * 3; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(pt.x + k * s * .32 + s * .18, pt.y - s * .35); x.lineTo(pt.x + k * s * .32 - s * .18, pt.y + s * .35); x.stroke(); } }
    x.restore();
    page.layers.splice(page.active + 1, 0, L); page.active = page.active + 1;
  });
  ST.layerThumbDirty = true; toast(`${eff.icon} ${eff.name} 레이어를 만들었어요`);
}
