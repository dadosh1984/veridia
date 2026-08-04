# ask Specification

## Purpose

Lets veridia ask a human 2–3 short multiple-choice clarifying questions when a task's verifiability is 0/1, so unverifiable work gets an explicit human-owned contract instead of a guess.

## Requirements

### Requirement: ask subcommand accepts type and level

The `ask` subcommand SHALL accept a `--type <type>` flag holding a task type (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open`) and a `--level <level>` flag holding a verifiability level (`0` | `1` | `2` | `3`). Both flags SHALL be required.

#### Scenario: both flags given
- **WHEN** the user runs `veridia ask --type feature --level 1`
- **THEN** the command prints questions and exits 0

#### Scenario: missing type flag
- **WHEN** the user runs `veridia ask --level 1`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing flag

#### Scenario: invalid level value
- **WHEN** the user runs `veridia ask --type feature --level 9`
- **THEN** the command exits non-zero and writes an error to stderr naming the invalid level

### Requirement: ask emits clarifying questions for level 0/1

At verifiability level `0` or `1`, the `ask` command SHALL print 2 to 3 clarifying questions, each with multiple-choice options. The question set SHALL be derived deterministically from the task type and the level.

#### Scenario: level 1 feature asks two to three questions
- **WHEN** the user runs `veridia ask --type feature --level 1`
- **THEN** the command prints between 2 and 3 questions, each with options

#### Scenario: level 0 open asks about expectation
- **WHEN** the user runs `veridia ask --type open --level 0`
- **THEN** the command prints between 2 and 3 questions including one about the expected outcome

#### Scenario: repeatable questions
- **WHEN** the same `--type` and `--level` are asked twice
- **THEN** both runs print the identical question set

### Requirement: ask declines when a mechanical oracle exists

At verifiability level `2` or `3`, the `ask` command SHALL not print questions; it SHALL print a message that no clarifying questions are needed and exit 0.

#### Scenario: level 3 declines questions
- **WHEN** the user runs `veridia ask --type bugfix --level 3`
- **THEN** the command prints a decline message and exits 0
- **AND** the command prints no questions

#### Scenario: level 2 declines questions
- **WHEN** the user runs `veridia ask --type feature --level 2`
- **THEN** the command prints a decline message and exits 0

### Requirement: ask is deterministic and local

The `ask` command SHALL be deterministic for a given input, MUST NOT call any external model or network service, and SHALL produce its questions purely from the static question bank.

#### Scenario: offline operation
- **WHEN** the user runs `veridia ask --type doc --level 1` with no network access
- **THEN** the command completes and prints the same questions it would print online

#### Scenario: repeated runs agree
- **WHEN** the user runs `veridia ask --type feature --level 1` twice
- **THEN** both runs print the identical question set

### Requirement: ask declines at high verifiability

When the verifiability level is 2 or 3, the `ask` command SHALL print a decline message and return no questions, since the task is mechanically verifiable.

#### Scenario: level 3 declines
- **WHEN** the user runs `veridia ask --type bugfix --level 3`
- **THEN** the command prints a decline message and returns no questions

#### Scenario: level 2 declines
- **WHEN** the user runs `veridia ask --type feature --level 2`
- **THEN** the command prints a decline message and returns no questions
