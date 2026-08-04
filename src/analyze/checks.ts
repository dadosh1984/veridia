import type { Finding, Severity } from './types.js'

/** A function that checks a file for specific issues and returns findings. */
export type Checker = (filePath: string, content: string) => Finding[]

const SECRET_PATTERN = /(api[_-]?key|apikey|secret|password|token|credential|private_key|access_key)\s*[:=]\s*["'][^"'\s]{8,}["']/i
const DANGEROUS_PATTERNS = [
  { pattern: /\beval\s*\(/, description: 'eval() call — potential code injection', severity: 'ERROR' as Severity },
  { pattern: /shell\s*:\s*true/, description: 'shell: true — potential command injection', severity: 'ERROR' as Severity },
  { pattern: /\bnew\s+Function\s*\(/, description: 'new Function() — potential code injection', severity: 'ERROR' as Severity },
  { pattern: /\bexec(File)?Sync?\s*\(/, description: 'exec() call — potential command injection', severity: 'WARNING' as Severity },
]
const CONSOLE_LOG = /\bconsole\.(log|debug|info)\s*\(/
const TODO_PATTERN = /\b(TODO|FIXME|HACK|XXX)\b/

const DANGEROUS_CALLS = [
  { call: 'readFileSync', severity: 'WARNING' as Severity },
  { call: 'JSON.parse', severity: 'WARNING' as Severity },
  { call: 'readdirSync', severity: 'WARNING' as Severity },
  { call: 'writeFileSync', severity: 'WARNING' as Severity },
]

function hasTryCatch(content: string, callIndex: number): boolean {
  const lines = content.slice(0, callIndex).split('\n')
  let braceCount = 0
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i]
    if (!l) continue
    if (l.includes('try {')) return true
    if (l.includes('try')) {
      const afterLine = content.split('\n').slice(i).join('\n').slice(0, 200)
      if (afterLine.includes('{')) return true
    }
    braceCount += (l.match(/{/g) || []).length
    braceCount -= (l.match(/}/g) || []).length
    if (braceCount <= 0 && i < lines.length - 1) break
  }
  return false
}

/**
 * Check for hardcoded secrets (API keys, passwords, tokens) in file content.
 *
 * @param filePath - The file path for reporting.
 * @param content - The file content to scan.
 * @returns An array of findings for any detected secrets.
 */
export const checkHardcodedSecrets: Checker = (filePath, content) => {
  const findings: Finding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const match = SECRET_PATTERN.exec(line)
    if (match) {
      findings.push({
        severity: 'ERROR',
        file: filePath,
        line: i + 1,
        column: match.index + 1,
        description: `Possible hardcoded secret: ${match[0].slice(0, 40)}...`,
        pattern: 'hardcoded-secret',
      })
    }
  }
  return findings
}

/**
 * Check for dangerous code patterns (eval, shell:true, new Function, exec calls).
 *
 * @param filePath - The file path for reporting.
 * @param content - The file content to scan.
 * @returns An array of findings for any dangerous patterns detected.
 */
export const checkDangerousPatterns: Checker = (filePath, content) => {
  const findings: Finding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    for (const dp of DANGEROUS_PATTERNS) {
      const match = dp.pattern.exec(line)
      if (match) {
        findings.push({
          severity: dp.severity,
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          description: dp.description,
          pattern: 'dangerous-pattern',
        })
      }
    }
  }
  return findings
}

/**
 * Check for synchronous I/O calls (readFileSync, JSON.parse, etc.) that are not wrapped in try/catch.
 *
 * @param filePath - The file path for reporting.
 * @param content - The file content to scan.
 * @returns An array of findings for any missing try/catch blocks.
 */
export const checkMissingTryCatch: Checker = (filePath, content) => {
  const findings: Finding[] = []
  for (const dc of DANGEROUS_CALLS) {
    let idx = 0
    while (true) {
      const pos = content.indexOf(dc.call, idx)
      if (pos === -1) break
      const lineNum = content.slice(0, pos).split('\n').length
      if (!hasTryCatch(content, pos)) {
        findings.push({
          severity: dc.severity,
          file: filePath,
          line: lineNum,
          column: pos - content.lastIndexOf('\n', pos),
          description: `${dc.call} without try/catch — may crash on error`,
          pattern: 'missing-try-catch',
        })
      }
      idx = pos + 1
    }
  }
  return findings
}

/**
 * Check for console.log/debug/info statements left in production code.
 *
 * @param filePath - The file path for reporting.
 * @param content - The file content to scan.
 * @returns An array of findings for any console statements detected.
 */
export const checkConsoleLog: Checker = (filePath, content) => {
  const findings: Finding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const match = CONSOLE_LOG.exec(line)
    if (match) {
      findings.push({
        severity: 'INFO',
        file: filePath,
        line: i + 1,
        column: match.index + 1,
        description: `console.${match[1]}() left in code`,
        pattern: 'console-log',
      })
    }
  }
  return findings
}

/**
 * Check for TODO/FIXME/HACK/XXX comments left in code.
 *
 * @param filePath - The file path for reporting.
 * @param content - The file content to scan.
 * @returns An array of findings for any TODO markers detected.
 */
export const checkTodo: Checker = (filePath, content) => {
  const findings: Finding[] = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const match = TODO_PATTERN.exec(line)
    if (match) {
      findings.push({
        severity: 'INFO',
        file: filePath,
        line: i + 1,
        column: match.index + 1,
        description: `${match[1]} comment left in code`,
        pattern: 'todo',
      })
    }
  }
  return findings
}

/** All built-in checkers applied during static analysis. */
export const ALL_CHECKERS: Checker[] = [checkHardcodedSecrets, checkDangerousPatterns, checkMissingTryCatch, checkConsoleLog, checkTodo]
