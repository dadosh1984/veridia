## Purpose

Safe automatic fixing: `veridia fix` removes console-log and TODO markers from code as code nodes (never as string content), previews changes with dry-run, and refuses to modify uncommitted working trees without an explicit override.

## ADDED Requirements

### Requirement: fix removes only actual code nodes

The `fix` command SHALL remove `console.log`/`console.debug`/`console.info` calls and `TODO`/`FIXME`/`HACK`/`XXX` comments only when they appear as real code (expression statements / comments), and SHALL NOT modify their textual occurrences inside string literals, template literals, or comments that merely mention them.

#### Scenario: template literal content is preserved
- **WHEN** a multiline template literal contains a line that reads `console.log(result)` as string content
- **THEN** the fix command leaves the template literal unchanged
- **AND** the runtime value of the string is not altered

#### Scenario: real console.log statement is removed
- **WHEN** a file contains a top-level `console.log('hi')` expression statement
- **THEN** the fix command removes that statement
- **AND** the remaining code is still syntactically valid

#### Scenario: multiline console.log is removed
- **WHEN** a `console.log(a, b)` call spans multiple lines
- **THEN** the fix command removes the entire call statement across all its lines

### Requirement: dry-run preview

The `fix` command SHALL accept a `--dry-run` flag that reports the files, lines, and actions that would be applied without writing any file.

#### Scenario: dry-run reports without writing
- **WHEN** the user runs `veridia fix --dry-run --target <repo>` and a fixable finding exists
- **THEN** the command lists the finding with file and line
- **AND** no file on disk is modified
- **AND** the fixed count reflects what would have been fixed

#### Scenario: dry-run on clean repo
- **WHEN** the user runs `veridia fix --dry-run --target <repo>` and no fixable findings exist
- **THEN** the command reports zero fixes and exits zero

### Requirement: git-dirty guard

When the target is inside a git working tree, the `fix` command SHALL refuse to write changes if the tree has uncommitted modifications, unless the user passes `--force`. Dry-run SHALL NOT be blocked by the guard.

#### Scenario: uncommitted changes block write
- **WHEN** the target repo has uncommitted changes and the user runs `veridia fix --target <repo>`
- **THEN** the command exits non-zero and writes a message to stderr explaining the guard
- **AND** no file is modified

#### Scenario: --force overrides the guard
- **WHEN** the target repo has uncommitted changes and the user runs `veridia fix --force --target <repo>`
- **THEN** the command applies the fixes despite the dirty tree

#### Scenario: dry-run ignores the guard
- **WHEN** the target repo has uncommitted changes and the user runs `veridia fix --dry-run --target <repo>`
- **THEN** the command runs and reports findings without being blocked

#### Scenario: non-git directory is not blocked
- **WHEN** the target is not inside a git working tree
- **THEN** the command applies fixes without the guard
