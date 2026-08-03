export type OrchestrationDepth = 'full-tdd' | 'tdd-where-possible' | 'minimal' | 'just-do-it';

export type ModelTier = 'cheapest' | 'mid' | 'any';

export interface RunPlan {
  depth: OrchestrationDepth;
  tier: ModelTier;
  trust: string;
  steps: string[];
  checks: string[];
}
