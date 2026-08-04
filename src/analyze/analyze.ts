import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { collectFiles } from '../util/collect-files.js'
import { ALL_CHECKERS } from './checks.js'
import type { AnalyzeResult, Finding } from './types.js'

/**
 * Run static analysis on all source files in the target directory.
 * Applies all built-in checkers (hardcoded secrets, dangerous patterns, missing try/catch, etc.).
 *
 * @param target - The directory path to analyze.
 * @returns An AnalyzeResult with all findings and summary counts.
 */
export function runAnalysis(target: string): AnalyzeResult {
  const resolved = join(target)
  const files: string[] = []
  collectFiles(resolved, resolved, files)

  const allFindings: Finding[] = []
  for (const file of files) {
    let content: string
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    const relPath = relative(resolved, file).replace(/\\/g, '/')
    for (const checker of ALL_CHECKERS) {
      const findings = checker(relPath, content)
      allFindings.push(...findings)
    }
  }

  const errors = allFindings.filter((f) => f.severity === 'ERROR').length
  const warnings = allFindings.filter((f) => f.severity === 'WARNING').length
  const infos = allFindings.filter((f) => f.severity === 'INFO').length

  return {
    findings: allFindings,
    totalFiles: files.length,
    totalFindings: allFindings.length,
    errors,
    warnings,
    infos,
  }
}
