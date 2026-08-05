import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runCli } from './helpers/run-cli.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-cli-'))
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

function parseJson(stdout: string): unknown {
  return JSON.parse(stdout.trim())
}

describe('veridia CLI', () => {
  it('prints usage for --help and exits 0', () => {
    const result = runCli('--help')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('veridia')
  })

  it('prints usage for -h and exits 0', () => {
    const result = runCli('-h')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('veridia')
  })

  it('prints usage with no arguments and exits 0', () => {
    const result = runCli()
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('veridia')
  })

  it('prints version for `version` subcommand and exits 0', () => {
    const result = runCli('version')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { version: string }
    expect(parsed.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('prints version for -v and exits 0', () => {
    const result = runCli('-v')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toMatch(/veridia\/\d+\.\d+\.\d+/)
  })

  it('treats an unknown subcommand as a task string and runs triage', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('frobnicate', '--target', dir, '--auto')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { type: string }
    expect(parsed.type).toBeTruthy()
  })

  it('rejects an unknown flag with non-zero exit and error on stderr', () => {
    const result = runCli('--bogus')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('--bogus')
  })

  it('classifies a bug fix task and exits 0', () => {
    const result = runCli('classify', 'fix the null pointer in login')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { type: string }
    expect(parsed.type).toBe('bugfix')
  })

  it('classifies a feature task and exits 0', () => {
    const result = runCli('classify', 'add dark mode support')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { type: string }
    expect(parsed.type).toBe('feature')
  })

  it('rejects classify with no task string via non-zero exit and stderr', () => {
    const result = runCli('classify')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('task')
  })

  it('assesses the current working directory and exits 0', () => {
    const result = runCli('assess')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { level: number }
    expect([0, 1, 2, 3]).toContain(parsed.level)
  })

  it('assesses a target path via --target and prints level and oracles', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'tsconfig.json', '{}')
    const result = runCli('assess', '--target', dir)
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { level: number; oracles: string[] }
    expect(parsed.level).toBe(2)
    expect(parsed.oracles).toContain('type-check')
  })

  it('rejects a missing target path with non-zero exit and stderr', () => {
    const dir = path.join(os.tmpdir(), `veridia-missing-${Date.now()}`)
    const result = runCli('assess', '--target', dir)
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain(dir.replace(/\\/g, '\\\\'))
  })

  it('documents the assess subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('assess')
  })

  it('routes a feature at level 2 and prints a plan with exit 0', () => {
    const result = runCli('route', '--type', 'feature', '--level', '2')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { depth: string; tier: string }
    expect(parsed.depth).toBe('tdd-where-possible')
    expect(parsed.tier).toBe('mid')
  })

  it('routes a bugfix at level 3 with full-tdd depth', () => {
    const result = runCli('route', '--type', 'bugfix', '--level', '3')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { depth: string; tier: string }
    expect(parsed.depth).toBe('full-tdd')
    expect(parsed.tier).toBe('cheapest')
  })

  it('rejects route with a missing level flag', () => {
    const result = runCli('route', '--type', 'feature')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('level')
  })

  it('rejects route with an invalid type value', () => {
    const result = runCli('route', '--type', 'bogus', '--level', '2')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('bogus')
  })

  it('rejects route with an invalid level value', () => {
    const result = runCli('route', '--type', 'feature', '--level', '9')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('9')
  })

  it('documents the route subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('route')
  })

  it('asks a feature at level 1 and prints questions with exit 0', () => {
    const result = runCli('ask', '--type', 'feature', '--level', '1')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { questions: { id: string }[] }
    expect(parsed.questions.length).toBeGreaterThan(0)
  })

  it('asks about expectation at level 0', () => {
    const result = runCli('ask', '--type', 'open', '--level', '0')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { questions: { id: string }[] }
    expect(parsed.questions.some((q) => q.id === 'expected-outcome')).toBe(true)
  })

  it('declines questions at level 3 with exit 0', () => {
    const result = runCli('ask', '--type', 'bugfix', '--level', '3')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { questions: unknown[] }
    expect(parsed.questions).toEqual([])
  })

  it('rejects ask with a missing type flag', () => {
    const result = runCli('ask', '--level', '1')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('type')
  })

  it('rejects ask with an invalid level value', () => {
    const result = runCli('ask', '--type', 'feature', '--level', '9')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('9')
  })

  it('documents the ask subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('ask')
  })

  it('verifies a target with a failing test script and exits non-zero on a FAIL verdict', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{"scripts":{"test":"node -e \\"process.exit(1)\\""}}')
    writeFile(dir, 'test/foo.test.js', "it('works', () => {})\n")
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2')
    expect(result.exitCode).toBe(1)
    const parsed = parseJson(result.stdout) as { checks: { kind: string }[]; verdict: string }
    expect(parsed.checks.length).toBeGreaterThan(0)
    expect(parsed.verdict).toBe('FAIL')
  })

  it('verifies a target with no oracles and reports a HUMAN verdict', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'README.md', '')
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { verdict: string }
    expect(parsed.verdict).toBe('HUMAN')
  })

  it('rejects verify with a missing type flag', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('verify', '--target', dir, '--level', '2')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('type')
  })

  it('rejects verify with a missing target path', () => {
    const dir = path.join(os.tmpdir(), `veridia-verify-missing-${Date.now()}`)
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain(dir.replace(/\\/g, '\\\\'))
  })

  it('rejects verify with an invalid level value', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '9')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('9')
  })

  it('documents the verify subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('verify')
  })

  it('measures --history with no data prints no history', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('measure', '--history', '--target', dir)
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { totalRuns: number }
    expect(parsed.totalRuns).toBe(0)
  })

  it('measures --record with JSON payload and then --history shows it', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const payload = JSON.stringify({ task: 'add auth', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '' })
    const rec = runCli('measure', '--record', payload, '--target', dir)
    expect(rec.exitCode).toBe(0)
    const recParsed = parseJson(rec.stdout) as { recorded: boolean }
    expect(recParsed.recorded).toBe(true)
    const hist = runCli('measure', '--history', '--target', dir)
    expect(hist.exitCode).toBe(0)
    const histParsed = parseJson(hist.stdout) as { totalRuns: number }
    expect(histParsed.totalRuns).toBe(1)
  })

  it('rejects measure --record with missing required fields', () => {
    const result = runCli('measure', '--record', '{"task":"only-task"}')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('task, type, and verdict')
  })

  it('rejects measure with no --record or --history', () => {
    const result = runCli('measure')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('--record')
  })

  it('documents the measure subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('measure')
  })

  it('runs end-to-end triage on a task string and prints type, level, plan, verdict', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', '{}')
    const result = runCli('add dark mode support', '--target', dir, '--auto')
    expect(result.exitCode).toBe(0)
    const parsed = parseJson(result.stdout) as { type: string; level: number; plan: unknown; verdict: string }
    expect(parsed.type).toBeTruthy()
    expect([0, 1, 2, 3]).toContain(parsed.level)
    expect(parsed.plan).toBeTruthy()
    expect(parsed.verdict).toBeTruthy()
  })

  it('rejects an unknown flag with non-zero exit and error on stderr', () => {
    const result = runCli('--bogus')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('--bogus')
  })

  it('documents the triage mode in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('triage')
  })

  it('documents the init subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('init')
  })

  it('documents the generate subcommand in usage output', () => {
    const result = runCli('--help')
    expect(result.stdout).toContain('generate')
  })
})
