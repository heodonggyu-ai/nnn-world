/* ================= LEARNING PATH (배우며 그리기 로드맵) ================= */
const COURSE = [
  { lv: 1, t: '선과 모양', s: '동그라미와 타원으로 그림의 뼈대 잡기', badge: '첫 붓질', hue: ['#e3a0a9', '#c27482'],
    units: [['trace', 't_cat'], ['trace', 't_lizard'], ['lesson', 'color'], ['mission', 'save']] },
  { lv: 2, t: '얼굴과 표정', s: '정면 · 옆얼굴 · 감정 표현', badge: '표정 장인', hue: ['#e8c07a', '#c4923e'],
    units: [['trace', 't_face'], ['trace', 't_side'], ['lesson', 'faces'], ['trace', 't_faces']] },
  { lv: 3, t: '나만의 캐릭터', s: '3등신 몸과 캐릭터 설정 만들기', badge: '캐릭터 디자이너', hue: ['#9cc4ad', '#5e9479'],
    units: [['trace', 't_sd'], ['lesson', 'char'], ['mission', 'sheet']] },
  { lv: 4, t: '웹툰 작가 되기', s: '칸 · 카메라 · 말풍선 · 연출', badge: '웹툰 작가', hue: ['#a99ad0', '#7562a8'],
    units: [['lesson', 'steps'], ['lesson', 'panels'], ['lesson', 'shots'], ['lesson', 'bubbles'], ['trace', 't_toon'], ['lesson', 'direct'], ['mission', 'four']] },
  { lv: 5, t: '애니메이터 되기', s: '12가지 법칙과 움직이는 이모티콘', badge: '애니메이터', hue: ['#8dbccc', '#4f8aa0'],
    units: [['lesson', 'a_basic'], ['example', 'ball_done'], ['lesson', 'a_12'], ['example', 'blink'], ['trace', 't_walk'], ['example', 'slime'], ['mission', 'gif']] },
];
const RANKS = ['새싹 작가', '연필 작가', '표정 장인', '캐릭터 디자이너', '웹툰 작가', '애니메이터'];
const UTYPE = { trace: '따라 그리기', lesson: '수업', example: '애니 실습', mission: '미션' };
function unitInfo(u) {
  const [k, id] = u; let o;
  if (k === 'trace') o = TRACE_LESSONS.find(e => e.id === id);
  else if (k === 'example') o = ANIM_EXAMPLES.find(e => e.id === id);
  else if (k === 'lesson') o = LESSONS.concat(ANIM_LESSONS).find(e => e.id === id);
  else o = MISSIONS.find(e => e.id === id);
  if (!o) return { k, id, t: id, em: '•' };
  return { k, id, t: o.name || o.t, em: o.em || (k === 'mission' ? '🏅' : '•'), d: o.desc || o.s || o.d || '', manual: o.manual };
}
function unitDone(u) { const [k, id] = u; if (k === 'mission') return !!LS.get('missions', {})[id]; return !!LS.get('learn', {})[k + ':' + id]; }
function levelProg(L) { const d = L.units.filter(unitDone).length; return { d, n: L.units.length, done: d === L.units.length }; }
function courseStat() {
  let d = 0, n = 0, lvDone = 0, cur = null, next = null;
  COURSE.forEach(L => { const p = levelProg(L); d += p.d; n += p.n; if (p.done) lvDone++; else if (!cur) { cur = L; next = L.units.find(u => !unitDone(u)); } });
  return { d, n, pct: Math.round(d / n * 100), lvDone, rank: RANKS[lvDone], cur, next };
}
function todayKey(t = Date.now()) { const x = new Date(t); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); }
function touchDay() { const days = LS.get('learnDays', []); const k = todayKey(); if (!days.includes(k)) { days.push(k); LS.set('learnDays', days.slice(-400)); } }
function streak() {
  const days = new Set(LS.get('learnDays', [])); let n = 0; let t = Date.now();
  if (!days.has(todayKey(t))) t -= 864e5; // 오늘 아직 안 했으면 어제부터 셈
  while (days.has(todayKey(t))) { n++; t -= 864e5; }
  return n;
}
function learnMark(key) {
  touchDay();
  const m = LS.get('learn', {}); if (m[key]) return false; m[key] = Date.now(); LS.set('learn', m);
  return checkLevelUp();
}
function afterUnit(key) {
  const up = learnMark(key); if (up) return;
  const S = courseStat(); if (!S.next) return; const I = unitInfo(S.next);
  setTimeout(() => {
    openModal(`<div class="lvup"><small>수업 완료</small><h3>잘했어요! 다음 수업도 해 볼까요?</h3><button class="lc-next" id="nuGo" style="background:#f7f4fc;box-shadow:none"><span class="lc-em">${I.em}</span><span class="lc-tx"><small>${S.cur.lv}단계 · ${UTYPE[I.k]}</small><b>${I.t}</b></span><span class="lc-play"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span></button><div class="mbtns"><button class="btn sec sm" id="nuX">계속 그리기</button></div></div>`);
    $('#nuX').onclick = closeModal; $('#nuGo').onclick = () => { closeModal(); const u = S.next; if (ST.doc) leaveEditor(() => startUnit(u)); else startUnit(u); };
  }, 900);
}
function checkLevelUp() {
  const got = LS.get('badges', {}); let up = false;
  COURSE.forEach(L => { if (levelProg(L).done && !got[L.lv]) { got[L.lv] = Date.now(); LS.set('badges', got); up = true; setTimeout(() => celebrate(L), 700); } });
  return up;
}
function badgeSVG(L, size = 64, locked = false) {
  const [a, b] = L.hue; const id = 'bg' + L.lv + (locked ? 'l' : '') + Math.random().toString(36).slice(2, 6);
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${locked ? '#e4e0ec' : a}"/><stop offset="1" stop-color="${locked ? '#cdc7da' : b}"/></linearGradient></defs>
  <path d="M32 3l7 5 8.5-.5 3.5 7.8 7.5 4-1.5 8.4 4 7.5-6 6-.5 8.5-8 2.5-5 7-8-3-8 3-5-7-8-2.5-.5-8.5-6-6 4-7.5L7 19.3l7.5-4L18 7.5 26.5 8z" fill="url(#${id})"/>
  <circle cx="32" cy="32" r="17" fill="#fff" opacity="${locked ? .55 : .25}"/>
  <text x="32" y="39" text-anchor="middle" font-family="Pretendard,Jua,sans-serif" font-weight="800" font-size="20" fill="${locked ? '#a7a0b8' : '#fff'}">${L.lv}</text></svg>`;
}
function celebrate(L) {
  const nx = COURSE.find(c => c.lv === L.lv + 1);
  openModal(`<div class="lvup"><div class="lvup-b">${badgeSVG(L, 120)}</div><small>${L.lv}단계 완료!</small><h3>‘${L.badge}’ 배지를 받았어요</h3><p>이제 나는 <b>${RANKS[COURSE.filter(c => levelProg(c).done).length]}</b>! ${nx ? `다음은 <b>${nx.lv}단계 · ${nx.t}</b>에 도전해 봐요.` : '모든 단계를 끝냈어요. 진짜 작가예요!'}</p><div class="mbtns"><button class="btn sec sm" id="lvX">좋아요</button>${nx ? '<button class="btn sm" id="lvGo">다음 단계 보기</button>' : ''}</div></div>`);
  $('#lvX').onclick = closeModal; if (nx) $('#lvGo').onclick = () => { closeModal(); if (ST.doc) { leaveEditor(() => { LESSON_OPEN = null; homeTab('school'); }); } else { LESSON_OPEN = null; homeTab('school'); } };
}
function startUnit(u) {
  const [k, id] = u;
  if (k === 'trace') return startTrace(id);
  if (k === 'example') return startExample(id);
  if (k === 'lesson') { LESSON_OPEN = id; homeTab('school'); LESSON_OPEN = id; renderSchool(); $('#homeMain').scrollTop = 0; return; }
  const I = unitInfo(u); const done = unitDone(u);
  openModal(`<h3>${I.t}</h3><p style="color:#6a6480;line-height:1.6;margin:0 0 6px">${I.d}</p>${I.manual ? '<p style="font-size:13px;color:#9a94ae;margin:0">해냈으면 아래 버튼으로 체크해요.</p>' : '<p style="font-size:13px;color:#9a94ae;margin:0">해내면 자동으로 체크돼요.</p>'}<div class="mbtns"><button class="btn sec sm" id="muX">닫기</button>${I.manual ? `<button class="btn sm" id="muOk">${done ? '체크 해제' : '해냈어요!'}</button>` : `<button class="btn sm" id="muGo">${id === 'gif' ? '새 애니 만들기' : '새 그림 만들기'}</button>`}</div>`);
  $('#muX').onclick = closeModal;
  if (I.manual) $('#muOk').onclick = () => { const x = LS.get('missions', {}); if (x[id]) delete x[id]; else { x[id] = Date.now(); touchDay(); } LS.set('missions', x); closeModal(); checkLevelUp(); refreshLearnViews(); };
  else $('#muGo').onclick = () => { closeModal(); (id === 'gif' ? $('#btnNewAnim') : $('#btnNewArt')).click(); };
}
function refreshLearnViews() { renderLearnCard(); if ($('#tab-school').classList.contains('active') && !LESSON_OPEN) renderSchool(); }
function ringSVG(pct, size = 64, dark = false) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><defs><linearGradient id="rgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d58c"/><stop offset="1" stop-color="#c08a3e"/></linearGradient></defs><circle cx="32" cy="32" r="${r}" fill="none" stroke="${dark ? 'rgba(255,255,255,.14)' : 'rgba(139,108,255,.15)'}" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="url(#rgG)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-family="Pretendard,sans-serif" font-weight="800" font-size="15" fill="${dark ? '#fff' : '#2a2433'}">${pct}%</text></svg>`;
}
const FIRE = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#ff7a3d"/><path d="M12 13c1 2 3 2.5 3 5a3 3 0 01-6 0c0-1.5 1-2.5 1.5-3 0 1 .5 1.5 1 1.5 0-1.5-.5-2.5.5-3.5z" fill="#ffd23f"/></svg>';
function renderLearnCard() {
  const el = $('#learnCard'); if (!el) return; const S = courseStat(); const st = streak();
  const nx = S.next ? unitInfo(S.next) : null;
  el.innerHTML = `<div class="lc-top"><div class="lc-ring">${ringSVG(S.pct, 62, true)}</div><div class="lc-meta"><span class="lc-kick">나의 그림 클래스</span><b>${S.cur ? `${S.cur.lv}단계 · ${S.cur.t}` : '모든 단계 완료!'}</b><div class="lc-chips"><span class="chip-rank">${S.rank}</span>${st ? `<span class="chip-fire">${FIRE}${st}일 연속</span>` : '<span class="chip-fire off">오늘 첫 수업을 해 봐요</span>'}</div></div></div>
  ${nx ? `<button class="lc-next" id="lcGo"><span class="lc-em">${nx.em}</span><span class="lc-tx"><small>다음 수업 · ${UTYPE[nx.k]}</small><b>${nx.t}</b></span><span class="lc-play"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span></button>` : `<button class="lc-next" id="lcGo"><span class="lc-tx"><small>졸업!</small><b>자유롭게 작품을 만들어 봐요</b></span></button>`}
  <div class="lc-steps">${COURSE.map(L => { const p = levelProg(L); return `<i class="${p.done ? 'done' : (S.cur === L ? 'cur' : '')}" style="--p:${p.d / p.n}"></i>`; }).join('')}</div>`;
  $('#lcGo').onclick = () => S.next ? startUnit(S.next) : $('#btnNewArt').click();
  el.querySelector('.lc-top').onclick = () => { LESSON_OPEN = null; homeTab('school'); };
}
function roadmapHTML() {
  const S = courseStat(); const st = streak(); const open = LS.get('roadOpen', null) ?? (S.cur ? S.cur.lv : 5);
  let h = `<div class="road-head"><div class="rh-l"><span class="lc-kick">나의 그림 클래스</span><h2>${S.rank}</h2><p>배우면서 바로 그려요. 단계를 끝내면 배지를 받아요.</p></div><div class="rh-r">${ringSVG(S.pct, 74)}</div></div>
  <div class="road-stats"><div><b>${S.d}<small>/${S.n}</small></b><span>끝낸 수업</span></div><div><b>${S.lvDone}<small>/5</small></b><span>받은 배지</span></div><div><b>${st}<small>일</small></b><span>연속 학습</span></div></div>
  <div class="badges">${COURSE.map(L => `<div class="bd ${levelProg(L).done ? '' : 'lock'}">${badgeSVG(L, 46, !levelProg(L).done)}<small>${L.badge}</small></div>`).join('')}</div>
  <div class="sec-title">학습 로드맵</div><div class="road">`;
  COURSE.forEach(L => {
    const p = levelProg(L); const isCur = S.cur === L; const isOpen = open === L.lv;
    h += `<div class="lv ${p.done ? 'done' : ''} ${isCur ? 'cur' : ''} ${isOpen ? 'open' : ''}" style="--a:${L.hue[0]};--b:${L.hue[1]}"><button class="lv-h" data-lv="${L.lv}"><span class="lv-n">${p.done ? '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : L.lv}</span><span class="lv-t"><small>${L.lv}단계${isCur ? ' · 진행 중' : ''}</small><b>${L.t}</b><em>${L.s}</em></span><span class="lv-p"><b>${p.d}/${p.n}</b><i><u style="width:${p.d / p.n * 100}%"></u></i></span></button><div class="lv-u">`;
    L.units.forEach((u, i) => { const I = unitInfo(u); const d = unitDone(u); const isNext = S.next === u; h += `<button class="un ${d ? 'done' : ''} ${isNext ? 'next' : ''}" data-u="${L.lv}:${i}"><span class="un-em">${I.em}</span><span class="un-t"><small>${UTYPE[I.k]}</small><b>${I.t}</b></span><span class="un-s">${d ? '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : isNext ? '시작' : ''}</span></button>`; });
    h += `</div></div>`;
  });
  return h + '</div>';
}
function bindRoadmap(el) {
  el.querySelectorAll('.lv-h').forEach(b => b.onclick = () => { const lv = +b.dataset.lv; const cur = LS.get('roadOpen', null); LS.set('roadOpen', cur === lv ? 0 : lv); renderSchool(); });
  el.querySelectorAll('.un').forEach(b => b.onclick = () => { const [lv, i] = b.dataset.u.split(':').map(Number); startUnit(COURSE.find(c => c.lv === lv).units[i]); });
}
