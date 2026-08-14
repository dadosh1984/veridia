/**
 * Declarative CLI command registry.
 *
 * Each command is described as data, then `registerCommand`/`registerAll`
 * translate that data into cac calls. This keeps `index.ts` a flat list of
 * command definitions instead of 31 imperative `cli.command(...).option(...)`
 * chains.
 */
import type { CAC, Command } from 'cac'

// biome-ignore lint/suspicious/noExplicitAny: registry's AnyFunction is intentionally permissive so that cac's variadic `(...args: unknown[]) => void` action can delegate to typed handlers declared at the call site (see src/cli/index.ts and src/cli/commands/*.ts).
export type AnyFunction = (...args: any[]) => any

export type OptionDef = readonly [flag: string, description: string]

export interface CommandDef {
  /** Command name. Positional arg syntax follows cac (`<task>`, `[task]`, etc.). */
  readonly name: string
  /** Short help text shown in `veridia --help`. */
  readonly description: string
  /** Optional list of `--flag <value>` options. */
  readonly options?: readonly OptionDef[]
  /** Handler invoked by cac with the parsed positional arg(s) and options object. */
  readonly handler: AnyFunction
}

/** Register a single declarative command on a cac instance. */
export function registerCommand(cli: CAC, def: CommandDef): Command {
  let cmd = cli.command(def.name, def.description)
  if (def.options) {
    for (const [flag, description] of def.options) {
      cmd = cmd.option(flag, description)
    }
  }
  // cac invokes action with `(positional, options)` or `(options)` depending on
  // the command shape — spread the args straight through. Callers declare the
  // matching signature in `handler`.
  cmd.action((...args: unknown[]) => def.handler(...args) as never)
  return cmd
}

/** Register a list of declarative commands on a cac instance. */
export function registerAll(cli: CAC, defs: readonly CommandDef[]): void {
  for (const def of defs) {
    registerCommand(cli, def)
  }
}
