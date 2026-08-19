import { describe, expect, it } from 'vitest'
import { runBenchmark } from '../../src/measure/benchmark.js'

// benchmark runs heavy I/O probes × N runs on Windows; bump timeout.
// ponytail: rung 4 (native platform) — setTimeout per-platform; no deps.
const BENCH_TIMEOUT = process.platform === 'win32' ? 30_000 : 15_000

describe('runBenchmark', () => {
  it(
    'returns mean/min/max/runs for every phase and a non-negative total',
    () => {
      const result = runBenchmark(process.cwd(), 3)
      for (const phase of ['classify', 'assess', 'route', 'verify', 'analysis'] as const) {
        expect(result[phase]).toMatchObject({
          mean: expect.any(Number),
          min: expect.any(Number),
          max: expect.any(Number),
          runs: expect.any(Number),
        })
        expect(result[phase].runs).toBe(phase === 'analysis' ? Math.min(3, 3) : 3)
        expect(result[phase].mean).toBeGreaterThanOrEqual(0)
        expect(result[phase].min).toBeLessThanOrEqual(result[phase].max)
      }
      expect(result.total.runs).toBe(3)
      expect(result.total.mean).toBeGreaterThanOrEqual(0)
    },
    BENCH_TIMEOUT,
  )

  it(
    'honours a custom runs argument',
    () => {
      const result = runBenchmark(process.cwd(), 5)
      expect(result.classify.runs).toBe(5)
      expect(result.assess.runs).toBe(5)
      expect(result.route.runs).toBe(5)
      expect(result.verify.runs).toBe(5)
      expect(result.analysis.runs).toBe(3)
    },
    BENCH_TIMEOUT,
  )

  it(
    'caps analysis runs at 3 even when runs is very large',
    () => {
      const result = runBenchmark(process.cwd(), 20)
      expect(result.classify.runs).toBe(20)
      expect(result.analysis.runs).toBe(3)
    },
    BENCH_TIMEOUT * 2, // 20 runs of every phase + analysis
  )

  it(
    'produces deterministic-ish means (same value within the same run)',
    () => {
      const a = runBenchmark(process.cwd(), 2)
      const b = runBenchmark(process.cwd(), 2)
      expect(Number.isFinite(a.classify.mean)).toBe(true)
      expect(Number.isFinite(b.classify.mean)).toBe(true)
      const expectedTotal = Math.round((a.classify.mean + a.assess.mean + a.route.mean + a.verify.mean + a.analysis.mean) * 100) / 100
      expect(a.total.mean).toBe(expectedTotal)
    },
    BENCH_TIMEOUT,
  )
})
