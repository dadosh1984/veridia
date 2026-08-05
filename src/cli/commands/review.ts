import fs from 'node:fs'
import { log as vlog } from '../../util/log.js'
import path from 'node:path'
import { buildReviewInstructions } from '../../review/review.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { target?: string }): void {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  if (!fs.existsSync(target)) {
    vlog.error(`review: target path does not exist: ${target}`)
    process.exitCode = 1
    return
  }
  const instructions = buildReviewInstructions(target)
  jsonOut(instructions)
}
