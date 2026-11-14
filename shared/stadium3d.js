/* NNN 3D 축구 도구 상자 (three.js r128 필요)
   - S3.renderer: 그림자 켜진 렌더러
   - S3.stadium: 잔디(줄무늬)·라인·골대·그물·광고판·관중석·조명탑
   - S3.player: 관절 있는 선수 (달리기·킥·슬라이딩·다이빙·세리머니 동작)
   - S3.ball: 축구공
   좌표: 바닥 = XZ 평면, 위 = +Y. 골대는 Z축 양 끝에 있어요 */
(function(){
const S3={};const T=()=>window.THREE;
const cache={};
function canvasTex(w,h,draw,key){if(key&&cache[key])return cache[key];const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);
  const t=new (T().CanvasTexture)(c);t.anisotropy=4;t.encoding=T().sRGBEncoding;if(key)cache[key]=t;return t}
S3.canvasTex=canvasTex;
S3.renderer=function(W,H,hd){const THREE=T();const r=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});r.setPixelRatio(1);r.setSize(W*hd,H*hd,false);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.NoToneMapping;return r};
/* ---------- 경기장 ----------
   o: {PW,PH (라인 안쪽 크기), margin, GW,GH (골대 폭·높이), GD(골대 깊이), boxW,boxH,sboxW,sboxH,circle,spot, walls, unit(1m가 몇 단위), night} */
