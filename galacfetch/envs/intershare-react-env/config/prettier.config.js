/**
 * @see https://bit.dev/reference/prettier/prettier-config
 */
const { prettierConfig } = require('@teambit/react.react-env');

module.exports = {
  ...prettierConfig,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  endOfLine: 'lf',
};
