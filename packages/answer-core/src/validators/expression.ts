// §10.9 — expression, Tier 1 runtime only (Tier 3 acceptedForms + Tier 2 spot-check are pipeline/V1 scope).
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";
import { expressionsEquivalent } from "../equivalence";

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

export function validateExpression(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = normalise(input, spec.normalisation);
  const normalisedCanonical = normalise(firstCanonical(spec), spec.normalisation);
  const acceptedForms = spec.acceptedForms;

  if (normalisedInput === normalisedCanonical) {
    return { isCorrect: true, normalised: normalisedInput, matchedForm: firstCanonical(spec), reason: "exact" };
  }
  for (const form of acceptedForms) {
    if (normalise(form, spec.normalisation) === normalisedInput) {
      return { isCorrect: true, normalised: normalisedInput, matchedForm: form, reason: "exact" };
    }
  }

  // A specifiedForm (e.g. "factorised") constrains the answer's *shape*, not
  // just its value — general canonical-form equivalence would accept an
  // expanded form the stem explicitly asked the student not to give (§10.9),
  // so beyond this point only the literal acceptedForms membership above applies.
  if (spec.form?.specifiedForm) {
    return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
  }

  // Canonical-form equivalence is transitive: since every acceptedForms entry
  // is itself equivalent to canonicalValue (authored that way, §10.8), an
  // input equivalent to any accepted form is already equivalent to
  // canonicalValue directly — a separate per-accepted-form pass here would
  // never fire on top of this check.
  const equivalentToCanonical = expressionsEquivalent(normalisedInput, normalisedCanonical);
  if (equivalentToCanonical === null) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }
  if (equivalentToCanonical) {
    return {
      isCorrect: true,
      normalised: normalisedInput,
      matchedForm: firstCanonical(spec),
      reason: "equivalent_form",
    };
  }

  return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
}
