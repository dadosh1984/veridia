import fs, { watch } from 'node:fs'
import { log as vlog } from '../../util/log.js'
import path from 'node:path'
import { assess } from '../../assess/assess.js'
import { probeOracles, realFs } from '../../assess/probe.js'
import { classify } from '../../classify/classify.js'
import { loadConfig } from '../../config/config.js'
import { readHistory } from '../../measure/history.js'
import { computePrecision } from '../../measure/learn.js'
import { buildPlan } from '../../route/route.js'
import { verify } from '../../verify/verify.js'

const DEBOUNCE_MS = 500
const WATCH_DIRS = ['src', 'test']

interface PendingChange {
  timer: ReturnType<typeof setTimeout>
  file: string
}

let pending: PendingChange | null = null

function runCheck(target: string, filePath: string): void {
  const config = loadConfig(target)
  const classification = classify(`watch change in ${path.basename(filePath)}`, config)
  const assessment = assess(target, undefined, undefined, config)
  const plan = buildPlan(classification.type, assessment.level)
  const kinds = probeOracles(target, realFs).map((o) => o.kind)
  const historyEntries = readHistory({ root: target })
  const precision = computePrecision(historyEntries)
  const verifyResult = verify(target, assessment.level, kinds, { precision, weights: config.weights })

  const timestamp = new Date().toLocaleTimeString()
  const relPath = path.relative(target, filePath)
  process.stdout.write(`[${timestamp}] ${relPath} changed → ${verifyResult.verdict} (${plan.depth})\n`)
}

export async function handle(opts: { target?: string; debounce?: string }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()
  const debounce = opts.debounce ? Number(opts.debounce) : DEBOUNCE_MS

  if (!fs.existsSync(target)) {
    vlog.error(`watch: target path does not exist: ${target}`)
    process.exitCode = 1
    return
  }

  process.stdout.write(`veridia watch — watching ${WATCH_DIRS.join(', ')} in ${target}\n`)
  process.stdout.write(`[${new Date().toLocaleTimeString()}] ready (debounce: ${debounce}ms)\n`)

  for (const dir of WATCH_DIRS) {
    const dirPath = path.join(target, dir)
    if (!fs.existsSync(dirPath)) continue

    watch(dirPath, { recursive: true }, (_eventType, filename) => {
      if (!filename) return
      const ext = path.extname(filename)
      if (!['.ts', '.js', '.tsx', '.jsx', '.json', '.css', '.html'].includes(ext)) return

      const fullPath = path.join(dirPath, filename)
      if (!fs.existsSync(fullPath)) return

      if (pending) clearTimeout(pending.timer)
      pending = {
        file: filename,
        timer: setTimeout(() => {
          runCheck(target, fullPath)
          pending = null
        }, debounce),
      }
    })
  }

  await new Promise(() => {})
}
