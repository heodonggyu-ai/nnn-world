/* NNN 공포게임 공용 엔진 (위에서 내려다보는 2D, 손전등 조명, 숨기, 괴물 길찾기)
   Retro 엔진 위에서 쓴다. window.Horror */
(function(){
const TS=16;
const FL={'.':0,',':1,':':2,';':3,'_':4,'"':5,'~':6,'=':7};
const FLOOR=[
  {a:'#6e4c30',b:'#634329',ln:'#4d331f'},   /* 0 나무 */
  {a:'#5f6973',b:'#56606a',ln:'#4a525b'},   /* 1 타일 */
  {a:'#5b2f3c',b:'#542b37',ln:'#47232e'},   /* 2 카펫 */
  {a:'#2f5480',b:'#2a4c75',ln:'#213c5d'},   /* 3 매트 */
  {a:'#4c4c50',b:'#47474b',ln:'#3c3c40'},   /* 4 콘크리트 */
  {a:'#2f5f2c',b:'#2b5829',ln:'#244a22'},   /* 5 잔디 */
  {a:'#6a5236',b:'#634c32',ln:'#54402a'},   /* 6 흙 */
  {a:'#3d3550',b:'#383049',ln:'#2e283d'},   /* 7 어두운 복도 */
];
const WALL={brick:{top:'#241f2d',face:'#4a3d55',ln:'#3a2f44'},concrete:{top:'#25272b',face:'#50545b',ln:'#42454b'},hedge:{top:'#16331a',face:'#245a2a',ln:'#1b4520'},wood:{top:'#2a1d14',face:'#5a3f2a',ln:'#46301f'}};
const SOLID={locker:1,wardrobe:1,bed:1,box:1,table:1,shelf:1,sofa:1,plant:1,drawer:1,bag:1,gen:1,fusebox:1,piano:1,car:1,crate:1,tree:1,ring:1,bench:1,machine:1};
const HIDE={locker:'사물함',wardrobe:'옷장',bed:'침대 밑',box:'상자'};

function fromAscii(rows,opt){opt=opt||{};
  const h=rows.length,w=Math.max(...rows.map(r=>r.length));
  const M={w,h,t:new Uint8Array(w*h),f:new Uint8Array(w*h),blk:new Uint8Array(w*h),pid:new Int16Array(w*h).fill(-1),wallStyle:opt.wallStyle||'brick',props:[],marks:{},lamps:[]};
  const def=opt.floor||0;
  const get=(x,y)=>(rows[y]&&rows[y][x])||' ';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=get(x,y),i=y*w+x;
    if(ch==='#'||ch===' '){M.t[i]=1;continue}
    if(ch in FL){M.f[i]=FL[ch];continue}
    let f=def;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-2,0],[2,0]]){const c=get(x+dx,y+dy);if(c in FL){f=FL[c];break}}M.f[i]=f;
    (M.marks[ch]=M.marks[ch]||[]).push([x,y])}
  return M}
function blank(w,h,opt){const rows=[];for(let y=0;y<h;y++)rows.push(' '.repeat(w));const M=fromAscii(rows,opt);return M}
function idx(M,x,y){return y*M.w+x}
function isWall(M,tx,ty){if(tx<0||ty<0||tx>=M.w||ty>=M.h)return true;return M.t[ty*M.w+tx]===1}
function blocked(M,tx,ty){if(tx<0||ty<0||tx>=M.w||ty>=M.h)return true;const i=ty*M.w+tx;return M.t[i]===1||M.blk[i]===1}
function addProp(M,p){p.id=M.props.length;M.props.push(p);if(p.solid==null)p.solid=!!SOLID[p.type]||(p.type==='door'&&!p.open)||(p.type==='exit'&&!p.open);
  if(p.hide==null)p.hide=HIDE[p.type]||null;M.pid[idx(M,p.x,p.y)]=p.id;refresh(M,p);
  if(p.type==='door'||p.type==='exit'){p.vert=isWall(M,p.x,p.y-1)&&isWall(M,p.x,p.y+1)}
  return p}
function refresh(M,p){M.blk[idx(M,p.x,p.y)]=(p.solid&&!p.gone)?1:0}
function setDoor(M,p,open){p.open=open;p.solid=!open;refresh(M,p)}
function propAt(M,tx,ty){if(tx<0||ty<0||tx>=M.w||ty>=M.h)return null;const id=M.pid[ty*M.w+tx];return id>=0?M.props[id]:null}

