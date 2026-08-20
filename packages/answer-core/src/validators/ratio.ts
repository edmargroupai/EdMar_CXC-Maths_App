// §10.6 — ratio. "3:5" ≡ "6:10" unless spec.form.simplestRatio requires reduced form.
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";
import { parseRatio, simplifyRatio } from "../parse";

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

function vectorsEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function isAlreadySimplest(vector: number[]): boolean {
  return vectorsEqual(vector, simplifyRatio(vector));
}

export function validateRatio(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = normalise(input, spec.normalisation);
  const normalisedCanonical = normalise(firstCanonical(spec), spec.normalisation);

  const inputVector = parseRatio(normalisedInput);
  if (!inputVector) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const canonicalVector = parseRatio(normalisedCanonical);
  if (!canonicalVector) {
    throw new Error(`answer-core: canonicalValue "${normalisedCanonical}" is not a parseable ratio`);
  }

  // Unlike fraction/decimal, a ratio's reduced form is the whole comparison —
  // any acceptedForms entry an author lists is, by construction, another
  // ratio reducing to the same vector, so it's already covered here without
  // a separate acceptedForms pass.
  if (!vectorsEqual(simplifyRatio(inputVector), simplifyRatio(canonicalVector))) {
    return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
  }

  if (spec.form?.simplestRatio && !isAlreadySimplest(inputVector)) {
    return {
      isCorrect: false,
      normalised: normalisedInput,
      matchedForm: firstCanonical(spec),
      reason: "not_simplified",
    };
  }

  return { isCorrect: true, normalised: normalisedInput, matchedForm: firstCanonical(spec), reason: "exact" };
}
