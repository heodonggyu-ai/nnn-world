/* 작품·인플루언서 스타일 가이드 팩 — 구도 카메라(photo/)와 인생샷 남친(namchin/)이 같이 씀.
   샘플 그림은 각 기법을 설명하려고 직접 그린 일러스트예요(실제 작품 사진 아님). */
(function(){
const TAU=Math.PI*2;
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g}
function vg(c,w,h,stops,y0=0,y1=h){c.fillStyle=lg(c,0,y0,0,y1,stops);c.fillRect(0,y0,w,y1-y0)}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function poly(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function glow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function rnd(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function bokeh(c,w,h,n,seed,cols,y0=0,y1=1){const r=rnd(seed);for(let i=0;i<n;i++)glow(c,r()*w,(y0+r()*(y1-y0))*h,6+r()*w*.08,cols[i%cols.length])}

/* ---- 사람 그리기 (h = 키, fy = 발 위치) ---- */
const ST={lk:[[-.05,-.25],[-.06,0]],rk:[[.05,-.25],[.06,0]]};
const POSES={
  stand:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.14,-.63],[.13,-.46]]},
  walk:{lk:[[-.07,-.24],[-.13,0]],rk:[[.05,-.24],[.11,-.02]],la:[[-.13,-.63],[-.08,-.48]],ra:[[.15,-.62],[.21,-.49]]},
  jump:{lk:[[-.14,-.37],[-.07,-.2]],rk:[[.12,-.31],[.21,-.2]],la:[[-.2,-.96],[-.26,-1.12]],ra:[[.2,-.96],[.26,-1.12]]},
  punch:{lk:[[-.1,-.24],[-.16,0]],rk:[[.08,-.25],[.14,0]],la:[[.02,-.67],[.09,-.83]],ra:[[.27,-.79],[.45,-.79]]},
  arms:{...ST,la:[[-.22,-.87],[-.33,-.99]],ra:[[.22,-.87],[.33,-.99]]},
  hold:{...ST,la:[[-.12,-.62],[-.02,-.67]],ra:[[.12,-.62],[.02,-.67]]},
  sit:{lk:[[-.2,-.45],[.04,-.41]],rk:[[.2,-.45],[-.04,-.41]],la:[[-.15,-.62],[-.18,-.47]],ra:[[.15,-.62],[.18,-.47]]},
  phone:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.15,-.7],[.07,-.88]]},
};
function person(c,x,fy,h,o={}){
  const d=o.dir||1,P=POSES[o.pose||'stand'],X=v=>x+v*h*d,Y=v=>fy+v*h;
  const one=o.sil||o.ghost,sk=one||o.skin||'#efc19f',cl=one||o.col||'#3b4a6b',pa=one||o.pants||'#2b2f3a',ha=one||o.hair||'#2b1d17';
  c.save();c.lineCap='round';c.lineJoin='round';
  c.strokeStyle=pa;c.lineWidth=h*.075;
  [[-.045,P.lk],[.045,P.rk]].forEach(([hx,k])=>{c.beginPath();c.moveTo(X(hx),Y(-.47));c.lineTo(X(k[0][0]),Y(k[0][1]));c.lineTo(X(k[1][0]),Y(k[1][1]));c.stroke()});
  if(o.dress)poly(c,[[X(-.12),Y(-.83)],[X(.12),Y(-.83)],[X(.17),Y(-.3)],[X(-.17),Y(-.3)]],cl);
  else poly(c,[[X(-.12),Y(-.83)],[X(.12),Y(-.83)],[X(.085),Y(-.44)],[X(-.085),Y(-.44)]],cl);
  c.strokeStyle=cl;c.lineWidth=h*.055;
  [[-.11,P.la],[.11,P.ra]].forEach(([sx,a])=>{c.beginPath();c.moveTo(X(sx),Y(-.8));c.lineTo(X(a[0][0]),Y(a[0][1]));c.lineTo(X(a[1][0]),Y(a[1][1]));c.stroke();
    if(o.gloves)circ(c,X(a[1][0]),Y(a[1][1]),h*.045,one||'#d8262e');else circ(c,X(a[1][0]),Y(a[1][1]),h*.026,sk)});
  if(o.pose==='phone')rect(c,X(.03)-h*.03,Y(-.95),h*.06,h*.1,one||'#111');
  const hr=h*.07,hx=X(o.look?.01:0),hy=Y(-.93);
  circ(c,hx,hy,hr,sk);
  if(o.back){circ(c,hx,hy,hr*1.05,ha);if(o.long)rect(c,hx-hr*1.05,hy,hr*2.1,hr*1.6,ha)}
  else{c.fillStyle=ha;c.beginPath();c.arc(hx-(o.look?d*hr*.25:0),hy-hr*.15,hr*1.05,Math.PI,0);c.fill();
    if(o.long){rect(c,hx-hr*1.1,hy-hr*.2,hr*.4,hr*1.7,ha);rect(c,hx+hr*.7,hy-hr*.2,hr*.4,hr*1.7,ha)}
    if(!one&&h>70){const e=o.look?[[d*hr*.35]]:[[-hr*.35],[hr*.35]];e.forEach(([ex])=>circ(c,hx+ex,hy+hr*.05,Math.max(1,hr*.1),'#2b1d17'));
      if(o.smile){c.strokeStyle='#b5536a';c.lineWidth=Math.max(1,hr*.12);c.beginPath();c.arc(hx+(o.look?d*hr*.3:0),hy+hr*.35,hr*.3,.2,Math.PI-.2);c.stroke()}}}
  c.restore();
}

/* ---- 가이드 그리기 도구 ---- */
function G(c,W,H,col,lw,sample){
  const g={c,W,H,col,lw};
  g.L=(x1,y1,x2,y2,a)=>{c.save();if(a!=null)c.globalAlpha=a;c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke();c.restore()};
  g.D=on=>c.setLineDash(on?[lw*4,lw*3]:[]);
  g.dot=(x,y,r)=>{c.beginPath();c.arc(x*W,y*H,r||lw*3.2,0,TAU);c.fill()};
  g.ring=(x,y,r)=>{c.beginPath();c.arc(x*W,y*H,r*Math.min(W,H),0,TAU);c.stroke();g.dot(x,y)};
  g.T=(t,x,y,cl,al)=>{if(!sample)y=Math.min(Math.max(y,.17),.9);c.save();c.font=`800 ${Math.max(11,W/25)}px sans-serif`;c.textAlign=al||'start';c.fillStyle=cl||col;c.fillText(t,x*W,y*H);c.restore()};
  g.R=(x,y,w,h)=>c.strokeRect(x*W,y*H,w*W,h*H);
  g.E=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x*W,y*H,rx*W,ry*H,0,0,TAU);c.stroke()};
  g.thirds=(a=.28)=>{[1/3,2/3].forEach(t=>{g.L(t,0,t,1,a);g.L(0,t,1,t,a)})};
  g.P=(x,fy,h,o={})=>{if(sample)return;const t=document.createElement('canvas');t.width=W;t.height=H;person(t.getContext('2d'),x*W,fy*H,h*H,Object.assign({},o,{ghost:col}));c.save();c.globalAlpha=.42;c.shadowBlur=0;c.drawImage(t,0,0);c.restore()};
  g.A=(x1,y1,x2,y2,cl)=>{c.save();if(cl){c.strokeStyle=cl;c.fillStyle=cl}c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke();const a=Math.atan2((y2-y1)*H,(x2-x1)*W),k=lw*5;
    c.beginPath();c.moveTo(x2*W,y2*H);c.lineTo(x2*W-k*Math.cos(a-.5),y2*H-k*Math.sin(a-.5));c.moveTo(x2*W,y2*H);c.lineTo(x2*W-k*Math.cos(a+.5),y2*H-k*Math.sin(a+.5));c.stroke();c.restore()};
  g.shade=(x,y,w,h,a=.22)=>{c.save();c.globalAlpha=a;c.fillRect(x*W,y*H,w*W,h*H);c.restore()};
  return g;
}
const GRN='rgba(120,255,170,.95)',RED='rgba(255,120,120,.95)';

