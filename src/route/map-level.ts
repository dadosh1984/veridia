import type { VerifiabilityLevel } from '../assess/types.js'
import type { ModelTier, OrchestrationDepth } from './types.js'

/** A plan derived from a verifiability level. */
export interface LevelPlan {
  /** The orchestration depth for this level. */
  depth: OrchestrationDepth
  /** The model tier appropriate for this level. */
  tier: ModelTier
  /** A human-readable trust statement. */
  trust: string
  /** The verification checks to run at this level. */
  checks: string[]
}

/**
 * Map a verifiability level to a LevelPlan with appropriate depth, tier, trust, and checks.
 *
 * @param level - The verifiability level (0-3).
 * @returns A LevelPlan with orchestration settings for the given level.
 */
export function mapLevel(level: VerifiabilityLevel): LevelPlan {
  switch (level) {
    case 3:
      return {
        depth: 'full-tdd',
        tier: 'cheapest',
        trust: 'trust the mechanical verifier',
        checks: ['run-tests', 'type-check'],
      }
    case 2:
      return {
        depth: 'tdd-where-possible',
        tier: 'mid',
        trust: 'verify structure; judgment deferred to a human',
        checks: ['run-tests', 'type-check'],
      }
    case 1:
      return {
        depth: 'minimal',
        tier: 'any',
        trust: 'trust human judgment is the floor',
        checks: ['human-review'],
      }
    default:
      return {
        depth: 'just-do-it',
        tier: 'cheapest',
        trust: 'human judgment is the floor',
        checks: ['human-review'],
      }
  }
}
