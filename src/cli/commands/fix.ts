import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { autoFix } from '../../analyze/fix.js'
import { jsonOut } from '../shared.js'

export async function handle(opts: { target?: string; json?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()

  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: fix: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }

  const result = autoFix(target)

  if (opts.json) {
    jsonOut(result)
    return
  }

  note(`Fixed: ${result.fixed}\nSkipped: ${result.skipped}\nErrors: ${result.errors}`, 'veridia fix')

  if (result.details.length > 0) {
    const lines = result.details.map((d) => `  ${d.file}:${d.line} — ${d.action}`)
    note(lines.join('\n'), 'Changes')
  }

  outro(`fixed ${result.fixed} issue(s), skipped ${result.skipped}`)
}
