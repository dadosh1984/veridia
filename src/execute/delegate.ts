import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { join, delimiter } from 'node:path';
import { splitCommand } from '../util/split-command.js';
import type { ExecutionPlan, DelegationMode, ExecuteResult, VerificationGate } from './types.js';
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

function shellDelegationPolicy(): 'allow' | 'deny' | 'ask' {
  const v = process.env.VERIDIA_SHELL_DELEGATION;
  if (v === 'deny') return 'deny';
  if (v === 'ask') return 'ask';
  return 'allow';
}

function confirmShell(): Promise<boolean> {
  if (!process.stdin.isTTY) return Promise.resolve(false);
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('veridia: run plan gates in shell? [y/N] ', (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function runGates(cwd: string, gates: VerificationGate[]): ExecuteResult {
  for (const gate of gates) {
    if (!gate.command) continue;
    const args = splitCommand(gate.command);
    if (args.length === 0) continue;
    try {
      const env = { ...process.env, PATH: `${join(cwd, 'node_modules', '.bin')}${delimiter}${process.env.PATH ?? ''}` };
      const result = spawnSync(args[0], args.slice(1), { cwd, timeout: 120_000, encoding: 'utf8', env, stdio: 'inherit' });
      if (result.status !== 0) {
        return { exitCode: result.status ?? 1, stdout: '', stderr: `Gate "${gate.id}" failed` };
      }
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

export async function delegateShell(plan: ExecutionPlan, target?: string): Promise<ExecuteResult> {
  const cwd = target ?? process.cwd();
  const gates = plan.plan.gates;
  if (gates.length === 0) {
    return { exitCode: 0, stdout: 'No gates to run', stderr: '' };
  }
  const policy = shellDelegationPolicy();
  if (policy === 'deny') {
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'Shell delegation is disabled. Set VERIDIA_SHELL_DELEGATION=allow (or ask) to run plan gates.',
    };
  }
  if (policy === 'ask' && !(await confirmShell())) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'Shell delegation not confirmed. Set VERIDIA_SHELL_DELEGATION=allow to run gates non-interactively.',
    };
  }
  return runGates(cwd, gates);
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
