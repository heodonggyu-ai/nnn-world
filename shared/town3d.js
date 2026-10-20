/* 한들물빛도시 3D — 밍뉴의숲(forest/index.html)의 지도 생성 코드를 그대로 옮겨서
   같은 동네(탕정역 ~ 한들물빛도시 ~ 설화·연화 ~ 세교)를 3D로 세워요.
   지도 1칸 = opts.S 미터. 월드 좌표 x = (지도x - 원점x) * S, z = (지도y - 원점y) * S  (북쪽이 -z)
   사용: const town = Town3D.build(THREE, scene, {S:9, origin:[0,0], skip:[x0,y0,x1,y1], px:20}) */
(function(){
'use strict';
const MW=128,OUT_H=96,MH=OUT_H;
const G=0,TG=1,TR=2,WA=3,SA=4,RO=5,FL=6,PA=7,FE=8,YD=9,BU=10,BL=11,FA=12,RD=13,SF=14,SW=15,PZ=16,PG=17,FD=18,PK=19,HE=20,VO=21,RL=27;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function h2(x,y,n=0){const s=Math.sin(x*127.1+y*311.7+n*74.7)*43758.5453;return s-Math.floor(s)}

/* ---------- 지도 만들기 (밍뉴의숲 genMap 그대로) ---------- */
const map=new Uint8Array(MW*MH),gnd=new Uint8Array(MW*MH);
const SPR=[],LABELS=[],GENPG=[];
const tileAt=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?TR:map[y*MW+x];
const setT=(x,y,v)=>{if(x>=0&&y>=0&&x<MW&&y<MH)map[y*MW+x]=v};
const baseOf=(x,y)=>{const t=tileAt(x,y);return t===BL?gnd[y*MW+x]:t};
const PLAZA={x:46,y:40.5};
const YARD={x0:14,y0:81,x1:27,y1:92};
const inYardBox=(x,y)=>x>=YARD.x0-1&&x<=YARD.x1+1&&y>=YARD.y0-1&&y<=YARD.y1+1;
const RAIL=[[2,14.6],[48,2.4]];
const MAINROAD=[[2,82],[34.5,70],[67,57],[92,47],[114.5,37.6],[127,34]];
const CREEK=[[3,28],[5,40],[7,52],[7,62],[5,72],[8,84],[11,95]];
function rect(x0,y0,x1,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setT(x,y,t)}
function frame(x0,y0,x1,y1,t){for(let x=x0;x<=x1;x++){setT(x,y0,t);setT(x,y1,t)}for(let y=y0;y<=y1;y++){setT(x0,y,t);setT(x1,y,t)}}
function sprite(k,x,y,w,h,o={},solid=true){const s=Object.assign({k,x,y,w,h,solid},o);SPR.push(s);if(solid)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const i=yy*MW+xx;gnd[i]=tileAt(xx,yy);setT(xx,yy,BL)}return s}
function aptBlock(x0,y0,x1,y1,gates){rect(x0,y0,x1,y1,G);frame(x0,y0,x1,y1,HE);gates.forEach(([x,y])=>setT(x,y,SW))}
function ringSW(x0,y0,x1,y1){for(let x=x0-1;x<=x1+1;x++)[y0-1,y1+1].forEach(y=>{if(tileAt(x,y)===G)setT(x,y,SW)});for(let y=y0-1;y<=y1+1;y++)[x0-1,x1+1].forEach(x=>{if(tileAt(x,y)===G)setT(x,y,SW)})}
function blobT(cx,cy,r,v){for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if((x+.5-cx)**2+(y+.5-cy)**2<=r*r&&tileAt(x,y)===G)setT(x,y,v)}
function complex(name,x0,y0,x1,y1,o={}){
  const mx=Math.floor((x0+x1)/2),my=Math.floor((y0+y1)/2);
  aptBlock(x0,y0,x1,y1,[[mx,y0],[mx+1,y0],[mx,y1],[mx+1,y1],[x0,my],[x1,my]]);ringSW(x0,y0,x1,y1);
  rect(mx,y0+1,mx+1,y1-1,SW);rect(x0+1,my,x1-1,my,SW);
  const pw=Math.min(8,x1-x0-3),ph=Math.min(3,my-y0-1);let pg=null;
  if(o.pg!==false&&pw>=4&&ph>=3){const px0=mx-Math.floor(pw/2)+1;pg={x0:px0,y0:my-ph,x1:px0+pw-1,y1:my-1};rect(pg.x0,pg.y0,pg.x1,pg.y1,PG);GENPG.push({...pg,c:o.pgc||'#F2B880'})}
  const free=(ax,ay)=>{for(let y=ay;y<=ay+2;y++)for(let x=ax;x<=ax+2;x++){if(tileAt(x,y)!==G)return false}for(let x=ax-1;x<=ax+3;x++){if(tileAt(x,ay+3)===BL)return false}return true};
  let n=1;const base=o.num||100;
  for(let ay=y0+1;ay+2<=y1-1;ay++)for(let ax=x0+1;ax+2<=x1-1;ax++){if(!free(ax,ay))continue;sprite('apt',ax,ay,3,3,{label:(base+n++)+'동',cx:name});ax+=3}
  if(pg){const k=o.play||'parkplay',w=k==='hippo'||k==='panda'?3:4,sx=pg.x0+1;sprite(k,sx,pg.y0,w,2);if(pg.x1-(sx+w)>=1)sprite('swing',pg.x1-1,pg.y0,2,2)}
  sprite('sign',x0+1,y0,1,1,{text:name},false);LABELS.push([o.short||name,(x0+x1+1)/2,y1+1.7]);
}
function schoolBlock(name,x0,y0,x1,y1,o={}){
  rect(x0,y0,x1,y1,G);frame(x0,y0,x1,y1,FE);ringSW(x0,y0,x1,y1);
  const W=Math.min(x1-x0-1,16),sx=x0+1+Math.floor((x1-x0-1-W)/2),sy=y1-4;
  const fh=Math.min(y1-y0-6,6),fw=Math.min(x1-x0-3,13);rect(x0+1,y0+1,x1-1,y0+fh,FD);
  if(fw>=6&&fh>=4)sprite('track',x0+2,y0+1,fw,fh,{},false);
  sprite('school',sx,sy,W,4,{text:name});
  const dx=sx+Math.floor(W/2);setT(dx-1,y1,SW);setT(dx,y1,SW);setT(x0,y0+2,SW);setT(x1,y0+2,SW);
  LABELS.push([o.short||name,(x0+x1+1)/2,y1+1.7]);
}
function thickLine(pts,w,t){for(let i=0;i<pts.length-1;i++){const[a,b]=pts[i],[c,d]=pts[i+1],n=Math.ceil(Math.hypot(c-a,d-b)*3);
  for(let k=0;k<=n;k++){const x=a+(c-a)*k/n,y=b+(d-b)*k/n;for(let yy=Math.floor(y-w/2);yy<=Math.floor(y+w/2-0.01);yy++)for(let xx=Math.floor(x-w/2);xx<=Math.floor(x+w/2-0.01);xx++){if(xx<2||yy<2||xx>=MW-2||yy>=OUT_H-2)continue;setT(xx,yy,t)}}}}
let made=false;
function genMap(){
  if(made)return;made=true;map.fill(G);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(x<2||y<2||x>=MW-2||y>=OUT_H-2)setT(x,y,TR)}
  rect(2,15,53,15,SW);rect(2,16,53,17,RD);rect(2,18,53,18,SW);
  rect(36,13,36,66,SW);rect(37,13,38,68,RD);rect(39,13,39,66,SW);
  rect(51,13,51,60,SW);rect(52,13,53,61,RD);rect(54,13,54,60,SW);
  rect(37,30,103,30,SW);rect(37,31,103,32,RD);rect(37,33,103,33,SW);
  rect(101,2,101,40,SW);rect(102,2,103,42,RD);rect(104,2,104,40,SW);
  thickLine(MAINROAD,7,SW);thickLine(MAINROAD,4,RD);
  thickLine(CREEK,6,SA);thickLine(CREEK,3,WA);
  for(let y=2;y<OUT_H-2;y++)for(let x=2;x<20;x++)if(tileAt(x,y)===SA&&h2(x,y,4)<0.16)setT(x,y,RO);
  thickLine(RAIL,4,SA);thickLine(RAIL,2,RL);
  rect(22,11,35,14,PZ);
  complex('센트럴푸르지오 1단지',9,22,22,34,{num:100,play:'swan',short:'1단지'});
  complex('센트럴푸르지오 2단지',24,20,34,29,{num:200,play:'hippo',short:'2단지'});
  complex('센트럴푸르지오 3단지',41,19,50,29,{num:300,play:'panda',short:'3단지'});
  schoolBlock('한들물빛중학교',56,19,65,29,{short:'한들물빛중'});
  rect(41,35,50,44,G);frame(41,35,50,44,HE);[[45,35],[46,35],[41,39],[50,39],[45,44],[46,44]].forEach(([x,y])=>setT(x,y,SW));ringSW(41,35,50,44);
  for(let y=36;y<=43;y++)for(let x=42;x<=49;x++){const d=Math.hypot(x+.5-PLAZA.x,y+.5-PLAZA.y);if(d<2.6)setT(x,y,PZ);else if(d<3.3&&(x+y)%2===0)setT(x,y,FL)}
  rect(42,36,45,37,PG);GENPG.push({x0:42,y0:36,x1:45,y1:37,c:'#F2B880'});sprite('parkplay',42,36,4,2);
  blobT(48.5,42,1.2,TG);setT(43,42,RO);setT(48,37,RO);setT(42,43,TR);setT(49,36,TR);sprite('bench',48,39,1,1);sprite('sign',42,35,1,1,{text:'한들물빛공원'},false);LABELS.push(['한들물빛공원',46,46]);
  schoolBlock('한들물빛초등학교',16,38,31,49,{main:1,short:'한들물빛초'});
  complex('탕정 시티프라디움',56,35,69,45,{num:100,short:'시티프라디움'});
  complex('아산탕정 휴먼시아 7단지',72,35,82,43,{num:700,pg:false,short:'휴먼시아7단지'});
  complex('한들물빛도시 예미지',41,47,50,56,{num:100,short:'예미지'});
  complex('한들물빛도시 하늘채',17,52,32,61,{num:100,short:'하늘채'});
  complex('LH 5단지',21,63,32,66,{num:500,pg:false,short:'LH 5단지'});
  rect(56,47,70,52,SW);sprite('mall',56,48,7,3);sprite('gym',63,48,6,3);for(let x=56;x<=70;x+=4)setT(x,52,TR);LABELS.push(['엔엔엔복싱',66,54]);
  schoolBlock('설화고등학교',67,3,80,13,{short:'설화고'});
  complex('아산신도시 STX칸 6단지',56,3,64,14,{num:600,pg:false,short:'STX칸6단지'});
  schoolBlock('연화초등학교',84,5,96,16,{short:'연화초'});
  complex('연화마을 8단지',72,17,86,28,{num:800,short:'연화마을8단지'});
  schoolBlock('설화중학교',89,18,99,28,{short:'설화중'});
  schoolBlock('이순신고등학교',105,44,118,53,{short:'이순신고'});
  schoolBlock('이순신초등학교',108,57,121,67,{short:'이순신초'});
  complex('신라아파트',83,55,95,64,{num:100,short:'신라아파트'});
  schoolBlock('아산세교중학교',88,69,100,79,{short:'세교중'});
  complex('아산탕정 LH 7단지',50,68,62,78,{num:700,short:'LH 7단지'});
  complex('별하신도시 하늘채',35,76,47,86,{num:100,short:'별하 하늘채'});
  complex('엘리프 아산탕정',50,81,61,91,{num:100,short:'엘리프'});
  schoolBlock('아산세교초등학교',64,80,76,91,{short:'세교초'});
  rect(YARD.x0-1,YARD.y0-1,YARD.x1+1,YARD.y1+1,G);frame(YARD.x0,YARD.y0,YARD.x1,YARD.y1,FE);
  setT(YARD.x0+10,YARD.y0,SW);setT(YARD.x0+11,YARD.y0,SW);rect(YARD.x0+10,YARD.y0-1,YARD.x0+11,YARD.y0-1,SW);rect(YARD.x0+1,YARD.y0+1,YARD.x1-1,YARD.y1-1,YD);
  rect(YARD.x0+10,YARD.y0+8,YARD.x0+11,YARD.y0+9,FA);sprite('house',YARD.x0+4,YARD.y0+1,4,2);LABELS.push(['밍뉴네 집',(YARD.x0+YARD.x1+1)/2,YARD.y0-0.8]);
  for(let y=2;y<OUT_H-2;y++)for(let x=2;x<MW-2;x++){if(tileAt(x,y)!==G||inYardBox(x,y))continue;let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){const t=tileAt(x+dx,y+dy);if(t===RD||t===SW||t===HE||t===FE||t===BL||t===RL||t===PZ){near=true;break}}
    if(near)continue;const r=h2(x,y,31);if(r<0.07)setT(x,y,TR);else if(r<0.085)setT(x,y,RO);else if(r<0.12)setT(x,y,FL);else if(r<0.16)setT(x,y,TG);else if(r<0.175)setT(x,y,SF);else if(r<0.18)setT(x,y,BU)}
  sprite('station',23,12,11,3);sprite('sign',36,13,1,1,{text:'탕정역'},false);
  sprite('sign',124,17,1,1,{text:'천안아산역 가는 길'},false);sprite('sign',60,55,1,1,{text:'21번 국도'},false);
  sprite('bus',39,22,1,1,{text:'지웰시티3단지정문'},false);sprite('bus',33,48,1,1,{text:'한들물빛초등학교'},false);sprite('bus',39,50,1,1,{text:'한들물빛 예미지 서문'},false);sprite('bus',54,22,1,1,{text:'한들물빛중학교'},false);
  [6,18,30,44,60,76,92].forEach(x=>{if(x<54)sprite('lamp',x,15,1,1,{},false);sprite('lamp',x,30,1,1,{},false)});
  [20,40,60,80].forEach(y=>{sprite('lamp',36,y,1,1,{},false);sprite('lamp',54,y,1,1,{},false)});
}

