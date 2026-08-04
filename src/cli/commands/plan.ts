import path from 'node:path'
import type { TaskType } from '../../classify/types.js'
import type { VerifiabilityLevel } from '../../assess/types.js'
import { buildPlan } from '../../route/route.js'
import { buildExecutionPlan } from '../../execute/plan.js'
import { validateType, validateLevel } from '../shared.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { type: string; level: string | number; files?: string; target?: string }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) { process.stderr.write(`veridia: plan: ${typeErr}\n`); process.exitCode = 1; return }
  const levelErr = validateLevel(opts.level)
  if (levelErr) { process.stderr.write(`veridia: plan: ${levelErr}\n`); process.exitCode = 1; return }
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  const files = opts.files ? opts.files.split(',').map((f) => f.trim()).filter(Boolean) : undefined
  const level = Number(opts.level) as VerifiabilityLevel
  const runPlan = buildPlan(opts.type as TaskType, level)
  const execPlan = buildExecutionPlan('', opts.type as TaskType, level, runPlan, files, target)
  jsonOut(execPlan)
}
