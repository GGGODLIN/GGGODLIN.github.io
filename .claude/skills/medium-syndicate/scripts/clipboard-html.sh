#!/bin/bash
set -euo pipefail
FILE="${1:?usage: clipboard-html.sh <html-file>}"
HEX=$(hexdump -ve '1/1 "%.2x"' "$FILE")
osascript -e "set the clipboard to «data HTML${HEX}»"
osascript -e 'clipboard info' | head -1