/* ---- 스타일 목록 ---- */
const S=[
/* ===== 인물·인플루언서 ===== */
{id:'back_walk',cat:'people',name:'뒷모습 워킹샷',who:'여행 인플루언서 클래식',
 desc:'길 위를 걸어가는 뒷모습. 길이 시선을 사람에게 끌고 가서 얼굴 없이도 분위기가 살아요.',
 steps:['길 한가운데를 천천히 걸어가게 하기','폰은 허리 높이, 길이 화면 아래 모서리에서 시작하게','연사로 — 한 발이 들린 순간이 예뻐요'],phone:'허리 높이',target:[.5,.62],
 ments:['저 끝까지 천천히 걸어가봐','뒤 돌아보지 말고 그냥 걸어!','머리 한쪽으로 넘기면서 걸어'],
 scene(c,w,h){vg(c,w,h,['#9cc8ef','#f3e9d8'],0,h*.45);poly(c,[[0,h*.45],[w,h*.45],[w,h],[0,h]],'#c9b79c');
   poly(c,[[w*.18,h],[w*.82,h],[w*.53,h*.45],[w*.47,h*.45]],'#8d8577');for(let i=0;i<7;i++){const t=i/7,y=h*.45+h*.55*t*t;rect(c,w*.5-1-t*3,y,2+t*6,h*.02+t*h*.03,'#f2efe6')}
   for(let i=1;i<6;i++){const t=i/6,y=h*.45+h*.55*t*t,s=8+t*70;[w*.47-w*.4*t-s*.4,w*.53+w*.4*t+s*.4].forEach(x=>{rect(c,x-s*.06,y-s,s*.12,s,'#6b4a2b');circ(c,x,y-s,s*.42,'#4f8f4a')})}
   person(c,w*.5,h*.8,h*.3,{pose:'walk',back:1,long:1,col:'#f4f0e6',pants:'#5b6f95',dress:1,hair:'#3a2418'})},
 guide(g){g.thirds(.2);[[0,1],[1,1],[.2,1],[.8,1]].forEach(([x,y])=>g.L(x,y,.5,.45,.7));g.P(.5,.8,.3,{pose:'walk',back:1});g.T('길 = 시선 유도선',.04,.08)}},
{id:'look_back',cat:'people',name:'걷다가 뒤돌아보기',who:'패션 스냅·인스타 인기 포즈',
 desc:'걸어가다가 어깨 너머로 돌아보는 순간. 움직임과 표정이 같이 담겨요.',
 steps:['그녀를 1/3 선에, 가는 방향에 여백 두기','"걸어가다 내 쪽으로 돌아봐" 하고 연사','머리카락이 날리는 순간이 베스트'],phone:'가슴 높이',target:[1/3,.4],face:1,
 ments:['걸어가다가 천천히 나 돌아봐','어깨 너머로 웃어줘','머리 넘기면서 돌아봐'],
 scene(c,w,h){vg(c,w,h,['#f4d9c6','#e7b9a5']);rect(c,0,h*.82,w,h*.18,'#b98d7a');for(let i=0;i<6;i++)rect(c,w*(.05+i*.17),h*.12,w*.1,h*.22,'rgba(255,255,255,.35)');
   person(c,w/3,h*.97,h*.72,{pose:'walk',dir:1,look:1,smile:1,long:1,col:'#2f2f38',pants:'#d9c7b4',hair:'#3a2418'})},
 guide(g){g.thirds();g.P(1/3,.97,.72,{pose:'walk',look:1});g.A(.48,.3,.9,.3,GRN);g.T('가는 방향 여백',.52,.26,GRN)}},
{id:'low_long',cat:'people',name:'로우앵글 다리 길게',who:'패션 인플루언서 필수 기술',
 desc:'폰을 낮게 두고 위로 올려 찍으면 다리가 길고 키가 커 보여요. 발끝은 화면 맨 아래에.',
 steps:['폰을 정강이 높이로 내리고 렌즈를 살짝 위로','발끝을 화면 맨 아래에 붙이기','머리 위는 조금만 남기기'],phone:'무릎 아래',target:[.5,.14],face:1,
 ments:['한 발 앞으로 내밀어봐','턱 살짝 당기고 나 봐줘','한쪽 다리에 체중 실어'],
 scene(c,w,h){vg(c,w,h,['#6fa8e8','#cfe6fb'],0,h*.8);rect(c,0,h*.8,w,h*.2,'#d8d2c7');rect(c,w*.05,h*.3,w*.16,h*.5,'#e9e4dc');rect(c,w*.8,h*.24,w*.18,h*.56,'#e3ddd3');
   person(c,w*.5,h*.97,h*.86,{pose:'walk',col:'#f2e2d3',pants:'#2e3b5a',hair:'#2b1d17',long:1,smile:1})},
 guide(g){g.D(1);g.L(0,.8,1,.8,.6);g.D(0);g.P(.5,.97,.86,{pose:'walk'});g.T('✓ 발끝 = 화면 끝',.04,.985,GRN);g.T('📱 정강이 높이',.04,.08,GRN)}},
{id:'wide_hip',cat:'people',name:'0.5x 광각 힙샷',who:'2025~26 유행 · 광각 스냅',
 desc:'0.5x 광각으로 아래에서. 다리가 엄청 길어지고 배경 건물이 위로 쭉 모여요. 사람은 꼭 가운데에.',
 steps:['카메라를 0.5x로 바꾸고 바닥 가까이','사람은 정가운데 — 가장자리는 늘어나요','한 발을 렌즈 쪽으로 내밀면 다리가 더 길게'],phone:'바닥 가까이 · 0.5x',target:[.5,.16],face:1,
 ments:['한 발 렌즈 쪽으로 쭉!','위에서 나 내려다봐','손으로 브이 하고 렌즈 쪽으로'],
 scene(c,w,h){vg(c,w,h,['#5aa0f0','#bfe0ff']);poly(c,[[-w*.2,h],[w*.32,h],[w*.42,0],[w*.05,0]],'#e6dfd3');poly(c,[[w*1.2,h],[w*.68,h],[w*.58,0],[w*.95,0]],'#d9d1c3');
   for(let i=0;i<6;i++){const y=h*(.1+i*.14);rect(c,w*(.12+i*.02),y,w*.08,h*.06,'rgba(80,110,150,.5)');rect(c,w*(.8-i*.02),y,w*.08,h*.06,'rgba(80,110,150,.5)')}
   rect(c,0,h*.9,w,h*.1,'#bdb4a6');person(c,w*.5,h*1.02,h*.95,{pose:'walk',col:'#ff8a5c',pants:'#2a2f45',hair:'#1f1612',smile:1})},
 guide(g){[[0,1],[1,1]].forEach(([x,y])=>g.L(x,y,.5,-.25,.6));g.D(1);g.L(.5,0,.5,1,.5);g.D(0);g.P(.5,1.02,.95,{pose:'walk'});g.T('사람은 가운데 (가장자리 ✕)',.04,.08)}},
{id:'mirror_selfie',cat:'people',name:'거울 셀카 전신',who:'OOTD 계정 필수샷',
 desc:'전신 거울로 코디를 보여주는 셀카. 폰 화면이 수직, 거울 테두리가 화면과 평행해야 깔끔해요.',
 steps:['거울에서 두 걸음 떨어지기','폰을 가슴 높이로 들고 수직으로 세우기','거울 테두리를 화면 가장자리와 평행하게'],phone:'가슴 높이 · 수직',target:[.5,.2],face:1,
 ments:['폰으로 얼굴 반만 가려봐','한쪽 다리 살짝 굽혀','거울 속 나 말고 폰 화면 봐'],
 scene(c,w,h){rect(c,0,0,w,h,'#efe6dc');rect(c,0,h*.86,w,h*.14,'#c8b39b');rect(c,w*.16,h*.04,w*.68,h*.88,'#c9a77c');vg(c,w,h,['#f7f1ea','#e2d7ca'],h*.06,h*.9);rect(c,w*.16,h*.04,w*.03,h*.88,'#c9a77c');rect(c,w*.81,h*.04,w*.03,h*.88,'#c9a77c');
   rect(c,w*.19,h*.06,w*.62,h*.84,'rgba(255,255,255,.0)');person(c,w*.5,h*.88,h*.76,{pose:'phone',col:'#1f1f25',pants:'#d6cbb9',hair:'#3a2418',long:1})},
 guide(g){g.R(.17,.04,.66,.88);g.D(1);g.L(.5,0,.5,1,.4);g.D(0);g.P(.5,.88,.76,{pose:'phone'});g.T('거울 테두리 = 평행',.04,.03+.0)}},
{id:'window_sil',cat:'people',name:'창가 실루엣',who:'영화 스틸컷 감성',
 desc:'밝은 창을 배경으로 사람을 까맣게. 옆모습 윤곽(코·턱선)이 살아나서 영화 장면처럼 보여요.',
 steps:['그녀를 창 옆에 옆으로 세우기','화면에서 창문의 밝은 곳을 탭 → 사람이 까맣게','코·턱선이 창 밝은 부분에 겹치게'],phone:'가슴 높이',target:[.38,.3],
 ments:['창밖 바라봐줘','고개 살짝 들어봐','커튼 살짝 잡아봐'],
 scene(c,w,h){rect(c,0,0,w,h,'#1b1a1f');vg(c,w,h,['#fff4dc','#ffd59a','#f3b27a'],h*.12,h*.78);rect(c,0,0,w*.3,h,'#1b1a1f');rect(c,w*.92,0,w*.08,h,'#1b1a1f');rect(c,w*.3,0,w*.62,h*.12,'#1b1a1f');rect(c,w*.3,h*.78,w*.62,h*.22,'#1b1a1f');
   rect(c,w*.6,h*.12,w*.02,h*.66,'#1b1a1f');rect(c,w*.3,h*.44,w*.62,h*.015,'#1b1a1f');person(c,w*.4,h*1.0,h*.78,{sil:'#0d0c10',dir:1,look:1,long:1})},
 guide(g){g.R(.3,.12,.62,.66);g.P(.4,1,.78,{look:1});g.T('창의 밝은 곳 탭 → 노출 고정',.04,.06)}},
{id:'env_portrait',cat:'people',name:'공간이 말하는 인물',who:'애니 리버비츠식 환경 인물사진',
 desc:'그 사람이 일하거나 좋아하는 공간을 같이 담아요. 사람은 1/3, 나머지 공간이 이야기를 해요. 관장님 체육관 사진에 딱!',
 steps:['그 사람의 공간(체육관·카페·작업실)에서','사람은 1/3 선, 장비·소품이 보이게','카메라를 보게 하거나 하던 일을 계속하게'],phone:'가슴 높이',target:[1/3,.3],face:1,
 ments:['평소 하던 대로 해봐','글러브 끼고 나 봐줘','팔짱 끼고 자신있게'],
 scene(c,w,h){rect(c,0,0,w,h,'#24222a');glow(c,w*.5,h*.1,w*.8,'rgba(255,230,180,.25)');rect(c,0,h*.84,w,h*.16,'#3a3640');
   [['#d8262e',.52],['#eee',.58],['#2a5bd7',.64]].forEach(([cl,y])=>rect(c,w*.42,h*y,w*.58,h*.012,cl));rect(c,w*.42,h*.45,w*.02,h*.4,'#888');
   rect(c,w*.76,h*.05,w*.012,h*.12,'#777');c.fillStyle='#7a1e24';c.beginPath();c.roundRect(w*.7,h*.17,w*.14,h*.36,w*.05);c.fill();
   person(c,w/3,h*.95,h*.72,{gloves:1,pose:'hold',col:'#111',pants:'#222',hair:'#1f1612',smile:1})},
 guide(g){g.thirds();g.P(1/3,.95,.72,{pose:'hold'});g.shade(.5,0,.5,1,.08);g.T('공간 = 이야기',.6,.08)}},
{id:'eye_portrait',cat:'people',name:'눈빛 정면 클로즈업',who:'스티브 매커리식 인물 사진',
 desc:'단순한 배경, 부드러운 그늘빛, 렌즈를 똑바로 보는 눈. 눈을 위 1/3 선에 두고 눈에 초점.',
 steps:['그늘진 곳(부드러운 빛) + 단순한 배경','눈을 위 1/3 선, 렌즈를 똑바로 보게','화면에서 눈을 탭해서 초점'],phone:'눈높이 · 2x',target:[.5,.42],face:1,
 ments:['렌즈 똑바로 봐줘','웃지 말고 그냥 봐','숨 한번 쉬고 편하게'],
 scene(c,w,h){vg(c,w,h,['#2f6f73','#1f4f55']);const u=h*.6;c.fillStyle='#8a3b2e';c.beginPath();c.ellipse(w*.5,h*1.05,w*.5,h*.3,0,0,TAU);c.fill();
   c.fillStyle='#d9a582';c.beginPath();c.ellipse(w*.5,h*.45,w*.25,h*.22,0,0,TAU);c.fill();c.fillStyle='#2a1a14';c.beginPath();c.ellipse(w*.5,h*.3,w*.3,h*.14,0,Math.PI,0);c.fill();
   c.fillStyle='#b8352b';c.beginPath();c.moveTo(w*.18,h*.32);c.quadraticCurveTo(w*.5,h*.05,w*.82,h*.32);c.lineTo(w*.9,h*.8);c.lineTo(w*.78,h*.8);c.lineTo(w*.74,h*.38);c.quadraticCurveTo(w*.5,h*.18,w*.26,h*.38);c.lineTo(w*.22,h*.8);c.lineTo(w*.1,h*.8);c.closePath();c.fill();
   [[-1],[1]].forEach(([s])=>{circ(c,w*(.5+s*.1),h*.42,w*.035,'#fff');circ(c,w*(.5+s*.1),h*.42,w*.02,'#3d6e4f');circ(c,w*(.5+s*.1),h*.42,w*.009,'#111')});
   c.strokeStyle='#8a5a44';c.lineWidth=3;c.beginPath();c.moveTo(w*.45,h*.55);c.lineTo(w*.55,h*.55);c.stroke()},
 guide(g){g.D(1);g.L(0,1/3+.08,1,1/3+.08,.8);g.D(0);g.E(.5,.45,.26,.23);g.T('눈높이',.04,1/3+.06);g.T('👁 눈을 탭해서 초점',.04,.95,GRN)}},
{id:'candid_laugh',cat:'people',name:'캔디드 웃음',who:'웨딩·다큐 스냅 작가들의 방식',
 desc:'"하나 둘 셋" 없이 대화하다 터지는 진짜 웃음. 요즘 피드는 꾸민 사진보다 자연스러운 순간이 대세예요.',
 steps:['"하나 둘 셋" 금지 — 웃긴 얘기 하면서','연사로 계속 찍고 나중에 고르기','시선은 카메라 밖, 보는 쪽에 여백'],phone:'가슴 높이 · 2x',target:[2/3,.35],face:1,
 ments:['어제 그 웃긴 얘기 다시 해봐','저기 강아지 봐!','나 말고 저쪽 보면서 웃어'],
 scene(c,w,h){vg(c,w,h,['#a9cf8f','#5f9446']);bokeh(c,w,h,18,11,['rgba(255,255,210,.45)','rgba(255,240,180,.35)'],0,.7);
   person(c,w*2/3,h*1.05,h*.8,{dir:-1,look:1,smile:1,long:1,col:'#f6d36b',pants:'#5a6b8c',hair:'#4a2e1e',pose:'hold'})},
 guide(g){g.thirds();g.P(2/3,1.05,.8,{dir:-1,look:1,pose:'hold'});g.A(.5,.3,.12,.3,GRN);g.T('보는 쪽 여백',.12,.26,GRN);g.T('⚡ 연사로 계속',.04,.95,GRN)}},
{id:'detail_hands',cat:'people',name:'손·디테일 컷',who:'포토덤프·브이로그 감성',
 desc:'얼굴 대신 손, 커피잔, 꽃다발, 반지만 크게. 사진 여러 장 묶어 올릴 때 꼭 들어가는 한 장이에요.',
 steps:['얼굴은 빼고 손과 소품만 크게','배경은 단순하게, 2x 줌으로','손은 화면 아래 1/3 쪽에'],phone:'눈높이 · 2x',target:[.5,.62],
 ments:['컵 두 손으로 감싸봐','반지 낀 손 보여줘','꽃다발 살짝 기울여'],
 scene(c,w,h){vg(c,w,h,['#efe4d6','#d9c7b2']);rect(c,0,h*.72,w,h*.28,'#a07650');for(let i=0;i<5;i++)rect(c,0,h*(.75+i*.05),w,2,'rgba(0,0,0,.08)');
   c.fillStyle='#f2efe9';c.beginPath();c.roundRect(w*.38,h*.5,w*.24,h*.22,10);c.fill();rect(c,w*.38,h*.5,w*.24,h*.03,'#6b4423');c.strokeStyle='#f2efe9';c.lineWidth=w*.03;c.beginPath();c.arc(w*.64,h*.6,w*.05,-1.2,1.2);c.stroke();
   c.lineCap='round';c.strokeStyle='#c9b8e8';c.lineWidth=w*.13;c.beginPath();c.moveTo(-w*.05,h*1.05);c.lineTo(w*.3,h*.7);c.stroke();c.beginPath();c.moveTo(w*1.05,h*1.05);c.lineTo(w*.7,h*.7);c.stroke();
   c.fillStyle='#efc19f';c.beginPath();c.ellipse(w*.37,h*.63,w*.06,h*.06,.5,0,TAU);c.fill();c.beginPath();c.ellipse(w*.63,h*.63,w*.06,h*.06,-.5,0,TAU);c.fill();
   glow(c,w*.5,h*.48,w*.1,'rgba(255,255,255,.4)')},
 guide(g){g.thirds();g.E(.5,.62,.22,.13);g.T('얼굴 ✕ · 손과 소품만',.04,.08)}},
{id:'jump_sky',cat:'people',name:'하늘 배경 점프샷',who:'여행 단체·커플 인기샷',
 desc:'바닥 가까이에서 하늘을 크게 넣고 점프! 하늘이 2/3, 사람은 아래쪽 1/3에서 공중에.',
 steps:['폰을 바닥 가까이 — 하늘이 2/3','연사 켜고 "하나 둘 점프!" 세 번','무릎이 굽혀진 가장 높은 순간 고르기'],phone:'바닥 가까이',target:[.5,.38],face:1,
 ments:['하나 둘 셋 점프!','팔 쫙 펴고 점프','다리 뒤로 접어서 점프!'],
 scene(c,w,h){vg(c,w,h,['#3f8fe8','#a7d4ff','#e8f5ff'],0,h*.86);circ(c,w*.78,h*.18,w*.1,'rgba(255,255,255,.7)');circ(c,w*.86,h*.2,w*.08,'rgba(255,255,255,.7)');rect(c,0,h*.86,w,h*.14,'#6fb35a');
   person(c,w*.5,h*.72,h*.45,{pose:'jump',col:'#ff6f91',pants:'#2b3a5a',smile:1,long:1,hair:'#3a2418'})},
 guide(g){g.D(1);g.L(0,.86,1,.86,.6);g.D(0);g.P(.5,.72,.45,{pose:'jump'});g.T('하늘 2/3',.04,.1);g.T('📱 바닥에 거의 붙이기',.04,.95,GRN)}},
{id:'golden_backlight',cat:'people',name:'골든아워 역광',who:'웨딩·여행 작가들의 해질녘 공식',
 desc:'해 지기 30분 전, 해를 그녀 머리 옆에 걸치면 머리카락이 금빛으로 빛나요.',
 steps:['해 지기 30분 전에 나가기','해를 그녀 머리 옆이나 뒤에 걸치기','얼굴이 어두우면 얼굴 탭 → 밝기 ☀️ 올리기'],phone:'가슴 높이',target:[1/3,.33],face:1,
 ments:['해 쪽으로 반쯤 돌아봐','머리카락 바람에 날리게','눈 감고 햇살 느껴봐'],
 scene(c,w,h){vg(c,w,h,['#f7b267','#f79d65','#f4845f'],0,h*.7);glow(c,w*.45,h*.28,w*.5,'rgba(255,240,190,.9)');circ(c,w*.44,h*.27,w*.06,'#fff6d8');vg(c,w,h,['#c76b3c','#7a3f26'],h*.7,h);
   [[.6,.18],[.7,.12],[.8,.08]].forEach(([s,a])=>glow(c,w*(.44+s*.5),h*(.27+s*.4),w*.05,`rgba(255,220,160,${a*3})`));
   person(c,w/3,h*1.0,h*.72,{col:'#fbe7d0',pants:'#e9d5bf',hair:'#5a3a20',long:1,dress:1,look:1,dir:1,smile:1});glow(c,w*.36,h*.3,w*.12,'rgba(255,215,140,.5)')},
 guide(g){g.thirds();g.P(1/3,1,.72,{look:1});g.ring(.44,.27,.06);g.T('☀️ 해를 머리 옆에',.5,.2)}},
{id:'sport_peak',cat:'people',name:'스포츠 피크 순간',who:'스포츠 사진가 기법 (복싱·운동)',
 desc:'펀치가 다 뻗은 순간, 발이 땅을 차는 순간. 연사로 피크를 잡고, 움직이는 방향에 공간을 둬요.',
 steps:['연사 필수 — 동작 시작 전부터 누르고 있기','폰은 허리 높이, 살짝 아래에서','주먹이 향하는 쪽에 빈 공간'],phone:'허리 높이 · 연사',target:[1/3,.3],face:1,
 ments:['원투 세게!','미트 정확히 쳐봐','스텝 밟으면서 잽'],
 scene(c,w,h){rect(c,0,0,w,h,'#17161c');glow(c,w*.4,h*.2,w*.7,'rgba(255,240,200,.25)');rect(c,0,h*.86,w,h*.14,'#2a2730');
   [['#d8262e',.6],['#eee',.67],['#2a5bd7',.74]].forEach(([cl,y])=>rect(c,0,h*y,w,h*.012,cl));
   c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(w*(.45+i*.02),h*(.3+i*.025));c.lineTo(w*(.62+i*.03),h*(.3+i*.025));c.stroke()}
   person(c,w/3,h*.95,h*.75,{pose:'punch',gloves:1,col:'#111',pants:'#c22',hair:'#1f1612'})},
 guide(g){g.thirds();g.P(1/3,.95,.75,{pose:'punch',gloves:1});g.A(.62,.36,.95,.36,GRN);g.T('움직이는 방향 여백',.55,.31,GRN);g.T('⚡ 연사',.04,.95,GRN)}},