/* ---------- 3D 만들기 ---------- */
const PGCOL={'1단지':'#9ED6E6'};
function canvasTex(THREE,w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return t}
function textTex(THREE,text,o={}){const fs=o.fs||44,pad=14;const c=document.createElement('canvas');const g=c.getContext('2d');g.font=`${fs}px "Jua","Black Han Sans",sans-serif`;const w=Math.ceil(g.measureText(text).width)+pad*2,h=fs+pad*1.4;
  c.width=Math.min(1024,w);c.height=h;g.font=`${fs}px "Jua","Black Han Sans",sans-serif`;g.fillStyle=o.bg||'#3E8E5E';if(o.round!==false){const r=12;g.beginPath();g.moveTo(r,0);g.arcTo(c.width,0,c.width,c.height,r);g.arcTo(c.width,c.height,0,c.height,r);g.arcTo(0,c.height,0,0,r);g.arcTo(0,0,c.width,0,r);g.fill()}else g.fillRect(0,0,c.width,c.height);
  g.fillStyle=o.fg||'#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(text,c.width/2,c.height/2+2);const t=new THREE.CanvasTexture(c);t.userData={w:c.width,h:c.height};return t}

function build(THREE,scene,opts={}){
  genMap();
  const S=opts.S||8,O=opts.origin||[0,0],PX=opts.px||20,skip=opts.skip||null,lite=!!opts.lite;
  const W=(tx,ty)=>({x:(tx-O[0])*S,z:(ty-O[1])*S});
  const inSkip=(x,y)=>skip&&x>=skip[0]&&x<=skip[2]&&y>=skip[1]&&y<=skip[3];
  const root=new THREE.Group();scene.add(root);
  /* 바닥: 지도 한 장을 그림으로 */
  const gc=document.createElement('canvas');gc.width=MW*PX;gc.height=OUT_H*PX;const g=gc.getContext('2d');
  const COL={[G]:'#8CCB6B',[TG]:'#7FBE5E',[TR]:'#86C566',[RO]:'#8CCB6B',[FL]:'#8CCB6B',[BU]:'#8CCB6B',[SF]:'#8CCB6B',[WA]:'#6EC1E4',[SA]:'#E8D3A2',[RD]:'#6E747B',[SW]:'#DCD6CA',[PZ]:'#ECE0C6',[FD]:'#DCBC8C',[YD]:'#A8DB86',[FA]:'#9A6A45',[HE]:'#5DA45E',[FE]:'#8CCB6B',[RL]:'#B9AE9C',[PA]:'#E6D3A8',[PK]:'#8E949A'};
  for(let y=0;y<OUT_H;y++)for(let x=0;x<MW;x++){let t=baseOf(x,y);let c=COL[t]||'#8CCB6B';if(t===PG){const z=GENPG.find(z=>x>=z.x0&&x<=z.x1&&y>=z.y0&&y<=z.y1);c=z?z.c:'#F2B880'}
    g.fillStyle=c;g.fillRect(x*PX,y*PX,PX,PX);
    const X=x*PX,Y=y*PX;
    if(t===G||t===TG||t===FL||t===TR){for(let i=0;i<3;i++){g.fillStyle=`rgba(${h2(x,y,i)<.5?'60,120,50':'190,230,150'},.35)`;g.fillRect(X+h2(x,y,i+3)*PX,Y+h2(x,y,i+6)*PX,2,3)}}
    if(t===FL){const cols=['#F7A8C0','#FFFFFF','#FFC94A','#B9A4F2'];for(let i=0;i<5;i++){g.fillStyle=cols[Math.floor(h2(x,y,i+8)*4)];g.beginPath();g.arc(X+3+h2(x,y,i)*(PX-6),Y+3+h2(x,y,i+4)*(PX-6),PX*.09,0,7);g.fill()}}
    if(t===SW){g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1;g.strokeRect(X+.5,Y+.5,PX/2,PX/2);g.strokeRect(X+PX/2+.5,Y+PX/2+.5,PX/2-1,PX/2-1)}
    if(t===WA&&h2(x,y)<.3){g.fillStyle='rgba(255,255,255,.4)';g.fillRect(X+PX*.3,Y+PX*.5,PX*.3,1.5)}
    if(t===RD){g.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<6;i++)g.fillRect(X+h2(x,y,i)*PX,Y+h2(x,y,i+9)*PX,1.5,1.5)}
    if(t===SA){g.fillStyle='rgba(180,150,90,.4)';for(let i=0;i<4;i++)g.fillRect(X+h2(x,y,i)*PX,Y+h2(x,y,i+9)*PX,1.5,1.5)}
  }
  // 도로 차선 (노란 중앙선)
  g.strokeStyle='#F2C94C';g.lineWidth=Math.max(1.5,PX*.08);g.setLineDash([]);
  [[2,17,53,17],[37,32,103,32]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a*PX,b*PX);g.lineTo(c*PX,d*PX);g.stroke()});
  [[38,13,38,68],[53,13,53,61],[103,2,103,42]].forEach(([a,b,c,d])=>{g.beginPath();g.moveTo(a*PX,b*PX);g.lineTo(c*PX,d*PX);g.stroke()});
  g.beginPath();MAINROAD.forEach(([x,y],i)=>i?g.lineTo(x*PX,y*PX):g.moveTo(x*PX,y*PX));g.stroke();
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=Math.max(1,PX*.05);g.setLineDash([PX*.6,PX*.6]);
  [-1,1].forEach(o=>{g.beginPath();MAINROAD.forEach(([x,y],i)=>{const j=Math.min(i,MAINROAD.length-2),dx=MAINROAD[j+1][0]-MAINROAD[j][0],dy=MAINROAD[j+1][1]-MAINROAD[j][1],L=Math.hypot(dx,dy);const nx=-dy/L,ny=dx/L;i?g.lineTo((x+nx*o)*PX,(y+ny*o)*PX):g.moveTo((x+nx*o)*PX,(y+ny*o)*PX)});g.stroke()});
  g.setLineDash([]);
  // 학교 운동장 트랙
  SPR.filter(s=>s.k==='track').forEach(s=>{g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=PX*.12;const x=s.x*PX+PX*.4,y=s.y*PX+PX*.4,w=s.w*PX-PX*.8,h=s.h*PX-PX*.8,r=h/2;g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2);g.lineTo(x+r,y+h);g.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5);g.stroke();g.strokeStyle='rgba(200,90,60,.5)';g.lineWidth=PX*.5;g.stroke()});
  // 공원 광장 동그라미
  g.strokeStyle='#D6C49E';g.lineWidth=PX*.08;for(let r=1;r<=3;r++){g.beginPath();g.arc(PLAZA.x*PX,PLAZA.y*PX,r*PX*1.05,0,7);g.stroke()}
  // 철길
  g.save();g.translate(RAIL[0][0]*PX,(RAIL[0][1]+.5)*PX);g.rotate(Math.atan2(RAIL[1][1]-RAIL[0][1],RAIL[1][0]-RAIL[0][0]));const RL_L=Math.hypot(RAIL[1][0]-RAIL[0][0],RAIL[1][1]-RAIL[0][1])*PX;
  for(let i=0;i<RL_L;i+=PX*.35){g.fillStyle='#8B6A4E';g.fillRect(i,-PX*.45,PX*.15,PX*.9)}g.fillStyle='#7E8A94';g.fillRect(0,-PX*.28,RL_L,PX*.08);g.fillRect(0,PX*.2,RL_L,PX*.08);g.restore();
  const gtex=new THREE.CanvasTexture(gc);gtex.anisotropy=8;gtex.minFilter=THREE.LinearMipmapLinearFilter;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(MW*S,OUT_H*S),new THREE.MeshLambertMaterial({map:gtex}));ground.rotation.x=-Math.PI/2;
  const c0=W(MW/2,OUT_H/2);ground.position.set(c0.x,opts.groundY||0,c0.z);root.add(ground);
  const outer=new THREE.Mesh(new THREE.PlaneGeometry(MW*S*6,OUT_H*S*8),new THREE.MeshLambertMaterial({color:0x7FB85F}));outer.rotation.x=-Math.PI/2;outer.position.set(c0.x,(opts.groundY||0)-.05,c0.z);root.add(outer);

  /* 나무·바위·덤불·울타리: 인스턴스로 한 번에 */
  const AXY=new THREE.Vector3(0,1,0),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),SC=new THREE.Vector3(),CO=new THREE.Color();
  const trees=[],rocks=[],bushes=[],hedges=[],fences=[];
  for(let y=0;y<OUT_H;y++)for(let x=0;x<MW;x++){if(inSkip(x,y))continue;const t=tileAt(x,y);if(t===TR)trees.push([x,y]);else if(t===RO)rocks.push([x,y]);else if(t===BU)bushes.push([x,y]);else if(t===HE)hedges.push([x,y]);else if(t===FE)fences.push([x,y])}
  const ts=S/8;// 나무 크기는 1칸 크기에 맞춰요
  {const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35*ts,.45*ts,3*ts,6),new THREE.MeshLambertMaterial({color:0x8a5a34}),trees.length);
   const can=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.6*ts,1),new THREE.MeshLambertMaterial({color:0xffffff}),trees.length*3);
   const PALC=['#4FA35A','#5DB565','#3E8E4A','#6BBF6A','#479B52'];let ci=0;
   trees.forEach(([x,y],i)=>{const p=W(x+.5,y+.5),s=.85+h2(x,y,4)*.4;M4.compose(V.set(p.x,1.5*ts*s,p.z),Q.identity(),SC.set(s,s,s));trunk.setMatrixAt(i,M4);
     for(let k=0;k<3;k++){const a=h2(x,y,k+20)*6.28,r=k?1.3*ts*s:0;const s2=s*(k?.8:1.05);M4.compose(V.set(p.x+Math.cos(a)*r,(k?3.8:4.8)*ts*s,p.z+Math.sin(a)*r),Q.identity(),SC.set(s2,s2*.92,s2));can.setMatrixAt(ci,M4);can.setColorAt(ci,CO.set(PALC[Math.floor(h2(x,y,k+30)*PALC.length)]));ci++}});
   root.add(trunk,can)}
  if(rocks.length){const m=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.4*ts,0),new THREE.MeshLambertMaterial({color:0xA9A49A}),rocks.length);rocks.forEach(([x,y],i)=>{const p=W(x+.5,y+.5);Q.setFromAxisAngle(AXY,h2(x,y)*6);M4.compose(V.set(p.x,.6*ts,p.z),Q,SC.set(1.3,.75,1));m.setMatrixAt(i,M4)});root.add(m)}
  if(bushes.length){const m=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6*ts,0),new THREE.MeshLambertMaterial({color:0x4E9D52}),bushes.length);bushes.forEach(([x,y],i)=>{const p=W(x+.5,y+.5);M4.compose(V.set(p.x,.9*ts,p.z),Q.identity(),SC.set(1.2,.8,1.2));m.setMatrixAt(i,M4)});root.add(m)}
  if(hedges.length){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(S,1.3,S*.8),new THREE.MeshLambertMaterial({color:0x4E9D52}),hedges.length);hedges.forEach(([x,y],i)=>{const p=W(x+.5,y+.5);const hz=tileAt(x-1,y)===HE||tileAt(x+1,y)===HE;Q.setFromAxisAngle(AXY,hz?0:Math.PI/2);M4.compose(V.set(p.x,.65,p.z),Q,SC.set(1,1,1));m.setMatrixAt(i,M4)});root.add(m)}
  if(fences.length){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(S,1.5,.25),new THREE.MeshLambertMaterial({color:0xE9C98F}),fences.length);fences.forEach(([x,y],i)=>{const p=W(x+.5,y+.5);const hz=tileAt(x-1,y)===FE||tileAt(x+1,y)===FE;Q.setFromAxisAngle(AXY,hz?0:Math.PI/2);M4.compose(V.set(p.x,.75,p.z),Q,SC.set(1,1,1));m.setMatrixAt(i,M4)});root.add(m)}

  /* 건물과 놀이터 */
  const aptTex=canvasTex(THREE,64,128,(c,w,h)=>{c.fillStyle='#F6F5F1';c.fillRect(0,0,w,h);for(let y=8;y<h;y+=16)for(let x=6;x<w;x+=20){c.fillStyle='#A9CFE0';c.fillRect(x,y,12,8);c.fillStyle='rgba(0,0,0,.08)';c.fillRect(x-2,y+9,16,2)}c.fillStyle='#8DC2D6';c.fillRect(w-6,0,4,h)});aptTex.wrapS=aptTex.wrapT=THREE.RepeatWrapping;
  const schTex=canvasTex(THREE,128,64,(c,w,h)=>{c.fillStyle='#F6E5C4';c.fillRect(0,0,w,h);for(let r=0;r<2;r++)for(let i=0;i<5;i++){c.fillStyle='#A9CFE0';c.fillRect(6+i*25,8+r*30,18,14);c.strokeStyle='#C9B48D';c.lineWidth=2;c.strokeRect(6+i*25,8+r*30,18,14)}});schTex.wrapS=schTex.wrapT=THREE.RepeatWrapping;
  const mApt=new THREE.MeshLambertMaterial({map:aptTex}),mRoof=new THREE.MeshLambertMaterial({color:0x2F5E78}),mSch=new THREE.MeshLambertMaterial({map:schTex}),mSchRoof=new THREE.MeshLambertMaterial({color:0xD2693F});
  const box=(w,h,d,mat,x,y,z,par=root)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);par.add(m);return m};
  // 건물 벽에 붙은 글씨는 앞면만, 표지판·단지 이름은 항상 카메라를 보는 스프라이트 (뒤에서 봐도 글씨가 뒤집히지 않게)
  const label=(text,o,x,y,z,ry,hgt)=>{const t=textTex(THREE,text,o);const hh=hgt||1.4,ww=hh*t.userData.w/t.userData.h;const m=new THREE.Mesh(new THREE.PlaneGeometry(ww,hh),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry||0;root.add(m);return m};
  const tag=(text,o,x,y,z,hgt)=>{const t=textTex(THREE,text,o);const hh=hgt||1.4,ww=hh*t.userData.w/t.userData.h;const m=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));m.scale.set(ww,hh,1);m.position.set(x,y,z);root.add(m);return m};
  const solids=[];// 충돌용 상자 (필요한 게임만 사용)
  const aptH=opts.aptH||40;
  SPR.forEach(s=>{
    if(skip&&inSkip(s.x,s.y)&&inSkip(s.x+s.w-1,s.y+s.h-1))return;
    const p=W(s.x+s.w/2,s.y+s.h/2),w=s.w*S,d=s.h*S;
    switch(s.k){
    case 'apt':{const hh=aptH*(.85+h2(s.x,s.y,3)*.3);const bw=w*.86,bd=d*.62;const b=box(bw,hh,bd,mApt,p.x,hh/2,p.z);
      const tex=aptTex.clone();tex.needsUpdate=true;tex.repeat.set(Math.max(1,Math.round(bw/6)),Math.max(1,Math.round(hh/6)));b.material=new THREE.MeshLambertMaterial({map:tex});
      box(bw+.4,1.6,bd+.4,mRoof,p.x,hh+.8,p.z);
      if(!lite){label(s.label,{bg:'#2F5E78',fs:40},p.x,hh-2.2,p.z+bd/2+.05,0,Math.min(4,S*.4)).scale.multiplyScalar(1)}
      solids.push({minX:p.x-bw/2,maxX:p.x+bw/2,minZ:p.z-bd/2,maxZ:p.z+bd/2,minY:0,maxY:hh});break}
    case 'school':{const hh=14;const b=box(w*.92,hh,d*.6,mSch,p.x,hh/2,p.z);const tex=schTex.clone();tex.needsUpdate=true;tex.repeat.set(Math.round(w/10),2);b.material=new THREE.MeshLambertMaterial({map:tex});
      box(w*.92+.4,1.4,d*.6+.4,mSchRoof,p.x,hh+.7,p.z);const tw=Math.min(12,w*.3);box(tw,hh+6,d*.66,new THREE.MeshLambertMaterial({color:0xF9EED8}),p.x,(hh+6)/2,p.z);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(tw*.75,5,4),mSchRoof);roof.position.set(p.x,hh+8.5,p.z);roof.rotation.y=Math.PI/4;root.add(roof);
      label(s.text,{bg:'#4F7FC1',fs:40},p.x,hh-1,p.z+d*.33+.1,0,Math.min(3.2,S*.38));solids.push({minX:p.x-w*.46,maxX:p.x+w*.46,minZ:p.z-d*.3,maxZ:p.z+d*.3,minY:0,maxY:hh+6});break}
    case 'station':{const hh=11;box(w*.95,hh,d*.7,new THREE.MeshLambertMaterial({color:0x8DB3E2}),p.x,hh/2,p.z);box(w*.95+.6,1,d*.7+.6,new THREE.MeshLambertMaterial({color:0x5B86C9}),p.x,hh+.5,p.z);
      label('탕정역',{bg:'#1F4E99',fs:48},p.x,hh-2,p.z+d*.35+.1,0,S*.5);solids.push({minX:p.x-w*.47,maxX:p.x+w*.47,minZ:p.z-d*.35,maxZ:p.z+d*.35,minY:0,maxY:hh});break}
    case 'gym':{const hh=9;box(w*.95,hh,d*.75,new THREE.MeshLambertMaterial({color:0x2A2A33}),p.x,hh/2,p.z);label('NNN BOXING 엔엔엔복싱',{bg:'#111',fg:'#FFC93C',fs:48},p.x,hh-2.2,p.z+d*.375+.1,0,S*.42);
      box(w*.95,.6,1.2,new THREE.MeshLambertMaterial({color:0xFFC93C}),p.x,hh-4.4,p.z+d*.375+.4);solids.push({minX:p.x-w*.47,maxX:p.x+w*.47,minZ:p.z-d*.37,maxZ:p.z+d*.37,minY:0,maxY:hh});break}
    case 'mall':{const hh=10;box(w*.95,hh,d*.75,new THREE.MeshLambertMaterial({color:0xC9D6E8}),p.x,hh/2,p.z);label('한들물빛 상가',{bg:'#4F7FC1',fs:44},p.x,hh-2,p.z+d*.375+.1,0,S*.38);
      ['#E2557A','#3E8E5E','#FFB347'].forEach((c,i)=>box(w*.28,.5,1.4,new THREE.MeshLambertMaterial({color:c}),p.x-w*.32+i*w*.32,3.2,p.z+d*.375+.6));solids.push({minX:p.x-w*.47,maxX:p.x+w*.47,minZ:p.z-d*.37,maxZ:p.z+d*.37,minY:0,maxY:hh});break}
    case 'house':{const hh=5;box(w*.8,hh,d*.75,new THREE.MeshLambertMaterial({color:0xFFF4E6}),p.x,hh/2,p.z);const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.62,4,4),new THREE.MeshLambertMaterial({color:0xE2557A}));roof.position.set(p.x,hh+2,p.z);roof.rotation.y=Math.PI/4;roof.scale.z=d/w;root.add(roof);
      tag('밍뉴네 집',{bg:'#E2557A',fs:40},p.x,hh+5,p.z,S*.3);break}
    case 'parkplay':case 'swing':case 'swan':case 'hippo':case 'panda':{
      if(s.k==='parkplay'){box(w*.35,2.4,d*.5,new THREE.MeshLambertMaterial({color:0xFFC94A}),p.x-w*.2,1.2,p.z);const sl=box(w*.4,.3,d*.25,new THREE.MeshLambertMaterial({color:0xE2557A}),p.x+w*.12,1.2,p.z);sl.rotation.z=-.5;box(w*.2,.3,w*.2,new THREE.MeshLambertMaterial({color:0x4F7FC1}),p.x-w*.2,3.2,p.z)}
      else if(s.k==='swing'){const fm=new THREE.MeshLambertMaterial({color:0x4F7FC1});box(.25,3,.25,fm,p.x-w*.35,1.5,p.z);box(.25,3,.25,fm,p.x+w*.35,1.5,p.z);box(w*.75,.25,.25,fm,p.x,3,p.z);box(.8,.15,.5,new THREE.MeshLambertMaterial({color:0xFFC94A}),p.x,.8,p.z)}
      else{const col=s.k==='swan'?0xffffff:s.k==='hippo'?0x9C8FD9:0x3B3434;const b=new THREE.Mesh(new THREE.SphereGeometry(Math.min(w,d)*.35,14,10),new THREE.MeshLambertMaterial({color:col}));b.scale.set(1.4,.8,1);b.position.set(p.x,Math.min(w,d)*.25,p.z);root.add(b);
        if(s.k==='swan'){const n=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,3.2,8),new THREE.MeshLambertMaterial({color:0xffffff}));n.position.set(p.x-w*.28,Math.min(w,d)*.25+1.8,p.z);n.rotation.z=.3;root.add(n);const h=new THREE.Mesh(new THREE.SphereGeometry(.7,10,8),new THREE.MeshLambertMaterial({color:0xffffff}));h.position.set(p.x-w*.34,Math.min(w,d)*.25+3.4,p.z);root.add(h);const bk=new THREE.Mesh(new THREE.ConeGeometry(.3,.8,6),new THREE.MeshLambertMaterial({color:0xF2994A}));bk.rotation.z=Math.PI/2;bk.position.set(p.x-w*.34-.9,Math.min(w,d)*.25+3.4,p.z);root.add(bk)}
        if(s.k==='panda'){[-1,1].forEach(k=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshLambertMaterial({color:0x111111}));e.position.set(p.x+k*w*.18,Math.min(w,d)*.5,p.z);root.add(e)});b.material.color.set(0xF4F4F0)}}
      break}
    case 'bench':{const m=new THREE.MeshLambertMaterial({color:0xC98A44});box(S*.8,.12,.6,m,p.x,.5,p.z);box(S*.8,.5,.1,m,p.x,.8,p.z-.3);break}
    case 'lamp':{const m=new THREE.MeshLambertMaterial({color:0x5F6B75});box(.2,6,.2,m,p.x,3,p.z);box(1.4,.2,.3,m,p.x+.6,6,p.z);const l=new THREE.Mesh(new THREE.SphereGeometry(.35,8,6),new THREE.MeshBasicMaterial({color:0xFFF3C4}));l.position.set(p.x+1.2,5.8,p.z);root.add(l);break}
    case 'bus':{const m=new THREE.MeshLambertMaterial({color:0x5F6B75});box(.15,3,.15,m,p.x-1.4,1.5,p.z);box(.15,3,.15,m,p.x+1.4,1.5,p.z);box(3.2,.15,1.4,new THREE.MeshLambertMaterial({color:0x4F7FC1}),p.x,3,p.z);if(!lite)tag(s.text,{bg:'#4F7FC1',fs:34},p.x,3.7,p.z,.8);break}
    case 'sign':{if(lite&&s.text!=='탕정역'&&s.text!=='한들물빛공원')break;const m=new THREE.MeshLambertMaterial({color:0x7A5236});box(.2,2.6,.2,m,p.x,1.3,p.z);tag(s.text,{bg:'#3E8E5E',fs:40},p.x,3.2,p.z,1.2);break}
    }
  });
  // 단지 이름 큰 간판
  if(!lite)LABELS.forEach(([t,x,y])=>{if(skip&&inSkip(Math.floor(x),Math.floor(y)))return;const p=W(x,y-1.2);tag(t,{bg:'rgba(30,60,50,.85)',fs:46},p.x,aptH*.25,p.z,S*.45)});
  // 물 위 반짝임용 평면은 바닥 그림으로 충분해요
  return{root,S,W,tileAt,SPR,LABELS,MAINROAD,PLAZA,solids,MW,MH:OUT_H,types:{G,TR,RD,SW,HE,PZ,PG,FL,RO,TG,BL,WA,SA}};
}
window.Town3D={build,tileAt:(x,y)=>{genMap();return tileAt(x,y)},SPR:()=>{genMap();return SPR},MAINROAD,PLAZA};
})();
