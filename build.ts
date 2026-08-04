import { $ } from 'bun'

const outDir = 'dist'

await $`rm -rf ${outDir}`

const result = await Bun.build({
  entrypoints: ['src/cli/index.ts', 'src/mcp/index.ts'],
  outdir: outDir,
  target: 'node',
  format: 'esm',
  sourcemap: 'external',
  minify: false,
  splitting: true,
})

if (!result.success) {
  console.error('Build failed')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