/* ===== 거리·작가 ===== */
{id:'decisive',cat:'street',name:'결정적 순간',who:'앙리 카르티에브레송',
 desc:'멋진 배경(계단·벽·그림자)을 먼저 찾아 구도를 고정하고, 사람이 딱 좋은 자리에 들어올 때까지 기다려요.',
 steps:['배경을 먼저 찾아 구도 고정','사람이 노란 원(교차점)에 들어올 때까지 기다리기','들어오기 직전부터 연사'],phone:'자유',target:[2/3,2/3],
 scene(c,w,h){rect(c,0,0,w,h,'#d8d2c4');for(let i=0;i<12;i++){const y=h*(.35+i*.055);poly(c,[[0,y],[w*(.9-i*.04),y],[w*(.9-i*.04),y+h*.03],[0,y+h*.03]],i%2?'#bdb5a3':'#cfc7b6')}
   c.strokeStyle='#4a4339';c.lineWidth=5;c.beginPath();c.moveTo(0,h*.32);c.quadraticCurveTo(w*.6,h*.3,w*.95,h*.98);c.stroke();rect(c,0,0,w,h*.3,'#e8e2d4');
   person(c,w*2/3,h*.78,h*.2,{pose:'walk',sil:'#222'})},
 guide(g){g.thirds(.4);g.L(0,.32,.95,.98,.5);g.ring(2/3,2/3,.08);g.T('사람이 여기 오면 찰칵',.36,.82)}},
{id:'shadow_geo',cat:'street',name:'빛과 그림자',who:'판 호(Fan Ho)',
 desc:'낮은 햇빛이 만드는 빛줄기 속으로 사람이 들어오는 순간. 밝은 곳에 노출을 맞춰 그림자는 까맣게.',
 steps:['해가 낮은 아침·저녁, 골목·계단의 빛줄기 찾기','화면의 밝은 곳을 탭 → 그림자 까맣게','사람이 빛 안에 들어올 때 찰칵'],phone:'자유',target:[.62,.72],
 scene(c,w,h){rect(c,0,0,w,h,'#141316');poly(c,[[w*.15,0],[w*.45,0],[w*.95,h],[w*.4,h]],'rgba(255,236,200,.85)');
   c.fillStyle='rgba(20,19,22,.9)';for(let i=0;i<5;i++)c.fillRect(0,h*(.15+i*.18),w,h*.015);
   person(c,w*.62,h*.82,h*.24,{sil:'#141316',pose:'walk'});poly(c,[[w*.6,h*.82],[w*.66,h*.82],[w*.98,h*.98],[w*.9,h*.98]],'rgba(20,19,22,.85)')},
 guide(g){g.D(1);g.L(.15,0,.4,1,.6);g.L(.45,0,.95,1,.6);g.D(0);g.ring(.62,.72,.07);g.T('빛줄기 안으로 들어올 때',.04,.06)}},
{id:'through_fg',cat:'street',name:'유리·비 너머로',who:'솔 레이터(Saul Leiter)',
 desc:'젖은 유리창, 나뭇잎, 간판을 렌즈 바로 앞에 걸쳐 흐릿한 색 덩어리 사이로 주인공을 엿보듯 찍어요.',
 steps:['렌즈 바로 앞에 유리·잎·우산을 걸치기','초점은 화면의 사람을 탭','전경이 화면의 1/4~1/3을 덮게'],phone:'자유',target:[.62,.6],
 scene(c,w,h){vg(c,w,h,['#6d6a63','#4a4844']);rect(c,w*.55,h*.2,w*.4,h*.5,'#8a857a');person(c,w*.62,h*.8,h*.28,{pose:'walk',col:'#2b2b30',sil:null});
   c.fillStyle='#c7302a';c.beginPath();c.arc(w*.62,h*.52,w*.09,Math.PI,0);c.fill();
   glow(c,w*.12,h*.4,w*.42,'rgba(30,28,26,.95)');glow(c,w*.2,h*.05,w*.4,'rgba(170,40,30,.75)');glow(c,w*.05,h*.9,w*.35,'rgba(40,60,50,.9)');
   const r=rnd(5);for(let i=0;i<40;i++)glow(c,r()*w,r()*h,2+r()*6,'rgba(255,255,255,.35)')},
 guide(g){g.shade(0,0,.32,1,.25);g.shade(.32,0,.68,.18,.25);g.ring(.62,.6,.07);g.T('흐린 전경',.04,.5);g.T('주인공',.68,.74)}},
{id:'reflection',cat:'street',name:'물웅덩이 반영',who:'비비안 마이어 · 반영 사진',
 desc:'비 온 뒤 물웅덩이에 폰을 거의 닿게 대면 세상이 거꾸로 하나 더 생겨요.',
 steps:['물웅덩이 바로 위에 폰을 거의 닿게','폰을 뒤집으면(카메라가 아래) 더 낮게 가능','경계선을 화면 가운데에'],phone:'물웅덩이 바로 위',target:[.5,.38],
 scene(c,w,h){const top=(cc)=>{vg(cc,w,h,['#2c3e66','#e48a5a'],0,h*.5);[[.05,.25,.18],[.25,.18,.15],[.62,.22,.2],[.84,.3,.16]].forEach(([x,y,ww])=>rect(cc,w*x,h*y,w*ww,h*(.5-y),'#1c2238'));
     for(let i=0;i<20;i++)rect(cc,w*(.08+(i%10)*.09),h*(.3+Math.floor(i/10)*.08),4,6,'#ffd27a');person(cc,w*.5,h*.5,h*.16,{sil:'#0f121c'})};
   top(c);c.save();c.translate(0,h);c.scale(1,-1);c.globalAlpha=.65;top(c);c.restore();rect(c,0,h*.5,w,h*.5,'rgba(20,30,50,.35)');
   c.strokeStyle='rgba(255,255,255,.25)';for(let i=0;i<6;i++){c.beginPath();c.ellipse(w*.5,h*(.6+i*.06),w*(.2+i*.06),h*.008,0,0,TAU);c.stroke()}},
 guide(g){g.L(0,.5,1,.5,.9);g.T('물웅덩이 경계 = 가운데',.04,.48);g.P(.5,.5,.16,{});g.T('📱 물에 거의 닿게',.04,.95,GRN)}},
{id:'symmetry_pastel',cat:'street',name:'정중앙 대칭 파스텔',who:'웨스 앤더슨 영화 스타일',
 desc:'파스텔 건물 정면에 똑바로 서서 모든 걸 정가운데로. 사람도 정면, 정가운데.',
 steps:['건물 정면 정가운데에 서기','세로선·가로선을 화면과 평행하게(수평계 확인)','사람도 정가운데에서 정면 보기'],phone:'가슴 높이 · 정면',target:[.5,.6],face:1,
 ments:['정면 보고 똑바로 서봐','무표정으로!','두 손 모으고 가만히'],
 scene(c,w,h){rect(c,0,0,w,h,'#f6c6c9');rect(c,0,0,w,h*.08,'#e9a9ae');rect(c,0,h*.86,w,h*.14,'#e3d3b8');
   [[.1,.15],[.7,.15],[.1,.45],[.7,.45]].forEach(([x,y])=>{rect(c,w*x,h*y,w*.2,h*.2,'#fff7e8');rect(c,w*x+4,h*y+4,w*.2-8,h*.2-8,'#9dc5d6')});
   rect(c,w*.38,h*.38,w*.24,h*.48,'#d26a78');rect(c,w*.4,h*.4,w*.2,h*.46,'#e9939f');circ(c,w*.5,h*.32,w*.07,'#fff7e8');
   person(c,w*.5,h*.92,h*.3,{col:'#f3d26b',pants:'#6a4c93',hair:'#2b1d17',pose:'hold'})},
 guide(g){g.L(.5,0,.5,1,.9);g.D(1);g.L(0,.5,1,.5,.5);g.L(.1,0,.1,1,.4);g.L(.9,0,.9,1,.4);g.D(0);g.P(.5,.92,.3,{pose:'hold'});g.T('정중앙 · 정면',.53,.06)}},
{id:'frame_arch',cat:'street',name:'아치·문 프레임',who:'건축·여행 사진가 단골 기법',
 desc:'어두운 아치나 문 안쪽에서 밝은 바깥의 사람을 찍어요. 테두리가 시선을 가운데로 모아줘요.',
 steps:['아치·문·터널 안쪽으로 한 걸음 들어가기','테두리가 화면 네 변을 감싸게','사람은 밝은 쪽 가운데나 1/3에'],phone:'가슴 높이',target:[.5,.62],
 scene(c,w,h){vg(c,w,h,['#9fd0ff','#f8f0dc'],0,h*.6);rect(c,0,h*.6,w,h*.4,'#e2c9a0');rect(c,w*.55,h*.3,w*.3,h*.3,'#f2e3c8');
   person(c,w*.5,h*.82,h*.26,{col:'#3a7bd5',pants:'#eee',long:1});
   c.fillStyle='#3b2a20';c.beginPath();c.rect(0,0,w,h);c.moveTo(w*.15,h*.95);c.lineTo(w*.15,h*.35);c.quadraticCurveTo(w*.15,h*.1,w*.5,h*.1);c.quadraticCurveTo(w*.85,h*.1,w*.85,h*.35);c.lineTo(w*.85,h*.95);c.closePath();c.fill('evenodd')},
 guide(g){const{c,W,H}=g;c.beginPath();c.moveTo(.15*W,.95*H);c.lineTo(.15*W,.35*H);c.quadraticCurveTo(.15*W,.1*H,.5*W,.1*H);c.quadraticCurveTo(.85*W,.1*H,.85*W,.35*H);c.lineTo(.85*W,.95*H);c.stroke();g.P(.5,.82,.26,{});g.T('어두운 테두리',.04,.06)}},
{id:'night_trails',cat:'street',name:'야경 불빛 라인',who:'블루아워 도시 사진',
 desc:'해 지고 20분(블루아워), 하늘이 파랄 때 도로·불빛 라인이 사람에게 모이게.',
 steps:['해 지고 10~30분 사이 블루아워','야간모드 켜고 팔꿈치를 몸에 붙이기','도로·불빛이 사람 쪽으로 모이게'],phone:'허리 높이 · 야간모드',target:[1/3,.6],
 scene(c,w,h){vg(c,w,h,['#0d1b3d','#27407a','#4a5fa0'],0,h*.6);[[.0,.3,.2],[.18,.2,.16],[.6,.15,.22],[.82,.28,.18]].forEach(([x,y,ww])=>{rect(c,w*x,h*y,w*ww,h*(.62-y),'#0b1226');for(let i=0;i<8;i++)rect(c,w*(x+.02+(i%3)*ww/3.2),h*(y+.03+Math.floor(i/3)*.07),3,5,'#ffd27a')});
   rect(c,0,h*.6,w,h*.4,'#151a2a');c.lineWidth=4;[['#ff4d4d',.0],['#ffd27a',.06],['#fff',.12]].forEach(([cl,o])=>{c.strokeStyle=cl;c.beginPath();c.moveTo(w*(1-o),h);c.quadraticCurveTo(w*.6,h*.7,w*.45,h*.62);c.stroke()});
   person(c,w/3,h*.86,h*.3,{sil:'#05070d'})},
 guide(g){const{c,W,H}=g;c.beginPath();c.moveTo(W,H);c.quadraticCurveTo(.6*W,.7*H,.45*W,.62*H);c.stroke();g.P(1/3,.86,.3,{});g.T('🌙 야간모드 · 숨 참기',.04,.06)}},

