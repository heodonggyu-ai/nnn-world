/* ================= PANEL TEMPLATES (100 x 160 units) ================= */
const TU = 8; // unit -> px (800x1280)
const R = (x, y, w, h, o = {}) => ({ pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], ...o });
const P = (...a) => { const o = typeof a[a.length - 1] === 'object' && !Array.isArray(a[a.length - 1]) ? a.pop() : {}; return { pts: a, ...o }; };
const E = (x, y, w, h, o = {}) => { const pts = []; for (let i = 0; i < 48; i++) { const t = i / 48 * Math.PI * 2; pts.push([x + w / 2 + Math.cos(t) * w / 2, y + h / 2 + Math.sin(t) * h / 2]); } return { pts, curve: true, ...o }; };
const RR = (x, y, w, h, r, o = {}) => { const pts = []; const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]]; c.forEach(([cx, cy, a0]) => { for (let i = 0; i <= 6; i++) { const a = (a0 + i * 15) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return { pts, curve: true, ...o }; };
const HEART = (x, y, w, h, o = {}) => { const pts = []; for (let i = 0; i < 60; i++) { const t = i / 60 * Math.PI * 2; const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); pts.push([x + w / 2 + hx / 17 * w / 2, y + h / 2 + (hy + 2) / 17 * h / 2]); } return { pts, curve: true, ...o }; };
const STARP = (x, y, w, h, o = {}) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; pts.push([x + w / 2 + Math.cos(a) * w / 2 * r, y + h / 2 + .06 * h + Math.sin(a) * h / 2 * r]); } return { pts, curve: true, ...o }; };
const HEX = (cx, cy, r) => { const pts = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1]); } return { pts }; };
const grid = (cols, rows, y0 = 5, h = 150, x0 = 5, w = 90, g = 4) => { const out = []; const cw = (w - g * (cols - 1)) / cols, ch = (h - g * (rows - 1)) / rows; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(R(x0 + c * (cw + g), y0 + r * (ch + g), cw, ch)); return out; };

