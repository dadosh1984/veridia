import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { analyzePr } from '../../analyze/pr.js'
import { jsonOut } from '../shared.js'

export async function handle(opts: { target?: string; base?: string; json?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()

  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: pr: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }

  const result = analyzePr(target, opts.base ?? 'main')

  if (opts.json) {
    jsonOut(result)
    return
  }

  note(
    `Branch: ${result.headBranch} → ${result.baseBranch}\nFiles: ${result.changedFiles.length}\nChanges: +${result.additions}/-${result.deletions}`,
    'PR Analysis',
  )
  note(
    `Type: ${result.classification.type} (${(result.classification.confidence * 100).toFixed(0)}%)\nLevel: ${result.assessment.level}\nPlan: ${result.plan.depth} / ${result.plan.tier}\nVerdict: ${result.verifyResult.verdict}`,
    'Triage',
  )
  note(
    `Files analyzed: ${result.analysis.totalFiles}\nFindings: ${result.analysis.totalFindings}\nErrors: ${result.analysis.errors}\nWarnings: ${result.analysis.warnings}`,
    'Static Analysis',
  )

  outro(`verdict: ${result.verifyResult.verdict}`)
}
