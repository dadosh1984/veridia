export type VerifiabilityLevel = 0 | 1 | 2 | 3;

export type OracleKind = 'test-runner' | 'type-check' | 'lint' | 'ci' | 'test-content' | 'human-review';

export interface Oracle {
  kind: OracleKind;
  present?: boolean;
}

export interface Assessment {
  level: VerifiabilityLevel;
  oracles: Oracle[];
}
