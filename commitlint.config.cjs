/**
 * Conventional Commits enforcement.
 * Format: <type>(<scope>): <subject>   e.g. "feat(transactions): add cursor pagination"
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'shared',
        'api',
        'web',
        'transactions',
        'categories',
        'recurring',
        'analytics',
        'savings',
        'dashboard',
        'users',
        'auth',
        'ai',
        'infra',
        'ci',
        'deps',
        'release',
        'savings',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 100],
  },
};
