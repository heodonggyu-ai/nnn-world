/**
 * 탕정 엔엔엔복싱 · 자동 문자 발송기 (Google Apps Script)
 * 회원 월드가 Firebase의 gym/outbox 에 넣은 문자를 1분마다 확인해서 솔라피로 보냅니다.
 *
 * 처음 한 번:
 *  1) 프로젝트 설정 → 스크립트 속성에 아래 5개를 넣어요
 *     SOLAPI_KEY, SOLAPI_SECRET, FROM_NUMBER, DB_URL, DB_SECRET
 *  2) 위쪽 함수 선택에서 setup 을 고르고 실행 → 권한 허용
 *  3) 함수 선택에서 testSend 를 실행하면 FROM_NUMBER 로 시험 문자가 가요
 */
const PROPS = PropertiesService.getScriptProperties();

function cfg_() {
  const c = {
    key: PROPS.getProperty('SOLAPI_KEY'),
    secret: PROPS.getProperty('SOLAPI_SECRET'),
    from: String(PROPS.getProperty('FROM_NUMBER') || '').replace(/\D/g, ''),
    db: String(PROPS.getProperty('DB_URL') || '').replace(/\/+$/, ''),
    dbSecret: PROPS.getProperty('DB_SECRET')
  };
  const miss = Object.keys(c).filter(k => !c[k]);
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

function sendSms_(c, to, text) {
  const msg = { to: String(to).replace(/\D/g, ''), from: c.from, text: text };
  if (bytes_(text) > 90) msg.subject = '탕정 엔엔엔복싱';
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
        const gid = sendSms_(c, j.to, j.text);
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

/** 시험: FROM_NUMBER(발신번호)로 짧은 문자를 바로 보내요 */
function testSend() {
  const c = cfg_();
  const gid = sendSms_(c, c.from, '[탕정 엔엔엔복싱] 자동 문자 발송기 시험입니다.');
  Logger.log('발송 성공 ' + gid);
}
