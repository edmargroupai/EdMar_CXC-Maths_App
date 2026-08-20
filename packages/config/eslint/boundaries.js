// @edmar/config/eslint/boundaries — enforces §2.2 dependency rules:
//   - apps/* may depend on packages/*. packages/* may never depend on apps/*.
//   - apps/mobile may depend only on: types, answer-core, api-client, design, content-schema.
//   - apps/pipeline is unrestricted (not bundled into either client app).
// Intended to be spread into the root `eslint.config.js` once apps/* exist (P13+, P19).
const boundaries = require("eslint-plugin-boundaries");

module.exports = [
  {
    plugins: { boundaries },
    settings: {
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
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "mobile",
              allow: [
                "pkg-types",
                "pkg-answer-core",
                "pkg-api-client",
                "pkg-design",
                "pkg-content-schema",
              ],
            },
            {
              from: "admin",
              allow: [
                "pkg-types",
                "pkg-answer-core",
                "pkg-api-client",
                "pkg-design",
                "pkg-content-schema",
              ],
            },
            { from: "pipeline", allow: ["*"] },
            {
              from: [
                "pkg-types",
                "pkg-answer-core",
                "pkg-content-schema",
                "pkg-api-client",
                "pkg-design",
                "pkg-config",
              ],
              disallow: ["mobile", "admin", "pipeline"],
            },
          ],
        },
      ],
    },
  },
];
