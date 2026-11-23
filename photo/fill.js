/* 내용 인식 채우기 — 여러 크기 패치매치(PatchMatch) 방식. 큰 그림 구조는 작게 줄인 단계에서, 질감은 원래 크기에서 채운다.
   FILL.complete(img:{w,h,r,g,b Float32Array}, hole:Uint8Array) → img 의 구멍을 채움(제자리). 반환: 가장 고운 단계의 오프셋 {ox,oy} */
(function(root){
const R=3;/* 패치 반지름 → 7x7 */
function rnd32(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}
function down(im,h){/* 절반 크기 */const w=Math.max(1,im.w>>1),hh=Math.max(1,im.h>>1),o={w,h:hh,r:new Float32Array(w*hh),g:new Float32Array(w*hh),b:new Float32Array(w*hh)},m=new Uint8Array(w*hh);
  for(let y=0;y<hh;y++)for(let x=0;x<w;x++){let r=0,g=0,b=0,n=0,hc=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const xx=Math.min(im.w-1,2*x+dx),yy=Math.min(im.h-1,2*y+dy),i=yy*im.w+xx;if(h[i]){hc++;continue}r+=im.r[i];g+=im.g[i];b+=im.b[i];n++}
    const j=y*w+x;if(n){o.r[j]=r/n;o.g[j]=g/n;o.b[j]=b/n}m[j]=hc>0?1:0}return[o,m]}
function validMap(w,h,hole){/* 패치 전체가 구멍 밖인 중심 */const ii=new Int32Array((w+1)*(h+1));for(let y=0;y<h;y++){let s=0;for(let x=0;x<w;x++){s+=hole[y*w+x];ii[(y+1)*(w+1)+x+1]=ii[y*(w+1)+x+1]+s}}
  const v=new Uint8Array(w*h),list=[];for(let y=R;y<h-R;y++)for(let x=R;x<w-R;x++){const a=x-R,b=y-R,c=x+R+1,d=y+R+1;if(ii[d*(w+1)+c]-ii[b*(w+1)+c]-ii[d*(w+1)+a]+ii[b*(w+1)+a]===0){v[y*w+x]=1;list.push(y*w+x)}}return[v,list]}
function diffuse(im,hole){const{w,h}=im;/* 바깥에서 안쪽으로 평균 채우기 */const known=new Uint8Array(w*h);for(let i=0;i<w*h;i++)known[i]=hole[i]?0:1;let left=0;for(let i=0;i<w*h;i++)left+=1-known[i];let guard=0;
  while(left>0&&guard++<4*(w+h)){const add=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(known[i])continue;let r=0,g=0,b=0,n=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const j=yy*w+xx;if(!known[j])continue;r+=im.r[j];g+=im.g[j];b+=im.b[j];n++}if(n){im.r[i]=r/n;im.g[i]=g/n;im.b[i]=b/n;add.push(i)}}
    if(!add.length)break;add.forEach(i=>known[i]=1);left-=add.length}}
