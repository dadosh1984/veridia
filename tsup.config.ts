import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'cli/index': 'src/cli/index.ts',
    'mcp/index': 'src/mcp/index.ts',
  },
  format: 'esm',
  target: 'es2022',
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: true,
  minify: false,
  bundle: true,
  platform: 'node',
  shims: true,
})
