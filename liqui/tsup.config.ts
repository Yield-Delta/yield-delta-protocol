import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  tsconfig: './tsconfig.build.json',
  sourcemap: process.env.NODE_ENV === 'development',
  clean: false,
  format: ['esm'],
  dts: false,
  splitting: true,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  external: [
    'dotenv',
    'fs',
    'path',
    'https',
    'http',
    'zod',
    '@elizaos/core',
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-sql',
    '@elizaos/plugin-sei-yield-delta',
    'react',
    'react-dom',
  ],
});
