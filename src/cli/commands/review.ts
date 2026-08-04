import fs from 'node:fs'
import path from 'node:path'
import { buildReviewInstructions } from '../../review/review.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { target?: string }): void {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: review: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }
  const instructions = buildReviewInstructions(target)
  jsonOut(instructions)
}
