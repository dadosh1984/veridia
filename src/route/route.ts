import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import { mapLevel } from './map-level.js'
import { mapType } from './map-type.js'
import type { RunPlan } from './types.js'

/**
 * Build a RunPlan by combining the level-based plan (depth, tier, trust, checks)
 * with the type-based plan (steps).
 *
 * @param type - The classified task type.
 * @param level - The assessed verifiability level.
 * @returns A RunPlan with orchestration depth, model tier, trust statement, steps, and checks.
 */
export function buildPlan(type: TaskType, level: VerifiabilityLevel): RunPlan {
  const levelPlan = mapLevel(level)
  const typePlan = mapType(type)
  return {
    depth: levelPlan.depth,
    tier: levelPlan.tier,
    trust: levelPlan.trust,
    steps: typePlan.steps,
    checks: levelPlan.checks,
  }
}
