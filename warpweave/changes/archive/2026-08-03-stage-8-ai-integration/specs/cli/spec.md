## MODIFIED Requirements

### Requirement: CLI dispatches subcommands

The CLI entrypoint SHALL accept a subcommand as the first positional argument and dispatch to the corresponding module. Supported subcommands SHALL be: `classify`, `assess`, `route`, `ask`, `verify`, `measure`, `review`, `agents`, `version`, and `--help`/`-h`.

#### Scenario: review subcommand dispatched
- **WHEN** the user runs `veridia review --target /path/to/repo`
- **THEN** the CLI dispatches to the review module and outputs agent instructions

#### Scenario: agents --list subcommand
- **WHEN** the user runs `veridia agents --list`
- **THEN** the CLI prints a table of all 33 supported AI agents with their config directories and invocation styles

#### Scenario: classify with --agent flag
- **WHEN** the user runs `veridia classify --agent claude "refactor the module"`
- **THEN** the CLI outputs agent instructions for AI-enhanced classification instead of regex result

#### Scenario: ask with --agent flag
- **WHEN** the user runs `veridia ask --agent claude --type feature --level 1`
- **THEN** the CLI outputs agent instructions for dynamic question generation
