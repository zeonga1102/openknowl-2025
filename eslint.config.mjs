import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ['**/*.test.ts'],
  },
  {
    rules: {
      semi: "error",
      indent: ["error", 2,
        {
          SwitchCase: 1,
          ignoredNodes: ["PropertyDefinition[decorators]"]
        }
      ]
    }
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
]);
