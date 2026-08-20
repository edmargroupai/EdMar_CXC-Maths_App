import { describe, expect, it } from "vitest";
import { expressionsEquivalent, expressionCanonicalKey } from "./equivalence";

describe("expressionsEquivalent", () => {
  it.each([
    ["8a + b", "3a + 2b + 5a - b"],
    ["b + 8a", "3a + 2b + 5a - b"],
    ["8*a+b", "3a + 2b + 5a - b"],
    ["8a+1b", "3a + 2b + 5a - b"],
    [" 8 a + b ", "3a + 2b + 5a - b"],
    ["(x+1)(x+2)", "(x+2)(x+1)"],
  ])("treats %s as equivalent to %s", (a, b) => {
    expect(expressionsEquivalent(a, b)).toBe(true);
  });

  it.each([
    ["8ab", "8a + b"],
    ["9a", "8a + b"],
    ["8a - b", "8a + b"],
    ["x^2+3x+2", "(x+1)(x+2)"],
  ])("does not treat %s as equivalent to %s", (a, b) => {
    expect(expressionsEquivalent(a, b)).toBe(false);
  });

  it("returns null when the left side fails to parse", () => {
    expect(expressionsEquivalent("8a +* b", "8a + b")).toBeNull();
  });
  it("returns null when the right side fails to parse", () => {
    expect(expressionsEquivalent("8a + b", "8a +* b")).toBeNull();
  });
});

describe("expressionCanonicalKey", () => {
  it("returns null for unparseable input", () => {
    expect(expressionCanonicalKey("8a +* b")).toBeNull();
  });
  it("returns a stable key for a parseable expression", () => {
    expect(expressionCanonicalKey("8a + b")).toEqual(expect.any(String));
  });
  it("handles a unary operator node", () => {
    expect(expressionCanonicalKey("-x")).toEqual(expect.any(String));
  });
  it("handles a function-call node", () => {
    expect(expressionCanonicalKey("sqrt(x)")).toEqual(expect.any(String));
  });
  it("falls back to toString() for a node shape it doesn't otherwise recognise", () => {
    expect(expressionCanonicalKey("[1,2,3]")).toEqual(expect.any(String));
  });
});