S3.stadium=function(scene,o){const THREE=T();const u=o.unit||1;const FW=o.PW+o.margin*2,FH=o.PH+o.margin*2;const g=new THREE.Group();scene.add(g);
  scene.background=new THREE.Color(o.night?0x0b1030:0x8cc8ff);scene.fog=new THREE.Fog(o.night?0x0b1030:0x8cc8ff,FH*1.4,FH*3.2);
  /* 잔디 텍스처: 줄무늬 + 라인 */
  const res=Math.min(2048,Math.round(1400*Math.max(1,FH/FW)*.7));const px=res/FH;
  const tex=canvasTex(Math.round(FW*px),res,(x,w,h)=>{const n=o.stripes||12;for(let i=0;i<n;i++){x.fillStyle=i%2?'#2c8236':'#34923f';x.fillRect(0,i*h/n,w,h/n+1)}
    for(let i=0;i<9000;i++){x.fillStyle=Math.random()<.5?'rgba(255,255,255,.035)':'rgba(0,0,0,.05)';x.fillRect(Math.random()*w,Math.random()*h,2,3)}
    const L=(v)=>v*px;const lw=Math.max(2,L(.12*u));x.strokeStyle='rgba(255,255,255,.92)';x.lineWidth=lw;x.fillStyle='rgba(255,255,255,.92)';
    const m=L(o.margin),pw=L(o.PW),ph=L(o.PH),cx=w/2;x.strokeRect(m,m,pw,ph);x.beginPath();x.moveTo(m,h/2);x.lineTo(m+pw,h/2);x.stroke();
    x.beginPath();x.arc(cx,h/2,L(o.circle),0,7);x.stroke();x.beginPath();x.arc(cx,h/2,lw*1.6,0,7);x.fill();
    for(const top of [true,false]){const y0=top?m:m+ph,s=top?1:-1;const bw=L(o.boxW),bh=L(o.boxH),sw=L(o.sboxW),sh=L(o.sboxH);
      x.strokeRect(cx-bw/2,top?y0:y0-bh,bw,bh);x.strokeRect(cx-sw/2,top?y0:y0-sh,sw,sh);const sy=y0+s*L(o.spot);x.beginPath();x.arc(cx,sy,lw*.9,0,7);x.fill();
      const r=L(o.circle);const dy=(top?y0+bh:y0-bh)-sy;const a=Math.acos(Math.min(1,Math.abs(dy)/r));x.beginPath();if(top)x.arc(cx,sy,r,Math.PI/2-a,Math.PI/2+a);else x.arc(cx,sy,r,-Math.PI/2-a,-Math.PI/2+a);x.stroke()}
    for(const [cxx,cyy,a0] of [[m,m,0],[m+pw,m,Math.PI/2],[m+pw,m+ph,Math.PI],[m,m+ph,Math.PI*1.5]]){x.beginPath();x.arc(cxx,cyy,L(1*u),a0,a0+Math.PI/2);x.stroke()}
  });
  const pitch=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshLambertMaterial({map:tex}));pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;g.add(pitch);
  const outer=new THREE.Mesh(new THREE.PlaneGeometry(FW*3,FH*3),new THREE.MeshLambertMaterial({color:o.walls?0x23305a:0x2f7d3a}));outer.rotation.x=-Math.PI/2;outer.position.y=-.02*u;outer.receiveShadow=true;g.add(outer);
  /* 골대 */
  for(const end of [-1,1])g.add(S3.goal(o.GW,o.GH,o.GD||o.GW*.25,u,end,FH/2-o.margin));
  /* 광고판 */
  const adTex=canvasTex(1024,64,(x,w,h)=>{const items=[['NNN BOXING','#e8231f','#fff'],['탕정 엔엔엔복싱','#111','#ffd23f'],['NNN WORLD','#2a6adf','#fff'],['펀치왕','#ffd23f','#111']];let xx=0,i=0;while(xx<w){const [t,bg,fg]=items[i%items.length];x.font='bold 40px sans-serif';const tw=x.measureText(t).width+60;x.fillStyle=bg;x.fillRect(xx,0,tw,h);x.fillStyle=fg;x.textBaseline='middle';x.fillText(t,xx+30,h/2+2);xx+=tw;i++}},'ads');
  const adH=(o.walls?1.1:.9)*u,adGap=o.walls?0:o.margin*.55;
  const mkAd=(len,x,z,ry)=>{const t=adTex.clone();t.needsUpdate=true;t.wrapS=THREE.RepeatWrapping;t.repeat.set(Math.max(1,len/(14*u)),1);const m=new THREE.Mesh(new THREE.BoxGeometry(len,adH,.3*u),[0,0,0,0,new THREE.MeshBasicMaterial({map:t}),new THREE.MeshLambertMaterial({color:0x222233})].map((mm,ii)=>mm||new THREE.MeshLambertMaterial({color:0x222233})));
    m.position.set(x,adH/2,z);m.rotation.y=ry;m.castShadow=false;g.add(m);return m};
  const hx=o.PW/2+adGap,hz=o.PH/2+adGap;
  if(o.walls){mkAd(o.PW+2,0,-hz-.3,0);mkAd(o.PW+2,0,hz+.3,Math.PI);mkAd(o.PH+2,-hx-.3,0,Math.PI/2);mkAd(o.PH+2,hx+.3,0,-Math.PI/2)}
  else{mkAd(o.PW*.42,-o.PW*.29,-hz-o.margin*.3,0);mkAd(o.PW*.42,o.PW*.29,-hz-o.margin*.3,0);mkAd(o.PW*.42,-o.PW*.29,hz+o.margin*.3,Math.PI);mkAd(o.PW*.42,o.PW*.29,hz+o.margin*.3,Math.PI);mkAd(o.PH,-hx-o.margin*.3,0,Math.PI/2);mkAd(o.PH,hx+o.margin*.3,0,-Math.PI/2)}
  /* 관중석 */
  const crowd=canvasTex(512,256,(x,w,h)=>{x.fillStyle='#2a2f4a';x.fillRect(0,0,w,h);const cols=['#e8231f','#ffd23f','#ffffff','#2a6adf','#ff9b3d','#4fe3b2','#c46bff','#f0c090','#111'];
    for(let r=0;r<16;r++)for(let i=0;i<64;i++){if(Math.random()<.12)continue;x.fillStyle=cols[Math.floor(Math.random()*cols.length)];const cx=i*8+4+(r%2)*4,cy=r*16+6;x.fillRect(cx-3,cy,6,7);x.fillStyle='#f0c090';x.fillRect(cx-2,cy-4,4,4)}},'crowd');
  const standDepth=(o.walls?14:22)*u,standH=(o.walls?9:14)*u,back=o.margin+(o.walls?2*u:6*u);
  const mkStand=(len,cx,cz,ry)=>{const t=crowd.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(len/(30*u),1.5);
    const geo=new THREE.BoxGeometry(len,standH,standDepth);const st=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:t}));
    const pivot=new THREE.Group();pivot.position.set(cx,0,cz);pivot.rotation.y=ry;st.position.set(0,standH/2,-standDepth/2);st.rotation.x=-.55;st.position.y=standH*.42;pivot.add(st);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(len,.6*u,standDepth*.8),new THREE.MeshLambertMaterial({color:0xdde3f0}));roof.position.set(0,standH*1.15,-standDepth*.55);pivot.add(roof);g.add(pivot)};
  const bx=FW/2+back-o.margin,bz=FH/2+back-o.margin;
  mkStand(FW+back*1.2,0,-bz,0);if(!o.noNearStand)mkStand(FW+back*1.2,0,bz,Math.PI);mkStand(FH+back*1.2,-bx,0,Math.PI/2);mkStand(FH+back*1.2,bx,0,-Math.PI/2);
  /* 조명탑 */
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const tw=new THREE.Group();tw.position.set(sx*(bx+4*u),0,sz*(bz+4*u));const pole=new THREE.Mesh(new THREE.CylinderGeometry(.4*u,.6*u,standH*2.6,6),new THREE.MeshLambertMaterial({color:0x8890a8}));pole.position.y=standH*1.3;tw.add(pole);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(5*u,3*u,.6*u),new THREE.MeshBasicMaterial({color:0xfffbe0}));panel.position.y=standH*2.6;panel.lookAt(0,0,0);tw.add(panel);g.add(tw)}
  /* 빛 */
  const hemi=new THREE.HemisphereLight(0xdfefff,0x3a5a30,o.night?.45:.55);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff6e8,o.night?.7:.8);sun.position.set(-FW*.3,FH*.6,FH*.35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  const sc=sun.shadow.camera;const ext=o.shadowExt||Math.max(FW,FH)*.6;sc.left=-ext;sc.right=ext;sc.top=ext;sc.bottom=-ext;sc.near=1;sc.far=FH*3;sun.shadow.bias=-.0008;scene.add(sun);scene.add(sun.target);
  const amb=new THREE.AmbientLight(0xffffff,.12);scene.add(amb);
  return{group:g,sun,FW,FH,follow(x,z){sun.position.set(x-FW*.3,FH*.6,z+FH*.35);sun.target.position.set(x,0,z)}}};
