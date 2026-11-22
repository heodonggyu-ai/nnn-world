/* 공통 촬영 엔진 — 기본 구도·인물 구도 + 장면 분석 + 추천 + 안내 문구.
   kit.js, styles.js, styles2.js 뒤에 로드. window.PhotoCore 로 노출. */
(function(){
const PHI=(1+Math.sqrt(5))/2,K=KIT,O=K.ops;

/* ---------- 기본 구도 ---------- */
const BASIC=[
 {id:'thirds',name:'삼분할',who:'모든 사진의 기본',desc:'화면을 가로·세로 3등분해 선이나 교차점에 주인공을 둡니다.',steps:['주인공을 네 교차점 중 하나에','수평선은 가로선 위나 아래에','주인공이 바라보는 쪽에 여백'],phone:'자유'},
 {id:'golden',name:'황금분할',who:'1 : 1.618',desc:'삼분할보다 중심 쪽으로 살짝 모인 선. 더 자연스럽고 균형 잡혀 보여요.',steps:['주인공을 안쪽 교차점에','수평선은 0.618 선에','건물·등대·전신 인물에 잘 맞아요'],phone:'자유'},
 {id:'spiral',name:'황금나선',who:'시선이 흘러가는 구도',desc:'나선이 감겨 들어가는 끝점에 주인공을 두면 시선이 자연스럽게 주인공으로 흘러가요.',steps:['나선 끝 = 주인공','곡선 있는 장면(꽃·계단·파도)에 좋아요','나선 방향은 자동으로 맞춰져요'],phone:'자유'},
 {id:'center',name:'중앙·대칭',who:'정면의 힘',desc:'주인공을 정중앙에, 좌우를 거울처럼 맞춰요.',steps:['정면에 똑바로 서기','중앙선을 정확히','수평계가 초록일 때'],phone:'정면'},
 {id:'diagonal',name:'대각선',who:'역동적인 구도',desc:'선이나 피사체를 대각선으로 배치해 움직임을 줘요.',steps:['모서리에서 모서리로 이어지게','계단·강·다리·운동 장면','펀치·점프는 대각선이 최고'],phone:'자유'},
 {id:'horizonLow',name:'수평선 아래',who:'하늘이 주인공',desc:'수평선을 아래 1/3에 — 하늘이 2/3를 차지해요.',steps:['노을·구름 멋진 날','수평선을 아래 가로선에','꼭 수평으로'],phone:'허리 높이'},
 {id:'horizonHigh',name:'수평선 위',who:'땅·바다가 주인공',desc:'수평선을 위 1/3에 — 땅·바다가 2/3를 차지해요.',steps:['하늘이 밋밋한 날','수평선을 위 가로선에','꽃밭·해변·들판'],phone:'가슴 높이'},
 {id:'leading',name:'소실점·리딩라인',who:'시선을 끌고 가는 선',desc:'길·선로·복도처럼 한 점으로 모이는 선이 시선을 끌고 가요.',steps:['선이 화면 아래 모서리에서 시작','모이는 점을 가운데나 1/3에','그 점 앞에 사람 하나'],phone:'허리 높이'},
 {id:'triangle',name:'삼각 구도',who:'안정감',desc:'아래가 넓고 위가 뾰족한 삼각형으로 안정감을 줘요.',steps:['꼭짓점을 위쪽 가운데에','밑변을 넓게','산·단체사진·앉은 인물'],phone:'자유'},
 {id:'frame',name:'프레임 속 프레임',who:'창·문·나무 테두리',desc:'창문·문·나뭇가지로 테두리를 만들어 주인공을 가둬요.',steps:['테두리 안쪽으로 한 걸음','앞쪽 테두리는 어둡게','안쪽 주인공은 밝게'],phone:'자유'},
 {id:'negative',name:'여백',who:'미니멀',desc:'작은 주인공 + 넓은 빈 공간으로 감성을 줘요.',steps:['배경이 단순한 곳','주인공은 작게, 교차점에','80%는 비우기'],phone:'자유'},
].map(g=>Object.assign(g,{cat:'basic',kind:'basic',auto:1}));
const PORTRAIT=[
 {id:'close',name:'얼굴 클로즈업',who:'표정이 주인공',desc:'얼굴로 화면을 채워요. 눈은 위 1/3 선에, 이마·정수리는 잘려도 괜찮아요.',steps:['눈을 위 1/3 선에','정수리는 잘라도 OK, 턱은 ✕','2x 줌으로 왜곡 없이'],phone:'눈높이 · 2x'},
 {id:'portrait',name:'상반신 정면',who:'프로필·인터뷰',desc:'가슴 위까지 담고 눈높이를 위 1/3 선에 맞춰요.',steps:['눈을 위 1/3 선에','머리 위 여백은 조금만','어깨 수평 맞추기'],phone:'가슴 높이'},
 {id:'off',name:'오프센터 상반신',who:'자연스러운 일상',desc:'얼굴을 1/3 선에 두고 바라보는 쪽에 여백을 둬요.',steps:['얼굴을 왼쪽·오른쪽 1/3에','바라보는 쪽을 넓게','카페·창가에 잘 어울려요'],phone:'가슴 높이'},
 {id:'profile',name:'옆모습',who:'실루엣·생각하는 장면',desc:'옆을 보는 얼굴을 1/3 선에, 코가 향하는 쪽에 넓은 공간을 둬요.',steps:['코 앞 공간을 넓게','창가·노을 역광이면 실루엣','턱선이 밝은 배경에 겹치게'],phone:'가슴 높이'},
 {id:'half',name:'허벅지샷',who:'데일리룩',desc:'머리부터 허벅지 중간까지. 관절(허리·무릎)에서는 자르지 않아요.',steps:['허벅지 중간에서 자르기','허리·무릎에서 자르기 ✕','폰은 배꼽 높이'],phone:'배꼽 높이'},
 {id:'full',name:'전신 (다리 길게)',who:'OOTD',desc:'발끝까지 전부. 폰을 무릎 높이로 낮추면 다리가 길어 보여요.',steps:['발끝을 화면 맨 아래에','머리 위는 조금만','폰은 무릎 높이'],phone:'무릎 높이'},
 {id:'travel',name:'여행 인물+배경',who:'기념사진',desc:'사람은 작게 1/3 선에, 배경이 화면 대부분. 수평선은 1/3 선에.',steps:['사람을 가운데 말고 옆으로','배경을 크게','수평선 수평'],phone:'허리 높이'},
 {id:'selfie',name:'셀카',who:'전면 카메라',desc:'얼굴을 살짝 위에 두고 폰을 눈보다 조금 높게 들어요.',steps:['폰은 눈보다 살짝 위','턱은 살짝 당기기','빛을 마주 보기'],phone:'눈보다 위'},
 {id:'two',name:'2인 (커플·친구)',who:'둘이 함께',desc:'두 얼굴을 1/3 근처에 두고 눈높이를 살짝 다르게.',steps:['얼굴 높이 엇갈리게','둘 사이 간격 좁게','상반신 위주'],phone:'가슴 높이'},
 {id:'group',name:'단체 삼각 배치',who:'단체·가족사진',desc:'얼굴들이 삼각형을 이루게 — 가운데를 높게, 양 끝을 낮게.',steps:['앞줄은 앉고 뒷줄은 서기','가운데를 가장 높게','모두 얼굴이 보이게'],phone:'가슴 높이'},
 {id:'action',name:'액션 (복싱·운동)',who:'움직임',desc:'몸을 1/3 선에 두고 움직이는 방향에 공간을 둬요.',steps:['주먹이 뻗는 쪽을 비우기','연사로 피크 순간','폰은 허리 높이'],phone:'허리 높이 · 연사'},
].map(g=>Object.assign(g,{cat:'portrait',kind:'portrait',auto:1}));
const PT={close:.44,portrait:.22,off:.2,profile:.22,half:.16,full:.095,travel:.042,selfie:.29,two:.16,group:.08,action:.13};

/* ---------- 나선 ---------- */
const SP=(()=>{let x=0,y=0,w=PHI,h=1;const pts=[],sq=[];
  for(let k=0;k<12;k++){const d=k%4;let s,cx,cy;
    if(d===0){s=h;cx=x+s;cy=y+s;sq.push([x,y,s]);x+=s;w-=s}else if(d===1){s=w;cx=x;cy=y+s;sq.push([x,y,s]);y+=s;h-=s}
    else if(d===2){s=h;cx=x+w-s;cy=y;sq.push([x+w-s,y,s]);w-=s}else{s=w;cx=x+s;cy=y+h-s;sq.push([x,y+h-s,s]);h-=s}
    const a0=(180+90*d)*Math.PI/180;for(let i=0;i<=16;i++){const a=a0+i/16*Math.PI/2;pts.push([(cx+Math.cos(a)*s)/PHI,cy+Math.sin(a)*s])}}
  return{pts,sq:sq.map(([a,b,s])=>[a/PHI,b,s/PHI,s]),end:pts[pts.length-1]}})();
const spMap=(u,v,p,fx,fy)=>{let nx=p?v:u,ny=p?u:v;if(fx)nx=1-nx;if(fy)ny=1-ny;return[nx,ny]};
const spiralEnd=(p,fx,fy)=>spMap(SP.end[0],SP.end[1],p,fx,fy);

/* ---------- 인물 레이아웃 ---------- */
function pLayout(id,side){
  const sx=side==='R'?2/3:1/3,dir=side==='R'?-1:1,P=(x,eye,u,ext,ex={})=>Object.assign({x,top:eye-.45*u,u,ext,dir},ex);let figs,ex={};
  switch(id){
    case 'close':figs=[P(.5,1/3,.55,'bust')];ex.eye=1/3;break;
    case 'portrait':figs=[P(.5,1/3,.27,'bust')];ex.eye=1/3;break;
    case 'off':figs=[P(sx,1/3,.25,'bust')];ex.eye=1/3;ex.look=1;break;
    case 'profile':figs=[P(sx,.36,.28,'bust',{prof:1})];ex.eye=.36;ex.look=1;break;
    case 'half':figs=[{x:.5,top:.06,u:.196,ext:'half',dir}];ex.cut='half';break;
    case 'full':figs=[{x:.5,top:.05,u:.118,ext:'full',dir}];ex.cut='full';break;
    case 'travel':figs=[{x:sx,top:.52,u:.05,ext:'full',dir}];ex.hz=1/3;ex.look=1;break;
    case 'selfie':figs=[P(.5,.4,.36,'bust')];ex.eye=.4;ex.selfie=1;break;
    case 'two':figs=[P(.36,1/3,.2,'bust',{dir:1}),P(.64,1/3+.045,.2,'bust',{dir:-1})];break;
    case 'group':figs=[[.5,.27],[.3,.37],[.7,.37],[.13,.47],[.87,.47]].map(([x,e])=>P(x,e,.1,'bust'));ex.tri=1;break;
    case 'action':figs=[{x:sx,top:.1,u:.17,ext:'half',dir,act:1}];ex.look=1;break;
  }
  const fc=figs.map(g=>[g.x,g.top+.55*g.u]);
  return Object.assign({figs,faceT:[fc.reduce((a,b)=>a+b[0],0)/fc.length,fc.reduce((a,b)=>a+b[1],0)/fc.length],fhT:figs[0].u*.8,side,dir},ex);
}
function outline(c,fg,W,H){
  const px=fg.x*W,U=fg.u*H,T=fg.top*H,d=fg.dir||1,gx=px+d*1.95*U,gy=T+1.75*U;
  const side=sg=>{const P=[[px+sg*.17*U,T+.95*U],[px+sg*.17*U,T+1.2*U],[px+sg*1.0*U,T+1.6*U]];if(fg.ext==='bust')P.push([px+sg*1.12*U,T+3.8*U]);else P.push([px+sg*.8*U,T+3.0*U],[px+sg*.88*U,T+3.9*U],[px+sg*.72*U,T+5.6*U],[px+sg*.55*U,T+7.45*U]);return P};
  const path=pts=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
  c.beginPath();c.ellipse(px,T+.5*U,.38*U,.5*U,0,0,7);c.stroke();path(side(-1));path(side(1));
  if(fg.ext!=='bust')[-1,1].forEach(sg=>path([[px,T+4.3*U],[px+sg*.14*U,T+7.45*U]]));
  if(fg.prof)path([[px+d*.34*U,T+.42*U],[px+d*.5*U,T+.6*U],[px+d*.32*U,T+.66*U]]);
  if(fg.act){path([[px+d*.9*U,T+1.7*U],[gx-d*.38*U,gy]]);c.beginPath();c.arc(gx,gy,.38*U,0,7);c.stroke()}
}
/* 인물 레이아웃 → 썸네일용 사람 (kit) */
function figPerson(c,fg,W,H,o){const h=fg.u*6.76*H,fy=(fg.top+.5*fg.u)*H+.94*h;K.person(c,fg.x*W,fy,h,Object.assign({dir:fg.dir,look:fg.prof},o))}

/* ---------- 썸네일 장면 ---------- */
const WF={col:'#f2e2d3',pants:'#2e3b5a',hair:'#3a2418',long:1,smile:1},MF={col:'#3b4a6b',pants:'#2b2f3a',hair:'#1f1612',smile:1};
const PB={close:c=>O.studio(c,300,400,'#f0cdb0'),portrait:c=>O.studio(c,300,400,'#d7dde6'),off:c=>O.room(c,300,400,{wall:'#efe3d3',win:[.55,.06,.4,.55],view:'trees'}),profile:c=>O.sky(c,300,400,{t:'golden',sun:[.8,.3,.5,.05]}),
  half:c=>O.wall(c,300,400,'#b5654a',.9,'#8a5a40'),full:c=>O.wall(c,300,400,'#e6ddd0',.84,'#a99a86'),travel:c=>{O.sky(c,300,400,{t:'day',to:1/3});O.peak(c,300,400,.6,.12,.35,'#6b7e96');O.sea(c,300,400,1/3,.62);O.ground(c,300,400,.62,'grass')},
  selfie:c=>{O.sky(c,300,400,{t:'day'});O.clouds(c,300,400,2,3)},two:c=>{O.sky(c,300,400,{t:'golden'});K.bokeh(c,300,400,14,5,['rgba(255,240,200,.5)'],0,.7)},
  group:c=>{O.sky(c,300,400,{t:'day',to:.35});O.sea(c,300,400,.35,.55);O.ground(c,300,400,.55,'sand')},action:c=>O.gym(c,300,400)};
function basicScene(id,c,w,h){
  switch(id){
    case 'thirds':O.sky(c,w,h,{t:'day',to:2/3});O.clouds(c,w,h,2,4,.05,.2);O.ground(c,w,h,2/3,'grass');O.tree(c,w,h,2/3,2/3,.42);break;
    case 'golden':O.sky(c,w,h,{t:'day',to:1/PHI});O.sea(c,w,h,1/PHI,1);O.lighthouse(c,w,h,1-1/PHI,1/PHI+.02,.32);break;
    case 'spiral':{O.studio(c,w,h,'#f0dcc0');const e=spiralEnd(true,false,false),ex=e[0]*w,ey=e[1]*h;c.strokeStyle='#5b8a3a';c.lineWidth=6;c.beginPath();c.moveTo(ex,ey);c.quadraticCurveTo(ex-80,ey-60,w*.15,-10);c.stroke();
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2;K.ell(c,ex+Math.cos(a)*30,ey+Math.sin(a)*30,22,9,i%2?'#f2a93b':'#f7c64d',a)}K.circ(c,ex,ey,17,'#6b3d1e');break}
    case 'center':O.wall(c,w,h,'#f6c6c9',.86,'#e3d3b8');[[.1,.15],[.7,.15],[.1,.45],[.7,.45]].forEach(([x,y])=>{K.rect(c,w*x,h*y,w*.2,h*.2,'#fff7e8');K.rect(c,w*x+4,h*y+4,w*.2-8,h*.2-8,'#9dc5d6')});K.rect(c,w*.38,h*.38,w*.24,h*.48,'#d26a78');K.person(c,w*.5,h*.92,h*.3,Object.assign({},WF,{col:'#f3d26b',pose:'hold'}));break;
    case 'diagonal':O.ground(c,w,h,0,'grass');K.poly(c,[[-20,h+10],[55,h+10],[w+20,40],[w+20,-30]],'#7cc4ec');K.poly(c,[[10,h+10],[30,h+10],[w+20,10],[w+20,-5]],'#bfe6fa');break;
    case 'horizonLow':O.sky(c,w,h,{t:'sunset',to:2/3,sun:[.5,.6,.4,.06]});O.sea(c,w,h,2/3,1,'sunset');break;
    case 'horizonHigh':O.sky(c,w,h,{t:'day',to:1/3});O.field(c,w,h,1/3,['#ff5c8a','#ffd34d','#fff','#b37bff']);break;
    case 'leading':O.street(c,w,h,{sky:'day'});K.person(c,w*.5,h*.62,h*.14,Object.assign({},WF,{back:1}));break;
    case 'triangle':O.sky(c,w,h,{t:'day'});O.peak(c,w,h,.5,.18,.46,'#5d6b80');O.ground(c,w,h,.72,'grass');break;
    case 'frame':O.sky(c,w,h,{t:'golden',to:.6});O.sea(c,w,h,.6,1);K.person(c,w*.5,h*.86,h*.3,Object.assign({},WF,{back:1}));O.arch(c,w,h,'#2a1d16',.14,.12);break;
    case 'negative':O.studio(c,w,h,'#e9e0e6');K.rect(c,0,h*.72,w,h*.28,'rgba(150,165,190,.35)');O.boat(c,w,h,2/3,2/3,.08);break;
  }
}
function portraitScene(id,c,w,h){PB[id](c);const sp=pLayout(id,'L');const cols=[WF,MF,Object.assign({},WF,{col:'#c4515b',hs:'bob'}),Object.assign({},MF,{col:'#4d8a5a'}),Object.assign({},WF,{col:'#f6d36b'})];
  sp.figs.map((f,i)=>[f,i]).sort((a,b)=>a[0].top-b[0].top).forEach(([f,i])=>figPerson(c,f,w,h,Object.assign({},cols[i%5],f.act?{gloves:1,col:'#111'}:{})))}

/* ---------- 오버레이: 기본 구도 ---------- */
function basicOverlay(c,id,W,H,st,opt){
  const col=opt.color,lw=opt.lw;c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=3;
  const L=(x1,y1,x2,y2,a)=>{c.save();if(a!=null)c.globalAlpha=a;c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke();c.restore()};
  const dot=(x,y,r)=>{c.beginPath();c.arc(x*W,y*H,r||lw*3,0,7);c.fill()},dash=a=>c.setLineDash(a?a.map(v=>v*lw):[]);
  const T=(t,x,y)=>{c.save();c.font=`800 ${Math.max(11,W/26)}px Pretendard,sans-serif`;c.fillText(t,x,y);c.restore()};
  switch(id){
    case 'thirds':[1/3,2/3].forEach(t=>{L(t,0,t,1);L(0,t,1,t)});[1/3,2/3].forEach(x=>[1/3,2/3].forEach(y=>dot(x,y)));break;
    case 'golden':{const a=1-1/PHI,b=1/PHI;[a,b].forEach(t=>{L(t,0,t,1);L(0,t,1,t)});[a,b].forEach(x=>[a,b].forEach(y=>dot(x,y)));break}
    case 'spiral':{const p=H>W,fx=st.spiralFlip.x,fy=st.spiralFlip.y;c.globalAlpha=.4;SP.sq.slice(0,7).forEach(([u,v,su,sv])=>{const a=spMap(u,v,p,fx,fy),b=spMap(u+su,v+sv,p,fx,fy);c.strokeRect(Math.min(a[0],b[0])*W,Math.min(a[1],b[1])*H,Math.abs(b[0]-a[0])*W,Math.abs(b[1]-a[1])*H)});
      c.globalAlpha=1;c.lineWidth=lw*1.4;c.beginPath();SP.pts.forEach(([u,v],i)=>{const q=spMap(u,v,p,fx,fy);i?c.lineTo(q[0]*W,q[1]*H):c.moveTo(q[0]*W,q[1]*H)});c.stroke();const e=spiralEnd(p,fx,fy);dot(e[0],e[1],lw*3.5);break}
    case 'center':dash([4,4]);L(.5,0,.5,1);L(0,.5,1,.5);dash();c.beginPath();c.arc(W/2,H/2,Math.min(W,H)*.12,0,7);c.stroke();dot(.5,.5);break;
    case 'diagonal':{L(0,1,1,0);dash([4,4]);L(0,0,1,1);const k=(W*W)/(W*W+H*H);L(0,0,k,1-k);L(1,1,1-k,k);dash();break}
    case 'horizonLow':case 'horizonHigh':{const y=id==='horizonLow'?2/3:1/3;L(0,1/3,1,1/3,.4);L(0,2/3,1,2/3,.4);c.lineWidth=lw*2.2;L(0,y,1,y);T('수평선',8,y*H-8);break}
    case 'leading':[[0,1],[1,1],[0,.68],[1,.68],[.27,1],[.73,1],[0,.12],[1,.12]].forEach(([x,y],i)=>L(x,y,.5,.42,i<6?1:.45));dot(.5,.42,lw*3.5);break;
    case 'triangle':c.beginPath();c.moveTo(.5*W,.18*H);c.lineTo(.08*W,.9*H);c.lineTo(.92*W,.9*H);c.closePath();c.stroke();c.globalAlpha=.2;c.fill();break;
    case 'frame':{const m=.14;dash([5,4]);c.strokeRect(m*W,m*H,(1-2*m)*W,(1-2*m)*H);dash();c.globalAlpha=.18;c.beginPath();c.rect(0,0,W,H);c.rect(m*W,m*H,(1-2*m)*W,(1-2*m)*H);c.fill('evenodd');c.globalAlpha=1;dot(.5,.5);break}
    case 'negative':{[1/3,2/3].forEach(t=>{L(t,0,t,1,.3);L(0,t,1,t,.3)});const t=opt.target||[2/3,2/3];c.beginPath();c.arc(t[0]*W,t[1]*H,Math.min(W,H)*.07,0,7);c.stroke();dot(t[0],t[1]);break}
  }c.restore();
}
/* ---------- 오버레이: 인물 구도 ---------- */
function portraitOverlay(c,id,W,H,st,opt){
  const sp=pLayout(id,opt.side||st.pSide),col=opt.color,lw=opt.lw,fs=Math.max(11,W/26),live=!opt.sample,topY=live?Math.max(fs*1.5,H*.15):fs*1.5,botY=live?H-H*.1:H-10,red=K.RED,grn=K.GRN;
  c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=3;c.font=`800 ${fs}px Pretendard,sans-serif`;
  const L=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke()},txt=(t,x,y,cl)=>{c.save();c.fillStyle=cl||col;c.fillText(t,x,y);c.restore()};
  if(sp.look||id==='two'){c.globalAlpha=.3;[1/3,2/3].forEach(t=>L(t,0,t,1));c.globalAlpha=1}
  if(sp.eye!=null){c.setLineDash([4*lw,4*lw]);c.globalAlpha=.75;L(0,sp.eye,1,sp.eye);c.globalAlpha=1;c.setLineDash([]);txt('눈높이',8,sp.eye*H-7)}
  if(sp.hz){c.lineWidth=lw*1.8;L(0,sp.hz,1,sp.hz);c.lineWidth=lw;txt('수평선',8,sp.hz*H-7)}
  if(!opt.sample)sp.figs.forEach(fg=>outline(c,fg,W,H));
  if(id==='two'){const a=sp.figs[0],b=sp.figs[1];c.setLineDash([3*lw,3*lw]);L(a.x,a.top+.45*a.u,b.x,b.top+.45*b.u);c.setLineDash([])}
  if(sp.tri){const f=sp.figs,p=i=>[f[i].x,f[i].top+.5*f[i].u];c.setLineDash([5*lw,4*lw]);c.beginPath();[0,3,4].forEach((i,k)=>{const q=p(i);k?c.lineTo(q[0]*W,q[1]*H):c.moveTo(q[0]*W,q[1]*H)});c.closePath();c.stroke();c.setLineDash([])}
  if(sp.look){const fg=sp.figs[0],d=sp.dir,y=(id==='travel'?(fg.top-.03)*H:(fg.top+.45*fg.u)*H-fs*1.2),x0=(fg.x+d*.1)*W,x1=(fg.x+d*.42)*W;
    c.strokeStyle=grn;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();const a=d>0?0:Math.PI,k=lw*5;c.beginPath();c.moveTo(x1,y);c.lineTo(x1-k*Math.cos(a-.5),y-k*Math.sin(a-.5));c.moveTo(x1,y);c.lineTo(x1-k*Math.cos(a+.5),y-k*Math.sin(a+.5));c.stroke();
    c.textAlign='center';txt(id==='action'?'움직이는 방향 여백':'시선 방향 여백',(x0+x1)/2,y-8,grn);c.textAlign='start';c.strokeStyle=col}
  if(sp.cut==='half'){const fg=sp.figs[0],wy=fg.top+3.0*fg.u;c.strokeStyle=red;c.setLineDash([4*lw,3*lw]);L(.12,wy,.88,wy);c.setLineDash([]);txt('✕ 허리에서 자르지 않기',W*.04,wy*H-6,red);txt('✓ 허벅지 중간에서 자르기',W*.04,botY,grn)}
  if(sp.cut==='full')txt('✓ 발끝까지 다 담기',W*.04,botY,grn);
  if(id==='close')txt('이마는 잘려도 OK · 턱은 ✕',W*.04,topY);
  c.restore();
}

