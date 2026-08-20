// packages/answer-core/src/index.ts — §10.3 public interface.
//
// MVP scope only (P08, §10.6): option_id, option_set, boolean, the numeric
// family (numeric_exact/tolerance/sf/dp), fraction, mixed_number, ratio,
// currency, with_units, coordinate, expression (Tier 1). `set`, `interval`,
// `matrix`, `vector`, `text` and `structured` are not implemented yet —
// validate() throws a clear error for them rather than silently mis-grading.
import type { AnswerSpec, AnswerType, ValidationResult } from "@edmar/types";
import { validateNumeric } from "./validators/numeric";
import { validateFraction } from "./validators/fraction";
import { validateRatio } from "./validators/ratio";
import { validateWithUnits } from "./validators/withUnits";
import { validateCoordinate } from "./validators/coordinate";
import { validateExpression } from "./validators/expression";
import { validateOptionId, validateOptionSet } from "./validators/options";
import { validateBoolean } from "./validators/boolean";

export type { ValidationResult, AnswerSpec, AnswerType } from "@edmar/types";
export { normalise, type NormalisationProfile } from "./normalise";
export { parseNumeric, type Rational, type Decimal } from "./parse";

const NUMERIC_FAMILY = new Set<AnswerType>([
  "numeric_exact",
  "numeric_tolerance",
  "numeric_sf",
  "numeric_dp",
  "currency",
]);

function asString(input: string | string[]): string {
  if (Array.isArray(input)) {
    throw new Error("answer-core: this answer type expects a single string input, received an array");
  }
  return input;
}

export function validate(input: string | string[], spec: AnswerSpec): ValidationResult {
  const { answerType } = spec;

  if (answerType === "option_id") return validateOptionId(asString(input), spec);
  if (answerType === "option_set") return validateOptionSet(input, spec);
  if (answerType === "boolean") return validateBoolean(asString(input), spec);
  if (NUMERIC_FAMILY.has(answerType)) return validateNumeric(asString(input), spec);
  if (answerType === "fraction" || answerType === "mixed_number") return validateFraction(asString(input), spec);
  if (answerType === "ratio") return validateRatio(asString(input), spec);
  if (answerType === "with_units") return validateWithUnits(asString(input), spec);
  if (answerType === "coordinate") return validateCoordinate(input, spec);
  if (answerType === "expression") return validateExpression(asString(input), spec);

  throw new Error(
    `answer-core: answerType "${answerType}" is not implemented in this phase (P08 MVP scope, see §10.6)`,
  );
}
