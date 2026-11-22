/* 공통 앱 셸 — window.APP_CONFIG 를 읽어 홈·상세·카메라·리뷰 화면을 만든다. */
(function(){
const C=window.APP_CONFIG,PC=window.PhotoCore,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
Object.entries(C.theme||{}).forEach(([k,v])=>document.documentElement.style.setProperty('--'+k,v));

/* ---------- 아이콘 ---------- */
const P={
 back:'<path d="M15 5l-7 7 7 7"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',
 camera:'<path d="M4 8.5A2.5 2.5 0 016.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5z"/><circle cx="12" cy="12.5" r="3.6"/>',
 flip:'<path d="M4 12a8 8 0 0113.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 01-13.7 5.6L4 15.5M4 20v-4.5h4.5"/>',
 image:'<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20 16l-5-5-8.5 8.5"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.4a4.3 4.3 0 017.5 2.4C19.5 15.4 12 20 12 20z"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
 spark:'<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9zM18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
 bolt:'<path d="M13 3L5.5 13.5H12l-1 7.5L18.5 10.5H12z"/>',
 swap:'<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
 level:'<path d="M3 12h4M17 12h4"/><circle cx="12" cy="12" r="4.5"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
 share:'<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 13.5V18a2 2 0 002 2h10a2 2 0 002-2v-4.5"/>',
 timer:'<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>',
 chev:'<path d="M7 10l5 5 5-5"/>',next:'<path d="M9 5l7 7-7 7"/>',
 grid:'<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
 user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>',
 users:'<circle cx="9" cy="9" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M3.5 19.5a5.5 5.5 0 0111 0M14.5 14.2a4.6 4.6 0 016 4.3"/>',
 plane:'<path d="M10.5 13.5L4 11l1.5-1.5 7 1L17 6a1.8 1.8 0 012.5 2.5l-4.5 4.5 1 7L14.5 21.5 12 15l-3 3v2.5L7.5 22 6 18l-4-1.5L3.5 15H6z"/>',
 film:'<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M7.5 4v16M16.5 4v16M3.5 8.5h4M3.5 15.5h4M16.5 8.5h4M16.5 15.5h4"/>',
 aperture:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5l4 7M20.3 10.5H12.5M16.5 19l-4-7M7.5 19l4-7M3.7 13.5h7.8M7.5 5l4 7"/>',
 city:'<path d="M3 20.5h18M5 20.5V9l5-3v14.5M10 9.5h4.5V20.5M14.5 12H19v8.5M7.5 11v.1M7.5 14v.1M7.5 17v.1M12.3 13v.1M12.3 16v.1"/>',
 mountain:'<path d="M2.5 19.5L9 9l4 6 2.5-3.5 6 8z"/><circle cx="17" cy="6" r="1.8"/>',
 cup:'<path d="M5 8h11v6a5 5 0 01-5 5h-1a5 5 0 01-5-5zM16 10h1.5a2.5 2.5 0 010 5H16M8 3.5v2M11 3.5v2"/>',
 compass:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" opacity=".45"/><circle cx="14.7" cy="9.3" r="1.6"/>',
 book:'<path d="M5 4.5h6a2 2 0 012 2V20a2 2 0 00-2-2H5zM19 4.5h-4a2 2 0 00-2 2V20a2 2 0 012-2h4z"/>',
 check:'<path d="M4.5 12.5l5 5 10-11"/>',list:'<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5v.1M4.5 12v.1M4.5 17.5v.1"/>',
 chat:'<path d="M5 18.5V7a2.5 2.5 0 012.5-2.5h9A2.5 2.5 0 0119 7v6.5a2.5 2.5 0 01-2.5 2.5H9z"/>',
 phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
 download:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
 pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 cafe:'<path d="M5 8h11v6a5 5 0 01-5 5h-1a5 5 0 01-5-5zM16 10h1.5a2.5 2.5 0 010 5H16"/>',
 shirt:'<path d="M8.5 4L4 6.5 5.5 10 7.5 9v11h9V9l2 1L20 6.5 15.5 4a3.5 3.5 0 01-7 0z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
 flower:'<circle cx="12" cy="10" r="2.2"/><path d="M12 7.8a2.8 2.8 0 110-.1M14.2 10a2.8 2.8 0 11.1 0M12 12.2a2.8 2.8 0 110 .1M9.8 10a2.8 2.8 0 11-.1 0M12 12.5V21M12 17c-2-2-4-2-5.5-1.5M12 18.5c2-2 4-2 5.5-1.5"/>',
 fork:'<path d="M7 3.5V10a2 2 0 004 0V3.5M9 12v8.5M16 20.5V3.5c-2 1-3 3.5-3 7h3"/>',
 moon:'<path d="M19 14.5A7.5 7.5 0 019.5 5a7.5 7.5 0 109.5 9.5z"/>',
 couple:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20a5.5 5.5 0 0111 0M10.5 20a5.5 5.5 0 0111 0"/>',
 glove:'<path d="M7 10V7a5 5 0 0110 0v5a6 6 0 01-6 6H9.5A3.5 3.5 0 016 14.5V12a2 2 0 012-2h3"/><path d="M8 18v2.5h8V17"/>',
};
const I=(n,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||''}</svg>`;
const CATI={basic:'compass',portrait:'user',people:'user',couple:'couple',travel:'plane',film:'film',master:'aperture',street:'city',land:'mountain',food:'fork'};

/* ---------- 저장 ---------- */
const LS={get(k,d){try{return JSON.parse(localStorage.getItem(C.id+':'+k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(C.id+':'+k,JSON.stringify(v))}catch(e){}}};
let favs=new Set(LS.get('fav',[]));const saveFav=()=>LS.set('fav',[...favs]);

/* ---------- 항목 ---------- */
const ITEMS=PC.items.filter(it=>C.filter?C.filter(it):true),BY=PC.byId;
const CATS=(C.cats||Object.keys(PC.cats)).filter(k=>ITEMS.some(i=>i.cat===k));

/* ---------- 썸네일 캐시 ---------- */
const TH=new Map();
function thumbURL(id,plain){const k=id+(plain?'|p':'');if(TH.has(k))return TH.get(k);const c=document.createElement('canvas');c.width=300;c.height=400;PC.drawThumb(id,c.getContext('2d'),300,400,{guide:!plain});const u=c.toDataURL('image/jpeg',.84);TH.set(k,u);return u}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);requestAnimationFrame(()=>{el.src=thumbURL(el.dataset.id,el.dataset.plain)})}),{rootMargin:'300px'});

/* ---------- 레이아웃 ---------- */
document.body.insertAdjacentHTML('beforeend',`
<main id="home">
 <header class="top"><div class="brand">${C.logo}<span>${C.name}</span></div><div class="acts"><button class="ibtn" id="hFav" aria-label="즐겨찾기">${I('heart')}<span class="dot hidden"></span></button><button class="ibtn" id="hHelp" aria-label="사용법">${I('info')}</button></div></header>
 ${C.catGrid?`<section class="cgrid-w"><h2 class="sec">${C.catGrid.title||'무엇을 찍나요?'}</h2><p class="secsub">${C.catGrid.sub||''}</p><div class="cgrid" id="cgrid"></div></section>`:''}
 <section class="hero"><canvas id="heroCv" width="600" height="780"></canvas><div class="vf"><i></i><i></i><i></i><i></i><b></b></div>
  <div class="in"><div class="sample" id="heroTag"></div><h1>${C.heroTitle}</h1><p>${C.heroSub}</p><div class="btns"><button class="btn pri" id="goCam">${I('camera')}${C.heroCTA||'카메라 켜기'}</button>${C.photoAnalyze!==false?`<button class="btn glass" id="goPhoto">${I('image')}사진 분석</button>`:''}</div></div></section>
 ${C.scenarios?`<h2 class="sec">${C.scenarioTitle||'어디서 찍어요?'}</h2><p class="secsub">${C.scenarioSub||''}</p><div class="strip" id="places"></div>`:''}
 ${C.extras?`<div class="extras" id="extras"></div>`:''}
 <h2 class="sec">${C.galleryTitle||'구도 갤러리'}</h2><p class="secsub" id="gSub"></p>
 <label class="search">${I('search')}<input id="q" type="search" placeholder="${C.searchPH||'노을, 카페, 커플, 전신…'}" autocomplete="off"></label>
 <nav class="tabs" id="tabs"></nav>
 <div class="grid" id="grid"></div>
 <p class="foot">${C.foot||'샘플 그림은 각 촬영 기법을 설명하려고 직접 그린 일러스트예요.'}</p>
</main>
${C.dock?`<div class="dock" id="dock"><button class="btn pri" id="dCam">${I('camera')}${C.heroCTA||'카메라 켜기'}</button>${C.photoAnalyze!==false?`<button class="btn glass" id="dPhoto" aria-label="사진 분석">${I('image')}</button>`:''}</div>`:''}
<section id="cam" class="hidden" aria-label="촬영">
 <div class="ctop"><button class="cbtn" id="cBack" aria-label="홈으로">${I('back')}</button><button class="gpick" id="cPick"><em id="cAuto" class="hidden">자동</em><span id="cName"></span>${I('chev')}</button><button class="cbtn" id="cAspect">3:4</button><button class="cbtn" id="cInfo" aria-label="촬영 방법">${I('info')}</button></div>
 <div class="stage" id="stage"><div class="view" id="view"><video id="vid" playsinline muted autoplay></video><img class="still" id="still" alt=""><canvas id="ov"></canvas>
  <div class="hint" id="hint"></div><div class="badges"><span class="badge" id="bPhone"></span><span class="badge hidden" id="bLevel"></span></div><div class="zoom hidden" id="zoom"></div>
  <div class="count hidden" id="count"></div><div class="flash" id="flash"></div>
  <div class="msg" id="msg">${I('camera')}<p id="msgT">카메라를 켜는 중…</p><button class="btn pri" id="mRetry">카메라 다시 켜기</button><button class="btn glass" id="mPhoto">${I('image')}찍어둔 사진으로 연습</button></div></div></div>
 <div class="say-cam hidden" id="sayCam"><div class="tx"><small>이렇게 말해보세요</small><b id="sayT"></b></div><button id="sayN" aria-label="다른 멘트">${I('next')}</button></div>
 <div class="cstrip" id="cstrip"></div>
 <div class="toggles" id="toggles"></div>
 <div class="ctrl"><button class="last" id="cLast" aria-label="찍은 사진">${I('image')}</button><button class="shot" id="shutter" aria-label="촬영"><i></i><span id="shotN"></span></button><button class="round" id="cFlip" aria-label="카메라 전환">${I('flip')}</button></div>
</section>
<div class="scrim" id="scrim"></div>
<section class="sheet" id="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="sh"><h3 id="shT"></h3><button class="xbtn" id="shX" aria-label="닫기">${I('close')}</button></div><div class="sb" id="shB"></div><div class="sf hidden" id="shF"></div></section>
<div class="toast" id="toast"></div>
<input type="file" id="file" accept="image/*" hidden>`);

const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1900)};

/* ---------- 홈: 히어로 ---------- */
(function hero(){const ids=(C.heroIds||['st_back_walk']).filter(i=>BY[i]),id=ids[Math.floor(Math.random()*ids.length)];const cv=$('#heroCv'),c=cv.getContext('2d');
  c.scale(2,1.95);PC.drawThumb(id,c,300,400,{guide:false});$('#heroTag').textContent='예시 · '+BY[id].name})();
$('#goCam').onclick=()=>openCam(C.startPool?C.startPool():null);
$('#dCam')&&($('#dCam').onclick=()=>openCam(C.startPool?C.startPool():null));
$('#dPhoto')&&($('#dPhoto').onclick=()=>openCam(C.startPool?C.startPool():null,{photo:1}));
$('#goPhoto')&&($('#goPhoto').onclick=()=>{openCam(C.startPool?C.startPool():null,{photo:1})});
$('#hHelp').onclick=()=>openSheet(C.helpTitle||'사용법',`<div class="dt-desc">${C.help}</div>`);

/* ---------- 홈: 장소·추가 메뉴 ---------- */
if(C.scenarios){const cover=s=>s.cover||s.g.find(i=>i.startsWith('st_')&&BY[i])||s.g[0];
  $('#places').innerHTML=C.scenarios.map(s=>`<button class="place" data-sc="${s.id}"><img data-id="${cover(s)}" data-plain="1" alt=""><span class="pi">${I(s.icon)}</span><span class="pn">구도 ${s.g.filter(i=>BY[i]).length}</span><span class="pt"><b>${s.name}</b><small>${s.sub}</small></span></button>`).join('');
  $$('#places img[data-id]').forEach(i=>io.observe(i));
  $('#places').onclick=e=>{const b=e.target.closest('[data-sc]');if(!b)return;const s=C.scenarios.find(x=>x.id===b.dataset.sc);openCam({ids:s.g,title:s.name,ments:s.m,tips:s.t,face:s.face,auto:s.auto})}}
function paintExtras(){if(!C.extras)return;C.extras.forEach((x,i)=>{const el=document.querySelector(`#extras [data-art="${i}"]`);if(el&&x.art)x.art(el,{I,thumbURL})})}
if(C.extras){$('#extras').innerHTML=C.extras.map((x,i)=>`<button class="extra${x.tint?' tint':''}" data-x="${i}"><span class="tx">${I(x.icon)}<b>${x.title}</b><small>${x.sub}</small><span class="go">${x.cta||'보기'}${I('next')}</span></span>${x.art?`<span class="art" data-art="${i}"></span>`:''}</button>`).join('');
  paintExtras();$('#extras').onclick=e=>{const b=e.target.closest('[data-x]');if(b)C.extras[+b.dataset.x].open({openSheet,I,refresh:paintExtras})}}
/* ---------- 홈: 갤러리 ---------- */
let cat=LS.get('cat','all'),q='';
function list(){let L=ITEMS;if(cat==='fav')L=L.filter(i=>favs.has(i.id));else if(cat!=='all')L=L.filter(i=>i.cat===cat);
  if(q){const k=q.toLowerCase();L=L.filter(i=>(i.name+' '+(i.who||'')+' '+(i.desc||'')+' '+(PC.cats[i.cat]||'')).toLowerCase().includes(k))}return L}
function renderTabs(){const t=[['all','전체',ITEMS.length],['fav','즐겨찾기',ITEMS.filter(i=>favs.has(i.id)).length],...CATS.map(k=>[k,PC.cats[k],ITEMS.filter(i=>i.cat===k).length])];
  $('#tabs').innerHTML=t.map(([k,n,c])=>`<button class="tab${cat===k?' on':''}" data-c="${k}">${k==='fav'?I('heart'):CATI[k]?I(CATI[k]):''}${n}<small>${c}</small></button>`).join('');
  $('#hFav .dot').classList.toggle('hidden',!favs.size)}
function card(it){return`<button class="card" data-id="${it.id}"><div class="ph"><img data-id="${it.id}" alt=""><span class="fav${favs.has(it.id)?' on':''}" data-f="${it.id}" role="button" aria-label="즐겨찾기">${I('heart',favs.has(it.id)?'fill':'')}</span></div><b>${it.name}</b><small>${it.who||''}</small></button>`}
function renderGrid(){const L=list();$('#gSub').textContent=`${ITEMS.length}가지 구도 · 그림을 누르면 찍는 방법이 나와요`;
  $('#grid').innerHTML=L.length?L.map(card).join(''):`<div class="empty">${cat==='fav'?'아직 즐겨찾기가 없어요.<br>마음에 드는 구도의 ♡를 눌러 모아두세요.':'찾는 구도가 없어요. 다른 단어로 찾아보세요.'}</div>`;
  $$('#grid img[data-id]').forEach(i=>io.observe(i))}
$('#tabs').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;cat=b.dataset.c;LS.set('cat',cat);renderTabs();renderGrid();b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};
$('#q').oninput=e=>{q=e.target.value.trim();if(q&&cat!=='all'){cat='all';renderTabs()}renderGrid()};
if(C.catGrid){const cov=k=>{const pre=(C.catGrid.covers||{})[k];return pre&&BY[pre]?pre:ITEMS.find(i=>i.cat===k).id};
  $('#cgrid').innerHTML=CATS.map(k=>`<button class="ct" data-c="${k}"><span class="cti"><img data-id="${cov(k)}" data-plain="1" alt=""><i>${I(CATI[k]||'grid')}</i></span><b>${PC.cats[k]}</b><small>${ITEMS.filter(i=>i.cat===k).length}</small></button>`).join('');
  $$('#cgrid img[data-id]').forEach(i=>io.observe(i));
  $('#cgrid').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;cat=b.dataset.c;LS.set('cat',cat);q='';$('#q').value='';renderTabs();renderGrid();
    const t=$('#gSub').previousElementSibling;window.scrollTo({top:t.getBoundingClientRect().top+scrollY-8,behavior:'smooth'});setTimeout(()=>{const on=$('#tabs .on');on&&on.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})},450)}}