/* ===== 풍경 ===== */
{id:'depth_landscape',cat:'land',name:'전경·중경·원경',who:'안셀 아담스식 풍경 깊이',
 desc:'발밑의 꽃·바위(전경), 호수(중경), 산(원경) 세 층을 다 담으면 사진에 깊이가 생겨요.',
 steps:['발밑의 꽃·바위를 화면 아래에 크게','폰을 낮춰 전경을 키우기','수평선(산 아래)은 1/3 선에'],phone:'무릎 높이',
 scene(c,w,h){vg(c,w,h,['#5b8fd0','#d6e8f7'],0,h*.4);poly(c,[[0,h*.42],[w*.2,h*.18],[w*.38,h*.36],[w*.6,h*.12],[w*.82,h*.32],[w,h*.22],[w,h*.45],[0,h*.45]],'#4d5f7a');
   poly(c,[[w*.55,h*.17],[w*.6,h*.12],[w*.65,h*.17]],'#fff');vg(c,w,h,['#5d9bc4','#2e6f99'],h*.44,h*.66);rect(c,0,h*.62,w,h*.38,'#5c8a42');
   poly(c,[[0,h],[0,h*.78],[w*.2,h*.7],[w*.42,h*.82],[w*.5,h]],'#6b6458');const r=rnd(3);for(let i=0;i<30;i++)circ(c,r()*w,h*(.78+r()*.2),3+r()*5,['#ffd34d','#ff6f91','#fff'][i%3])},
 guide(g){g.L(0,1/3+.1,1,1/3+.1,.7);g.L(0,.66,1,.66,.7);g.T('원경 (산)',.04,.12);g.T('중경 (호수)',.04,.6);g.T('전경 (꽃·바위)',.04,.95)}},
{id:'minimal_space',cat:'land',name:'미니멀 여백',who:'마이클 케나식 미니멀리즘',
 desc:'화면의 80%를 비우고 작은 주인공 하나만. 안개 낀 날·눈 오는 날·단색 벽이 최고예요.',
 steps:['배경이 단순한 곳(안개·하늘·바다·벽)','주인공은 작게, 교차점 하나에','80%는 비워두기 — 채우고 싶은 욕심 참기'],phone:'자유',target:[2/3,2/3],
 scene(c,w,h){vg(c,w,h,['#e9e6e1','#cfd6dc']);rect(c,0,h*.7,w,h*.3,'rgba(150,165,180,.35)');
   c.strokeStyle='#2c2f35';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*(.55+i*.03),h*.68);c.lineTo(w*(.55+i*.03),h*.74);c.stroke()}rect(c,w*.53,h*.665,w*.16,4,'#2c2f35');person(c,w*.66,h*.665,h*.07,{sil:'#2c2f35'})},
 guide(g){g.thirds(.35);g.ring(2/3,2/3,.05);g.shade(0,0,1,.55,.08);g.T('여  백  80%',.3,.3)}},

/* ===== 음식·소품 ===== */
{id:'flatlay',cat:'food',name:'탑뷰 플랫레이',who:'푸드·카페 인플루언서',
 desc:'바로 위에서 수직으로. 메인 접시·컵·소품이 삼각형을 이루게 놓으면 균형이 잡혀요.',
 steps:['폰을 바닥과 평행하게(수평계 확인)','메인 접시를 1/3 교차점에','컵·소품 2개를 놓아 삼각형 만들기'],phone:'바로 위 · 수평',
 scene(c,w,h){rect(c,0,0,w,h,'#ecebe8');c.strokeStyle='rgba(0,0,0,.05)';for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,h*i/8);c.bezierCurveTo(w*.3,h*i/8+20,w*.6,h*i/8-20,w,h*i/8+10);c.stroke()}
   circ(c,w*.38,h*.4,w*.22,'#fff');circ(c,w*.38,h*.4,w*.17,'#f3e6cf');circ(c,w*.33,h*.36,w*.05,'#e8574a');circ(c,w*.43,h*.44,w*.05,'#7fb65a');circ(c,w*.4,h*.33,w*.04,'#f2c14e');
   circ(c,w*.74,h*.66,w*.1,'#fff');circ(c,w*.74,h*.66,w*.075,'#6b4423');rect(c,w*.18,h*.72,w*.2,h*.12,'#b9d3e6');rect(c,w*.62,h*.18,w*.02,h*.2,'#c0c0c0')},
 guide(g){g.thirds(.35);const{c,W,H}=g;g.D(1);c.beginPath();c.moveTo(.38*W,.4*H);c.lineTo(.74*W,.66*H);c.lineTo(.28*W,.78*H);c.closePath();c.stroke();g.D(0);g.dot(.38,.4);g.dot(.74,.66);g.dot(.28,.78);g.T('📱 바닥과 평행',.04,.06,GRN)}},
{id:'cafe45',cat:'food',name:'카페 45도 컷',who:'카페 투어 계정 기본샷',
 desc:'컵을 아래 1/3, 창가 빛과 흐린 배경을 위쪽에. 45도 각도에서 2x 줌.',
 steps:['창가 자리, 빛이 옆에서 들어오게','폰을 45도로, 2x 줌','컵은 아래 1/3 교차점, 배경은 흐리게'],phone:'눈높이 45° · 2x',target:[2/3,2/3],
 scene(c,w,h){vg(c,w,h,['#f6efe4','#e8d8c4'],0,h*.6);bokeh(c,w,h,12,4,['rgba(255,250,230,.8)','rgba(200,220,190,.6)'],0,.55);rect(c,0,h*.6,w,h*.4,'#b98a5f');
   c.fillStyle='#fff';c.beginPath();c.ellipse(w*2/3,h*.8,w*.16,h*.035,0,0,TAU);c.fill();c.fillStyle='#f4efe8';c.beginPath();c.moveTo(w*.56,h*.6);c.lineTo(w*.77,h*.6);c.lineTo(w*.74,h*.79);c.lineTo(w*.59,h*.79);c.closePath();c.fill();
   c.fillStyle='#c8a27a';c.beginPath();c.ellipse(w*.665,h*.6,w*.105,h*.02,0,0,TAU);c.fill();circ(c,w*.66,h*.6,w*.025,'#fff')},
 guide(g){g.thirds();g.E(2/3,.7,.13,.12);g.T('흐린 배경 + 빛',.04,.1)}},
{id:'hand_landmark',cat:'food',name:'손에 든 간식 + 명소',who:'여행 인플루언서 인증샷',
 desc:'아이스크림·음료를 든 손은 앞에 크게, 명소는 뒤에 작게. 둘 다 보이게 대각선으로.',
 steps:['손은 화면 아래 왼쪽에 크게','명소는 반대편 위 1/3에','초점은 손(간식)에 — 명소는 살짝 흐려도 OK'],phone:'팔 뻗어서',target:[.3,.62],
 scene(c,w,h){vg(c,w,h,['#9fd0ff','#eaf6ff'],0,h*.7);rect(c,0,h*.7,w,h*.3,'#d9cdb8');c.fillStyle='#7d6f62';c.beginPath();c.moveTo(w*.68,h*.68);c.lineTo(w*.72,h*.12);c.lineTo(w*.76,h*.68);c.fill();rect(c,w*.64,h*.66,w*.16,h*.04,'#7d6f62');
   c.fillStyle='#efc19f';c.beginPath();c.ellipse(w*.3,h*.86,w*.14,h*.1,-.3,0,TAU);c.fill();rect(c,w*.12,h*.9,w*.2,h*.12,'#efc19f');
   poly(c,[[w*.22,h*.78],[w*.38,h*.78],[w*.3,h*.95]],'#d9a066');circ(c,w*.3,h*.72,w*.09,'#ffb3c7');circ(c,w*.27,h*.66,w*.06,'#fff1c2')},
 guide(g){g.thirds();g.L(.3,.75,.72,.3,.5);g.ring(.3,.72,.09);g.ring(.72,.3,.05);g.T('손 = 앞',.04,.6);g.T('명소 = 뒤',.62,.12)}},
