import type { AnalyzeResult } from '../analyze/types.js'

/** A file to be included in a code review. */
export interface ReviewFile {
  /** The relative path of the file. */
  path: string
  /** The reason this file is included in the review. */
  reason: string
}

/** Instructions for an AI agent to perform a code review. */
export interface ReviewInstruction {
  /** The main instruction text for the review. */
  instruction: string
  /** The list of files to review. */
  files: ReviewFile[]
  /** The patterns/issues to look for during review. */
  patterns: string[]
  /** The expected output format for review results. */
  outputFormat: string
  /** Pre-computed static analysis results. */
  analysis: AnalyzeResult
}