$('#hFav').onclick=()=>{cat='fav';renderTabs();renderGrid();$('#tabs').scrollIntoView({behavior:'smooth'})};
function toggleFav(id){favs.has(id)?favs.delete(id):favs.add(id);saveFav();$$(`[data-f="${id}"]`).forEach(f=>{f.classList.toggle('on',favs.has(id));f.innerHTML=I('heart',favs.has(id)?'fill':'')});renderTabs();if(cat==='fav')renderGrid();toast(favs.has(id)?'즐겨찾기에 담았어요':'즐겨찾기에서 뺐어요')}
$('#grid').onclick=e=>{const f=e.target.closest('[data-f]');if(f){e.stopPropagation();toggleFav(f.dataset.f);return}const b=e.target.closest('[data-id]');if(b)openDetail(b.dataset.id,{from:'home'})};
renderTabs();renderGrid();

/* ---------- 시트 ---------- */
let sheetOnClose=null;
function openSheet(title,body,foot,o={}){$('#shT').textContent=title;$('#shB').innerHTML=body;$('#shB').scrollTop=0;const f=$('#shF');f.classList.toggle('hidden',!foot);f.innerHTML=foot||'';
  $('#sheet').classList.toggle('dark',!!o.dark);$('#sheet').classList.add('on');$('#scrim').classList.add('on');sheetOnClose=o.onClose||null;if(!(history.state&&history.state.m))history.pushState(Object.assign({},history.state,{m:1}),'')}
