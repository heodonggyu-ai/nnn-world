/* ================= TRACE (따라 그리기) ================= */
const GB = '#3a86ff', GP = '#ff4d7d', GC = '#9db7e0';
function gStyle(x, on, done) { x.setLineDash([]); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = on ? GP : GB; x.lineWidth = on ? 7 : 5; x.globalAlpha = done || on ? 1 : .0; }
function gCons(x) { x.setLineDash([12, 10]); x.strokeStyle = GC; x.lineWidth = 3; x.globalAlpha = 1; }
function gLabel(x, txt, X, Y, col = GB) { x.setLineDash([]); x.globalAlpha = 1; x.fillStyle = col; x.font = '30px Jua'; x.fillText(txt, X, Y); }
function el(x, cx, cy, rx, ry, rot = 0) { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); x.stroke(); }
function ln(x, ...p) { x.beginPath(); for (let i = 0; i < p.length; i += 2) i ? x.lineTo(p[i], p[i + 1]) : x.moveTo(p[i], p[i + 1]); x.stroke(); }
// draws items 0..step-1 in blue, item step in pink; step >= items.length => all blue
function drawStepped(x, items, step, cons) {
  x.save(); if (cons) { gCons(x); cons(x); }
  items.forEach((fn, i) => { if (i > step) return; x.save(); gStyle(x, i === step, i < step); fn(x); x.restore(); });
  x.restore();
}
function faceFeat(x, cx, cy, r, kind) {
  const e = r * .36, ey = cy - r * .05;
  if (kind === 'happy') { ln(x); x.beginPath(); x.arc(cx - e, ey + 8, r * .13, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.beginPath(); x.arc(cx + e, ey + 8, r * .13, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.beginPath(); x.arc(cx, cy + r * .25, r * .3, .2, Math.PI - .2); x.stroke(); }
  else if (kind === 'sad') { ln(x, cx - e - r * .15, ey - r * .25, cx - e + r * .12, ey - r * .32); ln(x, cx + e + r * .15, ey - r * .25, cx + e - r * .12, ey - r * .32); el(x, cx - e, ey, r * .07, r * .11); el(x, cx + e, ey, r * .07, r * .11); x.beginPath(); x.arc(cx, cy + r * .55, r * .25, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); ln(x, cx + e, ey + r * .15, cx + e, ey + r * .35); }
  else if (kind === 'angry') { ln(x, cx - e - r * .15, ey - r * .32, cx - e + r * .15, ey - r * .18); ln(x, cx + e + r * .15, ey - r * .32, cx + e - r * .15, ey - r * .18); el(x, cx - e, ey, r * .07, r * .09); el(x, cx + e, ey, r * .07, r * .09); ln(x, cx - r * .25, cy + r * .45, cx + r * .25, cy + r * .45); ln(x, cx + r * .55, cy - r * .7, cx + r * .75, cy - r * .5); ln(x, cx + r * .75, cy - r * .7, cx + r * .55, cy - r * .5); }
  else if (kind === 'surprise') { el(x, cx - e, ey, r * .13, r * .16); el(x, cx + e, ey, r * .13, r * .16); el(x, cx, cy + r * .45, r * .12, r * .17); ln(x, cx - e - r * .12, ey - r * .38, cx - e + r * .12, ey - r * .42); ln(x, cx + e - r * .12, ey - r * .42, cx + e + r * .12, ey - r * .38); }
}
function sdFigure(x, cx, footY, s, parts) { // parts: subset of ['head','body','arms','legs','face','cloth']
  const H = 340 * s, hy = footY - 3 * H + H / 2; const P = new Set(parts);
  if (P.has('head')) el(x, cx, hy, H * .5, H * .5);
  if (P.has('body')) { x.beginPath(); x.moveTo(cx - H * .22, footY - 2 * H); x.lineTo(cx + H * .22, footY - 2 * H); x.lineTo(cx + H * .3, footY - H * 1.05); x.lineTo(cx - H * .3, footY - H * 1.05); x.closePath(); x.stroke(); }
  if (P.has('arms')) { ln(x, cx - H * .22, footY - H * 1.9, cx - H * .5, footY - H * 1.35); el(x, cx - H * .54, footY - H * 1.28, H * .09, H * .09); ln(x, cx + H * .22, footY - H * 1.9, cx + H * .5, footY - H * 1.35); el(x, cx + H * .54, footY - H * 1.28, H * .09, H * .09); }
  if (P.has('legs')) { x.beginPath(); roundRectPath(x, cx - H * .26, footY - H * 1.05, H * .2, H * .9, H * .08); x.stroke(); x.beginPath(); roundRectPath(x, cx + H * .06, footY - H * 1.05, H * .2, H * .9, H * .08); x.stroke(); el(x, cx - H * .18, footY - H * .07, H * .16, H * .08); el(x, cx + H * .18, footY - H * .07, H * .16, H * .08); }
  if (P.has('face')) { const r = H * .5; el(x, cx - r * .36, hy + r * .05, r * .1, r * .14); el(x, cx + r * .36, hy + r * .05, r * .1, r * .14); x.beginPath(); x.arc(cx, hy + r * .28, r * .18, .3, Math.PI - .3); x.stroke(); x.beginPath(); x.moveTo(cx - r, hy); x.quadraticCurveTo(cx - r * .9, hy - r * 1.15, cx, hy - r * 1.05); x.quadraticCurveTo(cx + r * .9, hy - r * 1.15, cx + r, hy); x.quadraticCurveTo(cx + r * .5, hy - r * .9, cx + r * .1, hy - r * .55); x.quadraticCurveTo(cx - r * .3, hy - r * .9, cx - r * .6, hy - r * .45); x.quadraticCurveTo(cx - r * .8, hy - r * .6, cx - r, hy); x.stroke(); }
  if (P.has('cloth')) { ln(x, cx - H * .12, footY - 2 * H, cx, footY - H * 1.8, cx + H * .12, footY - 2 * H); ln(x, cx - H * .28, footY - H * 1.25, cx + H * .28, footY - H * 1.25); el(x, cx, footY - H * 1.6, H * .03, H * .03); el(x, cx, footY - H * 1.45, H * .03, H * .03); }
}
const TRACE_LESSONS = [
  { id: 't_cat', em: '🐱', name: '고양이 얼굴', kind: 'art', size: [1000, 1000], desc: '동그라미 하나에서 시작하는 고양이!',
    cons: x => { ln(x, 500, 250, 500, 850); ln(x, 200, 540, 800, 540); },
    items: [x => el(x, 500, 560, 260, 220), x => { ln(x, 290, 430, 320, 200, 440, 350); ln(x, 710, 430, 680, 200, 560, 350); }, x => { el(x, 400, 520, 38, 52); el(x, 600, 520, 38, 52); el(x, 400, 524, 9, 32); el(x, 600, 524, 9, 32); }, x => { ln(x, 480, 600, 520, 600, 500, 625, 480, 600); x.beginPath(); x.moveTo(500, 625); x.quadraticCurveTo(500, 662, 462, 660); x.moveTo(500, 625); x.quadraticCurveTo(500, 662, 538, 660); x.stroke(); }, x => { [[610, 580], [625, 630], [640, 680]].forEach(([y0, y1], i) => { ln(x, 410, 600 + i * 18, 250, y0 - 20 + i * 10); ln(x, 590, 600 + i * 18, 750, y0 - 20 + i * 10); }); ln(x, 470, 380, 480, 430); ln(x, 500, 368, 500, 425); ln(x, 530, 380, 520, 430); }],
    steps: ['큰 <b>얼굴 동그라미</b>를 그려요. 점선 십자선이 얼굴 가운데예요. 완벽하지 않아도 OK!', '삼각형 <b>귀</b> 두 개! 얼굴 위쪽 양옆에 쫑긋.', '<b>눈</b>은 가로 점선 위에. 고양이 눈동자는 세로로 길쭉해요.', '십자선 가운데 아래에 <b>코</b>(작은 역삼각형)와 <b>ω 입</b>.', '<b>수염</b>을 양쪽에 3개씩, 이마에 줄무늬 3개. 완성! 🎉 가이드 레이어(📐)를 끄고 내 그림만 봐요.'] },
  { id: 't_lizard', em: '🦎', name: '귀여운 도마뱀', kind: 'art', size: [1000, 1000], desc: '타원 몇 개로 만드는 도마뱀 친구.',
    items: [x => el(x, 480, 520, 170, 80, -.12), x => { el(x, 700, 455, 95, 65, -.25); x.beginPath(); x.arc(735, 470, 30, .3, 1.6); x.stroke(); }, x => { ln(x, 590, 480, 600, 380, 640, 360); ln(x, 600, 380, 610, 350); ln(x, 600, 380, 585, 355); ln(x, 600, 570, 620, 660, 660, 680); ln(x, 620, 660, 600, 690); ln(x, 390, 470, 370, 380, 330, 360); ln(x, 370, 380, 360, 350); ln(x, 380, 585, 360, 670, 320, 690); ln(x, 360, 670, 375, 700); }, x => { x.beginPath(); x.moveTo(320, 490); x.bezierCurveTo(230, 470, 170, 520, 80, 430); x.moveTo(330, 570); x.bezierCurveTo(220, 600, 150, 540, 80, 430); x.stroke(); }, x => { el(x, 725, 430, 16, 16); el(x, 729, 430, 6, 9); [[420, 490], [480, 480], [540, 495], [450, 545], [520, 548]].forEach(([a, b]) => el(x, a, b, 14, 10)); }],
    steps: ['길쭉한 <b>몸통 타원</b>을 살짝 기울여 그려요.', '오른쪽 위에 <b>머리 타원</b>, 그리고 웃는 입!', '<b>다리 4개</b>: 앞다리는 위로, 뒷다리는 아래로 굽혀요. 발가락도 콕콕.', '왼쪽으로 점점 가늘어지는 <b>꼬리</b>. 두 선이 끝에서 만나요.', '<b>눈</b>과 등 <b>무늬</b>를 그리면 완성! 🦎 좋아하는 색으로 칠해 봐요.'] },
  { id: 't_face', em: '🙂', name: '웹툰 얼굴 (정면)', kind: 'art', size: [1000, 1000], desc: '동그라미 + 십자선 = 얼굴의 기본!',
    items: [x => { el(x, 500, 430, 230, 230); x.setLineDash([12, 10]); ln(x, 500, 180, 500, 780); ln(x, 260, 490, 740, 490); }, x => { x.beginPath(); x.moveTo(272, 470); x.bezierCurveTo(290, 640, 420, 750, 500, 760); x.bezierCurveTo(580, 750, 710, 640, 728, 470); x.stroke(); }, x => { el(x, 400, 505, 46, 60); el(x, 600, 505, 46, 60); el(x, 412, 485, 12, 14); el(x, 612, 485, 12, 14); x.beginPath(); x.arc(400, 445, 60, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); x.beginPath(); x.arc(600, 445, 60, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); }, x => { ln(x, 500, 590, 492, 612); x.beginPath(); x.arc(500, 640, 34, .35, Math.PI - .35); x.stroke(); }, x => { x.beginPath(); x.moveTo(262, 480); x.bezierCurveTo(240, 230, 380, 170, 500, 175); x.bezierCurveTo(620, 170, 760, 230, 738, 480); x.moveTo(290, 430); x.quadraticCurveTo(350, 300, 420, 400); x.quadraticCurveTo(470, 290, 520, 395); x.quadraticCurveTo(590, 280, 640, 405); x.quadraticCurveTo(690, 330, 712, 450); x.stroke(); }, x => { ln(x, 455, 755, 455, 850); ln(x, 545, 755, 545, 850); x.beginPath(); x.moveTo(455, 850); x.quadraticCurveTo(330, 860, 250, 950); x.moveTo(545, 850); x.quadraticCurveTo(670, 860, 750, 950); x.stroke(); }],
    steps: ['<b>동그라미 + 십자선</b>. 가로선은 눈이 들어갈 자리예요 (생각보다 아래!).', '동그라미 양옆에서 뾰족하게 모이는 <b>턱선</b>.', '가로선에 걸치게 <b>큰 눈</b> 두 개. 반짝이(흰 점)는 같은 방향에! 그리고 눈썹.', '세로선 위에 작은 <b>코</b>, 그 아래 <b>입</b>.', '머리 위로 넉넉하게 <b>머리카락</b>. 앞머리는 뾰족뾰족 몇 갈래로!', '<b>목과 어깨</b>까지 그리면 완성! 다른 머리 모양으로도 바꿔 봐요.'] },
  { id: 't_side', em: '👤', name: '옆얼굴', kind: 'art', size: [1000, 1000], desc: '이마-코-입-턱 옆선 따라가기.',
    cons: x => { el(x, 470, 450, 220, 220); ln(x, 250, 470, 720, 470); },
    items: [x => { x.beginPath(); x.moveTo(560, 240); x.quadraticCurveTo(630, 300, 640, 400); x.lineTo(700, 500); x.lineTo(652, 528); x.quadraticCurveTo(672, 552, 660, 575); x.quadraticCurveTo(650, 600, 640, 640); x.quadraticCurveTo(600, 700, 520, 700); x.quadraticCurveTo(470, 690, 440, 600); x.stroke(); }, x => { el(x, 430, 500, 34, 58); }, x => { x.beginPath(); x.moveTo(565, 452); x.quadraticCurveTo(595, 430, 622, 452); x.stroke(); el(x, 603, 465, 9, 16); x.beginPath(); x.arc(595, 410, 40, Math.PI * 1.25, Math.PI * 1.75); x.stroke(); }, x => { x.beginPath(); x.moveTo(560, 240); x.bezierCurveTo(430, 180, 260, 260, 280, 460); x.quadraticCurveTo(290, 620, 360, 720); x.moveTo(560, 240); x.quadraticCurveTo(600, 330, 560, 380); x.stroke(); }],
    steps: ['이마 → 눈썹뼈 → <b>코</b> → 입술 → <b>턱</b>으로 이어지는 옆선. 코가 가장 튀어나와요!', '<b>귀</b>는 얼굴 동그라미 가운데쯤, 눈과 같은 높이예요.', '옆모습 <b>눈</b>은 화살촉처럼 옆으로 누운 모양. 눈썹도 살짝.', '뒤통수까지 둥글게 <b>머리카락</b>. 옆얼굴은 뒤통수가 생각보다 커요!'] },
  { id: 't_faces', em: '😆', name: '표정 4가지', kind: 'art', size: [1000, 1000], desc: '기쁨 · 슬픔 · 화남 · 놀람.',
    cons: x => { [[250, 250], [750, 250], [250, 750], [750, 750]].forEach(([a, b]) => { ln(x, a, b - 180, a, b + 180); ln(x, a - 180, b, a + 180, b); }); },
    items: [x => { [[250, 250], [750, 250], [250, 750], [750, 750]].forEach(([a, b]) => el(x, a, b, 170, 170)); gLabel(x, '기쁨', 40, 60); gLabel(x, '슬픔', 540, 60); gLabel(x, '화남', 40, 560); gLabel(x, '놀람', 540, 560); }, x => faceFeat(x, 250, 250, 170, 'happy'), x => faceFeat(x, 750, 250, 170, 'sad'), x => faceFeat(x, 250, 750, 170, 'angry'), x => faceFeat(x, 750, 750, 170, 'surprise')],
    steps: ['얼굴 <b>동그라미 4개</b>. 같은 캐릭터로 표정만 바꿀 거예요.', '<b>기쁨</b>: 눈이 ∩ 모양으로 휘고 입은 크게 웃어요.', '<b>슬픔</b>: 눈썹 안쪽이 올라가고(／＼), 입꼬리는 아래로. 눈물 한 방울.', '<b>화남</b>: 눈썹 안쪽이 내려가요(＼／). 입은 일자, 💢 핏줄!', '<b>놀람</b>: 눈과 입이 동그랗게! 눈썹은 높이 올라가요. 완성 🎉'] },
  { id: 't_sd', em: '🧍', name: '귀여운 3등신 몸', kind: 'art', size: [800, 1200], desc: '머리 하나 = 몸 하나 = 다리 하나.',
    cons: x => { [130, 470, 810, 1150].forEach(y => ln(x, 120, y, 680, y)); gLabel(x, '①', 60, 320, GC); gLabel(x, '②', 60, 660, GC); gLabel(x, '③', 60, 1000, GC); },
    items: [x => sdFigure(x, 400, 1150, 1, ['head']), x => sdFigure(x, 400, 1150, 1, ['body']), x => sdFigure(x, 400, 1150, 1, ['arms']), x => sdFigure(x, 400, 1150, 1, ['legs']), x => sdFigure(x, 400, 1150, 1, ['face']), x => sdFigure(x, 400, 1150, 1, ['cloth'])],
    steps: ['점선이 키를 3칸으로 나눠요. 맨 위 ①칸에 <b>머리</b>를 꽉 차게!', '②칸에 <b>몸통</b> (아래가 살짝 넓은 사다리꼴).', '<b>팔</b>은 짧게! 손은 동그라미로 간단하게. 손끝이 몸통 중간쯤까지 와요.', '③칸에 <b>다리</b>와 동그란 <b>발</b>.', '<b>얼굴과 머리카락</b>. 귀여운 캐릭터는 눈이 얼굴 아래쪽에 있어요!', '<b>옷</b>을 입히면 완성! 3등신은 이모티콘, 4컷 만화에 딱이에요.'] },
  { id: 't_toon', em: '📱', name: '웹툰 한 화면', kind: 'toon', size: [800, 1280], desc: '칸 · 인물 · 말풍선까지 웹툰 한 장면 완성!',
    panels: [{ pts: [[40, 64], [760, 64], [760, 624], [40, 624]], border: 'solid' }, { pts: [[400, 760], [760, 760], [760, 1180], [400, 1180]], border: 'solid' }],
    objects: [{ kind: 'bubble', shape: 'oval', x: 560, y: 170, w: 300, h: 130, text: '오늘은 뭐 그리지~?', tail: { x: -120, y: 120 } }, { kind: 'bubble', shape: 'shout', x: 220, y: 840, w: 230, h: 170, text: '앗!!', tail: { x: 150, y: 70 } }],
    items: [x => { x.strokeRect(100, 120, 200, 170); ln(x, 200, 120, 200, 290); ln(x, 100, 205, 300, 205); ln(x, 40, 560, 760, 560); x.strokeRect(470, 420, 250, 20); ln(x, 490, 440, 490, 560); ln(x, 700, 440, 700, 560); }, x => sdFigure(x, 330, 600, .42, ['head', 'body', 'arms', 'legs', 'face']), x => { el(x, 580, 990, 150, 150); faceFeat(x, 580, 990, 150, 'surprise'); [[430, 790], [740, 800], [430, 1160], [740, 1150]].forEach(([a, b]) => ln(x, a, b, a + (580 - a) * .25, b + (990 - b) * .25)); }, x => { }],
    steps: ['칸 2개와 말풍선은 이미 있어요! 1번 칸은 <b>넓은 장면(어디인지)</b>, 2번 칸은 <b>클로즈업(감정)</b>이에요. 먼저 1번 칸 <b>배경</b>(창문, 책상, 바닥)을 따라 그려요.', '1번 칸에 <b>인물 전신</b>. 작게 그려도 괜찮아요.', '2번 칸에 크게 <b>놀란 얼굴</b>. 클로즈업은 감정을 크게 보여줘요!', '👆 <b>💬 웹툰 → 글자·효과음 → 말풍선·글자 고치기</b>로 대사를 내 이야기로 바꿔요. 아래 빈 곳엔 다음 장면을 상상해서 그려 봐요! 🎉'] },
  { id: 't_walk', em: '🚶', name: '걷기 (애니)', kind: 'anim', size: [480, 480], frames: 8, fps: 8, desc: '8장으로 만드는 제자리 걷기. 진짜 애니메이터 연습!',
    frame: (x, f) => walkFrame(x, f),
    steps: ['파란 가이드는 <b>졸라맨 걷기 8장</b>이에요. "내 그림" 레이어에 1번부터 따라 그려요. 머리 → 몸 → 팔 → 다리 순서로!', '1번과 5번은 <b>발이 땅에 닿는</b> 자세(다리를 가장 넓게 벌림). 이게 걷기의 키 포즈!', '3번과 7번은 <b>다리가 지나가는</b> 자세. 몸이 가장 높이 올라가요.', '팔은 다리와 <b>반대로</b>! 오른발이 앞이면 왼팔이 앞이에요.', '▶ 재생해 보고, 📐 가이드를 끄면 내 걷기 애니 완성! 졸라맨에 옷을 입혀 봐요 🎉'] },
  { id: 't_flag', em: '🚩', name: '펄럭이는 깃발 (애니)', kind: 'anim', size: [480, 480], frames: 8, fps: 10, desc: '물결이 깃대에서 끝으로 전해져요 (따라오기 법칙).',
    frame: (x, f) => flagFrame(x, f),
    steps: ['깃대는 그대로, <b>깃발 물결</b>만 조금씩 오른쪽으로 밀려요. 1번부터 따라 그려요.', '물결은 깃대 쪽이 작고 <b>끝으로 갈수록 커져요</b>. 이게 "따라오기와 겹치기"!', '▶ 재생! 바람 부는 느낌이 나나요? 깃발에 그림이나 글자를 넣어도 멋져요 🚩'] },
];
function walkFrame(x, f) {
  const ph = f / 8 * Math.PI * 2; const hip = { x: 240, y: 262 + 9 * Math.cos(ph * 2 - .6) };
  const leg = (s) => { const a = 30 * Math.cos(ph + s) * Math.PI / 180; const k = Math.max(0, -Math.sin(ph + s)) * 50 * Math.PI / 180; const knee = { x: hip.x + Math.sin(a) * 62, y: hip.y + Math.cos(a) * 62 }; const ft = { x: knee.x + Math.sin(a - k) * 62, y: knee.y + Math.cos(a - k) * 62 }; ln(x, hip.x, hip.y, knee.x, knee.y, ft.x, ft.y); ln(x, ft.x, ft.y, ft.x + 18, ft.y); };
  const arm = (s) => { const sh = { x: hip.x, y: hip.y - 88 }; const a = -26 * Math.cos(ph + s) * Math.PI / 180; const el2 = { x: sh.x + Math.sin(a) * 45, y: sh.y + Math.cos(a) * 45 }; const hd = { x: el2.x + Math.sin(a + .5) * 42, y: el2.y + Math.cos(a + .5) * 42 }; ln(x, sh.x, sh.y, el2.x, el2.y, hd.x, hd.y); };
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = GC; x.lineWidth = 3; x.setLineDash([10, 8]); ln(x, 40, 392, 440, 392); x.setLineDash([]);
  x.lineWidth = 6; x.strokeStyle = '#9ec3ff'; leg(Math.PI); arm(Math.PI); x.strokeStyle = GB; ln(x, hip.x, hip.y, hip.x, hip.y - 92); el(x, hip.x + 4, hip.y - 122, 28, 28); leg(0); arm(0);
  const names = ['발 닿기', '내려앉기', '지나가기', '올라가기', '발 닿기 (반대)', '내려앉기', '지나가기', '올라가기'];
  gLabel(x, `${f + 1}번 · ${names[f]}`, 16, 40); x.restore();
}
function flagFrame(x, f) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = GB; x.lineWidth = 6; ln(x, 110, 70, 110, 430); el(x, 110, 64, 10, 10);
  const ph = f / 8 * Math.PI * 2; const pt = (u, top) => { const X = 110 + u * 270, A = 4 + u * 30; return [X, (top ? 90 : 250) + A * Math.sin(u * 7 - ph) + (top ? 0 : u * 10)]; };
  x.beginPath(); for (let i = 0; i <= 30; i++) { const p = pt(i / 30, true); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } for (let i = 30; i >= 0; i--) { const p = pt(i / 30, false); x.lineTo(p[0], p[1]); } x.closePath(); x.stroke();
  gLabel(x, `${f + 1}번`, 16, 40); x.restore();
}
function guideLayer(d, name) { const l = newLayer(d.w, d.h, name || '📐 따라 그리기 가이드'); l.guide = true; l.opacity = .55; return l; }
function startTrace(id) {
  const E = TRACE_LESSONS.find(e => e.id === id); if (!E) return; const [w, h] = E.size; let d;
  if (E.kind === 'anim') {
    d = newAnimDoc(w, h, E.name + ' 따라 그리기', { frames: E.frames, fps: E.fps }); const L = d.pages[0].layers; const cels = {}; for (let f = 0; f < E.frames; f++) cels[f] = x => E.frame(x, f);
    const g = mkFramesL(d, '📐 가이드', cels, .55); g.guide = true; L.push(g); L.push(mkFramesL(d, '내 그림')); d.pages[0].active = 1;
  } else {
    d = E.kind === 'toon' ? newDoc('toon', w, h, E.name + ' 따라 그리기') : newDoc('art', w, h, E.name + ' 따라 그리기'); const p = d.pages[0];
    const g = guideLayer(d); p.layers.splice(0, 0, g); p.layers.forEach((l, i) => { if (l.name === '밑그림') l.name = '색칠'; }); p.active = p.layers.length - 1; p.layers[p.active].name = '내 선화';
    if (E.panels) p.panels = JSON.parse(JSON.stringify(E.panels)); if (E.objects) p.objects = E.objects.map(o => { const n = { id: uid(), rot: 0, font: 'Jua', size: 34, stroke: '#111', strokeW: 3, color: null, fill: null, ...o }; return n; });
    drawStepped(g.ctx, E.items, 0, E.cons);
  }
  d.guide = id; enterEditor(d); ST.guide = { id, i: 0 }; setTimeout(showStep, 300);
}
function redrawTraceGuide(E, step) {
  const g = ST.page.layers.find(l => l.guide); if (!g || !E.items) return; g.ctx.clearRect(0, 0, ST.doc.w, ST.doc.h);
  drawStepped(g.ctx, E.items, step >= E.steps.length - 1 && E.items.length <= step ? 99 : step, E.cons); g._v = (g._v || 0) + 1; ST.dirty = true;
}

/* ---------- own image / video tracing ---------- */
let TRACE_MODE = 'art';
function pickTraceImage(mode) { TRACE_MODE = mode; $('#fileTrace').click(); }
function loadImg(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; }); }
async function startTraceImage(file) {
  let img; try { img = await loadImg(file); } catch (e) { toast('그림을 열 수 없어요 😢'); return; }
  const iw = img.naturalWidth, ih = img.naturalHeight; let d, W, H;
  if (TRACE_MODE === 'toon') { d = newDoc('toon', 800, 1280, '따라 그린 웹툰'); W = 800; H = 1280; }
  else if (TRACE_MODE === 'anim') { const s = Math.min(1, 640 / Math.max(iw, ih)); W = Math.max(240, Math.round(iw * s)); H = Math.max(240, Math.round(ih * s)); d = newAnimDoc(W, H, '따라 그린 애니', { frames: 12 }); }
  else { const s = Math.min(1, 1500 / Math.max(iw, ih)); const k = Math.max(1, 700 / Math.max(iw * s, ih * s)); W = Math.round(iw * s * k); H = Math.round(ih * s * k); d = newDoc('art', W, H, '따라 그린 그림'); }
  const fit = (x) => { const s = Math.min(W / iw, H / ih); x.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s); };
  const p = d.pages[0];
  if (TRACE_MODE === 'anim') { const g = mkPartL(d, '📐 따라 그릴 그림', fit); g.guide = true; g.opacity = .45; p.layers.push(g); p.layers.push(mkFramesL(d, '내 그림')); p.active = 1; }
  else { const g = guideLayer(d, '📐 따라 그릴 그림'); g.opacity = .4; fit(g.ctx); p.layers.splice(0, 0, g); p.layers.forEach(l => { if (l.name === '밑그림') l.name = '색칠'; }); p.active = p.layers.length - 1; }
  enterEditor(d); markMission('trace');
  setTimeout(() => toast('📐 반투명 그림 위에 따라 그려요! 이 그림은 저장할 때 빠져요', 3200), 400);
}
function pickTraceVideo() { $('#fileVideo').click(); }
async function traceVideoModal(file) {
  const url = URL.createObjectURL(file); const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = url;
  toast('🎬 영상 여는 중...', 1500);
  const ok = await new Promise(res => { v.onloadedmetadata = () => res(true); v.onerror = () => res(false); setTimeout(() => res(v.readyState > 0), 8000); });
  if (!ok || !v.duration || !isFinite(v.duration)) { toast('이 영상은 열 수 없어요 😢 다른 영상을 골라 주세요'); return; }
  const dur = v.duration;
  openModal(`<h3>🎬 영상 따라 그리기</h3><p style="font-size:14px;color:#77738a;line-height:1.6;margin:0 0 6px">영상을 한 장씩 나눠서 반투명 가이드로 깔아 줘요. 진짜 애니메이터들도 쓰는 방법(로토스코프)이에요!</p>
  <div class="mrow"><label>어디부터? <b id="tvS">0.0초</b> / ${dur.toFixed(1)}초</label><input type="range" id="tvStart" min="0" max="${Math.max(0, dur - .2).toFixed(2)}" step="0.1" value="0"></div>
  <div class="mrow"><label>몇 초 동안?</label><div class="chips" id="tvLen">${[1, 1.5, 2, 3].map(s => `<button class="chip ${s === 1.5 ? 'on' : ''}" data-v="${s}">${s}초</button>`).join('')}</div></div>
  <div class="mrow"><label>1초에 몇 장?</label><div class="chips" id="tvFps">${[6, 8, 12].map(s => `<button class="chip ${s === 8 ? 'on' : ''}" data-v="${s}">${s}장${s === 8 ? ' (추천)' : ''}</button>`).join('')}</div></div>
  <p id="tvInfo" style="font-size:13px;color:#ff5c8a;margin:6px 2px"></p>
  <div class="mbtns"><button class="btn sec sm" id="tvX">취소</button><button class="btn sm" id="tvGo">만들기 🎞</button></div>`);
  let len = 1.5, fps = 8; const info = () => { $('#tvInfo').textContent = `→ ${Math.round(Math.min(len, dur) * fps)}장을 그리게 돼요 (짧을수록 쉬워요!)`; }; info();
  $('#tvStart').oninput = e => { $('#tvS').textContent = (+e.target.value).toFixed(1) + '초'; };
  $$('#tvLen .chip').forEach(b => b.onclick = () => { len = +b.dataset.v; $$('#tvLen .chip').forEach(q => q.classList.toggle('on', q === b)); info(); });
  $$('#tvFps .chip').forEach(b => b.onclick = () => { fps = +b.dataset.v; $$('#tvFps .chip').forEach(q => q.classList.toggle('on', q === b)); info(); });
  $('#tvX').onclick = () => { closeModal(); URL.revokeObjectURL(url); };
  $('#tvGo').onclick = async () => {
    const start = +$('#tvStart').value; closeModal(); toast('🎞 영상을 한 장씩 나누는 중...', 6000);
    try { await v.play(); v.pause(); } catch (e) { }
    const n = Math.max(2, Math.min(36, Math.round(Math.min(len, dur - start) * fps))); const vw = v.videoWidth || 480, vh = v.videoHeight || 480; const s = Math.min(1, 480 / Math.max(vw, vh)); const W = Math.round(vw * s), H = Math.round(vh * s);
    const d = newAnimDoc(W, H, '영상 따라 그리기', { frames: n, fps }); const cels = {};
    for (let i = 0; i < n; i++) {
      const t = Math.min(dur - .03, start + i / fps);
      await new Promise(r => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); r(); }; v.addEventListener('seeked', fin); v.currentTime = t; setTimeout(fin, 2000); });
      const c = mkCanvas(W, H); try { c.getContext('2d').drawImage(v, 0, 0, W, H); } catch (e) { } cels[i] = c;
    }
    const g = newLayer(W, H, '📐 영상 가이드'); g.kind = 'frames'; g.guide = true; g.opacity = .45; g.cels = cels; g.used = {}; for (let i = 0; i < n; i++) g.used[i] = true; g.canvas = cels[0]; g.ctx = g.canvas.getContext('2d');
    d.pages[0].layers.push(g); d.pages[0].layers.push(mkFramesL(d, '내 그림')); d.pages[0].active = 1; URL.revokeObjectURL(url);
    enterEditor(d); markMission('trace'); setTimeout(() => toast('✏️ 1번부터 영상 속 모습을 따라 그려요! ⏭로 다음 장', 3400), 400);
  };
}

