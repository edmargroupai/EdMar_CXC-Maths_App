// §10.9 — Tier 1 runtime algebraic-expression equivalence: parse with mathjs,
// collect like terms, canonicalise commutative operand order, compare.
//
// Deliberately does NOT distribute/expand (mathjs's default `simplify` ruleset
// doesn't either) — a factorised form and its expanded form get different
// canonical keys, which is what lets `spec.form.specifiedForm = "factorised"`
// questions reject an expanded answer without any extra guard. Tier 2
// (`simplify(a - b) === 0` + numeric spot-check) is V1 scope, not implemented here.
import { simplify, type MathNode } from "mathjs";

interface GenericMathNode {
  type: string;
  fn?: string | { name: string };
  args?: MathNode[];
  name?: string;
  value?: unknown;
}

function asGeneric(node: MathNode): GenericMathNode {
  return node as unknown as GenericMathNode;
}

// mathjs's `simplify()` output never contains a ParenthesisNode — parenthesisation
// only reappears when the tree is later rendered via toString() — so this
// walk doesn't need to unwrap one.
function canonicalKey(node: MathNode): string {
  const n = asGeneric(node);
  if (n.type === "ConstantNode") return String(n.value);
  if (n.type === "SymbolNode") return n.name!;
  if (n.type === "OperatorNode" && n.args && typeof n.fn === "string") {
    const fn = n.fn;
    const args = n.args;
    if (fn === "add" || fn === "multiply") {
      const parts = args.map(canonicalKey).sort();
      return `(${fn}:${parts.join(",")})`;
    }
    if (args.length === 2) {
      return `(${fn}:${canonicalKey(args[0]!)},${canonicalKey(args[1]!)})`;
    }
    if (args.length === 1) {
      return `(${fn}:${canonicalKey(args[0]!)})`;
    }
  }
  if (n.type === "FunctionNode" && n.args && typeof n.fn === "object") {
    return `(${n.fn.name}:${n.args.map(canonicalKey).join(",")})`;
  }
  return node.toString();
}

/** Parses and canonicalises one side. Returns null on a parse error (unparseable input). */
export function expressionCanonicalKey(expr: string): string | null {
  try {
    return canonicalKey(simplify(expr));
  } catch {
    return null;
  }
}

/** True/false for a definite comparison, null if either side fails to parse. */
export function expressionsEquivalent(a: string, b: string): boolean | null {
  const ka = expressionCanonicalKey(a);
  const kb = expressionCanonicalKey(b);
  if (ka === null || kb === null) return null;
  return ka === kb;
}
