/**
 * @see https://bit.dev/reference/jest/jest-config
 */
const { jestConfig } = require('@teambit/react.react-env')
// const {
//   generateNodeModulesPattern,
// } = require('@teambit/dependencies.modules.packages-excluder');

const packagesToExclude = ['a-package-to-exclude']

/**
 * by default, jest excludes all node_modules from the transform (compilation) process.
 * the following config excludes all node_modules, except for Bit components, style modules, and the packages that are listed.
 */
module.exports = {
  ...jestConfig,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['node_modules', 'dist', '.cache'],
  rootDir: '.',
  testEnvironment: 'jsdom',
  // transformIgnorePatterns: [
  //   '^.+.module.(css|sass|scss)$',
  //   generateNodeModulesPattern({
  //     packages: packagesToExclude,
  //     excludeComponents: true,
  //   }),
  // ],
  moduleNameMapper: {
    '^@intershare/utils.general$': '<rootDir>/galacfetch/utils/general',
    '^@intershare/hooks.indexdb$': '<rootDir>/galacfetch/hooks/indexdb',
    '^ipfsgalacfetchclient$': '<rootDir>/galacfetch/ipfsgalacfetchclient',
    '^@intershare/hooks.local-ipfs-file-manager$':
      '<rootDir>/galacfetch/hooks/local-ipfs-file-manager',
    '^@intershare/hooks.remote-ipfs-file-manager$':
      '<rootDir>/galacfetch/hooks/remote-ipfs-file-manager',
    '^@intershare/hooks.remote-ipfs-file-integrity$':
      '<rootDir>/galacfetch/hooks/remote-ipfs-file-integrity',
    '^@intershare/hooks.secure-connect-manager$':
      '<rootDir>/galacfetch/hooks/secure-connect-manager',
    '^@intershare/hooks.web-rtc-local-share$':
      '<rootDir>/galacfetch/hooks/web-rtc-local-share',
  },
}
