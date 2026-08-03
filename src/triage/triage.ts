import { classify } from '../classify/classify.js';
import { assess } from '../assess/assess.js';
import { buildPlan } from '../route/route.js';
import { ask } from '../ask/ask.js';
import { verify } from '../verify/verify.js';
import { measureRecord } from '../measure/measure.js';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';

export interface TriageResult {
  task: string;
  type: TaskType;
  confidence: number;
  level: VerifiabilityLevel;
  plan: string;
  questions: string;
  verdict: Verdict;
}

export function triage(task: string, target: string = process.cwd()): TriageResult {
  const classification = classify(task);
  const assessment = assess(target);
  const plan = buildPlan(classification.type, assessment.level);
  const askResult = ask(classification.type, assessment.level);
  const kinds = assessment.oracles.map((o) => o.kind);
  const verifyResult = verify(target, assessment.level, kinds);

  const questions = askResult.questions.length > 0
    ? askResult.questions.map((q) => `${q.id}: ${q.prompt}`).join(' | ')
    : 'none';

  measureRecord({
    task,
    type: classification.type,
    level: assessment.level,
    verdict: verifyResult.verdict,
    checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
    drift: '',
  }, { root: target });

  return {
    task,
    type: classification.type,
    confidence: classification.confidence,
    level: assessment.level,
    plan: `${plan.depth}\t${plan.tier}\t${plan.trust}\tsteps=${plan.steps.join(',')}`,
    questions,
    verdict: verifyResult.verdict,
  };
}
