#!/usr/bin/env bash
# Invariant I-1 / §25.10 — no AI SDK may be reachable from apps/mobile, directly
# or transitively. The student path must never be able to call a language model.
set -euo pipefail
cd "$(dirname "$0")/.."

MOBILE_DIR="apps/mobile"

if [ ! -d "$MOBILE_DIR" ]; then
  echo "check-no-ai-in-mobile.sh: OK — $MOBILE_DIR does not exist yet"
  exit 0
fi

FORBIDDEN_DEPS_REGEX='"@anthropic-ai/[^"]*"|"openai"|"@google/generative-ai"|"mathjax[^"]*"'
FORBIDDEN_IMPORT_REGEX='@anthropic-ai/|(^|[^A-Za-z_])openai([^A-Za-z_]|$)|@google/generative-ai|mathjax|sympy'
FORBIDDEN_NAME_REGEX='(llm|gpt|claude)'

FOUND=0

if [ -f "$MOBILE_DIR/package.json" ]; then
  if matches=$(grep -EiHn "$FORBIDDEN_DEPS_REGEX" "$MOBILE_DIR/package.json" 2>/dev/null); then
    echo "Forbidden AI dependency declared in $MOBILE_DIR/package.json:"
    echo "$matches"
    FOUND=1
  fi
  if matches=$(grep -EiHn "$FORBIDDEN_NAME_REGEX" "$MOBILE_DIR/package.json" 2>/dev/null | grep -Ev '"(name|description)"'); then
    echo "Dependency name matching /llm|gpt|claude/i in $MOBILE_DIR/package.json:"
    echo "$matches"
    FOUND=1
  fi
fi

if matches=$(grep -REin "$FORBIDDEN_IMPORT_REGEX" --include='*.ts' --include='*.tsx' --include='*.js' "$MOBILE_DIR" 2>/dev/null); then
  echo "Forbidden AI import/reference found in $MOBILE_DIR source:"
  echo "$matches"
  FOUND=1
fi

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "check-no-ai-in-mobile.sh: FAILED"
  exit 1
fi

echo "check-no-ai-in-mobile.sh: OK"
