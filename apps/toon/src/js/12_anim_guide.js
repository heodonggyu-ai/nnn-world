/* ================= ANIMATION EXAMPLES ================= */
function newAnimDoc(w, h, title, opt = {}) {
  layerSeq = 1;
  const d = { id: uid(), type: 'anim', title: title || '나의 애니메이션', w, h, bg: '#ffffff', cur: 0, created: Date.now(), anim: { fps: opt.fps || 12, frames: opt.frames || 12, loop: opt.loop || 'loop' }, pages: [{ id: uid(), layers: [], active: 0, objects: [], panels: [], pstyle: { width: 5, color: '#1b1b1b', mask: true, gutter: '#fff' } }] };
  return d;
}
function mkFramesL(d, name, cels = {}, opacity = 1) { const l = newLayer(d.w, d.h, name); l.kind = 'frames'; l.cels = {}; l.used = {}; l.opacity = opacity; Object.keys(cels).forEach(f => { const c = mkCanvas(d.w, d.h); cels[f](c.getContext('2d')); l.cels[f] = c; l.used[f] = true; }); if (!l.cels[0]) l.cels[0] = mkCanvas(d.w, d.h); l.canvas = l.cels[0]; l.ctx = l.canvas.getContext('2d'); return l; }
function mkPartL(d, name, draw, pivot, keys = []) { const l = newLayer(d.w, d.h, name); l.kind = 'part'; if (draw) draw(l.ctx); l.pivot = pivot || { x: d.w / 2, y: d.h / 2 }; l.keys = keys.map(k => ({ ...POSE0, ...k })); return l; }
// --- art helpers
const INK = '#2d2a3a';
function artBall(x, cx, cy, r, col = '#ff5c6c') { const g = x.createRadialGradient(cx - r * .35, cy - r * .35, r * .1, cx, cy, r); g.addColorStop(0, '#fff3f3'); g.addColorStop(.25, col); g.addColorStop(1, '#c22e48'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); x.fillStyle = '#ffffffcc'; x.beginPath(); x.ellipse(cx - r * .35, cy - r * .4, r * .22, r * .13, -.6, 0, 7); x.fill(); }
function artGround(x, d, y, label) { x.fillStyle = '#eaf6df'; x.fillRect(0, y, d.w, d.h - y); x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(0, y); x.lineTo(d.w, y); x.stroke(); if (label) { x.fillStyle = '#9ab48a'; x.font = '18px Jua'; x.fillText(label, 14, y + 30); } }
function artShadow(x, cx, cy, w) { x.fillStyle = '#00000040'; x.beginPath(); x.ellipse(cx, cy, w / 2, w * .1, 0, 0, 7); x.fill(); }
function artHeart(x, cx, cy, s, col = '#ff4d7d') { x.save(); x.translate(cx, cy); x.scale(s, s); x.beginPath(); heartPathRaw(x); x.restore(); x.fillStyle = col; x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); x.fillStyle = '#ffffffaa'; x.beginPath(); x.ellipse(cx - s * .45, cy - s * .35, s * .16, s * .1, -.7, 0, 7); x.fill(); }
function artStar(x, cx, cy, R, col = '#ffd23f') { starPath(x, cx, cy, R, R * .45, 5); x.fillStyle = col; x.fill(); x.lineWidth = 5; x.lineJoin = 'round'; x.strokeStyle = INK; x.stroke(); x.fillStyle = INK; x.beginPath(); x.arc(cx - R * .17, cy, R * .07, 0, 7); x.arc(cx + R * .17, cy, R * .07, 0, 7); x.fill(); x.lineWidth = 3; x.beginPath(); x.arc(cx, cy + R * .1, R * .1, .2, Math.PI - .2); x.stroke(); }
function artSlime(x, cx, by, w, h, col = '#6fd6a8') { x.beginPath(); x.moveTo(cx - w / 2, by); x.bezierCurveTo(cx - w / 2, by - h * .9, cx - w * .25, by - h * 1.1, cx, by - h); x.bezierCurveTo(cx + w * .25, by - h * 1.1, cx + w / 2, by - h * .9, cx + w / 2, by); x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); x.fillStyle = INK; x.beginPath(); x.ellipse(cx - w * .16, by - h * .5, 6, 9, 0, 0, 7); x.ellipse(cx + w * .16, by - h * .5, 6, 9, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - w * .16 + 2, by - h * .5 - 3, 2.5, 0, 7); x.arc(cx + w * .16 + 2, by - h * .5 - 3, 2.5, 0, 7); x.fill(); x.fillStyle = '#ffadc4'; x.beginPath(); x.ellipse(cx - w * .3, by - h * .35, 9, 5, 0, 0, 7); x.ellipse(cx + w * .3, by - h * .35, 9, 5, 0, 0, 7); x.fill(); x.fillStyle = '#ffffff99'; x.beginPath(); x.ellipse(cx - w * .25, by - h * .78, 12, 7, -.5, 0, 7); x.fill(); }
function artFace(x, cx, cy, r, o = {}) {
  x.fillStyle = o.col || '#ffe08a'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  x.fillStyle = '#ffadc4'; x.beginPath(); x.ellipse(cx - r * .55, cy + r * .25, r * .16, r * .09, 0, 0, 7); x.ellipse(cx + r * .55, cy + r * .25, r * .16, r * .09, 0, 0, 7); x.fill();
  x.lineWidth = 5; x.lineCap = 'round'; x.strokeStyle = INK;
  if (o.mouth === 'o') { x.fillStyle = '#c2445e'; x.beginPath(); x.ellipse(cx, cy + r * .42, r * .13, r * .18, 0, 0, 7); x.fill(); x.stroke(); }
  else if (o.mouth !== false) { x.beginPath(); x.arc(cx, cy + r * .22, r * .26, .25, Math.PI - .25); x.stroke(); }
  if (o.eyes) drawEyes(x, cx, cy, r, o.eyes, o.eyeStyle);
}
function drawEyes(x, cx, cy, r, st, style) {
  x.strokeStyle = style === 'guide' ? '#3a86ff' : INK; x.fillStyle = style === 'guide' ? '#3a86ff' : INK; x.lineWidth = 5; x.lineCap = 'round';
  [-1, 1].forEach(s => { const ex = cx + s * r * .35, ey = cy - r * .12; if (st === 'open') { x.beginPath(); x.ellipse(ex, ey, r * .1, r * .17, 0, 0, 7); style === 'guide' ? x.stroke() : x.fill(); if (style !== 'guide') { x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + r * .03, ey - r * .06, r * .04, 0, 7); x.fill(); x.fillStyle = INK; } } else if (st === 'half') { x.beginPath(); x.ellipse(ex, ey + r * .03, r * .11, r * .08, 0, Math.PI, 0, true); style === 'guide' ? x.stroke() : x.fill(); x.beginPath(); x.moveTo(ex - r * .13, ey); x.lineTo(ex + r * .13, ey); x.stroke(); } else { x.beginPath(); x.arc(ex, ey - r * .02, r * .12, .3, Math.PI - .3); x.stroke(); } });
}
function guideCircle(x, cx, cy, r, sx = 1, sy = 1, bottom = true, n) { x.save(); x.strokeStyle = '#3a86ff'; x.setLineDash([10, 8]); x.lineWidth = 4; x.beginPath(); x.ellipse(cx, bottom ? cy + r - r * sy : cy, r * sx, r * sy, 0, 0, 7); x.stroke(); x.restore(); if (n != null) { x.fillStyle = '#3a86ff'; x.font = '22px Jua'; x.fillText(n + '번', 16, 34); } }
const BALL_KEYS = [{ f: 0, y: 0, ease: 'in' }, { f: 6, y: 236, sx: .86, sy: 1.2, ease: 'linear' }, { f: 7, y: 272, sx: 1.35, sy: .68, ease: 'linear' }, { f: 8, y: 236, sx: .86, sy: 1.2, ease: 'out' }, { f: 14, y: 0 }];

