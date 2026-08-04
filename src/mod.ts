/**
 * veridia — model-agnostic quality through mechanics.
 *
 * Core API exports for programmatic use.
 *
 * @module veridia
 */

export { runAnalysis } from './analyze/analyze.js'
export { autoFix } from './analyze/fix.js'
export { analyzePr } from './analyze/pr.js'
export { generateHtmlReport, generateReport } from './analyze/report.js'
export type { AnalyzeResult, Finding, Severity } from './analyze/types.js'
export { ask, askInteractive } from './ask/ask.js'
export type { AskResult, ClarifyingQuestion } from './ask/types.js'
export { assess } from './assess/assess.js'
export { probeOracles, realFs } from './assess/probe.js'
export type { Assessment, Oracle, OracleKind, VerifiabilityLevel } from './assess/types.js'
export { classify } from './classify/classify.js'
export type { Classification, TaskType } from './classify/types.js'
export type { VeridiaConfig } from './config/config.js'
export { loadConfig } from './config/config.js'
export type { BenchmarkResult } from './measure/benchmark.js'
export { runBenchmark } from './measure/benchmark.js'
export { appendEntry, readHistory } from './measure/history.js'
export { computePrecision, learn } from './measure/learn.js'
export { measureHistory, measureRecord } from './measure/measure.js'
export { buildPlan } from './route/route.js'
export type { ModelTier, OrchestrationDepth, RunPlan } from './route/types.js'
export type { TriageOptions, TriageResult } from './triage/triage.js'
export { triage } from './triage/triage.js'
export { computeSensitivity, mutate } from './verify/mutate.js'
export { resolveCommands } from './verify/resolve.js'
export { runCommand } from './verify/run.js'
export type { Check, Verdict, VerifyResult } from './verify/types.js'
export { deriveVerdict, verify } from './verify/verify.js'
export { baseWeight, calibrateWeight, isTestsWeak } from './verify/weight.js'
