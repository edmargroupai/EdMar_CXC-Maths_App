import { describe, expect, it } from "vitest";
import { parseUnit, unitsEquivalent, unitsConvertible } from "./units";

describe("parseUnit", () => {
  it.each([
    ["cm2", "cm^2"],
    ["cm^2", "cm^2"],
    ["cm²", "cm^2"],
    ["sq cm", "cm^2"],
    ["square cm", "cm^2"],
    ["cm³", "cm^3"],
    ["cubic cm", "cm^3"],
    ["cu cm", "cm^3"],
    ["cm", "cm"],
  ])("%s -> canonical %s", (raw, expected) => {
    expect(parseUnit(raw).canonical).toBe(expected);
  });

  it("returns a null dimension for an unrecognised unit", () => {
    const parsed = parseUnit("widgets");
    expect(parsed.dimension).toBeNull();
    expect(parsed.factorToBase).toBeNull();
  });

  it("falls back to the raw trimmed text when nothing matches the token shape", () => {
    const parsed = parseUnit("not a unit!!");
    expect(parsed.dimension).toBeNull();
  });
});

describe("unitsEquivalent", () => {
  it("treats spelling variants as equivalent", () => {
    expect(unitsEquivalent("cm²", "sq cm")).toBe(true);
    expect(unitsEquivalent("cm2", "cm^2")).toBe(true);
  });
  it("treats different units as inequivalent", () => {
    expect(unitsEquivalent("cm", "cm^2")).toBe(false);
    expect(unitsEquivalent("cm^2", "cm^3")).toBe(false);
  });
});

describe("unitsConvertible", () => {
  it("converts between length-area units of the same dimension", () => {
    const { convertible, factorAtoB } = unitsConvertible("mm^2", "cm^2");
    expect(convertible).toBe(true);
    expect(factorAtoB).toBeCloseTo(0.01);
  });
  it("is not convertible across differing dimensions", () => {
    expect(unitsConvertible("cm^2", "cm^3").convertible).toBe(false);
  });
  it("is not convertible when either unit is unrecognised", () => {
    expect(unitsConvertible("widgets", "cm^2").convertible).toBe(false);
  });
});
