import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateExpression } from "./expression";

function expressionSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "expression",
    canonicalValue: "8a + b",
    displayValue: "8a + b",
    acceptedForms: [],
    normalisation: "expression_default",
    ...overrides,
  };
}

// §27.2 FIXTURE expression — "8a + b"
describe("§27.2 FIXTURE expression", () => {
  const spec = expressionSpec();

  it.each(["8a + b", "b + 8a", "8*a+b", "8a+1b", " 8 a + b "])("%s is correct", (input) => {
    const result = validateExpression(input, spec);
    expect(result.isCorrect).toBe(true);
  });

  it.each(["8ab", "9a", "8a - b"])("%s is incorrect", (input) => {
    expect(validateExpression(input, spec).isCorrect).toBe(false);
  });

  it("reports 'exact' for a literal match and 'equivalent_form' for a term-reordered match", () => {
    expect(validateExpression("8a + b", spec).reason).toBe("exact");
    expect(validateExpression("b + 8a", spec).reason).toBe("equivalent_form");
  });
});

// §27.2 FIXTURE expression factorised — "(x+1)(x+2)", specifiedForm 'factorised'
describe("§27.2 FIXTURE expression factorised", () => {
  const spec = expressionSpec({
    canonicalValue: "(x+1)(x+2)",
    acceptedForms: ["(x+2)(x+1)"],
    form: { specifiedForm: "factorised" },
  });

  it.each(["(x+1)(x+2)", "(x+2)(x+1)"])("%s is correct", (input) => {
    expect(validateExpression(input, spec).isCorrect).toBe(true);
  });

  it("x^2+3x+2 is incorrect — correct value, wrong (unfactorised) form", () => {
    const result = validateExpression("x^2+3x+2", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("incorrect");
  });
});

describe("expression edge cases", () => {
  it("matches a literal acceptedForms entry by exact text before trying general equivalence", () => {
    const spec = expressionSpec({ canonicalValue: "8a+b", acceptedForms: ["b + 8*a"] });
    const result = validateExpression("b + 8*a", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.matchedForm).toBe("b + 8*a");
    expect(result.reason).toBe("exact");
  });

  it("returns unparseable when the input itself does not parse", () => {
    const result = validateExpression("8a +* b", expressionSpec());
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("unparseable");
  });

  it("supports an array canonicalValue", () => {
    const spec = expressionSpec({ canonicalValue: ["8a + b"] });
    expect(validateExpression("8a + b", spec).isCorrect).toBe(true);
  });
});
