// §10.5/§10.6 — controlled unit vocabulary: canonicalisation of unit spelling
// variants ("cm2", "cm^2", "cm²", "sq cm", "square cm" -> "cm^2") and length-
// derived conversion for the `convertible` units requirement.

export interface ParsedUnit {
  canonical: string;
  dimension: string | null; // e.g. "m^2" for length-area units; null if not a known convertible unit
  factorToBase: number | null; // multiply a value in this unit by this to get the base-dimension value
}

const LENGTH_BASE_METRES: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };

function splitBaseAndPower(token: string): { base: string; power: number } | null {
  const s = token.replace(/\^/g, "");
  const m = /^([a-z]+)(\d?)$/.exec(s);
  if (!m) return null;
  return { base: m[1]!, power: m[2] ? Number.parseInt(m[2], 10) : 1 };
}

export function parseUnit(raw: string): ParsedUnit {
  const trimmed = raw.trim().toLowerCase();
  const sqMatch = /^(?:square|sq)\s*([a-z]+)$/.exec(trimmed);
  const cuMatch = /^(?:cubic|cu)\s*([a-z]+)$/.exec(trimmed);

  let base: string;
  let power: number;
  if (sqMatch) {
    base = sqMatch[1]!;
    power = 2;
  } else if (cuMatch) {
    base = cuMatch[1]!;
    power = 3;
  } else {
    const normalisedToken = trimmed.replace(/²/g, "^2").replace(/³/g, "^3").replace(/\s+/g, "");
    const split = splitBaseAndPower(normalisedToken);
    if (!split) return { canonical: trimmed, dimension: null, factorToBase: null };
    base = split.base;
    power = split.power;
  }

  const canonical = power === 1 ? base : `${base}^${power}`;
  const lengthFactor = LENGTH_BASE_METRES[base];
  if (lengthFactor === undefined) {
    return { canonical, dimension: null, factorToBase: null };
  }
  return { canonical, dimension: `m^${power}`, factorToBase: lengthFactor ** power };
}

export function unitsEquivalent(a: string, b: string): boolean {
  return parseUnit(a).canonical === parseUnit(b).canonical;
}

export function unitsConvertible(a: string, b: string): { convertible: boolean; factorAtoB: number | null } {
  const pa = parseUnit(a);
  const pb = parseUnit(b);
  if (pa.dimension && pa.dimension === pb.dimension && pa.factorToBase !== null && pb.factorToBase !== null) {
    return { convertible: true, factorAtoB: pa.factorToBase / pb.factorToBase };
  }
  return { convertible: false, factorAtoB: null };
}
