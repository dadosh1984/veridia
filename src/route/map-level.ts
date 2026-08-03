import type { VerifiabilityLevel } from '../assess/types.js';
import type { ModelTier, OrchestrationDepth } from './types.js';

export interface LevelPlan {
  depth: OrchestrationDepth;
  tier: ModelTier;
  trust: string;
  checks: string[];
}

export function mapLevel(level: VerifiabilityLevel): LevelPlan {
  switch (level) {
    case 3:
      return {
        depth: 'full-tdd',
        tier: 'cheapest',
        trust: 'trust the mechanical verifier',
        checks: ['run-tests', 'type-check'],
      };
    case 2:
      return {
        depth: 'tdd-where-possible',
        tier: 'mid',
        trust: 'verify structure; judgment deferred to a human',
        checks: ['run-tests', 'type-check'],
      };
    case 1:
      return {
        depth: 'minimal',
        tier: 'any',
        trust: 'trust human judgment is the floor',
        checks: ['human-review'],
      };
    case 0:
    default:
      return {
        depth: 'just-do-it',
        tier: 'cheapest',
        trust: 'human judgment is the floor',
        checks: ['human-review'],
      };
  }
}
