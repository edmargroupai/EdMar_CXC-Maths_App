const expoConfig = require("eslint-config-expo/flat");
const boundaries = require("@edmar/config/eslint/boundaries");

module.exports = [
  ...expoConfig,
  ...boundaries,
  {
    ignores: ["dist/*", ".expo/*"],
  },
];
