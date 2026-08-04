import { execSync } from 'node:child_process'
import { classify } from '../classify/classify.js'
import { assess } from '../assess/assess.js'
import { buildPlan } from '../route/route.js'
import { verify } from '../verify/verify.js'
import { probeOracles, realFs } from '../assess/probe.js'
import { loadConfig } from '../config/config.js'
import { readHistory } from '../measure/history.js'
import { computePrecision } from '../measure/learn.js'
import { runAnalysis } from './analyze.js'
import type { TaskType } from '../classify/types.js'
import type { VerifiabilityLevel } from '../assess/types.js'

export interface PrResult {
  baseBranch: string
  headBranch: string
  changedFiles: string[]
  additions: number
  deletions: number
  classification: { type: TaskType; confidence: number }
  assessment: { level: VerifiabilityLevel; oracles: string[] }
  plan: { depth: string; tier: string }
  verifyResult: { verdict: string; checks: { kind: string; passed: boolean }[] }
  analysis: { totalFiles: number; totalFindings: number; errors: number; warnings: number }
}

export function analyzePr(target: string, baseBranch = 'main'): PrResult {
  let diff: string
  try {
    diff = execSync(`git diff ${baseBranch}...HEAD --stat`, { cwd: target, encoding: 'utf8' })
  } catch {
    try {
      diff = execSync('git diff --stat HEAD', { cwd: target, encoding: 'utf8' })
    } catch {
      diff = ''
    }
  }

  const lines = diff.split('\n').filter(Boolean)
  const changedFiles: string[] = []
  let additions = 0
  let deletions = 0

  for (const line of lines) {
    const fileMatch = line.match(/^(.+?)\s+\|/)
    if (fileMatch?.[1]) changedFiles.push(fileMatch[1].trim())
    const addMatch = line.match(/(\d+) insertion/)
    const delMatch = line.match(/(\d+) deletion/)
    if (addMatch?.[1]) additions += Number(addMatch[1])
    if (delMatch?.[1]) deletions += Number(delMatch[1])
  }

  let headBranch = ''
  try {
    headBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: target, encoding: 'utf8' }).trim()
  } catch {
    headBranch = 'HEAD'
  }

  const task = `PR: ${changedFiles.length} files changed, +${additions}/-${deletions}`
  const config = loadConfig(target)
  const classification = classify(task, config)
  const assessment = assess(target, undefined, undefined, config)
  const plan = buildPlan(classification.type, assessment.level)
  const kinds = probeOracles(target, realFs).map((o) => o.kind)
  const historyEntries = readHistory({ root: target })
  const precision = computePrecision(historyEntries)
  const verifyResult = verify(target, assessment.level, kinds, { precision, weights: config.weights })
  const analysis = runAnalysis(target)

  return {
    baseBranch,
    headBranch,
    changedFiles,
    additions,
    deletions,
    classification: { type: classification.type, confidence: classification.confidence },
    assessment: { level: assessment.level, oracles: kinds },
    plan: { depth: plan.depth, tier: plan.tier },
    verifyResult: { verdict: verifyResult.verdict, checks: verifyResult.checks.map((c: { kind: string; passed: boolean }) => ({ kind: c.kind, passed: c.passed })) },
    analysis: { totalFiles: analysis.totalFiles, totalFindings: analysis.totalFindings, errors: analysis.errors, warnings: analysis.warnings },
  }
}
