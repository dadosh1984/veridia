import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import { loadConfig } from '../config/config.js'
import { buildPlan } from '../route/route.js'
import type { RunFn } from '../verify/run.js'
import type { Verdict } from '../verify/types.js'
import { verify } from '../verify/verify.js'
import { appendEntry, readHistory } from './history.js'
import { computePrecision } from './learn.js'

/** A single task in the field-validation corpus. */
export interface BenchmarkTask {
  /** Unique task identifier. */
  id: string
  /** Assessed verifiability level (0-3). */
  level: VerifiabilityLevel
  /** Classified task type. */
  type: TaskType
  /** Target repository or directory to probe. */
  repo: string
  /** The task description. */
  task: string
  /** The known-good result to compare against. */
  golden: string
}

/** The three pipeline strategies compared by the field benchmark. */
export type PipelineId = 'ws' | 'always-best' | 'always-cheap'

/** Dependencies for the field benchmark runner. */
export interface FieldRunDeps {
  /** Produce the actual work product for a task under a pipeline (defaults to golden). */
  actual?: (task: BenchmarkTask, pipeline: PipelineId) => string
  /** Cost (tokens/currency) of running a task under a pipeline (defaults to tier-based). */
  costOf?: (pipeline: PipelineId, task: BenchmarkTask) => number
  /** If true, never run real shell commands (used in tests / dry runs). */
  dryRun?: boolean
  /** Root directory for reading local history precision. */
  root?: string
  /** Custom verify run function. */
  run?: RunFn
}

/** Per-task outcome from running a single pipeline. */
export interface PipelineResult {
  /** The pipeline that produced this outcome. */
  pipeline: PipelineId
  /** The task id this outcome belongs to. */
  taskId: string
  /** The task's verifiability level. */
  level: VerifiabilityLevel
  /** Whether the actual output matched the golden result. */
  correct: boolean
  /** The cost of running the task under this pipeline. */
  cost: number
  /** The verification verdict. */
  verdict: Verdict
  /** True when the oracle passed (PASS) but the answer was wrong. */
  falsePositive: boolean
}

/** Cost-per-correct metric for a pipeline over a set of outcomes. */
export interface CorrectPerDollar {
  pipeline: PipelineId
  correctCount: number
  costOfCorrect: number
  costPerCorrect: number
}

const PIPELINES: PipelineId[] = ['ws', 'always-best', 'always-cheap']

/**
 * Return a pipeline id unchanged. Exists so callers validate/exercise the union type.
 *
 * @param pipeline - The pipeline id.
 * @returns The same pipeline id.
 */
export function selectPipeline(pipeline: PipelineId): PipelineId {
  return pipeline
}

/**
 * Normalize text for comparison: lowercase, trim, and collapse CRLF/whitespace runs.
 *
 * @param s - The text to normalize.
 * @returns The normalized text.
 */
export function normalizeText(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/[ \t]+/g, ' ')
    .toLowerCase()
}

/**
 * Compare actual output to the golden result. A meaningful-overlap heuristic:
 * equal normalized text, or (for long goldens) enough token overlap.
 *
 * @param actual - The produced output.
 * @param golden - The expected output.
 * @returns True when the actual is considered correct.
 */
export function matchesGolden(actual: string, golden: string): boolean {
  const a = normalizeText(actual)
  const g = normalizeText(golden)
  if (a === g) return true
  if (g.length < 40) return false
  const aTokens = new Set(a.split(/\s+/))
  const gTokens = g.split(/\s+/)
  const overlap = gTokens.filter((t) => aTokens.has(t)).length
  return overlap / gTokens.length >= 0.8
}

/**
 * Load a corpus from a directory of JSON files. Each file may be a top-level array of
 * tasks or an object with a `tasks` array. Enforces at least 5 tasks per level 0..3.
 *
 * @param dir - The directory containing corpus JSON files.
 * @returns The concatenated task list.
 */
export function loadCorpus(dir: string): BenchmarkTask[] {
  if (!existsSync(dir)) {
    throw new Error(`field benchmark: tasks dir does not exist: ${dir}`)
  }
  const tasks: BenchmarkTask[] = []
  for (const name of ['corpus.json', 'corpus.jsonl', ...readDirJson(dir)]) {
    const file = join(dir, name)
    if (!existsSync(file)) continue
    const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error(`field benchmark: invalid JSON in ${file}`)
    }
    const list = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { tasks?: unknown }).tasks) ? (parsed as { tasks: BenchmarkTask[] }).tasks : []
    tasks.push(...(list as BenchmarkTask[]))
  }
  for (let level = 0; level <= 3; level++) {
    const count = tasks.filter((t) => t.level === level).length
    if (count < 5) {
      throw new Error(`field benchmark: corpus invalid — level ${level} has ${count} tasks; requires at least 5 tasks per level 0..3`)
    }
  }
  return tasks
}

