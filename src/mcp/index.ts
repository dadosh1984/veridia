import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { assess } from '../assess/assess.js'
import { probeOracles, realFs } from '../assess/probe.js'
import type { VerifiabilityLevel } from '../assess/types.js'
import { classify } from '../classify/classify.js'
import type { TaskType } from '../classify/types.js'
import { loadConfig } from '../config/config.js'
import { readHistory } from '../measure/history.js'
import { computePrecision } from '../measure/learn.js'
import { buildPlan } from '../route/route.js'
import { verify } from '../verify/verify.js'

const server = new Server({ name: 'veridia', version: '0.1.8' }, { capabilities: { tools: {} } })

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'veridia_classify',
      description: 'Classify a task string into a known type (bugfix/feature/refactor/doc/explore/open)',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'Natural language task description' },
        },
        required: ['task'],
      },
    },
    {
      name: 'veridia_assess',
      description: 'Assess verifiability of a target directory',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['target'],
      },
    },
    {
      name: 'veridia_plan',
      description: 'Build an execution plan from task type and verifiability level',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Task type: bugfix/feature/refactor/doc/explore/open' },
          level: { type: 'number', description: 'Verifiability level: 0-3' },
        },
        required: ['type', 'level'],
      },
    },
    {
      name: 'veridia_verify',
      description: 'Run verification checks on a target directory',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
          type: { type: 'string', description: 'Task type' },
          level: { type: 'number', description: 'Verifiability level: 0-3' },
        },
        required: ['target', 'type', 'level'],
      },
    },
    {
      name: 'veridia_learn',
      description: 'Analyze history and produce recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['target'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'veridia_classify': {
      const task = args?.task as string
      if (!task) throw new Error('task is required')
      const result = classify(task)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'veridia_assess': {
      const target = args?.target as string
      if (!target) throw new Error('target is required')
      const result = assess(target)
      return { content: [{ type: 'text', text: JSON.stringify({ level: result.level, oracles: result.oracles.map((o) => o.kind) }) }] }
    }

    case 'veridia_plan': {
      const type = args?.type as string
      const level = args?.level as number
      if (!type || level === undefined) throw new Error('type and level are required')
      const plan = buildPlan(type as TaskType, level as VerifiabilityLevel)
      return { content: [{ type: 'text', text: JSON.stringify(plan) }] }
    }

    case 'veridia_verify': {
      const target = args?.target as string
      const type = args?.type as string
      const level = args?.level as number
      if (!target || !type || level === undefined) throw new Error('target, type, and level are required')
      const kinds = probeOracles(target, realFs).map((o) => o.kind)
      const config = loadConfig(target)
      const historyEntries = readHistory({ root: target })
      const precision = computePrecision(historyEntries)
      const result = verify(target, level as VerifiabilityLevel, kinds, { precision, weights: config.weights })
      return { content: [{ type: 'text', text: JSON.stringify({ checks: result.checks, verdict: result.verdict }) }] }
    }

    case 'veridia_learn': {
      const target = args?.target as string
      if (!target) throw new Error('target is required')
      const { learn } = await import('../measure/learn.js')
      const result = learn({ root: target })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
