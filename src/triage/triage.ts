import { askInteractive } from '../ask/ask.js'
import type { AskResult } from '../ask/types.js'
import { assess } from '../assess/assess.js'
import type { OracleKind, VerifiabilityLevel } from '../assess/types.js'
import { classify } from '../classify/classify.js'
import type { TaskType } from '../classify/types.js'
import { getModelConfig, loadConfig } from '../config/config.js'
import { delegate } from '../execute/delegate.js'
import { buildExecutionPlan } from '../execute/plan.js'
import type { ExecuteResult, ExecutionPlan } from '../execute/types.js'
import { readHistory } from '../measure/history.js'
import { computePrecision } from '../measure/learn.js'
import { measureRecord } from '../measure/measure.js'
import { buildPlan } from '../route/route.js'
import type { ModelTier, OrchestrationDepth } from '../route/types.js'
import { clearSession, readSession, writeSession } from '../session/session.js'
import type { Verdict } from '../verify/types.js'
import { verify } from '../verify/verify.js'

/** The complete result of a triage run, including classification, assessment, planning, and execution. */
export interface TriageResult {
  /** The original task description. */
  task: string
  /** The classified task type. */
  type: TaskType
  /** The classification confidence score. */
  confidence: number
  /** The assessed verifiability level. */
  level: VerifiabilityLevel
  /** The execution plan details. */
  plan: {
    /** The orchestration depth. */
    depth: string
    /** The model tier. */
    tier: string
    /** The trust statement. */
    trust: string
    /** The ordered list of step identifiers. */
    steps: string[]
    /** The verification check identifiers. */
    checks: string[]
  }
  /** The clarifying questions generated. */
  questions: { id: string; prompt: string; options: string[] }[]
  /** Optional answers to clarifying questions. */
  answers?: Record<string, string>
  /** The final verification verdict. */
  verdict: Verdict
  /** The full execution plan. */
  executionPlan?: ExecutionPlan
  /** The result of executing the plan. */
  executionResult?: ExecuteResult
  /** The agent must strictly follow the execution plan steps. */
  mustFollowPlan: true
}

function calculateDrift(verdict: Verdict, target: string): string {
  const entries = readHistory({ root: target })
  if (entries.length === 0) return '0'
  const recent = entries.slice(-10)
  const passCount = recent.filter((e) => e.verdict === 'PASS').length
  const successRate = passCount / recent.length
  if (verdict === 'FAIL' && successRate > 0.8) return '1'
  if (verdict === 'FAIL' && successRate > 0.5) return '0.5'
  return '0'
}

/** Options for the triage function. */
export interface TriageOptions {
  /** If true, skip interactive prompts. */
  auto?: boolean
  /** Optional progress callback for reporting stage updates. */
  progress?: (stage: string, detail?: string) => void
}

/** Dependencies for the triage function, allowing injection of custom ask logic. */
export interface TriageDeps {
  /** Custom ask function (defaults to askInteractive). */
  ask?: (type: TaskType, level: VerifiabilityLevel, auto?: boolean) => Promise<AskResult>
}

/**
 * Run the full veridia triage loop: classify, assess, route, ask, execute, verify, and measure.
 * Supports session resumption for interrupted runs.
 *
 * @param task - The task description to triage.
 * @param target - The target directory (defaults to process.cwd()).
 * @param options - Optional triage options (auto mode, progress callback).
 * @param deps - Optional dependency overrides (e.g. custom ask function).
 * @returns A promise resolving to a TriageResult with all phase outputs.
 */
export async function triage(task: string, target: string = process.cwd(), options?: TriageOptions, deps?: TriageDeps): Promise<TriageResult> {
  const config = loadConfig(target)
  const existing = readSession(target)

  let classification: ReturnType<typeof classify>
  let assessment: ReturnType<typeof assess>
  let plan: ReturnType<typeof buildPlan>
  let askResult: AskResult
  let kinds: OracleKind[]

  if (existing && existing.step !== 'done' && existing.task === task) {
    classification = { type: existing.type ?? 'open', confidence: existing.confidence ?? 0 }
    assessment = { level: existing.level ?? 1, oracles: [] }
    plan = {
      depth: (existing.plan?.depth ?? 'minimal') as OrchestrationDepth,
      tier: (existing.plan?.tier ?? 'cheapest') as ModelTier,
      trust: 'human',
      steps: existing.plan?.steps ?? [],
      checks: existing.plan?.checks ?? [],
    }
    kinds = []
    askResult = { questions: [], answers: existing.answers }
  } else {
    clearSession(target)
    classification = classify(task, config)
    assessment = assess(target, undefined, undefined, config)
    plan = buildPlan(classification.type, assessment.level)
    kinds = assessment.oracles.map((o) => o.kind)
    askResult = { questions: [] }

    writeSession(
      {
        task,
        type: classification.type,
        confidence: classification.confidence,
        level: assessment.level,
        plan: { depth: plan.depth, tier: plan.tier, steps: plan.steps, checks: plan.checks },
        step: 'ask',
      },
      target,
    )
  }

  const progress = options?.progress
  progress?.('classify', `${classification.type} (${classification.confidence})`)
  progress?.('assess', `level ${assessment.level} · ${kinds.join(', ') || 'no oracles'}`)
  progress?.('route', `${plan.depth} / ${plan.tier}`)

  const askFn = deps?.ask ?? askInteractive
  if (!existing || existing.step === 'ask' || existing.step === 'classify' || existing.step === 'assess' || existing.step === 'route') {
    askResult = await askFn(classification.type, assessment.level, options?.auto)
    writeSession(
      {
        task,
        type: classification.type,
        confidence: classification.confidence,
        level: assessment.level,
        plan: { depth: plan.depth, tier: plan.tier, steps: plan.steps, checks: plan.checks },
        answers: askResult.answers,
        step: 'do',
      },
      target,
    )
  }
  progress?.('ask', `${askResult.questions.length} question(s)`)

  const execPlan = buildExecutionPlan(task, classification.type, assessment.level, plan, undefined, target)
  progress?.('plan', `${execPlan.plan.steps.length} steps · ${execPlan.plan.gates.length} gates`)
  const modelConfig = getModelConfig(config)
  const execResult = await delegate(
    execPlan,
    target,
    modelConfig
      ? {
          modelConfig,
          task,
          type: classification.type,
          level: assessment.level,
          kinds,
          answers: askResult.answers,
        }
      : undefined,
  )
  progress?.('execute', 'delegated')

  const historyEntries = readHistory({ root: target })
  const precision = computePrecision(historyEntries)

  const verifyResult = verify(target, assessment.level, kinds, { precision, weights: config.weights })
  progress?.('verify', verifyResult.verdict)
  const drift = calculateDrift(verifyResult.verdict, target)

  const oracleResults = verifyResult.checks.map((c) => ({
    kind: c.kind,
    truePositives: c.passed ? 1 : 0,
    falsePositives: c.passed ? 0 : 1,
  }))

  measureRecord(
    {
      task,
      type: classification.type,
      level: assessment.level,
      verdict: verifyResult.verdict,
      checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
      drift,
      oracleResults,
    },
    { root: target },
  )
  progress?.('measure', 'recorded')

  return {
    task,
    type: classification.type,
    confidence: classification.confidence,
    level: assessment.level,
    plan: {
      depth: plan.depth,
      tier: plan.tier,
      trust: plan.trust,
      steps: plan.steps,
      checks: plan.checks,
    },
    questions: askResult.questions,
    answers: askResult.answers,
    verdict: verifyResult.verdict,
    executionPlan: execPlan,
    executionResult: execResult,
    mustFollowPlan: true,
  }
}
