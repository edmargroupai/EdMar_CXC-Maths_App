import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateFraction } from "./fraction";

// §27.2 FIXTURE fraction — "23/20", lowestTerms not required
function fractionSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "fraction",
    canonicalValue: "23/20",
    displayValue: "23/20",
    acceptedForms: [],
    normalisation: "numeric_default",
    ...overrides,
  };
}

describe("§27.2 FIXTURE fraction", () => {
  const spec = fractionSpec();

  it.each(["23/20", "1 3/20", "46/40", "-(-23/20)", "23 / 20"])("%s is correct", (input) => {
    const result = validateFraction(input, spec);
    expect(result.isCorrect).toBe(true);
  });

  it.each(["20/23", "23\\20"])("%s is incorrect", (input) => {
    expect(validateFraction(input, spec).isCorrect).toBe(false);
  });

  it("1.15 is rejected unless it's in acceptedForms", () => {
    expect(validateFraction("1.15", spec).isCorrect).toBe(false);
    const withDecimal = fractionSpec({ acceptedForms: ["1.15"] });
    expect(validateFraction("1.15", withDecimal).isCorrect).toBe(true);
  });

  it("23\\20 is unparseable", () => {
    expect(validateFraction("23\\20", spec).reason).toBe("unparseable");
  });
});

describe("fraction lowestTerms", () => {
  it("accepts an unreduced fraction when lowestTerms is not required", () => {
    const spec = fractionSpec({ form: { lowestTerms: false } });
    const result = validateFraction("46/40", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });

  it("rejects an unreduced fraction as not_simplified when lowestTerms is required", () => {
    const spec = fractionSpec({ form: { lowestTerms: true } });
    const result = validateFraction("46/40", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("not_simplified");
  });

  it("accepts an already-reduced fraction when lowestTerms is required", () => {
    const spec = fractionSpec({ form: { lowestTerms: true } });
    expect(validateFraction("23/20", spec).isCorrect).toBe(true);
  });

  it("does not apply the lowestTerms check to a mixed-number match", () => {
    const spec = fractionSpec({ form: { lowestTerms: true } });
    expect(validateFraction("1 3/20", spec).isCorrect).toBe(true);
  });
});

describe("mixed_number answerType", () => {
  it("parses a mixed number against a fraction canonical value", () => {
    const spec = fractionSpec({ answerType: "mixed_number" });
    expect(validateFraction("1 3/20", spec).isCorrect).toBe(true);
  });
});

describe("edge cases", () => {
  it("throws when canonicalValue is not itself a parseable fraction", () => {
    const spec = fractionSpec({ canonicalValue: "not-a-fraction" });
    expect(() => validateFraction("23/20", spec)).toThrow();
  });

  it("supports an array canonicalValue", () => {
    const spec = fractionSpec({ canonicalValue: ["23/20"] });
    expect(validateFraction("23/20", spec).isCorrect).toBe(true);
  });

  it("matches a decimal input via an acceptedForms entry, reporting that form", () => {
    const spec = fractionSpec({ canonicalValue: "1/2", acceptedForms: ["0.5"] });
    const result = validateFraction("0.5", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.matchedForm).toBe("0.5");
  });
});
