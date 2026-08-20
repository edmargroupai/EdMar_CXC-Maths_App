import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateWithUnits } from "./withUnits";

function withUnitsSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "with_units",
    canonicalValue: "40",
    displayValue: "40 cm²",
    acceptedForms: [],
    tolerance: { kind: "none" },
    units: { requirement: "required", canonical: "cm^2", acceptedSet: [] },
    normalisation: "units_default",
    ...overrides,
  };
}

// §27.2 FIXTURE with_units — "40 cm²", units required
describe("§27.2 FIXTURE with_units", () => {
  const spec = withUnitsSpec();

  it.each(["40 cm²", "40cm2", "40 cm^2", "40 sq cm", "40 square cm"])("%s is correct", (input) => {
    expect(validateWithUnits(input, spec).isCorrect).toBe(true);
  });

  it("40 is wrong_units (no unit written, required)", () => {
    const result = validateWithUnits("40", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_units");
  });

  it("40 cm is wrong_units (linear, not area)", () => {
    const result = validateWithUnits("40 cm", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_units");
  });

  it("40 cm³ is wrong_units (volume, not area)", () => {
    const result = validateWithUnits("40 cm³", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_units");
  });

  it("4000 mm² is correct only when units.requirement is 'convertible'", () => {
    const notConvertible = validateWithUnits("4000 mm²", spec);
    expect(notConvertible.isCorrect).toBe(false);

    const convertibleSpec = withUnitsSpec({
      units: { requirement: "convertible", canonical: "cm^2", acceptedSet: [] },
    });
    const result = validateWithUnits("4000 mm²", convertibleSpec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });
});

describe("with_units edge cases", () => {
  it("accepts a bare value when units are optional", () => {
    const spec = withUnitsSpec({ units: { requirement: "optional", canonical: "cm^2", acceptedSet: [] } });
    expect(validateWithUnits("40", spec).isCorrect).toBe(true);
  });

  it("accepts a bare value when there is no units field at all", () => {
    const spec = withUnitsSpec({ units: undefined });
    expect(validateWithUnits("40", spec).isCorrect).toBe(true);
  });

  it("accepts a unit listed in acceptedSet", () => {
    const spec = withUnitsSpec({ units: { requirement: "required", canonical: "cm^2", acceptedSet: ["cm2"] } });
    expect(validateWithUnits("40 cm2", spec).isCorrect).toBe(true);
  });

  it("rejects unparseable input", () => {
    expect(validateWithUnits("not a number", withUnitsSpec()).reason).toBe("unparseable");
  });

  it("rejects an unconvertible mismatched unit even when requirement is convertible", () => {
    const spec = withUnitsSpec({ units: { requirement: "convertible", canonical: "cm^2", acceptedSet: [] } });
    const result = validateWithUnits("40 widgets", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_units");
  });

  it("supports a tolerance-based near match", () => {
    const spec = withUnitsSpec({ tolerance: { kind: "absolute", value: 0.5 } });
    const result = validateWithUnits("40.3 cm²", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("tolerance");
  });

  it("rejects a value outside tolerance with matching units", () => {
    const result = validateWithUnits("41 cm²", withUnitsSpec());
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("incorrect");
  });

  it("supports an array canonicalValue", () => {
    const spec = withUnitsSpec({ canonicalValue: ["40"] });
    expect(validateWithUnits("40 cm²", spec).isCorrect).toBe(true);
  });

  it("throws when canonicalValue has no parseable numeric part", () => {
    const spec = withUnitsSpec({ canonicalValue: "abc" });
    expect(() => validateWithUnits("40 cm²", spec)).toThrow();
  });
});
