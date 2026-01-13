import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,

  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },

  esbuildOptions(options, context) {
    // In CJS builds, make `module.exports = <default export>`
    if (context.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default;',
      };
    }
  },
});
