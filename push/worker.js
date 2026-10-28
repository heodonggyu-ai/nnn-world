/* NNN WORLD 출석 알림 서버 (Cloudflare Worker · 무료)
   - 회원(학부모) 휴대폰의 알림 구독을 저장하고, 출석하면 그 휴대폰으로 알림을 보냅니다.
   - 필요한 것: KV 바인딩 이름 SUBS 하나. 비밀키는 처음 실행할 때 스스로 만들어 KV에 보관합니다. */
const DB_URL='https://nnn-world-default-rtdb.asia-southeast1.firebasedatabase.app';
const ORIGINS=['https://heodonggyu-ai.github.io','http://localhost:8765'];
const SUBJECT='https://heodonggyu-ai.github.io/nnn-world/member.html';
const enc=new TextEncoder();
const b64u=b=>{let s='';const u=new Uint8Array(b);for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64u=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const cat=(...a)=>{const n=a.reduce((s,x)=>s+x.length,0);const o=new Uint8Array(n);let p=0;for(const x of a){o.set(x,p);p+=x.length}return o};
async function hmac(key,data){const k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,data))}
const kstDay=(t=Date.now())=>new Date(t+9*3600e3).toISOString().slice(0,10);

async function vapid(env){let v=await env.SUBS.get('vapid',{type:'json'});
  if(!v){const kp=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
    v={priv:await crypto.subtle.exportKey('jwk',kp.privateKey),pub:b64u(await crypto.subtle.exportKey('raw',kp.publicKey))};await env.SUBS.put('vapid',JSON.stringify(v))}
  return v}
async function vapidAuth(env,endpoint){const v=await vapid(env);const aud=new URL(endpoint).origin;
  const h=b64u(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'})));const c=b64u(enc.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+12*3600,sub:SUBJECT})));
  const key=await crypto.subtle.importKey('jwk',v.priv,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(h+'.'+c));
  return `vapid t=${h}.${c}.${b64u(sig)}, k=${v.pub}`}
/* RFC 8291 aes128gcm 암호화 */
async function encryptPayload(sub,text){
  const uaPub=unb64u(sub.keys.p256dh),authSec=unb64u(sub.keys.auth);
  const as=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const asPub=new Uint8Array(await crypto.subtle.exportKey('raw',as.publicKey));
  const uaKey=await crypto.subtle.importKey('raw',uaPub,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:uaKey},as.privateKey,256));
  const prkKey=await hmac(authSec,shared);
  const ikm=await hmac(prkKey,cat(enc.encode('WebPush: info\0'),uaPub,asPub,new Uint8Array([1])));
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const prk=await hmac(salt,ikm);
  const cek=(await hmac(prk,cat(enc.encode('Content-Encoding: aes128gcm\0'),new Uint8Array([1])))).slice(0,16);
  const nonce=(await hmac(prk,cat(enc.encode('Content-Encoding: nonce\0'),new Uint8Array([1])))).slice(0,12);
  const k=await crypto.subtle.importKey('raw',cek,{name:'AES-GCM'},false,['encrypt']);
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},k,cat(enc.encode(text),new Uint8Array([2]))));
  const hdr=new Uint8Array(21);hdr.set(salt,0);new DataView(hdr.buffer).setUint32(16,4096);hdr[20]=65;
  return cat(hdr,asPub,ct)}
async function sendPush(env,sub,obj){const body=await encryptPayload(sub,JSON.stringify(obj));
  return fetch(sub.endpoint,{method:'POST',headers:{'Authorization':await vapidAuth(env,sub.endpoint),'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream','TTL':'7200','Urgency':'high'},body})}
