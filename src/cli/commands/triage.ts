import fs from 'node:fs'
import path from 'node:path'
import { triage } from '../../triage/triage.js'
import { clearSession } from '../../session/session.js'
import { jsonOut } from '../shared.js'

export async function handle(task: string, opts: { target?: string; auto?: boolean }): Promise<void> {
  let target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!task) {
    process.stderr.write('veridia: no task provided\n')
    process.exitCode = 1
    return
  }
  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }
  clearSession(target)
  const result = await triage(task, target, { auto: opts.auto })
  jsonOut(result)
}