/* ---------- 이동·충돌 ---------- */
function canAt(M,x,y,r){const x0=Math.floor((x-r)/TS),x1=Math.floor((x+r)/TS),y0=Math.floor((y-r)/TS),y1=Math.floor((y+r)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(blocked(M,tx,ty))return false;return true}
function move(M,e,dx,dy){let moved=0;
  if(dx){const nx=e.x+dx;if(canAt(M,nx,e.y,e.r)){e.x=nx;moved=1}else if(!dy){const ty=Math.floor(e.y/TS);for(const cy of [ty*TS+TS/2,(ty-1)*TS+TS/2,(ty+1)*TS+TS/2]){const off=cy-e.y;if(Math.abs(off)<9&&canAt(M,nx,cy,e.r)&&canAt(M,e.x,e.y+Math.sign(off)*Math.min(Math.abs(off),Math.abs(dx)),e.r)){e.y+=Math.sign(off)*Math.min(Math.abs(off),Math.abs(dx));moved=1;break}}}}
  if(dy){const ny=e.y+dy;if(canAt(M,e.x,ny,e.r)){e.y=ny;moved=1}else if(!dx){const tx=Math.floor(e.x/TS);for(const cx of [tx*TS+TS/2,(tx-1)*TS+TS/2,(tx+1)*TS+TS/2]){const off=cx-e.x;if(Math.abs(off)<9&&canAt(M,cx,ny,e.r)&&canAt(M,e.x+Math.sign(off)*Math.min(Math.abs(off),Math.abs(dy)),e.y,e.r)){e.x+=Math.sign(off)*Math.min(Math.abs(off),Math.abs(dy));moved=1;break}}}}
  return moved}

/* ---------- 시야 ---------- */
function los(M,x1,y1,x2,y2,seeThroughDoors){const d=Math.hypot(x2-x1,y2-y1),n=Math.ceil(d/4);
  for(let i=1;i<n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n;const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(isWall(M,tx,ty))return false;
    const p=propAt(M,tx,ty);if(p&&p.type==='door'&&!p.open&&!seeThroughDoors)return false}
  return true}

/* ---------- 길찾기 (목표 기준 거리장) ---------- */
function passable(M,tx,ty,opt){if(isWall(M,tx,ty))return false;const i=ty*M.w+tx;if(!M.blk[i])return true;const p=M.pid[i]>=0?M.props[M.pid[i]]:null;
  if(p&&p.type==='door'&&(opt&&opt.doors)&&!(p.locked&&!opt.locked))return true;return false}
function flow(M,tx,ty,opt){const D=new Int16Array(M.w*M.h).fill(-1);if(tx<0||ty<0||tx>=M.w||ty>=M.h)return D;
  const q=new Int32Array(M.w*M.h);let h=0,t=0;const s=ty*M.w+tx;D[s]=0;q[t++]=s;
  while(h<t){const c=q[h++],cx=c%M.w,cy=(c/M.w)|0,cd=D[c];if(opt&&opt.max&&cd>=opt.max)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=M.w||ny>=M.h)continue;const n=ny*M.w+nx;if(D[n]>=0)continue;if(!passable(M,nx,ny,opt))continue;D[n]=cd+1;q[t++]=n}}
  return D}
/* 거리장을 따라 한 걸음 (부드럽게) */
function follow(M,e,D,speed,dt,opt){const tx=Math.floor(e.x/TS),ty=Math.floor(e.y/TS);const cur=D[ty*M.w+tx];
  if(cur<0)return false;let best=null,bd=cur;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=M.w||ny>=M.h)continue;const d=D[ny*M.w+nx];if(d<0)continue;
    if(dx&&dy){if(D[ty*M.w+nx]<0||D[ny*M.w+tx]<0)continue}
    const dd=d+(dx&&dy?.4:0);if(dd<bd||(best===null&&d<cur)){if(dd<bd){bd=dd;best=[nx,ny]}}}
  let gx,gy;if(cur===0||!best){return 'arrived'}gx=best[0]*TS+TS/2;gy=best[1]*TS+TS/2;
  const vx=gx-e.x,vy=gy-e.y,l=Math.hypot(vx,vy)||1;const st=Math.min(l,speed*dt);
  const ox=e.x,oy=e.y;e.x+=vx/l*st;e.y+=vy/l*st;e.face=Math.atan2(vy,vx);
  /* 문 열기 */
  if(opt&&opt.doors){const p=propAt(M,best[0],best[1]);if(p&&p.type==='door'&&!p.open&&!p.locked){setDoor(M,p,true);p.slam=.3;if(opt.onDoor)opt.onDoor(p)}}
  return true}
/* 랜덤 목적지 (도달 가능한 바닥) */
function randomFloor(M,near,rad,opt){for(let k=0;k<80;k++){let x,y;if(near){x=Math.floor(near.x/TS)+Math.round((Math.random()*2-1)*rad);y=Math.floor(near.y/TS)+Math.round((Math.random()*2-1)*rad)}else{x=(Math.random()*M.w)|0;y=(Math.random()*M.h)|0}
    if(x>0&&y>0&&x<M.w&&y<M.h&&!blocked(M,x,y))return[x,y]}return null}

/* ---------- 조명 ---------- */
function rayPoly(M,x,y,a0,a1,R,n,opt){const pts=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;const cx=Math.cos(a),cy=Math.sin(a);let d=0;
    for(d=3;d<R;d+=3){const px=x+cx*d,py=y+cy*d;const tx=Math.floor(px/TS),ty=Math.floor(py/TS);if(isWall(M,tx,ty)){d+=2;break}const p=propAt(M,tx,ty);if(p&&p.type==='door'&&!p.open&&!(opt&&opt.doors)){d+=1;break}}
    pts.push([x+cx*Math.min(d,R),y+cy*Math.min(d,R)])}return pts}
let LC=null,LX=null;
function lightLayer(W,H){if(!LC||LC.width!==W||LC.height!==H){LC=document.createElement('canvas');LC.width=W;LC.height=H;LX=LC.getContext('2d')}return LX}