async function fbGet(path,token,shallow){const r=await fetch(`${DB_URL}/${path}.json?auth=${encodeURIComponent(token)}${shallow?'&shallow=true':''}`);if(!r.ok)return {ok:false};return {ok:true,v:await r.json()}}
const okId=id=>/^[0-9A-Za-z_-]{1,20}$/.test(String(id||''));
/* ================= PT 수업 알림 (nnn-pt) ================= */
const PT_DB='https://nnn-pt-default-rtdb.asia-southeast1.firebasedatabase.app';
const PT_URL='https://heodonggyu-ai.github.io/nnn-world/pt/';
const okG=x=>/^[0-9A-Za-z_-]{4,64}$/.test(String(x||''));
const jwtUid=t=>{try{return JSON.parse(new TextDecoder().decode(unb64u(String(t).split('.')[1]))).user_id||''}catch(e){return ''}};
async function ptGet(path,token){const r=await fetch(`${PT_DB}/${path}.json?auth=${encodeURIComponent(token)}`);if(!r.ok)return {ok:false};return {ok:true,v:await r.json()}}
async function ptWho(b){const uid=jwtUid(b.token);if(!uid||!okG(b.gym))return null;
  if(uid===b.gym){const r=await ptGet(`pt/${b.gym}/data/cfg`,b.token);return r.ok?{role:'coach'}:null}
  const r=await ptGet(`pt/${b.gym}/claims/${uid}`,b.token);if(!r.ok||!r.v||!okG(r.v.mid))return null;return {role:'member',mid:String(r.v.mid)}}
const ptKS=g=>'pts:'+g,ptKQ=g=>'ptq:'+g;
async function ptSubs(env,g){return (await env.SUBS.get(ptKS(g),{type:'json'}))||{c:[],m:{}}}
const DW=['일','월','화','수','목','금','토'];
const ptWhen=at=>{const d=new Date(at+9*3600e3);return `${d.getUTCMonth()+1}/${d.getUTCDate()}(${DW[d.getUTCDay()]}) ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`};
const ptLeft=ms=>{const m=Math.round(ms/6e4);if(m>=1440){const d=Math.round(m/1440);return d===1?'내일':d+'일 뒤'}if(m>=60){const h=Math.floor(m/60),mm=m%60;return h+'시간'+(mm>=10?' '+mm+'분':'')+' 뒤'}return m+'분 뒤'};
async function ptSendTo(env,g,subsObj,list,msg){let sent=0,gone=[];for(const s of list){try{const r=await sendPush(env,s,msg);if(r.status===404||r.status===410)gone.push(s.endpoint);else if(r.ok)sent++}catch(e){}}
  if(gone.length){subsObj.c=(subsObj.c||[]).filter(x=>!gone.includes(x.endpoint));Object.keys(subsObj.m||{}).forEach(k=>{subsObj.m[k]=subsObj.m[k].filter(x=>!gone.includes(x.endpoint));if(!subsObj.m[k].length)delete subsObj.m[k]});await env.SUBS.put(ptKS(g),JSON.stringify(subsObj))}
  return sent}
