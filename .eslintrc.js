module.exports = {
  // extends: ['@teambit/eslint-config-bit-react'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // consistent-return
    // 'consistent-return': 'off',
    // 'no-plusplus': 'off',
    // // @typescript-eslint/no-use-before-define
    // '@typescript-eslint/no-use-before-define': 'off',
    // 'import/no-cycle': 'off',
    // 'no-return-await': 'off',
    // '@typescript-eslint/no-shadow': 'off',
    // imports sorting
    'import/order': [
      'warning',
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
