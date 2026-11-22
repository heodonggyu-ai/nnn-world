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
  /* ---------- 그림 초급 ---------- */
  { id: 't_straw', em: '🍓', name: '방긋 딸기', kind: 'art', lv: 1, size: [1000, 1000], desc: '통통한 모양 하나에 잎사귀를 얹으면 완성!',
    cons: x => { ln(x, 500, 200, 500, 900); ln(x, 220, 560, 780, 560); },
    items: [x => { x.beginPath(); x.moveTo(500, 330); x.bezierCurveTo(660, 280, 800, 380, 770, 560); x.bezierCurveTo(740, 730, 580, 850, 500, 880); x.bezierCurveTo(420, 850, 260, 730, 230, 560); x.bezierCurveTo(200, 380, 340, 280, 500, 330); x.stroke(); },
      x => { x.beginPath(); x.moveTo(330, 335); x.quadraticCurveTo(380, 250, 440, 305); x.quadraticCurveTo(465, 225, 500, 292); x.quadraticCurveTo(535, 225, 560, 305); x.quadraticCurveTo(620, 250, 670, 335); x.quadraticCurveTo(585, 360, 500, 335); x.quadraticCurveTo(415, 360, 330, 335); x.stroke(); x.beginPath(); x.moveTo(500, 292); x.quadraticCurveTo(495, 230, 525, 195); x.stroke(); },
      x => { [[360, 440], [640, 440], [300, 610], [700, 610], [395, 745], [605, 745], [500, 830], [500, 410]].forEach(([a, b], i) => el(x, a, b, 9, 15, i % 2 ? .3 : -.3)); },
      x => { el(x, 445, 555, 19, 27); el(x, 555, 555, 19, 27); x.beginPath(); x.arc(500, 600, 34, .25, Math.PI - .25); x.stroke(); el(x, 392, 610, 26, 14); el(x, 608, 610, 26, 14); },
      x => { x.beginPath(); x.arc(390, 470, 80, Math.PI * 1.05, Math.PI * 1.42); x.stroke(); el(x, 318, 555, 7, 11); }],
    steps: ['위가 넓고 아래가 뾰족한 <b>딸기 몸</b>을 그려요. 옆구리를 통통하게 부풀리면 귀여워요!', '꼭지에 물결 모양 <b>잎사귀</b>, 가운데에 살짝 휜 <b>줄기</b>를 쏙.', '<b>씨앗</b>은 작은 타원으로 콕콕. 줄을 맞추지 말고 흩어지게 그리면 더 자연스러워요.', '가로 점선 근처에 <b>눈 · 입 · 볼</b>! 얼굴은 몸 가운데보다 살짝 위가 귀여워요.', '왼쪽 위에 <b>반짝이 선</b>을 그려 동그란 느낌을 내요. 빨강·초록으로 색칠하면 완성!'] },
  { id: 't_star', em: '⭐', name: '반짝 별 친구', kind: 'art', lv: 1, size: [1000, 1000], desc: '꼭짓점 다섯 개만 이으면 친구가 생겨요.',
    cons: x => { el(x, 500, 540, 330, 330); el(x, 500, 540, 150, 150); },
    items: [x => { x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 150 : 330; const X = 500 + Math.cos(a) * r, Y = 540 + Math.sin(a) * r; k ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.closePath(); x.stroke(); },
      x => { el(x, 455, 545, 20, 28); el(x, 545, 545, 20, 28); },
      x => { x.beginPath(); x.arc(500, 590, 30, .2, Math.PI - .2); x.stroke(); el(x, 410, 596, 24, 13); el(x, 590, 596, 24, 13); },
      x => { const sp = (X, Y, r) => { x.beginPath(); x.moveTo(X, Y - r); x.quadraticCurveTo(X, Y, X + r, Y); x.quadraticCurveTo(X, Y, X, Y + r); x.quadraticCurveTo(X, Y, X - r, Y); x.quadraticCurveTo(X, Y, X, Y - r); x.stroke(); }; sp(190, 230, 50); sp(820, 250, 38); sp(840, 800, 46); sp(170, 790, 30); }],
    steps: ['바깥 큰 원에 <b>뾰족한 점 5개</b>, 안쪽 작은 원에 <b>오목한 점 5개</b>. 번갈아 이으면 별!', '별 가운데에 <b>눈</b> 두 개. 눈 사이를 넉넉히 벌리면 더 순해 보여요.', '<b>웃는 입</b>과 <b>볼터치</b>를 그려요.', '주변에 <b>반짝이</b>를 크기가 다르게 그려요. 큰 것 하나, 작은 것 여러 개가 예뻐요!'] },
  /* ---------- 그림 고급 ---------- */
  { id: 't_hand', em: '✋', name: '쫙 편 손', kind: 'art', lv: 3, size: [1000, 1000], desc: '손바닥은 네모, 손가락은 원기둥 3마디.',
    cons: x => { x.strokeRect(372, 480, 280, 290); x.beginPath(); x.arc(512, 520, 300, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); },
    items: [x => { x.beginPath(); x.moveTo(372, 482); x.quadraticCurveTo(356, 650, 425, 772); x.quadraticCurveTo(545, 812, 642, 752); x.quadraticCurveTo(676, 620, 652, 486); x.stroke(); },
      x => { x.save(); x.translate(388, 655); x.rotate(-.95); x.beginPath(); x.moveTo(-36, 0); x.lineTo(-36, -170); x.arc(0, -170, 36, Math.PI, 0); x.lineTo(36, 0); x.stroke(); x.restore(); },
      x => { handFingers(x, (w, len) => { x.beginPath(); x.moveTo(-w / 2, 0); x.lineTo(-w / 2, -len + w / 2); x.arc(0, -len + w / 2, w / 2, Math.PI, 0); x.lineTo(w / 2, 0); x.stroke(); }); },
      x => { handFingers(x, (w, len) => { [.36, .67].forEach(f => { x.beginPath(); x.moveTo(-w * .32, -len * f); x.quadraticCurveTo(0, -len * f + 7, w * .32, -len * f); x.stroke(); }); }); x.save(); x.translate(388, 655); x.rotate(-.95); x.beginPath(); x.moveTo(-24, -105); x.quadraticCurveTo(0, -98, 24, -105); x.stroke(); x.restore(); },
      x => { handFingers(x, (w, len) => { x.beginPath(); roundRectPath(x, -w * .27, -len + 10, w * .54, w * .55, w * .2); x.stroke(); }); x.save(); x.translate(388, 655); x.rotate(-.95); x.beginPath(); roundRectPath(x, -10, -196, 20, 34, 8); x.stroke(); x.restore(); x.beginPath(); x.moveTo(410, 545); x.quadraticCurveTo(445, 660, 470, 760); x.stroke(); x.beginPath(); x.moveTo(405, 575); x.quadraticCurveTo(520, 612, 625, 590); x.stroke(); x.beginPath(); x.moveTo(645, 528); x.quadraticCurveTo(560, 548, 470, 528); x.stroke(); }],
    steps: ['먼저 <b>손바닥</b>. 손바닥은 거의 <b>네모</b>예요. 아래쪽만 둥글게 그려요.', '<b>엄지</b>는 손바닥 옆 아래에서 비스듬히 나와요. 생각보다 아래쪽에 붙어 있어요!', '<b>손가락 4개</b>는 끝이 둥근 기둥. 점선 호를 보면 <b>가운데 손가락이 가장 길어요</b>. 새끼손가락은 확 짧게.', '손가락은 <b>3마디</b>, 엄지는 <b>2마디</b>. 마디 선을 살짝 휘게 그려요.', '마지막으로 <b>손톱</b>과 <b>손금 3줄</b>. 손금은 짧고 가볍게 그려야 자연스러워요.'] },
  { id: 't_34', em: '🧑', name: '3/4 각도 얼굴', kind: 'art', lv: 3, size: [1000, 1000], desc: '살짝 돌아본 얼굴 — 웹툰에서 가장 많이 쓰는 각도.',
    cons: x => { el(x, 500, 440, 230, 230); x.beginPath(); x.ellipse(500, 440, 115, 230, 0, -Math.PI / 2, Math.PI / 2); x.stroke(); x.beginPath(); x.ellipse(500, 505, 230, 36, 0, 0, Math.PI); x.stroke(); },
    items: [x => { x.beginPath(); x.arc(500, 440, 230, Math.PI * .96, Math.PI * 2.06); x.stroke(); x.beginPath(); x.moveTo(272, 470); x.bezierCurveTo(292, 640, 470, 772, 588, 772); x.bezierCurveTo(652, 762, 700, 682, 714, 600); x.stroke(); },
      x => { el(x, 438, 528, 50, 62); el(x, 446, 538, 24, 34); el(x, 638, 528, 29, 56); el(x, 644, 538, 13, 30); ln(x, 380, 452, 488, 444); ln(x, 612, 452, 672, 460); },
      x => { ln(x, 610, 548, 642, 622, 600, 630); x.beginPath(); x.moveTo(528, 690); x.quadraticCurveTo(580, 708, 624, 684); x.stroke(); },
      x => { x.beginPath(); x.ellipse(292, 528, 30, 58, .12, 0, Math.PI * 2); x.stroke(); ln(x, 388, 712, 392, 900); ln(x, 604, 766, 612, 900); },
      x => { x.beginPath(); x.moveTo(262, 540); x.bezierCurveTo(222, 300, 380, 178, 522, 196); x.bezierCurveTo(664, 210, 744, 310, 738, 480); x.stroke(); x.beginPath(); x.moveTo(318, 332); x.quadraticCurveTo(448, 432, 512, 318); x.quadraticCurveTo(604, 440, 712, 352); x.stroke(); }],
    steps: ['점선 원이 머리예요. 세로 점선이 <b>오른쪽으로 휘어</b> 있죠? 얼굴이 오른쪽을 보고 있다는 뜻이에요. <b>머리와 턱선</b>을 그려요.', '<b>가까운 눈은 크게, 먼 눈은 좁게!</b> 먼 눈은 세로로 길쭉한 타원이 돼요. 이게 3/4 각도의 핵심.', '<b>코</b>는 세로 점선 바로 옆으로 튀어나오게, <b>입</b>도 점선 쪽으로 치우치게 그려요.', '<b>귀</b>는 보이는 쪽(왼쪽)에만, 눈 높이에. 그리고 <b>목</b> 두 줄.', '<b>머리카락</b>은 머리 동그라미보다 조금 크게 덮어요. 앞머리는 뾰족뾰족 리듬감 있게!'] },
  { id: 't_room', em: '🏠', name: '1점 투시 방', kind: 'art', lv: 3, size: [1000, 1000], desc: '모든 선이 한 점으로 모이면 공간이 생겨요.',
    cons: x => { ln(x, 40, 430, 960, 430); el(x, 500, 430, 10, 10); gLabel(x, '소실점', 520, 415, GC); },
    items: [x => x.strokeRect(330, 300, 340, 260),
      x => { ln(x, 40, 40, 330, 300); ln(x, 960, 40, 670, 300); ln(x, 40, 960, 330, 560); ln(x, 960, 960, 670, 560); },
      x => { const wy = (X, t) => { const top = 40 + (X - 40) * 260 / 290, bot = 960 - (X - 40) * 400 / 290; return top + (bot - top) * t; }; const P = [[130, wy(130, .25)], [250, wy(250, .25)], [250, wy(250, .58)], [130, wy(130, .58)]]; x.beginPath(); P.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath(); x.stroke(); ln(x, 190, wy(190, .25), 190, wy(190, .58)); ln(x, 130, wy(130, .415), 250, wy(250, .415)); },
      x => { x.strokeRect(540, 380, 90, 180); el(x, 615, 472, 6, 6); },
      x => { [390, 445, 555, 610].forEach(b => ln(x, b, 560, 500 + (b - 500) * 530 / 130, 960)); [660, 790].forEach(y => { const d = (y - 560) * 290 / 400; ln(x, 330 - d, y, 670 + d, y); }); },
      x => { x.strokeRect(560, 700, 210, 66); ln(x, 560, 700, 545, 633, 707, 633, 770, 700); ln(x, 574, 766, 574, 860); ln(x, 756, 766, 756, 860); }],
    steps: ['가로 점선이 <b>눈높이(지평선)</b>, 가운데 점이 <b>소실점</b>이에요. 먼저 정면 <b>벽 네모</b>를 그려요.', '화면 네 모서리에서 벽 모서리로 <b>사선 4개</b>. 천장·바닥·양옆 벽이 생겨요!', '왼쪽 벽에 <b>창문</b>. 창문 위아래 선도 소실점 쪽으로 기울어져요.', '정면 벽에는 <b>문</b>. 정면은 기울이지 않고 반듯하게!', '<b>바닥 타일</b>: 세로 선은 소실점에서 퍼져 나오고, 가로 선은 반듯하게. 앞으로 올수록 간격이 넓어져요.', '<b>책상</b>도 윗면 옆선을 소실점 쪽으로! 이제 그림 속에 들어갈 수 있을 것 같죠?'] },
  /* ---------- 웹툰 초급 ---------- */
  { id: 't_4cut', em: '🗒️', name: '4컷 만화', kind: 'toon', lv: 1, size: [800, 1280], desc: '기 · 승 · 전 · 결, 네 칸이면 이야기 하나!',
    panels: [[60, 330], [360, 630], [660, 930], [960, 1230]].map(([a, b]) => ({ pts: [[40, a], [760, a], [760, b], [40, b]], border: 'solid' })),
    objects: [{ kind: 'bubble', shape: 'oval', x: 560, y: 140, w: 260, h: 104, text: '공 받아~!', tail: { x: -110, y: 50 } }, { kind: 'bubble', shape: 'oval', x: 580, y: 1060, w: 250, h: 96, text: '아야야…', tail: { x: -120, y: 50 } }],
    items: [x => { kid(x, 200, 165, 40); ln(x, 200, 235, 262, 196); ln(x, 200, 235, 150, 268); el(x, 292, 184, 22, 22); },
      x => { kid(x, 600, 470, 40, 'up'); el(x, 380, 430, 22, 22); [[300, 520, 345, 465], [280, 480, 330, 448]].forEach(p => ln(x, ...p)); },
      x => { kid(x, 400, 820, 44, 'x'); el(x, 430, 735, 22, 22); [[380, 720, 360, 696], [470, 724, 492, 700], [430, 700, 432, 676]].forEach(p => ln(x, ...p)); x.font = '64px Jua'; x.strokeText('쿵!', 540, 760); },
      x => { kid(x, 400, 1110, 48, 'dizzy'); const sp = (X, Y, r) => { x.beginPath(); x.moveTo(X, Y - r); x.quadraticCurveTo(X, Y, X + r, Y); x.quadraticCurveTo(X, Y, X, Y + r); x.quadraticCurveTo(X, Y, X - r, Y); x.quadraticCurveTo(X, Y, X, Y - r); x.stroke(); }; sp(320, 1030, 20); sp(480, 1020, 24); sp(400, 1000, 16); }],
    steps: ['칸과 말풍선은 준비돼 있어요! <b>1컷(기)</b>: 이야기 시작. 친구가 공을 던지려고 해요.', '<b>2컷(승)</b>: 일이 커져요. 공이 날아가고, 다른 친구가 위를 봐요. 짧은 <b>움직임 선</b>으로 속도를!', '<b>3컷(전)</b>: 반전! 공이 머리에 쿵. 충격 선과 <b>효과음</b>을 크게 써요.', '<b>4컷(결)</b>: 마무리 웃음 포인트. 어지러운 눈과 별로 끝! 이렇게 기승전결만 있으면 만화가 돼요.'] },
  /* ---------- 웹툰 고급 ---------- */
  { id: 't_action', em: '💥', name: '액션 장면', kind: 'toon', lv: 3, size: [800, 1280], desc: '기울어진 칸 · 집중선 · 효과음으로 박진감!',
    panels: [{ pts: [[40, 60], [760, 60], [760, 560], [40, 660]], border: 'solid' }, { pts: [[40, 700], [380, 660], [380, 1220], [40, 1220]], border: 'solid' }, { pts: [[420, 655], [760, 615], [760, 1220], [420, 1220]], border: 'solid' }],
    objects: [{ kind: 'bubble', shape: 'shout', x: 600, y: 150, w: 240, h: 140, text: '간다!!', tail: { x: -100, y: 90 } }],
    items: [x => { x.save(); x.beginPath(); x.moveTo(40, 60); x.lineTo(760, 60); x.lineTo(760, 560); x.lineTo(40, 660); x.closePath(); x.clip(); x.lineWidth = 3; for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2 + (k % 2) * .05; ln(x, 400 + Math.cos(a) * 190, 380 + Math.sin(a) * 160, 400 + Math.cos(a) * 640, 380 + Math.sin(a) * 640); } x.restore(); },
      x => { el(x, 400, 300, 48, 48); x.beginPath(); x.moveTo(398, 348); x.quadraticCurveTo(372, 400, 380, 462); x.stroke(); ln(x, 395, 372, 488, 330, 548, 336); el(x, 566, 336, 22, 22); ln(x, 395, 372, 312, 410, 262, 390); ln(x, 380, 462, 452, 500, 432, 582); ln(x, 380, 462, 300, 532, 236, 552); },
      x => { x.beginPath(); x.moveTo(80, 940); x.lineTo(186, 912); x.lineTo(200, 958); x.quadraticCurveTo(140, 978, 86, 966); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(236, 916); x.lineTo(338, 936); x.lineTo(332, 978); x.quadraticCurveTo(280, 986, 236, 962); x.closePath(); x.stroke(); el(x, 160, 942, 13, 15); el(x, 278, 950, 13, 15); x.lineWidth = 12; ln(x, 70, 880, 196, 900); ln(x, 238, 896, 350, 874); x.lineWidth = 5; x.beginPath(); x.moveTo(330, 820); x.quadraticCurveTo(352, 860, 330, 880); x.quadraticCurveTo(308, 860, 330, 820); x.stroke(); },
      x => { x.save(); x.beginPath(); x.moveTo(420, 655); x.lineTo(760, 615); x.lineTo(760, 1220); x.lineTo(420, 1220); x.closePath(); x.clip(); x.lineWidth = 3; for (let k = 0; k < 14; k++) { const y = 680 + k * 38; ln(x, 420, y, 420 + 90 + (k * 53 % 140), y); } x.restore(); el(x, 560, 900, 42, 42); x.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = k % 2 ? 60 : 120; const X = 660 + Math.cos(a) * r, Y = 880 + Math.sin(a) * r; k ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.closePath(); x.stroke(); },
      x => { x.save(); x.translate(590, 1100); x.rotate(-.18); x.font = '150px Jua'; x.lineWidth = 9; x.strokeText('쾅!', -110, 40); x.restore(); }],
    steps: ['액션 장면은 <b>칸을 기울이면</b> 화면부터 흔들려 보여요. 1컷에 <b>집중선</b>을 그려 시선을 가운데로 모아요.', '1컷 가운데에 <b>점프하는 인물</b>. 몸을 활처럼 휘게, 팔다리는 앞뒤로 크게 벌려요. 대각선 자세가 힘차 보여요!', '2컷은 <b>눈 클로즈업</b>. 눈꼬리를 날카롭게, 눈썹은 굵고 비스듬히, 땀방울 하나!', '3컷에 <b>속도선</b>과 <b>충격 별</b>. 주먹(동그라미)이 별 한가운데로 들어가요.', '마지막으로 <b>효과음 "쾅!"</b>을 크게, 기울여서. 칸 밖으로 튀어나갈 만큼 커도 좋아요!'] },
  /* ---------- 애니 중급·고급 ---------- */
  { id: 't_tail', em: '🐈', name: '꼬리 흔드는 고양이 (애니)', kind: 'anim', lv: 2, size: [480, 480], frames: 8, fps: 8, desc: '꼬리 끝이 한 박자 늦게 따라와요 (따라오기 법칙).',
    frame: (x, f) => tailFrame(x, f),
    steps: ['몸과 머리는 매 장 그대로예요. <b>꼬리만</b> 1번부터 따라 그려요.', '꼬리 <b>뿌리가 먼저</b> 움직이고 <b>끝은 한 박자 늦게</b> 따라와요. 그래서 꼬리가 S자로 휘어요!', '▶ 재생! 꼬리가 채찍처럼 부드럽게 흔들리나요? 이게 "따라오기와 겹치기" 법칙이에요.'] },
  { id: 't_run', em: '🏃', name: '달리기 (애니)', kind: 'anim', lv: 3, size: [480, 480], frames: 8, fps: 12, desc: '걷기보다 크게! 두 발이 모두 뜨는 순간이 있어요.',
    frame: (x, f) => runFrame(x, f),
    steps: ['걷기와 순서는 같지만 <b>몸을 앞으로 기울이고</b>, 팔은 <b>90도로 굽혀요</b>. 1번부터 따라 그려요.', '4번과 8번을 보세요. <b>두 발이 모두 땅에서 떨어진</b> 순간! 걷기와 달리기의 가장 큰 차이예요.', '2번은 몸이 가장 <b>낮게</b>(충격 흡수), 4번은 가장 <b>높게</b>. 위아래로 출렁이는 게 힘을 보여줘요.', '▶ 재생(12장/초)! 빠르게 달리는 느낌이 나면 성공. 진짜 애니메이터의 연습이에요!'] },
];
function handFingers(x, fn) { [[420, 486, 238, 62, -.12], [493, 481, 278, 64, -.03], [564, 483, 250, 62, .05], [628, 492, 184, 56, .16]].forEach(([cx, by, len, w, a]) => { x.save(); x.translate(cx, by); x.rotate(a); fn(w, len); x.restore(); }); }
function kid(x, cx, hy, r, face) {
  el(x, cx, hy, r, r); const by = hy + r; ln(x, cx, by, cx, by + r * 1.7); ln(x, cx, by + r * 1.7, cx - r * .6, by + r * 2.6); ln(x, cx, by + r * 1.7, cx + r * .6, by + r * 2.6);
  if (face !== undefined) { ln(x, cx, by + r * .5, cx - r * .9, by + r * 1.1); ln(x, cx, by + r * .5, cx + r * .9, by + r * 1.1); }
  const e = r * .38;
  if (face === 'up') { el(x, cx - e, hy - r * .2, r * .09, r * .14); el(x, cx + e, hy - r * .2, r * .09, r * .14); el(x, cx, hy + r * .4, r * .12, r * .14); }
  else if (face === 'x') { [-1, 1].forEach(s => { ln(x, cx + s * e - 7, hy - 7, cx + s * e + 7, hy + 7); ln(x, cx + s * e + 7, hy - 7, cx + s * e - 7, hy + 7); }); x.beginPath(); x.arc(cx, hy + r * .5, r * .2, Math.PI + .3, -.3); x.stroke(); }
  else if (face === 'dizzy') { [-1, 1].forEach(s => { x.beginPath(); for (let t = 0; t < 12; t++) { const a = t * .7, rr = 2 + t * 1.1; const X = cx + s * e + Math.cos(a) * rr, Y = hy + Math.sin(a) * rr; t ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }); x.beginPath(); x.moveTo(cx - 12, hy + r * .5); x.quadraticCurveTo(cx, hy + r * .38, cx + 12, hy + r * .5); x.stroke(); }
  else { el(x, cx - e, hy, r * .09, r * .14); el(x, cx + e, hy, r * .09, r * .14); x.beginPath(); x.arc(cx, hy + r * .3, r * .25, .3, Math.PI - .3); x.stroke(); }
}
function tailFrame(x, f) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = GC; x.lineWidth = 3; x.setLineDash([10, 8]); ln(x, 60, 400, 420, 400); x.setLineDash([]);
  x.strokeStyle = GB; x.lineWidth = 6; x.beginPath(); x.ellipse(220, 310, 82, 92, 0, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.ellipse(220, 185, 66, 58, 0, 0, Math.PI * 2); x.stroke(); ln(x, 168, 150, 166, 98, 204, 130); ln(x, 272, 150, 274, 98, 236, 130);
  el(x, 196, 182, 7, 10); el(x, 244, 182, 7, 10); x.beginPath(); x.arc(220, 206, 10, .3, Math.PI - .3); x.stroke(); ln(x, 180, 396, 180, 360); ln(x, 260, 396, 260, 360);
  const ph = f / 8 * Math.PI * 2; let px = 290, py = 360, ang = -Math.PI * .15; const pts = [[px, py]];
  for (let i = 0; i < 7; i++) { ang += (-.32) + .42 * (i + 1) / 7 * Math.sin(ph - i * .7); px += Math.cos(ang) * 24; py += Math.sin(ang) * 24; pts.push([px, py]); }
  x.lineWidth = 12; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; x.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } x.stroke();
  gLabel(x, `${f + 1}번`, 16, 40); x.restore();
}
function runFrame(x, f) {
  const ph = f / 8 * Math.PI * 2; const hip = { x: 230, y: 250 + 16 * Math.cos(ph * 2 + .4) };
  const leg = (s) => { const a = 46 * Math.cos(ph + s) * Math.PI / 180; const k = (20 + Math.max(0, -Math.sin(ph + s)) * 90) * Math.PI / 180; const knee = { x: hip.x + Math.sin(a) * 64, y: hip.y + Math.cos(a) * 64 }; const ft = { x: knee.x + Math.sin(a - k) * 64, y: knee.y + Math.cos(a - k) * 64 }; ln(x, hip.x, hip.y, knee.x, knee.y, ft.x, ft.y); };
  const sh = { x: hip.x + 26, y: hip.y - 86 };
  const arm = (s) => { const a = -50 * Math.cos(ph + s) * Math.PI / 180; const e2 = { x: sh.x + Math.sin(a) * 44, y: sh.y + Math.cos(a) * 44 }; const hd = { x: e2.x + Math.sin(a + 1.6) * 38, y: e2.y + Math.cos(a + 1.6) * 38 }; ln(x, sh.x, sh.y, e2.x, e2.y, hd.x, hd.y); };
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = GC; x.lineWidth = 3; x.setLineDash([10, 8]); ln(x, 40, 392, 440, 392); x.setLineDash([]);
  x.lineWidth = 6; x.strokeStyle = '#9ec3ff'; leg(Math.PI); arm(Math.PI); x.strokeStyle = GB; ln(x, hip.x, hip.y, sh.x, sh.y); el(x, sh.x + 14, sh.y - 34, 28, 28); leg(0); arm(0);
  const names = ['접촉', '누르기', '밀기', '공중!', '접촉 (반대)', '누르기', '밀기', '공중!'];
  gLabel(x, `${f + 1}번 · ${names[f]}`, 16, 40); x.restore();
}
const LVN = ['', '초급', '중급', '고급'];
const TRACE_LV = { t_cat: 1, t_lizard: 1, t_face: 2, t_side: 2, t_faces: 2, t_sd: 2, t_toon: 2, t_walk: 3, t_flag: 2 };
TRACE_LESSONS.forEach(e => { if (!e.lv) e.lv = TRACE_LV[e.id] || 2; });
const EX_LV = { ball_done: 1, ball_diy: 1, ball_frames: 1, blink: 1, heart: 1, pop: 2, wave: 2, spin: 2, shake: 2, slime: 3 };
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
  <div class="sec-title">따라 그리기 교본 <small style="font-family:var(--fb);font-size:12.5px;color:#8c8376">한 단계씩 분홍 선을 따라가요</small></div>
  <div class="tr-seg" id="trSeg"></div><div id="trBook"></div>
  <div class="sec-title">내가 고른 그림 따라 그리기</div>
  <div class="tipcard" style="font-size:13.5px">좋아하는 웹툰·만화 장면을 <b>화면 캡처</b>하거나 그림 사진을 찍어서 불러와요.
  <div class="trace-btns"><button class="btn sm" data-ti="art">🖌 그림으로</button><button class="btn sm lav" data-ti="toon">📱 웹툰 화면으로</button><button class="btn sm sec" data-ti="anim">🎞 애니로</button></div></div>
  <div class="sec-title">영상 따라 그리기 (애니)</div>
  <div class="tipcard" style="font-size:13.5px">점프하는 모습, 강아지·고양이가 걷는 모습을 <b>영상으로 찍어서</b> 불러오면 한 장씩 나눠 줘요. 따라 그리면 진짜처럼 움직이는 애니 완성!
  <div class="trace-btns"><button class="btn sm" id="trVid">🎬 영상 불러오기</button></div></div>

  <div class="tipcard" style="margin-top:14px;font-size:13.5px"><b>💡 따라 그리기 잘하는 법</b><br>① <b>큰 모양부터</b>: 머리 동그라미, 몸통 → 작은 것은 나중에<br>② 선은 짧게 여러 번보다 <b>길게 한 번에</b>. 손떨림 보정을 5쯤으로!<br>③ 가끔 📚에서 📐 가이드를 끄고 내 그림만 보며 비교해요<br>④ 따라 그린 다음엔 <b>안 보고 한 번 더</b> 그려 보면 실력이 쑥쑥!</div>
  <div class="tipcard" style="font-size:13.5px"><b>🤝 그림 예절</b><br>다른 사람 그림을 따라 그린 건 <b>연습용</b>이에요. SNS에 올릴 땐 "○○ 작가님 그림 따라 그렸어요"처럼 꼭 원래 작가를 밝히고, 내 작품이라고 하지 않아요.</div><div style="height:20px"></div>`;
  el.querySelectorAll('[data-ti]').forEach(b => b.onclick = () => pickTraceImage(b.dataset.ti));
  $('#trVid').onclick = pickTraceVideo;
  renderTraceBook();
}

const TH = {};
function traceThumb(E) {
  if (TH[E.id]) return TH[E.id];
  const [W, H] = E.size; const tw = 300, th = Math.round(tw * Math.min(H / W, 1.3)); const c = mkCanvas(tw, th); const x = c.getContext('2d');
  x.fillStyle = '#fffdf9'; x.fillRect(0, 0, tw, th); const s = Math.min(tw / W, th / H) * .92; x.translate((tw - W * s) / 2, (th - H * s) / 2); x.scale(s, s);
  const ink = () => { x.setLineDash([]); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#2a2433'; x.fillStyle = '#2a2433'; x.lineWidth = 7; x.globalAlpha = 1; };
  if (E.kind === 'anim') { x.save(); x.globalAlpha = .28; E.frame(x, 3); x.restore(); x.fillStyle = '#fffdf9'; x.fillRect(0, 0, W, 60); x.save(); E.frame(x, 0); x.restore(); }
  else {
    if (E.panels) E.panels.forEach(pn => { x.save(); ink(); x.lineWidth = 6; x.beginPath(); pn.pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke(); x.restore(); });
    if (E.objects) E.objects.forEach(o => { x.save(); ink(); x.lineWidth = 5; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(o.x, o.y, o.w / 2, o.h / 2, 0, 0, Math.PI * 2); x.fill(); x.stroke(); x.fillStyle = '#2a2433'; x.font = '30px Jua'; x.textAlign = 'center'; x.fillText(o.text || '', o.x, o.y + 10); x.restore(); });
    E.items.forEach(fn => { x.save(); ink(); try { fn(x); } catch (e) { } x.restore(); });
  }
  return (TH[E.id] = c.toDataURL('image/png'));
}
function renderTraceBook() {
  const cat = LS.get('trCat', 'art'); const done = LS.get('learn', {});
  const CATS = [['art', '그림'], ['toon', '웹툰'], ['anim', '애니']];
  const list = c => c === 'anim' ? TRACE_LESSONS.filter(e => e.kind === 'anim').map(e => ({ E: e, t: 'trace' })).concat(ANIM_EXAMPLES.map(e => ({ E: e, t: 'example', lv: EX_LV[e.id] || 2 }))) : TRACE_LESSONS.filter(e => e.kind === c).map(e => ({ E: e, t: 'trace' }));
  $('#trSeg').innerHTML = CATS.map(([k, n]) => `<button data-c="${k}" class="${k === cat ? 'on' : ''}">${n}<i>${list(k).length}</i></button>`).join('');
  $('#trSeg').querySelectorAll('button').forEach(b => b.onclick = () => { LS.set('trCat', b.dataset.c); renderTraceBook(); });
  const items = list(cat); const SUB = ['', '처음 시작해요', '조금 더 자세히', '작가처럼 도전'];
  let h = '';
  [1, 2, 3].forEach(lv => {
    const g = items.filter(it => (it.lv || it.E.lv) === lv); if (!g.length) return;
    h += `<div class="tr-lv"><span class="lvb lv${lv}">${LVN[lv]}</span><b>${SUB[lv]}</b><i>${g.length}개</i></div><div class="tr-grid">`;
    g.forEach(({ E, t }) => {
      const isDone = done[t + ':' + E.id]; const nSteps = (E.steps || []).length;
      const th = t === 'trace' ? `<img src="${traceThumb(E)}" alt="">` : `<div class="tr-em">${E.em}</div>`;
      h += `<button class="tr-card ${isDone ? 'done' : ''}" data-t="${t}" data-id="${E.id}"><div class="tr-th">${th}${t === 'example' ? `<span class="tr-tag">${E.kind === 'key' ? '키프레임' : '한 장씩'}</span>` : ''}</div><div class="tr-meta"><b>${E.name.replace(' (애니)', '')}</b><small>${E.desc}</small><em>${nSteps ? nSteps + '단계' : ''}${E.frames ? ' · ' + E.frames + '장' : ''}</em></div></button>`;
    });
    h += '</div>';
  });
  $('#trBook').innerHTML = h;
  $('#trBook').querySelectorAll('.tr-card').forEach(b => b.onclick = () => b.dataset.t === 'trace' ? startTrace(b.dataset.id) : startExample(b.dataset.id));
}
