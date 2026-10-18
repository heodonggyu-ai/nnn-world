/* NNN 월드 공통 아바타: 기본 냥이, 밍뉴, 삼색이, 모자 쓴 아이 + 꾸미기 */
(function(){
const OUT='#3B2C2A',BK='#211A17',SILC='#2A3631';
let SIL=false,CLOSED=false,NOW=0,O={},CUR={};
function F(col){return SIL?SILC:col}
function shape(c,fill,stroke=true,lw=2.2){c.fillStyle=F(fill);c.fill();if(stroke){c.lineWidth=lw;c.strokeStyle=SIL?SILC:OUT;c.stroke()}}
function ell(c,x,y,rx,ry,fill,stroke=true,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);shape(c,fill,stroke)}
function tri(c,a,b,d,fill,stroke=true){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(d[0],d[1]);c.closePath();shape(c,fill,stroke)}
function rr(c,x,y,w,h,r,fill,stroke=true,lw=2.2){c.beginPath();c.roundRect(x,y,w,h,r);shape(c,fill,stroke,lw)}
function eye(c,x,y,r,col){if(SIL)return;if(CLOSED){c.beginPath();c.arc(x,y-r*0.2,r*0.8,0.2,Math.PI-0.2);c.lineWidth=1.8;c.strokeStyle='#1E1A1A';c.stroke();return}c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=col||'#1E1A1A';c.fill();if(col){c.beginPath();c.arc(x,y,r*.45,0,7);c.fillStyle='#1E1A1A';c.fill()}c.beginPath();c.arc(x+r*.35,y-r*.38,r*.38,0,7);c.fillStyle='#fff';c.fill()}
function blush(c,x,y){if(SIL)return;c.beginPath();c.ellipse(x,y,3.2,2,0,0,7);c.fillStyle='rgba(255,110,140,.5)';c.fill()}
function line(c,pts,w=1.6,col='#3B2C2A'){if(SIL)return;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.lineWidth=w;c.strokeStyle=col;c.lineCap='round';c.stroke()}
function curveTail(c,p,w,col){c.lineCap='round';c.beginPath();c.moveTo(p[0],p[1]);c.quadraticCurveTo(p[2],p[3],p[4],p[5]);c.lineWidth=w+4.4;c.strokeStyle=SIL?SILC:OUT;c.stroke();c.lineWidth=w;c.strokeStyle=F(col);c.stroke()}
function mouth(c,x,y){if(SIL)return;c.beginPath();c.arc(x-1.6,y,1.6,0.1,Math.PI-0.1);c.arc(x+1.6,y,1.6,0.1,Math.PI-0.1);c.lineWidth=1.4;c.strokeStyle='#3B2C2A';c.stroke()}
function star(c,x,y,r,col){c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fillStyle=col;c.fill()}
function hs(c,fill,lw=2.4){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.lineJoin='round';c.strokeStyle=BK;c.stroke()}
function hpaw(c,x,y,sock){const P_=()=>{c.beginPath();c.ellipse(x,y,6,4.6,0,0,7)};P_();hs(c,'#fff');c.save();P_();c.clip();c.fillStyle=sock;c.fillRect(x-7,y-0.8,14,7);c.restore();P_();c.lineWidth=2.2;c.strokeStyle=BK;c.stroke()}
function heroEyes(c,E,bl,rx,ry){E.forEach(([x,y])=>{if(bl){c.beginPath();c.moveTo(x-rx,y);c.quadraticCurveTo(x,y+2.4,x+rx,y);c.lineWidth=1.8;c.strokeStyle=BK;c.stroke()}else{c.fillStyle=BK;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+rx*.3,y-ry*.42,rx*.3,0,7);c.fill()}})}
function heroSam(c,t,st,bl,mv){
  const W='#FFFFFF',OR='#FF9D4F',BR='#2A160C';
  c.save();c.translate(15,-12);c.rotate(Math.sin(t*(mv?9:2.4))*0.16);
  const tail=()=>{c.beginPath();c.moveTo(-4,5);c.bezierCurveTo(16,3,27,-14,20,-33);c.bezierCurveTo(18,-38,12,-37,11,-32);c.bezierCurveTo(14,-18,5,-9,-7,-6);c.closePath()};
  tail();hs(c,W);c.save();tail();c.clip();c.fillStyle=BR;c.beginPath();c.ellipse(18,-31,11,10,0,0,7);c.fill();c.fillStyle=OR;c.fillRect(13,-19,16,7);c.restore();tail();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  c.restore();
  c.beginPath();c.ellipse(17,-4-(mv?Math.max(0,-st)*2:0),6,4.5,0,0,7);hs(c,W);
  const body=()=>{c.beginPath();c.ellipse(5,-12,18,11.5,0,0,7)};
  body();hs(c,W);c.save();body();c.clip();c.fillStyle=OR;c.beginPath();c.ellipse(9,-20,7.5,5.5,0,0,7);c.fill();c.fillStyle=BR;c.beginPath();c.arc(14,-16,2.3,0,7);c.fill();c.restore();body();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  hpaw(c,-13+st*2.5,-3-Math.max(0,st)*2.5,OR);hpaw(c,-2-st*2.5,-3-Math.max(0,-st)*2.5,BR);
  const tw=Math.sin(t*1.7)>0.93?0.14:0;
  c.save();c.translate(-24,-30);c.rotate(-tw);c.beginPath();c.moveTo(-9,8);c.bezierCurveTo(-13,-8,-9,-24,-2,-31);c.bezierCurveTo(7,-23,15,-12,17,-2);c.closePath();hs(c,OR);c.restore();
  c.save();c.translate(6,-34);c.rotate(tw);c.beginPath();c.moveTo(-13,5);c.bezierCurveTo(-4,-12,6,-25,13,-31);c.bezierCurveTo(19,-22,21,-10,17,5);c.closePath();hs(c,BR);
  c.strokeStyle=OR;c.lineWidth=1.5;c.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*4*Math.PI/5;c.lineTo(9+Math.cos(a)*4.6,-15+Math.sin(a)*4.6)}c.stroke();c.restore();
  const head=()=>{c.beginPath();c.moveTo(-35,-20);c.bezierCurveTo(-34,-34,-22,-41,-8,-41);c.bezierCurveTo(8,-41,19,-34,21,-23);c.bezierCurveTo(21,-16,14,-14,-8,-14);c.bezierCurveTo(-27,-14,-35,-15,-35,-20);c.closePath()};
  head();hs(c,W);c.save();head();c.clip();
  c.fillStyle=OR;c.beginPath();c.ellipse(-28,-37,13,11,0,0,7);c.fill();
  c.fillStyle=BR;c.beginPath();c.ellipse(9,-41,16,9,-0.2,0,7);c.fill();
  c.beginPath();c.ellipse(-31,-24,4,4.4,0,0,7);c.fill();
  c.restore();head();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  heroEyes(c,ANCH.samsaek.eyes,bl,2.8,3.5);
  c.fillStyle=BK;c.beginPath();c.ellipse(-3,-32.5,1.7,1,-0.6,0,7);c.fill();
  c.beginPath();c.moveTo(-14,-20);c.quadraticCurveTo(-12.5,-18,-11,-20);c.quadraticCurveTo(-9.5,-18,-8,-20.5);c.lineWidth=1.3;c.strokeStyle=BK;c.stroke();
  c.fillStyle='rgba(255,120,140,.35)';c.beginPath();c.ellipse(-23,-20,3,1.8,0,0,7);c.ellipse(1,-21,3,1.8,0,0,7);c.fill();
}
function drop(c,x,y,dir,bl){
  if(bl){c.beginPath();c.moveTo(x-5,y+2);c.quadraticCurveTo(x,y+5.5,x+5,y+2);c.lineWidth=2.2;c.strokeStyle=BK;c.stroke();return}
  const tx=x+dir*3,ty=y-10;c.beginPath();c.moveTo(tx,ty);c.bezierCurveTo(x-7,y-3,x-7.5,y+6,x,y+6);c.bezierCurveTo(x+7.5,y+6,x+7,y-3,tx,ty);c.fillStyle=BK;c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(x+1.5,y,1.5,0,7);c.fill();
}
function heartPath(c,x,y,r){c.beginPath();c.moveTo(x,y+r*0.8);c.bezierCurveTo(x-r*1.6,y-r*0.2,x-r*0.7,y-r*1.4,x,y-r*0.5);c.bezierCurveTo(x+r*0.7,y-r*1.4,x+r*1.6,y-r*0.2,x,y+r*0.8);c.closePath()}
function drawAccPart(c,type,A){
  const [tx,ty]=A.top,E=A.eyes,[nx,ny]=A.neck;
  switch(type){
   case 'ribbon':{const x=tx+12,y=ty+3;tri(c,[x,y],[x-9,y-7],[x-9,y+6],'#FF7FA8');tri(c,[x,y],[x+9,y-7],[x+9,y+6],'#FF7FA8');ell(c,x,y,3,3,'#E2557A');break}
   case 'flower':{const x=tx-13,y=ty+4;for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ell(c,x+Math.cos(a)*4,y+Math.sin(a)*4,3.2,3.2,'#FFF4F8',true)}ell(c,x,y,2.6,2.6,'#FFC94A');break}
   case 'crown':{const x=tx,y=ty+2;c.beginPath();c.moveTo(x-10,y);c.lineTo(x-12,y-12);c.lineTo(x-5,y-6);c.lineTo(x,y-14);c.lineTo(x+5,y-6);c.lineTo(x+12,y-12);c.lineTo(x+10,y);c.closePath();shape(c,'#FFD23F');ell(c,x,y-4,2,2,'#E2557A',false);ell(c,x-6,y-3,1.5,1.5,'#7FD1B9',false);ell(c,x+6,y-3,1.5,1.5,'#7FD1B9',false);break}
   case 'witch':{const x=tx,y=ty+3;tri(c,[x-10,y-1],[x+8,y-28],[x+11,y-1],'#6E4AA8');c.fillStyle='#FF9D4F';c.fillRect(x-9,y-7,20,4);ell(c,x,y,18,4.5,'#5B3A8C');star(c,x+4,y-15,3.2,'#FFD23F');break}
   case 'glasses':{c.lineWidth=2;c.strokeStyle='#3A2A22';E.forEach(([x,y])=>{c.beginPath();c.arc(x,y,5.6,0,7);c.fillStyle='rgba(200,230,255,.28)';c.fill();c.stroke()});c.beginPath();c.moveTo(E[0][0]+5.6,E[0][1]);c.lineTo(E[1][0]-5.6,E[1][1]);c.stroke();break}
   case 'heart':{E.forEach(([x,y])=>{heartPath(c,x,y+1,5.4);c.fillStyle='rgba(255,80,130,.88)';c.fill();c.lineWidth=1.6;c.strokeStyle=BK;c.stroke()});c.beginPath();c.moveTo(E[0][0]+5,E[0][1]);c.lineTo(E[1][0]-5,E[1][1]);c.lineWidth=1.6;c.stroke();break}
   case 'scarf':{rr(c,nx+3,ny-1,6,12,2,'#E2504A');ell(c,nx,ny,13,4,'#E2504A');c.fillStyle='#fff';c.fillRect(nx-6,ny-1,2,2);c.fillRect(nx+1,ny-1,2,2);break}
   case 'ghost':{const[x0,x1,top]=A.sheet||[-30,30,-50],w=x1-x0,cx=(x0+x1)/2,wv=Math.sin(NOW*4)*1.5;
     c.beginPath();c.moveTo(x0,-2);c.lineTo(x0+2,top+16);c.quadraticCurveTo(x0+4,top-2,cx,top);
     if(A.ears){c.lineTo(cx+w*0.18,top-2);}
     c.quadraticCurveTo(x1-4,top-2,x1-2,top+16);c.lineTo(x1,-2);
     for(let i=0;i<5;i++){const xa=x1-(i+0.5)*w/5,xb=x1-(i+1)*w/5;c.quadraticCurveTo(xa,4+wv*(i%2?1:-1),xb,-2)}c.closePath();
     c.fillStyle='rgba(255,255,255,.96)';c.fill();c.lineWidth=2.2;c.strokeStyle=BK;c.stroke();
     if(A.ears){[[x0+10,top+4,-1],[x1-12,top+2,1]].forEach(([ex,ey,d])=>{c.beginPath();c.moveTo(ex-6,ey+4);c.lineTo(ex+d*2,ey-9);c.lineTo(ex+6,ey+3);c.fillStyle='rgba(255,255,255,.96)';c.fill();c.stroke()})}
     E.forEach(([x,y])=>{c.fillStyle=BK;c.beginPath();c.ellipse(x,y,3.4,4.4,0,0,7);c.fill()});
     c.beginPath();c.ellipse((E[0][0]+E[1][0])/2,E[0][1]+8,2.2,2.8,0,0,7);c.fill();
     c.fillStyle='rgba(255,120,140,.4)';c.beginPath();c.ellipse(E[0][0]-4,E[0][1]+6,3,1.8,0,0,7);c.ellipse(E[1][0]+4,E[1][1]+6,3,1.8,0,0,7);c.fill();break}
   case 'cape':{const[x0,x1]=A.sheet||[-30,30];c.beginPath();c.moveTo(nx-2,ny-3);c.quadraticCurveTo(x1*0.6,ny-14,x1+4,ny-2);c.lineTo(x1-2,-6);c.lineTo(x1*0.55,-10);c.lineTo(x1*0.3,-3);c.lineTo(nx+6,ny+4);c.closePath();shape(c,'#4B2D73');
     c.beginPath();c.moveTo(nx+2,ny-1);c.quadraticCurveTo(x1*0.5,ny-8,x1-2,ny);c.lineWidth=2.4;c.strokeStyle='#E2557A';c.stroke();ell(c,nx,ny,4,3,'#E2557A');break}
   case 'bell':{c.lineWidth=2.4;c.strokeStyle='#E2557A';c.beginPath();c.ellipse(nx,ny-1,12,3.5,0,0,Math.PI);c.stroke();ell(c,nx,ny+4,3.4,3.4,'#FFD23F');break}
  }
}
function drawUmbrella(c){c.lineWidth=2;c.strokeStyle=BK;c.beginPath();c.moveTo(4,-14);c.lineTo(4,-70);c.stroke();
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(4,-72);c.arc(4,-58,28,Math.PI+i*Math.PI/4,Math.PI+(i+1)*Math.PI/4);c.closePath();c.fillStyle=i%2?'#FFC94A':'#E2557A';c.fill();c.stroke()}}
function drawKid(c,x,y,t,face,moving,joy=0){
  c.save();c.translate(x,y);
  c.beginPath();c.ellipse(0,0,13,4.5,0,0,7);c.fillStyle='rgba(30,45,30,.25)';c.fill();
  const st=moving?Math.sin(t*13):0,bob=joy>0?Math.abs(Math.sin(joy*10))*14:moving?Math.abs(Math.sin(t*13))*2:Math.sin(t*2)*0.6;
  c.translate(0,-bob);c.scale(face,1);
  ell(c,-4,-4+st*1.5,3.6,4,'#2F3A5C');ell(c,5,-4-st*1.5,3.6,4,'#2F3A5C');
  c.beginPath();c.roundRect(-11,-25,22,19,7);shape(c,'#E2557A');
  if(!SIL){c.beginPath();c.roundRect(-5,-15,10,6,3);c.fillStyle='#C9436A';c.fill()}
  const arm=joy>0?-10:0;
  ell(c,-11,-17+st+arm,3.5,5,'#E2557A');ell(c,11,-17-st+arm,3.5,5,'#E2557A');
  ell(c,0,-37,13,12,'#FFE0C8');
  c.beginPath();c.ellipse(0,-40,14,9.5,0,Math.PI*1.02,Math.PI*1.98);c.lineTo(9,-37);c.quadraticCurveTo(4,-40,1,-36);c.quadraticCurveTo(-5,-40,-12,-36);c.closePath();shape(c,'#6B4532');
  c.beginPath();c.ellipse(0,-44,13,7,0,Math.PI,0);c.closePath();shape(c,'#7FD1B9');
  tri(c,[-11,-46],[-10,-56],[-3,-50],'#7FD1B9');tri(c,[3,-50],[10,-56],[11,-46],'#7FD1B9');
  if(!SIL){tri(c,[-9,-48],[-8.5,-53],[-5,-50],'#FFB6C6',false);tri(c,[5,-50],[8.5,-53],[9,-48],'#FFB6C6',false);c.fillStyle='#5DB79E';c.fillRect(-13,-44,26,3)}
  eye(c,2,-35,2.4);eye(c,9,-35,2.4);
  if(!SIL){blush(c,-1,-30);blush(c,11,-30);c.beginPath();c.arc(6,-31,2.4,0.3,Math.PI-0.3);c.lineWidth=1.4;c.strokeStyle=OUT;c.stroke()}
  drawAccFor(c,'kid',CUR);if(O.raining&&!O.portrait)drawUmbrella(c);
  c.restore();
}

