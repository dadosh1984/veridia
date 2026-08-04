import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assess } from '../assess/assess.js'
import { loadConfig } from '../config/config.js'
import { readHistory } from '../measure/history.js'
import { computePrecision } from '../measure/learn.js'
import { runAnalysis } from './analyze.js'

function currentVersion(): string {
  try {
    let dir = dirname(fileURLToPath(import.meta.url))
    for (let i = 0; i < 6; i++) {
      const pkgPath = join(dir, 'package.json')
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string }
        return pkg.version ?? 'unknown'
      }
      dir = dirname(dir)
    }
  } catch {
    return 'unknown'
  }
  return 'unknown'
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function generateReport(target: string): string {
  const analysis = runAnalysis(target)
  const history = readHistory({ root: target })
  const precision = computePrecision(history)
  const _config = loadConfig(target)
  const assessment = assess(target)
  const now = new Date().toISOString()

  const totalRuns = history.length
  const passCount = history.filter((e) => e.verdict === 'PASS').length
  const failCount = history.filter((e) => e.verdict === 'FAIL').length
  const humanCount = history.filter((e) => e.verdict === 'HUMAN').length
  const passRate = totalRuns > 0 ? Math.round((passCount / totalRuns) * 100) : 0

  const recentRows = history
    .slice(-10)
    .reverse()
    .map((e) => `| ${new Date(e.timestamp).toISOString().slice(0, 19)} | ${e.task.slice(0, 40)} | ${e.type} | ${e.level} | ${e.verdict} |`)
    .join('\n')

  const precisionRows = Object.entries(precision)
    .map(([kind, prec]) => `| ${kind} | ${(prec * 100).toFixed(0)}% |`)
    .join('\n')

  return `# veridia Quality Report

**Generated:** ${now}
**Target:** \`${target}\`
**Version:** ${currentVersion()}

## Summary

| Metric | Value |
|--------|-------|
| Total Runs | ${totalRuns} |
| PASS | ${passCount} |
| FAIL | ${failCount} |
| HUMAN | ${humanCount} |
| Pass Rate | ${passRate}% |
| Verifiability Level | ${assessment.level} |
| Files Analyzed | ${analysis.totalFiles} |
| Total Findings | ${analysis.totalFindings} |
| Errors | ${analysis.errors} |
| Warnings | ${analysis.warnings} |
| Infos | ${analysis.infos} |

## Recent Runs

| Time | Task | Type | Level | Verdict |
|------|------|------|-------|---------|
${recentRows}

## Oracle Precision

| Oracle | Precision |
|--------|----------|
${precisionRows}

## Findings by Severity

- **ERROR:** ${analysis.errors}
- **WARNING:** ${analysis.warnings}
- **INFO:** ${analysis.infos}

## Recommendations

${analysis.errors > 0 ? `- Fix ${analysis.errors} error(s) found by static analysis` : '- No errors found'}
${analysis.warnings > 0 ? `- Address ${analysis.warnings} warning(s)` : ''}
${passRate < 80 ? `- Improve pass rate (currently ${passRate}%)` : ''}
${assessment.level < 3 ? `- Add more verification oracles (currently level ${assessment.level})` : ''}
`
}

export function generateHtmlReport(target: string): string {
  const md = generateReport(target)
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>veridia Report</title>
<style>
body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #333; }
h1 { color: #2563eb; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #e5e7eb; }
th { background: #f3f4f6; }
.verdict-pass { color: #16a34a; font-weight: 600; }
.verdict-fail { color: #dc2626; font-weight: 600; }
.verdict-human { color: #d97706; font-weight: 600; }
</style></head>
<body>
${md
  .split('\n')
  .map((l) => {
    if (l.startsWith('# ')) return `<h1>${escapeHtml(l.slice(2))}</h1>`
    if (l.startsWith('## ')) return `<h2>${escapeHtml(l.slice(3))}</h2>`
    if (l.startsWith('|')) {
      if (l.includes('---')) return ''
      const cells = l
        .split('|')
        .filter(Boolean)
        .map((c) => escapeHtml(c.trim()))
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`
    }
    if (l.startsWith('- ')) return `<li>${escapeHtml(l.slice(2))}</li>`
    return `<p>${escapeHtml(l)}</p>`
  })
  .join('\n')}
</body></html>`
}
