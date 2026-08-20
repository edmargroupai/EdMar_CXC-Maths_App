import { describe, expect, it } from "vitest";
import { withinTolerance } from "./tolerance";

describe("withinTolerance", () => {
  it("requires exact equality when no tolerance is given", () => {
    expect(withinTolerance(10, 10, undefined)).toBe(true);
    expect(withinTolerance(10.1, 10, undefined)).toBe(false);
  });
  it("requires exact equality for kind 'none'", () => {
    expect(withinTolerance(10, 10, { kind: "none" })).toBe(true);
    expect(withinTolerance(10.1, 10, { kind: "none" })).toBe(false);
  });
  it("applies an absolute tolerance", () => {
    expect(withinTolerance(10.3, 10, { kind: "absolute", value: 0.5 })).toBe(true);
    expect(withinTolerance(10.6, 10, { kind: "absolute", value: 0.5 })).toBe(false);
  });
  it("treats a missing absolute tolerance value as 0", () => {
    expect(withinTolerance(10, 10, { kind: "absolute" })).toBe(true);
    expect(withinTolerance(10.1, 10, { kind: "absolute" })).toBe(false);
  });
  it("applies a relative tolerance", () => {
    expect(withinTolerance(1005, 1000, { kind: "relative", value: 0.01 })).toBe(true);
    expect(withinTolerance(1050, 1000, { kind: "relative", value: 0.01 })).toBe(false);
  });
  it("treats a missing relative tolerance value as 0", () => {
    expect(withinTolerance(1000, 1000, { kind: "relative" })).toBe(true);
    expect(withinTolerance(1001, 1000, { kind: "relative" })).toBe(false);
  });
  it("applies a range tolerance with explicit min/max", () => {
    expect(withinTolerance(58.7, 58.7, { kind: "range", min: 58.65, max: 58.75 })).toBe(true);
    expect(withinTolerance(58.8, 58.7, { kind: "range", min: 58.65, max: 58.75 })).toBe(false);
  });
  it("falls back to canonical for a missing range min/max", () => {
    expect(withinTolerance(58.7, 58.7, { kind: "range", max: 58.75 })).toBe(true);
    expect(withinTolerance(58.6, 58.7, { kind: "range", max: 58.75 })).toBe(false);
    expect(withinTolerance(58.7, 58.7, { kind: "range", min: 58.65 })).toBe(true);
    expect(withinTolerance(58.8, 58.7, { kind: "range", min: 58.65 })).toBe(false);
  });
});
