import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AskResult } from '../src/ask/types.js'
import type { VerifiabilityLevel } from '../src/assess/types.js'
import type { TaskType } from '../src/classify/types.js'
import { triage } from '../src/triage/triage.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-triage-'))
  tmpDirs.push(dir)
  return dir
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

const mockAsk = async (_type: TaskType, _level: VerifiabilityLevel, _auto?: boolean): Promise<AskResult> => ({ questions: [] })

describe('triage', () => {
  it('runs the full loop and returns a result with type, level, plan, and verdict', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}')
    writeFile(target, 'tsconfig.json', '{}')
    const result = await triage('add dark mode support', target, undefined, { ask: mockAsk })
    expect(result.task).toBe('add dark mode support')
    expect(result.type).toBe('feature')
    expect(result.confidence).toBeGreaterThan(0)
    expect([0, 1, 2, 3]).toContain(result.level)
    expect(result.plan.depth).toBeTruthy()
    expect(result.verdict).toBeTruthy()
  })

  it('classifies a bugfix task correctly', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    const result = await triage('fix the null pointer crash', target, undefined, { ask: mockAsk })
    expect(result.type).toBe('bugfix')
  })

  it('records outcome via measure', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    await triage('add feature', target, undefined, { ask: mockAsk })
    const historyFile = path.join(target, '.veridia', 'history.jsonl')
    expect(fs.existsSync(historyFile)).toBe(true)
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n')
    expect(lines).toHaveLength(1)
    const entry = JSON.parse(lines[0])
    expect(entry.task).toBe('add feature')
    expect(entry.type).toBe('feature')
  })

  it('is deterministic for the same task and target', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    const first = await triage('refactor the module', target, undefined, { ask: mockAsk })
    const second = await triage('refactor the module', target, undefined, { ask: mockAsk })
    expect(first.type).toBe(second.type)
    expect(first.level).toBe(second.level)
    expect(first.verdict).toBe(second.verdict)
  })

  it('includes execution plan and result in output', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    const result = await triage('add feature', target, undefined, { ask: mockAsk })
    expect(result.executionPlan).toBeDefined()
    expect(result.executionPlan!.task).toBe('add feature')
    expect(result.executionResult).toBeDefined()
    expect(result.executionResult!.exitCode).toBe(0)
  })

  it('drift is 0 on first run (no history)', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    await triage('add feature', target, undefined, { ask: mockAsk })
    const historyFile = path.join(target, '.veridia', 'history.jsonl')
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n')
    const entry = JSON.parse(lines[0])
    expect(entry.drift).toBe('0')
  })

  it('drift is non-empty string', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    await triage('add feature', target, undefined, { ask: mockAsk })
    const historyFile = path.join(target, '.veridia', 'history.jsonl')
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n')
    const entry = JSON.parse(lines[0])
    expect(typeof entry.drift).toBe('string')
    expect(entry.drift.length).toBeGreaterThanOrEqual(1)
  })

  it('emits progress across the stages', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    const stages: string[] = []
    await triage('add feature', target, { auto: true, progress: (stage) => stages.push(stage) }, { ask: mockAsk })
    for (const expected of ['classify', 'assess', 'route', 'plan', 'execute', 'verify', 'measure']) {
      expect(stages).toContain(expected)
    }
    expect(stages[0]).toBe('classify')
  })

  // ponytail: rung 6 — covers deps?.ask ?? askInteractive branch (line 145)
  it('falls back to askInteractive when deps.ask is undefined', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    // No deps passed -> deps?.ask ?? askInteractive resolves to askInteractive.
    // auto=true short-circuits askInteractive before any prompt (no TTY hang).
    const result = await triage('add feature', target, { auto: true })
    expect(result.task).toBe('add feature')
    expect(result.verdict).toBeTruthy()
  })

  // ponytail: rung 6 — covers modelConfig truthy branch in delegate call (169-192)
  it('routes through orchestrate when config has a model section', async () => {
    const target = makeTmpDir()
    writeFile(target, 'package.json', '{}')
    // model config triggers the truthy branch; stdio provider runs a noop node command
    writeFile(
      target,
      '.veridia/config.json',
      JSON.stringify({
        model: {
          provider: 'stdio',
          model: 'noop',
          command: `"${process.execPath}" -e "process.stdout.write('AI-MODEL-OUTPUT')"`,
        },
      }),
    )
    const result = await triage('add feature', target, { auto: true })
    expect(result.task).toBe('add feature')
    expect(result.executionResult).toBeDefined()
  })
})
