import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isMachineMode,
  jsonOut,
  validateLevel,
  validateType,
} from '../../src/cli/shared.js'

afterEach(() => {
  // Clean up MCP env var after each test so cases don't bleed into each other
  delete process.env.VERIDIA_MCP
})

describe('isMachineMode', () => {
  it('returns true when VERIDIA_MCP=1 regardless of opts', () => {
    process.env.VERIDIA_MCP = '1'
    expect(isMachineMode()).toBe(true)
    expect(isMachineMode({ json: false })).toBe(true)
    expect(isMachineMode({ json: true })).toBe(true)
    expect(isMachineMode({ auto: true })).toBe(true)
  })

  it('returns true when opts.json is true', () => {
    expect(isMachineMode({ json: true })).toBe(true)
  })

  it('returns true when opts.auto is true', () => {
    expect(isMachineMode({ auto: true })).toBe(true)
  })

  it('returns false when no opts and env unset', () => {
    expect(isMachineMode()).toBe(false)
  })

  it('returns false when opts.json and opts.auto are both falsy', () => {
    expect(isMachineMode({ json: false, auto: false })).toBe(false)
    expect(isMachineMode({})).toBe(false)
  })

  it('returns false when env is set to anything other than "1"', () => {
    process.env.VERIDIA_MCP = 'true'
    expect(isMachineMode()).toBe(false)
    process.env.VERIDIA_MCP = '0'
    expect(isMachineMode()).toBe(false)
  })
})

describe('validateType', () => {
  it.each(['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'])(
    'returns undefined for valid type %s',
    (t) => {
      expect(validateType(t)).toBeUndefined()
    },
  )

  it('returns an error message for an invalid type', () => {
    expect(validateType('bogus')).toMatch(/invalid task type: bogus/)
  })

  it('returns an error for empty string', () => {
    expect(validateType('')).toMatch(/invalid task type/)
  })
})

describe('validateLevel', () => {
  it.each(['0', '1', '2', '3'])('returns undefined for valid level string %s', (l) => {
    expect(validateLevel(l)).toBeUndefined()
  })

  it.each([0, 1, 2, 3])('returns undefined for valid level number %d', (l) => {
    expect(validateLevel(l)).toBeUndefined()
  })

  it('returns an error for invalid level string', () => {
    expect(validateLevel('4')).toMatch(/invalid verifiability level: 4/)
  })

  it('returns an error for invalid level number', () => {
    expect(validateLevel(7)).toMatch(/invalid verifiability level: 7/)
  })
})

describe('jsonOut', () => {
  it('writes JSON.stringify(value) + newline to stdout', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    try {
      jsonOut({ ok: true, n: 42 })
      expect(write).toHaveBeenCalledTimes(1)
      const written = write.mock.calls[0]?.[0] as string
      expect(written).toBe('{"ok":true,"n":42}\n')
    } finally {
      write.mockRestore()
    }
  })

  it('serializes arrays and primitives', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    try {
      jsonOut([1, 2, 3])
      const written = write.mock.calls[0]?.[0] as string
      expect(written).toBe('[1,2,3]\n')
      jsonOut('hi')
      const written2 = write.mock.calls[1]?.[0] as string
      expect(written2).toBe('"hi"\n')
    } finally {
      write.mockRestore()
    }
  })
})
