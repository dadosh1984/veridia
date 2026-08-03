## Purpose

Lets veridia tolerate a UTF-8 BOM in a target's `package.json` when detecting oracles, so Windows-created files are handled deterministically.

## MODIFIED Requirements

### Requirement: assess lists detected oracles

The `assess` command SHALL list each detected oracle with its kind (test runner, type-check, lint, CI) so the caller can see what backs the level. When no oracle is detected, the oracle list SHALL be empty. Oracle detection SHALL ignore a leading UTF-8 byte-order mark (BOM) in `package.json` when checking scripts.

#### Scenario: oracles present
- **WHEN** the probe detects a test runner and a CI config
- **THEN** the output lists both oracles with their kinds

#### Scenario: no oracles present
- **WHEN** the probe detects no oracles
- **THEN** the output reports an empty oracle list

#### Scenario: oracle detection ignores a BOM in package.json
- **WHEN** the probed target has a `package.json` with a leading UTF-8 BOM that declares a `test` script
- **THEN** the command detects the test-runner oracle as if the BOM were absent

#### Scenario: oracle detection ignores a BOM in package.json (type-check)
- **WHEN** the probed target has a `package.json` with a leading UTF-8 BOM that declares a `typecheck` script
- **THEN** the command detects the type-check oracle as if the BOM were absent

### Requirement: assess is deterministic and local

The `assess` command SHALL be deterministic for a given target state, MUST NOT call any external model or network service, and MUST operate only on the local filesystem.

#### Scenario: repeated runs agree
- **WHEN** the same target is probed twice without changing its files
- **THEN** the command reports the same level and the same oracle list

#### Scenario: offline operation
- **WHEN** the target is probed with no network access
- **THEN** the command completes and reports a level and oracle list

#### Scenario: BOM-presence does not change detection
- **WHEN** the same `package.json` content is probed once with a leading BOM and once without
- **THEN** the command reports the same oracle list in both cases