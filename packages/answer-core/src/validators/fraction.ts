// §10.6 — fraction, mixed_number. Both compare as exact Rationals; accepted
// decimal forms ("0.75") are honoured via acceptedForms, never invented at runtime (§10.8).
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";
import {
  parseSimpleFraction,
  parseMixedNumber,
  parseDecimal,
  rationalEquals,
  gcdBigInt,
  type Rational,
} from "../parse";

function parseFlexible(raw: string): Rational | null {
  return parseSimpleFraction(raw) ?? parseMixedNumber(raw) ?? parseDecimal(raw)?.rational ?? null;
}

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

/** True when the literal input string is itself in lowest terms as a simple "a/b" fraction. */
function isWrittenInLowestTerms(normalisedInput: string): boolean {
  const m = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(normalisedInput);
  if (!m) return true; // mixed numbers / decimals carry no "reduce this" concern
  return gcdBigInt(BigInt(m[1]!), BigInt(m[2]!)) === 1n;
}

export function validateFraction(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = normalise(input, spec.normalisation);
  const normalisedCanonical = normalise(firstCanonical(spec), spec.normalisation);

  const parsedInput = parseFlexible(normalisedInput);
  if (!parsedInput) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const parsedCanonical = parseFlexible(normalisedCanonical);
  if (!parsedCanonical) {
    throw new Error(`answer-core: canonicalValue "${normalisedCanonical}" is not a parseable fraction`);
  }

  // A decimal-written input only matches the canonical fraction value when
  // that exact decimal has been explicitly whitelisted via acceptedForms
  // (§27.2: "1.15 ... unless in acceptedForms") — fraction questions want a
  // fraction-form answer by default. Fraction/mixed-number-written input,
  // by contrast, is compared directly against the canonical value: that's
  // what lets an unreduced-but-equal form like "46/40" match without the
  // author having to enumerate every reduction of it.
  const inputAsFractionOrMixed = parseSimpleFraction(normalisedInput) ?? parseMixedNumber(normalisedInput);

  const acceptedForms = spec.acceptedForms;
  let matchedForm: string | undefined;
  if (inputAsFractionOrMixed && rationalEquals(inputAsFractionOrMixed, parsedCanonical)) {
    matchedForm = firstCanonical(spec);
  } else {
    for (const form of acceptedForms) {
      const parsedForm = parseFlexible(normalise(form, spec.normalisation));
      if (parsedForm && rationalEquals(parsedInput, parsedForm)) {
        matchedForm = form;
        break;
      }
    }
  }

  if (!matchedForm) {
    return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
  }

  if (spec.form?.lowestTerms && !isWrittenInLowestTerms(normalisedInput)) {
    return { isCorrect: false, normalised: normalisedInput, matchedForm, reason: "not_simplified" };
  }

  return { isCorrect: true, normalised: normalisedInput, matchedForm, reason: "exact" };
}
