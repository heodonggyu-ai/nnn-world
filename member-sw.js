/* NNN 복싱 회원 월드 · 홈 화면 앱용 서비스 워커 (항상 최신 우선, 인터넷이 끊기면 저장본) */
const C='nnn-member-v6';
const SHELL=['member.html','member.webmanifest','member-icons/v2/icon-192.png','member-icons/v2/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* 사진첩 → 공유 → NNN WORLD : 받은 영상을 잠시 보관하고 앱을 엶 */
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='POST'&&u.origin===location.origin&&u.searchParams.get('share')){
  e.respondWith((async()=>{try{const fd=await e.request.formData();const f=fd.getAll('media').find(x=>x&&x.size)||null;
    if(f){const c=await caches.open('nnn-share');await c.put('shared-media',new Response(f,{headers:{'Content-Type':f.type||'application/octet-stream','X-Name':encodeURIComponent(f.name||'shared')}}))}}catch(x){}
    return Response.redirect('member.html?shared=1',303)})());return}});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(!/\/member(\.html|-icons\/|\.webmanifest)/.test(u.pathname))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(u.pathname.endsWith('member.html')?'member.html':e.request,cp))}return r}).catch(()=>caches.match(u.pathname.endsWith('member.html')?'member.html':e.request)))});

/* 출석 알림을 누르면 앱 열기 */
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'member.html';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.includes('member')&&'focus' in w)return w.focus()}return self.clients.openWindow(url)}))});

/* 출석 알림 푸시 받기 (앱을 닫아 둬도) */
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'NNN 출석 알림',{body:d.body||'',tag:d.tag||'att',renotify:true,vibrate:[400,150,400,150,800],icon:'member-icons/v2/icon-192.png',badge:'member-icons/v2/icon-192.png',data:{url:d.url||'member.html'}}))});
