import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { assemblePrompt, callModelApi, callModelAsync, callModelStdio, type ModelConfig } from '../../src/execute/orchestrate.js'

const tmpFiles: string[] = []

function makeScript(body: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-orch-'))
  const file = path.join(dir, 'script.js')
  fs.writeFileSync(file, body, 'utf8')
  tmpFiles.push(dir)
  // Return forward-slash path wrapped in quotes — splitCommand treats backslashes as escapes on Windows,
  // and unquoted paths with spaces break. Forward slashes work for node on Windows.
  return `"${file.replace(/\\/g, '/')}"`
}

afterEach(() => {
  vi.restoreAllMocks()
  for (const dir of tmpFiles.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('assemblePrompt', () => {
  it('produces a prompt with task, type, level, plan depth, and model tier', () => {
    const prompt = assemblePrompt('Refactor auth module', 'refactor', '2', { depth: 'standard', tier: 'mid', steps: [], checks: [] })
    expect(prompt).toContain('Task: Refactor auth module')
    expect(prompt).toContain('Type: refactor')
    expect(prompt).toContain('Verifiability level: 2')
    expect(prompt).toContain('Plan depth: standard')
    expect(prompt).toContain('Model tier: mid')
  })

  it('appends plan steps when present', () => {
    const prompt = assemblePrompt('do X', 'feature', '3', {
      depth: 'deep',
      tier: 'high',
      steps: ['plan', 'execute', 'verify'],
      checks: [],
    })
    expect(prompt).toContain('Plan steps: plan -> execute -> verify')
  })

  it('appends verification gates when checks are present', () => {
    const prompt = assemblePrompt('do Y', 'feature', '3', {
      depth: 'deep',
      tier: 'high',
      steps: [],
      checks: ['lint', 'tsc', 'test'],
    })
    expect(prompt).toContain('Verification gates: lint, tsc, test')
  })

  it('serializes answers when provided', () => {
    const prompt = assemblePrompt('fix bug', 'bugfix', '1', { depth: 'shallow', tier: 'low', steps: [], checks: [] }, { framework: 'vitest', node: '22.13' })
    expect(prompt).toContain('Answers: {"framework":"vitest","node":"22.13"}')
  })

  it('omits the answers section when answers is empty', () => {
    const prompt = assemblePrompt('fix bug', 'bugfix', '1', { depth: 'shallow', tier: 'low', steps: [], checks: [] }, {})
    expect(prompt).not.toContain('Answers:')
  })

  it('omits the answers section when answers is undefined', () => {
    const prompt = assemblePrompt('fix bug', 'bugfix', '1', { depth: 'shallow', tier: 'low', steps: [], checks: [] })
    expect(prompt).not.toContain('Answers:')
  })
})

describe('callModelStdio', () => {
  it('runs a command and returns trimmed stdout', () => {
    const script = makeScript("process.stdout.write('  HELLO-MODEL  ')")
    const out = callModelStdio(`node ${script}`, 'irrelevant prompt', 10_000)
    expect(out).toBe('HELLO-MODEL')
  })

  it('throws when the command is empty', () => {
    expect(() => callModelStdio('', 'prompt', 5_000)).toThrow(/empty command/)
  })

  it('throws when the spawned process exits non-zero', () => {
    const script = makeScript('process.exit(1)')
    expect(() => callModelStdio(`node ${script}`, 'prompt', 5_000)).toThrow()
  })

  it('passes the prompt as stdin to the command', () => {
    const script = makeScript("let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(d))")
    const out = callModelStdio(`node ${script}`, 'PROMPT-ECHO', 5_000)
    expect(out).toBe('PROMPT-ECHO')
  })
})

describe('callModelApi', () => {
  function mockFetchOnce(body: unknown, init: { status?: number; ok?: boolean } = {}) {
    const status = init.status ?? 200
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
  }

  it('sends POST with the expected JSON body and returns choices[0].message.content', async () => {
    const spy = mockFetchOnce({
      choices: [{ message: { content: '  ANSWER FROM API  ' } }],
    })
    const out = await callModelApi('https://example.com/v1/chat/completions', 'gpt-test', 'hello', 'token-abc', 5_000)
    expect(out).toBe('ANSWER FROM API')
    expect(spy).toHaveBeenCalledTimes(1)
    const [url, init] = spy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://example.com/v1/chat/completions')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      model: 'gpt-test',
      messages: [{ role: 'user', content: 'hello' }],
    })
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer token-abc')
  })

  it('returns empty string when choices is missing', async () => {
    mockFetchOnce({})
    const out = await callModelApi('https://example.com/v1', 'm', 'hi', undefined, 5_000)
    expect(out).toBe('')
  })

  it('throws on a non-2xx response', async () => {
    mockFetchOnce({}, { status: 500, ok: false })
    await expect(callModelApi('https://example.com/v1', 'm', 'hi', undefined, 5_000)).rejects.toThrow(/HTTP 500/)
  })

  it('throws on a non-JSON response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('plain text', { status: 200 }))
    await expect(callModelApi('https://example.com/v1', 'm', 'hi', undefined, 5_000)).rejects.toThrow(/non-JSON/)
  })

  it('wraps fetch network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('ECONNREFUSED'))
    await expect(callModelApi('https://example.com/v1', 'm', 'hi', undefined, 5_000)).rejects.toThrow(/model API request failed/)
  })

  it('throws when URL is empty', async () => {
    await expect(callModelApi('', 'm', 'hi', undefined, 5_000)).rejects.toThrow(/API URL is required/)
  })

  it('omits Authorization header when no apiKey is given', async () => {
    const spy = mockFetchOnce({ choices: [{ message: { content: 'OK' } }] })
    await callModelApi('https://example.com/v1', 'm', 'hi', undefined, 5_000)
    const call = spy.mock.calls[0]
    expect(call).toBeDefined()
    const headers = (call![1] as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('callModelAsync', () => {
  it('routes to callModelApi for provider=api', async () => {
    const apiConfig: ModelConfig = {
      provider: 'api',
      model: 'gpt-x',
      apiUrl: 'https://example.com/v1',
      apiKey: 'k',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [{ message: { content: 'API-ROUTE' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const out = await callModelAsync(apiConfig, 'prompt')
    expect(out).toBe('API-ROUTE')
  })

  it('routes to callModelStdio for provider=stdio (using config.model as command)', async () => {
    const script = makeScript("process.stdout.write('STDIO-ROUTE')")
    const stdioConfig: ModelConfig = {
      provider: 'stdio',
      model: `node ${script}`,
    }
    const out = await callModelAsync(stdioConfig, 'prompt')
    expect(out).toBe('STDIO-ROUTE')
  })

  it('prefers config.command over config.model for stdio', async () => {
    const script = makeScript("process.stdout.write('CMD-WINS')")
    const stdioConfig: ModelConfig = {
      provider: 'stdio',
      model: 'should-not-be-used',
      command: `node ${script}`,
    }
    const out = await callModelAsync(stdioConfig, 'prompt')
    expect(out).toContain('CMD-WINS')
  })

  it('falls back to config.model when config.command is missing', async () => {
    const script = makeScript("process.stdout.write('MODEL-FALLBACK')")
    const stdioConfig: ModelConfig = {
      provider: 'stdio',
      model: `node ${script}`,
    }
    const out = await callModelAsync(stdioConfig, 'prompt')
    expect(out).toContain('MODEL-FALLBACK')
  })

  it('uses config.apiUrl for the API URL', async () => {
    const apiConfig: ModelConfig = {
      provider: 'api',
      model: 'm',
      apiUrl: 'https://example.com/v1',
    }
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [{ message: { content: 'OK' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    await callModelAsync(apiConfig, 'prompt')
    expect(spy.mock.calls[0]?.[0]).toBe('https://example.com/v1')
  })

  it('throws when api provider has no apiUrl', async () => {
    const apiConfig: ModelConfig = { provider: 'api', model: 'm', apiUrl: '' }
    await expect(callModelAsync(apiConfig, 'prompt')).rejects.toThrow(/API URL is required/)
  })
})
