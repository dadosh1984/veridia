import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import { mapLevel } from './map-level.js';
import { mapType } from './map-type.js';
import type { RunPlan } from './types.js';

export function buildPlan(type: TaskType, level: VerifiabilityLevel): RunPlan {
  const levelPlan = mapLevel(level);
  const typePlan = mapType(type);
  return {
    depth: levelPlan.depth,
    tier: levelPlan.tier,
    trust: levelPlan.trust,
    steps: typePlan.steps,
    checks: levelPlan.checks,
  };
}
