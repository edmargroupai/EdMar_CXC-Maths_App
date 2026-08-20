import { describe, expect, it } from "vitest";
import {
  makeRational,
  rationalToNumber,
  rationalEquals,
  countDecimalPlaces,
  countSignificantFigures,
  parseDecimal,
  parseSimpleFraction,
  parseMixedNumber,
  parseNumeric,
  parseRatio,
  simplifyRatio,
  parseCoordinate,
  gcdBigInt,
} from "./parse";

describe("makeRational", () => {
  it("reduces to lowest terms", () => {
    const r = makeRational(4n, 8n);
    expect(r.num).toBe(1n);
    expect(r.den).toBe(2n);
  });
  it("normalises a negative denominator onto the numerator", () => {
    const r = makeRational(3n, -4n);
    expect(r.num).toBe(-3n);
    expect(r.den).toBe(4n);
  });
  it("throws on a zero denominator", () => {
    expect(() => makeRational(1n, 0n)).toThrow();
  });
  it("handles a zero numerator", () => {
    const r = makeRational(0n, 5n);
    expect(r.num).toBe(0n);
    expect(r.den).toBe(1n);
  });
});

describe("gcdBigInt", () => {
  it("computes the gcd of two positive numbers", () => {
    expect(gcdBigInt(12n, 18n)).toBe(6n);
  });
  it("treats negatives via absolute value", () => {
    expect(gcdBigInt(-12n, 18n)).toBe(6n);
    expect(gcdBigInt(12n, -18n)).toBe(6n);
  });
  it("returns 1 for gcd(0, 0) rather than 0", () => {
    expect(gcdBigInt(0n, 0n)).toBe(1n);
  });
});

describe("rationalToNumber / rationalEquals", () => {
  it("converts to a plain number", () => {
    expect(rationalToNumber(makeRational(3n, 4n))).toBeCloseTo(0.75);
  });
  it("treats differently-reduced equal fractions as equal", () => {
    expect(rationalEquals(makeRational(1n, 2n), makeRational(2n, 4n))).toBe(true);
  });
  it("treats different values as unequal", () => {
    expect(rationalEquals(makeRational(1n, 2n), makeRational(1n, 3n))).toBe(false);
  });
});

describe("countDecimalPlaces", () => {
  it.each([
    ["540", 0],
    ["540.00", 2],
    ["540.", 0],
    ["-3.14", 2],
  ])("%s -> %i", (input, expected) => {
    expect(countDecimalPlaces(input)).toBe(expected);
  });
});

describe("countSignificantFigures", () => {
  it.each([
    ["58.7", 3],
    ["58.74", 4],
    ["59", 2],
    ["500", 1],
    ["0.075", 2],
    ["0.00", 0],
    ["0", 0],
    ["-58.7", 3],
  ])("%s -> %i", (input, expected) => {
    expect(countSignificantFigures(input)).toBe(expected);
  });
});

describe("parseDecimal", () => {
  it("parses a plain integer", () => {
    expect(parseDecimal("540")?.rational).toEqual(makeRational(540n, 1n));
  });
  it("parses a negative decimal", () => {
    expect(parseDecimal("-3.5")?.rational).toEqual(makeRational(-35n, 10n));
  });
  it("rejects non-numeric text", () => {
    expect(parseDecimal("abc")).toBeNull();
  });
  it("rejects a spurious trailing unit", () => {
    expect(parseDecimal("540 cm")).toBeNull();
  });
  it("rejects an empty string", () => {
    expect(parseDecimal("")).toBeNull();
  });
});

describe("parseSimpleFraction", () => {
  it("parses a/b", () => {
    const r = parseSimpleFraction("23/20");
    expect(r).toEqual(makeRational(23n, 20n));
  });
  it("parses with spaces around the slash", () => {
    expect(parseSimpleFraction("23 / 20")).toEqual(makeRational(23n, 20n));
  });
  it("parses 3/-4", () => {
    expect(parseSimpleFraction("3/-4")).toEqual(makeRational(-3n, 4n));
  });
  it("parses -(-23/20) style wrapping via -(a/b)", () => {
    expect(parseSimpleFraction("-(-23/20)")).toEqual(makeRational(23n, 20n));
  });
  it("rejects a backslash separator", () => {
    expect(parseSimpleFraction("23\\20")).toBeNull();
  });
  it("rejects a zero denominator", () => {
    expect(parseSimpleFraction("3/0")).toBeNull();
  });
  it("rejects non-fraction text", () => {
    expect(parseSimpleFraction("1.15")).toBeNull();
  });
});

describe("parseMixedNumber", () => {
  it("parses a positive mixed number to an improper fraction", () => {
    expect(parseMixedNumber("1 3/20")).toEqual(makeRational(23n, 20n));
  });
  it("parses a negative mixed number", () => {
    expect(parseMixedNumber("-1 3/20")).toEqual(makeRational(-23n, 20n));
  });
  it("rejects a zero denominator", () => {
    expect(parseMixedNumber("1 3/0")).toBeNull();
  });
  it("rejects a simple (non-mixed) fraction", () => {
    expect(parseMixedNumber("23/20")).toBeNull();
  });
});

describe("parseNumeric", () => {
  it("prefers fraction notation", () => {
    const r = parseNumeric("23/20");
    expect(r?.kind).toBe("rational");
  });
  it("falls back to decimal notation", () => {
    const r = parseNumeric("58.7");
    expect(r?.kind).toBe("decimal");
  });
  it("returns null for an empty string", () => {
    expect(parseNumeric("")).toBeNull();
  });
  it("returns null for unparseable text", () => {
    expect(parseNumeric("abc")).toBeNull();
  });
});

describe("parseRatio", () => {
  it("parses a:b", () => {
    expect(parseRatio("3:5")).toEqual([3, 5]);
  });
  it("parses with spaces around the colon", () => {
    expect(parseRatio("3 : 5")).toEqual([3, 5]);
  });
  it("rejects a single term", () => {
    expect(parseRatio("3")).toBeNull();
  });
  it("rejects a non-integer part", () => {
    expect(parseRatio("3:5.5")).toBeNull();
  });
});

describe("simplifyRatio", () => {
  it("reduces by the gcd", () => {
    expect(simplifyRatio([6, 10])).toEqual([3, 5]);
  });
  it("leaves an already-simplest ratio unchanged", () => {
    expect(simplifyRatio([3, 5])).toEqual([3, 5]);
  });
  it("does not divide by zero for an all-zero ratio", () => {
    expect(simplifyRatio([0, 0])).toEqual([0, 0]);
  });
});

describe("parseCoordinate", () => {
  it("parses with parentheses", () => {
    expect(parseCoordinate("(3, 4)")).toEqual([3, 4]);
  });
  it("parses without parentheses", () => {
    expect(parseCoordinate("3, 4")).toEqual([3, 4]);
  });
  it("rejects a single component", () => {
    expect(parseCoordinate("(3)")).toBeNull();
  });
  it("rejects a non-numeric component", () => {
    expect(parseCoordinate("(3, x)")).toBeNull();
  });
});
