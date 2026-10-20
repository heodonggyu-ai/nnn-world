/* NNN 복싱 회원 월드 · 홈 화면 앱용 서비스 워커 (항상 최신 우선, 인터넷이 끊기면 저장본) */
const C='nnn-member-v3';
const SHELL=['member.html','member.webmanifest','member-icons/v2/icon-192.png','member-icons/v2/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(!/\/member(\.html|-icons\/|\.webmanifest)/.test(u.pathname))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(u.pathname.endsWith('member.html')?'member.html':e.request,cp))}return r}).catch(()=>caches.match(u.pathname.endsWith('member.html')?'member.html':e.request)))});
