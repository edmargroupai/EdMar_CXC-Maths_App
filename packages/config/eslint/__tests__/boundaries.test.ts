// P02 acceptance criterion: "eslint-plugin-boundaries rejects a packages ->
// apps import in a test fixture." This runs the real boundaries.js config
// (the one every workspace's eslint.config.js spreads in) against a small
// fixture project under __fixtures__/boundaries-violation/, and asserts:
//   - a packages/* file importing apps/mobile/* is flagged, and
//   - an apps/mobile/* file importing packages/* (the allowed direction) is not.
import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";
import path from "node:path";
import boundariesConfig from "../boundaries.js";

const fixturesRoot = path.join(__dirname, "..", "__fixtures__", "boundaries-violation");

function makeLinter() {
  // eslint-plugin-boundaries resolves its element patterns against
  // `boundaries/root-path`, which does NOT default to the ESLint instance's
  // `cwd` option — it must be set explicitly, or every file resolves as
  // "unknown" and the dependencies rule silently skips it.
  const rootedConfig = boundariesConfig.map((c) => ({
    ...c,
    settings: { ...c.settings, "boundaries/root-path": fixturesRoot },
  }));
  return new ESLint({
    cwd: fixturesRoot,
    overrideConfigFile: true,
    overrideConfig: rootedConfig,
  });
}

describe("§2.2 dependency rules — packages/* must never depend on apps/*", () => {
  it("flags a packages/* file importing from apps/mobile/*", async () => {
    const eslint = makeLinter();
    const results = await eslint.lintFiles(["packages/types/violating.ts"]);
    const boundaryErrors = results
      .flatMap((r) => r.messages)
      .filter((m) => m.ruleId === "boundaries/dependencies");

    expect(boundaryErrors.length).toBeGreaterThan(0);
  });

  it("does not flag apps/mobile/* importing packages/* (the allowed direction)", async () => {
    const eslint = makeLinter();
    const results = await eslint.lintFiles(["apps/mobile/valid-consumer.ts"]);
    const boundaryErrors = results
      .flatMap((r) => r.messages)
      .filter((m) => m.ruleId === "boundaries/dependencies");

    expect(boundaryErrors).toHaveLength(0);
  });
});
