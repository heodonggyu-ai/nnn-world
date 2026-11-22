#!/bin/bash
cd /home/claude/toon
python3 - <<'PY'
s=open('index.html').read()
extra='<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="밍뉴툰">\n<link rel="apple-touch-icon" href="quill-180.png">\n<link rel="icon" type="image/png" href="quill-192.png">\n<link rel="manifest" href="manifest.webmanifest?v=quill">\n'
s=s.replace('<title>밍뉴툰 스튜디오</title>','<title>밍뉴툰 스튜디오</title>\n'+extra,1)
open('/home/claude/nnn-world/toon/index.html','w').write(s)
PY