function hideSheet(){$('#sheet').classList.remove('on');$('#scrim').classList.remove('on');const f=sheetOnClose;sheetOnClose=null;f&&f()}
function closeSheet(){if(history.state&&history.state.m)history.back();else hideSheet()}
$('#shX').onclick=closeSheet;$('#scrim').onclick=closeSheet;

function openDetail(id,o={}){const it=BY[id];if(!it)return;const steps=it.steps||[],ments=it.ments||[];
  const body=`<div class="dt-ph"><canvas id="dtCv" width="600" height="800"></canvas></div>
   <div class="dt-row"><button class="switch on" id="dtG"><i></i>가이드선</button><button class="favbtn${favs.has(id)?' on':''}" id="dtF" aria-label="즐겨찾기">${I('heart',favs.has(id)?'fill':'')}</button></div>
   <div class="dt-who">${it.who||''}</div><div class="dt-title">${it.name}</div><p class="dt-desc">${it.desc||''}</p>
   <ol class="steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
   <div class="chips"><span class="chip">${I('phone')}${it.phone||'자유'}</span><span class="chip">${I(CATI[it.cat]||'grid')}${PC.cats[it.cat]||''}</span></div>
   ${ments.length&&C.showMents!==false?`<div class="say"><b>이렇게 말해보세요</b>${ments.map(m=>'“'+m+'”').join('<br>')}</div>`:''}`;
  const foot=o.from==='cam'?`<button class="btn pri wide" id="dtGo">${I('camera')}이 구도로 바꾸기</button>`:`<button class="btn pri wide" id="dtGo">${I('camera')}이 구도로 촬영</button>`;
  openSheet(PC.cats[it.cat]||'구도',body,foot,{dark:o.from==='cam'});
  const cv=$('#dtCv'),c=cv.getContext('2d');let g=true;const draw=()=>{c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,300,400);PC.drawThumb(id,c,300,400,{guide:g})};draw();
  $('#dtG').onclick=()=>{g=!g;$('#dtG').classList.toggle('on',g);draw()};
  $('#dtF').onclick=()=>{toggleFav(id);$('#dtF').classList.toggle('on',favs.has(id));$('#dtF').innerHTML=I('heart',favs.has(id)?'fill':'')};
  $('#dtGo').onclick=()=>{if(o.from==='cam'){setActive(id,true);closeSheet()}else{hideSheetSilently();openCam({ids:relatedPool(id),first:id})}}}
