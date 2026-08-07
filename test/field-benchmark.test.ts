import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { BenchmarkTask, FieldRunDeps, PipelineResult } from '../src/measure/field-benchmark.js'
import {
  buildFieldTable,
  computeCorrectPerDollar,
  feedFieldHistory,
  loadCorpus,
  matchesGolden,
  normalizeText,
  runFieldBenchmark,
  runFieldBenchmarkReport,
  selectPipeline,
  serializeFieldReport,
} from '../src/measure/field-benchmark.js'
import { readHistory } from '../src/measure/history.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-field-'))
  tmpDirs.push(dir)
  return dir
}

function task(over: Partial<BenchmarkTask> = {}): BenchmarkTask {
  return { id: 't1', level: 2, type: 'feature', repo: 'r', task: 'fix', golden: 'golden output', ...over }
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('task 1.1 schema / normalizeText / matchesGolden', () => {
  it('normalizeText trims, lowercases, and normalizes CRLF', () => {
    expect(normalizeText('  Hello\r\nWorld  ')).toBe('hello\nworld')
  })

  it('matchesGolden returns true for equal normalized text', () => {
    expect(matchesGolden('Golden Output', 'golden output')).toBe(true)
  })

  it('matchesGolden returns false for distinct text', () => {
    expect(matchesGolden('completely different', 'golden output')).toBe(false)
  })
})

describe('task 1.2/1.3 corpus loader', () => {
  it('loads tasks from JSON files in the tasks dir', () => {
    const dir = makeTmpDir()
    const tasksDir = path.join(dir, 'tasks')
    fs.mkdirSync(tasksDir, { recursive: true })
    const corpus = [
      { id: 'a', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'b', level: 3, type: 'bugfix', repo: 'r', task: 'y', golden: '2' },
      { id: 'c', level: 3, type: 'doc', repo: 'r', task: 'z', golden: '3' },
      { id: 'd', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'e', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'f', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'g', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'h', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'i', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'j', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'k', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'l', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'm', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'n', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'o', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'p', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'q', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'r', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 's', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 't', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
    ]
    fs.writeFileSync(path.join(tasksDir, 'corpus.json'), JSON.stringify({ tasks: corpus }), 'utf8')
    const loaded = loadCorpus(tasksDir)
    expect(loaded).toHaveLength(20)
    expect(loaded[0].id).toBe('a')
  })

  it('throws when a level has fewer than 5 tasks', () => {
    const dir = makeTmpDir()
    const tasksDir = path.join(dir, 'tasks')
    fs.mkdirSync(tasksDir, { recursive: true })
    const corpus = [
      { id: 'a', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'b', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'c', level: 3, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'd', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'e', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'f', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'g', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'h', level: 2, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'i', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'j', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'k', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'l', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'm', level: 1, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'n', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'o', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'p', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'q', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
      { id: 'r', level: 0, type: 'feature', repo: 'r', task: 'x', golden: '1' },
    ]
    fs.writeFileSync(path.join(tasksDir, 'corpus.json'), JSON.stringify({ tasks: corpus }), 'utf8')
    expect(() => loadCorpus(tasksDir)).toThrow(/at least 5 tasks per level/m)
  })

  it('throws clearly when the tasks dir is missing', () => {
    const missing = path.join(makeTmpDir(), 'nope')
    expect(() => loadCorpus(missing)).toThrow(/tasks dir does not exist/)
  })
})

describe('task 2.2 strategies / 2.4 false positives / 3.1 $/correct', () => {
  it('selectPipeline routes by pipeline id', () => {
    expect(selectPipeline('ws')).toBe('ws')
    expect(selectPipeline('always-best')).toBe('always-best')
    expect(selectPipeline('always-cheap')).toBe('always-cheap')
  })

  it('records a false positive when oracle passes but answer is wrong', () => {
    const t = task({ golden: 'expected' })
    const deps: FieldRunDeps = {
      actual: () => 'wrong answer',
      costOf: (p) => (p === 'always-best' ? 100 : 10),
    }
    const result = runFieldBenchmark(t, 'ws', deps)
    expect(result.correct).toBe(false)
    expect(result.verdict).toBe('PASS')
    expect(result.falsePositive).toBe(true)
  })

  it('computes $/correct-answer per pipeline', () => {
    // ws: 2 correct of 3 -> costPerCorrect
    const results: PipelineResult[] = [
      { pipeline: 'ws', taskId: 'a', level: 3, correct: true, cost: 10, verdict: 'PASS' },
      { pipeline: 'ws', taskId: 'b', level: 3, correct: true, cost: 20, verdict: 'PASS' },
      { pipeline: 'ws', taskId: 'c', level: 3, correct: false, cost: 5, verdict: 'FAIL' },
    ]
    const metric = computeCorrectPerDollar('ws', results)
    expect(metric.correctCount).toBe(2)
    expect(metric.costOfCorrect).toBe(30)
    expect(metric.costPerCorrect).toBe(15)
  })

  it('reports unbounded $/correct when zero correct', () => {
    const results: PipelineResult[] = [{ pipeline: 'ws', taskId: 'a', level: 2, correct: false, cost: 50, verdict: 'FAIL' }]
    const metric = computeCorrectPerDollar('ws', results)
    expect(metric.correctCount).toBe(0)
    expect(metric.costPerCorrect).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('task 3.2 deterministic report', () => {
  const corpus: BenchmarkTask[] = Array.from({ length: 5 }, (_, i) => ({
    id: `t${i}`,
    level: 3 as const,
    type: 'feature' as const,
    repo: 'r',
    task: 'x',
    golden: 'golden output',
  }))

  it('two identical runs produce byte-identical JSON', () => {
    const deps: FieldRunDeps = { dryRun: true, actual: () => 'golden output', costOf: (p) => (p === 'always-best' ? 100 : 10) }
    const a = serializeFieldReport(runFieldBenchmarkReport(corpus, deps))
    const b = serializeFieldReport(runFieldBenchmarkReport(corpus, deps))
    expect(a).toBe(b)
  })

  it('report JSON is parseable and contains economics fields', () => {
    const deps: FieldRunDeps = { dryRun: true, actual: () => 'golden output', costOf: (p) => (p === 'always-best' ? 100 : 10) }
    const json = serializeFieldReport(runFieldBenchmarkReport(corpus, deps))
    const parsed = JSON.parse(json)
    expect(parsed.protocol).toBe('veridia/field-benchmark/v1')
    expect(parsed.perPipeline).toBeDefined()
    expect(parsed.perLevel).toBeDefined()
  })

  it('buildFieldTable exposes level rows and pipeline columns', () => {
    const deps: FieldRunDeps = { dryRun: true, actual: () => 'golden output', costOf: (p) => (p === 'always-best' ? 100 : 10) }
    const table = buildFieldTable(runFieldBenchmarkReport(corpus, deps))
    expect(table.header).toEqual(['level', 'ws', 'always-best', 'always-cheap'])
    expect(table.rows['3']).toHaveLength(3)
  })
})

describe('task 3.3 history feeding for H3', () => {
  it('feedFieldHistory records entries with cost and oracle results', () => {
    const root = makeTmpDir()
    feedFieldHistory([{ pipeline: 'ws', taskId: 'a', level: 3, correct: true, cost: 10, verdict: 'PASS', falsePositive: false }], { root })
    const entries = readHistory({ root })
    expect(entries).toHaveLength(1)
    expect(entries[0].cost).toBe(10)
    expect(entries[0].oracleResults).toEqual([{ kind: 'test-runner', truePositives: 1, falsePositives: 0 }])
  })

  it('feedFieldHistory is a no-op when historyDeps is absent', () => {
    expect(() => feedFieldHistory([], undefined)).not.toThrow()
  })
})
