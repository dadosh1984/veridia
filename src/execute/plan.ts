import type { OracleKind, VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import type { RunPlan } from '../route/types.js'
import { resolveCommands } from '../verify/resolve.js'
import { detectHostAgent } from './detect.js'
import type { ExecutionPlan, ExecutionStep, VerificationGate } from './types.js'

const STEP_ACTION_MAP: Record<string, string> = {
  ask: 'Clarify requirements with the user',
  'write-failing-test': 'Write a failing test for the expected behavior',
  implement: 'Implement the solution to make the test pass',
  verify: 'Run verification gates to confirm correctness',
  research: 'Research the topic and gather information',
  'present-options': 'Present findings and options to the user',
  document: 'Write or update documentation',
  review: 'Review the documentation for accuracy',
}

const CHECK_GATE_MAP: Record<string, { id: string; command: string; kind: OracleKind }> = {
  'run-tests': { id: 'run-tests', command: '', kind: 'test-runner' },
  'type-check': { id: 'type-check', command: 'tsc --noEmit', kind: 'type-check' },
  'human-review': { id: 'human-review', command: '', kind: 'human-review' },
}

/**
 * Build a complete ExecutionPlan from a task, its classification, assessment, and run plan.
 * Resolves verification commands and maps step/gate identifiers to their full definitions.
 *
 * @param task - The original task description.
 * @param type - The classified task type.
 * @param level - The assessed verifiability level.
 * @param runPlan - The run plan with depth, tier, steps, and checks.
 * @param files - Optional list of files relevant to the task.
 * @param target - The target directory (defaults to process.cwd()).
 * @returns A fully resolved ExecutionPlan.
 */
export function buildExecutionPlan(
  task: string,
  type: TaskType,
  level: VerifiabilityLevel,
  runPlan: RunPlan,
  files?: string[],
  target?: string,
): ExecutionPlan {
  const host = detectHostAgent(target)
  const resolvedTarget = target ?? process.cwd()

  const resolved = resolveCommands(
    runPlan.checks.map((id) => CHECK_GATE_MAP[id]?.kind ?? (id as OracleKind)),
    resolvedTarget,
  )

  const steps: ExecutionStep[] = runPlan.steps.map((stepId) => {
    const step: ExecutionStep = {
      id: stepId,
      action: STEP_ACTION_MAP[stepId] ?? `Execute step: ${stepId}`,
    }
    if (stepId === 'write-failing-test' || stepId === 'implement') {
      step.files = files
    }
    if (stepId === 'verify') {
      step.gates = runPlan.checks
    }
    return step
  })

  const gates: VerificationGate[] = runPlan.checks.map((checkId) => {
    const gate = CHECK_GATE_MAP[checkId]
    if (!gate) return { id: checkId, command: checkId, kind: 'lint' as OracleKind }
    if (gate.command) return { ...gate }
    const resolvedCmd = resolved.find((r) => r.kind === gate.kind)
    const fallback = gate.kind === 'test-runner' ? 'vitest run' : ''
    return { id: gate.id, command: resolvedCmd?.command ?? fallback, kind: gate.kind }
  })

  return {
    protocol: 'veridia/execution-plan/v1',
    task,
    type,
    level,
    plan: {
      depth: runPlan.depth,
      tier: runPlan.tier,
      steps,
      gates,
    },
    metadata: {
      host: host.id,
      generatedAt: new Date().toISOString(),
    },
  }
}
