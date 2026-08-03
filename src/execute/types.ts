import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel, OracleKind } from '../assess/types.js';
import type { OrchestrationDepth, ModelTier } from '../route/types.js';

export type DelegationMode = 'stdout' | 'file' | 'shell';

export interface ExecutionStep {
  id: string;
  action: string;
  files?: string[];
  gates?: string[];
}

export interface VerificationGate {
  id: string;
  command: string;
  kind: OracleKind;
}

export interface ExecutionPlan {
  task: string;
  type: TaskType;
  level: VerifiabilityLevel;
  plan: {
    depth: OrchestrationDepth;
    tier: ModelTier;
    steps: ExecutionStep[];
    gates: VerificationGate[];
  };
  metadata: {
    host: string;
    generatedAt: string;
  };
}

export interface HostAgentInfo {
  id: string;
  name: string;
  delegationModes: DelegationMode[];
  canWriteFiles: boolean;
  canRunShell: boolean;
  canCallModels: boolean;
}

export interface ExecuteResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}
