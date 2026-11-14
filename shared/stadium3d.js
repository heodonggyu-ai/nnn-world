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
/* ---------- 선수 ---------- */
const numTex={};
function numberTex(n,shirt,fg){const k=n+shirt+fg;if(numTex[k])return numTex[k];return numTex[k]=canvasTex(64,64,(x,w,h)=>{x.fillStyle=shirt;x.fillRect(0,0,w,h);x.fillStyle=fg;x.font='bold 40px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(n),w/2,h/2+2)})}
S3.player=function(c){const THREE=T();const h=c.height||1.8;const s=h/1.8;const L=(col)=>new THREE.MeshLambertMaterial({color:col});
  const skin=L(c.skin||0xf0c090),shirt=L(c.shirt),shorts=L(c.shorts||0xffffff),socks=L(c.socks||c.shirt),boot=L(0x1a1a1a),hair=L(c.hair||0x2a1a10),glove=L(0x4fe3b2);
  const root=new THREE.Group();const body=new THREE.Group();root.add(body);
  const box=(w,hh,d,m)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w*s,hh*s,d*s),m);me.castShadow=true;return me};
  const hips=new THREE.Group();hips.position.y=.92*s;body.add(hips);
  const pelvis=box(.36,.2,.22,shorts);hips.add(pelvis);
  const torso=new THREE.Group();torso.position.y=.08*s;hips.add(torso);
  const back=numberTex(c.num||7,'#'+new THREE.Color(c.shirt).getHexString(),c.numCol||'#ffffff');
  const chestM=[shirt,shirt,shirt,shirt,shirt,new THREE.MeshLambertMaterial({map:back})];
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.42*s,.5*s,.24*s),chestM);chest.position.y=.27*s;chest.castShadow=true;torso.add(chest);
  const neck=box(.1,.08,.1,skin);neck.position.y=.55*s;torso.add(neck);
  const head=new THREE.Group();head.position.y=.68*s;torso.add(head);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.13*s,12,10),skin);hd.scale.set(1,1.12,1.02);hd.castShadow=true;head.add(hd);
  const hr=new THREE.Mesh(new THREE.SphereGeometry(.137*s,12,8,0,Math.PI*2,0,Math.PI*.55),hair);hr.position.y=.02*s;hr.rotation.x=-.25;head.add(hr);
  const eyeM=L(0x111111);for(const ex of [-.045,.045]){const e=new THREE.Mesh(new THREE.BoxGeometry(.025*s,.03*s,.01*s),eyeM);e.position.set(ex*s,.01*s,.125*s);head.add(e)}
  const limb=(parent,x,y,len,w,m1,m2,endM)=>{const pv=new THREE.Group();pv.position.set(x*s,y*s,0);parent.add(pv);const up=box(w,len*.5,w,m1);up.position.y=-len*.25*s;pv.add(up);
    const kn=new THREE.Group();kn.position.y=-len*.5*s;pv.add(kn);const lo=box(w*.9,len*.5,w*.9,m2);lo.position.y=-len*.25*s;kn.add(lo);let end=null;if(endM){end=box(w*1.15,.08,w*2.1,endM);end.position.set(0,-len*.5*s,.05*s);kn.add(end)}return{pv,kn,end}};
  const legL=limb(hips,-.1,-.05,.86,.14,shorts,socks,boot),legR=limb(hips,.1,-.05,.86,.14,shorts,socks,boot);
  const armL=limb(torso,-.27,.48,.62,.1,shirt,skin,c.gk?glove:null),armR=limb(torso,.27,.48,.62,.1,shirt,skin,c.gk?glove:null);
  if(c.gk){for(const a of [armL,armR]){const gl=box(.13,.13,.13,glove);gl.position.y=-.33*s;a.kn.add(gl)}}
  const P={root,body,hips,torso,head,legL,legR,armL,armR,h,s};
  /* 동작: st = {spd(달리기 빠르기 0~1), ph(걸음 위상), act:'idle'|'run'|'kick'|'slide'|'dive'|'celebrate'|'fall'|'header'|'ready', k(동작 진행 0~1), dir(다이빙 방향 -1/1)} */
  P.pose=function(st){const ph=st.ph||0,sp=Math.min(1,st.spd||0);body.rotation.set(0,0,0);body.position.set(0,0,0);hips.position.y=.92*s;torso.rotation.set(0,0,0);head.rotation.set(0,0,0);
    const sw=Math.sin(ph)*sp,sw2=Math.sin(ph+Math.PI)*sp;
    legL.pv.rotation.set(sw*.9,0,0);legR.pv.rotation.set(sw2*.9,0,0);legL.kn.rotation.x=-Math.max(0,-Math.cos(ph))*sp*1.2-.05;legR.kn.rotation.x=-Math.max(0,Math.cos(ph))*sp*1.2-.05;
    armL.pv.rotation.set(sw2*.8,0,-.12);armR.pv.rotation.set(sw*.8,0,.12);armL.kn.rotation.x=-.5*sp-.15;armR.kn.rotation.x=-.5*sp-.15;
    torso.rotation.x=.18*sp;hips.position.y=.92*s+Math.abs(Math.sin(ph))*.04*s*sp;
    const k=st.k||0,a=st.act;
    if(a==='kick'){const sw=Math.sin(Math.min(1,k)*Math.PI);legR.pv.rotation.x=.9-2.2*k;legR.kn.rotation.x=-(1-k)*1.3;legL.pv.rotation.x=-.2;armL.pv.rotation.set(-.6,0,-.9);armR.pv.rotation.set(.5,0,.6);torso.rotation.x=-.15*sw}
    else if(a==='windup'){legR.pv.rotation.x=.9*k;legR.kn.rotation.x=-1.3*k;armL.pv.rotation.z=-.7*k;armR.pv.rotation.z=.5*k;torso.rotation.x=.1}
    else if(a==='slide'){body.rotation.x=-1.25;body.position.y=.3*s;legR.pv.rotation.x=-.3;legL.pv.rotation.x=.4;legL.kn.rotation.x=-1.2;armL.pv.rotation.z=-1.2;armR.pv.rotation.z=1.2}
    else if(a==='fall'){body.rotation.x=1.4;body.position.y=.25*s;armL.pv.rotation.x=-2.6;armR.pv.rotation.x=-2.6}
    else if(a==='dive'){const d=st.dir||1,e=Math.min(1,k);body.rotation.z=-d*1.35*e;body.position.set(d*.9*s*e,(st.high?.9:.35)*s*Math.sin(e*Math.PI*.75),0);armL.pv.rotation.z=-2.9*e;armR.pv.rotation.z=2.9*e;legL.pv.rotation.z=-.3*e;legR.pv.rotation.z=.3*e}
    else if(a==='jump'){const e=Math.min(1,k);body.position.y=.45*s*Math.sin(e*Math.PI);armL.pv.rotation.z=-2.9*e;armR.pv.rotation.z=2.9*e}
    else if(a==='ready'){hips.position.y=.82*s;legL.pv.rotation.z=-.25;legR.pv.rotation.z=.25;legL.kn.rotation.x=-.4;legR.kn.rotation.x=-.4;legL.pv.rotation.x=.25;legR.pv.rotation.x=.25;torso.rotation.x=.3;armL.pv.rotation.set(-.3,0,-.6);armR.pv.rotation.set(-.3,0,.6)}
    else if(a==='celebrate'){armL.pv.rotation.set(0,0,-2.7+Math.sin(ph*2)*.2);armR.pv.rotation.set(0,0,2.7-Math.sin(ph*2)*.2);body.position.y=Math.abs(Math.sin(ph*1.5))*.25*s}
    else if(a==='header'){torso.rotation.x=-.5*Math.sin(k*Math.PI);head.rotation.x=.6*Math.sin(k*Math.PI);body.position.y=.25*s*Math.sin(k*Math.PI)}};
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
