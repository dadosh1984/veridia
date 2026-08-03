import type { AnalyzeResult } from '../analyze/types.js';

export interface ReviewFile {
  path: string;
  reason: string;
}

export interface ReviewInstruction {
  instruction: string;
  files: ReviewFile[];
  patterns: string[];
  outputFormat: string;
  analysis: AnalyzeResult;
}