function hideSheetSilently(){$('#sheet').classList.remove('on');$('#scrim').classList.remove('on');if(history.state&&history.state.m)history.replaceState(Object.assign({},history.state,{m:0}),'')}
function relatedPool(id){const it=BY[id],same=ITEMS.filter(i=>i.cat===it.cat).map(i=>i.id);return[id,...same.filter(x=>x!==id)]}

/* ---------- 카메라 ---------- */
const vid=$('#vid'),still=$('#still'),ov=$('#ov'),view=$('#view'),stage=$('#stage'),hintEl=$('#hint'),oc=ov.getContext('2d');
const dpr=Math.min(devicePixelRatio||1,2),ASP=[[3,4],[9,16],[1,1]];
const S={mode:'idle',facing:'environment',mirror:false,pSide:'L',pSideManual:false,spiralFlip:{x:false,y:false},spiralManual:false};
let pool=[],active=null,auto=false,autoPool=[],stream=null,feat=null,ema={},cand=null,candN=0,ai=0,stillAR=null,aligned=false,wasAligned=false,level=null,burst=C.burst||1,timer=0,shots=[],ments=[],mi=0,session=null;
function curAR(){if(S.mode==='still'&&stillAR)return stillAR;const a=ASP[ai];return a[0]/a[1]}
function fit(){const r=stage.getBoundingClientRect();if(!r.width)return;const ar=curAR();let w=r.width-20,h=w/ar;if(h>r.height-6){h=r.height-6;w=h*ar}view.style.width=w+'px';view.style.height=h+'px';ov.width=Math.round(w*dpr);ov.height=Math.round(h*dpr)}
addEventListener('resize',fit);