/* ---------- 항목 목록 ---------- */
const STY=(window.PHOTO_STYLES?PHOTO_STYLES.list:[]).map(s=>({id:'st_'+s.id,sid:s.id,cat:s.cat,kind:'style',name:s.name,who:s.who,desc:s.desc,steps:s.steps,phone:s.phone,ments:s.ments,target:s.target,face:s.face,tags:s.tags||[]}));
const ITEMS=[...BASIC,...PORTRAIT,...STY],BY=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const CATS=Object.assign({basic:'기본 구도',portrait:'인물 구도'},window.PHOTO_STYLES?PHOTO_STYLES.cats:{});

/* 실사 사진 */
const RP=window.REF_PHOTOS||{},PIMG={},PWAIT=new Set();let onPhoto=null;
function photoOf(it){if(!it||it.kind!=='style')return null;const r=RP[it.sid];if(!r)return null;let p=PIMG[r[0]];if(!p){p=PIMG[r[0]]={img:new Image(),ok:false,by:r[1],ids:new Set()};p.img.crossOrigin='anonymous';
  p.img.onload=()=>{p.ok=true;p.ids.forEach(i=>onPhoto&&onPhoto(i))};p.img.src='https://images.unsplash.com/'+r[0]+'?w=720&h=960&fit=crop&crop=entropy&q=72&auto=format'}p.ids.add(it.id);return p}
