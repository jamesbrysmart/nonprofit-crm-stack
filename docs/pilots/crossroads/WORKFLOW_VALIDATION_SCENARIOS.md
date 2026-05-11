# Crossroads Pilot — Workflow Validation Scenarios

_Status: first working draft_  
_Updated: 2026-04-29_

## Purpose

This document captures workflow validation scenarios for the Crossroads Care Kent pilot.

The goal is to harden the fundraising workflows before client walkthrough and pilot testing. These are not full product specs and should not replace the product review docs. They are practical operational scenarios used to check whether the current Twenty-apps fundraising build supports the workflows Crossroads is likely to care about.

The scenarios are intended to help us avoid blindspots before presenting the system as ready for pilot use.

## Pilot context

Crossroads currently appears to use Donorfy in a narrow way rather than as a full CRM.

Current understanding:

- Donorfy is mainly used for online donations, recurring donation administration / tracking, and Gift Aid.
- The finance/accounting system is the main source of truth for donation reporting.
- Offline and other non-Donorfy donations are generally handled outside Donorfy.
- The finance team are not primarily a fundraising team; the pilot needs to be practical and must not create unnecessary extra admin.
- The strongest pilot value is likely to come from clearer donation operations, more reliable Gift Aid handling, cleaner recurring donation tracking, and more useful data for finance/fundraising follow-up.

This means the pilot needs to prove two things at once:

1. It can replicate the core Donorfy-like workflows Crossroads relies on today.
2. It can improve those workflows enough to justify using the CRM as a cleaner operational home for donation data.

## Scenario format

Use this structure when expanding a scenario:

- **User / role**
- **Goal**
- **Starting context**
- **Workflow steps**
- **Expected system behaviour**
- **Acceptance checks**
- **Edge cases / blindspots**

Not every scenario below needs to be fully expanded immediately. The high-priority sections should be expanded first and used to drive product hardening.

## Priority guide

### Highest priority for Crossroads confidence

These are the workflows most likely to matter before saying the pilot is ready for a client walkthrough:

- Stripe one-off donation intake
- Stripe recurring donation intake / recurring tracking
- Gift Aid capture, declaration handling, and gift-level outcome
- Gift Aid claim batch workflow
- Finance handoff / reconciliation confidence

### Important product foundations

These are core fundraising-product workflows that support the above and reduce operational risk:

- Manual gift entry
- Donor duplicate interruption and explicit donor choice
- Staging review and processing
- Processing / commit boundary

### Important but not necessarily live-pilot-verifiable

These should remain important product/workflow areas, but should not be implied as live-tested with Crossroads unless separately validated:

- HMRC submission / direct Charities Online integration
- HMRC acceptance/rejection/payment lifecycle
- Full accounting integration beyond CSV/export-style handoff
- Referrals workflow
- Volunteer workflow

## 1. Manual gift entry

Manual entry is not Crossroads' only current priority, but it is a core product foundation. It also tests whether finance/admin users can create clean donation data without accidentally creating duplicate donors.

### Scenarios

1. Manual one-off gift from a new donor
2. Manual one-off gift from an existing donor
3. Manual gift where one likely duplicate donor is found
4. Manual gift where multiple possible duplicate donors are found
5. Manual gift where the user deliberately creates a new donor despite possible matches
6. Manual gift where donor details are changed after duplicate check
7. Manual gift with minimal required data only
8. Manual gift where duplicate check fails or cannot run

### Reference points: manual entry depth and shape

This section is not a final design decision. It captures the main options and tensions that came out of workflow review so they can be revisited consistently as the manual-entry surface evolves.

#### Stable core candidate

Current working view of the cross-charity core:

- donor identity
- amount
- currency
- payment type
- gift date

These are the fields that most strongly support the idea of Manual Gift Entry as a fast, trustworthy direct-create path.

#### Important but still open

The main open question is not whether these areas matter, but how much of them should sit in the default path:

- donor address
- Gift Aid capture
- appeal
- opportunity
- recurring linkage
- batch linkage

