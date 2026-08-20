// §10.6/§10.7 — numeric_exact, numeric_tolerance, numeric_sf, numeric_dp, currency.
//
// Precision policy (§10.7.4, reconciled against the §27.2 fixture corpus):
//  - A literal match against canonicalValue/acceptedForms (after normalisation)
//    always wins as 'exact' — the author has explicitly pre-approved that
//    written form, so any precision rule is waived for it.
//  - numeric_sf: precision is an exact-count target (CSEC "give to 3 s.f." is
//    precise in both directions), checked *before* — and independently of —
//    whether the value itself is anywhere near correct, because a sig-fig
//    mismatch is worth flagging even on an otherwise-wrong answer.
//  - numeric_dp: precision is a *minimum* — decimal places is a "show at
//    least this many" convention (extra trailing digits carry no new
//    information when they round-preserve the value), so only "too few
//    written decimal places" on an otherwise-correct value is wrong_precision.
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise, stripCurrencyPrefix } from "../normalise";
import {
  parseDecimal,
  rationalEquals,
  rationalToNumber,
  countDecimalPlaces,
  countSignificantFigures,
} from "../parse";
import { withinTolerance } from "../tolerance";

function preprocess(raw: string, spec: AnswerSpec): string {
  const { value } = stripCurrencyPrefix(raw);
  return normalise(value, spec.normalisation);
}

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

function matchCommonError(normalisedInput: string, spec: AnswerSpec): string | undefined {
  const inputParsed = parseDecimal(normalisedInput);
  if (!inputParsed || !spec.commonErrorValues) return undefined;
  for (const ce of spec.commonErrorValues) {
    const ceParsed = parseDecimal(preprocess(ce.value, spec));
    if (ceParsed && rationalEquals(inputParsed.rational, ceParsed.rational)) {
      return ce.key;
    }
  }
  return undefined;
}

export function validateNumeric(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = preprocess(input, spec);
  const normalisedCanonical = preprocess(firstCanonical(spec), spec);

  if (normalisedInput === normalisedCanonical) {
    return { isCorrect: true, normalised: normalisedInput, matchedForm: firstCanonical(spec), reason: "exact" };
  }

  const acceptedForms = spec.acceptedForms;
  for (const form of acceptedForms) {
    if (preprocess(form, spec) === normalisedInput) {
      return { isCorrect: true, normalised: normalisedInput, matchedForm: form, reason: "exact" };
    }
  }

  const parsed = parseDecimal(normalisedInput);
  if (!parsed) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  if (spec.answerType === "numeric_sf" && spec.precision?.kind === "significant_figures" && spec.precision.required) {
    const sf = countSignificantFigures(normalisedInput);
    if (sf !== spec.precision.value) {
      return { isCorrect: false, normalised: normalisedInput, reason: "wrong_precision" };
    }
  }

  const canonicalParsed = parseDecimal(normalisedCanonical);
  if (!canonicalParsed) {
    throw new Error(`answer-core: canonicalValue "${normalisedCanonical}" is not a parseable number`);
  }

  const value = rationalToNumber(parsed.rational);
  const canonicalValue = rationalToNumber(canonicalParsed.rational);
  const isExact = rationalEquals(parsed.rational, canonicalParsed.rational);
  const inTolerance = isExact || withinTolerance(value, canonicalValue, spec.tolerance);

  if (
    (spec.answerType === "numeric_dp" || spec.answerType === "currency") &&
    spec.precision?.kind === "decimal_places" &&
    spec.precision.required &&
    inTolerance
  ) {
    const dp = countDecimalPlaces(normalisedInput);
    if (dp < spec.precision.value) {
      return { isCorrect: false, normalised: normalisedInput, reason: "wrong_precision" };
    }
  }

  if (inTolerance) {
    return { isCorrect: true, normalised: normalisedInput, reason: isExact ? "exact" : "tolerance" };
  }

  const matchedCommonErrorKey = matchCommonError(normalisedInput, spec);
  return {
    isCorrect: false,
    normalised: normalisedInput,
    reason: "incorrect",
    ...(matchedCommonErrorKey ? { matchedCommonErrorKey } : {}),
  };
}
