# Opportunity Funding Pipeline Model

Updated: 2026-06-09
Status: Working direction (`exploratory, likely`)
Purpose: Capture the current intended role of native Twenty `Opportunity` in the fundraising app for grant / bid / ask lifecycle work before payment, without prematurely turning this into a separate grants module.

## 1. Current Direction

The current likely v1 model is:

- `Opportunity` = the funding ask / bid / application / award context
- `Task` = reminders, follow-ups, reporting actions, internal review steps
- `Company` = the funder / trust / statutory body / corporate partner
- `Gift` = actual money received
- `Gift.opportunity` = link from received income back to the originating ask or award

This is intentionally lightweight.

It does **not** imply:

- a custom `GrantApplication` object,
- a heavy grant-management module,
- a second status model separate from Opportunity stage,
- or payment lifecycle living on `Opportunity`.

## 2. Product Boundary

The clean v1 boundary is:

- `Opportunity` owns the lifecycle up to and beyond award as a fundraising / stewardship record
- `Gift` owns the actual receipt of money

So:

- requested or expected funding belongs on `Opportunity`
- awarded but not yet paid funding belongs on `Opportunity`
- actual received income belongs on `Gift`

This means awarded-but-not-yet-paid income should **not** create premature or placeholder gifts.

## 3. Native Twenty Fields We Intend To Reuse

Native Twenty `Opportunity` already gives us several fields that fit this model well:

- `stage`
- `amount`
- `closeDate`
- `company`
- `owner`
- `pointOfContact`
- task / note / attachment targeting

Current lean interpretation:

- native `stage` = lifecycle truth
- native `amount` = requested / applied-for amount
- native `closeDate` = expected decision date

This avoids creating duplicate meanings for core lifecycle and amount fields.

## 4. Lean App-Level Fields Added

The current v1 field additions on `Opportunity` are:

- `fundingType`
- `awardedAmount`
- `applicationDeadline`
- `submittedDate`

These are intended as lightweight fundraising metadata, not a separate workflow system.

### `fundingType`

Purpose:

- distinguish grant / trust / statutory / sponsorship / major-gift style uses of `Opportunity`
- without assuming `Opportunity` is only ever used for one fundraising context

Current likely examples:

- grant
- trust/foundation
- statutory bid
- corporate sponsorship
- major gift
- other

### `awardedAmount`

Purpose:

- represent committed funding once known
- allow awarded-but-not-yet-paid opportunities to be tracked cleanly

This should sit alongside native `amount`:

- `amount` = requested amount
- `awardedAmount` = committed amount

### `applicationDeadline`

Purpose:

- operational submission deadline for bid / grant work

### `submittedDate`

Purpose:

- explicit record of when an application or bid was actually submitted

## 5. Fields We Are Intentionally Avoiding For V1

We do **not** currently intend to add:

- a second lifecycle/status field such as `decisionStatus`
- manual `receivedAmount`
- manual `outstandingAmount`
- reporting / compliance object model
- payment state fields on `Opportunity`

Reasons:

- lifecycle truth should remain native `Opportunity.stage`
- received/outstanding should later be derived from linked gifts, not manually keyed
- reporting obligations can start with `Task`
- payment lifecycle belongs to `Gift` and linked payment evidence, not to the opportunity pipeline record

The following remains plausible later, but is not yet clearly required as an app-level default:

- post-award requirement/compliance fields

## 6. Opportunity Stage Principle

We do **not** want app behavior tightly coupled to exact stage labels.

Different workspaces may use different stage names and different levels of pipeline granularity.

So the v1 principle is:

- native `Opportunity.stage` remains the lifecycle/status field
- the app should avoid depending on literal stage names where possible
- but workspaces should still be encouraged to cover the full funding lifecycle

The important lifecycle coverage is:

- active pre-award work
- awarded but still active work
- unsuccessful / lost work
- completed / closed work

This means the app should support post-award opportunity management without turning stage into a payment tracker.

We should avoid stage models that rely on payment-specific meanings such as:

- partially paid
- paid in full
- instalment 1 received

Those belong later in linked-gift reporting or a fuller award/payment model if ever needed.

## 7. Opportunity Page Experience

The app-level value here is not only field creation.

We now have a more funding-aware default Opportunity record experience.

Current direction:

- one good funding-aware opportunity page, not radically different page layouts by stage
- strong passive summary first
- light explicit workflow actions second, but not necessarily as defaults

### Current default record experience should surface

- stage
- funder / company
- owner
- requested amount
- awarded amount
- application deadline
- submitted date
- expected decision date
- linked gifts
- open tasks / recent activity

This should work for both:

- pre-award application management
- awarded but still active grant stewardship

## 8. Explicit Opportunity Actions And Optional Components

One small workflow layer we have now proven as viable is a stage-transition component that can:

- read the live workspace `Opportunity.stage` options,
- let the user choose a target stage,
- create one or more linked tasks as part of that transition,
- and keep task linkage on the native `Opportunity` / `Company` context.

This is useful because it is:

- user-driven
- tied to a real lifecycle transition
- not dependent on exact stage labels
- useful even if workspaces configure their own pipeline values.

Important current product decision:

- this transition/task helper should **not** be forced into the default Opportunity layout
- it should remain available as an app-owned component that a workspace can add where useful
- for example, on a dedicated tab or in a more workflow-specific record layout.

This keeps the default Opportunity experience lightweight while still proving that a stronger transition workflow can be layered on when a client wants it.

It should still remain lightweight in v1.

It should **not** become:

- a payment wizard,
- a grant-compliance subsystem,
- a parallel status engine,
- or a fixed-stage workflow tied to our own hard-coded labels.

## 9. Derived Financial Reporting Later

Later, the likely direction is:

- `receivedAmount` = derived from linked committed gifts
- `outstandingAmount` = `awardedAmount - receivedAmount`

But this should start as:

- reporting / summary derivation

not:

- manually maintained opportunity fields

That keeps the v1 data model lean and avoids competing truths.

## 10. Current Recommendation

The current likely v1 recommendation is:

- use native `Opportunity` as the funding/application/award pipeline object
- use native `Task` for reminders and post-award follow-up
- use native `Gift` for actual income
- keep `Gift.opportunity` as the payment linkage
- reuse native `stage`, `amount`, and `closeDate`
- add only a small set of fundraising-specific opportunity fields
- avoid stage-name-dependent app logic where possible
- add value through page design, starter conventions, and optional workflow components rather than a separate grants subsystem

## 11. Current As-Built Note

The following are now in the app:

- `fundingType`
- `awardedAmount`
- `applicationDeadline`
- `submittedDate`
- `fundingPeriodStart`
- `fundingPeriodEnd`
- a funding-aware Opportunity home fields view (`Funding detail`)
- a prototype stage-transition task component

The transition task component is intentionally treated as optional workspace-level workflow tooling, not a universal default on every Opportunity layout.

This remains a working direction, not a locked implementation decision.