Some of these are likely to be relevant depending on the gift being entered rather than depending on the charity as a whole.

#### Charity-specific depth

Some capabilities may be irrelevant for certain charities and should not necessarily appear at all. Gift Aid is the clearest current example.

The requirement here is to avoid forcing irrelevant complexity onto every charity. The implementation mechanism remains open and should not be assumed from this document.

#### Working product tensions

These are the main questions still in play:

- how much of donor address should be treated as core versus conditional depth
- how quickly appeal and opportunity should return as first-class context
- how far the form should support richer gift context before it starts to feel burdensome
- how to avoid recreating the older all-in-one manual-entry drawer while still supporting the variety of gifts a charity may need to enter

#### Incremental direction to validate

The current working direction is to add depth in layers rather than trying to complete Manual Gift Entry in one pass:

1. strengthen the stable core
2. reintroduce the highest-value contextual fields
3. pause and reassess before adding broader gift-context depth

This subsection exists as a reference point for future workflow validation, not as a locked implementation plan.

### Expanded scenario: manual gift where duplicate donors are found

**User / role**  
Finance/admin user entering a one-off donation.

**Goal**  
Record a donation without accidentally creating or linking the wrong donor.

**Starting context**  
A person already exists in the CRM with the same first and last name as the donor being entered.

**Workflow steps**

1. User opens New Gift.
2. User enters donor name and gift details.
3. System checks for possible existing donors.
4. System interrupts save and shows matching donors.
5. User explicitly chooses an existing donor or chooses to create a new donor.
6. Gift is created only after this decision.

**Expected system behaviour**

- Save is blocked until the donor decision is made.
- Existing donor choice creates the gift linked to that person.
- Create-new choice creates a new person and links the gift to them.
- The system does not silently choose an existing donor or silently create a new one.

**Acceptance checks**

- Duplicate interruption appears before commit.
- User decision is explicit.
- Created gift has the correct donor relation.
- No duplicate donor is created unless the user chose that path.

**Edge cases / blindspots**

- Same name but different email.
- Same name with missing email.
- Multiple matching donors.
- User changes donor name after duplicate check.
- User attempts to save before resolving donor choice.

## 2. Stripe one-off donations

This is critical because Donorfy currently handles online donation intake. The pilot should show a credible replacement path for online donations, even if production-grade webhook/security details remain separately tracked.

### Scenarios

1. Stripe one-off donation from a new donor enters the CRM
2. Stripe one-off donation from an existing donor is matched or reviewed
3. Stripe one-off donation with incomplete donor details requires review
4. Stripe one-off donation creates a staged record rather than an immediately committed gift
5. Stripe one-off donation is reviewed and processed into a committed gift
6. Stripe one-off donation fails processing and shows a clear reason
7. Stripe one-off donation includes Gift Aid capture facts
8. Stripe one-off donation does not create duplicate donor records silently

### Expanded scenario: Stripe one-off donation enters staging and is processed

**User / role**  
Finance/admin user reviewing online donation intake.

**Goal**  
Confirm that an online donation can move from Stripe-style intake into a trusted committed gift record.

**Starting context**  
A one-off Stripe donation has been received with donor name, email, amount, date, and source metadata.

**Workflow steps**

1. Donation enters the CRM as a staged gift.
2. User sees it in the staging/review queue.
3. User opens the staged gift and reviews donor evidence, amount, date, source, and Gift Aid indicators if present.
4. User confirms or corrects donor resolution.
5. User marks the row ready.
6. User processes the staged gift into a committed gift.

**Expected system behaviour**

- The donation is visible as pending review before commit.
- Donor ambiguity is surfaced rather than silently ignored.
- User can correct core gift facts before processing.
- Processing creates a committed gift linked to the correct donor.
- The original intake source remains visible enough for audit/reconciliation.

**Acceptance checks**

- Staged record exists with Stripe/source context.
- Committed gift is created only after review/processing.
- Donor relation is correct.
- Gift amount and date are correct.
- Gift Aid facts are preserved if supplied.

**Edge cases / blindspots**

