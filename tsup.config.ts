import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  external: [
    'commander',
    'inquirer',
    'chalk',
    'ora',
    'fs-extra',
    'ejs',
    'semver',
    'execa',
    'listr2',
    'simple-git',
    'node-fetch',
    'tar',
    'yaml',
    'express',
    'socket.io',
    'open'
  ],

  esbuildOptions(options) {
    options.conditions = ['node']
  }
})