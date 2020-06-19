#!/usr/bin/env bash
set -euo pipefail

echo "checking spelling..."

cd _build/html

hunspell \
  -d en-GB,en_US \
  -p ../../.ci_support/dictionary.txt \
  -l \
  -H **/*.html \
  | sort \
  | uniq \
  > check-spelling.txt

if [ -s "check-spelling.txt" ]; then
  echo "hunspell found misspelled words"
  cat check-spelling.txt
  exit 1
else
  echo "hunspell did not find any misspelled words"
fi