- Missing email.
- Donor name matches more than one person.
- Duplicate webhook / repeated event.
- Failed processing.
- Gift Aid requested but declaration data incomplete.

## 3. Recurring donations

Recurring donation tracking is central to replicating current Donorfy usage. Crossroads currently uses Donorfy to track ongoing regular donations, including manual updates when bank payments arrive.

### Scenarios

1. New Stripe recurring donation creates or links to a recurring agreement
2. First recurring payment creates a committed gift and recurring linkage
3. Subsequent recurring payment links to the existing recurring agreement
4. Finance/admin can see whether a recurring donation is active
5. Expected recurring donation is missing or overdue
6. Recurring donor stops giving / cancelled provider status is reflected
7. Manual bank-received recurring payment is recorded against an existing recurring donor
8. Recurring payment has donor ambiguity and requires review
9. Recurring payment includes Gift Aid capture or existing declaration context
10. Recurring donation history is visible enough to confirm ongoing support

### Expanded scenario: manual bank-received recurring payment is recorded

**User / role**  
Finance/admin user reconciling regular donations received in the bank account.

**Goal**  
Record that an expected recurring donation has been received without unnecessary duplicate entry or donor confusion.

**Starting context**  
A donor has an existing recurring agreement / regular giving record. A payment is visible in the bank/accounting process.

**Workflow steps**

1. User finds the existing donor or recurring agreement.
2. User records the received payment.
3. System links the gift/payment to the recurring agreement.
4. System updates the recurring agreement's latest payment / health indicators.

**Expected system behaviour**

- User does not need to create an unrelated standalone gift if the payment belongs to a recurring agreement.
- Payment is linked to the correct donor and recurring agreement.
- Recurring status remains understandable.
- Finance/admin can tell whether the recurring gift is still active or has become unclear.

**Acceptance checks**

- Gift is created with recurring linkage.
- Donor relation is correct.
- Agreement/payment history reflects the latest received payment.
- User can distinguish active, overdue, cancelled, or unclear recurring states.

**Edge cases / blindspots**

- Payment received with unclear reference.
- Donor name has changed.
- Donor has multiple recurring agreements.
- Payment amount differs from expected amount.
- Missed previous payment.

## 4. Gift Aid capture, declarations, and gift-level outcome

Gift Aid is a critical Crossroads workflow. The pilot needs to show an end-to-end Gift Aid path that is more visible and reliable than the current minimal Donorfy usage.

This section covers capture, declaration handling, and gift-level outcome. Claim batch workflow is covered separately because it is also critical for finance.

### Scenarios

1. Manual gift with Gift Aid requested and declaration captured
2. Manual gift with Gift Aid requested but declaration missing/incomplete
3. Stripe donation with Gift Aid declaration captured
4. Existing donor already has a valid Gift Aid declaration
5. Donor has no usable declaration and gift becomes needs_review
6. Declaration is created and linked to donor
7. Declaration history is visible on donor record
8. Gift Aid disabled: Gift Aid fields and logic do not interfere with gift entry
9. Gift Aid capture facts from staging/manual entry are converted into final gift outcome
10. Gift Aid outcome includes clear reason code and decision source

### Expanded scenario: manual gift with declaration captured

**User / role**  
Finance/admin user entering a donation.

**Goal**  
Capture Gift Aid declaration information and create a gift that receives the correct Gift Aid outcome.

**Starting context**  
Gift Aid capability is enabled. Donor is giving a one-off gift and has provided a declaration.

**Workflow steps**

1. User opens New Gift.
2. User enters donor and gift details.
3. User marks Gift Aid requested.
4. User records that declaration was captured, including date, source, coverage scope, and text version where required.
5. User resolves any donor duplicate interruption.
6. User creates the gift.

**Expected system behaviour**

- Declaration is created or resolved against the donor.
- Final gift receives a Gift Aid outcome.
- If the declaration and donor context are sufficient, gift is marked claimable.
- Gift links back to the relevant declaration where applicable.

**Acceptance checks**

