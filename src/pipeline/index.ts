import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import type { ExecuteResult, ExecutionPlan } from '../execute/types.js'
import type { RunPlan } from '../route/types.js'
import type { Verdict } from '../verify/types.js'

export interface PipelineContext {
  task: string
  target: string
  config: Record<string, unknown>
  answers?: Record<string, string>
  progress?: (stage: string, detail?: string) => void
}

export interface PipelineStep<I, O> {
  name: string
  process(input: I, ctx: PipelineContext): Promise<O> | O
}

export interface TriageResult {
  task: string
  type: TaskType
  confidence: number
  level: VerifiabilityLevel
  plan: RunPlan
  questions: { id: string; prompt: string; options: string[] }[]
  answers?: Record<string, string>
  verdict: Verdict
  executionPlan?: ExecutionPlan
  executionResult?: ExecuteResult
  mustFollowPlan: true
}

export class Pipeline {
  private steps: PipelineStep<unknown, unknown>[]

  constructor(steps: PipelineStep<unknown, unknown>[]) {
    this.steps = steps
  }

  async run(initial: unknown, ctx: PipelineContext): Promise<unknown> {
    let result = initial
    for (const step of this.steps) {
      ctx.progress?.(step.name, '')
      result = await step.process(result, ctx)
    }
    return result
  }
}
