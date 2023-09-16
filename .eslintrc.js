module.exports = {
  extends: ['@teambit/eslint-config-bit-react'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // imports sorting
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
  },
}
