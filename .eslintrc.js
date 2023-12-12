module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-console': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-case-declarations': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'prefer-promise-reject-errors': 'off',
  },
}
