# UI Components Catalog

This catalog lists the current fundraising app UI components and review blocks we are building during the migration.

It is intended to help us:

- see where similar functionality already exists,
- avoid building the same thing twice,
- spot where there is value in reusing a concept, a TypeScript model, or a full UI block,
- keep an eye on where similar functionality is starting to diverge.

This is not a locked component library spec.

- It should be updated as we add, remove, or reshape components.
- It is fine for entries to be provisional.
- If a component turns out to be a dead end, note that rather than pretending it never existed.

## How To Read This

- `Type`
  - `Front component`: a custom Twenty front component
  - `Native widget assembly`: a page/tab layout built mainly from Twenty widgets
  - `Pattern`: a reusable UI concept that may span multiple components
- `Reuse level`
  - `Shared concept`: similar responsibility, but not yet the same implementation
  - `Shared model candidate`: likely to share TypeScript/view-model logic
  - `Reusable component candidate`: plausible full reusable UI block
  - `Local only`: currently specific to one surface

## Current Inventory

| Name | Type | Current locations | Purpose | Reuse level | Notes |
|---|---|---|---|---|---|
| `Gift batch control surface` | Front component | `giftBatch` record `Review` tab | Batch summary, metrics, batch actions, links into native staged-gift worklists | Shared concept | Mirrors the newer control-surface pattern rather than trying to be the main row-review workspace |
| `Gift Aid claim batch control surface` | Front component | `giftAidClaimBatch` record `Workspace` tab | Draft claim summary, finalize action, links into native gift worklists | Shared concept | Closely related to the gift-batch control-surface pattern |
| `Gift staging review state` | Front component | `giftStaging` `Review` and `Review v2` tabs | Lean review landing block: status, batch context, signposting | Shared concept | Intended as a first-tab / home-style block rather than a full working surface |
| `Gift staging donor review` | Front component | `giftStaging` `Review` and `Review v2` tabs | Donor evidence, likely match state, linked donor, donor actions | Shared model candidate | Strong candidate to inform donor-review patterns elsewhere |
| `Gift staging processing` | Front component | `giftStaging` `Review` and `Review v2` tabs | Readiness, processing actions, issue handling | Shared concept | Related to operator-action blocks more than domain-specific display |
| `Gift staging audit` | Front component | `giftStaging` `Audit` tab | Provider evidence, diagnostics, supporting review context | Shared concept | Example of secondary/support context living outside the main review block |
| `Gift Aid state` | Front component | `gift` `Gift Aid` tab | Current Gift Aid position, reason, next action, minimal supporting context | Shared model candidate | First Gift Aid gift-level block; likely to evolve away from current metadata dependence |
| `Manual gift entry` | Front component | Global command / manual entry flow | Create a new committed gift, capture donor evidence, optional Gift Aid and recurring context | Shared concept | Large workflow surface; contains smaller concepts that may deserve separate entries over time |
| `Recurring agreement review` | Front component | `recurringAgreement` `Review` tab | Review recurring agreement health and context | Shared model candidate | Good example of deriving operator-facing status from durable facts |
| `Gift staging review home tab` | Native widget assembly | `giftStaging` `Review v2` tab | First-tab review shell using multiple widgets: review state, donor review, processing, core fields | Shared concept | Important Twenty layout pattern rather than one component |
| `Gift staging core fields block` | Native widget assembly | `giftStaging` `Review v2` tab via `FIELDS` widget | Compact editable core fields inside review | Reusable component candidate | Good candidate pattern for other review tabs where native fields are preferable to custom rendering |
| `Gift staging details tab` | Native widget assembly | `giftStaging` `Details` tab | Secondary/provider-heavy fields via native `FIELD` widgets | Shared concept | Helps separate primary review from secondary detail |
| `Gift staging audit tab` | Native widget assembly | `giftStaging` `Audit` tab | Mixed custom/native audit surface | Shared concept | Useful reference for support/evidence tabs |
| `Gift home tab` | Native widget assembly | `gift` `Home` tab | Default record fields using native `FIELDS` | Local only | Mostly a container/default surface, but worth tracking |
| `Gift Aid tab` | Native widget assembly | `gift` `Gift Aid` tab | Container for Gift Aid-specific blocks | Shared concept | Valuable mainly as a bounded capability tab pattern |
| `Batch-to-worklist entry links` | Pattern | `giftBatch`, `giftAidClaimBatch` | Open native filtered worklists from a control surface | Reusable component candidate | Proven useful in both batch and claim contexts |
| `First tab as Home/signposting` | Pattern | `giftStaging`, potentially other records | Keep the first tab lean, high-signal, and operational | Shared concept | Important Twenty-specific UI pattern from recent experiments |

## Components To Watch For Reuse

These are the most likely near-term reuse candidates.

### 1. Donor review

Current signal:

- `giftStaging` donor review is already a meaningful block
- manual gift entry has a similar donor-evidence and duplicate/match responsibility

Likely reuse path:

- shared TypeScript model / interaction pattern first
- identical UI component only if the entry and review modes converge enough

### 2. Gift Aid declaration

Current signal:

- likely needed in manual gift entry, staging review, and gift-level Gift Aid review

Likely reuse path:

- shared concept for sure
- likely shared model
- UI may differ between capture mode and review mode

### 3. Control surfaces

Current signal:

- `giftBatch` and `GiftAidClaimBatch` are converging on a common pattern:
  - summary
  - operational counts
  - batch/workspace actions
  - native worklist entry points

Likely reuse path:

- shared product pattern first
- shared helper utilities/components later if the shape keeps repeating

### 4. Derived review state blocks

Current signal:

- `giftStaging review state`
- `Gift Aid state`
- `Recurring agreement health`

Likely reuse path:

- probably not one reusable component
- but a strong shared pattern:
  - derive review meaning in TypeScript
  - render a lean operational summary block

## Components We Expect To Add

These do not exist yet as full components, but we are already discussing them as likely building blocks.

- `Gift Aid declaration`
- `Gift Aid donor context`
- `More to review`
- potential future domain blocks such as:
  - `Recurring donation`
  - `Gift Aid`
  - `Appeal / fund coding`

When one of these is built, add it here early even if the first version is thin.

## Maintenance Rule

When adding or reshaping a UI block in the pilot app, do a quick check against this catalog:

- is this genuinely new,
- is there already a similar concept elsewhere,
- should the similarity be captured at the level of:
  - product pattern,
  - TypeScript model,
  - full UI component?

If the answer is unclear, note it here rather than silently letting the app drift.
