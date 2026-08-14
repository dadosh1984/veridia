#!/usr/bin/env node
import { cac } from 'cac'
import * as agentsCmd from './commands/agents.js'
import * as askCmd from './commands/ask.js'
import * as assessCmd from './commands/assess.js'
import * as benchmarkCmd from './commands/benchmark.js'
import * as ciCmd from './commands/ci.js'
import * as classifyCmd from './commands/classify.js'
import * as completionCmd from './commands/completion.js'
import * as dashboardCmd from './commands/dashboard.js'
import * as developCmd from './commands/develop.js'
import * as executeCmd from './commands/execute.js'
import * as fixCmd from './commands/fix.js'
import * as generateCmd from './commands/generate.js'
import * as initCmd from './commands/init.js'
import * as learnCmd from './commands/learn.js'
import * as measureCmd from './commands/measure.js'
import * as planCmd from './commands/plan.js'
import * as prCmd from './commands/pr.js'
import * as reportCmd from './commands/report.js'
import * as reviewCmd from './commands/review.js'
import * as routeCmd from './commands/route.js'
import * as runCmd from './commands/run.js'
import * as sessionArchiveCmd from './commands/session-archive.js'
import * as sessionAskCmd from './commands/session-ask.js'
import * as sessionAssessCmd from './commands/session-assess.js'
import * as sessionClassifyCmd from './commands/session-classify.js'
import * as sessionDoCmd from './commands/session-do.js'
import * as sessionRouteCmd from './commands/session-route.js'
import * as sessionStatusCmd from './commands/session-status.js'
import * as triageCmd from './commands/triage.js'
import * as verifyCmd from './commands/verify.js'
import * as watchCmd from './commands/watch.js'
import type { CommandDef } from './registry.js'
import { registerAll } from './registry.js'
import { jsonOut } from './shared.js'
import { VERSION } from './version.js'

const cli = cac('veridia')

cli.version(VERSION)
cli.help()

