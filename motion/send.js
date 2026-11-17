/* NNN 모션 코치 — 회원 피드백(카드·카톡), 블렌더, 힉스필드, 저장/불러오기 */
(function () {
  'use strict';
  const N = window.NNN, C = window.Core, S = N.S;
  const $ = id => document.getElementById(id);
  let DB = null, UID = null, DL = null;

  // ---------- 플랫폼 기능 (저장 / 다운로드) ----------
  (async function initCaps() {
    let tries = 0;
    while (!(window.claude && window.claude.use) && tries < 30) { await new Promise(r => setTimeout(r, 100)); tries++; }
    if (!(window.claude && window.claude.use)) { renderSaved(); renderSaveBar(); return; }
    try {
      const [db, user, dl] = await Promise.all([
        window.claude.use('db').catch(() => null),
        window.claude.use('user').catch(() => null),
        window.claude.use('downloads').catch(() => null)
      ]);
      DL = dl;
      if (db && user) { UID = await user.id().catch(() => null); if (UID) DB = db; }
    } catch (e) { console.warn(e); }
    renderSaved(); renderSaveBar(); updateDlButtons();
  })();

  // ---------- 회원 이름 ----------
  const nameEl = $('memberName');
  try { nameEl.value = localStorage.getItem('nnn_member') || ''; } catch (e) { }
  nameEl.addEventListener('input', () => {
    try { localStorage.setItem('nnn_member', nameEl.value); } catch (e) { }
    S.memberName = nameEl.value.trim(); if (S.sessionId) { S.unsaved = true; S.editTs = Date.now(); } updatePrompt();
  });
  const member = () => (nameEl.value || '').trim();

  // ---------- 탭 ----------
  $('sendSeg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...$('sendSeg').children].forEach(x => x.classList.toggle('on', x === b));
    ['video', 'card', 'blender', 'higgs', 'data'].forEach(v => $('pane-' + v).classList.toggle('hide', v !== b.dataset.v));
  });

  // ---------- 분석 끝났을 때 ----------
  const issueRank = i => (i.layerId ? 10 : 0) + i.sev;
  function onFinish() {
    const an = S.an, n = S.data.frames.length;
    if (S.memberName != null && S.fromSaved) nameEl.value = S.memberName;
    const list = an.issues.filter(i => !(i.f0 === 0 && i.f1 === n - 1)).slice().sort((a, b) => issueRank(b) - issueRank(a));
    const sel = $('cardIssue');
    sel.innerHTML = list.map(i => `<option value="${i.id}">${N.fmt(i.peak)} · ${i.title}</option>`).join('') +
      `<option value="__now">지금 화면의 장면</option>`;
    $('cardImg').classList.add('hide'); $('cardBtns').classList.add('hide'); $('cardNote').textContent = '';
    $('blNote').textContent = '';
    updatePrompt(); updateDlButtons();
    if (!S.data.demo && !S.fromSaved && DB) saveSession(true);
    S.unsaved = false;
    renderSaveBar();
  }

  // ---------- 피드백 카드 ----------
  function wrap(ctx, text, maxW) {
    const out = []; let line = '';
    for (const word of text.split(' ')) {
      const t = line ? line + ' ' + word : word;
      if (ctx.measureText(t).width <= maxW) { line = t; continue; }
      if (line) out.push(line);
      if (ctx.measureText(word).width <= maxW) { line = word; continue; }
      line = '';
      for (const ch of word) { if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch; }
    }
    if (line) out.push(line);
    return out;
  }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function pill(ctx, x, y, text, bg, fg, size, align) {
    ctx.font = `700 ${size}px "Noto Sans KR"`;
    const w = ctx.measureText(text).width + size * 1.4, h = size * 1.75;
    const x0 = align === 'center' ? x - w / 2 : x;
    ctx.fillStyle = bg; rrect(ctx, x0, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x0 + size * 0.7, y + h / 2 + 1);
    return h;
  }
  async function seekVideo(f) {
    if (!S.hasVideo) return;
    N.pause();
    const p = N.once(N.video, 'seeked', 2000);
    N.video.currentTime = f / S.data.fps;
    await p;
  }
  // 포즈 영역을 패널에 맞추는 변환
  function fitPose(poses, aspect, px, py, pw, ph) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    poses.forEach(P => [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32].forEach(j => {
      x0 = Math.min(x0, P[j][0] * aspect); x1 = Math.max(x1, P[j][0] * aspect);
      y0 = Math.min(y0, P[j][1]); y1 = Math.max(y1, P[j][1]);
    }));
    const m = Math.max(x1 - x0, y1 - y0) * 0.14;
    x0 -= m; x1 += m; y0 -= m * 1.3; y1 += m * 0.6;
    const s = Math.min(pw / (x1 - x0), ph / (y1 - y0));
    const ox = px + pw / 2 - s * (x0 + x1) / 2, oy = py + ph / 2 - s * (y0 + y1) / 2;
    return { ox, oy, sx: s * aspect, sy: s };
  }
  async function makeCard() {
    const btn = $('makeCard'); btn.disabled = true; btn.textContent = '만드는 중…';
    try {
      await document.fonts.load('700 40px "Noto Sans KR"').catch(() => { });
      await document.fonts.load('700 40px Oswald').catch(() => { });
      const an = S.an, d = S.data, fps = d.fps;
      const pick = $('cardIssue').value;
      const issue = an.issues.find(i => i.id === pick);
      const f = issue ? issue.peak : Math.round(S.t * fps);
      await seekVideo(f);
      const orig = d.frames[f].img, corr = N.corrAt(f);
      const W = 1080, H = 1350;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#0d0f12'; ctx.fillRect(0, 0, W, H);
      // 헤더
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      ctx.font = '700 40px Oswald, "Noto Sans KR"'; ctx.fillStyle = '#eef1f5'; ctx.fillText('NNN', 60, 86);
      const nw = ctx.measureText('NNN ').width; ctx.fillStyle = '#3dff8f'; ctx.fillText('BOXING', 60 + nw, 86);
      ctx.font = '500 24px "Noto Sans KR"'; ctx.fillStyle = '#8b93a1';
      const now = new Date();
      ctx.fillText(`${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} 동작 피드백`, 60, 124);
      ctx.font = '900 54px "Noto Sans KR"'; ctx.fillStyle = '#eef1f5';
      ctx.fillText(member() ? `${member()} 회원님` : '오늘의 동작 피드백', 60, 196);
      // 점수
      const sc = an.score, col = sc >= 85 ? '#3dff8f' : sc >= 70 ? '#ffcc33' : sc >= 55 ? '#ffb347' : '#ff5d5d';
      ctx.lineWidth = 16; ctx.strokeStyle = '#2a2f38'; ctx.beginPath(); ctx.arc(950, 130, 70, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(950, 130, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sc / 100); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#eef1f5'; ctx.font = '700 52px Oswald, "Noto Sans KR"'; ctx.fillText(sc, 950, 146);
      ctx.font = '500 20px "Noto Sans KR"'; ctx.fillStyle = '#8b93a1'; ctx.fillText('자세 점수', 950, 232);
      // 패널
      const py = 250, ph = 600, pw = 470, pxs = [60, 550];
      const fit = fitPose([orig, corr], d.aspect, 0, 0, pw, ph);
      for (let k = 0; k < 2; k++) {
        const px = pxs[k];
        ctx.save(); rrect(ctx, px, py, pw, ph, 26); ctx.clip();
        ctx.fillStyle = '#07080a'; ctx.fillRect(px, py, pw, ph);
        ctx.translate(px + fit.ox, py + fit.oy);
        if (k === 0 && S.hasVideo && N.video.readyState >= 2) {
          ctx.drawImage(N.video, 0, 0, fit.sx, fit.sy);
          ctx.fillStyle = 'rgba(5,7,10,0.35)'; ctx.fillRect(-fit.ox, -fit.oy, pw, ph);
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
          for (let g = -2; g < 14; g++) { ctx.beginPath(); ctx.moveTo(-fit.ox + g * 48, -fit.oy); ctx.lineTo(-fit.ox + g * 48, -fit.oy + ph); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-fit.ox, -fit.oy + g * 48); ctx.lineTo(-fit.ox + pw, -fit.oy + g * 48); ctx.stroke(); }
        }
        if (k === 0) N.drawSkel(ctx, orig, fit.sx, fit.sy, '#ff5d5d', 7, 0.95);
        else {
          N.drawSkel(ctx, orig, fit.sx, fit.sy, '#ff5d5d', 5, 0.25);
          N.drawSkel(ctx, corr, fit.sx, fit.sy, '#3dff8f', 7, 1, { glow: true });
          N.drawArrows(ctx, orig, corr, fit.sx, fit.sy, 18);
        }
        ctx.restore();
        pill(ctx, px + 18, py + 18, k === 0 ? '지금 내 자세' : '이렇게 고쳐요', k === 0 ? '#ff5d5d' : '#3dff8f', k === 0 ? '#2a0606' : '#06200f', 26);
      }
      let y = py + ph + 26;
      if (issue) y += pill(ctx, W / 2, y, '⚠ ' + issue.title, '#2a2412', '#ffe6a3', 28, 'center') + 26;
      else y += 10;
      // 코치 한마디
      const tops = an.issues.slice().sort((a, b) => issueRank(b) - issueRank(a));
      if (issue) { tops.splice(tops.indexOf(issue), 1); tops.unshift(issue); }
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '700 28px "Noto Sans KR"'; ctx.fillStyle = '#3dff8f'; ctx.fillText('코치 한마디', 60, y + 20); y += 46;
      const maxY = H - 80;
      for (let k = 0; k < Math.min(3, tops.length); k++) {
        const it = tops[k];
        ctx.font = '700 29px "Noto Sans KR"';
        const tl = wrap(ctx, it.title, W - 170);
        ctx.font = '400 25px "Noto Sans KR"';
        const cl = wrap(ctx, it.cue, W - 170).slice(0, 2);
        const need = tl.length * 38 + cl.length * 34 + 20;
        if (y + need > maxY) break;
        ctx.fillStyle = '#1c2027'; ctx.beginPath(); ctx.arc(80, y + 2, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3dff8f'; ctx.font = '700 22px Oswald, "Noto Sans KR"'; ctx.textAlign = 'center'; ctx.fillText(k + 1, 80, y + 10);
        ctx.textAlign = 'left';
        ctx.font = '700 29px "Noto Sans KR"'; ctx.fillStyle = '#eef1f5';
        tl.forEach((l, i) => ctx.fillText(l, 115, y + 12 + i * 38));
        let yy = y + 12 + tl.length * 38;
        ctx.font = '400 25px "Noto Sans KR"'; ctx.fillStyle = '#b8c0cc';
        cl.forEach((l, i) => ctx.fillText(l, 115, yy + i * 34));
        y = yy + cl.length * 34 + 20;
      }
      if (!tops.length) { ctx.font = '500 28px "Noto Sans KR"'; ctx.fillStyle = '#eef1f5'; ctx.fillText('👏 큰 문제 없이 아주 좋아요! 지금 리듬 그대로 유지하세요.', 60, y + 10); }
      // 푸터
      ctx.fillStyle = '#2a2f38'; ctx.fillRect(60, H - 70, W - 120, 2);
      ctx.font = '500 22px "Noto Sans KR"'; ctx.fillStyle = '#8b93a1'; ctx.textAlign = 'left';
      ctx.fillText('탕정 엔엔엔복싱 · NNN BOXING', 60, H - 30);
      ctx.textAlign = 'right'; ctx.fillText('빨강 = 지금 · 초록 = 교정', W - 60, H - 30);

      S._card = cv;
      const img = $('cardImg'); img.src = cv.toDataURL('image/jpeg', 0.92); img.classList.remove('hide');
      $('cardBtns').classList.remove('hide');
      $('cardNote').textContent = '공유 버튼을 누르면 카카오톡으로 바로 보낼 수 있어요. (이미지를 길게 눌러 저장해도 돼요)';
      N.markDirty();
    } catch (e) {
      console.error(e); $('cardNote').textContent = '카드를 만들지 못했어요: ' + e.message;
    } finally { btn.disabled = false; btn.innerHTML = IC('card') + '피드백 카드 다시 만들기'; }
  }
  $('makeCard').onclick = makeCard;

  function kakaoText() {
    const an = S.an, nm = member();
    const tops = an.issues.slice().sort((a, b) => issueRank(b) - issueRank(a)).slice(0, 3);
    const goods = goodList();
    let t = `[NNN BOXING] ${nm ? nm + ' 회원님 ' : ''}동작 피드백 🥊\n자세 점수 ${an.score}점\n\n`;
    t += `👍 잘한 점: ${goods.length ? goods.map(e => e.name).join(', ') + ' — 끝까지 뻗고 가드도 유지됐어요!' : '끝까지 집중해서 동작한 점!'}\n\n`;
    if (tops.length) {
      t += '🔧 이번 주 고칠 점\n';
      tops.forEach((it, i) => { t += `${i + 1}) ${it.title}\n   → ${it.cue}\n`; });
      t += `\n📌 다음 수업 때 "${tops[0].title.replace(/^.*?: /, '')}" 같이 집중해서 잡아봐요!\n`;
    } else t += '🔥 큰 문제 없이 아주 좋아요. 지금 리듬 그대로!\n';
    t += '\n- 탕정 엔엔엔복싱';
    return t;
  }
  function goodList() {
    const an = S.an, bad = new Set();
    an.issues.forEach(i => { if (i.ev) bad.add(i.ev); });
    an.events.forEach(ev => { if (an.issues.some(i => i.type === 'guard' && i.ctx === 'other' && i.f0 <= ev.end && i.f1 >= ev.start)) bad.add(ev); });
    return an.events.filter(e => !bad.has(e));
  }
  async function copyText(txt, btn, label) {
    const old = btn.innerHTML;
    try { await navigator.clipboard.writeText(txt); btn.innerHTML = IC('check') + (label || '복사됨'); }
    catch (e) {
      const ta = $('outTxt'); ta.value = txt; ta.style.display = 'block'; ta.scrollIntoView({ block: 'center' }); ta.select();
      btn.textContent = '아래 칸에서 복사하세요';
    }
    setTimeout(() => btn.innerHTML = old, 2000);
  }
  $('copyMsg').onclick = e => copyText(kakaoText(), e.currentTarget, '메시지 복사됨');
  $('shareCard').onclick = async () => {
    if (!S._card) return;
    const blob = await new Promise(r => S._card.toBlob(r, 'image/jpeg', 0.92));
    const ok = await shareFile(`NNN_피드백_${member() || '회원'}.jpg`, blob, kakaoText());
    if (!ok) $('cardNote').textContent = '이 기기에서는 공유창을 열 수 없어요. 이미지 저장 후 카톡에서 보내 주세요.';
  };
  $('saveCard').onclick = async e => {
    const btn = e.currentTarget;
    if (!S._card) return;
    const blob = await new Promise(r => S._card.toBlob(r, 'image/jpeg', 0.92));
    await saveFile(`NNN_피드백_${member() || '회원'}.jpg`, blob, btn, $('cardNote'));
  };

  async function saveFile(filename, data, btn, noteEl) {
    const old = btn.innerHTML;
    const done = () => { btn.innerHTML = IC('check') + '저장됨'; setTimeout(() => btn.innerHTML = old, 2000); return true; };
    if (!DL) {
      // 일반 웹사이트: 브라우저 다운로드
      try {
        const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        return done();
      } catch (e) { noteEl.textContent = '저장하지 못했어요. 복사 버튼을 써 주세요.'; return false; }
    }
    try {
      await DL.save({ filename, data });
      return done();
    } catch (err) {
      const code = err && err.code;
      noteEl.textContent = code === 'declined' ? '저장을 취소했어요.' : code === 'rate_limited' ? '잠시 후 다시 눌러 주세요.' : '저장하지 못했어요 (' + (code || err) + '). 복사 버튼을 써 주세요.';
      return false;
    }
  }
  // 폰 공유창(카톡 등)으로 바로 보내기
  async function shareFile(filename, blob, text) {
    const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return true; } catch (e) { return e && e.name === 'AbortError'; }
    }
    return false;
  }
  function updateDlButtons() {
    const canShare = !!(navigator.canShare && window.File);
    $('shareCard').classList.toggle('hide', !canShare || !!DL);
  }

  // ---------- 블렌더 ----------
  function blenderScript() {
    const bd = C.blenderData(S.data, S.an, S.layers, {
      name: member(), stance: S.stance, slow: +$('blSlow').value, refVertical: $('blRef').value === 'v'
    });
    const json = JSON.stringify(bd).replace(/'''/g, '');
    return window.NNN_BLENDER_TPL.replace('__DATA__', () => json);
  }
  const today = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; };
  $('dlBlender').onclick = async e => {
    const txt = blenderScript();
    const ok = await saveFile(`NNN_블렌더_${member() || '회원'}_${today()}.txt`, txt, e.currentTarget, $('blNote'));
    if (ok) $('blNote').textContent = `스크립트 저장 완료 (${(txt.length / 1024).toFixed(0)}KB). 아래 순서대로 블렌더에서 실행하세요.`;
  };
  $('cpBlender').onclick = e => {
    const txt = blenderScript();
    copyText(txt, e.currentTarget, `복사됨 (${(txt.length / 1024).toFixed(0)}KB)`);
  };

  // ---------- 힉스필드 ----------
  const PROMPTS = {
    gym: 'A real person doing boxing shadow drills in a modern boxing gym, wearing boxing gloves, natural indoor gym lighting, realistic skin and clothing texture, full body always in frame, steady locked-off camera, keep the exact same face, body shape and outfit as the character image.',
    ring: 'A real person doing boxing shadow drills inside a boxing ring with ropes, soft overhead spotlights, realistic skin and clothing texture, full body always in frame, steady locked-off camera, keep the exact same face, body shape and outfit as the character image.',
    photo: 'Keep the background and lighting of the character image, realistic skin and clothing texture, full body always in frame, steady locked-off camera, keep the exact same face, body shape and outfit as the character image.'
  };
  function updatePrompt() { $('hgPrompt').textContent = PROMPTS[$('hgBg').value]; }
  $('hgBg').onchange = updatePrompt;
  $('cpPrompt').onclick = e => copyText($('hgPrompt').textContent, e.currentTarget, '프롬프트 복사됨');
  updatePrompt();

  // ---------- 저장 / 불러오기 ----------
  const r4 = v => Math.round(v * 10000) / 10000, r3 = v => Math.round(v * 1000) / 1000;
  const CH = 120;
  let saving = false;
  async function saveSession(auto) {
    if (!DB || !S.data || S.data.demo || saving) return;
    saving = true; renderSaveBar('저장 중…');
    try {
      const d = S.data, n = d.frames.length, sid = S.sessionId || ('s' + Date.now());
      const base = `data/users/${UID}/${sid}`;
      if (!S.chunksSaved || S.sessionId !== sid) {
        for (let c = 0; c * CH < n; c++) {
          const part = d.frames.slice(c * CH, (c + 1) * CH);
          const img = [], world = [];
          part.forEach(fr => { fr.img.forEach(p => img.push(r4(p[0]), r4(p[1]))); fr.world.forEach(p => world.push(r3(p[0]), r3(p[1]), r3(p[2]))); });
          await DB.doc(base).collection('chunks').doc('c' + c).set({ img, world });
        }
      }
      const cnt = {}; S.an.events.forEach(e => cnt[e.name] = (cnt[e.name] || 0) + 1);
      await DB.doc(base).set({
        kind: 'session', v: 1, name: member(), date: S.sessionDate || new Date().toISOString(), saved: new Date().toISOString(),
        score: S.an.score, fps: d.fps, stance: S.stance, aspect: d.aspect, width: d.width || 0, height: d.height || 0,
        n, chunks: Math.ceil(n / CH), duration: d.duration,
        punches: Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(', '),
        issues: S.an.issues.slice(0, 6).map(i => i.title),
        layers: JSON.parse(JSON.stringify(S.layers)),
        issuesFull: JSON.parse(JSON.stringify(N.serializeIssues())),
        th: Object.assign({}, S.th)
      });
      S.sessionDate = S.sessionDate || new Date().toISOString();
      S.sessionId = sid; S.chunksSaved = true; S.unsaved = false;
      renderSaveBar(); renderSaved();
    } catch (e) {
      console.warn(e);
      renderSaveBar(e && e.code === 'quota_exceeded' ? '저장 공간이 가득 찼어요' : '저장 실패 — 다시 시도해 주세요');
    } finally { saving = false; }
  }
  function renderSaveBar(msg) {
    const bar = $('saveBar'); if (!bar) return;
    if (!S.data) { bar.innerHTML = ''; return; }
    if (S.data.demo) { bar.innerHTML = '데모는 저장하지 않아요.'; return; }
    if (!DB) { bar.innerHTML = ''; return; }
    if (msg) { bar.innerHTML = msg; return; }
    if (S.sessionId && !S.unsaved) bar.innerHTML = IC('cloud') + ' 자동 저장됨 · PC에서 같은 계정으로 열면 이어서 작업';
    else {
      bar.innerHTML = `<span>${S.sessionId ? '변경 사항 저장 대기 중…' : '아직 저장 안 됨.'}</span>`;
      const b = document.createElement('button'); b.className = 'btn small'; b.innerHTML = IC('save') + '저장';
      b.onclick = () => saveSession(false); bar.appendChild(b);
    }
  }
  let lastUnsaved = null;
  setInterval(() => {
    // 키 수정·이름 변경은 2초 동안 손을 떼면 자동 저장
    if (S.unsaved && S.sessionId && DB && !saving && S.data && !S.data.demo && Date.now() - (S.editTs || 0) > 2000) { saveSession(true); return; }
    if (S.unsaved !== lastUnsaved && !saving) { lastUnsaved = S.unsaved; renderSaveBar(); }
  }, 800);

  async function renderSaved() {
    const sec = $('savedSec'), box = $('savedList');
    if (!DB) { sec.classList.add('hide'); return; }
    sec.classList.remove('hide');
    let snap;
    try {
      const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000));
      snap = await Promise.race([DB.collection(`data/users/${UID}`).where('kind', '==', 'session').orderBy('date', 'desc').limit(40).get(), timer]);
    } catch (e) { box.innerHTML = '<div class="muted" style="font-size:13px">저장된 분석을 불러오지 못했어요.</div>'; return; }
    if (snap.empty) { box.innerHTML = '<div class="muted" style="font-size:13px">아직 저장된 분석이 없어요. 폰에서 영상을 분석하면 자동으로 여기 저장돼요.</div>'; return; }
    box.innerHTML = '';
    snap.docs.forEach(doc => {
      const m = doc.data(); const dt = new Date(m.date);
      const b = document.createElement('button'); b.className = 'item';
      b.innerHTML = `<span><b>${esc(m.name || '이름 없음')}</b> <span class="muted">· ${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')} · ${m.duration ? m.duration.toFixed(1) + '초' : ''}</span><br><span class="muted" style="font-size:12px">${esc(m.punches || '')}${m.issues && m.issues.length ? ' · ' + esc(m.issues[0]) : ''}</span></span><span class="sc">${m.score}</span>`;
      b.onclick = () => loadSession(doc.id, m, b);
      box.appendChild(b);
    });
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  async function loadSession(sid, m, btn) {
    btn.disabled = true;
    try {
      const base = `data/users/${UID}/${sid}`;
      const frames = [];
      for (let c = 0; c < m.chunks; c++) {
        const s = await DB.doc(base).collection('chunks').doc('c' + c).get();
        if (!s.exists) throw new Error('데이터 조각이 없어요');
        const { img, world } = s.data();
        const cnt = img.length / 66;
        for (let i = 0; i < cnt; i++) {
          const im = [], wo = [];
          for (let j = 0; j < 33; j++) { im.push([img[i * 66 + j * 2], img[i * 66 + j * 2 + 1], 1]); wo.push([world[i * 99 + j * 3], world[i * 99 + j * 3 + 1], world[i * 99 + j * 3 + 2]]); }
          frames.push({ t: frames.length / m.fps, img: im, world: wo });
        }
      }
      const data = { fps: m.fps, frames, aspect: m.aspect, width: m.width, height: m.height, duration: m.duration };
      S.stance = m.stance;
      [...$('stanceSeg').children].forEach(x => x.classList.toggle('on', x.dataset.v === m.stance));
      S.hasVideo = false; S.sessionId = sid; S.fromSaved = true; S.chunksSaved = true; S.sessionDate = m.date;
      S.memberName = m.name || ''; nameEl.value = S.memberName;
      if (m.layers && m.layers.length) S.pendingLayers = m.layers;
      if (m.issuesFull) S.pendingIssues = m.issuesFull;
      if (m.th) S.sessionTh = m.th;
      N.finish(data);
    } catch (e) {
      console.error(e); btn.disabled = false;
      $('err').textContent = '⚠️ 불러오지 못했어요: ' + e.message; $('err').style.display = 'block';
    }
  }

  window.NNNSend = { onFinish, kakaoText, blenderScript, saveSession, refresh: renderSaved, saveFile, shareFile };
})();