function openCam(sess,o={}){session=sess||{ids:(C.defaultPool||[]).filter(i=>BY[i]),auto:true};pool=session.ids.filter(i=>BY[i]);if(!pool.length)pool=ITEMS.slice(0,12).map(i=>i.id);
  autoPool=(session.auto?pool:[]).filter(i=>BY[i].auto);auto=!!(session.auto&&autoPool.length);active=session.first||pool[0];ments=session.ments||null;mi=0;ema={};feat=null;S.pSideManual=false;S.spiralManual=false;
  S.facing=session.face||'environment';burst=C.burst||1;timer=0;
  $('#home').classList.add('hidden');$('#cam').classList.remove('hidden');if(!(history.state&&history.state.cam))history.pushState({cam:1},'');
  renderStrip();renderToggles();renderActive();fit();if(o.photo){$('#msg').classList.add('on');$('#msgT').textContent='연습할 사진을 골라주세요.';$('#file').click()}else startCam()}
function stopCam(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function goHome(fromPop){if(!fromPop&&history.state&&history.state.cam){history.back();return}hideSheet();stopCam();S.mode='idle';$('#cam').classList.add('hidden');$('#home').classList.remove('hidden')}
$('#cBack').onclick=()=>goHome();
addEventListener('popstate',e=>{const st=e.state||{};if(!st.m&&$('#sheet').classList.contains('on'))hideSheet();if(!st.cam&&!$('#cam').classList.contains('hidden'))goHome(true)});

async function startCam(){$('#msg').classList.remove('on');enableMotion();
  try{stopCam();stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:S.facing},width:{ideal:1920},height:{ideal:1440}}});vid.srcObject=stream;await vid.play();
    S.mode='live';stillAR=null;still.style.display='none';vid.style.display='block';S.mirror=S.facing==='user';vid.classList.toggle('mirror',S.mirror);ema={};fit();setupZoom();renderToggles()}
  catch(e){S.mode='idle';$('#msg').classList.add('on');$('#msgT').innerHTML=/claude\.ai|claudeusercontent/.test(location.hostname)?'Claude 앱 안에서는 카메라를 쓸 수 없어요.<br>사파리·크롬에서 이 앱 주소로 열어주세요.':'카메라 권한이 필요해요.<br>주소창 옆 설정에서 카메라를 허용해 주세요.'}}
