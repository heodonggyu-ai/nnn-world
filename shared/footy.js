/* NNN 축구 공통 엔진 (위에서 내려다보는 축구)
   - 우리 팀(0, 빨강)은 위쪽 골대로 공격, 상대(1)는 아래쪽으로 공격
   - 공: 높이(z)가 있어서 띄운 패스·슛이 골대를 넘기도 해요
   - 조작: 십자키 이동 · A 패스(수비 땐 선수 바꾸기) · B 슛(꾹 눌렀다 떼면 세게, 수비 땐 태클)
   - 팀 AI: 포메이션 자리 잡기, 압박, 패스·드리블·슛 판단, 골키퍼 다이빙 */
(function(){
const TAU=Math.PI*2;
const hyp=Math.hypot,clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a);
function create(cfg){
  const M={cfg,t:0,score:[0,0],clock:cfg.duration,state:'kickoff',stT:0,ball:null,P:[],ctrl:null,cam:{x:0,y:0},msg:null,parts:[],energy:0,shake:0,half:1,pens:null,ended:false,goalTeam:null};
  const PW=cfg.PW,PH=cfg.PH,MX=cfg.margin,MY=cfg.margin,GWD=cfg.GWD,GH=cfg.GH||11;
  M.PW=PW;M.PH=PH;M.MX=MX;M.MY=MY;M.FW=PW+MX*2;M.FH=PH+MY*2;
  const goalX=MX+PW/2,topY=MY,botY=MY+PH;
  M.ball={x:goalX,y:MY+PH/2,z:0,vx:0,vy:0,vz:0,owner:null,last:0,lastP:null,fire:0,spin:0};
  /* 선수 만들기 */
  const skills=[cfg.mySkill,cfg.opSkill];
  for(const team of [0,1])cfg.formation.forEach((f,i)=>{const [hx,hy,role]=f;const p={team,i,role,gk:role==='gk',hx,hy,x:0,y:0,vx:0,vy:0,dir:{x:0,y:team?1:-1},stun:0,slide:0,kcd:0,anim:Math.random()*6,hold:0,dec:rnd(.1,.5),sk:skills[team],stam:1,yc:0,off:false};placeHome(p,true);M.P.push(p)});
  function homePos(p){/* 포메이션 자리 + 공 위치에 따라 이동 */let hx=p.hx,hy=p.hy;if(p.team===1){hx=1-hx;hy=1-hy}
    const b=M.ball;let x=MX+hx*PW,y=MY+hy*PH;if(p.gk)return{x:goalX+clamp((b.x-goalX)*.3,-GWD/2+3,GWD/2-3),y:p.team===0?botY-6:topY+6};
    const att=teamHas(p.team);const fwd=p.team===0?-1:1;
    x+= (b.x-goalX)*(cfg.shiftX||.38);y+=(b.y-(MY+PH/2))*(cfg.shiftY||.42);y+=fwd*(att?PH*.08:-PH*.04);
    return{x:clamp(x,MX+6,MX+PW-6),y:clamp(y,MY+8,MY+PH-8)}}
  function placeHome(p,force){let hx=p.hx,hy=p.hy;if(p.team===1){hx=1-hx;hy=1-hy}const x=MX+hx*PW,y=MY+(p.team===0?Math.max(.52,hy):Math.min(.48,hy))*PH;
    if(p.gk){p.x=goalX;p.y=p.team===0?botY-6:topY+6}else{p.x=x;p.y=y}p.vx=p.vy=0;p.stun=p.slide=0;p.dir={x:0,y:p.team?1:-1}}
  M.homePos=homePos;
  function teamHas(t){const o=M.ball.owner;return o?o.team===t:M.ball.last===t}
  function nearest(team,x,y,excl,noGk){let best=null,bd=1e9;for(const p of M.P){if(p.team!==team||p===excl||p.off||(noGk&&p.gk))continue;const d=hyp(p.x-x,p.y-y);if(d<bd){bd=d;best=p}}return best}
  M.nearest=nearest;
  /* 킥오프·재시작 */
  function kickoff(team){for(const p of M.P)placeHome(p);const b=M.ball;Object.assign(b,{x:goalX,y:MY+PH/2,z:0,vx:0,vy:0,vz:0,owner:null,fire:0});
    const taker=nearest(team,goalX,MY+PH/2,null,true);taker.x=goalX+(team?-3:3);taker.y=MY+PH/2+(team?-6:6);b.owner=taker;b.last=team;M.state='kickoff';M.stT=team===0?.6:1.1;M.ctrl=team===0?taker:nearest(0,goalX,MY+PH/2,null,true);
    if(cfg.fo2){for(const p of M.P){p.stam=Math.min(1,p.stam+.25)}setPiece('kickoff',team,goalX,MY+PH/2)}}
  M.kickoff=kickoff;
  function restart(team,x,y,kind){if(cfg.fo2)return setPiece(kind,team,x,y);const b=M.ball;Object.assign(b,{x,y,z:0,vx:0,vy:0,vz:0,owner:null,fire:0});
    let taker=kind==='goalkick'?M.P.find(p=>p.team===team&&p.gk):nearest(team,x,y,null,true);taker.x=x+(x<goalX?-2:2);taker.y=y+(team===0?4:-4);b.owner=taker;b.last=team;taker.hold=0;
    M.state='restart';M.stT=.9;M.msg={s:{throw:'스로인',corner:'코너킥',goalkick:'골킥'}[kind],t:1};if(team===0&&!taker.gk)M.ctrl=taker}
  /* 패스·슛 */
  function passTo(p,tgt,G,ground){const b=M.ball;const lead=.35;let tx=tgt.x+tgt.vx*lead,ty=tgt.y+tgt.vy*lead;const acc=p.team===0&&M.ctrl===p?1:p.sk.pass;tx+=rnd(-1,1)*(1-acc)*14;ty+=rnd(-1,1)*(1-acc)*14;
    const d=hyp(tx-b.x,ty-b.y);const lob=!ground&&d>(cfg.lobDist||120);const sp=lob?clamp(d*1.15,120,190):clamp(d*1.6+50,110,240);
    b.owner=null;b.vx=(tx-b.x)/d*sp;b.vy=(ty-b.y)/d*sp;b.vz=lob?clamp(d*.75,70,130):0;b.last=p.team;b.lastP=p;p.kcd=.28;b.target=tgt;tgt.recv=.9;if(cfg.fo2)markOffside(p,tgt);G&&G.sfx(lob?'jump':'blip');
    if(p.team===0&&!tgt.gk)M.ctrl=tgt;M.energy=Math.min(1,M.energy+(p.team===0?.07:0))}
  function bestPass(p,dirx,diry){let best=null,bs=-1e9;const fwd=p.team===0?-1:1;
    for(const q of M.P){if(q.team!==p.team||q===p||q.gk&&dirx===undefined)continue;const dx=q.x-p.x,dy=q.y-p.y,d=hyp(dx,dy);if(d<14||d>220)continue;
      let sc=(dy*fwd)*.8-d*.25;let open=1e9;for(const o of M.P)if(o.team!==p.team){const t=clamp(((o.x-p.x)*dx+(o.y-p.y)*dy)/(d*d),0,1);const px=p.x+dx*t,py=p.y+dy*t;open=Math.min(open,hyp(o.x-px,o.y-py))}
      sc+=Math.min(open,30)*2.2;if(q.gk)sc-=200;
      if(dirx!==undefined&&(dirx||diry)){const dl=hyp(dirx,diry);const cos=(dx*dirx+dy*diry)/(d*dl);if(cos<.45)continue;sc+=cos*60}
      if(sc>bs){bs=sc;best=q}}return best}
  M.bestPass=bestPass;
  function shoot(p,power,aimDx,G,special){const b=M.ball;const gy=p.team===0?topY:botY;let tx=goalX+aimDx*GWD*.42;const acc=p.team===0?.8:p.sk.shot;tx+=rnd(-1,1)*GWD*.32*(1-acc)*(.6+power*.6);
    const d=hyp(tx-b.x,gy-b.y);const sp=special?380:170+power*150;b.owner=null;b.vx=(tx-b.x)/d*sp;b.vy=(gy-b.y)/d*sp;b.vz=special?12:20+power*55+(power>.92?70:0)+rnd(0,18)*(1-acc);
    b.last=p.team;b.lastP=p;b.shot=true;b.fire=special?1:0;p.kcd=.3;G&&G.sfx(special?'boom':'punch');if(special){M.energy=0;M.shake=4}}
  M.shoot=shoot;M.passTo=passTo;
  /* ---------- 업데이트 ---------- */
  M.update=function(G,dt){M.t+=dt;M.shake=Math.max(0,M.shake-dt*20);for(const q of M.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=60*dt;q.t-=dt}M.parts=M.parts.filter(q=>q.t>0);if(M.msg){M.msg.t-=dt;if(M.msg.t<=0)M.msg=null}
    if(M.state==='pens')return pensUpdate(G,dt);
    if(M.state==='goal'){M.stT-=dt;for(const p of M.P)moveP(p,dt,0,0,.3);ballPhys(G,dt,true);if(M.stT<=0)kickoff(1-M.goalTeam);return}
    if(M.state==='end')return;
    if(M.state==='setpiece')return spUpdate(G,dt);
    if(M.state==='kickoff'||M.state==='restart'){M.stT-=dt;const o=M.ball.owner;
      for(const p of M.P){if(p===o)continue;const h=homePos(p);aiMoveTo(p,h.x,h.y,dt,.9)}
      if(o){o.vx=o.vy=0;M.ball.x=o.x+o.dir.x*5;M.ball.y=o.y+o.dir.y*5}
      if(M.stT<=0){M.state='play';if(o&&o.team===0&&!o.gk)M.ctrl=o}else return}
    M.clock-=dt;if(cfg.fo2&&M.half===1&&M.clock<=cfg.duration/2){M.half=2;G.sfx('bell');M.msg={s:'하프타임 · 후반 시작',t:2,big:1};kickoff(1);return}
    if(M.clock<=0){M.clock=0;M.state='end';G.sfx('bell');cfg.onEnd&&cfg.onEnd(M);return}
    for(const p of M.P){p.stun=Math.max(0,p.stun-dt);p.kcd=Math.max(0,p.kcd-dt);p.recv=Math.max(0,(p.recv||0)-dt);p.contest=Math.max(0,(p.contest||0)-dt);if(cfg.fo2){p.stam=clamp(p.stam+(p.sprint&&hyp(p.vx,p.vy)>20?-.16:.045)*dt,0,1);p.sprint=false;if(p.wall)p.wall.t-=dt;if(p.runTo&&(p.runTo.t-=dt)<0)p.runTo=null;p.skill=Math.max(0,(p.skill||0)-dt)}}
    if(cfg.fo2)controlFO2(G,dt);else controlMe(G,dt);
    for(const p of M.P)if(!p.off&&(p!==M.ctrl||p.gk))ai(p,G,dt);
    if(cfg.fo2)airBalls(G,dt);
    ballPhys(G,dt);
    contest(G,dt);
    cam(dt)};
  function cam(dt){const v=cfg.view;if(!v)return;const b=M.ball;const tx=clamp(b.x-v.w/2,0,M.FW-v.w),ty=clamp(b.y-v.h/2+(M.ctrl&&M.ctrl===b.owner?-20:0),0,M.FH-v.h);M.cam.x+=(tx-M.cam.x)*Math.min(1,dt*5);M.cam.y+=(ty-M.cam.y)*Math.min(1,dt*5)}
  M.snapCam=function(){const v=cfg.view;if(!v)return;M.cam.x=clamp(M.ball.x-v.w/2,0,M.FW-v.w);M.cam.y=clamp(M.ball.y-v.h/2,0,M.FH-v.h)};
  function speedOf(p){let s=(p.contest>0?.82:1)*(cfg.speed||62)*(p.team===0?1:p.sk.spd)*(p.gk?.9:1)*(M.ball.owner===p?.86:1)*(p.stun?0:1);if(cfg.fo2){if(p.sprint&&p.stam>.05)s*=M.ball.owner===p?1.2:1.33;s*=.72+.28*Math.min(1,p.stam/.45)}return s}
  function moveP(p,dt,dx,dy,mul){const sp=speedOf(p)*(mul||1);const l=hyp(dx,dy);if(p.slide>0){p.slide-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.93;p.vy*=.93;if(p.slide<=0)p.stun=.35}
    else if(l>.01){const tvx=dx/l*sp,tvy=dy/l*sp;p.vx+=(tvx-p.vx)*Math.min(1,dt*10);p.vy+=(tvy-p.vy)*Math.min(1,dt*10);p.dir={x:dx/l,y:dy/l}}else{p.vx*=.8;p.vy*=.8}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=clamp(p.x,MX-(cfg.walls?-4:10),MX+PW+(cfg.walls?-4:10));p.y=clamp(p.y,MY-(cfg.walls?-4:12),MY+PH+(cfg.walls?-4:12));p.anim+=hyp(p.vx,p.vy)*dt*.25}
  function aiMoveTo(p,x,y,dt,mul){const dx=x-p.x,dy=y-p.y,d=hyp(dx,dy);if(d<2){moveP(p,dt,0,0);return}moveP(p,dt,dx,dy,(mul||1)*(d<10?.6:1))}
  /* 내 선수 조작 */
  function controlMe(G,dt){const k=G.keys,h=G.hit,b=M.ball;let c=M.ctrl;
    if(b.owner&&b.owner.team===0&&!b.owner.gk)c=M.ctrl=b.owner;
    if(!c||c.gk){c=M.ctrl=nearest(0,b.x,b.y,null,true)}
    const mine=b.owner===c;
    if(!mine&&(!b.owner||b.owner.team===1)){const n=nearest(0,b.x,b.y,null,true);if(h.a){M.ctrl=c=nearest(0,b.x,b.y,c,true)||c;G.sfx('tick')}
      else if(n!==c&&hyp(c.x-b.x,c.y-b.y)-hyp(n.x-b.x,n.y-b.y)>34&&!(b.target===c)){M.ctrl=c=n}}
    const dx=(k.right?1:0)-(k.left?1:0),dy=(k.down?1:0)-(k.up?1:0);
    if(c.stun<=0&&c.slide<=0)moveP(c,dt,dx,dy);else moveP(c,dt,0,0);
    if(mine){if(h.a){const t=bestPass(c,dx||c.dir.x,dy||c.dir.y)||bestPass(c);if(t)passTo(c,t,G)}
      if(k.b){c.charge=Math.min(.6,(c.charge||0)+dt)}
      else if(c.charge){const pw=clamp(c.charge/.6,0,1);const special=cfg.energy&&M.energy>=1&&pw>.9;shoot(c,pw,dx,G,special);c.charge=0}}
    else{c.charge=0;if(h.b&&c.slide<=0&&c.stun<=0){c.slide=.38;const l=hyp(dx,dy)||1;const ddx=dx||c.dir.x,ddy=dy||c.dir.y,ll=hyp(ddx,ddy)||1;c.vx=ddx/ll*150;c.vy=ddy/ll*150;G.sfx('move')}}}
  /* AI */
  function ai(p,G,dt){const b=M.ball;
    if(p.gk)return keeperAI(p,G,dt);
    if(cfg.fo2&&b.owner!==p){if(p.wall&&p.wall.t>0){p.sprint=true;return aiMoveTo(p,p.wall.x,p.wall.y,dt,1)}if(p.runTo){p.sprint=true;return aiMoveTo(p,p.runTo.x,p.runTo.y,dt,1)}
      if(p.press&&b.owner&&b.owner.team!==p.team){p.sprint=true;p.press=false;return aiMoveTo(p,b.x,b.y,dt,1)}}
    if(b.owner===p)return ownerAI(p,G,dt);
    const myBall=b.owner&&b.owner.team===p.team;
    if(p.recv>0&&!b.owner){aiMoveTo(p,b.x+b.vx*.2,b.y+b.vy*.2,dt,1.05);return}
    if(!myBall){const ch=nearest(p.team,b.x+b.vx*.25,b.y+b.vy*.25,null,true);
      if(ch===p){if(cfg.fo2&&hyp(p.x-b.x,p.y-b.y)>30)p.sprint=true;aiMoveTo(p,b.x+b.vx*.25,b.y+b.vy*.25,dt,1);
        if(p.team===1&&b.owner&&b.owner.team===0&&hyp(p.x-b.x,p.y-b.y)<16&&p.slide<=0&&Math.random()<dt*p.sk.slide*(cfg.fo2?.6:1)){p.slide=.35;const d=hyp(b.x-p.x,b.y-p.y)||1;p.vx=(b.x-p.x)/d*145;p.vy=(b.y-p.y)/d*145}
        return}}
    const h=homePos(p);
    if(myBall){/* 공격 지원: 빈 공간으로 */const fwd=p.team===0?-1:1;const run=(p.role==='fwd'?.12:p.role==='mid'?.06:0)*PH;let ty=h.y+fwd*run;
      if(cfg.fo2&&!p.gk){const line=offLine(p.team);ty=p.team===0?Math.max(ty,line+3):Math.min(ty,line-3);
        /* 공격수 침투: 가끔 수비 뒤로 달려 들어가요 (스루패스 받기용) */if(p.role!=='def'&&Math.random()<dt*(p.role==='fwd'?.35:.12)&&b.owner&&Math.abs(b.owner.y-p.y)<PH*.4){p.runTo={x:clamp(p.x+rnd(-25,25),MX+10,MX+PW-10),y:clamp(line+fwd*rnd(30,60),MY+10,MY+PH-10),t:1.6}}}
      aiMoveTo(p,h.x+Math.sin(M.t*.7+p.i)*10,ty,dt,.95)}
    else aiMoveTo(p,h.x,h.y,dt,.9)}
  function ownerAI(p,G,dt){const b=M.ball;const fwd=p.team===0?-1:1;const gy=p.team===0?topY:botY;p.dec-=dt;
    let ax=goalX-p.x,ay=gy-p.y;const dG=hyp(ax,ay);let near=null,nd=1e9;for(const o of M.P)if(o.team!==p.team){const d=hyp(o.x-p.x,o.y-p.y);if(d<nd){nd=d;near=o}}
    if(p.dec<=0){p.dec=rnd(.25,.55)/(p.sk.think||1)*(cfg.fo2&&p.contest>0?2.2:1);if(cfg.fo2&&p.contest>0&&Math.random()<.45)return;
      if(dG<(cfg.shootRange||100)&&Math.random()<(dG<60?.75:.4)){const aim=rnd(-1,1);shoot(p,rnd(.35,.85),aim,G,false);return}
      if(cfg.fo2){const runner=M.P.find(q=>q.team===p.team&&q.runTo&&!q.off&&q!==p);if(runner&&Math.random()<.55*p.sk.pass+.15){throughTo(p,runner,rnd(.4,.8),false,G);return}
        const wide=Math.abs(p.x-goalX)>PW*.24&&(p.team===0?p.y<MY+PH*.3:p.y>MY+PH*.7);if(wide&&Math.random()<.5){cross(p,rnd(.3,.8),G);return}}
      if(nd<(cfg.pressDist||18)&&Math.random()<.65){const t=bestPass(p);if(t){passTo(p,t,G);return}}
      if(Math.random()<.18){const t=bestPass(p);if(t&&(t.y-p.y)*fwd>20){passTo(p,t,G);return}}}
    let mx=ax/dG,my=ay/dG;if(near&&nd<30){const ox=p.x-near.x,oy=p.y-near.y,ol=hyp(ox,oy)||1;mx+=ox/ol*1.1*(30-nd)/30;my+=oy/ol*.5*(30-nd)/30}
    mx+=Math.sin(M.t*2+p.i)*.3;moveP(p,dt,mx,my,.95)}
  function keeperAI(p,G,dt){const b=M.ball;const myGoalY=p.team===0?botY:topY;const toward=(p.team===0?b.vy>0:b.vy<0)&&!b.owner;
    if(b.owner===p){p.hold+=dt;p.vx=p.vy=0;b.x=p.x;b.y=p.y+(p.team===0?-5:5);if(p.hold>(p.team===0?.9:1.1)){const t=bestPass(p);if(t){passTo(p,t,G)}else shoot(p,.5,rnd(-1,1),G)}return}
    if(toward&&b.shot){const tt=(myGoalY-b.y)/b.vy;if(tt>0&&tt<1.2){const cx=b.x+b.vx*tt;const react=p.team===0?.14:(cfg.keeperReact||.15)*(1.5-p.sk.keeper);
        if(M.t-(b.shotT||0)>react){const tx=clamp(cx,goalX-GWD/2-6,goalX+GWD/2+6);const sp=(cfg.speed||62)*1.5*(p.team===0?.85:p.sk.keeper+.2);const dx=tx-p.x;p.x+=clamp(dx,-sp*dt,sp*dt);p.dive=Math.sign(dx);p.vx=0}}}
    else{p.dive=0;const h=homePos(p);const o=b.owner;const dGoal=hyp(b.x-goalX,b.y-myGoalY);
      if(cfg.fo2&&p.team===0&&M.inp&&M.inp.held.W&&!(b.owner&&b.owner.team===0)){p.sprint=true;aiMoveTo(p,b.x,b.y,dt,1.2);if(o&&hyp(b.x-p.x,b.y-p.y)<8){b.owner=p;p.hold=0;o.stun=.4;o.kcd=.5;G.sfx('land');M.msg={s:'키퍼가 잡았다!',t:.9}}}
      else if(o&&o.team!==p.team&&dGoal<(cfg.rushDist||GWD*1.3)){/* 골키퍼가 달려 나와 각도 좁히기 */aiMoveTo(p,b.x,b.y,dt,1.15);if(hyp(b.x-p.x,b.y-p.y)<8){p.grab=(p.grab||0)+dt*(p.team===0?2.5:1.5+p.sk.keeper*2);if(p.grab>.3){p.grab=0;b.owner=p;p.hold=0;o.stun=.4;o.kcd=.5;G.sfx('land');M.msg={s:p.team===0?'키퍼가 잡았다!':'키퍼에게 뺏겼다!',t:.9}}}}
      else{p.grab=0;aiMoveTo(p,h.x,h.y,dt,1)}}
    const d=hyp(b.x-p.x,b.y-p.y);if(!b.owner&&d<9&&b.z<GH+5&&b.last!==p.team||(!b.owner&&d<7&&b.z<14&&hyp(b.vx,b.vy)<90)){
      const spd=hyp(b.vx,b.vy);if(b.fire&&Math.random()<.75){b.vx*=.8;b.vy*=.8;M.shake=4;return}
      if(spd<175*(p.team===0?.9:p.sk.keeper+.15)||Math.random()<.25){b.owner=p;p.hold=0;b.shot=false;b.fire=0;b.vz=0;b.z=0;G.sfx('land');if(spd>140){M.msg={s:p.team===0?'선방!':'막혔다!',t:1};if(p.team===0)G.add(50)}}
      else{b.vx=-b.vx*.4+rnd(-60,60);b.vy=-b.vy*.5;b.vz=40;b.shot=false;b.last=p.team;G.sfx('hit');M.msg={s:'쳐냈다!',t:.9}}}}
  /* 공 */
  function ballPhys(G,dt,free){const b=M.ball;
    if(b.owner&&!free&&cfg.fo2&&!b.owner.gk&&M.state==='play'){dribble(b.owner,dt,G);bounds(G);return}
    if(b.owner&&!free){const o=b.owner;const off=o.gk?5:6;b.x+=(o.x+o.dir.x*off-b.x)*Math.min(1,dt*18);b.y+=(o.y+o.dir.y*off-b.y)*Math.min(1,dt*18);b.z=Math.abs(Math.sin(o.anim*1.2))*2;b.vx=o.vx;b.vy=o.vy;b.vz=0;b.last=o.team;b.shot=false;b.fire=0;b.spin+=hyp(o.vx,o.vy)*dt*.2;bounds(G);return}
    if(b.shot&&!b.shotT)b.shotT=M.t;if(!b.shot)b.shotT=0;
    if(b.curveT>0){b.curveT-=dt;const sp=hyp(b.vx,b.vy)||1;b.vx+=(-b.vy/sp)*b.curve*dt*-1;b.vy+=(b.vx/sp)*b.curve*dt*-1}
    const steps=3;for(let s=0;s<steps;s++){const h=dt/steps;const px=b.x,py=b.y;b.x+=b.vx*h;b.y+=b.vy*h;b.vz-=380*h;b.z+=b.vz*h;if(b.z<=0){b.z=0;if(Math.abs(b.vz)>30)b.vz=-b.vz*.45;else b.vz=0;const f=Math.exp(-(b.fire?.4:1.5)*h);b.vx*=f;b.vy*=f}else{const f=Math.exp(-.25*h);b.vx*=f;b.vy*=f}
      b.spin+=hyp(b.vx,b.vy)*h*.2;
      if(free)continue;
      /* 골·라인 */
      const inMouth=Math.abs(b.x-goalX)<GWD/2;
      for(const [ly,scorer,dirSign] of [[topY,0,-1],[botY,1,1]]){const crossed=dirSign<0?(py>=ly&&b.y<ly):(py<=ly&&b.y>ly);if(!crossed)continue;
        if(inMouth&&b.z<GH){goal(G,scorer);return}
        if(inMouth&&b.z>=GH&&b.z<GH+3){b.vy=-b.vy*.5;b.vz=-20;b.y=ly-dirSign*1;G.sfx('block');M.msg={s:'크로스바!',t:.9};continue}
        if(Math.abs(b.x-goalX)<GWD/2+2&&Math.abs(b.x-goalX)>=GWD/2-1&&b.z<GH){b.vx=-b.vx*.6;b.vy=-b.vy*.6;b.y=ly-dirSign*1;G.sfx('block');M.msg={s:'골대 땡!',t:.9};continue}
        if(cfg.walls){b.vy=-b.vy*.8;b.y=ly-dirSign*1;G.sfx('tick');continue}
        /* 골킥·코너 */const defTeam=dirSign<0?1:0;if(b.last===defTeam){const cx=b.x<goalX?MX+2:MX+PW-2;restart(1-defTeam,cx,ly-dirSign*2,'corner')}else restart(defTeam,goalX+(b.x<goalX?-14:14),ly-dirSign*14,'goalkick');return}
      if(b.x<MX||b.x>MX+PW){if(cfg.walls){b.vx=-b.vx*.8;b.x=clamp(b.x,MX,MX+PW);G.sfx('tick')}else{restart(1-b.last,clamp(b.x,MX+1,MX+PW-1),clamp(b.y,MY+4,MY+PH-4),'throw');return}}}
    if(!free&&bounds(G))return;
    if(b.fire&&Math.random()<.8)M.parts.push({x:b.x,y:b.y-b.z,vx:rnd(-20,20),vy:rnd(-20,20),t:.35,col:Math.random()<.5?'#ff9b3d':'#ffd23f'});
    /* 줍기 */
    if(!b.owner&&b.z<8){let best=null,bd=8;for(const p of M.P){if(p.stun>0||p.kcd>0||p.gk)continue;const d=hyp(p.x-b.x,p.y-b.y)-(cfg.fo2&&b.target===p?4:0);if(d<bd){bd=d;best=p}}
      if(best){const sp=hyp(b.vx,b.vy);if(best.slide>0){/* 태클로 걷어냄 */b.vx=best.vx*1.3;b.vy=best.vy*1.3;b.last=best.team;best.kcd=.2;G.sfx('hit');}
        else if(b.fire&&best.team!==b.last){best.stun=.6;b.vx*=.85;b.vy*=.85}
        else{if(cfg.fo2&&b.offTgt===best){b.offTgt=null;M.msg={s:'오프사이드!',t:1.4};G.sfx('bell');setPiece('fk',1-best.team,best.x,best.y);return}
          b.offTgt=null;b.owner=best;b.target=null;best.recv=0;best.runTo=null;best.dec=rnd(.15,.35);if(best.team===0)M.ctrl=best;if(sp>60)G.sfx('tick');if(cfg.fo2&&best.team===0&&best.pend){const q=best.pend;best.pend=null;doAction(best,q.k,q.pw,q.combo,q.dx,q.dy,G)}}}}}
  /* 드리블: 공을 발에 붙이지 않고 툭툭 차면서 따라가요.
     천천히 = 발밑, 뛰기 = 앞으로 툭, 대시 = 길게 차 놓고 쫓기, C 누르고 있기 = 짧게 붙여서. 방향을 확 틀면 공이 원래 방향으로 굴러가요 */
  function dribble(o,dt,G){const b=M.ball;const sp=hyp(o.vx,o.vy);b.z=0;b.vz=0;b.last=o.team;b.shot=false;b.fire=0;
    b.x+=b.vx*dt;b.y+=b.vy*dt;const fr=Math.exp(-3*dt);b.vx*=fr;b.vy*=fr;b.spin+=hyp(b.vx,b.vy)*dt*.2;
    o.touch=Math.max(0,(o.touch||0)-dt);const close=o.closeCtl;
    /* 공이 있어야 할 자리: 발 앞 (뛰는 속도에 따라 조금씩 멀리) */
    const lead=sp<14?3.2:close?2.6:o.sprint?6:4.2;const fx=o.x+o.dir.x*lead,fy=o.y+o.dir.y*lead;
    const ex=b.x-fx,ey=b.y-fy,err=hyp(ex,ey);const rx=b.x-o.x,ry=b.y-o.y;const ang=Math.acos(clamp((rx*o.dir.x+ry*o.dir.y)/(hyp(rx,ry)||1),-1,1));
    if(sp<14){/* 서 있으면 발밑에 붙여요 */b.vx+=(fx-b.x)*dt*30;b.vy+=(fy-b.y)*dt*30;b.vx*=.84;b.vy*=.84}
    else{const iv=close?.15:o.sprint?.3:.22;/* 다음 터치까지 걸리는 시간 */
      const cut=ang>1.1&&hyp(rx,ry)>1.5;/* 방향을 크게 틀면 바로 방향 전환 터치 */
      if((o.touch<=0&&(err>1.2||ahead()))||(cut&&o.touch<iv*.8)||err>(o.sprint?10:7)){
        const tx=o.x+o.vx*iv+o.dir.x*(lead+(o.sprint?2:.6)),ty=o.y+o.vy*iv+o.dir.y*(lead+(o.sprint?2:.6));const j=1+rnd(-.08,.08);
        b.vx=(tx-b.x)/iv*j;b.vy=(ty-b.y)/iv*j;o.touch=iv;if(cut){o.vx*=.8;o.vy*=.8}}
      function ahead(){return true}}
    if(hyp(b.x-o.x,b.y-o.y)>(o.sprint?20:15)){b.owner=null;o.kcd=.12}}
  /* 줄 밖으로 나간 공 정리 (드리블로 나가거나 한 번에 넘어간 경우) */
  function bounds(G){const b=M.ball;if(M.state!=='play')return false;const inM=Math.abs(b.x-goalX)<GWD/2;
    if(b.y<MY-1||b.y>MY+PH+1){const top=b.y<MY;const ly=top?MY:MY+PH;
      if(inM&&b.z<GH){b.owner=null;goal(G,top?0:1);return true}
      if(cfg.walls){b.owner=null;b.y=top?MY+1:MY+PH-1;b.vy=(top?1:-1)*Math.abs(b.vy)*.8;return false}
      const defTeam=top?1:0;b.owner=null;if(b.last===defTeam)restart(1-defTeam,b.x<goalX?MX+2:MX+PW-2,top?MY+2:MY+PH-2,'corner');else restart(defTeam,goalX+(b.x<goalX?-14:14),top?MY+14:MY+PH-14,'goalkick');return true}
    if(b.x<MX-1||b.x>MX+PW+1){if(cfg.walls){b.owner=null;b.x=clamp(b.x,MX+1,MX+PW-1);b.vx=-b.vx*.8;return false}b.owner=null;restart(1-b.last,clamp(b.x,MX+1,MX+PW-1),clamp(b.y,MY+4,MY+PH-4),'throw');return true}
    return false}
  M.ballPhys=ballPhys;
  function contest(G,dt){const b=M.ball,o=b.owner;if(!o||o.gk)return;
    for(const p of M.P){if(p.team===o.team||p.stun>0||p.gk)continue;const d=hyp(p.x-b.x,p.y-b.y);
      if(cfg.fo2&&p.slide>0&&d<10&&!p.fouled){const sv=hyp(p.vx,p.vy)||1;const behind=(p.vx*o.dir.x+p.vy*o.dir.y)/sv>.45;const foul=Math.random()<(behind?.75:.14);if(foul){p.fouled=true;return commitFoul(p,o,behind,G)}}
      if(cfg.fo2&&o.skill>0&&p.slide<=0)continue;
      if(cfg.fo2&&p.slide<=0&&d<6&&hyp(b.x-o.x,b.y-o.y)>7){/* 공이 발에서 떨어진 틈에 끊기 */b.owner=null;b.vx=p.dir.x*45+rnd(-15,15);b.vy=p.dir.y*45+rnd(-15,15);b.last=p.team;o.kcd=.3;G.sfx('punch');if(p.team===0)M.msg={s:'끊어냈다!',t:.6};return}
      if(p.slide>0&&d<10){b.owner=null;b.vx=p.vx*1.2+rnd(-30,30);b.vy=p.vy*1.2+rnd(-30,30);b.last=p.team;o.stun=.55;o.kcd=.4;G.sfx('hit');if(p.team===0){M.energy=Math.min(1,M.energy+.15);G.add(20)}M.shake=3;return}
      if(cfg.fo2){/* 몸싸움: 공 가진 선수에게 붙어 있으면 자동으로 밀고 당기다가, 오래 버티면 뺏어요 */const pd=hyp(p.x-o.x,p.y-o.y);
        if(pd<10&&p.slide<=0){p.body=(p.body||0)+dt*(p.team===0?1:.55+p.sk.tackle*.35)*(o.sprint?1.35:1)*(o.closeCtl?.6:1);o.contest=.15;p.contest=.15;
          if(pd<5.5){const ux=(o.x-p.x)/(pd||1),uy=(o.y-p.y)/(pd||1);o.x+=ux*10*dt;o.y+=uy*10*dt;p.x-=ux*6*dt;p.y-=uy*6*dt}
          if(p.body>(p.team===0?.85:1.35)){p.body=0;b.owner=p;b.target=null;o.kcd=.45;o.stun=.25;G.sfx('punch');M.shake=2;if(p.team===0){M.ctrl=p;M.msg={s:'몸싸움 승리!',t:.8};G.add(30)}else M.msg={s:'몸싸움에서 밀렸다!',t:.8};return}}
        else p.body=Math.max(0,(p.body||0)-dt*1.5);continue}
      if(d<7){p.steal=(p.steal||0)+dt*(p.team===0?1.5:p.sk.tackle);if(p.steal>.45){p.steal=0;b.owner=null;b.vx=p.dir.x*40+rnd(-25,25);b.vy=p.dir.y*40+rnd(-25,25);b.last=p.team;o.kcd=.35;G.sfx('punch');if(p.team===0)M.energy=Math.min(1,M.energy+.1)}}else p.steal=Math.max(0,(p.steal||0)-dt)}}
  function goal(G,team){M.score[team]++;M.goalTeam=team;M.state='goal';M.stT=2.4;M.shake=8;G.sfx('clear');M.msg={s:team===0?'GOAL!!':'실점…',t:2.2,big:1};navigator.vibrate&&navigator.vibrate(150);
    if(team===0){G.add(cfg.goalPts||300);for(let i=0;i<50;i++)M.parts.push({x:M.ball.x,y:M.ball.y,vx:rnd(-120,120),vy:rnd(-140,40),t:1.6,col:['#ff4f7b','#ffd23f','#4fe3b2','#3fd0ff','#fff'][i%5]})}
    cfg.onGoal&&cfg.onGoal(M,team)}
  /* ================= FO2 모드 (피파온라인2식 조작) ================= */
  const attDir=t=>t===0?-1:1;
  function offLine(team){/* team이 공격할 때의 오프사이드 라인 = 상대 뒤에서 두 번째 선수 */const ys=M.P.filter(q=>q.team!==team&&!q.off).map(q=>q.y).sort((a,b)=>team===0?a-b:b-a);let line=ys[1]!=null?ys[1]:MY+PH/2;const half=MY+PH/2;return team===0?Math.min(line,half):Math.max(line,half)}
  M.offLine=offLine;
  function markOffside(p,tgt){const b=M.ball;b.offTgt=null;if(!tgt||tgt.team!==p.team||M.state!=='play')return;const line=offLine(p.team);const f=attDir(p.team);
    const beyond=f<0?(tgt.y<line-2&&tgt.y<b.y-2):(tgt.y>line+2&&tgt.y>b.y+2);if(beyond)b.offTgt=tgt}
  function launch(p,tx,ty,sp,vz,G,snd){const b=M.ball;const d=hyp(tx-b.x,ty-b.y)||1;b.owner=null;b.vx=(tx-b.x)/d*sp;b.vy=(ty-b.y)/d*sp;b.vz=vz;b.last=p.team;b.lastP=p;b.shot=false;b.curve=0;p.kcd=.28;G&&G.sfx(snd||'blip')}
  function throughTo(p,tgt,pw,lob,G){const f=attDir(p.team);let tx=tgt.x+(tgt.runTo?(tgt.runTo.x-tgt.x)*.6:0),ty=tgt.y+f*(26+pw*70);if(tgt.runTo)ty=(tgt.runTo.y+ty)/2;
    tx=clamp(tx+rnd(-1,1)*(1-(p.team===0?.9:p.sk.pass))*12,MX+6,MX+PW-6);ty=clamp(ty,MY+4,MY+PH-4);const d=hyp(tx-M.ball.x,ty-M.ball.y);
    markOffside(p,tgt);const off=M.ball.offTgt;launch(p,tx,ty,lob?clamp(d*1.05,110,175):clamp(d*1.25+60,120,250),lob?clamp(d*.6,55,110):0,G,lob?'jump':'blip');M.ball.offTgt=off;M.ball.target=tgt;
    tgt.recv=1.6;tgt.runTo={x:tx,y:ty,t:1.6};if(p.team===0&&!tgt.gk)M.ctrl=tgt}
  function lobTo(p,tgt,pw,G){const tx=tgt.x+tgt.vx*.5,ty=tgt.y+tgt.vy*.5;const d=hyp(tx-M.ball.x,ty-M.ball.y);markOffside(p,tgt);const off=M.ball.offTgt;
    launch(p,tx,ty,clamp(d*1.0,100,190)*(.85+pw*.3),clamp(d*.62,60,135),G,'jump');M.ball.offTgt=off;M.ball.target=tgt;tgt.recv=1.4;if(p.team===0&&!tgt.gk)M.ctrl=tgt}
  function cross(p,pw,G){const f=attDir(p.team);const gy=f<0?topY:botY;const bh=cfg.boxH||PH*.14;const tx=goalX+(p.x<goalX?1:-1)*rnd(0,1)*GWD*.4*(pw*2-1)+rnd(-6,6),ty=gy-f*bh*(.3+pw*.45);
    const d=hyp(tx-M.ball.x,ty-M.ball.y);launch(p,tx,ty,clamp(d*1.1,110,190),clamp(d*.55,60,120),G,'jump');M.ball.cross=true;
    const att=M.P.filter(q=>q.team===p.team&&!q.gk&&!q.off&&q!==p).sort((a,b)=>hyp(a.x-tx,a.y-ty)-hyp(b.x-tx,b.y-ty)).slice(0,2);att.forEach((q,i)=>{q.runTo={x:tx+(i?8:-4),y:ty+(i?6:0),t:1.4};q.recv=1.2})
    M.msg={s:'크로스!',t:.7}}
  M.throughTo=throughTo;
  function shootFO2(p,pw,dx,kind,G){const b=M.ball;const f=attDir(p.team);const gy=f<0?topY:botY;const press=M.P.some(o=>o.team!==p.team&&!o.gk&&hyp(o.x-p.x,o.y-p.y)<10);
    const dist=hyp(goalX-p.x,gy-p.y);let acc=(p.team===0?.9:p.sk.shot)-(press?.18:0)-Math.max(0,dist-90)/400-(pw>.85?(pw-.85)*1.5:0);
    let tx=goalX+(dx||rnd(-.6,.6))*GWD*.43;tx+=rnd(-1,1)*GWD*.45*(1-clamp(acc,0,1));const d=hyp(tx-b.x,gy-b.y);
    let sp,vz;if(kind==='chip'){sp=clamp(d*1.15,110,190);vz=clamp(d*.7,60,105)}else if(kind==='finesse'){sp=150+pw*90;vz=14+pw*30;b.curve=(tx<goalX?1:-1)*(55+pw*40)}else{sp=170+pw*170;vz=10+pw*45+(pw>.88?(pw-.88)*500:0)+rnd(0,15)*(1-acc)}
    b.owner=null;b.vx=(tx-b.x)/d*sp;b.vy=(gy-b.y)/d*sp;b.vz=vz;if(kind==='finesse'){const t=d/sp;const ax=(b.vy/sp)*b.curve;const tx2=tx-.5*ax*t*t,d2=hyp(tx2-b.x,gy-b.y);b.vx=(tx2-b.x)/d2*sp;b.vy=(gy-b.y)/d2*sp;b.curveT=t}else b.curve=0;
    b.last=p.team;b.lastP=p;b.shot=true;b.fire=0;p.kcd=.3;G&&G.sfx('punch');M.msg={s:kind==='chip'?'칩슛!':kind==='finesse'?'감아차기!':'슛!',t:.6}}
  function doAction(c,k,pw,combo,dx,dy,G){const ddx=dx||c.dir.x,ddy=dy||c.dir.y;
    if(k==='S'){const t=bestPass(c,ddx,ddy)||bestPass(c);if(!t)return;passTo(c,t,G,true);const b=M.ball;const d=hyp(b.vx,b.vy)||1;const sp=clamp(d*(.78+pw*.45),90,260);b.vx=b.vx/d*sp;b.vy=b.vy/d*sp;
      if(combo){/* 2:1 패스: 패스한 선수가 앞으로 달려 들어가요 */const f=attDir(c.team);c.wall={x:clamp(c.x+ddx*10,MX+8,MX+PW-8),y:clamp(c.y+f*70,MY+8,MY+PH-8),t:2.2};M.msg={s:'2:1 패스',t:.7}}}
    else if(k==='W'){let t=null,bs=-1e9;const f=attDir(c.team);for(const q of M.P){if(q.team!==c.team||q===c||q.gk||q.off)continue;const vx=q.x-c.x,vy=q.y-c.y,d=hyp(vx,vy);if(d<10||d>230)continue;
        const cos=(vx*ddx+vy*ddy)/(d*(hyp(ddx,ddy)||1));if(cos<.2)continue;const sc=cos*80+(q.y-c.y)*f*.6+(q.runTo?40:0)-d*.12;if(sc>bs){bs=sc;t=q}}
      if(!t)t=bestPass(c,ddx,ddy)||bestPass(c);if(t){throughTo(c,t,pw,combo,G);M.msg={s:combo?'로빙 스루!':'스루패스!',t:.7}}}
    else if(k==='A'){const f=attDir(c.team);const wide=Math.abs(c.x-goalX)>PW*.2&&(f<0?c.y<MY+PH*.32:c.y>MY+PH*.68);if(wide&&!combo){cross(c,pw,G);return}
      const t=bestPass(c,ddx,ddy)||bestPass(c);if(t){lobTo(c,t,pw,G);M.msg={s:'롱패스',t:.6}}}
    else if(k==='D'){shootFO2(c,pw,dx,combo?'finesse':'power',G)}
    else if(k==='Q'){longPass(c,pw,ddx,ddy,G)}}
  M.doAction=doAction;
  /* 롱패스: 누른 방향 쪽 멀리 있는 동료에게 낮고 빠르게 띄워서 (전환 패스) */
  function longPass(c,pw,dx,dy,G){let t=null,bs=-1e9;for(const q of M.P){if(q.team!==c.team||q===c||q.gk||q.off)continue;const vx=q.x-c.x,vy=q.y-c.y,d=hyp(vx,vy);if(d<70)continue;
      const cos=(vx*dx+vy*dy)/(d*(hyp(dx,dy)||1));if(cos<.35)continue;let open=1e9;for(const o of M.P)if(o.team!==c.team&&!o.off)open=Math.min(open,hyp(o.x-q.x,o.y-q.y));const sc=cos*60+Math.min(d,220)*.35+Math.min(open,40)*1.5;if(sc>bs){bs=sc;t=q}}
    if(!t){t=bestPass(c,dx,dy)||bestPass(c);if(!t)return}const tx=t.x+t.vx*.6,ty=t.y+t.vy*.6;const d=hyp(tx-M.ball.x,ty-M.ball.y);markOffside(c,t);const off=M.ball.offTgt;
    launch(c,tx,ty,clamp(d*1.15,150,250)*(.9+pw*.2),clamp(d*.32,38,85),G,'jump');M.ball.offTgt=off;M.ball.target=t;t.recv=1.5;if(c.team===0&&!t.gk)M.ctrl=t;M.msg={s:'롱패스',t:.6}}
  /* 선수 바꾸기: 공에 가까운 선수부터 차례대로 */
  M.switchPlayer=function(G){const b=M.ball;if(b.owner&&b.owner.team===0&&!b.owner.gk){M.msg={s:'공 가진 선수예요',t:.5};return}
    const order=M.P.filter(q=>q.team===0&&!q.gk&&!q.off).sort((a,q)=>hyp(a.x-b.x,a.y-b.y)-hyp(q.x-b.x,q.y-b.y));const i=order.indexOf(M.ctrl);M.ctrl=order[(i+1)%Math.min(3,order.length)]||M.ctrl;M.lockCtrl=.8;G.sfx('tick')};
  function inDir(k){const sx=(k.right?1:0)-(k.left?1:0),sy=(k.down?1:0)-(k.up?1:0);return cfg.sideView?[sy,-sx]:[sx,sy]}M.inDir=inDir;
  function controlFO2(G,dt){const k=G.keys,b=M.ball,I=M.inp||{held:{},down:{},up:{}};let c=M.ctrl;
    if(b.owner&&b.owner.team===0&&!b.owner.gk)c=M.ctrl=b.owner;if(!c||c.gk||c.off)c=M.ctrl=nearest(0,b.x,b.y,null,true);
    const mine=b.owner===c;const [dx,dy]=inDir(k);const attacking=b.owner?b.owner.team===0:b.last===0;
    const rdt=dt/(M.timeScale||1);const combo=!!I.held.C;
    if(I.held.E)c.sprint=true;
    if(I.down.X&&!mine){I.down.X=0;M.switchPlayer(G);c=M.ctrl}
    if(mine||(attacking&&!b.owner&&b.target===c)){
      for(const key of ['S','W','A','D','Q'])if(I.down[key]){c.gauge={k:key,t:0,combo};if(combo)c.cUsed=true}
      if(c.gauge){c.gauge.t+=rdt;const g=c.gauge;if(!I.held[g.k]||g.t>1.1){const pw=clamp(g.t/.9,0,1);c.gauge=null;if(mine){doAction(c,g.k,pw,g.combo,dx,dy,G);M.qArm=0}else c.pend={k:g.k,pw,combo:g.combo,dx,dy}}}
      c.closeCtl=!!I.held.C&&!c.sprint;
      if(I.down.C){c.cT=0;c.cUsed=false}if(I.held.C)c.cT=(c.cT||0)+rdt;
      if(mine&&I.up.C&&!c.cUsed&&(c.cT||0)<.28&&(c.skillCd||0)<=0&&hyp(c.vx,c.vy)>20){c.skill=.45;c.skillCd=1.1;const s=Math.random()<.5?1:-1;c.vx+=(-c.dir.y)*s*95;c.vy+=(c.dir.x)*s*95;M.msg={s:['헛다리!','마르세유 턴!','드래그 백!'][Math.floor(Math.random()*3)],t:.6};G.sfx('turn')}
      c.skillCd=Math.max(0,(c.skillCd||0)-dt);
      if(!b.owner&&b.z>3&&b.z<14&&hyp(c.x-b.x,c.y-b.y)<8&&(I.down.D||I.down.S)){/* 헤딩·발리 */if(I.down.D){b.owner=c;shootFO2(c,.65,dx,'power',G);M.msg={s:b.z>8?'헤딩슛!':'발리슛!',t:.8}}else{b.owner=c;const t=bestPass(c,dx||c.dir.x,dy||c.dir.y)||bestPass(c);if(t)passTo(c,t,G)}}
      if(c.stun<=0){if(!mine&&b.target===c&&!b.owner&&!dx&&!dy){/* 패스 받는 선수: 손 안 대면 알아서 공 쪽으로 */const t=.3;moveP(c,dt,b.x+b.vx*t-c.x,b.y+b.vy*t-c.y);c.sprint=c.sprint||hyp(b.x-c.x,b.y-c.y)>30}else moveP(c,dt,dx,dy)}else moveP(c,dt,0,0);return}
    /* 수비 */c.gauge=null;
    if(I.down.X){I.down.X=0;M.switchPlayer(G);c=M.ctrl}
    if(I.down.Q){M.lockCtrl=.8;const order=M.P.filter(q=>q.team===0&&!q.gk&&!q.off).sort((a,bq)=>hyp(a.x-b.x,a.y-b.y)-hyp(bq.x-b.x,bq.y-b.y));const i=order.indexOf(c);M.ctrl=c=order[(i+1)%Math.min(3,order.length)]||c;G.sfx('tick')}
    if(I.held.A){const mate=M.P.filter(q=>q.team===0&&q!==c&&!q.gk&&!q.off).sort((a,bq)=>hyp(a.x-b.x,a.y-b.y)-hyp(bq.x-b.x,bq.y-b.y))[0];if(mate)mate.press=true}
    const o=b.owner;
    if(I.held.S&&o&&o.team===1&&c.stun<=0&&c.slide<=0){/* 압박: 공 가진 선수에게 붙기 + 스탠딩 태클 */c.sprint=c.sprint||hyp(o.x-c.x,o.y-c.y)>25;const gx=o.x+(goalX-o.x)*.0,gy=o.y+(o.team===1?6:-6)*.5;moveP(c,dt,gx-c.x,gy-c.y);
      c.tk=(c.tk||0)-dt;if(hyp(c.x-b.x,c.y-b.y)<8&&c.tk<=0){c.tk=.45;if(Math.random()<.42-(o.sk.spd-1)*.5){b.owner=null;b.vx=c.dir.x*55+rnd(-20,20);b.vy=c.dir.y*55+rnd(-20,20);b.last=0;o.kcd=.35;G.sfx('punch');M.msg={s:'태클 성공!',t:.6};G.add(20)}else{c.stun=.2;G.sfx('tick')}}}
    else if(c.stun<=0&&c.slide<=0)moveP(c,dt,dx,dy);else moveP(c,dt,0,0);
    M.lockCtrl=Math.max(0,(M.lockCtrl||0)-rdt);if(!I.held.S&&!(b.target===c)&&!M.lockCtrl){const n=nearest(0,b.x,b.y,null,true);if(n!==c&&hyp(c.x-b.x,c.y-b.y)-hyp(n.x-b.x,n.y-b.y)>45)M.ctrl=c=n}
    if(I.down.D&&c.slide<=0&&c.stun<=0){c.slide=.4;c.fouled=false;const ddx=dx||c.dir.x,ddy=dy||c.dir.y,ll=hyp(ddx,ddy)||1;c.vx=ddx/ll*150;c.vy=ddy/ll*150;G.sfx('move')}}
  /* 공중볼: AI 헤딩 (공격수는 슛, 수비수는 걷어내기) */
  function airBalls(G,dt){const b=M.ball;if(b.owner||b.z<3||b.z>14||b.vz>40)return;let best=null,bd=7;for(const p of M.P){if(p.gk||p.off||p.stun>0||p.kcd>0||p===M.ctrl&&p.team===0)continue;const d=hyp(p.x-b.x,p.y-b.y);if(d<bd){bd=d;best=p}}
    if(!best)return;const f=attDir(best.team);const gy=f<0?topY:botY;const inBox=hyp(goalX-best.x,gy-best.y)<(cfg.boxH||PH*.14)*1.6;
    if(inBox&&b.cross!==false&&b.last===best.team){b.owner=best;shootFO2(best,.55,rnd(-.8,.8),'power',G);M.ball.vz=-10;M.msg={s:best.team===0?'헤딩슛!':'상대 헤딩!',t:.8}}
    else{const own=f<0?botY:topY;if(hyp(goalX-best.x,own-best.y)<(cfg.boxH||PH*.14)*1.8&&b.last!==best.team){b.owner=best;launch(best,clamp(best.x+rnd(-50,50),MX+10,MX+PW-10),best.y+f*90,170,80,G,'hit');M.msg={s:'걷어냈다!',t:.6}}
      else if(Math.random()<dt*8){b.owner=best;const t=bestPass(best);if(t)passTo(best,t,G);else b.owner=null}}}
  /* 반칙·카드 */
  function commitFoul(p,victim,behind,G){const b=M.ball;victim.stun=.8;G.sfx('bell');M.shake=4;let card='';
    if(behind&&Math.random()<.55){p.yc++;card=p.yc>=2?'퇴장!':'경고';if(p.yc>=2){p.off=true;p.x=-999}}
    const f=attDir(victim.team);const gy=f<0?topY:botY;const bw=cfg.boxW||GWD*2.6,bh=cfg.boxH||PH*.14;const inBox=Math.abs(victim.x-goalX)<bw/2&&Math.abs(victim.y-gy)<bh;
    M.msg={s:(inBox?'페널티킥! ':'반칙! ')+(card?(card==='경고'?'🟨 경고':'🟥 퇴장'):''),t:1.8,big:inBox?1:0};
    if(inBox)setPiece('pen',victim.team,goalX,gy-f*bh*.68);else setPiece('fk',victim.team,victim.x,victim.y)}
  /* 세트피스: 직접 차요 (우리 팀) / AI는 잠시 후 자동 */
  function setPiece(kind,team,x,y){const b=M.ball;x=clamp(x,MX+1,MX+PW-1);y=clamp(y,MY+1,MY+PH-1);Object.assign(b,{x,y,z:0,vx:0,vy:0,vz:0,owner:null,fire:0,shot:false,offTgt:null,target:null,curve:0});
    let taker=kind==='goalkick'?M.P.find(p=>p.team===team&&p.gk):nearest(team,x,y,null,true);const f=attDir(team);
    for(const p of M.P){p.slide=0;p.stun=0;p.vx=p.vy=0;p.runTo=null;p.wall=null;p.gauge=null;p.pend=null}
    taker.x=x-f*0+(kind==='corner'?(x<goalX?-3:3):0);taker.y=y-f*5;taker.dir={x:0,y:f};b.owner=taker;b.last=team;taker.hold=0;
    if(kind==='corner'){taker.dir={x:x<goalX?1:-1,y:f*.3}}
    if(kind==='pen'){for(const p of M.P)if(!p.gk&&p!==taker){p.y=MY+PH/2+(f<0?-1:1)*-0;const h=homePos(p);p.x=h.x;p.y=clamp(y+f*(-30-Math.random()*20),MY+5,MY+PH-5)}}
    if(kind==='fk'){const gy=f<0?topY:botY;const dist=hyp(goalX-x,gy-y);if(dist<130){/* 수비벽 */const def=M.P.filter(p=>p.team!==team&&!p.gk&&!p.off).sort((a,c)=>hyp(a.x-x,a.y-y)-hyp(c.x-x,c.y-y)).slice(0,dist<90?4:3);
        const ux=(goalX-x)/dist,uy=(gy-y)/dist;def.forEach((p,i)=>{p.x=x+ux*20+(-uy)*(i-(def.length-1)/2)*4.5;p.y=y+uy*20+ux*(i-(def.length-1)/2)*4.5;p.dir={x:-ux,y:-uy};p.wallStand=1.5})}}
    M.sp={kind,team,taker,t:0};M.state='setpiece';M.stT=team===0&&!taker.gk?99:1.3;if(team===0&&!taker.gk)M.ctrl=taker;
    M.msg=M.msg&&M.msg.t>1?M.msg:{s:{throw:'스로인',corner:'코너킥',goalkick:'골킥',fk:'프리킥',pen:'페널티킥',kickoff:'킥오프'}[kind],t:1.2}}
  M.setPiece=setPiece;
  function spUpdate(G,dt){const sp=M.sp,o=sp.taker,b=M.ball;sp.t+=dt;const I=M.inp||{held:{},down:{},up:{}};const k=G.keys;
    for(const p of M.P){if(p===o||p.off)continue;if(p.wallStand>0){p.wallStand-=dt;continue}if(sp.kind==='pen'&&!p.gk)continue;const h=homePos(p);if(!p.gk)aiMoveTo(p,h.x,h.y,dt,.8)}
    b.x=o.x+o.dir.x*5;b.y=o.y+o.dir.y*5;
    if(sp.team===0&&!o.gk){M.ctrl=o;const [dx,dy]=inDir(k);if(dx||dy){const cur=Math.atan2(o.dir.y,o.dir.x),want=Math.atan2(dy,dx);let da=Math.atan2(Math.sin(want-cur),Math.cos(want-cur));const a=cur+Math.max(-dt*2.6,Math.min(dt*2.6,da));o.dir={x:Math.cos(a),y:Math.sin(a)}}
      const rdt=dt/(M.timeScale||1);
      for(const key of ['S','W','A','D','Q'])if(I.down[key])o.gauge={k:key,t:0,combo:!!I.held.C};
      if(o.gauge){o.gauge.t+=rdt;if(!I.held[o.gauge.k]||o.gauge.t>1.1){const g=o.gauge;o.gauge=null;const pw=clamp(g.t/.9,0,1);M.state='play';b.owner=o;
          if(sp.kind==='corner'&&g.k==='A')cross(o,pw,G);else if(sp.kind==='pen'&&g.k==='D'){shootFO2(o,Math.min(pw,.8),dx,'power',G)}else doAction(o,g.k,pw,g.combo,o.dir.x,o.dir.y,G);M.sp=null}}
      return}
    if(sp.t<M.stT)return;M.state='play';M.sp=null;b.owner=o;
    if(o.gk){const t=bestPass(o);if(t)lobTo(o,t,.6,G);return}
    const f=attDir(o.team);const gy=f<0?topY:botY;const dist=hyp(goalX-o.x,gy-o.y);
    if(sp.kind==='pen'){shootFO2(o,rnd(.45,.75),rnd(-1,1),'power',G);return}
    if(sp.kind==='corner'){cross(o,rnd(.2,.9),G);return}
    if(sp.kind==='fk'&&dist<120&&Math.random()<.7){shootFO2(o,rnd(.5,.8),rnd(-1,1),Math.random()<.5?'finesse':'power',G);return}
    const t=bestPass(o);if(t){if(sp.kind==='fk'&&Math.random()<.4)lobTo(o,t,.6,G);else passTo(o,t,G)}}
  /* ---------- 승부차기 ---------- */
  M.startPens=function(G){M.state='pens';M.pens={me:[],op:[],turn:'me',ph:'choose',t:0,pick:0,res:null,kd:0};M.msg={s:'승부차기!',t:1.5,big:1}};
  function pensUpdate(G,dt){const P=M.pens;P.t+=dt;const h=G.hit,k=G.keys;
    if(P.ph==='choose'){const dir=k.left?-1:k.right?1:0;P.pick=dir;
      if(P.turn==='me'?(h.a||h.b||P.t>3.5):(h.left||h.right||h.up||h.a||P.t>2.2)){
        let my=P.turn==='me'?P.pick:(h.left?-1:h.right?1:0);const sk=cfg.opSkill.keeper;
        let kick,dive;if(P.turn==='me'){kick=my;dive=Math.random()<.34+sk*.2?kick:[-1,0,1][Math.floor(Math.random()*3)]}else{kick=[-1,0,1][Math.floor(Math.random()*3)];dive=my}
        const miss=Math.random()<(P.turn==='me'?.05:.08+0*(1-sk));const goal=!miss&&kick!==dive;P.res={kick,dive,goal,miss};P.ph='shot';P.t=0;G.sfx('punch')}}
    else if(P.ph==='shot'){if(P.t>1.4){const g=P.res.goal;(P.turn==='me'?P.me:P.op).push(g);if(P.turn==='me'&&g)G.add(100);if(P.turn==='op'&&!g)G.add(100);
        const a=P.me.filter(Boolean).length,bb=P.op.filter(Boolean).length,ra=Math.max(0,5-P.me.length),rb=Math.max(0,5-P.op.length);let done=null;
        if(P.me.length<=5&&P.op.length<=5){if(a+ra<bb)done='lose';else if(bb+rb<a)done='win';else if(P.me.length===5&&P.op.length===5&&a!==bb)done=a>bb?'win':'lose'}
        else if(P.me.length===P.op.length&&a!==bb)done=a>bb?'win':'lose';
        if(done){M.state='end';M.pensResult=done;cfg.onEnd&&cfg.onEnd(M);return}
        P.turn=P.turn==='me'?'op':'me';P.ph='choose';P.t=0;P.res=null}}}
  /* ---------- 그리기 ---------- */
  M.draw=function(G,c){const v=cfg.view||{w:M.FW,h:M.FH};c.save();if(M.shake)c.translate(rnd(-1,1)*M.shake,rnd(-1,1)*M.shake);const ox=-Math.round(M.cam.x),oy=-Math.round(M.cam.y)+(cfg.oy||0);c.translate(ox,oy);
    drawPitch(c);
    const list=M.P.slice().sort((a,b)=>a.y-b.y);const b=M.ball;
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(b.x+1,b.y+1,2.6,1.4,0,0,TAU);c.fill();
    for(const p of list){if(p.y<b.y)drawPlayer(c,p)}
    drawBall(c);for(const p of list){if(p.y>=b.y)drawPlayer(c,p)}
    drawGoalFront(c);
    for(const q of M.parts){c.fillStyle=q.col;c.fillRect(q.x,q.y,2,2)}
    c.restore();
    if(M.state==='pens')drawPens(G,c,v)};
  function drawPitch(c){const sw=cfg.stripe||24;for(let y=0;y<M.FH;y+=sw){c.fillStyle=(y/sw)%2?'#2f9a44':'#36a94c';c.fillRect(0,y,M.FW,sw)}
    if(cfg.walls){c.fillStyle='#1d2340';c.fillRect(0,0,M.FW,MY-1);c.fillRect(0,MY+PH+1,M.FW,MY);c.fillRect(0,0,MX-1,M.FH);c.fillRect(MX+PW+1,0,MX,M.FH);c.fillStyle='#ffd23f';c.fillRect(MX-2,MY-2,PW+4,1);c.fillRect(MX-2,MY+PH+1,PW+4,1);c.fillRect(MX-2,MY-2,1,PH+4);c.fillRect(MX+PW+1,MY-2,1,PH+4)}
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.strokeRect(MX+.5,MY+.5,PW,PH);c.beginPath();c.moveTo(MX,MY+PH/2+.5);c.lineTo(MX+PW,MY+PH/2+.5);c.stroke();
    c.beginPath();c.arc(goalX,MY+PH/2,cfg.circle||28,0,TAU);c.stroke();c.fillStyle='#fff';c.fillRect(goalX-1,MY+PH/2-1,2,2);
    const bw=cfg.boxW||GWD*2.6,bh=cfg.boxH||PH*.14,sw2=GWD*1.4,sh=bh*.4;for(const [y,s] of [[topY,1],[botY,-1]]){c.strokeRect(goalX-bw/2+.5,s>0?y+.5:y-bh+.5,bw,bh);c.strokeRect(goalX-sw2/2+.5,s>0?y+.5:y-sh+.5,sw2,sh);c.fillRect(goalX-1,y+s*bh*.68,2,2);
      c.beginPath();c.arc(goalX,y+s*bh*.68,bh*.42,s>0?.2*Math.PI:1.2*Math.PI,s>0?.8*Math.PI:1.8*Math.PI);c.stroke()}
    /* 골대 뒤 그물 (위) */c.fillStyle='rgba(255,255,255,.18)';c.fillRect(goalX-GWD/2,topY-9,GWD,9);c.strokeStyle='rgba(255,255,255,.3)';for(let x=goalX-GWD/2;x<=goalX+GWD/2;x+=3){c.beginPath();c.moveTo(x+.5,topY-9);c.lineTo(x+.5,topY);c.stroke()}
    c.fillStyle='#fff';c.fillRect(goalX-GWD/2-1,topY-10,GWD+2,1.5);c.fillRect(goalX-GWD/2-1,topY-10,1.5,10);c.fillRect(goalX+GWD/2-.5,topY-10,1.5,10)}
  function drawGoalFront(c){/* 아래 골대 (앞쪽이라 선수 위에) */c.fillStyle='rgba(255,255,255,.18)';c.fillRect(goalX-GWD/2,botY,GWD,9);c.strokeStyle='rgba(255,255,255,.3)';for(let x=goalX-GWD/2;x<=goalX+GWD/2;x+=3){c.beginPath();c.moveTo(x+.5,botY);c.lineTo(x+.5,botY+9);c.stroke()}
    c.fillStyle='#fff';c.fillRect(goalX-GWD/2-1,botY-1,1.5,11);c.fillRect(goalX+GWD/2-.5,botY-1,1.5,11);c.fillRect(goalX-GWD/2-1,botY+9,GWD+2,1.5)}
  function drawPlayer(c,p){const ps=cfg.pscale||1;if(ps!==1){c.save();c.translate(p.x,p.y);c.scale(ps,ps);c.translate(-p.x,-p.y)}drawPlayer0(c,p);if(ps!==1)c.restore()}
  function drawPlayer0(c,p){const x=Math.round(p.x),y=Math.round(p.y);const cols=p.team===0?cfg.myCol:cfg.opCol;const shirt=p.gk?cols.gk:cols.shirt,shorts=cols.shorts;
    c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x,y+1,3.5,1.6,0,0,TAU);c.fill();
    if(p===M.ctrl&&p.team===0){c.strokeStyle='#ffd23f';c.lineWidth=1;c.beginPath();c.ellipse(x,y+1,5,2.4,0,0,TAU);c.stroke();c.fillStyle='#ffd23f';c.beginPath();c.moveTo(x-2,y-14);c.lineTo(x+2,y-14);c.lineTo(x,y-11);c.fill()}
    if(p.slide>0||p.stun>.2&&p.slide<=0&&p.stun>0){c.save();c.translate(x,y-2);c.rotate(p.slide>0?Math.atan2(p.vy,p.vx):Math.PI/2);c.fillStyle=shirt;c.fillRect(-4,-2,6,4);c.fillStyle='#f0c090';c.fillRect(2,-1.5,3,3);c.fillStyle=shorts;c.fillRect(-7,-1.5,3,3);c.restore();return}
    const run=hyp(p.vx,p.vy)>8;const f=run?Math.floor(p.anim)%2:0;
    c.fillStyle='#f0c090';c.fillRect(x-2+(f?-1:0),y-3,1.5,3);c.fillRect(x+.5+(f?1:0),y-3,1.5,3);
    c.fillStyle=shorts;c.fillRect(x-2.5,y-5,5,2.5);c.fillStyle=shirt;c.fillRect(x-3,y-9.5,6,5);
    c.fillStyle='#f0c090';c.fillRect(x-2,y-13,4,3.5);c.fillStyle=cols.hair||'#2a1a10';c.fillRect(x-2,y-13.5,4,1.5);
    if(p.gk&&p.dive){c.fillStyle='#4fe3b2';c.fillRect(x+p.dive*4-1,y-9,2,2)}
    if(p.charge>0){c.fillStyle='#ffd23f';c.fillRect(x-4,y-16,8*p.charge/.6,1.5)}}
  function drawBall(c){const b=M.ball;const x=b.x,y=b.y-b.z;c.fillStyle=b.fire?'#ffd23f':'#fff';c.beginPath();c.arc(x,y,(2.2+b.z*.02)*(cfg.pscale?Math.sqrt(cfg.pscale):1),0,TAU);c.fill();c.fillStyle='#222';const a=b.spin;c.fillRect(x+Math.cos(a)*1-.6,y+Math.sin(a)*1-.6,1.2,1.2)}
  function drawPens(G,c,v){const P=M.pens;c.fillStyle='rgba(6,6,20,.82)';c.fillRect(0,0,v.w,v.h);const cx=v.w/2;
    G.text('승부차기',cx,18,{k:1,size:18,align:'center',color:'#ffd23f'});
    const row=(arr,y,l)=>{G.text(l,16,y,{k:1,size:10});for(let i=0;i<Math.max(5,arr.length);i++){c.fillStyle=i<arr.length?(arr[i]?'#4fe3b2':'#ff4f7b'):'#3a3560';c.beginPath();c.arc(70+i*12,y+5,4,0,TAU);c.fill()}};row(P.me,46,'우리');row(P.op,60,'상대');
    const gx=cx,gy=150,gw=70,gh=40;c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(gx-gw,gy-gh,gw*2,gh);c.fillStyle='rgba(255,255,255,.08)';c.fillRect(gx-gw,gy-gh,gw*2,gh);
    const kx=P.res?gx+P.res.dive*42:gx;c.fillStyle=P.turn==='me'?cfg.opCol.gk:cfg.myCol.gk;c.fillRect(kx-4,gy-22,8,18);c.fillStyle='#f0c090';c.fillRect(kx-3,gy-28,6,6);
    if(P.ph==='choose'){const pk=P.turn==='me'?P.pick:0;if(P.turn==='me'){c.strokeStyle='#ffd23f';c.beginPath();c.arc(gx+pk*48,gy-18,7,0,TAU);c.stroke()}
      G.text(P.turn==='me'?'◀ ▶ 로 방향 (가만히 = 가운데), A로 슛!':'키커가 찰 때 ◀ ▲ ▶ 로 다이빙!',cx,190,{k:1,size:11,align:'center'})}
    else{const p=Math.min(1,P.t/.35);const bx=gx+(P.res.miss?(P.res.kick||1)*90:P.res.kick*48)*p,by=230-(230-(gy-18))*p;c.fillStyle='#fff';c.beginPath();c.arc(bx,by,4,0,TAU);c.fill();
      if(P.t>.4)G.text(P.res.miss?'빗나감!':P.res.goal?'골!':'막혔다!',cx,195,{k:1,size:20,align:'center',color:P.res.goal===(P.turn==='me')?'#4fe3b2':'#ff4f7b'})}
    c.fillStyle='#fff';c.beginPath();c.arc(cx,230,4,0,TAU);c.fill()}
  M.drawPens=(G,c,v)=>drawPens(G,c,v);
  return M}
window.Footy={create};
})();
