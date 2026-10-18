/**
 * 탕정 엔엔엔복싱 · 자동 발송기 (카톡 알림톡 우선, 문자 선택) — Google Apps Script
 * 회원 월드가 Firebase의 gym/outbox 에 넣은 안내를 1분마다 확인해서 솔라피로 보냅니다.
 *
 * 스크립트 속성 (프로젝트 설정 → 스크립트 속성)
 *   필수: SOLAPI_KEY, SOLAPI_SECRET, DB_URL, DB_SECRET
 *   알림톡: KAKAO_PFID, TPL_WELCOME, TPL_PAY, TPL_HOLD  (솔라피 채널 ID와 승인된 템플릿 ID)
 *   문자(선택): FROM_NUMBER  — 넣으면 템플릿이 없는 안내는 문자로 보내요
 *
 * 처음 한 번: 함수 선택 → setup → 실행 → 권한 허용
 */
const PROPS = PropertiesService.getScriptProperties();

function cfg_() {
  const c = {
    key: PROPS.getProperty('SOLAPI_KEY'),
    secret: PROPS.getProperty('SOLAPI_SECRET'),
    db: String(PROPS.getProperty('DB_URL') || '').replace(/\/+$/, ''),
    dbSecret: PROPS.getProperty('DB_SECRET')
  };
  const miss = Object.keys(c).filter(k => !c[k]);
  c.from = String(PROPS.getProperty('FROM_NUMBER') || '').replace(/\D/g, '');
  c.pfId = PROPS.getProperty('KAKAO_PFID') || '';
  c.tpl = { welcome: PROPS.getProperty('TPL_WELCOME') || '', pay: PROPS.getProperty('TPL_PAY') || '', hold: PROPS.getProperty('TPL_HOLD') || '' };
  if (miss.length) throw new Error('스크립트 속성이 비어 있어요: ' + miss.join(', '));
  return c;
}

function hex_(bytes) {
  return bytes.map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}

function solapiAuth_(c) {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const salt = Utilities.getUuid().replace(/-/g, '');
  const sig = hex_(Utilities.computeHmacSha256Signature(date + salt, c.secret));
  return 'HMAC-SHA256 apiKey=' + c.key + ', date=' + date + ', salt=' + salt + ', signature=' + sig;
}

function bytes_(t) {
  let n = 0;
  for (const ch of String(t)) n += ch.charCodeAt(0) > 127 ? 2 : 1;
  return n;
}

function buildMsg_(c, job) {
  const to = String(job.to).replace(/\D/g, '');
  const tpl = c.tpl[job.kind];
  if (c.pfId && tpl && job.vars) {
    const m = { to: to, type: 'ATA', kakaoOptions: { pfId: c.pfId, templateId: tpl, variables: job.vars, disableSms: !c.from } };
    if (c.from) { m.from = c.from; m.text = job.text; }
    return m;
  }
  if (!c.from) throw new Error('이 안내(' + job.kind + ')의 알림톡 템플릿 ID가 없어요. 스크립트 속성 TPL_' + String(job.kind).toUpperCase() + ' 를 넣어 주세요');
  const m = { to: to, from: c.from, text: job.text };
  if (bytes_(job.text) > 90) m.subject = '탕정 엔엔엔복싱';
  return m;
}

function sendMsg_(c, msg) {
  const res = UrlFetchApp.fetch('https://api.solapi.com/messages/v4/send-many/detail', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: solapiAuth_(c) },
    payload: JSON.stringify({ messages: [msg] }),
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  let j = {};
  try { j = JSON.parse(body); } catch (e) {}
  if (code >= 300) throw new Error(String(j.errorMessage || j.errorCode || body).slice(0, 200));
  if (j.failedMessageList && j.failedMessageList.length) {
    const f = j.failedMessageList[0];
    throw new Error(String(f.statusMessage || f.statusCode || '발송 실패').slice(0, 200));
  }
  return (j.groupInfo && (j.groupInfo._id || j.groupInfo.groupId)) || '';
}

function db_(c, path, method, data) {
  const opt = { method: method || 'get', muteHttpExceptions: true, contentType: 'application/json' };
  if (data !== undefined) opt.payload = JSON.stringify(data);
  const res = UrlFetchApp.fetch(c.db + path + (path.indexOf('?') >= 0 ? '&' : '?') + 'auth=' + c.dbSecret, opt);
  if (res.getResponseCode() >= 300) throw new Error('DB ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText() || 'null');
}

/** 1분마다 실행됨 */
function processOutbox() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const c = cfg_();
    db_(c, '/gym/sender.json', 'patch', { seen: Date.now() });
    const jobs = db_(c, '/gym/outbox.json?orderBy=%22status%22&equalTo=%22pending%22') || {};
    Object.keys(jobs).sort().slice(0, 20).forEach(id => {
      const j = jobs[id];
      db_(c, '/gym/outbox/' + id + '.json', 'patch', { status: 'sending' });
      try {
        const gid = sendMsg_(c, buildMsg_(c, j));
        db_(c, '/gym/outbox/' + id + '.json', 'patch', { status: 'sent', sentAt: Date.now(), groupId: gid, error: null });
      } catch (e) {
        db_(c, '/gym/outbox/' + id + '.json', 'patch', { status: 'failed', error: String(e.message || e).slice(0, 200) });
      }
    });
  } finally {
    lock.releaseLock();
  }
}

/** 처음 한 번 실행: 1분마다 processOutbox 가 돌도록 등록 */
function setup() {
  cfg_();
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'processOutbox') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processOutbox').timeBased().everyMinutes(1).create();
  processOutbox();
  Logger.log('설정 완료: 1분마다 발송함을 확인해요.');
}

/** 시험: TEST_TO 번호로 가입 안내 알림톡을 바로 보내요 (스크립트 속성 TEST_TO 필요) */
function testSend() {
  const c = cfg_();
  const to = PROPS.getProperty('TEST_TO');
  if (!to) throw new Error('스크립트 속성 TEST_TO 에 받을 휴대폰 번호를 넣어 주세요');
  const job = { to: to, kind: 'welcome', text: '[탕정 엔엔엔복싱] 발송기 시험입니다.', vars: { '#{이름}': '시험', '#{회원번호}': '0000' } };
  const gid = sendMsg_(c, buildMsg_(c, job));
  Logger.log('발송 성공 ' + gid);
}
