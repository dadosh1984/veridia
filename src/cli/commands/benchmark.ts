import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { runBenchmark } from '../../measure/benchmark.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut } from '../shared.js'

export async function handle(opts: { target?: string; runs?: string; json?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  const runs = opts.runs ? Number(opts.runs) : 10

  if (!fs.existsSync(target)) {
    vlog.error(`benchmark: target path does not exist: ${target}`)
    process.exitCode = 1
    return
  }

  const result = runBenchmark(target, runs)

  if (opts.json) {
    jsonOut(result)
    return
  }

  note(
    `classify: ${result.classify.mean}ms (min: ${result.classify.min}ms, max: ${result.classify.max}ms, runs: ${result.classify.runs})
assess:   ${result.assess.mean}ms (min: ${result.assess.min}ms, max: ${result.assess.max}ms, runs: ${result.assess.runs})
route:    ${result.route.mean}ms (min: ${result.route.min}ms, max: ${result.route.max}ms, runs: ${result.route.runs})
verify:   ${result.verify.mean}ms (min: ${result.verify.min}ms, max: ${result.verify.max}ms, runs: ${result.verify.runs})
analysis: ${result.analysis.mean}ms (min: ${result.analysis.min}ms, max: ${result.analysis.max}ms, runs: ${result.analysis.runs})
total:    ${result.total.mean}ms`,
    'Benchmark Results',
  )

  outro(`benchmark complete (${runs} runs each)`)
}
