# verify Specification

## Purpose
Lets veridia run a task's mechanical oracles, weigh them against verifiability theater, and gate on the result with a verdict — the deterministic quality backstop of the triage loop.
## Requirements
### Requirement: verify subcommand accepts target, type, and level
The `verify` subcommand SHALL accept a `--target <path>` flag (or positional path) naming the repository to verify, a `--type <type>` flag (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open`), and a `--level <level>` flag (`0` | `1` | `2` | `3`). All three SHALL be required.

#### Scenario: all flags given
- **WHEN** the user runs `veridia verify --target <path> --type feature --level 2`
- **THEN** the command runs the target's checks and prints a verdict

#### Scenario: missing type flag
- **WHEN** the user runs `veridia verify --target <path> --level 2`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing flag

#### Scenario: missing target path does not exist
- **WHEN** the user runs `veridia verify --target <missing> --type feature --level 2`
- **THEN** the command exits non-zero and writes an error to stderr naming the missing path

#### Scenario: invalid level value
- **WHEN** the user runs `veridia verify --target <path> --type feature --level 9`
- **THEN** the command exits non-zero and writes an error to stderr naming the invalid level

### Requirement: verify discovers and runs oracle commands

The `verify` command SHALL detect the target's oracles (test runner, type-check, lint, CI), resolve each to a runnable command (from `package.json` scripts with runnable defaults), and execute each command against the target, collecting pass/fail per oracle. Command resolution SHALL ignore a leading UTF-8 byte-order mark (BOM) in `package.json` when reading scripts.

#### Scenario: test runner detected
- **WHEN** the target declares a `test` script in `package.json`
- **THEN** the command runs that script and reports the oracle as passed or failed

#### Scenario: no oracles detected
- **WHEN** the target has no detectable oracles
- **THEN** the command reports zero checks and returns a HUMAN verdict

#### Scenario: command failure is reported
- **WHEN** a resolved oracle command exits non-zero
- **THEN** the command reports that oracle as failed

#### Scenario: command resolution ignores a BOM in package.json
- **WHEN** the target's `package.json` has a leading UTF-8 BOM and declares a `test` script
- **THEN** the command resolves the test oracle to that script as if the BOM were absent

#### Scenario: BOM does not change the resolved command
- **WHEN** the same `package.json` content is resolved once with a leading BOM and once without
- **THEN** the command resolves to the same runnable command in both cases

### Requirement: verify weighs oracles against theater
The `verify` command SHALL assign each oracle a weight reflecting how much it captures meaning, downgrading weak signals: an empty or assert-less test suite SHALL be treated as weak (not trusted as a strong oracle), a type-check SHALL weigh more than a lint, and no judgment or model SHALL be involved in the weight.

#### Scenario: empty tests are weak
- **WHEN** the target has a test runner but its test files are empty or assert-less
- **THEN** the test oracle is weighted as weak and cannot alone produce PASS

#### Scenario: test runner beats lint
- **WHEN** both a test runner with real tests and a lint are detected
- **THEN** the test oracle has higher weight than lint

### Requirement: verify honors configurable oracle weights
The `verify` command SHALL allow the base weight of an oracle to be overridden by a user-supplied `weights` map (of oracle kind to numeric weight) from the veridia config when present, while falling back to the built-in default weights for any oracle kind not overridden. The override SHALL NOT involve any model or judgment and SHALL only scale the base weight before sensitivity/precision calibration.

#### Scenario: configured weight overrides default
- **WHEN** the config supplies a weight for the `test-runner` oracle and a target declares a test runner
- **THEN** the test oracle uses the configured weight instead of the built-in default

#### Scenario: unconfigured oracle keeps default
- **WHEN** the config supplies weights only for the `test-runner` oracle and a target declares a lint oracle
- **THEN** the lint oracle keeps its built-in default weight

### Requirement: verify gates on a verdict
The `verify` command SHALL derive a verdict from the level and weighted checks: at level 3, PASS requires all strong checks to pass (any strong failure → FAIL); at level 2, PASS requires all runnable checks to pass with judgment flagged for a human; at level 0/1, the verdict SHALL be HUMAN (checks run and are reported but do not pass/fail the result).

#### Scenario: level 3 all green
- **WHEN** the target passes all strong checks at level 3
- **THEN** the command reports verdict PASS

#### Scenario: level 3 strong check fails
- **WHEN** a strong oracle fails at level 3
- **THEN** the command reports verdict FAIL

#### Scenario: level 2 partial
- **WHEN** all runnable checks pass at level 2
- **THEN** the command reports verdict PASS with judgment flagged to a human

#### Scenario: level 1 human verdict
- **WHEN** the user runs verify at level 1
- **THEN** the command reports verdict HUMAN and does not report PASS or FAIL

### Requirement: verify is deterministic and local

The `verify` command SHALL be deterministic for a given target state, MUST NOT call any external model or network service, and SHALL execute only local commands resolved from the target itself.

#### Scenario: offline operation
- **WHEN** the target is verified with no network access
- **THEN** the command completes and reports a verdict

#### Scenario: repeated runs agree
- **WHEN** the same target is verified twice without changing its files
- **THEN** both runs report the same verdict and the same per-oracle results

#### Scenario: BOM-presence does not change the verdict
- **WHEN** a target whose `package.json` has a leading BOM is verified twice without changing its files
- **THEN** both runs report the same verdict and the same per-oracle results

