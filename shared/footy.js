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
  for(const team of [0,1])cfg.formation.forEach((f,i)=>{const [hx,hy,role]=f;const p={team,i,role,gk:role==='gk',hx,hy,x:0,y:0,vx:0,vy:0,dir:{x:0,y:team?1:-1},stun:0,slide:0,kcd:0,anim:Math.random()*6,hold:0,dec:rnd(.1,.5),sk:skills[team]};placeHome(p,true);M.P.push(p)});
  function homePos(p){/* 포메이션 자리 + 공 위치에 따라 이동 */let hx=p.hx,hy=p.hy;if(p.team===1){hx=1-hx;hy=1-hy}
    const b=M.ball;let x=MX+hx*PW,y=MY+hy*PH;if(p.gk)return{x:goalX+clamp((b.x-goalX)*.3,-GWD/2+3,GWD/2-3),y:p.team===0?botY-6:topY+6};
    const att=teamHas(p.team);const fwd=p.team===0?-1:1;
    x+= (b.x-goalX)*(cfg.shiftX||.38);y+=(b.y-(MY+PH/2))*(cfg.shiftY||.42);y+=fwd*(att?PH*.08:-PH*.04);
    return{x:clamp(x,MX+6,MX+PW-6),y:clamp(y,MY+8,MY+PH-8)}}
  function placeHome(p,force){let hx=p.hx,hy=p.hy;if(p.team===1){hx=1-hx;hy=1-hy}const x=MX+hx*PW,y=MY+(p.team===0?Math.max(.52,hy):Math.min(.48,hy))*PH;
    if(p.gk){p.x=goalX;p.y=p.team===0?botY-6:topY+6}else{p.x=x;p.y=y}p.vx=p.vy=0;p.stun=p.slide=0;p.dir={x:0,y:p.team?1:-1}}
  M.homePos=homePos;
  function teamHas(t){const o=M.ball.owner;return o?o.team===t:M.ball.last===t}
  function nearest(team,x,y,excl,noGk){let best=null,bd=1e9;for(const p of M.P){if(p.team!==team||p===excl||(noGk&&p.gk))continue;const d=hyp(p.x-x,p.y-y);if(d<bd){bd=d;best=p}}return best}
  M.nearest=nearest;
  /* 킥오프·재시작 */
  function kickoff(team){for(const p of M.P)placeHome(p);const b=M.ball;Object.assign(b,{x:goalX,y:MY+PH/2,z:0,vx:0,vy:0,vz:0,owner:null,fire:0});
    const taker=nearest(team,goalX,MY+PH/2,null,true);taker.x=goalX+(team?-3:3);taker.y=MY+PH/2+(team?-6:6);b.owner=taker;b.last=team;M.state='kickoff';M.stT=team===0?.6:1.1;M.ctrl=team===0?taker:nearest(0,goalX,MY+PH/2,null,true)}
  M.kickoff=kickoff;
  function restart(team,x,y,kind){const b=M.ball;Object.assign(b,{x,y,z:0,vx:0,vy:0,vz:0,owner:null,fire:0});
    let taker=kind==='goalkick'?M.P.find(p=>p.team===team&&p.gk):nearest(team,x,y,null,true);taker.x=x+(x<goalX?-2:2);taker.y=y+(team===0?4:-4);b.owner=taker;b.last=team;taker.hold=0;
    M.state='restart';M.stT=.9;M.msg={s:{throw:'스로인',corner:'코너킥',goalkick:'골킥'}[kind],t:1};if(team===0&&!taker.gk)M.ctrl=taker}
  /* 패스·슛 */
  function passTo(p,tgt,G){const b=M.ball;const lead=.35;let tx=tgt.x+tgt.vx*lead,ty=tgt.y+tgt.vy*lead;const acc=p.team===0&&M.ctrl===p?1:p.sk.pass;tx+=rnd(-1,1)*(1-acc)*14;ty+=rnd(-1,1)*(1-acc)*14;
    const d=hyp(tx-b.x,ty-b.y);const lob=d>(cfg.lobDist||120);const sp=lob?clamp(d*1.15,120,190):clamp(d*1.6+50,110,240);
    b.owner=null;b.vx=(tx-b.x)/d*sp;b.vy=(ty-b.y)/d*sp;b.vz=lob?clamp(d*.75,70,130):0;b.last=p.team;b.lastP=p;p.kcd=.28;b.target=tgt;tgt.recv=.9;G&&G.sfx(lob?'jump':'blip');
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
    if(M.state==='kickoff'||M.state==='restart'){M.stT-=dt;const o=M.ball.owner;
      for(const p of M.P){if(p===o)continue;const h=homePos(p);aiMoveTo(p,h.x,h.y,dt,.9)}
      if(o){o.vx=o.vy=0;M.ball.x=o.x+o.dir.x*5;M.ball.y=o.y+o.dir.y*5}
      if(M.stT<=0){M.state='play';if(o&&o.team===0&&!o.gk)M.ctrl=o}else return}
    M.clock-=dt;if(M.clock<=0){M.clock=0;M.state='end';G.sfx('bell');cfg.onEnd&&cfg.onEnd(M);return}
    for(const p of M.P){p.stun=Math.max(0,p.stun-dt);p.kcd=Math.max(0,p.kcd-dt);p.recv=Math.max(0,(p.recv||0)-dt)}
    controlMe(G,dt);
    for(const p of M.P)if(p!==M.ctrl||p.gk)ai(p,G,dt);
    ballPhys(G,dt);
    contest(G,dt);
    cam(dt)};
  function cam(dt){const v=cfg.view;if(!v)return;const b=M.ball;const tx=clamp(b.x-v.w/2,0,M.FW-v.w),ty=clamp(b.y-v.h/2+(M.ctrl&&M.ctrl===b.owner?-20:0),0,M.FH-v.h);M.cam.x+=(tx-M.cam.x)*Math.min(1,dt*5);M.cam.y+=(ty-M.cam.y)*Math.min(1,dt*5)}
  M.snapCam=function(){const v=cfg.view;if(!v)return;M.cam.x=clamp(M.ball.x-v.w/2,0,M.FW-v.w);M.cam.y=clamp(M.ball.y-v.h/2,0,M.FH-v.h)};
  function speedOf(p){return (cfg.speed||62)*(p.team===0?1:p.sk.spd)*(p.gk?.9:1)*(M.ball.owner===p?.86:1)*(p.stun?0:1)}
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
    if(b.owner===p)return ownerAI(p,G,dt);
    const myBall=b.owner&&b.owner.team===p.team;
    if(p.recv>0&&!b.owner){aiMoveTo(p,b.x+b.vx*.2,b.y+b.vy*.2,dt,1.05);return}
    if(!myBall){const ch=nearest(p.team,b.x+b.vx*.25,b.y+b.vy*.25,null,true);
      if(ch===p){aiMoveTo(p,b.x+b.vx*.25,b.y+b.vy*.25,dt,1);
        if(p.team===1&&b.owner&&b.owner.team===0&&hyp(p.x-b.x,p.y-b.y)<16&&p.slide<=0&&Math.random()<dt*p.sk.slide){p.slide=.35;const d=hyp(b.x-p.x,b.y-p.y)||1;p.vx=(b.x-p.x)/d*145;p.vy=(b.y-p.y)/d*145}
        return}}
    const h=homePos(p);
    if(myBall){/* 공격 지원: 빈 공간으로 */const fwd=p.team===0?-1:1;const run=(p.role==='fwd'?.12:p.role==='mid'?.06:0)*PH;aiMoveTo(p,h.x+Math.sin(M.t*.7+p.i)*10,h.y+fwd*run,dt,.95)}
    else aiMoveTo(p,h.x,h.y,dt,.9)}
  function ownerAI(p,G,dt){const b=M.ball;const fwd=p.team===0?-1:1;const gy=p.team===0?topY:botY;p.dec-=dt;
    let ax=goalX-p.x,ay=gy-p.y;const dG=hyp(ax,ay);let near=null,nd=1e9;for(const o of M.P)if(o.team!==p.team){const d=hyp(o.x-p.x,o.y-p.y);if(d<nd){nd=d;near=o}}
    if(p.dec<=0){p.dec=rnd(.25,.55)/(p.sk.think||1);
      if(dG<(cfg.shootRange||100)&&Math.random()<(dG<60?.75:.4)){const aim=rnd(-1,1);shoot(p,rnd(.35,.85),aim,G,false);return}
      if(nd<(cfg.pressDist||18)&&Math.random()<.65){const t=bestPass(p);if(t){passTo(p,t,G);return}}
      if(Math.random()<.18){const t=bestPass(p);if(t&&(t.y-p.y)*fwd>20){passTo(p,t,G);return}}}
    let mx=ax/dG,my=ay/dG;if(near&&nd<30){const ox=p.x-near.x,oy=p.y-near.y,ol=hyp(ox,oy)||1;mx+=ox/ol*1.1*(30-nd)/30;my+=oy/ol*.5*(30-nd)/30}
    mx+=Math.sin(M.t*2+p.i)*.3;moveP(p,dt,mx,my,.95)}
  function keeperAI(p,G,dt){const b=M.ball;const myGoalY=p.team===0?botY:topY;const toward=(p.team===0?b.vy>0:b.vy<0)&&!b.owner;
    if(b.owner===p){p.hold+=dt;p.vx=p.vy=0;b.x=p.x;b.y=p.y+(p.team===0?-5:5);if(p.hold>(p.team===0?.9:1.1)){const t=bestPass(p);if(t){passTo(p,t,G)}else shoot(p,.5,rnd(-1,1),G)}return}
    if(toward&&b.shot){const tt=(myGoalY-b.y)/b.vy;if(tt>0&&tt<1.2){const cx=b.x+b.vx*tt;const react=p.team===0?.14:(cfg.keeperReact||.15)*(1.5-p.sk.keeper);
        if(M.t-(b.shotT||0)>react){const tx=clamp(cx,goalX-GWD/2-6,goalX+GWD/2+6);const sp=(cfg.speed||62)*1.5*(p.team===0?.85:p.sk.keeper+.2);const dx=tx-p.x;p.x+=clamp(dx,-sp*dt,sp*dt);p.dive=Math.sign(dx);p.vx=0}}}
    else{p.dive=0;const h=homePos(p);const o=b.owner;const dGoal=hyp(b.x-goalX,b.y-myGoalY);
      if(o&&o.team!==p.team&&dGoal<(cfg.rushDist||GWD*1.3)){/* 골키퍼가 달려 나와 각도 좁히기 */aiMoveTo(p,b.x,b.y,dt,1.15);if(hyp(b.x-p.x,b.y-p.y)<8){p.grab=(p.grab||0)+dt*(p.team===0?2.5:1.5+p.sk.keeper*2);if(p.grab>.3){p.grab=0;b.owner=p;p.hold=0;o.stun=.4;o.kcd=.5;G.sfx('land');M.msg={s:p.team===0?'키퍼가 잡았다!':'키퍼에게 뺏겼다!',t:.9}}}}
      else{p.grab=0;aiMoveTo(p,h.x,h.y,dt,1)}}
    const d=hyp(b.x-p.x,b.y-p.y);if(!b.owner&&d<9&&b.z<GH+5&&b.last!==p.team||(!b.owner&&d<7&&b.z<14&&hyp(b.vx,b.vy)<90)){
      const spd=hyp(b.vx,b.vy);if(b.fire&&Math.random()<.75){b.vx*=.8;b.vy*=.8;M.shake=4;return}
      if(spd<175*(p.team===0?.9:p.sk.keeper+.15)||Math.random()<.25){b.owner=p;p.hold=0;b.shot=false;b.fire=0;b.vz=0;b.z=0;G.sfx('land');if(spd>140){M.msg={s:p.team===0?'선방!':'막혔다!',t:1};if(p.team===0)G.add(50)}}
      else{b.vx=-b.vx*.4+rnd(-60,60);b.vy=-b.vy*.5;b.vz=40;b.shot=false;b.last=p.team;G.sfx('hit');M.msg={s:'쳐냈다!',t:.9}}}}
  /* 공 */
  function ballPhys(G,dt,free){const b=M.ball;
    if(b.owner&&!free){const o=b.owner;const off=o.gk?5:6;b.x+=(o.x+o.dir.x*off-b.x)*Math.min(1,dt*18);b.y+=(o.y+o.dir.y*off-b.y)*Math.min(1,dt*18);b.z=Math.abs(Math.sin(o.anim*1.2))*2;b.vx=o.vx;b.vy=o.vy;b.vz=0;b.last=o.team;b.shot=false;b.fire=0;b.spin+=hyp(o.vx,o.vy)*dt*.2;bounds(G);return}
    if(b.shot&&!b.shotT)b.shotT=M.t;if(!b.shot)b.shotT=0;
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
    if(!b.owner&&b.z<8){let best=null,bd=8;for(const p of M.P){if(p.stun>0||p.kcd>0||p.gk)continue;const d=hyp(p.x-b.x,p.y-b.y);if(d<bd){bd=d;best=p}}
      if(best){const sp=hyp(b.vx,b.vy);if(best.slide>0){/* 태클로 걷어냄 */b.vx=best.vx*1.3;b.vy=best.vy*1.3;b.last=best.team;best.kcd=.2;G.sfx('hit');}
        else if(b.fire&&best.team!==b.last){best.stun=.6;b.vx*=.85;b.vy*=.85}
        else{b.owner=best;b.target=null;best.recv=0;best.dec=rnd(.15,.35);if(best.team===0)M.ctrl=best;if(sp>60)G.sfx('tick')}}}}
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
      if(p.slide>0&&d<10){b.owner=null;b.vx=p.vx*1.2+rnd(-30,30);b.vy=p.vy*1.2+rnd(-30,30);b.last=p.team;o.stun=.55;o.kcd=.4;G.sfx('hit');if(p.team===0){M.energy=Math.min(1,M.energy+.15);G.add(20)}M.shake=3;return}
      if(d<7){p.steal=(p.steal||0)+dt*(p.team===0?1.5:p.sk.tackle);if(p.steal>.45){p.steal=0;b.owner=null;b.vx=p.dir.x*40+rnd(-25,25);b.vy=p.dir.y*40+rnd(-25,25);b.last=p.team;o.kcd=.35;G.sfx('punch');if(p.team===0)M.energy=Math.min(1,M.energy+.1)}}else p.steal=Math.max(0,(p.steal||0)-dt)}}
  function goal(G,team){M.score[team]++;M.goalTeam=team;M.state='goal';M.stT=2.4;M.shake=8;G.sfx('clear');M.msg={s:team===0?'GOAL!!':'실점…',t:2.2,big:1};navigator.vibrate&&navigator.vibrate(150);
    if(team===0){G.add(cfg.goalPts||300);for(let i=0;i<50;i++)M.parts.push({x:M.ball.x,y:M.ball.y,vx:rnd(-120,120),vy:rnd(-140,40),t:1.6,col:['#ff4f7b','#ffd23f','#4fe3b2','#3fd0ff','#fff'][i%5]})}
    cfg.onGoal&&cfg.onGoal(M,team)}
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
  return M}
window.Footy={create};
})();
