# cli Specification

## Purpose

Provides the executable entrypoint of veridia: a single `veridia` command that reports its version and prints help, giving later stages (classify, assess, route, verify, measure) a stable shell to grow into.

## Requirements

### Requirement: Help output

The system SHALL provide a `--help` flag that prints usage information for the `veridia` command and exits with status 0.

#### Scenario: Help with explicit flag
- **WHEN** the user runs `veridia --help`
- **THEN** the CLI prints usage information naming the `veridia` command to stdout
- **AND** the CLI exits with status 0

#### Scenario: Help with short flag
- **WHEN** the user runs `veridia -h`
- **THEN** the CLI prints usage information to stdout
- **AND** the CLI exits with status 0

#### Scenario: Help with no arguments
- **WHEN** the user runs `veridia` with no arguments
- **THEN** the CLI prints usage information to stdout
- **AND** the CLI exits with status 0

### Requirement: Version output

The system SHALL provide a `version` subcommand that prints the current veridia version and exits with status 0.

#### Scenario: Version subcommand
- **WHEN** the user runs `veridia version`
- **THEN** the CLI prints a semantic version string (e.g. `0.1.0`) to stdout
- **AND** the CLI exits with status 0

#### Scenario: Version short flag
- **WHEN** the user runs `veridia -v`
- **THEN** the CLI prints a semantic version string to stdout
- **AND** the CLI exits with status 0

### Requirement: CLI dispatches subcommands

The CLI entrypoint SHALL accept a subcommand as the first positional argument and dispatch to the corresponding module. Supported subcommands SHALL be: `classify`, `assess`, `route`, `ask`, `verify`, `measure`, `version`, and `--help`/`-h`.

#### Scenario: measure subcommand dispatched
- **WHEN** the user runs `veridia measure --history`
- **THEN** the CLI dispatches to the measure module and prints the history

### Requirement: Unknown argument handling

The system SHALL reject unrecognized arguments with a non-zero exit status and a message identifying the problem.

#### Scenario: Unknown subcommand
- **WHEN** the user runs `veridia frobnicate`
- **THEN** the CLI exits with a non-zero status
- **AND** the CLI writes an error message to stderr that mentions the unknown argument

#### Scenario: Unknown flag
- **WHEN** the user runs `veridia --bogus`
- **THEN** the CLI exits with a non-zero status
- **AND** the CLI writes an error message to stderr that mentions the unknown flag

### Requirement: Exit status contract

The system SHALL use exit status 0 for successful help/version output and non-zero for unrecognized arguments, so scripts can gate on success.

#### Scenario: Success is zero
- **WHEN** the CLI prints help or version successfully
- **THEN** the exit status SHALL be 0

#### Scenario: Failure is non-zero
- **WHEN** the CLI rejects an unknown argument
- **THEN** the exit status SHALL be non-zero
