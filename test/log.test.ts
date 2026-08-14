import { afterEach, describe, expect, it, vi } from 'vitest'
import { log } from '../src/util/log.js'

afterEach(() => {
  vi.restoreAllMocks()
})

function captureStderr(run: () => void): string[] {
  const stderr: string[] = []
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr.push(String(chunk))
    return true
  })
  run()
  return stderr
}

function setIsTTY(value: boolean | undefined): () => void {
  const desc = Object.getOwnPropertyDescriptor(process.stderr, 'isTTY')
  Object.defineProperty(process.stderr, 'isTTY', { value, configurable: true })
  return () => {
    if (desc) Object.defineProperty(process.stderr, 'isTTY', desc)
    else delete (process.stderr as { isTTY?: boolean }).isTTY
  }
}

describe('log', () => {
  it('info in TTY mode outputs veridia: info: <msg>', () => {
    const restoreIsTTY = setIsTTY(true)
    try {
      const stderr = captureStderr(() => log.info('hello'))
      expect(stderr.some((s) => s.includes('veridia: info: hello'))).toBe(true)
    } finally {
      restoreIsTTY()
    }
  })

  it('info in non-TTY mode outputs JSON with level, msg, timestamp', () => {
    const restoreIsTTY = setIsTTY(false)
    try {
      const stderr = captureStderr(() => log.info('hello'))
      const line = stderr.join('')
      const parsed = JSON.parse(line) as { level: string; msg: string; timestamp: string }
      expect(parsed.level).toBe('info')
      expect(parsed.msg).toBe('hello')
      expect(parsed.timestamp).toBeDefined()
    } finally {
      restoreIsTTY()
    }
  })

  it('debug without VERIDIA_DEBUG produces no output', () => {
    const origDebug = process.env.VERIDIA_DEBUG
    delete process.env.VERIDIA_DEBUG
    try {
      const stderr = captureStderr(() => log.debug('secret'))
      expect(stderr.length).toBe(0)
    } finally {
      if (origDebug === undefined) delete process.env.VERIDIA_DEBUG
      else process.env.VERIDIA_DEBUG = origDebug
    }
  })

  it('debug with VERIDIA_DEBUG=1 produces output', () => {
    const origDebug = process.env.VERIDIA_DEBUG
    process.env.VERIDIA_DEBUG = '1'
    try {
      const stderr = captureStderr(() => log.debug('secret'))
      expect(stderr.length).toBeGreaterThan(0)
    } finally {
      if (origDebug === undefined) delete process.env.VERIDIA_DEBUG
      else process.env.VERIDIA_DEBUG = origDebug
    }
  })
})