async function ptRoute(p,b,env,J){
  const who=await ptWho(b);if(!who)return J({error:'auth'},403);const g=b.gym;
  if(p==='/pt/sub'){const s=b.sub;if(!s||!/^https:\/\//.test(s.endpoint||'')||!s.keys||!s.keys.p256dh||!s.keys.auth)return J({error:'sub'},400);
    const S=await ptSubs(env,g);const rec={endpoint:s.endpoint,keys:{p256dh:s.keys.p256dh,auth:s.keys.auth},at:Date.now()};
    const put=L=>[rec,...(L||[]).filter(x=>x.endpoint!==s.endpoint)].slice(0,6);
    if(who.role==='coach')S.c=put(S.c);else{S.m=S.m||{};S.m[who.mid]=put(S.m[who.mid])}
    await env.SUBS.put(ptKS(g),JSON.stringify(S));
    const gl=(await env.SUBS.get('ptg',{type:'json'}))||[];if(!gl.includes(g)){gl.push(g);await env.SUBS.put('ptg',JSON.stringify(gl.slice(-20)))}
    return J({ok:true,role:who.role})}
  if(p==='/pt/unsub'){const S=await ptSubs(env,g);const f=L=>(L||[]).filter(x=>x.endpoint!==b.endpoint);if(who.role==='coach')S.c=f(S.c);else if(S.m)S.m[who.mid]=f(S.m[who.mid]);await env.SUBS.put(ptKS(g),JSON.stringify(S));return J({ok:true})}
  if(p==='/pt/test'){const S=await ptSubs(env,g);const L=who.role==='coach'?S.c:((S.m||{})[who.mid]||[]);
    const n=await ptSendTo(env,g,S,L,{title:'PT 수업 알림 시험',body:'이 폰으로 PT 알림이 잘 와요 👍',tag:'pt-test',url:PT_URL});return J({ok:true,sent:n})}
  if(p==='/pt/sched'){if(who.role!=='coach')return J({error:'coach only'},403);
    const items=(Array.isArray(b.items)?b.items:[]).filter(x=>x&&okG(x.sid)&&okG(x.mid)&&typeof x.at==='number').slice(0,300).map(x=>({sid:x.sid,mid:x.mid,at:x.at,name:String(x.name||'').slice(0,20)}));
    const al=(Array.isArray(b.al)?b.al:[]).filter(x=>x&&typeof x.ms==='number'&&x.ms>0&&x.ms<=14*864e5).slice(0,6).map(x=>({k:String(x.k).slice(0,12),ms:x.ms}));
    await env.SUBS.put(ptKQ(g),JSON.stringify({items,al,me:b.me!==false,at:Date.now()}));
    const gl=(await env.SUBS.get('ptg',{type:'json'}))||[];if(!gl.includes(g)){gl.push(g);await env.SUBS.put('ptg',JSON.stringify(gl.slice(-20)))}
    return J({ok:true,n:items.length})}
  if(p==='/pt/event'){const S=await ptSubs(env,g);const at=+b.at||0;const when=at?ptWhen(at):'';
    if(who.role==='member'){if(b.kind!=='req')return J({error:'kind'},400);
      const nm=await ptGet(`pt/${g}/mv/${who.mid}/name`,b.token);const name=(nm.ok&&nm.v)||'회원';
      const n=await ptSendTo(env,g,S,S.c||[],{title:'새 PT 예약 요청',body:`${name}님이 ${when} 수업을 요청했어요. 앱에서 승인해 주세요.`,tag:'ptreq-'+who.mid+'-'+at,url:PT_URL});return J({ok:true,sent:n})}
    if(!okG(b.mid))return J({error:'mid'},400);
    const T={booked:['PT 수업 예약 완료',`${when} PT 수업이 예약됐어요. 수업 전에 한 번 더 알려 드릴게요 🥊`],canceled:['PT 수업 취소',`${when} PT 수업이 취소됐어요.`],rejected:['PT 예약 요청 안내',`${when} 예약 요청은 어려워요. 앱에서 다른 시간을 골라 주세요.`],moved:['PT 수업 시간 변경',`PT 수업이 ${when}(으)로 바뀌었어요.`]}[b.kind];
    if(!T)return J({error:'kind'},400);
    const n=await ptSendTo(env,g,S,(S.m||{})[b.mid]||[],{title:T[0],body:T[1],tag:'ptev-'+b.mid+'-'+at,url:PT_URL});return J({ok:true,sent:n})}
  return J({error:'not found'},404)}
async function ptCron(env){const now=Date.now();const gl=(await env.SUBS.get('ptg',{type:'json'}))||[];let total=0;
  for(const g of gl){const Q=await env.SUBS.get(ptKQ(g),{type:'json'});if(!Q||!Q.items||!Q.items.length||!Q.al||!Q.al.length)continue;let S=null;
    for(const it of Q.items){if(it.at<=now)continue;for(const a of Q.al){const fire=it.at-a.ms;if(now<fire||now-fire>40*6e4)continue;
      const dk=`ptx:${g}:${it.sid}:${it.at}:${a.k}`;if(await env.SUBS.get(dk))continue;await env.SUBS.put(dk,'1',{expirationTtl:15*86400});
      if(!S)S=await ptSubs(env,g);const left=ptLeft(it.at-now),when=ptWhen(it.at);
      total+=await ptSendTo(env,g,S,(S.m||{})[it.mid]||[],{title:'PT 수업 알림',body:`${it.name?it.name+'님, ':''}${left} ${when} PT 수업이 있어요 🥊`,tag:'ptal-'+it.sid,url:PT_URL});
      if(Q.me!==false)total+=await ptSendTo(env,g,S,S.c||[],{title:'PT 수업 알림 (관장)',body:`${it.name||'회원'}님 수업 ${left} · ${when}`,tag:'ptalc-'+it.sid,url:PT_URL})}}}
  return total}

const subKey=(id,ep)=>'sub:'+id+':'+ep.slice(-40).replace(/[^A-Za-z0-9_-]/g,'');

export default {async fetch(req,env){
  const o=req.headers.get('Origin')||'';const cors={'Access-Control-Allow-Origin':ORIGINS.includes(o)?o:ORIGINS[0],'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
  const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,'Content-Type':'application/json'}});
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  const p=new URL(req.url).pathname;
  try{
    if(p==='/vapid')return J({key:(await vapid(env)).pub});
    if(p==='/'||p==='/ping')return J({ok:true,name:'NNN WORLD 출석 · PT 수업 알림 서버',pt:true});
    if(req.method!=='POST')return J({error:'method'},405);
    const b=await req.json();
    if(p.startsWith('/pt/')){if(!b||!b.token)return J({error:'bad'},400);return await ptRoute(p,b,env,J)}
    if(!okId(b.id)||!b.token)return J({error:'bad'},400);
    if(p==='/sub'){const s=b.sub;if(!s||!/^https:\/\//.test(s.endpoint||'')||!s.keys||!s.keys.p256dh||!s.keys.auth)return J({error:'sub'},400);
      const r=await fbGet(`gym/private/${b.id}`,b.token,1);if(!r.ok||r.v==null)return J({error:'auth'},403);
      await env.SUBS.put(subKey(b.id,s.endpoint),JSON.stringify({endpoint:s.endpoint,keys:{p256dh:s.keys.p256dh,auth:s.keys.auth},at:Date.now()}));return J({ok:true})}
    if(p==='/unsub'){const r=await fbGet(`gym/private/${b.id}`,b.token,1);if(!r.ok||r.v==null)return J({error:'auth'},403);
      if(b.endpoint)await env.SUBS.delete(subKey(b.id,b.endpoint));return J({ok:true})}
    if(p==='/notify'){const T=kstDay();
      const a=await fbGet(`gym/members/${b.id}`,b.token);if(!a.ok||!a.v)return J({error:'auth'},403);
      const m=a.v;const att=Array.isArray(m.attend)?m.attend:Object.values(m.attend||{});
      if(!att.includes(T)&&!b.test)return J({error:'not attended'},409);
      const dk=(b.test?'test:':'sent:')+b.id+':'+T;if(await env.SUBS.get(dk))return J({ok:true,dup:true});
      await env.SUBS.put(dk,'1',{expirationTtl:b.test?120:172800});
      const tm=(m.attT&&m.attT[T])||'';const who=(m.name||'')+(m.student?' 학생':' 님');
      const msg={title:b.test?'[시험] NNN 출석 알림':'NNN 출석 알림',body:`${who}이 ${tm?tm+'에 ':''}탕정 엔엔엔복싱에 출석했어요 🥊`,tag:'att-'+b.id,url:SUBJECT};
      if(b.test){const r=await fbGet(`gym/private/${b.id}`,b.token,1);if(!r.ok||r.v==null)return J({error:'auth'},403)}
      const list=await env.SUBS.list({prefix:'sub:'+b.id+':'});let sent=0,gone=0;
      for(const k of list.keys){const s=await env.SUBS.get(k.name,{type:'json'});if(!s)continue;
        try{const r=await sendPush(env,s,msg);if(r.status===404||r.status===410){await env.SUBS.delete(k.name);gone++}else if(r.ok)sent++}catch(e){}}
      return J({ok:true,sent,gone})}
    return J({error:'not found'},404)
  }catch(e){return J({error:String(e&&e.message||e)},500)}
},
async scheduled(ev,env,ctx){ctx.waitUntil(ptCron(env).catch(()=>{}))}};