function setupZoom(){const z=$('#zoom');z.classList.add('hidden');try{const tr=stream.getVideoTracks()[0],cap=tr.getCapabilities&&tr.getCapabilities();if(!cap||!cap.zoom||S.facing==='user')return;const o=[1,2,3].filter(v=>v>=cap.zoom.min&&v<=cap.zoom.max);if(o.length<2)return;
  z.innerHTML=o.map(v=>`<button data-z="${v}" class="${v===1?'on':''}">${v}x</button>`).join('');z.classList.remove('hidden');z.onclick=async e=>{const b=e.target.closest('[data-z]');if(!b)return;try{await tr.applyConstraints({advanced:[{zoom:+b.dataset.z}]});z.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))}catch(_){}}}catch(e){}}
$('#mRetry').onclick=startCam;$('#mPhoto').onclick=()=>$('#file').click();
$('#cFlip').onclick=()=>{S.facing=S.facing==='environment'?'user':'environment';startCam()};
$('#cAspect').onclick=()=>{ai=(ai+1)%ASP.length;$('#cAspect').textContent=ASP[ai].join(':');if(S.mode!=='still'){fit();ema={}}};
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const url=URL.createObjectURL(f),img=new Image();img.onload=()=>{stopCam();S.mode='still';stillAR=img.naturalWidth/img.naturalHeight;still.src=url;still.style.display='block';vid.style.display='none';$('#msg').classList.remove('on');fit();ema={};
  onFeat(PC.analyze(img,img.naturalWidth,img.naturalHeight,false,curAR()),true);renderToggles()};img.src=url;e.target.value=''};

/* 가이드 띠 */
function renderStrip(){$('#cstrip').innerHTML=pool.map(id=>`<button class="gth${id===active?' on':''}" data-g="${id}"><span class="t"><img data-id="${id}" alt=""></span><span>${BY[id].name}</span></button>`).join('')+`<button class="gth" data-more="1"><span class="t">${I('grid')}</span><span>전체</span></button>`;
  $$('#cstrip img[data-id]').forEach(i=>io.observe(i))}
$('#cstrip').onclick=e=>{if(e.target.closest('[data-more]')){openPicker();return}const b=e.target.closest('[data-g]');if(b)setActive(b.dataset.g,true)};
function setActive(id,manual){if(!BY[id])return;if(!pool.includes(id)){pool.unshift(id);renderStrip()}if(manual&&auto){auto=false;renderToggles()}active=id;$$('#cstrip .gth').forEach(b=>b.classList.toggle('on',b.dataset.g===id));renderActive();
  const el=$(`#cstrip [data-g="${id}"]`);el&&el.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}
function renderActive(){const it=BY[active];$('#cName').textContent=it?it.name:'';$('#cAuto').classList.toggle('hidden',!auto);$('#bPhone').innerHTML=I('phone')+(it&&it.phone||'자유');
  const m=(ments&&ments.length?ments:(it&&it.ments&&it.ments.length?it.ments:(C.defaultMents||[])));$('#sayCam').classList.toggle('hidden',!m.length||C.showMents===false);if(m.length)$('#sayT').textContent='“'+m[mi%m.length]+'”'}
