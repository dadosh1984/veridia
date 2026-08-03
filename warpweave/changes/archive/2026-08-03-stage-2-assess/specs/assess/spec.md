## Purpose

Lets users ask veridia how verifiable a task is by probing a target directory and receiving a verifiability level plus the oracles that back it.

## ADDED Requirements

### Requirement: assess subcommand accepts a target path
The `assess` subcommand SHALL accept an optional `--target <path>` flag (or a positional path) naming the directory or repository to probe. When no target is given, the probe SHALL target the current working directory.

#### Scenario: target flag given
- **WHEN** the user runs `veridia assess --target <path>`
- **THEN** the probe inspects `<path>` for verifiability oracles

#### Scenario: no target given
- **WHEN** the user runs `veridia assess`
- **THEN** the probe inspects the current working directory

#### Scenario: target path does not exist
- **WHEN** the user runs `veridia assess --target <missing>`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing path

### Requirement: assess returns a verifiability level
The `assess` command SHALL output a verifiability level for the probed target: `0` (none — no oracle), `1` (human — only a human can verify), `2` (partial — a subset is mechanically verifiable), or `3` (full — the result is mechanically verifiable). The level SHALL be derived from detected oracles, not from the task prompt.

#### Scenario: no oracles detected
- **WHEN** the probed target has no detectable oracle (no tests, no compiler/type-check, no lint, no CI)
- **THEN** the command reports level 1 (human)

#### Scenario: a compiler or type-check is detected
- **WHEN** the probed target declares a type-check or compiled language with a build/type-check step
- **THEN** the command reports at least level 2 (partial)

#### Scenario: tests covering the target are detected
- **WHEN** the probed target has a test runner with tests that reference the target files
- **THEN** the command reports level 3 (full) when the tests give a mechanical pass/fail signal for the change

#### Scenario: deterministic task strengthens the level
- **WHEN** the task being assessed is deterministic (single correct output) and a mechanical oracle exists
- **THEN** the command reports level 3 (full)

### Requirement: assess lists detected oracles
The `assess` command SHALL list each detected oracle with its kind (test runner, type-check, lint, CI) so the caller can see what backs the level. When no oracle is detected, the oracle list SHALL be empty.

#### Scenario: oracles present
- **WHEN** the probe detects a test runner and a CI config
- **THEN** the output lists both oracles with their kinds

#### Scenario: no oracles present
- **WHEN** the probe detects no oracles
- **THEN** the output reports an empty oracle list

### Requirement: assess is deterministic and local
The `assess` command SHALL be deterministic for a given target state, MUST NOT call any external model or network service, and MUST operate only on the local filesystem.

#### Scenario: repeated runs agree
- **WHEN** the same target is probed twice without changing its files
- **THEN** the command reports the same level and the same oracle list

#### Scenario: offline operation
- **WHEN** the target is probed with no network access
- **THEN** the command completes and reports a level and oracle list
