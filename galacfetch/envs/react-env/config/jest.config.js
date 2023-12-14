/**
 * @see https://bit.dev/reference/jest/jest-config
 */
// const { jestConfig } = require('@teambit/react.react-env');
// const {
//   generateNodeModulesPattern,
// } = require('@teambit/dependencies.modules.packages-excluder');

// const packagesToExclude = ['a-package-to-exclude'];

/**
 * by default, jest excludes all node_modules from the transform (compilation) process.
 * the following config excludes all node_modules, except for Bit components, style modules, and the packages that are listed.
 */
module.exports = {
  // ...jestConfig,

  // testRegex: '.*\\.spec\\.ts',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['node_modules', 'dist', '.cache'],
  rootDir: '.',
  testEnvironment: 'jsdom',
  // setupFilesAfterEnv: ['./setup-jest.ts'],
  moduleNameMapper: {
    '^@intershare/utils.general$': '<rootDir>/galacfetch/utils/general',
    '^@intershare/hooks.indexdb$': '<rootDir>/galacfetch/hooks/indexdb',
    '^@intershare/hooks.ipfs-client$': '<rootDir>/galacfetch/hooks/ipfs-client',
    '^@intershare/hooks.local-ipfs-file-manager$':
      '<rootDir>/galacfetch/hooks/local-ipfs-file-manager',
    '^@intershare/hooks.remote-ipfs-file-manager$':
      '<rootDir>/galacfetch/hooks/remote-ipfs-file-manager',
    '^@intershare/hooks.remote-ipfs-file-integrity$':
      '<rootDir>/galacfetch/hooks/remote-ipfs-file-integrity',
  },

  // transformIgnorePatterns: [
  //   '^.+.module.(css|sass|scss)$',
  //   generateNodeModulesPattern({
  //     packages: packagesToExclude,
  //     excludeComponents: true,
  //   }),
  // ],
}
