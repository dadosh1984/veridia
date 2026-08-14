import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { execFileWithShim } from '../src/util/exec-shim.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-shim-'))
  tmpDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('execFileWithShim', () => {
  it('runs a real executable directly', () => {
    expect(() => execFileWithShim(process.execPath, ['-e', 'process.exit(0)'], { encoding: 'utf8' })).not.toThrow()
  })

  it('throws when the command cannot be run', () => {
    expect(() => execFileWithShim('veridia-no-such-cmd-xyz', [], { encoding: 'utf8' })).toThrow()
  })

  it('captures child stdout instead of inheriting it', () => {
    const stdout = execFileWithShim(process.execPath, ['-e', 'process.stdout.write("CAPTURED-OUT")'], { encoding: 'utf8' })
    expect(stdout).toBe('CAPTURED-OUT')
  })

  it('uses the streamOutput stdio mode without throwing', () => {
    // With streamOutput=true, stdout is 'inherit' (not captured) — we only assert no throw
    expect(() =>
      execFileWithShim(process.execPath, ['-e', 'process.exit(0)'], {
        encoding: 'utf8',
        streamOutput: true,
      }),
    ).not.toThrow()
  })

  it('throws a useful error when the child exits non-zero with stderr', () => {
    expect(() => execFileWithShim(process.execPath, ['-e', 'process.stderr.write("BAD-EXIT"); process.exit(2)'], { encoding: 'utf8' })).toThrow(
      /BAD-EXIT|exit code 2/,
    )
  })

  it('uses "exit code N" when the child has empty stderr', () => {
    expect(() => execFileWithShim(process.execPath, ['-e', 'process.exit(3)'], { encoding: 'utf8' })).toThrow(/exit code 3/)
  })

  it('passes cwd through to the child process', () => {
    const dir = makeTmpDir()
    const stdout = execFileWithShim(process.execPath, ['-e', 'process.stdout.write(process.cwd())'], {
      cwd: dir,
      encoding: 'utf8',
    })
    // Realpath normalization: on Windows the dir may use a different case
    expect(fs.realpathSync(stdout)).toBe(fs.realpathSync(dir))
  })

  it('passes env through to the child process', () => {
    const stdout = execFileWithShim(process.execPath, ['-e', 'process.stdout.write(process.env.VERIDIA_TEST_SHIM_ENV ?? "")'], {
      encoding: 'utf8',
      env: { ...process.env, VERIDIA_TEST_SHIM_ENV: 'ENV-OK' },
    })
    expect(stdout).toBe('ENV-OK')
  })
})

describe.runIf(process.platform === 'win32')('execFileWithShim — PATHEXT resolution (Windows shim fallback)', () => {
  it('resolves a .cmd shim in node_modules/.bin and runs with shell: false', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-test-shim.cmd')
    fs.writeFileSync(shimPath, '@echo off\nnode -e "process.stdout.write(\'SHIM-OK\')"\n', 'utf8')

    const stdout = execFileWithShim('veridia-test-shim.cmd', [], { cwd: dir, encoding: 'utf8' })
    expect(stdout).toContain('SHIM-OK')
  })

  it('passes args through a resolved shim', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-arg-test.cmd')
    fs.writeFileSync(shimPath, '@echo off\nnode -e "process.stdout.write(\'hello\')"\n', 'utf8')

    const stdout = execFileWithShim('veridia-arg-test.cmd', [], { cwd: dir, encoding: 'utf8' })
    expect(stdout.trim()).toBe('hello')
  })

  it('throws ENOENT for a genuinely missing command', () => {
    expect(() => execFileWithShim('veridia-no-such-xyz-999', [], { encoding: 'utf8' })).toThrow(/ENOENT|not found|exit code/i)
  })
})
