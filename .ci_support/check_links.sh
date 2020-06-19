#!/usr/bin/env bash
set -euo pipefail

CACHE_NAME=$(pwd)/.pytest-check-links-cache
KNOWN_FAILS="\
ibm \
or declarativewidgets
"

cd _build/html


pytest \
  --check-links \
  --check-links-cache \
  --check-links-cache-name $CACHE_NAME \
  --check-links-cache-expire-after 604800 \
  --links-ext html \
  -k "not ($KNOWN_FAILS)"
