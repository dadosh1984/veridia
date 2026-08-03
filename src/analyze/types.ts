export type Severity = 'ERROR' | 'WARNING' | 'INFO';

export interface Finding {
  severity: Severity;
  file: string;
  line: number;
  column: number;
  description: string;
  pattern: string;
}

export interface AnalyzeResult {
  findings: Finding[];
  totalFiles: number;
  totalFindings: number;
  errors: number;
  warnings: number;
  infos: number;
}
