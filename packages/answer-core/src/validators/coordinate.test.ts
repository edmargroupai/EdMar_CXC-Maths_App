import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateCoordinate } from "./coordinate";

function coordinateSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "coordinate",
    canonicalValue: "(3, 4)",
    displayValue: "(3, 4)",
    acceptedForms: [],
    tolerance: { kind: "none" },
    normalisation: "numeric_default",
    ...overrides,
  };
}

describe("coordinate", () => {
  const spec = coordinateSpec();

  it.each(["(3, 4)", "(3,4)", "3, 4", " ( 3 , 4 ) "])("%s is correct", (input) => {
    expect(validateCoordinate(input, spec).isCorrect).toBe(true);
  });

  it("rejects a swapped-order coordinate", () => {
    expect(validateCoordinate("(4, 3)", spec).isCorrect).toBe(false);
  });

  it("rejects unparseable input", () => {
    expect(validateCoordinate("not a point", spec).reason).toBe("unparseable");
  });

  it("rejects a component-count mismatch", () => {
    const result = validateCoordinate("(3, 4, 5)", coordinateSpec({ canonicalValue: "(3, 4)" }));
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("incorrect");
  });

  it("accepts a string[] input", () => {
    expect(validateCoordinate(["3", "4"], spec).isCorrect).toBe(true);
  });

  it("rejects a string[] input with an unparseable component", () => {
    expect(validateCoordinate(["3", "x"], spec).reason).toBe("unparseable");
  });

  it("accepts within tolerance and reports 'tolerance'", () => {
    const tolSpec = coordinateSpec({ tolerance: { kind: "absolute", value: 0.1 } });
    const result = validateCoordinate("(3.05, 4)", tolSpec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("tolerance");
  });

  it("rejects a value outside tolerance", () => {
    const tolSpec = coordinateSpec({ tolerance: { kind: "absolute", value: 0.1 } });
    expect(validateCoordinate("(5, 4)", tolSpec).isCorrect).toBe(false);
  });

  it("throws when canonicalValue is not a parseable coordinate", () => {
    const badSpec = coordinateSpec({ canonicalValue: "nope" });
    expect(() => validateCoordinate("(3, 4)", badSpec)).toThrow();
  });

  it("supports a string[] canonicalValue", () => {
    const arraySpec = coordinateSpec({ canonicalValue: ["3", "4"] });
    expect(validateCoordinate("(3, 4)", arraySpec).isCorrect).toBe(true);
  });
});
