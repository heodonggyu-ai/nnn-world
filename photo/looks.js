/* 색감(룩) 엔진 — WebGL 한 번 통과로 화이트밸런스·커브·색상대역·스플릿톤·흑백·비네팅·그레인 적용.
   window.LOOKS = {list, groups, byId, Renderer, apply, thumbs} */
(function(){
const hex=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const off=(h,a)=>{const c=hex(h),m=(c[0]+c[1]+c[2])/3;return c.map(v=>(v-m)*a*2)};
/* 밴드: 빨강 0 · 주황 30 · 노랑 60 · 초록 120 · 청록 180 · 파랑 225 · 보라 275 · 자홍 320 / 값=[색조 이동°, 채도 배수, 밝기 배수] */
const BN=['red','orange','yellow','green','aqua','blue','purple','magenta'];
const G={basic:'기본',film:'필름·카메라',movie:'영화',master:'사진 거장',bw:'흑백'};
const L=[
 {id:'none',g:'basic',name:'원본',d:'색감 없이 그대로'},
 {id:'vivid',g:'basic',name:'선명하게',d:'채도와 대비를 살짝 올려요',p:{sat:1.2,con:.2}},
 {id:'warm',g:'basic',name:'따뜻하게',d:'노을빛처럼 포근하게',p:{wb:[1.06,1,.9],sat:1.05,con:.05,hi:['#ffd8a0',.06]}},
 {id:'cool',g:'basic',name:'차갑게',d:'맑고 시원한 겨울빛',p:{wb:[.93,1,1.08],sat:.95,con:.1,sh:['#3a5a7a',.06]}},
 {id:'bright',g:'basic',name:'화사하게',d:'밝고 깨끗한 인물용',p:{exp:1.08,sat:1.02,con:-.08,fade:.03,bands:{orange:[0,.92,1.06]}}},
 {id:'vintage',g:'basic',name:'빈티지',d:'바랜 사진 느낌',p:{sat:.78,fade:.1,con:-.05,wb:[1.05,1,.9],sh:['#3a5060',.08],hi:['#f3dcae',.08],vig:.3,grain:.2}},
 /* 필름·카메라 */
 {id:'fuji_cc',g:'film',name:'후지 클래식 크롬풍',d:'낮은 채도, 단단한 대비. 다큐 사진 감성',p:{sat:.74,con:.28,fade:.03,hl:.08,sh:['#4a6a72',.07],hi:['#e8d8b8',.04],bands:{red:[0,.82,.95],orange:[0,.88,1],green:[8,.78,.95],blue:[-4,.85,.92]}}},
 {id:'fuji_cneg',g:'film',name:'후지 클래식 네거티브풍',d:'청록 그림자와 단단한 대비. 요즘 가장 인기',p:{sat:.9,con:.36,fade:.04,sh:['#33586a',.11],hi:['#f0cfb0',.06],bands:{red:[-6,1.12,.95],orange:[-2,.95,1.02],green:[16,.78,.9],blue:[-6,.9,.92]}}},
 {id:'fuji_velvia',g:'film',name:'후지 벨비아풍',d:'풍경용 진한 원색',p:{sat:1.38,con:.34,bands:{green:[0,1.25,.95],blue:[0,1.2,.88],red:[0,1.15,1]}}},
 {id:'fuji_astia',g:'film',name:'후지 아스티아풍',d:'부드러운 피부톤 인물용',p:{sat:1.04,con:.04,fade:.02,hi:['#ffe4cc',.05],bands:{orange:[-2,.92,1.06],red:[0,.95,1.03]}}},
 {id:'fuji_eterna',g:'film',name:'후지 이터나풍',d:'낮은 대비 시네마 톤',p:{sat:.68,con:-.16,fade:.06,sh:['#31595e',.07],hi:['#efe2c8',.03]}},
 {id:'kodak_portra',g:'film',name:'코닥 포트라풍',d:'따뜻한 피부, 부드러운 파스텔',p:{wb:[1.04,1,.94],sat:.94,con:.04,fade:.05,hi:['#f3dcb5',.06],sh:['#5a6b8a',.04],bands:{orange:[-3,.9,1.06],green:[10,.8,.98],blue:[-8,.86,1]}}},
 {id:'kodak_gold',g:'film',name:'코닥 골드풍',d:'노란빛 도는 여행 필름',p:{wb:[1.07,1,.87],sat:1.1,con:.14,fade:.04,hi:['#ffd28a',.08],grain:.12}},
 {id:'kodak_ektar',g:'film',name:'코닥 엑타풍',d:'쨍한 원색 풍경 필름',p:{sat:1.3,con:.26,bands:{red:[0,1.2,.95],blue:[0,1.15,.9],orange:[0,1.08,1]}}},
 {id:'cinestill',g:'film',name:'시네스틸 800T풍',d:'밤거리 텅스텐 필름. 푸른 그림자, 붉은 빛',p:{wb:[.9,.98,1.12],con:.2,sh:['#2a4a6a',.11],hi:['#ffb08a',.08],bands:{red:[0,1.25,1.05],orange:[-4,1.1,1.05]},grain:.2}},
 {id:'polaroid',g:'film',name:'폴라로이드풍',d:'바랜 청록 그림자와 크림빛',p:{fade:.12,sat:.8,con:-.06,wb:[1.03,1,.95],sh:['#3a5f6a',.1],hi:['#f6e0b0',.08],vig:.32}},
 {id:'ricoh_posi',g:'film',name:'리코 포지티브풍',d:'GR 스냅 감성. 진하고 따뜻하게',p:{sat:1.16,con:.3,hi:['#ffe0b0',.05],sh:['#304060',.06]}},
 {id:'leica_classic',g:'film',name:'라이카 클래식풍',d:'깊은 그림자, 묵직한 색',p:{wb:[1.03,1,.96],sat:1.05,con:.32,vig:.3,bands:{red:[0,1.1,.92],blue:[0,1.05,.88],green:[4,.92,.92]}}},
 {id:'canon_portrait',g:'film',name:'캐논 인물풍',d:'밝고 혈색 도는 피부',p:{wb:[1.04,1,.97],sat:1.05,con:.1,hi:['#f6d6d6',.05],bands:{orange:[3,.94,1.08],red:[-4,1.05,1]}}},
 {id:'lumix_s5',g:'film',name:'루믹스 S5풍',d:'차분하고 자연스러운 시네마 색',p:{wb:[.99,1.01,1.01],sat:.9,con:.05,fade:.02,bands:{green:[-8,.85,.95],orange:[0,.95,1.03],blue:[4,.92,.97]}}},
 {id:'sony_clean',g:'film',name:'소니 깨끗한풍',d:'맑고 차가운 디지털 톤',p:{wb:[.97,1,1.04],sat:1.08,con:.12,bands:{green:[-4,1.05,1],blue:[-6,1.1,.96]}}},
 /* 흑백 */
 {id:'leica_mono',g:'bw',name:'라이카 모노크롬풍',d:'깊은 검정, 또렷한 흑백',p:{bw:[.3,.59,.11],con:.55,hl:.05,grain:.15,vig:.25}},
 {id:'fuji_acros',g:'bw',name:'후지 아크로스풍',d:'부드럽고 고운 흑백',p:{bw:[.35,.5,.15],con:.3,grain:.22}},
 {id:'ilford_hp5',g:'bw',name:'일포드 HP5풍',d:'거친 입자 스트리트 흑백',p:{bw:[.3,.59,.11],con:.36,fade:.05,grain:.45}},
 {id:'sepia',g:'bw',name:'세피아',d:'오래된 사진첩',p:{bw:[.3,.59,.11],con:.1,fade:.08,sh:['#5a4030',.1],hi:['#f0d8a8',.12],vig:.3,grain:.2}},
 /* 영화 */
 {id:'teal_orange',g:'movie',name:'틸 앤 오렌지',d:'할리우드 블록버스터. 청록 그림자 + 주황 피부',p:{con:.25,sat:1.05,sh:['#1f6f7f',.22],hi:['#ff9a4a',.14],bands:{orange:[0,1.15,1.03],blue:[-15,1.1,.9],aqua:[10,1.1,.9]}}},
 {id:'matrix',g:'movie',name:'매트릭스 그린',d:'초록빛 디지털 세계',p:{wb:[.92,1.08,.92],sat:.8,con:.3,sh:['#1f5a2a',.15],hi:['#c8f0a0',.05]}},
 {id:'amelie',g:'movie',name:'아멜리에',d:'빨강·초록·노랑이 진한 동화',p:{wb:[1.05,1,.9],con:.2,vig:.3,bands:{red:[0,1.3,1],green:[10,1.3,.95],yellow:[0,1.2,1]}}},
 {id:'budapest',g:'movie',name:'그랜드 부다페스트',d:'웨스 앤더슨 파스텔 핑크',p:{sat:.9,fade:.08,con:-.05,hi:['#ffd6e0',.1],sh:['#8ab0c0',.05],bands:{red:[10,1,1.08],yellow:[-4,.9,1.05]}}},
 {id:'wkw',g:'movie',name:'화양연화 (왕가위)',d:'붉은 빛과 짙은 초록, 몽환적인 밤',p:{wb:[1.06,1,.9],con:.3,grain:.15,vig:.35,sh:['#1a4a3a',.1],hi:['#ffb070',.08],bands:{red:[0,1.3,.9],green:[20,.9,.85]}}},
 {id:'br2049',g:'movie',name:'블레이드 러너 2049',d:'모래폭풍 같은 오렌지',p:{wb:[1.15,1,.75],sat:.9,con:.2,fade:.03,hi:['#ff8a30',.15],sh:['#4a2a10',.1]}},
 {id:'neon_noir',g:'movie',name:'네온 누아르',d:'사이버펑크 청록·자홍',p:{con:.3,sat:1.1,sh:['#1a3a6a',.16],hi:['#ff4fa0',.08],bands:{blue:[-10,1.2,.9],magenta:[0,1.3,1]}}},
 {id:'joker',g:'movie',name:'조커',d:'녹황색 도시와 노란 빛',p:{wb:[1.02,1.03,.88],sat:.85,con:.3,sh:['#2a5040',.12],hi:['#f0c060',.1]}},
 {id:'parasite',g:'movie',name:'기생충',d:'차갑고 정돈된 회청색',p:{sat:.8,con:.2,sh:['#2a4a50',.1],hi:['#e8e0c8',.04],bands:{green:[-6,.85,.95]}}},
 {id:'moonlight',g:'movie',name:'문라이트',d:'보랏빛 그림자, 청록 빛',p:{sat:1.15,con:.25,sh:['#2a2a6a',.15],hi:['#50b0a0',.08],bands:{blue:[-20,1.2,.9]}}},
 {id:'lalaland',g:'movie',name:'라라랜드',d:'보라색 노을과 주황 빛',p:{sat:1.15,sh:['#3a2a7a',.12],hi:['#ffb070',.1],bands:{blue:[20,1.2,.95],magenta:[0,1.2,1]}}},
 {id:'madmax',g:'movie',name:'매드맥스',d:'불타는 사막 + 짙은 청록 하늘',p:{wb:[1.1,1,.85],sat:1.1,con:.4,bands:{orange:[0,1.35,1],blue:[-10,1.3,.85]}}},
 {id:'her',g:'movie',name:'그녀 (Her)',d:'따뜻한 파스텔 레드',p:{wb:[1.08,1,.92],sat:.95,fade:.06,con:-.05,hi:['#ffd0b0',.1],bands:{red:[5,1.15,1.05]}}},
 {id:'little_forest',g:'movie',name:'리틀 포레스트',d:'맑은 초록과 햇살',p:{wb:[1.02,1,.98],sat:1.05,con:.05,fade:.04,bands:{green:[-5,1.15,1.05],yellow:[0,1.05,1.03]}}},
 {id:'noir',g:'movie',name:'필름 누아르',d:'강한 명암의 흑백 영화',p:{bw:[.3,.59,.11],con:.7,vig:.45,grain:.2}},
 /* 거장 */
 {id:'eggleston',g:'master',name:'이글스턴풍',d:'뉴컬러. 평범한 일상의 진한 원색',p:{wb:[1.03,1,.95],sat:1.25,con:.2,fade:.03,bands:{red:[0,1.25,1]}}},
 {id:'leiter',g:'master',name:'사울 레이터풍',d:'바랜 화면 속 빨간 포인트',p:{sat:.72,fade:.08,grain:.15,sh:['#3a4a5a',.08],bands:{red:[0,1.7,1],orange:[0,1.3,1]}}},
 {id:'mccurry',g:'master',name:'스티브 맥커리풍',d:'코다크롬 같은 깊고 진한 색',p:{wb:[1.04,1,.94],sat:1.25,con:.35,vig:.2,bands:{red:[0,1.2,.95],orange:[0,1.15,1],blue:[0,1.1,.85]}}},
 {id:'kawauchi',g:'master',name:'가와우치 린코풍',d:'밝고 투명한 일상의 빛',p:{exp:1.08,fade:.08,sat:.85,con:-.15,wb:[1,1.02,1.03],hi:['#f8f0f0',.05]}},
 {id:'ansel',g:'master',name:'안셀 아담스풍',d:'붉은 필터 흑백. 하늘은 어둡고 구름은 하얗게',p:{bw:[.6,.38,.02],con:.45}},
 {id:'salgado',g:'master',name:'살가도풍',d:'극적인 명암의 깊은 흑백',p:{bw:[.3,.6,.1],con:.65,vig:.45,grain:.1}},
 {id:'bresson',g:'master',name:'브레송풍',d:'부드러운 회색의 고전 흑백',p:{bw:[.3,.59,.11],con:.2,fade:.04,grain:.2}},
];
const byId={};L.forEach(l=>byId[l.id]=l);

/* 커브 LUT 만들기: 대비·페이드·하이라이트 */
function lutFor(p){const a=new Uint8Array(256*4);const con=p.con||0,fade=p.fade||0,hl=p.hl||0;
  for(let i=0;i<256;i++){let x=i/255;const s=x*x*(3-2*x);x=con>=0?x+(s-x)*Math.min(1,con*1.6):x+(.5+(x-.5)*.6-x)*(-con);x=fade+x*(1-fade-hl*.12);
    const v=Math.round(Math.max(0,Math.min(1,x))*255);a[i*4]=a[i*4+1]=a[i*4+2]=v;a[i*4+3]=255}return a}
function compile(l){if(l._c)return l._c;const p=l.p||{};const b=new Float32Array(24);BN.forEach((n,i)=>{const v=(p.bands||{})[n]||[0,1,1];b[i*3]=v[0];b[i*3+1]=v[1];b[i*3+2]=v[2]});
  const bw=p.bw?(()=>{const s=p.bw[0]+p.bw[1]+p.bw[2];return p.bw.map(v=>v/s)})():[0,0,0];
  return l._c={wb:p.wb||[1,1,1],exp:p.exp||1,sat:p.sat==null?1:p.sat,bw,isbw:p.bw?1:0,bands:b,sh:p.sh?off(p.sh[0],p.sh[1]):[0,0,0],hi:p.hi?off(p.hi[0],p.hi[1]):[0,0,0],vig:p.vig||0,grain:p.grain||0,lut:lutFor(p),none:!l.p}}

const VS='attribute vec2 p;varying vec2 v;uniform vec4 cr;uniform float mir;void main(){vec2 t=p*.5+.5;t.y=1.-t.y;v=vec2(cr.x+(mir>.5?1.-t.x:t.x)*cr.z,cr.y+t.y*cr.w);gl_Position=vec4(p,0,1);}';
const FS=`precision mediump float;varying vec2 v;uniform sampler2D im,lt;uniform vec3 wb,bw,sh,hi,bd[8];uniform float ex,sa,isbw,vg,gr,st,sd;uniform vec2 rs;
vec3 h2(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+1e-10)),d/(q.x+1e-10),q.x);}
vec3 r2(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 o=texture2D(im,v).rgb;vec3 c=clamp(o*wb*ex,0.,1.);float L=dot(c,vec3(.299,.587,.114));
 if(isbw>.5){c=vec3(dot(c,bw));}else{vec3 h=h2(c);float H=h.x*360.,sh2=0.,sm=0.,lm=0.;
  float C[8];C[0]=0.;C[1]=30.;C[2]=60.;C[3]=120.;C[4]=180.;C[5]=225.;C[6]=275.;C[7]=320.;
  for(int i=0;i<8;i++){float dd=abs(H-C[i]);dd=min(dd,360.-dd);float w=max(0.,1.-dd/38.);sh2+=w*bd[i].x;sm+=w*(bd[i].y-1.);lm+=w*(bd[i].z-1.);}
  float k=smoothstep(.04,.35,h.y);h.x=fract(h.x+sh2*k/360.);h.y=clamp(h.y*(1.+sm*k),0.,1.);h.z=clamp(h.z*(1.+lm*k),0.,1.);c=r2(h);L=dot(c,vec3(.299,.587,.114));c=clamp(mix(vec3(L),c,sa),0.,1.);}
 c=vec3(texture2D(lt,vec2(c.r,.5)).r,texture2D(lt,vec2(c.g,.5)).g,texture2D(lt,vec2(c.b,.5)).b);
 L=dot(c,vec3(.299,.587,.114));c+=sh*(1.-L)*(1.-L)+hi*L*L;
 vec2 q=gl_FragCoord.xy/rs-.5;c*=1.-vg*smoothstep(.3,.85,length(q*vec2(1.,rs.y/rs.x))*1.25);
 c+=(hs(gl_FragCoord.xy+sd)-.5)*gr*.16;gl_FragColor=vec4(mix(o,clamp(c,0.,1.),st),1.);}`;

function Renderer(cv){const gl=cv.getContext('webgl',{premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false});if(!gl)throw new Error('webgl');this.gl=gl;this.cv=cv;
  const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);this.pr=pr;
  const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  const tex=u=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t};
  this.ti=tex(0);this.tl=tex(1);this.U={};['im','lt','wb','bw','sh','hi','bd','ex','sa','isbw','vg','gr','st','sd','rs','cr','mir'].forEach(n=>this.U[n]=gl.getUniformLocation(pr,n));gl.uniform1i(this.U.im,0);gl.uniform1i(this.U.lt,1);this.cur=null}
