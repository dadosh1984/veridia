## ADDED Requirements

### Requirement: verify reports why a check failed
The `verify` command SHALL include on each failed check an optional error field describing the reason for the failure (the command's captured stderr, a spawn error such as ENOENT/EACCES, or a timeout), so that a FAIL verdict carries an explainable cause. Adding the error SHALL NOT change the derived verdict.

#### Scenario: failed command reports its stderr
- **WHEN** a resolved oracle command exits non-zero and writes to stderr
- **THEN** the check includes the captured stderr text as its error and the check is reported as failed

#### Scenario: un-spawnable command reports the error
- **WHEN** a resolved oracle command cannot be spawned (e.g. binary not found)
- **THEN** the check includes an error describing the spawn failure and is reported as failed