const TEMPLATE_CATS = [
  { id: 'basic', name: '기본' }, { id: 'scroll', name: '세로 스크롤' }, { id: 'action', name: '액션·충격' }, { id: 'emotion', name: '감정·분위기' },
  { id: 'talk', name: '대화' }, { id: 'four', name: '4컷·연습' }, { id: 'fun', name: '재밌는 모양' },
];
const TEMPLATES = [
  // 기본
  { cat: 'basic', name: '한 칸 크게', desc: '가장 중요한 장면, 주인공 첫 등장, 표지에 써요.', panels: [R(5, 5, 90, 150)] },
  { cat: 'basic', name: '위아래 2칸', desc: '"행동 → 결과"처럼 두 장면을 이어 보여줄 때.', panels: [R(5, 5, 90, 73), R(5, 82, 90, 73)] },
  { cat: 'basic', name: '위아래 3칸', desc: '시간 순서대로 차근차근 보여주는 기본 칸.', panels: [R(5, 5, 90, 47.3), R(5, 56.3, 90, 47.3), R(5, 107.6, 90, 47.3)] },
  { cat: 'basic', name: '큰 칸 + 작은 2칸', desc: '위에서 장면 전체를 보여주고, 아래에서 두 사람 반응을 보여줘요.', panels: [R(5, 5, 90, 90), R(5, 99, 43, 56), R(52, 99, 43, 56)] },
  { cat: 'basic', name: '작은 2칸 + 큰 칸', desc: '두 컷으로 쌓아 올린 다음 큰 칸에서 "짠!" 하고 보여줘요.', panels: [R(5, 5, 43, 56), R(52, 5, 43, 56), R(5, 65, 90, 90)] },
  { cat: 'basic', name: '가운데 강조', desc: '세 칸 중 가운데 장면이 제일 중요할 때.', panels: [R(5, 5, 90, 36), R(5, 45, 90, 70), R(5, 119, 90, 36)] },
  { cat: 'basic', name: '바둑판 4칸', desc: '같은 크기로 비교하거나 여러 사람을 소개할 때.', panels: grid(2, 2) },
  { cat: 'basic', name: '6칸', desc: '짧은 장면 여러 개를 빠르게 넘길 때 (출판 만화 느낌).', panels: grid(2, 3) },
  { cat: 'basic', name: '왼쪽 긴 칸', desc: '서 있는 인물 전신 + 오른쪽에 설명 장면.', panels: [R(5, 5, 50, 150), R(59, 5, 36, 73), R(59, 82, 36, 73)] },
  // 세로 스크롤
  { cat: 'scroll', name: '여백 + 한 칸', desc: '위아래 하얀 여백 = 시간이 흐르거나 숨을 고르는 순간. 웹툰에서 아주 많이 써요!', panels: [R(8, 45, 84, 70)] },
  { cat: 'scroll', name: '엇갈린 두 칸', desc: '대화를 주고받을 때. 왼쪽 칸 = A, 오른쪽 칸 = B로 정하면 읽기 쉬워요.', panels: [R(5, 10, 62, 62), R(33, 88, 62, 62)] },
  { cat: 'scroll', name: '계단 세 칸', desc: '시선이 지그재그로 내려가며 리듬이 생겨요. 걷기, 달리기에 좋아요.', panels: [R(5, 5, 56, 46), R(24, 57, 56, 46), R(39, 109, 56, 46)] },
  { cat: 'scroll', name: '풍경 + 반응', desc: '넓은 풍경을 먼저 보여주고, 작은 칸에 인물 반응 ("우와...").', panels: [R(5, 8, 90, 70), R(52, 96, 43, 46)] },
  { cat: 'scroll', name: '세로로 긴 칸', desc: '높은 건물, 키 큰 사람, 떨어지는 장면처럼 높이를 느끼게 해요.', panels: [R(26, 5, 48, 150)] },
  { cat: 'scroll', name: '좁은 띠 3개', desc: '눈 → 손 → 발처럼 클로즈업을 빠르게 보여주면 긴장감 UP.', panels: [R(5, 14, 90, 28), R(5, 66, 90, 28), R(5, 118, 90, 28)] },
  { cat: 'scroll', name: '테두리 없는 칸', desc: '꿈, 회상, 마음속 독백처럼 몽글몽글한 장면. 그림이 화면에 녹아들어요.', panels: [R(0, 10, 100, 140, { border: 'none' })] },
  { cat: 'scroll', name: '화면 꽉 (전체)', desc: '칸 없이 화면 전체를 쓰는 큰 장면. 배경이 끝까지 이어져요.', panels: [R(0, 0, 100, 160, { border: 'none' })] },
  { cat: 'scroll', name: '작게 → 크게', desc: '점점 커지는 칸 = 점점 다가오는 느낌, 긴장감 고조!', panels: [R(35, 6, 30, 26), R(22, 38, 56, 42), R(5, 86, 90, 69)] },
  { cat: 'scroll', name: '크게 → 작게', desc: '점점 작아지면 멀어지거나 쓸쓸한 느낌이 나요.', panels: [R(5, 5, 90, 66), R(22, 79, 56, 42), R(35, 128, 30, 26)] },
  // 액션
  { cat: 'action', name: '사선 2칸', desc: '비스듬한 선은 움직임과 속도를 느끼게 해요. 달리기, 날아차기!', panels: [P([5, 5], [95, 5], [95, 58], [5, 92]), P([5, 99], [95, 65], [95, 155], [5, 155])] },
  { cat: 'action', name: '사선 3칸', desc: '빠르게 이어지는 액션 3단 콤보.', panels: [P([5, 5], [95, 5], [95, 38], [5, 58]), P([5, 64], [95, 44], [95, 92], [5, 112]), P([5, 118], [95, 98], [95, 155], [5, 155])] },
  { cat: 'action', name: '번개 지그재그', desc: '번쩍! 갑작스러운 사건, 전기, 큰 충격.', panels: [P([5, 5], [95, 5], [95, 62], [70, 72], [55, 58], [30, 74], [5, 64]), P([5, 72], [30, 82], [55, 66], [70, 80], [95, 70], [95, 155], [5, 155])] },
  { cat: 'action', name: '깨진 칸 (충격)', desc: '쾅! 유리처럼 깨진 칸. 큰 충돌이나 놀라운 순간에.', panels: [P([5, 5], [95, 5], [95, 50], [52, 76]), P([5, 12], [46, 78], [5, 120]), P([95, 58], [95, 155], [60, 155], [55, 84]), P([5, 128], [49, 86], [53, 155], [5, 155])] },
  { cat: 'action', name: '슝! 평행사변형', desc: '오른쪽으로 기울어진 칸들이 빠른 속도감을 줘요.', panels: [P([15, 5], [95, 5], [85, 50], [5, 50]), P([15, 55], [95, 55], [85, 100], [5, 100]), P([15, 105], [95, 105], [85, 155], [5, 155])] },
  { cat: 'action', name: '터지는 큰 칸', desc: '작은 칸으로 모은 다음, 아래 큰 사선 칸에서 빵 터뜨려요.', panels: [R(5, 5, 43, 34), R(52, 5, 43, 34), P([5, 43], [95, 43], [95, 155], [5, 155], { border: 'thick' })] },
  // 감정
  { cat: 'emotion', name: '눈 클로즈업 → 얼굴', desc: '눈만 먼저 보여주면 감정이 확 전달돼요. 깨달음, 결심, 놀람.', panels: [R(5, 12, 90, 22), R(5, 44, 90, 106)] },
  { cat: 'emotion', name: '동그란 회상', desc: '동그란 칸은 기억, 꿈, 상상을 표현해요.', panels: [E(10, 30, 80, 80, { border: 'dashed' })] },
  { cat: 'emotion', name: '몽글 꿈 칸', desc: '모서리가 둥근 점선 칸 = 꿈이나 옛날 이야기.', panels: [RR(6, 8, 88, 70, 12, { border: 'dashed' }), R(5, 88, 90, 67)] },
  { cat: 'emotion', name: '세 표정 나란히', desc: '세 사람의 서로 다른 반응을 한 번에! 웃음 포인트에 좋아요.', panels: [R(5, 45, 28, 50), R(36, 45, 28, 50), R(67, 45, 28, 50)] },
  { cat: 'emotion', name: '조용한 여백', desc: '작은 칸 하나 + 큰 여백 = 쓸쓸함, 침묵, "......"', panels: [R(30, 60, 40, 40)] },
  { cat: 'emotion', name: '두근두근 클로즈업', desc: '얼굴 → 더 가까이 → 눈. 설레는 장면에!', panels: [R(5, 5, 90, 52), R(15, 63, 70, 44), R(25, 113, 50, 42)] },
  // 대화
  { cat: 'talk', name: '좌우 교차 4칸', desc: '두 사람 대화: 왼쪽 칸은 A, 오른쪽 칸은 B. 말풍선 위치도 같이 맞춰요.', panels: [R(5, 5, 58, 34), R(37, 43, 58, 34), R(5, 81, 58, 34), R(37, 119, 58, 36)] },
  { cat: 'talk', name: '마주보기 2칸', desc: '두 사람이 마주 보는 장면. 왼쪽 인물은 오른쪽을, 오른쪽 인물은 왼쪽을 보게!', panels: [R(5, 30, 43, 100), R(52, 30, 43, 100)] },
  { cat: 'talk', name: '전화 통화', desc: '사선으로 나뉜 두 공간 = 멀리 떨어져 통화하는 두 사람.', panels: [P([5, 30], [62, 30], [38, 130], [5, 130]), P([66, 30], [95, 30], [95, 130], [42, 130])] },
  { cat: 'talk', name: '모두 모여 + 대화', desc: '위에서 다 같이 있는 장면, 아래에서 한 명씩 말해요.', panels: [R(5, 5, 90, 60), R(5, 69, 90, 41), R(5, 114, 90, 41)] },
  // 4컷·연습
  { cat: 'four', name: '4컷 만화', desc: '기(시작) → 승(전개) → 전(반전!) → 결(마무리). 4컷 만화 연습의 기본!', panels: [R(5, 5, 90, 34), R(5, 42.6, 90, 34), R(5, 80.2, 90, 34), R(5, 117.8, 90, 37)] },
  { cat: 'four', name: '4컷 + 제목 칸', desc: '맨 위에 제목을 쓰고 아래 4칸에 이야기를.', panels: [R(5, 5, 90, 14, { border: 'none' }), R(5, 23, 90, 30), R(5, 56, 90, 30), R(5, 89, 90, 30), R(5, 122, 90, 33)] },
  { cat: 'four', name: '표정 연습 9칸', desc: '한 캐릭터로 9가지 표정 그리기 연습! (기쁨, 슬픔, 화남, 놀람...)', panels: grid(3, 3, 12, 136) },
  { cat: 'four', name: '캐릭터 시트', desc: '앞 · 옆 · 뒤 모습 + 아래 표정. 캐릭터를 늘 똑같이 그리는 비법!', panels: [R(5, 5, 28, 92), R(36, 5, 28, 92), R(67, 5, 28, 92), R(5, 101, 28, 26), R(36, 101, 28, 26), R(67, 101, 28, 26), R(5, 130, 90, 25, { border: 'dashed' })] },
  { cat: 'four', name: '웹툰 표지', desc: '위에 제목 공간, 아래 큰 그림. 1화 첫 장면이나 썸네일로.', panels: [R(5, 5, 90, 30, { border: 'none' }), R(5, 38, 90, 117)] },
  { cat: 'four', name: '콘티 8칸', desc: '그리기 전에 작게 이야기 흐름을 짜보는 연습장 (콘티).', panels: grid(2, 4) },
  // 재밌는 모양
  { cat: 'fun', name: '하트 칸', desc: '사랑 고백, 설레는 장면 💗', panels: [HEART(8, 30, 84, 84)] },
  { cat: 'fun', name: '별 칸', desc: '반짝! 꿈이 이루어지는 장면, 스타 등장 ⭐', panels: [STARP(5, 28, 90, 90)] },
  { cat: 'fun', name: 'TV 화면', desc: 'TV나 뉴스 속 장면을 보여줄 때 📺', panels: [RR(8, 40, 84, 60, 8), R(40, 104, 20, 6, { border: 'thick' })] },
  { cat: 'fun', name: '스마트폰 화면', desc: '문자·채팅 장면! 안에 말풍선을 넣어 카톡처럼 📱', panels: [RR(20, 8, 60, 144, 9)] },
  { cat: 'fun', name: '창문 4칸', desc: '창문 밖 풍경이나 이웃집 엿보기 🪟', panels: grid(2, 2, 30, 100, 15, 70, 3) },
  { cat: 'fun', name: '벌집 칸', desc: '여러 친구를 귀엽게 소개할 때 🐝', panels: [HEX(30, 40, 22), HEX(70, 63, 22), HEX(30, 86, 22), HEX(70, 109, 22), HEX(30, 132, 22)] },
  { cat: 'fun', name: '돋보기 칸', desc: '작은 단서를 크게 보여주는 탐정 장면 🔍', panels: [R(5, 5, 90, 95), E(45, 92, 50, 50, { border: 'thick' })] },
];
function tplToPanels(t) { return t.panels.map(p => ({ pts: p.pts.map(q => [Math.round(q[0] * TU * 10) / 10, Math.round(q[1] * TU * 10) / 10]), border: p.border || 'solid', curve: !!p.curve })); }
function tplSVG(t, w = 56, h = 90) {
  const s = t.panels.map(p => `<polygon points="${p.pts.map(q => q[0] + ',' + q[1]).join(' ')}" fill="#fff6fb" stroke="${p.border === 'none' ? '#d9cfe8' : '#222'}" stroke-width="${p.border === 'thick' ? 2.6 : 1.6}" ${p.border === 'dashed' ? 'stroke-dasharray="4 3"' : ''} ${p.border === 'none' ? 'stroke-dasharray="1 3"' : ''}/>`).join('');
  return `<svg viewBox="0 0 100 160" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="160" fill="#fff"/>${s}</svg>`;
}