function readDirJson(dir: string): string[] {
  try {
    return readdirSync(dir).filter((n) => n.endsWith('.json') && n !== 'corpus.json')
  } catch {
    return []
  }
}

/** Default cost for a pipeline: ws adapts to level tier, always-best is most expensive. */
function defaultCost(pipeline: PipelineId, level: VerifiabilityLevel): number {
  switch (pipeline) {
    case 'always-best':
      return 100
    case 'always-cheap':
      return 10
    case 'ws':
      return level <= 1 ? 10 : level === 2 ? 30 : 20
  }
}

/**
 * Run a single pipeline against a task and produce an outcome.
 *
 * @param task - The corpus task.
 * @param pipeline - Which pipeline strategy to run.
 * @param deps - Runner dependencies (actual output, cost, dry-run).
 * @returns A PipelineResult.
 */
export function runFieldBenchmark(task: BenchmarkTask, pipeline: PipelineId, deps: FieldRunDeps = {}): PipelineResult {
  const actual = deps.actual ? deps.actual(task, pipeline) : task.golden
  const cost = deps.costOf ? deps.costOf(pipeline, task) : defaultCost(pipeline, task.level)
  const correct = matchesGolden(actual, task.golden)

  let verdict: Verdict
  if (pipeline === 'ws') {
    const config = loadConfig(task.repo)
    const precision = computePrecision(readHistory({ root: deps.root ?? task.repo }))
    const plan = buildPlan(task.type, task.level)
    const kinds = plan.checks.map((c) => (c === 'run-tests' ? 'test-runner' : c === 'type-check' ? 'type-check' : 'human-review')) as Parameters<
      typeof verify
    >[2]
    const result = verify(task.repo, task.level, kinds, {
      dryRun: deps.dryRun ?? true,
      precision,
      weights: config.weights,
      run: deps.run,
    })
    verdict = result.verdict
  } else if (pipeline === 'always-best') {
    verdict = 'PASS'
  } else {
    verdict = task.level <= 1 ? 'HUMAN' : 'PASS'
  }

  const falsePositive = verdict === 'PASS' && !correct
  return { pipeline, taskId: task.id, level: task.level, correct, cost, verdict, falsePositive }
}

/**
 * Compute the $/correct-answer metric for a pipeline from its outcomes.
 * Unbounded (Infinity) when there are no correct answers.
 *
 * @param pipeline - The pipeline id.
 * @param results - All outcomes for that pipeline.
 * @returns The CorrectPerDollar metric.
 */
export function computeCorrectPerDollar(pipeline: PipelineId, results: PipelineResult[]): CorrectPerDollar {
  const mine = results.filter((r) => r.pipeline === pipeline)
  const correct = mine.filter((r) => r.correct)
  const costOfCorrect = correct.reduce((a, r) => a + r.cost, 0)
  const costPerCorrect = correct.length > 0 ? costOfCorrect / correct.length : Number.POSITIVE_INFINITY
  return { pipeline, correctCount: correct.length, costOfCorrect, costPerCorrect }
}

/**
 * Run the full field benchmark over a corpus and produce a deterministic report.
 *
 * @param corpus - The loaded task list.
 * @param deps - Runner dependencies.
 * @returns The field-benchmark report.
 */
export function runFieldBenchmarkReport(corpus: BenchmarkTask[], deps: FieldRunDeps = {}): FieldReport {
  const results: PipelineResult[] = []
  for (const t of corpus) {
    for (const p of PIPELINES) {
      results.push(runFieldBenchmark(t, p, deps))
    }
  }

  const perPipeline: Record<string, { correct: number; total: number; costPerCorrect: number; falsePositives: number }> = {}
  for (const p of PIPELINES) {
    const metric = computeCorrectPerDollar(p, results)
    const mine = results.filter((r) => r.pipeline === p)
    perPipeline[p] = {
      correct: metric.correctCount,
      total: mine.length,
      costPerCorrect: metric.costPerCorrect,
      falsePositives: mine.filter((r) => r.falsePositive).length,
    }
  }

  const perLevel: Record<string, Record<string, number>> = {}
  for (let level = 0; level <= 3; level++) {
    const row: Record<string, number> = {}
    for (const p of PIPELINES) {
      const mine = results.filter((r) => r.pipeline === p && r.level === level)
      const correct = mine.filter((r) => r.correct).length
      const costOfCorrect = mine.filter((r) => r.correct).reduce((a, r) => a + r.cost, 0)
      row[p] = correct > 0 ? costOfCorrect / correct : Number.POSITIVE_INFINITY
    }
    perLevel[String(level)] = row
  }

  return { protocol: 'veridia/field-benchmark/v1', perPipeline, perLevel }
}