$('#sayN').onclick=()=>{mi++;renderActive()};
$('#cPick').onclick=()=>openPicker();
$('#cInfo').onclick=()=>{const it=BY[active];if(session&&session.tips){openSheet(session.title+' 촬영 팁',`<ol class="steps">${session.tips.map(t=>`<li>${t}</li>`).join('')}</ol>`+(it?`<div class="dt-title" style="font-size:18px;margin-top:20px">${it.name}</div><ol class="steps">${(it.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ol>`:''),'',{dark:true})}else openDetail(active,{from:'cam'})};
function openPicker(){const cats=CATS;let pc=BY[active]?BY[active].cat:cats[0];
  const body=`<div class="ptabs" id="pT"></div><div class="pgrid" id="pG"></div>`;openSheet('구도 고르기',body,'',{dark:true});
  const rt=()=>{$('#pT').innerHTML=[['fav','즐겨찾기'],...cats.map(k=>[k,PC.cats[k]])].map(([k,n])=>`<button class="tab${pc===k?' on':''}" data-c="${k}">${n}</button>`).join('');
    const L=pc==='fav'?ITEMS.filter(i=>favs.has(i.id)):ITEMS.filter(i=>i.cat===pc);$('#pG').innerHTML=L.length?L.map(it=>`<button class="card" data-id="${it.id}"><div class="ph"><img data-id="${it.id}" alt=""></div><b>${it.name}</b></button>`).join(''):'<div class="empty">즐겨찾기한 구도가 없어요.</div>';$$('#pG img[data-id]').forEach(i=>io.observe(i))};
  rt();$('#pT').onclick=e=>{const b=e.target.closest('[data-c]');if(b){pc=b.dataset.c;rt()}};$('#pG').onclick=e=>{const b=e.target.closest('[data-id]');if(b){setActive(b.dataset.id,true);closeSheet()}}}

/* 토글 */
function renderToggles(){const T=[];if(autoPool.length)T.push(`<button class="tg${auto?' on':''}" data-t="auto">${I('spark')}자동 추천</button>`);
  T.push(`<button class="tg${burst>1?' on':''}" data-t="burst">${I('bolt')}${burst>1?'연사 '+burst:'연사'}</button>`,`<button class="tg${timer?' on':''}" data-t="timer">${I('timer')}${timer?timer+'초':'타이머'}</button>`,`<button class="tg" data-t="side">${I('swap')}좌우</button>`,`<button class="tg" data-t="photo">${I('image')}사진 분석</button>`);
  $('#toggles').innerHTML=T.join('')}
$('#toggles').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;
  if(t==='auto'){auto=!auto;if(auto&&feat)rankNow();renderActive();toast(auto?'장면에 맞는 구도를 자동으로 골라요':'자동 추천을 껐어요')}
  if(t==='burst'){burst=burst===1?3:burst===3?6:1;toast(burst>1?`한 번에 ${burst}장 찍어요`:'한 장씩 찍어요')}
  if(t==='timer'){timer=timer===0?3:timer===3?10:0;toast(timer?`${timer}초 뒤에 찍어요`:'타이머를 껐어요')}
  if(t==='side'){const it=BY[active];if(it&&it.kind==='portrait'){S.pSideManual=true;S.pSide=S.pSide==='L'?'R':'L'}else{S.spiralManual=true;if(S.spiralFlip.x===S.spiralFlip.y)S.spiralFlip.x=!S.spiralFlip.x;else S.spiralFlip.y=!S.spiralFlip.y}toast('가이드를 좌우로 뒤집었어요')}
  if(t==='photo')$('#file').click();renderToggles()};

/* 분석·추천 */
function onFeat(f,force){feat=f;PC.follow(f,S,ov.width,ov.height);const {s}=PC.score(f,S);for(const k in s)ema[k]=ema[k]==null?s[k]:ema[k]*.55+s[k]*.45;if(auto&&autoPool.length)rankNow(force)}
function rankNow(force){const best=autoPool.slice().sort((a,b)=>(ema[b]||0)-(ema[a]||0))[0];if(!best||best===active)return;if(force||S.mode==='still'){setActive(best);return}
  if(cand===best)candN++;else{cand=best;candN=1}if(candN>=4&&(ema[best]||0)>(ema[active]||0)+.06){setActive(best);cand=null}}
setInterval(()=>{if(S.mode==='live'&&vid.videoWidth&&!$('#cam').classList.contains('hidden')){try{onFeat(PC.analyze(vid,vid.videoWidth,vid.videoHeight,S.mirror,curAR()))}catch(e){}}},380);