function drawThumb(id,c,w,h,opt={}){const it=BY[id];if(!it)return;c.save();
  const ph=opt.illust?null:photoOf(it);if(ph&&ph.ok){const im=ph.img,k=Math.max(w/im.naturalWidth,h/im.naturalHeight);c.drawImage(im,(w-im.naturalWidth*k)/2,(h-im.naturalHeight*k)/2,im.naturalWidth*k,im.naturalHeight*k);c.restore();return}
  if(it.kind==='style'){PHOTO_STYLES.drawScene(it.sid,c,w,h);if(opt.guide!==false)PHOTO_STYLES.drawGuide(it.sid,c,w,h,{lw:2,sample:1,color:opt.color})}
  else{if(it.kind==='basic')basicScene(id,c,w,h);else portraitScene(id,c,w,h);K.post(c,w,h);
    if(opt.guide!==false){const st={pSide:'L',spiralFlip:{x:false,y:false}},o={color:opt.color||'rgba(255,216,77,.95)',lw:2,sample:1};it.kind==='basic'?basicOverlay(c,id,w,h,st,o):portraitOverlay(c,id,w,h,st,o)}}
  c.restore()}
function drawOverlay(id,c,W,H,st,opt={}){const it=BY[id];if(!it)return;const o=Object.assign({color:'rgba(255,216,77,.92)',lw:Math.max(1.6,W/240)},opt);
  if(it.kind==='style')PHOTO_STYLES.drawGuide(it.sid,c,W,H,{color:o.color,lw:o.lw});else if(it.kind==='basic')basicOverlay(c,id,W,H,st,o);else portraitOverlay(c,id,W,H,st,o)}

