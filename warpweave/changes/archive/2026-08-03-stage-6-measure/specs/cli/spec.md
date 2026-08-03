## MODIFIED Requirements

### Requirement: CLI dispatches subcommands

The CLI entrypoint SHALL accept a subcommand as the first positional argument and dispatch to the corresponding module. Supported subcommands SHALL be: `classify`, `assess`, `route`, `ask`, `verify`, `measure`, `version`, and `--help`/`-h`.

#### Scenario: measure subcommand dispatched
- **WHEN** the user runs `veridia measure --history`
- **THEN** the CLI dispatches to the measure module and prints the history

#### Scenario: unknown subcommand
- **WHEN** the user runs `veridia unknown`
- **THEN** the command exits non-zero and prints usage to stderr
