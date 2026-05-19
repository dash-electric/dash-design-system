import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Docs site is prose-heavy; escaping every apostrophe hurts
      // readability without adding XSS safety (React already escapes
      // text content). Disable globally.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
