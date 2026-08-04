import path from 'node:path'
import type { Verdict } from '../../verify/types.js'
import { measureRecord, measureHistory } from '../../measure/measure.js'
import { jsonOut } from '../shared.js'

export function handle(opts: Record<string, unknown>): void {
  const record = opts.record as string | undefined
  const history = opts.history as boolean | undefined
  const task = (opts.task as string) ?? ''
  const type = (opts.type as string) ?? ''
  const level = (opts.level as string) ?? ''
  const verdict = (opts.verdict as string) ?? ''
  const measureTarget = (opts.target as string) ?? ''
  const deps = measureTarget ? { root: path.resolve(measureTarget) } : undefined

  if (history) {
    const summary = measureHistory(deps)
    jsonOut(summary)
  } else if (record) {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(record)
    } catch {
      process.stderr.write('veridia: measure --record requires valid JSON\n')
      process.exitCode = 1
      return
    }
    const entry = {
      task: (parsed.task as string) || task,
      type: (parsed.type as string) || type,
      level: Number((parsed.level as string) || level),
      verdict: (parsed.verdict as Verdict) || (verdict as Verdict),
      checks: (parsed.checks as { kind: string; passed: boolean }[]) || [],
      drift: (parsed.drift as string) || '',
    }
    if (!entry.task || !entry.type || !entry.verdict) {
      process.stderr.write('veridia: measure --record requires task, type, and verdict\n')
      process.exitCode = 1
      return
    }
    measureRecord(entry, deps)
    jsonOut({ recorded: true })
  } else {
    process.stderr.write('veridia: measure requires --record or --history\n')
    process.exitCode = 1
  }
}
