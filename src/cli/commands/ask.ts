import type { TaskType } from '../../classify/types.js'
import type { VerifiabilityLevel } from '../../assess/types.js'
import { ask } from '../../ask/ask.js'
import { validateType, validateLevel } from '../shared.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { type: string; level: string | number }): void {
  const typeErr = validateType(opts.type)
  if (typeErr) { process.stderr.write(`veridia: ask: ${typeErr}\n`); process.exitCode = 1; return }
  const levelErr = validateLevel(opts.level)
  if (levelErr) { process.stderr.write(`veridia: ask: ${levelErr}\n`); process.exitCode = 1; return }
  const result = ask(opts.type as TaskType, Number(opts.level) as VerifiabilityLevel)
  jsonOut({ questions: result.questions })
}
