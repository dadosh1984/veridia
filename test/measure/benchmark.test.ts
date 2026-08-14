import { describe, expect, it } from 'vitest'
import { runBenchmark } from '../../src/measure/benchmark.js'

describe('runBenchmark', () => {
  it('returns mean/min/max/runs for every phase and a non-negative total', () => {
    const result = runBenchmark(process.cwd(), 3)
    // Each phase must have the expected shape
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
    // total is a sum (may be 0 if every phase was below rounding threshold)
    expect(result.total.runs).toBe(3)
    expect(result.total.mean).toBeGreaterThanOrEqual(0)
  })

  it('honours a custom runs argument', () => {
    const result = runBenchmark(process.cwd(), 5)
    expect(result.classify.runs).toBe(5)
    expect(result.assess.runs).toBe(5)
    expect(result.route.runs).toBe(5)
    expect(result.verify.runs).toBe(5)
    // analysis is capped at min(runs, 3) per the implementation
    expect(result.analysis.runs).toBe(3)
  })

  it('caps analysis runs at 3 even when runs is very large', () => {
    const result = runBenchmark(process.cwd(), 20)
    expect(result.classify.runs).toBe(20)
    expect(result.analysis.runs).toBe(3)
  })

  it('produces deterministic-ish means (same value within the same run)', () => {
    const a = runBenchmark(process.cwd(), 2)
    const b = runBenchmark(process.cwd(), 2)
    // Both should produce the same shape with finite numbers
    expect(Number.isFinite(a.classify.mean)).toBe(true)
    expect(Number.isFinite(b.classify.mean)).toBe(true)
    // Total should be sum of the phase means (rounded)
    const expectedTotal = Math.round((a.classify.mean + a.assess.mean + a.route.mean + a.verify.mean + a.analysis.mean) * 100) / 100
    expect(a.total.mean).toBe(expectedTotal)
  })
})