Renderer.prototype.render=function(src,look,o={}){const gl=this.gl,U=this.U,l=compile(typeof look==='string'?byId[look]||byId.none:look),W=this.cv.width,H=this.cv.height;
  gl.viewport(0,0,W,H);if(this.cur!==l){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.tl);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,l.lut);
    gl.uniform3fv(U.wb,l.wb);gl.uniform3fv(U.bw,l.bw);gl.uniform3fv(U.sh,l.sh);gl.uniform3fv(U.hi,l.hi);gl.uniform3fv(U.bd,l.bands);gl.uniform1f(U.ex,l.exp);gl.uniform1f(U.sa,l.sat);gl.uniform1f(U.isbw,l.isbw);gl.uniform1f(U.vg,l.vig);gl.uniform1f(U.gr,l.grain);this.cur=l}
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.ti);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  const sw=o.sw||src.videoWidth||src.naturalWidth||src.width,shh=o.sh||src.videoHeight||src.naturalHeight||src.height,c=o.crop||{x:0,y:0,w:sw,h:shh};
  gl.uniform4f(U.cr,c.x/sw,c.y/shh,c.w/sw,c.h/shh);gl.uniform1f(U.mir,o.mirror?1:0);gl.uniform1f(U.st,l.none?0:(o.str==null?1:o.str));gl.uniform1f(U.sd,o.seed||0);gl.uniform2f(U.rs,W,H);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)};

