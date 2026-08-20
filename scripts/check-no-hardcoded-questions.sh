#!/usr/bin/env bash
# §20.2 / §25.10 — question content must come from question_payloads via the
# query cache, never as a literal in a component. Heuristic: a component file
# containing an inline object literal shaped like a question (two or more of:
# stem, correctAnswer, answerSpec, solutionSteps, distractors) is flagged.
# Test fixtures and generated files are exempt.
set -euo pipefail
cd "$(dirname "$0")/.."

SEARCH_DIRS="apps/mobile/app apps/mobile/src/components apps/mobile/src/features apps/admin/app apps/admin/src/components"
KEYS='stem|correctAnswer|answerSpec|solutionSteps|distractors'
FOUND=0

for dir in $SEARCH_DIRS; do
  [ -d "$dir" ] || continue
  while IFS= read -r -d '' file; do
    case "$file" in
      *.test.*|*.spec.*|*/__fixtures__/*|*/fixtures/*|*.generated.*) continue ;;
    esac
    hits=$(grep -Eo "$KEYS" "$file" | sort -u | wc -l)
    if [ "$hits" -ge 2 ]; then
      echo "Possible hard-coded question content in $file (matched $hits of: stem, correctAnswer, answerSpec, solutionSteps, distractors)"
      FOUND=1
    fi
  done < <(find "$dir" -type f \( -name '*.tsx' -o -name '*.ts' \) -print0)
done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "check-no-hardcoded-questions.sh: FAILED — move this content to question_payloads and read it via the query cache"
  exit 1
fi

echo "check-no-hardcoded-questions.sh: OK"
