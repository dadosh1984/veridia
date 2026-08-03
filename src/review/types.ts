export interface ReviewFile {
  path: string;
  reason: string;
}

export interface ReviewInstruction {
  instruction: string;
  files: ReviewFile[];
  patterns: string[];
  outputFormat: string;
}
