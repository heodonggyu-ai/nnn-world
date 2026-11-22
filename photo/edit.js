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
  <nav class="pe-tabs" id="peT">${[['look','palette','색감'],['adj','spark','조정'],['crop','grid','자르기'],['erase','close','지우기'],['person','user','인물 AI'],['add','image','추가']].map(([k,ic,n])=>`<button data-tool="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</nav>
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
function overlay(){const o=$('#peO'),x=o.getContext('2d');x.clearRect(0,0,o.width,o.height);if(S.tool==='erase'&&S.strokes){x.save();x.strokeStyle='rgba(255,70,110,.55)';x.lineCap='round';x.lineJoin='round';S.strokes.forEach(s=>{x.lineWidth=s.w*o.width;x.beginPath();s.p.forEach((p,i)=>i?x.lineTo(p[0]*o.width,p[1]*o.height):x.moveTo(p[0]*o.width,p[1]*o.height));if(s.p.length===1)x.lineTo(s.p[0][0]*o.width+.1,s.p[0][1]*o.height);x.stroke()});x.restore()}
  if(S.crop){x.save();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;[1,2].forEach(i=>{x.beginPath();x.moveTo(o.width*i/3,0);x.lineTo(o.width*i/3,o.height);x.moveTo(0,o.height*i/3);x.lineTo(o.width,o.height*i/3);x.stroke()});x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(1.5,1.5,o.width-3,o.height-3);x.restore()}
  if(S.layer){const L=S.layer,k=o.width/S.base.width,b=layerBox(L);x.save();x.setLineDash([6,5]);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(b.x*k,b.y*k,b.w*k,b.h*k);x.restore()}}

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
  if(t==='add'){const L=S.layer;P.innerHTML=L?`<label class="adr wide"><span>크기</span><input type="range" min="10" max="300" value="${Math.round(L.s*100)}" id="peLs"><i>${Math.round(L.s*100)}%</i></label>${L.type==='text'?`<div class="cchips">${['#ffffff','#141B34','#ffd34d','#ff5a7e','#3ddc84','#4aa3ff'].map(c=>`<button class="cc sw" data-c="${c}" style="--c:${c}"></button>`).join('')}</div>`:''}<div class="pe-row"><span class="pe-tip">끌어서 위치를 옮겨요</span><button class="cc" id="peLx">취소</button><button class="cc on" id="peLok">${I('check')}붙이기</button></div>`
      :`<div class="pe-grid two"><button class="pe-act" data-a="person">${I('user')}<b>다른 사진의 사람 넣기</b><small>AI가 사람만 오려서 붙여요</small></button><button class="pe-act" data-a="text">${I('chat')}<b>글자 넣기</b><small>날짜·장소·한마디</small></button></div>`;
    if(L){$('#peLs').oninput=e=>{L.s=e.target.value/100;e.target.nextElementSibling.textContent=e.target.value+'%';paint()};$('#peLx').onclick=()=>{S.layer=null;panel();paint()};
      $('#peLok').onclick=()=>{push();drawLayer(S.base.getContext('2d'),L,1);S.layer=null;thumbs();panel();paint();D.toast('붙였어요')};
      P.onclick=e=>{const c=e.target.closest('[data-c]');if(c&&L.type==='text'){L.col=c.dataset.c;L.cv=textCanvas(L.text,L.col);paint()}}}
    else P.onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a==='text'){const t=prompt('넣을 글자를 적어주세요','');if(!t)return;S.layer={type:'text',text:t,col:'#ffffff',cv:textCanvas(t,'#ffffff'),x:S.base.width/2,y:S.base.height*.85,s:1};panel();paint()}else{$('#peFile').onchange=async ev=>{const f=ev.target.files[0];ev.target.value='';if(f)await addPerson(f)};$('#peFile').click()}};return}
}

/* ---------- 자르기 ---------- */
function rot90(c,n){if(!n)return c;const o=n%2?mkC(c.height,c.width):mkC(c.width,c.height),x=o.getContext('2d');x.translate(o.width/2,o.height/2);x.rotate(n*Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2);return o}
function cropOut(c,maxSide){const src=c._r90&&c._r90v===c.r90&&c._b===S.ver?c._r90:(c._r90=rot90(S.base,c.r90),c._r90v=c.r90,c._b=S.ver,c._r90);const W=src.width,H=src.height,R=c.ratio||W/H;let cw,ch;if(W/H>R){ch=H;cw=ch*R}else{cw=W;ch=cw/R}
  const th=c.rot*Math.PI/180,auto=Math.abs(Math.cos(th))+Math.abs(Math.sin(th))*Math.max(R,1/R),z=c.zoom*auto,vw=cw/z,vh=ch/z;
  const mx=Math.max(0,(W-vw)/2),my=Math.max(0,(H-vh)/2);c.px=Math.max(-mx,Math.min(mx,c.px));c.py=Math.max(-my,Math.min(my,c.py));
  const k=Math.min(1,maxSide/Math.max(vw,vh)),o=mkC(vw*k,vh*k),x=o.getContext('2d');x.imageSmoothingQuality='high';x.translate(o.width/2,o.height/2);x.scale(k,k);x.rotate(th);if(c.flip)x.scale(-1,1);x.translate(-(W/2+c.px),-(H/2+c.py));x.drawImage(src,0,0);c._vw=vw;return o}

/* ---------- 손가락 입력 ---------- */
function pointer(){const o=$('#peO');let drag=null;
  const pos=e=>{const r=o.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
  o.addEventListener('pointerdown',e=>{if(!S)return;o.setPointerCapture(e.pointerId);const p=pos(e);
    if(S.tool==='erase'){S.strokes=S.strokes||[];S.strokes.push({w:S.brush,p:[p]});overlay()}
    else if(S.crop||S.layer)drag={p,px:S.crop?S.crop.px:0,py:S.crop?S.crop.py:0,lx:S.layer?S.layer.x:0,ly:S.layer?S.layer.y:0}});
  o.addEventListener('pointermove',e=>{if(!S)return;const p=pos(e);
    if(S.tool==='erase'&&S.strokes&&e.buttons){S.strokes[S.strokes.length-1].p.push(p);overlay();return}
    if(drag&&S.crop){const c=S.crop,sc=(c._vw||S.base.width)/1;c.px=drag.px-(p[0]-drag.p[0])*sc;c.py=drag.py-(p[1]-drag.p[1])*sc*(o.height/o.width)*(1);paint()}
    else if(drag&&S.layer){S.layer.x=drag.lx+(p[0]-drag.p[0])*S.base.width;S.layer.y=drag.ly+(p[1]-drag.p[1])*S.base.height;paint()}});
  const up=()=>{if(!S)return;drag=null;if(S.tool==='erase'&&S.strokes&&S.strokes.length)runErase()};
  o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up)}

/* ---------- 지우기: 패치 기반 내용 채우기 ---------- */
function runErase(){const B=S.base,m=mkC(B.width,B.height),x=m.getContext('2d');x.strokeStyle='#fff';x.lineCap='round';x.lineJoin='round';
  S.strokes.forEach(s=>{x.lineWidth=s.w*B.width;x.beginPath();s.p.forEach((p,i)=>i?x.lineTo(p[0]*B.width,p[1]*B.height):x.moveTo(p[0]*B.width,p[1]*B.height));if(s.p.length===1)x.lineTo(s.p[0][0]*B.width+.1,s.p[0][1]*B.height);x.stroke()});
  busy('지우는 중…');setTimeout(()=>{try{push();inpaint(B,m)}catch(e){console.error(e)}S.strokes=null;busy(false);thumbs();paint()},40)}
function inpaint(B,maskC){const W0=B.width,H0=B.height,md=maskC.getContext('2d').getImageData(0,0,W0,H0).data;let x0=W0,y0=H0,x1=-1,y1=-1;
  for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)if(md[(y*W0+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)return;const bw=x1-x0+1,bh=y1-y0+1,mg=Math.max(28,Math.round(Math.max(bw,bh)*.7));const rx=Math.max(0,x0-mg),ry=Math.max(0,y0-mg),rw=Math.min(W0,x1+mg+1)-rx,rh=Math.min(H0,y1+mg+1)-ry;
  const k=Math.min(1,300/Math.max(rw,rh)),W=Math.max(12,Math.round(rw*k)),H=Math.max(12,Math.round(rh*k));
  const ic=mkC(W,H),ix=ic.getContext('2d');ix.imageSmoothingQuality='high';ix.drawImage(B,rx,ry,rw,rh,0,0,W,H);const id=ix.getImageData(0,0,W,H),px=id.data;
  const mc=mkC(W,H),mx=mc.getContext('2d');mx.drawImage(maskC,rx,ry,rw,rh,0,0,W,H);const mm=mx.getImageData(0,0,W,H).data;
  const N=W*H,hole=new Uint8Array(N);for(let i=0;i<N;i++)hole[i]=mm[i*4+3]>8?1:0;
  /* 구멍 1칸 넓히기 */
  const h2=hole.slice();for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(hole[i])continue;if((x>0&&hole[i-1])||(x<W-1&&hole[i+1])||(y>0&&hole[i-W])||(y<H-1&&hole[i+W]))h2[i]=1}hole.set(h2);
  const R=new Float32Array(N),G=new Float32Array(N),Bl=new Float32Array(N);for(let i=0;i<N;i++){R[i]=px[i*4];G[i]=px[i*4+1];Bl[i]=px[i*4+2]}
  const conf=new Float32Array(N),offx=new Int16Array(N),offy=new Int16Array(N),has=new Uint8Array(N);for(let i=0;i<N;i++)conf[i]=hole[i]?0:1;
  const r=W>120?4:3,A=(2*r+1)*(2*r+1);
  /* 원본 후보: 구멍 없는 패치 중심 */
  const ii=new Int32Array((W+1)*(H+1));for(let y=0;y<H;y++){let s=0;for(let x=0;x<W;x++){s+=hole[y*W+x];ii[(y+1)*(W+1)+x+1]=ii[y*(W+1)+x+1]+s}}
  const holeIn=(cx,cy)=>{const a=cx-r,b=cy-r,c=cx+r+1,d=cy+r+1;return ii[d*(W+1)+c]-ii[b*(W+1)+c]-ii[d*(W+1)+a]+ii[b*(W+1)+a]};
  const cand=[];for(let y=r;y<H-r;y+=1)for(let x=r;x<W-r;x+=1)if(!holeIn(x,y))cand.push(y*W+x);
  if(!cand.length){diffuse();return finish()}
  let left=0;for(let i=0;i<N;i++)left+=hole[i];let guard=0;const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
  while(left>0&&guard++<20000){/* 경계에서 우선순위 높은 점 */let best=-1,bp=-1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!hole[i])continue;if(!((x>0&&!hole[i-1])||(x<W-1&&!hole[i+1])||(y>0&&!hole[i-W])||(y<H-1&&!hole[i+W])))continue;
      let c=0,n=0;for(let dy=-r;dy<=r;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-r;dx<=r;dx++){const xx=x+dx;if(xx<0||xx>=W)continue;c+=conf[yy*W+xx];n++}}const pr=c/A+rnd()*1e-3;if(pr>best){best=pr;bp=i}}
    if(bp<0)break;const px0=bp%W,py0=(bp/W)|0;
    /* 후보 모으기: 무작위 + 가까운 곳 + 이웃의 오프셋 */
    const tries=[];for(let t=0;t<500;t++)tries.push(cand[(rnd()*cand.length)|0]);
    for(let dy=-26;dy<=26;dy+=2)for(let dx=-26;dx<=26;dx+=2){const qx=px0+dx,qy=py0+dy;if(qx<r||qy<r||qx>=W-r||qy>=H-r)continue;if(!holeIn(qx,qy))tries.push(qy*W+qx)}
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=px0+dx,yy=py0+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=yy*W+xx;if(has[j]){const qx=px0+offx[j],qy=py0+offy[j];if(qx>=r&&qy>=r&&qx<W-r&&qy<H-r&&!holeIn(qx,qy))tries.push(qy*W+qx)}}
    let bd=1e30,bq=-1;for(const q of tries){const qx=q%W,qy=(q/W)|0;if(Math.abs(qx-px0)<=r&&Math.abs(qy-py0)<=r)continue;let d=0,n=0;
      for(let dy=-r;dy<=r&&d<bd;dy++){const yy=py0+dy;if(yy<0||yy>=H)continue;for(let dx=-r;dx<=r;dx++){const xx=px0+dx;if(xx<0||xx>=W)continue;const j=yy*W+xx;if(hole[j])continue;const s=(qy+dy)*W+qx+dx,a=R[j]-R[s],b=G[j]-G[s],e=Bl[j]-Bl[s];d+=a*a+b*b+e*e;n++}}
      if(n)d=d/n*(1+0.0008*((qx-px0)**2+(qy-py0)**2)**.5);if(n&&d<bd){bd=d;bq=q}}
    if(bq<0){diffuse();break}const qx=bq%W,qy=(bq/W)|0;
    for(let dy=-r;dy<=r;dy++){const yy=py0+dy;if(yy<0||yy>=H)continue;for(let dx=-r;dx<=r;dx++){const xx=px0+dx;if(xx<0||xx>=W)continue;const j=yy*W+xx;if(!hole[j])continue;const s=(qy+dy)*W+qx+dx;
      R[j]=R[s];G[j]=G[s];Bl[j]=Bl[s];hole[j]=0;conf[j]=best;offx[j]=qx-px0;offy[j]=qy-py0;has[j]=1;left--}}}
  if(left>0)diffuse();finish();
  function diffuse(){for(let it=0;it<200;it++)for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!hole[i])continue;let r2=0,g2=0,b2=0,n=0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=W||yy>=H)return;const j=yy*W+xx;if(hole[j]&&it<150)return;r2+=R[j];g2+=G[j];b2+=Bl[j];n++});if(n){R[i]=r2/n;G[i]=g2/n;Bl[i]=b2/n;if(it>=150)hole[i]=0}}}
  function finish(){for(let i=0;i<N;i++){px[i*4]=R[i];px[i*4+1]=G[i];px[i*4+2]=Bl[i]}ix.putImageData(id,0,0);
    /* 원래 크기로 키워서 칠한 부분만 부드럽게 덮기 */
    const up=mkC(rw,rh),ux=up.getContext('2d');ux.imageSmoothingQuality='high';ux.drawImage(ic,0,0,rw,rh);
    const fm=mkC(rw,rh),fx=fm.getContext('2d');fx.filter=`blur(${Math.max(1.5,2/k)}px)`;fx.drawImage(maskC,rx,ry,rw,rh,0,0,rw,rh);fx.filter='none';fx.globalCompositeOperation='source-over';
    const lay=mkC(rw,rh),lx=lay.getContext('2d');lx.drawImage(fm,0,0);lx.drawImage(fm,0,0);lx.globalCompositeOperation='source-in';lx.drawImage(up,0,0);
    /* 확대로 흐려진 결과에 원본 입자를 조금 섞기 */
    lx.globalCompositeOperation='source-atop';lx.globalAlpha=.08;for(let t=0;t<2;t++)lx.drawImage(B,rx+(t?3:-3),ry+(t?-2:2),rw,rh,0,0,rw,rh);
    B.getContext('2d').drawImage(lay,rx,ry)}}

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
  let m;busy('AI가 사람을 오리는 중…');try{m=await segment(c)}catch(e){busy(false);D.toast('AI 기능을 불러오지 못했어요');return}busy(false);if(!hasPerson(m)){D.toast('그 사진에서 사람을 찾지 못했어요');return}
  const cut=mkC(c.width,c.height),x=cut.getContext('2d');x.filter=`blur(${Math.max(1,c.width/500)}px)`;x.drawImage(m,0,0);x.filter='none';x.globalCompositeOperation='source-in';x.drawImage(c,0,0);
  /* 사람 있는 곳만 잘라내기 */
  const d=x.getImageData(0,0,cut.width,cut.height).data;let x0=cut.width,y0=cut.height,x1=0,y1=0;for(let y=0;y<cut.height;y+=2)for(let xx=0;xx<cut.width;xx+=2)if(d[(y*cut.width+xx)*4+3]>60){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;if(y>y1)y1=y}
  const t=mkC(x1-x0+1,y1-y0+1);t.getContext('2d').drawImage(cut,x0,y0,t.width,t.height,0,0,t.width,t.height);
  const s=Math.min(1,S.base.height*.6/t.height,S.base.width*.6/t.width);S.layer={type:'img',cv:t,x:S.base.width/2,y:S.base.height-t.height*s/2,s};panel();paint();D.toast('끌어서 위치를 옮기고 크기를 맞춰요')}
function textCanvas(t,col){const f=Math.round(S.base.width/14),c=mkC(10,10),x=c.getContext('2d');x.font=`800 ${f}px Pretendard,'Apple SD Gothic Neo',sans-serif`;const w=Math.ceil(x.measureText(t).width)+f;c.width=w;c.height=Math.round(f*1.6);
  const y=c.getContext('2d');y.font=`800 ${f}px Pretendard,'Apple SD Gothic Neo',sans-serif`;y.textBaseline='middle';y.textAlign='center';y.shadowColor='rgba(0,0,0,.45)';y.shadowBlur=f*.25;y.fillStyle=col;y.fillText(t,w/2,c.height/2);return c}
function layerBox(L){const w=L.cv.width*L.s,h=L.cv.height*L.s;return{x:L.x-w/2,y:L.y-h/2,w,h}}
function drawLayer(x,L,k){const b=layerBox(L);x.drawImage(L.cv,b.x*k,b.y*k,b.w*k,b.h*k)}

/* ---------- 저장 ---------- */
async function save(){if(S.crop){push();S.base=cropOut(S.crop,MAXS);S.crop=null}if(S.layer){push();drawLayer(S.base.getContext('2d'),S.layer,1);S.layer=null}
  busy('저장 준비 중…');await new Promise(r=>setTimeout(r,30));let out=S.base;const lo=lookObj();if(S.look!=='none'||!D.LOOKS.adjZero(S.adj)){try{out=cloneC(D.LOOKS.apply(S.base,lo,S.look==='none'?1:S.str))}catch(e){}}
  const blob=await new Promise(r=>out.toBlob(r,'image/jpeg',.92)),baseBlob=await new Promise(r=>S.base.toBlob(r,'image/jpeg',.95));busy(false);const o=S.o,st={look:S.look,str:S.str,adj:Object.assign({},S.adj)};close(true);o.onSave&&o.onSave(blob,baseBlob,st)}

window.PhotoEditor={init:d=>{D=d},open,segment,inpaint};
})();
