/* ================= STORAGE ================= */
const DB = { db: null, mem: new Map(), ok: false };
function dbOpen() {
  return new Promise(res => {
    try {
      const rq = indexedDB.open('mingnyutoon', 1);
      rq.onupgradeneeded = () => { rq.result.createObjectStore('works', { keyPath: 'id' }); };
      rq.onsuccess = () => { DB.db = rq.result; DB.ok = true; res(true); };
      rq.onerror = () => res(false); rq.onblocked = () => res(false);
    } catch (e) { res(false); }
  });
}
function dbTx(mode, fn) { return new Promise((res, rej) => { try { const tx = DB.db.transaction('works', mode); const st = tx.objectStore('works'); const r = fn(st); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); } catch (e) { rej(e); } }); }
async function dbPut(rec) { if (!DB.ok) { DB.mem.set(rec.id, rec); return; } await dbTx('readwrite', st => st.put(rec)); }
async function dbGet(id) { if (!DB.ok) return DB.mem.get(id); return dbTx('readonly', st => st.get(id)); }
async function dbDel(id) { if (!DB.ok) { DB.mem.delete(id); return; } await dbTx('readwrite', st => st.delete(id)); }
async function dbAll() {
  if (!DB.ok) return [...DB.mem.values()];
  return new Promise((res) => { const out = []; try { const tx = DB.db.transaction('works', 'readonly'); const rq = tx.objectStore('works').openCursor(); rq.onsuccess = () => { const c = rq.result; if (c) { const v = c.value; out.push({ id: v.id, type: v.type, title: v.title, updated: v.updated, thumb: v.thumb, pages: v.pages.length, frames: v.anim ? v.anim.frames : 0 }); c.continue(); } else res(out); }; rq.onerror = () => res(out); } catch (e) { res(out); } });
}
const toBlob = c => new Promise(r => c.toBlob(b => r(b), 'image/png'));
async function blobToCanvas(b, W, H) { const c = mkCanvas(W, H); if (!b) return c; try { const bm = await createImageBitmap(b); c.getContext('2d').drawImage(bm, 0, 0); } catch (e) { await new Promise(r => { const u = URL.createObjectURL(b), i = new Image(); i.onload = () => { c.getContext('2d').drawImage(i, 0, 0); URL.revokeObjectURL(u); r(); }; i.onerror = r; i.src = u; }); } return c; }
function renderPageCanvas(page, scale = 1) { const c = mkCanvas(ST.doc.w * scale, ST.doc.h * scale), x = c.getContext('2d'); x.scale(scale, scale); compositePage(page, x, {}); return c; }
async function serializeDoc(d) {
  if (FLOAT && d === ST.doc) commitFloat();
  const pages = []; for (const p of d.pages) { const layers = []; for (const l of p.layers) { const o = { name: l.name, visible: l.visible, opacity: l.opacity, blend: l.blend, clip: l.clip, lock: l.lock, kind: l.kind || 'normal', guide: !!l.guide }; if (l.kind === 'frames') { o.cels = []; for (const f of Object.keys(l.cels)) if (l.used[f] && +f < d.anim.frames) o.cels.push({ f: +f, blob: await toBlob(l.cels[f]) }); } else o.blob = await toBlob(l.canvas); if (l.kind === 'part') { o.keys = l.keys; o.pivot = l.pivot; } layers.push(o); } pages.push({ active: p.active, objects: p.objects, panels: p.panels, pstyle: p.pstyle, layers }); }
  const s = Math.min(1, 300 / d.w); const tc = renderPageCanvas(d.pages[0], s);
  return { id: d.id, type: d.type, title: d.title, w: d.w, h: d.h, bg: d.bg, cur: d.cur, anim: d.anim, created: d.created || Date.now(), updated: Date.now(), thumb: tc.toDataURL('image/jpeg', .8), pages };
}
async function deserialize(rec) {
  const d = { id: rec.id, type: rec.type, title: rec.title, w: rec.w, h: rec.h, bg: rec.bg || '#fff', cur: rec.cur || 0, created: rec.created, anim: rec.anim, pages: [] };
  for (const p of rec.pages) { const layers = []; for (const l of p.layers) { let c; const o = { id: uid(), name: l.name, visible: l.visible, opacity: l.opacity, blend: l.blend, clip: l.clip, lock: l.lock, kind: l.kind || 'normal', guide: !!l.guide }; if (o.kind === 'frames') { o.cels = {}; o.used = {}; for (const ce of l.cels || []) { o.cels[ce.f] = await blobToCanvas(ce.blob, rec.w, rec.h); o.used[ce.f] = true; } if (!o.cels[0]) o.cels[0] = mkCanvas(rec.w, rec.h); c = o.cels[0]; } else c = await blobToCanvas(l.blob, rec.w, rec.h); if (o.kind === 'part') { o.keys = l.keys || []; o.pivot = l.pivot || { x: rec.w / 2, y: rec.h / 2 }; } o.canvas = c; o.ctx = c.getContext('2d'); layers.push(o); } d.pages.push({ id: uid(), layers, active: Math.min(p.active, layers.length - 1), objects: p.objects || [], panels: p.panels || [], pstyle: p.pstyle || { width: 5, color: '#1b1b1b', mask: true, gutter: '#fff' } }); }
  return d;
}
let SAVING = false;
async function saveDoc(manual) {
  if (!ST.doc || SAVING) return; SAVING = true;
  try { const rec = await serializeDoc(ST.doc); await dbPut(rec); ST.changed = false; if (manual) toast(DB.ok ? '💾 저장했어요!' : '⚠️ 이 브라우저에선 임시 저장만 돼요. 백업 파일로 저장하세요'); markMission('save'); }
  catch (e) { console.error(e); toast('저장 중 문제가 생겼어요 😢 백업 파일로 저장해 보세요'); }
  SAVING = false;
}
setInterval(() => { if (ST.doc && ST.changed && !STROKE && $('#editor').classList.contains('active')) saveDoc(false); }, 30000);
document.addEventListener('visibilitychange', () => { if (document.hidden && ST.doc && ST.changed) saveDoc(false); });

