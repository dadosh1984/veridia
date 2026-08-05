import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-mcp-'))
  tmpDirs.push(dir)
  return dir
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const mcpEntry = path.join(projectRoot, 'dist', 'mcp', 'index.js')

describe('MCP stdio transport', () => {
  it('veridia_verify over stdio transport produces well-formed JSON-RPC frames', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'package.json', JSON.stringify({ scripts: { test: 'node -e "process.exit(0)"' } }))

    const input = `${[
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } },
      }),
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'veridia_verify', arguments: { target: dir, type: 'bugfix', level: 3 } } }),
    ].join('\n')}\n`

    const proc = spawnSync(process.execPath, [mcpEntry], {
      cwd: dir,
      encoding: 'utf8',
      input,
      env: { ...process.env, VERIDIA_MCP: '1' },
    })

    expect(proc.status).toBe(0)
    const lines = (proc.stdout ?? '').trim().split('\n')
    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow()
      const frame = JSON.parse(line) as { jsonrpc: string; id?: number; result?: unknown; error?: unknown }
      expect(frame.jsonrpc).toBe('2.0')
    }
    expect(lines.length).toBeGreaterThanOrEqual(2)
    const response = JSON.parse(lines[lines.length - 1]) as { result?: { content?: { text: string }[] } }
    expect(response.result?.content?.[0]?.text).toBeDefined()
  })

  it('tool list contains all expected veridia_* tools', () => {
    const input = `${[
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } },
      }),
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    ].join('\n')}\n`

    const proc = spawnSync(process.execPath, [mcpEntry], {
      encoding: 'utf8',
      input,
      env: { ...process.env, VERIDIA_MCP: '1' },
    })

    expect(proc.status).toBe(0)
    const lines = (proc.stdout ?? '').trim().split('\n')
    const listResponse = JSON.parse(lines[lines.length - 1]) as { result?: { tools?: { name: string }[] } }
    const toolNames = listResponse.result?.tools?.map((t) => t.name) ?? []
    expect(toolNames).toContain('veridia_classify')
    expect(toolNames).toContain('veridia_assess')
    expect(toolNames).toContain('veridia_plan')
    expect(toolNames).toContain('veridia_verify')
    expect(toolNames).toContain('veridia_learn')
    expect(toolNames).toContain('veridia_route')
    expect(toolNames).toContain('veridia_ask')
    expect(toolNames).toContain('veridia_measure')
    expect(toolNames).toContain('veridia_report')
    expect(toolNames).toContain('veridia_review')
    expect(toolNames).toContain('veridia_session_classify')
    expect(toolNames).toContain('veridia_session_assess')
    expect(toolNames).toContain('veridia_session_route')
    expect(toolNames).toContain('veridia_session_ask')
    expect(toolNames).toContain('veridia_session_do')
    expect(toolNames).toContain('veridia_session_status')
    expect(toolNames).toContain('veridia_session_archive')
  })
})
