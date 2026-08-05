import { describe, expect, it } from 'vitest'
import { execFileWithShim } from '../src/util/exec-shim.js'

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
})
