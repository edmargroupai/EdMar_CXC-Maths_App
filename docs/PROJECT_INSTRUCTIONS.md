# EdMar CXC Mathematics — Project Instructions

**Read this file first, every session, before touching code.**

Then read `docs/MASTER_BLUEPRINT.md` (the sections relevant to the phase at hand) and
`docs/TECHNICAL_BUILD_SPEC.md` (the sections named in the phase definition, §32). This file
is a condensed operating summary — the two documents above are the source of truth and win
on any conflict.

---

## Current phase

**P08 — `@edmar/answer-core`** (`packages/answer-core/src/*`, fixtures, tests). §10 in full for
the MVP answer types: `option_id`, `option_set`, `boolean`, the numeric family, `fraction`,
`mixed_number`, `ratio`, `currency`, `with_units`, `coordinate`, `expression` Tier 1. This is
D-06's shared package — the same validation logic runs on-device (I-3) and server-side
(`fn_validate_answer`, P09), so it must be pure TypeScript with zero Postgres/React Native
dependency. **Accept: 100% branch coverage; every case in §27.2 passes.** No database work in
this phase — pure logic, read §10 (answer validation engine) and §27.2 closely first.

**A real spec contradiction was found and resolved in P07, worth knowing before P09 writes
`fn_validate_answer`**: §5.1's `has_role()` array ranks `support` *above* `reviewer`
(`['student','viewer','reviewer','support','curriculum_admin','content_admin','super_admin']`),
so `has_role('reviewer')` is true for a support caller — but §21.3 says support has "**No
content rights**", and §27.4's own example test expects a support caller blocked from editing
`question_versions`. Added `is_content_role()` (`reviewer`/`curriculum_admin`/`content_admin`/
`super_admin`, explicitly excluding `support`) and used it for every content-authoring policy;
`has_role('support')` is still correct and unchanged everywhere else (attempts, entitlements,
practice_sessions visibility, `question_reports` resolution — support genuinely owns reports
per §21.3). If P09 or the admin console (P19) reaches for a "can this role touch content"
check, use `is_content_role()`, not `has_role('reviewer')`.

**Also found in P07**: `supabase/tests/rls/*` had to use `is_empty($$ ... returning 1 $$, ...)`
rather than `throws_ok(..., '42501', ...)` for most negative write cases. In real Postgres RLS,
a missing/failing `USING` clause on UPDATE/DELETE **silently matches zero rows** — it does not
raise an error. Only a `WITH CHECK` failure (the *new* row is invalid) throws 42501. §27.4's
worked examples use `throws_ok` for some of these cases; where that didn't match verified
behavior against the real local instance, the test was written to match reality, not the
example's exact shape.

**Outstanding human task, on the critical path for P05 → P12 (question content), not blocking
schema work**: 44 of 159 V2027 specific objectives are flagged `needs_human_review = true`
(two-column PDF extraction bled the CONTENT/EXPLANATORY NOTES column into the objective text —
§0.3). A curriculum reviewer must correct `content/taxonomy/csec_2027_taxonomy_seed.json` and
re-run `node scripts/gen-taxonomy-seed.js` before any question is mapped against one of those 44
objectives. Query the current list with:
`select code, statement from specific_objectives where needs_human_review order by code;`

**Open item raised during P04, not in the spec's own tracking table**:
**[CXC-DISCREPANCY-02]** — §0.3's per-topic Paper 02 mark table gives Number Theory and
Computation + Consumer Arithmetic a combined 9 marks with no stated per-topic split, and 9 does
not divide evenly across the 2 topics. `topics.paper02_marks` is left `NULL` for both rather than
guessing a split (4/5, 5/4, or a proportional split by objective count all being invented, not
sourced). Resolve alongside the `needs_human_review` objectives, by the same curriculum reviewer.

P01–P07 are complete: monorepo foundation; shared types/design packages; local Supabase running
migrations 0001 (enums), 0002 (curriculum, 3 modules/15 topics/159 V2027 objectives), 0003 (the
16-table question bank), 0004 (identity, student progress, commerce, ops — `profiles` through
`app_config`, plus `fn_handle_new_user` and the six FK constraints 0003 deferred — **all 45
tables now exist**) and 0005 (RLS: the four §5.1 helpers + `is_content_role()`, every policy in
§5.2's matrix including the §5.3 paywall, base GRANTs to `authenticated`/`service_role` that
turned out to be a P07 discovery, not something the spec called out explicitly) — 187 passing
pgTAP assertions, including a catalogue-query proof that all 45 tables have RLS enabled. Also an
out-of-sequence mobile visual preview (`apps/mobile`, two screens, done at the user's request —
see the git log for `feat(mobile): onboarding + sign-in visual preview`) and its Vercel build
config (`fix(mobile): configure Vercel build for the Expo web export`). See §32 of the Technical
Build Spec for the full 22-phase plan and acceptance criteria. Do not start a phase out of
order; the dependency graph in §32.1 is binding.

**RLS is now live on every table.** Local dev/testing as a specific actor requires
`set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<uuid>"}', true);`
before querying — see `supabase/tests/rls/policy_matrix.sql` for the pattern. Fixture setup
(inserting test data across actors) must happen as `postgres` (superuser, RLS-exempt) *before*
switching role. `anon` has zero policies anywhere by design (§5.4 rejects a public/unauthenticated
read path) — pre-registration students use Supabase anonymous sign-in, which is a real
`auth.users` row hitting RLS as `authenticated`, not the bare `anon` role.

**Source material added by the founder**: `content/sources/cxc-past-papers-answer-keys/` (28
PDFs, moved here from a loose repo-root folder the founder confirmed adding). This is
third-party CSEC past-paper answer-key material — §0.5/R-01's lowest-priority, rights-gated
source ("third-party copyright, gated on the R-01 legal decision. Ingest last, behind a feature
flag, and never publish until rights are confirmed"). Do not feed it into the pipeline (P20) or
`scripts/import-legacy.ts` (P12) ahead of a rights decision on R-01, and any question sourced
from it must carry `rights_status = 'third_party_unlicensed'` until that's resolved.

Local dev note: another Supabase project (`edmar-risepath` — the legacy prototype referenced in
§0.1) runs on this host on the default CLI ports. This project's `supabase/config.toml` is
shifted +100 (API 54421, DB 54422, Studio 54423, Inbucket 54424, Analytics 54427) to avoid the
collision — do not "fix" these back to the defaults.

Also discovered during P04: the legacy prototype source tree referenced throughout §0.1/§12 —
including `data/curriculum/jamaica/EdMar_CXC_Mathematics_Workbook_2026.pdf` (the primary MVP
content source), `CSEC_Mathematics_Syllabus_2027.pdf`, and every legacy JSON file (skill map,
diagnostic bank, lesson bank, etc.) — is present and readable at
`C:\Users\kemar\Projects\EdMar-AI\edmar_work\EdMar-AI-phase10\`. Nothing has been copied into
this repo yet; P12 (legacy import) and P20 (content pipeline) are where that happens, per §12 and
§13, each with its own field-mapping and provenance rules — do not hand-copy from there in an
unrelated phase.

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
