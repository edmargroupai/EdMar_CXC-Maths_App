#!/usr/bin/env bash
# §23.6 / §25.10 — premium/tier checks may live only in useEntitlement.ts and
# PremiumGate.tsx. Every other screen must consume the entitlement through them.
set -euo pipefail
cd "$(dirname "$0")/.."

MOBILE_DIR="apps/mobile"
FOUND=0

if [ -d "$MOBILE_DIR" ]; then
  if matches=$(grep -RnE "===[[:space:]]*['\"]premium['\"]|tier[[:space:]]*===" \
      --include='*.ts' --include='*.tsx' \
      --exclude-dir=node_modules --exclude-dir=.expo --exclude-dir=dist --exclude-dir=web-build \
      "$MOBILE_DIR" 2>/dev/null \
      | grep -Ev '/useEntitlement\.ts:|/PremiumGate\.tsx:'); then
    echo "Premium/tier logic found outside useEntitlement.ts / PremiumGate.tsx:"
    echo "$matches"
    FOUND=1
  fi
fi

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "check-entitlement.sh: FAILED"
  exit 1
fi

echo "check-entitlement.sh: OK"
