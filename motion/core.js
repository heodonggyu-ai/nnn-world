/* NNN 모션 코치 — 분석/보정 엔진 (UI와 분리된 순수 로직) */
(function (root) {
  'use strict';

  const SIDES = {
    L: { sh: 11, el: 13, wr: 15, hip: 23, kn: 25, an: 27, hand: [17, 19, 21], foot: [29, 31], name: '왼손' },
    R: { sh: 12, el: 14, wr: 16, hip: 24, kn: 26, an: 28, hand: [18, 20, 22], foot: [30, 32], name: '오른손' }
  };
  // 키를 직접 갖는 관절(메인 컨트롤러). 나머지는 따라감.
  const MAIN_JOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  const FOLLOW = {};
  for (let j = 1; j <= 10; j++) FOLLOW[j] = 0;
  [17, 19, 21].forEach(j => FOLLOW[j] = 15);
  [18, 20, 22].forEach(j => FOLLOW[j] = 16);
  [29, 31].forEach(j => FOLLOW[j] = 27);
  [30, 32].forEach(j => FOLLOW[j] = 28);
  const JOINT_NAMES = {
    0: '머리', 11: '왼어깨', 12: '오른어깨', 13: '왼팔꿈치', 14: '오른팔꿈치', 15: '왼주먹', 16: '오른주먹',
    23: '왼골반', 24: '오른골반', 25: '왼무릎', 26: '오른무릎', 27: '왼발목', 28: '오른발목'
  };
  const CONNECTIONS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32],
    [15, 19], [16, 20], [15, 17], [16, 18]];

  // ---------- 벡터 ----------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0)];
  const len2 = a => Math.hypot(a[0], a[1]);
  const len3 = a => Math.hypot(a[0], a[1], a[2] || 0);
  const d2 = (a, b) => len2(sub(a, b));
  const d3 = (a, b) => len3(sub(a, b));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, ((a[2] || 0) + (b[2] || 0)) / 2];
  const lerp = (a, b, t) => a + (b - a) * t;
  function angle3(a, b, c) { // b에서의 각도(도)
    const u = sub(a, b), v = sub(c, b);
    const cos = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (len3(u) * len3(v) + 1e-9);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  }
  function median(arr) {
    const a = arr.filter(v => isFinite(v)).slice().sort((x, y) => x - y);
    if (!a.length) return NaN;
    return a[Math.floor(a.length / 2)];
  }
  const smoothstep = t => t * t * (3 - 2 * t);

  // ---------- 전처리: 빈 프레임 채우기 + 스무딩 ----------
  function fillAndSmooth(frames) {
    const n = frames.length;
    const ok = frames.map(f => !!f.img);
    if (!ok.some(Boolean)) return null;
    for (let i = 0; i < n; i++) {
      if (ok[i]) continue;
      let p = i - 1; while (p >= 0 && !ok[p]) p--;
      let q = i + 1; while (q < n && !ok[q]) q++;
      const A = p >= 0 ? frames[p] : null, B = q < n ? frames[q] : null;
      if (A && B) {
        const t = (i - p) / (q - p);
        frames[i].img = A.img.map((pt, j) => pt.map((v, k) => lerp(v, B.img[j][k], t)));
        frames[i].world = A.world.map((pt, j) => pt.map((v, k) => lerp(v, B.world[j][k], t)));
      } else {
        const S = A || B;
        frames[i].img = S.img.map(pt => pt.slice());
        frames[i].world = S.world.map(pt => pt.slice());
      }
      frames[i].filled = true;
    }
    // 1-2-1 스무딩
    const sm = key => {
      const out = frames.map(f => f[key].map(p => p.slice()));
      for (let i = 1; i < n - 1; i++) {
        for (let j = 0; j < 33; j++) for (let k = 0; k < 3; k++) {
          out[i][j][k] = (frames[i - 1][key][j][k] + 2 * frames[i][key][j][k] + frames[i + 1][key][j][k]) / 4;
        }
      }
      out.forEach((p, i) => frames[i][key] = p);
    };
    sm('img'); sm('world');
    return frames;
  }

  // ---------- 분석 ----------
  function analyze(data, opts) {
    const fps = data.fps, F = data.frames, n = F.length;
    const lead = opts.stance === 'southpaw' ? 'R' : 'L';
    const rear = lead === 'L' ? 'R' : 'L';
    const aspect = data.aspect || 1; // width/height — 2D 거리 계산용
    const P2 = (f, j) => [F[f].img[j][0] * aspect, F[f].img[j][1]]; // 가로 비율 보정 좌표
    const W3 = (f, j) => F[f].world[j];

    const torsoArr = [], upperArr = { L: [], R: [] }, foreArr = { L: [], R: [] }, armLen3 = { L: [], R: [] };
    for (let f = 0; f < n; f++) {
      torsoArr.push(d2(mid(P2(f, 11), P2(f, 12)), mid(P2(f, 23), P2(f, 24))));
      for (const s of ['L', 'R']) {
        const S = SIDES[s];
        upperArr[s].push(d2(P2(f, S.sh), P2(f, S.el)));
        foreArr[s].push(d2(P2(f, S.el), P2(f, S.wr)));
        armLen3[s].push(d3(W3(f, S.sh), W3(f, S.el)) + d3(W3(f, S.el), W3(f, S.wr)));
      }
    }
    const T = median(torsoArr) || 0.25;
    const ARM3 = { L: median(armLen3.L), R: median(armLen3.R) };
    const UP2 = { L: median(upperArr.L), R: median(upperArr.R) };

    const m = {
      T, ARM3, UP2, lead, rear, aspect,
      chinY: [], ext: { L: [], R: [] }, elbow: { L: [], R: [] }, drop: { L: [], R: [] },
      chinUp: [], rot: [], hipRot: [], stance: [], knee: { L: [], R: [] }
    };
    for (let f = 0; f < n; f++) {
      const nose = P2(f, 0), shM = mid(P2(f, 11), P2(f, 12));
      const chinY = nose[1] + 0.35 * (shM[1] - nose[1]);
      m.chinY.push(chinY);
      const earM = mid(P2(f, 7), P2(f, 8));
      m.chinUp.push((earM[1] - nose[1]) / T);
      const ls = W3(f, 11), rs = W3(f, 12), lh = W3(f, 23), rh = W3(f, 24);
      m.rot.push(Math.atan2(rs[2] - ls[2], ls[0] - rs[0]) * 180 / Math.PI);
      m.hipRot.push(Math.atan2(rh[2] - lh[2], lh[0] - rh[0]) * 180 / Math.PI);
      const la = W3(f, 27), ra = W3(f, 28);
      const ankleW = Math.hypot(la[0] - ra[0], la[2] - ra[2]);
      const shW = Math.hypot(ls[0] - rs[0], ls[2] - rs[2]);
      m.stance.push(ankleW / (shW + 1e-6));
      for (const s of ['L', 'R']) {
        const S = SIDES[s];
        m.ext[s].push(d3(W3(f, S.sh), W3(f, S.wr)) / (ARM3[s] + 1e-6));
        m.elbow[s].push(angle3(W3(f, S.sh), W3(f, S.el), W3(f, S.wr)));
        m.drop[s].push((P2(f, S.wr)[1] - chinY) / T);
        m.knee[s].push(angle3(W3(f, S.hip), W3(f, S.kn), W3(f, S.an)));
      }
    }
    m.chinBase = median(m.chinUp);

    // --- 펀치 이벤트 검출 ---
    const ON = 0.70, OFF = 0.60, PEAK = 0.74;
    const events = [];
    for (const s of ['L', 'R']) {
      let cur = null;
      for (let f = 0; f < n; f++) {
        const e = m.ext[s][f];
        if (!cur && e > ON) cur = { side: s, start: f, peak: f, peakExt: e };
        else if (cur) {
          if (e > cur.peakExt) { cur.peak = f; cur.peakExt = e; }
          if (e < OFF || f === n - 1) {
            cur.end = f;
            if (cur.peakExt >= PEAK && cur.end - cur.start >= 1) events.push(cur);
            cur = null;
          }
        }
      }
    }
    // 시작점을 ON 이전, 가드에서 출발한 시점으로 조금 당김
    events.forEach(ev => {
      let a = ev.start;
      while (a > 0 && m.ext[ev.side][a - 1] < m.ext[ev.side][a] && m.ext[ev.side][a - 1] > 0.45 && ev.start - a < fps * 0.3) a--;
      ev.start = a;
    });
    // 진짜 펀치만 남기기: 가드에서 출발(뻗기 전 값이 낮음) + 빠르게 뻗고 + 오래 뻗고 있지 않음
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i], e = m.ext[ev.side];
      const rise = ev.peakExt - e[ev.start];
      const tooLong = (ev.end - ev.start) > fps * 1.3;
      const neverReturned = ev.end === n - 1 && e[n - 1] > OFF;
      if (rise < 0.14 || tooLong || neverReturned || ev.start === 0 && e[0] > ON) events.splice(i, 1);
    }
    events.sort((a, b) => a.start - b.start);
    events.forEach(ev => {
      const S = SIDES[ev.side];
      const ang = m.elbow[ev.side][ev.peak];
      ev.elbowAt = ang;
      const rise = W3(ev.start, S.wr)[1] - W3(ev.peak, S.wr)[1]; // y아래가 +
      if (ang >= 140 || ev.peakExt >= 0.86) { ev.kind = 'straight'; ev.name = ev.side === lead ? '잽' : '스트레이트'; }
      else if (rise > 0.12) { ev.kind = 'upper'; ev.name = (ev.side === lead ? '앞손' : '뒷손') + ' 어퍼컷'; }
      else { ev.kind = 'hook'; ev.name = (ev.side === lead ? '앞손' : '뒷손') + ' 훅'; }
    });

    // --- 이슈 ---
    const issues = [];
    let uid = 1;
    const addIssue = o => { o.id = 'i' + (uid++); issues.push(o); return o; };

    events.forEach(ev => {
      // 1) 덜 뻗음 (직선 펀치)
      if (ev.kind === 'straight' && ev.elbowAt < 155) {
        addIssue({
          type: 'extend', side: ev.side, f0: ev.start, f1: ev.end, peak: ev.peak, ev,
          sev: ev.elbowAt < 135 ? 3 : 2,
          title: `${ev.name}: 팔을 끝까지 안 뻗음`,
          detail: `타격 순간 팔꿈치 각도 ${Math.round(ev.elbowAt)}° (목표 160° 이상)`,
          cue: '어깨를 같이 밀어 넣으면서 끝까지 뻗고, 맞는 순간에만 주먹을 짧게 쥐어 주세요. 팔만 뻗지 말고 어깨가 턱을 덮을 만큼 넣습니다.'
        });
      }
      // 2) 턱 들림
      let worst = -1, wf = ev.peak;
      for (let f = ev.start; f <= ev.end; f++) if (m.chinUp[f] > worst) { worst = m.chinUp[f]; wf = f; }
      const lift = worst - m.chinBase;
      if (lift > 0.07) {
        addIssue({
          type: 'chin', side: ev.side, f0: ev.start, f1: ev.end, peak: wf, ev, amount: lift,
          sev: lift > 0.14 ? 3 : 2,
          title: `${ev.name}: 턱이 들림`,
          detail: `평소보다 턱이 ${Math.round(lift * 100)}% (몸통 길이 기준) 들림`,
          cue: '펀치를 낼 때 턱을 당기고 시선은 눈썹 아래로 상대를 보세요. 앞어깨와 턱 사이를 붙이는 느낌.'
        });
      }
      // 3) 뒷손 스트레이트 회전
      if (ev.kind === 'straight' && ev.side === rear) {
        let maxD = 0;
        for (let f = ev.start; f <= ev.peak; f++) maxD = Math.max(maxD, Math.abs(m.rot[f] - m.rot[ev.start]));
        ev.rotation = maxD;
        if (maxD < 20) {
          addIssue({
            type: 'rotate', side: ev.side, f0: ev.start, f1: ev.end, peak: ev.peak, ev,
            sev: maxD < 10 ? 3 : 2,
            title: `${ev.name}: 몸통 회전 부족`,
            detail: `어깨 회전 ${Math.round(maxD)}° (권장 25° 이상)`,
            cue: '뒷발 뒤꿈치를 바깥으로 돌리며 골반 → 어깨 → 주먹 순서로 회전하세요. 뒷어깨가 앞으로 나와야 체중이 실립니다.'
          });
        }
      }
    });

    // 4) 가드 내려감 (펀치 중이 아닌 손)
    const TOL = 0.12;
    for (const s of ['L', 'R']) {
      const busy = new Array(n).fill(false);
      events.filter(e => e.side === s).forEach(e => {
        for (let f = Math.max(0, e.start - 1); f <= Math.min(n - 1, e.peak + 2); f++) busy[f] = true;
      });
      const low = m.drop[s].map((v, f) => !busy[f] && v > TOL);
      // 짧은 틈 메우기
      for (let f = 1; f < n - 1; f++) if (!low[f] && low[f - 1] && !busy[f]) {
        let k = f; while (k < n && !low[k] && k - f < 2) k++;
        if (k < n && low[k] && k - f <= 2) for (let q = f; q < k; q++) if (!busy[q]) low[q] = true;
      }
      const minLen = Math.max(3, Math.round(fps * 0.2));
      let f = 0;
      while (f < n) {
        if (!low[f]) { f++; continue; }
        let g = f; while (g + 1 < n && low[g + 1]) g++;
        if (g - f + 1 >= minLen) {
          let mx = 0, mf = f;
          for (let q = f; q <= g; q++) if (m.drop[s][q] > mx) { mx = m.drop[s][q]; mf = q; }
          const other = events.find(e => e.side !== s && e.start <= g && e.end >= f);
          const own = events.find(e => e.side === s && e.peak < f && f - e.end <= fps * 0.5);
          const hand = s === lead ? '앞손' : '뒷손';
          let o;
          if (other) o = {
            type: 'guard', ctx: 'other', title: `${other.name} 때 ${hand} 가드가 내려감`,
            cue: '펀치를 낼 때 반대 주먹은 턱(광대) 옆에 붙여 두세요. 치는 손만 나가고 지키는 손은 그대로!'
          };
          else if (own) o = {
            type: 'guard', ctx: 'return', title: `${own.name} 후 ${hand}이 낮게 돌아옴`,
            cue: '뻗은 길 그대로 빠르게 회수해서 턱 옆으로 돌아오세요. 회수가 낮으면 카운터를 맞습니다.'
          };
          else o = {
            type: 'guard', ctx: 'idle', title: `대기 중 ${hand} 가드가 낮음`,
            cue: '주먹은 턱 높이, 팔꿈치는 옆구리를 덮도록 모아 주세요. 쉬는 순간에도 가드는 유지!'
          };
          Object.assign(o, {
            side: s, f0: f, f1: g, peak: mf, amount: mx, sev: mx > 0.45 ? 3 : (mx > 0.25 ? 2 : 1),
            detail: `${(g - f + 1) / fps < 1 ? ((g - f + 1) / fps).toFixed(1) : ((g - f + 1) / fps).toFixed(1)}초 동안, 최대 턱 아래 ${Math.round(mx * 100)}% (몸통 길이 기준)`
          });
          addIssue(o);
        }
        f = g + 1;
      }
    }

    // 5) 전체 자세 (코멘트)
    const stMed = median(m.stance);
    if (stMed < 0.85) addIssue({
      type: 'stance', f0: 0, f1: n - 1, peak: 0, sev: 1, title: '스탠스가 좁음',
      detail: `발 간격이 어깨너비의 ${Math.round(stMed * 100)}%`,
      cue: '발 간격을 어깨너비보다 조금 넓게 벌려 균형을 잡으세요. 좁으면 펀치 후 몸이 쏠립니다.'
    });
    else if (stMed > 1.9) addIssue({
      type: 'stance', f0: 0, f1: n - 1, peak: 0, sev: 1, title: '스탠스가 너무 넓음',
      detail: `발 간격이 어깨너비의 ${Math.round(stMed * 100)}%`,
      cue: '스탠스가 넓으면 스텝이 느려집니다. 어깨너비보다 반 발 정도만 넓게.'
    });
    const kneeMed = Math.min(median(m.knee.L), median(m.knee.R));
    if (kneeMed > 172) addIssue({
      type: 'knee', f0: 0, f1: n - 1, peak: 0, sev: 1, title: '무릎이 펴져 있음',
      detail: `무릎 각도 약 ${Math.round(kneeMed)}°`,
      cue: '무릎을 살짝 굽혀 스프링처럼 준비하세요. 다리가 펴지면 체중 이동과 회피가 늦어집니다.'
    });

    issues.sort((a, b) => a.f0 - b.f0);
    const penalty = issues.reduce((s, i) => s + (i.sev === 3 ? 12 : i.sev === 2 ? 7 : 3), 0);
    const score = Math.max(20, 100 - penalty);
    return { m, events, issues, score, lead, rear };
  }

  // ---------- 보정 레이어(키프레임) 생성 ----------
  // 레이어 = { id, label, issueId, enabled, curves: { joint: [{f, dx, dy}] } }  (dx, dy는 정규화 영상 좌표)
  function addKey(layer, j, f, dx, dy) {
    const c = layer.curves[j] || (layer.curves[j] = []);
    const k = c.find(k => k.f === f);
    if (k) { k.dx = dx; k.dy = dy; } else { c.push({ f, dx, dy }); c.sort((a, b) => a.f - b.f); }
  }
  function evalCurve(c, f) {
    if (!c || !c.length) return [0, 0];
    if (f <= c[0].f) return [c[0].dx, c[0].dy];
    const last = c[c.length - 1];
    if (f >= last.f) return [last.dx, last.dy];
    for (let i = 0; i < c.length - 1; i++) {
      const a = c[i], b = c[i + 1];
      if (f >= a.f && f <= b.f) {
        const t = smoothstep((f - a.f) / (b.f - a.f || 1)); // 플랫 탄젠트(ease in/out)
        return [lerp(a.dx, b.dx, t), lerp(a.dy, b.dy, t)];
      }
    }
    return [0, 0];
  }

  function guardTarget(data, an, f, s) {
    const fr = data.frames[f].img, S = SIDES[s], A = an.m.aspect;
    const nose = fr[0], sh = fr[S.sh];
    const chinY = an.m.chinY[f];
    const wx = lerp(nose[0], sh[0], 0.55);
    const wy = chinY + 0.02 * an.m.T;
    const ex = lerp(sh[0], wx, 0.35);
    const ey = sh[1] + 0.8 * an.m.UP2[s];
    return { wr: [wx, wy], el: [ex, Math.max(ey, wy + 0.25 * an.m.T)] };
  }

  function buildLayers(data, an) {
    const n = data.frames.length, fps = data.fps, F = data.frames, A = an.m.aspect;
    const layers = [];
    const clampF = f => Math.max(0, Math.min(n - 1, f));
    an.issues.forEach(is => {
      const L = { id: 'L' + is.id, label: is.title, issueId: is.id, enabled: true, curves: {} };
      if (is.type === 'guard') {
        const S = SIDES[is.side];
        const step = Math.max(2, Math.round(fps * 0.2));
        const pre = Math.max(2, Math.round(fps * 0.15));
        const frames = [];
        for (let f = is.f0; f <= is.f1; f += step) frames.push(f);
        if (frames[frames.length - 1] !== is.f1) frames.push(is.f1);
        if (is.f0 - pre >= 0) { addKey(L, S.wr, is.f0 - pre, 0, 0); addKey(L, S.el, is.f0 - pre, 0, 0); }
        frames.forEach(f => {
          const tg = guardTarget(data, an, f, is.side), o = F[f].img;
          const dwy = Math.min(0, tg.wr[1] - o[S.wr][1]);
          const dey = Math.min(0, tg.el[1] - o[S.el][1]);
          addKey(L, S.wr, f, tg.wr[0] - o[S.wr][0], dwy);
          addKey(L, S.el, f, (tg.el[0] - o[S.el][0]) * 0.6, dey);
        });
        if (is.f1 + pre < n) { addKey(L, S.wr, is.f1 + pre, 0, 0); addKey(L, S.el, is.f1 + pre, 0, 0); }
      } else if (is.type === 'extend') {
        const S = SIDES[is.side], p = is.peak, o = F[p].img;
        const P = j => [o[j][0] * A, o[j][1]];
        const sh = P(S.sh), el = P(S.el), wr = P(S.wr);
        const up = d2(sh, el), fo = d2(el, wr);
        const dir = sub(wr, sh), dl = len2(dir) || 1;
        const u = [dir[0] / dl, dir[1] / dl];
        const elT = [sh[0] + u[0] * up, sh[1] + u[1] * up];
        const wrT = [sh[0] + u[0] * (up + fo) * 0.98, sh[1] + u[1] * (up + fo) * 0.98];
        [S.wr, S.el].forEach(j => { addKey(L, j, is.ev.start, 0, 0); addKey(L, j, clampF(is.ev.end), 0, 0); });
        addKey(L, S.el, p, (elT[0] - el[0]) / A, elT[1] - el[1]);
        addKey(L, S.wr, p, (wrT[0] - wr[0]) / A, wrT[1] - wr[1]);
      } else if (is.type === 'chin') {
        const dy = Math.max(0, is.amount - 0.02) * an.m.T;
        addKey(L, 0, clampF(is.f0 - 1), 0, 0);
        addKey(L, 0, is.peak, 0, dy);
        addKey(L, 0, clampF(is.f1 + 1), 0, 0);
      } else {
        return; // 회전·스탠스·무릎은 코칭 코멘트만 (2D 키로 표현 어려움)
      }
      is.layerId = L.id;
      layers.push(L);
    });
    layers.push({ id: 'manual', label: '내 수정 레이어', manual: true, enabled: true, curves: {} });
    return layers;
  }

  function layerDeltas(layers, f, exceptId) {
    const D = {};
    layers.forEach(L => {
      if (!L.enabled || L.id === exceptId) return;
      for (const j in L.curves) {
        const v = evalCurve(L.curves[j], f);
        const cur = D[j] || (D[j] = [0, 0]);
        cur[0] += v[0]; cur[1] += v[1];
      }
    });
    return D;
  }
  function applyDeltas(img, D) {
    return img.map((p, j) => {
      const src = D[j] ? j : (FOLLOW[j] !== undefined && D[FOLLOW[j]] ? FOLLOW[j] : null);
      if (src === null) return p.slice();
      return [p[0] + D[src][0], p[1] + D[src][1], p[2]];
    });
  }
  function correctedPose(data, layers, f) {
    return applyDeltas(data.frames[f].img, layerDeltas(layers, f));
  }

  // ---------- 데모 동작 생성 (영상 없이 체험용) ----------
  function makeDemo() {
    const fps = 15, dur = 6, n = fps * dur;
    const norm = v => { const l = len3(v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
    function arm(sh, dir, out, a, b, alphaDeg) {
      const al = alphaDeg * Math.PI / 180;
      const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(al));
      const d = norm(dir);
      const dot = out[0] * d[0] + out[1] * d[1] + out[2] * d[2];
      const p = norm([out[0] - d[0] * dot, out[1] - d[1] * dot, out[2] - d[2] * dot]);
      const beta = Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c))));
      return { el: add(sh, add([0, 0, 0], d, Math.cos(beta) * a), 1).map((v, i) => v + p[i] * Math.sin(beta) * a), wr: add(sh, d, c) };
    }
    const bump = (t, a, b) => (t <= a || t >= b) ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
    function punchCurve(t, a, peakA, peakB, b) {
      if (t <= a || t >= b) return 0;
      if (t < peakA) return smoothstep((t - a) / (peakA - a));
      if (t <= peakB) return 1;
      return 1 - smoothstep((t - peakB) / (b - peakB));
    }
    const mix3 = (A, B, t) => [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
    function rotY(p, deg, c = [0, 0, 0]) {
      const r = deg * Math.PI / 180, x = p[0] - c[0], z = p[2] - c[2];
      return [c[0] + x * Math.cos(r) - z * Math.sin(r), p[1], c[2] + x * Math.sin(r) + z * Math.cos(r)];
    }
    const frames = [];
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      const P = new Array(33);
      const bob = 0.012 * Math.sin(2 * Math.PI * 1.7 * t);
      P[23] = [0.1, 0, 0]; P[24] = [-0.1, 0, 0];
      P[11] = [0.18, -0.5, 0]; P[12] = [-0.18, -0.5, 0];
      P[0] = [0, -0.69, -0.09];
      P[25] = [0.14, 0.42, -0.16]; P[26] = [-0.15, 0.42, 0.12];
      P[27] = [0.15, 0.85, -0.2]; P[28] = [-0.18, 0.85, 0.22];
      // 가드
      const gL = { el: [0.16, -0.31, -0.12], wr: [0.08, -0.63, -0.24] };
      const gR = { el: [-0.16, -0.31, -0.1], wr: [-0.08, -0.64, -0.2] };
      let Lw = gL.wr, Le = gL.el, Rw = gR.wr, Re = gR.el;
      // 잽1 (좋은 뻗음) + 오른손 가드 내려감
      const j1 = punchCurve(t, 0.7, 0.95, 1.05, 1.4);
      const jabL = arm(P[11], [-0.15, -0.05, -1], [1, 0.6, 0], 0.22, 0.33, 174);
      Lw = mix3(Lw, jabL.wr, j1); Le = mix3(Le, jabL.el, j1);
      const drop = bump(t, 0.75, 1.75);
      Rw = add(Rw, [-0.06, 0.3, 0.05], drop); Re = add(Re, [-0.05, 0.1, 0], drop);
      // 잽1 회수 후 왼손 낮음
      const lowL = bump(t, 1.35, 2.4);
      Lw = add(Lw, [0.05, 0.24, 0.04], lowL); Le = add(Le, [0.04, 0.08, 0], lowL);
      // 뒷손 스트레이트 (덜 뻗음 + 회전 부족 + 턱 들림)
      const s1 = punchCurve(t, 2.6, 2.85, 2.95, 3.4);
      const strR = arm(P[12], [0.25, -0.05, -1], [-1, 0.7, 0], 0.22, 0.33, 128);
      Rw = mix3(Rw, strR.wr, s1); Re = mix3(Re, strR.el, s1);
      const chin = s1 * 0.07;
      // 잽2 (좋은 동작)
      const j2 = punchCurve(t, 4.2, 4.42, 4.5, 4.85);
      Lw = mix3(Lw, jabL.wr, j2); Le = mix3(Le, jabL.el, j2);
      P[13] = Le; P[15] = Lw; P[14] = Re; P[16] = Rw;
      // 상체 회전 (스트레이트 때 8°만)
      const rot = 8 * s1;
      [0, 11, 12, 13, 14, 15, 16].forEach(j => P[j] = rotY(P[j], rot));
      // 얼굴
      const nose = P[0];
      P[0] = [nose[0], nose[1] - chin, nose[2]];
      P[1] = add(nose, [0.02, -0.03, 0.01]); P[2] = add(nose, [0.03, -0.03, 0.01]); P[3] = add(nose, [0.04, -0.03, 0.01]);
      P[4] = add(nose, [-0.02, -0.03, 0.01]); P[5] = add(nose, [-0.03, -0.03, 0.01]); P[6] = add(nose, [-0.04, -0.03, 0.01]);
      P[7] = add(nose, [0.075, -0.01, 0.08]); P[8] = add(nose, [-0.075, -0.01, 0.08]);
      P[9] = add(nose, [0.025, 0.035 - chin, 0.01]); P[10] = add(nose, [-0.025, 0.035 - chin, 0.01]);
      [[17, 15, 0.02], [19, 15, 0.0], [21, 15, 0.01]].forEach(([j, w, o]) => P[j] = add(P[w], [o, 0.01, -0.04]));
      [[18, 16, -0.02], [20, 16, 0], [22, 16, -0.01]].forEach(([j, w, o]) => P[j] = add(P[w], [o, 0.01, -0.04]));
      P[29] = add(P[27], [0, 0.03, 0.06]); P[31] = add(P[27], [0, 0.04, -0.12]);
      P[30] = add(P[28], [0, 0.03, 0.06]); P[32] = add(P[28], [0, 0.04, -0.12]);
      const world = P.map(p => rotY([p[0], p[1] + bob, p[2]], 30));
      const img = world.map(p => {
        const s = 1 / (1 + p[2] * 0.35);
        return [0.5 + p[0] * 0.75 * s, 0.43 + p[1] * 0.42 * s, p[2]];
      });
      frames.push({ t, img, world });
    }
    return { fps, frames, aspect: 9 / 16, width: 720, height: 1280, demo: true, duration: dur };
  }

  // ---------- 블렌더용 3D 데이터 ----------
  const BL_JOINTS = [0, 7, 8, 11, 12, 13, 14, 15, 16, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
  function blenderData(data, an, layers, opts) {
    const F = data.frames, n = F.length, A = an.m.aspect;
    const tw = [];
    F.forEach(fr => tw.push(d3(mid(fr.world[11], fr.world[12]), mid(fr.world[23], fr.world[24]))));
    const k = (median(tw) || 0.5) / (an.m.T || 0.25); // 영상 좌표 → 미터
    const hip0 = (F[0].img[23][0] + F[0].img[24][0]) / 2;
    const r3 = v => Math.round(v * 1000) / 1000;
    const orig = [], fix = [];
    for (let f = 0; f < n; f++) {
      const w = F[f].world, im = F[f].img, c = correctedPose(data, layers, f);
      const rootX = ((im[23][0] + im[24][0]) / 2 - hip0) * A * k;
      orig.push(BL_JOINTS.map(j => [r3(w[j][0] + rootX), r3(w[j][1]), r3(w[j][2])]));
      fix.push(BL_JOINTS.map(j => [
        r3(w[j][0] + rootX + (c[j][0] - im[j][0]) * A * k),
        r3(w[j][1] + (c[j][1] - im[j][1]) * k),
        r3(w[j][2])]));
    }
    const EN = { guard: 'guard dropped', extend: 'not fully extended', chin: 'chin up', rotate: 'more rotation', stance: 'stance', knee: 'bend knees' };
    return {
      name: opts.name || '', fps: data.fps, score: an.score, stance: opts.stance,
      slow: opts.slow, ref_vertical: opts.refVertical,
      joints: BL_JOINTS, orig, fix,
      issues: an.issues.map(i => ({
        id: i.id, t: i.title, en: EN[i.type] || 'form', f0: i.f0, f1: i.f1, sev: i.sev,
        whole: i.f0 === 0 && i.f1 === n - 1, fix: !!i.layerId
      }))
    };
  }

  const API = { blenderData, BL_JOINTS, SIDES, MAIN_JOINTS, FOLLOW, JOINT_NAMES, CONNECTIONS, fillAndSmooth, analyze, buildLayers, evalCurve, addKey, layerDeltas, applyDeltas, correctedPose, makeDemo, angle3, d2, median };
  if (typeof module !== 'undefined') module.exports = API; else root.Core = API;
})(this);
