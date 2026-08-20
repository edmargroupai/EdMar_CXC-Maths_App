// §10.5 — normalisation profiles, applied identically here and in fn_validate_answer.
import type { AnswerSpec } from "@edmar/types";

export type NormalisationProfile = AnswerSpec["normalisation"];

const MINUS_SIGNS_RE = /[−–—]/g; // −, –, —
const MULT_SIGNS_RE = /[×·]/g;
const SUPERSCRIPT_RE = /[²³ⁿ]/g;
const SUPERSCRIPT_MAP: Record<string, string> = { "²": "^2", "³": "^3", "ⁿ": "^n" };
const CURRENCY_PREFIX_RE = /^(us\$|j\$|tt\$|\$)\s*/i;
const RESTATEMENT_RE = /^(x|y|answer)\s*=\s*/i;

/** Strips a leading currency symbol ($, J$, US$, TT$). Used by currency/with_units
 * validators before the shared numeric parse — kept separate from normalise()
 * because those validators need to know *whether* a currency token was present. */
export function stripCurrencyPrefix(input: string): { value: string; hadCurrency: boolean } {
  const trimmed = input.trim();
  const m = CURRENCY_PREFIX_RE.exec(trimmed);
  if (!m) return { value: trimmed, hadCurrency: false };
  return { value: trimmed.slice(m[0].length).trim(), hadCurrency: true };
}

export function normalise(input: string, profile: NormalisationProfile): string {
  let s = input.trim();
  if (s.length === 0) return s;

  s = s.replace(MINUS_SIGNS_RE, "-");
  s = s.replace(MULT_SIGNS_RE, "*");
  s = s.replace(/\*\*/g, "^");
  s = s.replace(SUPERSCRIPT_RE, (ch) => SUPERSCRIPT_MAP[ch]!);

  if (profile !== "expression_default") {
    s = s.toLowerCase();
  }

  if (profile !== "text_default") {
    s = s.replace(RESTATEMENT_RE, "");
  }

  // Thousands-separator commas between digits ("1,000" -> "1000"). Left
  // distinct from generic whitespace collapsing so mixed-number spacing
  // ("1 3/20") is never touched.
  s = s.replace(/(\d),(?=\d)/g, "$1");

  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/^\+/, "");

  // A lone trailing decimal point ("540.") carries no precision information.
  s = s.replace(/(\d)\.$/, "$1");

  return s;
}