const ANIM_EXAMPLES = [
  {
    id: 'ball_done', em: '🏀', name: '공 튀기기 (완성본 보기)', kind: 'key', desc: '애니메이션의 기본! 완성된 공 튀기기를 보고 원리를 배워요.',
    build() {
      const d = newAnimDoc(480, 480, '공 튀기기 완성본', { frames: 15 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '바닥', x => artGround(x, d, 420)));
      L.push(mkPartL(d, '그림자', x => artShadow(x, 240, 422, 90), { x: 240, y: 422 }, [{ f: 0, sx: .45, sy: .45, a: .5, ease: 'in' }, { f: 7, sx: 1.05, sy: 1.05, a: 1, ease: 'out' }, { f: 14, sx: .45, sy: .45, a: .5 }]));
      L.push(mkPartL(d, '공', x => artBall(x, 240, 110, 38), { x: 240, y: 148 }, BALL_KEYS)); d.pages[0].active = 2; return d;
    },
    steps: [
      { t: '아래 ▶ 버튼을 눌러 재생해 봐요! 공이 통통 튀죠? 다시 누르면 멈춰요.' },
      { t: '공 레이어의 보라색 점들 = 프레임마다 공이 있는 위치예요. <b>위쪽은 점이 촘촘</b>(느림), <b>아래쪽은 점이 넓어요</b>(빠름). 이게 진짜 공의 움직임!', f: 3 },
      { t: '8번 프레임을 보세요. 바닥에 닿는 순간 공이 <b>납작하게 찌그러졌어요</b>. 이게 애니메이션 1번 법칙 "찌그러짐과 늘어남"!', f: 7 },
      { t: '7번 프레임에선 공이 <b>세로로 길쭉</b>해요. 빨리 떨어질 때 늘어나 보이면 속도감이 생겨요.', f: 6 },
      { t: '그림자 레이어도 보세요. 공이 높으면 작고 연하게, 가까우면 크고 진하게! 작은 디테일이 진짜처럼 만들어요.', f: 0 },
      { t: '타임라인의 ◆(키)를 두 번 톡 누르면 키를 고칠 수 있어요. 8번 키의 "세로로 늘이기"를 100으로 바꾸고 재생해 보세요. 딱딱한 공이 돼요!' },
      { t: '마음에 들면 🎞 애니 → GIF로 저장! 다음엔 "공 튀기기 (직접 만들기)"에 도전해요 💪' },
    ]
  },
  {
    id: 'ball_diy', em: '⚽', name: '공 튀기기 (직접 만들기)', kind: 'key', desc: '키프레임으로 직접 공을 튀겨요. 3개의 키만 있으면 돼요!',
    build() {
      const d = newAnimDoc(480, 480, '내 공 튀기기', { frames: 15 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '바닥', x => artGround(x, d, 420, '바닥')));
      L.push(mkPartL(d, '공', x => artBall(x, 240, 110, 38, '#4fb3ff'), { x: 240, y: 148 })); d.pages[0].active = 1; return d;
    },
    steps: [
      { t: '지금은 공이 안 움직여요. 키프레임 3개로 움직여 볼게요! 화면에 보이는 <b>분홍 점선 상자</b>가 공 파트예요.', tool: 'xform' },
      { t: '<b>1번 프레임</b>: 공은 지금 위에 있어요. 타임라인 아래 <b>🔑 버튼</b>을 눌러 "시작 키"를 넣어요.', f: 0, tool: 'xform' },
      { t: '타임라인에서 <b>8번 칸</b>을 누르고, 공 상자 안을 잡고 <b>바닥까지 끌어내려요</b>. 끌면 자동으로 키(◆)가 생겨요!', f: 7, tool: 'xform' },
      { t: '<b>15번 칸</b>을 누르고 공을 다시 <b>처음 높이</b>로 올려요. (보라 점선을 참고!)', f: 14, tool: 'xform' },
      { t: '▶ 재생! 움직이긴 하는데... 둥둥 떠다니는 느낌이죠? 진짜 공은 <b>떨어질수록 빨라지고, 올라갈수록 느려져요</b>.' },
      { t: '<b>1번 칸의 ◆를 두 번 톡</b> → "점점 빠르게"를 골라요. (떨어지는 동안의 움직임)', f: 0 },
      { t: '<b>8번 칸의 ◆를 두 번 톡</b> → "점점 느리게"를 골라요. (올라가는 동안의 움직임). 재생하면 훨씬 공 같아요!', f: 7 },
      { t: '8번 키 창에서 <b>가로 130%, 세로 70%</b>로 바꿔 찌그러뜨려요. 그런데 다른 프레임에서도 찌그러져 보이죠?', f: 7 },
      { t: '<b>7번, 9번 칸</b>에서도 🔑를 눌러 키를 만들고 가로·세로 100%로 돌려놔요. 이제 바닥에서만 찌그러져요! 🎉', f: 6 },
      { t: '완성! ▶로 보고 🎞 애니 → GIF로 저장해요. 미션 "공 튀기기 완성"도 체크! 🏅' },
    ]
  },
  {
    id: 'ball_frames', em: '✏️', name: '공 튀기기 (한 장씩 그리기)', kind: 'frame', desc: '파란 가이드를 따라 12장을 직접 그려요. 진짜 애니메이터처럼!',
    build() {
      const d = newAnimDoc(480, 480, '한 장씩 공 튀기기', { frames: 12 }); const L = d.pages[0].layers; const tmp = { keys: BALL_KEYS.map(k => ({ ...POSE0, ...k })), pivot: { x: 240, y: 148 } };
      const cels = {}; for (let f = 0; f < 12; f++) { cels[f] = x => { const P = getPose(tmp, f * 14 / 12); guideCircle(x, 240, 110 + P.y, 38, P.sx, P.sy, true, f + 1); }; }
      L.push(mkPartL(d, '바닥', x => artGround(x, d, 420)));
      L.push(mkFramesL(d, '가이드 (따라 그려요)', cels, .45));
      L.push(mkFramesL(d, '내 그림')); d.pages[0].active = 2; return d;
    },
    steps: [
      { t: '파란 점선 동그라미 = 가이드예요. 지금 고른 레이어는 <b>"내 그림"</b>. 매직이나 G펜으로 동그라미를 따라 공을 그려요!', f: 0 },
      { t: '다 그렸으면 타임라인 <b>⏭</b>를 눌러 다음 프레임으로. 앞 프레임 그림이 <b>빨갛게 비쳐</b> 보이죠? 이게 <b>어니언 스킨</b>이에요.', f: 1 },
      { t: '12장 모두 그려요. 7번(바닥)에선 납작하게, 6·8번에선 길쭉하게! 빈 동그라미는 🪣 채우기로 칠하면 빨라요.' },
      { t: '▶ 재생해 봐요! 손으로 그린 선이 살짝 떨리는 게 손그림 애니의 매력이에요.' },
      { t: '📚 레이어에서 "가이드" 눈(👁)을 끄면 내 그림만 보여요. GIF로 저장하면 완성! 🎉' },
    ]
  },
  {
    id: 'blink', em: '😉', name: '눈 깜빡 이모티콘', kind: 'frame', desc: '눈만 바꿔 그려서 깜빡! 가장 쉬운 움직이는 이모티콘.',
    build() {
      const d = newAnimDoc(360, 360, '눈 깜빡 이모티콘', { frames: 10, fps: 10 }); const L = d.pages[0].layers; const seq = ['open', 'open', 'open', 'open', 'open', 'open', 'half', 'closed', 'half', 'open'];
      const cels = {}; seq.forEach((s, f) => { cels[f] = x => { drawEyes(x, 180, 185, 130, s, 'guide'); x.fillStyle = '#3a86ff'; x.font = '18px Jua'; x.fillText((f + 1) + '번: ' + ({ open: '뜬 눈', half: '반쯤', closed: '감은 눈' })[s], 12, 28); }; });
      L.push(mkPartL(d, '얼굴', x => artFace(x, 180, 185, 130, { eyes: null })));
      L.push(mkFramesL(d, '눈 가이드', cels, .5)); L.push(mkFramesL(d, '내 눈 그리기')); d.pages[0].active = 2; return d;
    },
    steps: [
      { t: '얼굴은 이미 있어요! 우리는 <b>눈만</b> 그리면 돼요. "내 눈 그리기" 레이어에 파란 가이드를 따라 눈을 칠해요.', f: 0 },
      { t: '1~6번은 모두 뜬 눈이에요. 1번을 다 그렸으면 타임라인 <b>⧉(복제)</b> 대신, 2번 칸을 누르고 똑같이 그려도 되고... 꿀팁! 1번을 그린 뒤 🗑로 2~6번 칸을 지우고 ⧉로 1번을 5번 복사하면 빨라요.', f: 0 },
      { t: '7번은 <b>반쯤 감은 눈</b>, 8번은 <b>감은 눈</b>(∪), 9번은 다시 반쯤! 깜빡임은 이렇게 3장이면 충분해요.', f: 6 },
      { t: '▶ 재생! 눈을 "오래 뜨고 → 빠르게 깜빡" 하면 살아있는 것 같아요. 눈 가이드 레이어를 숨기고 GIF(투명 배경)로 저장해요 ✨' },
    ]
  },
  {
    id: 'heart', em: '💗', name: '두근두근 하트', kind: 'key', desc: '크기만 바꾸는 키프레임으로 심장 박동!',
    build() {
      const d = newAnimDoc(360, 360, '두근두근 하트', { frames: 12 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '하트', x => artHeart(x, 180, 175, 95), { x: 180, y: 180 }, [{ f: 0, ease: 'out' }, { f: 2, sx: 1.25, sy: 1.25, ease: 'inout' }, { f: 4, ease: 'out' }, { f: 6, sx: 1.15, sy: 1.15, ease: 'inout' }, { f: 8 }, { f: 11 }])); d.pages[0].active = 0; return d;
    },
    steps: [
      { t: '▶ 재생해 봐요. 쿵-쿵 두 번 뛰고 쉬어요. 진짜 심장 박동 리듬이에요!' },
      { t: '타임라인의 ◆가 키프레임이에요. 3번 칸 ◆를 두 번 톡 → 크기를 150%로 바꿔 보세요. 더 크게 두근!', f: 2 },
      { t: '🎞 애니 → 빠르기를 바꿔 봐요. 빠르면 설렘, 느리면 차분한 느낌.' },
      { t: '하트 색을 바꾸고 싶으면 하트 레이어를 고르고 🪣 채우기! 투명 GIF로 저장하면 이모티콘 완성 💗' },
    ]
  },
  {
    id: 'wave', em: '👋', name: '안녕 손 흔들기', kind: 'key', desc: '회전 키프레임 + 기준점으로 손을 흔들어요.',
    build() {
      const d = newAnimDoc(480, 480, '안녕 손 흔들기', { frames: 13 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '몸', x => { x.fillStyle = '#9ad0ff'; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); roundRectPath(x, 170, 290, 140, 150, 50); x.fill(); x.stroke(); artFace(x, 240, 220, 90, { eyes: 'open' }); }));
      L.push(mkPartL(d, '팔', x => { x.strokeStyle = INK; x.lineWidth = 5; x.fillStyle = '#ffe08a'; x.beginPath(); roundRectPath(x, 306, 200, 30, 110, 15); x.fill(); x.stroke(); x.beginPath(); x.arc(321, 192, 30, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(306, 175); x.lineTo(300, 160); x.moveTo(321, 166); x.lineTo(321, 150); x.moveTo(336, 175); x.lineTo(343, 160); x.stroke(); }, { x: 321, y: 305 }, [{ f: 0, r: -20, ease: 'inout' }, { f: 6, r: 25, ease: 'inout' }, { f: 12, r: -20 }]));
      d.pages[0].active = 1; return d;
    },
    steps: [
      { t: '▶ 재생! 팔이 어깨를 중심으로 빙글 흔들려요. 주황 십자 ✛ 가 <b>기준점</b>(돌아가는 중심)이에요.', tool: 'xform' },
      { t: '기준점을 손 쪽으로 끌어 옮겨 보세요. 그리고 재생하면? 이상하게 돌죠! 회전은 <b>관절</b>을 기준으로 해야 자연스러워요. (↶로 되돌리기)', tool: 'xform' },
      { t: '7번 칸 ◆를 두 번 톡 → 회전을 45도로! 더 신나게 흔들어요.', f: 6 },
      { t: '"부드럽게" 움직임은 끝에서 천천히 멈춰서 자연스러워요. "일정하게"로 바꿔서 차이를 느껴 보세요 (로봇처럼 딱딱!).' },
    ]
  },
  {
    id: 'slime', em: '🟢', name: '통통 슬라임 점프', kind: 'key', desc: '예비동작 + 찌그러짐으로 말랑말랑 점프!',
    build() {
      const d = newAnimDoc(480, 480, '통통 슬라임', { frames: 16 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '바닥', x => artGround(x, d, 400)));
      L.push(mkPartL(d, '그림자', x => artShadow(x, 240, 402, 150), { x: 240, y: 402 }, [{ f: 0, ease: 'out' }, { f: 3, sx: 1.2, sy: 1.2, ease: 'out' }, { f: 8, sx: .55, sy: .55, a: .5, ease: 'in' }, { f: 11, ease: 'out' }, { f: 12, sx: 1.25, sy: 1.25, ease: 'inout' }, { f: 15 }]));
      L.push(mkPartL(d, '슬라임', x => artSlime(x, 240, 400, 150, 115), { x: 240, y: 400 }, [{ f: 0, ease: 'inout' }, { f: 3, sx: 1.25, sy: .78, ease: 'out' }, { f: 4, y: -40, sx: .85, sy: 1.25, ease: 'out' }, { f: 8, y: -170, ease: 'in' }, { f: 11, sx: .88, sy: 1.15, ease: 'linear' }, { f: 12, sx: 1.3, sy: .72, ease: 'back' }, { f: 15 }]));
      d.pages[0].active = 2; return d;
    },
    steps: [
      { t: '▶ 재생! 슬라임이 뛰기 전에 <b>살짝 움츠러들죠</b>? 이게 <b>예비동작</b>이에요. 점프 전엔 꼭 앉아야 힘이 느껴져요!' },
      { t: '4번 프레임: 뛰어오를 때 <b>위로 길쭉</b>. 13번: 착지할 때 <b>납작</b>. 말랑한 느낌의 비밀!', f: 3 },
      { t: '4번 칸 ◆를 두 번 톡 → 키 지우기. 재생하면 예비동작 없이 뛰어서 어색해요. 차이 느껴지죠? (↶로 되돌리기)', f: 3 },
      { t: '13번 키는 "띠용" 움직임이라 착지 후 출렁~ 해요. 다른 움직임으로도 바꿔 봐요!', f: 12 },
    ]
  },
  {
    id: 'pop', em: '⭐', name: '뿅! 등장', kind: 'key', desc: '크기 0에서 띠용~ 튀어나오는 이모티콘 효과.',
    build() {
      const d = newAnimDoc(360, 360, '뿅 등장', { frames: 16 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '반짝이', x => { x.fillStyle = '#ffd23f'; [[60, 70, 18], [300, 80, 14], [70, 290, 12], [295, 280, 20], [180, 30, 10]].forEach(([a, b, s]) => { x.beginPath(); for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4, r = k % 2 ? s * .25 : s; x.lineTo(a + Math.cos(t) * r, b + Math.sin(t) * r); } x.closePath(); x.fill(); }); }, { x: 180, y: 180 }, [{ f: 0, a: 0, sx: .6, sy: .6, ease: 'out' }, { f: 7, a: 0, sx: .6, sy: .6, ease: 'out' }, { f: 10, a: 1, ease: 'inout' }, { f: 15, a: .3, sx: 1.1, sy: 1.1, r: 15 }]));
      L.push(mkPartL(d, '별', x => artStar(x, 180, 180, 120), { x: 180, y: 180 }, [{ f: 0, sx: 0, sy: 0, r: -120, ease: 'back' }, { f: 7, ease: 'inout' }, { f: 11, sx: 1.06, sy: .95, ease: 'inout' }, { f: 15 }]));
      d.pages[0].active = 1; return d;
    },
    steps: [
      { t: '▶ 재생! 별이 0에서 커지면서 살짝 <b>넘쳤다가 돌아와요</b>. 1번 키 움직임이 "띠용"이라서예요.' },
      { t: '1번 칸 ◆를 두 번 톡 → 움직임을 "일정하게"로 바꿔 보세요. 심심해지죠? 다시 "띠용"으로!', f: 0 },
      { t: '반짝이 레이어는 투명도 키로 나타나요. 키 창에서 "투명도"를 바꿔 깜빡이게 만들어 봐요.' },
      { t: '별 대신 내 캐릭터를 그려 넣어도 돼요: 별 레이어를 고르고 🧹 비우기 → 새로 그리기!' },
    ]
  },
  {
    id: 'spin', em: '🌀', name: '빙글빙글 회전', kind: 'key', desc: '끊김 없이 계속 도는 반복 애니메이션 만들기.',
    build() {
      const d = newAnimDoc(360, 360, '빙글빙글', { frames: 12 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '별', x => artStar(x, 180, 185, 120, '#9ad0ff'), { x: 180, y: 185 }, [{ f: 0, r: 0, ease: 'linear' }, { f: 11, r: 330 }])); return d;
    },
    steps: [
      { t: '▶ 재생! 끊기지 않고 계속 돌아요. 비밀: 마지막 12번 키가 360도가 아니라 <b>330도</b>예요.', f: 11 },
      { t: '왜일까? 12번 다음은 다시 1번(0도 = 360도)이니까, 360도로 하면 같은 그림이 두 번 나와서 <b>멈칫</b>해요. 12번 키를 360으로 바꿔서 확인해 봐요!', f: 11 },
      { t: '반복 애니의 법칙: <b>마지막 프레임 다음에 첫 프레임이 자연스럽게 이어지게!</b> 회전은 "일정하게"가 잘 어울려요.' },
    ]
  },
  {
    id: 'shake', em: '😱', name: '깜짝 흔들흔들', kind: 'key', desc: '좌우로 덜덜 흔들리는 놀람 이모티콘.',
    build() {
      const d = newAnimDoc(360, 360, '깜짝 놀람', { frames: 14, fps: 14 }); const L = d.pages[0].layers;
      L.push(mkPartL(d, '얼굴', x => { artFace(x, 180, 190, 120, { eyes: null, mouth: 'o', col: '#cfe6ff' }); x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 4; [-1, 1].forEach(s => { x.beginPath(); x.arc(180 + s * 42, 170, 24, 0, 7); x.fill(); x.stroke(); x.fillStyle = INK; x.beginPath(); x.arc(180 + s * 42, 170, 6, 0, 7); x.fill(); x.fillStyle = '#fff'; }); }, { x: 180, y: 300 }, [{ f: 0, ease: 'back' }, { f: 2, sx: 1.12, sy: 1.12, y: -14, ease: 'linear' }, { f: 3, x: -14, r: -6, ease: 'linear' }, { f: 4, x: 14, r: 6, ease: 'linear' }, { f: 5, x: -11, r: -5, ease: 'linear' }, { f: 6, x: 11, r: 5, ease: 'linear' }, { f: 7, x: -7, r: -3, ease: 'linear' }, { f: 8, x: 7, r: 3, ease: 'inout' }, { f: 10, ease: 'linear' }, { f: 13 }]));
      L.push(mkPartL(d, '땀', x => { x.fillStyle = '#6cc4ff'; x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.moveTo(300, 70); x.quadraticCurveTo(282, 104, 300, 112); x.quadraticCurveTo(318, 104, 300, 70); x.fill(); x.stroke(); }, { x: 300, y: 95 }, [{ f: 0, a: 0, ease: 'step' }, { f: 3, a: 1, ease: 'in' }, { f: 12, y: 60, a: 0 }]));
      return d;
    },
    steps: [
      { t: '▶ 재생! 놀라서 커졌다가 좌우로 덜덜 → 점점 작게 흔들리다 멈춰요. 흔들림은 <b>점점 줄어들어야</b> 자연스러워요.' },
      { t: '땀 레이어는 "딱 끊기" 움직임으로 4번에서 갑자기 나타나고, 떨어지면서 사라져요.', f: 3 },
      { t: '얼굴 레이어를 비우고 내 캐릭터 얼굴을 그려 넣으면 나만의 놀람 이모티콘! 😱' },
    ]
  },
];
async function startExample(id) {
  const E = ANIM_EXAMPLES.find(e => e.id === id); if (!E) return; const d = E.build(); d.guide = id; enterEditor(d); ST.guide = { id, i: 0 }; setTimeout(showStep, 300);
}
function showStep() {
  const card = $('#stepCard'); if (!ST.guide || !ST.doc) { card.style.display = 'none'; return; } const E = guidedById(ST.guide.id); if (!E) { card.style.display = 'none'; return; }
  let s = E.steps[ST.guide.i]; if (typeof s === 'string') s = { t: s }; if (E.items) redrawTraceGuide(E, ST.guide.i); card.style.display = 'block'; card.classList.remove('mini');
  $('#scT').textContent = `${E.em} ${E.name}`; $('#scB').innerHTML = s.t; $('#scN').textContent = `${ST.guide.i + 1} / ${E.steps.length}`;
  $('#scP').disabled = ST.guide.i === 0; $('#scNx').textContent = ST.guide.i === E.steps.length - 1 ? '끝 ✔' : '다음 ▶';
  if (s.f != null) { stopPlay(); setFrame(Math.min(s.f, ST.doc.anim.frames - 1)); }
  if (s.tool) setTool(s.tool);
}
function initSteps() {
  $('#scX').onclick = () => { ST.guide = null; showStep(); };
  $('#scT').onclick = () => $('#stepCard').classList.toggle('mini');
  $('#scP').onclick = () => { if (ST.guide && ST.guide.i > 0) { ST.guide.i--; showStep(); } };
  $('#scNx').onclick = () => { const E = guidedById(ST.guide.id); if (ST.guide.i < E.steps.length - 1) { ST.guide.i++; showStep(); } else { const tr = TRACE_LESSONS.includes(E); ST.guide = null; showStep(); toast(tr ? '🎉 따라 그리기 완료! 📐 가이드를 끄고 내 그림을 봐요' : '🎉 예제 끝! 이제 나만의 애니메이션을 만들어 봐요'); markMission(tr ? 'trace' : 'example'); } };
}

