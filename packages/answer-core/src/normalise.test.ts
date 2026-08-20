import { describe, expect, it } from "vitest";
import { normalise, stripCurrencyPrefix } from "./normalise";

describe("normalise", () => {
  it("returns an empty string unchanged", () => {
    expect(normalise("", "default")).toBe("");
  });
  it("trims and collapses whitespace", () => {
    expect(normalise("  540   00  ", "numeric_default")).toBe("540 00");
  });
  it("converts unicode minus signs to '-'", () => {
    expect(normalise("−40", "numeric_default")).toBe("-40");
    expect(normalise("–40", "numeric_default")).toBe("-40");
    expect(normalise("—40", "numeric_default")).toBe("-40");
  });
  it("converts multiplication signs to '*'", () => {
    expect(normalise("2×3", "expression_default")).toBe("2*3");
    expect(normalise("2·3", "expression_default")).toBe("2*3");
  });
  it("converts '**' to '^'", () => {
    expect(normalise("2**3", "expression_default")).toBe("2^3");
  });
  it("converts superscripts to caret notation", () => {
    expect(normalise("cm²", "units_default")).toBe("cm^2");
    expect(normalise("cm³", "units_default")).toBe("cm^3");
    expect(normalise("xⁿ", "expression_default")).toBe("x^n");
  });
  it("lowercases for non-expression profiles", () => {
    expect(normalise("ABC", "text_default")).toBe("abc");
  });
  it("preserves case for the expression profile", () => {
    expect(normalise("ABC", "expression_default")).toBe("ABC");
  });
  it("strips a restatement prefix", () => {
    expect(normalise("x = 5", "numeric_default")).toBe("5");
    expect(normalise("answer = 5", "numeric_default")).toBe("5");
  });
  it("does not strip a restatement prefix for text_default", () => {
    expect(normalise("x = 5", "text_default")).toBe("x = 5");
  });
  it("strips thousands-separator commas between digits", () => {
    expect(normalise("1,000", "numeric_default")).toBe("1000");
  });
  it("does not disturb mixed-number spacing", () => {
    expect(normalise("1 3/20", "numeric_default")).toBe("1 3/20");
  });
  it("strips a leading '+'", () => {
    expect(normalise("+5", "numeric_default")).toBe("5");
  });
  it("strips a lone trailing decimal point", () => {
    expect(normalise("540.", "numeric_default")).toBe("540");
  });
});

describe("stripCurrencyPrefix", () => {
  it.each([
    ["$540", "540"],
    ["US$540", "540"],
    ["J$540", "540"],
    ["TT$540", "540"],
    ["$ 540.00", "540.00"],
  ])("%s -> %s", (input, expected) => {
    const { value, hadCurrency } = stripCurrencyPrefix(input);
    expect(value).toBe(expected);
    expect(hadCurrency).toBe(true);
  });
  it("leaves a plain number unchanged", () => {
    expect(stripCurrencyPrefix("540")).toEqual({ value: "540", hadCurrency: false });
  });
});
