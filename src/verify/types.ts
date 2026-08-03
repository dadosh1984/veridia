import type { OracleKind } from '../assess/types.js';

export type Verdict = 'PASS' | 'FAIL' | 'HUMAN';

export interface Check {
  kind: OracleKind;
  command: string;
  weight: number;
  weak: boolean;
  passed: boolean;
}

export interface VerifyResult {
  protocol: 'veridia/verification-report/v1';
  checks: Check[];
  verdict: Verdict;
}