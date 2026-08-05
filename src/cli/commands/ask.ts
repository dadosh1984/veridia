import { ask } from '../../ask/ask.js'
import type { VerifiabilityLevel } from '../../assess/types.js'
import type { TaskType } from '../../classify/types.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut, validateLevel, validateType } from '../shared.js'

export function handle(opts: { type: string; level: string | number }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) {
    vlog.error(`ask: ${typeErr}`)
    process.exitCode = 1
    return
  }
  const levelErr = validateLevel(opts.level)
  if (levelErr) {
    vlog.error(`ask: ${levelErr}`)
    process.exitCode = 1
    return
  }
  const result = ask(opts.type as TaskType, Number(opts.level) as VerifiabilityLevel)
  jsonOut({ questions: result.questions })
}