/* 골대 (end: -1 = 위쪽 골, +1 = 아래쪽 골), lineZ: 골라인의 |z| */
S3.goal=function(W,H,D,u,end,lineZ){const THREE=T();const g=new THREE.Group();const r=.06*u*2;const white=new THREE.MeshLambertMaterial({color:0xffffff});
  const post=(x)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,H+r,10),white);m.position.set(x,(H+r)/2,0);m.castShadow=true;g.add(m)};post(-W/2);post(W/2);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(r,r,W+r*2,10),white);bar.rotation.z=Math.PI/2;bar.position.set(0,H,0);bar.castShadow=true;g.add(bar);
  const netM=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.55});const pts=[];const st=Math.max(W,H)/16;
  const add=(a,b)=>{pts.push(new THREE.Vector3(...a),new THREE.Vector3(...b))};
  for(let x=-W/2;x<=W/2+.001;x+=st){add([x,H,0],[x,H*.85,-D]);add([x,H*.85,-D],[x,0,-D])}
  for(let y=0;y<=H*.85+.001;y+=st){add([-W/2,y,-D],[W/2,y,-D])}for(let z=0;z>=-D-.001;z-=st){const yy=H-(H*.15)*(-z/D);add([-W/2,yy,z],[W/2,yy,z]);add([-W/2,0,z],[-W/2,yy,z]);add([W/2,0,z],[W/2,yy,z])}
  for(let y=0;y<=H;y+=st){const zz=-D;add([-W/2,y,0],[-W/2,Math.min(y,H*.85),zz]);add([W/2,y,0],[W/2,Math.min(y,H*.85),zz])}
  const geo=new THREE.BufferGeometry().setFromPoints(pts);const net=new THREE.LineSegments(geo,netM);g.add(net);g.userData.net=net;
  const back=new THREE.Mesh(new THREE.PlaneGeometry(W,H*.85),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.07,side:THREE.DoubleSide}));back.position.set(0,H*.85/2,-D);g.add(back);
  g.position.z=end*lineZ;if(end>0)g.rotation.y=Math.PI;return g};
