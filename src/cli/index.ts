#!/usr/bin/env node
import { cac } from 'cac'
import * as agentsCmd from './commands/agents.js'
import * as askCmd from './commands/ask.js'
import * as assessCmd from './commands/assess.js'
import * as classifyCmd from './commands/classify.js'
import * as completionCmd from './commands/completion.js'
import * as dashboardCmd from './commands/dashboard.js'
import * as executeCmd from './commands/execute.js'
import * as fixCmd from './commands/fix.js'
import * as generateCmd from './commands/generate.js'
import * as initCmd from './commands/init.js'
import * as learnCmd from './commands/learn.js'
import * as measureCmd from './commands/measure.js'
import * as planCmd from './commands/plan.js'
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
import { jsonOut } from './shared.js'
import { VERSION } from './version.js'

const cli = cac('veridia')

cli.command('version', 'Print the veridia version').action(() => jsonOut({ version: VERSION }))

cli.command('completion <shell>', 'Generate shell completion script').action((shell: string) => completionCmd.handle(shell))

cli.version(VERSION)
cli.help()

cli.command('classify <task>', 'Classify a task string').action((task: string) => classifyCmd.handle(task))

cli
  .command('assess', 'Assess verifiability of a target')
  .option('--target <path>', 'Target directory')
  .option('--type <type>', 'Task type')
  .action((opts: { target?: string; type?: string }) => assessCmd.handle(opts))

cli
  .command('route', 'Route (type, level) to a run plan')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .action((opts: { type: string; level: string }) => routeCmd.handle(opts))

cli
  .command('ask', 'Ask clarifying questions (levels 0/1)')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .action((opts: { type: string; level: string }) => askCmd.handle(opts))

cli
  .command('plan', 'Generate an execution plan for the host agent')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .option('--files <files>', 'Comma-separated file paths')
  .option('--target <path>', 'Target directory')
  .action((opts: { type: string; level: string; files?: string; target?: string }) => planCmd.handle(opts))

cli
  .command('execute', 'Execute a plan via the host agent')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .option('--files <files>', 'Comma-separated file paths')
  .option('--target <path>', 'Target directory')
  .action((opts: { type: string; level: string; files?: string; target?: string }) => executeCmd.handle(opts))

cli
  .command('verify', 'Run a target checks and print a verdict')
  .option('--target <path>', 'Target directory')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .action((opts: { target: string; type: string; level: string }) => verifyCmd.handle(opts))

cli
  .command('measure', 'Record a run outcome or print history')
  .option('--record <json>', 'Record a run outcome as JSON')
  .option('--history', 'Print history summary')
  .option('--task <task>', 'Task description')
  .option('--type <type>', 'Task type')
  .option('--level <level>', 'Verifiability level')
  .option('--verdict <verdict>', 'Verdict')
  .option('--target <path>', 'Target directory')
  .action((opts: Record<string, unknown>) => measureCmd.handle(opts))

cli
  .command('review', 'Output code review instructions for an AI agent')
  .option('--target <path>', 'Target directory')
  .action((opts: { target?: string }) => reviewCmd.handle(opts))

cli
  .command('agents', 'List all supported AI agents')
  .option('--list', 'List agents')
  .action((opts: { list?: boolean }) => agentsCmd.handle(opts))

cli
  .command('fix', 'Auto-fix found problems (console.log, TODO comments)')
  .option('--target <path>', 'Target directory')
  .option('--json', 'Output as JSON')
  .action((opts: { target?: string; json?: boolean }) => fixCmd.handle(opts))

cli
  .command('init', 'Initialize veridia config and agent command files')
  .option('--agent <name>', 'Agent name')
  .action((opts: { agent?: string }) => initCmd.handle(opts))

cli
  .command('generate', 'Generate agent command files')
  .option('--agent <name>', 'Agent name')
  .action((opts: { agent: string }) => generateCmd.handle(opts))

cli
  .command('learn', 'Analyze history and produce recommendations')
  .option('--target <path>', 'Target directory')
  .action((opts: { target?: string }) => learnCmd.handle(opts))

cli
  .command('watch', 'Watch files and run triage on changes')
  .option('--target <path>', 'Target directory')
  .option('--debounce <ms>', 'Debounce interval in milliseconds')
  .action((opts: { target?: string; debounce?: string }) => watchCmd.handle(opts))

cli
  .command('dashboard', 'Start a local web dashboard')
  .option('--target <path>', 'Target directory')
  .option('--port <port>', 'Port number')
  .action((opts: { target?: string; port?: string }) => dashboardCmd.handle(opts))

cli
  .command('run <task>', 'Run the full triage loop with human-readable output')
  .option('--target <path>', 'Target directory')
  .option('--auto', 'Non-interactive mode')
  .option('--self', 'Target self')
  .option('--ww', 'Warpweave mode')
  .option('--change <name>', 'Change name for warpweave')
  .action((task: string, opts: { target?: string; auto?: boolean; self?: boolean; ww?: boolean; change?: string }) => runCmd.handle(task, opts))

cli.command('session-classify <task>', 'Classify task and write to session').action((task: string) => sessionClassifyCmd.handle(task))

cli
  .command('session-assess', 'Assess target and write to session')
  .option('--target <path>', 'Target directory')
  .action((opts: { target?: string }) => sessionAssessCmd.handle(opts))

cli.command('session-route', 'Build plan from session').action(() => sessionRouteCmd.handle())

cli.command('session-ask', 'Ask questions from session').action(() => sessionAskCmd.handle())

cli.command('session-do', 'Execute plan from session').action(() => sessionDoCmd.handle())

cli.command('session-status', 'Show current session state').action(() => sessionStatusCmd.handle())

cli.command('session-archive', 'Archive session to history').action(() => sessionArchiveCmd.handle())

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

cli.parse()
