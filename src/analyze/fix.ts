import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { runAnalysis } from './analyze.js'
import type { Finding } from './types.js'

/** Options controlling how autoFix behaves. */
export interface AutoFixOptions {
  /** If true, compute and report fixes without writing to disk. */
  dryRun?: boolean
  /** If true, apply fixes even when the git working tree is dirty. */
  force?: boolean
}

interface FixResult {
  fixed: number
  skipped: number
  errors: number
  details: { file: string; line: number; action: string }[]
  blocked?: boolean
}

interface Span {
  start: number
  end: number
  line: number
  action: string
}

const TODO_PATTERN = /^\s*\/\/\s*(?:TODO|FIXME|HACK|XXX)\b/

/** Collect source spans (console statement + TODO comment) that should be removed. */
function collectSpans(sf: ts.SourceFile): Span[] {
  const spans: Span[] = []
  const text = sf.getFullText()
  const lineOf = (pos: number): number => sf.getLineAndCharacterOfPosition(pos).line
  const visit = (node: ts.Node): void => {
    if (ts.isExpressionStatement(node) && isConsoleCall(node.expression)) {
      spans.push({ start: node.getStart(sf), end: node.getEnd(), line: lineOf(node.getStart(sf)), action: 'remove console.log' })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  ts.forEachLeadingCommentRange(text, 0, (fullStart, end, kind) => {
    const comment = text.slice(fullStart, end)
    if (kind === ts.SyntaxKind.SingleLineCommentTrivia && TODO_PATTERN.test(comment)) {
      spans.push({ start: fullStart, end, line: lineOf(fullStart), action: 'remove TODO comment' })
    }
  })
  return spans
}

function isConsoleCall(expr: ts.Expression): boolean {
  if (!ts.isCallExpression(expr)) return false
  const callee = expr.expression
  if (!ts.isPropertyAccessExpression(callee)) return false
  const name = callee.name.text
  if (name !== 'log' && name !== 'debug' && name !== 'info') return false
  return ts.isIdentifier(callee.expression) && callee.expression.text === 'console'
}

/** Remove spans from source text (highest-to-lowest so offsets stay valid). */
function applySpans(sourceText: string, spans: Span[]): string {
  const sorted = [...spans].sort((a, b) => b.start - a.start)
  for (const span of sorted) {
    sourceText = sourceText.slice(0, span.start) + sourceText.slice(span.end)
  }
  return sourceText
}

/** Rewrite a file: return result, or null if the result fails to parse (fail-safe). */
function fixFile(sf: ts.SourceFile): { content: string; fixed: number; details: { file: string; line: number; action: string }[] } | null {
  const sourceText = sf.getFullText()
  const spans = collectSpans(sf)
  if (spans.length === 0) return { content: sourceText, fixed: 0, details: [] }
  const result = applySpans(sourceText, spans)
  if (hasParseErrors(sf.fileName, result)) {
    return null
  }
  return {
    content: result,
    fixed: spans.length,
    details: spans.map((s) => ({ file: sf.fileName, line: s.line + 1, action: s.action })),
  }
}

/** Whether the given source text fails to parse as TypeScript (fail-safe reparse). */
function hasParseErrors(fileName: string, sourceText: string): boolean {
  const host = ts.createCompilerHost({})
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (name, options) => (name === fileName ? ts.createSourceFile(name, sourceText, options) : getSourceFile(name, options))
  const program = ts.createProgram([fileName], {}, host)
  return program.getSyntacticDiagnostics().length > 0
}

/** Whether the target is inside a git tree with uncommitted changes. */
function isGitDirty(target: string): boolean {
  try {
    const r = spawnSync('git', ['status', '--porcelain'], { cwd: target, encoding: 'utf8', timeout: 10_000 })
    if (r.error) return false
    return (r.stdout ?? '').trim() !== ''
  } catch {
    return false
  }
}

export function autoFix(target: string, opts: AutoFixOptions = {}): FixResult {
  const { dryRun = false, force = false } = opts
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

  const blocked = !dryRun && !force && filesToFix.size > 0 && isGitDirty(target)

  for (const [file, { content }] of filesToFix) {
    const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const fixed = fixFile(sf)
    if (fixed === null) {
      totalSkipped++
      continue
    }
    details.push(...fixed.details)
    totalFixed += fixed.fixed
    if (fixed.content !== content && !dryRun && !blocked) {
      writeFileSync(join(target, file), fixed.content, 'utf8')
    }
  }

  totalSkipped += skipFindings.length

  return {
    fixed: totalFixed,
    skipped: totalSkipped,
    errors: analysis.errors,
    details,
    ...(blocked ? { blocked: true } : {}),
  }
}