/* ---------- 장면 분석 ---------- */
const AW=72,acv=document.createElement('canvas'),actx=acv.getContext('2d',{willReadFrequently:true});
function getCrop(sw,sh,ar){if(sw/sh>ar){const cw=sh*ar;return{x:(sw-cw)/2,y:0,w:cw,h:sh}}const ch=sw/ar;return{x:0,y:(sh-ch)/2,w:sw,h:ch}}
function analyze(src,sw,sh,mir,ar){
  const AH=Math.max(24,Math.round(AW/ar));acv.width=AW;acv.height=AH;const cr=getCrop(sw,sh,ar);actx.save();if(mir){actx.translate(AW,0);actx.scale(-1,1)}actx.drawImage(src,cr.x,cr.y,cr.w,cr.h,0,0,AW,AH);actx.restore();
  const d=actx.getImageData(0,0,AW,AH).data,N=AW*AH,lum=new Float32Array(N);let mR=0,mG=0,mB=0,mL=0,skinN=0;const mask=new Uint8Array(N);
  let satS=0,warmN=0;for(let i=0;i<N;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2],l=.299*r+.587*g+.114*b;lum[i]=l;{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);satS+=mx?(mx-mn)/mx:0;if(r>g*1.15&&g>b*1.05&&mx>120)warmN++}mR+=r;mG+=g;mB+=b;mL+=l;const cb=128-.168736*r-.331264*g+.5*b,cr2=128+.5*r-.418688*g-.081312*b;if(cb>=77&&cb<=127&&cr2>=137&&cr2<=173&&l>45&&r>g&&r>b){skinN++;mask[i]=1}}
  mR/=N;mG/=N;mB/=N;mL/=N;let lv=0;for(let i=0;i<N;i++)lv+=(lum[i]-mL)**2;const std=Math.sqrt(lv/N);
  const mag=new Float32Array(N),gxA=new Float32Array(N),gyA=new Float32Array(N);let mm=0;
  for(let y=1;y<AH-1;y++)for(let x=1;x<AW-1;x++){const i=y*AW+x,a=lum[i-AW-1],b=lum[i-AW],c=lum[i-AW+1],e=lum[i-1],f=lum[i+1],g=lum[i+AW-1],h=lum[i+AW],k=lum[i+AW+1];const gx=(c+2*f+k)-(a+2*e+g),gy=(g+2*h+k)-(a+2*b+c);gxA[i]=gx;gyA[i]=gy;const m=Math.hypot(gx,gy);mag[i]=m;mm+=m}
  mm/=N;const thr=Math.max(70,mm*1.8);let strong=0,diagN=0,slL=0,slLn=0,bsR=0,bsRn=0,tslL=0,tbsR=0,tLn=0,tRn=0,topD=0,botD=0,bord=0,bordN=0,cen=0,cenN=0;const rowCov=new Float32Array(AH),mb=Math.round(AW*.15),mbY=Math.round(AH*.15);
  for(let y=1;y<AH-1;y++)for(let x=1;x<AW-1;x++){const i=y*AW+x,m=mag[i],isB=x<mb||x>=AW-mb||y<mbY||y>=AH-mbY;if(isB){bordN++;if(m>thr)bord++}else{cenN++;if(m>thr)cen++}if(y<AH/2)topD+=m;else botD+=m;if(m<=thr)continue;strong++;
    const gx=gxA[i],gy=gyA[i],ax=Math.abs(gx),ay=Math.abs(gy);if(ay>2.2*ax)rowCov[y]++;const ang=Math.atan2(ay,ax)*180/Math.PI,isDiag=ang>22&&ang<68;if(isDiag)diagN++;const slash=gx*gy>0;
    if(y>AH*.45){if(x<AW/2){slLn++;if(isDiag&&slash)slL++}else{bsRn++;if(isDiag&&!slash)bsR++}}else{if(x<AW/2){tLn++;if(isDiag&&slash)tslL++}else{tRn++;if(isDiag&&!slash)tbsR++}}}
  let hy=-1,hc=0;for(let y=3;y<AH-3;y++){const cov=(rowCov[y-1]+rowCov[y]+rowCov[y+1])/AW;if(cov>hc){hc=cov;hy=y}}
  let sd=0;for(let y=0;y<AH;y++)for(let x=0;x<AW/2;x++)sd+=Math.abs(lum[y*AW+x]-lum[y*AW+AW-1-x]);sd/=(N/2);const sym=Math.max(0,Math.min(1,1-sd/(std*1.1+6)));
  const sal=new Float32Array(N);for(let i=0;i<N;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];sal[i]=Math.abs(lum[i]-mL)/255+Math.hypot(r-mR,g-mG,b-mB)/300+mag[i]/700}
  const sorted=Array.from(sal).sort((a,b)=>a-b),st=sorted[Math.floor(N*.9)],sAll=sorted.reduce((a,b)=>a+b,0)/N;let wsum=0,cx=0,cy=0,topM=0,topC=0;
  for(let i=0;i<N;i++){if(sal[i]<st)continue;const w=sal[i]-st+1e-3,x=(i%AW+.5)/AW,y=(((i/AW)|0)+.5)/AH;wsum+=w;cx+=w*x;cy+=w*y;topM+=sal[i];topC++}cx/=wsum;cy/=wsum;topM/=Math.max(1,topC);
  let spr=0;for(let i=0;i<N;i++){if(sal[i]<st)continue;const w=sal[i]-st+1e-3,x=(i%AW+.5)/AW,y=(((i/AW)|0)+.5)/AH;spr+=w*((x-cx)**2+(y-cy)**2)}spr=Math.sqrt(spr/wsum);
  const subj=Math.max(0,Math.min(1,1-(spr-.08)/.22))*(.4+.6*Math.max(0,Math.min(1,(topM/(sAll+1e-3)-1.3)/1.5)));
  const lab=new Int32Array(N),q=new Int32Array(N),blobs=[];
  for(let i=0;i<N;i++){if(!mask[i]||lab[i])continue;let h=0,t=0;q[t++]=i;const id=blobs.length+1;lab[i]=id;const b={n:0,sx:0,sy:0,x0:AW,x1:0,y0:AH,y1:0};
    while(h<t){const j=q[h++],x=j%AW,y=(j/AW)|0;b.n++;b.sx+=x;b.sy+=y;if(x<b.x0)b.x0=x;if(x>b.x1)b.x1=x;if(y<b.y0)b.y0=y;if(y>b.y1)b.y1=y;
      if(x>0&&mask[j-1]&&!lab[j-1]){lab[j-1]=id;q[t++]=j-1}if(x<AW-1&&mask[j+1]&&!lab[j+1]){lab[j+1]=id;q[t++]=j+1}if(y>0&&mask[j-AW]&&!lab[j-AW]){lab[j-AW]=id;q[t++]=j-AW}if(y<AH-1&&mask[j+AW]&&!lab[j+AW]){lab[j+AW]=id;q[t++]=j+AW}}blobs.push(b)}
  const sf=skinN/N;let skin=false,skinConf=0,skx=.5,sky=.3,fh=0,faces=[];const big=blobs.filter(b=>{const w=b.x1-b.x0+1,h=b.y1-b.y0+1;return b.n>=N*.004&&w<AW*.68&&h/w>.5&&h/w<2.8&&b.n/(w*h)>.35}).sort((a,b)=>b.n-a.n);
  if(big.length&&sf<.55){const m=big[0],bw=m.x1-m.x0+1,bh=m.y1-m.y0+1;skin=true;skx=(m.sx/m.n+.5)/AW;sky=(m.sy/m.n+.5)/AH;fh=bh/AH;skinConf=Math.min(1,m.n/(bw*bh)*1.3);
    faces=big.filter(b=>{const w=b.x1-b.x0+1,h=b.y1-b.y0+1;return b.n>=m.n*.35&&h/w>.6&&h/w<2.4}).slice(0,6).map(b=>[(b.sx/b.n+.5)/AW,(b.sy/b.n+.5)/AH]);if(!faces.length)faces=[[skx,sky]]}
  return{cx,cy,spr,subj,sym,hor:hc>.5,hy:(hy+.5)/AH,hc,diag:strong?diagN/strong:0,lead:Math.min(slLn?slL/slLn:0,bsRn?bsR/bsRn:0),tri:Math.min(tLn?tslL/tLn:0,tRn?tbsR/tRn:0),
    mL,sat:satS/N,warm:warmN/N,density:strong/N,frameRatio:(bord/Math.max(1,bordN)+.005)/(cen/Math.max(1,cenN)+.005),topD,botD,skin,skinConf,skx,sky,fh,faces,std};
}
/* ---------- 추천 점수 ---------- */
function score(f,st){
  const off=Math.hypot(f.cx-.5,f.cy-.5),s={},R={};
  s.thirds=.42+.3*f.subj*(off>.1?1:.5);R.thirds=f.subj>.4?'주인공이 뚜렷해요':'무난한 기본 구도';s.golden=.36+.26*f.subj;R.golden='자연스러운 비율';
  s.spiral=.25+.5*f.subj*(off>.12?1:.3);R.spiral='주인공이 한쪽에 있어요';s.center=.1+.8*f.sym*(1-Math.min(1,Math.abs(f.cx-.5)*2.5));R.center='좌우가 대칭이에요';
  s.diagonal=Math.min(.95,f.diag*1.35);R.diagonal='대각선 요소가 많아요';const dull=f.topD<f.botD*.8;
  s.horizonLow=f.hor?.5+.4*Math.min(1,f.hc)*(dull?.35:1):.06;R.horizonLow='수평선 감지 · 하늘이 멋져요';s.horizonHigh=f.hor?.5+.4*Math.min(1,f.hc)*(dull?1:.45):.06;R.horizonHigh='수평선 감지 · 땅을 더 담기';
  s.leading=Math.min(.95,f.lead*2.4);R.leading='선이 한 점으로 모여요';s.triangle=Math.min(.9,f.tri*2.2);R.triangle='위로 모이는 삼각형';
  s.frame=Math.min(.9,Math.max(0,f.frameRatio-1.6)*.45);R.frame='가장자리에 테두리가 있어요';s.negative=Math.max(0,1-f.density*9)*(.35+.6*f.subj);R.negative='배경이 단순해요';
  const nF=f.faces?f.faces.length:0;
  for(const k in PT){if(!f.skin){s[k]=.03;continue}s[k]=(.5+.42*f.skinConf)*Math.exp(-(Math.log(Math.max(.005,f.fh)/PT[k])**2)/(2*.25));if(nF>=2&&k!=='two'&&k!=='group')s[k]*=.75}
  if(f.skin){s.portrait*=1-Math.min(1,Math.abs(f.skx-.5)*2.2);s.off*=Math.abs(f.skx-.5)>.1?1.1:.6;s.profile*=.8;s.selfie*=(st.mode==='live'&&st.facing==='user')?1.25:.55;s.two*=nF===2?1.35:.2;s.group*=nF>=3?1.4:.15;s.action*=.55+f.diag*.8;s.travel*=f.hor?1.15:.8}
  for(const k in PT)s[k]=Math.min(.97,s[k]);
  Object.assign(R,{close:'얼굴이 화면을 꽉 채워요',portrait:'얼굴이 가운데 있어요',off:'얼굴이 한쪽에 있어요',profile:'옆모습이면 코 앞에 여백',half:'허벅지까지 보이는 거리',full:'전신이 보이는 거리',travel:'사람이 작고 배경이 커요',selfie:'셀카 모드',two:'두 사람이 보여요',group:nF+'명 감지',action:'움직임 방향에 여백'});
  return{s,R};
}
/* ---------- 안내 문구 ---------- */
function moveHint(sx,sy,tx,ty,st,who){const dx=tx-sx,dy=ty-sy,T=.055;if(Math.abs(dx)<T&&Math.abs(dy)<T)return null;const p=[];
  if(st.mode==='live'&&st.facing==='environment'){if(Math.abs(dx)>=T)p.push(dx>0?'← 왼쪽으로':'→ 오른쪽으로');if(Math.abs(dy)>=T)p.push(dy>0?'↑ 위로':'↓ 아래로');return'폰을 살짝 '+p.join(' · ')}
  if(Math.abs(dx)>=T)p.push(dx>0?'→ 오른쪽':'← 왼쪽');if(Math.abs(dy)>=T)p.push(dy>0?'↓ 아래':'↑ 위');return(who||'주인공')+'을 화면 '+p.join(' · ')+' 쪽으로'}
