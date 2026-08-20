// Fixture only — proves eslint-plugin-boundaries rejects a packages -> apps
// import (§2.2: "packages/* may never depend on apps/*"). See
// packages/config/eslint/__tests__/boundaries.test.ts.
import { mobileThing } from "../../apps/mobile/thing";

export const x = mobileThing;