const ANCH={
 samsaek:{top:[-8,-41],eyes:[[-17,-25],[-4,-26]],neck:[-6,-15],sheet:[-38,30,-44],ears:1},
 mingnyu:{top:[-10,-50],eyes:[[-17,-31],[-1,-32]],neck:[-6,-15],sheet:[-38,26,-52],ears:1},
 cat:{top:[-8,-42],eyes:[[-15,-27],[-1,-27]],neck:[-6,-15],sheet:[-36,26,-46],ears:1},
 kid:{top:[0,-50],eyes:[[2,-35],[9,-35]],neck:[0,-24],sheet:[-17,17,-52],ears:1}
};
function drawAccFor(c,id,av){const A=ANCH[id],a=(av&&av.acc)||{};if(!A)return;['neck','eyes','costume','head'].forEach(sl=>{const k=a[sl];if(k&&ACCS[k])drawAccPart(c,k,A)})}
function rot(p,o,a){const s=Math.sin(a),co=Math.cos(a),dx=p[0]-o[0],dy=p[1]-o[1];return[o[0]+dx*co-dy*s,o[1]+dx*s+dy*co]}
function twitch(t,seed){const k=(t*0.6+seed)%4.2;return k<0.35?Math.sin(k/0.35*Math.PI*2)*0.22:0}
/* 밍뉴: 머리 양쪽 위 모서리가 귀, 회색 귀 끝, 물방울 눈, 굵은 수염, 회색 턱받이와 양말, 박쥐 날개, 악마 꼬리 */
function heroMing2(c,t,st,bl,mv){
  const W='#FFFFFF',GR='#9E9E9E';
  c.save();c.translate(18,-8);c.rotate(Math.sin(t*(mv?8:2))*0.22);c.lineCap='round';
  c.beginPath();c.moveTo(-2,0);c.bezierCurveTo(8,4,10,11,18,9);c.bezierCurveTo(24,6,25,-1,21,-7);
  c.lineWidth=6.4;c.strokeStyle=BK;c.stroke();c.lineWidth=2.4;c.strokeStyle=W;c.stroke();
  c.beginPath();c.moveTo(19,-17);c.lineTo(15,-6);c.lineTo(26,-7);c.closePath();c.fillStyle=BK;c.fill();
  c.restore();
  c.save();c.translate(21,-17);c.rotate(0.15);c.scale(1,1+Math.sin(t*(mv?14:3))*0.18);
  c.beginPath();c.moveTo(-4,4);c.lineTo(-1,-9);c.lineTo(3,-4);c.lineTo(7,-14);c.lineTo(9.5,-5);c.lineTo(14,-11);c.lineTo(14,2);c.lineTo(8,0);c.lineTo(4,6);c.closePath();hs(c,GR,2);
  c.beginPath();c.moveTo(0,2);c.lineTo(8,-6);c.moveTo(4,3);c.lineTo(12,-3);c.lineWidth=1.2;c.strokeStyle='#5A5A5A';c.stroke();
  c.restore();
  c.beginPath();c.ellipse(5,-10,17,10.5,0,0,7);hs(c,W);
  hpaw(c,15,-3-(mv?Math.max(0,-st)*2:0),GR);
  hpaw(c,-12+st*2.5,-3-Math.max(0,st)*2.5,GR);hpaw(c,-1-st*2.5,-3-Math.max(0,-st)*2.5,GR);
  c.beginPath();c.ellipse(-6,-14.5,6,3.8,0,0,7);hs(c,GR,1.8);
  const tl=twitch(t,0.3),tr=twitch(t,2.1);
  const P0=[-37,-38],P1=[-22,-45],LT=rot([-39,-56],[-30,-42],-tl),P2=[0,-49],P3=[21,-38],RT=rot([18,-63],[11,-44],tr);
  const head=()=>{c.beginPath();c.moveTo(P0[0],P0[1]);c.lineTo(LT[0],LT[1]);c.quadraticCurveTo(-27,-50,P1[0],P1[1]);c.quadraticCurveTo(-11,-47,P2[0],P2[1]);
    c.quadraticCurveTo(8,-56,RT[0],RT[1]);c.quadraticCurveTo(23,-52,P3[0],P3[1]);c.quadraticCurveTo(23,-31,21,-29);c.lineTo(25,-26);c.lineTo(20,-24);
    c.quadraticCurveTo(14,-15,-6,-15);c.quadraticCurveTo(-26,-14,-31,-18);c.quadraticCurveTo(-38,-24,P0[0],P0[1]);c.closePath()};
  head();c.fillStyle=W;c.fill();
  c.save();head();c.clip();c.fillStyle=GR;
  c.beginPath();c.ellipse(LT[0]+3,LT[1]+8,8,9,-0.5,0,7);c.fill();
  c.beginPath();c.ellipse(RT[0]-1,RT[1]+10,8,11,0.3,0,7);c.fill();
  c.restore();
  head();c.lineWidth=2.4;c.lineJoin='round';c.strokeStyle=BK;c.stroke();
  drop(c,-17,-31,1,bl);drop(c,-1,-32,-1,bl);
  c.lineCap='round';c.strokeStyle=BK;c.lineWidth=2.8;c.beginPath();c.moveTo(-32,-22);c.lineTo(-17,-23);c.moveTo(-6,-23);c.lineTo(14,-25);c.stroke();
  c.lineWidth=1.5;c.beginPath();c.moveTo(-12,-19);c.lineTo(-10,-17.5);c.lineTo(-8,-19);c.stroke();
  c.fillStyle='rgba(255,120,140,.28)';c.beginPath();c.ellipse(-26,-26,3,1.8,0,0,7);c.ellipse(8,-27,3,1.8,0,0,7);c.fill();
}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1)}
/* 기본 냥이: 털색·무늬·눈색을 바꿀 수 있는 모두의 기본 캐릭터 */
function heroCat(c,t,st,bl,mv,av){
  const fur=(FURS[av.fur]||FURS.cream)[1],dk=shade(fur,-0.35),lt=shade(fur,0.55),pat=av.pat||'none',ec=(EYES[av.eye]||EYES.black)[1];
  const tux=pat==='tux',white='#FFFFFF';
  const sw=Math.sin(t*(mv?9:2.4))*4;
  c.lineCap='round';c.beginPath();c.moveTo(15,-12);c.quadraticCurveTo(30,-14+sw*0.5,26,-31+sw);c.lineWidth=10.4;c.strokeStyle=BK;c.stroke();c.lineWidth=6;c.strokeStyle=fur;c.stroke();
  if(pat==='stripe'){c.save();c.lineWidth=2.2;c.strokeStyle=dk;c.beginPath();c.moveTo(24,-18);c.lineTo(29,-19);c.moveTo(25,-24+sw*.5);c.lineTo(30,-25+sw*.6);c.stroke();c.restore()}
  c.beginPath();c.ellipse(16,-4-(mv?Math.max(0,-st)*2:0),6,4.5,0,0,7);hs(c,tux?white:fur);
  const body=()=>{c.beginPath();c.ellipse(5,-12,17.5,11.5,0,0,7)};
  body();hs(c,fur);c.save();body();c.clip();
  if(pat==='stripe'){c.strokeStyle=dk;c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-4+i*6,-24);c.lineTo(-2+i*6,-15);c.stroke()}}
  if(pat==='spots'){c.fillStyle=dk;[[2,-19,6,4.5],[14,-12,4.5,4],[-6,-9,3.5,3]].forEach(([x,y,rx,ry])=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()})}
  if(tux){c.fillStyle=white;c.beginPath();c.ellipse(-6,-8,9,8,0,0,7);c.fill()}
  c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(2,-6,10,4,0,0,7);c.fill();
  c.restore();body();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  const pc=tux?white:fur;
  [[-13+st*2.5,-3-Math.max(0,st)*2.5],[-2-st*2.5,-3-Math.max(0,-st)*2.5]].forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,6,4.6,0,0,7);hs(c,pc)});
  const tl=twitch(t,1.1),tr=twitch(t,3.0);
  c.save();c.translate(-22,-37);c.rotate(-tl);tri(c,[-8,4],[-9,-17],[7,-1],fur);if(!SIL)tri(c,[-5,1],[-6,-11],[3,-1],'#F6A6B8',false);c.restore();
  c.save();c.translate(5,-39);c.rotate(tr);tri(c,[-7,0],[6,-18],[10,3],fur);if(!SIL)tri(c,[-3,-1],[5,-12],[7,1],'#F6A6B8',false);c.restore();
  const head=()=>{c.beginPath();c.moveTo(-31,-21);c.bezierCurveTo(-32,-35,-21,-42,-8,-42);c.bezierCurveTo(6,-42,17,-35,18,-23);c.bezierCurveTo(18,-15,10,-14,-8,-14);c.bezierCurveTo(-25,-14,-31,-15,-31,-21);c.closePath()};
  head();hs(c,fur);c.save();head();c.clip();
  if(pat==='stripe'){c.strokeStyle=dk;c.lineWidth=2.6;[[-12,-42,-11,-35],[-7,-43,-7,-36],[-2,-42,-3,-35]].forEach(([a,b,d,e])=>{c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke()})}
  if(pat==='spots'){c.fillStyle=dk;c.beginPath();c.ellipse(8,-38,8,6,0,0,7);c.fill()}
  if(tux){c.fillStyle=white;c.beginPath();c.ellipse(-8,-18,12,6.5,0,0,7);c.fill()}
  c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(-12,-37,9,4,-0.2,0,7);c.fill();
  c.restore();head();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  const E=ANCH.cat.eyes;
  E.forEach(([x,y])=>{if(bl){c.beginPath();c.moveTo(x-3,y);c.quadraticCurveTo(x,y+2.4,x+3,y);c.lineWidth=1.8;c.strokeStyle=BK;c.stroke();return}
    c.fillStyle=ec==='#222'?BK:ec;c.beginPath();c.ellipse(x,y,3,3.7,0,0,7);c.fill();if(ec!=='#222'){c.fillStyle=BK;c.beginPath();c.ellipse(x,y,1.5,2.6,0,0,7);c.fill()}
    c.fillStyle='#fff';c.beginPath();c.arc(x+1,y-1.5,1,0,7);c.fill()});
  c.fillStyle='#F28AA0';c.beginPath();c.moveTo(-9.5,-22.5);c.lineTo(-6.5,-22.5);c.lineTo(-8,-21);c.closePath();c.fill();
  c.beginPath();c.moveTo(-11,-19.5);c.quadraticCurveTo(-9.5,-17.5,-8,-19.5);c.quadraticCurveTo(-6.5,-17.5,-5,-19.5);c.lineWidth=1.3;c.strokeStyle=BK;c.stroke();
  c.fillStyle='rgba(255,120,140,.35)';c.beginPath();c.ellipse(-21,-20,3,1.8,0,0,7);c.ellipse(5,-20,3,1.8,0,0,7);c.fill();
}
/* 상점 목록: [이름, 값, 크레딧] */
const BASES={cat:['기본 냥이',0],kid:['모자 쓴 아이',40],samsaek:['삼색이',120],mingnyu:['밍뉴',null]};
const FURS={cream:['크림','#FFF1DC',0],cheese:['치즈','#F4A85C',0],gray:['회색','#A2A9B2',0],choco:['초코','#8E6244',0],black:['까망','#3A3A42',15],mint:['민트','#9FE0C9',30],pink:['딸기우유','#F7B9CB',30],sky:['하늘','#A9D6F2',30],gold:['황금','#F4C842',80]};
const PATS={none:['무늬 없음',0],stripe:['줄무늬',20],spots:['점박이',20],tux:['턱시도',25]};
const EYES={black:['까만 눈','#222',0],green:['초록 눈','#3F9D58',10],blue:['파란 눈','#3D7FD1',10],gold:['금색 눈','#D9A520',15]};
const ACCS={ribbon:['핑크 리본','head',15],flower:['꽃 머리핀','head',10],witch:['마녀 모자','head',25],crown:['별 왕관','head',60],glasses:['동글 안경','eyes',15],heart:['하트 선글라스','eyes',20],scarf:['빨간 목도리','neck',15],bell:['방울 목걸이','neck',10],ghost:['귀신 분장','costume',20],cape:['박쥐 망토','costume',20]};
function price(id){const[k,v]=id.split(':');const T={base:BASES,fur:FURS,pat:PATS,eye:EYES,acc:ACCS}[k];if(!T||!T[v])return null;const r=T[v];return k==='fur'||k==='eye'?r[2]:k==='acc'?r[2]:r[1]}
function owns(owned,id){const p=price(id);return p===0||!!(owned&&owned[id])}
function defaultAvatar(){const f=['cream','cheese','gray','choco'][Math.floor(Math.random()*4)];return{base:'cat',fur:f,pat:'none',eye:'black',acc:{}}}
function draw(c,x,y,t,face,moving,joy,av,o){
  av=av||defaultAvatar();O=o||{};NOW=t;CUR=av;
  const base=BASES[av.base]?av.base:'cat';
  if(base==='kid'){drawKid(c,x,y,t,face,moving,joy);return}
  c.save();c.translate(x,y);
  c.beginPath();c.ellipse(0,-1,24,6,0,0,7);c.fillStyle='rgba(30,45,30,.25)';c.fill();
  const st=moving?Math.sin(t*13):0;
  const bob=joy>0?Math.abs(Math.sin(joy*10))*16:moving?Math.abs(Math.sin(t*13))*3:Math.sin(t*2.2)*0.6;
  c.translate(0,-bob);if(joy>0)c.rotate(Math.sin(joy*14)*0.1);
  c.scale(-face*1.08,1.08);
  const bl=((t+0.5)%3.4)<0.12;
  if(base==='samsaek')heroSam(c,t,st,bl,moving);else if(base==='mingnyu')heroMing2(c,t,st,bl,moving);else heroCat(c,t,st,bl,moving,av);
  drawAccFor(c,base,av);
  if(O.raining&&!O.portrait)drawUmbrella(c);
  c.restore();
}
function accIcon(c,k,w,h){c.save();c.translate(w/2,h/2);const s=Math.min(w,h)/40;c.scale(s*2.4,s*2.4);const ck=ACCS[k][1]==='costume';if(ck)c.scale(0.55,0.55);
  const A=ck?{top:[0,-30],eyes:[[-8,-14],[8,-14]],neck:[-4,-6],sheet:[-22,22,-34]}:{top:[0,8],eyes:[[-7,0],[7,0]],neck:[0,0]};if(ck)c.translate(0,26);drawAccPart(c,k,A);c.restore()}
window.Avatar={draw,BASES,FURS,PATS,EYES,ACCS,price,owns,defaultAvatar,accIcon,ANCH};
})();
