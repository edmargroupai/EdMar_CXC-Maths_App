// §10.6 — boolean: exact match.
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";

const TRUE_TOKENS = new Set(["true", "t", "yes", "1"]);
const FALSE_TOKENS = new Set(["false", "f", "no", "0"]);

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

export function validateBoolean(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = normalise(input, spec.normalisation);

  let value: boolean | null = null;
  if (TRUE_TOKENS.has(normalisedInput)) value = true;
  else if (FALSE_TOKENS.has(normalisedInput)) value = false;

  if (value === null) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const canonicalValue = TRUE_TOKENS.has(normalise(firstCanonical(spec), spec.normalisation));
  const isCorrect = value === canonicalValue;
  return { isCorrect, normalised: String(value), reason: isCorrect ? "exact" : "incorrect" };
}
