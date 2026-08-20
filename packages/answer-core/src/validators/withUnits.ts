// §10.6 — with_units. Value compared per numeric rules; unit compared against
// `canonical`/`acceptedSet`; conversion applied only when requirement = 'convertible'.
import type { AnswerSpec, ValidationResult } from "@edmar/types";
import { normalise } from "../normalise";
import { parseDecimal, rationalToNumber } from "../parse";
import { unitsEquivalent, unitsConvertible } from "../units";
import { withinTolerance } from "../tolerance";

function firstCanonical(spec: AnswerSpec): string {
  return Array.isArray(spec.canonicalValue) ? spec.canonicalValue[0]! : spec.canonicalValue;
}

function splitValueAndUnit(s: string): { numberPart: string; unitPart: string } {
  const m = /^(-?\d+(?:\.\d+)?)\s*(.*)$/.exec(s.trim());
  if (!m) return { numberPart: s.trim(), unitPart: "" };
  return { numberPart: m[1]!, unitPart: m[2]!.trim() };
}

export function validateWithUnits(input: string, spec: AnswerSpec): ValidationResult {
  const normalisedInput = normalise(input, spec.normalisation);
  const { numberPart, unitPart } = splitValueAndUnit(normalisedInput);

  const parsed = parseDecimal(numberPart);
  if (!parsed) {
    return { isCorrect: false, normalised: normalisedInput, reason: "unparseable" };
  }

  const requirement = spec.units?.requirement ?? "none";
  const canonicalUnit = spec.units?.canonical ?? null;
  const acceptedSet = spec.units?.acceptedSet ?? [];
  let convertedValue = rationalToNumber(parsed.rational);

  if (unitPart === "") {
    if (requirement === "required" || requirement === "convertible") {
      return { isCorrect: false, normalised: normalisedInput, reason: "wrong_units" };
    }
  } else {
    const matchesCanonical = canonicalUnit !== null && unitsEquivalent(unitPart, canonicalUnit);
    const matchesAccepted = acceptedSet.some((u) => unitsEquivalent(unitPart, u));
    if (!matchesCanonical && !matchesAccepted) {
      const convertible = requirement === "convertible" && canonicalUnit ? unitsConvertible(unitPart, canonicalUnit) : null;
      if (convertible?.convertible && convertible.factorAtoB !== null) {
        convertedValue *= convertible.factorAtoB;
      } else {
        return { isCorrect: false, normalised: normalisedInput, reason: "wrong_units" };
      }
    }
  }

  const canonicalNumberPart = splitValueAndUnit(normalise(firstCanonical(spec), spec.normalisation)).numberPart;
  const canonicalParsed = parseDecimal(canonicalNumberPart);
  if (!canonicalParsed) {
    throw new Error(`answer-core: canonicalValue "${firstCanonical(spec)}" has no parseable numeric part`);
  }
  const canonicalValue = rationalToNumber(canonicalParsed.rational);

  // A unit conversion factor (e.g. mm² -> cm²) is rarely exactly representable
  // in binary floating point, so exactness after conversion is judged with a
  // small epsilon rather than strict ===.
  const isExact = Math.abs(convertedValue - canonicalValue) < 1e-9;
  const inTolerance = isExact || withinTolerance(convertedValue, canonicalValue, spec.tolerance);

  if (inTolerance) {
    return { isCorrect: true, normalised: normalisedInput, reason: isExact ? "exact" : "tolerance" };
  }

  return { isCorrect: false, normalised: normalisedInput, reason: "incorrect" };
}