- Gift Aid declaration record exists when needed.
- Declaration is related to the donor/person.
- Gift carries giftAidStatus, reason code, decision source, and declaration linkage.
- Gift Aid capture-only fields are not incorrectly treated as final-gift fields.

**Edge cases / blindspots**

- Donor selected after declaration fields are entered.
- Duplicate donor interruption changes the donor used for the gift.
- Missing declaration date.
- Missing address or donor context required for claimability.
- Gift Aid disabled.

## 5. Gift Aid claim batch workflow

This is a critical finance workflow. It should not be treated as optional or out of scope for Crossroads confidence.

The exact implementation may start lean, but the pilot needs to support a credible end-to-end claim batch process: finance must be able to see what is claimable, what is blocked, and what has been finalised for claim/export.

### Scenarios

1. Claimable gift is added to the current draft claim / claim batch
2. Gift with missing or invalid declaration is excluded from the claim and shown as needs review
3. Finance user reviews draft claim contents
4. Draft claim totals are visible and understandable
5. Finance user finalises/submits claim internally
6. Finalised/submitted claim prevents the same gift being claimed again
7. Gift Aid issue can be corrected before claim finalisation
8. Claim export/report can be produced for finance/HMRC process
9. New claimable gifts flow into the current draft claim rather than a finalised claim
10. Claim batch status is clear: draft, submitted/finalised, exported if applicable

### Expanded scenario: claimable gift enters draft claim

**User / role**  
Finance/admin user preparing a Gift Aid claim.

**Goal**  
Ensure claimable gifts are collected into a reviewable draft claim without manual hunting through individual gifts.

**Starting context**  
A committed gift has giftAidStatus = claimable and has not previously been claimed.

**Workflow steps**

1. Gift is created or processed with a claimable Gift Aid outcome.
2. System identifies it as eligible for the current draft claim.
3. User opens the draft claim or Gift Aid claim view.
4. User sees the gift included in claim contents and totals.

**Expected system behaviour**

- Claimable gift appears in current draft claim.
- Gift is not duplicated across multiple claims.
- User can understand claim amount and included gifts.
- Gifts needing review are excluded or clearly separated.

**Acceptance checks**

- Draft claim exists or is created as needed.
- Claimable gift is associated with the draft claim.
- Claim totals include the gift correctly.
- Gift carries enough status to prevent double claiming.

**Edge cases / blindspots**

- Gift Aid outcome changes after gift enters draft claim.
- Gift is edited before claim finalisation.
- Multiple claimable gifts from same donor.
- Gift is refunded/reversed before claim finalisation.
- Draft claim already finalised.

### Expanded scenario: finance finalises claim internally

**User / role**  
Finance/admin user completing Gift Aid claim preparation.

**Goal**  
Finalise a claim batch internally so gifts cannot accidentally be claimed again.

**Starting context**  
A draft claim contains one or more claimable gifts.

**Workflow steps**

1. User reviews included gifts and totals.
2. User confirms claim is ready.
3. User finalises/submits the claim internally.
4. Claim status changes from draft to submitted/finalised.
5. Included gifts are marked as claimed / associated with finalised claim.

**Expected system behaviour**

- Finalisation is explicit.
- Claim contents are frozen or protected enough to prevent accidental double claiming.
- Gifts in finalised claim are not added to future draft claims.
- User can still report/export the finalised claim.

**Acceptance checks**

- Claim status changes correctly.
- Included gifts are protected from duplicate claim inclusion.
- Claim totals remain understandable after finalisation.
- User can distinguish current draft from finalised claims.

**Edge cases / blindspots**

- User tries to finalise claim with needs_review gifts.
- Claim has no gifts.
- User needs to remove a gift before finalisation.
- Gift becomes invalid after claim finalisation.
- Export/report is required after finalisation.

## 6. Staging and review workflow

Staging matters for imported or integrated donations, especially Stripe and other non-manual channels. This section validates whether the queue/drawer workflow remains operationally coherent.

### Scenarios

