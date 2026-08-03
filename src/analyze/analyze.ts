import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import type { AnalyzeResult, Finding } from './types.js';
import { ALL_CHECKERS } from './checks.js';

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage']);

function collectFiles(target: string, base: string, files: string[]): void {
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

export function runAnalysis(target: string): AnalyzeResult {
  const resolved = join(target);
  const files: string[] = [];
  collectFiles(resolved, resolved, files);

  const allFindings: Finding[] = [];
  for (const file of files) {
    let content: string;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const relPath = relative(resolved, file).replace(/\\/g, '/');
    for (const checker of ALL_CHECKERS) {
      const findings = checker(relPath, content);
      allFindings.push(...findings);
    }
  }

  const errors = allFindings.filter((f) => f.severity === 'ERROR').length;
  const warnings = allFindings.filter((f) => f.severity === 'WARNING').length;
  const infos = allFindings.filter((f) => f.severity === 'INFO').length;

  return {
    findings: allFindings,
    totalFiles: files.length,
    totalFindings: allFindings.length,
    errors,
    warnings,
    infos,
  };
}
