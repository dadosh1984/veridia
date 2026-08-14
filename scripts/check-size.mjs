#!/usr/bin/env node
// Bundle-size guard: fails if any dist entry exceeds the configured limit.
// Zero deps. Runs in CI after `pnpm build`.
// Usage: node scripts/check-size.mjs (override with SIZE_LIMIT_KB env).

import { gzipSync } from 'node:zlib'
import { readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const limitKb = Number(process.env.SIZE_LIMIT_KB ?? 250)
const targets = [
  { name: 'CLI bundle', path: 'dist/cli/index.mjs' },
  { name: 'MCP bundle', path: 'dist/mcp/index.mjs' },
]

let failed = false
for (const t of targets) {
  const full = join(root, t.path)
  let buf
  try {
    buf = readFileSync(full)
  } catch (err) {
    console.error(`✗ ${t.name}: missing (${t.path}) — run \`pnpm build\` first`)
    failed = true
    continue
  }
  const sizeKb = statSync(full).size / 1024
  const gzipKb = gzipSync(buf).length / 1024
  const ok = gzipKb <= limitKb
  console.log(`${ok ? '✓' : '✗'} ${t.name}: raw ${sizeKb.toFixed(1)} KB / gzip ${gzipKb.toFixed(1)} KB (limit ${limitKb} KB)`)
  if (!ok) failed = true
}

if (failed) {
  console.error(`\nBundle size check failed (limit=${limitKb} KB gzip).`)
  process.exit(1)
}
console.log(`\nAll bundles within ${limitKb} KB gzip.`)
