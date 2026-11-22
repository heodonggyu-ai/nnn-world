/* ================= HOME ================= */
function homeTab(t) {
  $$('.home-nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === t)); $$('.htab').forEach(h => h.classList.remove('active')); $('#tab-' + t).classList.add('active');
  if (t === 'works') renderGallery(); if (t === 'school') renderSchool(); if (t === 'idea') renderIdea(); if (t === 'trace') renderTrace(); $('#homeMain').scrollTop = 0;
}
function fmtDate(t) { const d = new Date(t); const now = new Date(); if (d.toDateString() === now.toDateString()) return `오늘 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; return `${d.getMonth() + 1}월 ${d.getDate()}일`; }
async function renderGallery() {
  renderLearnCard();
  const tip = [...TOON_TIPS, ...DRAW_TIPS][Math.floor(Math.random() * (TOON_TIPS.length + DRAW_TIPS.length))];
  $('#homeTip').innerHTML = `<span class="tc-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" fill="rgba(255,255,255,.25)"/></svg></span><div class="tc-tx"><b>오늘의 꿀팁</b><p>${tip}</p></div><button class="tc-re" aria-label="다른 팁"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 5v6h-6"/></svg></button>`;
  $('#homeTip .tc-re').onclick = e => { e.stopPropagation(); const t2 = [...TOON_TIPS, ...DRAW_TIPS][Math.floor(Math.random() * (TOON_TIPS.length + DRAW_TIPS.length))]; const p = $('#homeTip p'); p.style.opacity = 0; setTimeout(() => { p.innerHTML = t2; p.style.opacity = 1; }, 150); };
  const g = $('#gallery'); const all = (await dbAll()).sort((a, b) => b.updated - a.updated);
  if (!all.length) { g.style.display = 'block'; $('#workCnt').textContent = ''; g.innerHTML = `<div class="empty">${EMPTY_SVG}<b>첫 작품을 만들어 볼까요?</b><span>그린 그림은 여기에 차곡차곡 모여요</span><button class="btn" id="emptyGo">새 그림 시작하기</button>${DB.ok ? '' : '<small class="warn">이 브라우저에선 저장이 오래 유지되지 않을 수 있어요. 백업 파일을 꼭 만들어 주세요.</small>'}</div>`; $('#emptyGo').onclick = () => $('#btnNewArt').click(); return; }
  $('#workCnt').textContent = all.length;
  g.style.display = 'grid'; g.innerHTML = '';
  all.forEach(w => {
    const d = document.createElement('div'); d.className = 'work';
    d.innerHTML = `<div class="th" style="background-image:url(${w.thumb})"></div><span class="badge"><i class="k-${w.type || 'art'}"></i>${w.type === 'toon' ? '웹툰 · ' + w.pages + '화면' : w.type === 'anim' ? '애니 · ' + w.frames + '프레임' : '그림'}</span><button class="more">⋯</button><div class="meta"><b>${esc(w.title)}</b><small>${fmtDate(w.updated)}</small></div>`;
    d.onclick = e => { if (e.target.classList.contains('more')) { workMenu(w); return; } openWork(w.id); };
    g.appendChild(d);
  });
}
function workMenu(w) {
  openModal(`<h3>${esc(w.title)}</h3><div class="size-grid"><button data-w="open"><b>✏️ 열기</b><small>이어서 그리기</small></button><button data-w="rename"><b>🏷 이름 바꾸기</b></button><button data-w="dup"><b>⧉ 복제</b><small>복사본 만들기</small></button><button data-w="backup"><b>📦 백업 파일</b><small>다른 기기로 옮기기</small></button><button data-w="del"><b>🗑 삭제</b></button></div><div class="mbtns"><button class="btn sec sm" id="wmX">닫기</button></div>`);
  $('#wmX').onclick = closeModal;
  $('#modal').querySelectorAll('[data-w]').forEach(b => b.onclick = async () => {
    const a = b.dataset.w; const rec = await dbGet(w.id);
    if (a === 'open') { closeModal(); openWork(w.id); }
    else if (a === 'rename') askText('새 이름', w.title, async v => { if (!v) return; rec.title = v; await dbPut(rec); renderGallery(); });
    else if (a === 'dup') { const n = { ...rec, id: uid(), title: rec.title + ' 복사', updated: Date.now() }; await dbPut(n); closeModal(); renderGallery(); toast('복제했어요'); }
    else if (a === 'backup') { closeModal(); exportBackup(rec); }
    else if (a === 'del') confirmBox(`'${w.title}'을(를) 지울까요? 되돌릴 수 없어요!`, '지우기', async () => { await dbDel(w.id); renderGallery(); toast('지웠어요'); });
  });
}
async function openWork(id) { toast('여는 중...', 900); const rec = await dbGet(id); if (!rec) { toast('작품을 찾을 수 없어요'); return; } const d = await deserialize(rec); enterEditor(d); }
const ART_SIZES = [
  { n: '정사각형', s: '1500 × 1500', w: 1500, h: 1500, d: '인스타·프로필' }, { n: '세로 (폰 배경)', s: '1080 × 1920', w: 1080, h: 1920, d: '폰 화면 꽉 차게' },
  { n: '가로 (풍경)', s: '1920 × 1080', w: 1920, h: 1080, d: '컴퓨터 배경, 풍경화' }, { n: '종이 (A4)', s: '1240 × 1754', w: 1240, h: 1754, d: '프린트해서 걸기' },
  { n: '작게 (연습)', s: '800 × 800', w: 800, h: 800, d: '빠르고 가벼워요' }, { n: '캐릭터 카드', s: '900 × 1260', w: 900, h: 1260, d: '캐릭터 소개 카드' },
];
function newArtModal() {
  openModal(`<h3>🖌️ 새 그림</h3><div class="mrow"><label>제목</label><input type="text" id="naT" value="${esc(LAST.art.title)}"></div><div class="mrow"><label>캔버스 크기</label><div class="size-grid">${ART_SIZES.map((s, i) => `<button data-i="${i}" class="${i === LAST.art.sel ? 'on' : ''}"><b>${s.n}</b><small>${s.s} · ${s.d}</small></button>`).join('')}</div></div><div class="mbtns"><button class="btn sec sm" id="naX">취소</button><button class="btn sm" id="naGo">시작! ✨</button></div>`);
  let sel = LAST.art.sel; $('#modal').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sel = +b.dataset.i; $('#modal').querySelectorAll('[data-i]').forEach(q => q.classList.toggle('on', q === b)); });
  $('#naX').onclick = closeModal; $('#naGo').onclick = () => { const s = ART_SIZES[sel]; const ttl = $('#naT').value.trim() || '나의 그림'; LAST.art = { sel, title: ttl }; closeModal(); const d = newDoc('art', s.w, s.h, ttl); NAV_MODAL = () => newArtModal(); enterEditor(d); };
}
const TOON_STARTS = [
  { n: '빈 화면', d: '칸 없이 시작', t: null }, { n: '4컷 만화', d: '기·승·전·결 연습', t: '4컷 만화' }, { n: '웹툰 표지', d: '제목 + 큰 그림', t: '웹툰 표지' },
  { n: '대화 장면', d: '두 사람이 이야기', t: '좌우 교차 4칸' }, { n: '캐릭터 시트', d: '앞·옆·뒤 + 표정', t: '캐릭터 시트' }, { n: '표정 연습 9칸', d: '감정 표현 연습', t: '표정 연습 9칸' },
];
function newToonModal(title, startIdx) {
  if (title == null && startIdx == null) { title = LAST.toon.title; startIdx = LAST.toon.sel; } const n0 = title === LAST.toon.title ? LAST.toon.n : 1;
  openModal(`<h3>📱 새 웹툰</h3><div class="mrow"><label>웹툰 제목</label><input type="text" id="ntT" value="${esc(title || '나의 첫 웹툰')}"></div>
  <div class="mrow"><label>어떻게 시작할까요?</label><div class="size-grid">${TOON_STARTS.map((s, i) => `<button data-i="${i}" class="${i === (startIdx || 0) ? 'on' : ''}"><b>${s.n}</b><small>${s.d}</small></button>`).join('')}</div></div>
  <div class="mrow"><label>처음 화면 수 (나중에 ＋로 더 늘릴 수 있어요)</label><div class="chips" id="ntN">${[1, 3, 5, 10].map(k => `<button class="chip ${k === n0 ? 'on' : ''}" data-n="${k}">${k}개</button>`).join('')}</div></div>
  <p style="font-size:13px;color:#77738a;line-height:1.5;margin:6px 0">📏 한 화면은 800 × 1280 (폰 화면 비율)이에요. 화면들이 위아래로 이어져서 한 편의 웹툰이 돼요.</p>
  <div class="mbtns"><button class="btn sec sm" id="ntX">취소</button><button class="btn lav sm" id="ntGo">시작! 🎬</button></div>`);
  let sel = startIdx || 0, n = n0;
  $('#modal').querySelectorAll('[data-i]').forEach(b => b.onclick = () => { sel = +b.dataset.i; $('#modal').querySelectorAll('[data-i]').forEach(q => q.classList.toggle('on', q === b)); });
  $$('#ntN .chip').forEach(b => b.onclick = () => { n = +b.dataset.n; $$('#ntN .chip').forEach(q => q.classList.toggle('on', q === b)); });
  $('#ntX').onclick = closeModal;
  $('#ntGo').onclick = () => {
    const ttl = $('#ntT').value.trim() || '나의 첫 웹툰'; LAST.toon = { title: ttl, sel, n }; NAV_MODAL = () => newToonModal(); closeModal(); const d = newDoc('toon', 800, 1280, ttl);
    for (let i = 1; i < n; i++) d.pages.push(newPage(800, 1280));
    const st = TOON_STARTS[sel]; if (st.t) { const t = TEMPLATES.find(x => x.name === st.t); if (t) d.pages[0].panels = tplToPanels(t); }
    enterEditor(d); if (sel === 0) setTimeout(() => toast('💬 아래 "웹툰" 버튼에서 칸 나누기를 골라 보세요!', 3200), 600);
  };
}
function enterEditor(d) {
  if ($('#home').classList.contains('active')) { const t = ($('.home-nav button.active') || {}).dataset; NAV = { tab: (t && t.tab) || 'works', lesson: LESSON_OPEN, scroll: $('#homeMain').scrollTop, modal: NAV_MODAL }; }
  NAV_MODAL = null;
  stopPlay(); ST.guide = null; ST.frame = 0; ST.playing = false; FLOAT = null; SEL = null; hideSelBar();
  ST.doc = d; ST.page = d.pages[d.cur || 0]; ST.sel = null; ST.selPanel = -1; ST.vp = null; ST.view.flip = 1;
  const an = d.type === 'anim'; $('#tbToonIc').innerHTML = an ? ICONS.film : ICONS.bubble; $('#tbToonLb').textContent = an ? '애니' : '웹툰'; $('#stepCard').style.display = 'none'; $('#timeline').style.display = an ? 'block' : 'none';
  if (an) { d.cur = 0; d.pages[0].layers.forEach(l => { if (l.kind === 'frames') bindCel(l, 0); }); }
  $$('.screen').forEach(s => s.classList.remove('active')); $('#editor').classList.add('active');
  ensureScratch(); resizeView(); fitView(); setPage(d.cur || 0); clearHist(); setTool('brush'); setColor(ST.color); ST.changed = !!d.guide;
  if (an) { setFrame(0); markMission('anim'); }
  $('#tbToon').style.display = ''; document.fonts && document.fonts.ready.then(() => { ST.dirty = true; });
  if (!LS.get('seenHelp', false)) { LS.set('seenHelp', true); setTimeout(showHelp, 400); }
  if (d.type === 'toon') markMission('toon');
}
async function leaveEditor(cb) {
  if (FLOAT) commitFloat(); stopPlay(); if (STROKE) endStroke(); closeSheets(); hideHint(); ST.guide = null; $('#stepCard').style.display = 'none';
  if (ST.changed) { toast('💾 저장 중...', 900); await saveDoc(false); }
  ST.doc = null; ST.page = null; $$('.screen').forEach(s => s.classList.remove('active')); $('#home').classList.add('active');
  if (cb) cb(); else goNav();
}

