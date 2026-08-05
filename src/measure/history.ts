import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { log as vlog } from '../util/log.js'
import { join } from 'node:path'
import type { HistorySummary, MeasureEntry } from './types.js'

/** Dependencies for history operations, allowing a custom project root. */
export interface HistoryDeps {
  /** The project root directory (defaults to process.cwd()). */
  root?: string
}

function historyDir(root: string): string {
  return join(root, '.veridia')
}

function historyFile(root: string): string {
  return join(historyDir(root), 'history.jsonl')
}

/**
 * Parse an array of JSONL lines into entries, counting skipped lines.
 * Blank lines are ignored silently.
 */
export function parseHistoryLines(lines: string[]): { entries: MeasureEntry[]; skipped: number } {
  const entries: MeasureEntry[] = []
  let skipped = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try {
      entries.push(JSON.parse(trimmed) as MeasureEntry)
    } catch {
      skipped++
    }
  }
  return { entries, skipped }
}

/**
 * Append a measurement entry to the history file, adding a timestamp automatically.
 * Creates the .veridia directory if it does not exist.
 *
 * @param entry - The entry data (timestamp is added automatically).
 * @param deps - Optional dependencies (e.g. custom root directory).
 */
export function appendEntry(entry: Omit<MeasureEntry, 'timestamp'>, deps: HistoryDeps = {}): void {
  const root = deps.root ?? process.cwd()
  const dir = historyDir(root)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const full: MeasureEntry = { ...entry, timestamp: new Date().toISOString() }
  appendFileSync(historyFile(root), `${JSON.stringify(full)}\n`, 'utf8')
}

/**
 * Read all measurement entries from the history file.
 * Reports corrupt lines to stderr.
 *
 * @param deps - Optional dependencies (e.g. custom root directory).
 * @returns An array of MeasureEntry objects, or an empty array if no history exists.
 */
export function readHistory(deps: HistoryDeps = {}): MeasureEntry[] {
  const root = deps.root ?? process.cwd()
  const file = historyFile(root)
  if (!existsSync(file)) return []
  const content = readFileSync(file, 'utf8')
  const lines = content.split(/\r?\n/)
  const { entries, skipped } = parseHistoryLines(lines)
  if (skipped > 0) {
    vlog.error(`warning: skipped ${skipped} corrupt line(s) in .veridia/history.jsonl`)
  }
  return entries
}

/**
 * Build a HistorySummary from an array of measurement entries.
 *
 * @param entries - The measurement entries to summarize.
 * @returns A HistorySummary with totals, per-verdict counts, per-level counts, and recent entries.
 */
export function buildSummary(entries: MeasureEntry[]): HistorySummary {
  const perVerdict: Record<string, number> = {}
  const perLevel: Record<string, number> = {}
  for (const e of entries) {
    perVerdict[e.verdict] = (perVerdict[e.verdict] ?? 0) + 1
    const lk = String(e.level)
    perLevel[lk] = (perLevel[lk] ?? 0) + 1
  }
  return {
    totalRuns: entries.length,
    perVerdict,
    perLevel,
    recent: entries.slice(-5),
  }
}
