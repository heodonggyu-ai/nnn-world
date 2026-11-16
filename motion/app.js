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
    try { await pose.initialize(); } catch (e) { pose = null; throw new Error('AI 관절 인식 모델을 내려받지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'); }
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
      const frames = [];
      let found = 0;
      for (let i = 0; i < n; i++) {
        if (S.cancel) { show('start'); return; }
        const t = Math.min(useD - 0.001, i / fps + 0.001);
        await seek(t);
        cx2.drawImage(video, 0, 0, cv.width, cv.height);
        lastRes = null;
        await ps.send({ image: cv });
        const r = lastRes;
        const fr = { t: i / fps, img: null, world: null };
        if (r && r.poseLandmarks && r.poseWorldLandmarks) {
          fr.img = r.poseLandmarks.map(p => [p.x, p.y, p.visibility || 0]);
          fr.world = r.poseWorldLandmarks.map(p => [p.x, p.y, p.z]);
          found++;
        }
        frames.push(fr);
        pctx.drawImage(cv, 0, 0);
        if (fr.img) drawSkel(pctx, fr.img, cv.width, cv.height, '#3dff8f', 2.5, 1);
        bar.style.width = ((i + 1) / n * 100).toFixed(1) + '%';
        msg.textContent = `관절 추적 중 ${i + 1} / ${n} 프레임` + (dur > MAXD ? ` (앞 ${MAXD}초만 분석)` : '');
      }
      if (found < n * 0.3) throw new Error(`사람을 충분히 찾지 못했어요 (${found}/${n} 프레임). 전신이 다 나오게, 밝은 곳에서 다시 찍어 주세요.`);
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
    S.an = C.analyze(data, { stance: S.stance });
    S.layers = C.buildLayers(data, S.an);
    if (S.pendingLayers) { S.layers = S.pendingLayers; S.pendingLayers = null; }
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
    const chips = Object.entries(cnt).map(([k, v]) => `<span class="chip">🥊 ${k} ${v}회</span>`);
    chips.push(`<span class="chip">⚠️ 교정 포인트 ${an.issues.length}개</span>`);
    if (!an.events.length) chips.push('<span class="chip">펀치가 감지되지 않았어요 — 가드·자세만 분석</span>');
    $('sumChips').innerHTML = chips.join('');
  }

  const fmt = f => { const s = f / S.data.fps; const m = Math.floor(s / 60); return m + ':' + (s - m * 60).toFixed(1).padStart(4, '0'); };

  function renderIssues() {
    const an = S.an, box = $('issues');
    box.innerHTML = '';
    if (!an.issues.length) box.innerHTML = '<div class="good">👏 큰 문제가 발견되지 않았어요. 가드·뻗음·회수 모두 안정적입니다.</div>';
    an.issues.forEach(is => {
      const el = document.createElement('div');
      el.className = 'issue';
      const layer = S.layers.find(l => l.id === is.layerId);
      const whole = is.f0 === 0 && is.f1 === S.data.frames.length - 1;
      el.innerHTML = `<div class="sev" style="background:${SEV_COLOR[is.sev]}"></div>
        <div><h4>${is.title}${layer ? '' : '<span class="badge">코칭 코멘트</span>'}</h4>
        <div class="meta">${whole ? '영상 전체' : fmt(is.f0) + ' – ' + fmt(is.f1)} · ${is.detail}</div>
        <div class="cue">${is.cue}</div>
        <div class="row"></div></div>`;
      const row = el.querySelector('.row');
      if (!whole) {
        const b = document.createElement('button'); b.className = 'btn small'; b.textContent = '▶ 이 구간 느리게 보기';
        b.onclick = () => loopIssue(is); row.appendChild(b);
      }
      if (layer) {
        const t = document.createElement('button'); t.className = 'btn small' + (layer.enabled ? ' on' : '');
        const lab = () => t.textContent = layer.enabled ? '✅ 교정 적용 중' : '⬜ 교정 끔';
        lab();
        t.onclick = () => { layer.enabled = !layer.enabled; S._corrCache = null; S.unsaved = true; S.editTs = Date.now(); t.classList.toggle('on', layer.enabled); lab(); S.dirty = true; };
        row.appendChild(t);
        const k = document.createElement('button'); k.className = 'btn small'; k.textContent = '✏️ 이 키 편집';
        k.onclick = () => { setEdit(true); S.layerId = layer.id; $('layerSel').value = layer.id; loopIssue(is, true); };
        row.appendChild(k);
      }
      box.appendChild(el);
    });
    // 잘 된 동작
    const bad = new Set();
    an.issues.forEach(i => { if (i.ev) bad.add(i.ev); });
    an.events.forEach(ev => { if (an.issues.some(i => i.type === 'guard' && i.ctx === 'other' && i.f0 <= ev.end && i.f1 >= ev.start)) bad.add(ev); });
    const goods = an.events.filter(e => !bad.has(e));
    $('goods').innerHTML = goods.length ? `<div class="good">👍 <b>잘 된 동작</b> — ${goods.map(e => `${e.name} (${fmt(e.peak)})`).join(', ')} : 끝까지 뻗고 반대손 가드도 유지됐어요.</div>` : '';
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
    const maxH = Math.max(260, window.innerHeight * 0.62);
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
    S.playing = true; $('playBtn').textContent = '❚❚';
    if (S.hasVideo) { video.playbackRate = S.rate; video.currentTime = S.t; video.play().catch(() => { }); }
    lastTs = 0;
  }
  function pause() {
    S.playing = false; $('playBtn').textContent = '▶';
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
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(P[opts.sel]), Y(P[opts.sel]), 13, 0, Math.PI * 2); ctx.stroke();
    }
    if (opts.handles) {
      ctx.globalAlpha = 0.9; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
      C.MAIN_JOINTS.forEach(j => { ctx.beginPath(); ctx.arc(X(P[j]), Y(P[j]), 8, 0, Math.PI * 2); ctx.stroke(); });
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
    if (withVideo && S.hasVideo && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, w, h);
      ctx.fillStyle = 'rgba(5,7,10,0.42)'; ctx.fillRect(0, 0, w, h);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#12161c'); g.addColorStop(1, '#07080a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      const st = w / 10;
      for (let x = st; x < w; x += st) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = st; y < h; y += st) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
  }

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
    if (S.mode === 'overlay') {
      drawBg(c1, w, h, true);
      drawSkel(c1, orig, w, h, '#ff5d5d', lw, 0.85);
      drawSkel(c1, corr, w, h, '#3dff8f', lw, 0.95, Object.assign({ glow: true }, editOpts));
      drawArrows(c1, orig, corr, w, h);
    } else if (S.mode === 'orig') {
      drawBg(c1, w, h, true);
      drawSkel(c1, orig, w, h, '#ff5d5d', lw, 0.95);
    } else if (S.mode === 'fix') {
      drawBg(c1, w, h, false);
      drawSkel(c1, orig, w, h, '#ff5d5d', lw * 0.7, 0.22);
      drawSkel(c1, corr, w, h, '#3dff8f', lw, 1, Object.assign({ glow: true }, editOpts));
    } else {
      drawBg(c1, w, h, true);
      drawSkel(c1, orig, w, h, '#ff5d5d', lw, 0.95);
      const c2 = cv2.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBg(c2, w, h, false);
      drawSkel(c2, orig, w, h, '#ff5d5d', lw * 0.7, 0.2);
      drawSkel(c2, corr, w, h, '#3dff8f', lw, 1, Object.assign({ glow: true }, editOpts));
    }
    // 현재 구간 이슈 표시
    const cur = S.an.issues.filter(i => i.layerId && f >= i.f0 && f <= i.f1 && S.layers.find(l => l.id === i.layerId).enabled);
    const now = $('now1');
    if (cur.length && S.mode !== 'orig') { now.style.display = 'block'; now.textContent = '⚠ ' + cur.map(i => i.title).join(' · '); }
    else now.style.display = 'none';
    $('timeLbl').textContent = `${fmt(f)} · ${f + 1}/${S.data.frames.length}`;
    drawTimeline(f);
    if (S.dirty || Math.abs(lastGraphT - S.t) > 0.03) { drawGraph(f); lastGraphT = S.t; }
    S.dirty = false;
  }

  // ---------- 타임라인 ----------
  function drawTimeline(f) {
    const ctx = tl.getContext('2d'), w = tl.clientWidth, h = tl.clientHeight, n = S.data.frames.length;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const X = fr => 8 + (w - 16) * fr / (n - 1);
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
    const showLayers = S.edit ? S.layers.filter(l => l.id === S.layerId) : S.layers.filter(l => l.enabled);
    const keys = new Set();
    showLayers.forEach(L => { for (const j in L.curves) { if (S.edit && S.selJoint != null && +j !== S.selJoint) continue; L.curves[j].forEach(k => keys.add(k.f)); } });
    keys.forEach(kf => {
      const x = X(kf), y = 52;
      ctx.fillStyle = kf === f ? '#ffffff' : (S.edit ? '#3dff8f' : '#2fbf6c');
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 5, y); ctx.closePath(); ctx.fill();
    });
    // 플레이헤드
    ctx.fillStyle = '#fff'; ctx.fillRect(X(f) - 1, 2, 2, h - 4);
  }
  (function () {
    let drag = false;
    const go = e => {
      const r = tl.getBoundingClientRect(), n = S.data.frames.length;
      const fr = Math.round((e.clientX - r.left - 8) / (r.width - 16) * (n - 1));
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

  // ---------- 키 편집 ----------
  function setEdit(on) {
    S.edit = on; $('editBtn').classList.toggle('on', on); $('editBar').classList.toggle('show', on);
    if (on) { pause(); if (S.mode === 'orig') { S.mode = 'overlay'; [...$('modeSeg').children].forEach(b => b.classList.toggle('on', b.dataset.v === 'overlay')); layout(); } }
    S.dirty = true;
  }
  $('editBtn').onclick = () => setEdit(!S.edit);
  function fillLayerSel() {
    const sel = $('layerSel');
    sel.innerHTML = S.layers.map(l => `<option value="${l.id}">${l.manual ? '✋ ' : ''}${l.label}</option>`).join('');
    sel.value = S.layerId;
  }
  $('layerSel').onchange = e => { S.layerId = e.target.value; S.dirty = true; };

  function editCanvas() { return S.mode === 'side' ? cv2 : cv1; }
  let dragJ = null;
  [cv1, cv2].forEach(cv => {
    cv.addEventListener('pointerdown', e => {
      if (!S.data) return;
      if (!S.edit) { S.playing ? pause() : play(); return; }
      if (cv !== editCanvas()) return;
      const f = Math.round(S.t * S.data.fps); seekTo(f / S.data.fps);
      const P = corrAt(f), r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = null, bd = 34;
      C.MAIN_JOINTS.forEach(j => { const d = Math.hypot(P[j][0] * panelW - mx, P[j][1] * panelH - my); if (d < bd) { bd = d; best = j; } });
      if (best == null) return;
      S.selJoint = best; dragJ = best;
      $('jointLbl').textContent = C.JOINT_NAMES[best] + ' (드래그해서 위치 수정)';
      cv.setPointerCapture(e.pointerId);
      S.dirty = true;
    });
    cv.addEventListener('pointermove', e => {
      if (dragJ == null || cv !== editCanvas()) return;
      const r = cv.getBoundingClientRect();
      const x = (e.clientX - r.left) / panelW, y = (e.clientY - r.top) / panelH;
      setJoint(dragJ, Math.round(S.t * S.data.fps), x, y);
    });
    const up = () => { if (dragJ != null) { dragJ = null; S._corrCache = null; S.dirty = true; } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
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
    const L = S.layers.find(l => l.id === S.layerId); if (!L) return [];
    const s = new Set();
    for (const j in L.curves) { if (S.selJoint != null && +j !== S.selJoint) continue; L.curves[j].forEach(k => s.add(k.f)); }
    return [...s].sort((a, b) => a - b);
  }
  $('prevKey').onclick = () => { const f = Math.round(S.t * S.data.fps); const k = layerKeyFrames().filter(x => x < f).pop(); if (k != null) { pause(); seekTo(k / S.data.fps); S.dirty = true; } };
  $('nextKey').onclick = () => { const f = Math.round(S.t * S.data.fps); const k = layerKeyFrames().find(x => x > f); if (k != null) { pause(); seekTo(k / S.data.fps); S.dirty = true; } };
  $('delKey').onclick = () => {
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
    const old = btn.textContent;
    try { await navigator.clipboard.writeText(txt); btn.textContent = '✅ 복사됨'; }
    catch (e) { ta.focus(); ta.select(); btn.textContent = '아래 칸을 길게 눌러 복사'; }
    setTimeout(() => btn.textContent = old, 1800);
  }
  $('cpJson').onclick = e => copyOut(exportJson(), e.currentTarget);
  $('cpCsv').onclick = e => copyOut(exportCsv(), e.currentTarget);

  window.NNN = { S, C, video, corrAt, drawSkel, drawArrows, drawBg, finish, fmt, pause, layout, show, once, markDirty: () => { S._corrCache = null; S.dirty = true; } };

  // 재생/정지 중 영상 시점 맞추기
  video.addEventListener('seeked', () => { S.dirty = true; });
})();
