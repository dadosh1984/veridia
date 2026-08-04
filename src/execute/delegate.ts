import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { splitCommand } from '../util/split-command.js';
import type { ExecutionPlan, DelegationMode, ExecuteResult } from './types.js';
import { detectHostAgent } from './detect.js';
import type { ModelConfig } from './orchestrate.js';
import { orchestrate } from './orchestrate.js';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { OracleKind } from '../assess/types.js';

export function delegateStdout(plan: ExecutionPlan): ExecuteResult {
  const json = JSON.stringify(plan, null, 2);
  return { exitCode: 0, stdout: json, stderr: '' };
}

export function delegateFile(plan: ExecutionPlan, target?: string): ExecuteResult {
  const root = target ?? process.cwd();
  const planDir = join(root, '.veridia');
  const planPath = join(planDir, 'plan.json');
  if (!existsSync(planDir)) {
    mkdirSync(planDir, { recursive: true });
  }
  const json = JSON.stringify(plan, null, 2);
  writeFileSync(planPath, json, 'utf8');
  return { exitCode: 0, stdout: `Plan written to ${planPath}`, stderr: '' };
}

export function delegateShell(plan: ExecutionPlan, target?: string): ExecuteResult {
  const cwd = target ?? process.cwd();
  const gates = plan.plan.gates;
  if (gates.length === 0) {
    return { exitCode: 0, stdout: 'No gates to run', stderr: '' };
  }
  for (const gate of gates) {
    if (!gate.command) continue;
    const args = splitCommand(gate.command);
    if (args.length === 0) continue;
    try {
      execFileSync(args[0], args.slice(1), { cwd, timeout: 120_000, encoding: 'utf8' });
    } catch (err) {
      const e = err as { status?: number | null; stdout?: string; stderr?: string };
      return {
        exitCode: e.status ?? 1,
        stdout: e.stdout ?? '',
        stderr: e.stderr ?? `Gate "${gate.id}" failed`,
      };
    }
  }
  return { exitCode: 0, stdout: 'All gates passed', stderr: '' };
}

export interface DelegateOptions {
  modelConfig?: ModelConfig;
  task?: string;
  type?: TaskType;
  level?: VerifiabilityLevel;
  kinds?: OracleKind[];
  answers?: Record<string, string>;
}

export async function delegate(plan: ExecutionPlan, target?: string, options?: DelegateOptions): Promise<ExecuteResult> {
  if (options?.modelConfig && options.task && options.type && options.level && options.kinds) {
    const result = await orchestrate(
      options.task, options.type, options.level,
      { depth: plan.plan.depth, tier: plan.plan.tier, steps: plan.plan.steps.map((s) => s.id), checks: plan.plan.gates.map((g) => g.id) },
      target ?? process.cwd(), options.kinds, options.modelConfig, options.answers,
    );
    return { exitCode: result.verdict === 'PASS' ? 0 : 1, stdout: result.output, stderr: '' };
  }

  const host = detectHostAgent(target);
  const modes = host.delegationModes;
  const mode: DelegationMode = modes.includes('file')
    ? 'file'
    : modes.includes('shell')
      ? 'shell'
      : 'stdout';

  switch (mode) {
    case 'stdout':
      return delegateStdout(plan);
    case 'file':
      return delegateFile(plan, target);
    case 'shell':
      return delegateShell(plan, target);
  }
}
