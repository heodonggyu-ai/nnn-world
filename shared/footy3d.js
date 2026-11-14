/* footy.js 경기를 3D로 그려요 (three.js + stadium3d.js 필요)
   경기 계산은 그대로(위에서 본 x,y + 높이 z), 화면만 3D: X=x, Y=z(높이), Z=y */
(function(){
function hex(c){return new THREE.Color(c).getHex()}
function create(M,o){const THREE=window.THREE,cfg=M.cfg;const W=o.W,H=o.H,HD=o.HD||2;
  const R=o.R||S3.renderer(W,H,HD);const scene=new THREE.Scene();const u=o.height/1.8;
  const st=S3.stadium(scene,{PW:cfg.PW,PH:cfg.PH,margin:cfg.margin,GW:cfg.GWD,GH:cfg.GH,GD:cfg.GWD*.3,boxW:cfg.boxW||cfg.GWD*2.6,boxH:cfg.boxH||cfg.PH*.14,
    sboxW:cfg.GWD*1.45,sboxH:(cfg.boxH||cfg.PH*.14)*.38,circle:cfg.circle||28,spot:(cfg.boxH||cfg.PH*.14)*.68,walls:cfg.walls,unit:u,stripes:o.stripes||14,night:o.night,shadowExt:o.shadowExt,noNearStand:true});
  const cam=new THREE.PerspectiveCamera(o.fov||38,W/H,1,M.FH*6);
  const cx=M.FW/2,cz=M.FH/2;
  /* 선수 모델 */
  const nums=[1,2,3,4,5,6,8,7,10,9,11];
  const models=M.P.map(p=>{const col=p.team===0?cfg.myCol:cfg.opCol;const m=S3.player({height:o.height,shirt:hex(p.gk?col.gk:col.shirt),shorts:hex(col.shorts),socks:hex(p.gk?col.gk:col.shirt),hair:hex(col.hair||'#2a1a10'),
      skin:[0xf0c090,0xd9a273,0xc98a5a,0xffd7b0][(p.i*7+p.team*3)%4],gk:p.gk,num:nums[p.i%11],numCol:p.team===0?'#ffffff':(col.shorts==='#fff'?'#ffffff':col.shorts)});scene.add(m.root);return m});
  const ballR=o.ballR||.5*u;const ball=S3.ball(ballR);scene.add(ball);
  const ring=S3.ring(o.height*.38,0xffd23f);scene.add(ring);
  const tgt=new THREE.Vector3(),camPos=new THREE.Vector3(),look=new THREE.Vector3();let first=true,lastT=0;
  const V=new THREE.Vector3();
  function update(G){const dt=Math.min(.05,Math.max(0,G.t-lastT||1/60));lastT=G.t;const b=M.ball;
    M.P.forEach((p,i)=>{const m=models[i];m.root.visible=!p.off;if(p.off)return;m.root.position.set(p.x-cx,0,p.y-cz);const sp=Math.hypot(p.vx,p.vy);
      let ang=Math.atan2(p.dir.x,p.dir.y);if(p.slide>0)ang=Math.atan2(p.vx,p.vy);m.root.rotation.y=ang;
      let pose={spd:Math.min(1,sp/(cfg.speed||60)),ph:p.anim*2.2,act:'run'};
      if(M.state==='goal'){if(p.team===M.goalTeam&&!p.gk)pose={act:'celebrate',ph:G.t*6+i,spd:.3};else pose={spd:0,act:'idle'}}
      else if(p.slide>0)pose={act:'slide'};else if(p.stun>.25)pose={act:'fall'};
      else if(p.gk&&p.dive&&b.shot&&!b.owner){const dl=(p.team===0?-p.dive:p.dive);pose={act:'dive',dir:dl,k:.8,high:b.z>cfg.GH*.45}}
      else if(p.charge>0)pose={act:'windup',k:Math.min(1,p.charge/.6)};
      else if(p.kcd>.05&&b.lastP===p&&!b.owner)pose={act:'kick',k:1-p.kcd/.3};
      else if(p.touch>0&&b.owner===p)pose={act:'kick',k:.55+.45*(1-p.touch/.32),spd:0};
      else if(p.gk&&sp<5)pose={act:'ready'};
      m.pose(pose)});
    const bx=b.x-cx,bz=b.y-cz,by=b.z*(o.zScale||1)+ballR;ball.position.set(bx,by,bz);if(!b.owner||Math.hypot(b.vx,b.vy)>1){ball.rotation.x+=b.vy*dt/ballR;ball.rotation.z-=b.vx*dt/ballR}
    const c=M.ctrl;if(c&&M.state!=='goal'){ring.visible=true;ring.position.set(c.x-cx,0,c.y-cz);ring.userData.cone.position.y=o.height*1.25+Math.sin(G.t*6)*o.height*.06}else ring.visible=false;
    /* 카메라 */
    const mode=o.camMode||'broadcast';
    if(mode==='broadcast'){const lim=M.PH/2-o.camEdge;tgt.set(bx*.8,0,Math.max(-lim,Math.min(lim,bz)));}else tgt.set(bx*.5,0,bz*.72);
    if(first){look.copy(tgt);first=false}else look.lerp(tgt,Math.min(1,dt*3.2));
    camPos.set(look.x*(o.camFollowX||.85),o.camH,look.z+o.camD);cam.position.copy(camPos);V.set(look.x,0,look.z-o.camAhead);cam.lookAt(V);
    st.follow(look.x,look.z)}
  function render(G,ctx){update(G);R.render(scene,cam);ctx.drawImage(R.domElement,0,0,W,H)}
  function project(x,y,z){V.set(x-cx,z||0,y-cz);return S3.project(V,cam,W,H)}
  return{render,project,scene,cam,R}}
window.Footy3D={create};
})();
