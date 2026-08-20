// @edmar/config/eslint/boundaries — enforces §2.2 dependency rules:
//   - apps/* may depend on packages/*. packages/* may never depend on apps/*.
//   - apps/mobile may depend only on: types, answer-core, api-client, design, content-schema.
//   - apps/pipeline is unrestricted (not bundled into either client app).
// Intended to be spread into the root `eslint.config.js` once apps/* exist (P13+, P19).
// Written against the eslint-plugin-boundaries v7 native config shape (the
// `boundaries/dependencies` rule + object-based element selectors) — the v4/v5
// flat `{ from: "type", allow: ["type"] }` shorthand is a deprecated legacy
// syntax under v7 that this plugin version does not reliably enforce.
const boundaries = require("eslint-plugin-boundaries");

const allPackageTypes = [
  "pkg-types",
  "pkg-answer-core",
  "pkg-content-schema",
  "pkg-api-client",
  "pkg-design",
  "pkg-config",
];

const mobileAllowedTypes = [
  "pkg-types",
  "pkg-answer-core",
  "pkg-api-client",
  "pkg-design",
  "pkg-content-schema",
];

const adminAllowedTypes = [...mobileAllowedTypes, "pkg-config"];

module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { boundaries },
    settings: {
      // eslint-plugin-boundaries' bundled resolver only looks for
      // .js/.mjs/.json/.node by default — without this, every extension-less
      // relative import in a .ts file resolves to "unknown" and the
      // dependencies rule silently skips it (checkUnknownLocals is off).
      "import/resolver": { node: { extensions: [".js", ".jsx", ".ts", ".tsx"] } },
      "boundaries/elements": [
        { type: "mobile", pattern: "apps/mobile/**" },
        { type: "admin", pattern: "apps/admin/**" },
        { type: "pipeline", pattern: "apps/pipeline/**" },
        { type: "pkg-types", pattern: "packages/types/**" },
        { type: "pkg-answer-core", pattern: "packages/answer-core/**" },
        { type: "pkg-content-schema", pattern: "packages/content-schema/**" },
        { type: "pkg-api-client", pattern: "packages/api-client/**" },
        { type: "pkg-design", pattern: "packages/design/**" },
        { type: "pkg-config", pattern: "packages/config/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "mobile" } },
              allow: [{ to: { element: { types: { anyOf: mobileAllowedTypes } } } }],
            },
            {
              from: { element: { type: "admin" } },
              allow: [{ to: { element: { types: { anyOf: adminAllowedTypes } } } }],
            },
            {
              // apps/pipeline is the content factory: not bundled into either
              // client app, so §2.2 leaves it unrestricted.
              from: { element: { type: "pipeline" } },
              allow: [{ to: { element: { types: { anyOf: [...allPackageTypes, "pipeline"] } } } }],
            },
            {
              // packages/* may depend on each other freely (e.g. api-client on
              // types) — the only rule §2.2 states is that packages/* may
              // never depend on apps/*, which `default: "disallow"` above
              // already guarantees since no policy here allows mobile/admin/
              // pipeline as a target for a packages/* source.
              from: { element: { types: { anyOf: allPackageTypes } } },
              allow: [{ to: { element: { types: { anyOf: allPackageTypes } } } }],
            },
          ],
        },
      ],
    },
  },
];
