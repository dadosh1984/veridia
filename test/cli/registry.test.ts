import { describe, expect, it, vi } from 'vitest'
import { cac } from 'cac'
import { type CommandDef, registerAll, registerCommand } from '../../src/cli/registry.js'

function makeCli() {
  return cac('veridia-test')
}

describe('registerCommand', () => {
  it('registers a command with name + description and invokes handler with parsed args', () => {
    const cli = makeCli()
    const handler = vi.fn()
    const def: CommandDef = {
      name: 'greet <name>',
      description: 'Print a greeting',
      handler,
    }
    registerCommand(cli, def)
    cli.parse(['node', 'veridia-test', 'greet', 'world'])
    expect(handler).toHaveBeenCalledTimes(1)
    // cac passes positional + options; we just need to know the handler ran
    expect(handler.mock.calls[0]?.length).toBeGreaterThanOrEqual(1)
  })

  it('registers options when def.options is provided', () => {
    const cli = makeCli()
    const handler = vi.fn()
    const def: CommandDef = {
      name: 'build',
      description: 'Build something',
      options: [
        ['--out <path>', 'Output path'],
        ['--force', 'Force overwrite'],
      ] as const,
      handler,
    }
    registerCommand(cli, def)
    cli.parse(['node', 'veridia-test', 'build', '--out', 'dist/x', '--force'])
    expect(handler).toHaveBeenCalledTimes(1)
    // cac calls handler with options as the only arg when no positional <arg> is declared
    const opts = handler.mock.calls[0]?.[0] as { out: string; force: boolean }
    expect(opts.out).toBe('dist/x')
    expect(opts.force).toBe(true)
  })

  it('returns the cac Command so callers can chain further', () => {
    const cli = makeCli()
    const def: CommandDef = {
      name: 'noop',
      description: 'no-op',
      handler: () => {},
    }
    const cmd = registerCommand(cli, def)
    expect(cmd).toBeDefined()
    expect(typeof (cmd as unknown as { name: string }).name).toBe('string')
  })
})

describe('registerAll', () => {
  it('registers every def in the list and all handlers fire when invoked', () => {
    const cli = makeCli()
    const h1 = vi.fn()
    const h2 = vi.fn()
    registerAll(cli, [
      { name: 'first', description: 'first cmd', handler: h1 },
      { name: 'second <arg>', description: 'second cmd', handler: h2 },
    ])
    cli.parse(['node', 'veridia-test', 'first'])
    cli.parse(['node', 'veridia-test', 'second', 'value'])
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
  })

  it('returns void and accepts an empty array', () => {
    const cli = makeCli()
    const result = registerAll(cli, [])
    expect(result).toBeUndefined()
    // cli should still parse with no commands without throwing
    expect(() => cli.parse(['node', 'veridia-test', '--help'])).not.toThrow()
  })
})
