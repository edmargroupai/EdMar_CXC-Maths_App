import { describe, expect, it } from "vitest";
import type { AnswerSpec } from "@edmar/types";
import { validateNumeric } from "./numeric";

// §27.2 FIXTURE numeric_dp / currency — "selling price = $540.00", tol ±0.005, 2 dp required
function currencySpec(overrides: Partial<AnswerSpec> = {}): AnswerSpec {
  return {
    answerType: "currency",
    canonicalValue: "540.00",
    displayValue: "$540.00",
    acceptedForms: ["540", "540.0", "540.00", "$540", "$540.00"],
    tolerance: { kind: "absolute", value: 0.005 },
    precision: { kind: "decimal_places", value: 2, required: true },
    normalisation: "currency_default",
    commonErrorValues: [
      { key: "pct_on_selling_price", value: "470.00" },
      { key: "forgot_to_add", value: "90.00" },
    ],
    ...overrides,
  };
}

describe("§27.2 FIXTURE numeric_dp / currency", () => {
  const spec = currencySpec();

  it.each(["540", "540.0", "540.00", "$540", "$540.00", " 540 ", "540.", "$ 540.00"])(
    "%s is correct (exact)",
    (input) => {
      const result = validateNumeric(input, spec);
      expect(result.isCorrect).toBe(true);
      expect(result.reason).toBe("exact");
    },
  );

  it("540.000 is correct — extra precision is not an error", () => {
    const result = validateNumeric("540.000", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });

  it("539.99 is incorrect — outside tolerance", () => {
    const result = validateNumeric("539.99", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("incorrect");
  });

  it.each(["5400", "", "abc", "540 cm"])("%s is incorrect", (input) => {
    expect(validateNumeric(input, spec).isCorrect).toBe(false);
  });

  it("470 is incorrect with the matched common error key", () => {
    const result = validateNumeric("470", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.matchedCommonErrorKey).toBe("pct_on_selling_price");
  });

  it("the general precision rule applies once a form isn't explicitly whitelisted (§10.7.4)", () => {
    const strict = currencySpec({ acceptedForms: ["540.00"] });
    const result = validateNumeric("540", strict);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_precision");
  });
});

describe("§27.2 FIXTURE numeric_sf — 58.7 to 3 s.f.", () => {
  const spec: AnswerSpec = {
    answerType: "numeric_sf",
    canonicalValue: "58.7",
    displayValue: "58.7",
    acceptedForms: ["58.7"],
    tolerance: { kind: "absolute", value: 0.05 },
    precision: { kind: "significant_figures", value: 3, required: true },
    normalisation: "numeric_default",
  };

  it("58.7 is correct", () => {
    const result = validateNumeric("58.7", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("exact");
  });

  it.each(["58.74", "58.73", "59"])("%s is wrong_precision", (input) => {
    const result = validateNumeric(input, spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("wrong_precision");
  });
});

describe("numeric_exact", () => {
  const spec: AnswerSpec = {
    answerType: "numeric_exact",
    canonicalValue: "12",
    displayValue: "12",
    acceptedForms: [],
    tolerance: { kind: "none" },
    normalisation: "numeric_default",
  };

  it("accepts the exact value", () => {
    expect(validateNumeric("12", spec).isCorrect).toBe(true);
  });
  it("rejects a different value", () => {
    const result = validateNumeric("13", spec);
    expect(result.isCorrect).toBe(false);
    expect(result.reason).toBe("incorrect");
  });
  it("rejects unparseable input", () => {
    expect(validateNumeric("abc", spec).reason).toBe("unparseable");
  });
});

describe("numeric_tolerance", () => {
  it("accepts within absolute tolerance but reports 'tolerance' not 'exact'", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_tolerance",
      canonicalValue: "10",
      displayValue: "10",
      acceptedForms: [],
      tolerance: { kind: "absolute", value: 0.5 },
      normalisation: "numeric_default",
    };
    const result = validateNumeric("10.3", spec);
    expect(result.isCorrect).toBe(true);
    expect(result.reason).toBe("tolerance");
  });

  it("accepts within relative tolerance", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_tolerance",
      canonicalValue: "1000",
      displayValue: "1000",
      acceptedForms: [],
      tolerance: { kind: "relative", value: 0.01 },
      normalisation: "numeric_default",
    };
    expect(validateNumeric("1005", spec).isCorrect).toBe(true);
    expect(validateNumeric("1050", spec).isCorrect).toBe(false);
  });

  it("accepts within a range tolerance", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_tolerance",
      canonicalValue: "58.7",
      displayValue: "58.7",
      acceptedForms: [],
      tolerance: { kind: "range", min: 58.65, max: 58.75 },
      normalisation: "numeric_default",
    };
    expect(validateNumeric("58.72", spec).isCorrect).toBe(true);
    expect(validateNumeric("58.8", spec).isCorrect).toBe(false);
  });

  it("requires exact equality when no tolerance is given", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_tolerance",
      canonicalValue: "10",
      displayValue: "10",
      acceptedForms: [],
      normalisation: "numeric_default",
    };
    expect(validateNumeric("10", spec).isCorrect).toBe(true);
    expect(validateNumeric("10.001", spec).isCorrect).toBe(false);
  });

  it("supports an array canonicalValue (structured multi-value spec)", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_exact",
      canonicalValue: ["10", "20"],
      displayValue: "10",
      acceptedForms: [],
      tolerance: { kind: "none" },
      normalisation: "numeric_default",
    };
    expect(validateNumeric("10", spec).isCorrect).toBe(true);
  });

  it("throws when canonicalValue itself is not parseable — a content-authoring bug, not a user input case", () => {
    const spec: AnswerSpec = {
      answerType: "numeric_exact",
      canonicalValue: "not-a-number",
      displayValue: "not-a-number",
      acceptedForms: [],
      tolerance: { kind: "none" },
      normalisation: "numeric_default",
    };
    expect(() => validateNumeric("12", spec)).toThrow();
  });
});
