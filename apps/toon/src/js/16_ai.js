/* ================= AI 그림 선생님 (시범) ================= */
// 정식 앱에서 쓸 서버 주소. 서버를 만든 뒤 여기에 넣는다. 비어 있으면 Claude 페이지에서만 동작.
const AI_ENDPOINT = '';
const AI_FREE_PER_DAY = 3;
let AI_SAMPLE = null, AI_READY = false;
(async () => { try { if (window.claude && claude.use) { const s = await claude.use('sample'); if (s) { AI_SAMPLE = s; try { const lim = await s.limits(); if (!lim || !lim.images) AI_SAMPLE = null; } catch (e) { } } } } catch (e) { } AI_READY = true; })();
function aiAvailable() { return !!(AI_SAMPLE || AI_ENDPOINT); }
function aiUsedToday() { const u = LS.get('aiUse', {}); return u.d === todayKey() ? u.n : 0; }
function aiBump() { const n = aiUsedToday() + 1; LS.set('aiUse', { d: todayKey(), n }); }
function aiLeft() { return Math.max(0, AI_FREE_PER_DAY - aiUsedToday()); }
const TEACH_IC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.3L12 4.8l9.5 4.5L12 13.8z"/><path d="M6.5 11.4v4.4c0 1.6 2.5 3.2 5.5 3.2s5.5-1.6 5.5-3.2v-4.4"/><path d="M20 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor"/></svg>';

async function aiSnapshot() {
  if (FLOAT) commitFloat();
  const d = ST.doc, s = Math.min(1, 900 / Math.max(d.w, d.h));
  const src = renderPageCanvas(ST.page, s); const c = mkCanvas(src.width, src.height), x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0);
  return new Promise(r => c.toBlob(b => r({ blob: b, url: c.toDataURL('image/jpeg', .85) }), 'image/jpeg', .85));
}
function aiLessonList() {
  const out = []; COURSE.forEach(L => L.units.forEach(u => { if (u[0] === 'mission') return; const I = unitInfo(u); out.push({ id: u[0] + ':' + u[1], name: I.t, level: L.lv }); }));
  TRACE_LESSONS.forEach(e => { if (!out.find(o => o.id === 'trace:' + e.id)) out.push({ id: 'trace:' + e.id, name: e.name, level: e.lv }); });
  return out;
}
function aiPrompt() {
  const d = ST.doc; const kind = d.type === 'toon' ? '웹툰' : d.type === 'anim' ? '애니메이션의 한 장면' : '그림';
  const g = d.guide ? (guidedById(d.guide) || {}).name : null;
  const S = courseStat();
  return `너는 초등학생 아이들을 가르치는 다정한 미술 선생님이야. 첨부한 이미지는 아이가 휴대폰 그림 앱으로 직접 그린 ${kind}이야.${g ? ` 아이는 '${g}' 따라 그리기 교본을 연습하는 중이야.` : ''} 아이의 지금 단계는 '${S.cur ? S.cur.lv + '단계 ' + S.cur.t : '모든 단계 완료'}'야.
규칙:
- 반드시 한국어, 초등학생이 이해하는 쉬운 말, 존댓말 대신 다정한 반말(예: "~했구나!", "~해 보자").
- 먼저 구체적으로 잘한 점 한 가지를 칭찬해. 그림에 실제로 보이는 것만 말해.
- 다음에 해 볼 것 두 가지를 알려 줘. 각각 짧은 제목과, 바로 따라 할 수 있는 방법 한두 문장. 비율, 모양, 선, 구도, 색, 표정, 칸 나누기처럼 그림 실력에 관한 것만.
- 그림을 대신 그려 주지 말고, 아이가 직접 고칠 수 있게 안내해.
- 그림과 상관없는 이야기, 무섭거나 어른스러운 내용, 아이의 외모·개인정보에 관한 말은 절대 하지 마.
- 그림이 거의 비어 있거나 알아보기 어려우면, 혼내지 말고 무엇을 그려 보면 좋을지 다정하게 제안해.
- 아래 수업 목록에서 지금 그림에 가장 도움이 될 수업 하나의 id를 골라.
수업 목록: ${JSON.stringify(aiLessonList())}
아래 JSON 형식으로만 답해:
{"praise":"칭찬 한두 문장","tips":[{"title":"짧은 제목","how":"방법"},{"title":"짧은 제목","how":"방법"}],"lesson":"수업 id","cheer":"응원 한 문장"}`;
}
async function aiAsk(snap) {
  if (AI_SAMPLE) {
    const r = await AI_SAMPLE.json(aiPrompt(), { images: [snap.blob], modelTier: 'default' });
    return r && r.value !== undefined ? r.value : r;
  }
  const res = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device: aiDeviceId(), image: snap.url.split(',')[1], prompt: aiPrompt() }) });
  if (res.status === 429) { LS.set('aiUse', { d: todayKey(), n: AI_FREE_PER_DAY }); throw { code: 'limit' }; }
  if (!res.ok) throw { code: 'server', message: res.status };
  return await res.json();
}
function aiDeviceId() { let id = LS.get('devId', null); if (!id) { id = uid() + uid(); LS.set('devId', id); } return id; }

