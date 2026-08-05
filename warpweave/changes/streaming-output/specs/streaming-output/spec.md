## Purpose

Lets users see verification gate output (vitest, tsc, lint) in real-time during execution, with explicit `--verbose` control, without polluting machine-readable stdout.

## ADDED Requirements

### Requirement: gate output streams to stderr in verbose mode

When `--verbose` is passed, veridia SHALL stream the stdout and stderr of each verification gate to the user's stderr in real-time as the gate runs.

#### Scenario: verbose run streams gate output
- **WHEN** the user runs `veridia run --verbose "<task>"` and a gate produces output
- **THEN** the gate's stdout and stderr appear on the user's stderr during execution
- **AND** the final JSON result on stdout remains clean and parseable

#### Scenario: non-verbose mode preserves captured behavior
- **WHEN** the user runs `veridia run "<task>"` without `--verbose`
- **THEN** gate output is captured and only surfaced on failure (existing behavior)

### Requirement: --verbose flag on verify and develop commands

The `verify` and `develop` commands SHALL accept a `--verbose` flag with the same streaming behavior.

#### Scenario: verify --verbose streams gate output
- **WHEN** the user runs `veridia verify --verbose --target . --type refactor --level 3`
- **THEN** gate output streams to stderr in real-time

#### Scenario: develop --verbose streams gate output
- **WHEN** the user runs `veridia develop --verbose --change <name>`
- **THEN** gate output streams to stderr in real-time
