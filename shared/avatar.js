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
  if(ACC2[type])return drawAcc2(c,type,A);
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
/* ---------- 더 많은 꾸미기 ---------- */
function dot(c,x,y,r,col){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=col;c.fill()}
function drawAcc2(c,type,A){
  const [tx,ty]=A.top,E=A.eyes,[nx,ny]=A.neck,fd=A.fdir||-1,ex=(E[0][0]+E[1][0])/2,ey=(E[0][1]+E[1][1])/2;
  switch(type){
   case 'beret':{c.save();c.translate(tx+3,ty+3);c.rotate(-0.25*fd);ell(c,0,0,14,5.5,'#D9443A');ell(c,0,-5.5,1.8,2,'#D9443A');c.restore();break}
   case 'cap':{c.beginPath();c.ellipse(tx,ty+4,13,10,0,Math.PI,0);c.closePath();shape(c,'#3D7FD1');ell(c,tx+fd*13,ty+4,10,3.2,'#2F63A8');dot(c,tx,ty-6,2,'#FFD23F');break}
   case 'bunnyband':{const w=Math.sin(NOW*3)*0.1;ell(c,tx-6,ty-10,4,11,'#fff',true,-0.2+w);ell(c,tx+6,ty-10,4,11,'#fff',true,0.2-w);ell(c,tx-6,ty-10,1.8,7,'#FFB6C6',false,-0.2+w);ell(c,tx+6,ty-10,1.8,7,'#FFB6C6',false,0.2-w);
     c.beginPath();c.ellipse(tx,ty+4,14,6,0,Math.PI,0);c.lineWidth=3;c.strokeStyle='#FF7FA8';c.stroke();break}
   case 'santa':{c.beginPath();c.moveTo(tx-12,ty+4);c.quadraticCurveTo(tx-2,ty-22,tx-fd*16,ty-14);c.lineTo(tx+12,ty+4);c.closePath();shape(c,'#E2504A');rr(c,tx-14,ty+1,28,6,3,'#fff');ell(c,tx-fd*17,ty-14,3.6,3.6,'#fff');break}
   case 'party':{tri(c,[tx-9,ty+4],[tx,ty-20],[tx+9,ty+4],'#7FD1B9');if(!SIL){c.save();c.beginPath();c.moveTo(tx-9,ty+4);c.lineTo(tx,ty-20);c.lineTo(tx+9,ty+4);c.clip();c.fillStyle='#FF7FA8';for(let i=0;i<4;i++)c.fillRect(tx-12,ty-16+i*6,24,2.5);c.restore()}ell(c,tx,ty-21,3.4,3.4,'#FFD23F');break}
   case 'halo':{const b=Math.sin(NOW*2.5)*1.5;c.beginPath();c.ellipse(tx,ty-9+b,12,4,0,0,7);c.lineWidth=5;c.strokeStyle='rgba(255,226,120,.45)';c.stroke();c.lineWidth=2.6;c.strokeStyle='#F4C842';c.stroke();break}
   case 'horns':{tri(c,[tx-13,ty+5],[tx-14,ty-8],[tx-6,ty+3],'#D9443A');tri(c,[tx+6,ty+3],[tx+14,ty-8],[tx+13,ty+5],'#D9443A');break}
   case 'sprout':{c.lineWidth=2.2;c.strokeStyle='#3E8E5E';c.beginPath();c.moveTo(tx,ty+2);c.quadraticCurveTo(tx+1,ty-5,tx,ty-9);c.stroke();ell(c,tx-5,ty-10,5,2.8,'#6FBF5A',true,0.4);ell(c,tx+5,ty-11,5,2.8,'#7FD1B9',true,-0.4);break}
   case 'cherry':{const x=tx-fd*12,y=ty+6;c.lineWidth=1.6;c.strokeStyle='#3E8E5E';c.beginPath();c.moveTo(x-3,y);c.quadraticCurveTo(x,y-9,x+2,y-10);c.moveTo(x+4,y+1);c.quadraticCurveTo(x+3,y-7,x+2,y-10);c.stroke();ell(c,x-3,y+1,3.4,3.4,'#E2504A');ell(c,x+4,y+2,3.4,3.4,'#E2504A');break}
   case 'tiara':{const x=tx,y=ty+3;c.beginPath();c.moveTo(x-11,y);c.quadraticCurveTo(x-7,y-7,x-4,y-4);c.lineTo(x,y-10);c.lineTo(x+4,y-4);c.quadraticCurveTo(x+7,y-7,x+11,y);c.closePath();shape(c,'#E3E8F0');ell(c,x,y-4,2.4,2.4,'#FF7FA8',false);dot(c,x-6,y-3,1.3,'#7FD1B9');dot(c,x+6,y-3,1.3,'#7FD1B9');break}
   case 'pumpkinhat':{const x=tx,y=ty+1;ell(c,x-5,y-5,6,6,'#F28A2E');ell(c,x+5,y-5,6,6,'#F28A2E');ell(c,x,y-5,6.5,7,'#FF9D3F');rr(c,x-1.5,y-15,3,5,1,'#5D8A3A');if(!SIL){tri(c,[x-4,y-6],[x-1,y-6],[x-2.5,y-9],'#5A2A10',false);tri(c,[x+1,y-6],[x+4,y-6],[x+2.5,y-9],'#5A2A10',false)}break}
   case 'froghat':{c.beginPath();c.ellipse(tx,ty+4,15,11,0,Math.PI,0);c.closePath();shape(c,'#7ED957');[-7,7].forEach(d=>{ell(c,tx+d,ty-7,5,5,'#7ED957');ell(c,tx+d,ty-7,2.8,2.8,'#fff',false);dot(c,tx+d+fd*0.6,ty-7,1.5,BK)});break}
   case 'phones':{c.beginPath();c.ellipse(tx,ty+12,19,16,0,Math.PI*1.05,Math.PI*1.95);c.lineWidth=3.4;c.strokeStyle='#3A3A42';c.stroke();rr(c,tx-23,ty+8,7,11,3,'#FF7FA8');rr(c,tx+16,ty+8,7,11,3,'#FF7FA8');break}
   case 'straw':{ell(c,tx,ty+4,21,5,'#F3D27A');c.beginPath();c.ellipse(tx,ty+3,11,9,0,Math.PI,0);c.closePath();shape(c,'#F3D27A');c.fillStyle='#E2504A';c.fillRect(tx-11,ty,22,3);break}
   case 'starpin':{star(c,tx-fd*13,ty+6,6,'#FFD23F');c.lineWidth=1.4;c.strokeStyle=BK;c.stroke();break}
   case 'bigbow':{const x=tx,y=ty+1;tri(c,[x,y],[x-13,y-9],[x-12,y+7],'#FFD23F');tri(c,[x,y],[x+13,y-9],[x+12,y+7],'#FFD23F');ell(c,x,y,3.4,3.4,'#F4A85C');break}
   case 'sun':{E.forEach(([x,y])=>{c.beginPath();c.roundRect(x-6,y-4.5,12,9,4);c.fillStyle='#24242C';c.fill();c.lineWidth=1.6;c.strokeStyle=BK;c.stroke();dot(c,x-2.5,y-2,1.3,'rgba(255,255,255,.6)')});c.beginPath();c.moveTo(E[0][0]+6,E[0][1]);c.lineTo(E[1][0]-6,E[1][1]);c.lineWidth=2;c.stroke();break}
   case 'starglass':{E.forEach(([x,y])=>{star(c,x,y,7.5,'rgba(255,214,90,.85)');c.lineWidth=1.6;c.strokeStyle=BK;c.stroke()});break}
   case 'monocle':{const[x,y]=E[0];c.beginPath();c.arc(x,y,5.8,0,7);c.fillStyle='rgba(200,230,255,.3)';c.fill();c.lineWidth=2;c.strokeStyle='#C9952A';c.stroke();c.beginPath();c.moveTo(x,y+6);c.quadraticCurveTo(x+4,y+14,x+10,y+16);c.lineWidth=1.2;c.stroke();break}
   case 'goggle':{c.beginPath();c.moveTo(E[0][0]-9,ey);c.lineTo(E[1][0]+9,ey);c.lineWidth=3;c.strokeStyle='#3D7FD1';c.stroke();E.forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,5.6,5,0,0,7);c.fillStyle='rgba(120,200,255,.55)';c.fill();c.lineWidth=2.2;c.strokeStyle='#2F63A8';c.stroke()});break}
   case 'masque':{c.beginPath();c.moveTo(E[0][0]-9,ey-2);c.quadraticCurveTo(E[0][0],ey-9,ex,ey-2);c.quadraticCurveTo(E[1][0],ey-9,E[1][0]+9,ey-2);c.quadraticCurveTo(E[1][0]+6,ey+6,ex,ey+3);c.quadraticCurveTo(E[0][0]-6,ey+6,E[0][0]-9,ey-2);c.closePath();shape(c,'#8A5CD1');
     E.forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,2.8,2.4,0,0,7);c.fillStyle='#fff';c.fill();dot(c,x,y,1.4,BK)});star(c,E[1][0]+9,ey-4,3,'#FFD23F');break}
   case 'patch':{const[x,y]=E[1];c.beginPath();c.moveTo(tx-16,ty+10);c.lineTo(tx+16,ty+16);c.lineWidth=1.6;c.strokeStyle=BK;c.stroke();ell(c,x,y,5,4.6,'#24242C');break}
   case 'sticker':{E.forEach(([x,y],i)=>{if(i)heartPath(c,x+3,y+7,2.6),c.fillStyle='#FF7FA8',c.fill();else star(c,x-3,y+7,3,'#FFD23F')});break}
   case 'bowtie':{tri(c,[nx,ny+2],[nx-8,ny-3],[nx-8,ny+7],'#E2504A');tri(c,[nx,ny+2],[nx+8,ny-3],[nx+8,ny+7],'#E2504A');ell(c,nx,ny+2,2.4,2.4,'#B93A3A');break}
   case 'pearl':{for(let i=0;i<9;i++){const a=Math.PI*(0.1+i*0.1);dot(c,nx+Math.cos(a)*12,ny-2+Math.sin(a)*4.5,2.1,'#FFFDF5')}c.lineWidth=0.8;c.strokeStyle='rgba(0,0,0,.25)';break}
   case 'bandana':{c.beginPath();c.moveTo(nx-12,ny-1);c.lineTo(nx+12,ny-1);c.lineTo(nx,ny+11);c.closePath();shape(c,'#3D7FD1');if(!SIL){dot(c,nx-4,ny+2,1.2,'#fff');dot(c,nx+4,ny+2,1.2,'#fff');dot(c,nx,ny+6,1.2,'#fff')}break}
   case 'heartpend':{c.beginPath();c.ellipse(nx,ny-1,11,3.6,0,0,Math.PI);c.lineWidth=1.2;c.strokeStyle='#C9952A';c.stroke();heartPath(c,nx,ny+5,3.4);c.fillStyle='#FF5A8A';c.fill();c.lineWidth=1.3;c.strokeStyle=BK;c.stroke();break}
   case 'lei':{const cols=['#FF7FA8','#FFD23F','#B9A4F2','#7FD1B9'];for(let i=0;i<7;i++){const a=Math.PI*(0.08+i*0.14);const x=nx+Math.cos(a)*13,y=ny-1+Math.sin(a)*5;for(let k=0;k<4;k++){const b=k*Math.PI/2;dot(c,x+Math.cos(b)*1.8,y+Math.sin(b)*1.8,1.7,cols[i%4])}dot(c,x,y,1,'#fff')}break}
   case 'medal':{c.beginPath();c.moveTo(nx-5,ny-2);c.lineTo(nx,ny+5);c.lineTo(nx+5,ny-2);c.lineWidth=2.6;c.strokeStyle='#3D7FD1';c.stroke();ell(c,nx,ny+7,4.4,4.4,'#FFD23F');star(c,nx,ny+7,2.4,'#F4A85C');break}
   case 'hero':{const[x0,x1]=A.sheet||[-30,30],bk=-fd;c.beginPath();c.moveTo(nx-2,ny-3);c.quadraticCurveTo(nx+bk*20,ny-12,nx+bk*32,ny+2);c.lineTo(nx+bk*30,-4);c.lineTo(nx+bk*8,ny+6);c.closePath();shape(c,'#E2504A');ell(c,nx,ny,3.6,3,'#FFD23F');break}
   case 'dino':{const bk=-fd,pts=[];for(let i=0;i<6;i++){const u=i/5;pts.push([tx+bk*(4+u*26),ty+2+u*u*20])}pts.forEach(([x,y],i)=>{const s=6-i*0.5;tri(c,[x-s*0.7,y+2],[x+bk*s*0.3,y-s*1.4],[x+s*0.7,y+2],'#7ED957')});break}
   case 'astro':{c.beginPath();c.arc(ex,ey+1,22,0,7);c.fillStyle='rgba(200,235,255,.28)';c.fill();c.lineWidth=2.4;c.strokeStyle='#8FB8D9';c.stroke();c.beginPath();c.arc(ex,ey+1,18,3.6,4.4);c.lineWidth=3;c.strokeStyle='rgba(255,255,255,.85)';c.stroke();ell(c,nx,ny+1,14,4,'#E3E8F0');break}
   case 'bee':{[-6,6].forEach(d=>{c.beginPath();c.moveTo(tx+d*0.6,ty+2);c.quadraticCurveTo(tx+d*1.2,ty-8,tx+d*1.6,ty-12);c.lineWidth=1.6;c.strokeStyle=BK;c.stroke();dot(c,tx+d*1.6,ty-12,2.4,'#24242C')});break}
  }
}
/* 등에 메는 것: behind=몸 뒤, 아니면 몸 위 */
const BACKS={angel:1,bat:1,fairy:1,balloon:1,starballoon:1,beewing:1,backpack:0,shell:0};
function drawBack(c,type,A,behind){
  const[bx,by]=A.back||[10,-20],bd=A.bdir||1;if(!!BACKS[type]!==behind)return;
  const flap=Math.sin(NOW*6)*0.12;
  switch(type){
   case 'angel':case 'bat':{const col=type==='angel'?'#FFFFFF':'#5B3A8C';[[0,0.25],[-bd*4,0]].forEach(([o,ra],k)=>{c.save();c.translate(bx+o,by+(k?2:0));c.rotate(bd*(-0.35+ra-flap));c.scale(bd*1.4,1.4);c.beginPath();c.moveTo(0,0);
     if(type==='angel'){c.bezierCurveTo(6,-18,22,-26,28,-22);c.quadraticCurveTo(26,-14,20,-12);c.quadraticCurveTo(22,-6,15,-5);c.quadraticCurveTo(15,1,8,1)}
     else{c.lineTo(10,-20);c.lineTo(26,-18);c.quadraticCurveTo(22,-12,24,-7);c.quadraticCurveTo(18,-9,16,-3);c.quadraticCurveTo(11,-6,8,1)}
     c.closePath();c.fillStyle=k?shade(col,-0.12):col;c.fill();c.lineWidth=2;c.strokeStyle=BK;c.stroke();c.restore()});break}
   case 'fairy':{[[0,'rgba(178,232,255,.75)',-0.6],[0,'rgba(255,190,225,.75)',-0.05]].forEach(([o,col,r])=>{c.save();c.translate(bx,by);c.rotate(bd*(r-flap));c.beginPath();c.ellipse(bd*15,-9,17,8,0,0,7);c.fillStyle=col;c.fill();c.lineWidth=1.6;c.strokeStyle=BK;c.stroke();c.restore()});break}
   case 'beewing':{[-0.5,0].forEach(r=>{c.save();c.translate(bx,by);c.rotate(bd*(r-flap*2));c.beginPath();c.ellipse(bd*11,-7,12,6,0,0,7);c.fillStyle='rgba(235,248,255,.8)';c.fill();c.lineWidth=1.4;c.strokeStyle=BK;c.stroke();c.restore()});break}
   case 'balloon':case 'starballoon':{const sw=Math.sin(NOW*1.6)*3,hx=bx+bd*8+sw,hy=by-46;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+bd*10,by-20,hx,hy+8);c.lineWidth=1.2;c.strokeStyle='#6B5B55';c.stroke();
     if(type==='balloon'){heartPath(c,hx,hy,9);c.fillStyle='#FF5A8A';c.fill();c.lineWidth=2;c.strokeStyle=BK;c.stroke()}else{star(c,hx,hy,11,'#FFD23F');c.lineWidth=2;c.strokeStyle=BK;c.stroke()}
     dot(c,hx-3,hy-4,2,'rgba(255,255,255,.7)');break}
   case 'backpack':{rr(c,bx-7,by-6,15,13,4,'#FF9D3F');rr(c,bx-7,by-6,15,6,3,'#F27A2E');dot(c,bx+0.5,by,1.6,'#FFD23F');break}
   case 'shell':{c.beginPath();c.ellipse(bx-2,by+4,15,10,0,Math.PI,0);c.closePath();shape(c,'#86BF6E');if(!SIL){c.lineWidth=1.5;c.strokeStyle='#4E7F43';[[-8,0],[0,-6],[6,1]].forEach(([a,b])=>{c.beginPath();c.ellipse(bx-2+a,by+3+b,4,3,0,0,7);c.stroke()})}break}
  }
}
function drawBackFor(c,id,av,behind){const A=ANCH[id],k=av&&av.acc&&av.acc.back;if(A&&k&&ACCS[k])drawBack(c,k,A,behind)}