/* ---------- trace tab ---------- */
function renderTrace() {
  const el = $('#tab-trace');
  el.innerHTML = `<div class="tipcard"><b>✏️ 따라 그리기</b><br>좋아하는 그림을 따라 그리는 건 화가들도 하는 최고의 연습법이에요! 반투명 그림을 깔고 그 위에 그려요. <b>깔아 둔 그림은 저장할 때 빠지고 내 그림만 남아요.</b></div>
  <div class="sec-title">내가 고른 그림 따라 그리기</div>
  <div class="tipcard" style="font-size:13.5px">좋아하는 웹툰·만화 장면을 <b>화면 캡처</b>하거나 그림 사진을 찍어서 불러와요.
  <div class="trace-btns"><button class="btn sm" data-ti="art">🖌 그림으로</button><button class="btn sm lav" data-ti="toon">📱 웹툰 화면으로</button><button class="btn sm sec" data-ti="anim">🎞 애니로</button></div></div>
  <div class="sec-title">영상 따라 그리기 (애니)</div>
  <div class="tipcard" style="font-size:13.5px">점프하는 모습, 강아지·고양이가 걷는 모습을 <b>영상으로 찍어서</b> 불러오면 한 장씩 나눠 줘요. 따라 그리면 진짜처럼 움직이는 애니 완성!
  <div class="trace-btns"><button class="btn sm" id="trVid">🎬 영상 불러오기</button></div></div>
  <div class="sec-title">따라 그리기 교본 <small style="font-family:var(--fb);font-size:12.5px;color:#77738a">한 단계씩 분홍 선을 따라가요</small></div>
  <div class="lesson-grid" id="trGrid"></div>
  <div class="tipcard" style="margin-top:14px;font-size:13.5px"><b>💡 따라 그리기 잘하는 법</b><br>① <b>큰 모양부터</b>: 머리 동그라미, 몸통 → 작은 것은 나중에<br>② 선은 짧게 여러 번보다 <b>길게 한 번에</b>. 손떨림 보정을 5쯤으로!<br>③ 가끔 📚에서 📐 가이드를 끄고 내 그림만 보며 비교해요<br>④ 따라 그린 다음엔 <b>안 보고 한 번 더</b> 그려 보면 실력이 쑥쑥!</div>
  <div class="tipcard" style="font-size:13.5px"><b>🤝 그림 예절</b><br>다른 사람 그림을 따라 그린 건 <b>연습용</b>이에요. SNS에 올릴 땐 "○○ 작가님 그림 따라 그렸어요"처럼 꼭 원래 작가를 밝히고, 내 작품이라고 하지 않아요.</div><div style="height:20px"></div>`;
  el.querySelectorAll('[data-ti]').forEach(b => b.onclick = () => pickTraceImage(b.dataset.ti));
  $('#trVid').onclick = pickTraceVideo;
  const g = $('#trGrid'); TRACE_LESSONS.forEach(E => { const b = document.createElement('button'); b.className = 'lesson-card' + (LS.get('learn', {})['trace:' + E.id] ? ' done' : ''); b.innerHTML = `<span class="em">${E.em}</span><b>${E.name}</b><small>${E.desc}</small><small style="color:#a78bfa">${E.kind === 'anim' ? '🎞 애니' : E.kind === 'toon' ? '📱 웹툰' : '🖌 그림'} · ${E.steps.length}단계</small>`; b.onclick = () => startTrace(E.id); g.appendChild(b); });
}