/* ===== 🎬 영화감독 연출 ===== */
{id:'kubrick_1pt',cat:'film',name:'1점 투시 정중앙',who:'스탠리 큐브릭',
 desc:'복도·길·터널의 모든 선이 화면 정중앙 한 점으로 모이게. 완벽한 대칭이 긴장감을 만들어요.',
 steps:['복도·지하도·가로수길의 정가운데에 서기','모든 선이 모이는 점을 화면 정중앙에','사람은 소실점 바로 앞, 정면으로'],phone:'가슴 높이 · 정면',target:[.5,.5],
 scene(c,w,h){poly(c,[[0,0],[w,0],[w*.62,h*.38],[w*.38,h*.38]],'#f2ede2');poly(c,[[0,h],[w,h],[w*.62,h*.62],[w*.38,h*.62]],'#8b2f2f');
   poly(c,[[0,0],[w*.38,h*.38],[w*.38,h*.62],[0,h]],'#d9cfbd');poly(c,[[w,0],[w*.62,h*.38],[w*.62,h*.62],[w,h]],'#cfc4b0');rect(c,w*.38,h*.38,w*.24,h*.24,'#f8f4ea');
   for(let i=1;i<6;i++){const t=i/6,x=w*.38*t;c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;c.beginPath();c.moveTo(x,h*.38*t);c.lineTo(x,h-h*.38*t);c.stroke();c.beginPath();c.moveTo(w-x,h*.38*t);c.lineTo(w-x,h-h*.38*t);c.stroke()}
   c.strokeStyle='rgba(255,210,120,.35)';for(let i=0;i<5;i++){const y=h*(.62+i*.08);c.beginPath();c.moveTo(w*.5-(y-h*.62)*.6-w*.12,y);c.lineTo(w*.5+(y-h*.62)*.6+w*.12,y);c.stroke()}
   person(c,w*.5,h*.66,h*.2,{col:'#f2c23a',pants:'#f2c23a',dress:1,long:1})},
 guide(g){[[0,0],[1,0],[0,1],[1,1]].forEach(([x,y])=>g.L(x,y,.5,.5,.7));g.R(.38,.38,.24,.24);g.dot(.5,.5);g.D(1);g.L(.5,0,.5,1,.4);g.D(0);g.T('소실점 = 정중앙',.04,.08)}},
{id:'wkw_neon',cat:'film',name:'네온 · 흔들린 빛',who:'왕가위 감독 (화양연화·중경삼림)',
 desc:'네온 불빛 아래 살짝 흔들린 화면, 앞을 가리는 흐린 불빛. 감정이 번지는 듯한 밤 사진이에요.',
 steps:['간판·네온이 많은 골목에서 밤에','사람 앞에 흐린 불빛(전경)을 걸치기','야간모드로 찍고 살짝 흔들려도 OK'],phone:'가슴 높이 · 야간',target:[.35,.3],face:1,
 ments:['간판 쪽 보고 멍하니 서 있어봐','담배 대신 빨대 물고 딴 데 봐','천천히 걸어가봐'],
 scene(c,w,h){rect(c,0,0,w,h,'#0b0f14');glow(c,w*.72,h*.22,w*.55,'rgba(255,40,90,.65)');glow(c,w*.18,h*.75,w*.5,'rgba(40,255,160,.35)');glow(c,w*.6,h*.6,w*.3,'rgba(255,190,60,.35)');
   const r=rnd(8);for(let i=0;i<14;i++){c.strokeStyle=`rgba(${r()>.5?'255,80,120':'90,255,200'},.35)`;c.lineWidth=2+r()*4;const y=r()*h;c.beginPath();c.moveTo(r()*w*.3,y);c.lineTo(w*.4+r()*w*.6,y+r()*6);c.stroke()}
   c.save();c.globalAlpha=.3;person(c,w*.39,h*1.05,h*.85,{col:'#3a1214',hair:'#0a0a0a',long:1,look:1});c.restore();person(c,w*.35,h*1.05,h*.85,{col:'#5a1a1e',pants:'#111',hair:'#0a0a0a',long:1,look:1});
   glow(c,w*.97,h*.55,w*.35,'rgba(255,200,80,.55)')},
 guide(g){g.thirds();g.ring(.35,.3,.08);g.shade(.8,0,.2,1,.2);g.P(.35,1.05,.85,{look:1});g.T('흐린 불빛 걸치기',.62,.5)}},
{id:'ozu_low',cat:'film',name:'다다미 로우 카메라',who:'오즈 야스지로',
 desc:'방바닥에 앉은 사람보다 더 낮은 곳에서, 움직이지 않는 정면 카메라. 문틀이 그림 액자처럼 사람을 감싸요.',
 steps:['폰을 바닥 가까이 — 앉은 사람 눈보다 낮게','문틀·창틀을 화면 세로선과 평행하게','움직이지 말고 고정해서 기다리기'],phone:'바닥 가까이 · 고정',target:[.35,.5],face:1,
 ments:['편하게 앉아서 차 마셔','둘이 마주보고 얘기해','창밖 보면서 가만히'],
 scene(c,w,h){rect(c,0,0,w,h*.8,'#e8dcc4');for(let i=0;i<4;i++)for(let j=0;j<3;j++)rect(c,w*(.32+i*.09),h*(.12+j*.12),w*.08,h*.11,'#f7f1e2');
   vg(c,w,h,['#cbb882','#b39f68'],h*.8,h);for(let i=0;i<4;i++)rect(c,0,h*(.82+i*.05),w,2,'rgba(80,60,20,.25)');
   [.06,.28,.72,.94].forEach(x=>rect(c,w*x-5,0,10,h*.8,'#4a3020'));rect(c,0,h*.08,w,8,'#4a3020');
   person(c,w*.35,h*.8+h*.38*.41,h*.38,{pose:'sit',col:'#6b6b7a',pants:'#3b3b46',hair:'#2b2b2b'});person(c,w*.66,h*.8+h*.36*.41,h*.36,{pose:'sit',dir:-1,col:'#a8786a',pants:'#5a4636',hair:'#1f1612',long:1})},
 guide(g){g.L(0,.8,1,.8,.8);[.28,.72].forEach(x=>g.L(x,0,x,.8,.6));g.P(.35,.8+.38*.41,.38,{pose:'sit'});g.T('📱 바닥 가까이',.04,.08,GRN)}},
{id:'bong_stairs',cat:'film',name:'계단 · 위아래의 대비',who:'봉준호 감독식 수직 구도',
 desc:'끝없이 내려가는 계단과 좁은 벽. 위와 아래의 대비로 이야기를 만드는 수직 구도예요.',
 steps:['계단 맨 위에서 아래를 내려다보며','양쪽 벽이 화면 세로선과 평행하게','사람은 계단 중간쯤 작게'],phone:'눈높이 · 아래로',target:[.5,.42],
 scene(c,w,h){rect(c,0,0,w,h,'#2b2d30');poly(c,[[0,0],[w*.3,0],[w*.3,h],[0,h]],'#3d4044');poly(c,[[w,0],[w*.7,0],[w*.7,h],[w,h]],'#35383c');
   for(let i=0;i<22;i++){const t=i/22,y=h*(.12+t*.88),hw=w*(.06+t*.14);rect(c,w*.5-hw,y,hw*2,h*.04*(.4+t),i%2?'#6e6a63':'#8a857c')}
   c.strokeStyle='rgba(200,210,230,.25)';c.lineWidth=1.5;const r=rnd(2);for(let i=0;i<60;i++){const x=r()*w,y=r()*h;c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+18);c.stroke()}
   person(c,w*.5,h*.5,h*.13,{back:1,col:'#1e1e22',pants:'#1e1e22'})},
 guide(g){g.L(.3,0,.3,1,.7);g.L(.7,0,.7,1,.7);g.L(.44,.12,.3,1,.5);g.L(.56,.12,.7,1,.5);g.ring(.5,.42,.06);g.T('세로선 평행',.04,.08)}},
{id:'leone_eyes',cat:'film',name:'눈만 꽉 익스트림 클로즈업',who:'세르지오 레오네 (서부극)',
 desc:'두 눈만 화면 가로로 꽉 채우는 극단적 클로즈업. 대결 직전 같은 긴장감이 생겨요.',
 steps:['2x~3x 줌으로 두 눈만 가로로 꽉','눈썹부터 코끝 사이만 남기기','눈을 탭해서 초점 + 숨 참고'],phone:'눈높이 · 2x~3x',target:[.5,.5],face:1,
 ments:['나 노려봐!','눈 크게 뜨지 말고 가늘게','진지하게 3초만'],
 scene(c,w,h){rect(c,0,0,w,h,'#c98b62');rect(c,0,0,w,h*.22,'#2a1c14');vg(c,w,h,['rgba(42,28,20,.8)','rgba(42,28,20,0)'],h*.22,h*.34);
   [[.27],[.73]].forEach(([x])=>{c.fillStyle='#3a2416';c.beginPath();c.ellipse(w*x,h*.36,w*.17,h*.03,0,0,TAU);c.fill();
     c.fillStyle='#f2e8dc';c.beginPath();c.ellipse(w*x,h*.48,w*.15,h*.05,0,0,TAU);c.fill();circ(c,w*x,h*.48,h*.045,'#5b3b22');circ(c,w*x,h*.48,h*.02,'#0c0806');circ(c,w*x+4,h*.47,3,'#fff');
     c.strokeStyle='#8a5634';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.moveTo(w*(x+(x<.5?-.17:.17)),h*(.47+k*.02));c.lineTo(w*(x+(x<.5?-.24:.24)),h*(.45+k*.03));c.stroke()}});
   poly(c,[[w*.47,h*.42],[w*.53,h*.42],[w*.56,h*.75],[w*.44,h*.75]],'#b87a52');const r=rnd(6);for(let i=0;i<120;i++)circ(c,r()*w,h*(.66+r()*.34),1.2,'#5a3a26')},
 guide(g){g.shade(0,0,1,.3,.25);g.shade(0,.66,1,.34,.25);g.L(0,.48,1,.48,.6);g.T('눈만 가로로 꽉',.04,.4)}},
{id:'villeneuve_scale',cat:'film',name:'거대한 공간 속 작은 사람',who:'드니 빌뇌브 (듄·블레이드 러너 2049)',
 desc:'압도적인 건물·자연 앞에 사람은 점처럼 작게. 안개·노을 같은 단색 분위기면 더 영화 같아요.',
 steps:['거대한 건물·벽·바위 앞에서 멀리 떨어지기','사람은 화면 아래 가운데에 아주 작게','안개 낀 날, 해질녘 단색 하늘이 최고'],phone:'멀리서 · 2x',target:[.5,.76],
 scene(c,w,h){vg(c,w,h,['#b8562a','#e39a55','#f2c98f']);rect(c,w*.22,h*.06,w*.56,h*.72,'rgba(70,38,22,.88)');rect(c,w*.05,h*.4,w*.12,h*.38,'rgba(90,50,28,.6)');rect(c,w*.84,h*.3,w*.12,h*.48,'rgba(90,50,28,.6)');
   vg(c,w,h,['rgba(240,180,110,.0)','rgba(240,180,110,.5)'],h*.5,h*.8);rect(c,0,h*.78,w,h*.22,'#b0703a');person(c,w*.5,h*.8,h*.06,{sil:'#26140a'})},
 guide(g){g.thirds(.2);g.ring(.5,.77,.03);g.T('사람은 아주 작게',.04,.08)}},
{id:'malick_magic',cat:'film',name:'매직아워 손끝',who:'테렌스 맬릭',
 desc:'해 지기 직전 낮은 햇살 속, 풀잎을 쓸고 지나가는 손끝. 얼굴 없이도 감정이 전해져요.',
 steps:['해 지기 20~30분 전, 해를 마주보고','손이나 머리카락이 풀·빛에 닿는 순간','폰을 낮춰 풀 사이로, 해는 위쪽 구석에'],phone:'허리 아래 · 역광',target:[.32,.72],
 scene(c,w,h){vg(c,w,h,['#ffe0a8','#ffb46e','#d98a4b']);glow(c,w*.76,h*.28,w*.5,'rgba(255,250,220,.95)');circ(c,w*.76,h*.28,w*.05,'#fffbe8');
   const r=rnd(12);c.lineWidth=2;for(let i=0;i<160;i++){const x=r()*w,top=h*(.45+r()*.3);c.strokeStyle=`rgba(${120+r()*80|0},${90+r()*60|0},40,.85)`;c.beginPath();c.moveTo(x,h);c.quadraticCurveTo(x+6,top+40,x+r()*14-7,top);c.stroke()}
   c.fillStyle='#e9b58f';c.beginPath();c.ellipse(w*.22,h*.86,w*.13,h*.06,-.8,0,TAU);c.fill();[0,1,2,3].forEach(k=>{c.strokeStyle='#e9b58f';c.lineWidth=w*.03;c.lineCap='round';c.beginPath();c.moveTo(w*(.26+k*.02),h*(.82-k*.01));c.lineTo(w*(.32+k*.03),h*(.72-k*.02));c.stroke()});
   glow(c,w*.33,h*.7,w*.12,'rgba(255,240,200,.6)')},
 guide(g){g.ring(.32,.72,.09);g.ring(.76,.28,.05);g.T('☀️ 해는 위 구석',.5,.18);g.T('손끝',.2,.6)}},
{id:'park_overhead',cat:'film',name:'바로 위에서 탑샷',who:'박찬욱 감독식 오버헤드 샷',
 desc:'누워 있는 사람을 바로 위에서 수직으로. 무늬 있는 바닥·이불·꽃이 그림처럼 깔려요.',
 steps:['침대·꽃밭·무늬 바닥에 눕게 하기','폰을 바로 위에서 바닥과 평행하게(수평계 초록)','팔을 펼치거나 머리카락을 퍼뜨리기'],phone:'바로 위 · 수평',target:[.5,.2],face:1,
 ments:['눈 감고 팔 벌려봐','머리카락 펼쳐볼게','나 올려다보면서 웃어'],
 scene(c,w,h){rect(c,0,0,w,h,'#2f5d50');for(let i=0;i<8;i++)for(let j=0;j<10;j++)if((i+j)%2)rect(c,w*i/8,h*j/10,w/8,h/10,'#3a6e60');
   c.fillStyle='#f3ead9';c.beginPath();c.roundRect(w*.14,h*.06,w*.72,h*.9,14);c.fill();const r=rnd(4);for(let i=0;i<26;i++)circ(c,w*(.16+r()*.68),h*(.08+r()*.86),5+r()*7,['#e8574a','#f2c14e','#d77fa1'][i%3]);
   person(c,w*.5,h*.9,h*.78,{pose:'arms',col:'#b8352b',pants:'#b8352b',dress:1,long:1,hair:'#1f1612',smile:1})},
 guide(g){g.R(.14,.06,.72,.9);g.D(1);g.L(.5,0,.5,1,.5);g.L(0,.5,1,.5,.5);g.D(0);g.P(.5,.9,.78,{pose:'arms'});g.T('📱 바로 위 · 수평',.04,.08,GRN)}},
{id:'spielberg_sil',cat:'film',name:'큰 달·해 앞 실루엣',who:'스티븐 스필버그식 실루엣',
 desc:'커다란 해나 달을 배경으로 언덕 위 사람을 까만 실루엣으로. 줌을 당겨 멀리서 찍을수록 해가 커져요.',
 steps:['멀리 떨어져서 3x 이상 줌','사람을 언덕·난간 위에, 해·달 앞에 겹치기','하늘 밝은 곳 탭 → 사람은 까맣게'],phone:'멀리서 · 최대 줌',target:[.55,.6],
 scene(c,w,h){vg(c,w,h,['#1b1f4a','#7a3f6e','#f2995a']);glow(c,w*.58,h*.47,w*.45,'rgba(255,220,160,.45)');circ(c,w*.58,h*.47,w*.3,'#ffe2a8');
   poly(c,[[0,h*.78],[w*.3,h*.72],[w*.6,h*.73],[w,h*.8],[w,h],[0,h]],'#0d0a14');person(c,w*.52,h*.735,h*.16,{sil:'#0d0a14',pose:'arms'});person(c,w*.63,h*.735,h*.13,{sil:'#0d0a14'})},
 guide(g){g.L(0,.74,1,.74,.7);g.ring(.58,.47,.3);g.T('해·달 앞에 겹치기',.04,.08)}},
{id:'miyazaki_sky',cat:'film',name:'뭉게구름 하늘 70%',who:'지브리 애니메이션풍 하늘',
 desc:'파란 하늘과 커다란 뭉게구름이 화면의 70%. 사람은 초록 언덕 위에 작게, 바람에 날리는 머리카락.',
 steps:['맑고 구름 많은 날, 언덕·들판에서','폰을 낮춰 하늘을 크게(지평선은 아래)','사람은 1/3 선에 작게, 바람 부는 순간'],phone:'허리 아래',target:[1/3,.68],
 ments:['모자 잡고 하늘 봐','팔 벌리고 바람 맞아봐','저 멀리 걸어가봐'],
 scene(c,w,h){vg(c,w,h,['#2f86de','#8fcaff','#d6efff']);const cl=(x,y,s)=>{[[0,0,1],[-.8,.3,.7],[.8,.3,.75],[-.4,-.4,.7],[.4,-.5,.8],[0,.4,.8]].forEach(([dx,dy,k])=>circ(c,x+dx*s,y+dy*s,s*k,'#ffffff'));circ(c,x,y+s*.6,s*.9,'rgba(200,220,240,.6)')};
   cl(w*.6,h*.32,w*.16);cl(w*.18,h*.18,w*.08);vg(c,w,h,['#7cc35c','#4f9a3c'],h*.8,h);c.fillStyle='#7cc35c';c.beginPath();c.ellipse(w*.3,h*.82,w*.5,h*.06,0,Math.PI,0);c.fill();
   rect(c,w*.82,h*.7,6,h*.1,'#5a3d22');circ(c,w*.82+3,h*.68,w*.07,'#3f8a3a');person(c,w/3,h*.81,h*.14,{col:'#fff',pants:'#fff',dress:1,long:1,hair:'#3a2418'})},
 guide(g){g.L(0,.8,1,.8,.7);g.P(1/3,.81,.14,{});g.T('하늘 70%',.04,.1)}},
{id:'tarantino_trunk',cat:'film',name:'트렁크 샷 (아래에서 위로)',who:'쿠엔틴 타란티노',
 desc:'트렁크 안에서 올려다본 듯, 아래에서 위로 찍어 사람들이 렌즈를 내려다보게. 친구·커플 장난샷에 딱.',
 steps:['폰을 바닥·상자 안에 두고 위를 보게','사람들이 렌즈를 내려다보게 둘러서기','0.5x 광각이면 더 웃기게 나와요'],phone:'바닥에서 위로 · 0.5x',target:[.5,.45],face:1,
 ments:['다 같이 나 내려다봐!','놀란 표정!','"뭐야 이거" 하는 표정'],
 scene(c,w,h){vg(c,w,h,['#7fb8f0','#d9eeff']);rect(c,0,0,w,h*.1,'#1a1a1a');rect(c,0,h*.9,w,h*.1,'#1a1a1a');rect(c,0,0,w*.06,h,'#1a1a1a');rect(c,w*.94,0,w*.06,h,'#1a1a1a');
   [[.27,.36,'#c4515b','#3a2418'],[.73,.34,'#3b4a6b','#1f1612'],[.5,.66,'#4d8a5a','#2b1d17']].forEach(([x,y,cl,hr])=>{const cx=w*x,cy=h*y,dx=cx-w*.5,dy=cy-h*.5,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,R=w*.14;
     c.fillStyle=cl;c.beginPath();c.ellipse(cx+ux*R*1.5,cy+uy*R*1.5,R*1.5,R*1.1,Math.atan2(uy,ux)+Math.PI/2,0,TAU);c.fill();circ(c,cx,cy,R,'#efc19f');
     c.fillStyle=hr;c.beginPath();c.arc(cx,cy,R*1.05,Math.atan2(uy,ux)-1.4,Math.atan2(uy,ux)+1.4);c.fill();
     [-1,1].forEach(k=>circ(c,cx-ux*R*.25+(-uy)*k*R*.35,cy-uy*R*.25+ux*k*R*.35,R*.1,'#2b1d17'));circ(c,cx-ux*R*.6,cy-uy*R*.6,R*.16,'#b5536a')})},
 guide(g){g.R(.06,.1,.88,.8);g.ring(.5,.45,.18);g.T('📱 바닥에서 위로',.08,.95,GRN)}},

