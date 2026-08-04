import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';

export type SessionStep = 'classify' | 'assess' | 'route' | 'ask' | 'do' | 'done';

export interface Session {
  task: string;
  type?: TaskType;
  confidence?: number;
  level?: VerifiabilityLevel;
  plan?: {
    depth: string;
    tier: string;
    steps: string[];
    checks: string[];
  };
  answers?: Record<string, string>;
  verdict?: Verdict;
  step: SessionStep;
}