let off1=null;
function apply(src,look,str){const w=src.width||src.naturalWidth,h=src.height||src.naturalHeight;if(!off1){const cv=document.createElement('canvas');off1=new Renderer(cv)}off1.cv.width=w;off1.cv.height=h;off1.cur=null;off1.render(src,look,{str});return off1.cv}
function thumbs(src,w,h,ids){const t=document.createElement('canvas');t.width=w;t.height=h;const x=t.getContext('2d');const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height,k=Math.max(w/sw,h/sh);
  x.drawImage(src,(w-sw*k)/2,(h-sh*k)/2,sw*k,sh*k);const out={};(ids||L.map(l=>l.id)).forEach(id=>{const c=apply(t,id,1);out[id]=c.toDataURL('image/jpeg',.8)});return out}
/* 장면·구도에 맞는 색감 추천 */
const RS={selfie:['canon_portrait','fuji_astia','bright','kodak_portra','her'],portrait:['canon_portrait','fuji_astia','kodak_portra','fuji_cneg','her','leica_mono'],
 couple:['kodak_portra','kodak_gold','her','warm','budapest'],group:['kodak_gold','kodak_portra','warm','vivid'],personFar:['kodak_gold','fuji_cneg','ricoh_posi','teal_orange','little_forest'],
 land:['fuji_velvia','kodak_ektar','mccurry','ansel','cool'],night:['cinestill','neon_noir','wkw','br2049','leica_mono'],street:['fuji_cc','ilford_hp5','leiter','joker','noir','ricoh_posi'],
 top:['warm','kodak_gold','bright','eggleston'],object:['kodak_portra','vivid','eggleston','fuji_cc'],general:['fuji_cneg','kodak_portra','fuji_cc','vivid']};
