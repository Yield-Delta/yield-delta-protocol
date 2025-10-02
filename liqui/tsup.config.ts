import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  tsconfig: './tsconfig.build.json',
  sourcemap: process.env.NODE_ENV === 'development',
  clean: false,
  format: ['esm'],
  dts: false,
  splitting: false,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  bundle: true,
  external: [
    'fs',
    'path',
    'https',
    'http',
    'crypto',
    'os',
    'util',
    'events',
  ],
});