/* ---------- missions ---------- */
const MISSIONS = [
  { id: 'save', t: '첫 작품 저장하기', d: '그림을 그리고 💾 저장!' },
  { id: 'layers', t: '레이어 3개 써보기', d: '밑그림 · 선화 · 색칠을 따로', manual: true },
  { id: 'clip', t: '클리핑으로 그림자 넣기', d: '곱하기 + 클리핑 레이어', manual: true },
  { id: 'toon', t: '웹툰 만들기 시작', d: '새 웹툰 누르기' },
  { id: 'four', t: '4컷 만화 완성하기', d: '기 · 승 · 전 · 결', manual: true },
  { id: 'bubbles', t: '말풍선 5가지 써보기', d: '외침, 생각, 속삭임...', manual: true },
  { id: 'fx', t: '집중선으로 놀란 장면', d: '웹툰 → 효과 → 집중선', manual: true },
  { id: 'faces', t: '표정 9개 그리기', d: '표정 연습 9칸 템플릿', manual: true },
  { id: 'sheet', t: '내 캐릭터 시트 만들기', d: '앞 · 옆 · 뒤 모습', manual: true },
  { id: 'preview', t: '미리보기로 내 웹툰 읽기', d: '위의 👁 버튼' },
  { id: 'export', t: '웹툰을 길게 이어서 저장', d: '메뉴 → 웹툰 길게 이어서' },
  { id: 'ep1', t: '10화면 웹툰 1화 완성!', d: '진짜 웹툰 작가 데뷔 🎉', manual: true },
  { id: 'trace', t: '따라 그리기 해보기', d: '✏️ 따라 그리기 탭' },
  { id: 'anim', t: '첫 애니메이션 시작', d: '새 애니 누르기' },
  { id: 'example', t: '애니 예제 하나 끝까지 따라하기', d: '🎞 애니 → 따라하기 예제' },
  { id: 'key', t: '파트를 끌어서 키프레임 만들기', d: '✥ 파트 움직이기' },
  { id: 'ball', t: '공 튀기기 완성!', d: '찌그러짐 + 점점 빠르게/느리게', manual: true },
  { id: 'gif', t: '움직이는 GIF 저장하기', d: '🎞 애니 → GIF' },
  { id: 'emoji', t: '나만의 움직이는 이모티콘', d: '투명 배경 GIF로 완성', manual: true },
];
function markMission(id) { const m = LS.get('missions', {}); if (!m[id]) { m[id] = Date.now(); LS.set('missions', m); touchDay(); checkLevelUp(); const ms = MISSIONS.find(x => x.id === id); if (ms) setTimeout(() => toast(`🏅 미션 성공! "${ms.t}"`, 2600), 500); } }

