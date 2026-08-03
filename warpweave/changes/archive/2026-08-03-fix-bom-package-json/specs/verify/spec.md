## Purpose

Lets veridia tolerate a UTF-8 BOM in a target's `package.json` when resolving oracle commands, so Windows-created files resolve to runnable commands deterministically.

## MODIFIED Requirements

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