/* NNN 레트로 아케이드 공통 엔진
   - 화면: 위 점수줄 / 가운데 픽셀 캔버스 / 아래 십자키 + A·B (가로 화면이면 양옆)
   - 키보드: 방향키·WASD, A=Z/스페이스/J, B=X/K, P=일시정지, Enter=시작
   - 게임은 Retro.boot({...})로 init/update/draw만 만들면 돼요 */
(function(){
  const CSS=`
  :root{--ink:#0d0b1e;--panel:#17142e;--line:#2c2752;--txt:#f3f0ff;--mute:#9a93c7;--hot:#ff4f7b;--sun:#ffd23f;--mint:#4fe3b2;
    --f-px:'Press Start 2P','Jua',monospace;--f-k:'Jua','Apple SD Gothic Neo','Malgun Gothic',sans-serif}
  *{box-sizing:border-box}[hidden]{display:none!important}
  html,body{margin:0;height:100%;background:var(--ink);color:var(--txt);font-family:var(--f-k);overflow:hidden;
    -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;touch-action:none;overscroll-behavior:none}
  button{font:inherit;color:inherit;cursor:pointer;touch-action:none}
  .rt{position:fixed;inset:0;display:flex;flex-direction:column;
    padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
  .rt-top{display:flex;align-items:center;gap:8px;padding:8px 10px;flex:none}
  .rt-ic{width:40px;height:40px;flex:none;border-radius:12px;border:2px solid var(--line);background:var(--panel);display:grid;place-items:center;font-size:17px;text-decoration:none;color:var(--txt)}
  .rt-ttl{font-size:17px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rt-sc{font-family:var(--f-px);font-size:10px;line-height:1.5;text-align:right;color:var(--mute)}
  .rt-sc b{color:var(--sun);font-weight:400}
  .rt-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;position:relative}
  .rt-cv{image-rendering:pixelated;image-rendering:crisp-edges;display:block;background:#000;border-radius:6px;box-shadow:0 0 0 2px var(--line),0 10px 30px rgba(0,0,0,.5)}
  .rt-pad{flex:none;display:flex;justify-content:space-between;align-items:center;padding:6px 18px 14px;height:178px}
  .rt-dpad{width:150px;height:150px;position:relative;border-radius:50%;background:radial-gradient(circle,#221d44 0 60%,#1a1636 61%);touch-action:none}
  .rt-dpad i{position:absolute;width:50px;height:50px;background:#2f2961;border:2px solid #403884;border-radius:10px;display:grid;place-items:center;font-style:normal;font-size:18px;color:#bdb5ff;transition:background .05s}
  .rt-dpad i.on{background:var(--hot);color:#fff;border-color:#fff3}
  .rt-dpad .u{left:50px;top:2px}.rt-dpad .d{left:50px;bottom:2px}.rt-dpad .l{left:2px;top:50px}.rt-dpad .r{right:2px;top:50px}
  .rt-dpad .c{left:50px;top:50px;background:#262052;border-color:#262052}
  .rt-ab{display:flex;gap:14px;align-items:flex-end;padding-bottom:6px}
  .rt-btn{width:76px;height:76px;border-radius:50%;border:3px solid #fff2;font-family:var(--f-px);font-size:18px;position:relative;
    box-shadow:0 5px 0 rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
  .rt-btn small{font-family:var(--f-k);font-size:12px;opacity:.9}
  .rt-btn.a{background:#e8453c;margin-bottom:26px}.rt-btn.b{background:#3b6fe0}
  .rt-btn.on{transform:translateY(4px);box-shadow:0 1px 0 rgba(0,0,0,.45);filter:brightness(1.2)}
  .rt-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,6,20,.72);z-index:5}
  .rt-card{width:min(340px,100%);background:var(--panel);border:2px solid var(--line);border-radius:18px;padding:18px 16px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.6)}
  .rt-card h1{margin:0 0 4px;font-size:26px;font-weight:400;color:var(--sun);text-shadow:0 3px 0 #0006}
  .rt-card .en{font-family:var(--f-px);font-size:9px;color:var(--mute);letter-spacing:1px;margin-bottom:12px}
  .rt-card p{margin:6px 0;font-size:14.5px;line-height:1.5;color:#d9d4ff}
  .rt-help{text-align:left;background:#0f0c24;border-radius:12px;padding:10px 12px;margin:12px 0;font-size:13.5px;line-height:1.65;color:#cfc9f6}
  .rt-help b{color:var(--mint);font-weight:400}
  .rt-go{display:block;width:100%;height:54px;margin-top:8px;border:0;border-radius:14px;background:var(--hot);color:#fff;font-size:21px;box-shadow:0 5px 0 #8f1f3c}
  .rt-go:active{transform:translateY(4px);box-shadow:0 1px 0 #8f1f3c}
  .rt-go.soft{background:#2f2961;box-shadow:0 5px 0 #15112e;font-size:17px;height:46px}
  .rt-big{font-family:var(--f-px);font-size:22px;color:#fff;margin:10px 0 4px}
  .rt-new{display:inline-block;background:var(--sun);color:#222;border-radius:999px;padding:3px 10px;font-size:13px;margin-top:4px}
  .rt-msg{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:24px;color:#fff;text-shadow:0 3px 0 #000,0 0 18px #000;pointer-events:none;white-space:nowrap;z-index:4;animation:rtpop .25s}
  @keyframes rtpop{from{transform:translate(-50%,-50%) scale(.6);opacity:0}}
  .rt.nopad .rt-pad{display:none!important}
  .rt.lefty .rt-pad{flex-direction:row-reverse}.rt.lefty .rt-ab{flex-direction:row-reverse}
  .rt.bs .rt-btn{width:62px;height:62px;font-size:15px}.rt.bs .rt-dpad{transform:scale(.84)}
  .rt.bl .rt-btn{width:88px;height:88px;font-size:20px}.rt.bl .rt-dpad{transform:scale(1.12)}.rt.bl .rt-pad{height:196px}
  .rt-opts{text-align:left;margin:10px 0 4px;display:flex;flex-direction:column;gap:10px;max-height:52vh;overflow:auto;padding-right:2px}
  .rt-orow b{display:block;font-weight:400;font-size:14px;color:#d9d4ff;margin-bottom:5px}.rt-orow small{display:block;font-size:11.5px;color:var(--mute);margin-top:4px}
  .rt-seg{display:flex;gap:6px;flex-wrap:wrap}.rt-seg button{flex:1;min-width:58px;height:38px;border-radius:10px;border:2px solid var(--line);background:#0f0c24;font-size:14px;color:#cfc9f6}
  .rt-seg button.on{background:var(--mint);border-color:var(--mint);color:#0d0b1e}
  .rt-step{display:flex;align-items:center;gap:8px}.rt-step button{width:42px;height:38px;border-radius:10px;border:2px solid var(--line);background:#0f0c24;font-size:18px}
  .rt-step span{flex:1;text-align:center;font-size:17px;color:var(--sun)}
  .rt-cur{font-size:12.5px;color:var(--mute);margin:8px 0 0}
  @media (hover:hover) and (pointer:fine){.rt-pad{display:none}}
  @media (orientation:landscape) and (max-height:560px){
    .rt-top{padding:4px 10px}.rt-ic{width:34px;height:34px}
    .rt-pad{position:absolute;inset:auto 0 0 0;height:100%;padding:0 max(14px,env(safe-area-inset-right,0px)) 0 max(14px,env(safe-area-inset-left,0px));pointer-events:none}
    .rt-pad>*{pointer-events:auto}
  }`;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const fl=document.createElement('link');fl.rel='stylesheet';
  fl.href='https://fonts.googleapis.com/css2?family=Jua&family=Press+Start+2P&display=swap';document.head.appendChild(fl);

  /* ---------- 소리 (오실레이터 효과음) ---------- */
  let AC=null,muted=false;try{muted=localStorage.getItem('nnnretro_mute')==='1'}catch(e){}
  function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
  function tone(f,d,type,vol,slide,delay){const a=ac();if(!a||muted)return;const t=a.currentTime+(delay||0);
    const o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+d);
    g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
  function noise(d,vol,delay){const a=ac();if(!a||muted)return;const t=a.currentTime+(delay||0);
    const b=a.createBuffer(1,Math.floor(a.sampleRate*d),a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);
    const s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=vol||.15;s.connect(g);g.connect(a.destination);s.start(t)}
  const SFX={
    jump:()=>tone(300,.16,'square',.09,700),
    shoot:()=>tone(900,.08,'square',.06,300),
    hit:()=>{noise(.12,.18);tone(160,.12,'square',.08,60)},
    boom:()=>{noise(.4,.25);tone(120,.35,'sawtooth',.08,40)},
    coin:()=>{tone(988,.06,'square',.08);tone(1319,.18,'square',.08,0,.06)},
    pop:()=>tone(500,.1,'triangle',.15,1200),
    blip:()=>tone(660,.04,'square',.05),
    tick:()=>tone(220,.03,'square',.05),
    move:()=>tone(330,.03,'triangle',.06),
    turn:()=>tone(520,.04,'square',.05),
    land:()=>tone(140,.06,'triangle',.12,80),
    power:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.09,'square',.07,0,i*.07))},
    die:()=>{tone(600,.7,'square',.08,80)},
    clear:()=>{[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.12,'square',.07,0,i*.1))},
    start:()=>{[392,523,659,784].forEach((f,i)=>tone(f,.1,'square',.07,0,i*.09))},
    over:()=>{[392,330,262,196].forEach((f,i)=>tone(f,.22,'triangle',.12,0,i*.2))},
    punch:()=>{noise(.08,.25);tone(110,.08,'square',.1,50)},
    block:()=>tone(1400,.05,'square',.05,900),
    bell:()=>{[0,.18,.36].forEach(d=>{tone(1568,.5,'triangle',.1,0,d);tone(2093,.4,'sine',.05,0,d)})},
  };
  function sfx(n){try{SFX[n]&&SFX[n]()}catch(e){}}

  /* ---------- 픽셀 그림 도우미 ---------- */
  const sprCache=new Map();
  function sprite(rows,pal,scale){scale=scale||1;const key=rows.join('|')+JSON.stringify(pal)+scale;if(sprCache.has(key))return sprCache.get(key);
    const h=rows.length,w=Math.max(...rows.map(r=>r.length));const c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;const x=c.getContext('2d');
    for(let j=0;j<h;j++)for(let i=0;i<rows[j].length;i++){const ch=rows[j][i];const col=pal[ch];if(!col)continue;x.fillStyle=col;x.fillRect(i*scale,j*scale,scale,scale)}
    sprCache.set(key,c);return c}
  function drawSpr(ctx,spr,x,y,flip,sc){sc=sc||1;x=Math.round(x);y=Math.round(y);if(!flip){ctx.drawImage(spr,x,y,spr.width*sc,spr.height*sc);return}
    ctx.save();ctx.translate(x+spr.width*sc,y);ctx.scale(-1,1);ctx.drawImage(spr,0,0,spr.width*sc,spr.height*sc);ctx.restore()}
  function text(ctx,s,x,y,o){o=o||{};ctx.save();ctx.font=`${o.size||8}px ${o.k?"Jua":"'Press Start 2P'"},Jua,monospace`;ctx.textAlign=o.align||'left';ctx.textBaseline=o.base||'top';
    if(o.shadow!==false){ctx.fillStyle=o.sh||'#000';ctx.fillText(s,Math.round(x)+1,Math.round(y)+1)}ctx.fillStyle=o.color||'#fff';ctx.fillText(s,Math.round(x),Math.round(y));ctx.restore()}

  /* ---------- 부팅 ---------- */
  function boot(cfg){
    const W=cfg.w,H=cfg.h;
    document.title=cfg.title;
    const root=document.createElement('div');root.className='rt'+(cfg.noPad?' nopad':'');
    root.innerHTML=`<div class="rt-top"><a class="rt-ic" href="../" aria-label="NNN 월드로">←</a><div class="rt-ttl">${cfg.title}</div>
      <div class="rt-sc">SCORE <b id="rtS">0</b><br>BEST <b id="rtB">0</b></div>
      <button class="rt-ic" id="rtSnd" aria-label="소리">${muted?'🔇':'🔊'}</button><button class="rt-ic" id="rtPause" aria-label="일시정지">⏸</button></div>
      <div class="rt-stage" id="rtStage"><canvas class="rt-cv" id="rtCv" width="${W}" height="${H}"></canvas><div class="rt-ov" id="rtOv"></div></div>
      <div class="rt-pad" id="rtPad">${cfg.noDpad?'<div></div>':`<div class="rt-dpad" id="rtD"><i class="u">▲</i><i class="l">◀</i><i class="c"></i><i class="r">▶</i><i class="d">▼</i></div>`}
      <div class="rt-ab">${cfg.b===false?'':`<button class="rt-btn b" data-k="b">B<small>${cfg.b||''}</small></button>`}${cfg.a===false?'':`<button class="rt-btn a" data-k="a">A<small>${cfg.a||''}</small></button>`}</div></div>`;
    document.body.appendChild(root);
    const cv=root.querySelector('#rtCv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
    const stage=root.querySelector('#rtStage'),ov=root.querySelector('#rtOv');
    const $S=root.querySelector('#rtS'),$B=root.querySelector('#rtB');
    const bestKey='nnnretro_'+cfg.id;let best=0;try{best=+localStorage.getItem(bestKey)||0}catch(e){}
    $B.textContent=best;
    /* 옵션 · 단계 해금 */
    const OKEY='nnnretro_opt_'+cfg.id,RKEY='nnnretro_reach_'+cfg.id;let OPT={};try{OPT=JSON.parse(localStorage.getItem(OKEY)||'{}')||{}}catch(e){}
    let reach=1;try{reach=Math.max(1,+localStorage.getItem(RKEY)||1)}catch(e){}
    const DEFS=[{k:'diff',label:'난이도',ch:[['easy','쉬움'],['normal','보통'],['hard','어려움']],def:'normal',note:'점수 배율: 쉬움 ×0.5 · 보통 ×1 · 어려움 ×1.5'}]
      .concat(cfg.stages?[{k:'start',label:'시작 '+cfg.stages.label,type:'start',note:'한 번 도착한 '+cfg.stages.label+'부터 바로 시작할 수 있어요'}]:[])
      .concat(cfg.options||[])
      .concat([{k:'snd',label:'소리',ch:[['on','켜기'],['off','끄기']],def:'on'},{k:'vib',label:'진동',ch:[['on','켜기'],['off','끄기']],def:'on'},
        {k:'hand',label:'버튼 배치',ch:[['r','기본 (십자키 왼쪽)'],['l','왼손잡이']],def:'r'},{k:'size',label:'버튼 크기',ch:[['s','작게'],['m','보통'],['l','크게']],def:'m'}]);
    const optGet=k=>{if(k==='snd')return muted?'off':'on';const d=DEFS.find(x=>x.k===k);return OPT[k]!=null?OPT[k]:d?d.def:undefined};
    function optSet(k,v){if(k==='snd'){muted=v==='off';try{localStorage.setItem('nnnretro_mute',muted?'1':'0')}catch(e){}const sb=root.querySelector('#rtSnd');if(sb)sb.textContent=muted?'🔇':'🔊';return}
      OPT[k]=v;try{localStorage.setItem(OKEY,JSON.stringify(OPT))}catch(e){}applyUI()}
    function applyUI(){root.classList.toggle('lefty',optGet('hand')==='l');root.classList.toggle('bs',optGet('size')==='s');root.classList.toggle('bl',optGet('size')==='l');setTimeout(fit,30)}
    try{const rv=navigator.vibrate&&navigator.vibrate.bind(navigator);if(rv)navigator.vibrate=function(){return optGet('vib')==='off'?false:rv.apply(null,arguments)}}catch(e){}

    function fit(){const r=stage.getBoundingClientRect();const land=matchMedia('(orientation:landscape) and (max-height:560px)').matches&&getComputedStyle(root.querySelector('#rtPad')).display!=='none';
      const availW=r.width-(land?400:12),availH=r.height-8;let s=Math.min(availW/W,availH/H);if(s>=2)s=Math.floor(s*2)/2;
      cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px';G.scale=s}
    addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));

    /* 입력 */
    const held={left:0,right:0,up:0,down:0,a:0,b:0};let pend={};
    const press=k=>{if(!held[k]){pend[k]=1}held[k]=1};const rel=k=>{held[k]=0};
    const KM={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',
      KeyZ:'a',Space:'a',KeyJ:'a',KeyX:'b',KeyK:'b',ShiftLeft:'b'};
    addEventListener('keydown',e=>{if(e.code==='KeyP'||e.code==='Escape'){togglePause();return}
      if(e.code==='Enter'){if(G.state!=='play'){const b=ov.querySelector('.rt-go');b&&b.click()}return}
      const k=KM[e.code];if(k){e.preventDefault();if(!e.repeat)press(k)}});
    addEventListener('keyup',e=>{const k=KM[e.code];if(k)rel(k)});
    const D=root.querySelector('#rtD');
    if(D){const cells={u:D.querySelector('.u'),d:D.querySelector('.d'),l:D.querySelector('.l'),r:D.querySelector('.r')};const pts=new Map();
      function dpUpdate(){const want={left:0,right:0,up:0,down:0};for(const [,p] of pts){const r=D.getBoundingClientRect();const dx=p.x-(r.left+r.width/2),dy=p.y-(r.top+r.height/2);
          const dead=14;const ang=Math.atan2(dy,dx);if(Math.hypot(dx,dy)<dead)continue;
          const a8=Math.round(ang/(Math.PI/4));// -4..4
          const diag=cfg.diag!==false;
          if(diag){if(a8===0||a8===1||a8===-1)want.right=1;if(a8===4||a8===-4||a8===3||a8===-3)want.left=1;if(a8===2||a8===1||a8===3)want.down=1;if(a8===-2||a8===-1||a8===-3)want.up=1}
          else{if(Math.abs(dx)>Math.abs(dy))want[dx>0?'right':'left']=1;else want[dy>0?'down':'up']=1}}
        for(const k in want){if(want[k])press(k);else if(held[k]&&!G._kb[k])rel(k)}
        cells.u.classList.toggle('on',!!want.up);cells.d.classList.toggle('on',!!want.down);cells.l.classList.toggle('on',!!want.left);cells.r.classList.toggle('on',!!want.right)}
      D.addEventListener('pointerdown',e=>{e.preventDefault();ac();D.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});dpUpdate()});
      D.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});dpUpdate()});
      const up=e=>{pts.delete(e.pointerId);dpUpdate()};D.addEventListener('pointerup',up);D.addEventListener('pointercancel',up)}
    root.querySelectorAll('.rt-btn').forEach(b=>{const k=b.dataset.k;
      b.addEventListener('pointerdown',e=>{e.preventDefault();ac();b.setPointerCapture(e.pointerId);press(k);b.classList.add('on');navigator.vibrate&&navigator.vibrate(8)});
      const up=()=>{rel(k);b.classList.remove('on')};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)});
    /* 캔버스 터치 (드래그·스와이프) */
    const ptr={down:0,x:0,y:0,sx:0,sy:0};
    function toGame(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}}
    cv.addEventListener('pointerdown',e=>{e.preventDefault();ac();cv.setPointerCapture(e.pointerId);const p=toGame(e);Object.assign(ptr,{down:1,x:p.x,y:p.y,sx:p.x,sy:p.y,t:performance.now()});pend.tap=1});
    cv.addEventListener('pointermove',e=>{if(!ptr.down)return;const p=toGame(e);ptr.x=p.x;ptr.y=p.y;
      const dx=p.x-ptr.sx,dy=p.y-ptr.sy,th=cfg.swipe||18*W/320;
      if(Math.hypot(dx,dy)>th){pend.swipe=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');ptr.sx=p.x;ptr.sy=p.y}});
    const pu=()=>{ptr.down=0};cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pu);
    document.addEventListener('contextmenu',e=>e.preventDefault());

    /* 게임 객체 */
    const G={W,H,ctx,cv,keys:held,hit:{},ptr,score:0,best,t:0,state:'title',scale:1,_kb:{},
      sfx,sprite,spr:drawSpr,text:(s,x,y,o)=>text(ctx,s,x,y,o),
      rnd:(a,b)=>a+Math.random()*(b-a),ri:(a,b)=>Math.floor(a+Math.random()*(b-a+1)),
      opt:k=>optGet(k),
      get diff(){return {easy:.75,normal:1,hard:1.3}[optGet('diff')]||1},
      get level(){return optGet('diff')},
      lives(n){const d=optGet('diff');return d==='easy'?n+2:d==='hard'?Math.max(1,n-1):n},
      get start(){const m=cfg.stages?cfg.stages.max||999:1;return Math.max(1,Math.min(+OPT.start||1,reach,m))},
      reach(n){const m=cfg.stages?cfg.stages.max||999:1;n=Math.min(n,m);if(n>reach){reach=n;try{localStorage.setItem(RKEY,reach)}catch(e){}}},
      _frac:0,
      add(n){const mul={easy:.5,normal:1,hard:1.5}[optGet('diff')]||1;G._frac+=n*mul;n=Math.floor(G._frac);G._frac-=n;if(!n)return;G.score+=n;$S.textContent=G.score;if(G.score>best&&!G.practice){best=G.score;G.best=best;$B.textContent=best;try{localStorage.setItem(bestKey,best)}catch(e){}G._newBest=true}},
      setScore(n){G.score=n;$S.textContent=n},
      msg(s,ms){const m=document.createElement('div');m.className='rt-msg';m.textContent=s;stage.appendChild(m);setTimeout(()=>m.remove(),ms||1200)},
      over(extra){if(G.state==='over')return;G.state='over';sfx('over');
        ov.innerHTML=`<div class="rt-card"><h1>게임 오버</h1><div class="rt-big">${G.score}</div>${G._newBest?'<span class="rt-new">★ 최고 기록!</span>':`<p>최고 기록 ${best}</p>`}
          ${extra?`<p>${extra}</p>`:''}<p style="font-size:12.5px;color:#9a93c7">🏆 최고 기록은 NNN WORLD 랭킹에 올라가요</p><button class="rt-go" id="rtAgain">다시 하기</button><a class="rt-go soft" style="display:grid;place-items:center;text-decoration:none;color:#fff;margin-top:10px" href="../">NNN 월드로</a></div>`;
        ov.hidden=false;ov.querySelector('#rtAgain').onclick=start},
      win(title,extra){G.state='over';sfx('clear');
        ov.innerHTML=`<div class="rt-card"><h1>${title||'클리어!'}</h1><div class="rt-big">${G.score}</div>${G._newBest?'<span class="rt-new">★ 최고 기록!</span>':`<p>최고 기록 ${best}</p>`}
          ${extra?`<p>${extra}</p>`:''}<button class="rt-go" id="rtAgain">처음부터 다시</button><a class="rt-go soft" style="display:grid;place-items:center;text-decoration:none;color:#fff;margin-top:10px" href="../">NNN 월드로</a></div>`;
        ov.hidden=false;ov.querySelector('#rtAgain').onclick=start},
    };
    function start(){ac();G.score=0;G._frac=0;G.practice=false;G._newBest=false;$S.textContent=0;G.t=0;for(const k in held)held[k]=0;pend={};G.state='play';ov.hidden=true;sfx('start');cfg.init(G)}
    const curLine=()=>`난이도 ${({easy:'쉬움',normal:'보통',hard:'어려움'})[optGet('diff')]}${cfg.stages?` · ${G.start}${cfg.stages.label}부터`:''}`;
    function title(){ov.innerHTML=`<div class="rt-card"><h1>${cfg.title.replace('NNN ','')}</h1><div class="en">${cfg.en||''}</div><p>${cfg.intro||''}</p>
      <div class="rt-help">${cfg.help}</div><button class="rt-go" id="rtStart">▶ 시작</button><button class="rt-go soft" id="rtOpt" style="margin-top:10px">⚙ 옵션</button><p class="rt-cur">${curLine()}</p></div>`;ov.hidden=false;
      ov.querySelector('#rtStart').onclick=start;ov.querySelector('#rtOpt').onclick=()=>options(title)}
    function options(back){const row=d=>{const v=optGet(d.k);
        if(d.type==='start'){const cur=G.start;return `<div class="rt-orow"><b>${d.label}</b><div class="rt-step"><button data-st="-1">−</button><span>${cur}${cfg.stages.label} <small style="display:inline;color:#9a93c7">/ ${reach}까지 열림</small></span><button data-st="1">+</button></div><small>${d.note}</small></div>`}
        return `<div class="rt-orow"><b>${d.label}</b><div class="rt-seg">${d.ch.map(([cv,cl])=>`<button data-k="${d.k}" data-v="${cv}" class="${String(v)===String(cv)?'on':''}">${cl}</button>`).join('')}</div>${d.note?`<small>${d.note}</small>`:''}</div>`};
      ov.innerHTML=`<div class="rt-card"><h1>⚙ 옵션</h1><div class="rt-opts">${DEFS.map(row).join('')}</div><button class="rt-go" id="rtOk">확인</button></div>`;ov.hidden=false;
      ov.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{optSet(b.dataset.k,b.dataset.v);sfx('blip');options(back)});
      ov.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{let n=G.start+ +b.dataset.st;n=Math.max(1,Math.min(reach,n));OPT.start=n;try{localStorage.setItem(OKEY,JSON.stringify(OPT))}catch(e){}sfx('blip');options(back)});
      ov.querySelector('#rtOk').onclick=back}
    G.options=options;
    function togglePause(){if(G.state==='play'){G.state='pause';ov.innerHTML=`<div class="rt-card"><h1>잠깐 멈춤</h1><button class="rt-go" id="rtRes">계속하기</button><button class="rt-go soft" id="rtRe" style="margin-top:10px">처음부터</button><button class="rt-go soft" id="rtPO" style="margin-top:10px">⚙ 옵션</button><p class="rt-cur">난이도·시작 단계는 다음 판부터 적용돼요</p></div>`;ov.hidden=false;
        ov.querySelector('#rtRes').onclick=()=>{G.state='play';ov.hidden=true;for(const k in held)held[k]=0};ov.querySelector('#rtRe').onclick=start;ov.querySelector('#rtPO').onclick=()=>options(()=>{G.state='play';togglePause()})}
      else if(G.state==='pause'){G.state='play';ov.hidden=true}}
    G.pause=togglePause;
    root.querySelector('#rtPause').onclick=togglePause;
    root.querySelector('#rtSnd').onclick=e=>{muted=!muted;try{localStorage.setItem('nnnretro_mute',muted?'1':'0')}catch(_){}e.currentTarget.textContent=muted?'🔇':'🔊'};
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='play')togglePause()});

    /* 루프 */
    let last=performance.now(),acc=0;const STEP=1/60;
    function frame(now){let d=(now-last)/1000;last=now;if(d>.25)d=.25;
      if(G.state==='play'){acc+=d;let first=true;while(acc>=STEP){G.hit=first?pend:{};if(first)pend={};first=false;G.t+=STEP;cfg.update(G,STEP);acc-=STEP;if(G.state!=='play')break}}
      else{acc=0;pend={};G.hit={}}
      ctx.imageSmoothingEnabled=false;cfg.draw(G,ctx);
      if(cfg.attract&&G.state==='title')cfg.attract(G,ctx);
      requestAnimationFrame(frame)}
    if(cfg.setup)cfg.setup(G);else cfg.init(G);
    applyUI();title();fit();(document.fonts&&document.fonts.ready||Promise.resolve()).then(fit);
    requestAnimationFrame(frame);
    window.__G=G;window.__start=start;
    return G;
  }
  window.Retro={boot,sprite,sfx,text};
})();
