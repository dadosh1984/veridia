import type { VerifiabilityLevel } from '../../assess/types.js'
import type { TaskType } from '../../classify/types.js'
import { buildPlan } from '../../route/route.js'
import { jsonOut, validateLevel, validateType } from '../shared.js'

export function handle(opts: { type: string; level: string | number }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) {
    process.stderr.write(`veridia: route: ${typeErr}\n`)
    process.exitCode = 1
    return
  }
  const levelErr = validateLevel(opts.level)
  if (levelErr) {
    process.stderr.write(`veridia: route: ${levelErr}\n`)
    process.exitCode = 1
    return
  }
  const plan = buildPlan(opts.type as TaskType, Number(opts.level) as VerifiabilityLevel)
  jsonOut({ depth: plan.depth, tier: plan.tier, trust: plan.trust, steps: plan.steps, checks: plan.checks })
}