/* ================= ANIMATION SCHOOL ================= */
function demo(svg, cap) { return `<div class="fig demo">${svg}<b>${cap}</b></div>`; }
const DV = (inner, vb = '0 0 160 100') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="100" fill="#fff"/>${inner}</svg>`;
const GROUND = '<line x1="0" y1="88" x2="160" y2="88" stroke="#2d2a3a" stroke-width="2"/>';
const P12 = [
  { n: '1. 찌그러짐과 늘어남', d: '부딪히면 납작, 빠르면 길쭉! 물건이 말랑하고 무게가 있어 보여요. (부피는 그대로!)', svg: DV(GROUND + '<circle class="an-sq" cx="50" cy="76" r="12" fill="#ff5c6c" stroke="#2d2a3a" stroke-width="2"/><circle class="an-nsq" cx="115" cy="76" r="12" fill="#bbb" stroke="#2d2a3a" stroke-width="2"/><text x="35" y="98" font-size="8" font-family="Jua">말랑 ✔</text><text x="100" y="98" font-size="8" font-family="Jua" fill="#888">딱딱</text>') },
  { n: '2. 예비동작', d: '점프 전엔 움츠리고, 던지기 전엔 팔을 뒤로! 무슨 행동을 할지 미리 알려줘요.', svg: DV(GROUND + '<path class="an-ant" d="M62 88 C62 66 70 60 80 60 C90 60 98 66 98 88Z" fill="#6fd6a8" stroke="#2d2a3a" stroke-width="2"/><circle class="an-ant" cx="74" cy="74" r="2.2" fill="#2d2a3a"/><circle class="an-ant" cx="86" cy="74" r="2.2" fill="#2d2a3a"/>') },
  { n: '3. 연출 (보여주기)', d: '가장 중요한 걸 잘 보이게! 실루엣만 봐도 무슨 동작인지 알 수 있게 그려요.', svg: DV('<rect x="8" y="10" width="64" height="76" fill="#333"/><path d="M40 30 l0 30 M40 40 l-14 -12 M40 40 l18 -16 M40 60 l-10 22 M40 60 l12 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="24" r="7" fill="#fff"/><text x="12" y="96" font-size="7.5" font-family="Jua">한눈에 보여요 ✔</text><rect x="88" y="10" width="64" height="76" fill="#333"/><path d="M120 30 l0 30 M120 40 l-6 14 M120 40 l6 14 M120 60 l-4 22 M120 60 l4 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="120" cy="24" r="7" fill="#fff"/><text x="92" y="96" font-size="7.5" font-family="Jua" fill="#888">뭐 하는 거지?</text>') },
  { n: '4. 한 장씩 vs 포즈부터', d: '처음부터 차례로 그리기(자유롭고 생생) vs 중요한 포즈(키)를 먼저 그리고 중간 채우기(계획적). 키프레임 파트는 "포즈부터" 방식!', svg: DV('<line x1="10" y1="50" x2="150" y2="50" stroke="#ddd" stroke-width="2"/>' + [10, 150].map(x => `<rect x="${x - 7}" y="43" width="14" height="14" transform="rotate(45 ${x} 50)" fill="#ffb020" stroke="#2d2a3a" stroke-width="1.5"/>`).join('') + [80].map(x => `<rect x="${x - 7}" y="43" width="14" height="14" transform="rotate(45 ${x} 50)" fill="#ffb020" stroke="#2d2a3a" stroke-width="1.5"/>`).join('') + [27, 45, 62, 98, 115, 133].map(x => `<circle cx="${x}" cy="50" r="4" fill="#a78bfa"/>`).join('') + '<text x="4" y="28" font-size="8" font-family="Jua" fill="#d48a00">◆ 키(중요한 포즈)</text><text x="4" y="78" font-size="8" font-family="Jua" fill="#6b4fd8">● 중간 그림 = 앱이 자동으로!</text>') },
  { n: '5. 따라오기와 겹치기', d: '몸이 멈춰도 머리카락, 꼬리, 옷은 조금 늦게 따라와서 출렁여요.', svg: DV(GROUND + '<g class="an-ft"><rect x="62" y="56" width="30" height="32" rx="8" fill="#ffd1e1" stroke="#2d2a3a" stroke-width="2"/><g class="an-tail"><path d="M77 56 Q77 40 70 32" stroke="#2d2a3a" stroke-width="2.5" fill="none"/><circle cx="70" cy="32" r="5" fill="#ff5c8a" stroke="#2d2a3a" stroke-width="2"/></g></g>') },
  { n: '6. 천천히 시작, 천천히 끝', d: '진짜 물건은 갑자기 출발하거나 딱 멈추지 않아요. 점 사이 간격을 보세요!', svg: DV('<text x="4" y="22" font-size="8" font-family="Jua" fill="#888">일정하게</text><line x1="20" y1="32" x2="140" y2="32" stroke="#eee" stroke-width="2"/><circle class="an-lin" cx="20" cy="32" r="7" fill="#bbb"/>' + [20, 40, 60, 80, 100, 120, 140].map(x => `<circle cx="${x}" cy="44" r="1.8" fill="#bbb"/>`).join('') + '<text x="4" y="64" font-size="8" font-family="Jua" fill="#ff5c8a">부드럽게 ✔</text><line x1="20" y1="74" x2="140" y2="74" stroke="#eee" stroke-width="2"/><circle class="an-eio" cx="20" cy="74" r="7" fill="#ff5c8a"/>' + [20, 24, 36, 58, 80, 102, 124, 136, 140].map(x => `<circle cx="${x}" cy="86" r="1.8" fill="#ff5c8a"/>`).join('')) },
  { n: '7. 호 (곡선 경로)', d: '살아있는 움직임은 대부분 둥근 곡선을 그려요. 던진 공, 팔 흔들기, 고개 돌리기!', svg: DV(GROUND + '<path d="M15 80 Q80 -20 145 80" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/><g class="an-arcx"><circle class="an-arcy" cx="15" cy="80" r="7" fill="#4fb3ff" stroke="#2d2a3a" stroke-width="2"/></g>') },
  { n: '8. 부수 동작', d: '주된 동작에 작은 동작을 더해요. 걸으면서 휘파람, 고개 끄덕이며 귀가 펄럭!', svg: DV('<g class="an-nod"><g class="an-ear"><ellipse cx="66" cy="22" rx="6" ry="16" fill="#fff" stroke="#2d2a3a" stroke-width="2"/></g><g class="an-ear2"><ellipse cx="94" cy="22" rx="6" ry="16" fill="#fff" stroke="#2d2a3a" stroke-width="2"/></g><circle cx="80" cy="55" r="24" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><circle cx="72" cy="52" r="2.5" fill="#2d2a3a"/><circle cx="88" cy="52" r="2.5" fill="#2d2a3a"/><path d="M76 62 Q80 66 84 62" stroke="#2d2a3a" stroke-width="2" fill="none"/></g>') },
  { n: '9. 타이밍', d: '같은 동작도 장 수(시간)에 따라 느낌이 달라요. 무거운 건 빠르게 떨어지고 조금만 튀고, 가벼운 건 느리게!', svg: DV(GROUND + '<circle class="an-heavy" cx="45" cy="76" r="12" fill="#555" stroke="#2d2a3a" stroke-width="2"/><circle class="an-light" cx="115" cy="76" r="12" fill="#ffd1e1" stroke="#2d2a3a" stroke-width="2"/><text x="28" y="98" font-size="8" font-family="Jua">볼링공</text><text x="100" y="98" font-size="8" font-family="Jua">풍선</text>') },
  { n: '10. 과장', d: '현실보다 더 크게! 놀라면 눈이 튀어나오고, 기쁘면 몸이 붕 떠요. 만화의 재미예요.', svg: DV('<circle cx="45" cy="50" r="26" fill="#ffe08a" stroke="#2d2a3a" stroke-width="2"/><circle cx="37" cy="46" r="3" fill="#2d2a3a"/><circle cx="53" cy="46" r="3" fill="#2d2a3a"/><ellipse cx="45" cy="62" rx="4" ry="5" fill="#c2445e"/><circle cx="115" cy="50" r="26" fill="#ffe08a" stroke="#2d2a3a" stroke-width="2"/><g class="an-pop"><circle cx="104" cy="44" r="10" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><circle cx="126" cy="44" r="10" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><circle cx="104" cy="44" r="3" fill="#2d2a3a"/><circle cx="126" cy="44" r="3" fill="#2d2a3a"/></g><ellipse class="an-pop" cx="115" cy="66" rx="7" ry="9" fill="#c2445e"/><text x="32" y="94" font-size="8" font-family="Jua" fill="#888">보통</text><text x="98" y="94" font-size="8" font-family="Jua">과장 ✔</text>') },
  { n: '11. 입체감 있는 그림', d: '납작한 그림보다 앞·옆·위가 있는 입체로 생각하면 돌려도 자연스러워요.', svg: DV('<defs><radialGradient id="sph" cx=".35" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#6cb8ff"/></radialGradient></defs><circle cx="45" cy="50" r="28" fill="url(#sph)" stroke="#2d2a3a" stroke-width="2"/><ellipse cx="45" cy="50" rx="28" ry="9" fill="none" stroke="#2d2a3a" stroke-dasharray="3 3"/><path d="M95 35 L120 25 L145 35 L120 45 Z" fill="#ffe0ea" stroke="#2d2a3a" stroke-width="2"/><path d="M95 35 L95 70 L120 80 L120 45Z" fill="#ffb3cd" stroke="#2d2a3a" stroke-width="2"/><path d="M145 35 L145 70 L120 80 L120 45Z" fill="#e88aaa" stroke="#2d2a3a" stroke-width="2"/>') },
  { n: '12. 매력', d: '보고 싶어지는 캐릭터! 단순한 모양, 개성 있는 실루엣, 귀여운 표정이 매력을 만들어요.', svg: DV('<circle class="an-bob" cx="80" cy="55" r="32" fill="#ffd1e1" stroke="#2d2a3a" stroke-width="2.5"/><g class="an-bob"><ellipse cx="68" cy="52" rx="6" ry="8" fill="#2d2a3a"/><ellipse cx="92" cy="52" rx="6" ry="8" fill="#2d2a3a"/><circle cx="70" cy="49" r="2" fill="#fff"/><circle cx="94" cy="49" r="2" fill="#fff"/><path d="M75 64 Q80 69 85 64" stroke="#2d2a3a" stroke-width="2" fill="none"/><ellipse cx="60" cy="63" rx="5" ry="3" fill="#ff8fb1"/><ellipse cx="100" cy="63" rx="5" ry="3" fill="#ff8fb1"/></g>') },
];
function spacingSVG() {
  const tmp = { keys: BALL_KEYS.map(k => ({ ...POSE0, ...k })), pivot: { x: 240, y: 148 } }; let dots = '';
  for (let f = 0; f <= 14; f++) { const P = getPose(tmp, f); const x = 20 + f * 18, y = 18 + P.y * .26; dots += `<ellipse cx="${x}" cy="${y + 10 - 10 * P.sy}" rx="${9 * P.sx}" ry="${9 * P.sy}" fill="${f === 7 ? '#ff5c6c' : '#ffd1d6'}" stroke="#2d2a3a" stroke-width="1.3"/><text x="${x}" y="108" font-size="7" text-anchor="middle" font-family="Jua">${f + 1}</text>`; }
  return `<svg viewBox="0 0 290 115" xmlns="http://www.w3.org/2000/svg"><rect width="290" height="115" fill="#fff"/><line x1="0" y1="99" x2="290" y2="99" stroke="#2d2a3a" stroke-width="2"/>${dots}<text x="6" y="12" font-size="8" font-family="Jua" fill="#6b4fd8">위: 촘촘 = 느림</text><text x="196" y="12" font-size="8" font-family="Jua" fill="#6b4fd8">위: 촘촘 = 느림</text><text x="104" y="50" font-size="8" font-family="Jua" fill="#e5383b">아래: 넓게 = 빠름!</text></svg>`;
}
const ANIM_LESSONS = [
  { id: 'a_basic', em: '🎞️', t: '애니메이션의 비밀', s: '그림이 어떻게 움직여 보일까?', h: () => `
  <h2>🎞️ 애니메이션의 비밀</h2><p>애니메이션은 <b>조금씩 다른 그림을 빠르게 넘겨서</b> 움직이는 것처럼 보이게 하는 마법이에요. 교과서 귀퉁이 플립북이랑 똑같아요!</p>
  <h3>프레임과 fps</h3><ul><li><b>프레임</b> = 그림 한 장</li><li><b>fps</b> = 1초에 몇 장? 12fps면 1초에 12장</li><li>만화영화는 보통 12~24fps, 움직이는 이모티콘은 8~15fps 정도면 충분해요</li></ul>
  <h3>두 가지 만드는 방법</h3>
  <div class="box"><b>🎞 한 장씩 그리기 (프레임 레이어)</b><br>모든 장을 손으로 그려요. 표정 바뀌기, 눈 깜빡, 불꽃, 물처럼 모양이 변하는 것에 좋아요. 어니언 스킨(앞뒤 그림 비쳐 보기)을 켜고 그려요.</div>
  <div class="box blue"><b>🔑 키프레임 파트</b><br>그림은 한 번만 그리고, 중요한 순간(키)에 위치·크기·회전만 정해요. 중간은 앱이 자동으로 만들어요! 공, 하트, 팔 흔들기, 등장 효과에 좋아요.</div>
  <div class="box green">💡 둘을 섞어도 돼요! 몸은 키프레임 파트로 움직이고, 눈은 프레임 레이어로 깜빡!</div>
  <button class="btn sm" data-ex="ball_done">▶ 공 튀기기 완성본 보기</button>` },
  { id: 'a_12', em: '📜', t: '애니메이션 12가지 법칙', s: '디즈니 애니메이터들의 비법', h: () => `
  <h2>📜 애니메이션 12가지 법칙</h2><p>옛날 디즈니 애니메이터들이 정리한, 살아있는 움직임을 만드는 12가지 비법이에요. 그림들이 실제로 움직이니까 잘 보세요!</p>
  ${P12.map(p => `<h3>${p.n}</h3><div class="demo-wide">${p.svg}</div><p>${p.d}</p>`).join('')}
  <div class="box">🏅 처음엔 <b>1번(찌그러짐), 2번(예비동작), 6번(천천히 시작·끝)</b> 세 가지만 기억해도 애니메이션이 확 달라져요!</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-ex="ball_diy">1·6번 연습: 공 튀기기</button><button class="btn sm lav" data-ex="slime">2번 연습: 슬라임 점프</button></div>` },
  { id: 'a_ball', em: '🏀', t: '공 튀기기 해부', s: '모든 애니메이터의 첫 숙제', h: () => `
  <h2>🏀 공 튀기기 해부</h2><p>공 튀기기는 세계 모든 애니메이션 학교의 첫 번째 숙제예요. 이것만 잘해도 애니메이션 기본기가 생겨요!</p>
  <div class="fig-wide">${spacingSVG()}</div>
  <ol><li><b>위에서는 느리게</b>: 올라가다 멈췄다 내려오니까 공이 촘촘하게 모여 있어요.</li><li><b>아래에서는 빠르게</b>: 떨어질수록 빨라져서 공 사이가 넓어요.</li><li><b>바닥에서 찌그러짐</b>: 닿는 순간 납작! (8번)</li><li><b>바닥 앞뒤로 늘어남</b>: 빠를 때는 세로로 길쭉 (7·9번)</li><li><b>그림자</b>: 공이 가까우면 크고 진하게</li></ol>
  <div class="box blue">🔑 키프레임으로는 <b>키 3개</b>(위 → 바닥 → 위)와 움직임 2개(점점 빠르게 / 점점 느리게)면 끝!</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-ex="ball_diy">🔑 키프레임으로 만들기</button><button class="btn sm lav" data-ex="ball_frames">✏️ 한 장씩 그리기</button></div>` },
  { id: 'a_timing', em: '⏱️', t: '타이밍과 스페이싱', s: '빠르기와 간격의 비밀', h: () => `
  <h2>⏱️ 타이밍과 스페이싱</h2><h3>타이밍 = 몇 장으로?</h3><p>같은 거리를 움직여도 <b>장 수가 적으면 빠르고</b>, 많으면 느려요. 12fps에서 6장이면 0.5초, 24장이면 2초!</p>
  <h3>스페이싱 = 간격이 어떻게?</h3><div class="fig-wide">${DV('<text x="4" y="16" font-size="8" font-family="Jua">일정 (로봇)</text>' + [20, 40, 60, 80, 100, 120, 140].map(x => `<circle cx="${x}" cy="24" r="4" fill="#bbb"/>`).join('') + '<text x="4" y="46" font-size="8" font-family="Jua" fill="#e5383b">점점 빠르게 (출발, 떨어짐)</text>' + [20, 22, 28, 40, 58, 84, 120].map(x => `<circle cx="${x}" cy="54" r="4" fill="#ff5c6c"/>`).join('') + '<text x="4" y="76" font-size="8" font-family="Jua" fill="#3a86ff">점점 느리게 (멈춤, 올라감)</text>' + [20, 56, 82, 100, 112, 118, 120].map(x => `<circle cx="${x}" cy="84" r="4" fill="#4fb3ff"/>`).join(''))}</div>
  <p>키 창의 "다음 키까지 움직이는 방법"이 바로 스페이싱이에요. 타임라인의 보라 점(움직임 경로)으로 간격을 눈으로 확인할 수 있어요!</p>
  <div class="box">🎵 <b>리듬</b>: 빠른 동작 → 잠깐 멈춤 → 빠른 동작. 계속 같은 속도면 지루해요. 멈추는 순간(홀드)도 연기예요!</div>` },
  { id: 'a_emoji', em: '😆', t: '움직이는 이모티콘 꿀팁', s: '작고 귀엽고 반복되게', h: () => `
  <h2>😆 움직이는 이모티콘 꿀팁</h2>
  <ol><li><b>작게 보여요</b>: 채팅방에선 엄청 작아요. 선은 <b>굵게</b>, 모양은 <b>단순하게</b>, 표정은 <b>크게</b>!</li><li><b>한 가지 동작만</b>: "고마워 + 꾸벅" 처럼 하나의 감정, 하나의 동작.</li><li><b>짧게 반복</b>: 1~2초 (12fps면 12~24장). 끝과 처음이 자연스럽게 이어지게!</li><li><b>과장하기</b>: 웃을 땐 몸 전체로, 놀랄 땐 펄쩍!</li><li><b>투명 배경 GIF</b>: 🎞 애니 → GIF (투명 배경)으로 저장하면 어디에 붙여도 예뻐요. (투명 GIF는 가장자리가 살짝 거칠 수 있어요)</li><li><b>글자 넣기</b>: "ㅋㅋ", "고마워♡" 같은 글자를 크게 써 넣으면 뜻이 확실해져요.</li><li><b>정사각형</b>: 이모티콘은 보통 정사각형으로 만들어요. 새 애니메이션 → 이모티콘 크기!</li></ol>
  <h3>이모티콘 아이디어</h3><p><span class="pill">꾸벅 인사</span><span class="pill">하트 뿅뿅</span><span class="pill">엉엉 눈물 분수</span><span class="pill">부들부들 화남</span><span class="pill">빙글빙글 신남</span><span class="pill">졸려서 꾸벅꾸벅</span><span class="pill">엄지 척</span><span class="pill">놀라서 펄쩍</span></p>
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-ex="blink">😉 눈 깜빡</button><button class="btn sm lav" data-ex="heart">💗 두근두근</button><button class="btn sm" data-ex="shake">😱 깜짝</button><button class="btn sm lav" data-ex="pop">⭐ 뿅 등장</button></div>` },
  { id: 'a_steps', em: '🗺️', t: '애니메이션 만드는 순서', s: '계획부터 GIF까지', h: () => `
  <h2>🗺️ 애니메이션 만드는 순서</h2><ol><li><b>💡 무엇을?</b> 한 문장으로: "슬라임이 점프해서 별을 잡는다"</li><li><b>✏️ 키 포즈</b>: 가장 중요한 순간 2~4개를 먼저 그려요 (시작, 가장 높은 곳, 끝)</li><li><b>⏱ 타이밍</b>: 각 포즈를 몇 번 프레임에 둘지 정하고 ▶로 확인</li><li><b>🎞 중간 채우기</b>: 키프레임이면 움직이는 방법만 고르고, 한 장씩이면 어니언 스킨 보며 그리기</li><li><b>✨ 다듬기</b>: 찌그러짐, 예비동작, 따라오기를 추가</li><li><b>🎨 색칠 · 효과</b></li><li><b>💾 GIF 저장</b> → 가족에게 보여주기!</li></ol>
  <div class="box green">🎯 좋은 애니메이터의 습관: <b>계속 ▶ 재생해 보기!</b> 그리는 시간만큼 보는 시간도 중요해요.</div>` },
];
function guidedById(id) { return ANIM_EXAMPLES.find(e => e.id === id) || TRACE_LESSONS.find(e => e.id === id); }
