import fs from 'node:fs'
import path from 'node:path'
import { probeOracles, realFs } from '../../assess/probe.js'
import type { VerifiabilityLevel } from '../../assess/types.js'
import { log as vlog } from '../../util/log.js'
import { verify } from '../../verify/verify.js'
import { jsonOut, validateLevel, validateType } from '../shared.js'

export function handle(opts: { target: string; type: string; level: string | number; dryRun?: boolean; verbose?: boolean }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) {
    vlog.error(`verify: ${typeErr}`)
    process.exitCode = 1
    return
  }
  const levelErr = validateLevel(opts.level)
  if (levelErr) {
    vlog.error(`verify: ${levelErr}`)
    process.exitCode = 1
    return
  }
  const resolved = path.resolve(opts.target)
  if (!fs.existsSync(resolved)) {
    vlog.error(`verify: target path does not exist: ${opts.target}`)
    process.exitCode = 1
    return
  }
  const kinds = probeOracles(resolved, realFs).map((o) => o.kind)
  const result = verify(resolved, Number(opts.level) as VerifiabilityLevel, kinds, { dryRun: opts.dryRun, streamOutput: opts.verbose })
  jsonOut({ checks: result.checks, verdict: result.verdict })
  process.exitCode = result.verdict === 'FAIL' ? 1 : 0
}
