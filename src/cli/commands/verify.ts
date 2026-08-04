import fs from 'node:fs'
import path from 'node:path'
import { probeOracles, realFs } from '../../assess/probe.js'
import type { VerifiabilityLevel } from '../../assess/types.js'
import { verify } from '../../verify/verify.js'
import { jsonOut, validateLevel, validateType } from '../shared.js'

export function handle(opts: { target: string; type: string; level: string | number; dryRun?: boolean }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) {
    process.stderr.write(`veridia: verify: ${typeErr}\n`)
    process.exitCode = 1
    return
  }
  const levelErr = validateLevel(opts.level)
  if (levelErr) {
    process.stderr.write(`veridia: verify: ${levelErr}\n`)
    process.exitCode = 1
    return
  }
  const resolved = path.resolve(opts.target)
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: verify: target path does not exist: ${opts.target}\n`)
    process.exitCode = 1
    return
  }
  const kinds = probeOracles(resolved, realFs).map((o) => o.kind)
  const result = verify(resolved, Number(opts.level) as VerifiabilityLevel, kinds, { dryRun: opts.dryRun })
  jsonOut({ checks: result.checks, verdict: result.verdict })
}
