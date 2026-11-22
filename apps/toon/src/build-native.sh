#!/bin/bash
# 앱(iOS·Android)용 www 만들기: 구글 폰트 대신 내장 폰트 사용
set -e
cd /home/claude/toon && ./build.sh
W=/home/claude/nnn-world/apps/toon/www
rm -rf $W && mkdir -p $W/fonts
cp -r /home/claude/natv/fontsout/* $W/fonts/
python3 - <<'PY'
import re
s=open('/home/claude/toon/index.html').read()
s=re.sub(r'<link rel="preconnect"[^>]*>\n?','',s)
s=re.sub(r'<link href="https://cdn.jsdelivr.net/[^"]*" rel="stylesheet">\n?','',s)
s=re.sub(r'<link href="https://fonts.googleapis.com/[^"]*" rel="stylesheet">','<link href="fonts/fonts.css" rel="stylesheet">',s)
assert 'fonts.googleapis' not in s and 'jsdelivr' not in s
open('/home/claude/nnn-world/apps/toon/www/index.html','w').write(s)
PY
echo "www ready: $(du -sh $W | cut -f1)"