const RC={film:['teal_orange','wkw','amelie','budapest','moonlight'],master:['leica_mono','eggleston','mccurry','bresson','leiter'],sport:['teal_orange','leica_mono','noir','ricoh_posi'],
 pet:['bright','kodak_portra','warm'],food:['warm','kodak_gold','vivid'],night:['cinestill','neon_noir','wkw'],land:['fuji_velvia','kodak_ektar','ansel'],street:['fuji_cc','ilford_hp5','leiter'],
 couple:['kodak_portra','her','kodak_gold'],travel:['kodak_gold','fuji_cneg','teal_orange'],people:['canon_portrait','fuji_cneg','kodak_portra'],portrait:['canon_portrait','fuji_astia']};
const WHY={selfie:'셀카',portrait:'인물',couple:'두 사람',group:'단체',personFar:'인물+배경',land:'풍경',night:'밤',street:'거리',top:'음식·탑뷰',object:'사물',general:'일상'};
function recommend(o={}){const out=[],add=(ids,why)=>(ids||[]).forEach(id=>{if(byId[id]&&!out.some(x=>x.id===id))out.push({id,why})});
  if(o.dark&&o.scene!=='night')add(['cinestill','wkw'],'어두운 장면');if(o.warm)add(['kodak_gold','br2049','lalaland'],'노을빛');
  add((RS[o.scene]||[]).slice(0,4),WHY[o.scene]||'');add((RC[o.cat]||[]).slice(0,3),o.catName?o.catName+' 구도':'');add(RS[o.scene],WHY[o.scene]||'');add(RS.general,'');return out.slice(0,9)}
