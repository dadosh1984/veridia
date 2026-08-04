import { performance } from 'node:perf_hooks'
import { runAnalysis } from '../analyze/analyze.js'
import { assess } from '../assess/assess.js'
import { probeOracles, realFs } from '../assess/probe.js'
import { classify } from '../classify/classify.js'
import { loadConfig } from '../config/config.js'
import { readHistory } from '../measure/history.js'
import { computePrecision } from '../measure/learn.js'
import { buildPlan } from '../route/route.js'
import { verify } from '../verify/verify.js'

export interface BenchmarkResult {
  classify: { mean: number; min: number; max: number; runs: number }
  assess: { mean: number; min: number; max: number; runs: number }
  route: { mean: number; min: number; max: number; runs: number }
  verify: { mean: number; min: number; max: number; runs: number }
  analysis: { mean: number; min: number; max: number; runs: number }
  total: { mean: number; min: number; max: number; runs: number }
}

function bench(fn: () => void, runs = 10): { mean: number; min: number; max: number; runs: number } {
  const times: number[] = []
  for (let i = 0; i < runs; i++) {
    const start = performance.now()
    fn()
    const end = performance.now()
    times.push(end - start)
  }
  return {
    mean: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100,
    min: Math.round(Math.min(...times) * 100) / 100,
    max: Math.round(Math.max(...times) * 100) / 100,
    runs,
  }
}

export function runBenchmark(target: string, runs = 10): BenchmarkResult {
  const config = loadConfig(target)

  const classifyResult = bench(() => classify('fix login bug and add dark mode support', config), runs)
  const assessResult = bench(() => assess(target, undefined, undefined, config), runs)
  const routeResult = bench(() => buildPlan('feature', 3), runs)

  const kinds = probeOracles(target, realFs).map((o) => o.kind)
  const historyEntries = readHistory({ root: target })
  const precision = computePrecision(historyEntries)
  const verifyResult = bench(() => verify(target, 3, kinds, { precision, weights: config.weights, dryRun: true }), runs)

  const analysisResult = bench(() => runAnalysis(target), Math.min(runs, 3))

  const totalMean = Math.round((classifyResult.mean + assessResult.mean + routeResult.mean + verifyResult.mean + analysisResult.mean) * 100) / 100

  return {
    classify: classifyResult,
    assess: assessResult,
    route: routeResult,
    verify: verifyResult,
    analysis: analysisResult,
    total: { mean: totalMean, min: 0, max: 0, runs },
  }
}
