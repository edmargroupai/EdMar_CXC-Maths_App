// §10.3 — Rational/Decimal parsing shared by every numeric-family validator.
// Rationals use bigint arithmetic so equality/tolerance checks never suffer
// float rounding error; Decimal wraps a Rational with the *written* precision
// (decimal places / significant figures) that §10.7 needs to grade presentation.

export interface Rational {
  readonly kind: "rational";
  readonly num: bigint;
  readonly den: bigint; // always > 0
}

export interface Decimal {
  readonly kind: "decimal";
  readonly rational: Rational;
  readonly decimalPlaces: number;
  readonly significantFigures: number;
}

export function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x === 0n ? 1n : x;
}

export function makeRational(num: bigint, den: bigint): Rational {
  if (den === 0n) {
    throw new Error("makeRational: zero denominator");
  }
  let n = num;
  let d = den;
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdBigInt(n, d);
  return { kind: "rational", num: n / g, den: d / g };
}

export function rationalToNumber(r: Rational): number {
  return Number(r.num) / Number(r.den);
}

export function rationalEquals(a: Rational, b: Rational): boolean {
  return a.num * b.den === b.num * a.den;
}

const DECIMAL_RE = /^-?\d+(\.\d+)?$/;
const SIMPLE_FRACTION_RE = /^(-?\d+)\s*\/\s*(-?\d+)$/;

/** Count of digits after the decimal point in a plain numeric literal ("540." -> 0, "540.00" -> 2). */
export function countDecimalPlaces(raw: string): number {
  const m = /\.(\d+)$/.exec(raw);
  return m ? m[1]!.length : 0;
}

/** Significant-figure count using the standard convention: trailing zeros in
 * an integer with no decimal point are not significant; every digit from the
 * first non-zero digit onward is significant once a decimal point is present. */
export function countSignificantFigures(raw: string): number {
  const s = raw.replace(/^-/, "");
  if (s.includes(".")) {
    const digitsOnly = s.replace(".", "");
    const firstNonZero = digitsOnly.search(/[1-9]/);
    if (firstNonZero === -1) return 0;
    return digitsOnly.length - firstNonZero;
  }
  const firstNonZero = s.search(/[1-9]/);
  if (firstNonZero === -1) return 0;
  // slice() starts at the first non-zero digit, so trailing-zero stripping
  // can never empty it out entirely.
  return s.slice(firstNonZero).replace(/0+$/, "").length;
}

/** Parses a plain decimal/integer literal into a Decimal (exact Rational + written precision). */
export function parseDecimal(raw: string): Decimal | null {
  const s = raw.trim();
  if (!DECIMAL_RE.test(s)) return null;
  const decimalPlaces = countDecimalPlaces(s);
  const significantFigures = countSignificantFigures(s);
  const negative = s.startsWith("-");
  const unsigned = negative ? s.slice(1) : s;
  // DECIMAL_RE guarantees at least one digit before an optional ".", so
  // intPart is never empty and the concatenation is always BigInt-parseable.
  const [intPart, fracPart = ""] = unsigned.split(".");
  const den = 10n ** BigInt(fracPart.length);
  const num = BigInt(intPart + fracPart);
  const rational = makeRational(negative ? -num : num, den);
  return { kind: "decimal", rational, decimalPlaces, significantFigures };
}

/** Parses a simple improper fraction "a/b" (no mixed-number whole part). */
export function parseSimpleFraction(raw: string): Rational | null {
  const s = raw.trim();
  const wrapped = /^-\(\s*(-?\d+)\s*\/\s*(-?\d+)\s*\)$/.exec(s);
  if (wrapped) {
    return makeRational(-BigInt(wrapped[1]!), BigInt(wrapped[2]!));
  }
  const m = SIMPLE_FRACTION_RE.exec(s);
  if (!m) return null;
  const den = BigInt(m[2]!);
  if (den === 0n) return null;
  return makeRational(BigInt(m[1]!), den);
}

/** Parses a mixed number "a b/c" into an improper Rational. */
export function parseMixedNumber(raw: string): Rational | null {
  const s = raw.trim();
  const m = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (!m) return null;
  const den = BigInt(m[3]!);
  if (den === 0n) return null;
  const wholeStr = m[1]!;
  const negative = wholeStr.startsWith("-");
  const whole = BigInt(negative ? wholeStr.slice(1) : wholeStr);
  const numAbs = whole * den + BigInt(m[2]!);
  return makeRational(negative ? -numAbs : numAbs, den);
}

/** Public per §10.3 — tries fraction notation first, then plain decimal notation. */
export function parseNumeric(input: string): Rational | Decimal | null {
  const s = input.trim();
  if (s.length === 0) return null;
  const fraction = parseSimpleFraction(s);
  if (fraction) return fraction;
  return parseDecimal(s);
}

/** "3:5" or "3 : 5" -> [3, 5]. Null if any part isn't a plain non-negative integer. */
export function parseRatio(input: string): number[] | null {
  const parts = input.trim().split(/\s*:\s*/);
  if (parts.length < 2) return null;
  const values: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    values.push(Number.parseInt(part, 10));
  }
  return values;
}

function gcdOfVector(values: number[]): number {
  return values.reduce((acc, v) => {
    let a = Math.abs(acc);
    let b = Math.abs(v);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }, 0) || 1;
}

export function simplifyRatio(values: number[]): number[] {
  const g = gcdOfVector(values);
  return values.map((v) => v / g);
}

/** "(a, b)" -> [a, b] as plain numbers. Null if not parseable. */
export function parseCoordinate(input: string): number[] | null {
  const s = input.trim();
  const inner = /^\((.*)\)$/.exec(s);
  const body = inner ? inner[1]! : s;
  const parts = body.split(",").map((p) => p.trim());
  if (parts.length < 2) return null;
  const values: number[] = [];
  for (const part of parts) {
    const parsed = parseDecimal(part);
    if (!parsed) return null;
    values.push(rationalToNumber(parsed.rational));
  }
  return values;
}