/* 직접 조정: 밝기·대비·채도·색온도·색조(-1~1), 페이드·입자·비네팅(0~1) */
const ADJ0={bright:0,contrast:0,sat:0,warm:0,tint:0,fade:0,grain:0,vig:0};const AC={};
const adjZero=a=>!a||Object.keys(ADJ0).every(k=>!a[k]);
function withAdj(id,a){const base=byId[id]||byId.none;if(adjZero(a))return base;const key=id+'|'+Object.keys(ADJ0).map(k=>((a[k]||0)*100|0)).join(',');if(AC[key])return AC[key];
  const p=Object.assign({},base.p||{}),w=p.wb||[1,1,1];p.exp=(p.exp||1)*(1+(a.bright||0)*.35);p.con=(p.con||0)+(a.contrast||0)*.6;p.sat=(p.sat==null?1:p.sat)*(1+(a.sat||0));
  p.wb=[w[0]*(1+(a.warm||0)*.12),w[1]*(1-(a.tint||0)*.08),w[2]*(1-(a.warm||0)*.12)];p.fade=(p.fade||0)+(a.fade||0)*.2;p.grain=(p.grain||0)+(a.grain||0)*.6;p.vig=(p.vig||0)+(a.vig||0)*.7;
  const keys=Object.keys(AC);if(keys.length>60)keys.forEach(k=>delete AC[k]);return AC[key]={id:'_adj',name:base.name,p}}
const ADJ_UI=[['bright','밝기',-1,1],['contrast','대비',-1,1],['sat','채도',-1,1],['warm','색온도',-1,1],['tint','색조',-1,1],['fade','페이드',0,1],['grain','입자',0,1],['vig','비네팅',0,1]];
window.LOOKS={list:L,groups:G,byId,Renderer,apply,thumbs,recommend,withAdj,ADJ0,ADJ_UI,adjZero};
})();
