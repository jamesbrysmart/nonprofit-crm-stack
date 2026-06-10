# Workspace Object Default Views

## Purpose

This note is a working design log for default workspace-level list views when a
user clicks into an object from navigation.

It is exploratory rather than final. The intent is to capture the current
thinking, adjust it as we review the live product, and only harden it once the
workflow proves out.

The main question is not only whether a view is technically valid in Twenty.
It is whether the default view matches the real operational job of the object.

This is especially important for fundraising objects where some records are:

- active work queues
- control surfaces for grouped work
- browser-style reference lists
- short-lived staging records rather than durable primary records

`giftStaging` is the first object reviewed here because it is the clearest
example of a list that should behave like a queue rather than a general
record browser.

## Default View Design Questions

For each object, decide:

1. What is the object's main operational job?
2. Should the default view behave like a queue, browser, inbox, or archive?
3. Which records belong in the default view?
4. Which records should be hidden by default but remain available in saved views?
5. What sort order best matches the workflow?
6. Which columns matter for the first triage pass?
7. What related context should be visible so users do not take the wrong action?

## Gift Staging

### Product Role

`giftStaging` is an operational staging queue.

It is not the long-term home of fundraising records.
Once a row has been successfully processed, the user's main record of interest
is the committed `Gift`, not the staging row.

That means the default workspace-level view should optimize for:

- rows that still need review
- rows that are ready to process
- rows that failed and need attention

It should not optimize for:

- historical completeness
- browsing already-processed staging rows
- payment-attempt history

### Current Lean V1 Position

Current agreed direction for the default `Gift staging queue`:

- treat it as active staging work
- exclude `processingStatus = PROCESSED`

This is the leanest cross-channel rule that is highly likely to be correct.

Why this is the current v1 position:

- `processingStatus` applies across all staging sources
- `paymentState` is currently much more specific to the first-party donation
  form lifecycle
- CSV imports and many external integrations will usually never populate
  `paymentState`
- shaping the default queue too aggressively around `paymentState` would make
  one intake channel define the whole queue

Open question still under review:

- whether `AWAITING_PAYMENT` should also be excluded by default, because those
  rows are not actionable operational work

Current caution:

- `paymentState` filter semantics must not hide rows where `paymentState = null`
- ordinary CSV/imported rows with no payment lifecycle should remain visible

### Saved Views

The default view should not try to serve every purpose.

Working saved-view candidates:

- `Gift staging queue`
  Active work only.
- `Needs review`
  Rows that still require human review before processing.
- `Ready to process`
  Rows that can be processed now.
- `Failed`
  Rows with processing failures.
- `Processed`
  Historical/audit access to successfully processed staging rows.
- `Payment attempts`
  Optional view if donation-form payment lifecycle rows need separate review.
- `Unbatched`
  Optional view if users often need to distinguish single-row work from
  batch-managed work.

### Sort Order

Current working preference:

- default queue should sort newest staged rows first

Preferred sort basis:

- staging row creation / arrival time descending

Less suitable defaults:

- gift date descending
- donor name
- provider

Reason:

- a queue should answer "what has recently arrived and still needs action?"
- imported CSV rows may have older gift dates while still being newly-arrived
  work

### Default Columns

Current working preference:

- optimize for quick triage, not provider debugging

Recommended default columns:

- `Name`
- `Gift date`
- `Amount`
- donor evidence or linked donor
- `Intake source`
- `Gift ready status`
- `Processing status`
- `Gift batch`
- optionally `Provider`

Columns that are more audit/debug oriented and should not necessarily be shown
by default:

- `Provider payment ID`
- `Provider agreement ID`
- `External ID`

### Batch Awareness

If a staging row belongs to a `giftBatch`, the default queue should make that
obvious.

Reason:

- users may inspect one row in isolation
- but batch-managed work should not accidentally encourage one-by-one
  processing as the default operating mode

At minimum, the default queue should:

- show the `Gift batch` column
- make batch membership visible during list triage

Likely future UX direction:

- keep batched rows visible in the main queue
- but make batch context obvious enough that users naturally move into the
  batch control surface for grouped work

### Current Implementation Gap

The current `giftStagingsDefault` view is still only a partial expression of
this model.

Current characteristics:

- it has been simplified toward the leaner v1 rule of excluding processed rows
- it still does not capture the full queue design intent around sort, columns,
  and batch context

So the next design pass is still about:

- confirming the default queue behavior in real use
- deciding whether `AWAITING_PAYMENT` should be excluded by default
- deciding which columns and saved views best support the workflow

## Next Objects To Review

After `giftStaging`, likely candidates are:

- `giftBatch`
- `Gift`
- `RecurringAgreement`
- `Appeal`
- `AppealSource`
- `GiftAidClaimBatch`

Each of these has a different likely posture:

- queue
- control surface
- browser
- health/status list
- archival/reference view

They should not all inherit the same default view assumptions.