1. Staged gift appears in review queue
2. User opens staged gift and reviews details
3. User corrects gift date or other core gift field
4. Staged gift has donor ambiguity and requires review
5. User confirms suggested donor
6. User leaves donor unresolved
7. User marks staged gift ready
8. Staged gift is blocked by a core issue
9. Failed staged gift shows clear reason and next step
10. User can work through multiple staged gifts without losing context
11. Staged gift includes Gift Aid capture facts
12. Staged gift processes into a final gift with Gift Aid outcome

### Expanded scenario: staged gift blocked by donor ambiguity

**User / role**  
Finance/admin user reviewing imported or integrated donations.

**Goal**  
Resolve or deliberately defer donor ambiguity before processing.

**Starting context**  
A staged gift has incoming donor evidence that matches more than one existing donor.

**Workflow steps**

1. User opens staging queue.
2. User sees staged gift marked as needing donor review / blocked.
3. User opens the drawer.
4. System shows donor evidence and candidate context.
5. User chooses a donor, leaves unresolved, or defers review.
6. System updates row state accordingly.

**Expected system behaviour**

- Donor ambiguity is visible in queue and drawer.
- User action is explicit.
- Processing does not silently rematch later in a way that contradicts review-time intent.

**Acceptance checks**

- Queue meaning is derived from stored facts/diagnostics, not hand-authored copy.
- Donor decision changes the durable staged record.
- Mark-ready/process is blocked until required review is complete.

**Edge cases / blindspots**

- Multiple exact matches.
- No match.
- Candidate list is stale.
- User changes core donor evidence after review.
- Gift Aid declaration exists on one possible duplicate but not another.

## 7. Processing / commit boundary

This section validates the boundary between review-time decisions and final committed gift creation.

### Scenarios

1. Ready staged gift processes into committed gift
2. Confirmed donor is respected during processing
3. Unresolved donor path behaves as expected
4. Gift Aid evaluation runs before final gift creation
5. Processing failure does not silently lose data
6. Retrying failed processing preserves review decisions
7. Processed gift is linked back to staged source
8. Processing does not silently reinterpret donor choice
9. Capture-only fields are not wrongly copied onto final gift
10. Final gift carries enough source/audit context

### Expanded scenario: confirmed donor is respected during processing

**User / role**  
Finance/admin user processing a staged gift.

**Goal**  
Ensure the donor decision made during review is respected when creating the final gift.

**Starting context**  
A staged gift has an explicitly confirmed donor.

**Workflow steps**

1. User reviews staged gift.
2. User confirms existing donor.
3. User marks staged gift ready.
4. User processes staged gift.
5. System creates final gift.

**Expected system behaviour**

- Processing uses the confirmed donor.
- Processing does not re-run matching and choose another donor silently.
- Final gift links to the reviewed donor.

**Acceptance checks**

- Final gift donor relation matches the staged confirmed donor.
- Staged source records processing outcome.
- Review decisions remain visible/auditable enough for troubleshooting.

**Edge cases / blindspots**

- Confirmed donor is later merged/deleted.
- Duplicate candidate existed but reviewer chose one explicitly.
- Gift Aid declaration belongs to a different duplicate donor.
- Processing fails after donor has been confirmed.

### Reference points: post-create correction and gift lifecycle

This subsection is not a final implementation design. It captures the current working product frame for how committed gifts should behave once they exist.

#### Working principle

The current product philosophy remains:

- uncertainty should be resolved before canonical gift creation where possible
- downstream processes should be able to trust committed gifts

But real operations still require:

- occasional correction of data-quality errors after gift creation
- explicit handling of real-world post-creation events

The current working principle is:

- a canonical gift should be easy to correct while it is still operationally internal
- and harder to silently mutate once it has been used downstream

#### Two different problem types

The main distinction is between:

- record errors
- real-world post-creation events

Examples of record errors:

- admin entered something incorrectly
- an integration mapped something badly
- donor matching or deduplication was wrong
- a duplicate or typo slipped through

Examples of real-world post-creation events:

- refund
- chargeback
- payment failure
- void or reversal
- later consequences for Gift Aid, finance, reporting, or acknowledgement