function hint(id,f,st,W,H){
  const it=BY[id],now=performance.now();if(!it)return{t:''};if(!f)return{t:st.mode==='idle'?'':'장면을 읽는 중…'};let src=null,tgt=null,t=null,ok=false;
  if(it.kind==='style'){const steps=it.steps;if(it.target){const uf=it.face&&f.skin;src=uf?[f.skx,f.sky]:[f.cx,f.cy];tgt=it.target;const p=moveHint(src[0],src[1],tgt[0],tgt[1],st,uf?'얼굴':'주인공');if(!p){ok=true;t='좋아요, 지금 찍으세요'}else t=Math.floor(now/5000)%2?steps[Math.floor(now/10000)%steps.length]:p}else t=steps[Math.floor(now/4000)%steps.length]}
  else if(id==='horizonLow'||id==='horizonHigh'){const ty=id==='horizonLow'?2/3:1/3;if(!f.hor)return{t:'하늘과 땅이 보이게 비춰주세요'};const dy=ty-f.hy;src=[.5,f.hy];tgt=[.5,ty];
    if(Math.abs(dy)<.045){ok=true;t='수평선 위치 좋아요'}else t=(st.mode==='live'&&st.facing==='environment')?(dy>0?'폰을 살짝 ↑ 위로 (수평선 내리기)':'폰을 살짝 ↓ 아래로 (수평선 올리기)'):(dy>0?'수평선을 더 아래로':'수평선을 더 위로')}
  else if(it.kind==='portrait'){if(!f.skin)return{t:id==='group'?'단체 얼굴이 보이게 담아주세요':'얼굴이 보이게 비춰주세요'};const sp=pLayout(id,st.pSide);tgt=sp.faceT;
    const fs=(id==='two'||id==='group')&&f.faces.length>=2?f.faces.slice(0,id==='two'?2:6):[[f.skx,f.sky]];src=[fs.reduce((a,b)=>a+b[0],0)/fs.length,fs.reduce((a,b)=>a+b[1],0)/fs.length];
    const p=moveHint(src[0],src[1],tgt[0],tgt[1],st,'얼굴'),r=f.fh/sp.fhT,live=st.mode==='live',size=r<.62?(live?'한 걸음 앞으로':'더 크게 담기'):r>1.6?(live?'한 걸음 뒤로':'더 작게 담기'):null;
    if(!p&&!size){ok=true;t=id==='full'?'좋아요, 폰을 낮게 들고 찍으세요':id==='selfie'?'좋아요, 턱 살짝 당기고 찰칵':'좋아요, 지금 찍으세요'}else t=[size,p].filter(Boolean).join(' · ')}
  else{const sx=f.cx,sy=f.cy;tgt=id==='thirds'||id==='negative'?[sx<.5?1/3:2/3,sy<.5?1/3:2/3]:id==='golden'?[sx<.5?1-1/PHI:1/PHI,sy<.5?1-1/PHI:1/PHI]:id==='spiral'?spiralEnd(H>W,st.spiralFlip.x,st.spiralFlip.y):id==='center'?[.5,.5]:null;
    if(tgt){src=[sx,sy];t=moveHint(sx,sy,tgt[0],tgt[1],st);if(!t){ok=true;t='좋아요, 지금 찍으세요'}}else t={diagonal:'주요 선을 대각선에 맞춰보세요',leading:'선이 모이는 점을 노란 점에',triangle:'주인공들을 삼각형 안에',frame:'창·문·나무로 테두리를 만들어보세요'}[id]}
  if(st.mode==='still'&&t&&!ok)t='다음엔 '+t.replace('폰을 살짝 ','폰을 ');
  return{t,src,tgt,ok};
}
function follow(f,st,W,H){const p=H>W,e0=spiralEnd(p,false,false);if(!st.spiralManual){st.spiralFlip.x=(f.cx<.5)!==(e0[0]<.5);st.spiralFlip.y=(f.cy<.5)!==(e0[1]<.5)}if(!st.pSideManual&&f.skin){if(f.skx<.45)st.pSide='L';else if(f.skx>.55)st.pSide='R'}}

