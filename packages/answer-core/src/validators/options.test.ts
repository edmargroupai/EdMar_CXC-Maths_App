import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateOptionId, validateOptionSet } from "./options";

function optionIdSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "option_id",
    canonicalValue: "B",
    displayValue: "B",
    acceptedForms: [],
    normalisation: "default",
    commonErrorValues: [{ key: "chose_distractor_a", value: "A" }],
    ...overrides,
  };
}

// §27.2 FIXTURE option_id
describe("§27.2 FIXTURE option_id", () => {
  const spec = optionIdSpec();

  it("accepts the correct key", () => {
    const result = validateOptionId("B", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });

  it("is case-insensitive on the key", () => {
    expect(validateOptionId("b", spec).isCorrect).toBe(true);
  });

  it("rejects the wrong key and reports the matched common error key", () => {
    const result = validateOptionId("A", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.matchedCommonErrorKey).toBe("chose_distractor_a");
  });

  it("rejects a wrong key with no linked common error", () => {
    const result = validateOptionId("C", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.matchedCommonErrorKey).toBeUndefined();
  });

  it("rejects null/empty input", () => {
    expect(validateOptionId("", spec).reason).toBe("unparseable");
    expect(validateOptionId("   ", spec).reason).toBe("unparseable");
  });

  it("supports an array canonicalValue", () => {
    const spec2 = optionIdSpec({ canonicalValue: ["B", "C"] });
    expect(validateOptionId("B", spec2).isCorrect).toBe(true);
  });
});

function optionSetSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "option_set",
    canonicalValue: ["A", "C"],
    displayValue: "A, C",
    acceptedForms: [],
    normalisation: "default",
    ...overrides,
  };
}

describe("option_set", () => {
  const spec = optionSetSpec();

  it("accepts the exact set regardless of order", () => {
    expect(validateOptionSet(["C", "A"], spec).isCorrect).toBe(true);
    expect(validateOptionSet(["a", "c"], spec).isCorrect).toBe(true);
  });

  it("accepts a comma-separated string input", () => {
    expect(validateOptionSet("A,C", spec).isCorrect).toBe(true);
  });

  it("rejects a subset", () => {
    expect(validateOptionSet(["A"], spec).isCorrect).toBe(false);
  });

  it("rejects a superset", () => {
    expect(validateOptionSet(["A", "B", "C"], spec).isCorrect).toBe(false);
  });

  it("rejects an empty selection", () => {
    expect(validateOptionSet([], spec).reason).toBe("unparseable");
  });

  it("supports a single-string canonicalValue", () => {
    const single = optionSetSpec({ canonicalValue: "A,C" });
    expect(validateOptionSet(["A", "C"], single).isCorrect).toBe(true);
  });
});
