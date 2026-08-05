import { getAllAgents } from '../../agent/agents.js'
import { log as vlog } from '../../util/log.js'
import { VALID_LEVELS, VALID_TYPES } from '../shared.js'

function generateBash(): string {
  const commands = [
    'version',
    'classify',
    'assess',
    'route',
    'ask',
    'plan',
    'execute',
    'verify',
    'measure',
    'review',
    'agents',
    'init',
    'generate',
    'learn',
    'run',
    'session-classify',
    'session-assess',
    'session-route',
    'session-ask',
    'session-do',
    'session-status',
    'session-archive',
  ]
  const agents = getAllAgents().map((a) => a.id)
  return `
_veridia_completion() {
  local cur prev words cword
  _init_completion || return
  case $prev in
    --type) COMPREPLY=($(compgen -W "${VALID_TYPES.join(' ')}" -- "$cur")) ;;
    --level) COMPREPLY=($(compgen -W "${VALID_LEVELS.join(' ')}" -- "$cur")) ;;
    --agent) COMPREPLY=($(compgen -W "${agents.join(' ')}" -- "$cur")) ;;
    --target|--change) COMPREPLY=($(compgen -d -- "$cur")) ;;
    *)
      if [[ $cword -eq 1 ]]; then
        COMPREPLY=($(compgen -W "${commands.join(' ')}" -- "$cur"))
      fi ;;
  esac
} && complete -F _veridia_completion veridia
`
}

function generateZsh(): string {
  const commands = [
    'version:Print the veridia version',
    'classify:Classify a task string',
    'assess:Assess verifiability of a target',
    'route:Route (type, level) to a run plan',
    'ask:Ask clarifying questions',
    'plan:Generate an execution plan',
    'execute:Execute a plan via the host agent',
    'verify:Run a target checks',
    'measure:Record a run outcome or print history',
    'review:Output code review instructions',
    'agents:List all supported AI agents',
    'init:Initialize veridia config',
    'generate:Generate agent command files',
    'learn:Analyze history and produce recommendations',
    'run:Run the full triage loop',
    'session-classify:Classify task and write to session',
    'session-assess:Assess target and write to session',
    'session-route:Build plan from session',
    'session-ask:Ask questions from session',
    'session-do:Execute plan from session',
    'session-status:Show current session state',
    'session-archive:Archive session to history',
  ]
  return `
#compdef veridia
_veridia() {
  local context state state_descr line
  typeset -A opt_args
  _arguments \\
    '--target[Target directory]:directory:_files -/' \\
    '--auto[Non-interactive mode]' \\
    '--self[Target self]' \\
    '--ww[Warpweave mode]' \\
    '--change[Change name]:name' \\
    '--type[Task type]:type:(${VALID_TYPES.join(' ')})' \\
    '--level[Verifiability level]:level:(${VALID_LEVELS.join(' ')})' \\
    '--agent[Agent name]:agent:(${getAllAgents()
      .map((a) => a.id)
      .join(' ')})' \\
    '--list[List agents]' \\
    '--record[Record JSON]:json' \\
    '--history[Print history]' \\
    '--files[Comma-separated files]:files' \\
    '--task[Task description]:task' \\
    '--verdict[Verdict]:verdict' \\
    '--dry-run[Dry run mode]' \\
    '1:command:(${commands.join(' ')})' \\
    '*::arg:->args'
}
_veridia
`
}

function generateFish(): string {
  const commands = [
    'version',
    'classify',
    'assess',
    'route',
    'ask',
    'plan',
    'execute',
    'verify',
    'measure',
    'review',
    'agents',
    'init',
    'generate',
    'learn',
    'run',
    'session-classify',
    'session-assess',
    'session-route',
    'session-ask',
    'session-do',
    'session-status',
    'session-archive',
  ]
  return `
complete -c veridia -f
complete -c veridia -n "test (count (commandline -opc)) -eq 1" -a "${commands.join(' ')}"
complete -c veridia -l type -x -a "${VALID_TYPES.join(' ')}"
complete -c veridia -l level -x -a "${VALID_LEVELS.join(' ')}"
complete -c veridia -l target -r -a "(__fish_complete_directories)"
complete -c veridia -l auto -d "Non-interactive mode"
complete -c veridia -l self -d "Target self"
complete -c veridia -l ww -d "Warpweave mode"
complete -c veridia -l change -x -d "Change name"
complete -c veridia -l agent -x -a "${getAllAgents()
    .map((a) => a.id)
    .join(' ')}"
complete -c veridia -l list -d "List agents"
complete -c veridia -l history -d "Print history"
complete -c veridia -l dry-run -d "Dry run mode"
`
}

export function handle(shell: string): void {
  switch (shell) {
    case 'bash':
      process.stdout.write(generateBash())
      break
    case 'zsh':
      process.stdout.write(generateZsh())
      break
    case 'fish':
      process.stdout.write(generateFish())
      break
    default:
      vlog.error(`completion: unknown shell: ${shell}. Supported: bash, zsh, fish`)
      process.exitCode = 1
  }
}
