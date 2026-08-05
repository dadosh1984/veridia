import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { type AutoFixOptions, autoFix } from '../../analyze/fix.js'
import { jsonOut } from '../shared.js'

export async function handle(opts: { target?: string; json?: boolean; dryRun?: boolean; force?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()

  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: fix: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }

  const fixOpts: AutoFixOptions = { dryRun: opts.dryRun, force: opts.force }
  const result = autoFix(target, fixOpts)

  if (result.blocked) {
    process.stderr.write('veridia: fix: refusing to modify uncommitted changes. Commit or stash first, or pass --force.\n')
    process.exitCode = 1
    return
  }

  if (opts.json) {
    jsonOut(result)
    return
  }

  const verb = opts.dryRun ? 'Would fix' : 'Fixed'
  note(`${verb}: ${result.fixed}\nSkipped: ${result.skipped}\nErrors: ${result.errors}`, 'veridia fix')

  if (result.details.length > 0) {
    const lines = result.details.map((d) => `  ${d.file}:${d.line} — ${d.action}`)
    note(lines.join('\n'), 'Changes')
  }

  outro(`${opts.dryRun ? 'would fix' : 'fixed'} ${result.fixed} issue(s), skipped ${result.skipped}`)
}