/* ---------- 그리기 ---------- */
function H_rr(c,x,y,w,h,r){rr(c,x,y,w,h,r)}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function hash(x,y){let h=x*374761393+y*668265263;h=(h^(h>>13))*1274126177;return ((h^(h>>16))>>>0)/4294967295}
function drawMap(c,M,cam,W,H,t){const x0=Math.max(0,Math.floor(cam.x/TS)),y0=Math.max(0,Math.floor(cam.y/TS)),x1=Math.min(M.w-1,Math.ceil((cam.x+W)/TS)),y1=Math.min(M.h-1,Math.ceil((cam.y+H)/TS)+1);
  const WS=WALL[M.wallStyle]||WALL.brick;
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const i=ty*M.w+tx,X=tx*TS-cam.x,Y=ty*TS-cam.y;
    if(M.t[i]===1){c.fillStyle=WS.top;c.fillRect(X,Y,TS,TS);
      if(ty+1<M.h&&M.t[i+M.w]!==1){c.fillStyle=WS.face;c.fillRect(X,Y+TS-7,TS,7);c.fillStyle=WS.ln;
        if(M.wallStyle==='hedge'){for(let k=0;k<4;k++)c.fillRect(X+k*4+1,Y+TS-6+(k%2),2,2)}else{c.fillRect(X,Y+TS-4,TS,1);c.fillRect(X+((tx%2)?4:11),Y+TS-7,1,3);c.fillRect(X+((tx%2)?10:2),Y+TS-3,1,3)}
        c.fillStyle='rgba(0,0,0,.35)';c.fillRect(X,Y+TS,TS,3)}
      continue}
    const F=FLOOR[M.f[i]]||FLOOR[0];c.fillStyle=((tx+ty)&1)&&M.f[i]===1?F.b:F.a;c.fillRect(X,Y,TS,TS);c.fillStyle=F.ln;
    const f=M.f[i];
    if(f===0){c.fillRect(X,Y+((tx%2)?5:11),TS,1);c.fillRect(X+(ty%2?6:12),Y,1,TS)}
    else if(f===1||f===4){c.fillRect(X,Y,TS,1);c.fillRect(X,Y,1,TS)}
    else if(f===3){if(tx%3===0)c.fillRect(X,Y,1,TS);if(ty%3===0)c.fillRect(X,Y,TS,1)}
    else if(f===5){const r=hash(tx,ty);if(r<.5){c.fillRect(X+r*24%14,Y+r*40%13,1,2);c.fillRect(X+r*60%14,Y+r*90%13,1,2)}}
    else if(f===6){const r=hash(tx,ty);if(r<.4)c.fillRect(X+r*30%14,Y+r*70%14,2,1)}
    else if(f===2){if((tx+ty)%2===0)c.fillRect(X+7,Y+7,2,2)}
    if(ty>0&&M.t[i-M.w]===1){c.fillStyle='rgba(0,0,0,.28)';c.fillRect(X,Y,TS,4)}}}

