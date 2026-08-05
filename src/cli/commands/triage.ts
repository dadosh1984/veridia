import fs from 'node:fs'
import path from 'node:path'
import { triage } from '../../triage/triage.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut } from '../shared.js'

export async function handle(task: string, opts: { target?: string; auto?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!task) {
    vlog.error('no task provided')
    process.exitCode = 1
    return
  }
  if (!fs.existsSync(target)) {
    vlog.error(`target path does not exist: ${target}`)
    process.exitCode = 1
    return
  }
  const result = await triage(task, target, { auto: opts.auto })
  jsonOut(result)
  process.exitCode = result.verdict === 'FAIL' ? 1 : 0
}
