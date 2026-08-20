import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateRatio } from "./ratio";

function ratioSpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "ratio",
    canonicalValue: "3:5",
    displayValue: "3:5",
    acceptedForms: [],
    normalisation: "numeric_default",
    ...overrides,
  };
}

// §27.2 FIXTURE ratio — "3:5", simplest form required
describe("§27.2 FIXTURE ratio", () => {
  it.each(["3:5", "3 : 5"])("%s is correct", (input) => {
    expect(validateRatio(input, ratioSpec()).isCorrect).toBe(true);
  });

  it("6:10 is incorrect (not_simplified) when simplest form is required", () => {
    const spec = ratioSpec({ form: { simplestRatio: true } });
    const result = validateRatio("6:10", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("not_simplified");
  });

  it("6:10 is correct when simplest form is not required (3:5 ≡ 6:10)", () => {
    const result = validateRatio("6:10", ratioSpec());
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });
});

describe("ratio edge cases", () => {
  it("rejects unparseable input", () => {
    expect(validateRatio("not-a-ratio", ratioSpec()).reason).toBe("unparseable");
  });

  it("rejects a differently-valued ratio", () => {
    expect(validateRatio("2:7", ratioSpec()).isCorrect).toBe(false);
  });

  it("supports an array canonicalValue", () => {
    const spec = ratioSpec({ canonicalValue: ["3:5"] });
    expect(validateRatio("3:5", spec).isCorrect).toBe(true);
  });

  it("throws when canonicalValue is not itself a parseable ratio", () => {
    const spec = ratioSpec({ canonicalValue: "not-a-ratio" });
    expect(() => validateRatio("3:5", spec)).toThrow();
  });
});
