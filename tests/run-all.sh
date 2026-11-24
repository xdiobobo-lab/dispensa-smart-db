#!/usr/bin/env bash
# Esegue tutti i test: bash tests/run-all.sh   (serve: npm install && npx playwright install chromium)
cd "$(dirname "$0")"
fail=0
for t in versione.test.js t9*.js t10*.js pw2.js pw3.js; do
  [ -f "$t" ] || continue
  out=$(timeout 300 node "$t" 2>&1); code=$?
  if [ $code -ne 0 ] || echo "$out" | grep -Eq "^FAIL|[1-9][0-9]* ko$"; then echo "❌ $t"; echo "$out" | tail -8; fail=1; else echo "✅ $t"; fi
done
exit $fail
