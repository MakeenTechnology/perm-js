import terser from '@rollup/plugin-terser';
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const banner = `/*!
 * Perm - Tiny Cross-Browser Permissions Wrapper
 * Version: ${process.env.npm_package_version || '1.0.0'}
 * License: MIT
 */`;

// Plugin to copy TypeScript definitions
const copyTypesPlugin = {
  name: 'copy-types',
  writeBundle: async () => {
    if (!existsSync('dist')) {
      await mkdir('dist', { recursive: true });
    }
    await copyFile('src/perm.d.ts', 'dist/perm.d.ts');
  }
};

export default [
  // ES Module build
  {
    input: 'src/perm.js',
    output: {
      file: 'dist/perm.esm.js',
      format: 'es',
      banner
    },
    plugins: [copyTypesPlugin]
  },
  
  // ES Module build (minified)
  {
    input: 'src/perm.js',
    output: {
      file: 'dist/perm.esm.min.js',
      format: 'es',
      banner
    },
    plugins: [
      terser({
        format: {
          comments: /^!/
        }
      })
    ]
  },

  // UMD build
  {
    input: 'src/perm.js',
    output: {
      file: 'dist/perm.umd.js',
      format: 'umd',
      name: 'Perm',
      banner,
      exports: 'named'
    },
    plugins: []
  },

  // UMD build (minified)
  {
    input: 'src/perm.js',
    output: {
      file: 'dist/perm.umd.min.js',
      format: 'umd',
      name: 'Perm',
      banner,
      exports: 'named'
    },
    plugins: [
      terser({
        format: {
          comments: /^!/
        }
      })
    ]
  }
]; 