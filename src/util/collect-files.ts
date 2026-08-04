import { lstatSync, readdirSync, realpathSync } from 'node:fs'
import { extname, join } from 'node:path'

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts'])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage'])

/**
 * Recursively collect all source files in a directory tree, skipping common
 * non-source directories (node_modules, .git, dist, etc.) and symlinked
 * directories to avoid unbounded recursion through symlink cycles.
 *
 * @param target - The current directory to scan.
 * @param base - The base directory for relative path calculation.
 * @param files - The array to populate with absolute file paths.
 */
export function collectFiles(target: string, _base: string, files: string[]): void {
  collectFilesRecursive(target, files, new Set())
}

function collectFilesRecursive(target: string, files: string[], visited: Set<string>): void {
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
      const stat = lstatSync(full)
      if (stat.isSymbolicLink()) continue
      if (stat.isDirectory()) {
        const real = realpathSync(full)
        if (visited.has(real)) continue
        visited.add(real)
        collectFilesRecursive(full, files, visited)
      } else if (SOURCE_EXTS.has(extname(entry))) {
        files.push(full)
      }
    } catch {}
  }
}
