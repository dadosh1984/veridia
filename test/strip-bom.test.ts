import { describe, expect, it } from 'vitest'
import { stripBom } from '../src/util/strip-bom.js'

describe('stripBom', () => {
  it('strips a leading UTF-8 BOM', () => {
    expect(stripBom('\uFEFF{"a":1}')).toBe('{"a":1}')
  })

  it('returns the text unchanged when there is no BOM', () => {
    expect(stripBom('{"a":1}')).toBe('{"a":1}')
  })

  it('is idempotent across repeated calls', () => {
    const once = stripBom('\uFEFF{"a":1}')
    expect(stripBom(once)).toBe(once)
  })

  it('does not strip a non-leading FEFF', () => {
    expect(stripBom('"a\uFEFF"')).toBe('"a\uFEFF"')
  })
})