function aiConsentModal(then) {
  const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 5);
  openModal(`<div class="ai-hd">${TEACH_IC}<div><small>보호자 확인</small><h3>AI 그림 선생님을 켤까요?</h3></div></div>
  <ul class="ai-list"><li>아이가 <b>“선생님께 보여주기”</b>를 누를 때만, 지금 그린 <b>그림 한 장</b>이 AI로 보내져 칭찬과 연습 팁을 받아요.</li><li>이름·나이·사진 같은 <b>개인정보는 보내지 않아요.</b> 보낸 그림은 AI 답을 만드는 데만 쓰이고 따로 저장하지 않아요.</li><li>AI의 답이 이상하면 <b>“이상해요” 버튼</b>으로 알려 주세요.</li><li>시범 기간에는 <b>하루 ${AI_FREE_PER_DAY}번</b>까지 쓸 수 있어요.</li></ul>
  <div class="mrow"><label>어른만 풀어 주세요: ${a} × ${b} = ?</label><input type="text" inputmode="numeric" id="aiQ" placeholder="답"></div>
  <div class="mbtns"><button class="btn sec sm" id="aiNo">나중에</button><button class="btn sm" id="aiYes">동의하고 켜기</button></div>`);
  $('#aiNo').onclick = closeModal;
  $('#aiYes').onclick = () => { if (+$('#aiQ').value !== a * b) { toast('보호자 확인 답이 달라요'); $('#aiQ').value = ''; return; } LS.set('aiConsent', Date.now()); closeModal(); then(); };
}
async function openTeacher() {
  if (!AI_READY) { toast('잠깐만요, AI 선생님을 부르는 중이에요'); return; }
  if (!aiAvailable()) { openModal(`<div class="ai-hd">${TEACH_IC}<div><small>곧 만나요</small><h3>AI 그림 선생님</h3></div></div><p class="ai-p">내 그림을 보고 칭찬과 연습 팁을 알려 주는 AI 선생님이 준비 중이에요. 조금만 기다려 주세요!</p><div class="mbtns"><button class="btn sm" id="aiOk">알겠어요</button></div>`); $('#aiOk').onclick = closeModal; return; }
  if (!LS.get('aiConsent', 0)) return aiConsentModal(openTeacher);
  if (!aiLeft()) { openModal(`<div class="ai-hd">${TEACH_IC}<div><small>오늘은 여기까지</small><h3>내일 또 보여 줘!</h3></div></div><p class="ai-p">오늘 선생님께 ${AI_FREE_PER_DAY}번 보여 줬어요. 오늘 받은 팁으로 연습하고, 내일 다시 보여 주세요.</p><div class="mbtns"><button class="btn sm" id="aiOk">좋아요</button></div>`); $('#aiOk').onclick = closeModal; return; }
  const snap = await aiSnapshot();
  openModal(`<div class="ai-hd">${TEACH_IC}<div><small>AI 그림 선생님</small><h3>그림을 보고 있어요…</h3></div></div><div class="ai-pic"><img src="${snap.url}" alt=""><div class="ai-scan"></div></div><p class="ai-p" style="text-align:center">선생님이 꼼꼼히 보는 중이에요. 잠시만요!</p>`);
  let out;
  try { out = await aiAsk(snap); } catch (e) {
    const msg = e && e.code === 'limit' ? `오늘은 선생님께 ${AI_FREE_PER_DAY}번 다 보여 줬어요. 내일 또 만나요!` : e && e.code === 'rate_limited' ? '지금 선생님을 찾는 친구가 많아요. 조금 뒤에 다시 해 봐요.' : e && e.code === 'not_granted' ? 'AI 사용이 허락되지 않았어요.' : '선생님과 연결이 잘 안 됐어요. 인터넷을 확인하고 다시 해 봐요.';
    openModal(`<div class="ai-hd">${TEACH_IC}<div><small>앗!</small><h3>다시 해 볼까요?</h3></div></div><p class="ai-p">${msg}</p><div class="mbtns"><button class="btn sm" id="aiOk">닫기</button></div>`); $('#aiOk').onclick = closeModal; return;
  }
  if (!out || !out.praise) { openModal(`<p class="ai-p">선생님 답을 읽지 못했어요. 한 번 더 해 볼까요?</p><div class="mbtns"><button class="btn sm" id="aiOk">닫기</button></div>`); $('#aiOk').onclick = closeModal; return; }
  aiBump(); touchDay(); learnMark('ai:' + todayKey() + ':' + aiUsedToday());
  const log = LS.get('aiLog', []); log.unshift({ t: Date.now(), title: ST.doc.title, praise: out.praise, tips: out.tips }); LS.set('aiLog', log.slice(0, 30));
  showTeacher(snap, out);
}
function showTeacher(snap, out) {
  const esc2 = s => esc(String(s || ''));
  const L = (out.lesson || '').split(':'); let lesson = null;
  if (L.length === 2) { const u = [L[0], L[1]]; const I = unitInfo(u); if (I && I.t !== L[1]) lesson = { u, I }; }
  const tips = (out.tips || []).slice(0, 2).map((t, i) => `<div class="ai-tip"><span>${i + 1}</span><div><b>${esc2(t.title)}</b><p>${esc2(t.how)}</p></div></div>`).join('');
  openModal(`<div class="ai-hd">${TEACH_IC}<div><small>AI 그림 선생님</small><h3>잘 그렸어!</h3></div></div>
  <div class="ai-top"><img src="${snap.url}" alt=""><div class="ai-praise"><small>칭찬해요</small><p>${esc2(out.praise)}</p></div></div>
  <div class="ai-sub">다음엔 이렇게 해 볼까?</div>${tips}
  ${lesson ? `<button class="lc-next ai-les" id="aiLes"><span class="lc-em">${lesson.I.em}</span><span class="lc-tx"><small>추천 수업 · ${UTYPE[lesson.u[0]] || ''}</small><b>${esc2(lesson.I.t)}</b></span><span class="lc-play"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span></button>` : ''}
  ${out.cheer ? `<p class="ai-cheer">${esc2(out.cheer)}</p>` : ''}
  <div class="ai-foot"><button class="ai-rep" id="aiRep">이상해요</button><small>오늘 ${aiLeft()}번 남았어요</small></div>
  <div class="mbtns"><button class="btn sm" id="aiOk">계속 그리기</button></div>`);
  $('#aiOk').onclick = closeModal;
  if (lesson) $('#aiLes').onclick = () => { closeModal(); leaveEditor(() => startUnit(lesson.u)); };
  $('#aiRep').onclick = () => { const r = LS.get('aiReports', []); r.unshift({ t: Date.now(), out }); LS.set('aiReports', r.slice(0, 50)); if (AI_ENDPOINT) fetch(AI_ENDPOINT.replace(/\/$/, '') + '/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device: aiDeviceId(), out }) }).catch(() => { }); $('#aiRep').textContent = '알려 줘서 고마워요'; $('#aiRep').disabled = true; };
}