/* ---------- 선수 (관절 리그 + 부드러운 동작 섞기) ----------
   c: {height, shirt, shorts, socks, skin, hair, gk, num, numCol, style(0~4 머리모양)}
   P.pose(st): 바로 그 자세로 / P.animate(st,dt): 지금 자세에서 부드럽게 넘어가기
   st.act: idle·run·kick·touch·windup·slide·fall·dive·jump·ready·hold·throw·celebrate·header, st.spd(0~1.3), st.ph(걸음 위상), st.k(동작 진행 0~1) */
const numTex={};
function numberTex(n,fg){const k=n+fg;if(numTex[k])return numTex[k];return numTex[k]=canvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle=fg;x.font='bold 46px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(n),w/2,h/2+3)})}
function faceTex(skin,hair){const k='f'+skin+hair;if(numTex[k])return numTex[k];return numTex[k]=canvasTex(128,64,(x,w,h)=>{x.fillStyle=skin;x.fillRect(0,0,w,h);
  /* 앞쪽(+Z) 얼굴 */const cx=w*.25;x.fillStyle='rgba(0,0,0,.08)';x.fillRect(cx-4,30,8,10);x.fillStyle='#1a1a1a';x.fillRect(cx-14,26,7,5);x.fillRect(cx+7,26,7,5);x.fillStyle='#fff';x.fillRect(cx-13,26,2,2);x.fillRect(cx+8,26,2,2);
  x.fillStyle=hair;x.fillRect(cx-16,21,10,2);x.fillRect(cx+6,21,10,2);x.fillStyle='#8a4a3a';x.fillRect(cx-7,44,14,3);x.fillStyle='rgba(0,0,0,.12)';x.fillRect(cx-26,34,4,10);x.fillRect(cx+22,34,4,10)})}
S3.player=function(c){const THREE=T();const h=c.height||1.8;const s=h/1.8;const M=(col)=>new THREE.MeshLambertMaterial({color:col});
  const skinC=new THREE.Color(c.skin||0xf0c090),hairC=new THREE.Color(c.hair||0x2a1a10);
  const skin=M(skinC),shirt=M(c.shirt),shorts=M(c.shorts||0xffffff),socks=M(c.socks||c.shirt),boot=M(c.boot||0x161616),hair=M(hairC),glove=M(0x4fe3b2);
  const cyl=(rt,rb,len,mat,shadow,seg)=>{const g=new THREE.CylinderGeometry(rt*s,rb*s,len*s,seg||10);g.translate(0,-len*s/2,0);const m=new THREE.Mesh(g,mat);m.castShadow=!!shadow;return m};
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const hips=new THREE.Group();body.add(hips);
  const pel=cyl(.165,.15,.2,shorts,true);pel.position.y=.1*s;pel.scale.z=.7;hips.add(pel);
  const spine=new THREE.Group();spine.position.y=.06*s;hips.add(spine);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.205*s,.16*s,.52*s,12),shirt);torso.position.y=.27*s;torso.scale.z=.62;torso.castShadow=true;spine.add(torso);
  const shoulders=new THREE.Mesh(new THREE.SphereGeometry(.205*s,12,8,0,Math.PI*2,0,Math.PI/2),shirt);shoulders.position.y=.52*s;shoulders.scale.set(1,.35,.62);spine.add(shoulders);
  const num=new THREE.Mesh(new THREE.PlaneGeometry(.2*s,.2*s),new THREE.MeshBasicMaterial({map:numberTex(c.num||7,c.numCol||'#ffffff'),transparent:true,depthWrite:false}));num.position.set(0,.33*s,-.118*s);num.rotation.y=Math.PI;spine.add(num);
  const neck=cyl(.05,.055,.1,skin);neck.position.y=.62*s;spine.add(neck);
  const head=new THREE.Group();head.position.y=.64*s;spine.add(head);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.112*s,14,10),new THREE.MeshLambertMaterial({map:faceTex('#'+skinC.getHexString(),'#'+hairC.getHexString())}));hd.scale.set(1,1.15,1.05);hd.position.y=.1*s;hd.castShadow=true;head.add(hd);
  const st=c.style==null?Math.floor(Math.random()*5):c.style;
  if(st!==3){const cap=new THREE.Mesh(new THREE.SphereGeometry(.119*s,12,8,0,Math.PI*2,0,Math.PI*(st===1?.38:.52)),hair);cap.position.y=.115*s;cap.rotation.x=-.3;cap.scale.set(1,1.1,1.08);head.add(cap);
    if(st===2){const back=new THREE.Mesh(new THREE.BoxGeometry(.2*s,.16*s,.06*s),hair);back.position.set(0,.06*s,-.09*s);head.add(back)}
    if(st===4){const mo=new THREE.Mesh(new THREE.BoxGeometry(.04*s,.07*s,.22*s),hair);mo.position.set(0,.23*s,-.01*s);head.add(mo)}}
  const leg=(x)=>{const pv=new THREE.Group();pv.position.set(x*s,0,0);hips.add(pv);const sh=cyl(.085,.08,.16,shorts);pv.add(sh);const th=cyl(.075,.06,.44,skin,true);pv.add(th);
    const kn=new THREE.Group();kn.position.y=-.44*s;pv.add(kn);const sk=cyl(.058,.042,.42,socks,true);sk.position.y=-.02*s;kn.add(sk);
    const an=new THREE.Group();an.position.y=-.44*s;kn.add(an);const bt=new THREE.Mesh(new THREE.BoxGeometry(.09*s,.075*s,.25*s),boot);bt.position.set(0,-.03*s,.06*s);bt.castShadow=true;an.add(bt);return{pv,kn,an,end:bt}};
  const arm=(x)=>{const pv=new THREE.Group();pv.position.set(x*s,.49*s,0);spine.add(pv);const sl=cyl(.062,.058,.17,shirt);pv.add(sl);const up=cyl(.048,.042,.28,c.longSleeve?shirt:skin);pv.add(up);
    const kn=new THREE.Group();kn.position.y=-.28*s;pv.add(kn);const fo=cyl(.04,.033,.25,c.gk?shirt:skin);kn.add(fo);const hand=new THREE.Mesh(new THREE.SphereGeometry((c.gk?.06:.045)*s,8,6),c.gk?glove:skin);hand.position.y=-.27*s;kn.add(hand);return{pv,kn,hand}};
  const legL=leg(-.095),legR=leg(.095),armL=arm(-.235),armR=arm(.235);
  const P={root,body,hips,spine,torso:spine,head,legL,legR,armL,armR,h,s,cur:null,heading:0};
  const J=['bx','by','bz','brx','brz','hy','hrx','hry','srx','sry','srz','hdx','hdy','lpx','lpz','lkx','lax','rpx','rpz','rkx','rax','alx','alz','aly','aex','arx','arz','ary','arex'];
  function target(stt){const t={};for(const k of J)t[k]=0;t.hy=.95;const a=stt.act||'idle',k=stt.k||0,sf=Math.min(1.3,stt.spd||0),ph=stt.ph||0;
    /* 기본: 서 있기·달리기 */
    const A=.18+.62*sf,K=.35+1.35*sf,sw=Math.sin(ph);
    t.lpx=-A*sw;t.rpx=A*sw;t.lkx=.12+K*Math.max(0,Math.sin(ph+2.36));t.rkx=.12+K*Math.max(0,Math.sin(ph+2.36+Math.PI));
    t.lax=-(t.lpx+t.lkx)*.55+.15;t.rax=-(t.rpx+t.rkx)*.55+.15;
    t.alx=A*.95*sw;t.arx=-A*.95*sw;t.aex=-(.35+.9*sf);t.arex=-(.35+.9*sf);t.alz=-.12-.1*sf;t.arz=.12+.1*sf;
    t.srx=.06+.28*sf;t.hry=.16*sw*sf;t.sry=-.22*sw*sf;t.hy=.95-.04*sf+.045*sf*Math.abs(Math.cos(ph));t.hdx=-.15*sf;
    if(sf<.05){const br=Math.sin((stt.t||0)*2.2)*.012;t.srx=.03+br;t.alz=-.1;t.arz=.1;t.aex=-.25;t.arex=-.25;t.lpz=-.04;t.rpz=.04;t.hdx=-.05}
    if(a==='kick'||a==='touch'){const pw=a==='touch'?.3:(stt.pw==null?1:stt.pw);
      const back=k<.32?k/.32:k<.5?1-(k-.32)/.18*2:Math.max(-1,-1+(k-.5)*.4);/* 1=뒤로, -1=앞으로 */
      t.rpx=back>0?.95*pw*back:back*1.35*pw;t.rkx=back>0?1.7*pw*back:.12+(.4*(1-Math.min(1,(k-.5)/.3)));t.rax=back>0?.4:-.25;
      t.lpx=-.12;t.lkx=.35;t.lax=.1;t.hy=.9;t.srx=.08-back*.12*pw;t.sry=back*.35*pw;t.hry=-back*.2*pw;
      t.alx=-.4;t.alz=-1.1*pw-.15;t.aex=-.4;t.arx=.6*pw;t.arz=.4;t.arex=-.5;t.hdx=.15}
    else if(a==='windup'){t.rpx=.85*k;t.rkx=1.5*k;t.lkx=.3;t.hy=.91;t.alz=-.9*k-.15;t.alx=-.3;t.arz=.4;t.arx=.4;t.sry=.3*k;t.srx=.12}
    else if(a==='slide'){t.brx=-1.25;t.by=-.55;t.rpx=-1.45;t.rkx=.05;t.lpx=-.4;t.lkx=1.5;t.alz=-1.1;t.arz=1.1;t.alx=.5;t.arx=.5;t.hdx=.4}
    else if(a==='fall'){t.brx=1.45;t.by=-.72;t.alx=-2.6;t.arx=-2.4;t.aex=-.3;t.arex=-.3;t.lkx=.4;t.rkx=.2;t.hdx=-.6}
    else if(a==='dive'){const d=stt.dir||1,e=Math.min(1,k);t.brz=-d*1.38*e;t.bx=d*.95*e;t.by=(stt.high?.95:.32)*Math.sin(e*Math.PI*.7);t.alz=-2.95*e;t.arz=2.95*e;t.alx=-.2;t.arx=-.2;t.aex=-.1;t.arex=-.1;t.lpz=-.15*e;t.rpz=.15*e;t.lkx=.3;t.rkx=.5;t.srz=d*.1}
    else if(a==='jump'){const e=Math.min(1,k);t.by=.48*Math.sin(e*Math.PI);t.alz=-2.9*e;t.arz=2.9*e;t.lkx=.6*e;t.rkx=.6*e}
    else if(a==='ready'){t.hy=.82;t.lpz=-.22;t.rpz=.22;t.lkx=.75;t.rkx=.75;t.lpx=-.35;t.rpx=-.35;t.lax=-.4;t.rax=-.4;t.srx=.4;t.alx=-.75;t.arx=-.75;t.alz=-.35;t.arz=.35;t.aex=-.7;t.arex=-.7;t.hdx=-.3}
    else if(a==='hold'){t.alx=-1.1;t.arx=-1.1;t.aex=-.9;t.arex=-.9;t.alz=.25;t.arz=-.25;t.srx=.15}
    else if(a==='throw'){t.alx=-2.9;t.arx=-2.9;t.aex=-1.2;t.arex=-1.2;t.srx=-.25;t.lpx=-.2;t.rpx=.15}
    else if(a==='celebrate'){const v=stt.v||0,q=ph;if(v===0){t.alz=-1.5;t.arz=1.5;t.alx=0;t.arx=0;t.aex=0;t.arex=0;t.brz=Math.sin(q*.5)*.25}
      else if(v===1){t.alz=-2.7+Math.sin(q*2)*.2;t.arz=2.7-Math.sin(q*2)*.2;t.by=Math.abs(Math.sin(q*1.5))*.28;t.aex=-.2;t.arex=-.2}
      else{t.lkx=1.6;t.rkx=1.6;t.lpx=.2;t.rpx=.2;t.by=-.42;t.brx=-.35;t.alz=-2.2;t.arz=2.2;t.aex=-.3;t.arex=-.3;t.hdx=.5}}
    else if(a==='header'){const e=Math.sin(Math.min(1,k)*Math.PI);t.by=.3*e;t.srx=-.45*e+.5*Math.max(0,k-.5);t.hdx=.7*e;t.alz=-.8;t.arz=.8;t.lkx=.8*e;t.rkx=.8*e}
    return t}
  function apply(v){body.position.set(v.bx*s,v.by*s,0);body.rotation.set(v.brx,0,v.brz);hips.position.y=v.hy*s;hips.rotation.set(v.hrx,v.hry,0);spine.rotation.set(v.srx,v.sry,v.srz);head.rotation.set(v.hdx,v.hdy,0);
    legL.pv.rotation.set(v.lpx,0,v.lpz);legL.kn.rotation.x=v.lkx;legL.an.rotation.x=v.lax;legR.pv.rotation.set(v.rpx,0,v.rpz);legR.kn.rotation.x=v.rkx;legR.an.rotation.x=v.rax;
    armL.pv.rotation.set(v.alx,v.aly,v.alz);armL.kn.rotation.x=v.aex;armR.pv.rotation.set(v.arx,v.ary,v.arz);armR.kn.rotation.x=v.arex}
  P.pose=function(stt){const t=target(stt||{});P.cur=t;apply(t)};
  P.animate=function(stt,dt){const t=target(stt||{});if(!P.cur){P.cur=t;apply(t);return}const fast=stt&&(stt.act==='kick'||stt.act==='touch'||stt.act==='dive'||stt.act==='slide')?28:stt&&stt.act==='run'?20:12;const a=Math.min(1,dt*fast);
    for(const k of J)P.cur[k]+=(t[k]-P.cur[k])*a;apply(P.cur)};
  P.pose({});return P};
