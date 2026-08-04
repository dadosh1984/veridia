import path from 'node:path'
import { learn } from '../../measure/learn.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { target?: string }): void {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  const result = learn({ root: target })
  jsonOut(result)
}
