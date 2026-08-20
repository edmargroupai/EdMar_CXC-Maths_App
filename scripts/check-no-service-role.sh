#!/usr/bin/env bash
# §25.10 — the service-role key bypasses all RLS and must never reach a client
# bundle. Fails if 'service_role' appears in apps/mobile, or in apps/admin
# outside app/api/ (route handlers) or src/server/ (service-role clients).
set -euo pipefail
cd "$(dirname "$0")/.."

FOUND=0

SOURCE_EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.expo --exclude-dir=dist --exclude-dir=web-build --exclude-dir=.next --exclude-dir=.turbo)

if [ -d apps/mobile ]; then
  if matches=$(grep -RnF "${SOURCE_EXCLUDES[@]}" --include='*.ts' --include='*.tsx' --include='*.js' \
      'service_role' apps/mobile 2>/dev/null); then
    echo "'service_role' found in apps/mobile (forbidden everywhere in mobile):"
    echo "$matches"
    FOUND=1
  fi
fi

if [ -d apps/admin ]; then
  if matches=$(grep -RnF "${SOURCE_EXCLUDES[@]}" --include='*.ts' --include='*.tsx' 'service_role' apps/admin 2>/dev/null \
      | grep -Ev '^apps/admin/app/api/|^apps/admin/src/server/'); then
    echo "'service_role' found in apps/admin outside app/api/ or src/server/:"
    echo "$matches"
    FOUND=1
  fi
fi

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "check-no-service-role.sh: FAILED"
  exit 1
fi

echo "check-no-service-role.sh: OK"