/* ---------- 공 ---------- */
S3.ball=function(r){const THREE=T();const tex=canvasTex(256,128,(x,w,h)=>{x.fillStyle='#fafafa';x.fillRect(0,0,w,h);x.fillStyle='#161616';
    const hexes=[[.1,.2],[.35,.2],[.6,.2],[.85,.2],[.22,.55],[.47,.55],[.72,.55],[.97,.55],[.1,.88],[.35,.88],[.6,.88],[.85,.88]];for(const [hx,hy] of hexes){x.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;x.lineTo(hx*w+Math.cos(a)*13,hy*h+Math.sin(a)*13*1.1)}x.fill()}},'ballTex');
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),new THREE.MeshLambertMaterial({map:tex}));m.castShadow=true;return m};
/* 바닥 링 (조종 선수 표시) */
S3.ring=function(r,col){const THREE=T();const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(r*.75,r,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;g.add(ring);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(r*.35,r*.6,4),new THREE.MeshBasicMaterial({color:col}));cone.rotation.x=Math.PI;g.add(cone);g.userData.cone=cone;return g};
/* 3D 좌표 → 2D 캔버스 좌표 */
S3.project=function(v3,camera,W,H){const v=v3.clone().project(camera);return{x:(v.x+1)/2*W,y:(1-v.y)/2*H,behind:v.z>1}};
window.S3=S3;
})();
