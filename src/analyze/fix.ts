import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { runAnalysis } from './analyze.js'
import type { Finding } from './types.js'

interface FixResult {
  fixed: number
  skipped: number
  errors: number
  details: { file: string; line: number; action: string }[]
}

const CONSOLE_LOG = /\bconsole\.(log|debug|info)\s*\(.*\)\s*;?\s*$/
const TODO_PATTERN = /^\s*\/\/\s*(TODO|FIXME|HACK|XXX)\b/

function fixConsoleLog(content: string): { result: string; fixed: number; lines: number[] } {
  const lines = content.split('\n')
  const fixedLines: number[] = []
  const filtered = lines.filter((line, i) => {
    if (CONSOLE_LOG.test(line)) {
      fixedLines.push(i + 1)
      return false
    }
    return true
  })
  return { result: filtered.join('\n'), fixed: fixedLines.length, lines: fixedLines }
}

function fixTodo(content: string): { result: string; fixed: number; lines: number[] } {
  const lines = content.split('\n')
  const fixedLines: number[] = []
  const filtered = lines.filter((line, i) => {
    if (TODO_PATTERN.test(line)) {
      fixedLines.push(i + 1)
      return false
    }
    return true
  })
  return { result: filtered.join('\n'), fixed: fixedLines.length, lines: fixedLines }
}

export function autoFix(target: string): FixResult {
  const analysis = runAnalysis(target)
  const details: FixResult['details'] = []
  let totalFixed = 0
  let totalSkipped = 0

  const consoleFindings = analysis.findings.filter((f) => f.pattern === 'console-log')
  const todoFindings = analysis.findings.filter((f) => f.pattern === 'todo')
  const skipFindings = analysis.findings.filter((f) => f.pattern !== 'console-log' && f.pattern !== 'todo')

  const filesToFix = new Map<string, { content: string; findings: Finding[] }>()
  for (const f of [...consoleFindings, ...todoFindings]) {
    if (!filesToFix.has(f.file)) {
      const fullPath = join(target, f.file)
      try {
        const content = readFileSync(fullPath, 'utf8')
        filesToFix.set(f.file, { content, findings: [f] })
      } catch {
        totalSkipped++
      }
    } else {
      filesToFix.get(f.file)!.findings.push(f)
    }
  }

  for (const [file, { content }] of filesToFix) {
    let current = content
    const consoleResult = fixConsoleLog(current)
    current = consoleResult.result
    for (const line of consoleResult.lines) {
      details.push({ file, line, action: 'remove console.log' })
    }
    totalFixed += consoleResult.fixed

    const todoResult = fixTodo(current)
    current = todoResult.result
    for (const line of todoResult.lines) {
      details.push({ file, line, action: 'remove TODO comment' })
    }
    totalFixed += todoResult.fixed

    if (current !== content) {
      const fullPath = join(target, file)
      writeFileSync(fullPath, current, 'utf8')
    }
  }

  totalSkipped += skipFindings.length

  return {
    fixed: totalFixed,
    skipped: totalSkipped,
    errors: analysis.errors,
    details,
  }
}
