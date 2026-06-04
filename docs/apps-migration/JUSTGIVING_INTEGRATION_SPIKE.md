# JustGiving Integration Spike

_Status: provisional design note_  
_Scope: bounded integration spike, not production build_

## Intent

Treat JustGiving as a test of the fundraising app's third-party intake model,
not as a Stripe-like core payment integration.

The goal is to prove that we can:

- fetch fundraising-page and donation data from JustGiving,
- normalize it into `giftStaging`,
- preserve strong source evidence,
- remain idempotent across repeated syncs,
- and let the existing review / donor matching / processing flow do the rest.

This is explicitly not a commitment to:

- real-time sync,
- payout reconciliation,
- recurring support,
- full campaign/team hierarchy,
- or a fully productized reusable connector.

## Recommended spike framing

Start with one or more known JustGiving fundraising pages for a single charity.

Bound the spike to:

1. fetch page details,
2. fetch donations for those pages,
3. normalize each donation into `giftStaging`,
4. preserve the JustGiving payload in source evidence,
5. use a durable external key so repeated syncs are idempotent,
6. optionally map campaign/page context into `Appeal` / `AppealSource` where obvious,
7. stop before committed `Gift` creation automation.

## Current model fit

### `GiftStaging`

Current `giftStaging` can absorb a JustGiving donation without schema changes.

Useful existing fields:

- `intakeSource`
- `provider`
- `externalId`
- `sourceFingerprint`
- `providerPaymentId`
- `giftDate`
- `amount`
- `donorFirstName`
- `donorLastName`
- `donorEmail`
- `donorPhone`
- `donorMailingAddress`
- `donationType`
- `sourceAppealName`
- `sourceFundName`
- `rawProviderEvidence`
- `appeal`
- `appealSource`

Current recommendation for a JustGiving spike:

- `intakeSource = 'integration_sync'` or a more specific string such as
  `justgiving_sync`
- `provider = 'JUSTGIVING'`
- `externalId = JustGiving donation id` when available
- `sourceFingerprint = stable provider-prefixed sync key`
- preserve the full provider payload in `rawProviderEvidence`

### `Appeal`

Current `Appeal` is sufficient for the broader campaign/event/cause layer where
an obvious charity-side mapping exists.

Use it only when:

- the charity already treats the JustGiving campaign/event as one of our
  canonical appeals,
- or a workspace/client-specific mapping rule says so.

Do not create or infer canonical `Appeal` records automatically in the first
spike.

### `AppealSource`

Current `AppealSource` is a good fit for the individual JustGiving fundraising
page.

Suggested shape when used:

- `sourceType = 'P2P_PAGE'`
- `platform = 'JUSTGIVING'`
- `externalId = pageId or page short name`
- `url = public fundraising page URL`
- `name = page title`

This is the cleanest place to represent page-level attribution without
pretending the page itself is a canonical appeal.

## Provisional source model

For the spike, the normalized layers should be:

- canonical:
  - `appeal`
  - `appealSource`
- operator-facing source evidence:
  - `sourceAppealName`
  - `sourceFundName` only if there is a real designation-like concept
- provider evidence:
  - `rawProviderEvidence`

Practical mapping:

- broader campaign/event/cause label -> `sourceAppealName`
- fundraising page title -> often best represented as `appealSource`
- raw JustGiving payload -> `rawProviderEvidence`

## Minimal connector abstraction

Do not build a generic connector framework yet.

The smallest useful abstraction is a local adapter pattern with three steps:

1. `fetch provider records`
2. `normalize provider record -> giftStaging upsert input`
3. `upsert idempotently into giftStaging`

Useful local seams:

- a provider-specific fetch module
- a provider-specific normalize module
- a shared `giftStaging` upsert helper that:
  - checks idempotency key,
  - creates when missing,
  - optionally updates when safe

This should be enough to avoid JustGiving becoming a one-off path while still
staying light.

## What fields we should expect from JustGiving

At minimum, expect to need:

- donation identifier
- donation date / timestamp
- donation amount
- currency
- donor display name
- donor anonymity/public visibility flags
- donor message
- fundraiser page id
- fundraiser page URL
- fundraiser page short name / slug
- fundraiser page title
- broader campaign/event/cause identifiers or labels when present
- fundraiser / page-owner details when present

Useful but not required for the first spike:

- charity id
- campaign/event id
- fundraiser owner email or account id
- page status
- page target amount
- custom codes
- donation reference / payment reference

## Privacy and anonymity risks

