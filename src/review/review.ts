import { readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import type { ReviewFile, ReviewInstruction } from './types.js';
import { runAnalysis } from '../analyze/analyze.js';
import type { AnalyzeResult } from '../analyze/types.js';

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.cjs', '.cts']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage']);

function collectSourceFiles(target: string, base: string, files: ReviewFile[]): void {
  let entries: string[];
  try {
    entries = readdirSync(target);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(target, entry);
    const rel = relative(base, full);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        collectSourceFiles(full, base, files);
      } else if (SOURCE_EXTS.has(extname(entry))) {
        files.push({ path: rel.replace(/\\/g, '/'), reason: 'source file' });
      }
    } catch {
      continue;
    }
  }
}

export function buildReviewInstructions(target: string): ReviewInstruction & { analysis: AnalyzeResult } {
  const resolved = join(target);
  const files: ReviewFile[] = [];
  collectSourceFiles(resolved, resolved, files);
  const analysis = runAnalysis(target);

  return {
    instruction: 'Review the following source files for bugs, security issues, code quality problems, and improvement suggestions.',
    files,
    patterns: [
      'hardcoded secrets or credentials',
      'command injection or shell injection',
      'missing input validation',
      'unhandled errors or exceptions',
      'race conditions or async issues',
      'type safety issues',
      'code duplication',
      'performance bottlenecks',
    ],
    outputFormat: 'For each file, list findings with severity (ERROR/WARNING/INFO), file path, line number, description, and suggested fix.',
    analysis,
  };
}