/** The machine-readable field benchmark report. */
export interface FieldReport {
  /** Protocol identifier for the report format. */
  protocol: 'veridia/field-benchmark/v1'
  /** Per-pipeline aggregate metrics. */
  perPipeline: Record<string, { correct: number; total: number; costPerCorrect: number; falsePositives: number }>
  /** Per-level $/correct-answer for each pipeline. */
  perLevel: Record<string, Record<string, number>>
}

/** All pipeline strategy ids. */
export const PIPELINE_IDS: readonly PipelineId[] = PIPELINES

/** A parsed-and-rounded snapshot of a report for stable serialization. */
export interface FieldReportSnapshot {
  protocol: 'veridia/field-benchmark/v1'
  perPipeline: Record<string, { correct: number; total: number; costPerCorrect: number | null; falsePositives: number }>
  perLevel: Record<string, Record<string, number | null>>
}

/**
 * Round numbers and normalize unbounded values to a stable representation so identical
 * runs produce byte-identical JSON regardless of float representation.
 *
 * @param report - The report to snapshot.
 * @returns A new, deterministically-shaped report object.
 */
export function snapshotFieldReport(report: FieldReport): FieldReportSnapshot {
  const perPipeline: Record<string, { correct: number; total: number; costPerCorrect: number | null; falsePositives: number }> = {}
  for (const [p, v] of Object.entries(report.perPipeline)) {
    perPipeline[p] = {
      correct: v.correct,
      total: v.total,
      costPerCorrect: Number.isFinite(v.costPerCorrect) ? Math.round(v.costPerCorrect * 100) / 100 : null,
      falsePositives: v.falsePositives,
    }
  }
  const perLevel: Record<string, Record<string, number | null>> = {}
  for (const [level, row] of Object.entries(report.perLevel)) {
    perLevel[level] = {}
    for (const [p, v] of Object.entries(row)) {
      perLevel[level][p] = Number.isFinite(v) ? Math.round(v * 100) / 100 : null
    }
  }
  return { protocol: 'veridia/field-benchmark/v1', perPipeline, perLevel }
}

/**
 * Serialize a field report to deterministic JSON (stable key order, rounded values).
 *
 * @param report - The report to serialize.
 * @returns A JSON string.
 */
export function serializeFieldReport(report: FieldReport): string {
  return `${JSON.stringify(snapshotFieldReport(report), null, 2)}\n`
}

/** A per-level, per-pipeline $/correct table row. */
export interface FieldTable {
  header: string[]
  rows: Record<string, (number | null)[]>
}

/**
 * Build a human-readable summary table from a field report.
 *
 * @param report - The field report.
 * @returns A table with pipeline columns and level rows.
 */
export function buildFieldTable(report: FieldReport): FieldTable {
  const header = ['level', ...PIPELINE_IDS]
  const rows: Record<string, (number | null)[]> = {}
  for (let level = 0; level <= 3; level++) {
    const row = report.perLevel[String(level)] ?? {}
    rows[String(level)] = PIPELINE_IDS.map((p) => {
      const v = row[p]
      return Number.isFinite(v ?? Number.POSITIVE_INFINITY) ? Math.round((v ?? 0) * 100) / 100 : null
    })
  }
  return { header, rows }
}

/**
 * Optionally feed field-run outcomes into local history as MeasureEntry records so the
 * learn loop's precision (H3) observes real data. No-op when historyDeps is not provided.
 *
 * @param results - The per-task pipeline outcomes.
 * @param historyDeps - Optional history dependencies (root). When absent, records nothing.
 */
export function feedFieldHistory(results: PipelineResult[], historyDeps: unknown): void {
  if (!historyDeps) return
  for (const r of results) {
    appendEntry(
      {
        task: `[field] ${r.taskId}`,
        type: 'feature',
        level: r.level,
        verdict: r.verdict,
        checks: [],
        drift: r.correct ? '' : '1',
        cost: r.cost,
        oracleResults: r.falsePositive
          ? [{ kind: 'test-runner', truePositives: 0, falsePositives: 1 }]
          : r.verdict === 'PASS'
            ? [{ kind: 'test-runner', truePositives: 1, falsePositives: 0 }]
            : undefined,
      },
      historyDeps as { root?: string },
    )
  }
}