This is one of the biggest reasons to keep the spike bounded.

JustGiving's documentation indicates that donation data visibility depends on
authentication context, and that owner-authenticated access may reveal more
than public page access.

Implications:

- some donations may be anonymous,
- donor name may be partial, masked, or absent,
- donation amount visibility may differ,
- page-owner identity may be incomplete,
- public page scraping assumptions are unsafe.

So the spike should assume:

- incomplete donor identity is normal,
- donor creation should remain deferred to staging review,
- we should preserve provider evidence even when donor matching is impossible,
- missing donor data must not block staging creation.

## Idempotency recommendation

The spike should use a durable source key per imported donation.

Preferred order:

1. JustGiving donation id if available
2. otherwise a stable composite such as:
   - provider
   - page id
   - donation reference / timestamp
   - amount

Recommended storage:

- `externalId = raw provider donation id`
- `sourceFingerprint = "justgiving:{donationId}"`

If donation id is not available from the chosen endpoint:

- use a deterministic composite fingerprint,
- and record the raw identifiers used to form it in `rawProviderEvidence`.

## Pagination and sync shape

Assume donation endpoints are paginated or date-windowed.

For the first spike:

- support a small bounded sync window,
- prefer explicit page-by-page fetch,
- log page tokens / offsets / next links in source evidence or run logs,
- do not build background sync scheduling yet.

Practical first cut:

- sync one page,
- then many selected pages,
- then re-run to prove idempotency.

## Error handling

The spike should treat provider errors as operational sync errors, not as
record-level review states.

Meaning:

- failed page fetch should fail the sync run,
- malformed individual donation payloads may be skipped with structured logging,
- donor ambiguity should still create a `giftStaging` row where enough donation
  facts exist.

Avoid:

- silently dropping unknown fields,
- auto-creating partial committed gifts,
- or inventing canonical mappings on failure.

## Smallest meaningful implementation

The smallest worthwhile implementation would be:

1. a logic function that accepts:
   - page short name / page id,
   - optional `appealId`,
   - optional `appealSourceId`,
   - optional dry-run flag
2. fetch page details from JustGiving
3. fetch donations for that page
4. normalize each donation into a `giftStaging` input
5. upsert by `sourceFingerprint`
6. return a sync summary:
   - fetched count
   - created count
   - existing count
   - skipped/error count

No UI is required for the spike.

## Provisional mapping rules

### Donation -> `giftStaging`

- `name`
  - short review label such as `JustGiving donation from {display name}`
- `provider = 'JUSTGIVING'`
- `intakeSource = 'justgiving_sync'`
- `amount`
  - donation amount visible from API
- `giftDate`
  - donation date
- `paymentType`
  - probably `CARD` unless the API says otherwise
- `donationType`
  - default `ONE_OFF` for the first spike
- donor fields
  - populate only what the API actually gives us
- `externalId`
  - provider donation id
- `sourceFingerprint`
  - stable provider-prefixed key
- `sourceAppealName`
  - broader campaign/event label when useful
- `rawProviderEvidence`
  - full page/donation payload plus sync context

### Page -> `AppealSource`

Only if the client wants page-level attribution as a real object.

Otherwise:

- leave the page only in source evidence for the first pass.

If we do create/link it:

- `sourceType = 'P2P_PAGE'`
- `platform = 'JUSTGIVING'`
- `externalId = page id / short name`
- `url = page URL`
- `name = page title`

## Obvious current model gaps

No hard schema blocker is obvious for the spike.

But these are the likely pressure points:

1. `rawProviderEvidence` naming is still provider-centric.
   - workable for now
   - but a more general `sourceEvidenceJson` naming direction still makes sense

2. Page-owner / fundraiser linking is only partially modeled.
   - we have soft-credit / fundraiser patterns emerging
   - but should not force them into the first spike

3. Donation visibility/privacy may make donor matching thin.
   - this is acceptable if staging remains the commit boundary

4. `Appeal` versus `AppealSource` mapping needs client-specific judgement.
   - we should not auto-create canonical fundraising structure lightly

## Recommendation

Proceed only as a bounded design/prototype spike:

- no productized connector,
- no direct `Gift` creation,
- no real-time sync,
- no recurring,
- no payout reconciliation,
- no full JustGiving hierarchy model.

The model looks flexible enough to support the spike without schema changes.

The highest-value next step, when revisited, is:

- verify the real JustGiving payloads available to this charity account,
- then build a dry-run fetch/normalize path into `giftStaging`.
