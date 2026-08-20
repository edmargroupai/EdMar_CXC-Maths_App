import { describe, expect, it } from "vitest";
import type { AnswerSpec, AnswerType } from "@edmar/types";
import { validate, normalise, parseNumeric } from "./index";

function specFor(answerType: AnswerType, overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType,
    canonicalValue: "true",
    displayValue: "true",
    acceptedForms: [],
    normalisation: "default",
    ...overrides,
  };
}

describe("validate() dispatch", () => {
  it("routes option_id", () => {
    expect(validate("A", specFor("option_id", { canonicalValue: "A" })).isCorrect).toBe(true);
  });
  it("routes option_set", () => {
    expect(validate(["A"], specFor("option_set", { canonicalValue: ["A"] })).isCorrect).toBe(true);
  });
  it("routes boolean", () => {
    expect(validate("true", specFor("boolean")).isCorrect).toBe(true);
  });
  it.each(["numeric_exact", "numeric_tolerance", "numeric_sf", "numeric_dp", "currency"] as const)(
    "routes %s to the numeric family",
    (answerType) => {
      const spec = specFor(answerType, { canonicalValue: "5", tolerance: { kind: "none" } });
      expect(validate("5", spec).isCorrect).toBe(true);
    },
  );
  it.each(["fraction", "mixed_number"] as const)("routes %s", (answerType) => {
    const spec = specFor(answerType, { canonicalValue: "1/2" });
    expect(validate("1/2", spec).isCorrect).toBe(true);
  });
  it("routes ratio", () => {
    expect(validate("3:5", specFor("ratio", { canonicalValue: "3:5" })).isCorrect).toBe(true);
  });
  it("routes with_units", () => {
    const spec = specFor("with_units", {
      canonicalValue: "40",
      tolerance: { kind: "none" },
      units: { requirement: "none", canonical: null, acceptedSet: [] },
    });
    expect(validate("40", spec).isCorrect).toBe(true);
  });
  it("routes coordinate", () => {
    const spec = specFor("coordinate", { canonicalValue: "(3, 4)", tolerance: { kind: "none" } });
    expect(validate("(3, 4)", spec).isCorrect).toBe(true);
  });
  it("routes expression", () => {
    const spec = specFor("expression", { canonicalValue: "8a+b", normalisation: "expression_default" });
    expect(validate("8a+b", spec).isCorrect).toBe(true);
  });

  it("throws for an answerType not implemented in this phase", () => {
    const spec = specFor("text");
    expect(() => validate("hello", spec)).toThrow(/not implemented in this phase/);
  });

  it("throws when an array is passed to a single-string answer type", () => {
    const spec = specFor("boolean");
    expect(() => validate(["true", "false"], spec)).toThrow(/expects a single string input/);
  });
});

describe("re-exported helpers", () => {
  it("normalise is usable directly", () => {
    expect(normalise("  ABC  ", "text_default")).toBe("abc");
  });
  it("parseNumeric is usable directly", () => {
    expect(parseNumeric("3/4")?.kind).toBe("rational");
  });
});