const commands: CommandDef[] = [
  {
    name: 'classify <task>',
    description: 'Classify a task string',
    handler: (task: string) => classifyCmd.handle(task),
  },
  {
    name: 'assess',
    description: 'Assess verifiability of a target',
    options: [
      ['--target <path>', 'Target directory'],
      ['--type <type>', 'Task type'],
    ],
    handler: (opts: { target?: string; type?: string }) => assessCmd.handle(opts),
  },
  {
    name: 'route',
    description: 'Route (type, level) to a run plan',
    options: [
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
    ],
    handler: (opts: { type: string; level: string }) => routeCmd.handle(opts),
  },
  {
    name: 'ask',
    description: 'Ask clarifying questions (levels 0/1)',
    options: [
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
    ],
    handler: (opts: { type: string; level: string }) => askCmd.handle(opts),
  },
  {
    name: 'plan',
    description: 'Generate an execution plan for the host agent',
    options: [
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
      ['--files <files>', 'Comma-separated file paths'],
      ['--target <path>', 'Target directory'],
    ],
    handler: (opts: { type: string; level: string; files?: string; target?: string }) => planCmd.handle(opts),
  },
  {
    name: 'execute',
    description: 'Execute a plan via the host agent',
    options: [
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
      ['--files <files>', 'Comma-separated file paths'],
      ['--target <path>', 'Target directory'],
    ],
    handler: (opts: { type: string; level: string; files?: string; target?: string }) => executeCmd.handle(opts),
  },
  {
    name: 'verify',
    description: 'Run a target checks and print a verdict',
    options: [
      ['--target <path>', 'Target directory'],
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
      ['--verbose', 'Stream gate output in real-time'],
    ],
    handler: (opts: { target: string; type: string; level: string; verbose?: boolean }) => verifyCmd.handle(opts),
  },
  {
    name: 'measure',
    description: 'Record a run outcome or print history',
    options: [
      ['--record <json>', 'Record a run outcome as JSON'],
      ['--history', 'Print history summary'],
      ['--task <task>', 'Task description'],
      ['--type <type>', 'Task type'],
      ['--level <level>', 'Verifiability level'],
      ['--verdict <verdict>', 'Verdict'],
      ['--target <path>', 'Target directory'],
    ],
    handler: (opts: Record<string, unknown>) => measureCmd.handle(opts),
  },
  {
    name: 'review',
    description: 'Output code review instructions for an AI agent',
    options: [['--target <path>', 'Target directory']],
    handler: (opts: { target?: string }) => reviewCmd.handle(opts),
  },
  {
    name: 'agents',
    description: 'List all supported AI agents',
    options: [['--list', 'List agents']],
    handler: (opts: { list?: boolean }) => agentsCmd.handle(opts),
  },
  {
    name: 'report',
    description: 'Generate a quality report (markdown or HTML)',
    options: [
      ['--target <path>', 'Target directory'],
      ['--format <format>', 'Output format: markdown or html'],
      ['--output <path>', 'Output file path'],
      ['--json', 'Output as JSON'],
    ],
    handler: (opts: { target?: string; format?: string; output?: string; json?: boolean }) => reportCmd.handle(opts),
  },
  {
    name: 'fix',
    description: 'Auto-fix found problems (console.log, TODO comments)',
    options: [
      ['--target <path>', 'Target directory'],
      ['--dry-run', 'Preview changes without writing to disk'],
      ['--force', 'Write even when the git working tree is dirty'],
      ['--json', 'Output as JSON'],
    ],
    handler: (opts: { target?: string; dryRun?: boolean; force?: boolean; json?: boolean }) => fixCmd.handle(opts),
  },
  {
    name: 'ci',
    description: 'Generate CI configuration',
    options: [
      ['--provider <provider>', 'CI provider: github-actions, gitlab-ci, circleci'],
      ['--output <path>', 'Output file path'],
      ['--json', 'Output as JSON'],
    ],
    handler: (opts: { provider?: string; output?: string; json?: boolean }) => ciCmd.handle(opts),
  },
  {
    name: 'benchmark',
    description: 'Run performance benchmarks',
    options: [
      ['--target <path>', 'Target directory'],
      ['--runs <n>', 'Number of runs per test'],
      ['--json', 'Output as JSON'],
      ['--field', 'Run the field benchmark over the bundled task corpus'],
      ['--output <path>', 'Output file for the field-benchmark report'],
    ],
    handler: (opts: { target?: string; runs?: string; json?: boolean; field?: boolean; output?: string }) => benchmarkCmd.handle(opts),
  },
  {
    name: 'pr',
    description: 'Analyze a pull request and run triage',
    options: [
      ['--target <path>', 'Target directory'],
      ['--base <branch>', 'Base branch for comparison'],
      ['--json', 'Output as JSON'],
    ],
    handler: (opts: { target?: string; base?: string; json?: boolean }) => prCmd.handle(opts),
  },
  {
    name: 'init',
    description: 'Initialize veridia config and agent command files',
    options: [['--agent <name>', 'Agent name']],
    handler: (opts: { agent?: string }) => initCmd.handle(opts),
  },
  {
    name: 'generate',
    description: 'Generate agent command files',
    options: [['--agent <name>', 'Agent name']],
    handler: (opts: { agent: string }) => generateCmd.handle(opts),
  },
  {
    name: 'learn',
    description: 'Analyze history and produce recommendations',
    options: [['--target <path>', 'Target directory']],
    handler: (opts: { target?: string }) => learnCmd.handle(opts),
  },
  {
    name: 'watch',
    description: 'Watch files and run triage on changes',
    options: [
      ['--target <path>', 'Target directory'],
      ['--debounce <ms>', 'Debounce interval in milliseconds'],
    ],
    handler: (opts: { target?: string; debounce?: string }) => watchCmd.handle(opts),
  },
  {
    name: 'dashboard',
    description: 'Start a local web dashboard',
    options: [
      ['--target <path>', 'Target directory'],
      ['--port <port>', 'Port number'],
    ],
    handler: (opts: { target?: string; port?: string }) => dashboardCmd.handle(opts),
  },
  {
    name: 'run <task>',
    description: 'Run the full triage loop with human-readable output',
    options: [
      ['--target <path>', 'Target directory'],
      ['--auto', 'Non-interactive mode'],
      ['--self', 'Target self'],
      ['--ww', 'Warpweave mode'],
      ['--change <name>', 'Change name for warpweave'],
    ],
    handler: (task: string, opts: { target?: string; auto?: boolean; self?: boolean; ww?: boolean; change?: string }) => runCmd.handle(task, opts),
  },
  {
    name: 'session-classify <task>',
    description: 'Classify task and write to session',
    handler: (task: string) => sessionClassifyCmd.handle(task),
  },
  {
    name: 'session-assess',
    description: 'Assess target and write to session',
    options: [['--target <path>', 'Target directory']],
    handler: (opts: { target?: string }) => sessionAssessCmd.handle(opts),
  },
  {
    name: 'session-route',
    description: 'Build plan from session',
    handler: () => sessionRouteCmd.handle(),
  },
  {
    name: 'session-ask',
    description: 'Ask questions from session',
    handler: () => sessionAskCmd.handle(),
  },
  {
    name: 'session-do',
    description: 'Execute plan from session',
    handler: () => sessionDoCmd.handle(),
  },
  {
    name: 'session-status',
    description: 'Show current session state',
    handler: () => sessionStatusCmd.handle(),
  },
  {
    name: 'session-archive',
    description: 'Archive session to history',
    handler: () => sessionArchiveCmd.handle(),
  },
  {
    name: 'develop',
    description: 'Run the full dogfooding triage loop against a warpweave change',
    options: [
      ['--change <name>', 'Change name to develop'],
      ['--self', 'Target self (develop veridia itself)'],
      ['--target <path>', 'Target directory'],
      ['--verbose', 'Stream gate output in real-time'],
    ],
    handler: (opts: { change?: string; self?: boolean; target?: string; verbose?: boolean }) => developCmd.handle(opts.change ?? '', opts),
  },
]

// Special-cased commands (no handler signature change needed; kept inline).
cli.command('version', 'Print the veridia version').action(() => jsonOut({ version: VERSION }))

cli.command('completion <shell>', 'Generate shell completion script').action((shell: string) => completionCmd.handle(shell))

cli
  .command('[task]', 'Run the full triage loop on a task string (shorthand)')
  .option('--target <path>', 'Target directory')
  .option('--auto', 'Non-interactive mode')
  .option('--self', 'Target self')
  .option('--ww', 'Warpweave mode')
  .option('--change <name>', 'Change name for warpweave')
  .action((task: string | undefined, opts: { target?: string; auto?: boolean; self?: boolean; ww?: boolean; change?: string }) => {
    if (!task) {
      cli.outputHelp()
      return
    }
    triageCmd.handle(task, opts)
  })

registerAll(cli, commands)

try {
  cli.parse()
} catch (err) {
  // Provide a clean error message without stack trace for user‑facing errors
  if (err instanceof Error) {
    console.error(err.message)
  } else {
    console.error('CLI error')
  }
  process.exit(1)
}
