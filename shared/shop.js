/* NNN 월드 꾸미기 상점: 어느 게임 안에서든 열 수 있는 상점 (Avatar, World 필요) */
(function(){
const CSS=`
.ns{font-family:'Gowun Dodum','Apple SD Gothic Neo',sans-serif;color:#24363B}
.ns-top{display:flex;align-items:center;gap:12px;position:sticky;top:-2px;z-index:2;background:inherit;padding:2px 0 8px}
.ns-av{width:120px;height:100px;background:#EAF6FB;border-radius:18px;border:2px solid rgba(36,54,59,.16);flex:none}
.ns-name{font-family:'Jua',sans-serif;font-size:21px;line-height:1.1;overflow-wrap:anywhere}
.ns-coin{display:inline-flex;align-items:center;gap:6px;background:#FFF4C4;border:2px solid #24363B;border-radius:999px;padding:3px 12px 2px;font-family:'Jua',sans-serif;font-size:17px;margin-top:6px}
.ns-coin i{width:16px;height:16px;border-radius:50%;background:#FFD23F;border:2px solid #B8860B;display:inline-block;box-sizing:border-box}
.ns-tip{margin:6px 0 0;font-size:12.5px;color:#5F776D;line-height:1.4}
.ns-tabs{display:flex;gap:6px;overflow-x:auto;margin:4px -4px 10px;padding:0 4px 4px;scrollbar-width:none}
.ns-tabs::-webkit-scrollbar{display:none}
.ns-tabs button{flex:none;height:38px;padding:0 13px;border-radius:12px;border:2.5px solid #24363B;background:#fff;font-family:'Jua',sans-serif;font-size:15px;color:#24363B;cursor:pointer}
.ns-tabs button.on{background:#24363B;color:#fff}
.ns-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(94px,1fr));gap:8px}
.ns-it{position:relative;background:#fff;border:2.5px solid rgba(36,54,59,.16);border-radius:16px;padding:4px 3px 8px;display:flex;flex-direction:column;align-items:center;cursor:pointer;font-family:'Jua',sans-serif;font-size:13.5px;color:#24363B;gap:2px;text-align:center;line-height:1.2}
.ns-it canvas{width:80px;height:66px}
.ns-it.on{border-color:#E2557A;background:#FFF0F4}
.ns-it.wear::after{content:'입는 중';position:absolute;top:4px;left:4px;font-size:10.5px;background:#3E8E5E;color:#fff;border-radius:999px;padding:2px 6px}
.ns-it .pr{font-size:12px;color:#5F776D}.ns-it .pr.own{color:#3E8E5E}.ns-it .pr.lock{color:#B93A5E}
.ns-it.dim{opacity:.45}
.ns-bar{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;position:sticky;bottom:-2px;background:inherit;padding:8px 0 4px}
.ns-what{flex:1;min-width:120px;font-family:'Jua',sans-serif;font-size:16px}
.ns-b{display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 16px;border-radius:14px;border:2.5px solid #24363B;background:#3E8E5E;color:#fff;font-family:'Jua',sans-serif;font-size:17px;box-shadow:0 4px 0 #1F4D36;cursor:pointer}
.ns-b.soft{background:#fff;color:#24363B;box-shadow:0 3px 0 rgba(36,54,59,.3);height:38px;font-size:14px;padding:0 12px}
.ns-b:disabled{opacity:.5}
.ns-msg{min-height:18px;color:#B93A5E;font-family:'Jua',sans-serif;font-size:15px;margin-top:4px}
.ns-earn{margin-top:10px;background:#F1FAF3;border-radius:14px;padding:9px 11px;font-size:12.5px;line-height:1.7;color:#1F4D36}`;
function inject(){if(document.getElementById('ns-css'))return;const st=document.createElement('style');st.id='ns-css';st.textContent=CSS;document.head.appendChild(st)}
const clone=o=>JSON.parse(JSON.stringify(o||{}));
const ACCT=[['head','모자·머리'],['eyes','얼굴'],['neck','목걸이'],['back','등·날개'],['costume','분장']];
const TABS0=[['base','캐릭터'],['fur','털색'],['pat','무늬'],['eye','눈'],...ACCT];
const isAccTab=t=>ACCT.some(a=>a[0]===t);
function list(tab){
  if(tab==='base')return Object.entries(Avatar.BASES).map(([k,v])=>({id:'base:'+k,v:k,name:v[0],price:v[1]}));
  if(tab==='fur')return Object.entries(Avatar.FURS).map(([k,v])=>({id:'fur:'+k,v:k,name:v[0],price:v[2]}));
  if(tab==='pat')return Object.entries(Avatar.PATS).map(([k,v])=>({id:'pat:'+k,v:k,name:v[0],price:v[1]}));
  if(tab==='eye')return Object.entries(Avatar.EYES).map(([k,v])=>({id:'eye:'+k,v:k,name:v[0],price:v[2]}));
  return Object.entries(Avatar.ACCS).filter(([k,v])=>tab==='acc'||v[1]===tab).map(([k,v])=>({id:'acc:'+k,v:k,name:v[0],price:v[2],slot:v[1]})).sort((a,b)=>a.price-b.price);
}
/* mount(root,{me:{nick,av,owned,credits},admin,onChange(me,av),toast}) */
function mount(root,o){
  inject();
  const ADMIN=!!o.admin,toast=o.toast||(()=>{});
  let ME=clone(o.me);ME.owned=ME.owned||{};
  const fix=av=>{av=Object.assign({base:'cat',fur:'cream',pat:'none',eye:'black',acc:{}},clone(av));av.acc=av.acc||{};if(ADMIN)av.base='mingnyu';else if(av.base==='mingnyu')av.base='cat';return av};
  let AV=fix(ME.av),TRY=null,SEL=null,TAB=o.tab||(ADMIN?'head':'base');
  const tabs=ADMIN?ACCT:TABS0;
  root.innerHTML=`<div class="ns"><div class="ns-top"><canvas class="ns-av" width="240" height="200" aria-label="내 캐릭터"></canvas><div style="min-width:0"><div class="ns-name"></div><div class="ns-coin" title="크레딧"><i></i><span class="ns-cr"></span></div><p class="ns-tip">눌러 보면 먼저 입어 봐요. 마음에 들면 사서 입어요.</p></div></div>
   <div class="ns-tabs"></div><div class="ns-items"></div>
   <div class="ns-bar"><div class="ns-what"></div><button class="ns-b soft ns-undo" hidden>원래대로</button><button class="ns-b ns-buy" hidden>입기</button></div>
   <div class="ns-msg" role="status"></div>
   <div class="ns-earn"><b>크레딧 모으는 법</b><br>할 일 끝내기 +3 · 새 동물 친구 +5 · 마당 잔치 +5 · 이웃 부탁 +2 · 숨바꼭질 +3 · 도장 +1 · 3단지 고양이 밥 +1 · 3분 놀 때마다 +1</div></div>`;
  const q=s=>root.querySelector(s);
  q('.ns-name').textContent=(ME.nick||'')+(ADMIN?' (숲지기)':'');
  const cv=q('.ns-av'),g=cv.getContext('2d');
  (function loop(ts){if(!root.isConnected||!root.contains(cv))return;const t=ts/1000;g.clearRect(0,0,240,200);g.save();g.translate(120,186);g.scale(2,2);Avatar.draw(g,0,0,t,1,false,0,TRY||AV,{portrait:true});g.restore();requestAnimationFrame(loop)})(0);
  const credits=()=>{q('.ns-cr').textContent=(ME.credits||0).toLocaleString('ko-KR')};
  const applied=(av,it)=>{av=fix(av);const[k]=it.id.split(':');if(ADMIN&&k!=='acc')return av;
    if(k==='base')av.base=it.v;else if(k==='acc'){if(av.acc[it.slot]===it.v)delete av.acc[it.slot];else av.acc[it.slot]=it.v}
    else{av[k]=it.v;av.base='cat'}return av};
  const isOwned=it=>{if(it.id.startsWith('base:')&&ADMIN)return it.id==='base:mingnyu';if(it.id==='base:mingnyu')return false;return it.price===0||!!ME.owned[it.id]};
  const isWorn=it=>{const[k]=it.id.split(':');if(k==='base')return AV.base===it.v;if(k==='acc')return AV.acc[it.slot]===it.v;return AV.base==='cat'&&AV[k]===it.v};
  function renderTabs(){q('.ns-tabs').innerHTML=tabs.map(([k,n])=>`<button data-t="${k}" class="${k===TAB?'on':''}">${n}</button>`).join('')}
  function renderItems(){
    const L=list(TAB);
    q('.ns-items').innerHTML=L.map(it=>{const own=isOwned(it),lock=it.id==='base:mingnyu'&&!own;
      const pr=lock?'<span class="pr lock">숲지기 전용</span>':own?'<span class="pr own">가지고 있어요</span>':`<span class="pr">${it.price} 크레딧</span>`;
      return `<button class="ns-it${SEL&&SEL.id===it.id?' on':''}${isWorn(it)?' wear':''}${lock?' dim':''}" data-id="${it.id}"><canvas width="160" height="132"></canvas>${it.name}${pr}</button>`}).join('');
    [...q('.ns-items').children].forEach((b,i)=>{const it=L[i],c=b.querySelector('canvas').getContext('2d');let av;
      if(isAccTab(TAB))av={base:'cat',fur:'cream',pat:'none',eye:'black',acc:{[it.slot]:it.v}};else{av=applied(AV,it);if(TAB!=='base')av.acc={}}
      c.save();c.translate(82,TAB==='back'?130:isAccTab(TAB)?120:116);const z=it.v==='kid'?1.9:TAB==='back'?1.02:1.48;c.scale(z,z);Avatar.draw(c,0,0,0.3,1,false,0,av,{portrait:true});c.restore()});
    bar();credits();
  }
  function bar(){const b=q('.ns-buy');q('.ns-undo').hidden=!TRY;
    if(!SEL){q('.ns-what').textContent=ADMIN?'숲지기는 언제나 밍뉴예요. 꾸미기만 바꿀 수 있어요.':TAB==='fur'||TAB==='pat'||TAB==='eye'?'털색, 무늬, 눈은 냥이 캐릭터만 바꿀 수 있어요.':'';b.hidden=true;return}
    const own=isOwned(SEL);q('.ns-what').textContent=SEL.name;b.hidden=false;
    if(SEL.id==='base:mingnyu'&&!own){b.disabled=true;b.textContent='숲지기만 쓸 수 있어요';return}
    b.disabled=false;b.textContent=own?(TRY?'이걸로 입기':'입는 중'):`${SEL.price} 크레딧으로 사기`;if(own&&!TRY)b.disabled=true}
  q('.ns-tabs').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;TAB=b.dataset.t;SEL=null;TRY=null;renderTabs();renderItems()};
  q('.ns-items').onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;const it=list(TAB).find(x=>x.id===b.dataset.id);SEL=it;
    const nx=applied(TRY||AV,it);TRY=JSON.stringify(nx)===JSON.stringify(AV)?null:nx;q('.ns-msg').textContent='';renderItems()};
  q('.ns-undo').onclick=()=>{TRY=null;SEL=null;renderItems()};
  q('.ns-buy').onclick=async()=>{if(!SEL)return;const b=q('.ns-buy');b.disabled=true;q('.ns-msg').textContent='';
    try{
      if(!isOwned(SEL)){const p=await World.buy(SEL.id,SEL.price);if(p){ME.credits=p.credits;ME.owned=p.owned||ME.owned}toast(`<b>${SEL.name}</b>을(를) 샀어요!`)}
      const want=TRY||applied(AV,SEL);
      const all=[...list('base'),...list('fur'),...list('pat'),...list('eye'),...list('acc')];
      const ok=k=>{const it=all.find(x=>x.id===k);return !it||isOwned(it)};
      if(!ok('base:'+want.base))want.base=AV.base;['fur','pat','eye'].forEach(k=>{if(!ok(k+':'+want[k]))want[k]=AV[k]});
      Object.keys(want.acc).forEach(sl=>{if(!ok('acc:'+want.acc[sl]))delete want.acc[sl]});
      await World.saveAvatar(want);AV=fix(want);TRY=null;ME.av=AV;renderItems();toast('새 모습으로 바꿨어요');
      if(o.onChange)o.onChange(clone(ME),clone(AV))}
    catch(err){q('.ns-msg').textContent=(err&&err.msg)||'인터넷 연결을 확인해 주세요.'}
    finally{bar()}};
  renderTabs();renderItems();
  return{setCredits(n){ME.credits=n;credits()}};
}
window.Shop={mount};
})();
