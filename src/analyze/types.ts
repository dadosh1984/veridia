/** The severity level of a static analysis finding. */
export type Severity = 'ERROR' | 'WARNING' | 'INFO'

/** A single finding from static analysis. */
export interface Finding {
  /** The severity of the finding. */
  severity: Severity
  /** The file path where the finding was detected. */
  file: string
  /** The line number of the finding. */
  line: number
  /** The column number of the finding. */
  column: number
  /** A human-readable description of the finding. */
  description: string
  /** The pattern identifier that triggered this finding. */
  pattern: string
}

/** The result of running static analysis on a target directory. */
export interface AnalyzeResult {
  /** All findings from the analysis. */
  findings: Finding[]
  /** Total number of files analyzed. */
  totalFiles: number
  /** Total number of findings across all files. */
  totalFindings: number
  /** Count of ERROR severity findings. */
  errors: number
  /** Count of WARNING severity findings. */
  warnings: number
  /** Count of INFO severity findings. */
  infos: number
}