/* ---------- export ---------- */
let DL = null;
async function initDownloads() { try { if (window.claude && window.claude.use) DL = await window.claude.use('downloads'); } catch (e) { DL = null; } }
function safeName(s) { return (s || '그림').replace(/[\\/:*?"<>|]/g, '').slice(0, 40) || '그림'; }
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const HOSTED = !NATIVE && (/github\.io$|netlify\.app$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) || location.protocol === 'file:');
function hostSave(files, msg) { // files: [{name, blob}]
  const box = $('#saveImgs'); box.innerHTML = '';
  files.forEach(f => { if (/^image\//.test(f.blob.type)) { const i = new Image(); i.src = URL.createObjectURL(f.blob); box.appendChild(i); } });
  const fl = files.map(f => new File([f.blob], f.name, { type: f.blob.type || 'application/octet-stream' }));
  const canShare = !!(navigator.canShare && (() => { try { return navigator.canShare({ files: fl }); } catch (e) { return false; } })());
  $('#saveMsg').innerHTML = (msg || '저장 준비 완료!') + `<div class="save-btns">${canShare ? '<button class="btn" id="svShare">📤 사진·파일에 저장</button>' : ''}<button class="btn ${canShare ? 'sec' : ''}" id="svDl">⬇ 다운로드</button></div>${files.some(f => /^image\//.test(f.blob.type)) ? '<small style="opacity:.7">아이폰: 📤 → "이미지 저장" · 그림을 꾹 눌러도 저장돼요</small>' : ''}`;
  $('#saveView').classList.add('on');
  if (canShare) $('#svShare').onclick = async () => { try { await navigator.share({ files: fl }); toast('📥 저장했어요!'); $('#saveView').classList.remove('on'); } catch (e) { if (e.name !== 'AbortError') toast('공유가 안 되면 ⬇ 다운로드를 눌러요'); } };
  $('#svDl').onclick = () => { files.forEach((f, k) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(f.blob); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); }, k * 400)); toast('📥 다운로드했어요!'); };
}
async function nativeSave(files, title) {
  try {
    const P = window.Capacitor.Plugins, uris = [];
    for (const f of files) { const b64 = (await blobToDataURL(f.blob)).split(',')[1]; const r = await P.Filesystem.writeFile({ path: f.name.replace(/[\\/:*?"<>|]/g, '_'), data: b64, directory: 'CACHE' }); uris.push(r.uri); }
    await P.Share.share({ title: title || '밍뉴툰 저장', files: uris }); return true;
  } catch (e) { if (!/cancel/i.test(String(e && (e.message || e)))) { console.error(e); toast('저장 중 문제가 생겼어요 😢'); } return false; }
}
async function saveFile(filename, blob, imgs) {
  if (NATIVE) return nativeSave([{ name: filename, blob }]);
  if (HOSTED) { hostSave([{ name: filename, blob }]); return true; }
  if (DL) { try { await DL.save({ filename, data: blob }); toast('📥 저장했어요!'); return true; } catch (e) { if (e && e.code === 'declined') { toast('저장을 취소했어요'); return false; } if (e && e.code === 'rate_limited') { toast('잠깐만요, 다시 눌러 주세요'); return false; } } }
  if (imgs) { showSaveView('이미지를 <b>꾹 길게 눌러서</b> 사진에 저장하세요', imgs); return false; }
  toast('여기서는 파일 저장이 안 돼요 😢'); return false;
}
function showSaveView(msg, blobs) { const box = $('#saveImgs'); box.innerHTML = ''; blobs.forEach(b => { const i = new Image(); i.src = URL.createObjectURL(b); box.appendChild(i); }); $('#saveMsg').innerHTML = msg; $('#saveView').classList.add('on'); }
$('#saveClose') && ($('#saveClose').onclick = () => $('#saveView').classList.remove('on'));
async function exportPage(i) { const c = renderPageCanvas(ST.doc.pages[i]); const b = await toBlob(c); saveFile(`${safeName(ST.doc.title)}${ST.doc.type === 'toon' ? '_' + (i + 1) : ''}.png`, b, [b]); }
async function longCanvases() { const D = ST.doc, per = Math.max(1, Math.floor(12800 / D.h)); const out = []; for (let s = 0; s < D.pages.length; s += per) { const n = Math.min(per, D.pages.length - s); const c = mkCanvas(D.w, D.h * n), x = c.getContext('2d'); for (let k = 0; k < n; k++) { x.save(); x.translate(0, k * D.h); compositePage(D.pages[s + k], x, {}); x.restore(); } out.push(c); } return out; }
async function exportLong() {
  toast('📜 이어 붙이는 중...'); const cs = await longCanvases(); const blobs = []; for (const c of cs) blobs.push(await toBlob(c));
  if (NATIVE) nativeSave(blobs.map((b, i) => ({ name: `${safeName(ST.doc.title)}${blobs.length > 1 ? '_' + (i + 1) : ''}.png`, blob: b })));
  else if (HOSTED) hostSave(blobs.map((b, i) => ({ name: `${safeName(ST.doc.title)}${blobs.length > 1 ? '_' + (i + 1) : ''}.png`, blob: b })), '웹툰을 길게 이어 붙였어요!');
  else if (DL) { for (let i = 0; i < blobs.length; i++) { const ok = await saveFile(`${safeName(ST.doc.title)}${blobs.length > 1 ? '_' + (i + 1) : ''}.png`, blobs[i]); if (!ok) break; } }
  else showSaveView('웹툰 이미지를 <b>꾹 길게 눌러서</b> 저장하세요', blobs);
  markMission('export');
}
async function exportEach() { const blobs = []; for (let i = 0; i < ST.doc.pages.length; i++) blobs.push(await toBlob(renderPageCanvas(ST.doc.pages[i]))); if (NATIVE) nativeSave(blobs.map((b, i) => ({ name: `${safeName(ST.doc.title)}_${i + 1}.png`, blob: b }))); else if (HOSTED) hostSave(blobs.map((b, i) => ({ name: `${safeName(ST.doc.title)}_${i + 1}.png`, blob: b })), `화면 ${blobs.length}개를 준비했어요!`); else if (DL) { for (let i = 0; i < blobs.length; i++) { const ok = await saveFile(`${safeName(ST.doc.title)}_${i + 1}.png`, blobs[i]); if (!ok) break; } } else showSaveView('하나씩 <b>꾹 눌러서</b> 저장하세요', blobs); }
const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
async function exportBackup(d) {
  toast('📦 백업 파일 만드는 중...'); const rec = d.pages ? (d.pages[0] && d.pages[0].layers[0] && d.pages[0].layers[0].canvas ? await serializeDoc(d) : d) : d;
  const out = { ...rec, app: 'mingnyutoon', v: 1, pages: [] }; for (const p of rec.pages) { const layers = []; for (const l of p.layers) { const o = { ...l, blob: undefined, png: l.blob ? await blobToDataURL(l.blob) : null }; if (l.cels) { o.cels = []; for (const ce of l.cels) o.cels.push({ f: ce.f, png: await blobToDataURL(ce.blob) }); } layers.push(o); } out.pages.push({ ...p, layers }); }
  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' }); saveFile(`${safeName(rec.title)}_백업.json`, blob);
}
async function importBackup(file) {
  try {
    const j = JSON.parse(await file.text()); if (j.app !== 'mingnyutoon') throw new Error('not ours');
    const toB = async u => { const [h, b64] = u.split(','); const bin = atob(b64); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: (h.match(/:(.*?);/) || [])[1] || 'image/png' }); };
    const rec = { ...j, id: uid(), title: j.title, updated: Date.now(), pages: [] };
    for (const p of j.pages) { const layers = []; for (const l of p.layers) { const { png, ...rest } = l; const o = { ...rest, blob: png ? await toB(png) : null }; if (l.cels) o.cels = await Promise.all(l.cels.map(async ce => ({ f: ce.f, blob: await toB(ce.png) }))); layers.push(o); } rec.pages.push({ ...p, layers }); }
    delete rec.app; delete rec.v; await dbPut(rec); toast('📂 작품을 불러왔어요!'); renderGallery();
  } catch (e) { console.error(e); toast('이 파일은 열 수 없어요 😢'); }
}

/* ---------- preview ---------- */
async function openPreview() {
  if (STROKE) endStroke(); if (FLOAT) commitFloat(); if (ST.doc.type === 'anim') { openAnimPreview(); return; } const D = ST.doc; $('#pvTitle').textContent = D.title; const strip = $('#pvStrip'); strip.innerHTML = '';
  $$('.screen').forEach(s => s.classList.remove('active')); $('#preview').classList.add('active');
  const scale = Math.min(1, 960 / D.w);
  for (const p of D.pages) { const c = renderPageCanvas(p, scale); const i = new Image(); i.src = c.toDataURL('image/jpeg', .9); strip.appendChild(i); }
  strip.insertAdjacentHTML('beforeend', `<div class="end">— ${esc(D.title)} 끝 —<br><small>다음 화도 기대해 주세요! 💗</small></div>`);
  $('#pvScroll').scrollTop = 0; markMission('preview');
}
function closePreview() { $$('.screen').forEach(s => s.classList.remove('active')); $('#editor').classList.add('active'); resizeView(); ST.dirty = true; }
