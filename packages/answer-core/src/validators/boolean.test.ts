import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateBoolean } from "./boolean";

function booleanSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "boolean",
    canonicalValue: "true",
    displayValue: "True",
    acceptedForms: [],
    normalisation: "default",
    ...overrides,
  };
}

describe("boolean", () => {
  const spec = booleanSpec();

  it.each(["true", "t", "yes", "1", "TRUE", " True "])("%s is correct", (input) => {
    expect(validateBoolean(input, spec).isCorrect).toBe(true);
  });

  it.each(["false", "f", "no", "0"])("%s is incorrect against a true canonical", (input) => {
    expect(validateBoolean(input, spec).isCorrect).toBe(false);
  });

  it("supports a false canonicalValue", () => {
    const falseSpec = booleanSpec({ canonicalValue: "false" });
    expect(validateBoolean("false", falseSpec).isCorrect).toBe(true);
    expect(validateBoolean("true", falseSpec).isCorrect).toBe(false);
  });

  it("rejects unrecognised input", () => {
    expect(validateBoolean("maybe", spec).reason).toBe("unparseable");
  });

  it("normalises the result to the literal string 'true'/'false'", () => {
    expect(validateBoolean("yes", spec).normalised).toBe("true");
  });

  it("supports an array canonicalValue", () => {
    const arraySpec = booleanSpec({ canonicalValue: ["true"] });
    expect(validateBoolean("true", arraySpec).isCorrect).toBe(true);
  });
});
