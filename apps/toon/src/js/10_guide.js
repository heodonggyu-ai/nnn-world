/* ================= WEBTOON SCHOOL ================= */
// --- SVG helpers ---
function sceneSVG(vb, extra = '') {
  // world 800x600: ground at 470, kid character at x=400
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <rect x="-2000" y="-2000" width="5000" height="2470" fill="#cfeaff"/><rect x="-2000" y="470" width="5000" height="2000" fill="#bfe6a8"/>
  <circle cx="660" cy="120" r="46" fill="#ffd84d"/><g fill="#fff"><ellipse cx="180" cy="120" rx="60" ry="22"/><ellipse cx="220" cy="105" rx="40" ry="22"/></g>
  <rect x="80" y="330" width="120" height="140" fill="#ffd9b8" stroke="#8a5a3c" stroke-width="3"/><polygon points="65,335 140,270 215,335" fill="#e86a5a" stroke="#8a5a3c" stroke-width="3"/><rect x="125" y="410" width="30" height="60" fill="#8a5a3c"/>
  <rect x="612" y="380" width="18" height="90" fill="#8a5a3c"/><circle cx="621" cy="360" r="46" fill="#5fbf6a"/>
  <g stroke="#2d2a3a" stroke-width="3" stroke-linecap="round">
   <line x1="392" y1="420" x2="384" y2="468"/><line x1="408" y1="420" x2="416" y2="468"/>
   <path d="M383 350 Q400 342 417 350 L420 422 L380 422 Z" fill="#ff7aa8"/>
   <line x1="384" y1="356" x2="366" y2="398"/><line x1="416" y1="356" x2="436" y2="392"/>
   <circle cx="400" cy="320" r="27" fill="#ffe0cc"/>
  </g>
  <path d="M373 318 Q372 288 400 287 Q429 288 427 318 Q420 300 400 300 Q382 300 373 318Z" fill="#5a3a2a"/>
  <circle cx="391" cy="323" r="3.2" fill="#2d2a3a"/><circle cx="409" cy="323" r="3.2" fill="#2d2a3a"/><circle cx="392" cy="322" r="1" fill="#fff"/><circle cx="410" cy="322" r="1" fill="#fff"/>
  <path d="M393 333 Q400 339 407 333" stroke="#2d2a3a" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="386" cy="331" rx="4" ry="2.4" fill="#ffadc4"/><ellipse cx="414" cy="331" rx="4" ry="2.4" fill="#ffadc4"/>${extra}</svg>`;
}
const FACE_DEFS = {
  happy: { n: '기쁨', brow: 'up', eye: 'happy', mouth: 'smile', ex: 'blush' },
  laugh: { n: '신남', brow: 'up', eye: 'closedU', mouth: 'openD', ex: 'sparkle' },
  sad: { n: '슬픔', brow: 'sad', eye: 'sad', mouth: 'frown', ex: 'tear' },
  cry: { n: '엉엉', brow: 'sad', eye: 'closedN', mouth: 'wail', ex: 'tears' },
  angry: { n: '화남', brow: 'angry', eye: 'angry', mouth: 'grit', ex: 'vein' },
  surprise: { n: '놀람', brow: 'high', eye: 'dot', mouth: 'o', ex: 'lines' },
  shy: { n: '부끄', brow: 'sad', eye: 'away', mouth: 'wavy', ex: 'blushL' },
  panic: { n: '당황', brow: 'sad', eye: 'swirl', mouth: 'wavy', ex: 'sweat' },
  scared: { n: '무서움', brow: 'sad', eye: 'tiny', mouth: 'zig', ex: 'gloom' },
  sleepy: { n: '졸림', brow: 'flat', eye: 'closedN', mouth: 'small', ex: 'zzz' },
  smug: { n: '뿌듯', brow: 'up', eye: 'half', mouth: 'smirk', ex: '' },
  love: { n: '반함', brow: 'up', eye: 'heart', mouth: 'smile', ex: 'blush' },
};
function faceSVG(k) {
  const f = FACE_DEFS[k]; const s = '#2d2a3a'; let g = '';
  const brows = { up: 'M30 33 Q36 28 42 31 M58 31 Q64 28 70 33', sad: 'M30 30 Q37 31 42 35 M58 35 Q63 31 70 30', angry: 'M30 30 L43 37 M70 30 L57 37', high: 'M30 26 Q36 21 42 25 M58 25 Q64 21 70 26', flat: 'M31 33 L42 33 M58 33 L69 33' }[f.brow];
  g += `<path d="${brows}" stroke="${s}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const E = { happy: `<path d="M31 45 Q36 39 41 45 M59 45 Q64 39 69 45" stroke="${s}" stroke-width="3" fill="none" stroke-linecap="round"/>`, closedU: `<path d="M30 44 Q36 38 42 44 M58 44 Q64 38 70 44" stroke="${s}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`, closedN: `<path d="M30 43 Q36 48 42 43 M58 43 Q64 48 70 43" stroke="${s}" stroke-width="3" fill="none" stroke-linecap="round"/>`, sad: `<ellipse cx="36" cy="45" rx="4.5" ry="6" fill="${s}"/><ellipse cx="64" cy="45" rx="4.5" ry="6" fill="${s}"/><circle cx="37.5" cy="43" r="1.7" fill="#fff"/><circle cx="65.5" cy="43" r="1.7" fill="#fff"/>`, angry: `<path d="M31 42 L42 45 L36 49 Z M69 42 L58 45 L64 49 Z" fill="${s}"/>`, dot: `<circle cx="36" cy="44" r="6.5" fill="#fff" stroke="${s}" stroke-width="2"/><circle cx="64" cy="44" r="6.5" fill="#fff" stroke="${s}" stroke-width="2"/><circle cx="36" cy="44" r="1.8" fill="${s}"/><circle cx="64" cy="44" r="1.8" fill="${s}"/>`, away: `<ellipse cx="33" cy="45" rx="3.6" ry="5" fill="${s}"/><ellipse cx="61" cy="45" rx="3.6" ry="5" fill="${s}"/>`, swirl: `<path d="M36 44 m-5 0 a5 5 0 1 0 5 -5 a3 3 0 1 0 3 3 M64 44 m-5 0 a5 5 0 1 0 5 -5 a3 3 0 1 0 3 3" stroke="${s}" stroke-width="1.8" fill="none"/>`, tiny: `<circle cx="36" cy="45" r="2" fill="${s}"/><circle cx="64" cy="45" r="2" fill="${s}"/><circle cx="36" cy="45" r="6" fill="none" stroke="${s}" stroke-width="1.4"/><circle cx="64" cy="45" r="6" fill="none" stroke="${s}" stroke-width="1.4"/>`, half: `<path d="M30 44 L42 44" stroke="${s}" stroke-width="2.6" stroke-linecap="round"/><path d="M58 44 L70 44" stroke="${s}" stroke-width="2.6" stroke-linecap="round"/><path d="M32 44 Q36 49 40 44 M60 44 Q64 49 68 44" fill="${s}"/>`, heart: `<path d="M36 50 C27 43 31 36 36 41 C41 36 45 43 36 50Z M64 50 C55 43 59 36 64 41 C69 36 73 43 64 50Z" fill="#ff4d7d"/>` };
  g += E[f.eye];
  const M = { smile: 'M41 62 Q50 70 59 62', openD: 'M40 60 Q50 76 60 60 Z', frown: 'M42 67 Q50 61 58 67', wail: 'M41 66 Q50 56 59 66 Q50 74 41 66Z', grit: 'M40 62 L60 62 L60 67 L40 67 Z', o: 'M50 60 m-5 0 a5 6 0 1 0 10 0 a5 6 0 1 0 -10 0', wavy: 'M41 64 Q45 61 48 64 Q52 67 55 64 Q58 61 60 64', zig: 'M40 64 L44 61 L48 65 L52 61 L56 65 L60 62', small: 'M47 64 Q50 66 53 64', smirk: 'M42 64 Q53 68 59 60' }[f.mouth];
  const filled = ['openD', 'wail', 'grit', 'o'].includes(f.mouth);
  g += `<path d="${M}" stroke="${s}" stroke-width="2.6" fill="${filled ? (f.mouth === 'grit' ? '#fff' : '#c2445e') : 'none'}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const X = { blush: '<ellipse cx="29" cy="56" rx="6" ry="3.4" fill="#ffadc4"/><ellipse cx="71" cy="56" rx="6" ry="3.4" fill="#ffadc4"/>', blushL: '<g stroke="#ff6f91" stroke-width="1.8" stroke-linecap="round"><path d="M24 58 L28 52 M29 58 L33 52 M34 58 L38 52 M62 58 L66 52 M67 58 L71 52 M72 58 L76 52"/></g>', tear: '<path d="M66 52 Q63 59 66 62 Q69 59 66 52Z" fill="#6cc4ff"/>', tears: '<path d="M33 48 Q30 64 33 74 M67 48 Q70 64 67 74" stroke="#6cc4ff" stroke-width="4" fill="none" stroke-linecap="round"/>', vein: '<path d="M76 18 l6 6 m0 -6 l-6 6 M74 21 h10 M79 16 v10" stroke="#e5383b" stroke-width="2.4" stroke-linecap="round"/>', lines: '<g stroke="#2d2a3a" stroke-width="2" stroke-linecap="round"><path d="M20 14 l5 6 M50 6 v8 M80 14 l-5 6"/></g>', sweat: '<path d="M80 26 Q76 34 80 37 Q84 34 80 26Z" fill="#6cc4ff" stroke="#2d2a3a" stroke-width="1"/>', gloom: '<g stroke="#5a5a7a" stroke-width="1.6"><path d="M28 10 v16 M36 10 v12 M44 10 v18 M52 10 v13 M60 10 v17 M68 10 v11"/></g>', zzz: '<text x="74" y="22" font-size="13" font-family="Jua" fill="#6c4bff">Zz</text>', sparkle: '<path d="M82 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffc84a"/>' }[f.ex] || '';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="52" r="38" fill="#ffe8d8" stroke="${s}" stroke-width="2.4"/><path d="M14 46 Q14 12 50 12 Q86 12 86 46 Q78 26 58 24 Q48 32 30 30 Q20 34 14 46Z" fill="#6b4632"/>${g}${X}</svg>`;
}
function figSVG(w, h, inner) { return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`; }
function angleFig(kind) {
  const s = '#2d2a3a';
  if (kind === 'eye') return figSVG(120, 90, `<rect width="120" height="90" fill="#eef6ff"/><rect y="62" width="120" height="28" fill="#d9efc9"/><circle cx="60" cy="28" r="11" fill="#ffe0cc" stroke="${s}" stroke-width="2"/><path d="M52 40 h16 l3 24 h-22z" fill="#ff7aa8" stroke="${s}" stroke-width="2"/><path d="M55 64 v14 M65 64 v14" stroke="${s}" stroke-width="2.4"/>`);
  if (kind === 'high') return figSVG(120, 90, `<rect width="120" height="90" fill="#d9efc9"/><ellipse cx="60" cy="74" rx="14" ry="5" fill="#0002"/><path d="M53 44 h14 l-3 26 h-8z" fill="#ff7aa8" stroke="${s}" stroke-width="2"/><path d="M57 70 v6 M63 70 v6" stroke="${s}" stroke-width="2"/><circle cx="60" cy="32" r="16" fill="#ffe0cc" stroke="${s}" stroke-width="2"/><path d="M44 30 Q46 15 60 15 Q74 15 76 30 Q66 22 60 22 Q52 22 44 30Z" fill="#5a3a2a"/><text x="6" y="14" font-size="10" font-family="Jua" fill="#555">위에서 ↓</text>`);
  if (kind === 'low') return figSVG(120, 90, `<rect width="120" height="90" fill="#cfeaff"/><circle cx="60" cy="18" r="7" fill="#ffe0cc" stroke="${s}" stroke-width="2"/><path d="M54 26 h12 l6 32 h-24z" fill="#ff7aa8" stroke="${s}" stroke-width="2"/><path d="M50 58 l-6 30 M70 58 l6 30" stroke="${s}" stroke-width="5"/><text x="6" y="84" font-size="10" font-family="Jua" fill="#555">아래에서 ↑</text>`);
  if (kind === 'bird') return figSVG(120, 90, `<rect width="120" height="90" fill="#bfe6a8"/><rect x="10" y="10" width="34" height="26" fill="#ffd9b8" stroke="#8a5a3c" stroke-width="2"/><rect x="78" y="52" width="30" height="28" fill="#ffd9b8" stroke="#8a5a3c" stroke-width="2"/><path d="M0 46 h120" stroke="#e9e1c8" stroke-width="12"/><circle cx="60" cy="46" r="5" fill="#5a3a2a"/><circle cx="66" cy="50" r="2" fill="#ff7aa8"/><text x="6" y="86" font-size="10" font-family="Jua" fill="#555">하늘에서 본 지도처럼</text>`);
  if (kind === 'dutch') return figSVG(120, 90, `<rect width="120" height="90" fill="#efe6ff"/><g transform="rotate(-14 60 45)"><rect x="-20" y="62" width="160" height="40" fill="#cfc2e8"/><circle cx="60" cy="28" r="11" fill="#ffe0cc" stroke="${s}" stroke-width="2"/><path d="M52 40 h16 l3 24 h-22z" fill="#8d7bb8" stroke="${s}" stroke-width="2"/><path d="M55 64 v14 M65 64 v14" stroke="${s}" stroke-width="2.4"/></g>`);
  return '';
}
function stripSVG(gaps, label) {
  let y = 6, out = ''; gaps.forEach((g, i) => { out += `<rect x="10" y="${y}" width="60" height="${g[0]}" fill="#fff" stroke="#2d2a3a" stroke-width="1.6"/>`; y += g[0] + g[1]; });
  return `<svg viewBox="0 0 80 ${y}" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="${y}" fill="#fafafa"/>${out}</svg>`;
}

const LESSONS = [
  { id: 'steps', em: '🗺️', t: '웹툰 만드는 순서', s: '아이디어부터 완성까지 7단계', h: () => `
  <h2>🗺️ 웹툰 만드는 순서</h2><p>진짜 웹툰 작가들도 이 순서로 만들어요. 한 번에 다 하려고 하지 말고 하나씩!</p>
  <ol><li><b>💡 아이디어</b> — "만약에 ~라면?" 하고 상상해요. (아이디어 탭에서 뽑기 가능!)</li>
  <li><b>🧍 캐릭터</b> — 주인공 이름, 성격, 좋아하는 것, 대표 색을 정해요.</li>
  <li><b>📖 줄거리</b> — 기(시작) · 승(사건) · 전(반전) · 결(마무리) 4줄로 써 봐요.</li>
  <li><b>✏️ 콘티</b> — 칸을 나누고 졸라맨처럼 대충 그려서 흐름을 확인해요. <span class="pill">템플릿: 콘티 8칸</span></li>
  <li><b>🖊 밑그림 → 선화</b> — 밑그림 레이어를 연하게 만들고, 새 레이어에 G펜으로 깔끔하게!</li>
  <li><b>🎨 채색</b> — 밑색 → 그림자 → 빛 순서로. 레이어를 나누면 고치기 쉬워요.</li>
  <li><b>💬 말풍선 · 효과</b> — 대사, 효과음, 집중선을 넣어요. 마지막에 👁 미리보기로 읽어 봐요!</li></ol>
  <div class="box">🙌 처음엔 <b>4컷 만화</b>부터! 짧게 완성하는 경험이 제일 중요해요. 완성한 4컷이 10개 쌓이면 실력이 쑥쑥 늘어요.</div>` },
  { id: 'panels', em: '▦', t: '칸 나누기 기본', s: '세로 스크롤 웹툰의 칸 규칙', h: () => `
  <h2>▦ 칸 나누기 기본</h2><p>칸(컷)은 영화의 장면 같은 거예요. 웹툰은 폰으로 <b>위에서 아래로</b> 스크롤하며 읽어요.</p>
  <h3>1. 한 칸 = 한 순간</h3><p>한 칸에는 한 가지 행동만! "문을 열고, 놀라고, 소리치는" 걸 한 칸에 넣으면 헷갈려요. 세 칸으로 나눠요.</p>
  <h3>2. 큰 칸 = 중요한 장면</h3><p>가장 멋진 장면, 깜짝 놀랄 장면은 크게! 평범한 장면은 작게 해서 리듬을 만들어요.</p>
  <h3>3. 여백 = 시간과 긴장</h3><div class="fig-row"><div class="fig">${stripSVG([[30, 6], [30, 6], [30, 6], [30, 6]])}<b>빠르게 ⚡</b>칸이 붙어 있으면 빠르게 읽혀요 (액션, 웃긴 장면)</div><div class="fig">${stripSVG([[34, 34], [34, 44], [34, 0]])}<b>천천히 🌙</b>여백이 길면 시간이 흐르거나 두근두근 긴장돼요</div></div>
  <div class="box blue">💡 반전이나 깜짝 장면 바로 <b>위</b>에 여백을 길게 두면, 스크롤을 내리는 순간 "짠!" 하고 나타나서 효과가 2배!</div>
  <h3>4. 칸 모양에도 뜻이 있어요</h3><ul><li>⬛ 네모 = 평범한 장면</li><li>⟋ 비스듬한 칸 = 속도, 움직임, 액션</li><li>⚪ 동그란 칸, 점선 칸 = 꿈, 기억, 상상</li><li>⬜ 테두리 없는 칸 = 감정, 독백, 분위기</li><li>⚡ 깨진 칸 = 충격!</li></ul>
  <div class="box green">✨ 앱의 <b>웹툰 → 칸 나누기</b>에 칸 모양 ${TEMPLATES.length}가지가 있어요. 누르면 언제 쓰는지 알려줘요!</div>` },
  { id: 'shots', em: '🎥', t: '카메라 샷 크기', s: '멀리서? 가까이서? 장면 크기 고르기', h: () => `
  <h2>🎥 카메라 샷 크기</h2><p>같은 장면도 <b>얼마나 가까이</b> 보여주느냐에 따라 느낌이 달라져요. 웹툰 작가는 카메라 감독이에요!</p>
  <div class="fig-row">
  <div class="fig">${sceneSVG('-400 -300 1600 1200')}<b>아주 멀리</b>어디인지 보여줘요 (이야기 시작)</div>
  <div class="fig">${sceneSVG('0 0 800 600')}<b>먼 장면</b>장소 + 인물</div>
  <div class="fig">${sceneSVG('290 270 220 165')}<b>전신 (풀샷)</b>무엇을 하는지, 옷, 포즈</div>
  <div class="fig">${sceneSVG('330 282 140 105')}<b>허리 위 (미디엄)</b>대화할 때 가장 많이 써요</div>
  <div class="fig">${sceneSVG('355 288 90 67')}<b>가슴 위 (바스트)</b>표정 + 몸짓</div>
  <div class="fig">${sceneSVG('368 291 64 48')}<b>얼굴 (클로즈업)</b>감정을 크게!</div>
  <div class="fig">${sceneSVG('380 312 40 30')}<b>눈만 (초근접)</b>긴장, 결심, 충격</div></div>
  <div class="box">📌 같은 크기 샷만 계속 쓰면 지루해요. <b>멀리 → 중간 → 가까이</b>를 섞어 쓰세요!<br>예) 학교 전경(멀리) → 교실에 들어오는 주인공(전신) → 친구와 대화(허리 위) → 깜짝 놀란 얼굴(클로즈업)</div>` },
  { id: 'angles', em: '📐', t: '카메라 앵글', s: '어디서 내려다볼까, 올려다볼까', h: () => `
  <h2>📐 카메라 앵글</h2><p>카메라를 <b>어느 높이</b>에 두느냐에 따라 인물이 강해 보이기도, 작고 약해 보이기도 해요.</p>
  <div class="fig-row"><div class="fig">${angleFig('eye')}<b>눈높이</b>평범하고 편안해요. 기본!</div><div class="fig">${angleFig('high')}<b>내려다보기</b>작고 외로워 보여요. 슬픔, 혼자</div><div class="fig">${angleFig('low')}<b>올려다보기</b>크고 강해 보여요. 멋진 등장, 무서운 상대</div><div class="fig">${angleFig('bird')}<b>하늘에서</b>위치를 한눈에. 지도처럼</div><div class="fig">${angleFig('dutch')}<b>기울이기</b>불안, 어지러움, 이상한 일</div></div>
  <div class="box blue">🦸 악당이 처음 나올 때 = <b>올려다보기</b> · 주인공이 길을 잃었을 때 = <b>내려다보기</b>! 감정에 맞게 골라요.</div>` },
  { id: 'bubbles', em: '💬', t: '말풍선 규칙', s: '읽기 쉬운 대사 배치', h: () => `
  <h2>💬 말풍선 규칙</h2>
  <div class="fig-wide">${figSVG(300, 150, `<rect width="300" height="150" fill="#fff"/><rect x="8" y="8" width="284" height="134" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><circle cx="80" cy="112" r="16" fill="#ffe0cc" stroke="#2d2a3a" stroke-width="2"/><circle cx="220" cy="112" r="16" fill="#ffe0cc" stroke="#2d2a3a" stroke-width="2"/><ellipse cx="85" cy="40" rx="52" ry="22" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><path d="M78 60 L80 92 L92 60" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><ellipse cx="85" cy="40" rx="50" ry="20" fill="#fff"/><text x="85" y="45" text-anchor="middle" font-family="Jua" font-size="14">① 안녕!</text><ellipse cx="210" cy="64" rx="55" ry="22" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><path d="M212 84 L219 95 L224 82" fill="#fff" stroke="#2d2a3a" stroke-width="2"/><ellipse cx="210" cy="64" rx="53" ry="20" fill="#fff"/><text x="210" y="69" text-anchor="middle" font-family="Jua" font-size="14">② 오, 반가워</text><path d="M140 40 Q165 42 155 58" stroke="#ff7aa8" stroke-width="2.5" fill="none" marker-end="url(#ar)"/><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#ff7aa8"/></marker></defs>`)}</div>
  <ol><li><b>읽는 순서</b>: 위 → 아래, 왼쪽 → 오른쪽. 먼저 말하는 사람의 말풍선을 더 위에!</li><li><b>꼬리</b>는 말하는 사람 <b>입</b> 쪽을 가리켜요.</li><li><b>얼굴은 가리지 않기.</b> 머리 위나 옆 빈 공간에.</li><li>한 말풍선엔 <b>2~3줄</b>까지. 길면 두 개로 나눠요.</li><li>글자와 테두리 사이에 <b>여유 공간</b>을 둬요. 꽉 끼면 답답해요.</li></ol>
  <h3>말풍선 모양 = 목소리</h3><ul><li>⚪ 동그라미 = 보통 말</li><li>💥 뾰족뾰족 = 소리 지르기!</li><li>☁️ 구름 + 작은 동그라미 꼬리 = 마음속 생각</li><li>┈ 점선 = 속삭임</li><li>〰 떨리는 선 = 무서움, 추위</li><li>⚡ 지그재그 꼬리 = 전화, TV, 로봇</li><li>▭ 네모 상자 = 해설 ("다음 날 아침...")</li></ul>` },
  { id: 'faces', em: '😆', t: '표정 사전', s: '눈썹 · 눈 · 입으로 감정 표현', h: () => `
  <h2>😆 표정 사전</h2><p>표정은 <b>눈썹 + 눈 + 입</b> 세 가지 조합이에요. 특히 <b>눈썹</b>이 감정의 핵심!</p>
  <div class="fig-row" style="flex-wrap:wrap;justify-content:center">${Object.keys(FACE_DEFS).map(k => `<div class="fig" style="width:96px">${faceSVG(k).replace('<svg', '<svg style="width:96px"')}<b>${FACE_DEFS[k].n}</b></div>`).join('')}</div>
  <div class="box">🔎 <b>눈썹 비밀</b><br>• 안쪽이 내려가면(＼ ／) = 화남<br>• 안쪽이 올라가면(／ ＼) = 슬픔, 걱정, 부끄러움<br>• 높이 올라가면 = 놀람</div>
  <div class="box green">🪞 거울을 보고 직접 표정을 지어 보면 제일 잘 그려져요! 템플릿 <b>표정 연습 9칸</b>으로 연습해 봐요.</div>` },
  { id: 'marks', em: '💢', t: '만화기호 & 효과음', s: '💢💦 기호와 쾅! 효과음 쓰기', h: () => `
  <h2>💢 만화기호 & 효과음</h2><h3>만화기호 = 감정 스티커</h3>
  <ul><li>💢 십자 핏줄 = 화남, 짜증</li><li>💦 땀 한 방울 = 당황, 민망 ("아하하...")</li><li>/// 빗금 = 볼이 빨개짐, 부끄러움</li><li>세로줄 그늘 = 충격, 시무룩</li><li>💤 = 졸림 · 🎵 = 신남, 콧노래 · ❗ = 깨달음 · ❓ = 궁금</li><li>반짝이 ✨ = 멋짐, 기쁨, 새것</li><li>몸 주변 짧은 선 = 덜덜 떨림, 깜짝</li></ul>
  <h3>효과음 쓰는 법</h3><ul><li><b>의성어</b>(소리): 쾅, 쿵, 똑똑, 딩동, 와장창</li><li><b>의태어</b>(모양): 두근두근, 반짝, 살금살금, 부들부들</li><li>소리가 크면 <b>크고 굵게</b>, 작으면 작고 가늘게</li><li>살짝 <b>기울이면</b> 움직임이 생겨요</li><li>소리가 나는 물건 <b>가까이</b>에 써요</li></ul>
  <div class="box">🎨 효과음에 하얀 테두리를 넣으면 그림 위에서도 잘 보여요. 앱의 <b>웹툰 → 글자·효과음</b>에 30가지가 준비되어 있어요!</div>` },
  { id: 'direct', em: '🎬', t: '연출 꿀팁', s: '재밌게 읽히는 비법들', h: () => `
  <h2>🎬 연출 꿀팁</h2>
  <h3>1. 첫 칸은 "어디?"</h3><p>이야기가 시작되거나 장소가 바뀌면 그 장소를 넓게 한 번 보여줘요 (학교, 방, 공원...).</p>
  <h3>2. 반전은 스크롤 아래에</h3><p>"문을 열었더니..." → (여백) → 큰 칸에서 정체 공개! 독자가 스크롤을 내리는 그 순간이 두근두근 포인트예요.</p>
  <h3>3. 웃긴 장면은 타이밍</h3><p>같은 장면을 똑같이 두 번 보여주고(정적), 세 번째에 표정만 바뀌면 웃겨요. 말 없는 칸 "......"도 웃음 포인트!</p>
  <h3>4. 대화의 방향 지키기 (180도 규칙)</h3><div class="fig-wide">${figSVG(300, 110, `<rect width="300" height="110" fill="#fff"/><line x1="40" y1="45" x2="260" y2="45" stroke="#ff7aa8" stroke-width="2" stroke-dasharray="6 4"/><circle cx="100" cy="45" r="16" fill="#ffd1e1" stroke="#2d2a3a" stroke-width="2"/><text x="100" y="50" text-anchor="middle" font-family="Jua" font-size="14">A</text><circle cx="200" cy="45" r="16" fill="#cfe6ff" stroke="#2d2a3a" stroke-width="2"/><text x="200" y="50" text-anchor="middle" font-family="Jua" font-size="14">B</text><text x="150" y="92" text-anchor="middle" font-size="22">🎥</text><text x="150" y="106" text-anchor="middle" font-family="Jua" font-size="10" fill="#3ccf7a">이쪽에서만 찍기 ✔</text><text x="150" y="22" text-anchor="middle" font-size="16" opacity=".4">🎥</text><text x="190" y="20" font-family="Jua" font-size="10" fill="#e5383b">넘어가면 ✘</text>`)}</div><p>A가 왼쪽, B가 오른쪽에서 시작했으면 끝까지 그 자리를 지켜요. 갑자기 바뀌면 독자가 헷갈려요.</p>
  <h3>5. 시선 유도</h3><p>인물이 바라보는 방향에 다음 칸이나 말풍선을 두면 눈이 자연스럽게 따라가요.</p>
  <h3>6. 구도: 3분할</h3><p>도구 → 격자 → 3분할을 켜고, 선이 만나는 점에 얼굴을 두면 사진처럼 멋진 구도가 돼요.</p>
  <h3>7. 끝은 궁금하게</h3><div class="box">📱 마지막 칸에 "누구지...?", 의미심장한 표정, 새로운 등장인물을 두면 다음 화가 보고 싶어져요. 이걸 '절단신공'이라고 불러요 😆</div>` },
  { id: 'char', em: '🧍', t: '캐릭터 만들기', s: '기억에 남는 주인공 비법', h: () => `
  <h2>🧍 캐릭터 만들기</h2>
  <h3>1. 실루엣 테스트</h3><p>캐릭터를 까맣게 칠해도 누군지 알아볼 수 있으면 성공! 머리 모양, 모자, 귀, 꼬리처럼 <b>특징 있는 모양</b>을 넣어요.</p>
  <h3>2. 대표 색 정하기</h3><p>주인공은 핑크, 친구는 하늘색처럼 사람마다 대표 색이 있으면 작은 칸에서도 바로 알아봐요.</p>
  <h3>3. 캐릭터 프로필 쓰기</h3><ul><li>이름 / 나이 / 좋아하는 것 / 싫어하는 것</li><li>잘하는 것 / 못하는 것 (약점이 있어야 재밌어요!)</li><li>말버릇 ("~냥", "대박!")</li><li>꿈이나 목표 — 이야기는 주인공이 <b>무언가를 원할 때</b> 시작돼요</li></ul>
  <h3>4. 캐릭터 시트</h3><p>앞 · 옆 · 뒤 모습과 표정을 한 장에 그려 두면 매번 똑같이 그릴 수 있어요. <span class="pill">템플릿: 캐릭터 시트</span></p>
  <div class="box green">🐱🦎 동물 캐릭터도 좋아요! 사람처럼 옷을 입히고 표정을 주면 귀여운 주인공이 돼요.</div>` },
  { id: 'color', em: '🎨', t: '디지털 채색 순서', s: '레이어로 깔끔하게 칠하기', h: () => `
  <h2>🎨 디지털 채색 순서</h2><p>레이어는 <b>투명한 종이</b>예요. 종이를 나눠서 그리면 하나만 고칠 수 있어요.</p>
  <div class="fig-wide">${figSVG(300, 170, ['효과 (집중선, 반짝이)', '선화 (G펜)', '빛 (스크린 + 클리핑)', '그림자 (곱하기 + 클리핑)', '밑색 (채우기)', '밑그림 (연필, 연하게)'].map((t, i) => `<rect x="${30 + i * 4}" y="${10 + i * 25}" width="230" height="22" rx="6" fill="${['#fff3c4', '#e8e8f0', '#fff7d6', '#e3dcff', '#ffe0ea', '#f2f2f2'][i]}" stroke="#2d2a3a" stroke-width="1.4"/><text x="${44 + i * 4}" y="${26 + i * 25}" font-family="Jua" font-size="12.5">${6 - i}. ${t}</text>`).join(''))}</div>
  <ol><li><b>밑그림</b>을 연필로 대충 → 레이어 불투명도 30%로 낮추기</li><li><b>선화</b> 레이어를 새로 만들어 G펜으로 따라 그리기 (손떨림 보정 5 이상)</li><li>선화 <b>아래</b>에 새 레이어 → 채우기(모든 레이어 보기)로 <b>밑색</b></li><li>밑색 위에 새 레이어 → <b>클리핑</b> 켜고 → 합성 <b>곱하기</b> → 연보라로 <b>그림자</b></li><li>또 새 레이어 → 클리핑 → <b>스크린</b> → 밝은 색으로 <b>빛</b></li></ol>
  <div class="box">🌈 그림자는 빛이 오는 반대쪽! 머리카락 아래, 목, 옷 주름에 넣어요. 볼에는 에어브러시로 분홍 볼터치~</div>` },
  { id: 'story', em: '📖', t: '이야기 짓기', s: '기승전결과 이야기 공식', h: () => `
  <h2>📖 이야기 짓기</h2><h3>기승전결 4단계</h3>
  <div class="kisung"><div><b>기</b>시작: 누가, 어디서? "고양이 탐정 나비는 학교 도서관에 산다."</div><div><b>승</b>사건: 문제가 생겨요! "책이 하나씩 사라진다."</div><div><b>전</b>반전: 예상 못한 일! "범인은 책을 좋아하는 도마뱀이었다."</div><div><b>결</b>마무리: "둘은 같이 책을 읽는 친구가 되었다."</div></div>
  <h3>재밌는 이야기 공식</h3><p><b>주인공</b>이 <b>무언가를 원하는데</b> → <b>방해물</b>이 나타나고 → <b>노력</b>해서 → <b>변화</b>한다!</p>
  <h3>아이디어가 안 떠오를 때</h3><ul><li>"만약에 ~라면?" — 만약에 우리 집 강아지가 말을 한다면?</li><li>오늘 있었던 일을 조금 과장하기</li><li>좋아하는 것 두 개를 섞기 — 공룡 + 요리사 = ?</li><li>💡 <b>아이디어 탭</b>에서 랜덤 뽑기!</li></ul>` },
  { id: 'format', em: '📱', t: '웹툰 크기 상식', s: '진짜 웹툰처럼 만들기', h: () => `
  <h2>📱 웹툰 크기 상식</h2><ul><li>웹툰은 <b>가로가 좁고 세로로 아주 긴</b> 그림이에요. 이 앱의 한 화면은 <b>800 × 1280</b>(폰 화면 비율)이고, 여러 화면이 위아래로 이어져요.</li><li>웹툰 사이트들은 보통 가로 <b>690~800픽셀</b> 정도를 써요. 긴 그림은 잘라서 올리는 경우가 많아요.</li><li>한 화면에 <b>2~3칸</b>이 폰으로 읽기 딱 좋아요. 너무 많으면 글씨가 작아져요.</li><li>글자는 폰에서 읽을 수 있게 <b>크게!</b> (이 앱 말풍선 기본 크기 34 이상 추천)</li><li>1화는 보통 <b>40~60칸</b> 정도예요. 처음엔 10화면 정도로 짧게 시작해요.</li></ul>
  <div class="box blue">💾 메뉴 → <b>웹툰 길게 이어서</b>를 누르면 모든 화면이 하나의 긴 그림으로 저장돼요. 가족에게 보여주기 딱!</div>` },
];
let LESSON_OPEN = null;
function renderSchool() {
  const el = $('#tab-school');
  const ALL_L = LESSONS.concat(ANIM_LESSONS);
  if (LESSON_OPEN) { const L = ALL_L.find(l => l.id === LESSON_OPEN); learnMark('lesson:' + L.id); el.innerHTML = `<button class="backlink" id="lsBack">← 배우기</button><div class="lesson">${L.h()}</div><div style="display:flex;justify-content:space-between;margin:14px 0 30px"><button class="btn sec sm" id="lsPrev">← 이전</button><button class="btn sm" id="lsNext">다음 수업 →</button></div>`; $('#lsBack').onclick = () => { LESSON_OPEN = null; renderSchool(); }; const i = ALL_L.indexOf(L); $('#lsPrev').onclick = () => { LESSON_OPEN = ALL_L[(i - 1 + ALL_L.length) % ALL_L.length].id; renderSchool(); $('#homeMain').scrollTop = 0; }; $('#lsNext').onclick = () => { LESSON_OPEN = ALL_L[(i + 1) % ALL_L.length].id; renderSchool(); $('#homeMain').scrollTop = 0; }; el.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => startExample(b.dataset.ex)); return; }
  const done = LS.get('missions', {});
  el.innerHTML = roadmapHTML() + `<div class="sec-title" style="margin-top:26px">모든 수업 모아보기</div><div class="sub-title">웹툰 수업</div><div class="lesson-grid" id="lsGrid"></div><div class="sub-title">애니메이션 수업</div><div class="lesson-grid" id="lsGridA"></div>
  <div class="sec-title" style="margin-top:26px">도전 미션 <small style="font-family:var(--fb);font-size:13px;color:#77738a">${Object.keys(done).length}/${MISSIONS.length}</small></div><div id="msList"></div>`;
  const ga = $('#lsGridA'); ANIM_LESSONS.forEach(L => { const b = document.createElement('button'); b.className = 'lesson-card'; if (LS.get('learn', {})['lesson:' + L.id]) b.classList.add('done'); b.innerHTML = `<span class="em">${L.em}</span><b>${L.t}</b><small>${L.s}</small>`; b.onclick = () => { LESSON_OPEN = L.id; renderSchool(); $('#homeMain').scrollTop = 0; }; ga.appendChild(b); });
  const g = $('#lsGrid'); LESSONS.forEach(L => { const b = document.createElement('button'); b.className = 'lesson-card'; if (LS.get('learn', {})['lesson:' + L.id]) b.classList.add('done'); b.innerHTML = `<span class="em">${L.em}</span><b>${L.t}</b><small>${L.s}</small>`; b.onclick = () => { LESSON_OPEN = L.id; renderSchool(); $('#homeMain').scrollTop = 0; }; g.appendChild(b); });
  const ml = $('#msList'); MISSIONS.forEach(m => { const d = document.createElement('div'); d.className = 'mission' + (done[m.id] ? ' done' : ''); d.innerHTML = `<div class="ck">${done[m.id] ? '✔' : ''}</div><div class="tx"><b>${m.t}</b><br><small style="color:#77738a">${m.d}${m.manual && !done[m.id] ? ' · 다 하면 눌러서 체크!' : ''}</small></div>`; if (m.manual) d.onclick = () => { const x = LS.get('missions', {}); if (x[m.id]) delete x[m.id]; else { x[m.id] = Date.now(); touchDay(); } LS.set('missions', x); checkLevelUp(); renderSchool(); }; ml.appendChild(d); });
  bindRoadmap(el);
}

/* ================= IDEAS ================= */
const IDEA = {
  who: ['고양이 탐정', '말하는 도마뱀', '마법을 막 배운 초등학생', '로봇 강아지', '전학 온 외계인', '겁 많은 유령', '햄스터 왕국의 공주', '요리하는 펭귄', '복싱하는 토끼', '시간을 멈추는 소녀', '작아진 선생님', '꿈을 먹는 맥', '그림이 살아나는 화가', '구름 위에 사는 아이', '용감한 개미', '슈퍼히어로 할머니', '편의점 알바 드래곤', '거꾸로 말하는 앵무새'],
  where: ['학교 도서관', '바다 밑 마을', '구름 위 놀이공원', '우리 집 냉장고 속', '마법 학교', '밤의 편의점', '우주 정거장', '동물원', '숲속 작은 카페', '거대한 케이크 성', '할머니 시골집', '게임 속 세상', '눈 내리는 산', '100층 아파트 옥상', '공룡 시대', '복싱 체육관'],
  what: ['소중한 물건이 사라졌다!', '갑자기 몸이 바뀌었다', '이상한 편지를 받았다', '친구와 크게 싸웠다', '비밀 문을 발견했다', '하루가 계속 반복된다', '대회에 나가게 됐다', '길 잃은 아기 동물을 만났다', '소원이 진짜로 이루어졌다', '선생님이 사라졌다', '숙제가 살아 움직인다', '전학생이 수상하다', '반려동물이 말을 하기 시작했다', '내일이 시험인데 교과서가 없다'],
  twist: ['범인은 바로 나였다?!', '사실 모두 꿈이었…지만 증거가 남아 있다', '적이 사실 외로운 친구였다', '가장 약한 친구가 진짜 영웅이었다', '처음부터 다 계획된 깜짝 파티였다', '고양이가 사실 사람 말을 다 알아듣고 있었다', '집에 돌아와 보니 시간이 1분밖에 안 지났다', '해결했는데 더 큰 문제가 나타났다 (다음 화에 계속!)', '서로 몰래 같은 선물을 준비했다', '사라진 줄 알았던 게 내 주머니에 있었다'],
  feel: ['두근두근 설렘', '깔깔 웃김', '오싹 무서움', '찡한 감동', '숨막히는 모험', '포근 힐링'],
  practice: ['내 방을 하늘에서 내려다본 모습', '좋아하는 간식을 의인화하기', '고양이 표정 6가지', '친구를 동물로 그려보기', '비 오는 날 창문', '내가 사는 동네 지도', '거울 보고 내 얼굴 그리기', '손 3가지 포즈', '도마뱀 캐릭터 디자인', '우리 가족을 4컷 만화로', '10년 뒤의 나', '좋아하는 음식 반짝이게 그리기', '귀여운 몬스터 3마리', '말풍선 5종류 연습하기', '하트 칸 안에 고백 장면'],
  personality: ['덜렁이지만 착함', '똑똑한데 겁이 많음', '용감한데 길치', '조용한데 웃기는 말을 잘함', '먹을 것만 보면 정신 못 차림', '엄청 부지런한 잠꾸러기', '츤데레 (겉은 차갑고 속은 따뜻)'],
  habit: ['"대박!"', '"~냥"', '"흠, 수상해..."', '"괜찮아, 괜찮아!"', '"배고파..."', '"그건 내가 할게!"', '"헐"'],
  color: ['💗 핑크', '💙 하늘색', '💛 노랑', '💚 민트', '💜 보라', '🧡 주황', '❤️ 빨강', '🤎 갈색'],
  secret: ['사실 노래를 엄청 잘한다', '밤마다 별과 이야기한다', '무서운 영화를 못 본다', '전생에 왕이었다고 믿는다', '주머니에 늘 사탕이 있다', '쌍둥이 동생이 있다'],
};
const pick = a => a[Math.floor(Math.random() * a.length)];
let CUR_IDEA = null, CUR_CHAR = null;
function renderIdea() {
  if (!CUR_IDEA) CUR_IDEA = { who: pick(IDEA.who), where: pick(IDEA.where), what: pick(IDEA.what), twist: pick(IDEA.twist), feel: pick(IDEA.feel) };
  if (!CUR_CHAR) CUR_CHAR = { personality: pick(IDEA.personality), habit: pick(IDEA.habit), color: pick(IDEA.color), secret: pick(IDEA.secret) };
  const I = CUR_IDEA, C = CUR_CHAR; const el = $('#tab-idea');
  const slot = (k, lab, v, grp) => `<div class="idea-slot"><span class="k">${lab}</span><span class="v">${esc(v)}</span><button data-r="${grp}:${k}">🎲</button></div>`;
  el.innerHTML = `<div class="idea-box"><div style="font-family:var(--fh);font-size:20px">🎰 웹툰 아이디어 뽑기</div>
   ${slot('who', '주인공', I.who, 'i')}${slot('where', '장소', I.where, 'i')}${slot('what', '사건', I.what, 'i')}${slot('twist', '반전', I.twist, 'i')}${slot('feel', '분위기', I.feel, 'i')}
   <div style="display:flex;gap:8px;justify-content:center;margin-top:10px"><button class="btn sec sm" id="ideaAll">🎲 전부 다시</button><button class="btn lav sm" id="ideaGo">📱 이걸로 4컷 시작</button></div>
   <div class="kisung"><div><b>기</b>${esc(I.where)}에 사는 ${esc(I.who)}.</div><div><b>승</b>그런데 ${esc(I.what)}</div><div><b>전</b>알고 보니… ${esc(I.twist)}</div><div><b>결</b>마지막 칸은 네가 정해 봐! (${esc(I.feel)} 느낌으로)</div></div></div>
   <div class="idea-box" style="margin-top:14px"><div style="font-family:var(--fh);font-size:18px">🧍 캐릭터 성격 뽑기</div>
   ${slot('personality', '성격', C.personality, 'c')}${slot('habit', '말버릇', C.habit, 'c')}${slot('color', '대표 색', C.color, 'c')}${slot('secret', '비밀', C.secret, 'c')}
   <button class="btn sec sm" id="charAll" style="margin-top:6px">🎲 다시 뽑기</button> <button class="btn sm" id="charGo" style="margin-top:6px">📋 캐릭터 시트 그리기</button></div>
   <div class="idea-box" style="margin-top:14px"><div style="font-family:var(--fh);font-size:18px">✏️ 오늘의 그림 연습</div><div style="font-family:var(--fh);font-size:19px;margin:12px 0;color:#ff5c8a" id="pracT">${esc(pick(IDEA.practice))}</div><button class="btn sec sm" id="pracR">🎲 다른 주제</button> <button class="btn sm" id="pracGo">🖌 그리러 가기</button></div>
   <div class="idea-box" style="margin-top:14px"><div style="font-family:var(--fh);font-size:18px">🎞️ 움직이는 이모티콘 아이디어</div><div style="font-family:var(--fh);font-size:19px;margin:12px 0;color:#3a86ff" id="emoT">${esc(pick(EMO_IDEAS))}</div><button class="btn sec sm" id="emoR">🎲 다른 아이디어</button> <button class="btn lav sm" id="emoGo">🎬 만들러 가기</button></div>
   <div style="height:24px"></div>`;
  $('#emoR').onclick = () => { $('#emoT').textContent = pick(EMO_IDEAS); }; $('#emoGo').onclick = newAnimModal;
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { const [g, k] = b.dataset.r.split(':'); if (g === 'i') CUR_IDEA[k] = pick(IDEA[k]); else CUR_CHAR[k] = pick(IDEA[k]); renderIdea(); });
  $('#ideaAll').onclick = () => { CUR_IDEA = null; renderIdea(); };
  $('#charAll').onclick = () => { CUR_CHAR = null; renderIdea(); };
  $('#ideaGo').onclick = () => newToonModal(`${I.who}의 ${I.feel.split(' ').pop()} 이야기`, 1);
  $('#charGo').onclick = () => newToonModal('내 캐릭터 시트', 4);
  $('#pracR').onclick = () => { $('#pracT').textContent = pick(IDEA.practice); };
  $('#pracGo').onclick = () => { const d = newDoc('art', 1500, 1500, $('#pracT').textContent); enterEditor(d); };
}

/* ================= INIT ================= */
async function init() {
  VIEW.c = $('#view'); VIEW.x = VIEW.c.getContext('2d');
  $('#tbSw').style.background = ST.color;
  initInput(); initSliders();
  window.addEventListener('resize', () => { if (ST.doc) { resizeView(); } });
  try { new ResizeObserver(() => { if (ST.doc) { const st = $('#stage').getBoundingClientRect(); if (Math.abs(st.width - VIEW.cw) > .5 || Math.abs(st.height - VIEW.ch) > .5) { const dy = (st.height - VIEW.ch) / 2; resizeView(); ST.view.y -= dy; ST.dirty = true; } } }).observe($('#stage')); } catch (e) { }
  if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (ST.doc) resizeView(); });
  // bottom bar
  $('#tbBrush').onclick = () => { if (ST.tool === 'brush') openSheet('shBrush'); else setTool('brush'); };
  $('#tbEraser').onclick = () => { if (ST.tool === 'eraser') openSheet('shEraser'); else setTool('eraser'); };
  $('#tbLasso').onclick = () => { if (ST.tool === 'lasso') { if (!FLOAT) selectAll(); } else setTool('lasso'); };
  $('#tbColor').onclick = () => openSheet('shColor');
  $('#tbLayers').onclick = () => openSheet('shLayers');
  $('#tbToon').onclick = () => openSheet(ST.doc && ST.doc.type === 'anim' ? 'shAnim' : 'shToon');
  $('#tbMore').onclick = () => openSheet('shMore');
  $('#btnMenu').onclick = () => openSheet('shMenu');
  $('#pgMgr').onclick = () => openSheet('shPages');
  $('#scrim').onclick = () => closeSheets();
  $$('[data-close]').forEach(b => b.onclick = () => closeSheets());
  $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo;
  $('#btnBack').onclick = () => { NAV = { tab: 'works', lesson: null, scroll: 0 }; leaveEditor(); };
  $('#btnPrevStep').onclick = stepBack;
  $('#btnPreview').onclick = openPreview; $('#pvBack').onclick = closePreview; $('#pvSave').onclick = () => ST.doc.type === 'anim' ? exportGIF(false) : exportLong();
  initTimeline(); initSteps();
  $('#btnTip').onclick = () => { const all = ST.doc && ST.doc.type === 'toon' ? TOON_TIPS.concat(DRAW_TIPS.map(t => t)) : DRAW_TIPS.concat(TOON_TIPS); const t = pick(all); openModal(`<h3>💡 꿀팁</h3><div style="font-size:15.5px;line-height:1.7">${t}</div><div class="mbtns"><button class="btn sec sm" id="tpMore">다른 팁</button><button class="btn sm" id="tpOk">좋아요!</button></div>`); $('#tpOk').onclick = closeModal; $('#tpMore').onclick = () => $('#btnTip').onclick(); };
  $('#pgPrev').onclick = () => setPage(ST.doc.cur - 1); $('#pgNext').onclick = () => setPage(ST.doc.cur + 1); $('#pgAdd').onclick = () => addPage(ST.doc.cur + 1);
  $('#objBar').querySelectorAll('button').forEach(b => b.onclick = () => objAction(b.dataset.a));
  $('#panelBar').querySelectorAll('button').forEach(b => b.onclick = () => panelAction(b.dataset.a));
  $('#modalWrap').onclick = e => { if (e.target.id === 'modalWrap') closeModal(); };
  $('#saveClose').onclick = () => $('#saveView').classList.remove('on');
  $('#fileImg').onchange = e => { const f = e.target.files[0]; if (f) importPhotoLayer(f); e.target.value = ''; };
  $('#fileRef').onchange = e => { const f = e.target.files[0]; if (f) { $('#refImg').src = URL.createObjectURL(f); $('#refWin').style.display = 'block'; closeSheets(); } e.target.value = ''; };
  $('#fileTrace').onchange = e => { const f = e.target.files[0]; if (f) startTraceImage(f); e.target.value = ''; };
  $('#fileVideo').onchange = e => { const f = e.target.files[0]; if (f) traceVideoModal(f); e.target.value = ''; };
  $('#fileProj').onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; };
  $('#refClose').onclick = () => { $('#refWin').style.display = 'none'; };
  // ref window drag/resize
  (() => { const w = $('#refWin'); let d = null; w.addEventListener('pointerdown', e => { if (e.target.id === 'refClose') return; e.stopPropagation(); w.setPointerCapture(e.pointerId); const r = w.getBoundingClientRect(), st = $('#stage').getBoundingClientRect(); d = { rz: e.target.classList.contains('rz'), sx: e.clientX, sy: e.clientY, l: r.left - st.left, t: r.top - st.top, w: r.width }; }); w.addEventListener('pointermove', e => { if (!d) return; if (d.rz) w.style.width = clamp(d.w + e.clientX - d.sx, 90, 400) + 'px'; else { w.style.left = (d.l + e.clientX - d.sx) + 'px'; w.style.top = (d.t + e.clientY - d.sy) + 'px'; w.style.right = 'auto'; } }); w.addEventListener('pointerup', () => d = null); })();
  // home
  $$('.home-nav button').forEach(b => b.onclick = () => { LESSON_OPEN = null; homeTab(b.dataset.tab); });
  $('#btnNewArt').onclick = newArtModal; $('#btnNewToon').onclick = () => newToonModal(); $('#btnNewAnim').onclick = newAnimModal;
  $('#btnImport').onclick = () => $('#fileProj').click();
  await dbOpen(); homeTab('works');
  requestAnimationFrame(loop);
  initDownloads();
}
const EMO_IDEAS = ['고양이가 꾸벅 인사 "안녕!"', '도마뱀이 혀 날름 + 윙크', '하트가 뿅뿅 튀어나오는 "사랑해"', '눈물 분수 엉엉', '부들부들 화나서 김이 폴폴', '엄지 척 + 반짝', '졸려서 꾸벅꾸벅 Zzz', '깜짝 놀라 펄쩍!', '빙글빙글 신나는 춤', '"고마워" 글자가 통통', '햄스터 볼 빵빵 먹방', '박수 짝짝짝', '부끄러워서 볼 빨개지기', '"ㅋㅋㅋ" 배 잡고 데굴데굴']; 
