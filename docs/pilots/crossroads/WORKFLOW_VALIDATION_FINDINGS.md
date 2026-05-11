# Workflow Validation Findings

_Working notes captured during pilot-oriented walkthroughs of the current app._

This file is intentionally lightweight.

- `WORKFLOW_VALIDATION_SCENARIOS.md` remains the target behavior / validation plan.
- This file captures observed gaps, bugs, and unresolved workflow questions discovered while walking the app against those scenarios.

Use the following labels in `Current read`:

- `bug`
- `decision gap`
- `defer`

## Findings

### 2026-05-06: Editing donor evidence after explicit donor link clears donor confirmation

- `Scenario`: Existing donor linked on a staged gift, then staged donor email is edited before processing.
- `Observed behavior`: Saving donor evidence clears the linked donor and resets donor resolution, so later processing can create a new donor unexpectedly.
- `Why it matters`: This can create unintended duplicate donors after an admin has already made an explicit donor decision.
- `Current read`: `bug`

### 2026-05-06: Editable donor evidence in staging review needs deeper workflow review

- `Scenario`: Admin edits staged donor evidence before or after donor matching/review decisions.
- `Observed behavior`: The workflow around donor evidence edits, donor matching, and later processing is fragile in unhappy-path cases and can lead to unclear outcomes.
- `Why it matters`: This affects when donor review is considered settled, what should invalidate it, and whether easy editing of imported/integrated donor evidence in staging creates more risk than value.
- `Current read`: `decision gap`

### 2026-05-07: Gift Aid claim submission records should be reviewed for read-only user locking before go-live

- `Scenario`: Admins can inspect system-generated `GiftAidClaimSubmission` history records that are created and updated by the app submission process.
- `Observed behavior`: The current app/runtime role shape has not yet been reviewed deeply enough to prove safe user-facing read-only locking on `GiftAidClaimSubmission` without risking collateral impact on app-managed create/update behavior.
- `Why it matters`: Claim submission records are intended as system-generated history/audit records, not a normal manual maintenance workflow, so user editability should be reviewed before go-live rather than left as an implicit default.
- `Current read`: `defer`