const ANIM_SIZES = [{ n: '이모티콘', s: '360 × 360', w: 360, h: 360 }, { n: '정사각형', s: '480 × 480', w: 480, h: 480 }, { n: '가로 영상', s: '640 × 360', w: 640, h: 360 }, { n: '세로 영상', s: '360 × 640', w: 360, h: 640 }];
function newAnimModal() {
  openModal(`<h3>🎞️ 새 애니메이션</h3><div class="mrow"><label>제목</label><input type="text" id="nmT" value="${esc(LAST.anim.title)}"></div>
  <div class="mrow"><label>크기</label><div class="size-grid">${ANIM_SIZES.map((s, i) => `<button data-s="${i}" class="${i === LAST.anim.si ? 'on' : ''}"><b>${s.n}</b><small>${s.s}</small></button>`).join('')}</div></div>
  <div class="mrow"><label>시작 방법</label><div class="size-grid"><button data-k="frames" class="${LAST.anim.kind === 'frames' ? 'on' : ''}"><b>🎞 한 장씩 그리기</b><small>모든 프레임을 직접 그려요</small></button><button data-k="part" class="${LAST.anim.kind === 'part' ? 'on' : ''}"><b>🔑 키프레임 파트</b><small>한 번 그리고 움직이기</small></button></div></div>
  <div class="mrow"><label>프레임 수 (12fps 기준)</label><div class="chips" id="nmF">${[[6, '6장 (0.5초)'], [12, '12장 (1초)'], [24, '24장 (2초)']].map(([k, t]) => `<button class="chip ${k === LAST.anim.fr ? 'on' : ''}" data-f="${k}">${t}</button>`).join('')}</div></div>
  <div class="mrow"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px"><label style="margin:0">⭐ 아니면 예제로 시작<br><small>(따라하기 안내가 나와요)</small></label><button class="btn sm" id="nmGo2" style="flex:0 0 auto">시작하기 🎬</button></div><div class="size-grid">${[...ANIM_EXAMPLES].sort((a, b) => (EX_LV[a.id] || 2) - (EX_LV[b.id] || 2)).map(e => `<button data-ex="${e.id}"><b>${e.em} ${e.name} <span class="lvb lv${EX_LV[e.id] || 2}">${LVN[EX_LV[e.id] || 2]}</span></b><small>${e.desc}</small></button>`).join('')}</div></div>
  <div class="mbtns"><button class="btn sec sm" id="nmX">취소</button><button class="btn sm" id="nmGo">빈 애니 시작! 🎬</button></div>`);
  let si = LAST.anim.si, kind = LAST.anim.kind, fr = LAST.anim.fr; const M = $('#modal');
  M.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { si = +b.dataset.s; M.querySelectorAll('[data-s]').forEach(q => q.classList.toggle('on', q === b)); });
  M.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { kind = b.dataset.k; M.querySelectorAll('[data-k]').forEach(q => q.classList.toggle('on', q === b)); });
  M.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { fr = +b.dataset.f; M.querySelectorAll('[data-f]').forEach(q => q.classList.toggle('on', q === b)); });
  M.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { closeModal(); NAV_MODAL = () => newAnimModal(); startExample(b.dataset.ex); });
  $('#nmX').onclick = closeModal;
  $('#nmGo2').onclick = () => $('#nmGo').onclick();
  $('#nmGo').onclick = () => {
    const S = ANIM_SIZES[si]; LAST.anim = { si, kind, fr, title: $('#nmT').value.trim() || '나의 애니메이션' }; NAV_MODAL = () => newAnimModal(); closeModal(); const d = newAnimDoc(S.w, S.h, $('#nmT').value.trim() || '나의 애니메이션', { frames: fr }); const L = d.pages[0].layers;
    if (kind === 'frames') { L.push(mkFramesL(d, '배경')); L.push(mkFramesL(d, '그림 1')); d.pages[0].active = 1; }
    else { L.push(mkPartL(d, '배경 (고정)')); L.push(mkPartL(d, '파트 1')); d.pages[0].active = 1; }
    enterEditor(d);
    setTimeout(() => toast(kind === 'frames' ? '✏️ 1번 프레임을 그리고 ⧉로 복사해서 조금씩 바꿔 그려요!' : '🔑 파트 1에 그림을 그린 뒤 🎞 애니 → ✥ 파트 움직이기!', 3600), 500);
  };
}