/* ---------- 장면 인식 ---------- */
const SCN={
 selfie:{label:'셀카',cats:['people','couple'],tags:['selfie','person'],basic:['selfie','close','portrait']},
 group:{label:'단체',cats:['couple','people','travel'],tags:['family','person'],basic:['group','triangle','center']},
 couple:{label:'두 사람',cats:['couple','people'],tags:['couple','person'],basic:['two','thirds','center']},
 portrait:{label:'인물',cats:['people','film','master','night'],tags:['person'],basic:['portrait','off','half','close','profile']},
 personFar:{label:'인물 + 배경',cats:['travel','people','land','street'],tags:['person','travel','outdoor'],basic:['full','travel','thirds','leading']},
 top:{label:'위에서 내려다봄',cats:['food','travel','pet'],tags:['top','food'],basic:['center','negative','diagonal']},
 night:{label:'밤 · 어두운 곳',cats:['night','street','film'],tags:['night'],basic:['center','leading','negative']},
 land:{label:'풍경',cats:['land','travel','night'],tags:['land','outdoor'],basic:['horizonLow','horizonHigh','thirds','leading']},
 street:{label:'거리 · 건물',cats:['street','film','master'],tags:['street','city'],basic:['leading','center','frame','diagonal']},
 object:{label:'사물 · 음식',cats:['food','master','pet'],tags:['food','close'],basic:['center','negative','golden']},
 general:{label:'일상',cats:['travel','people','street','food'],tags:[],basic:['thirds','golden','spiral','diagonal']},
};
function scene(f,st){if(!f)return null;const nF=f.skin?Math.max(1,f.faces.length):0,dark=f.mL<62;let k;
  if(st.facing==='user'&&f.skin)k='selfie';else if(nF>=3)k='group';else if(nF===2)k='couple';else if(f.skin&&f.fh>.07)k='portrait';else if(f.skin)k='personFar';
  else if(st.flat>.6)k='top';else if(dark)k='night';else if(f.hor&&f.hc>.6)k='land';else if(f.lead>.22||f.sym>.62)k='street';else if(f.subj>.5&&f.density<.1)k='object';else k='general';
  const o=Object.assign({k},SCN[k]);o.dark=dark;o.warm=f.warm>.18;o.n=nF;
  o.label=(k==='group'?nF+'명 ':'')+o.label+(dark&&k!=='night'?' · 밤':'')+(o.warm&&!dark?' · 노을빛':'');return o}
