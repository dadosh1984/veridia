import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { delimiter, join } from 'node:path'
import { createInterface } from 'node:readline'
import type { OracleKind, VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import { execFileWithShim } from '../util/exec-shim.js'
import { splitCommand } from '../util/split-command.js'
import { detectHostAgent } from './detect.js'
import type { ModelConfig } from './orchestrate.js'
import { orchestrate } from './orchestrate.js'
import type { DelegationMode, ExecuteResult, ExecutionPlan, VerificationGate } from './types.js'

/**
 * Delegate an execution plan by writing it as JSON to stdout.
 *
 * @param plan - The execution plan to delegate.
 * @returns An ExecuteResult with the plan JSON in stdout.
 */
export function delegateStdout(plan: ExecutionPlan): ExecuteResult {
  const json = JSON.stringify(plan, null, 2)
  return { exitCode: 0, stdout: json, stderr: '' }
}

/**
 * Delegate an execution plan by writing it to .veridia/plan.json on disk.
 *
 * @param plan - The execution plan to delegate.
 * @param target - The target directory (defaults to process.cwd()).
 * @returns An ExecuteResult indicating where the plan was written.
 */
export function delegateFile(plan: ExecutionPlan, target?: string): ExecuteResult {
  const root = target ?? process.cwd()
  const planDir = join(root, '.veridia')
  const planPath = join(planDir, 'plan.json')
  if (!existsSync(planDir)) {
    mkdirSync(planDir, { recursive: true })
  }
  const json = JSON.stringify(plan, null, 2)
  writeFileSync(planPath, json, 'utf8')
  return { exitCode: 0, stdout: `Plan written to ${planPath}`, stderr: '' }
}

function shellDelegationPolicy(): 'allow' | 'deny' | 'ask' {
  const v = process.env.VERIDIA_SHELL_DELEGATION
  if (v === 'deny') return 'deny'
  if (v === 'ask') return 'ask'
  return 'allow'
}

function confirmShell(): Promise<boolean> {
  if (!process.stdin.isTTY) return Promise.resolve(false)
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question('veridia: run plan gates in shell? [y/N] ', (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

function runGates(cwd: string, gates: VerificationGate[]): ExecuteResult {
  for (const gate of gates) {
    if (!gate.command) continue
    const args = splitCommand(gate.command)
    if (args.length === 0) continue
    try {
      const env = { ...process.env, PATH: `${join(cwd, 'node_modules', '.bin')}${delimiter}${process.env.PATH ?? ''}` }
      const cmd = args[0]
      if (!cmd) continue
      execFileWithShim(cmd, args.slice(1), { cwd, timeout: 120_000, encoding: 'utf8', env })
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException
      return {
        exitCode: (err as { status?: number }).status ?? 1,
        stdout: '',
        stderr: nodeErr.message ?? `Gate "${gate.id}" failed`,
      }
    }
  }
  return { exitCode: 0, stdout: 'All gates passed', stderr: '' }
}

/**
 * Delegate an execution plan by running its verification gates in the local shell.
 * Respects the VERIDIA_SHELL_DELEGATION environment variable (allow/deny/ask).
 *
 * @param plan - The execution plan to delegate.
 * @param target - The target directory (defaults to process.cwd()).
 * @returns A promise resolving to an ExecuteResult from running the gates.
 */
export async function delegateShell(plan: ExecutionPlan, target?: string): Promise<ExecuteResult> {
  const cwd = target ?? process.cwd()
  const gates = plan.plan.gates
  if (gates.length === 0) {
    return { exitCode: 0, stdout: 'No gates to run', stderr: '' }
  }
  const policy = shellDelegationPolicy()
  if (policy === 'deny') {
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'Shell delegation is disabled. Set VERIDIA_SHELL_DELEGATION=allow (or ask) to run plan gates.',
    }
  }
  if (policy === 'ask' && !(await confirmShell())) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'Shell delegation not confirmed. Set VERIDIA_SHELL_DELEGATION=allow to run gates non-interactively.',
    }
  }
  return runGates(cwd, gates)
}

/** Options for the delegate function, including model orchestration settings. */
export interface DelegateOptions {
  /** Model configuration for AI orchestration (single or array for A/B testing). */
  modelConfig?: ModelConfig | ModelConfig[]
  /** The original task description. */
  task?: string
  /** The classified task type. */
  type?: TaskType
  /** The assessed verifiability level. */
  level?: VerifiabilityLevel
  /** The oracle kinds to verify against. */
  kinds?: OracleKind[]
  /** Optional answers from the ask phase. */
  answers?: Record<string, string>
}

/**
 * Delegate an execution plan to the host agent using the best available delegation mode.
 * If modelConfig is provided, delegates to AI orchestration instead.
 *
 * @param plan - The execution plan to delegate.
 * @param target - The target directory (defaults to process.cwd()).
 * @param options - Optional delegation options including model config.
 * @returns A promise resolving to an ExecuteResult.
 */
export async function delegate(plan: ExecutionPlan, target?: string, options?: DelegateOptions): Promise<ExecuteResult> {
  if (options?.modelConfig && options.task && options.type && options.level && options.kinds) {
    const result = await orchestrate(
      options.task,
      options.type,
      options.level,
      { depth: plan.plan.depth, tier: plan.plan.tier, steps: plan.plan.steps.map((s) => s.id), checks: plan.plan.gates.map((g) => g.id) },
      target ?? process.cwd(),
      options.kinds,
      options.modelConfig,
      options.answers,
    )
    return { exitCode: result.verdict === 'PASS' ? 0 : 1, stdout: result.output, stderr: '' }
  }

  const host = detectHostAgent(target)
  const modes = host.delegationModes
  const mode: DelegationMode = modes.includes('file') ? 'file' : modes.includes('shell') ? 'shell' : 'stdout'

  switch (mode) {
    case 'stdout':
      return delegateStdout(plan)
    case 'file':
      return delegateFile(plan, target)
    case 'shell':
      return delegateShell(plan, target)
  }
}
