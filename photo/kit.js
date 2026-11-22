/* 사진 가이드 그림 키트 — 인물·배경·소품·후처리 + 선언형 장면/가이드 빌더.
   구도 카메라(photo/)·인생샷 남친(namchin/)이 같이 씀. */
(function(){
const TAU=Math.PI*2;
/* ---------- 기본 도구 ---------- */
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g}
function vg(c,w,h,stops,y0=0,y1=h){c.fillStyle=lg(c,0,y0,0,y1,stops);c.fillRect(0,y0,w,y1-y0)}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill()}
function ell(c,x,y,rx,ry,col,rot=0){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);c.fill()}
function poly(c,pts,col){c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function rr(c,x,y,w,h,r,col){c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function glow(c,x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function rnd(s){s=s||1;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function hex2rgb(h){if(!h||h[0]!=='#')return null;if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];const n=parseInt(h.slice(1,7),16);return[n>>16&255,n>>8&255,n&255]}
function shade(col,k){const r=hex2rgb(col);if(!r)return col;const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return`rgb(${f(r[0])},${f(r[1])},${f(r[2])})`}
function bokeh(c,w,h,n,seed,cols,y0=0,y1=1){const r=rnd(seed);for(let i=0;i<n;i++)glow(c,r()*w,(y0+r()*(y1-y0))*h,6+r()*w*.08,cols[i%cols.length])}

/* ---------- 사람 ---------- */
const ST={lk:[[-.05,-.25],[-.06,0]],rk:[[.05,-.25],[.06,0]]};
const POSES={
  stand:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.14,-.63],[.13,-.46]]},
  walk:{lk:[[-.07,-.24],[-.13,0]],rk:[[.05,-.24],[.11,-.02]],la:[[-.13,-.63],[-.08,-.48]],ra:[[.15,-.62],[.21,-.49]]},
  run:{lk:[[-.13,-.28],[-.24,-.14]],rk:[[.1,-.22],[.16,0]],la:[[.13,-.68],[.2,-.78]],ra:[[-.16,-.62],[-.24,-.52]]},
  jump:{lk:[[-.14,-.37],[-.07,-.2]],rk:[[.12,-.31],[.21,-.2]],la:[[-.2,-.96],[-.26,-1.12]],ra:[[.2,-.96],[.26,-1.12]]},
  punch:{lk:[[-.1,-.24],[-.16,0]],rk:[[.08,-.25],[.14,0]],la:[[.02,-.67],[.09,-.83]],ra:[[.27,-.79],[.45,-.79]]},
  arms:{...ST,la:[[-.22,-.87],[-.33,-.99]],ra:[[.22,-.87],[.33,-.99]]},
  hold:{...ST,la:[[-.12,-.62],[-.02,-.67]],ra:[[.12,-.62],[.02,-.67]]},
  phone:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.15,-.7],[.07,-.88]]},
  sit:{lk:[[-.2,-.45],[.04,-.41]],rk:[[.2,-.45],[-.04,-.41]],la:[[-.15,-.62],[-.18,-.47]],ra:[[.15,-.62],[.18,-.47]]},
  chair:{lk:[[-.06,-.47+.0],[-.06,0]],rk:[[.06,-.47],[.06,0]],la:[[-.14,-.62],[-.06,-.5]],ra:[[.14,-.62],[.06,-.5]]},
  lean:{lk:[[-.02,-.25],[.07,0]],rk:[[.05,-.25],[.06,0]],la:[[-.16,-.62],[-.21,-.5]],ra:[[.12,-.62],[.06,-.5]]},
  hairflip:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.2,-.9],[.05,-1.0]]},
  twirl:{lk:[[-.06,-.25],[-.03,0]],rk:[[.09,-.22],[.17,-.12]],la:[[-.25,-.76],[-.38,-.73]],ra:[[.25,-.76],[.38,-.73]]},
  wave:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.19,-.86],[.23,-1.03]]},
  reach:{...ST,la:[[-.14,-.63],[-.13,-.46]],ra:[[.24,-.74],[.42,-.74]]},
  pocket:{...ST,la:[[-.15,-.62],[-.09,-.5]],ra:[[.15,-.62],[.09,-.5]]},
  crouch:{lk:[[-.15,-.25],[-.08,0]],rk:[[.16,-.28],[.1,0]],la:[[-.16,-.58],[-.12,-.33]],ra:[[.16,-.58],[.12,-.33]],drop:.18},
};
let PSTYLE='illust',SILC='#262b42';
function person(c,x,fy,h,o={}){
  if(PSTYLE==='sil'&&!o.sil&&!o.ghost)o=Object.assign({},o,{sil:o.rim?'#ece8f2':SILC});
  const d=o.dir||1,P=POSES[o.pose||'stand']||POSES.stand,dr=(P.drop||0);
  const X=v=>x+v*h*d,Y=v=>fy+(v<=-.44?v+dr:v)*h;
  const one=o.sil||o.ghost,sk=one||o.skin||'#f1c7a8',cl=one||o.col||'#3b4a6b',pa=one||o.pants||'#2b2f3a',ha=one||o.hair||'#2b1d17',sh=one||o.shoes||'#1d1d24';
  const hs=o.hs||(o.long?'long':'short');
  c.save();c.lineCap='round';c.lineJoin='round';
  if(!one&&o.ground!==false&&o.pose!=='sit'&&o.pose!=='jump'){c.save();c.globalAlpha=.22;ell(c,x+d*h*.03,fy+h*.006,h*.17,h*.024,'#000');c.restore()}
  // 다리
  const leg=(hx,k)=>{c.strokeStyle=pa;c.lineWidth=h*.08;c.beginPath();c.moveTo(X(hx),Y(-.47));c.lineTo(X(k[0][0]),fy+k[0][1]*h);c.lineTo(X(k[1][0]),fy+k[1][1]*h-h*.012);c.stroke();
    if(o.pose!=='sit')ell(c,X(k[1][0])+d*h*.022,fy+k[1][1]*h-h*.004,h*.052,h*.022,sh)};
  if(o.dress){/* 치마 아래 다리는 피부색 */const pp=pa;c.strokeStyle=sk;c.lineWidth=h*.055;[[-.045,P.lk],[.045,P.rk]].forEach(([hx,k])=>{c.beginPath();c.moveTo(X(hx),Y(-.4));c.lineTo(X(k[0][0]),fy+k[0][1]*h);c.lineTo(X(k[1][0]),fy+k[1][1]*h-h*.012);c.stroke();if(o.pose!=='sit')ell(c,X(k[1][0])+d*h*.022,fy+k[1][1]*h-h*.004,h*.05,h*.02,sh)})}
  else [[-.045,P.lk],[.045,P.rk]].forEach(([hx,k])=>leg(hx,k));
  // 몸통 (음영)
  const tg=one?cl:lg(c,X(-.13),0,X(.13),0,[shade(cl,.14),cl,shade(cl,-.22)]);c.fillStyle=tg;c.beginPath();
  c.moveTo(X(-.125),Y(-.81));c.quadraticCurveTo(X(0),Y(-.85),X(.125),Y(-.81));
  if(o.dress){c.lineTo(X(.09),Y(-.56));c.quadraticCurveTo(X(.2),Y(-.38),X(.2),Y(-.28));c.quadraticCurveTo(X(0),Y(-.25),X(-.2),Y(-.28));c.quadraticCurveTo(X(-.2),Y(-.38),X(-.09),Y(-.56))}
  else{c.lineTo(X(.1),Y(-.45));c.quadraticCurveTo(X(0),Y(-.42),X(-.1),Y(-.45))}
  c.closePath();c.fill();
  if(!one&&!o.dress){c.fillStyle=shade(pa,.06);c.beginPath();c.moveTo(X(-.1),Y(-.47));c.lineTo(X(.1),Y(-.47));c.lineTo(X(.1),Y(-.42));c.lineTo(X(-.1),Y(-.42));c.fill()}
  // 목
  rect(c,x-h*.024,Y(-.9),h*.048,h*.07,one||shade(sk,-.08));
  // 팔
  c.lineWidth=h*.058;
  [[-.115,P.la],[.115,P.ra]].forEach(([sx,a])=>{c.strokeStyle=cl;c.beginPath();c.moveTo(X(sx),Y(-.79));c.lineTo(X(a[0][0]),fy+a[0][1]*h+(a[0][1]<=-.44?dr*h:0));c.lineTo(X(a[1][0]),fy+a[1][1]*h+(a[1][1]<=-.44?dr*h:0));c.stroke();
    const hx2=X(a[1][0]),hy2=fy+a[1][1]*h+(a[1][1]<=-.44?dr*h:0);if(o.gloves)circ(c,hx2,hy2,h*.048,one||'#d8262e');else circ(c,hx2,hy2,h*.027,sk)});
  if(o.pose==='phone')rr(c,X(.03)-h*.032,Y(-.98),h*.064,h*.11,h*.012,one||'#15151a');
  // 머리
  const rx=h*.062,ry=h*.074,hx=X(o.look?.014:0),hy=Y(-.94);
  if(!o.back&&(hs==='long')){c.fillStyle=ha;c.beginPath();c.roundRect(hx-rx*1.18,hy-ry*.7,rx*2.36,ry*(o.longer?3.2:2.5),rx*.9);c.fill()}
  if(hs==='bob'&&!o.back){c.fillStyle=ha;c.beginPath();c.roundRect(hx-rx*1.2,hy-ry*.75,rx*2.4,ry*1.75,rx*.8);c.fill()}
  ell(c,hx,hy,rx,ry,sk);
  if(o.back){c.fillStyle=ha;c.beginPath();c.ellipse(hx,hy-ry*.05,rx*1.1,ry*1.08,0,0,TAU);c.fill();if(hs==='long')rr(c,hx-rx*1.12,hy,rx*2.24,ry*(o.longer?2.4:1.8),rx*.6,ha);if(hs==='bun')circ(c,hx,hy-ry*1.05,rx*.5,ha)}
  else{
    c.fillStyle=ha;c.beginPath();c.ellipse(hx-(o.look?d*rx*.18:0),hy-ry*.28,rx*1.1,ry*.82,0,Math.PI,0);c.fill();
    c.beginPath();c.moveTo(hx-rx*1.08,hy-ry*.3);c.quadraticCurveTo(hx-rx*.2,hy-ry*.05,hx+rx*.4,hy-ry*.42);c.quadraticCurveTo(hx+rx*.9,hy-ry*.2,hx+rx*1.08,hy-ry*.3);c.lineTo(hx+rx*1.08,hy-ry*.5);c.lineTo(hx-rx*1.08,hy-ry*.5);c.fill();
    if(hs==='bun')circ(c,hx,hy-ry*1.05,rx*.5,ha);
    if(!one&&h>48&&PSTYLE!=='flat'){const e=o.look?[d*rx*.42]:[-rx*.38,rx*.38],er=Math.max(1,rx*.12);
      e.forEach(ex=>{ell(c,hx+ex,hy+ry*.08,er,er*1.25,'#2b1d17');if(h>110)circ(c,hx+ex+er*.35,hy+ry*.02,er*.35,'#fff')});
      c.globalAlpha=.35;e.forEach(ex=>circ(c,hx+ex*1.15,hy+ry*.38,rx*.18,'#ff8a8a'));c.globalAlpha=1;
      c.strokeStyle='#b5536a';c.lineWidth=Math.max(1,rx*.1);c.beginPath();const mx=hx+(o.look?d*rx*.38:0);
      if(o.smile)c.arc(mx,hy+ry*.4,rx*.28,.25,Math.PI-.25);else{c.moveTo(mx-rx*.16,hy+ry*.52);c.lineTo(mx+rx*.16,hy+ry*.52)}c.stroke();
      if(o.glasses){c.strokeStyle='#111';c.lineWidth=Math.max(1,rx*.12);e.forEach(ex=>{c.beginPath();c.arc(hx+ex,hy+ry*.08,rx*.3,0,TAU);c.stroke()})}
      if(o.shades){e.forEach(ex=>ell(c,hx+ex,hy+ry*.1,rx*.34,ry*.2,'#111'))}}}
  if(o.hat){c.fillStyle=o.hat;ell(c,hx,hy-ry*.55,rx*1.9,ry*.22,o.hat);c.beginPath();c.ellipse(hx,hy-ry*.6,rx*1.05,ry*.75,0,Math.PI,0);c.fill()}
  if(o.rim&&!one){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=o.rim;c.lineWidth=h*.012;c.shadowColor=o.rim;c.shadowBlur=h*.05;c.beginPath();c.ellipse(hx,hy,rx*1.05,ry*1.05,0,-1.9,1.2);c.stroke();
    c.beginPath();c.moveTo(X(.125),Y(-.8));c.lineTo(X(.1),Y(-.45));c.stroke();c.restore()}
  c.restore();
}
/* 누운 사람 (위에서 본 모습) */
function lying(c,x,y,h,o={},ang=-Math.PI/2){c.save();c.translate(x,y);c.rotate(ang);person(c,0,h*.5,h,Object.assign({ground:false},o));c.restore()}

