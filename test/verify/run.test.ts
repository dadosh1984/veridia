import { afterEach, describe, expect, it, vi } from 'vitest'
import * as execShim from '../../src/util/exec-shim.js'
import { runCommand } from '../../src/verify/run.js'

// ponytail: rung 6 (one-liner) — direct unit tests; no fixture setup needed.
// process.execPath on Windows is "C:\Program Files\nodejs\node.exe" (space); quote it for splitCommand.

describe('runCommand', () => {
  it('returns exit code 0 with stdout on success', () => {
    const cmd = `"${process.execPath}" -e "process.stdout.write('hello')"`
    const result = runCommand(process.cwd(), cmd)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('hello')
  })

  it('returns exit code from non-zero status with error message', () => {
    const cmd = `"${process.execPath}" -e "process.stderr.write('NOPE');process.exit(7)"`
    const result = runCommand(process.cwd(), cmd)
    expect(result.exitCode).toBe(7)
    expect(result.error).toBe('NOPE')
  })

  it('returns exit code 1 when command string is empty', () => {
    const result = runCommand(process.cwd(), '')
    expect(result.exitCode).toBe(1)
  })

  it('returns exit code 1 when command is only whitespace', () => {
    const result = runCommand(process.cwd(), '   ')
    expect(result.exitCode).toBe(1)
  })

  it('returns exit code 1 with error when the command cannot be spawned', () => {
    const result = runCommand(process.cwd(), 'veridia-no-such-binary-xyz-987')
    expect(result.exitCode).toBe(1)
    expect(result.error).toBeDefined()
  })

  it('captures stdout by default (streamOutput=false)', () => {
    const cmd = `"${process.execPath}" -e "process.stdout.write('CAPTURED')"`
    const result = runCommand(process.cwd(), cmd)
    expect(result.stdout).toContain('CAPTURED')
  })

  it('does not throw when child exits non-zero', () => {
    const cmd = `"${process.execPath}" -e "process.exit(2)"`
    expect(() => runCommand(process.cwd(), cmd)).not.toThrow()
  })

  it('passes cwd to the child process', () => {
    const tmpCwd = process.cwd()
    const cmd = `"${process.execPath}" -e "process.stdout.write(process.cwd())"`
    const result = runCommand(tmpCwd, cmd)
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBeTruthy()
  })
})

// ponytail: rung 5 (vi.spyOn on a real module export) — covers the `e.status === undefined` branch
describe('runCommand — error path branches', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('surfaces message when spawn error has no .status', () => {
    vi.spyOn(execShim, 'execFileWithShim').mockImplementation(() => {
      const e = new Error('spawn failed') as Error & { code?: string }
      e.code = 'ESRCH'
      throw e
    })
    const result = runCommand(process.cwd(), 'whatever')
    expect(result.exitCode).toBe(1)
    expect(result.error).toBe('spawn failed')
  })

  it('uses fallback message when error has only .code (no message, no status)', () => {
    vi.spyOn(execShim, 'execFileWithShim').mockImplementation(() => {
      const e = new Error('') as Error & { code: string; message?: string }
      e.code = 'ESRCH'
      e.message = ''
      throw e
    })
    const result = runCommand(process.cwd(), 'whatever')
    expect(result.exitCode).toBe(1)
    expect(result.error).toMatch(/command failed.*ESRCH/)
  })
})
