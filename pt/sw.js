/* NNN PT 수업 관리 · 알림용 서비스 워커 */
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'PT 수업 알림',{body:d.body||'',tag:d.tag||'pt',renotify:true,vibrate:[300,120,300],icon:'icon-192.png',badge:'icon-192.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.includes('/pt/')&&'focus' in w)return w.focus()}return self.clients.openWindow('./')}))});
