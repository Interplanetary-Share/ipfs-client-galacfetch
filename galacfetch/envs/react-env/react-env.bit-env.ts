/**
 * this env extends react-env version 1.0.32.
 * to inspect its config @see https://bit.cloud/teambit/react/react-env?version=1.0.32
 * */
import { ReactEnv as ReactEnv2 } from '@teambit/react.react-env'
import { Compiler } from '@teambit/compiler'
import { ReactPreview } from '@teambit/preview.react-preview'
import { EnvHandler } from '@teambit/envs'
import { Pipeline } from '@teambit/builder'
import {
  ESLintLinter,
  EslintConfigWriter,
} from '@teambit/defender.eslint-linter'
import { JestTester } from '@teambit/defender.jest-tester'
import { Tester } from '@teambit/tester'
import { Preview } from '@teambit/preview'
import { ConfigWriterList } from '@teambit/workspace-config-files'
import { BabelCompiler, BabelTask } from '@teambit/compilation.babel-compiler'
import hostDependencies from './preview/host-dependencies'
// import { webpackTransformer } from './config/webpack.config';

export class ReactEnv extends ReactEnv2 {
  /* a shorthand name for the env */
  name = 'react-env'

  // BabelCompiler
  protected babelConfigPath = require.resolve('./config/babel.config.json')

  protected tsconfigPath = require.resolve('./config/tsconfig.json')

  protected tsTypesPath = './types'

  protected jestConfigPath = require.resolve('./config/jest.config')

  protected eslintConfigPath = require.resolve('./config/eslintrc.js')

  protected eslintExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']

  protected prettierExtensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs',
    '.json',
    '.css',
    '.scss',
    '.md',
    '.mdx',
    '.html',
    '.yml',
    '.yaml',
  ]

  protected previewMounter = require.resolve('./preview/mounter')

  /* the compiler to use during development */
  compiler(): EnvHandler<Compiler> {
    /**
     * @see https://bit.dev/reference/typescript/using-typescript
     * */
    // return TypescriptCompiler.from({
    //   tsconfig: this.tsconfigPath,
    //   types: resolveTypes(__dirname, [this.tsTypesPath]),
    // })
    return BabelCompiler.from({
      babelConfig: this.babelConfigPath,
    })
  }

  /* the test runner to use during development */
  tester(): EnvHandler<Tester> {
    /**
     * @see https://bit.dev/reference/jest/using-jest
     * */
    return JestTester.from({
      config: this.jestConfigPath,
    })
  }

  /* the linter to use during development */
  linter() {
    /**
     * @see https://bit.dev/reference/eslint/using-eslint
     * */
    return ESLintLinter.from({
      tsconfig: this.tsconfigPath,
      configPath: this.eslintConfigPath,
      pluginsPath: __dirname,
      extensions: this.eslintExtensions,
    })
  }

  // /**
  //  * the formatter to use during development
  //  * (source files are not formatted as part of the components' build)
  //  * */
  // formatter() {
  //   /**
  //    * @see https://bit.dev/reference/prettier/using-prettier
  //    * */
  //   return PrettierFormatter.from({
  //     configPath: this.prettierConfigPath,
  //   })
  // }

  /**
   * generates the component previews during development and during build
   */
  preview(): EnvHandler<Preview> {
    /**
     * @see https://bit.dev/docs/react-env/component-previews
     */
    return ReactPreview.from({
      mounter: this.previewMounter,
      hostDependencies,
      // transformers: [webpackTransformer],
    })
  }

  /**
   * a set of processes to be performed before a component is snapped, during its build phase
   * @see https://bit.dev/docs/react-env/build-pipelines
   */
  build() {
    return Pipeline.from([
      // TypescriptTask.from({
      //   tsconfig: this.tsconfigPath,
      //   types: resolveTypes(__dirname, [this.tsTypesPath]),
      // }),
      BabelTask.from({
        babelConfig: this.babelConfigPath,
      }),
      // EslintTask.from({
      //   tsconfig: this.tsconfigPath,
      //   configPath: this.eslintConfigPath,
      //   pluginsPath: __dirname,
      //   extensions: this.eslintExtensions,
      // }),
      // JestTask.from({
      //   config: this.jestConfigPath,
      // }),
    ])
  }

  workspaceConfig(): ConfigWriterList {
    return ConfigWriterList.from([
      // TypescriptConfigWriter.from({
      //   tsconfig: this.tsconfigPath,
      //   types: resolveTypes(__dirname, [this.tsTypesPath]),
      // }),
      EslintConfigWriter.from({
        configPath: this.eslintConfigPath,
        tsconfig: this.tsconfigPath,
      }),
    ])
  }
}

export default new ReactEnv()
