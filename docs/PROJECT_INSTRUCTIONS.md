# EdMar CXC Mathematics — Project Instructions

**Read this file first, every session, before touching code.**

Then read `docs/MASTER_BLUEPRINT.md` (the sections relevant to the phase at hand) and
`docs/TECHNICAL_BUILD_SPEC.md` (the sections named in the phase definition, §32). This file
is a condensed operating summary — the two documents above are the source of truth and win
on any conflict.

---

## Current phase

**P02 — Shared packages skeleton** (`@edmar/types`, `@edmar/design` tokens).
P01 — Repository foundation — is complete. See §32 of the Technical Build Spec for the full
22-phase plan and acceptance criteria. Do not start a phase out of order; the dependency
graph in §32.1 is binding.

---

## The five invariants (never violate; a violation is a design bug, not a trade-off)

- **I-1 — No AI on the student path.** No screen a student can reach may cause a
  language-model call, directly or transitively. Enforced by `scripts/check-no-ai-in-mobile.sh`.
- **I-2 — Nothing reaches a student unapproved.** The student app reads only rows whose
  status is `published`, enforced in Row Level Security — never in application logic.
- **I-3 — Answer checking is deterministic and local.** Evaluated on-device against a
  pre-computed accepted-answer specification. The server re-derives correctness on sync and
  is authoritative for progress.
- **I-4 — Content is immutable once published; corrections are versions.** A published
  `question_version` is never edited in place.
- **I-5 — Every AI-touched artefact carries provenance.** Model, prompt version, run,
  reviewer, timestamp.

## The fifteen decisions (D-01…D-15 — do not re-litigate; see spec §0.6 for rationale)

| ID   | Decision                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Mathematics is pre-rendered to SVG at publish time (MathJax v3, pipeline); client ships no math engine                       |
| D-02 | LaTeX source retained alongside every render, restricted allowlist                                                           |
| D-03 | Rendered math stored content-addressed in `math_renders`, keyed by `sha256(latex + style)`                                   |
| D-04 | Monorepo: pnpm workspaces + Turborepo                                                                                        |
| D-05 | Question selection is a Postgres `SECURITY DEFINER` function over Supabase RPC, with its own `caller = auth.uid()` assertion |
| D-06 | Answer validation runs identically on device and server from one package, `@edmar/answer-core`                               |
| D-07 | Symbolic verification: SymPy (Python, pipeline) + mathjs (TypeScript, client)                                                |
| D-08 | Entitlement enforced inside RLS via a `SECURITY DEFINER` helper                                                              |
| D-09 | Free-tier daily counters are server-authoritative rows, not device counters                                                  |
| D-10 | Expo Router (mobile) / Next.js App Router (admin)                                                                            |
| D-11 | TanStack Query (server state) + Zustand (ephemeral session state) + MMKV (content cache) + expo-secure-store (tokens)        |
| D-12 | No GraphQL, no custom API gateway, no Redis, no separate queue service in V1                                                 |
| D-13 | Attempts are append-only and immutable; all progress is derived and recomputable                                             |
| D-14 | Content published to students is a single denormalised JSONB payload assembled at publish time                               |
| D-15 | Database identifiers are `snake_case`, TypeScript is `camelCase`; conversion happens in **one** place, `packages/api-client` |

## Naming conventions (D-15)

- Postgres: `snake_case` tables/columns, `_id` suffix for FKs, `_at` suffix for timestamps.
- TypeScript: `camelCase` for variables/properties, `PascalCase` for types/components.
- The snake↔camel boundary crossing happens **only** in `packages/api-client/src/case.ts`.
  Never hand-roll a case conversion elsewhere.
- Use the exact table, column, route, function and type names given in the spec. Do not
  rename for taste.

## Forbidden (§38.1 — CI-enforced where a script exists)

1. Never build a student-facing chatbot.
2. Never use an LLM to check a student's answer.
3. Never put a secret in client code (§25.4 list is exhaustive).
4. Never bypass RLS; no service-role key in a client bundle.
5. Never hard-code question data in a React component.
6. Never hard-code premium permissions in a screen — `useEntitlement()` / `<PremiumGate>` only.
7. Never invent CXC curriculum — codes/statements come from the seeded taxonomy only.
8. Never invent a mathematical answer — unverified content does not publish.
9. Never auto-publish AI-generated content.
10. Never store mathematics only as plain text — LaTeX + a `math_renders` row.
11. Never destroy LaTeX or worked-solution content during migration.
12. Never add a dependency not named in the spec without recording why in `docs/decisions/`.
13. Never make an unrelated change in a phase.
14. Never skip a test, a migration or a validation step.
15. Never widen a tolerance to make a test pass.
16. Never display a predicted CSEC grade.
17. Never mutate a published `question_version`.
18. Never return a raw Postgres error to a client.
19. Never copy production student data to staging.
20. Never publish a question whose `rights_status` is unresolved.

## Always (§38.2)

Prefer deterministic logic. Move expensive work to authoring time. Use the spec's exact
names. Write the test first. Fail loudly and specifically. Make the invalid state
unrepresentable. Suspend a suspect question first, investigate second. Record provenance for
anything a model touched. Ask one specific question when the spec is silent.

## The two rules that resolve every disagreement

- **If the spec and the code disagree, the spec wins.** Raise it — do not silently diverge.
- **If the spec is silent, ask rather than invent.**

## Per-session sequence (§31.2)

1. Read this file.
2. Read the relevant Master Blueprint sections for this phase.
3. Read the Technical Build Spec sections named in the phase definition (§32).
4. Read the existing code the phase touches (§33 file map).
5. **Plan**: restate the phase objective, the files to create/modify, the acceptance
   criteria. Ask if anything is ambiguous. Do not write code until the plan is stated.
6. Implement **one phase only**, using the spec's exact names.
7. Test: `pnpm lint && pnpm typecheck && pnpm test`, plus `pnpm test:db` if the phase
   touches the database, plus `pnpm check:invariants`.
8. Fix until green. Never disable a test or widen a tolerance to make it pass.
9. Review the full diff: no secrets, no AI import in mobile, no service-role key in a
   client bundle, no hard-coded question data, no premium logic outside
   `useEntitlement`/`PremiumGate`.
10. Commit with a Conventional Commit message scoped to the phase.
11. Restate the acceptance criteria and how each was verified. If any is unmet, stop and
    report — do not move on.
12. Only then, begin the next phase.
