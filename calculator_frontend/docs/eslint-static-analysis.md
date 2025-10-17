# ESLint Static Analysis Report

Date: ${new Date().toISOString()}

Scope: calculator_frontend (React)

Tool: ESLint v8.57.1, flat-config mode (eslint.config.mjs)

Command:
- `npx eslint . -f json -o eslint-report.json`

Summary:
- Errors: Jest globals missing in test files (describe not defined).
- Warnings: None.
- Deprecated rule notice was observed in runner output (no-extra-semi, no-mixed-spaces-and-tabs), but not referenced directly in config.

Key Findings:
1) Test Globals Missing
- src/__tests__/calcEngine.memory.test.js: 'describe' is not defined
- src/__tests__/calcEngine.test.js: 'describe' is not defined
Cause: Jest environment not enabled in ESLint for test files.

Recommended Remediations:
- In eslint.config.mjs, add an override for test files:
  - files: ["**/__tests__/**/*.{js,jsx}", "**/*.{test,spec}.{js,jsx}"]
  - env: { jest: true }
  - Optionally include plugins: ["jest", "testing-library"]

2) Dual ESLint Configs (Potential Drift)
- package.json contains "eslintConfig": { "extends": "react-app" } (CRA).
- Project uses eslint.config.mjs (flat-config).
Action: Standardize on flat-config. Add npm scripts:
- "lint": "eslint ."
- "lint:fix": "eslint . --fix"

3) Non-lint test failure risk:
- src/App.test.js asserts for "learn react" which is not present in current UI.
Action: Update test to assert visible UI (Calculator, theme toggle) to reflect application.

Suggested eslint.config.mjs augmentation (for a future PR):

```js
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        document: true,
        window: true,
        test: true,
        expect: true,
        // Add describe for tests if not using env override:
        // describe: true
      }
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "React|App" }]
    }
  },
  pluginJs.configs.recommended,
  {
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error"
    }
  },
  // New: test overrides
  {
    files: ["**/__tests__/**/*.{js,jsx}", "**/*.{test,spec}.{js,jsx}"],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        beforeEach: true,
        afterEach: true
      }
    }
  }
];
```

If adopting Prettier, add:
- devDependencies: prettier, eslint-config-prettier
- .prettierrc.json with your preferred style
- Extend ESLint with "prettier" to avoid rule conflicts.

CI Recommendations:
- Add "npm run lint" to CI workflow and fail on errors.
- Persist artifacts: eslint-report.json and this markdown report.

Traceability:
- Work Item: Simple Calculator App (frontend)
- GxP: Ensures code consistency and readability. Aids review and validation with clear linter signals.