These should not be treated as the same thing.

#### Downstream state matters

Field sensitivity is not static. The correct handling depends on both:

- the field being changed
- whether the gift is still operationally internal or has already been used downstream

For current workflow thinking, “downstream use” includes things like:

- receipting / acknowledgement
- Gift Aid claim inclusion
- finance export
- reconciliation
- external sync
- reporting states that should be treated as locked or relied on

#### Working matrix

| Change type | Sensitivity | Before downstream use | After downstream use | Current working read |
| --- | --- | --- | --- | --- |
| Appeal / opportunity / notes / internal references | Lower | Low-friction correction is acceptable | Still generally editable, but may need signposting if used in reporting/export contexts | ordinary correction |
| Donor link / amount / currency / gift date / payment type / Gift Aid facts / recurring linkage | Higher | Correction can still happen on the gift itself with relatively low friction | Should become more explicit, warn about consequences, and support follow-up rather than quiet mutation | sensitive correction |
| Refund / chargeback / void / reversal / failed payment after creation | Not a normal edit | Should not be modeled as plain field editing | Should be visible as explicit gift-level action/state change | lifecycle event |

#### Current v1 direction

The current working direction is:

- avoid introducing a separate correction or adjustment object in v1 unless the repo model clearly demands it
- allow controlled correction on the gift itself
- use UI guardrails, audit/history where available, and downstream warnings/signposting
- represent real post-creation lifecycle events explicitly in the gift state or through controlled actions rather than raw edits

#### Extensibility note

This should not be treated as a fixed field whitelist.

The current `Gift` object is still pre-v1 and will likely continue to evolve. Examples already in view include:

- dedicated `appeal` and `fund` fields or relations replacing temporary capture fields
- additional first-party fundraising fields added as the pilot hardens
- customer-added custom fields

So the useful product pattern is:

- classify fields by role and sensitivity
- then apply the same pattern as the object grows

Current working categories are:

- contextual / lower-risk
- sensitive correction fields
- system-owned or downstream-owned fields
- explicit lifecycle actions or states

The exact UI/control mechanism should remain open. Depending on the case, the eventual solution may rely more on:

- layout and grouping
- field emphasis and signposting
- field-level permissions
- controlled actions
- or code-level protection where silent mutation would create real downstream risk

This subsection should be used as a reference point for future workflow validation and UI/layout discussions, not as a locked solution.

### Expanded scenario: canonical gift is later refunded

**User / role**  
Finance/admin user correcting the operational state of a committed gift after money has been returned to the donor.

**Goal**  
Represent a real refund as an explicit lifecycle event without deleting the original gift or quietly mutating its financial history.

**Starting context**  
A committed gift exists and is believed to have happened. Later, the charity refunds the money to the donor.

**Workflow steps**

1. User opens the committed gift record.
2. User chooses an explicit refund action rather than editing gift amount/date/details directly.
3. User records the minimum refund facts required by the workflow.
4. System marks the gift as refunded while preserving the original gift record.
5. System updates dependent operational surfaces where the refund has immediate effect.

**Expected system behaviour**

- The original gift record remains visible for audit/history.
- The original amount is preserved rather than edited away.
- The gift becomes visibly refunded rather than continuing to appear as a normal active gift.
- Refund is treated as a lifecycle event, not a normal field edit.
- If the gift is only in draft Gift Aid territory, the system can remove or exclude it from the draft claim before submission.
- If the gift has already been used in a finalized/submitted Gift Aid claim, the system should not silently rewrite claim history; that follow-up remains a later, more explicit workflow.

**Acceptance checks**

- Refunded gift is distinguishable from an active gift in normal record views.
- The original gift facts remain visible.
- The refund path does not require deleting the gift or editing amount to zero.
- Draft-claim Gift Aid behaviour works cleanly in the first pass where applicable.
- Submitted-claim consequences are not silently hidden or auto-mutated.

**Edge cases / blindspots**

