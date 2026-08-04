import { readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts'])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage'])

/**
 * Recursively collect all source files in a directory tree, skipping common
 * non-source directories (node_modules, .git, dist, etc.).
 *
 * @param target - The current directory to scan.
 * @param base - The base directory for relative path calculation.
 * @param files - The array to populate with absolute file paths.
 */
export function collectFiles(target: string, base: string, files: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(target)
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(target, entry)
    try {
      const stat = statSync(full)
      if (stat.isDirectory()) {
        collectFiles(full, base, files)
      } else if (SOURCE_EXTS.has(extname(entry))) {
        files.push(full)
      }
    } catch {}
  }
}
