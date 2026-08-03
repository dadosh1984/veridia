# measure Specification

## Purpose

Lets veridia record run outcomes (task, type, level, verdict, checks, drift) into a local JSON-line history and surface trends from accumulated history — closing the self-correction loop.

## Requirements

### Requirement: measure subcommand records a run outcome

The `measure` subcommand SHALL accept a `--record` mode that takes a JSON payload (or individual flags for task, type, level, verdict, checks, drift) and appends a JSON-line entry to `.veridia/history.jsonl` in the project root.

#### Scenario: record with JSON payload
- **WHEN** the user runs `veridia measure --record '{"task":"add auth","type":"feature","level":2,"verdict":"PASS","checks":[{"kind":"test-runner","passed":true}],"drift":""}'`
- **THEN** a new line is appended to `.veridia/history.jsonl` with that JSON object plus a `timestamp` field

#### Scenario: record with individual flags
- **WHEN** the user runs `veridia measure --record --task "add auth" --type feature --level 2 --verdict PASS`
- **THEN** a new line is appended to `.veridia/history.jsonl` with the constructed JSON object plus a `timestamp` field

#### Scenario: missing required fields
- **WHEN** the user runs `veridia measure --record --task "add auth"`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing required fields

### Requirement: measure subcommand surfaces history

The `measure` subcommand SHALL accept a `--history` mode that reads `.veridia/history.jsonl` and prints a summary: total runs, runs per verdict, runs per level, and the most recent 5 entries.

#### Scenario: history with data
- **WHEN** the user runs `veridia measure --history` and `.veridia/history.jsonl` has 10 entries
- **THEN** the command prints total runs (10), runs per verdict, runs per level, and the 5 most recent entries

#### Scenario: history with no data
- **WHEN** the user runs `veridia measure --history` and `.veridia/history.jsonl` does not exist
- **THEN** the command prints "No history found" and exits zero

### Requirement: history file is append-only and local

The `measure` module SHALL append to `.veridia/history.jsonl` without reading or rewriting the file, MUST NOT call any external model or network service, and SHALL create the `.veridia/` directory if it does not exist.

#### Scenario: directory created on first record
- **WHEN** the user runs `veridia measure --record` and `.veridia/` does not exist
- **THEN** the directory is created and the entry is written

#### Scenario: offline operation
- **WHEN** the user runs `veridia measure --history` with no network access
- **THEN** the command completes and prints history from the local file

### Requirement: measure is deterministic

The `measure` command SHALL be deterministic for a given input and history state, and SHALL NOT involve any model or AI.

#### Scenario: repeated record with same input
- **WHEN** the same record input is written twice
- **THEN** both entries are identical except for their timestamps
