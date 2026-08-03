export type VerifiabilityLevel = 0 | 1 | 2 | 3;

export type OracleKind = 'test-runner' | 'type-check' | 'lint' | 'ci';

export interface Oracle {
  kind: OracleKind;
}

export interface Assessment {
  level: VerifiabilityLevel;
  oracles: Oracle[];
}