/* 장면에 맞는 레퍼런스 고르기: 기본 구도는 점수로, 스타일은 분류·태그로 */
function recommend(sc,ema,n=12){if(!sc)return[];const out=[],seen=new Set(),push=id=>{if(BY[id]&&!seen.has(id)){seen.add(id);out.push(id)}};
  const auto=ITEMS.filter(i=>i.auto).map(i=>i.id).sort((a,b)=>(ema[b]||0)-(ema[a]||0));
  const want=new Set(sc.tags.concat(sc.dark?['night']:[],sc.warm?['sunset']:[]));
  sc.basic.slice().sort((a,b)=>(ema[b]||0)-(ema[a]||0)).slice(0,2).forEach(push);auto.slice(0,1).forEach(push);
  const st=ITEMS.filter(i=>i.kind==='style').map(i=>{let s=0;const ci=sc.cats.indexOf(i.cat);if(ci>=0)s+=3-ci*.6;(i.tags||[]).forEach(t=>{if(want.has(t))s+=1.2});
    if(sc.n&&i.face)s+=1;if(!sc.n&&i.face&&sc.k!=='general')s-=1.5;if(sc.n>=2&&i.cat==='couple')s+=1;if(sc.dark&&i.cat==='night')s+=1.5;
    let h=0;for(const c of i.id)h=(h*31+c.charCodeAt(0))%997;return[i.id,s+h/997*.8]}).filter(x=>x[1]>1).sort((a,b)=>b[1]-a[1]);
  st.slice(0,n).forEach(x=>push(x[0]));sc.basic.forEach(push);return out.slice(0,n+3)}
window.PhotoCore={photoOf,setOnPhoto:f=>{onPhoto=f},scene,recommend,SCN,items:ITEMS,byId:BY,cats:CATS,drawThumb,drawOverlay,analyze,getCrop,score,hint,follow,pLayout,PT};
})();
