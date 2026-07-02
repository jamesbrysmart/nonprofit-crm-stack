# Opportunity Funding Pipeline Model

Updated: 2026-06-23
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

We now have a more funding-aware Opportunity record experience by extending
Twenty's standard Opportunity record page with app-owned tabs rather than
replacing the standard record layout.

Current direction:

- one good funding-aware Opportunity tab, not radically different page layouts by stage
- strong passive summary first
- payment recording belongs in a separate `Payments` tab with linked gifts,
  so the main funding context stays compact
- stage-transition/task actions remain deferred until the front-component
  runtime path for metadata-backed stage labels is stable

### Current default record experience should surface

- stage
- funder / company
- point of contact
- owner
- requested amount
- awarded amount
- application deadline
- submitted date
- funding period start / end
- open tasks / recent activity

### Current app-owned tabs

- `Funding`: grouped funding/application/award fields on the standard
  Opportunity record page.
- `Payments`: compact `Record payment` action plus the native linked `Gifts`
  relation widget.

The `Record payment` action creates a committed company Gift linked to the
current Opportunity. It derives the Gift type from Opportunity funding type:

- grant / trust / statutory bid -> `GRANT`
- corporate sponsorship -> `SPONSORSHIP`
- major gift / other / missing -> `DONATION`

Manual gift entry remains the general fallback for company gifts or payments
that do not relate to a specific Opportunity.

This should work for both:

- pre-award application management
- awarded but still active grant stewardship

## 8. Explicit Opportunity Actions

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

Current product decision:

- this transition/task helper should not be mounted by default while the
  Twenty front-component renderer has unresolved SDK metadata import issues
- once stable, it is a likely fit as a lightweight action near the funding
  context, not as part of the payment-recording surface
- it should remain lightweight and stage-label agnostic

This keeps the standard Opportunity experience intact while still proving that
a stronger transition workflow can be layered into the fundraising-specific tab.

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
- add value through page design, starter conventions, and lightweight workflow components rather than a separate grants subsystem

## 11. Currency Default Note

Twenty currency fields default to `USD` when their field metadata does not
provide a default currency code. We tested an app-owned custom currency field
with:

```ts
defaultValue: {
  amountMicros: null,
  currencyCode: "'GBP'",
}
```

That app-level per-field default synced and worked. We are not keeping it in
the app for now because the preferred product direction is either a
workspace/app configuration value that can be defined once, or a native Twenty
workspace default currency if Twenty adds one. For the current client workspace,
currency labels/defaults can remain manually configured.

## 12. Current As-Built Note

The following are now in the app:

- `fundingType`
- `awardedAmount`
- `applicationDeadline`
- `submittedDate`
- `fundingPeriodStart`
- `fundingPeriodEnd`
- a funding-aware Opportunity fields view grouped as `Context`, `Application`,
  and `Award`
- an app-owned `Funding` tab attached to the standard Opportunity record page
- a stage-transition task component retained in code but not mounted on the
  current `Funding` tab

The transition task component is paused pending clarification/fix for the
Twenty front-component SDK metadata import issue.

This remains a working direction, not a locked implementation decision.