function drawProp(c,p,X,Y,t){const s=TS;
  switch(p.type){
  case 'locker':c.fillStyle='#3d5a78';rr(c,X+2,Y-6,12,21,1.5);c.fill();c.fillStyle='#507396';c.fillRect(X+3,Y-5,10,3);c.fillStyle='#22364b';for(let k=0;k<3;k++)c.fillRect(X+4,Y-1+k*2,8,1);c.fillStyle='#c9d4de';c.fillRect(X+11,Y+6,1.5,3);if(p.occ){c.fillStyle='rgba(255,255,255,.6)';c.fillRect(X+5,Y-1,1,1)}break;
  case 'wardrobe':c.fillStyle='#5a3a22';rr(c,X+1,Y-7,14,22,1.5);c.fill();c.fillStyle='#6d4829';c.fillRect(X+2,Y-6,5.5,19);c.fillRect(X+8.5,Y-6,5.5,19);c.fillStyle='#e3c27a';c.fillRect(X+6.5,Y+3,1,2);c.fillRect(X+8.8,Y+3,1,2);break;
  case 'bed':c.fillStyle='#3a2c22';c.fillRect(X+1,Y-2,14,17);c.fillStyle='#c94c5e';c.fillRect(X+2,Y+3,12,11);c.fillStyle='#e8e2d6';rr(c,X+3,Y-1,10,4,1.5);c.fill();c.fillStyle='rgba(0,0,0,.4)';c.fillRect(X+1,Y+14,14,2);break;
  case 'box':c.fillStyle='#a07a48';c.fillRect(X+1,Y-1,14,15);c.fillStyle='#b88d55';c.fillRect(X+1,Y-1,14,5);c.fillStyle='#7d5d33';c.fillRect(X+7,Y-1,2,5);c.fillStyle='#d9c08f';c.fillRect(X+3,Y+7,6,3);break;
  case 'crate':c.fillStyle='#7a5a36';c.fillRect(X+1,Y-1,14,15);c.strokeStyle='#5a4024';c.lineWidth=1.2;c.strokeRect(X+1.5,Y-.5,13,14);c.beginPath();c.moveTo(X+2,Y);c.lineTo(X+14,Y+13);c.stroke();break;
  case 'table':c.fillStyle='#4a3020';c.fillRect(X+2,Y+9,2,5);c.fillRect(X+12,Y+9,2,5);c.fillStyle='#8a6038';c.fillRect(X,Y+1,16,9);c.fillStyle='#a07246';c.fillRect(X,Y+1,16,2);break;
  case 'bench':c.fillStyle='#6d4a2a';c.fillRect(X,Y+5,16,5);c.fillStyle='#3a3a3a';c.fillRect(X+2,Y+10,2,4);c.fillRect(X+12,Y+10,2,4);break;
  case 'shelf':c.fillStyle='#4a3324';c.fillRect(X+1,Y-6,14,20);for(let k=0;k<3;k++){c.fillStyle='#2e2016';c.fillRect(X+2,Y-4+k*6,12,4);const cols=['#c0392b','#2e86c1','#f1c40f','#27ae60'];for(let j=0;j<4;j++){c.fillStyle=cols[(j+k+p.x)%4];c.fillRect(X+3+j*3,Y-4+k*6+(j%2),2,4-(j%2))}}break;
  case 'sofa':c.fillStyle='#4d6b3a';rr(c,X,Y,16,13,3);c.fill();c.fillStyle='#5e8048';c.fillRect(X+2,Y+4,12,7);break;
  case 'plant':c.fillStyle='#7a4a2a';c.fillRect(X+5,Y+8,6,6);c.fillStyle='#2e7d32';for(const [a,b] of [[8,2],[4,5],[12,5],[6,0],[10,1]]){c.beginPath();c.arc(X+a,Y+b+2,3.2,0,7);c.fill()}break;
  case 'drawer':c.fillStyle='#6b4a30';c.fillRect(X+1,Y-1,14,15);c.fillStyle='#7d5838';c.fillRect(X+2,Y+1,12,5);c.fillRect(X+2,Y+7,12,5);c.fillStyle=p.searched?'#5a4030':'#e3c27a';c.fillRect(X+7,Y+3,2,1);c.fillRect(X+7,Y+9,2,1);if(p.open){c.fillStyle='#2a1c12';c.fillRect(X+2,Y+12,12,3)}break;
  case 'bag':c.fillStyle='#555';c.fillRect(X+7.5,Y-8,1,5);c.fillStyle=p.col||'#b23b2e';rr(c,X+3,Y-4,10,17,4);c.fill();c.fillStyle='rgba(255,255,255,.15)';c.fillRect(X+4,Y-2,2,12);c.fillStyle='#222';c.fillRect(X+3,Y+2,10,1.5);c.fillRect(X+3,Y+8,10,1.5);break;
  case 'piano':c.fillStyle='#1a1a1a';c.fillRect(X,Y-2,16,16);c.fillStyle='#eee';c.fillRect(X+1,Y+8,14,4);c.fillStyle='#111';for(let k=0;k<5;k++)c.fillRect(X+2+k*3,Y+8,1,2.5);break;
  case 'machine':c.fillStyle='#3b3f46';c.fillRect(X+1,Y-4,14,18);c.fillStyle='#1d6fa8';c.fillRect(X+3,Y-2,10,6);c.fillStyle='#e74c3c';c.fillRect(X+4,Y+7,2,2);c.fillStyle='#2ecc71';c.fillRect(X+8,Y+7,2,2);break;
  case 'tree':c.fillStyle='#4a3020';c.fillRect(X+6,Y+6,4,8);c.fillStyle='#1d4a1f';c.beginPath();c.arc(X+8,Y+2,9,0,7);c.fill();c.fillStyle='#24602a';c.beginPath();c.arc(X+6,Y,5,0,7);c.fill();break;
  case 'car':c.fillStyle='#2b4a7a';rr(c,X-2,Y-1,20,16,4);c.fill();c.fillStyle='#89b6e0';c.fillRect(X+1,Y+2,14,4);c.fillStyle='#111';c.fillRect(X-2,Y+12,4,3);c.fillRect(X+14,Y+12,4,3);break;
  case 'ring':c.fillStyle='#244a8a';c.fillRect(X,Y,16,16);c.fillStyle='#e8312a';c.fillRect(X,Y+2,16,1.5);c.fillRect(X,Y+7,16,1.5);c.fillRect(X,Y+12,16,1.5);break;
  case 'fusebox':c.fillStyle='#5b6168';c.fillRect(X+2,Y-4,12,16);c.fillStyle='#2a2e33';c.fillRect(X+4,Y-2,8,9);for(let k=0;k<(p.max||3);k++){c.fillStyle=k<(p.n||0)?'#ffd23f':'#111';c.fillRect(X+5+k*2.5,Y,1.6,5)}c.fillStyle=p.on?'#2ecc71':(t*3|0)%2?'#e74c3c':'#5a1a14';c.fillRect(X+7,Y+9,2,2);break;
  case 'gen':{const pr=p.prog||0;c.fillStyle='#4b5157';rr(c,X,Y-3,16,17,2);c.fill();c.fillStyle='#363b40';c.fillRect(X+2,Y-1,12,6);c.fillStyle=p.done?'#2ecc71':'#e67e22';c.fillRect(X+2,Y+7,12*pr,3);c.strokeStyle='#222';c.strokeRect(X+2,Y+7,12,3);
    if(p.done){c.fillStyle='rgba(255,240,150,.9)';c.fillRect(X+6,Y,4,3)}else if(pr>0&&(t*8|0)%2){c.fillStyle='#ffd23f';c.fillRect(X+3+((t*40)%9),Y+1,2,2)}break}
  case 'door':{if(p.vert){if(p.open){c.fillStyle='#2a1a10';c.fillRect(X+3,Y-6,10,TS+6);c.fillStyle='#5a3a22';c.fillRect(X+1,Y-6,3,TS+6)}else{c.fillStyle='#3a2616';c.fillRect(X+2,Y-7,12,TS+7);c.fillStyle=p.locked?'#7d3434':'#8c6038';c.fillRect(X+3,Y-6,10,TS+5);c.fillStyle=p.locked?'#6b2a2a':'#7a5230';c.fillRect(X+4,Y-4,8,5);c.fillRect(X+4,Y+3,8,6);c.fillStyle='#e3c27a';c.fillRect(X+11,Y+1,1.5,2);if(p.locked){c.fillStyle='#ffd23f';c.fillRect(X+6,Y+1,4,4)}}
      if(p.num!=null&&!p.open){c.fillStyle='#e8dcc0';H_rr(c,X+1,Y-15,14,7,1);c.fill();c.fillStyle='#2a1c12';c.font='bold 5.5px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(p.num).padStart(3,'0'),X+8,Y-11.3)}}
    else{if(p.open){c.fillStyle='#3a2616';c.fillRect(X,Y,TS,TS);c.fillStyle='#5a3a22';c.fillRect(X,Y,3,TS)}else{c.fillStyle=p.locked?'#6b2a2a':'#7a5230';c.fillRect(X,Y-6,TS,TS+6);c.fillStyle=p.locked?'#7d3434':'#8c6038';c.fillRect(X+2,Y-4,TS-4,TS+2);c.fillStyle='#e3c27a';c.beginPath();c.arc(X+12,Y+4,1.3,0,7);c.fill();if(p.locked){c.fillStyle='#ffd23f';c.fillRect(X+6,Y+2,4,4);c.fillStyle='#6b2a2a';c.fillRect(X+7.5,Y+3.5,1,1.5)}}
      if(p.num!=null){c.fillStyle='#e8dcc0';rr(c,X+3,Y-13,10,7,1);c.fill();c.fillStyle='#2a1c12';c.font='bold 5.5px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(p.num).padStart(3,'0'),X+8,Y-9.3)}}break}
  case 'exit':{c.fillStyle=p.open?'#1e4d2b':'#3a1d1d';c.fillRect(X-2,Y-6,20,22);c.fillStyle=p.open?'#2ecc71':'#c0392b';c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(p.open?'출구':'잠김',X+8,Y-1);
    if(!p.open){c.fillStyle='#5c3a3a';c.fillRect(X,Y+3,16,11)}else{c.fillStyle='rgba(120,255,160,.35)';c.fillRect(X,Y+3,16,11)}break}
  case 'item':{const b=Math.sin(t*4+p.x)*1.5;c.fillStyle='rgba(255,230,120,.25)';c.beginPath();c.arc(X+8,Y+9,6,0,7);c.fill();icon(c,p.kind,X+8,Y+7+b,1);break}
  case 'note':{c.fillStyle='#f3e9c6';c.save();c.translate(X+8,Y+8);c.rotate(.2);c.fillRect(-4,-5,8,10);c.fillStyle='#8a7a5a';for(let k=0;k<3;k++)c.fillRect(-3,-3+k*3,6,.8);c.restore();break}
  default:if(p.draw)p.draw(c,p,X,Y,t)}}

/* 아이템 아이콘 (중심 x,y) */
function icon(c,k,x,y,s){s=s||1;c.save();c.translate(x,y);c.scale(s,s);
  switch(k){
  case 'key':c.fillStyle='#ffd23f';c.beginPath();c.arc(-3,0,2.8,0,7);c.fill();c.fillRect(-1,-.8,7,1.6);c.fillRect(3,0,1.3,2.5);c.fillRect(5,0,1.3,2);c.fillStyle='#7a5a10';c.beginPath();c.arc(-3,0,1.1,0,7);c.fill();break;
  case 'redkey':case 'bluekey':c.fillStyle=k==='redkey'?'#ff5a4f':'#4fa3ff';c.beginPath();c.arc(-3,0,2.8,0,7);c.fill();c.fillRect(-1,-.8,7,1.6);c.fillRect(3,0,1.3,2.5);c.fillRect(5,0,1.3,2);c.fillStyle='#222';c.beginPath();c.arc(-3,0,1.1,0,7);c.fill();break;
  case 'battery':c.fillStyle='#2ecc71';c.fillRect(-4,-2.5,7,5);c.fillStyle='#ddd';c.fillRect(3,-1.2,1.5,2.4);c.fillStyle='#145a32';c.fillRect(-3,-1.5,2,3);break;
  case 'band':c.save();c.rotate(-.5);c.fillStyle='#f5cfa0';rr(c,-5,-2,10,4,2);c.fill();c.fillStyle='#e8b07a';c.fillRect(-1.5,-2,3,4);c.restore();break;
  case 'coin':c.fillStyle='#ffd23f';c.beginPath();c.arc(0,0,3.2,0,7);c.fill();c.fillStyle='#c79a10';c.fillRect(-.6,-2,1.2,4);break;
  case 'fuse':c.fillStyle='#ffd23f';c.fillRect(-1.5,-4,3,8);c.fillStyle='#e67e22';c.fillRect(-2.5,-4.5,5,2);c.fillRect(-2.5,2.5,5,2);break;
  case 'hammer':c.save();c.rotate(-.6);c.fillStyle='#8a5a2a';c.fillRect(-.8,-2,1.6,8);c.fillStyle='#9aa3ad';c.fillRect(-3.5,-4,7,3);c.restore();break;
  case 'card':c.fillStyle='#4fa3ff';rr(c,-4,-3,8,6,1);c.fill();c.fillStyle='#fff';c.fillRect(-3,-1.5,3,1);c.fillStyle='#ffd23f';c.fillRect(1,0,2,2);break;
  case 'tool':c.save();c.rotate(.6);c.fillStyle='#9aa3ad';c.fillRect(-.8,-4,1.6,8);c.beginPath();c.arc(0,-4,2.2,0,7);c.fill();c.fillStyle='#e74c3c';c.fillRect(-1.2,1,2.4,3.5);c.restore();break;
  case 'gear':c.fillStyle='#c0c6cc';for(let i=0;i<6;i++){c.save();c.rotate(i*1.047);c.fillRect(-1,-4,2,2);c.restore()}c.beginPath();c.arc(0,0,2.8,0,7);c.fill();c.fillStyle='#555';c.beginPath();c.arc(0,0,1,0,7);c.fill();break;
  case 'book':c.fillStyle='#8e44ad';c.fillRect(-3.5,-4,7,8);c.fillStyle='#f3e9c6';c.fillRect(2.5,-3.5,1,7);c.fillStyle='#ffd23f';c.fillRect(-2,-1,4,1);break;
  case 'candy':c.fillStyle='#ff7aa8';c.beginPath();c.arc(0,0,2.5,0,7);c.fill();c.beginPath();c.moveTo(-2,0);c.lineTo(-5,-2);c.lineTo(-5,2);c.fill();c.beginPath();c.moveTo(2,0);c.lineTo(5,-2);c.lineTo(5,2);c.fill();break;
  case 'plank':c.fillStyle='#b07a3a';c.fillRect(-5,-1.5,10,3);break;
  default:c.fillStyle='#fff';c.beginPath();c.arc(0,0,2.5,0,7);c.fill()}
  c.restore()}

/* 아이(플레이어·친구) 그리기 */
function drawKid(c,e,X,Y,t,o){o=o||{};const mv=e.moving?Math.sin(t*16)*1.4:0;const f=e.face||0;const fx=Math.cos(f);
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(X,Y+5,5.5,2.2,0,0,7);c.fill();
  if(e.down){c.save();c.translate(X,Y+2);c.rotate(1.4);c.fillStyle=o.shirt||'#e8312a';rr(c,-4,-3,8,9,2);c.fill();c.fillStyle='#f2c79a';c.beginPath();c.arc(0,-5,3.6,0,7);c.fill();c.restore();return}
  c.fillStyle='#2a2a3a';c.fillRect(X-3,Y+1+mv*.5,2,4);c.fillRect(X+1,Y+1-mv*.5,2,4);
  c.fillStyle=o.shirt||'#e8312a';rr(c,-0+X-4,Y-4,8,7,2);c.fill();
  c.fillStyle='#f2c79a';c.beginPath();c.arc(X,Y-7,4.2,0,7);c.fill();
  c.fillStyle=o.hair||'#2a1a10';c.beginPath();c.arc(X,Y-8.2,4.3,Math.PI*1.05,Math.PI*1.95);c.fill();if(o.long){c.fillRect(X-4.3,Y-8,1.6,6);c.fillRect(X+2.7,Y-8,1.6,6)}
  const s=Math.sin(f)>-.3;if(s){c.fillStyle='#111';c.fillRect(X-2+fx*1.2,Y-7,1.2,1.4);c.fillRect(X+1+fx*1.2,Y-7,1.2,1.4)}
  if(o.glove){c.fillStyle='#e8312a';c.beginPath();c.arc(X+fx*5,Y-1+Math.sin(f)*3,2,0,7);c.fill()}
  if(o.tag){c.fillStyle='rgba(0,0,0,.5)';c.font='5px sans-serif';const w=c.measureText(o.tag).width+4;c.fillRect(X-w/2,Y-19,w,7);c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(o.tag,X,Y-15.3)}}

/* ---------- 월드 ---------- */
function world(M,opt){opt=opt||{};return{M,cam:{x:0,y:0},ents:[],dark:opt.dark!=null?opt.dark:.9,lights:[],fx:[],shake:0,flash:0,
  flash_col:'#fff',scare:null,t:0}}
function addLight(W,x,y,r,o){o=o||{};const L={x,y,r,col:o.col||'255,230,170',a:o.a!=null?o.a:1,flick:o.flick||0,on:true,poly:rayPoly(W.M,x,y,0,Math.PI*2,r,40,{doors:false})};W.lights.push(L);return L}
function relight(W){for(const L of W.lights)L.poly=rayPoly(W.M,L.x,L.y,0,Math.PI*2,L.r,40)}
function camFollow(W,x,y,VW,VH,dt){const tx=x-VW/2,ty=y-VH/2-8;W.cam.x+=(tx-W.cam.x)*Math.min(1,dt*8);W.cam.y+=(ty-W.cam.y)*Math.min(1,dt*8);
  W.cam.x=Math.max(-8,Math.min(W.M.w*TS-VW+8,W.cam.x));W.cam.y=Math.max(-16,Math.min(W.M.h*TS-VH+8,W.cam.y))}

/* 플레이어 입력 이동: 반환 소리 크기(타일) */
function playerMove(W,G,p,dt,o){const k=G.keys;let dx=(k.right?1:0)-(k.left?1:0),dy=(k.down?1:0)-(k.up?1:0);
  const run=(o.runKey?k[o.runKey]:k.b)&&p.stam>0&&(dx||dy);let sp=run?o.run:o.walk;if(p.slow)sp*=p.slow;
  p.moving=!!(dx||dy);if(dx&&dy){dx*=.7071;dy*=.7071}
  if(p.moving){p.face=Math.atan2(dy,dx);move(W.M,p,dx*sp*dt,dy*sp*dt);p.stepT=(p.stepT||0)+dt*(run?2.2:1.2);if(p.stepT>.33){p.stepT=0;if(o.steps!==false)G.sfx('tick')}}
  if(run){p.stam=Math.max(0,p.stam-dt*(o.drain||.28));p.tired=p.stam<=0?1.2:0}else{p.stam=Math.min(1,p.stam+dt*(o.regen||.18))}
  if(p.tired){p.tired-=dt;if(p.tired<0)p.tired=0}
  return !p.moving?0:run?(o.runNoise||7):(o.walkNoise||2.5)}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function tileOf(e){return[Math.floor(e.x/TS),Math.floor(e.y/TS)]}
/* 플레이어 앞 상호작용 대상 */
function nearProp(W,p,filter,range){range=range||20;let best=null,bd=1e9;for(const q of W.M.props){if(q.gone)continue;if(filter&&!filter(q))continue;const cx=q.x*TS+TS/2,cy=q.y*TS+TS/2;const d=Math.hypot(cx-p.x,cy-p.y);
    if(d<range&&d<bd){bd=d;best=q}}return best}

/* 전체 그리기 */
function render(G,c,W,o){o=o||{};const VW=G.W,VH=G.H;const cam={x:Math.round(W.cam.x+(W.shake?(Math.random()-.5)*W.shake*6:0)),y:Math.round(W.cam.y+(W.shake?(Math.random()-.5)*W.shake*6:0))};
  c.fillStyle='#07060c';c.fillRect(0,0,VW,VH);
  drawMap(c,W.M,cam,VW,VH,G.t);
  /* 바닥 자국 */
  if(o.under)o.under(c,cam);
  /* 정렬된 물체 */
  const list=[];for(const p of W.M.props){if(p.gone)continue;const X=p.x*TS-cam.x,Y=p.y*TS-cam.y;if(X<-24||Y<-30||X>VW+24||Y>VH+24)continue;list.push({y:p.y*TS+(p.type==='door'&&!p.vert?-4:TS-2),f:()=>drawProp(c,p,X,Y,G.t)})}
  for(const e of W.ents){if(e.hidden&&!e.showHidden)continue;const X=e.x-cam.x,Y=e.y-cam.y;if(X<-40||Y<-50||X>VW+40||Y>VH+40)continue;list.push({y:e.y+(e.zy||0),f:()=>e.draw(c,e,X,Y,G.t)})}
  list.sort((a,b)=>a.y-b.y);for(const it of list)it.f();
  for(const f of W.fx){const X=f.x-cam.x,Y=f.y-cam.y;c.globalAlpha=Math.max(0,Math.min(1,f.life*2));if(f.text){c.font=`bold ${f.size||7}px Jua,sans-serif`;c.textAlign='center';c.lineWidth=2;c.strokeStyle='#000';c.strokeText(f.text,X,Y);c.fillStyle=f.col||'#fff';c.fillText(f.text,X,Y)}else{c.fillStyle=f.col||'#fff';c.fillRect(X-f.s/2,Y-f.s/2,f.s,f.s)}}c.globalAlpha=1;
  /* 조명 */
  const L=lightLayer(VW,VH);L.globalCompositeOperation='source-over';L.clearRect(0,0,VW,VH);L.fillStyle=`rgba(4,3,10,${W.dark})`;L.fillRect(0,0,VW,VH);
  L.globalCompositeOperation='destination-out';
  const poly=(pts,x,y,r,a)=>{const g=L.createRadialGradient(x-cam.x,y-cam.y,0,x-cam.x,y-cam.y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(.6,`rgba(0,0,0,${a*.75})`);g.addColorStop(1,'rgba(0,0,0,0)');L.fillStyle=g;L.beginPath();L.moveTo(x-cam.x,y-cam.y);for(const q of pts)L.lineTo(q[0]-cam.x,q[1]-cam.y);L.closePath();L.fill()};
  for(const l of W.lights){if(!l.on)continue;let a=l.a;if(l.flick)a*=.75+Math.random()*.25*(1+l.flick);if(l.x-cam.x<-l.r||l.x-cam.x>VW+l.r||l.y-cam.y<-l.r||l.y-cam.y>VH+l.r)continue;poly(l.poly,l.x,l.y,l.r,Math.min(1,a))}
  if(o.lights)for(const l of o.lights){const pts=l.cone?rayPoly(W.M,l.x,l.y,l.a-l.cone,l.a+l.cone,l.r,28):rayPoly(W.M,l.x,l.y,0,Math.PI*2,l.r,24);poly(pts,l.x,l.y,l.r,l.i!=null?l.i:1)}
  c.drawImage(LC,0,0,VW,VH);
  /* 빛 색감 */
  c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.08;c.fillStyle='#ffcf80';c.fillRect(0,0,VW,VH);c.restore();
  /* 어둠 속에서도 보이는 것 (눈 등) */
  for(const e of W.ents){if(e.glow&&!e.hidden){const X=e.x-cam.x,Y=e.y-cam.y;if(X>-20&&Y>-30&&X<VW+20&&Y<VH+20)e.glow(c,e,X,Y,G.t)}}
  if(o.over)o.over(c,cam);
  /* 비네트 */
  const v=c.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VW*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=v;c.fillRect(0,0,VW,VH);
  if(W.flash>0){c.fillStyle=W.flash_col;c.globalAlpha=Math.min(1,W.flash);c.fillRect(0,0,VW,VH);c.globalAlpha=1}
  return cam}
/* 숨었을 때 화면 (사물함 틈) */
function drawHidden(c,VW,VH,kind,t,danger){c.fillStyle='rgba(5,4,10,.86)';c.fillRect(0,0,VW,VH);
  if(kind==='사물함'){for(let i=0;i<5;i++){const y=VH*.38+i*9;c.fillStyle='rgba(255,230,170,.06)';c.fillRect(VW*.3,y,VW*.4,3)}}
  else if(kind==='침대 밑'){c.fillStyle='rgba(255,230,170,.07)';c.fillRect(0,VH*.78,VW,10)}
  else{c.fillStyle='rgba(255,230,170,.06)';c.fillRect(VW*.45,VH*.3,VW*.1,VH*.4)}
  if(danger>0){c.fillStyle=`rgba(180,0,0,${danger*.25*(1+Math.sin(t*10))})`;c.fillRect(0,0,VW,VH)}}
/* 막대 */
function bar(c,x,y,w,h,v,col,bg){c.fillStyle=bg||'rgba(0,0,0,.55)';c.fillRect(x-1,y-1,w+2,h+2);c.fillStyle=col;c.fillRect(x,y,w*Math.max(0,Math.min(1,v)),h)}
function heart(c,x,y,s,on){c.fillStyle=on?'#ff4f7b':'rgba(255,255,255,.2)';c.beginPath();c.moveTo(x,y+s*.35);c.bezierCurveTo(x,y,x-s*.55,y,x-s*.55,y+s*.35);c.bezierCurveTo(x-s*.55,y+s*.7,x,y+s*.85,x,y+s);c.bezierCurveTo(x,y+s*.85,x+s*.55,y+s*.7,x+s*.55,y+s*.35);c.bezierCurveTo(x+s*.55,y,x,y,x,y+s*.35);c.fill()}
function float(W,x,y,text,col,size){W.fx.push({x,y,text,col,size,life:1.2,vy:-14})}
function dust(W,x,y,col,n){for(let i=0;i<(n||6);i++)W.fx.push({x,y,s:1.5+Math.random()*1.5,col:col||'#bbb',life:.4+Math.random()*.3,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40})}
function stepFx(W,dt){for(const f of W.fx){f.life-=dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt}W.fx=W.fx.filter(f=>f.life>0);W.shake=Math.max(0,W.shake-dt*2);W.flash=Math.max(0,W.flash-dt*2.5)}

/* 소리 (Retro 오디오 위에 무서운 소리 몇 개) */
let AC=null;function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
function muted(){try{return localStorage.getItem('nnnretro_mute')==='1'}catch(e){return false}}
function tone(f,d,type,vol,f2,delay){if(muted())return;const a=ac();if(!a)return;const t0=a.currentTime+(delay||0);const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);g.gain.setValueAtTime(vol||.1,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+d+.02)}
function noise(d,vol,lp,delay){if(muted())return;const a=ac();if(!a)return;const t0=a.currentTime+(delay||0);const n=a.sampleRate*d,b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const g=a.createGain();g.gain.setValueAtTime(vol||.1,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp||1200;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t0)}
const SND={
  beat:()=>{tone(60,.12,'sine',.35,40);tone(55,.12,'sine',.28,38,.16)},
  door:()=>{tone(180,.18,'sawtooth',.04,120);noise(.12,.08,600)},
  creak:()=>{tone(420,.5,'sawtooth',.025,260)},
  lock:()=>{tone(1200,.04,'square',.05);tone(900,.05,'square',.05,0,.05)},
  scare:()=>{noise(.5,.3,3000);tone(880,.4,'sawtooth',.12,220);tone(1100,.3,'square',.06,300)},
  rumble:()=>{noise(1.6,.22,220);tone(50,1.6,'sawtooth',.06,35)},
  whisper:()=>{noise(.6,.07,4000);tone(1500,.3,'sine',.02,1300)},
  hide:()=>{tone(300,.06,'square',.05,200);noise(.05,.08,900)},
  pick:()=>{tone(880,.06,'square',.06);tone(1320,.12,'square',.06,0,.06)},
  hurt:()=>{noise(.2,.25,900);tone(200,.3,'square',.1,70)},
  wind:()=>{noise(2.2,.05,500)},
  growl:()=>{tone(90,.6,'sawtooth',.08,60);noise(.5,.06,400)},
  fix:()=>{tone(300+Math.random()*200,.05,'square',.025)},
  done:()=>{[523,659,784].forEach((f,i)=>tone(f,.12,'square',.06,0,i*.08))},
  alarm:()=>{tone(700,.25,'square',.06,500);tone(700,.25,'square',.06,500,.3)},
};
function snd(n){try{SND[n]&&SND[n]()}catch(e){}}
/* 무섭지만 아이용: 짧게 번쩍 + 얼굴 */
function scare(W,face,dur){W.scare={face,t:0,d:dur||.55};W.shake=1;snd('scare');navigator.vibrate&&navigator.vibrate([60,30,80])}
function drawScare(c,W,VW,VH){const s=W.scare;if(!s)return;const k=s.t/s.d;if(k>1){W.scare=null;return}const sc=1+k*.35;c.fillStyle=`rgba(0,0,0,${.75*(1-k)})`;c.fillRect(0,0,VW,VH);c.save();c.translate(VW/2,VH/2);c.scale(sc,sc);c.globalAlpha=1-k*k;s.face(c,0,0,VH*.42);c.restore();c.globalAlpha=1}
function stepScare(W,dt){if(W.scare)W.scare.t+=dt}

window.Horror={TS,fromAscii,blank,addProp,setDoor,propAt,isWall,blocked,canAt,move,los,flow,follow,randomFloor,rayPoly,world,addLight,relight,camFollow,playerMove,dist,tileOf,nearProp,render,drawHidden,drawProp,drawKid,icon,bar,heart,float,dust,stepFx,snd,tone,noise,scare,drawScare,stepScare,rr,refresh,FLOOR};
})();
