#!/bin/bash
cd /home/claude/toon
{ cat head.html body.html; echo "<script>"; cat js/*.js; echo "</script>"; echo "</body></html>"; } > index.html