/* ---------- 후처리 (비네팅·필름 그레인·빛) ---------- */
let NOISE=null;
function noise(){if(NOISE)return NOISE;const n=document.createElement('canvas');n.width=n.height=128;const x=n.getContext('2d'),d=x.createImageData(128,128),r=rnd(99);
  for(let i=0;i<128*128;i++){const v=r()*255;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255}x.putImageData(d,0,0);NOISE=n;return n}
function post(c,w,h,o={}){
  c.save();const g=c.createRadialGradient(w/2,h*.45,Math.min(w,h)*.35,w/2,h*.5,Math.max(w,h)*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${o.vig??.32})`);c.fillStyle=g;c.fillRect(0,0,w,h);
  c.globalAlpha=o.grain??.055;c.globalCompositeOperation='overlay';c.fillStyle=c.createPattern(noise(),'repeat');c.fillRect(0,0,w,h);
  c.globalCompositeOperation='soft-light';c.globalAlpha=.5;c.fillStyle=lg(c,0,0,0,h,['rgba(255,240,220,.35)','rgba(255,255,255,0)','rgba(20,30,60,.25)']);c.fillRect(0,0,w,h);c.restore()}

/* ---------- 하늘·배경 ---------- */
const SKY={day:['#3f8ee0','#8cc4f2','#dcefff'],sunset:['#2b2d6e','#a04a7a','#f2774b','#ffc56b'],golden:['#f7b267','#f79d65','#ffd9a0'],dusk:['#1b2550','#5a4a8a','#e88f7a'],
  night:['#05081a','#101a3a','#26305a'],blue:['#0d1a44','#2a4a8f','#6f8fd0'],overcast:['#9aa6b2','#c7ced6','#e4e8ec'],pastel:['#f6c6d6','#f9e0d9','#e8eefc'],dawn:['#7a8fc9','#f1b7a8','#ffe3c4']};
const ops={
  sky(c,w,h,o={}){vg(c,w,h,SKY[o.t||'day'],0,h*(o.to||1));if(o.sun)glow(c,w*o.sun[0],h*o.sun[1],w*(o.sun[2]||.45),o.t==='night'?'rgba(255,250,230,.5)':'rgba(255,245,210,.9)');if(o.sun&&o.disc!==false)circ(c,w*o.sun[0],h*o.sun[1],w*(o.sun[3]||.05),o.t==='night'?'#fffbe8':'#fff6d8');
    if(o.stars){const r=rnd(7);for(let i=0;i<160;i++)circ(c,r()*w,r()*h*(o.to||1)*.9,r()*1.4+.3,`rgba(255,255,255,${.4+r()*.6})`)}},
  clouds(c,w,h,n=4,seed=3,y0=.08,y1=.4,col='rgba(255,255,255,.92)'){const r=rnd(seed);for(let i=0;i<n;i++){const x=r()*w,y=h*(y0+r()*(y1-y0)),s=w*(.05+r()*.08);
    [[0,0,1],[-.9,.25,.7],[.9,.25,.75],[-.45,-.35,.72],[.4,-.4,.8]].forEach(([dx,dy,k])=>circ(c,x+dx*s,y+dy*s,s*k,col));rect(c,x-s*1.5,y+s*.1,s*3,s*.6,col)}},
  ground(c,w,h,y=.75,t='grass'){const P={grass:['#8cc56a','#4f8a3a'],sand:['#f3e2bd','#dcc391'],road:['#8d8a83','#5f5c57'],snow:['#ffffff','#dfe8f2'],floor:['#cbb79e','#a88f72'],wood:['#b98a5f','#8a6240'],stone:['#cfc8bb','#a9a193'],dark:['#2a2730','#151319'],water:['#5d9bc4','#2e6f99'],field:['#c7b55a','#9b8a3a'],tile:['#e6e0d6','#c9c1b3']}[t]||['#888','#555'];vg(c,w,h,P,h*y,h)},
  sea(c,w,h,y0=.5,y1=1,t='day'){vg(c,w,h,t==='sunset'?['#d9786a','#5a3a6a','#2a2348']:t==='night'?['#1a2448','#0a1028']:['#4aa3d6','#1f6a9a'],h*y0,h*y1);c.save();c.globalAlpha=.25;c.strokeStyle='#fff';c.lineWidth=1.5;const r=rnd(4);for(let i=0;i<24;i++){const y=h*(y0+r()*(y1-y0)),x=r()*w;c.beginPath();c.moveTo(x,y);c.lineTo(x+w*(.05+r()*.12),y);c.stroke()}c.restore()},
  mountains(c,w,h,y=.6,cols=['#a7a4b8','#7f80a0','#565c80'],seed=2){cols.forEach((cl,i)=>{const y0=h*(y-.18+i*.08),pts=[[0,h*y+h*.02*i]];const r=rnd(seed+i);for(let k=0;k<=12;k++)pts.push([w*k/12,y0+(r()-.5)*h*.14]);pts.push([w,h*y+h*.02*i]);pts.push([w,h]);pts.push([0,h]);poly(c,pts,cl)})},
  peak(c,w,h,x=.5,y=.2,bw=.45,col='#5d6b80',snow=true){poly(c,[[w*(x-bw),h*.72],[w*x,h*y],[w*(x+bw),h*.72]],col);if(snow)poly(c,[[w*(x-bw*.22),h*(y+.1)],[w*x,h*y],[w*(x+bw*.22),h*(y+.1)],[w*(x+.05),h*(y+.08)],[w*x,h*(y+.12)]],'#f4f7fb')},
  city(c,w,h,y=.66,night=false,seed=9,col){const r=rnd(seed);let x=0;while(x<w){const bw=w*(.05+r()*.08),bh=h*(.08+r()*.24);rect(c,x,h*y-bh,bw,bh+h*(1-y),col||(night?'#0a1024':'#7d8aa0'));
    if(night)for(let k=0;k<10;k++)if(r()>.45)rect(c,x+r()*bw*.8,h*y-bh+r()*bh,2.5,3.5,'#ffd98a');else for(let k=0;k<6;k++)rect(c,x+bw*.15+(k%2)*bw*.4,h*y-bh+h*.02+Math.floor(k/2)*h*.04,bw*.25,h*.02,'rgba(255,255,255,.35)');x+=bw+1}},
  street(c,w,h,o={}){const vy=o.vy||.45,cols=o.cols||['#d9cfc0','#cbbfae'];vg(c,w,h,SKY[o.sky||'day'],0,h*vy);poly(c,[[0,0],[w*.32,h*vy*.9],[w*.32,h*vy+h*.08],[0,h]],cols[0]);poly(c,[[w,0],[w*.68,h*vy*.9],[w*.68,h*vy+h*.08],[w,h]],cols[1]);
    poly(c,[[0,h],[w*.32,h*vy+h*.08],[w*.68,h*vy+h*.08],[w,h]],o.road||'#9b958b');const r=rnd(o.seed||5);for(let i=0;i<7;i++){const t=i/7;rect(c,w*.02+t*w*.28,h*(.2+t*.22),w*(.07-t*.04),h*(.06-t*.03),o.night?`hsl(${r()*360},80%,60%)`:'rgba(40,50,70,.35)');rect(c,w*.91-t*w*.28,h*(.2+t*.22),w*(.07-t*.04),h*(.06-t*.03),o.night?`hsl(${r()*360},80%,60%)`:'rgba(40,50,70,.35)')}},
  room(c,w,h,o={}){rect(c,0,0,w,h*(o.floorY||.78),o.wall||'#ece4d8');ops.ground(c,w,h,o.floorY||.78,o.floor||'floor');if(o.win){const[x,y,ww,hh]=o.win;vg(c,w,h,SKY[o.sky||'day'],h*y,h*(y+hh));c.save();c.beginPath();c.rect(w*x,h*y,w*ww,h*hh);c.clip();vg(c,w,h,SKY[o.sky||'day'],h*y,h*(y+hh));if(o.view==='city')ops.city(c,w,h,y+hh*.85,o.sky==='night'||o.sky==='blue');if(o.view==='trees')bokeh(c,w,h,14,3,['rgba(120,180,100,.8)','rgba(200,230,160,.7)'],y,y+hh);c.restore();
      c.strokeStyle=o.frame||'#fff';c.lineWidth=w*.018;c.strokeRect(w*x,h*y,w*ww,h*hh);c.beginPath();c.moveTo(w*(x+ww/2),h*y);c.lineTo(w*(x+ww/2),h*(y+hh));c.stroke();glow(c,w*(x+ww/2),h*(y+hh*.6),w*.6,'rgba(255,245,220,.25)')}},
  studio(c,w,h,col='#e9e4dc'){const g=c.createRadialGradient(w*.5,h*.4,0,w*.5,h*.5,h*.8);g.addColorStop(0,shade(col,.25));g.addColorStop(1,shade(col,-.18));c.fillStyle=g;c.fillRect(0,0,w,h)},
  wall(c,w,h,col='#f2c6c9',y1=.86,floor='#e3d3b8'){rect(c,0,0,w,h*y1,col);rect(c,0,h*y1,w,h*(1-y1),floor)},
  forest(c,w,h,o={}){vg(c,w,h,o.fog?['#c9d8c4','#9db59a']:['#2b3d2a','#1a2a1c']);const r=rnd(o.seed||4);for(let i=0;i<9;i++){const x=r()*w,ww=w*(.03+r()*.05);rect(c,x,0,ww,h,o.fog?`rgba(60,80,60,${.3+r()*.5})`:'#121a12')}if(o.rays)[[.25,.12],[.4,.08],[.55,.1]].forEach(([x,a])=>poly(c,[[w*x,0],[w*(x+.08),0],[w*(x+.45),h],[w*(x+.25),h]],`rgba(255,240,190,${a*2})`))},
  field(c,w,h,y=.7,flowers=['#ffd34d','#ff6f91','#fff'],seed=3){ops.ground(c,w,h,y,'grass');const r=rnd(seed);for(let i=0;i<220;i++){const yy=h*(y+r()*(1-y)),s=1+(yy-h*y)/h*9;circ(c,r()*w,yy,s,flowers[i%flowers.length])}},
  tabletop(c,w,h,t='wood'){if(t==='marble'){rect(c,0,0,w,h,'#ecebe8');c.strokeStyle='rgba(120,120,130,.12)';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(0,h*i/9);c.bezierCurveTo(w*.3,h*i/9+25,w*.6,h*i/9-25,w,h*i/9+12);c.stroke()}}
    else if(t==='linen'){rect(c,0,0,w,h,'#efe7da');c.strokeStyle='rgba(0,0,0,.04)';for(let i=0;i<w;i+=4){c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke()}}
    else{rect(c,0,0,w,h,'#a07650');c.strokeStyle='rgba(60,30,10,.18)';c.lineWidth=2;for(let i=0;i<14;i++){c.beginPath();c.moveTo(0,h*i/14);c.bezierCurveTo(w*.3,h*i/14+8,w*.6,h*i/14-8,w,h*i/14);c.stroke()}}},
  night(c,w,h,seed=8){vg(c,w,h,['#0b0f1e','#1a1f3a']);bokeh(c,w,h,20,seed,['rgba(255,200,100,.55)','rgba(255,90,120,.45)','rgba(90,200,255,.4)'],.05,.75)},
  neon(c,w,h){rect(c,0,0,w,h,'#0b0f14');glow(c,w*.72,h*.22,w*.55,'rgba(255,40,110,.6)');glow(c,w*.2,h*.7,w*.5,'rgba(40,255,190,.35)')},
  desert(c,w,h){vg(c,w,h,SKY.golden,0,h*.55);[[.55,'#e8b071'],[.65,'#d99a5a'],[.78,'#c4844a']].forEach(([y,cl],i)=>{c.fillStyle=cl;c.beginPath();c.moveTo(0,h);c.lineTo(0,h*y);c.quadraticCurveTo(w*(.3+i*.15),h*(y-.12),w,h*(y+.04));c.lineTo(w,h);c.fill()})},
  snow(c,w,h,y=.7){vg(c,w,h,['#b8cde6','#e9f1fa'],0,h*y);ops.ground(c,w,h,y,'snow');const r=rnd(6);for(let i=0;i<90;i++)circ(c,r()*w,r()*h,1+r()*2.2,'rgba(255,255,255,.85)')},
  hanok(c,w,h){vg(c,w,h,SKY.day,0,h*.5);rect(c,0,h*.3,w,h*.5,'#e9e0cf');for(let i=0;i<6;i++){rect(c,w*(i/6),h*.3,6,h*.5,'#5a3a24')}c.fillStyle='#3a3a40';c.beginPath();c.moveTo(-w*.05,h*.32);c.quadraticCurveTo(w*.5,h*.22,w*1.05,h*.32);c.lineTo(w*1.05,h*.24);c.quadraticCurveTo(w*.5,h*.1,-w*.05,h*.24);c.fill();
    for(let i=0;i<5;i++)for(let j=0;j<2;j++)rect(c,w*(.06+i*.19),h*(.36+j*.18),w*.13,h*.14,'#f7f1e2');ops.ground(c,w,h,.8,'stone')},
  airport(c,w,h){rect(c,0,0,w,h,'#d8dde3');vg(c,w,h,SKY.day,h*.08,h*.7);for(let i=0;i<=6;i++)rect(c,w*i/6-3,h*.08,6,h*.62,'#4a5260');rect(c,0,h*.38,w,5,'#4a5260');ops.ground(c,w,h,.7,'tile');
    c.fillStyle='#f4f6f8';c.beginPath();c.ellipse(w*.62,h*.56,w*.28,h*.03,0,0,TAU);c.fill();poly(c,[[w*.58,h*.56],[w*.68,h*.56],[w*.6,h*.66]],'#f4f6f8');poly(c,[[w*.82,h*.56],[w*.88,h*.47],[w*.9,h*.56]],'#f4f6f8')},
  subway(c,w,h){rect(c,0,0,w,h,'#2a2e35');poly(c,[[0,0],[w,0],[w*.58,h*.42],[w*.42,h*.42]],'#3a3f48');poly(c,[[0,h],[w*.42,h*.48],[w*.58,h*.48],[w,h]],'#8f8a80');poly(c,[[0,h],[w*.12,h],[w*.46,h*.48],[w*.42,h*.48]],'#f2c14e');
    for(let i=0;i<8;i++){const t=i/8;rect(c,w*(.42-t*.42),h*(.42-t*.42)+h*.0,4,h*.06*(1+t*4),'rgba(255,255,255,.5)')}glow(c,w*.5,h*.45,w*.15,'rgba(255,255,220,.6)')},
  crosswalk(c,w,h){rect(c,0,0,w,h,'#3d3f44');for(let i=0;i<8;i++)rect(c,w*.12,h*(.06+i*.12),w*.76,h*.07,'#f2f2ee')},
  gym(c,w,h){rect(c,0,0,w,h,'#1a191f');glow(c,w*.5,h*.1,w*.8,'rgba(255,230,180,.22)');ops.ground(c,w,h,.86,'dark');[['#d8262e',.6],['#eee',.67],['#2a5bd7',.74]].forEach(([cl,y])=>rect(c,0,h*y,w,h*.012,cl))},
  /* --- 소품 --- */
  tree(c,w,h,x,y,s=.2,col='#3f7a3a'){rect(c,w*x-s*w*.04,h*y-s*h*.6,s*w*.08,s*h*.6,'#5a3d22');[[0,-.75,.42],[-.28,-.55,.3],[.28,-.55,.3],[0,-.98,.3]].forEach(([dx,dy,k])=>circ(c,w*x+dx*s*w,h*y+dy*s*h,k*s*w,col))},
  palm(c,w,h,x,y,s=.3,col='#1c3a24'){c.strokeStyle=col;c.lineWidth=s*w*.05;c.beginPath();c.moveTo(w*x,h*y);c.quadraticCurveTo(w*(x+.05*s*3),h*(y-s*.5),w*(x+.02),h*(y-s));c.stroke();for(let k=0;k<6;k++){const a=-Math.PI/2+(k-2.5)*.55;c.beginPath();c.moveTo(w*(x+.02),h*(y-s));c.quadraticCurveTo(w*(x+.02)+Math.cos(a)*s*w*.3,h*(y-s)+Math.sin(a)*s*h*.15-s*h*.05,w*(x+.02)+Math.cos(a)*s*w*.45,h*(y-s)+Math.sin(a)*s*h*.18+s*h*.08);c.stroke()}},
  lamp(c,w,h,x,y,s=.4,on=true){rect(c,w*x-2,h*(y-s),4,h*s,'#2a2a30');ell(c,w*x,h*(y-s),w*.025,h*.012,'#2a2a30');if(on){glow(c,w*x,h*(y-s)+4,w*.12,'rgba(255,220,140,.8)');circ(c,w*x,h*(y-s)+4,3,'#fff4c8')}},
  bench(c,w,h,x,y,s=.3){rect(c,w*(x-s/2),h*y-h*.06,w*s,h*.014,'#6a4a2a');rect(c,w*(x-s/2),h*y-h*.035,w*s,h*.012,'#6a4a2a');rect(c,w*(x-s/2+.02),h*y-h*.035,4,h*.035,'#2a2a2a');rect(c,w*(x+s/2-.02),h*y-h*.035,4,h*.035,'#2a2a2a')},
  umbrella(c,w,h,x,y,r=.2,col='rgba(230,240,255,.4)',edge='rgba(255,255,255,.8)'){c.fillStyle=col;c.beginPath();c.ellipse(w*x,h*y,w*r,h*r*.42,0,Math.PI,0);c.fill();c.strokeStyle=edge;c.lineWidth=2;c.stroke();rect(c,w*x-1,h*y,2,h*r*.9,'#ccc')},
  parasol(c,w,h,x,y,r=.3){for(let i=0;i<6;i++){c.fillStyle=i%2?'#fff':'#e8323a';c.beginPath();c.moveTo(w*x,h*y);c.arc(w*x,h*y,w*r,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6);c.fill()}rect(c,w*x-2,h*y,4,h*.4,'#ddd')},
  bike(c,w,h,x,y,s=.25,col='#2a5bd7'){c.strokeStyle='#222';c.lineWidth=3;const R=s*w*.28;[[-1],[1]].forEach(([k])=>{c.beginPath();c.arc(w*x+k*R*1.3,h*y-R,R,0,TAU);c.stroke()});c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.moveTo(w*x-R*1.3,h*y-R);c.lineTo(w*x,h*y-R);c.lineTo(w*x+R*.6,h*y-R*2.1);c.lineTo(w*x-R*.5,h*y-R*2.1);c.lineTo(w*x-R*1.3,h*y-R);c.moveTo(w*x+R*.6,h*y-R*2.1);c.lineTo(w*x+R*1.3,h*y-R);c.stroke()},
  car(c,w,h,x,y,s=.5,col='#c8452e'){const W=w*s,H=W*.32;rr(c,w*x-W/2,h*y-H,W,H*.65,H*.2,col);rr(c,w*x-W*.3,h*y-H*1.45,W*.55,H*.6,H*.25,col);rr(c,w*x-W*.26,h*y-H*1.35,W*.22,H*.42,4,'#bfe0ff');rr(c,w*x+.0,h*y-H*1.35,W*.2,H*.42,4,'#bfe0ff');circ(c,w*x-W*.3,h*y-H*.3,H*.28,'#1a1a1a');circ(c,w*x+W*.3,h*y-H*.3,H*.28,'#1a1a1a')},
  suitcase(c,w,h,x,y,s=.12,col='#e8b04a'){rr(c,w*x-w*s*.4,h*y-h*s,w*s*.8,h*s,6,col);rect(c,w*x-2,h*y-h*s*1.35,4,h*s*.35,'#555');for(let k=0;k<3;k++)rect(c,w*x-w*s*.3+k*w*s*.25,h*y-h*s,2,h*s,'rgba(0,0,0,.15)')},
  dog(c,w,h,x,y,s=.12,col='#d8a466',d=1){const S=w*s;ell(c,w*x,h*y-S*.45,S*.6,S*.3,col);circ(c,w*x+d*S*.55,h*y-S*.8,S*.28,col);ell(c,w*x+d*S*.45,h*y-S*1.0,S*.1,S*.18,shade(col,-.3),.4*d);circ(c,w*x+d*S*.68,h*y-S*.82,S*.04,'#111');rect(c,w*x-S*.4,h*y-S*.3,S*.1,S*.3,col);rect(c,w*x+S*.3,h*y-S*.3,S*.1,S*.3,col);c.strokeStyle=col;c.lineWidth=S*.08;c.beginPath();c.moveTo(w*x-d*S*.55,h*y-S*.55);c.lineTo(w*x-d*S*.8,h*y-S*.85);c.stroke()},
  cup(c,w,h,x,y,s=.12,col='#f4efe8',drink='#c8a27a'){const W=w*s;c.fillStyle=col;c.beginPath();c.moveTo(w*x-W*.5,h*y-W*1.1);c.lineTo(w*x+W*.5,h*y-W*1.1);c.lineTo(w*x+W*.38,h*y);c.lineTo(w*x-W*.38,h*y);c.closePath();c.fill();ell(c,w*x,h*y-W*1.1,W*.5,W*.12,drink);c.strokeStyle=col;c.lineWidth=W*.12;c.beginPath();c.arc(w*x+W*.55,h*y-W*.6,W*.22,-1.3,1.3);c.stroke()},
  plate(c,w,h,x,y,r=.15,food=['#e8574a','#7fb65a','#f2c14e']){circ(c,w*x,h*y,w*r,'#fff');circ(c,w*x,h*y,w*r*.78,'#f3e6cf');food.forEach((f,i)=>circ(c,w*(x+Math.cos(i*2.1)*r*.35),h*y+Math.sin(i*2.1)*w*r*.35,w*r*.26,f))},
  bouquet(c,w,h,x,y,s=.14){c.strokeStyle='#4f8a3a';c.lineWidth=3;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(w*x,h*y);c.lineTo(w*x+k*w*s*.12,h*y-w*s*.7);c.stroke()}const cols=['#ff6f91','#ffd34d','#fff','#f7a8c4','#c58af9'];for(let k=0;k<9;k++)circ(c,w*x+Math.cos(k*1.3)*w*s*.3,h*y-w*s*.8+Math.sin(k*1.3)*w*s*.2,w*s*.13,cols[k%5]);poly(c,[[w*x-w*s*.15,h*y-w*s*.35],[w*x+w*s*.15,h*y-w*s*.35],[w*x+w*s*.05,h*y+w*s*.1],[w*x-w*s*.05,h*y+w*s*.1]],'#f2e6d8')},
  balloon(c,w,h,x,y,col='#ff4f7b',len=.25){c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;c.beginPath();c.moveTo(w*x,h*y);c.quadraticCurveTo(w*(x+.03),h*(y+len*.5),w*x,h*(y+len));c.stroke();ell(c,w*x,h*y-w*.06,w*.055,w*.07,col);circ(c,w*x-w*.02,h*y-w*.08,w*.012,'rgba(255,255,255,.6)')},
  lanterns(c,w,h,y=.12){c.strokeStyle='#222';c.lineWidth=2;c.beginPath();c.moveTo(0,h*y);for(let k=0;k<=8;k++)c.quadraticCurveTo(w*(k/8-.06),h*(y+.07),w*k/8,h*y);c.stroke();for(let k=0;k<16;k++){glow(c,w*k/15,h*(y+.05),w*.04,'rgba(255,220,140,.9)');circ(c,w*k/15,h*(y+.05),3,'#fff4c8')}},
  boat(c,w,h,x,y,s=.12){poly(c,[[w*(x-s),h*y],[w*(x+s),h*y],[w*(x+s*.7),h*y+w*s*.25],[w*(x-s*.7),h*y+w*s*.25]],'#3a3a44');poly(c,[[w*x,h*y-w*s*1.2],[w*x,h*y-4],[w*(x+s*.75),h*y-4]],'#f7f7f7');rect(c,w*x-1,h*y-w*s*1.2,2,w*s*1.2,'#3a3a44')},
  lighthouse(c,w,h,x,y,s=.4){const W=w*.06;poly(c,[[w*x-W,h*y],[w*x+W,h*y],[w*x+W*.6,h*(y-s)],[w*x-W*.6,h*(y-s)]],'#f4f4f4');for(let k=0;k<3;k++)poly(c,[[w*x-W*(.95-k*.12),h*(y-s*(.15+k*.28))],[w*x+W*(.95-k*.12),h*(y-s*(.15+k*.28))],[w*x+W*(.9-k*.12),h*(y-s*(.25+k*.28))],[w*x-W*(.9-k*.12),h*(y-s*(.25+k*.28))]],'#d23a3a');rect(c,w*x-W*.7,h*(y-s)-W*.9,W*1.4,W*.9,'#333');glow(c,w*x,h*(y-s)-W*.45,w*.1,'rgba(255,240,180,.8)')},
  window(c,w,h,x,y,ww,hh,col='#2a2420'){c.fillStyle=col;c.beginPath();c.rect(0,0,w,h);c.roundRect(w*x,h*y,w*ww,h*hh,w*.03);c.fill('evenodd')},
  arch(c,w,h,col='#3b2a20',m=.15,top=.1){c.fillStyle=col;c.beginPath();c.rect(0,0,w,h);c.moveTo(w*m,h*.95);c.lineTo(w*m,h*.35);c.quadraticCurveTo(w*m,h*top,w*.5,h*top);c.quadraticCurveTo(w*(1-m),h*top,w*(1-m),h*.35);c.lineTo(w*(1-m),h*.95);c.closePath();c.fill('evenodd')},
  rain(c,w,h,n=90,col='rgba(200,220,255,.4)'){c.strokeStyle=col;c.lineWidth=1.2;const r=rnd(5);for(let i=0;i<n;i++){const x=r()*w,y=r()*h;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+14);c.stroke()}},
  petals(c,w,h,n=40,cols=['#f7a8c4','#fbc6d8','#fff']){const r=rnd(19);for(let i=0;i<n;i++)ell(c,r()*w,r()*h,3+r()*3,2+r()*2,cols[i%cols.length],r()*3)},
  stairs(c,w,h,n=12,y0=.35,y1=1,cA='#cfc8b9',cB='#bdb5a6',slope=.14){for(let i=0;i<n;i++){const y=h*(y0+(y1-y0)*i/n);poly(c,[[0,y],[w,y-h*slope],[w,y-h*slope+h*(y1-y0)/n],[0,y+h*(y1-y0)/n]],i%2?cA:cB)}},
  glowAt(c,w,h,x,y,r,col){glow(c,w*x,h*y,w*r,col)},
  rectN(c,w,h,x,y,ww,hh,col){rect(c,w*x,h*y,w*ww,h*hh,col)},
  ellN(c,w,h,x,y,rx,ry,col){ell(c,w*x,h*y,w*rx,h*ry,col)},
  polyN(c,w,h,pts,col){poly(c,pts.map(([x,y])=>[x*w,y*h]),col)},
  vgN(c,w,h,stops,y0,y1){vg(c,w,h,stops,h*y0,h*y1)},
  bokeh(c,w,h,n,seed,cols,y0,y1){bokeh(c,w,h,n,seed,cols,y0,y1)},
  /* 사람 (정규화 좌표) */
  p(c,w,h,x,fy,hh,o){person(c,w*x,h*fy,h*hh,o||{})},
  lie(c,w,h,x,y,hh,o,ang){lying(c,w*x,h*y,h*hh,o||{},ang==null?-Math.PI/2:ang)},
  sil(c,w,h,x,fy,hh,col='#0d0a14',pose){person(c,w*x,h*fy,h*hh,{sil:col,pose})},
  grey(c,w,h){const d=c.getImageData(0,0,c.canvas.width,c.canvas.height);for(let i=0;i<d.data.length;i+=4){const v=.3*d.data[i]+.59*d.data[i+1]+.11*d.data[i+2];d.data[i]=d.data[i+1]=d.data[i+2]=v}c.putImageData(d,0,0)},
  tint(c,w,h,col,a=.2,mode='soft-light'){c.save();c.globalCompositeOperation=mode;c.globalAlpha=a;rect(c,0,0,w,h,col);c.restore()},
  blurBand(c,w,h,x,y,ww,hh,col){c.save();c.filter='blur(8px)';rect(c,w*x,h*y,w*ww,h*hh,col);c.restore()},
};

/* ---------- 가이드 그리기 도구 ---------- */
const GRN='rgba(120,255,170,.95)',RED='rgba(255,120,120,.95)';
function G(c,W,H,col,lw,sample){
  const g={c,W,H,col,lw,sample};
  g.L=(x1,y1,x2,y2,a)=>{c.save();if(a!=null)c.globalAlpha=a;c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke();c.restore()};
  g.D=on=>c.setLineDash(on?[lw*4,lw*3]:[]);
  g.dot=(x,y,r)=>{c.beginPath();c.arc(x*W,y*H,r||lw*3.2,0,TAU);c.fill()};
  g.ring=(x,y,r)=>{c.beginPath();c.arc(x*W,y*H,r*Math.min(W,H),0,TAU);c.stroke();g.dot(x,y)};
  g.T=(t,x,y,cl,al)=>{if(!sample)y=Math.min(Math.max(y,.17),.9);c.save();c.font=`800 ${Math.max(11,W/25)}px Pretendard,sans-serif`;c.textAlign=al||'start';c.fillStyle=cl==='g'?GRN:cl==='r'?RED:(cl||col);c.fillText(t,x*W,y*H);c.restore()};
  g.R=(x,y,w,h)=>c.strokeRect(x*W,y*H,w*W,h*H);
  g.E=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x*W,y*H,rx*W,ry*H,0,0,TAU);c.stroke()};
  g.thirds=(a=.28)=>{[1/3,2/3].forEach(t=>{g.L(t,0,t,1,a);g.L(0,t,1,t,a)})};
  g.P=(x,fy,h,o={})=>{if(sample)return;const t=document.createElement('canvas');t.width=W;t.height=H;person(t.getContext('2d'),x*W,fy*H,h*H,Object.assign({},o,{ghost:col}));c.save();c.globalAlpha=.4;c.shadowBlur=0;c.drawImage(t,0,0);c.restore()};
  g.A=(x1,y1,x2,y2,cl)=>{c.save();if(cl){const k=cl==='g'?GRN:cl;c.strokeStyle=k;c.fillStyle=k}c.beginPath();c.moveTo(x1*W,y1*H);c.lineTo(x2*W,y2*H);c.stroke();const a=Math.atan2((y2-y1)*H,(x2-x1)*W),k=lw*5;
    c.beginPath();c.moveTo(x2*W,y2*H);c.lineTo(x2*W-k*Math.cos(a-.5),y2*H-k*Math.sin(a-.5));c.moveTo(x2*W,y2*H);c.lineTo(x2*W-k*Math.cos(a+.5),y2*H-k*Math.sin(a+.5));c.stroke();c.restore()};
  g.shade=(x,y,w,h,a=.22)=>{c.save();c.globalAlpha=a;c.fillRect(x*W,y*H,w*W,h*H);c.restore()};
  g.Q=(pts)=>{c.beginPath();c.moveTo(pts[0]*W,pts[1]*H);for(let i=2;i<pts.length;i+=4)c.quadraticCurveTo(pts[i]*W,pts[i+1]*H,pts[i+2]*W,pts[i+3]*H);c.stroke()};
  return g;
}
/* 선언형 장면/가이드 실행 */
function runScene(list,c,w,h){list.forEach(op=>{const f=ops[op[0]];if(f)f(c,w,h,...op.slice(1))})}
function runGuide(list,g){list.forEach(op=>{const n=op[0],a=op.slice(1);if(n==='thirds')g.thirds(a[0]);else if(n==='D')g.D(a[0]);else if(g[n])g[n](...a)})}

window.KIT={setPStyle:(v,c)=>{PSTYLE=v;if(c)SILC=c},getPStyle:()=>PSTYLE,TAU,lg,vg,circ,ell,poly,rect,rr,glow,rnd,shade,bokeh,person,lying,post,ops,G,GRN,RED,runScene,runGuide,SKY,POSES};
})();