- Refund occurs before the gift has been used downstream.
- Refund occurs after Gift Aid draft-claim inclusion but before claim finalization.
- Refund occurs after finalized/submitted claim inclusion.
- Partial refund versus full refund.
- Provider-originated refund versus admin-recorded refund.

### Reference points: refund first-pass boundary

The current working direction is to start with `Refund` as the first explicit gift lifecycle action because it is the clearest high-value post-creation event.

#### Core refund meaning

The first-pass product meaning should be:

- the gift happened
- money later went back to the donor
- the original gift record should remain visible
- the gift should no longer behave like a normal active successful gift

#### What the first pass should avoid

- deleting the gift
- editing amount down to zero
- quietly repurposing ordinary editable fields to imply refund
- introducing a full accounting-style reversal model too early

#### Minimum first-pass outcome

The refund model should support these truths:

- the original gift existed
- it was later refunded
- it is visibly distinct from an active gift
- it can affect Gift Aid behaviour in the simple draft-claim case
- it may have downstream consequences that need follow-up rather than silent mutation

#### First-pass Gift Aid boundary

Gift Aid consequences should be handled in two layers:

- draft-claim interaction belongs in the first pass
  - refunded gifts should be removable or excludable from draft claim preparation before submission
- finalized/submitted-claim consequences should be treated as a later step
  - this case is important but more complex
  - it should not be hidden
  - and it should not be silently auto-resolved in the initial refund implementation

#### Refund first-pass implementation shape

The current lean model should be:

- preserve the original gift amount as the historical fact
- store refund facts separately
- derive refund state from those facts rather than introducing a broad lifecycle status field too early

The likely first-pass fields are:

- `refundedAmount`
- `refundDate`
- `refundNote` or similar lightweight explanation field

Refund state would then be derived as:

- not refunded
- partially refunded
- fully refunded

from the relationship between original gift amount and refunded amount.

The current working direction is explicitly:

- no standalone gift lifecycle status field yet
- no separate refund object in the first pass
- no accounting-style reversal model
- no mutation of original gift amount to represent refund

This should be treated as the minimum implementation shape for a lean first refund pass, not as the final long-term lifecycle architecture.

#### Deferred for v1

The following Gift refinements should remain documented as future reference points, but are currently deferred for v1 unless testing exposes a concrete operational gap:

- a broader corrections model beyond the current ordinary/sensitive distinction
- additional lifecycle actions beyond refund
  - for now, deleting an invalid/accidental record remains an acceptable lightweight safety valve
- stronger downstream-reliance handling where the system does not yet have direct evidence

These remain useful future enhancement areas, but they should not be treated as required to complete the current v1 Gift lifecycle slice.

## 8. Finance handoff / reconciliation

Crossroads currently treats the finance/accounting system as the source of truth for donation reporting. The pilot needs to show a credible path for finance to trust CRM donation data and receive the information needed for reconciliation/accounting.

### Scenarios

1. Finance can see gifts entered during a period
2. Finance can export committed gifts
3. Export includes required fields for reconciliation
4. Gift Aid status is included where relevant
5. Offline/manual gifts and Stripe gifts are represented consistently
6. Finance can distinguish pending/staged gifts from committed gifts
7. Duplicate handling does not create confusing finance records
8. Claim batch export/report can be produced where required
9. Finance can reconcile recurring payments with expected recurring agreements
10. Finance can identify gifts excluded from export because they are pending/failed/review-only

### Expanded scenario: finance exports committed gifts

**User / role**  
Finance/admin user preparing records for accounting/reconciliation.

**Goal**  
Export committed gift data in a trustworthy way.

**Starting context**  
The CRM contains committed gifts from manual entry and Stripe/staged processing.

**Workflow steps**

1. User opens gifts/reporting/export view.
2. User filters by date or accounting period.
3. User exports committed gifts.
4. User checks export against finance/accounting needs.

**Expected system behaviour**

- Export contains committed gifts only, unless explicitly including staged/pending records.
- Export includes key reconciliation fields.
- Gift Aid status and claim status are included where relevant.
- Manual and Stripe gifts are represented consistently.

