## MODIFIED Requirements

### Requirement: CLI dispatches subcommands

The CLI entrypoint SHALL accept a subcommand as the first positional argument and dispatch to the corresponding module. Supported subcommands SHALL be: `classify`, `assess`, `route`, `ask`, `verify`, `measure`, `version`, and `--help`/`-h`. When the first argument is not a recognized subcommand or flag, the CLI SHALL treat it as a task string and run the end-to-end triage loop.

#### Scenario: end-to-end triage with task string
- **WHEN** the user runs `veridia add dark mode support`
- **THEN** the CLI dispatches to the triage module and prints a summary

#### Scenario: unknown subcommand still rejected
- **WHEN** the user runs `veridia --bogus`
- **THEN** the command exits non-zero and prints usage to stderr
