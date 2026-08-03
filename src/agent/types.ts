import type { DelegationMode } from '../execute/types.js';

export interface AgentInfo {
  id: string;
  name: string;
  configDir: string;
  invocationPrefix: string;
  invocationStyle: 'namespaced' | 'flat';
  skillsOnly: boolean;
  delegationModes: DelegationMode[];
  canWriteFiles: boolean;
  canRunShell: boolean;
  canCallModels: boolean;
}
