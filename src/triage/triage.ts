import { classify } from '../classify/classify.js';
import { assess } from '../assess/assess.js';
import { buildPlan } from '../route/route.js';
import { askInteractive } from '../ask/ask.js';
import type { AskResult } from '../ask/types.js';
import { verify } from '../verify/verify.js';
import { measureRecord } from '../measure/measure.js';
import { readHistory } from '../measure/history.js';
import { computePrecision } from '../measure/learn.js';
import { buildExecutionPlan } from '../execute/plan.js';
import { delegate } from '../execute/delegate.js';
import { loadConfig, getModelConfig } from '../config/config.js';
import { readSession, writeSession, clearSession } from '../session/session.js';
import type { Session } from '../session/types.js';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel, OracleKind } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';
import type { OrchestrationDepth, ModelTier } from '../route/types.js';
import type { ExecutionPlan, ExecuteResult } from '../execute/types.js';

export interface TriageResult {
  task: string;
  type: TaskType;
  confidence: number;
  level: VerifiabilityLevel;
  plan: {
    depth: string;
    tier: string;
    trust: string;
    steps: string[];
    checks: string[];
  };
  questions: { id: string; prompt: string; options: string[] }[];
  answers?: Record<string, string>;
  verdict: Verdict;
  executionPlan?: ExecutionPlan;
  executionResult?: ExecuteResult;
}

function calculateDrift(verdict: Verdict, target: string): string {
  const entries = readHistory({ root: target });
  if (entries.length === 0) return '0';
  const recent = entries.slice(-10);
  const passCount = recent.filter((e) => e.verdict === 'PASS').length;
  const successRate = passCount / recent.length;
  if (verdict === 'FAIL' && successRate > 0.8) return '1';
  if (verdict === 'FAIL' && successRate > 0.5) return '0.5';
  return '0';
}

export interface TriageOptions {
  auto?: boolean;
}

export interface TriageDeps {
  ask?: (type: TaskType, level: VerifiabilityLevel, auto?: boolean) => Promise<AskResult>;
}

export async function triage(task: string, target: string = process.cwd(), options?: TriageOptions, deps?: TriageDeps): Promise<TriageResult> {
  const config = loadConfig(target);
  const existing = readSession(target);

  let classification: ReturnType<typeof classify>;
  let assessment: ReturnType<typeof assess>;
  let plan: ReturnType<typeof buildPlan>;
  let askResult: AskResult;
  let kinds: OracleKind[];

  if (existing && existing.step !== 'done' && existing.task === task) {
    classification = { type: existing.type ?? 'open', confidence: existing.confidence ?? 0 };
    assessment = { level: existing.level ?? 1, oracles: [] };
    plan = { depth: (existing.plan?.depth ?? 'minimal') as OrchestrationDepth, tier: (existing.plan?.tier ?? 'cheapest') as ModelTier, trust: 'human', steps: existing.plan?.steps ?? [], checks: existing.plan?.checks ?? [] };
    kinds = [];
    askResult = { questions: [], answers: existing.answers };
  } else {
    clearSession(target);
    classification = classify(task, config);
    assessment = assess(target, undefined, undefined, config);
    plan = buildPlan(classification.type, assessment.level);
    kinds = assessment.oracles.map((o) => o.kind);
    askResult = { questions: [] };

    writeSession({ task, type: classification.type, confidence: classification.confidence, step: 'assess' }, target);
    writeSession({ task, type: classification.type, confidence: classification.confidence, level: assessment.level, step: 'route' }, target);
    writeSession({ task, type: classification.type, confidence: classification.confidence, level: assessment.level, plan: { depth: plan.depth, tier: plan.tier, steps: plan.steps, checks: plan.checks }, step: 'ask' }, target);
  }

  const askFn = deps?.ask ?? askInteractive;
  if (!existing || existing.step === 'ask' || existing.step === 'classify' || existing.step === 'assess' || existing.step === 'route') {
    askResult = await askFn(classification.type, assessment.level, options?.auto);
    writeSession({ task, type: classification.type, confidence: classification.confidence, level: assessment.level, plan: { depth: plan.depth, tier: plan.tier, steps: plan.steps, checks: plan.checks }, answers: askResult.answers, step: 'do' }, target);
  }

  const execPlan = buildExecutionPlan(task, classification.type, assessment.level, plan, undefined, target);
  const modelConfig = getModelConfig(config);
  const execResult = await delegate(execPlan, target, modelConfig ? {
    modelConfig,
    task,
    type: classification.type,
    level: assessment.level,
    kinds,
    answers: askResult.answers,
  } : undefined);

  const historyEntries = readHistory({ root: target });
  const precision = computePrecision(historyEntries);

  const verifyResult = verify(target, assessment.level, kinds, { precision });
  const drift = calculateDrift(verifyResult.verdict, target);

  const oracleResults = verifyResult.checks.map((c) => ({
    kind: c.kind,
    truePositives: c.passed ? 1 : 0,
    falsePositives: c.passed ? 0 : 1,
  }));

  measureRecord({
    task,
    type: classification.type,
    level: assessment.level,
    verdict: verifyResult.verdict,
    checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
    drift,
    oracleResults,
  }, { root: target });

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
  };
}
