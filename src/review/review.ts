import { join, relative } from 'node:path';
import { collectFiles } from '../util/collect-files.js';
import type { ReviewFile, ReviewInstruction } from './types.js';
import { runAnalysis } from '../analyze/analyze.js';
import type { AnalyzeResult } from '../analyze/types.js';

export function buildReviewInstructions(target: string): ReviewInstruction & { analysis: AnalyzeResult } {
  const resolved = join(target);
  const rawFiles: string[] = [];
  collectFiles(resolved, resolved, rawFiles);
  const files: ReviewFile[] = rawFiles.map((f) => ({
    path: relative(resolved, f).replace(/\\/g, '/'),
    reason: 'source file',
  }));
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