function level(im,hole,valid,vlist,init,iters,rand){const{w,h}=im,N=w*h;
  /* 대상: 구멍에 닿는 패치 중심들 */
  const tgt=new Uint8Array(N);for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!hole[y*w+x])continue;for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const xx=x+dx,yy=y+dy;if(xx>=R&&yy>=R&&xx<w-R&&yy<h-R)tgt[yy*w+xx]=1}}
  const T=[];for(let i=0;i<N;i++)if(tgt[i])T.push(i);
  const ox=new Int16Array(N),oy=new Int16Array(N),dist=new Float32Array(N);
  const pick=()=>vlist[(rand()*vlist.length)|0];
  const D=(p,s,best)=>{const px=p%w,py=(p/w)|0,sx=s%w,sy=(s/w)|0;let d=0;for(let dy=-R;dy<=R;dy++){const a=(py+dy)*w+px,b=(sy+dy)*w+sx;for(let dx=-R;dx<=R;dx++){const i=a+dx,j=b+dx,e=im.r[i]-im.r[j],f=im.g[i]-im.g[j],g=im.b[i]-im.b[j];d+=e*e+f*f+g*g}if(d>best)return d}return d};
  for(const p of T){let s=-1;if(init){const px=p%w,py=(p/w)|0,c=init(px,py);if(c){const sx=px+c[0],sy=py+c[1];if(sx>=R&&sy>=R&&sx<w-R&&sy<h-R&&valid[sy*w+sx])s=sy*w+sx}}if(s<0)s=pick();ox[p]=(s%w)-(p%w);oy[p]=((s/w)|0)-((p/w)|0);dist[p]=D(p,s,1e30)}
  const maxR=Math.max(w,h);
  for(let it=0;it<iters;it++){const fw=it%2===0,step=fw?1:-1;
    for(let k=fw?0:T.length-1;fw?k<T.length:k>=0;k+=step){const p=T[k],px=p%w,py=(p/w)|0;let bx=ox[p],by=oy[p],bd=dist[p];
      const tryS=(sx,sy)=>{if(sx<R||sy<R||sx>=w-R||sy>=h-R)return;const s=sy*w+sx;if(!valid[s])return;const d=D(p,s,bd);if(d<bd){bd=d;bx=sx-px;by=sy-py}};
      /* 이웃의 오프셋 물려받기 */const n1=p-step,n2=p-step*w;if(px-step>=0&&px-step<w&&tgt[n1])tryS(px+ox[n1],py+oy[n1]);if(py-step>=0&&py-step<h&&tgt[n2])tryS(px+ox[n2],py+oy[n2]);
      /* 무작위 탐색 */for(let rr=maxR;rr>=1;rr>>=1)tryS(px+bx+Math.round((rand()*2-1)*rr),py+by+Math.round((rand()*2-1)*rr));
      tryS(...(()=>{const s=pick();return[s%w,(s/w)|0]})());
      ox[p]=bx;oy[p]=by;dist[p]=bd}
    /* 투표: 겹치는 패치들의 평균으로 구멍 픽셀 갱신 (거리 가중) */
    vote(im,hole,tgt,ox,oy,dist)}
  return{ox,oy,tgt}}
function vote(im,hole,tgt,ox,oy,dist){const{w,h}=im;const nr=new Float32Array(w*h),ng=new Float32Array(w*h),nb=new Float32Array(w*h),wt=new Float32Array(w*h);
  let sig=0,c=0;for(let i=0;i<w*h;i++)if(tgt[i]){sig+=dist[i];c++}sig=Math.max(1,sig/Math.max(1,c))*1.2;
  for(let q=0;q<w*h;q++){if(!tgt[q])continue;const qx=q%w,qy=(q/w)|0,ww=Math.exp(-dist[q]/sig)+1e-4;for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const p=(qy+dy)*w+qx+dx;if(!hole[p])continue;const s=(qy+dy+oy[q])*w+qx+dx+ox[q];nr[p]+=im.r[s]*ww;ng[p]+=im.g[s]*ww;nb[p]+=im.b[s]*ww;wt[p]+=ww}}
  for(let p=0;p<w*h;p++)if(hole[p]&&wt[p]>0){im.r[p]=nr[p]/wt[p];im.g[p]=ng[p]/wt[p];im.b[p]=nb[p]/wt[p]}}
function complete(im,hole,seed){const rand=rnd32(seed||12345);
  /* 피라미드 */const P=[[im,hole]];while(Math.max(P[P.length-1][0].w,P[P.length-1][0].h)>48&&P.length<7){P.push(down(P[P.length-1][0],P[P.length-1][1]))}
  let prev=null;
  for(let L=P.length-1;L>=0;L--){const[cur,hm]=P[L];const[valid,vlist]=validMap(cur.w,cur.h,hm);
    if(!vlist.length){diffuse(cur,hm);prev=null;continue}
    if(L===P.length-1)diffuse(cur,hm);
    else{/* 위 단계 결과를 키워서 구멍 초기화 */const pc=P[L+1][0];for(let y=0;y<cur.h;y++)for(let x=0;x<cur.w;x++){const i=y*cur.w+x;if(!hm[i])continue;const j=Math.min(pc.h-1,y>>1)*pc.w+Math.min(pc.w-1,x>>1);cur.r[i]=pc.r[j];cur.g[i]=pc.g[j];cur.b[i]=pc.b[j]}}
    const pr=prev,pw=L<P.length-1?P[L+1][0].w:0,ph=L<P.length-1?P[L+1][0].h:0;
    const init=pr?(x,y)=>{const xx=Math.min(pw-1,x>>1),yy=Math.min(ph-1,y>>1),j=yy*pw+xx;return pr.tgt[j]?[pr.ox[j]*2,pr.oy[j]*2]:null}:null;
    const iters=L===0?4:L===P.length-1?8:5;prev=level(cur,hm,valid,vlist,init,iters,rand)}
  return prev}
root.FILL={complete,R};
})(typeof window!=='undefined'?window:globalThis);