/* 그리기 */
function frame(){const W=ov.width,H=ov.height;oc.clearRect(0,0,W,H);
  if(S.mode!=='idle'&&active){const h=PC.hint(active,feat,S,W,H);aligned=!!h.ok;const col=aligned?'rgba(61,220,132,.95)':'rgba(255,216,77,.92)';
    PC.drawOverlay(active,oc,W,H,S,{color:col,target:active==='negative'?h.tgt:undefined});
    if(h.src&&h.tgt){const[sx,sy]=h.src;oc.save();oc.strokeStyle='rgba(140,220,255,.95)';oc.lineWidth=2*dpr;oc.beginPath();oc.arc(sx*W,sy*H,10*dpr,0,7);oc.stroke();
      if(!aligned){oc.setLineDash([5*dpr,5*dpr]);oc.beginPath();oc.moveTo(sx*W,sy*H);oc.lineTo(h.tgt[0]*W,h.tgt[1]*H);oc.stroke();oc.setLineDash([]);const p=(Math.sin(performance.now()/180)+1)/2;oc.strokeStyle=col;oc.beginPath();oc.arc(h.tgt[0]*W,h.tgt[1]*H,(12+p*8)*dpr,0,7);oc.stroke()}oc.restore()}
    const t=h.t||'';if(hintEl.dataset.t!==t){hintEl.dataset.t=t;hintEl.innerHTML=t?(aligned?I('check'):'')+'<span>'+t+'</span>':''}hintEl.classList.toggle('ok',aligned);$('#shutter').classList.toggle('ok',aligned);
    if(aligned&&!wasAligned&&navigator.vibrate)try{navigator.vibrate(18)}catch(e){}wasAligned=aligned}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* 수평계 */
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;let ang=Math.atan2(a.x,a.y)*180/Math.PI;ang=((ang%90)+90)%90;if(ang>45)ang-=90;level=level==null?ang:level*.7+ang*.3;
  const el=$('#bLevel'),ok=Math.abs(level)<1.2;el.classList.remove('hidden');el.classList.toggle('ok',ok);el.innerHTML=I('level')+(ok?'수평':Math.abs(level).toFixed(1)+'°')}
let motionOn=false;async function enableMotion(){if(motionOn)return;try{if(typeof DeviceMotionEvent!=='undefined'&&DeviceMotionEvent.requestPermission){if(await DeviceMotionEvent.requestPermission()!=='granted')return}addEventListener('devicemotion',onMotion);motionOn=true}catch(e){}}

/* 촬영 */
function grab(){const cr=PC.getCrop(vid.videoWidth,vid.videoHeight,curAR()),c=document.createElement('canvas');c.width=Math.round(cr.w);c.height=Math.round(cr.h);const x=c.getContext('2d');if(S.mirror){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(vid,cr.x,cr.y,cr.w,cr.h,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',.92))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let busy=false;
$('#shutter').onclick=async()=>{if(S.mode==='still'){$('#file').click();return}if(S.mode!=='live'||!vid.videoWidth){startCam();return}if(busy)return;busy=true;
  try{if(timer){const ce=$('#count');ce.classList.remove('hidden');for(let n=timer;n>0;n--){ce.textContent=n;await sleep(1000)}ce.classList.add('hidden')}
    shots=[];for(let i=0;i<burst;i++){$('#shotN').textContent=burst>1?i+1:'';$('#flash').animate([{opacity:.55},{opacity:0}],{duration:180});shots.push(await grab());if(i<burst-1)await sleep(240)}$('#shotN').textContent='';
    const u=URL.createObjectURL(shots[shots.length-1]);$('#cLast').innerHTML=`<img src="${u}" alt="">`;showShots()}finally{busy=false}};
$('#cLast').onclick=()=>{shots.length?showShots():$('#file').click()};
function saveFiles(files){try{if(navigator.canShare&&navigator.canShare({files}))return navigator.share({files}).catch(()=>{})}catch(e){}files.forEach(f=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()});toast('저장했어요')}
function showShots(){const ts=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-'),files=shots.map((b,i)=>new File([b],`${C.filePrefix||'photo'}-${ts}-${i+1}.jpg`,{type:'image/jpeg'}));
  openSheet(shots.length>1?`찍은 사진 ${shots.length}장`:'찍은 사진',`<div class="shots">${shots.map((b,i)=>`<figure><img id="sh${i}" alt="찍은 사진 ${i+1}"><button data-s="${i}">${I('download')}저장</button></figure>`).join('')}</div><p class="note">아이폰은 저장을 누른 뒤 아래 메뉴에서 ‘이미지 저장’을 고르면 사진첩에 들어가요. 안드로이드는 갤러리에 바로 저장돼요.${C.reviewTip?'<br>'+C.reviewTip:''}</p>`,
   `<button class="btn pri wide" id="saveAll">${I('download')}${shots.length>1?'전부 사진첩에 저장':'사진첩에 저장'}</button>`,{dark:true});
  shots.forEach((b,i)=>{const fr=new FileReader();fr.onload=()=>{const im=$('#sh'+i);if(im)im.src=fr.result};fr.readAsDataURL(b)});
  $('#shB').onclick=e=>{const b=e.target.closest('[data-s]');if(b)saveFiles([files[+b.dataset.s]])};$('#saveAll').onclick=()=>saveFiles(files)}

window.APP={openSheet,closeSheet,openCam,openDetail,I,toast,BY};
})();
