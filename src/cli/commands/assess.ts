import fs from 'node:fs'
import path from 'node:path'
import { assess } from '../../assess/assess.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { target?: string; type?: string }): void {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: assess: target path does not exist: ${opts.target}\n`)
    process.exitCode = 1
    return
  }
  const result = assess(target, undefined, opts.type)
  jsonOut({ level: result.level, oracles: result.oracles.map((o) => o.kind) })
}
