#!/usr/bin/env bash
# shot.sh <name> <url-path> [width] [height] [era]
# 无头 Chrome 截图；era=1920 时通过 ?era= 深链切换（script 支持）
set -u
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
NAME="$1"; PATHQ="$2"; W="${3:-1440}"; H="${4:-900}"; ERA="${5:-}"
URL="http://127.0.0.1:4399${PATHQ}"
if [ -n "$ERA" ]; then
  if [[ "$URL" == *"?"* ]]; then URL="${URL}&era=${ERA}"; else URL="${URL}?era=${ERA}"; fi
fi
OUT="C:\\Users\\Administrator\\Videos\\NVIDIA\\frostpunk-site\\shots\\${NAME}.png"
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size="${W},${H}" --virtual-time-budget=6500 --screenshot="$OUT" "$URL" >/dev/null 2>&1
echo "$OUT"
