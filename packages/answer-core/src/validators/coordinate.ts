// §10.6 — coordinate: "(a, b)" compared componentwise, numerically.
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";
import { parseCoordinate, parseDecimal, rationalToNumber } from "../parse";
import { withinTolerance } from "../tolerance";

function toVector(value: string | string[]): number[] | null {
  if (Array.isArray(value)) {
    const nums: number[] = [];
    for (const component of value) {
      const parsed = parseDecimal(component.trim());
      if (!parsed) return null;
      nums.push(rationalToNumber(parsed.rational));
    }
    return nums;
  }
  return parseCoordinate(value);
}

export function validateCoordinate(input: string | string[], spec: AnswerSpec): ValidationResult {
  const normalisedInput = Array.isArray(input) ? input.join(", ") : normalise(input, spec.normalisation);
  const inputVector = toVector(input);
  if (!inputVector) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const canonicalVector = toVector(spec.canonicalValue);
  if (!canonicalVector) {
    throw new Error(`answer-core: canonicalValue is not a parseable coordinate`);
  }

  if (inputVector.length !== canonicalVector.length) {
    return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
  }

  let allExact = true;
  let allInTolerance = true;
  for (let i = 0; i < inputVector.length; i += 1) {
    const v = inputVector[i]!;
    const c = canonicalVector[i]!;
    const exact = v === c;
    if (!exact) allExact = false;
    if (!(exact || withinTolerance(v, c, spec.tolerance))) allInTolerance = false;
  }

  if (allInTolerance) {
    return { isCorrect: true, normalised: normalisedInput, reason: allExact ? "exact" : "tolerance" };
  }
  return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
}
