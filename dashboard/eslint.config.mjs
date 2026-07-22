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
      // Matches backend/eslint.config.mjs: loosely-typed API glue code is a
      // pragmatic tradeoff here, not worth retyping wholesale.
      "@typescript-eslint/no-explicit-any": "off",
      // New React Compiler rule flags every fetch-on-mount effect; this
      // codebase's data fetching predates it. Downgrade until fetching is
      // migrated to a data library, rather than disable-commenting each site.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
