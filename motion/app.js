/* NNN 모션 코치 — UI */
(function () {
  'use strict';
  const C = window.Core;
  const $ = id => document.getElementById(id);
  const video = $('vid');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const TYPE_COLOR = { guard: '#ff5d5d', extend: '#ffb347', chin: '#ffcc33', rotate: '#c58cff', stance: '#4fc3ff', knee: '#4fc3ff' };
  const SEV_COLOR = { 1: '#4fc3ff', 2: '#ffb347', 3: '#ff5d5d' };

  const S = {
    stance: 'orthodox', data: null, an: null, layers: [], mode: 'overlay', t: 0, playing: false, rate: 1,
    loop: null, edit: false, layerId: 'manual', selJoint: null, graph: 'guard', hasVideo: false, dirty: true, cancel: false
  };

  // ---------- 보기 설정 (배경 영상·뼈대 굵기/진하기) ----------
  const VIEW_DEFAULT = { bg: 58, oW: 100, oA: 85, fW: 100, fA: 95, arrows: true, glow: true, ghost: 22, cap: true, capSize: 100 };
  const VIEW_PRESETS = {
    diff: { bg: 25, oW: 70, oA: 55, fW: 170, fA: 100, arrows: true, glow: true, ghost: 30 },
    video: { bg: 100, oW: 70, oA: 70, fW: 80, fA: 80, arrows: false, glow: false, ghost: 22 },
    clean: { bg: 0, oW: 120, oA: 90, fW: 140, fA: 100, arrows: true, glow: true, ghost: 30 }
  };
  let V = Object.assign({}, VIEW_DEFAULT);
  try { Object.assign(V, JSON.parse(localStorage.getItem('nnn_view') || '{}')); } catch (e) { }
  function saveView() { try { localStorage.setItem('nnn_view', JSON.stringify(V)); } catch (e) { } }

  // ---------- 시작 화면 ----------
  segment('stanceSeg', v => S.stance = v);
  segment('modeSeg', v => { S.mode = v; layout(); });
  function segment(id, cb) {
    $(id).addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      [...$(id).children].forEach(x => x.classList.toggle('on', x === b));
      cb(b.dataset.v);
    });
  }
  function showErr(msg) { const e = $('err'); e.textContent = msg; e.style.display = msg ? 'block' : 'none'; }
  function show(sec) { ['start', 'proc', 'studio'].forEach(s => $(s).classList.toggle('hide', s !== sec)); const sv = $('savedSec'); if (sv && sec !== 'start') sv.classList.add('hide'); }

  ['fCam', 'fLib'].forEach(id => $(id).addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (f) runCapture(f);
  }));
  $('demoBtn').onclick = () => {
    S.stance = 'orthodox';
    const d = C.makeDemo(); C.fillAndSmooth(d.frames);
    S.hasVideo = false;
    S.sessionId = null; S.fromSaved = false;
    finish(d);
  };
  $('cancelBtn').onclick = () => { S.cancel = true; };
  $('newBtn').onclick = () => { pause(); S.data = null; showErr(''); show('start'); window.scrollTo(0, 0); if (window.NNNSend) window.NNNSend.refresh(); };

  // ---------- 모션캡처 ----------
  let pose = null, poseCx = -1, lastRes = null;
  async function getPose(cx) {
    if (typeof Pose === 'undefined') throw new Error('모션캡처 모델 스크립트를 불러오지 못했어요. 페이지를 새로고침해 주세요.');
    if (pose && poseCx === cx) return pose;
    if (pose) { try { pose.close(); } catch (e) { } }
    pose = new Pose({ locateFile: f => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/' + f });
    pose.setOptions({ modelComplexity: cx, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults(r => { lastRes = r; });
    try { await pose.initialize(); } catch (e) { pose = null; throw new Error(location.hostname.includes('github.io') || location.hostname.includes('netlify') || location.hostname === 'localhost' ? 'AI 관절 인식 모델을 내려받지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.' : '이 화면(claude.ai)에서는 AI 모델을 불러올 수 없어요. 실제 영상 분석은 웹사이트 버전에서 해주세요: heodonggyu-ai.github.io/nnn-world/motion/'); }
    poseCx = cx;
    return pose;
  }
  const once = (el, ev, ms) => new Promise(res => {
    let done = false; const fn = () => { if (done) return; done = true; el.removeEventListener(ev, fn); res(); };
    el.addEventListener(ev, fn); if (ms) setTimeout(fn, ms);
  });
  async function seek(t) {
    const p = once(video, 'seeked', 2500);
    video.currentTime = t;
    await p;
    if (video.requestVideoFrameCallback) await new Promise(r => { let ok = false; video.requestVideoFrameCallback(() => { ok = true; r(); }); setTimeout(() => { if (!ok) r(); }, 120); });
  }

  async function runCapture(file) {
    showErr(''); S.cancel = false; show('proc');
    const [fpsS, cxS] = $('quality').value.split(',');
    const fps = +fpsS, cx = +cxS;
    const msg = $('procMsg'), bar = $('procBar');
    bar.style.width = '0%';
    try {
      msg.textContent = '영상 여는 중…';
      if (video.src) URL.revokeObjectURL(video.src);
      video.src = URL.createObjectURL(file);
      video.muted = true;
      await once(video, 'loadedmetadata', 8000);
      if (!video.videoWidth) { try { await video.play(); video.pause(); } catch (e) { } await once(video, 'loadeddata', 4000); }
      let dur = video.duration;
      if (!isFinite(dur)) { video.currentTime = 1e6; await once(video, 'seeked', 3000); dur = video.duration; video.currentTime = 0; }
      if (!video.videoWidth || !isFinite(dur) || dur <= 0) throw new Error('이 영상을 열 수 없어요. 다른 형식(MP4)으로 시도해 주세요.');
      const MAXD = 30;
      const useD = Math.min(dur, MAXD);
      msg.textContent = 'AI 관절 인식 모델 불러오는 중… (처음 한 번은 조금 걸려요)';
      const ps = await getPose(cx);
      const W = video.videoWidth, H = video.videoHeight, sc = Math.min(1, 640 / Math.max(W, H));
      const cv = document.createElement('canvas'); cv.width = Math.round(W * sc); cv.height = Math.round(H * sc);
      const cx2 = cv.getContext('2d');
      const prev = $('procPrev'); prev.width = cv.width; prev.height = cv.height;
      const pctx = prev.getContext('2d');
      const n = Math.max(2, Math.floor(useD * fps));
      const toFrame = (t, r) => {
        const fr = { t, img: null, world: null };
        if (r && r.poseLandmarks && r.poseWorldLandmarks) {
          fr.img = r.poseLandmarks.map(p => [p.x, p.y, p.visibility || 0]);
          fr.world = r.poseWorldLandmarks.map(p => [p.x, p.y, p.z]);
        }
        return fr;
      };
      const isBlank = () => {
        const d = cx2.getImageData(0, 0, cv.width, cv.height).data;
        let s = 0, c = 0;
        for (let i = 0; i < d.length; i += 4 * 97) { s += d[i] + d[i + 1] + d[i + 2]; c++; }
        return s / c < 6;
      };
      const showPrev = fr => { pctx.drawImage(cv, 0, 0); if (fr.img) drawSkel(pctx, fr.img, cv.width, cv.height, '#3dff8f', 2.5, 1); };
      const tail = dur > MAXD ? ` (앞 ${MAXD}초만 분석)` : '';
      // 아이폰 사파리: 한 번 재생해야 프레임이 그려짐
      try { await video.play(); } catch (e) { }
      video.pause();
      await seek(0.001);
      cx2.drawImage(video, 0, 0, cv.width, cv.height);
      let mode = (isBlank() || window.__forcePlay) ? 'play' : 'seek';
      let frames = [], found = 0;
      if (mode === 'seek') {
        for (let i = 0; i < n; i++) {
          if (S.cancel) { show('start'); return; }
          const t = Math.min(useD - 0.001, i / fps + 0.001);
          await seek(t);
          cx2.drawImage(video, 0, 0, cv.width, cv.height);
          lastRes = null;
          await ps.send({ image: cv });
          const fr = toFrame(i / fps, lastRes);
          if (fr.img) found++;
          frames.push(fr); showPrev(fr);
          bar.style.width = ((i + 1) / n * 100).toFixed(1) + '%';
          msg.textContent = `관절 추적 중 ${i + 1} / ${n} 프레임` + tail;
          if (i === Math.min(n - 1, 9) && found === 0 && isBlank()) { mode = 'play'; break; }
        }
        if (mode === 'seek' && found < n * 0.3) mode = 'play';
      }
      if (mode === 'play') {
        // 대체 방식(아이폰 등): 프레임마다 아주 잠깐 재생시켜 실제 화면을 받아서 읽음
        msg.textContent = '다른 방식으로 다시 읽는 중…';
        bar.style.width = '0%';
        frames = []; found = 0;
        const waitFrame = () => new Promise(r => {
          let ok = false; const go = () => { if (!ok) { ok = true; r(); } };
          if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(go);
          video.addEventListener('timeupdate', go, { once: true });
          setTimeout(go, 400);
        });
        for (let i = 0; i < n; i++) {
          if (S.cancel) { video.pause(); show('start'); return; }
          const t = Math.min(useD - 0.05, i / fps + 0.001);
          await seek(t);
          try { await video.play(); } catch (e) { }
          await waitFrame();
          video.pause();
          cx2.drawImage(video, 0, 0, cv.width, cv.height);
          lastRes = null;
          await ps.send({ image: cv });
          const fr = toFrame(i / fps, lastRes);
          if (fr.img) found++;
          frames.push(fr); showPrev(fr);
          bar.style.width = ((i + 1) / n * 100).toFixed(1) + '%';
          msg.textContent = `관절 추적 중 ${i + 1} / ${n} 프레임` + tail;
        }
      }
      if (found < n * 0.3) throw new Error(`사람을 충분히 찾지 못했어요 (${found}/${n} 프레임, 영상 ${useD.toFixed(1)}초). 전신이 다 나오게, 밝은 곳에서 다시 찍어 주세요.`);
      const data = { fps, frames, aspect: W / H, width: W, height: H, duration: n / fps, found };
      C.fillAndSmooth(data.frames);
      S.hasVideo = true;
      S.sessionId = null; S.fromSaved = false;
      finish(data);
    } catch (e) {
      console.error(e);
      show('start');
      showErr('⚠️ ' + (e && e.message ? e.message : '처리 중 오류가 났어요.'));
    }
  }

  // ---------- 분석 결과 ----------
  function finish(data) {
    S.data = data;
    S.an = C.analyze(data, { stance: S.stance, th: S.sessionTh || S.th });
    S.an.hiddenIssues = [];
    S.layers = C.buildLayers(data, S.an);
    if (S.pendingLayers) { S.layers = S.pendingLayers; S.pendingLayers = null; }
    if (S.pendingIssues) { // 저장된 분석: 관장님이 고친 항목 그대로 복원
      const ev = p => S.an.events.find(e => e.peak === p) || null;
      const rev = arr => arr.map(i => Object.assign({}, i, { ev: i.evPeak != null ? ev(i.evPeak) : null }));
      S.an.issues = rev(S.pendingIssues.issues || []);
      S.an.hiddenIssues = rev(S.pendingIssues.hidden || []);
      S.an.score = C.scoreOf(S.an.issues);
      S.pendingIssues = null;
    }
    S.sessionTh = null; S.editingIssue = null; S.addingIssue = false;
    clearUndo();
    S._corrCache = null; S.t = 0; S.loop = null; S.layerId = 'manual'; S.selJoint = null; S.dirty = true;
    $('loopOff').classList.add('hide');
    show('studio');
    renderSummary(); renderIssues(); fillLayerSel();
    layout();
    window.scrollTo(0, 0);
    if (window.NNNSend) window.NNNSend.onFinish();
  }

  function renderSummary() {
    const an = S.an, d = S.data;
    const sc = an.score;
    const col = sc >= 85 ? '#3dff8f' : sc >= 70 ? '#ffcc33' : sc >= 55 ? '#ffb347' : '#ff5d5d';
    $('scoreNum').textContent = sc;
    $('scoreRing').style.background = `conic-gradient(${col} ${sc * 3.6}deg, #2a2f38 0)`;
    $('sumTitle').textContent = sc >= 85 ? '아주 좋아요! 디테일만 다듬으면 됩니다' : sc >= 70 ? '좋아요. 몇 군데만 고치면 확 달라져요' : sc >= 55 ? '보완할 부분이 꽤 있어요' : '기본기부터 차근차근 잡아봐요';
    const fixable = an.issues.filter(i => i.layerId).length;
    $('sumSub').textContent = `${d.demo ? '데모 영상 · ' : ''}${d.duration.toFixed(1)}초 · ${d.frames.length}프레임 분석 · ${S.stance === 'southpaw' ? '사우스포' : '오소독스'} · 교정 키 레이어 ${fixable}개 생성`;
    const cnt = {};
    an.events.forEach(e => cnt[e.name] = (cnt[e.name] || 0) + 1);
    const chips = Object.entries(cnt).map(([k, v]) => `<span class="chip">${IC('bolt')}${k} ${v}회</span>`);
    chips.push(`<span class="chip">${IC('alert')}교정 포인트 ${an.issues.length}개</span>`);
    if (!an.events.length) chips.push('<span class="chip">펀치가 감지되지 않았어요 — 가드·자세만 분석</span>');
    $('sumChips').innerHTML = chips.join('');
  }

  const fmt = f => { const s = f / S.data.fps; const m = Math.floor(s / 60); return m + ':' + (s - m * 60).toFixed(1).padStart(4, '0'); };

  // ---------- 분석 기준 (관장님 기준) ----------
  S.th = Object.assign({}, C.DEFAULT_TH);
  try { Object.assign(S.th, JSON.parse(localStorage.getItem('nnn_th') || '{}')); } catch (e) { }
  const TH_UI = [
    ['guardTol', '가드 허용 높이', 0, 0.4, 0.02, v => `턱 아래 ${Math.round(v * 100)}%까지 OK`],
    ['guardSec', '가드 내려감 최소 시간', 0.1, 1, 0.05, v => `${v.toFixed(2)}초 이상`],
    ['extendDeg', '펀치 뻗음 기준', 130, 175, 1, v => `팔꿈치 ${v}° 이상`],
    ['chin', '턱 들림 민감도', 0.03, 0.25, 0.01, v => `평소보다 ${Math.round(v * 100)}% 이상`],
    ['rotateDeg', '뒷손 회전 기준', 5, 40, 1, v => `어깨 ${v}° 이상`],
    ['kneeDeg', '무릎 펴짐 기준', 160, 180, 1, v => v >= 180 ? '검사 안 함' : `${v}° 넘으면 지적`]
  ];
  function renderCriteria() {
    const box = $('thBox'); if (!box) return;
    box.innerHTML = TH_UI.map(([k, lab, mn, mx, st, f]) =>
      `<div class="vrow"><span>${lab}</span><input type="range" data-th="${k}" min="${mn}" max="${mx}" step="${st}" value="${S.th[k]}"><b data-thv="${k}">${f(S.th[k])}</b></div>`).join('');
    box.querySelectorAll('[data-th]').forEach(inp => inp.oninput = () => {
      const k = inp.dataset.th; S.th[k] = +inp.value;
      const row = TH_UI.find(r => r[0] === k); box.querySelector(`[data-thv="${k}"]`).textContent = row[5](S.th[k]);
      try { localStorage.setItem('nnn_th', JSON.stringify(S.th)); } catch (e) { }
    });
  }
  $('thReset').onclick = () => { S.th = Object.assign({}, C.DEFAULT_TH); try { localStorage.setItem('nnn_th', JSON.stringify(S.th)); } catch (e) { } renderCriteria(); };
  $('thApply').onclick = () => reanalyze();
  function reanalyze() {
    if (!S.data) return;
    const custom = S.an.issues.filter(i => i.custom);
    const keepLayers = S.layers.filter(l => l.manual || custom.some(i => i.layerId === l.id));
    S.an = C.analyze(S.data, { stance: S.stance, th: S.th });
    S.an.hiddenIssues = [];
    const auto = C.buildLayers(S.data, S.an).filter(l => !l.manual);
    S.an.issues.push(...custom); S.an.issues.sort((a, b) => a.f0 - b.f0);
    S.layers = [...auto, ...keepLayers];
    S.an.score = C.scoreOf(S.an.issues);
    clearUndo(); S._corrCache = null; S.dirty = true; S.unsaved = true; S.editTs = Date.now();
    renderSummary(); renderIssues(); fillLayerSel();
    flashMsg('새 기준으로 다시 분석했어요');
  }
  function flashMsg(t) { const el = $('issueMsg'); if (!el) return; el.textContent = t; el.style.display = 'block'; clearTimeout(flashMsg._t); flashMsg._t = setTimeout(() => el.style.display = 'none', 2500); }

  // 자막: 관장님이 켠 항목(또는 자막 문구를 쓴 항목)만 표시
  const capIssues = f => S.an.issues.filter(i => i.capOn && f >= i.f0 && f <= i.f1);
  const capText = i => (i.caption && i.caption.trim()) || i.title;

  // ---------- 고칠 점 수정 / 추가 / 숨기기 ----------
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SEV_NAME = { 1: '낮음', 2: '보통', 3: '높음' };
  const TEMPL = {
    guard: { t: h => `${h} 가드가 내려감`, c: '주먹은 턱 높이, 팔꿈치는 옆구리를 덮도록 모아 주세요. 치는 손만 나가고 지키는 손은 그대로!' },
    extend: { t: h => `${h} 펀치: 팔을 끝까지 안 뻗음`, c: '어깨를 같이 밀어 넣으면서 끝까지 뻗고, 맞는 순간에만 주먹을 짧게 쥐어 주세요.' },
    chin: { t: () => '펀치할 때 턱이 들림', c: '턱을 당기고 시선은 눈썹 아래로 상대를 보세요.' },
    custom: { t: () => '직접 고칠 점', c: '' }
  };
  function afterIssueChange() {
    S.an.issues.sort((a, b) => a.f0 - b.f0);
    S.an.score = C.scoreOf(S.an.issues);
    S._corrCache = null; S.dirty = true; S.unsaved = true; S.editTs = Date.now();
    renderSummary(); renderIssues(); fillLayerSel();
  }
  function regenLayer(is) {
    const n = S.data.frames.length, m = S.an.m;
    is.f0 = Math.max(0, Math.min(n - 1, is.f0)); is.f1 = Math.max(is.f0, Math.min(n - 1, is.f1));
    if (is.type === 'extend') { let b = is.f0; for (let f = is.f0; f <= is.f1; f++) if (m.ext[is.side][f] > m.ext[is.side][b]) b = f; is.peak = b; is.ev = null; }
    else if (is.type === 'chin') { let b = is.f0; for (let f = is.f0; f <= is.f1; f++) if (m.chinUp[f] > m.chinUp[b]) b = f; is.peak = b; is.amount = Math.max(0.06, m.chinUp[b] - m.chinBase); }
    else is.peak = Math.round((is.f0 + is.f1) / 2);
    const old = S.layers.find(l => l.id === is.layerId);
    const L = C.buildLayerFor(S.data, S.an, is);
    if (!L) return;
    L.label = is.title;
    if (old) { old.curves = L.curves; old.label = is.title; old.enabled = true; }
    else { const mi = S.layers.findIndex(l => l.manual); S.layers.splice(mi < 0 ? S.layers.length : mi, 0, L); }
  }
  function curF() { return Math.round(S.t * S.data.fps); }
  function issueForm(is, isNew) {
    const n = S.data.frames.length;
    const canRegen = ['guard', 'extend', 'chin', 'custom'].includes(is.type);
    const handSel = (is.type === 'guard' || is.type === 'extend') ?
      `<label>손 <select data-k="side"><option value="${S.an.lead}"${is.side === S.an.lead ? ' selected' : ''}>앞손</option><option value="${S.an.rear}"${is.side === S.an.rear ? ' selected' : ''}>뒷손</option></select></label>` : '';
    return `<div class="iform">
      ${isNew ? `<label>종류 <select data-k="type">
        <option value="guard"${is.type === 'guard' ? ' selected' : ''}>가드 내려감</option>
        <option value="extend"${is.type === 'extend' ? ' selected' : ''}>팔 덜 뻗음</option>
        <option value="chin"${is.type === 'chin' ? ' selected' : ''}>턱 들림</option>
        <option value="custom"${is.type === 'custom' ? ' selected' : ''}>기타 (키를 직접 작업)</option></select></label>` : ''}
      ${handSel}
      <label class="full">제목 <input type="text" data-k="title" value="${esc(is.title)}" maxlength="60"></label>
      <label class="full">코치 한마디 <textarea data-k="cue" rows="3" maxlength="300">${esc(is.cue)}</textarea></label>
      <label class="full">자막 문구 <input type="text" data-k="caption" value="${esc(is.caption || '')}" maxlength="60" placeholder="비워두면 제목이 자막으로 나와요"></label>
      <label class="full chk"><input type="checkbox" data-k="capOn"${is.capOn ? ' checked' : ''}> 이 구간 영상에 자막으로 표시</label>
      <label>중요도 <select data-k="sev">${[1, 2, 3].map(v => `<option value="${v}"${is.sev === v ? ' selected' : ''}>${SEV_NAME[v]}</option>`).join('')}</select></label>
      <div class="full range">구간
        <span><b data-show="f0">${fmt(is.f0)}</b> <button class="btn small" data-set="f0">${IC('stepback')}지금 위치를 시작으로</button></span>
        <span><b data-show="f1">${fmt(is.f1)}</b> <button class="btn small" data-set="f1">${IC('stepfwd')}지금 위치를 끝으로</button></span>
      </div>
      ${canRegen && !isNew ? `<label class="full chk"><input type="checkbox" data-k="regen"> 구간을 바꾸면 교정 키를 새 구간에 맞춰 다시 만들기 <small class="muted">(직접 손본 키는 사라져요)</small></label>` : ''}
      <div class="full btns" style="margin-top:4px">
        <button class="btn small primary" data-act="save">${IC('check')}${isNew ? '추가' : '저장'}</button>
        <button class="btn small" data-act="cancel">취소</button>
        ${isNew ? '' : `<button class="btn small danger" data-act="hide">${IC('trash')}이건 문제 아님 (숨기기)</button>`}
      </div>
    </div>`;
  }
  function wireForm(wrap, is, isNew) {
    const draft = { f0: is.f0, f1: is.f1 };
    const get = k => wrap.querySelector(`[data-k="${k}"]`);
    wrap.querySelectorAll('[data-set]').forEach(b => b.onclick = () => {
      const k = b.dataset.set; draft[k] = curF();
      if (draft.f0 > draft.f1) { const t = draft.f0; draft.f0 = draft.f1; draft.f1 = t; }
      wrap.querySelector('[data-show="f0"]').textContent = fmt(draft.f0);
      wrap.querySelector('[data-show="f1"]').textContent = fmt(draft.f1);
      if (get('regen')) get('regen').checked = true;
    });
    if (isNew && get('type')) {
      const upd = () => {
        const tp = get('type').value, sideSel = get('side');
        const hand = sideSel && sideSel.value === S.an.rear ? '뒷손' : '앞손';
        get('title').value = TEMPL[tp].t(hand); get('cue').value = TEMPL[tp].c;
      };
      get('type').onchange = () => { is.type = get('type').value; is.side = is.side || S.an.lead; S.addDraft = Object.assign({}, is, draft, { title: '', cue: '' }); renderIssues(); };
      if (get('side')) get('side').onchange = upd;
    }
    if (get('caption')) get('caption').addEventListener('input', () => { if (get('caption').value.trim()) get('capOn').checked = true; });
    wrap.querySelector('[data-act="cancel"]').onclick = () => { S.editingIssue = null; S.addingIssue = false; renderIssues(); };
    const hideBtn = wrap.querySelector('[data-act="hide"]');
    if (hideBtn) hideBtn.onclick = () => {
      S.an.issues = S.an.issues.filter(i => i !== is); S.an.hiddenIssues.push(is);
      const L = S.layers.find(l => l.id === is.layerId); if (L) L.enabled = false;
      S.editingIssue = null; afterIssueChange(); flashMsg('숨겼어요 (아래 숨긴 항목에서 되살리기)');
    };
    wrap.querySelector('[data-act="save"]').onclick = () => {
      const title = get('title').value.trim() || TEMPL[is.type] && TEMPL[is.type].t('') || is.title;
      const rangeChanged = draft.f0 !== is.f0 || draft.f1 !== is.f1;
      const newSide = get('side') ? get('side').value : is.side;
      const sideChanged = newSide !== is.side;
      Object.assign(is, { title, cue: get('cue').value.trim(), sev: +get('sev').value, f0: draft.f0, f1: draft.f1, side: newSide,
        caption: get('caption').value.trim(), capOn: get('capOn').checked });
      if (isNew) {
        is.id = 'u' + Date.now(); is.custom = true;
        is.detail = '관장님이 직접 추가';
        S.an.issues.push(is);
        pushUndo(); regenLayer(is);
        S.addingIssue = false; S.addDraft = null;
        afterIssueChange();
        const L = S.layers.find(l => l.id === is.layerId);
        if (L) { setEdit(true); S.layerId = L.id; $('layerSel').value = L.id; loopIssue(is, true); renderJointList(); }
        flashMsg(is.type === 'custom' ? '추가했어요. 관절을 끌어서 교정 키를 만드세요' : '추가했어요. 교정 키를 자동으로 만들었어요');
        return;
      }
      if (is.detail && !/수정함/.test(is.detail)) is.detail += ' · 관장님 수정함';
      const L = S.layers.find(l => l.id === is.layerId);
      if (L) L.label = title;
      if ((rangeChanged || sideChanged) && get('regen') && get('regen').checked) { pushUndo(); regenLayer(is); }
      S.editingIssue = null; afterIssueChange(); flashMsg('저장했어요');
    };
  }
  $('addIssueBtn').onclick = () => {
    if (!S.data) return;
    const n = S.data.frames.length, f = curF(), w = Math.round(S.data.fps * 0.3);
    const [a, b] = S.loop ? S.loop : [Math.max(0, f - w), Math.min(n - 1, f + w)];
    S.addDraft = { type: 'guard', side: S.an.lead, f0: a, f1: b, sev: 2, title: TEMPL.guard.t('앞손'), cue: TEMPL.guard.c };
    S.addingIssue = true; S.editingIssue = null; renderIssues();
    $('issues').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function renderIssues() {
    const an = S.an, box = $('issues');
    renderCriteria();
    box.innerHTML = '';
    if (S.addingIssue && S.addDraft) {
      const d = S.addDraft;
      if (!d.title) { d.title = TEMPL[d.type].t(d.side === an.rear ? '뒷손' : '앞손'); d.cue = TEMPL[d.type].c; }
      const el = document.createElement('div'); el.className = 'issue editing';
      el.innerHTML = `<div class="sev" style="background:var(--accent)"></div><div><h4>${IC('pencil')} 고칠 점 직접 추가</h4>${issueForm(d, true)}</div>`;
      box.appendChild(el); wireForm(el, d, true);
    }
    if (!an.issues.length && !S.addingIssue) box.innerHTML += '<div class="good">' + IC('thumb') + ' 큰 문제가 발견되지 않았어요. 가드·뻗음·회수 모두 안정적입니다.</div>';
    an.issues.forEach(is => {
      const el = document.createElement('div');
      el.className = 'issue' + (S.editingIssue === is ? ' editing' : '');
      const layer = S.layers.find(l => l.id === is.layerId);
      const whole = is.f0 === 0 && is.f1 === S.data.frames.length - 1;
      if (S.editingIssue === is) {
        el.innerHTML = `<div class="sev" style="background:${SEV_COLOR[is.sev]}"></div><div><h4>${IC('pencil')} 고칠 점 수정</h4>${issueForm(is, false)}</div>`;
        box.appendChild(el); wireForm(el, is, false); return;
      }
      el.innerHTML = `<div class="sev" style="background:${SEV_COLOR[is.sev]}"></div>
        <div><h4>${esc(is.title)}${layer ? '' : '<span class="badge">코칭 코멘트</span>'}${is.custom ? '<span class="badge">직접 추가</span>' : ''}</h4>
        <div class="meta">${whole ? '영상 전체' : fmt(is.f0) + ' – ' + fmt(is.f1)} · ${esc(is.detail || '')} · 중요도 ${SEV_NAME[is.sev]}</div>
        ${is.cue ? `<div class="cue">${esc(is.cue)}</div>` : ''}
        <div class="row"></div></div>`;
      const row = el.querySelector('.row');
      if (!whole) {
        const b = document.createElement('button'); b.className = 'btn small'; b.innerHTML = IC('play') + '보기'; b.title = '이 구간 느리게 반복';
        b.onclick = () => loopIssue(is); row.appendChild(b);
      }
      if (layer) {
        const t = document.createElement('button'); t.className = 'btn small' + (layer.enabled ? ' on' : '');
        const lab = () => t.innerHTML = layer.enabled ? IC('checkbox') + '교정 켬' : IC('square') + '교정 끔';
        lab();
        t.onclick = () => { pushUndo(); layer.enabled = !layer.enabled; S._corrCache = null; S.unsaved = true; S.editTs = Date.now(); t.classList.toggle('on', layer.enabled); lab(); S.dirty = true; };
        row.appendChild(t);
        const k = document.createElement('button'); k.className = 'btn small'; k.innerHTML = IC('keys') + '키 편집';
        k.onclick = () => { setEdit(true); S.layerId = layer.id; $('layerSel').value = layer.id; loopIssue(is, true); renderJointList(); };
        row.appendChild(k);
      }
      const cb = document.createElement('button'); cb.className = 'btn small' + (is.capOn ? ' on' : '');
      cb.innerHTML = IC('chat') + (is.capOn ? '자막 켬' : '자막'); cb.title = '이 구간 영상에 자막 표시';
      cb.onclick = () => { is.capOn = !is.capOn; S.unsaved = true; S.editTs = Date.now(); S.dirty = true; renderIssues(); };
      row.appendChild(cb);
      const e = document.createElement('button'); e.className = 'btn small'; e.innerHTML = IC('pencil') + '수정';
      e.onclick = () => { S.editingIssue = is; S.addingIssue = false; renderIssues(); };
      row.appendChild(e);
      box.appendChild(el);
    });
    // 숨긴 항목
    const hid = an.hiddenIssues || [];
    const hb = $('hiddenIssues');
    if (hb) {
      hb.innerHTML = hid.length ? `<details><summary>숨긴 항목 ${hid.length}개 (문제 아님으로 표시)</summary>${hid.map((i, k) => `<div class="hrow"><span>${esc(i.title)} <small class="muted">${fmt(i.f0)}–${fmt(i.f1)}</small></span><button class="btn small" data-unhide="${k}">${IC('undo')}되살리기</button></div>`).join('')}</details>` : '';
      hb.querySelectorAll('[data-unhide]').forEach(b => b.onclick = () => {
        const is = hid.splice(+b.dataset.unhide, 1)[0]; S.an.issues.push(is);
        const L = S.layers.find(l => l.id === is.layerId); if (L) L.enabled = true;
        afterIssueChange();
      });
    }
    // 잘 된 동작
    const bad = new Set();
    an.issues.forEach(i => { if (i.ev) bad.add(i.ev); });
    an.events.forEach(ev => { if (an.issues.some(i => i.type === 'guard' && i.ctx === 'other' && i.f0 <= ev.end && i.f1 >= ev.start)) bad.add(ev); });
    const goods = an.events.filter(e => !bad.has(e));
    $('goods').innerHTML = goods.length ? `<div class="good">${IC('thumb')} <b>잘 된 동작</b> — ${goods.map(e => `${e.name} (${fmt(e.peak)})`).join(', ')} : 끝까지 뻗고 반대손 가드도 유지됐어요.</div>` : '';
  }
  function serializeIssues() {
    const ser = arr => (arr || []).map(i => { const o = Object.assign({}, i); o.evPeak = i.ev ? i.ev.peak : null; delete o.ev; return o; });
    return { issues: ser(S.an.issues), hidden: ser(S.an.hiddenIssues) };
  }

  function loopIssue(is, noPlay) {
    const pad = Math.round(S.data.fps * 0.4), n = S.data.frames.length;
    S.loop = [Math.max(0, is.f0 - pad), Math.min(n - 1, is.f1 + pad)];
    $('loopOff').classList.remove('hide');
    seekTo(noPlay ? is.peak / S.data.fps : S.loop[0] / S.data.fps);
    if (!noPlay) { S.rate = 0.5; $('rate').value = '0.5'; play(); }
    $('stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  $('loopOff').onclick = () => { S.loop = null; $('loopOff').classList.add('hide'); };

  // ---------- 레이아웃 ----------
  const cv1 = $('cv1'), cv2 = $('cv2'), tl = $('tl'), gr = $('graph');
  let panelW = 0, panelH = 0;
  function layout() {
    if (!S.data) return;
    const stage = $('stage');
    const W = stage.clientWidth, side = S.mode === 'side';
    const asp = S.data.aspect;
    const maxH = S.edit ? Math.max(200, window.innerHeight * 0.42) : Math.max(260, Math.min(window.innerHeight * 0.66, window.innerHeight - 230)); // 영상+타임라인+버튼이 한 화면에
    let w = side ? (W - 6) / 2 : W, h = w / asp;
    if (h > maxH) { h = maxH; w = h * asp; }
    panelW = Math.floor(w); panelH = Math.floor(h);
    [cv1, cv2].forEach(c => { c.width = panelW * dpr; c.height = panelH * dpr; c.style.width = panelW + 'px'; c.style.height = panelH + 'px'; });
    $('wrap2').style.display = side ? '' : 'none';
    $('tag1').textContent = { overlay: '원본 + 교정', side: '원본', orig: '원본', fix: '교정' }[S.mode];
    $('tag1').style.color = S.mode === 'fix' ? 'var(--fix)' : '';
    [tl, gr].forEach(c => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; });
    S.dirty = true;
  }
  window.addEventListener('resize', layout);

  // ---------- 재생 ----------
  const dur = () => S.data.frames.length / S.data.fps;
  function play() {
    if (!S.data) return;
    S.playing = true; $('playBtn').innerHTML = IC('pause');
    if (S.hasVideo) { video.playbackRate = S.rate; video.currentTime = S.t; video.play().catch(() => { }); }
    lastTs = 0;
  }
  function pause() {
    S.playing = false; $('playBtn').innerHTML = IC('play');
    if (S.hasVideo) video.pause();
  }
  function seekTo(t) {
    S.t = Math.max(0, Math.min(dur() - 1 / S.data.fps, t));
    if (S.hasVideo && !S.playing) video.currentTime = S.t;
    if (S.hasVideo && S.playing) video.currentTime = S.t;
  }
  function stepFrame(k) { pause(); const f = Math.round(S.t * S.data.fps) + k; seekTo(f / S.data.fps); }
  $('playBtn').onclick = () => S.playing ? pause() : play();
  $('prevF').onclick = () => stepFrame(-1);
  $('nextF').onclick = () => stepFrame(1);
  $('rate').onchange = e => { S.rate = +e.target.value; if (S.hasVideo) video.playbackRate = S.rate; };
  document.addEventListener('keydown', e => {
    if (!S.data || $('studio').classList.contains('hide') || /input|select|textarea/i.test(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); S.playing ? pause() : play(); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); stepFrame(-1); }
    if (e.code === 'ArrowRight') { e.preventDefault(); stepFrame(1); }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') { e.preventDefault(); redo(); }
  });

  let lastTs = 0;
  function tick(ts) {
    requestAnimationFrame(tick);
    if (!S.data || $('studio').classList.contains('hide')) return;
    if (S.playing) {
      const end = dur();
      const lo = S.loop ? S.loop[0] / S.data.fps : 0, hi = S.loop ? (S.loop[1] + 1) / S.data.fps : end;
      if (S.hasVideo) {
        S.t = video.currentTime;
        if (S.t >= hi - 0.02 || video.ended) { video.currentTime = lo; S.t = lo; if (video.paused) video.play().catch(() => { }); }
      } else {
        const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
        S.t += dt * S.rate;
        if (S.t >= hi) S.t = lo;
      }
      lastTs = ts;
      S.dirty = true;
    }
    draw();
  }
  requestAnimationFrame(tick);

  // ---------- 그리기 ----------
  function lerpPose(A, B, a) { return A.map((p, j) => [p[0] + (B[j][0] - p[0]) * a, p[1] + (B[j][1] - p[1]) * a, p[2]]); }
  function corrAt(f) { return C.correctedPose(S.data, S.layers, f); }
  function posesAt(t) {
    const n = S.data.frames.length;
    let fi = Math.max(0, Math.min(n - 1, t * S.data.fps));
    if (S.edit && !S.playing) fi = Math.round(fi);
    const i0 = Math.floor(fi), i1 = Math.min(n - 1, i0 + 1), a = fi - i0;
    const F = S.data.frames;
    return { f: Math.round(fi), orig: lerpPose(F[i0].img, F[i1].img, a), corr: lerpPose(corrAt(i0), corrAt(i1), a) };
  }

  function drawSkel(ctx, P, w, h, color, lw, alpha, opts) {
    opts = opts || {};
    const X = p => p[0] * w, Y = p => p[1] * h;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (opts.glow) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
    ctx.beginPath();
    C.CONNECTIONS.forEach(([a, b]) => { ctx.moveTo(X(P[a]), Y(P[a])); ctx.lineTo(X(P[b]), Y(P[b])); });
    // 목
    const shM = [(P[11][0] + P[12][0]) / 2, (P[11][1] + P[12][1]) / 2];
    const earM = [(P[7][0] + P[8][0]) / 2, (P[7][1] + P[8][1]) / 2];
    const hc = [(P[0][0] + earM[0]) / 2, (P[0][1] + earM[1]) / 2];
    ctx.moveTo(shM[0] * w, shM[1] * h); ctx.lineTo(hc[0] * w, hc[1] * h + 4);
    ctx.stroke();
    const r = Math.max(7, Math.hypot((P[7][0] - P[8][0]) * w, (P[7][1] - P[8][1]) * h) * 0.62, Math.hypot((P[0][0] - earM[0]) * w, (P[0][1] - earM[1]) * h) * 1.15);
    ctx.beginPath(); ctx.arc(hc[0] * w, hc[1] * h, r, 0, Math.PI * 2); ctx.stroke();
    // 코(시선 방향)
    ctx.beginPath(); ctx.arc(X(P[0]), Y(P[0]), lw * 0.9, 0, Math.PI * 2); ctx.fill();
    [11, 12, 13, 14, 23, 24, 25, 26, 27, 28].forEach(j => { ctx.beginPath(); ctx.arc(X(P[j]), Y(P[j]), lw * 1.1, 0, Math.PI * 2); ctx.fill(); });
    // 주먹
    ctx.shadowBlur = 0;
    [15, 16].forEach(j => { ctx.beginPath(); ctx.arc(X(P[j]), Y(P[j]), lw * 2.6, 0, Math.PI * 2); ctx.fill(); });
    if (opts.sel != null && P[opts.sel]) {
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, Math.min(2, lw * 0.6));
      ctx.beginPath(); ctx.arc(X(P[opts.sel]), Y(P[opts.sel]), Math.max(5, lw * 3.8), 0, Math.PI * 2); ctx.stroke();
    }
    if (opts.handles) {
      ctx.globalAlpha = 0.9; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
      const hr = Math.max(3, lw * 2.3); // 뼈대 굵기에 맞춰 관절 동그라미 크기 조절
      ctx.lineWidth = Math.max(0.8, Math.min(1.5, lw * 0.4));
      C.MAIN_JOINTS.forEach(j => { ctx.beginPath(); ctx.arc(X(P[j]), Y(P[j]), hr, 0, Math.PI * 2); ctx.stroke(); });
    }
    ctx.restore();
  }

  function drawArrows(ctx, A, B, w, h, minLen) {
    ctx.save();
    C.MAIN_JOINTS.forEach(j => {
      const x0 = A[j][0] * w, y0 = A[j][1] * h, x1 = B[j][0] * w, y1 = B[j][1] * h;
      const L = Math.hypot(x1 - x0, y1 - y0);
      if (L < (minLen || Math.max(8, h * 0.02))) return;
      ctx.strokeStyle = '#ffffff'; ctx.fillStyle = '#ffffff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.9;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.setLineDash([]);
      const ang = Math.atan2(y1 - y0, x1 - x0), s = 9;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - s * Math.cos(ang - 0.45), y1 - s * Math.sin(ang - 0.45));
      ctx.lineTo(x1 - s * Math.cos(ang + 0.45), y1 - s * Math.sin(ang + 0.45));
      ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  function drawBg(ctx, w, h, withVideo) {
    if (withVideo && S.hasVideo && video.readyState >= 2 && V.bg > 0) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.fillStyle = `rgba(5,7,10,${(1 - V.bg / 100).toFixed(2)})`; ctx.fillRect(0, 0, w, h);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#12161c'); g.addColorStop(1, '#07080a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      const st = w / 10;
      for (let x = st; x < w; x += st) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = st; y < h; y += st) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
  }

  // 한 화면(패널) 그리기 — 화면 표시와 영상 저장이 같이 씀
  function paintPanel(ctx, w, h, kind, orig, corr, lw, editOpts) {
    const oLw = lw * V.oW / 100, fLw = lw * V.fW / 100, oA = V.oA / 100, fA = V.fA / 100, gA = V.ghost / 100;
    const fOpts = Object.assign({ glow: V.glow }, editOpts || {});
    if (kind === 'raw') { // 원본 영상 그대로
      if (S.hasVideo && video.readyState >= 2) ctx.drawImage(video, 0, 0, w, h); else drawBg(ctx, w, h, false);
      return;
    }
    if (kind === 'green') { // 교정 뼈대만
      drawBg(ctx, w, h, false);
      drawSkel(ctx, corr, w, h, '#3dff8f', fLw, Math.max(fA, 0.3), fOpts);
      return;
    }
    if (kind === 'overlay') {
      drawBg(ctx, w, h, true);
      if (oA > 0) drawSkel(ctx, orig, w, h, '#ff5d5d', oLw, oA);
      if (fA > 0) drawSkel(ctx, corr, w, h, '#3dff8f', fLw, fA, fOpts);
      if (V.arrows) drawArrows(ctx, orig, corr, w, h);
    } else if (kind === 'orig') {
      drawBg(ctx, w, h, true);
      drawSkel(ctx, orig, w, h, '#ff5d5d', oLw, Math.max(oA, 0.3));
    } else {
      drawBg(ctx, w, h, false);
      if (gA > 0) drawSkel(ctx, orig, w, h, '#ff5d5d', oLw * 0.7, gA);
      drawSkel(ctx, corr, w, h, '#3dff8f', fLw, Math.max(fA, 0.3), fOpts);
      if (V.arrows) drawArrows(ctx, orig, corr, w, h);
    }
  }

  // ---------- 교정 영상 저장 (화면 녹화) ----------
  function pickMime() {
    if (!window.MediaRecorder) return null;
    for (const m of ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'])
      if (MediaRecorder.isTypeSupported(m)) return m;
    return '';
  }
  function capPill(ctx, x, y, text, bg, fg, size) {
    ctx.font = `700 ${size}px "Noto Sans KR", sans-serif`;
    const tw = ctx.measureText(text).width, ph = size * 1.7, pw = tw + size * 1.3;
    ctx.fillStyle = bg; ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - pw / 2, y, pw, ph, ph / 2); else ctx.rect(x - pw / 2, y, pw, ph);
    ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + ph / 2 + 1);
  }
  let recording = false;
  async function recordVideo() {
    if (!S.data || recording) return;
    const mime = pickMime();
    const msgEl = $('recMsg'), btn = $('recBtn');
    if (mime === null) { msgEl.textContent = '이 브라우저는 영상 저장을 지원하지 않아요. 최신 사파리·크롬에서 해주세요.'; return; }
    pause(); setEdit(false);
    const n = S.data.frames.length, fps = S.data.fps, rate = +$('recRate').value;
    const [fa, fb] = ($('recRange').value === 'loop' && S.loop) ? S.loop : [0, n - 1];
    const t0 = fa / fps, t1 = (fb + 1) / fps;
    const story = $('recStyle').value === 'story';
    // 4단계 편집: 원본 → 빨강(내 동작) → 초록(교정) → 원본+빨강+초록
    const SEGS = story ? [
      { kind: 'raw', title: '① 원본 영상', sub: '찍은 영상 그대로', col: '#ffffff', fg: '#111' },
      { kind: 'orig', title: '② 내 동작', sub: '빨간 뼈대 = 지금 내 자세', col: '#ff5d5d', fg: '#2a0606' },
      { kind: 'green', title: '③ 교정 동작', sub: '초록 뼈대 = 이렇게 고쳐요', col: '#3dff8f', fg: '#06200f' },
      { kind: 'overlay', title: '④ 비교', sub: '원본 + 내 동작 + 교정', col: '#ffcc33', fg: '#2a2106' }
    ].filter(sg => sg.kind !== 'raw' || S.hasVideo) : [{ kind: S.mode }];
    const side = !story && S.mode === 'side';
    const asp = S.data.aspect;
    let ph = asp < 1 ? 1280 : Math.round(1280 / asp), pw = Math.round(ph * asp);
    if (side && pw * 2 > 1920) { const k = 1920 / (pw * 2); pw = Math.round(pw * k); ph = Math.round(ph * k); }
    pw -= pw % 2; ph -= ph % 2;
    const gap = side ? 12 : 0;
    const cv = document.createElement('canvas'); cv.width = side ? pw * 2 + gap : pw; cv.height = ph;
    const ctx = cv.getContext('2d');
    const lw = Math.max(3, Math.max(pw, ph) / 200);
    const U = Math.max(ph, pw); // 글자 크기 기준
    const name = ($('memberName') && $('memberName').value.trim()) || '';
    const W = cv.width;
    const frameAt = (t, sg) => {
      const { f, orig, corr } = posesAt(t);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (side) {
        paintPanel(ctx, pw, ph, 'orig', orig, corr, lw, {});
        ctx.save(); ctx.translate(pw + gap, 0); paintPanel(ctx, pw, ph, 'fix', orig, corr, lw, {}); ctx.restore();
        capPill(ctx, pw / 2, U * 0.025, '지금 내 동작', '#ff5d5d', '#2a0606', U * 0.026);
        capPill(ctx, pw + gap + pw / 2, U * 0.025, '이렇게 고쳐요', '#3dff8f', '#06200f', U * 0.026);
      } else paintPanel(ctx, pw, ph, sg.kind, orig, corr, lw, {});
      ctx.font = `700 ${Math.round(U * 0.022)}px Oswald, "Noto Sans KR", sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      if (!side) ctx.fillText('NNN BOXING' + (name ? '  ·  ' + name : ''), U * 0.025, U * 0.025);
      if (story) capPill(ctx, W / 2, U * 0.06, sg.title, sg.col, sg.fg, U * 0.024);
      const cur = sg.kind === 'raw' ? [] : capIssues(f);
      if (cur.length && V.cap !== false) { const cs = U * 0.024 * (V.capSize || 100) / 100; capPill(ctx, side ? pw + gap + pw / 2 : W / 2, ph - cs * 1.7 - U * 0.04, capText(cur[0]), 'rgba(10,12,15,0.85)', '#ffd4d4', cs); }
      if (rate < 1) { ctx.font = `700 ${Math.round(U * 0.02)}px Oswald, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillStyle = '#ffcc33'; ctx.fillText('SLOW ' + rate + 'x', W - U * 0.025, side ? U * 0.075 : U * 0.03); }
    };
    // 단계 사이 제목 화면
    const titleCard = sg => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const g = ctx.createLinearGradient(0, 0, 0, ph); g.addColorStop(0, '#12161c'); g.addColorStop(1, '#050608');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, ph);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = sg.col; ctx.font = `900 ${Math.round(U * 0.06)}px "Noto Sans KR", sans-serif`;
      ctx.fillText(sg.title, W / 2, ph * 0.46);
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `500 ${Math.round(U * 0.028)}px "Noto Sans KR", sans-serif`;
      ctx.fillText(sg.sub, W / 2, ph * 0.46 + U * 0.07);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `700 ${Math.round(U * 0.02)}px Oswald, sans-serif`;
      ctx.fillText('NNN BOXING' + (name ? '  ·  ' + name : ''), W / 2, ph * 0.9);
    };
    const holdTitle = (sg, ms) => new Promise(res => {
      const st = performance.now();
      const step = () => { titleCard(sg); if (performance.now() - st >= ms) res(); else requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    const segDur = (t1 - t0) / rate, titleMs = story ? 1100 : 0;
    const total = SEGS.length * (segDur + titleMs / 1000);
    let done = 0;
    recording = true; btn.disabled = true; $('recOut').classList.add('hide');
    try {
      await document.fonts.load('700 30px "Noto Sans KR"').catch(() => { });
      await document.fonts.load('900 30px "Noto Sans KR"').catch(() => { });
      if (story) titleCard(SEGS[0]); else frameAt(t0, SEGS[0]);
      const stream = cv.captureStream(30);
      const rec = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: 8000000 }, mime ? { mimeType: mime } : {}));
      const chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise(r => rec.onstop = r);
      rec.start(250);
      for (let k = 0; k < SEGS.length; k++) {
        const sg = SEGS[k];
        if (S.hasVideo) { video.loop = false; video.pause(); video.playbackRate = rate; }
        const seekP = S.hasVideo ? (() => { const p = once(video, 'seeked', 2000); video.currentTime = t0; return p; })() : Promise.resolve();
        if (story) { msgEl.textContent = `● 녹화 중… ${sg.title}`; await holdTitle(sg, titleMs); }
        await seekP;
        done += titleMs / 1000;
        const start = performance.now();
        if (S.hasVideo) { try { await video.play(); } catch (e) { } }
        await new Promise(res => {
          let fin = false; const end = () => { if (!fin) { fin = true; res(); } };
          const step = () => {
            if (fin) return;
            const t = S.hasVideo ? video.currentTime : t0 + (performance.now() - start) / 1000 * rate;
            if (t >= t1 - 0.01 || (S.hasVideo && video.ended)) { frameAt(Math.min(t, t1 - 0.001), sg); end(); return; }
            frameAt(t, sg);
            const pct = Math.round((done + (t - t0) / rate) / total * 100);
            msgEl.textContent = `● 녹화 중… ${story ? sg.title + ' · ' : ''}${Math.min(99, pct)}% (끝날 때까지 이 화면을 켜 두세요)`;
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          setTimeout(end, (segDur + 10) * 1000);
        });
        done += segDur;
        if (S.hasVideo) video.pause();
      }
      if (S.hasVideo) video.playbackRate = S.rate;
      await new Promise(r => setTimeout(r, 300));
      rec.stop(); await stopped;
      stream.getTracks().forEach(tr => tr.stop());
      const type = (mime || chunks[0] && chunks[0].type || 'video/webm').split(';')[0];
      const blob = new Blob(chunks, { type });
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      S._rec = { blob, filename: `NNN_교정영상_${name || '회원'}.${ext}` };
      const vEl = $('recVideo'); if (vEl.src) URL.revokeObjectURL(vEl.src);
      vEl.src = URL.createObjectURL(blob);
      $('recOut').classList.remove('hide');
      msgEl.innerHTML = `${IC('check')} 완성! ${(blob.size / 1048576).toFixed(1)}MB · ${ext.toUpperCase()} · 아래에서 저장하거나 카톡으로 보내세요`;
      $('recOut').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      console.error(e); msgEl.textContent = '녹화하지 못했어요: ' + (e.message || e);
    } finally { recording = false; btn.disabled = false; if (S.hasVideo) video.playbackRate = S.rate; seekTo(t0); S.dirty = true; }
  }
  $('recBtn').onclick = recordVideo;
  $('recSave').onclick = e => { if (S._rec && window.NNNSend) window.NNNSend.saveFile(S._rec.filename, S._rec.blob, e.currentTarget, $('recMsg')); };
  $('recShare').onclick = async () => {
    if (!S._rec) return;
    const ok = window.NNNSend && await window.NNNSend.shareFile(S._rec.filename, S._rec.blob, 'NNN BOXING 교정 영상');
    if (!ok) $('recMsg').textContent = '이 기기에서는 공유창을 열 수 없어요. 다운로드 버튼을 눌러 주세요.';
  };

  let lastDrawT = -1, lastGraphT = -1;
  function draw() {
    if (!panelW) return;
    if (!S.dirty && lastDrawT === S.t && !(S.hasVideo && S.playing)) return;
    lastDrawT = S.t;
    const { f, orig, corr } = posesAt(S.t);
    S.curF = f;
    const w = panelW, h = panelH, lw = Math.max(2.2, h / 190);
    const c1 = cv1.getContext('2d'); c1.setTransform(dpr, 0, 0, dpr, 0, 0);
    const editOpts = S.edit ? { handles: true, sel: S.selJoint } : {};
    if (S.mode === 'side') {
      paintPanel(c1, w, h, 'orig', orig, corr, lw, {});
      const c2 = cv2.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintPanel(c2, w, h, 'fix', orig, corr, lw, editOpts);
    } else paintPanel(c1, w, h, S.mode, orig, corr, lw, editOpts);
    // 현재 구간 이슈 표시
    const cur = capIssues(f);
    const now = $('now1');
    if (cur.length && V.cap !== false) {
      now.style.display = 'block'; now.textContent = cur.map(capText).join(' · ');
      now.style.fontSize = (12.5 * (V.capSize || 100) / 100).toFixed(1) + 'px';
    }
    else now.style.display = 'none';
    // 지금 프레임에 키가 있으면 표시
    const isKey = S.layers.some(L => (L.enabled || L.id === S.layerId) && Object.values(L.curves).some(c => c.some(k => k.f === f)));
    $('timeLbl').innerHTML = `${fmt(f)}<small>${f + 1}/${S.data.frames.length}${isKey ? ' <span style="color:#3dff8f">◆</span>' : ''}</small>`;
    const baseTag = { overlay: '원본 + 교정', side: '원본', orig: '원본', fix: '교정' }[S.mode];
    $('tag1').textContent = isKey && S.mode !== 'side' ? baseTag + ' · ◆ 키' : baseTag;
    drawTimeline(f);
    if (S.dirty || Math.abs(lastGraphT - S.t) > 0.03) { drawGraph(f); lastGraphT = S.t; }
    S.dirty = false;
  }

  // ---------- 타임라인 ----------
  // 키 편집 중 구간반복이 켜져 있으면 그 구간을 확대해서 보여줌
  function tlRange() {
    const n = S.data.frames.length;
    if (S.edit && S.loop) return [S.loop[0], S.loop[1]];
    return [0, n - 1];
  }
  function drawTimeline(f) {
    const ctx = tl.getContext('2d'), w = tl.clientWidth, h = tl.clientHeight, n = S.data.frames.length;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const [za, zb] = tlRange(), X = fr => 8 + (w - 16) * (fr - za) / Math.max(1, zb - za);
    if (S.loop) { ctx.fillStyle = 'rgba(61,255,143,0.08)'; ctx.fillRect(X(S.loop[0]), 0, X(S.loop[1]) - X(S.loop[0]), h); }
    // 이슈 밴드
    const rows = {};
    S.an.issues.forEach(is => {
      if (is.f0 === 0 && is.f1 === n - 1) return;
      const r = { guard: 0, extend: 1, chin: 1, rotate: 1 }[is.type] || 0;
      ctx.fillStyle = TYPE_COLOR[is.type]; ctx.globalAlpha = 0.75;
      const y = 8 + r * 9;
      ctx.fillRect(X(is.f0), y, Math.max(3, X(is.f1) - X(is.f0)), 6);
    });
    ctx.globalAlpha = 1;
    // 펀치
    ctx.font = '600 10.5px Noto Sans KR'; ctx.textAlign = 'center';
    S.an.events.forEach(ev => {
      ctx.fillStyle = ev.side === 'L' ? '#4fc3ff' : '#ffb347';
      ctx.beginPath(); ctx.arc(X(ev.peak), 34, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(ev.name.replace('스트레이트', '스트'), X(ev.peak), 30);
    });
    // 키프레임
    // 모든 레이어의 키는 항상 보여주고, 편집 중인 레이어(·관절) 키는 더 크고 밝게
    const allKeys = new Set(), selKeys = new Set();
    S.layers.forEach(L => {
      if (!L.enabled && L.id !== S.layerId) return;
      for (const j in L.curves) L.curves[j].forEach(k => {
        allKeys.add(k.f);
        if (S.edit && L.id === S.layerId && (S.selJoint == null || +j === S.selJoint)) selKeys.add(k.f);
      });
    });
    if (S.edit) { // 프레임 눈금
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      const stepF = Math.max(1, Math.ceil(n / 120));
      for (let k = 0; k < n; k += stepF) ctx.fillRect(X(k) - 0.5, h - 10, 1, k % (stepF * 5) ? 4 : 8);
    }
    const ky = S.edit ? h - 30 : 52;
    const dia = (x, y, ks) => { ctx.beginPath(); ctx.moveTo(x, y - ks); ctx.lineTo(x + ks * 0.8, y); ctx.lineTo(x, y + ks); ctx.lineTo(x - ks * 0.8, y); ctx.closePath(); ctx.fill(); };
    allKeys.forEach(kf => {
      if (selKeys.has(kf)) return;
      ctx.fillStyle = kf === f ? '#ffffff' : (S.edit ? 'rgba(61,255,143,0.45)' : '#2fbf6c');
      dia(X(kf), ky, S.edit ? 6 : 6);
    });
    selKeys.forEach(kf => { ctx.fillStyle = kf === f ? '#ffffff' : '#3dff8f'; dia(X(kf), ky, 9); });
    // 플레이헤드
    ctx.fillStyle = '#fff'; ctx.fillRect(X(f) - 1, 2, 2, h - 4);
  }
  (function () {
    let drag = false;
    const go = e => {
      const r = tl.getBoundingClientRect(), n = S.data.frames.length;
      const [za, zb] = tlRange();
      let fr = Math.round(za + (e.clientX - r.left - 8) / (r.width - 16) * (zb - za));
      if (S.edit) { // 키프레임 근처면 자석처럼 붙기
        const px = f => 8 + (r.width - 16) * (f - za) / Math.max(1, zb - za);
        let best = null, bd = 14;
        layerKeyFrames().forEach(k => { const d = Math.abs(px(k) - (e.clientX - r.left)); if (d < bd) { bd = d; best = k; } });
        if (best != null) fr = best;
      }
      seekTo(Math.max(0, Math.min(n - 1, fr)) / S.data.fps); S.dirty = true;
    };
    tl.addEventListener('pointerdown', e => { if (!S.data) return; drag = true; pause(); tl.setPointerCapture(e.pointerId); go(e); });
    tl.addEventListener('pointermove', e => { if (drag) go(e); });
    tl.addEventListener('pointerup', () => drag = false);
  })();

  // ---------- 그래프 ----------
  $('graphSel').onchange = e => { S.graph = e.target.value; S.dirty = true; };
  function drawGraph(f) {
    const ctx = gr.getContext('2d'), w = gr.clientWidth, h = gr.clientHeight, n = S.data.frames.length, an = S.an, F = S.data.frames;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const pad = { l: 38, r: 8, t: 10, b: 18 };
    const X = i => pad.l + (w - pad.l - pad.r) * i / (n - 1);
    let series = [], lo = Infinity, hi = -Infinity, guides = [], legend = '';
    if (S.graph === 'guard') {
      const T = an.m.T, A = an.m.aspect;
      if (!S._corrCache) S._corrCache = F.map((_, i) => corrAt(i));
      const cc = S._corrCache;
      for (const s of ['L', 'R']) {
        const wj = C.SIDES[s].wr, col = s === 'L' ? '#4fc3ff' : '#ffb347';
        series.push({ col, dash: [4, 4], w: 1.4, v: F.map((fr, i) => -(fr.img[wj][1] - an.m.chinY[i]) / T) });
        series.push({ col, dash: [], w: 2.2, v: cc.map((p, i) => -(p[wj][1] - an.m.chinY[i]) / T) });
      }
      guides = [{ v: 0, t: '턱' }, { v: -0.12, t: '허용' }];
      legend = '<span style="--c:#4fc3ff">왼손</span><span style="--c:#ffb347">오른손</span><span style="--c:#888">점선 = 원본 · 실선 = 교정 · 위로 갈수록 손이 높음</span>';
    } else if (S.graph === 'elbow') {
      for (const s of ['L', 'R']) series.push({ col: s === 'L' ? '#4fc3ff' : '#ffb347', dash: [], w: 2, v: an.m.elbow[s] });
      guides = [{ v: 160, t: '160°' }, { v: 90, t: '90°' }];
      legend = '<span style="--c:#4fc3ff">왼팔 팔꿈치</span><span style="--c:#ffb347">오른팔 팔꿈치</span><span style="--c:#888">180° = 완전히 뻗음 (3D 기준)</span>';
    } else {
      const j = S.selJoint != null ? S.selJoint : (lastIssueJoint() || 16);
      const L = S.layers.filter(l => l.enabled);
      const dx = [], dy = [];
      for (let i = 0; i < n; i++) { const D = C.layerDeltas(L, i); dx.push((D[j] || [0, 0])[0] * 100); dy.push(-(D[j] || [0, 0])[1] * 100); }
      series.push({ col: '#ff7ad9', dash: [], w: 2, v: dx }, { col: '#3dff8f', dash: [], w: 2, v: dy });
      guides = [{ v: 0, t: '0' }];
      const lay = S.layers.find(l => l.id === S.layerId);
      S._curveKeys = lay && lay.curves[j] ? lay.curves[j] : [];
      legend = `<span style="--c:#ff7ad9">${C.JOINT_NAMES[j]} 좌우 이동</span><span style="--c:#3dff8f">${C.JOINT_NAMES[j]} 위아래 이동</span><span style="--c:#888">◆ = 키프레임 (화면 % 단위)</span>`;
      S._curveJ = j;
    }
    series.forEach(s => s.v.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    guides.forEach(g => { lo = Math.min(lo, g.v); hi = Math.max(hi, g.v); });
    if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const m = (hi - lo) * 0.08; lo -= m; hi += m;
    const Y = v => pad.t + (h - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
    // 이슈 음영
    an.issues.forEach(is => { if (is.f0 === 0 && is.f1 === n - 1) return; ctx.fillStyle = 'rgba(255,93,93,0.07)'; ctx.fillRect(X(is.f0), pad.t, X(is.f1) - X(is.f0), h - pad.t - pad.b); });
    ctx.font = '10px Noto Sans KR'; ctx.textAlign = 'right'; ctx.fillStyle = '#8b93a1';
    guides.forEach(g => {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, Y(g.v)); ctx.lineTo(w - pad.r, Y(g.v)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillText(g.t, pad.l - 4, Y(g.v) + 3);
    });
    series.forEach(s => {
      ctx.strokeStyle = s.col; ctx.lineWidth = s.w; ctx.setLineDash(s.dash); ctx.beginPath();
      s.v.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); ctx.stroke();
    });
    ctx.setLineDash([]);
    if (S.graph === 'curve' && S._curveKeys) {
      const j = S._curveJ;
      S._curveKeys.forEach(k => {
        const D = C.layerDeltas(S.layers.filter(l => l.enabled), k.f), v = -(D[j] || [0, 0])[1] * 100;
        ctx.fillStyle = '#fff'; const x = X(k.f), y = Y(v);
        ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 5, y); ctx.closePath(); ctx.fill();
      });
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(X(f) - 0.75, pad.t, 1.5, h - pad.t - pad.b);
    $('graphLegend').innerHTML = legend;
  }
  function lastIssueJoint() {
    const is = S.an.issues.find(i => i.layerId && S.curF >= i.f0 && S.curF <= i.f1) || S.an.issues.find(i => i.layerId);
    if (!is) return null;
    if (is.type === 'chin') return 0;
    return C.SIDES[is.side].wr;
  }

  // ---------- 되돌리기 / 다시하기 ----------
  const undoStack = [], redoStack = [];
  const snap = () => JSON.stringify(S.layers.map(l => ({ id: l.id, enabled: l.enabled, curves: l.curves })));
  function restore(str) {
    const arr = JSON.parse(str);
    arr.forEach(a => { const l = S.layers.find(x => x.id === a.id); if (l) { l.enabled = a.enabled; l.curves = a.curves; } });
    S._corrCache = null; S.unsaved = true; S.editTs = Date.now(); S.dirty = true;
    renderIssues(); updateUndoUI(); renderJointList();
  }
  function pushUndo() {
    if (!S.layers || !S.layers.length) return;
    undoStack.push(snap()); if (undoStack.length > 60) undoStack.shift();
    redoStack.length = 0; updateUndoUI();
  }
  function undo() { if (!undoStack.length) return; redoStack.push(snap()); restore(undoStack.pop()); flash('↶ 되돌렸어요'); }
  function redo() { if (!redoStack.length) return; undoStack.push(snap()); restore(redoStack.pop()); flash('↷ 다시 했어요'); }
  function updateUndoUI() {
    const u = $('undoBtn'), r = $('redoBtn');
    if (u) { u.disabled = !undoStack.length; u.innerHTML = IC('undo') + (undoStack.length ? `<span class="cnt">${undoStack.length}</span>` : ''); u.title = '되돌리기'; }
    if (r) r.disabled = !redoStack.length;
  }
  function clearUndo() { undoStack.length = 0; redoStack.length = 0; updateUndoUI(); }
  let flashTimer = null;
  function flash(msg) {
    const el = $('jointLbl'); if (!el) return;
    const old = el.dataset.base || el.textContent; el.dataset.base = old;
    el.textContent = msg; clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { el.textContent = el.dataset.base; }, 1200);
  }

  // ---------- 키 편집 ----------
  function setEdit(on) {
    S.edit = on; $('editBtn').classList.toggle('on', on); $('editBar').classList.toggle('show', on);
    document.body.classList.toggle('editing', on);
    if (on) { autoPickLayer(); renderJointList(); setJointLabel(); } else { S.jointLock = null; }
    layout();
    if (on) setTimeout(() => $('stage').scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    if (on) { pause(); if (S.mode === 'orig') { S.mode = 'overlay'; [...$('modeSeg').children].forEach(b => b.classList.toggle('on', b.dataset.v === 'overlay')); layout(); } }
    S.dirty = true;
  }
  $('editBtn').onclick = () => setEdit(!S.edit);
  $('editDone').onclick = () => setEdit(false);
  $('undoBtn').onclick = undo;
  $('redoBtn').onclick = redo;
  function fillLayerSel() {
    const sel = $('layerSel');
    sel.innerHTML = S.layers.map(l => `<option value="${l.id}">${l.manual ? '[직접] ' : ''}${l.label}</option>`).join('');
    sel.value = S.layerId;
  }
  $('layerSel').onchange = e => { S.layerId = e.target.value; S.dirty = true; renderJointList(); };

  function editCanvas() { return S.mode === 'side' ? cv2 : cv1; }
  let dragJ = null, dragStart = null;
  [cv1, cv2].forEach(cv => {
    cv.addEventListener('pointerdown', e => {
      if (!S.data) return;
      if (!S.edit) { S.playing ? pause() : play(); return; }
      if (cv !== editCanvas()) return;
      const f = Math.round(S.t * S.data.fps); seekTo(f / S.data.fps);
      const P = corrAt(f), r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = null;
      if (S.jointLock != null) best = S.jointLock; // 목록에서 고른 관절: 화면 아무 데나 끌어도 그 관절이 움직임
      else {
        let bd = 34;
        C.MAIN_JOINTS.forEach(j => { const d = Math.hypot(P[j][0] * panelW - mx, P[j][1] * panelH - my); if (d < bd) { bd = d; best = j; } });
      }
      if (best == null) return;
      S._pendingSnap = snap();
      S.selJoint = best; dragJ = best;
      dragStart = { mx, my, x: P[best][0], y: P[best][1] };
      setJointLabel();
      renderJointList();
      cv.setPointerCapture(e.pointerId);
      S.dirty = true;
    });
    cv.addEventListener('pointermove', e => {
      if (dragJ == null || cv !== editCanvas()) return;
      const r = cv.getBoundingClientRect();
      // 손가락 위치만큼 상대 이동 (관절이 손가락에 가려도 정확하게)
      const x = dragStart.x + (e.clientX - r.left - dragStart.mx) / panelW;
      const y = dragStart.y + (e.clientY - r.top - dragStart.my) / panelH;
      if (S._pendingSnap) { undoStack.push(S._pendingSnap); if (undoStack.length > 60) undoStack.shift(); redoStack.length = 0; S._pendingSnap = null; updateUndoUI(); }
      setJoint(dragJ, Math.round(S.t * S.data.fps), x, y);
    });
    const up = () => { if (dragJ != null) { dragJ = null; S._corrCache = null; S.dirty = true; renderJointList(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  });

  // ---------- 관절 목록 ----------
  const JOINT_GROUPS = [
    ['머리', [0]], ['어깨', [11, 12]], ['팔꿈치', [13, 14]], ['주먹', [15, 16]],
    ['골반', [23, 24]], ['무릎', [25, 26]], ['발목', [27, 28]]
  ];
  function setJointLabel() {
    const el = $('jointLbl'); if (!el) return;
    const t = S.selJoint == null ? '목록에서 고르거나 초록 관절을 끌어서 수정'
      : C.JOINT_NAMES[S.selJoint] + (S.jointLock != null ? ' 선택됨 · 화면 아무 곳이나 끌거나 ↑↓←→' : ' (드래그해서 위치 수정)');
    el.textContent = t; el.dataset.base = t;
  }
  function renderJointList() {
    const box = $('jointList'); if (!box || !S.data) return;
    const L = S.layers.find(l => l.id === S.layerId);
    const hasKey = j => L && L.curves[j] && L.curves[j].length;
    let h = `<button class="jchip${S.jointLock == null ? ' on' : ''}" data-j="">전체</button>`;
    JOINT_GROUPS.forEach(([g, js]) => {
      h += `<span class="jgrp">`;
      js.forEach(j => {
        const nm = js.length === 1 ? g : (j % 2 ? '왼' : '오른') + g;
        h += `<button class="jchip${S.jointLock === j ? ' on' : ''}" data-j="${j}">${nm}${hasKey(j) ? ' <i>◆</i>' : ''}</button>`;
      });
      h += `</span>`;
    });
    box.innerHTML = h;
  }
  $('jointList').addEventListener('click', e => {
    const b = e.target.closest('.jchip'); if (!b) return;
    const j = b.dataset.j === '' ? null : +b.dataset.j;
    S.jointLock = j; S.selJoint = j;
    pause(); seekTo(Math.round(S.t * S.data.fps) / S.data.fps);
    setJointLabel(); renderJointList(); S.dirty = true;
  });
  // 미세 조정 (한 번 누를 때마다 화면의 0.6%)
  function nudge(dx, dy) {
    if (S.selJoint == null) { flash('먼저 관절을 고르세요'); return; }
    const f = Math.round(S.t * S.data.fps), P = corrAt(f), j = S.selJoint;
    pause(); pushUndo();
    setJoint(j, f, P[j][0] + dx / (S.data.aspect || 1) * 0.006, P[j][1] + dy * 0.006);
    renderJointList();
  }
  document.querySelectorAll('[data-nudge]').forEach(b => b.onclick = () => {
    const [dx, dy] = b.dataset.nudge.split(',').map(Number); nudge(dx, dy);
  });
  function setJoint(j, f, x, y) {
    const L = S.layers.find(l => l.id === S.layerId); if (!L) return;
    L.enabled = true;
    const others = C.layerDeltas(S.layers, f, L.id)[j] || [0, 0];
    const o = S.data.frames[f].img[j];
    const n = S.data.frames.length, br = Math.round(S.data.fps * 0.5);
    if (!L.curves[j] || !L.curves[j].length) {
      if (f - br >= 0) C.addKey(L, j, f - br, 0, 0);
      if (f + br < n) C.addKey(L, j, f + br, 0, 0);
    }
    C.addKey(L, j, f, x - o[0] - others[0], y - o[1] - others[1]);
    S._corrCache = null; S.dirty = true; S.unsaved = true; S.editTs = Date.now();
  }
  function layerKeyFrames() {
    const L = S.layers.find(l => l.id === S.layerId);
    const s = new Set();
    if (L) for (const j in L.curves) { if (S.selJoint != null && +j !== S.selJoint) continue; L.curves[j].forEach(k => s.add(k.f)); }
    if (!s.size) S.layers.forEach(l => { if (l.enabled) for (const j in l.curves) l.curves[j].forEach(k => s.add(k.f)); }); // 비어 있으면 전체 키
    return [...s].sort((a, b) => a - b);
  }
  // 키 편집을 켤 때, 지금 위치에서 키가 있는 레이어를 자동으로 고름
  function autoPickLayer() {
    const cur = S.layers.find(l => l.id === S.layerId);
    if (cur && Object.keys(cur.curves).length) return;
    const f = Math.round(S.t * S.data.fps);
    const withKeys = S.layers.filter(l => l.enabled && Object.keys(l.curves).length);
    if (!withKeys.length) return;
    const span = l => { let a = 1e9, b = -1; for (const j in l.curves) l.curves[j].forEach(k => { a = Math.min(a, k.f); b = Math.max(b, k.f); }); return [a, b]; };
    const hit = withKeys.find(l => { const [a, b] = span(l); return f >= a && f <= b; }) || withKeys[0];
    S.layerId = hit.id; $('layerSel').value = hit.id;
  }
  $('prevKey').onclick = () => { const f = Math.round(S.t * S.data.fps); const k = layerKeyFrames().filter(x => x < f).pop(); if (k != null) { pause(); seekTo(k / S.data.fps); S.dirty = true; } };
  $('nextKey').onclick = () => { const f = Math.round(S.t * S.data.fps); const k = layerKeyFrames().find(x => x > f); if (k != null) { pause(); seekTo(k / S.data.fps); S.dirty = true; } };
  $('delKey').onclick = () => {
    const before = snap();
    setTimeout(() => { if (snap() !== before) { undoStack.push(before); redoStack.length = 0; updateUndoUI(); renderJointList(); flash('🗑 키 삭제 (↶로 되돌리기)'); } }, 0);
    const L = S.layers.find(l => l.id === S.layerId); if (!L) return;
    const f = Math.round(S.t * S.data.fps);
    for (const j in L.curves) { if (S.selJoint != null && +j !== S.selJoint) continue; L.curves[j] = L.curves[j].filter(k => k.f !== f); }
    S._corrCache = null; S.dirty = true; S.unsaved = true; S.editTs = Date.now();
  };

  // ---------- 내보내기 ----------
  const r4 = v => Math.round(v * 10000) / 10000;
  function exportJson() {
    const d = S.data, n = d.frames.length;
    return JSON.stringify({
      app: 'NNN Motion Coach', fps: d.fps, frames: n, width: d.width, height: d.height, stance: S.stance,
      coords: '정규화 영상 좌표 (x: 0=왼쪽~1=오른쪽, y: 0=위~1=아래), MediaPipe Pose 33 관절 순서',
      original: d.frames.map(fr => fr.img.map(p => [r4(p[0]), r4(p[1])])),
      corrected: d.frames.map((_, i) => corrAt(i).map(p => [r4(p[0]), r4(p[1])])),
      world3d: d.frames.map(fr => fr.world.map(p => [r4(p[0]), r4(p[1]), r4(p[2])])),
      punches: S.an.events.map(e => ({ name: e.name, side: e.side, start: e.start, peak: e.peak, end: e.end, elbowDeg: Math.round(e.elbowAt) })),
      issues: S.an.issues.map(i => ({ title: i.title, from: i.f0, to: i.f1, detail: i.detail })),
      keyLayers: S.layers.filter(l => Object.keys(l.curves).length).map(l => ({
        name: l.label, enabled: l.enabled,
        keys: Object.fromEntries(Object.entries(l.curves).map(([j, c]) => [C.JOINT_NAMES[j], c.map(k => ({ frame: k.f, dx: r4(k.dx), dy: r4(k.dy) }))]))
      }))
    });
  }
  function exportCsv() {
    const d = S.data, rows = ['frame,time,joint,orig_x,orig_y,fix_x,fix_y'];
    d.frames.forEach((fr, i) => {
      const c = corrAt(i);
      C.MAIN_JOINTS.forEach(j => rows.push([i, (i / d.fps).toFixed(3), C.JOINT_NAMES[j], r4(fr.img[j][0]), r4(fr.img[j][1]), r4(c[j][0]), r4(c[j][1])].join(',')));
    });
    return rows.join('\n');
  }
  async function copyOut(txt, btn) {
    const ta = $('outTxt'); ta.value = txt; ta.style.display = 'block';
    const old = btn.innerHTML;
    try { await navigator.clipboard.writeText(txt); btn.innerHTML = IC('check') + '복사됨'; }
    catch (e) { ta.focus(); ta.select(); btn.textContent = '아래 칸을 길게 눌러 복사'; }
    setTimeout(() => btn.innerHTML = old, 1800);
  }
  $('cpJson').onclick = e => copyOut(exportJson(), e.currentTarget);
  $('cpCsv').onclick = e => copyOut(exportCsv(), e.currentTarget);

  // ---------- 보기 설정 UI ----------
  const VIEW_INPUTS = { vBg: 'bg', vOW: 'oW', vOA: 'oA', vFW: 'fW', vFA: 'fA', vGhost: 'ghost', vCapSize: 'capSize' };
  function syncViewUI() {
    for (const id in VIEW_INPUTS) { const el = $(id); if (!el) continue; el.value = V[VIEW_INPUTS[id]]; const lab = $(id + 'V'); if (lab) lab.textContent = id === 'vOW' || id === 'vFW' || id === 'vCapSize' ? (V[VIEW_INPUTS[id]] / 100).toFixed(1) + '배' : V[VIEW_INPUTS[id]] + '%'; }
    $('vArrow').checked = V.arrows; $('vGlow').checked = V.glow;
    $('bgBtn').innerHTML = V.bg > 0 ? IC('video') : IC('videooff');
    $('bgBtn').title = V.bg > 0 ? '배경 영상 끄기' : '배경 영상 켜기';
    $('bgBtn').classList.toggle('on', V.bg > 0);
    $('vCap').checked = V.cap !== false;
  }
  for (const id in VIEW_INPUTS) {
    const el = $(id); if (!el) continue;
    el.addEventListener('input', () => { V[VIEW_INPUTS[id]] = +el.value; if (id === 'vBg' && V.bg > 0) V.lastBg = V.bg; syncViewUI(); saveView(); S.dirty = true; });
  }
  $('vArrow').onchange = e => { V.arrows = e.target.checked; saveView(); S.dirty = true; };
  $('vGlow').onchange = e => { V.glow = e.target.checked; saveView(); S.dirty = true; };
  $('vCap').onchange = e => { V.cap = e.target.checked; saveView(); S.dirty = true; };
  // 보기 설정 시트
  $('optBtn').onclick = () => $('viewSheet').classList.remove('hide');
  document.querySelectorAll('#viewSheet [data-close]').forEach(el => el.onclick = () => $('viewSheet').classList.add('hide'));
  $('thBtn').onclick = () => { const p = $('thPanel'); p.classList.toggle('hide'); $('thBtn').classList.toggle('on', !p.classList.contains('hide')); };
  $('bgBtn').onclick = () => { if (V.bg > 0) { V.lastBg = V.bg; V.bg = 0; } else V.bg = V.lastBg || VIEW_DEFAULT.bg; syncViewUI(); saveView(); S.dirty = true; };
  document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
    const p = b.dataset.preset === 'reset' ? VIEW_DEFAULT : VIEW_PRESETS[b.dataset.preset];
    Object.assign(V, p); syncViewUI(); saveView(); S.dirty = true;
  });
  syncViewUI();

  window.NNN = { serializeIssues, S, C, video, corrAt, drawSkel, drawArrows, drawBg, finish, fmt, pause, layout, show, once, markDirty: () => { S._corrCache = null; S.dirty = true; } };

  // 재생/정지 중 영상 시점 맞추기
  video.addEventListener('seeked', () => { S.dirty = true; });
})();
