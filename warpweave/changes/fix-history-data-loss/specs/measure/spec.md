## MODIFIED Requirements

### Requirement: measure subcommand surfaces history

The `measure` subcommand SHALL accept a `--history` mode that reads `.veridia/history.jsonl` and prints a summary: total runs, runs per verdict, runs per level, and the most recent 5 entries.

#### Scenario: history with data
- **WHEN** the user runs `veridia measure --history` and `.veridia/history.jsonl` has 10 entries
- **THEN** the command prints total runs (10), runs per verdict, runs per level, and the 5 most recent entries

#### Scenario: history with no data
- **WHEN** the user runs `veridia measure --history` and `.veridia/history.jsonl` does not exist
- **THEN** the command prints "No history found" and exits zero

### Requirement: corrupt history lines are reported, not hidden

When reading `.veridia/history.jsonl`, the system SHALL parse the file line-by-line and SHALL surface any lines that fail to parse as valid JSON: the count of skipped lines SHALL be written to stderr. Valid entries SHALL continue to be returned and processed.

#### Scenario: a corrupt line is skipped and reported
- **WHEN** `.veridia/history.jsonl` contains 9 valid JSON lines and 1 corrupt line
- **THEN** the summary reports 9 runs
- **AND** the command writes a warning to stderr stating that 1 line was skipped as invalid

#### Scenario: no corrupt lines
- **WHEN** all lines in `.veridia/history.jsonl` parse as JSON
- **THEN** no skip warning is written to stderr
- **AND** the summary reflects the full count

#### Scenario: trailing blank lines are ignored
- **WHEN** the file ends with one or more empty lines
- **THEN** no skip warning is emitted and the summary is unaffected
