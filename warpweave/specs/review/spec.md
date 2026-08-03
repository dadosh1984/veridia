# review Specification

## Purpose

Outputs structured code review instructions for an AI agent — specifies files to scan, patterns to check, and output format — without calling any model or network service.

## Requirements

### Requirement: review subcommand outputs agent instructions

The `review` subcommand SHALL accept a `--target <path>` flag and output structured JSON instructions for an AI agent to perform a code review.

#### Scenario: review with target
- **WHEN** the user runs `veridia review --target /path/to/repo`
- **THEN** the command outputs JSON with `files`, `patterns`, and `outputFormat` fields

#### Scenario: review with no target
- **WHEN** the user runs `veridia review`
- **THEN** the command uses the current working directory as target

### Requirement: review is deterministic and local

The `review` command SHALL be deterministic for a given target, MUST NOT call any external model or network service, and SHALL output only plain text/JSON.

#### Scenario: offline operation
- **WHEN** the user runs `veridia review --target /path/to/repo` with no network access
- **THEN** the command completes and outputs agent instructions
