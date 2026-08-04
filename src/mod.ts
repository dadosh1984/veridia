/**
 * veridia — model-agnostic quality through mechanics.
 *
 * Core API exports for programmatic use.
 *
 * @module veridia
 */

export { classify } from './classify/classify.js'
export type { Classification, TaskType } from './classify/types.js'
export { assess } from './assess/assess.js'
export { probeOracles, realFs } from './assess/probe.js'
export type { Assessment, Oracle, OracleKind, VerifiabilityLevel } from './assess/types.js'
export { buildPlan } from './route/route.js'
export type { OrchestrationDepth, ModelTier, RunPlan } from './route/types.js'
export { ask, askInteractive } from './ask/ask.js'
export type { AskResult, ClarifyingQuestion } from './ask/types.js'
export { verify, deriveVerdict } from './verify/verify.js'
export type { Check, Verdict, VerifyResult } from './verify/types.js'
export { runCommand } from './verify/run.js'
export { baseWeight, calibrateWeight, isTestsWeak } from './verify/weight.js'
export { resolveCommands } from './verify/resolve.js'
export { mutate, computeSensitivity } from './verify/mutate.js'
export { measureRecord, measureHistory } from './measure/measure.js'
export { learn, computePrecision } from './measure/learn.js'
export { readHistory, appendHistory } from './measure/history.js'
export { loadConfig } from './config/config.js'
export type { VeridiaConfig } from './config/config.js'
export { triage } from './triage/triage.js'
export type { TriageResult, TriageOptions } from './triage/triage.js'
export { runAnalysis } from './analyze/analyze.js'
export type { AnalyzeResult, Finding, Severity } from './analyze/types.js'
export { autoFix } from './analyze/fix.js'
export { generateReport, generateHtmlReport } from './analyze/report.js'
export { analyzePr } from './analyze/pr.js'
export { runBenchmark } from './measure/benchmark.js'
export type { BenchmarkResult } from './measure/benchmark.js'
