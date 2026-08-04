## Context

See `proposal.md`. Add dogfooding step to CI workflow.

## Decisions

Add after the test step: `veridia run "classify task" --self --auto` and `veridia run "assess project" --self --auto`. These verify the tool works on its own source.
