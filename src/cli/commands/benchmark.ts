import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { runBenchmark } from '../../measure/benchmark.js'
import type { BenchmarkTask } from '../../measure/field-benchmark.js'
import { buildFieldTable, loadCorpus, runFieldBenchmarkReport, serializeFieldReport } from '../../measure/field-benchmark.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut } from '../shared.js'

const DEFAULT_CORPUS_DIR = 'benchmark/tasks'

function resolveCorpusDir(target: string): string {
  return path.join(target, DEFAULT_CORPUS_DIR)
}

export async function handle(opts: { target?: string; runs?: string; json?: boolean; field?: boolean; output?: string }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()

  if (opts.field) {
    runField(target, opts)
    return
  }

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

function runField(target: string, opts: { json?: boolean; output?: string }): void {
  const corpusDir = resolveCorpusDir(target)
  let corpus: BenchmarkTask[]
  try {
    corpus = loadCorpus(corpusDir)
  } catch (err) {
    vlog.error((err as Error).message)
    process.exitCode = 1
    return
  }

  const report = runFieldBenchmarkReport(corpus, { dryRun: opts.json !== true, root: target })
  const json = serializeFieldReport(report)

  if (opts.output) {
    const outPath = path.resolve(opts.output)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, json, 'utf8')
    outro(`field benchmark written to ${outPath}`)
    return
  }

  if (opts.json) {
    process.stdout.write(json)
    return
  }

  const table = buildFieldTable(report)
  const lines = [table.header.join('\t')]
  for (const [level, row] of Object.entries(table.rows)) {
    lines.push([level, ...row.map((v) => (v === null ? 'unbounded' : String(v)))].join('\t'))
  }
  note(lines.join('\n'), 'Field Benchmark — $/correct-answer by level')
  outro(`field benchmark complete (${corpus.length} tasks)`)
}
