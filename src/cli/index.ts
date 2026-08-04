#!/usr/bin/env node
import { VERSION } from './version.js';
import { jsonOut } from './shared.js';
import * as classifyCmd from './commands/classify.js';
import * as assessCmd from './commands/assess.js';
import * as routeCmd from './commands/route.js';
import * as askCmd from './commands/ask.js';
import * as planCmd from './commands/plan.js';
import * as executeCmd from './commands/execute.js';
import * as verifyCmd from './commands/verify.js';
import * as measureCmd from './commands/measure.js';
import * as reviewCmd from './commands/review.js';
import * as agentsCmd from './commands/agents.js';
import * as initCmd from './commands/init.js';
import * as generateCmd from './commands/generate.js';
import * as learnCmd from './commands/learn.js';
import * as runCmd from './commands/run.js';
import * as triageCmd from './commands/triage.js';
import * as sessionClassifyCmd from './commands/session-classify.js';
import * as sessionAssessCmd from './commands/session-assess.js';
import * as sessionRouteCmd from './commands/session-route.js';
import * as sessionAskCmd from './commands/session-ask.js';
import * as sessionDoCmd from './commands/session-do.js';
import * as sessionStatusCmd from './commands/session-status.js';
import * as sessionArchiveCmd from './commands/session-archive.js';

const USAGE = `veridia - model-agnostic quality through mechanics

Usage:
  veridia [--help] [-h]     Print usage information
  veridia version [-v]      Print the veridia version
  veridia <task>            Run the full triage loop on a task string
  veridia classify <task>   Classify a task string
  veridia assess [--target <path>] [--type <type>]
                            Assess verifiability of a target
  veridia route --type <type> --level <level>
                            Route (type, level) to a run plan
  veridia ask --type <type> --level <level>
                            Ask clarifying questions (levels 0/1)
  veridia plan --type <type> --level <level> [--files <files>] [--target <path>]
                            Generate an execution plan for the host agent
  veridia execute --type <type> --level <level> [--files <files>] [--target <path>]
                            Execute a plan via the host agent
  veridia verify --target <path> --type <type> --level <level>
                            Run a target's checks and print a verdict
  veridia measure --record <json> [--task <task> --type <type> --level <level> --verdict <verdict>]
                            Record a run outcome
  veridia measure --history  Print history summary
  veridia review [--target <path>]
                            Output code review instructions for an AI agent
  veridia agents --list     List all supported AI agents
  veridia init --agent <name>
                            Initialize veridia config and agent command files
  veridia generate --agent <name>
                            Generate agent command files
  veridia learn [--target <path>]
                            Analyze history and produce recommendations
  veridia run <task> [--target <path>] [--auto] [--self] [--ww --change <name>]
                            Run the full triage loop with human-readable output
  veridia session-classify <task>
                            Classify task and write to session
  veridia session-assess [--target <path>]
                            Assess target and write to session
  veridia session-route     Build plan from session
  veridia session-ask       Ask questions from session
  veridia session-do        Execute plan from session
  veridia session-status    Show current session state
  veridia session-archive   Archive session to history

Options:
  -h, --help     Show this help message and exit
  -v, --version  Print the version and exit
`;

const COMMANDS: Record<string, (args: string[]) => void | Promise<void>> = {
  classify: classifyCmd.handle,
  assess: assessCmd.handle,
  route: routeCmd.handle,
  ask: askCmd.handle,
  plan: planCmd.handle,
  execute: executeCmd.handle,
  verify: verifyCmd.handle,
  measure: measureCmd.handle,
  review: reviewCmd.handle,
  agents: agentsCmd.handle,
  init: initCmd.handle,
  generate: generateCmd.handle,
  learn: learnCmd.handle,
  run: runCmd.handle,
  'session-classify': sessionClassifyCmd.handle,
  'session-assess': sessionAssessCmd.handle,
  'session-route': sessionRouteCmd.handle,
  'session-ask': sessionAskCmd.handle,
  'session-do': sessionDoCmd.handle,
  'session-status': sessionStatusCmd.handle,
  'session-archive': sessionArchiveCmd.handle,
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const arg = args[0];

  if (arg === undefined || arg === '--help' || arg === '-h') {
    process.stdout.write(USAGE);
    process.exitCode = 0;
  } else if (arg === 'version' || arg === '-v' || arg === '--version') {
    jsonOut({ version: VERSION });
  } else if (arg.startsWith('--')) {
    process.stderr.write(`veridia: unknown argument: ${arg}\n\n${USAGE}`);
    process.exitCode = 1;
  } else if (arg in COMMANDS) {
    await COMMANDS[arg](args);
  } else {
    await triageCmd.handle(args);
  }
}

main();
