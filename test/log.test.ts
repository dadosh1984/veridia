import { describe, expect, it } from 'vitest'
import { log } from '../src/util/log.js'

describe('log', () => {
  it('info in TTY mode outputs veridia: info: <msg>', () => {
    const stderr: string[] = []
    const origWrite = process.stderr.write.bind(process.stderr)
    const origIsTTY = (process.stderr as any).isTTY
    ;(process.stderr as any).isTTY = true
    process.stderr.write = ((chunk: any) => { stderr.push(String(chunk)); return true }) as any
    log.info('hello')
    process.stderr.write = origWrite
    ;(process.stderr as any).isTTY = origIsTTY
    expect(stderr.some((s) => s.includes('veridia: info: hello'))).toBe(true)
  })

  it('info in non-TTY mode outputs JSON with level, msg, timestamp', () => {
    const stderr: string[] = []
    const origWrite = process.stderr.write.bind(process.stderr)
    const origIsTTY = (process.stderr as any).isTTY
    ;(process.stderr as any).isTTY = false
    process.stderr.write = ((chunk: any) => { stderr.push(String(chunk)); return true }) as any
    log.info('hello')
    process.stderr.write = origWrite
    ;(process.stderr as any).isTTY = origIsTTY
    const line = stderr.join('')
    const parsed = JSON.parse(line) as { level: string; msg: string; timestamp: string }
    expect(parsed.level).toBe('info')
    expect(parsed.msg).toBe('hello')
    expect(parsed.timestamp).toBeDefined()
  })

  it('debug without VERIDIA_DEBUG produces no output', () => {
    const stderr: string[] = []
    const origWrite = process.stderr.write.bind(process.stderr)
    const origDebug = process.env.VERIDIA_DEBUG
    delete process.env.VERIDIA_DEBUG
    process.stderr.write = ((chunk: any) => { stderr.push(String(chunk)); return true }) as any
    log.debug('secret')
    process.stderr.write = origWrite
    process.env.VERIDIA_DEBUG = origDebug
    expect(stderr.length).toBe(0)
  })

  it('debug with VERIDIA_DEBUG=1 produces output', () => {
    const stderr: string[] = []
    const origWrite = process.stderr.write.bind(process.stderr)
    const origDebug = process.env.VERIDIA_DEBUG
    process.env.VERIDIA_DEBUG = '1'
    process.stderr.write = ((chunk: any) => { stderr.push(String(chunk)); return true }) as any
    log.debug('secret')
    process.stderr.write = origWrite
    process.env.VERIDIA_DEBUG = origDebug
    expect(stderr.length).toBeGreaterThan(0)
  })
})