/* ===== 📷 사진 거장 ===== */
{id:'avedon_white',cat:'master',name:'흰 벽 앞 정면 인물',who:'리처드 아베던',
 desc:'아무것도 없는 하얀 벽 앞, 정면을 똑바로 보는 상반신. 배경이 없어서 표정과 옷이 전부가 돼요.',
 steps:['흰 벽에서 한두 걸음 떨어져 서기(그림자 안 생기게)','그늘진 밝은 곳, 정면으로','얼굴은 위 1/3, 무표정이나 진짜 표정'],phone:'가슴 높이 · 정면',target:[.5,.25],face:1,
 ments:['렌즈 똑바로 보고 무표정','방금 생각난 웃긴 거 떠올려','팔짱 끼고 당당하게'],
 scene(c,w,h){rect(c,0,0,w,h,'#f7f7f5');person(c,w*.5,h*1.45,h*1.3,{col:'#151515',pants:'#151515',hair:'#1f1612',pose:'hold'})},
 guide(g){g.E(.5,.24,.2,.11);g.D(1);g.L(0,1/3-.1,1,1/3-.1,.6);g.D(0);g.T('흰 벽 · 정면',.04,.5)}},
{id:'lindbergh_bw',cat:'master',name:'흑백 자연광 클로즈업',who:'피터 린드버그',
 desc:'화장 덜 한 얼굴, 바람에 날리는 머리카락, 흑백. 꾸미지 않은 진짜 얼굴이 가장 아름답다는 스타일이에요.',
 steps:['흑백 필터(모노)로 바꾸기','바람 부는 날 · 흐린 날 자연광','얼굴을 크게, 머리카락이 얼굴에 걸쳐도 OK'],phone:'눈높이 · 2x · 흑백',target:[.48,.45],face:1,
 ments:['바람 맞으면서 멍하니','머리 넘기지 말고 그대로','살짝 웃다 말아봐'],
 scene(c,w,h){vg(c,w,h,['#9a9a9a','#5e5e5e']);c.fillStyle='#2a2a2a';c.beginPath();c.ellipse(w*.5,h*.38,w*.34,h*.24,0,0,TAU);c.fill();c.fillStyle='#cfcfcf';c.beginPath();c.ellipse(w*.48,h*.5,w*.24,h*.24,0,0,TAU);c.fill();
   c.fillStyle='#d8d8d8';c.fillRect(w*.4,h*.7,w*.16,h*.3);[[-1],[1]].forEach(([s])=>{circ(c,w*(.48+s*.09),h*.46,w*.022,'#1a1a1a')});c.strokeStyle='#7a7a7a';c.lineWidth=3;c.beginPath();c.moveTo(w*.44,h*.6);c.quadraticCurveTo(w*.48,h*.62,w*.52,h*.6);c.stroke();
   c.strokeStyle='#1e1e1e';c.lineWidth=2;const r=rnd(9);for(let i=0;i<40;i++){const y=h*(.2+r()*.3);c.beginPath();c.moveTo(w*(.3+r()*.3),y);c.quadraticCurveTo(w*.75,y+20,w*(.9+r()*.2),y+r()*60);c.stroke()}
   for(let i=0;i<500;i++)rect(c,r()*w,r()*h,1,1,`rgba(${r()>.5?255:0},${r()>.5?255:0},${r()>.5?255:0},.08)`)},
 guide(g){g.thirds();g.E(.48,.5,.25,.25);g.T('흑백 · 자연광',.04,.08)}},
{id:'parr_flash',cat:'master',name:'대낮 플래시 원색',who:'마틴 파',
 desc:'햇빛 쨍한 낮에도 플래시를 터뜨려 색을 강하게. 아이스크림·비치파라솔처럼 원색 소품과 함께 유쾌하게.',
 steps:['카메라 플래시를 "켬"으로 고정','가까이 다가가서 소품과 함께 크게','원색 옷·소품, 쨍한 날일수록 좋아요'],phone:'가까이 · 플래시 ON',target:[.5,.3],face:1,
 ments:['아이스크림 크게 한입!','선글라스 끼고 브이','과장되게 놀란 표정'],
 scene(c,w,h){rect(c,0,0,w,h*.6,'#3fb0ff');rect(c,0,h*.6,w,h*.4,'#ffe08a');for(let i=0;i<6;i++){c.fillStyle=i%2?'#fff':'#e8323a';c.beginPath();c.moveTo(w*.85,h*.08);c.arc(w*.85,h*.08,w*.3,Math.PI*.55+i*.18,Math.PI*.55+(i+1)*.18);c.fill()}
   c.save();c.globalAlpha=.35;person(c,w*.55,h*1.3,h*1.05,{sil:'#000'});c.restore();person(c,w*.5,h*1.3,h*1.05,{pose:'hold',col:'#ff3d7f',pants:'#ff3d7f',hair:'#1f1612',smile:1});
   rect(c,w*.41,h*.29,w*.18,h*.035,'#111');poly(c,[[w*.44,h*.6],[w*.56,h*.6],[w*.5,h*.72]],'#d9a066');circ(c,w*.5,h*.56,w*.07,'#ff9ec2')},
 guide(g){g.E(.5,.42,.32,.36);g.T('⚡ 낮에도 플래시 ON',.04,.08,GRN)}},
{id:'webb_layers',cat:'master',name:'겹겹이 세 겹 레이어',who:'알렉스 웹',
 desc:'가까운 사람(잘려도 OK) · 중간 사람 · 먼 사람을 한 화면에. 색 벽과 그림자까지 겹치면 복잡하지만 꽉 찬 사진이 돼요.',
 steps:['앞에 가까운 사람·물건을 화면 가장자리에 걸치기','가운데 주인공, 저 뒤에 한 사람 더','셋이 겹치지 않게 자리 잡힐 때까지 기다리기'],phone:'눈높이',target:[.52,.5],
 scene(c,w,h){rect(c,0,0,w*.6,h,'#e8742a');rect(c,w*.6,0,w*.4,h,'#f2c14e');rect(c,w*.72,h*.3,w*.2,h*.5,'#2b5db8');poly(c,[[0,h*.7],[w*.6,h*.4],[w*.6,h],[0,h]],'rgba(60,20,10,.45)');rect(c,0,h*.86,w,h*.14,'#8a4a24');
   person(c,w*.82,h*.8,h*.2,{col:'#fff',pants:'#222'});person(c,w*.52,h*.92,h*.45,{col:'#1d6b52',pants:'#222',long:1,hair:'#111'});person(c,w*.02,h*1.35,h*1.15,{col:'#5a1a7a',pants:'#111',hair:'#111',look:1})},
 guide(g){g.ring(.08,.35,.14);g.ring(.52,.55,.08);g.ring(.82,.68,.04);g.T('앞',.12,.2);g.T('가운데',.58,.42);g.T('뒤',.86,.58)}},
{id:'maier_shadow',cat:'master',name:'내 그림자가 주인공',who:'비비안 마이어 셀프 포트레이트',
 desc:'해를 등지고 바닥에 길게 늘어진 내 그림자를 찍어요. 혼자 여행할 때 최고의 셀카.',
 steps:['해가 낮을 때(아침·저녁) 해를 등지기','바닥의 그림자를 화면 위쪽까지 길게','무늬 있는 바닥·꽃·낙엽 위면 더 예뻐요'],phone:'가슴 높이 · 아래로',
 scene(c,w,h){rect(c,0,0,w,h,'#d7cfc0');c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,h*i/6);c.lineTo(w,h*i/6+30);c.stroke()}
   const r=rnd(7);for(let i=0;i<18;i++)circ(c,r()*w,r()*h,5+r()*6,['#d9822b','#b5441f','#e7b63a'][i%3]);
   c.save();c.translate(w*.5,h*1.02);c.scale(1,1.6);person(c,0,0,h*.55,{sil:'rgba(30,25,35,.7)',pose:'phone'});c.restore()},
 guide(g){g.L(.5,1,.52,.12,.7);g.ring(.52,.1,.05);g.T('그림자 머리 = 위쪽',.04,.2)}},
{id:'gursky_pattern',cat:'master',name:'반복 패턴 속 하나',who:'안드레아스 거스키',
 desc:'똑같은 창문·발코니·좌석이 반복되는 면을 정면으로 꽉 채우고, 딱 하나만 다른 것(사람·불빛)을 찾아요.',
 steps:['아파트·빌딩·주차장 같은 반복 패턴을 정면으로','화면을 패턴으로 꽉 채우기(하늘 빼기)','다른 하나를 1/3 교차점 근처에'],phone:'정면 · 2x',target:[.58,.52],
 scene(c,w,h){rect(c,0,0,w,h,'#e3e3e1');for(let i=0;i<6;i++)for(let j=0;j<9;j++){const x=w*(.03+i*.163),y=h*(.02+j*.109);rect(c,x,y,w*.14,h*.09,'#9fb3c8');rect(c,x,y+h*.075,w*.14,h*.015,'#c8c8c4')}
   rect(c,w*(.03+3*.163),h*(.02+4*.109),w*.14,h*.09,'#ffd27a');person(c,w*(.03+3*.163+.07),h*(.02+4*.109+.09),h*.07,{col:'#d8262e',pants:'#222'})},
 guide(g){g.thirds(.5);g.ring(.58,.48,.05);g.T('반복 속 하나만 다르게',.04,.08)}},
{id:'haas_motion',cat:'master',name:'움직임 흐림 (패닝)',who:'에른스트 하스',
 desc:'달리는 사람·자전거를 폰으로 따라가며 찍으면 배경은 쭉 흐르고 주인공은 살아나요.',
 steps:['라이브 포토/느린 셔터(야간모드 짧게) 사용','피사체가 지나갈 때 폰을 같이 돌리며 찰칵','주인공은 가는 방향 반대쪽 1/3에'],phone:'허리 높이 · 따라가기',target:[1/3,.4],
 scene(c,w,h){const r=rnd(21);for(let i=0;i<70;i++){c.fillStyle=`hsl(${r()*360},70%,${45+r()*25}%)`;c.fillRect(-20,r()*h,w+40,2+r()*10)}c.fillStyle='rgba(255,255,255,.15)';c.fillRect(0,0,w,h);
   c.save();c.globalAlpha=.35;person(c,w*.27,h*.85,h*.5,{pose:'walk',col:'#e8323a',pants:'#222'});c.restore();person(c,w/3,h*.85,h*.5,{pose:'walk',col:'#e8323a',pants:'#222',hair:'#111'})},
 guide(g){g.A(.15,.55,.9,.55);g.P(1/3,.85,.5,{pose:'walk'});g.T('폰을 같이 돌리며 찰칵',.04,.08)}},
{id:'kawauchi_airy',cat:'master',name:'밝고 하얀 공기',who:'가와우치 린코',
 desc:'일부러 밝게(노출 +), 역광으로 하얗게 날린 부드러운 사진. 일상 순간이 꿈처럼 보여요.',
 steps:['해를 등진 사람 · 창가 역광에서','화면 탭 후 밝기 ☀️를 많이 올리기','작은 순간(손, 비눗방울, 커튼)을 가까이'],phone:'가까이 · 밝기 +',target:[1/3,.6],face:1,
 ments:['비눗방울 불어볼래?','커튼 사이로 살짝','손바닥에 햇빛 받아봐'],
 scene(c,w,h){vg(c,w,h,['#ffffff','#f6efe6','#efe4d8']);glow(c,w*.8,h*.15,w*.8,'rgba(255,255,255,.95)');const r=rnd(14);for(let i=0;i<14;i++){c.strokeStyle='rgba(180,200,230,.5)';c.lineWidth=1.5;c.beginPath();c.arc(r()*w,r()*h*.7,6+r()*16,0,TAU);c.stroke()}
   c.save();c.globalAlpha=.85;person(c,w/3,h*1.02,h*.62,{col:'#f6e3e8',pants:'#e9e1d6',hair:'#8a6a50',long:1,smile:1});c.restore();glow(c,w*.4,h*.4,w*.3,'rgba(255,255,255,.6)')},
 guide(g){g.thirds();g.P(1/3,1.02,.62,{});g.T('☀️ 밝기 많이 +',.04,.08,GRN)}},
{id:'erwitt_humor',cat:'master',name:'강아지 눈높이 유머',who:'엘리엇 어윗',
 desc:'강아지·아이 눈높이까지 내려가면 세상이 웃기게 보여요. 주인 다리와 강아지를 한 화면에.',
 steps:['폰을 강아지 눈높이까지 쭉 내리기','주인 다리는 잘려도 OK — 강아지가 주인공','연사로 표정·꼬리 순간 잡기'],phone:'바닥 가까이',target:[.68,.7],
 scene(c,w,h){vg(c,w,h,['#cfd8dc','#b0bec5'],0,h*.75);rect(c,0,h*.75,w,h*.25,'#8d8a83');
   c.strokeStyle='#2b2f3a';c.lineWidth=w*.07;c.lineCap='round';[[.18],[.3]].forEach(([x])=>{c.beginPath();c.moveTo(w*x,-10);c.lineTo(w*x,h*.82);c.stroke();rect(c,w*x-w*.05,h*.8,w*.1,h*.04,'#111')});
   c.fillStyle='#d8a466';c.beginPath();c.ellipse(w*.68,h*.75,w*.13,h*.06,0,0,TAU);c.fill();circ(c,w*.56,h*.68,w*.07,'#d8a466');c.fillStyle='#8a5a2a';c.beginPath();c.ellipse(w*.52,h*.64,w*.03,h*.05,.4,0,TAU);c.fill();
   circ(c,w*.54,h*.67,4,'#111');rect(c,w*.6,h*.79,8,h*.06,'#d8a466');rect(c,w*.74,h*.79,8,h*.06,'#d8a466');c.strokeStyle='#d8a466';c.lineWidth=6;c.beginPath();c.moveTo(w*.8,h*.73);c.lineTo(w*.88,h*.64);c.stroke();
   c.strokeStyle='#c22';c.lineWidth=2;c.beginPath();c.moveTo(w*.3,h*.55);c.quadraticCurveTo(w*.45,h*.75,w*.58,h*.7);c.stroke()},
 guide(g){g.L(0,.75,1,.75,.6);g.ring(.62,.7,.1);g.T('📱 강아지 눈높이',.04,.08,GRN)}},
{id:'salgado_bw',cat:'master',name:'극적인 흑백 풍경',who:'세바스티앙 살가두',
 desc:'구름 사이로 떨어지는 빛줄기, 거대한 산, 작은 사람. 흑백으로 바꾸면 하늘이 웅장해져요.',
 steps:['구름 많은 날, 빛줄기가 내릴 때','흑백(모노) 필터, 하늘 밝은 곳 탭','지평선은 아래 1/3, 사람은 작게'],phone:'허리 높이 · 흑백',
 scene(c,w,h){vg(c,w,h,['#1c1c1c','#5a5a5a','#8a8a8a'],0,h*2/3);[[.3,.08],[.45,.1],[.6,.07]].forEach(([x,a])=>poly(c,[[w*x,h*.1],[w*(x+.06),h*.1],[w*(x+.25),h*.7],[w*(x-.05),h*.7]],`rgba(255,255,255,${a*2})`));
   for(let i=0;i<6;i++)glow(c,w*(.1+i*.17),h*(.08+(i%2)*.06),w*.18,'rgba(30,30,30,.8)');poly(c,[[0,h*.67],[w*.25,h*.45],[w*.5,h*.6],[w*.75,h*.4],[w,h*.62],[w,h],[0,h]],'#2b2b2b');
   rect(c,0,h*.8,w,h*.2,'#1a1a1a');person(c,w*.7,h*.82,h*.07,{sil:'#0a0a0a'});const r=rnd(5);for(let i=0;i<400;i++)rect(c,r()*w,r()*h,1,1,'rgba(255,255,255,.07)')},
 guide(g){g.L(0,2/3,1,2/3,.7);g.T('흑백 · 빛줄기',.04,.08);g.ring(.7,.8,.03)}},

