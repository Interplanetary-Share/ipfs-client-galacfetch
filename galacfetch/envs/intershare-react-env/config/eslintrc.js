/**
 * @see https://bit.dev/reference/eslint/eslint-config
 */
module.exports = {
  extends: [require.resolve('@teambit/react.react-env/config/eslintrc')],
  rules: {
    // disable no-param-reassign
    'no-param-reassign': 'off',
    // disable @typescript-eslint/no-use-before-define
    '@typescript-eslint/no-use-before-define': 'off',
    // disable no-await-in-loop
    'no-await-in-loop': 'off',
    // disable no-restricted-syntax
    'no-restricted-syntax': 'off',
  },
}
