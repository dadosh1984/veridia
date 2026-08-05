import path from 'node:path'
import type { VerifiabilityLevel } from '../../assess/types.js'
import type { TaskType } from '../../classify/types.js'
import { delegate } from '../../execute/delegate.js'
import { buildExecutionPlan } from '../../execute/plan.js'
import { buildPlan } from '../../route/route.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut, validateLevel, validateType } from '../shared.js'

export async function handle(opts: { type: string; level: string | number; files?: string; target?: string }): Promise<void> {
  const typeErr = validateType(opts.type)
  if (typeErr) {
    vlog.error(`execute: ${typeErr}`)
    process.exitCode = 1
    return
  }
  const levelErr = validateLevel(opts.level)
  if (levelErr) {
    vlog.error(`execute: ${levelErr}`)
    process.exitCode = 1
    return
  }
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  const files = opts.files
    ? opts.files
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)
    : undefined
  const level = Number(opts.level) as VerifiabilityLevel
  const runPlan = buildPlan(opts.type as TaskType, level)
  const execPlan = buildExecutionPlan('', opts.type as TaskType, level, runPlan, files, target)
  const result = await delegate(execPlan, target)
  jsonOut({ exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr })
}
