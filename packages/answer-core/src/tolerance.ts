// §10.7 — shared tolerance evaluation, used by every numeric-valued validator.
import type { AnswerSpec } from "@edmar/types";

export function withinTolerance(value: number, canonical: number, tolerance: AnswerSpec["tolerance"]): boolean {
  if (!tolerance || tolerance.kind === "none") return value === canonical;
  if (tolerance.kind === "absolute") return Math.abs(value - canonical) <= (tolerance.value ?? 0);
  if (tolerance.kind === "relative") {
    return Math.abs(value - canonical) <= Math.abs(canonical) * (tolerance.value ?? 0);
  }
  const min = tolerance.min ?? canonical;
  const max = tolerance.max ?? canonical;
  return value >= min && value <= max;
}
