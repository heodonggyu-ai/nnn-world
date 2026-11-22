from PIL import Image, ImageFilter
import numpy as np
from scipy.ndimage import gaussian_filter, binary_erosion, binary_fill_holes
tile=Image.open('tile.png').convert('RGB')
T=np.array(tile).astype(float)
lum=T.mean(2)
M=binary_fill_holes(lum>150)
M=binary_erosion(M,iterations=12).astype(float)
def make(scale,out):
    H,W=T.shape[:2]; s=scale
    big=Image.fromarray(T.astype(np.uint8)).resize((int(W*s),int(H*s)),Image.LANCZOS)
    bm=Image.fromarray((M*255).astype(np.uint8)).resize(big.size,Image.BILINEAR)
    A=np.array(big).astype(float); Bm=np.array(bm).astype(float)/255
    cx,cy=int(305*s),int(300*s)
    canvas=np.zeros((1024,1024,3)); cm=np.zeros((1024,1024))
    x0=512-cx; y0=512-cy
    ys=slice(max(0,y0),min(1024,y0+A.shape[0])); xs=slice(max(0,x0),min(1024,x0+A.shape[1]))
    sy=slice(ys.start-y0, ys.stop-y0); sx=slice(xs.start-x0, xs.stop-x0)
    canvas[ys,xs]=A[sy,sx]; cm[ys,xs]=Bm[sy,sx]
    sig=90
    num=np.stack([gaussian_filter(canvas[...,k]*cm,sig) for k in range(3)],2); den=gaussian_filter(cm,sig)[...,None]+1e-6
    bg=num/den
    a=gaussian_filter(binary_erosion(cm>0.5,iterations=10).astype(float),12)[...,None]
    o=bg*(1-a)+canvas*a
    Image.fromarray(np.clip(o,0,255).astype(np.uint8)).save(out)
make(1.78,'full.png'); make(1.22,'fg.png')
Image.open('full.png').filter(ImageFilter.GaussianBlur(160)).save('bg.png')
