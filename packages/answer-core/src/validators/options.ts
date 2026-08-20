// §10.6 — option_id (exact match on the option key, never on option text —
// text is editable) and option_set (order-independent set equality of keys).
import type { AnswerSpec, ValidationResult } from "@edmar/types";

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

export function validateOptionId(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = input.trim().toUpperCase();
  if (normalisedInput.length === 0) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const canonical = firstCanonical(spec).trim().toUpperCase();
  if (normalisedInput === canonical) {
    return { isCorrect: true, normalised: normalisedInput, matchedForm: canonical, reason: "exact" };
  }

  const matchedCommonErrorKey = spec.commonErrorValues?.find(
    (ce) => ce.value.trim().toUpperCase() === normalisedInput,
  )?.key;
  return {
    isCorrect: false,
    normalised: normalisedInput,
    reason: "incorrect",
    ...(matchedCommonErrorKey ? { matchedCommonErrorKey } : {}),
  };
}

function toKeySet(value: string | string[]): Set<string> {
  const parts = Array.isArray(value) ? value : value.split(",");
  return new Set(
    parts
      .map((k) => k.trim().toUpperCase())
      .filter((k) => k.length > 0),
  );
}

export function validateOptionSet(input: string | string[], spec: AnswerSpec): ValidationResult {
  const inputSet = toKeySet(input);
  const normalisedInput = [...inputSet].sort().join(",");
  if (inputSet.size === 0) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const canonicalSet = toKeySet(spec.canonicalValue);
  const isCorrect = inputSet.size === canonicalSet.size && [...inputSet].every((k) => canonicalSet.has(k));
  return { isCorrect, normalised: normalisedInput, reason: isCorrect ? "exact" : "incorrect" };
}
