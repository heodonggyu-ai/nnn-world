import math
def quill_svg(size=1024, bg=True, scale=1.0, id='q'):
    d=f'''<defs>
<radialGradient id="{id}bg" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fffdf8"/><stop offset=".55" stop-color="#f7efe4"/><stop offset="1" stop-color="#e9dccb"/></radialGradient>
<linearGradient id="{id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d3bb"/><stop offset=".35" stop-color="#d9a17f"/><stop offset=".7" stop-color="#b7795a"/><stop offset="1" stop-color="#8e5639"/></linearGradient>
<linearGradient id="{id}hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="{id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2e6"/><stop offset="1" stop-color="#e8c0a2"/></linearGradient>
<radialGradient id="{id}gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6dc"/><stop offset=".35" stop-color="#ffe2a6" stop-opacity=".8"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<filter id="{id}sh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="18" dy="30" stdDeviation="26" flood-color="#6b4630" flood-opacity=".28"/></filter>
<filter id="{id}gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .05 0"/></filter>
</defs>'''
    body=''
    if bg: body+=f'<rect width="1024" height="1024" fill="url(#{id}bg)"/><rect width="1024" height="1024" filter="url(#{id}gr)"/>'
    F='M0 -380 C 74 -306 100 -136 72 40 C 58 122 34 178 12 210 L-2 210 C -42 162 -92 60 -88 -74 C -84 -210 -38 -316 0 -380Z'
    g=f'<g transform="translate(512 500) rotate(30) scale({scale*1.12})">'
    g+=f'<g filter="url(#{id}sh)"><path d="{F}" fill="url(#{id}f)"/></g>'
    # notches
    g+=f'<clipPath id="{id}c"><path d="{F}"/></clipPath><g clip-path="url(#{id}c)">'
    # barbs
    for i in range(16):
        y=-340+i*34; w=1
        g+=f'<path d="M2 {y} Q {40*w+20} {y-26} {82*w+8} {y-54}" stroke="#7a462c" stroke-opacity=".22" stroke-width="3" fill="none"/>'
        g+=f'<path d="M-2 {y+8} Q {-46*w-20} {y-16} {-96*w-6} {y-40}" stroke="#7a462c" stroke-opacity=".18" stroke-width="3" fill="none"/>'
    g+='</g>'+f'<path d="{F}" fill="url(#{id}hl)" opacity=".6"/>'
    g+='<path d="M104 -96 L56 -70 L104 -78Z M-110 -36 L-64 -14 L-108 -16Z M96 -232 L58 -214 L92 -212Z" fill="#f5ece0"/>'
    g+=f'<path d="M3 -320 C 6 -150 8 40 10 330" stroke="url(#{id}s)" stroke-width="12" stroke-linecap="round" fill="none"/>'
    g+=f'<path d="M3 -320 C 6 -150 8 40 10 330" stroke="#8e5639" stroke-opacity=".35" stroke-width="3" fill="none" transform="translate(4 0)"/>'
    g+=f'<circle cx="10" cy="336" r="86" fill="url(#{id}gl)"/><circle cx="10" cy="334" r="7" fill="#fff"/>'
    g+='</g>'
    # sparkles constellation
    sp=''
    def spark(cx,cy,r,c,op=1):
        k=r*.16; return f'<path transform="translate({cx} {cy})" d="M0 {-r} C {k} {-k} {k} {-k} {r} 0 C {k} {k} {k} {k} 0 {r} C {-k} {k} {-k} {k} {-r} 0 C {-k} {-k} {-k} {-k} 0 {-r}Z" fill="{c}" opacity="{op}"/>'
    sp+=spark(842,372,30,'#d9a17f')+f'<circle cx="892" cy="448" r="7" fill="#d9a17f" opacity=".7"/><circle cx="800" cy="452" r="5" fill="#d9a17f" opacity=".5"/>'
    sp+='<path d="M842 372 L892 448 L800 452" stroke="#d9a17f" stroke-opacity=".35" stroke-width="2.5" fill="none" stroke-dasharray="3 9"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="{size}" height="{size}">{d}{body}{g}<g transform="translate(512 512) scale({scale}) translate(-512 -512)">{sp}</g></svg>'
open('quill_full.svg','w').write(quill_svg())
open('quill_fg.svg','w').write(quill_svg(bg=False,scale=.7).replace('translate(742','translate(742').replace('<svg','<svg'))
open('quill_bg.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">'+quill_svg().split('<defs>')[1].split('</defs>')[0].join(['<defs>','</defs>'])+'<rect width="1024" height="1024" fill="url(#qbg)"/></svg>')
