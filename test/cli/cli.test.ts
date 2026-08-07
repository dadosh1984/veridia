import { describe, expect, test } from 'vitest'
import { runCli } from '../helpers/run-cli'

describe('CLI error handling', () => {
  test('classify without task returns error and exit code 1', () => {
    const result = runCli('classify')
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toMatch(/missing required args for command `classify <task>`/)
  })

  test('unknown option produces clean error message', () => {
    const result = runCli('classify', '--bogus')
    expect(result.exitCode).toBe(1)
    // Should contain the CAC error message
    expect(result.stderr).toMatch(/Unknown option `--bogus`/)
  })

  // Regression guard: cli.parse() must be invoked so commands actually run
  // (previously an accidental edit removed the call and everything exited 0 silently).
  test('commands actually execute and emit output on stdout', () => {
    const result = runCli('classify', 'fix the login bug')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { type?: string }
    expect(parsed.type).toBe('bugfix')
  })
})
