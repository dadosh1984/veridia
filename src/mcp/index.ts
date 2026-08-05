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
import { VERSION } from '../cli/version.js'
import { ask } from '../ask/ask.js'
import { measureHistory, measureRecord } from '../measure/measure.js'
import { readSession, writeSession, clearSession } from '../session/session.js'

const server = new Server({ name: 'veridia', version: VERSION }, { capabilities: { tools: {} } })

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
    {
      name: 'veridia_route',
      description: 'Route (type, level) to an orchestration plan',
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
      name: 'veridia_ask',
      description: 'Get clarifying questions for levels 0/1',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Task type' },
          level: { type: 'number', description: 'Verifiability level: 0-3' },
        },
        required: ['type', 'level'],
      },
    },
    {
      name: 'veridia_measure',
      description: 'Record a run outcome or print history summary',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', description: 'Mode: history or record' },
          task: { type: 'string', description: 'Task description (for record mode)' },
          type: { type: 'string', description: 'Task type (for record mode)' },
          level: { type: 'number', description: 'Verifiability level (for record mode)' },
          verdict: { type: 'string', description: 'Verdict (for record mode)' },
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['mode'],
      },
    },
    {
      name: 'veridia_report',
      description: 'Generate a quality report (markdown)',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['target'],
      },
    },
    {
      name: 'veridia_review',
      description: 'Output code review instructions for an AI agent',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['target'],
      },
    },
    {
      name: 'veridia_session_classify',
      description: 'Classify task and write to session',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'Natural language task description' },
          target: { type: 'string', description: 'Path to target directory' },
        },
        required: ['task'],
      },
    },
    {
      name: 'veridia_session_assess',
      description: 'Assess target and write to session',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
      },
    },
    {
      name: 'veridia_session_route',
      description: 'Build plan from session',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
      },
    },
    {
      name: 'veridia_session_ask',
      description: 'Ask questions from session',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
      },
    },
    {
      name: 'veridia_session_do',
      description: 'Execute plan from session',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
      },
    },
    {
      name: 'veridia_session_status',
      description: 'Show current session state',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
      },
    },
    {
      name: 'veridia_session_archive',
      description: 'Archive session to history',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Path to target directory' },
        },
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

    case 'veridia_route': {
      const type = args?.type as string
      const level = args?.level as number
      if (!type || level === undefined) throw new Error('type and level are required')
      const plan = buildPlan(type as TaskType, level as VerifiabilityLevel)
      return { content: [{ type: 'text', text: JSON.stringify(plan) }] }
    }

    case 'veridia_ask': {
      const type = args?.type as string
      const level = args?.level as number
      if (!type || level === undefined) throw new Error('type and level are required')
      const result = ask(type as TaskType, level as VerifiabilityLevel)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'veridia_measure': {
      const mode = args?.mode as string
      const target = (args?.target as string) || process.cwd()
      const deps = { root: target }
      if (mode === 'history') {
        const summary = measureHistory(deps)
        return { content: [{ type: 'text', text: JSON.stringify(summary) }] }
      }
      if (mode === 'record') {
        const task = args?.task as string
        const type = args?.type as string
        const level = args?.level as number
        const verdict = args?.verdict as string
        if (!task || !type || !verdict) throw new Error('record mode requires task, type, and verdict')
        measureRecord({ task, type, level, verdict: verdict as any, checks: [], drift: '' }, deps)
        return { content: [{ type: 'text', text: JSON.stringify({ recorded: true }) }] }
      }
      throw new Error('mode must be "history" or "record"')
    }

    case 'veridia_report': {
      const target = args?.target as string
      if (!target) throw new Error('target is required')
      const { generateReport } = await import('../analyze/report.js')
      const report = generateReport(target)
      return { content: [{ type: 'text', text: report }] }
    }

    case 'veridia_review': {
      const target = args?.target as string
      if (!target) throw new Error('target is required')
      const { buildReviewInstructions } = await import('../review/review.js')
      const instructions = buildReviewInstructions(target)
      return { content: [{ type: 'text', text: JSON.stringify(instructions) }] }
    }

    case 'veridia_session_classify': {
      const task = args?.task as string
      const target = (args?.target as string) || process.cwd()
      if (!task) throw new Error('task is required')
      const result = classify(task)
      writeSession({ task, type: result.type, confidence: result.confidence, step: 'classify' }, target)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'veridia_session_assess': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      if (!session) throw new Error('no active session')
      const result = assess(target)
      writeSession({ ...session, level: result.level, step: 'assess' }, target)
      return { content: [{ type: 'text', text: JSON.stringify({ level: result.level, oracles: result.oracles.map((o) => o.kind) }) }] }
    }

    case 'veridia_session_route': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      if (!session || !session.type || session.level === undefined) throw new Error('session requires type and level')
      const plan = buildPlan(session.type as TaskType, session.level as VerifiabilityLevel)
      writeSession({ ...session, plan: { depth: plan.depth, tier: plan.tier, steps: plan.steps, checks: plan.checks }, step: 'route' }, target)
      return { content: [{ type: 'text', text: JSON.stringify(plan) }] }
    }

    case 'veridia_session_ask': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      if (!session || !session.type || session.level === undefined) throw new Error('session requires type and level')
      const result = ask(session.type as TaskType, session.level as VerifiabilityLevel)
      writeSession({ ...session, step: 'ask' }, target)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'veridia_session_do': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      if (!session || !session.type || session.level === undefined) throw new Error('session requires type and level')
      const kinds = probeOracles(target, realFs).map((o) => o.kind)
      const config = loadConfig(target)
      const historyEntries = readHistory({ root: target })
      const precision = computePrecision(historyEntries)
      const verifyResult = verify(target, session.level as VerifiabilityLevel, kinds, { precision, weights: config.weights })
      writeSession({ ...session, verdict: verifyResult.verdict, step: 'done' }, target)
      return { content: [{ type: 'text', text: JSON.stringify({ checks: verifyResult.checks, verdict: verifyResult.verdict }) }] }
    }

    case 'veridia_session_status': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      return { content: [{ type: 'text', text: JSON.stringify(session || { step: 'none' }) }] }
    }

    case 'veridia_session_archive': {
      const target = (args?.target as string) || process.cwd()
      const session = readSession(target)
      if (!session) throw new Error('no active session')
      clearSession(target)
      return { content: [{ type: 'text', text: JSON.stringify({ archived: true }) }] }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

async function main(): Promise<void> {
  process.env.VERIDIA_MCP = '1'
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