function drawUmbrella(c){c.lineWidth=2;c.strokeStyle=BK;c.beginPath();c.moveTo(4,-14);c.lineTo(4,-70);c.stroke();
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(4,-72);c.arc(4,-58,28,Math.PI+i*Math.PI/4,Math.PI+(i+1)*Math.PI/4);c.closePath();c.fillStyle=i%2?'#FFC94A':'#E2557A';c.fill();c.stroke()}}
function drawKid(c,x,y,t,face,moving,joy=0){
  c.save();c.translate(x,y);
  c.beginPath();c.ellipse(0,0,13,4.5,0,0,7);c.fillStyle='rgba(30,45,30,.25)';c.fill();
  const st=moving?Math.sin(t*13):0,bob=joy>0?Math.abs(Math.sin(joy*10))*14:moving?Math.abs(Math.sin(t*13))*2:Math.sin(t*2)*0.6;
  c.translate(0,-bob);c.scale(face,1);drawBackFor(c,'kid',CUR,true);
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
 samsaek:{top:[-8,-41],eyes:[[-17,-25],[-4,-26]],neck:[-6,-15],sheet:[-38,30,-44],ears:1,back:[11,-23],bdir:1,fdir:-1},
 mingnyu:{top:[-10,-50],eyes:[[-17,-31],[-1,-32]],neck:[-6,-15],sheet:[-38,26,-52],ears:1,back:[8,-19],bdir:1,fdir:-1},
 cat:{top:[-8,-42],eyes:[[-15,-27],[-1,-27]],neck:[-6,-15],sheet:[-36,26,-46],ears:1,back:[11,-23],bdir:1,fdir:-1},
 kid:{top:[0,-50],eyes:[[2,-35],[9,-35]],neck:[0,-24],sheet:[-17,17,-52],ears:1,back:[-7,-19],bdir:-1,fdir:1}
};
function drawAccFor(c,id,av){const A=ANCH[id],a=(av&&av.acc)||{};if(!A)return;drawBackFor(c,id,av,false);['neck','eyes','costume','head'].forEach(sl=>{const k=a[sl];if(k&&ACCS[k])drawAccPart(c,k,A)})}
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
  const fur=(FURS[av.fur]||FURS.cream)[1],dk=shade(fur,-0.35),lt=shade(fur,0.55),pat=av.pat||'none',ec0=(EYES[av.eye]||EYES.black)[1];
  const tux=pat==='tux',white='#FFFFFF',pt=pat==='point',tailc=pt?dk:fur;
  const sw=Math.sin(t*(mv?9:2.4))*4;
  c.lineCap='round';c.beginPath();c.moveTo(15,-12);c.quadraticCurveTo(30,-14+sw*0.5,26,-31+sw);c.lineWidth=10.4;c.strokeStyle=BK;c.stroke();c.lineWidth=6;c.strokeStyle=tailc;c.stroke();
  if(pat==='stripe'){c.save();c.lineWidth=2.2;c.strokeStyle=dk;c.beginPath();c.moveTo(24,-18);c.lineTo(29,-19);c.moveTo(25,-24+sw*.5);c.lineTo(30,-25+sw*.6);c.stroke();c.restore()}
  c.beginPath();c.ellipse(16,-4-(mv?Math.max(0,-st)*2:0),6,4.5,0,0,7);hs(c,tux?white:fur);
  const body=()=>{c.beginPath();c.ellipse(5,-12,17.5,11.5,0,0,7)};
  body();hs(c,fur);c.save();body();c.clip();
  if(pat==='stripe'){c.strokeStyle=dk;c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-4+i*6,-24);c.lineTo(-2+i*6,-15);c.stroke()}}
  if(pat==='spots'){c.fillStyle=dk;[[2,-19,6,4.5],[14,-12,4.5,4],[-6,-9,3.5,3]].forEach(([x,y,rx,ry])=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()})}
  if(tux){c.fillStyle=white;c.beginPath();c.ellipse(-6,-8,9,8,0,0,7);c.fill()}
  if(pat==='calico'){c.fillStyle='#E58B3A';c.beginPath();c.ellipse(11,-17,8,6,0,0,7);c.fill();c.fillStyle='#3A3434';c.beginPath();c.ellipse(-3,-20,5,4,0,0,7);c.fill()}
  if(pat==='heart'){heartPath(c,5,-13,5.5);c.fillStyle='#FF8FB5';c.fill();heartPath(c,15,-9,3);c.fill()}
  if(pat==='star'){star(c,3,-14,5.5,'#FFE38A');star(c,14,-9,3.2,'#FFE38A');star(c,-6,-10,2.6,'#FFE38A')}
  c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(2,-6,10,4,0,0,7);c.fill();
  c.restore();body();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  const pc=tux||pat==='socks'?white:pt?dk:fur;
  [[-13+st*2.5,-3-Math.max(0,st)*2.5],[-2-st*2.5,-3-Math.max(0,-st)*2.5]].forEach(([x,y])=>{c.beginPath();c.ellipse(x,y,6,4.6,0,0,7);hs(c,pc)});
  const tl=twitch(t,1.1),tr=twitch(t,3.0);
  c.save();c.translate(-22,-37);c.rotate(-tl);tri(c,[-8,4],[-9,-17],[7,-1],pt?dk:fur);if(!SIL)tri(c,[-5,1],[-6,-11],[3,-1],'#F6A6B8',false);c.restore();
  c.save();c.translate(5,-39);c.rotate(tr);tri(c,[-7,0],[6,-18],[10,3],pt?dk:fur);if(!SIL)tri(c,[-3,-1],[5,-12],[7,1],'#F6A6B8',false);c.restore();
  const head=()=>{c.beginPath();c.moveTo(-31,-21);c.bezierCurveTo(-32,-35,-21,-42,-8,-42);c.bezierCurveTo(6,-42,17,-35,18,-23);c.bezierCurveTo(18,-15,10,-14,-8,-14);c.bezierCurveTo(-25,-14,-31,-15,-31,-21);c.closePath()};
  head();hs(c,fur);c.save();head();c.clip();
  if(pat==='stripe'){c.strokeStyle=dk;c.lineWidth=2.6;[[-12,-42,-11,-35],[-7,-43,-7,-36],[-2,-42,-3,-35]].forEach(([a,b,d,e])=>{c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke()})}
  if(pat==='spots'){c.fillStyle=dk;c.beginPath();c.ellipse(8,-38,8,6,0,0,7);c.fill()}
  if(tux){c.fillStyle=white;c.beginPath();c.ellipse(-8,-18,12,6.5,0,0,7);c.fill()}
  if(pat==='calico'){c.fillStyle='#E58B3A';c.beginPath();c.ellipse(8,-38,10,7,0,0,7);c.fill();c.fillStyle='#3A3434';c.beginPath();c.ellipse(-24,-34,7,6,0,0,7);c.fill()}
  if(pt){c.fillStyle=dk;c.beginPath();c.ellipse(-8,-22,13,9,0,0,7);c.fill()}
  if(pat==='heart'){heartPath(c,-8,-36,3.4);c.fillStyle='#FF8FB5';c.fill()}
  if(pat==='star')star(c,-8,-36,3.6,'#FFE38A');
  c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(-12,-37,9,4,-0.2,0,7);c.fill();
  c.restore();head();c.lineWidth=2.4;c.strokeStyle=BK;c.stroke();
  const E=ANCH.cat.eyes;
  E.forEach(([x,y],i)=>{const ec=ec0==='odd'?(i?'#D9A520':'#3D7FD1'):ec0==='sparkle'?'#5B7DD1':ec0;if(bl){c.beginPath();c.moveTo(x-3,y);c.quadraticCurveTo(x,y+2.4,x+3,y);c.lineWidth=1.8;c.strokeStyle=BK;c.stroke();return}
    c.fillStyle=ec==='#222'?BK:ec;c.beginPath();c.ellipse(x,y,3,3.7,0,0,7);c.fill();if(ec!=='#222'){c.fillStyle=BK;c.beginPath();c.ellipse(x,y,1.5,2.6,0,0,7);c.fill()}
    c.fillStyle='#fff';c.beginPath();c.arc(x+1,y-1.5,1,0,7);c.fill();if(ec0==='sparkle')star(c,x-0.6,y+1,1.6,'#fff')});
  c.fillStyle='#F28AA0';c.beginPath();c.moveTo(-9.5,-22.5);c.lineTo(-6.5,-22.5);c.lineTo(-8,-21);c.closePath();c.fill();
  c.beginPath();c.moveTo(-11,-19.5);c.quadraticCurveTo(-9.5,-17.5,-8,-19.5);c.quadraticCurveTo(-6.5,-17.5,-5,-19.5);c.lineWidth=1.3;c.strokeStyle=BK;c.stroke();
  c.fillStyle='rgba(255,120,140,.35)';c.beginPath();c.ellipse(-21,-20,3,1.8,0,0,7);c.ellipse(5,-20,3,1.8,0,0,7);c.fill();
}
/* 상점 목록: [이름, 값, 크레딧] */
const BASES={cat:['기본 냥이',0],kid:['모자 쓴 아이',40],samsaek:['삼색이',120],mingnyu:['밍뉴',null]};
const FURS={cream:['크림','#FFF1DC',0],cheese:['치즈','#F4A85C',0],gray:['회색','#A2A9B2',0],choco:['초코','#8E6244',0],snow:['눈꽃 하양','#FFFFFF',10],black:['까망','#3A3A42',15],silver:['은빛','#D5DAE0',20],peach:['복숭아','#FFC8A8',25],lemon:['레몬','#FFF08A',25],mint:['민트','#9FE0C9',30],pink:['딸기우유','#F7B9CB',30],sky:['하늘','#A9D6F2',30],lav:['라벤더','#C9B6F0',30],coral:['산호','#F59A8C',35],night:['밤하늘','#4A4E8C',45],gold:['황금','#F4C842',80]};
const PATS={none:['무늬 없음',0],stripe:['줄무늬',20],spots:['점박이',20],tux:['턱시도',25],socks:['흰 양말',15],calico:['삼색 얼룩',30],point:['샴 포인트',30],heart:['하트 무늬',35],star:['별 무늬',40]};
const EYES={black:['까만 눈','#222',0],green:['초록 눈','#3F9D58',10],blue:['파란 눈','#3D7FD1',10],gold:['금색 눈','#D9A520',15],pink:['분홍 눈','#E46FA0',15],purple:['보라 눈','#8A5CD1',15],odd:['오드아이','odd',40],sparkle:['반짝 별 눈','sparkle',45]};
const ACC2={beret:1,cap:1,bunnyband:1,santa:1,party:1,halo:1,horns:1,sprout:1,cherry:1,tiara:1,pumpkinhat:1,froghat:1,phones:1,straw:1,starpin:1,bigbow:1,sun:1,starglass:1,monocle:1,goggle:1,masque:1,patch:1,sticker:1,bowtie:1,pearl:1,bandana:1,heartpend:1,lei:1,medal:1,hero:1,dino:1,astro:1,bee:1};
const ACCS={ribbon:['핑크 리본','head',15],flower:['꽃 머리핀','head',10],witch:['마녀 모자','head',25],crown:['별 왕관','head',60],glasses:['동글 안경','eyes',15],heart:['하트 선글라스','eyes',20],scarf:['빨간 목도리','neck',15],bell:['방울 목걸이','neck',10],ghost:['귀신 분장','costume',20],cape:['박쥐 망토','costume',20],
 bigbow:['노랑 큰 리본','head',15],starpin:['별 머리핀','head',10],cherry:['체리 핀','head',10],sprout:['새싹','head',10],beret:['빨간 베레모','head',20],cap:['야구 모자','head',20],
 straw:['밀짚모자','head',25],bunnyband:['토끼 머리띠','head',25],horns:['꼬마 악마 뿔','head',25],party:['고깔모자','head',20],tiara:['티아라','head',40],halo:['천사 링','head',45],
 santa:['산타 모자','head',30],pumpkinhat:['호박 모자','head',25],froghat:['개구리 모자','head',30],phones:['헤드폰','head',35],
 sun:['까만 선글라스','eyes',20],starglass:['별 안경','eyes',25],goggle:['수영 고글','eyes',20],monocle:['외알 안경','eyes',30],masque:['가면무도회 가면','eyes',35],patch:['해적 안대','eyes',20],sticker:['볼 스티커','eyes',10],
 bowtie:['나비넥타이','neck',15],bandana:['파란 반다나','neck',15],pearl:['진주 목걸이','neck',35],heartpend:['하트 목걸이','neck',25],lei:['꽃목걸이','neck',25],medal:['금메달','neck',40],
 angel:['천사 날개','back',60],bat:['박쥐 날개','back',40],fairy:['요정 날개','back',50],beewing:['꿀벌 날개','back',30],balloon:['하트 풍선','back',20],starballoon:['별 풍선','back',25],backpack:['책가방','back',20],shell:['거북 등껍질','back',35],
 hero:['히어로 망토','costume',35],dino:['공룡 등가시','costume',30],astro:['우주 헬멧','costume',50],bee:['꿀벌 더듬이','costume',20]};
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
  drawBackFor(c,base,av,true);
  if(base==='samsaek')heroSam(c,t,st,bl,moving);else if(base==='mingnyu')heroMing2(c,t,st,bl,moving);else heroCat(c,t,st,bl,moving,av);
  drawAccFor(c,base,av);
  if(O.raining&&!O.portrait)drawUmbrella(c);
  c.restore();
}
function accIcon(c,k,w,h){c.save();const sl=ACCS[k][1];c.translate(w*0.5,h*(sl==='back'?0.98:0.92));const z=h/(sl==='back'?78:62);c.scale(z,z);draw(c,0,0,0.3,1,false,0,{base:'cat',fur:'cream',pat:'none',eye:'black',acc:{[sl]:k}},{portrait:true});c.restore()}
window.Avatar={draw,BASES,FURS,PATS,EYES,ACCS,price,owns,defaultAvatar,accIcon,ANCH};
})();
