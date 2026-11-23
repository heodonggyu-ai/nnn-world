/* 사진 편집기 — 색감·조정·자르기·지우기(내용 채우기)·인물(AI 배경 분리)·추가(인물 합성·글자). app.js 가 PhotoEditor.init(deps) 로 연결. */
(function(){
const HERE=(document.currentScript&&document.currentScript.src||'').replace(/[^/]*$/,'');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let D=null,ui=false;
const MAXS=2400;
/* ---------- 상태 ---------- */
let S=null;
function cloneC(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;n.getContext('2d').drawImage(c,0,0);return n}
function mkC(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}

/* ---------- 화면 ---------- */
function build(){if(ui)return;ui=true;const I=D.I;
  document.body.insertAdjacentHTML('beforeend',`<section class="pe hidden" id="pe" aria-label="사진 편집">
  <div class="pe-top"><button class="pe-tb" id="peX">${I('close')}</button><b id="peTitle">편집</b><button class="pe-tb" id="peUndo" aria-label="되돌리기"><svg class="ic" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/></svg></button><button class="pe-ok" id="peOk">${I('check')}완료</button></div>
  <div class="pe-stage" id="peStage"><div class="pe-wrap" id="peWrap"><canvas id="peC"></canvas><canvas id="peO"></canvas></div><div class="pe-busy hidden" id="peBusy"><i></i><span id="peBusyT">처리 중…</span></div><button class="pe-cmp" id="peCmp">원본</button></div>
  <div class="pe-panel" id="peP"></div>
  <nav class="pe-tabs" id="peT">${[['look','palette','색감'],['adj','spark','조정'],['crop','grid','자르기'],['erase','close','지우기'],['person','user','인물 AI'],['add','image','추가'],['ai','spark','AI 그리기']].map(([k,ic,n])=>`<button data-tool="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</nav>
  <input type="file" id="peFile" accept="image/*" hidden></section>`);
  $('#peX').onclick=()=>close(false);$('#peOk').onclick=save;$('#peUndo').onclick=undo;
  $('#peT').onclick=e=>{const b=e.target.closest('[data-tool]');if(b)setTool(b.dataset.tool)};
  const cmp=$('#peCmp');const on=()=>{S.cmp=true;paint()},off=()=>{S.cmp=false;paint()};cmp.addEventListener('pointerdown',on);cmp.addEventListener('pointerup',off);cmp.addEventListener('pointerleave',off);
  addEventListener('resize',()=>{if(S)fit()});
  addEventListener('popstate',()=>{if(S&&!(history.state&&history.state.pe))close(false,true)});
  pointer();
}
function busy(t){$('#peBusy').classList.toggle('hidden',!t);if(t)$('#peBusyT').textContent=t}

/* ---------- 열기·닫기 ---------- */
async function open(o){build();const img=await loadImg(o.blob);const k=Math.min(1,MAXS/Math.max(img.width,img.height));const base=mkC(img.width*k,img.height*k);base.getContext('2d').drawImage(img,0,0,base.width,base.height);
  S={o,base,undo:[],look:o.look||'none',str:o.str==null?1:o.str,adj:Object.assign({},D.LOOKS.ADJ0,o.adj||{}),tool:'look',lg:'rec',TH:null,REC:[],crop:null,layer:null,mask:null,maskVer:-1,ver:0,cmp:false};
  $('#pe').classList.remove('hidden');document.documentElement.classList.add('pe-open');history.pushState(Object.assign({},history.state,{pe:1}),'');
  try{S.r=new D.LOOKS.Renderer($('#peC'))}catch(e){S.r=null}
  fit();thumbs();setTool(o.tool||'look')}
function close(saved,fromPop){if(!S)return;$('#pe').classList.add('hidden');document.documentElement.classList.remove('pe-open');const o=S.o;S=null;if(!fromPop&&history.state&&history.state.pe)history.back();if(!saved&&o.onCancel)o.onCancel()}
function loadImg(b){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(b)})}
function thumbs(){try{const sm=mkC(96,96*S.base.height/S.base.width);sm.getContext('2d').drawImage(S.base,0,0,sm.width,sm.height);S.TH=D.LOOKS.thumbs(sm,sm.width,sm.height);const f=D.PC.analyze(S.base,S.base.width,S.base.height,false,S.base.width/S.base.height);S.REC=D.LOOKS.recommend(D.lookCtx(f,D.PC.scene(f,{facing:'environment',flat:0})))}catch(e){}}
function push(){S.undo.push(cloneC(S.base));if(S.undo.length>8)S.undo.shift();S.ver++}
function undo(){if(S.layer){S.layer=null;paint();return}if(S.crop){S.crop=null;panel();paint();return}const u=S.undo.pop();if(!u){D.toast('되돌릴 게 없어요');return}S.base=u;S.ver++;S.mask=null;fit();thumbs();panel();D.toast('되돌렸어요')}

/* ---------- 보이기 ---------- */
function curSrc(){if(S.crop)return cropOut(S.crop,1100);return S.base}
function fit(){const st=$('#peStage').getBoundingClientRect(),src=curSrc(),ar=src.width/src.height;let w=st.width-16,h=w/ar;if(h>st.height-16){h=st.height-16;w=h*ar}
  const wrap=$('#peWrap');wrap.style.width=w+'px';wrap.style.height=h+'px';const dpr=Math.min(devicePixelRatio||1,2);[$('#peC'),$('#peO')].forEach(c=>{c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)});paint()}
function lookObj(){return D.LOOKS.withAdj(S.look,S.adj)}
function paint(){if(!S)return;const cv=$('#peC'),src=curSrc();const v=mkC(cv.width,cv.height),x=v.getContext('2d');x.drawImage(src,0,0,v.width,v.height);
  if(S.layer)drawLayer(x,S.layer,v.width/S.base.width);
  if(S.r&&!S.cmp){try{S.r.render(v,lookObj(),{str:S.look==='none'?1:S.str});}catch(e){cv.getContext('2d')&&cv.getContext('2d').drawImage(v,0,0)}}else{const g=cv.getContext('webgl');if(g&&S.r){S.r.render(v,'none',{str:0})}else cv.getContext('2d').drawImage(v,0,0)}
  overlay()}
function overlay(){const o=$('#peO'),x=o.getContext('2d');x.clearRect(0,0,o.width,o.height);if((S.tool==='erase'||S.tool==='ai')&&S.strokes){x.save();x.strokeStyle='rgba(255,70,110,.55)';x.lineCap='round';x.lineJoin='round';S.strokes.forEach(s=>{x.lineWidth=s.w*o.width;x.beginPath();s.p.forEach((p,i)=>i?x.lineTo(p[0]*o.width,p[1]*o.height):x.moveTo(p[0]*o.width,p[1]*o.height));if(s.p.length===1)x.lineTo(s.p[0][0]*o.width+.1,s.p[0][1]*o.height);x.stroke()});x.restore()}
  if(S.crop){x.save();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;[1,2].forEach(i=>{x.beginPath();x.moveTo(o.width*i/3,0);x.lineTo(o.width*i/3,o.height);x.moveTo(0,o.height*i/3);x.lineTo(o.width,o.height*i/3);x.stroke()});x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(1.5,1.5,o.width-3,o.height-3);x.restore()}
  if(S.layer)drawLayerBox(o,S.layer)}

/* ---------- 도구 판 ---------- */
function setTool(t){if(S.crop&&t!=='crop')S.crop=null;if(S.layer&&t!=='add')S.layer=null;S.tool=t;S.strokes=null;$$('#peT [data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));panel();fit()}
function panel(){const P=$('#peP'),I=D.I,t=S.tool;P.className='pe-panel t-'+t;
  if(t==='look'){P.innerHTML=`<div class="cchips" id="peLG"></div><div class="cstrip" id="peLS"></div><div class="lkr"><span id="peLN"></span><b class="lkp">농도 <i id="peLP"></i></b><input type="range" id="peLR" min="0" max="100"></div>`;
    const draw=()=>{const g=S.lg==='adj'?'rec':S.lg;D.lookChips($('#peLG'),g);D.lookThumbs($('#peLS'),g,S.look,S.TH,S.REC);const l=D.LOOKS.byId[S.look];$('#peLN').textContent=l?l.name+(l.d?' · '+l.d:''):'';$('#peLR').value=Math.round(S.str*100);$('#peLR').disabled=S.look==='none';$('#peLP').textContent=S.look==='none'?'':Math.round(S.str*100)+'%'};draw();
    $('#peLG').onclick=e=>{const b=e.target.closest('[data-lg]');if(!b)return;if(b.dataset.lg==='adj'){setTool('adj');return}S.lg=b.dataset.lg;draw()};
    $('#peLS').onclick=e=>{const b=e.target.closest('[data-lk]');if(b){S.look=b.dataset.lk;draw();paint()}};
    $('#peLR').oninput=e=>{S.str=e.target.value/100;$('#peLP').textContent=Math.round(S.str*100)+'%';paint()};return}
  if(t==='adj'){P.innerHTML=`<div class="adjp" id="peA"></div>`;D.adjPanel($('#peA'),S.adj,paint);return}
  if(t==='crop'){if(!S.crop)S.crop={ratio:0,rot:0,zoom:1,px:0,py:0,flip:false,r90:0};const c=S.crop,R=[['원본',0],['1:1',1],['4:5',.8],['3:4',.75],['9:16',9/16],['16:9',16/9]];
    P.innerHTML=`<div class="cchips">${R.map(([n,v])=>`<button class="cc${c.ratio===v?' on':''}" data-r="${v}">${n}</button>`).join('')}<button class="cc" data-a="r90">↻ 90°</button><button class="cc${c.flip?' on':''}" data-a="flip">⇋ 반전</button></div>
      <label class="adr wide"><span>수평</span><input type="range" min="-200" max="200" value="${Math.round(c.rot*10)}" id="peRot"><i id="peRotV">${c.rot.toFixed(1)}°</i></label>
      <label class="adr wide"><span>확대</span><input type="range" min="100" max="300" value="${Math.round(c.zoom*100)}" id="peZoom"><i>${Math.round(c.zoom*100)}%</i></label>
      <div class="pe-row"><span class="pe-tip">사진을 끌어서 위치를 맞춰요</span><button class="cc on" id="peCropOk">${I('check')}자르기 적용</button></div>`;
    P.onclick=e=>{const r=e.target.closest('[data-r]'),a=e.target.closest('[data-a]');if(r){c.ratio=+r.dataset.r;c.px=c.py=0;panel();fit()}if(a){if(a.dataset.a==='r90'){c.r90=(c.r90+1)%4;c.px=c.py=0}else c.flip=!c.flip;panel();fit()}};
    $('#peRot').oninput=e=>{c.rot=e.target.value/10;$('#peRotV').textContent=c.rot.toFixed(1)+'°';paint()};$('#peZoom').oninput=e=>{c.zoom=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value+'%';paint()};
    $('#peCropOk').onclick=()=>{busy('자르는 중…');setTimeout(()=>{push();S.base=cropOut(c,MAXS);S.crop=null;busy(false);thumbs();setTool('crop');S.crop=null;panel();fit();D.toast('잘랐어요')},30)};return}
  if(t==='erase'){S.brush=S.brush||.06;P.innerHTML=`<p class="pe-tip big">${I('close')}지우고 싶은 사람·물건을 손가락으로 칠하면, 주변 배경으로 자연스럽게 채워요</p><label class="adr wide"><span>붓 크기</span><input type="range" min="2" max="20" value="${Math.round(S.brush*100)}" id="peBr"><i>${Math.round(S.brush*100)}</i></label>`;
    $('#peBr').oninput=e=>{S.brush=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value};return}
  if(t==='person'){S.blur=S.blur||.5;P.innerHTML=`<p class="pe-tip">AI가 사람을 찾아 배경과 분리해요 (사람이 크게 나온 사진에 잘 맞아요)</p>
      <div class="pe-grid"><button class="pe-act" data-p="blur">${I('aperture')}<b>배경 흐림</b><small>인물 모드처럼</small></button><button class="pe-act" data-p="pop">${I('spark')}<b>컬러 팝</b><small>배경만 흑백</small></button><button class="pe-act" data-p="white">${I('image')}<b>배경 하얗게</b><small>증명·프로필</small></button><button class="pe-act" data-p="dark">${I('moon')}<b>배경 어둡게</b><small>화보 느낌</small></button></div>
      <label class="adr wide"><span>흐림 정도</span><input type="range" min="10" max="100" value="${Math.round(S.blur*100)}" id="peBl"><i>${Math.round(S.blur*100)}</i></label>`;
    $('#peBl').oninput=e=>{S.blur=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value};
    P.onclick=async e=>{const b=e.target.closest('[data-p]');if(!b)return;await personFx(b.dataset.p)};return}
  if(t==='ai'){aiPanel(P);return}
  if(t==='add'){const L=S.layer;
    if(L){const deg=Math.round(((L.rot*180/Math.PI)%360+540)%360-180);P.innerHTML=`<p class="pe-tip" style="padding:4px 16px">한 손가락: 옮기기 · 두 손가락: 크기·회전 · 흰 손잡이: 돌리며 크기</p>
      <label class="adr wide"><span>크기</span><input type="range" min="5" max="400" value="${Math.round(L.s*100)}" id="peLs"><i>${Math.round(L.s*100)}%</i></label>
      <label class="adr wide"><span>회전</span><input type="range" min="-180" max="180" value="${deg}" id="peLr"><i>${deg}°</i></label>
      <div class="cchips">${L.type==='img'?`<button class="cc${L.match?' on':''}" data-o="match">${I('spark')}색 맞추기</button><button class="cc${L.shadow?' on':''}" data-o="shadow">${I('moon')}발밑 그림자</button><button class="cc" data-o="auto">${I('user')}자동 배치</button>`:['#ffffff','#141B34','#ffd34d','#ff5a7e','#3ddc84','#4aa3ff'].map(c=>`<button class="cc sw" data-c="${c}" style="--c:${c}"></button>`).join('')}<button class="cc" data-o="flip">⇋ 반전</button></div>
      <div class="pe-row"><span class="pe-tip"></span><button class="cc" id="peLx">취소</button><button class="cc on" id="peLok">${I('check')}붙이기</button></div>`;
      $('#peLs').oninput=e=>{L.s=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value+'%';paint()};
      $('#peLr').oninput=e=>{L.rot=e.target.value*Math.PI/180;e.target.nextElementSibling.textContent=e.target.value+'°';paint()};
      $('#peLx').onclick=()=>{S.layer=null;panel();paint()};
      $('#peLok').onclick=()=>{push();drawLayer(S.base.getContext('2d'),L,1);S.layer=null;thumbs();panel();paint();D.toast('붙였어요')};
      P.onclick=async e=>{const c=e.target.closest('[data-c]'),op=e.target.closest('[data-o]');if(c&&L.type==='text'){L.col=c.dataset.c;L.cv=textCanvas(L.text,L.col);paint();return}if(!op)return;const k=op.dataset.o;
        if(k==='flip')L.flip=!L.flip;else if(k==='match'){L.match=!L.match;refreshLayer(L)}else if(k==='shadow')L.shadow=!L.shadow;else if(k==='auto'){busy('자리 찾는 중…');await autoPlace(L);busy(false)}panel();paint()};return}
    P.innerHTML=`<div class="pe-grid two"><button class="pe-act" data-a="person">${I('user')}<b>다른 사진의 사람 넣기</b><small>AI가 오려서 크기·색·그림자까지 맞춰요</small></button><button class="pe-act" data-a="text">${I('chat')}<b>글자 넣기</b><small>날짜·장소·한마디</small></button></div>`;
    P.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='text'){const t=prompt('넣을 글자를 적어주세요','');if(!t)return;S.layer={type:'text',text:t,col:'#ffffff',cv:textCanvas(t,'#ffffff'),x:S.base.width/2,y:S.base.height*.85,s:1,rot:0,flip:false};panel();paint()}else{$('#peFile').onchange=async ev=>{const f=ev.target.files[0];ev.target.value='';if(f)await addPerson(f)};$('#peFile').click()}};return}
}

/* ---------- 자르기 ---------- */
function rot90(c,n){if(!n)return c;const o=n%2?mkC(c.height,c.width):mkC(c.width,c.height),x=o.getContext('2d');x.translate(o.width/2,o.height/2);x.rotate(n*Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2);return o}
function cropOut(c,maxSide){const src=c._r90&&c._r90v===c.r90&&c._b===S.ver?c._r90:(c._r90=rot90(S.base,c.r90),c._r90v=c.r90,c._b=S.ver,c._r90);const W=src.width,H=src.height,R=c.ratio||W/H;let cw,ch;if(W/H>R){ch=H;cw=ch*R}else{cw=W;ch=cw/R}
  const th=c.rot*Math.PI/180,auto=Math.abs(Math.cos(th))+Math.abs(Math.sin(th))*Math.max(R,1/R),z=c.zoom*auto,vw=cw/z,vh=ch/z;
  const mx=Math.max(0,(W-vw)/2),my=Math.max(0,(H-vh)/2);c.px=Math.max(-mx,Math.min(mx,c.px));c.py=Math.max(-my,Math.min(my,c.py));
  const k=Math.min(1,maxSide/Math.max(vw,vh)),o=mkC(vw*k,vh*k),x=o.getContext('2d');x.imageSmoothingQuality='high';x.translate(o.width/2,o.height/2);x.scale(k,k);x.rotate(th);if(c.flip)x.scale(-1,1);x.translate(-(W/2+c.px),-(H/2+c.py));x.drawImage(src,0,0);c._vw=vw;return o}

/* ---------- 손가락 입력 ---------- */
function pointer(){const o=$('#peO'),pts=new Map();let drag=null;
  const pos=e=>{const r=o.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
  const toB=p=>[p[0]*S.base.width,p[1]*S.base.height];
  const two=()=>{const a=[...pts.values()];const A=toB(a[0]),B=toB(a[1]);return{d:Math.hypot(B[0]-A[0],B[1]-A[1]),ang:Math.atan2(B[1]-A[1],B[0]-A[0]),mx:(A[0]+B[0])/2,my:(A[1]+B[1])/2}};
  o.addEventListener('pointerdown',e=>{if(!S)return;o.setPointerCapture(e.pointerId);const p=pos(e);pts.set(e.pointerId,p);
    if(S.tool==='erase'||(S.tool==='ai'&&S.aiPaint)){if(pts.size>1)return;S.strokes=S.strokes||[];S.strokes.push({w:S.tool==='ai'?.08:S.brush,p:[p]});overlay();return}
    if(S.layer){const L=S.layer;if(pts.size===2){const t=two();drag={mode:'pinch',d:t.d,ang:t.ang,s:L.s,rot:L.rot,mx:t.mx,my:t.my,lx:L.x,ly:L.y};return}
      const hb=handlePos(L),b=toB(p),r=o.getBoundingClientRect(),hit=Math.hypot(b[0]-hb[0],b[1]-hb[1])<40*S.base.width/r.width;
      if(hit){drag={mode:'handle',a0:Math.atan2(b[1]-L.y,b[0]-L.x),d0:Math.hypot(b[0]-L.x,b[1]-L.y),s:L.s,rot:L.rot}}else drag={mode:'move',b,lx:L.x,ly:L.y};return}
    if(S.crop)drag={mode:'crop',p,px:S.crop.px,py:S.crop.py}});
  o.addEventListener('pointermove',e=>{if(!S||!pts.has(e.pointerId))return;const p=pos(e);pts.set(e.pointerId,p);
    if((S.tool==='erase'||S.tool==='ai')&&S.strokes&&e.buttons&&pts.size===1){S.strokes[S.strokes.length-1].p.push(p);overlay();return}
    if(!drag)return;
    if(drag.mode==='crop'){const c=S.crop,sc=(c._vw||S.base.width);c.px=drag.px-(p[0]-drag.p[0])*sc;c.py=drag.py-(p[1]-drag.p[1])*sc*(o.height/o.width);paint();return}
    const L=S.layer;if(!L)return;
    if(drag.mode==='pinch'&&pts.size===2){const t=two();L.s=Math.max(.05,Math.min(8,drag.s*t.d/drag.d));L.rot=drag.rot+(t.ang-drag.ang);L.x=drag.lx+(t.mx-drag.mx);L.y=drag.ly+(t.my-drag.my)}
    else if(drag.mode==='handle'){const b=toB(p);L.rot=drag.rot+(Math.atan2(b[1]-L.y,b[0]-L.x)-drag.a0);L.s=Math.max(.05,Math.min(8,drag.s*Math.hypot(b[0]-L.x,b[1]-L.y)/drag.d0))}
    else if(drag.mode==='move'&&pts.size===1){const b=toB(p);L.x=drag.lx+(b[0]-drag.b[0]);L.y=drag.ly+(b[1]-drag.b[1])}
    paint();syncLayerUI()});
  const up=e=>{if(!S)return;pts.delete(e.pointerId);if(pts.size===0){drag=null;if(S.tool==='erase'&&S.strokes&&S.strokes.length)runErase()}
    else if(S.layer&&pts.size===1){const L=S.layer,b=toB([...pts.values()][0]);drag={mode:'move',b,lx:L.x,ly:L.y}}};
  o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up)}
function syncLayerUI(){const L=S&&S.layer;if(!L)return;const a=$('#peLs'),r=$('#peLr');if(a){a.value=Math.round(L.s*100);a.nextElementSibling.textContent=Math.round(L.s*100)+'%'}if(r){const d=Math.round(((L.rot*180/Math.PI)%360+540)%360-180);r.value=d;r.nextElementSibling.textContent=d+'°'}}

/* ---------- 지우기: 패치 기반 내용 채우기 ---------- */
function runErase(){const B=S.base,m=mkC(B.width,B.height),x=m.getContext('2d');x.strokeStyle='#fff';x.lineCap='round';x.lineJoin='round';
  S.strokes.forEach(s=>{x.lineWidth=s.w*B.width+Math.max(6,B.width*.012);x.beginPath();s.p.forEach((p,i)=>i?x.lineTo(p[0]*B.width,p[1]*B.height):x.moveTo(p[0]*B.width,p[1]*B.height));if(s.p.length===1)x.lineTo(s.p[0][0]*B.width+.1,s.p[0][1]*B.height);x.stroke()});
  busy('지우는 중…');setTimeout(()=>{try{push();inpaint(B,m)}catch(e){console.error(e)}S.strokes=null;busy(false);thumbs();paint()},40)}
function inpaint(B,maskC){const W0=B.width,H0=B.height,md=maskC.getContext('2d').getImageData(0,0,W0,H0).data;let x0=W0,y0=H0,x1=-1,y1=-1;
  for(let y=0;y<H0;y+=2)for(let x=0;x<W0;x+=2)if(md[(y*W0+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return;x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(W0-1,x1+2);y1=Math.min(H0-1,y1+2);
  const bw=x1-x0+1,bh=y1-y0+1,mg=Math.max(48,Math.round(Math.max(bw,bh)*.9));const rx=Math.max(0,x0-mg),ry=Math.max(0,y0-mg),rw=Math.min(W0,x1+mg+1)-rx,rh=Math.min(H0,y1+mg+1)-ry;
  /* 원래 크기 영역 */const fc=mkC(rw,rh),fx=fc.getContext('2d');fx.drawImage(B,rx,ry,rw,rh,0,0,rw,rh);const fd=fx.getImageData(0,0,rw,rh),fp=fd.data;
  const fm=new Uint8Array(rw*rh);for(let y=0;y<rh;y++)for(let x=0;x<rw;x++)fm[y*rw+x]=md[((y+ry)*W0+x+rx)*4+3]>10?1:0;
  /* 작업 크기 */const k=Math.min(1,460/Math.max(rw,rh)),W=Math.max(16,Math.round(rw*k)),H=Math.max(16,Math.round(rh*k));
  const ic=mkC(W,H),ix=ic.getContext('2d');ix.imageSmoothingQuality='high';ix.drawImage(fc,0,0,W,H);const id=ix.getImageData(0,0,W,H).data;
  const N=W*H,im={w:W,h:H,r:new Float32Array(N),g:new Float32Array(N),b:new Float32Array(N)},hole=new Uint8Array(N);
  for(let i=0;i<N;i++){im.r[i]=id[i*4];im.g[i]=id[i*4+1];im.b[i]=id[i*4+2]}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){/* 작게 줄일 때 가장자리가 섞이지 않게 넉넉히 */const fx0=Math.max(0,Math.floor((x-1)/k)),fx1=Math.min(rw-1,Math.ceil((x+2)/k)),fy0=Math.max(0,Math.floor((y-1)/k)),fy1=Math.min(rh-1,Math.ceil((y+2)/k));let h=0;
    for(let yy=fy0;yy<=fy1&&!h;yy+=Math.max(1,(fy1-fy0)>>2))for(let xx=fx0;xx<=fx1;xx+=Math.max(1,(fx1-fx0)>>2))if(fm[yy*rw+xx]){h=1;break}hole[y*W+x]=h}
  const nn=window.FILL?FILL.complete(im,hole,(rx*7+ry*13)|0):null;
  const out=fx.createImageData(rw,rh),op=out.data;op.set(fp);
  if(nn&&k<1){/* 원래 크기에서 다시 투표: 진짜 픽셀을 가져와 선명하게 */const Rf=Math.max(2,Math.round(2/k)),st=Math.max(1,Rf>>1);
    for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){const p=y*rw+x;if(!fm[p])continue;let r=0,g=0,b=0,n=0;
      for(let dy=-Rf;dy<=Rf;dy+=st)for(let dx=-Rf;dx<=Rf;dx+=st){const qx=x+dx,qy=y+dy;if(qx<0||qy<0||qx>=rw||qy>=rh)continue;const wx=Math.min(W-1,Math.round(qx*k)),wy=Math.min(H-1,Math.round(qy*k)),wi=wy*W+wx;if(!nn.tgt[wi])continue;
        const sx=x+Math.round(nn.ox[wi]/k),sy=y+Math.round(nn.oy[wi]/k);if(sx<0||sy<0||sx>=rw||sy>=rh)continue;const s=sy*rw+sx;if(fm[s])continue;r+=fp[s*4];g+=fp[s*4+1];b+=fp[s*4+2];n++}
      if(n){op[p*4]=r/n;op[p*4+1]=g/n;op[p*4+2]=b/n}else{const wi=Math.min(H-1,Math.round(y*k))*W+Math.min(W-1,Math.round(x*k));op[p*4]=im.r[wi];op[p*4+1]=im.g[wi];op[p*4+2]=im.b[wi]}}
    /* 작게 채운 결과와 밝기·색을 맞추기 (큰 얼룩 방지) */
    const tc=mkC(rw,rh),tx=tc.getContext('2d');tx.putImageData(out,0,0);const lo1=mkC(W,H),l1=lo1.getContext('2d');l1.drawImage(tc,0,0,W,H);const a1=l1.getImageData(0,0,W,H).data;
    const cor=mkC(W,H),cx=cor.getContext('2d'),cd=cx.createImageData(W,H);for(let i=0;i<N;i++){cd.data[i*4]=128+(im.r[i]-a1[i*4])/2;cd.data[i*4+1]=128+(im.g[i]-a1[i*4+1])/2;cd.data[i*4+2]=128+(im.b[i]-a1[i*4+2])/2;cd.data[i*4+3]=255}cx.putImageData(cd,0,0);
    const cu=mkC(rw,rh),cux=cu.getContext('2d');cux.filter='blur(2px)';cux.drawImage(cor,0,0,rw,rh);const cdata=cux.getImageData(0,0,rw,rh).data;
    for(let p=0;p<rw*rh;p++)if(fm[p]){op[p*4]=Math.max(0,Math.min(255,op[p*4]+(cdata[p*4]-128)*2));op[p*4+1]=Math.max(0,Math.min(255,op[p*4+1]+(cdata[p*4+1]-128)*2));op[p*4+2]=Math.max(0,Math.min(255,op[p*4+2]+(cdata[p*4+2]-128)*2))}}
  else for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){const p=y*rw+x;if(!fm[p])continue;const wi=Math.min(H-1,Math.round(y*k))*W+Math.min(W-1,Math.round(x*k));op[p*4]=im.r[wi];op[p*4+1]=im.g[wi];op[p*4+2]=im.b[wi]}
  /* 가장자리를 부드럽게 섞어 붙이기 */
  const res=mkC(rw,rh);res.getContext('2d').putImageData(out,0,0);const fe=mkC(rw,rh),fex=fe.getContext('2d');fex.filter=`blur(${Math.max(1.2,W0/900)}px)`;fex.drawImage(maskC,rx,ry,rw,rh,0,0,rw,rh);fex.drawImage(maskC,rx,ry,rw,rh,0,0,rw,rh);fex.filter='none';
  fex.globalCompositeOperation='source-in';fex.drawImage(res,0,0);B.getContext('2d').drawImage(fe,0,0,rw,rh,rx,ry,rw,rh)}

/* ---------- 인물 AI (MediaPipe 셀피 분리, 기기 안에서 실행) ---------- */
let segP=null;
function segReady(){if(segP)return segP;segP=new Promise((res,rej)=>{const go=async()=>{try{const ss=new window.SelfieSegmentation({locateFile:f=>HERE+'vendor/selfie/'+f});ss.setOptions({modelSelection:0,selfieMode:false});await ss.initialize();res(ss)}catch(e){segP=null;rej(e)}};
  if(window.SelfieSegmentation)return go();const s=document.createElement('script');s.src=HERE+'vendor/selfie/selfie_segmentation.js';s.onload=go;s.onerror=e=>{segP=null;rej(e)};document.head.appendChild(s)});return segP}
async function segment(c){const ss=await segReady();const inp=mkC(Math.min(c.width,512),Math.min(c.width,512)*c.height/c.width);inp.getContext('2d').drawImage(c,0,0,inp.width,inp.height);
  return new Promise((res,rej)=>{ss.onResults(r=>{try{const m=mkC(c.width,c.height),x=m.getContext('2d');x.drawImage(r.segmentationMask,0,0,m.width,m.height);
    /* 가면 값이 알파 또는 빨강 채널에 있어 알파로 통일 */
    const sm=mkC(64,64*c.height/c.width),sx=sm.getContext('2d');sx.drawImage(m,0,0,sm.width,sm.height);const d=sx.getImageData(0,0,sm.width,sm.height).data;let aV=0,rV=0;for(let i=0;i<d.length;i+=4){aV+=d[i+3]<250&&d[i+3]>5?1:0;rV+=d[i]>5&&d[i]<250?1:0}
    if(rV>aV){const id=x.getImageData(0,0,m.width,m.height),p=id.data;for(let i=0;i<p.length;i+=4){p[i+3]=p[i];p[i]=p[i+1]=p[i+2]=255}x.putImageData(id,0,0)}
    res(m)}catch(e){rej(e)}});ss.send({image:inp}).catch(rej)})}
async function personMask(){if(S.mask&&S.maskVer===S.ver)return S.mask;busy('AI가 사람을 찾는 중…');try{S.mask=await segment(S.base);S.maskVer=S.ver;return S.mask}finally{busy(false)}}
function hasPerson(m){const s=mkC(48,48),x=s.getContext('2d');x.drawImage(m,0,0,48,48);const d=x.getImageData(0,0,48,48).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>128)n++;return n>48*48*.02}
async function personFx(kind){let m;try{m=await personMask()}catch(e){D.toast('AI 기능을 불러오지 못했어요. 인터넷 연결을 확인해 주세요');return}if(!hasPerson(m)){D.toast('사람을 찾지 못했어요. 사람이 크게 나온 사진에서 써 보세요');return}
  busy('적용하는 중…');await new Promise(r=>setTimeout(r,30));push();const B=S.base,W=B.width,H=B.height;
  const soft=mkC(W,H),sx=soft.getContext('2d');sx.filter=`blur(${Math.max(1,W/500)}px)`;sx.drawImage(m,0,0);sx.filter='none';
  const person=mkC(W,H),px=person.getContext('2d');px.drawImage(soft,0,0);px.globalCompositeOperation='source-in';px.drawImage(B,0,0);
  const bg=mkC(W,H),bx=bg.getContext('2d');
  if(kind==='blur'){bx.filter=`blur(${Math.round(W/90*S.blur*2+2)}px)`;bx.drawImage(B,0,0);bx.filter='none'}
  else if(kind==='pop'){bx.filter='grayscale(1) contrast(1.05)';bx.drawImage(B,0,0);bx.filter='none'}
  else if(kind==='white'){bx.fillStyle='#ffffff';bx.fillRect(0,0,W,H)}
  else{bx.filter='brightness(.35) saturate(.6)';bx.drawImage(B,0,0);bx.filter='none'}
  const out=B.getContext('2d');out.clearRect(0,0,W,H);out.drawImage(bg,0,0);out.drawImage(person,0,0);S.ver++;busy(false);thumbs();paint();D.toast({blur:'배경을 흐렸어요',pop:'배경을 흑백으로 바꿨어요',white:'배경을 하얗게 바꿨어요',dark:'배경을 어둡게 바꿨어요'}[kind])}
async function addPerson(f){let img;try{img=await loadImg(f)}catch(e){return}const k=Math.min(1,1400/Math.max(img.width,img.height)),c=mkC(img.width*k,img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  let m;busy('AI가 사람을 오리는 중…');try{m=await segment(c)}catch(e){busy(false);D.toast('AI 기능을 불러오지 못했어요');return}if(!hasPerson(m)){busy(false);D.toast('그 사진에서 사람을 찾지 못했어요');return}
  /* 가장자리를 살짝 줄이고 부드럽게 (배경 테두리가 남지 않게) */
  const mm=mkC(c.width,c.height),mx=mm.getContext('2d');mx.filter=`blur(${Math.max(1,c.width/600)}px)`;mx.drawImage(m,0,0);mx.filter='none';const md=mx.getImageData(0,0,mm.width,mm.height),mp=md.data;for(let i=3;i<mp.length;i+=4){const a=mp[i]/255,v=Math.max(0,Math.min(1,(a-.35)/.5));mp[i]=Math.round(v*v*(3-2*v)*255)}mx.putImageData(md,0,0);
  const cut=mkC(c.width,c.height),x=cut.getContext('2d');x.drawImage(mm,0,0);x.globalCompositeOperation='source-in';x.drawImage(c,0,0);
  const d=x.getImageData(0,0,cut.width,cut.height).data;let x0=cut.width,y0=cut.height,x1=0,y1=0;for(let y=0;y<cut.height;y+=2)for(let xx=0;xx<cut.width;xx+=2)if(d[(y*cut.width+xx)*4+3]>60){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
  const t=mkC(x1-x0+3,y1-y0+3);t.getContext('2d').drawImage(cut,x0,y0,t.width,t.height,0,0,t.width,t.height);
  const L={type:'img',src:t,cv:t,x:0,y:0,s:1,rot:0,flip:false,match:true,shadow:true};refreshLayer(L);busy('자연스러운 자리 찾는 중…');await autoPlace(L);busy(false);S.layer=L;panel();paint();D.toast('크기·색·자리를 맞췄어요. 손가락으로 더 조정해요')}
function textCanvas(t,col){const f=Math.round(S.base.width/14),c=mkC(10,10),x=c.getContext('2d');x.font=`800 ${f}px Pretendard,'Apple SD Gothic Neo',sans-serif`;const w=Math.ceil(x.measureText(t).width)+f;c.width=w;c.height=Math.round(f*1.6);
  const y=c.getContext('2d');y.font=`800 ${f}px Pretendard,'Apple SD Gothic Neo',sans-serif`;y.textBaseline='middle';y.textAlign='center';y.shadowColor='rgba(0,0,0,.45)';y.shadowBlur=f*.25;y.fillStyle=col;y.fillText(t,w/2,c.height/2);return c}
function lsize(L){return[L.cv.width*L.s,L.cv.height*L.s]}
function corners(L){const[w,h]=lsize(L),c=Math.cos(L.rot),s=Math.sin(L.rot);return[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[L.x+x*c-y*s,L.y+x*s+y*c])}
function handlePos(L){return corners(L)[1]}
function drawLayer(x,L,k){const[w,h]=lsize(L);x.save();x.translate(L.x*k,L.y*k);x.rotate(L.rot);
  if(L.type==='img'&&L.shadow){/* 발밑 그림자 */x.save();x.filter=`blur(${Math.max(2,h*k*.025)}px)`;x.fillStyle='rgba(0,0,0,.42)';x.beginPath();x.ellipse(0,(h/2-h*.012)*k,w*.36*k,h*.03*k,0,0,Math.PI*2);x.fill();x.restore()}
  if(L.flip)x.scale(-1,1);x.drawImage(L.cv,-w/2*k,-h/2*k,w*k,h*k);x.restore()}
function drawLayerBox(o,L){const x=o.getContext('2d'),k=o.width/S.base.width,C=corners(L).map(([a,b])=>[a*k,b*k]);x.save();x.setLineDash([7,6]);x.strokeStyle='#fff';x.lineWidth=2;x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=3;x.beginPath();C.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.stroke();x.setLineDash([]);
  const[hx,hy]=C[1];x.fillStyle='#fff';x.beginPath();x.arc(hx,hy,15*(o.width/o.clientWidth),0,Math.PI*2);x.fill();x.strokeStyle='#141B34';x.lineWidth=2.2*(o.width/o.clientWidth);x.beginPath();x.arc(hx,hy,7*(o.width/o.clientWidth),-.3,Math.PI*1.4);x.stroke();x.restore()}
/* 색·밝기를 배경에 맞추기 */
function stats(c,alphaOnly){const s=mkC(80,80*c.height/c.width),x=s.getContext('2d');x.drawImage(c,0,0,s.width,s.height);const d=x.getImageData(0,0,s.width,s.height).data;const m=[0,0,0],v=[0,0,0];let n=0;
  for(let i=0;i<d.length;i+=4){if(alphaOnly&&d[i+3]<160)continue;for(let k=0;k<3;k++){m[k]+=d[i+k];v[k]+=d[i+k]*d[i+k]}n++}if(!n)return null;return{m:m.map(a=>a/n),s:v.map((a,k)=>Math.sqrt(Math.max(1,a/n-(m[k]/n)**2)))}}
function matchColor(src,bgStats){const ps=stats(src,true);if(!ps||!bgStats)return src;const o=cloneC(src),x=o.getContext('2d'),id=x.getImageData(0,0,o.width,o.height),p=id.data;
  const tm=ps.m.map((m,k)=>m+(bgStats.m[k]-m)*.45),ts=ps.s.map((s,k)=>s+(bgStats.s[k]-s)*.3);
  for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,(p[i+k]-ps.m[k])*(ts[k]/ps.s[k])+tm[k]))}x.putImageData(id,0,0);return o}
function refreshLayer(L){if(L.type!=='img')return;L.cv=L.match?matchColor(L.src,stats(S.base,false)):L.src}
/* 자동 배치: 사진 속 사람 크기·발 위치에 맞추기 */
async function autoPlace(L){const W=S.base.width,H=S.base.height,[w0,h0]=[L.src.width,L.src.height];let s=Math.min(1,H*.6/h0,W*.6/w0),x=W/2,y=H-h0*s/2-H*.03;
  try{const m=await personMask();if(hasPerson(m)){const sm=mkC(96,96*H/W),sx=sm.getContext('2d');sx.drawImage(m,0,0,sm.width,sm.height);const d=sx.getImageData(0,0,sm.width,sm.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let yy=0;yy<sm.height;yy++)for(let xx=0;xx<sm.width;xx++)if(d[(yy*sm.width+xx)*4+3]>128){x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,yy);y1=Math.max(y1,yy)}
    if(x1>0){const f=W/sm.width,bx0=x0*f,bx1=(x1+1)*f,by0=y0*f,by1=(y1+1)*f,ph=by1-by0;s=Math.min(ph/h0,W*.8/w0,H*.95/h0);if(Math.max(bx0,W-bx1)<w0*s*.5)s*=.75;const nw=w0*s,nh=h0*s;
      const leftRoom=bx0,rightRoom=W-bx1;x=rightRoom>=leftRoom?Math.min(W-nw/2,bx1+nw*.45):Math.max(nw/2,bx0-nw*.45);y=by1-nh/2;
      if(by1>H*.97)y=H-nh/2;x=Math.max(Math.min(nw/2,W/2),Math.min(Math.max(W-nw/2,W/2),x));y=Math.max(nh/2,Math.min(H-nh/2,y))}}}catch(e){}
  L.s=s;L.x=x;L.y=y}

/* ---------- 저장 ---------- */
async function save(){if(S.crop){push();S.base=cropOut(S.crop,MAXS);S.crop=null}if(S.layer){push();drawLayer(S.base.getContext('2d'),S.layer,1);S.layer=null}
  busy('저장 준비 중…');await new Promise(r=>setTimeout(r,30));let out=S.base;const lo=lookObj();if(S.look!=='none'||!D.LOOKS.adjZero(S.adj)){try{out=cloneC(D.LOOKS.apply(S.base,lo,S.look==='none'?1:S.str))}catch(e){}}
  const blob=await new Promise(r=>out.toBlob(r,'image/jpeg',.92)),baseBlob=await new Promise(r=>S.base.toBlob(r,'image/jpeg',.95));busy(false);const o=S.o,st={look:S.look,str:S.str,adj:Object.assign({},S.adj)};close(true);o.onSave&&o.onSave(blob,baseBlob,st)}

window.PhotoEditor={init:d=>{D=d},open,segment,inpaint};
})();
