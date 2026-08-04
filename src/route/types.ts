/** How deeply the AI agent should orchestrate the workflow. */
export type OrchestrationDepth = 'full-tdd' | 'tdd-where-possible' | 'minimal' | 'just-do-it'

/** All valid orchestration depth values. */
export const ORCHESTRATION_DEPTHS: readonly OrchestrationDepth[] = ['full-tdd', 'tdd-where-possible', 'minimal', 'just-do-it']

/**
 * Type guard for OrchestrationDepth.
 * @param x - The value to check.
 * @returns True if x is a valid OrchestrationDepth.
 */
export function isOrchestrationDepth(x: string): x is OrchestrationDepth {
  return ORCHESTRATION_DEPTHS.includes(x as OrchestrationDepth)
}

/** The cost/quality tier of the model to use. */
export type ModelTier = 'cheapest' | 'mid' | 'any'

/** All valid model tier values. */
export const MODEL_TIERS: readonly ModelTier[] = ['cheapest', 'mid', 'any']

/**
 * Type guard for ModelTier.
 * @param x - The value to check.
 * @returns True if x is a valid ModelTier.
 */
export function isModelTier(x: string): x is ModelTier {
  return MODEL_TIERS.includes(x as ModelTier)
}

/** A plan describing how to execute a task given its type and verifiability level. */
export interface RunPlan {
  /** The orchestration depth for the execution. */
  depth: OrchestrationDepth
  /** The model tier to use. */
  tier: ModelTier
  /** A human-readable trust statement describing verification confidence. */
  trust: string
  /** Ordered list of step identifiers to execute. */
  steps: string[]
  /** List of check identifiers to run for verification. */
  checks: string[]
}
