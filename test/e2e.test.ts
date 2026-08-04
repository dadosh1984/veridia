import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runCli, runCliIn } from './helpers/run-cli.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-e2e-'))
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

describe('e2e: classify', () => {
  it('classifies a bugfix task and returns valid JSON', () => {
    const result = runCli('classify', 'fix the null pointer in login')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { type: string; confidence: number }
    expect(parsed.type).toBe('bugfix')
    expect(parsed.confidence).toBeGreaterThan(0)
  })

  it('classifies a feature task and returns valid JSON', () => {
    const result = runCli('classify', 'add dark mode support')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { type: string }
    expect(parsed.type).toBe('feature')
  })
})

describe('e2e: assess', () => {
  it('assesses a bare directory and returns level 1', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'README.md', '')
    const result = runCli('assess', '--target', dir)
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { level: number; oracles: string[] }
    expect(parsed.level).toBe(1)
    expect(parsed.oracles).toEqual([])
  })

  it('assesses a tsconfig directory and returns level 2', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'tsconfig.json', '{}')
    const result = runCli('assess', '--target', dir)
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { level: number }
    expect(parsed.level).toBe(2)
  })
})

describe('e2e: triage', () => {
  it('runs full triage loop and returns valid JSON with all fields', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('add dark mode support', '--target', dir, '--auto')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as {
      type: string
      level: number
      plan: unknown
      verdict: string
      executionPlan: unknown
      executionResult: unknown
    }
    expect(parsed.type).toBe('feature')
    expect(typeof parsed.level).toBe('number')
    expect(parsed.plan).toBeTruthy()
    expect(parsed.verdict).toBeTruthy()
    expect(parsed.executionPlan).toBeTruthy()
    expect(parsed.executionResult).toBeTruthy()
  })
})

describe('e2e: session pipeline', () => {
  it('runs the full step-by-step pipeline via session commands', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{"scripts":{"test":"node -e \\"process.exit(0)\\""}}')
    const run = (args: string[]) => runCliIn(dir, ...args)

    expect(run(['session-classify', 'add feature']).exitCode).toBe(0)
    expect(run(['session-assess']).exitCode).toBe(0)
    expect(run(['session-route']).exitCode).toBe(0)
    const ask = run(['session-ask'])
    expect(ask.exitCode).toBe(0)
    expect(ask.stdout).toContain('No questions needed')
    const done = run(['session-do'])
    expect(done.exitCode).toBe(0)
    expect(run(['session-archive']).exitCode).toBe(0)

    expect(fs.existsSync(path.join(dir, '.veridia', 'session.json'))).toBe(false)
    expect(fs.existsSync(path.join(dir, '.veridia', 'history.jsonl'))).toBe(true)
  })

  it('resumes the pipeline from a session after an interruption', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{"scripts":{"test":"node -e \\"process.exit(0)\\""}}')
    runCliIn(dir, 'session-classify', 'add feature')
    runCliIn(dir, 'session-assess')
    runCliIn(dir, 'session-route')
    runCliIn(dir, 'session-ask')

    const result = runCliIn(dir, 'add feature', '--auto')
    expect(result.exitCode).toBe(0)
    const firstBytes = Array.from(result.stdout.slice(0, 40)).map((c) => c.codePointAt(0)?.toString(16)).join(' ')
    expect(firstBytes).toBe('7b')
    const parsed = JSON.parse(result.stdout) as { type: string; verdict: string }
    expect(parsed.type).toBe('feature')
    expect(parsed.verdict).toBeTruthy()
  })
})

describe('e2e: feedback loop', () => {
  it('records oracle results and completes with calibration history', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{"scripts":{"test":"node -e \\"process.exit(0)\\""}}')
    const args = ['run', '--target', dir, '--auto', 'add feature']
    expect(runCliIn(dir, ...args).exitCode).toBe(0)
    expect(runCliIn(dir, ...args).exitCode).toBe(0)

    const historyFile = path.join(dir, '.veridia', 'history.jsonl')
    expect(fs.existsSync(historyFile)).toBe(true)
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    const entry = JSON.parse(lines[lines.length - 1]) as { oracleResults?: unknown }
    expect(entry.oracleResults).toBeDefined()
  })
})

describe('e2e: plan adherence', () => {
  it('run command outputs the execution plan steps before delegating', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCliIn(dir, 'run', 'fix login bug', '--auto')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Execution Plan')
    expect(result.stdout).toContain('write-failing-test')
    expect(result.stdout).toContain('implement')
    expect(result.stdout).toContain('verify')
  })

  it('triage result includes plan steps that must be followed', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCliIn(dir, 'add dark mode', '--auto')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { plan: { steps: string[] }; verdict: string; mustFollowPlan: boolean }
    expect(parsed.plan.steps).toBeDefined()
    expect(parsed.plan.steps.length).toBeGreaterThan(0)
    expect(parsed.mustFollowPlan).toBe(true)
  })
})
