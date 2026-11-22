/* 스타일 팩 3 — 운동·액션 / 반려동물 / 야경·밤 + 기존 분류 보강. kit.js + styles.js 뒤에 로드. */
(function(){
if(!window.PHOTO_STYLES||!window.KIT)return;
Object.assign(PHOTO_STYLES.cats,{sport:'운동·액션',pet:'반려동물',night:'야경·밤'});
const O=KIT.ops;
O.ring=(c,w,h,o={})=>{const r=KIT.rect;r(c,0,0,w,h,o.bg||'#14131a');KIT.glow(c,w*.5,h*.05,w*.9,'rgba(255,240,210,.35)');KIT.poly(c,[[0,h*.72],[w,h*.72],[w,h],[0,h]],o.mat||'#2a4fa8');
  [['#e8e8ee',.5],['#d8262e',.56],['#e8e8ee',.62]].forEach(([cl,y])=>r(c,0,h*y,w,h*.012,cl));r(c,w*.04,h*.42,w*.03,h*.32,'#c9c9cf');r(c,w*.93,h*.42,w*.03,h*.32,'#c9c9cf')};
O.bag=(c,w,h,x,y,s=.5,col='#8a1f24')=>{KIT.rect(c,w*x-1,0,2,h*(y-s),'#555');KIT.rr(c,w*x-w*.08,h*(y-s),w*.16,h*s,w*.05,col);KIT.rect(c,w*x-w*.08,h*(y-s*.55),w*.16,h*.02,'rgba(0,0,0,.25)')};
O.track=(c,w,h)=>{KIT.vg(c,w,h,['#bfe0f5','#eef7ff'],0,h*.42);KIT.rect(c,0,h*.42,w,h*.58,'#c4573e');for(let i=0;i<6;i++){c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2;c.beginPath();c.moveTo(w*(.5-.08*(i-2.5)),h*.42);c.lineTo(w*(.5-.5*(i-2.5)),h);c.stroke()}};
O.court=(c,w,h)=>{KIT.rect(c,0,0,w,h,'#d79a5a');c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.strokeRect(w*.12,h*.1,w*.76,h*.8);c.beginPath();c.arc(w*.5,h*.5,w*.15,0,KIT.TAU);c.stroke();c.beginPath();c.moveTo(w*.12,h*.5);c.lineTo(w*.88,h*.5);c.stroke()};
O.pool=(c,w,h)=>{KIT.vg(c,w,h,['#5fd0e8','#1b8fb8']);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;const r=KIT.rnd(3);for(let i=0;i<30;i++){const x=r()*w,y=r()*h;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+12,y-6,x+24,y);c.stroke()}[.25,.5,.75].forEach(x=>{for(let k=0;k<20;k++)KIT.rect(c,w*x-3,h*k/20,6,h*.03,k%2?'#fff':'#e8323a')})};
O.cat=(c,w,h,x,y,s=.14,col='#9a9aa2',d=1)=>{const S=w*s;KIT.ell(c,w*x,h*y-S*.4,S*.5,S*.32,col);KIT.circ(c,w*x+d*S*.42,h*y-S*.82,S*.3,col);KIT.poly(c,[[w*x+d*S*.22,h*y-S*1.0],[w*x+d*S*.3,h*y-S*1.28],[w*x+d*S*.42,h*y-S*1.06]],col);KIT.poly(c,[[w*x+d*S*.5,h*y-S*1.06],[w*x+d*S*.62,h*y-S*1.28],[w*x+d*S*.68,h*y-S*.98]],col);
  KIT.circ(c,w*x+d*S*.34,h*y-S*.86,S*.045,'#2a6a2a');KIT.circ(c,w*x+d*S*.54,h*y-S*.86,S*.045,'#2a6a2a');c.strokeStyle=col;c.lineWidth=S*.12;c.lineCap='round';c.beginPath();c.moveTo(w*x-d*S*.45,h*y-S*.4);c.quadraticCurveTo(w*x-d*S*.9,h*y-S*.5,w*x-d*S*.75,h*y-S*1.0);c.stroke()};
O.dogFace=(c,w,h,x,y,s=.4,col='#d8a466')=>{const S=w*s;KIT.ell(c,w*x-S*.42,h*y-S*.05,S*.18,S*.36,KIT.shade(col,-.35),-.3);KIT.ell(c,w*x+S*.42,h*y-S*.05,S*.18,S*.36,KIT.shade(col,-.35),.3);KIT.ell(c,w*x,h*y,S*.42,S*.44,col);KIT.ell(c,w*x,h*y+S*.2,S*.24,S*.18,'#f2dcc0');
  KIT.circ(c,w*x-S*.16,h*y-S*.06,S*.055,'#1a120c');KIT.circ(c,w*x+S*.16,h*y-S*.06,S*.055,'#1a120c');KIT.circ(c,w*x-S*.14,h*y-S*.08,S*.018,'#fff');KIT.circ(c,w*x+S*.18,h*y-S*.08,S*.018,'#fff');KIT.ell(c,w*x,h*y+S*.12,S*.08,S*.055,'#1a120c')};
O.couch=(c,w,h,y=.8,col='#7d8aa8')=>{KIT.rr(c,-w*.05,h*(y-.22),w*1.1,h*.16,w*.04,KIT.shade(col,-.12));KIT.rr(c,-w*.05,h*(y-.08),w*1.1,h*.12,w*.03,col);KIT.rect(c,0,h*(y+.04),w,h,'#b9a58c')};
O.bridge=(c,w,h,y=.55)=>{c.strokeStyle='#e9d7a8';c.lineWidth=3;for(let i=0;i<14;i++){c.beginPath();c.moveTo(w*(.2+i*.045),h*y);c.lineTo(w*.32,h*(y-.3));c.stroke();c.beginPath();c.moveTo(w*(.2+i*.045)+w*.3,h*y);c.lineTo(w*.78,h*(y-.3));c.stroke()}KIT.rect(c,w*.3,h*(y-.34),w*.04,h*.4,'#cfc5a8');KIT.rect(c,w*.76,h*(y-.34),w*.04,h*.4,'#cfc5a8');KIT.rect(c,0,h*y,w,h*.025,'#cfc5a8');for(let i=0;i<30;i++)KIT.glow(c,w*i/29,h*y,w*.03,'rgba(255,220,150,.8)')};
O.ferris=(c,w,h,x,y,r)=>{c.strokeStyle='rgba(255,180,220,.9)';c.lineWidth=2;c.beginPath();c.arc(w*x,h*y,w*r,0,KIT.TAU);c.stroke();for(let i=0;i<16;i++){const a=i/16*KIT.TAU;c.beginPath();c.moveTo(w*x,h*y);c.lineTo(w*x+Math.cos(a)*w*r,h*y+Math.sin(a)*w*r);c.stroke();KIT.glow(c,w*x+Math.cos(a)*w*r,h*y+Math.sin(a)*w*r,w*.03,i%2?'rgba(120,200,255,.9)':'rgba(255,120,200,.9)')}
  KIT.poly(c,[[w*x,h*y],[w*(x-r*.6),h*.98],[w*(x-r*.5),h*.98]],'#888');KIT.poly(c,[[w*x,h*y],[w*(x+r*.6),h*.98],[w*(x+r*.5),h*.98]],'#888')};
O.trails=(c,w,h,y=.75)=>{c.lineCap='round';for(let i=0;i<7;i++){c.strokeStyle=i%2?'rgba(255,70,70,.85)':'rgba(255,240,200,.9)';c.lineWidth=2+i%3;c.beginPath();c.moveTo(-10,h*(y+i*.025));c.bezierCurveTo(w*.35,h*(y-.05+i*.02),w*.65,h*(y+.06+i*.02),w+10,h*(y-.02+i*.025));c.stroke()}};
O.tent=(c,w,h,x,y,s=.3)=>{KIT.poly(c,[[w*(x-s),h*y],[w*x,h*(y-s*.9)],[w*(x+s),h*y]],'#e8a03a');KIT.poly(c,[[w*(x-s*.25),h*y],[w*x,h*(y-s*.6)],[w*(x+s*.25),h*y]],'#fff2c4');KIT.glow(c,w*x,h*(y-s*.25),w*s*.9,'rgba(255,200,110,.55)')};
O.candle=(c,w,h,x,y,s=.06)=>{KIT.rect(c,w*x-w*s*.25,h*y-w*s,w*s*.5,w*s,'#f4ead8');KIT.glow(c,w*x,h*y-w*s*1.2,w*s*2.2,'rgba(255,190,90,.7)');KIT.ell(c,w*x,h*y-w*s*1.2,w*s*.12,w*s*.25,'#ffe7a8')};
O.cake=(c,w,h,x,y,s=.3)=>{KIT.rr(c,w*(x-s/2),h*y-w*s*.55,w*s,w*s*.55,8,'#fbe3ea');KIT.rect(c,w*(x-s/2),h*y-w*s*.55,w*s,w*s*.1,'#ff8fab');KIT.ell(c,w*x,h*y,w*s*.62,w*s*.08,'#fff');for(let i=0;i<5;i++)O.candle(c,w,h,x-s*.32+i*s*.16,y-s*.5*w/h,.018)};
O.mirror=(c,w,h,x,y,ww,hh)=>{KIT.rr(c,w*x,h*y,w*ww,h*hh,w*.02,'#d8d0c4');KIT.vgN?0:0;KIT.vg(c,w,h,['#e8eef4','#c4ccd6'],h*(y+.01),h*(y+hh-.01));c.save();c.globalAlpha=.25;KIT.poly(c,[[w*(x+ww*.2),h*y],[w*(x+ww*.45),h*y],[w*(x+ww*.1),h*(y+hh)],[w*x,h*(y+hh)]],'#fff');c.restore()};

const W1={col:'#f2e2d3',pants:'#2e3b5a',hair:'#3a2418',long:1},W2={col:'#2f2f38',pants:'#d9c7b4',hair:'#2b1d17',long:1},W3={col:'#c4515b',pants:'#2b2f3a',hair:'#1f1612',hs:'bob'},
  M1={col:'#3b4a6b',pants:'#2b2f3a',hair:'#1f1612'},M2={col:'#e9e4dc',pants:'#45526b',hair:'#2b1d17'},K1={col:'#ffd34d',pants:'#e8574a',hair:'#2b1d17'},
  B1={col:'#1c1c22',pants:'#d8262e',hair:'#1a1410',gloves:'#d8262e'},B2={col:'#f2f2f2',pants:'#1f3f9a',hair:'#2b1d17',gloves:'#1f3f9a'};
const S=[
/* ---------- 운동·액션 ---------- */
{id:'box_punch_side',cat:'sport',name:'펀치 옆모습',who:'복싱 매거진 스파링 컷',desc:'주먹이 뻗는 방향에 여백을 크게 두면 속도감이 살아요. 옆에서, 허리 높이로, 연사로 잡으세요.',
 steps:['선수를 화면 왼쪽 1/3에','주먹 뻗는 쪽(오른쪽)에 여백','연사로 팔이 다 뻗은 순간 고르기'],phone:'허리 높이 · 연사',target:[1/3,.35],face:1,tags:['person','sport','indoor'],
 draw:[['ring'],['p',.34,.97,.8,{...B1,pose:'punch'}]],gd:[['thirds'],['P',.34,.97,.8,{pose:'punch'}],['A',.55,.36,.92,.36,'g'],['T','주먹 방향 = 여백',.04,.08]]},
{id:'box_low_hero',cat:'sport',name:'로우앵글 챔피언',who:'복싱 포스터 · 영화 록키풍',desc:'바닥 가까이에서 올려 찍으면 선수가 거인처럼 보여요. 조명이 머리 뒤에 오게 하면 실루엣 테두리가 생겨요.',
 steps:['폰을 무릎 아래까지 낮추기','조명이 머리 뒤에 오게','팔짱 or 글러브 들어 올리기'],phone:'바닥 · 위로 기울이기',target:[.5,.25],face:1,tags:['person','sport','indoor'],
 draw:[['vgN',['#08080c','#24202c'],0,1],['glowAt',.5,.12,.6,'rgba(255,230,190,.55)'],['p',.5,1.08,1.02,{...B1,pose:'arms',rim:'rgba(255,230,190,.9)'}]],gd:[['L',.5,0,.5,1,.3],['A',.5,.95,.5,.6,'g'],['T','폰은 바닥에서 위로',.04,.08]]},
{id:'box_bag_work',cat:'sport',name:'샌드백 연타',who:'체육관 브이로그',desc:'샌드백과 선수를 대각선으로 놓으면 힘이 느껴져요. 샌드백이 흔들리는 순간을 연사로.',
 steps:['샌드백은 오른쪽, 선수는 왼쪽 아래','대각선으로 둘을 잇기','샌드백이 흔들릴 때 연사'],phone:'가슴 높이 · 연사',target:[.35,.35],face:1,tags:['person','sport','indoor'],
 draw:[['gym'],['bag',.68,.82,.5,'#8a1f24'],['p',.36,.97,.78,{...B2,pose:'punch'}]],gd:[['L',.1,.95,.9,.2,.6],['P',.36,.97,.78,{pose:'punch'}],['R',.6,.3,.16,.52],['T','선수 ↘ 샌드백 대각선',.04,.08]]},
{id:'box_gloves_close',cat:'sport',name:'글러브 클로즈업',who:'스포츠 브랜드 광고',desc:'글러브를 렌즈 쪽으로 내밀면 원근감 때문에 주먹이 크게 나와요. 얼굴은 뒤에서 초점 밖으로.',
 steps:['글러브를 렌즈 앞 30cm까지','얼굴은 글러브 사이로 보이게','초점은 글러브에 탭'],phone:'눈높이 · 가까이',target:[.5,.5],face:1,tags:['person','sport'],
 draw:[['studio','#2a2a30'],['p',.5,1.25,1.2,{...B1,pose:'arms'}],['ellN',.32,.62,.2,.17,'#d8262e'],['ellN',.68,.62,.2,.17,'#d8262e'],['ellN',.3,.58,.08,.05,'rgba(255,255,255,.35)']],gd:[['E',.32,.62,.2,.17],['E',.68,.62,.2,.17],['T','글러브 = 초점',.04,.08]]},
{id:'run_pan',cat:'sport',name:'달리기 패닝',who:'육상 사진가 기법',desc:'달리는 사람을 따라 폰을 같이 돌리며 찍으면 배경은 흐르고 사람은 또렷해요.',
 steps:['달려오는 방향에 여백','사람을 따라 폰을 같이 돌리기','돌리는 도중 셔터(연사)'],phone:'가슴 높이 · 따라 돌리기',target:[.38,.35],face:1,tags:['person','sport','outdoor'],
 draw:[['track'],['blurBand',0,.42,1,.3,'rgba(255,255,255,.25)'],['p',.38,.97,.7,{...K1,pose:'run'}]],gd:[['P',.38,.97,.7,{pose:'run'}],['A',.55,.4,.92,.4,'g'],['A',.1,.62,.3,.62],['T','폰도 같이 돌리기',.04,.08]]},
{id:'jump_peak',cat:'sport',name:'점프 최고점',who:'인스타 점프샷',desc:'폰을 낮추고 하늘을 넓게. 점프 최고점에서 발이 땅에서 떨어진 순간을 연사로.',
 steps:['폰을 무릎 높이로','하늘을 위 2/3로 크게','하나둘셋 점프에 맞춰 연사'],phone:'무릎 높이 · 연사',target:[.5,.4],face:1,tags:['person','sport','outdoor'],
 draw:[['sky',{t:'day'}],['clouds',3,5],['ground',.85,'sand'],['p',.5,.78,.62,{...W3,pose:'jump',smile:1}]],gd:[['L',0,.85,1,.85,.6],['A',.5,.9,.5,.8,'g'],['T','발과 땅 사이 틈',.04,.08]]},
{id:'swim_top',cat:'sport',name:'수영장 탑뷰',who:'드론 수영장 사진',desc:'위에서 내려다보면 레인 줄이 그래픽처럼 보여요. 사람을 레인 사이 가운데에.',
 steps:['폰을 수면과 평행하게 위에서','레인 줄이 세로로 곧게','사람을 두 줄 사이 가운데'],phone:'위에서 아래로',target:[.5,.5],tags:['sport','outdoor','top'],
 draw:[['pool'],['lie',.62,.55,.45,{col:'#e8323a',pants:'#e8323a',hair:'#1a1410'},-Math.PI/2]],gd:[['L',.25,0,.25,1,.5],['L',.75,0,.75,1,.5],['ring',.62,.55,.08],['T','레인 = 세로로 곧게',.04,.08]]},
{id:'court_top',cat:'sport',name:'코트 위 그림자',who:'미니멀 스포츠 그래픽',desc:'코트 라인과 긴 그림자를 함께. 해가 낮은 오후에 위에서 찍으면 그래픽 포스터 같아요.',
 steps:['해가 낮은 시간','높은 곳에서 코트 내려다보기','사람은 라인 교차점에'],phone:'높이 · 아래로',target:[.66,.66],tags:['sport','outdoor','top'],
 draw:[['court'],['polyN',[[.64,.64],[.68,.64],[.95,.98],[.86,.98]],'rgba(0,0,0,.35)'],['ellN',.66,.64,.03,.025,'#1c1c22']],gd:[['thirds'],['ring',.66,.64,.05],['T','교차점에 사람',.04,.08]]},
/* ---------- 반려동물 ---------- */
{id:'pet_eye',cat:'pet',name:'눈높이 강아지',who:'반려견 사진가 기본기',desc:'강아지 눈높이까지 엎드리면 표정이 완전히 달라져요. 눈에 초점, 간식은 렌즈 바로 위에.',
 steps:['나도 바닥에 엎드리기','간식을 렌즈 바로 위에 들기','눈에 초점 탭'],phone:'바닥 높이',target:[.5,.42],tags:['pet','indoor'],
 draw:[['room',{wall:'#efe6d8',floor:'wood'}],['dogFace',.5,.48,.5,'#d8a466'],['ellN',.5,.86,.3,.05,'rgba(0,0,0,.12)']],gd:[['L',0,.44,1,.44,.5],['ring',.41,.46,.05],['ring',.59,.46,.05],['T','눈높이 = 바닥',.04,.08]]},
{id:'pet_tilt',cat:'pet',name:'갸웃 표정',who:'반려견 SNS 인기컷',desc:'이상한 소리를 내면 고개를 갸웃해요. 그 순간을 연사로. 얼굴을 화면 위 1/3에.',
 steps:['얼굴을 위 1/3 선에','삑삑 소리 내기','고개 기울이는 순간 연사'],phone:'눈높이 · 연사',target:[.5,1/3],tags:['pet'],
 draw:[['studio','#cfe3f2'],['rotS',-14],['dogFace',.5,.38,.55,'#f1d4a8'],['rotE']],gd:[['thirds'],['ring',.5,.36,.2],['T','소리 내고 연사',.04,.08]]},
{id:'pet_run_field',cat:'pet',name:'달려오는 강아지',who:'반려견 야외 촬영',desc:'멀리서 부르면 달려와요. 폰을 낮추고 연사. 귀가 펄럭일 때가 베스트컷.',
 steps:['보호자는 멀리서 부르기','나는 바닥에 낮게','달려올 때 연사 6장'],phone:'바닥 · 연사',target:[.5,.6],tags:['pet','outdoor'],
 draw:[['sky',{t:'day'}],['field',.55],['dog',.5,.9,.36,'#d8a466',-1]],gd:[['A',.5,.6,.5,.85,'g'],['L',0,.55,1,.55,.4],['T','낮게 · 연사',.04,.08]]},
{id:'cat_window',cat:'pet',name:'창가 고양이',who:'고양이 집사 감성샷',desc:'창가 빛을 받는 고양이. 창을 액자처럼 쓰고 고양이는 아래쪽 1/3 교차점에.',
 steps:['창을 화면 테두리로','고양이는 아래 1/3 교차점','노출을 고양이 쪽으로 탭'],phone:'눈높이',target:[2/3,2/3],tags:['pet','indoor','window'],
 draw:[['room',{wall:'#e9e0d2',win:[.1,.08,.8,.6],floor:'wood',floorY:.72}],['rectN',.05,.68,.9,.05,'#f4efe8'],['cat',.64,.7,.3,'#5a5a62',-1],['glowAt',.5,.4,.6,'rgba(255,240,200,.35)']],gd:[['thirds'],['R',.1,.08,.8,.6],['ring',.6,.6,.08],['T','창 = 액자',.04,.08]]},
{id:'cat_paws',cat:'pet',name:'젤리 발바닥',who:'고양이 디테일 컷',desc:'자는 고양이 발바닥을 가까이. 배경은 이불로 단순하게, 발은 화면 가운데 아래.',
 steps:['잘 때 살금살금 다가가기','배경은 이불 한 가지 색','발바닥만 크게'],phone:'아주 가까이',target:[.5,.6],tags:['pet','indoor','close'],
 draw:[['vgN',['#f3ede4','#e4d8c6'],0,1],['ellN',.5,.4,.55,.35,'#9a9aa2'],['ellN',.4,.68,.12,.1,'#9a9aa2'],['ellN',.6,.68,.12,.1,'#9a9aa2'],['ellN',.4,.7,.05,.04,'#f2a7b5'],['ellN',.6,.7,.05,.04,'#f2a7b5'],['ellN',.35,.63,.025,.02,'#f2a7b5'],['ellN',.45,.63,.025,.02,'#f2a7b5'],['ellN',.55,.63,.025,.02,'#f2a7b5'],['ellN',.65,.63,.025,.02,'#f2a7b5']],
 gd:[['E',.5,.68,.25,.12],['T','배경은 한 가지 색',.04,.08]]},
{id:'pet_with_owner',cat:'pet',name:'주인과 눈맞춤',who:'반려 가족 사진',desc:'주인과 반려동물이 서로 바라보는 옆모습. 두 얼굴 사이 시선 선이 사진의 중심이 돼요.',
 steps:['둘이 마주 보게','옆에서, 두 얼굴을 같은 높이로','간식을 주인 입 근처에'],phone:'눈높이',target:[.5,.4],face:1,tags:['pet','person'],
 draw:[['sky',{t:'golden'}],['ground',.8,'grass'],['p',.3,1.05,.95,{...W1,pose:'crouch',dir:1,smile:1}],['dog',.7,.82,.32,'#f1d4a8',-1]],gd:[['L',.34,.42,.72,.5,.8],['ring',.34,.42,.05],['ring',.72,.5,.05],['T','두 시선을 잇기',.04,.08]]},
{id:'pet_couch',cat:'pet',name:'소파 위 낮잠',who:'일상 반려 사진',desc:'소파 위에 늘어진 모습은 위에서 내려다보며. 소파 라인을 화면과 평행하게.',
 steps:['위에서 살짝 내려다보기','소파 등받이 선을 수평으로','몸 전체가 들어오게'],phone:'서서 · 아래로',target:[.5,.6],tags:['pet','indoor'],
 draw:[['vgN',['#e8e0d4','#d8cdbd'],0,1],['couch',.82,'#7d8aa8'],['dog',.52,.76,.42,'#2b2522',1],['ellN',.75,.66,.08,.06,'#f2c14e']],gd:[['L',0,.6,1,.6,.6],['T','소파 선 = 수평',.04,.08]]},
/* ---------- 야경·밤 ---------- */
{id:'night_bridge',cat:'night',name:'다리 야경',who:'야경 사진가 · 반포대교풍',desc:'불빛이 물에 비치는 반영까지. 수평선을 가운데로 두면 위아래 대칭이 생겨요. 폰을 난간에 고정하세요.',
 steps:['폰을 난간에 대고 고정','수평선 = 화면 가운데','노출을 살짝 내리기(해 모양 드래그)'],phone:'난간에 고정',target:[.5,.5],tags:['night','land','city'],
 draw:[['sky',{t:'night',stars:1,to:.55}],['city',.55,true,4],['sea',.55,1,'night'],['bridge',.55],['blurBand',0,.6,1,.3,'rgba(255,210,140,.18)']],gd:[['L',0,.55,1,.55,.8],['T','반영까지 대칭',.04,.08]]},
{id:'night_car_trails',cat:'night',name:'자동차 불빛 궤적',who:'장노출 야경',desc:'라이브 포토로 찍고 ‘장노출’ 효과를 켜면 차 불빛이 선이 돼요. 길이 휘어지는 곳에서.',
 steps:['아이폰 라이브 포토 켜기','폰을 고정하고 3초 이상','사진첩 → 라이브 → 장노출'],phone:'고정 · 라이브',target:[.5,.75],tags:['night','city','street'],
 draw:[['sky',{t:'blue',to:.6}],['city',.62,true,6],['rectN',0,.62,1,.38,'#14161c'],['trails',.74]],gd:[['Q',[0,.75,.5,.7,1,.78]],['T','라이브 → 장노출',.04,.08]]},
{id:'night_neon_portrait',cat:'night',name:'네온 인물',who:'홍콩 영화 색감',desc:'간판 네온 빛이 얼굴에 닿게. 얼굴 밝기에 노출을 맞추면 배경 네온이 진하게 살아나요.',
 steps:['네온 간판 옆에 서기','얼굴에 노출 탭 후 살짝 내리기','그녀는 간판 반대쪽을 보기'],phone:'눈높이',target:[.4,.3],face:1,tags:['night','person','city'],
 draw:[['neon'],['rectN',.55,.1,.4,.16,'rgba(255,60,140,.85)'],['p',.4,1.02,.92,{...W2,rim:'rgba(255,80,160,.9)'}]],gd:[['thirds'],['P',.4,1.02,.92,{}],['R',.55,.1,.4,.16],['T','얼굴에 노출 탭',.04,.08]]},
{id:'night_sparkler',cat:'night',name:'불꽃 막대',who:'캠핑·여름밤 인생샷',desc:'불꽃 막대를 돌리며 라이브 포토 장노출로. 사람은 어둡게, 불꽃만 선명하게.',
 steps:['어두운 곳, 폰 고정','라이브 포토로 찍기','장노출로 바꿔 불꽃 선 만들기'],phone:'고정',target:[.5,.4],face:1,tags:['night','person','outdoor'],
 draw:[['sky',{t:'night',stars:1}],['ground',.85,'dark'],['sil',.5,.97,.6,'#0d0a14','reach'],['lines',[[.35,.3,.4,.18,.55,.15,.66,.25,.62,.38,.5,.4]],'rgba(255,220,130,.95)',3],['glowAt',.55,.25,.25,'rgba(255,200,100,.5)']],gd:[['ring',.52,.28,.14],['T','라이브 → 장노출',.04,.08]]},
{id:'night_ferris',cat:'night',name:'관람차 앞',who:'놀이공원 야간 데이트',desc:'관람차 불빛을 뒤에 크게, 사람은 앞쪽 아래. 2x 줌으로 배경을 당기면 불빛이 커져요.',
 steps:['관람차를 뒤에 두고 2x 줌','사람은 아래 1/3','얼굴에 노출 탭'],phone:'2x 줌',target:[.35,.6],face:1,tags:['night','person','outdoor'],
 draw:[['sky',{t:'dusk'}],['ferris',.62,.38,.36],['p',.32,1.02,.62,{...W1,smile:1}]],gd:[['thirds'],['P',.32,1.02,.62,{}],['T','2x 줌으로 불빛 크게',.04,.08]]},
{id:'night_tent',cat:'night',name:'별 아래 텐트',who:'캠핑 사진가',desc:'텐트 안에 랜턴을 켜면 텐트가 등불처럼 빛나요. 하늘을 위 2/3로 크게.',
 steps:['텐트 안에 랜턴 켜기','폰을 바닥에 고정','하늘 2/3 · 땅 1/3'],phone:'바닥 고정',target:[1/3,2/3],tags:['night','land','outdoor'],
 draw:[['sky',{t:'night',stars:1}],['mountains',.72,['#141a30','#0e1326','#0a0e1c']],['ground',.82,'dark'],['tent',.34,.84,.2]],gd:[['thirds'],['L',0,2/3,1,2/3,.7],['T','하늘을 크게',.04,.08]]},
{id:'night_candle',cat:'night',name:'촛불 케이크',who:'생일 무드샷',desc:'방 불을 끄고 촛불 빛만으로. 얼굴은 촛불 바로 위, 노출은 얼굴에 맞춰 살짝 어둡게.',
 steps:['방 불 끄기','촛불이 얼굴 아래에 오게','얼굴에 탭 후 노출 내리기'],phone:'눈높이',target:[.5,.35],face:1,tags:['night','person','indoor'],
 draw:[['vgN',['#120c0a','#2a1a12'],0,1],['p',.5,1.15,1.0,{...W3,smile:1,rim:'rgba(255,190,110,.8)'}],['glowAt',.5,.7,.55,'rgba(255,170,80,.45)'],['cake',.5,.92,.42]],gd:[['L',.5,.35,.5,.72,.4],['T','촛불 = 조명',.04,.08]]},
/* ---------- 인물 보강 ---------- */
{id:'mirror_ootd',cat:'people',name:'거울 셀카 OOTD',who:'패션 인플루언서',desc:'전신 거울 앞에서 폰으로 얼굴 일부를 가리면 자연스러워요. 폰은 가슴 높이, 거울과 평행하게.',
 steps:['거울과 폰을 평행하게','폰을 가슴 높이에','발끝까지 들어오게 한 발 뒤로'],phone:'가슴 높이 · 평행',target:[.5,.3],face:1,tags:['person','indoor','selfie'],
 draw:[['room',{wall:'#efe7dc',floor:'wood'}],['mirror',.18,.06,.64,.9],['p',.5,.94,.82,{...W2,pose:'phone'}]],gd:[['R',.18,.06,.64,.9],['L',.5,.06,.5,.96,.3],['T','거울 = 평행',.04,.08]]},
{id:'window_light',cat:'people',name:'창가 렘브란트 빛',who:'인물 사진 조명 기본',desc:'창가 옆에 45도로 서면 얼굴 한쪽에 빛, 반대쪽에 삼각형 빛이 생겨요. 실내 인물 최고의 조명.',
 steps:['창 옆에 45도로 서기','얼굴 어두운 쪽 볼에 작은 삼각 빛','노출은 밝은 쪽 얼굴에'],phone:'눈높이',target:[.45,.32],face:1,tags:['person','indoor','window'],
 draw:[['vgN',['#1c1a1e','#2c2830'],0,1],['rectN',0,.05,.22,.8,'rgba(255,245,220,.85)'],['glowAt',.15,.4,.6,'rgba(255,240,210,.4)'],['p',.5,1.2,1.15,{...W1,dir:-1,rim:'rgba(255,240,210,.8)'}]],gd:[['R',0,.05,.22,.8],['A',.22,.35,.4,.35,'g'],['T','창 옆 45도',.04,.08]]},
{id:'hat_brim_shadow',cat:'people',name:'모자 그림자',who:'여름 화보',desc:'챙 넓은 모자 그림자가 눈을 덮으면 신비로운 분위기. 입술과 턱에만 빛이 닿게.',
 steps:['해가 머리 위에 있을 때','모자 챙을 살짝 내리기','입술·턱에 노출 탭'],phone:'눈높이',target:[.5,.38],face:1,tags:['person','outdoor'],
 draw:[['sky',{t:'day'}],['sea',.62],['p',.5,1.25,1.2,{...W1,hat:'#e9d7a8',smile:1}]],gd:[['L',0,.28,1,.28,.4],['T','그림자 = 눈',.04,.08]]},
{id:'clear_umbrella',cat:'people',name:'비 오는 날 우산',who:'영화 속 비 장면',desc:'투명 우산 너머로 빗방울과 불빛. 비 오는 날은 노출을 살짝 내려야 분위기가 살아요.',
 steps:['투명 우산을 렌즈 쪽으로 기울이기','뒤에 불빛 있는 거리','노출 살짝 내리기'],phone:'가슴 높이',target:[.5,.4],face:1,tags:['person','outdoor','rain','city'],
 draw:[['night',3],['rain',120],['p',.5,1.02,.85,{...W2,smile:1}],['umbrella',.5,.3,.3]],gd:[['E',.5,.3,.3,.13],['T','우산 = 액자',.04,.08]]},
{id:'flower_face',cat:'people',name:'꽃 사이 얼굴',who:'봄 인생샷',desc:'렌즈 바로 앞에 꽃을 두면 앞이 흐릿한 꽃 테두리가 생겨요. 얼굴은 꽃 사이 틈에.',
 steps:['렌즈 앞 5cm에 꽃 가지','얼굴은 꽃 사이 틈에','얼굴에 초점 탭'],phone:'눈높이 · 꽃 앞',target:[.5,.4],face:1,tags:['person','outdoor','flower'],
 draw:[['sky',{t:'pastel'}],['p',.5,1.2,1.1,{...W1,smile:1}],['bokeh',30,3,['rgba(247,168,196,.9)','rgba(255,255,255,.8)'],0,.25],['bokeh',30,9,['rgba(247,168,196,.9)','rgba(255,255,255,.8)'],.75,1]],gd:[['shade',0,0,1,.22,.2],['shade',0,.78,1,.22,.2],['T','렌즈 앞에 꽃',.04,.16]]},
/* ---------- 커플 보강 ---------- */
{id:'couple_forehead',cat:'couple',name:'이마 맞대기',who:'웨딩 스냅 시그니처',desc:'눈을 감고 이마를 맞대는 순간. 두 얼굴 사이 빈 공간이 사진의 핵심이에요.',
 steps:['둘이 마주 보고 이마 맞대기','눈 감기','옆에서, 두 얼굴 사이 틈을 가운데'],phone:'눈높이',target:[.5,.35],face:2,tags:['person','couple'],
 draw:[['sky',{t:'golden',sun:[.5,.45,.5]}],['p',.38,1.2,1.15,{...M1,dir:1}],['p',.62,1.22,1.08,{...W1,dir:-1}]],gd:[['L',.5,0,.5,1,.6],['ring',.5,.34,.06],['T','두 얼굴 사이를 가운데',.04,.08]]},
{id:'couple_piggy',cat:'couple',name:'업어주기',who:'커플 여행 스냅',desc:'업어주는 장면은 낮은 곳에서 위로. 둘 다 크게 웃는 순간을 연사로.',
 steps:['폰을 허리 높이로','둘 다 화면 가운데','웃을 때 연사'],phone:'허리 높이 · 연사',target:[.5,.35],face:2,tags:['person','couple','outdoor'],
 draw:[['sky',{t:'day'}],['clouds',3,2],['ground',.86,'sand'],['p',.5,.98,.78,{...M2,pose:'arms',smile:1}],['p',.52,.72,.55,{...W3,smile:1,pose:'wave'}]],gd:[['L',.5,0,.5,1,.4],['T','둘 다 크게 웃게',.04,.08]]},
{id:'couple_long_shadow',cat:'couple',name:'둘의 그림자',who:'감성 커플 계정',desc:'해 질 녘 긴 그림자만 찍어도 커플 사진이 돼요. 손잡은 그림자를 대각선으로.',
 steps:['해를 등지고 서기','그림자가 대각선으로 길게','손 잡거나 하트 만들기'],phone:'위에서 아래로',target:[.5,.6],tags:['couple','outdoor','top'],
 draw:[['ground',0,'sand'],['polyN',[[.2,.2],[.3,.2],[.62,.95],[.46,.95]],'rgba(40,30,20,.55)'],['polyN',[[.34,.18],[.44,.18],[.84,.95],[.68,.95]],'rgba(40,30,20,.55)']],gd:[['L',.25,.2,.55,.95,.6],['L',.4,.18,.76,.95,.6],['T','그림자 = 대각선',.04,.08]]},
{id:'family_walk',cat:'couple',name:'가족 손잡고 걷기',who:'가족 사진 스냅',desc:'아이를 가운데에 두고 셋이 손잡고 걸어가는 뒷모습. 길이 멀리 모이게.',
 steps:['길이 멀리 모이는 곳','셋이 손잡고 걸어가기','뒤에서 허리 높이로'],phone:'허리 높이',target:[.5,.6],tags:['couple','person','outdoor','family'],
 draw:[['sky',{t:'golden'}],['ground',.6,'grass'],['polyN',[[.4,.6],[.6,.6],[.9,1],[.1,1]],'#c9b48a'],['p',.38,.98,.6,{...M1,back:1}],['p',.5,.98,.38,{...K1,back:1}],['p',.62,.98,.56,{...W1,back:1}]],gd:[['L',.1,1,.47,.6,.5],['L',.9,1,.53,.6,.5],['T','길이 모이게',.04,.08]]},
/* ---------- 여행 보강 ---------- */
{id:'plane_window',cat:'travel',name:'비행기 창밖',who:'여행 계정 단골 첫 컷',desc:'비행기 창틀을 액자로. 날개를 아래 1/3에 두고 창에 렌즈를 바짝 대면 반사가 없어요.',
 steps:['렌즈를 창에 바짝','날개를 아래 1/3 선에','창틀이 테두리가 되게'],phone:'창에 바짝',target:[.5,2/3],tags:['travel','window'],
 draw:[['sky',{t:'golden'}],['clouds',6,4,.45,.8],['polyN',[[.15,.72],[.95,.6],[.95,.68],[.2,.78]],'#e8ecf2'],['window',.1,.08,.8,.8,'#d8dce2']],gd:[['E',.5,.48,.4,.4],['L',0,2/3,1,2/3,.6],['T','창틀 = 액자',.04,.08]]},
{id:'hotel_bed',cat:'travel',name:'호텔 침대 위에서',who:'호캉스 계정',desc:'침대 위에 서서 내려다보면 하얀 이불이 반사판이 돼요. 조식이나 책을 소품으로.',
 steps:['침대 위에서 내려다보기','이불을 화면 가득','소품을 대각선으로'],phone:'위에서 아래로',target:[.5,.5],face:1,tags:['travel','indoor','top'],
 draw:[['vgN',['#fbfbfa','#ecebe6'],0,1],['lie',.42,.5,.62,{...W1,smile:1},-Math.PI/2.4],['plate',.74,.78,.12],['cup',.8,.32,.08]],gd:[['L',.1,.1,.9,.9,.5],['T','이불 = 반사판',.04,.08]]},
{id:'train_seat_window',cat:'travel',name:'기차 창가',who:'기차 여행 무드',desc:'창밖을 보는 옆모습과 지나가는 풍경. 창 쪽에 여백을 두면 이야기가 생겨요.',
 steps:['창 반대쪽에서 옆모습','창밖 쪽에 여백','노출은 창밖에 맞춰 실루엣도 OK'],phone:'눈높이',target:[1/3,.38],face:1,tags:['travel','indoor','window','person'],
 draw:[['vgN',['#3a3430','#2a2420'],0,1],['rectN',.45,.12,.5,.55,'#9fd6f0'],['mountains',.55,['#7fa9c4','#5f8aa8','#456f8c']],['window',.45,.12,.5,.55,'#3a3430'],['p',.28,1.15,1.05,{...W2,dir:1,rim:'rgba(255,255,255,.6)'}]],gd:[['thirds'],['R',.45,.12,.5,.55],['T','창밖 쪽 = 여백',.04,.08]]},
{id:'map_hands',cat:'travel',name:'지도 든 손',who:'여행 플랫레이',desc:'지도·여권·커피를 위에서. 손이 들어가면 이야기가 생겨요.',
 steps:['위에서 수평으로','지도를 가운데','손과 소품을 가장자리에'],phone:'위에서 아래로',target:[.5,.5],tags:['travel','top','food'],
 draw:[['tabletop','wood'],['rectN',.18,.22,.64,.5,'#efe3c6'],['lines',[[.22,.3,.4,.45,.55,.38,.75,.6]],'rgba(232,87,74,.8)',3],['rectN',.08,.78,.18,.14,'#2a3a6a'],['cup',.82,.9,.12],['ellN',.12,.35,.08,.1,'#f1c7a8']],gd:[['R',.18,.22,.64,.5],['T','위에서 수평',.04,.08]]},
{id:'tower_tiny',cat:'travel',name:'랜드마크와 작은 나',who:'여행 인생샷',desc:'랜드마크를 크게, 나는 아주 작게. 사람은 아래쪽 교차점에 두면 크기 대비가 살아요.',
 steps:['랜드마크에서 멀리','나는 화면 아래 1/3에 작게','하늘 여백 넉넉히'],phone:'허리 높이',target:[1/3,.85],face:1,tags:['travel','person','outdoor','city'],
 draw:[['sky',{t:'day'}],['polyN',[[.6,.06],[.66,.06],[.78,.86],[.48,.86]],'#6a6f7a'],['polyN',[[.56,.5],[.7,.5],[.72,.54],[.54,.54]],'#6a6f7a'],['ground',.86,'stone'],['p',1/3,.92,.14,{...W3}]],gd:[['thirds'],['ring',1/3,.86,.05],['T','나는 작게',.04,.08]]},
/* ---------- 풍경 보강 ---------- */
{id:'fog_trees',cat:'land',name:'안개 낀 숲',who:'풍경 사진가 새벽 컷',desc:'새벽 안개 낀 숲은 나무 한 그루를 주인공으로. 나머지는 안개 속으로 흐리게.',
 steps:['해 뜨기 직전','한 그루를 1/3 선에','노출을 밝게 올려 안개 살리기'],phone:'눈높이',target:[1/3,.5],tags:['land','outdoor','forest'],
 draw:[['forest',{fog:1,rays:1}],['bareTree',1/3,.95,.24]],gd:[['thirds'],['L',1/3,0,1/3,1,.8],['T','한 그루가 주인공',.04,.08]]},
{id:'field_one_tree',cat:'land',name:'들판의 나무 한 그루',who:'미니멀 풍경',desc:'넓은 들판에 나무 하나. 하늘을 크게 비우면 고요한 사진이 돼요.',
 steps:['나무를 오른쪽 1/3에','지평선을 아래 1/3에','하늘을 크게 비우기'],phone:'무릎 높이',target:[2/3,2/3],tags:['land','outdoor'],
 draw:[['sky',{t:'dawn'}],['ground',.7,'field'],['tree',.68,.72,.3,'#3c5a34']],gd:[['thirds'],['ring',2/3,.5,.08],['T','하늘을 비우기',.04,.08]]},
{id:'waterfall_slow',cat:'land',name:'실크 폭포',who:'장노출 풍경',desc:'라이브 포토로 찍고 장노출로 바꾸면 물이 비단처럼. 폰은 바위에 고정.',
 steps:['폰을 바위에 고정','라이브 포토로 3초','장노출로 바꾸기'],phone:'고정 · 라이브',target:[.5,.5],tags:['land','outdoor','water'],
 draw:[['forest',{}],['polyN',[[.38,0],[.62,0],[.66,1],[.34,1]],'rgba(230,245,255,.9)'],['blurBand',.36,0,.28,1,'rgba(255,255,255,.6)'],['rectN',0,.8,1,.2,'#2a3a30']],gd:[['L',.5,0,.5,1,.4],['T','라이브 → 장노출',.04,.08]]},
{id:'mountain_layers',cat:'land',name:'겹겹이 산 능선',who:'수묵화 풍경',desc:'겹친 능선이 점점 옅어지면 깊이감이 생겨요. 2x~3x 줌으로 능선만 잘라내기.',
 steps:['높은 곳에서','2x~3x 줌으로 능선만','하늘은 거의 없이'],phone:'2x~3x 줌',target:[.5,.5],tags:['land','outdoor'],
 draw:[['vgN',['#f4e6d8','#e9d6c4'],0,1],['mountains',.38,['#d8c4c8','#c3aab4'],3],['mountains',.58,['#a68c9c','#8a7084'],5],['mountains',.8,['#6a5468','#4a3a4c'],7]],gd:[['Q',[0,.3,.5,.22,1,.34]],['Q',[0,.5,.5,.44,1,.55]],['T','줌으로 능선만',.04,.08]]},
{id:'snow_footprints',cat:'land',name:'눈 위 발자국',who:'겨울 미니멀',desc:'하얀 눈 위 발자국이 리딩라인이 돼요. 노출을 올려 눈을 하얗게.',
 steps:['발자국이 멀리 이어지게','노출을 밝게 올리기','사람은 멀리 작게'],phone:'눈높이',target:[.55,.45],face:1,tags:['land','outdoor','snow'],
 draw:[['snow',.5],['dotsPath'],['p',.56,.5,.1,{...M1,back:1}]],gd:[['Q',[.45,1,.6,.75,.56,.5]],['T','발자국 = 길',.04,.08]]},
/* ---------- 거리 보강 ---------- */
{id:'stair_light_beam',cat:'street',name:'계단 빛과 그림자',who:'스트리트 사진가',desc:'계단에 떨어진 빛 한 줄기 속으로 사람이 들어올 때까지 기다리기.',
 steps:['빛 줄기를 찾기','폰을 고정하고 기다리기','사람이 빛에 들어오면 연사'],phone:'고정 · 기다리기',target:[.6,.55],face:1,tags:['street','city','outdoor'],
 draw:[['stairs',12,.1,1,'#4a4650','#3c3842',.1],['polyN',[[.45,.1],[.75,.1],[.85,1],[.4,1]],'rgba(255,235,190,.45)'],['p',.6,.72,.4,{...M2,pose:'walk'}]],gd:[['R',.45,.1,.35,.9],['T','빛 속에 들어올 때',.04,.08]]},
{id:'puddle_reflect',cat:'street',name:'물웅덩이 반영',who:'비 온 뒤 거리 사진',desc:'폰을 물웅덩이 바로 위에 거꾸로 대면 세상이 뒤집혀 보여요.',
 steps:['비 온 뒤 웅덩이 찾기','폰을 웅덩이에 거의 닿게','위아래를 대칭으로'],phone:'바닥에 거의 닿게',target:[.5,.5],face:1,tags:['street','city','water'],
 draw:[['street',{sky:'overcast'}],['p',.5,.5,.3,{...W2,pose:'walk'}],['vgN',['rgba(60,70,90,.0)','rgba(60,70,90,0)'],.5,1],['mirrorHalf']],gd:[['L',0,.5,1,.5,.8],['T','바닥에 폰 붙이기',.04,.08]]},
{id:'crosswalk_top',cat:'street',name:'횡단보도 위에서',who:'육교 위 스트리트',desc:'육교 위에서 횡단보도를 내려다보면 줄무늬가 그래픽이 돼요. 사람 한 명이 지날 때.',
 steps:['육교·높은 곳에서','줄무늬를 수평으로','사람 한 명이 지날 때 연사'],phone:'위에서 아래로',target:[.6,.5],tags:['street','city','top'],
 draw:[['crosswalk'],['ellN',.6,.48,.035,.03,'#e8323a'],['ellN',.6,.52,.02,.04,'#1c1c22']],gd:[['L',0,.06,1,.06,.4],['ring',.6,.5,.06],['T','한 명 지날 때',.04,.08]]},
/* ---------- 음식 보강 ---------- */
{id:'cafe_hand',cat:'food',name:'잔 든 손',who:'카페 계정 단골',desc:'잔을 든 손 하나가 있으면 사진에 온기가 생겨요. 창가 옆에서, 잔은 1/3 교차점에.',
 steps:['창가 자리','잔을 든 손을 1/3 교차점','배경 창은 밝게 날려도 OK'],phone:'45도',target:[2/3,.6],tags:['food','indoor','window'],
 draw:[['room',{wall:'#f2ebe0',win:[0,.05,.5,.6],floor:'wood',floorY:.7}],['cup',.66,.78,.2,'#fff','#8a5a3a'],['ellN',.78,.68,.08,.06,'#f1c7a8']],gd:[['thirds'],['ring',2/3,2/3,.08],['T','손 = 온기',.04,.08]]},
{id:'birthday_cake',cat:'food',name:'생일 케이크 정면',who:'파티 사진',desc:'케이크는 정면 눈높이에서. 촛불이 화면 가운데 위에 오게.',
 steps:['케이크 높이까지 내려가기','촛불을 화면 가운데','배경 불빛을 흐리게'],phone:'케이크 높이',target:[.5,.55],tags:['food','indoor','night'],
 draw:[['vgN',['#2a1e22','#3a2a2e'],0,1],['bokeh',18,4,['rgba(255,200,120,.6)','rgba(255,120,160,.4)'],0,.5],['rectN',0,.78,1,.22,'#6a4a3a'],['cake',.5,.8,.6]],gd:[['L',.5,0,.5,1,.4],['L',0,.55,1,.55,.4],['T','촛불 = 가운데',.04,.08]]},
];
/* 발자국 · 반영용 보조 그리기 */
O.dotsPath=(c,w,h)=>{const r=KIT.rnd(2);for(let i=0;i<14;i++){const t=i/14,x=.45+.15*Math.sin(t*2.4)-.02*t,y=1-t*.5;KIT.ell(c,w*(x+(i%2?.015:-.015)),h*y,w*(.02-t*.012),h*(.012-t*.006),'rgba(120,140,170,.55)')}};
O.mirrorHalf=(c,w,h)=>{const W=c.canvas.width,H=c.canvas.height;c.save();c.setTransform(1,0,0,1,0,0);c.translate(0,H);c.scale(1,-1);c.globalAlpha=.75;c.drawImage(c.canvas,0,0,W,H/2,0,0,W,H/2);c.restore();KIT.rect(c,0,h*.5,w,h*.5,'rgba(40,50,70,.25)')};
PHOTO_STYLES.add(S);
})();
