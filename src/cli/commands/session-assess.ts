import fs from 'node:fs'
import path from 'node:path'
import { assess } from '../../assess/assess.js'
import { readSession, writeSession } from '../../session/session.js'
import { log as vlog } from '../../util/log.js'

export function handle(opts: { target?: string }): void {
  const session = readSession()
  if (!session) {
    vlog.error('no active session. Run session-classify first.')
    process.exitCode = 1
    return
  }
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!fs.existsSync(target)) {
    vlog.error(`target path does not exist: ${target}`)
    process.exitCode = 1
    return
  }
  const result = assess(target)
  session.level = result.level
  session.step = 'route'
  writeSession(session)
  process.stdout.write(`  level      ${result.level}\n`)
  process.stdout.write(`  oracles    ${result.oracles.map((o) => o.kind).join(', ')}\n`)
  process.stdout.write(`  step       route (next: session-route)\n`)
}