/* ===== 인물·인플루언서 추가 ===== */
{id:'follow_me',cat:'people',name:'손 잡고 따라와',who:'무라드 오스만 「Follow Me To」 시리즈',
 desc:'그녀가 내 손을 잡고 앞서 걸어가는 뒷모습. 내 손이 화면 아래에서 들어오고, 명소가 그 앞에 펼쳐져요.',
 steps:['그녀가 내 손을 잡고 한 걸음 앞에 서기','내 팔을 쭉 뻗어 손이 화면 아래 가운데에서 들어오게','명소·길이 그녀 앞에 보이게'],phone:'가슴 높이 · 팔 뻗기',target:[.5,.35],
 ments:['내 손 잡고 앞에 걸어가','뒤돌아보면서 웃어줘','손 꽉 잡고 끌어당겨!'],
 scene(c,w,h){vg(c,w,h,['#ffb98a','#ffe0c4'],0,h*.5);rect(c,0,h*.5,w,h*.5,'#c9a27e');c.fillStyle='#8b2f2f';for(let i=0;i<5;i++){rect(c,w*(.05+i*.2),h*(.12+(i%2)*.05),4,h*.38,'#5a3a2a');circ(c,w*(.05+i*.2)+2,h*(.12+(i%2)*.05),w*.035,'#e8323a')}
   rect(c,w*.4,h*.2,w*.2,h*.3,'#7a4a3a');poly(c,[[w*.36,h*.2],[w*.64,h*.2],[w*.5,h*.08]],'#5a2a20');
   person(c,w*.5,h*.92,h*.72,{back:1,long:1,dress:1,col:'#2a4f8a',hair:'#3a2418'});c.strokeStyle='#efc19f';c.lineWidth=w*.04;c.lineCap='round';c.beginPath();c.moveTo(w*.42,h*.42);c.lineTo(w*.48,h*.85);c.stroke();
   c.strokeStyle='#3b4a6b';c.lineWidth=w*.1;c.beginPath();c.moveTo(w*.62,h*1.1);c.lineTo(w*.52,h*.93);c.stroke();circ(c,w*.49,h*.88,w*.045,'#e2ad88')},
 guide(g){g.A(.6,1,.5,.88,GRN);g.P(.5,.92,.72,{back:1});g.T('내 손 = 화면 아래',.04,.95,GRN)}},
{id:'car_window',cat:'people',name:'차 창가 드라이브샷',who:'드라이브 브이로그 감성',
 desc:'조수석 창가에서 옆으로 들어오는 빛. 창틀이 프레임이 되고 바깥 풍경이 흐르면 영화 같아요.',
 steps:['그녀는 조수석, 나는 운전석 쪽에서(정차 중!)','창밖 빛이 얼굴 옆으로 들어오게','창틀이 화면 가장자리를 감싸게'],phone:'가슴 높이 · 정차 중에만',target:[.6,.36],face:1,
 ments:['창밖 바라봐줘','창문에 기대서 졸린 척','선글라스 내리면서 나 봐'],
 scene(c,w,h){vg(c,w,h,['#9fd3a0','#5f9a6a'],0,h*.7);const r=rnd(3);for(let i=0;i<10;i++)glow(c,r()*w,h*(.2+r()*.4),w*.12,'rgba(255,255,230,.5)');
   person(c,w*.6,h*1.2,h*1.0,{look:1,dir:-1,long:1,col:'#f2e0d0',hair:'#3a2418'});c.fillStyle='#1d1d22';c.beginPath();c.rect(0,0,w,h);c.roundRect(w*.08,h*.12,w*.84,h*.58,30);c.fill('evenodd');rect(c,0,h*.7,w,h*.3,'#2a2a30')},
 guide(g){g.R(.08,.12,.84,.58);g.ring(.6,.36,.08);g.T('창틀 = 프레임',.04,.08)}},
{id:'umbrella_rain',cat:'people',name:'비 오는 날 투명우산',who:'비 오는 날 감성 스냅',
 desc:'투명 우산 위로 맺힌 빗방울, 젖은 바닥에 번지는 불빛. 비 오는 날이 오히려 기회예요.',
 steps:['해 질 무렵 · 간판 불빛 있는 거리','젖은 바닥의 반사를 화면 아래에 넣기','우산은 살짝 기울여 얼굴이 보이게'],phone:'허리 높이',target:[1/3,.42],face:1,
 ments:['우산 살짝 기울이고 나 봐','손 내밀어서 빗방울 받아봐','우산 빙글 돌려봐'],
 scene(c,w,h){vg(c,w,h,['#1d2a44','#33456a'],0,h*.65);rect(c,0,h*.65,w,h*.35,'#141c2c');[['#ff4d6d',.75],['#ffd27a',.2],['#5ad1ff',.55]].forEach(([cl,x])=>{glow(c,w*x,h*.4,w*.15,cl);c.save();c.globalAlpha=.4;rect(c,w*x-6,h*.66,12,h*.3,cl);c.restore()});
   c.strokeStyle='rgba(200,220,255,.4)';c.lineWidth=1.2;const r=rnd(5);for(let i=0;i<90;i++){const x=r()*w,y=r()*h;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+14);c.stroke()}
   person(c,w/3,h*.9,h*.55,{col:'#e7c6a0',pants:'#2b2f3a',long:1,hair:'#2b1d17',smile:1});c.fillStyle='rgba(230,240,255,.35)';c.beginPath();c.ellipse(w/3,h*.4,w*.24,h*.1,0,Math.PI,0);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.stroke();rect(c,w/3-1,h*.4,2,h*.2,'#ccc')},
 guide(g){g.thirds();g.P(1/3,.9,.55,{});g.T('젖은 바닥 반사',.5,.85)}},
{id:'couple_shadow',cat:'people',name:'그림자 하트 커플샷',who:'커플 인스타 인기샷',
 desc:'해를 등지고 둘이 나란히. 바닥에 늘어진 두 그림자가 팔로 하트를 만들어요. 타이머로 찍으면 둘 다 나와요.',
 steps:['해가 낮을 때, 해를 등지고 나란히 서기','폰을 위에서 비스듬히 바닥을 향해','둘이 팔을 맞대 머리 위로 하트'],phone:'가슴 높이 · 아래로 · 타이머',
 scene(c,w,h){vg(c,w,h,['#efdcbc','#e2c79e']);c.strokeStyle='rgba(0,0,0,.08)';for(let i=0;i<8;i++){c.beginPath();c.moveTo(0,h*i/8);c.lineTo(w,h*i/8);c.stroke()}
   [[.38,1],[.62,-1]].forEach(([x,d])=>{c.save();c.translate(w*x,h*1.02);c.scale(1,1.5);person(c,0,0,h*.5,{sil:'rgba(40,30,30,.7)'});c.restore()});
   c.strokeStyle='rgba(40,30,30,.7)';c.lineWidth=w*.04;c.lineCap='round';c.beginPath();c.moveTo(w*.42,h*.5);c.bezierCurveTo(w*.3,h*.1,w*.5,h*.08,w*.5,h*.22);c.bezierCurveTo(w*.5,h*.08,w*.7,h*.1,w*.58,h*.5);c.stroke()},
 guide(g){g.L(.38,1,.42,.4,.6);g.L(.62,1,.58,.4,.6);g.ring(.5,.22,.08);g.T('그림자로 하트',.04,.08)}},
{id:'stairs_sit',cat:'people',name:'계단에 앉은 OOTD',who:'패션 스냅 단골 포즈',
 desc:'넓은 계단의 사선 위에 편하게 앉은 포즈. 계단 선이 대각선 리딩라인이 되고 다리 라인도 살아요.',
 steps:['넓은 돌계단·나무계단에 비스듬히 앉기','계단 선이 화면을 대각선으로 지나가게','폰은 앉은 사람 가슴 높이, 살짝 옆에서'],phone:'앉은 눈높이',target:[1/3,.4],face:1,
 ments:['한쪽 무릎 세우고 앉아봐','턱 괴고 먼 곳 봐','계단 위에서 나 내려다봐'],
 scene(c,w,h){rect(c,0,0,w,h,'#d9d2c5');for(let i=0;i<12;i++){const y=h*(.3+i*.06);poly(c,[[0,y+w*.0],[w,y-h*.14],[w,y-h*.14+h*.03],[0,y+h*.03]],i%2?'#bdb5a6':'#cfc8b9')}
   person(c,w/3,h*.55+h*.42*.41,h*.42,{pose:'sit',col:'#efe6da',pants:'#34507a',hair:'#3a2418',long:1,smile:1})},
 guide(g){g.L(0,.62,1,.4,.6);g.L(0,.86,1,.64,.6);g.P(1/3,.55+.42*.41,.42,{pose:'sit'});g.T('계단 = 대각선',.55,.25)}},
{id:'boxing_poster',cat:'people',name:'복싱 포스터 컷',who:'스포츠 브랜드 광고풍',
 desc:'어두운 배경, 뒤에서 오는 역광이 몸 테두리를 빛나게. 아래에서 올려 찍어 영웅처럼. 체육관 홍보용으로 딱!',
 steps:['어두운 곳에서 사람 뒤에 조명(창·스탠드) 하나','폰을 허리 아래에서 위로','글러브 올리고 렌즈 정면 응시'],phone:'허리 아래 · 위로',target:[.5,.2],face:1,
 ments:['가드 올리고 렌즈 노려봐','두 팔 번쩍! 챔피언처럼','숨 고르고 진지하게'],
 scene(c,w,h){rect(c,0,0,w,h,'#0b0b10');glow(c,w*.5,h*.35,w*.6,'rgba(90,140,255,.45)');glow(c,w*.5,h*.3,w*.3,'rgba(255,255,255,.4)');const r=rnd(3);for(let i=0;i<8;i++)glow(c,r()*w,h*(.5+r()*.4),w*.25,'rgba(120,120,140,.12)');
   rect(c,0,h*.92,w,h*.08,'#15151c');c.save();c.shadowColor='rgba(150,190,255,.95)';c.shadowBlur=18;person(c,w*.5,h*.98,h*.82,{pose:'arms',gloves:1,col:'#111',pants:'#8a0d14',hair:'#0a0a0a'});c.restore()},
 guide(g){g.L(0,.92,1,.92,.6);g.P(.5,.98,.82,{pose:'arms',gloves:1});g.T('아래에서 · 뒤에 조명',.04,.08)}},

];

const CATS={people:'👤 인물·인플루언서',film:'🎬 영화감독 연출',master:'📷 사진 거장',street:'🏙 거리·작가 기법',land:'🏞 풍경',food:'🍰 음식·소품'};
const BY=Object.fromEntries(S.map(s=>[s.id,s]));
const cache=new Map();
function drawGuide(id,c,W,H,opt={}){
  const s=BY[id];if(!s)return;const col=opt.color||'rgba(255,216,77,.92)',lw=opt.lw||Math.max(1.6,W/240);
  const key=id+'|'+W+'|'+H+'|'+col+'|'+(opt.sample?1:0);let cv=cache.get(key);
  if(!cv){cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.strokeStyle=col;x.fillStyle=col;x.lineWidth=lw;x.lineCap='round';x.lineJoin='round';
    x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=3;s.guide(G(x,W,H,col,lw,opt.sample));if(cache.size>40)cache.clear();cache.set(key,cv)}
  c.drawImage(cv,0,0);
}
function drawScene(id,c,w,h){const s=BY[id];if(s){c.save();s.scene(c,w,h);c.restore()}}
window.PHOTO_STYLES={list:S,byId:BY,cats:CATS,drawGuide,drawScene,person};
})();