/* ---------- back navigation ---------- */
let NAV = { tab: 'works', lesson: null, scroll: 0, modal: null }, NAV_MODAL = null;
const LAST = { art: { sel: 0, title: '나의 그림' }, toon: { title: '나의 첫 웹툰', sel: 0, n: 1 }, anim: { si: 1, kind: 'frames', fr: 12, title: '나의 애니메이션' } };
const NAV_NAMES = { works: '내 작품', school: '배우기', idea: '아이디어', trace: '따라 그리기' };
function goNav() { const N = NAV; LESSON_OPEN = N.tab === 'school' ? N.lesson : null; homeTab(N.tab); setTimeout(() => { $('#homeMain').scrollTop = N.scroll || 0; if (N.modal) N.modal(); }, 40); }
function stepBack() {
  if ($('#modalWrap').classList.contains('on')) { closeModal(); return; }
  if ($('#saveView').classList.contains('on')) { $('#saveView').classList.remove('on'); return; }
  if ($$('.sheet.open').length) { closeSheets(); return; }
  if (ST.placing) { ST.placing = null; hideHint(); toast('넣기를 취소했어요', 1200); return; }
  if (ST.playing) { stopPlay(); return; }
  if (FLOAT) { commitFloat(); setTool(ST.prevTool || 'brush'); toast('✔ 선택을 끝냈어요', 1200); return; }
  if (['lasso', 'select', 'panel', 'xform', 'vp', 'hand', 'picker', 'move'].includes(ST.tool)) { setTool(ST.prevTool || 'brush'); return; }
  const where = NAV.modal ? '선택 화면' : NAV.tab === 'school' && NAV.lesson ? '수업' : NAV_NAMES[NAV.tab] || '내 작품';
  leaveEditor(); setTimeout(() => toast(NAV.modal ? '← 고르는 화면으로 돌아왔어요 (그리던 건 내 작품에 저장돼요)' : `← ${where}(으)로 돌아왔어요`, 2200), 60);
}
