// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Root flat ESLint config shared by every workspace package.
 * App-specific rules (e.g. Next.js) are layered in each app's own config.
 */
export default tseslint.config(
  {
    // Global ignores — build output & generated files.
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Config & script files may use Node globals and console freely.
  {
    files: ['**/*.config.{js,mjs,cjs,ts}', '**/scripts/**'],
    rules: { 'no-console': 'off' },
  },
  // NestJS relies on runtime type metadata emitted by decorators
  // (`emitDecoratorMetadata`). Forcing `import type` on decorated members
  // erases that metadata, so we disable the rule for the backend.
  {
    files: ['apps/api/**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'off' },
  },
  // Prettier must be last to disable stylistic rules it owns.
  prettier,
);
