#!/usr/bin/env bash
# §25.9 — CI secret scanning.
# Fails the build if a secret-shaped literal appears outside the allowed locations.
set -euo pipefail
cd "$(dirname "$0")/.."

COMMON_EXCLUDES=(
  --exclude-dir=.git
  --exclude-dir=node_modules
  --exclude-dir=.turbo
  --exclude-dir=.pnpm-store
  --exclude-dir=dist
  --exclude-dir=build
  --exclude-dir=.next
  --exclude-dir=.expo
  --exclude-dir=coverage
  --exclude-dir=supabase/functions
  # Prose documentation (this spec, ADRs, runbooks) legitimately names and
  # quotes these forbidden strings when describing the security model.
  --exclude-dir=docs
  # These check scripts legitimately reference the literal strings they
  # search for — that is the implementation of the check, not a leak.
  --exclude-dir=scripts
  --exclude=.env.example
)

FOUND=0

scan_pattern() {
  local pattern="$1"
  if matches=$(grep -RnF "${COMMON_EXCLUDES[@]}" -- "$pattern" . 2>/dev/null); then
    echo "Forbidden string '$pattern' found outside allowed locations:"
    echo "$matches"
    FOUND=1
  fi
}

scan_pattern 'SUPABASE_SERVICE_ROLE_KEY'
scan_pattern 'service_role'
scan_pattern 'sk-ant-'
scan_pattern 'sk-proj-'
scan_pattern '-----BEGIN PRIVATE KEY-----'
scan_pattern '"role":"service_role"'

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "check-no-secrets.sh: FAILED"
  exit 1
fi

echo "check-no-secrets.sh: OK — no forbidden secret-shaped strings found"