**Acceptance checks**

- Export can be generated.
- Fields are understandable.
- Pending/staged gifts are not accidentally treated as committed income.
- Gift Aid claim status is clear enough for finance follow-up.

**Edge cases / blindspots**

- Gift processed twice.
- Gift edited after export.
- Gift refunded/reversed.
- Claimable gift not yet included in Gift Aid claim.
- Finance system requires fields not currently captured.

## 9. Current Donorfy replacement confidence

This section is about whether the walkthrough can credibly show that the pilot covers the limited Donorfy role Crossroads currently relies on, while also offering clearer data and process.

### Scenarios

1. Online donation flow can be explained as a replacement for Donorfy donation intake
2. Recurring donation tracking can be explained as a replacement for current Donorfy usage
3. Gift Aid issues are more visible than in current Donorfy usage
4. Finance/admin can complete core tasks without additional admin burden
5. System gives a clearer picture of donor/donation data than current split setup
6. Claim batch process is understandable to finance users
7. Manual/offline donations can be represented if Crossroads wants a fuller source of truth
8. Donor duplicates are surfaced before they create data problems
9. The system can show what is pending, blocked, failed, claimable, or committed
10. The walkthrough can clearly separate what is working now from what is future scope

### Expanded scenario: finance/admin can complete core tasks without extra burden

**User / role**  
Finance/admin user.

**Goal**  
Confirm the pilot workflow does not feel like extra admin compared with current Donorfy/finance-system split.

**Starting context**  
User needs to record or review donations and Gift Aid without becoming a fundraising power user.

**Workflow steps**

1. User enters or reviews a donation.
2. User handles duplicate/Gift Aid interruptions only where necessary.
3. User can see whether the gift is committed, claimable, pending, or blocked.
4. User can hand off/export information for finance as needed.

**Expected system behaviour**

- The system asks for decisions only where they matter.
- The user does not need to understand internal architecture.
- Core tasks are easier or at least no worse than current Donorfy usage.
- Problems such as missing declarations or duplicate donors are more visible.

**Acceptance checks**

- Core workflow can be completed without developer help.
- User can understand what to do next.
- There is no hidden duplicate/Gift Aid issue after completion.
- Finance handoff remains possible.

**Edge cases / blindspots**

- Too many review prompts.
- Gift Aid complexity overwhelms manual entry.
- User cannot distinguish draft/staged/final gift states.
- Claim batch process feels disconnected from gift entry.

## 10. Not yet live-pilot validated / later hardening

These items may be important product areas, but should not be implied as live-tested with Crossroads unless specifically validated.

For this pilot, the key distinction is:

- **Gift Aid claim batch workflow is in scope and critical.**
- **HMRC / Charities Online submission remains important to build and test, but is unlikely to be live-tested with Crossroads during the pilot.** We can still validate it separately using HMRC-provided test services and fixtures.

Items in this category:

- Direct HMRC / Charities Online submission using HMRC test services rather than live pilot submission
- HMRC acceptance/rejection/payment lifecycle using test fixtures or sandbox-style validation rather than live client claims
- Full accounting-system integration beyond CSV/export-style handoff
- Advanced retrospective Gift Aid re-evaluation across all donor/declaration/gift changes
- Full recurring payment provider lifecycle and dunning-style exception handling
- Advanced donor stewardship automation
- Complex campaign/fund/allocation attribution
- Referrals workflow
- Volunteer workflow
- Production-grade role-based access across fundraising/referrals/service-delivery users
- Production-grade webhook ingress and raw-body signature verification unless separately proven

## Suggested use with Codex

Use this document to drive product-hardening work.

A useful prompt pattern:

> Review `docs/pilots/crossroads/WORKFLOW_VALIDATION_SCENARIOS.md` and compare the current implementation against the highest-priority sections. Identify which scenarios are already credibly supported, which are partially supported, and which need implementation or tests before we walk Crossroads through the pilot system.

The goal is not to implement every scenario immediately. The goal is to avoid false confidence and make the remaining pilot gaps explicit.
