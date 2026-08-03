import { classify } from '../classify/classify.js';
import { assess } from '../assess/assess.js';
import { buildPlan } from '../route/route.js';
import { ask } from '../ask/ask.js';
import { verify } from '../verify/verify.js';
import { measureRecord } from '../measure/measure.js';
import { readHistory } from '../measure/history.js';
import { buildExecutionPlan } from '../execute/plan.js';
import { delegate } from '../execute/delegate.js';
import { loadConfig } from '../config/config.js';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';
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

export function triage(task: string, target: string = process.cwd()): TriageResult {
  const config = loadConfig(target);
  const classification = classify(task, config);
  const assessment = assess(target);
  const plan = buildPlan(classification.type, assessment.level);
  const askResult = ask(classification.type, assessment.level);
  const kinds = assessment.oracles.map((o) => o.kind);

  const execPlan = buildExecutionPlan(task, classification.type, assessment.level, plan, undefined, target);
  const execResult = delegate(execPlan, target);

  const verifyResult = verify(target, assessment.level, kinds);
  const drift = calculateDrift(verifyResult.verdict, target);

  measureRecord({
    task,
    type: classification.type,
    level: assessment.level,
    verdict: verifyResult.verdict,
    checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
    drift,
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
    verdict: verifyResult.verdict,
    executionPlan: execPlan,
    executionResult: execResult,
  };
}
