import rootConfig from '../../eslint.config.mjs';
import globals from 'globals';

/**
 * Web app ESLint config. Inherits the monorepo root (typescript-eslint +
 * prettier) rules and adds browser globals + JSX-aware settings.
 *
 * Note: we intentionally do not pull `eslint-config-next` here — it currently
 * pins ESLint 8, which conflicts with the repo-wide ESLint 9 flat config.
 * Next.js's build performs its own React/Next checks.
 */
export default [
  ...rootConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
