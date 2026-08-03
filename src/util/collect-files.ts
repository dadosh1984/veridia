import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage']);

export function collectFiles(target: string, base: string, files: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(target);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(target, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        collectFiles(full, base, files);
      } else if (SOURCE_EXTS.has(extname(entry))) {
        files.push(full);
      }
    } catch {
      continue;
    }
  }
}
