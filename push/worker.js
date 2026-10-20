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
const subKey=(id,ep)=>'sub:'+id+':'+ep.slice(-40).replace(/[^A-Za-z0-9_-]/g,'');

export default {async fetch(req,env){
  const o=req.headers.get('Origin')||'';const cors={'Access-Control-Allow-Origin':ORIGINS.includes(o)?o:ORIGINS[0],'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
  const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,'Content-Type':'application/json'}});
  if(req.method==='OPTIONS')return new Response(null,{headers:cors});
  const p=new URL(req.url).pathname;
  try{
    if(p==='/vapid')return J({key:(await vapid(env)).pub});
    if(p==='/'||p==='/ping')return J({ok:true,name:'NNN WORLD 출석 알림 서버'});
    if(req.method!=='POST')return J({error:'method'},405);
    const b=await req.json();if(!okId(b.id)||!b.token)return J({error:'bad'},400);
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
}};
