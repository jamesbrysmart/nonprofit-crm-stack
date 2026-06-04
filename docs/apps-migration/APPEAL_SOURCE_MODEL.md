# AppealSource Model

_Status: working note_  
_Updated: 2026-06-01_

## Purpose

This note records the current modelling direction for `AppealSource` in the fundraising app.

The goal is to keep `Appeal` as the primary campaign/reporting bucket while adding a structured child attribution layer for source/page/channel/segment detail.

This is a work-in-progress model note.

- It reflects the current implementation direction.
- It should help future sessions avoid drifting back to child-appeal or source-text placeholder patterns.
- It should not be treated as a permanently settled fundraising attribution design.

## Definition

`AppealSource` is a child attribution/reporting unit under an `Appeal`.

It can represent a:

- channel
- page
- code
- segment
- platform route
- or specific fundraising execution

Examples:

- `Email 1`
- `Direct Mail Pack A`
- `Lapsed Donor Segment`
- `Website Donation Page`
- `QR Code - Gala Tables`
- `GiveMatch Campaign Page`
- `Supporter Fundraiser Page`
- `Facebook Ad Set`
- `Partner Newsletter Link`

## Why this exists

`AppealSource` exists so we do not overload:

- child appeals for every email/page/QR/source detail
- `Appeal.externalReference` with too many jobs
- raw intake evidence fields as the only attribution mechanism

The intent is:

- `Appeal` stays the top-level fundraising effort the organisation reports on
- `AppealSource` captures optional child attribution within that appeal

## Current modelling rules

- `Appeal` remains the primary campaign/reporting bucket.
- `AppealSource` belongs to one `Appeal`.
- `Gift` may optionally link to one `AppealSource`.
- `GiftStaging` may optionally link to one `AppealSource`.
- If a gift or staging row has an `AppealSource`, its parent `Appeal` must match the selected `Appeal`.
- `AppealSource` can default `Appeal` when the appeal is blank.
- `Appeal` filters the available `AppealSource` options.
- Changing `Appeal` clears an incompatible `AppealSource`.
- Server-side writes reject impossible appeal/source mismatches instead of silently recoding the top-level appeal.

## Current v1 field set

Core:

- `name`
- `appeal`
- `sourceType`
- `status`
- `description`

Tracking:

- `sourceCode`
- `externalId`
- `platform`
- `url`

Timing:

- `startDate`
- `endDate`

Audience:

- `audienceDescription`

Fundraiser ownership:

- `fundraiserPerson`
- `fundraiserCompany`

## Current deferred concepts

These are intentionally not in the current app data model yet:

- `audienceCount` / `recipientCount`
- cost fields
- parent appeal source hierarchy
- rollup fields
- response metrics
- weighted attribution

## Fundraiser-derived soft credit pattern

`AppealSource` now supports an optional linked fundraiser person/company.

In the current fundraiser / P2P-style workflow:

- if a `GiftStaging` or `Gift` record is linked to an `AppealSource` with a linked fundraiser,
- and a caller does not explicitly provide different soft-credit values,
- soft credit is derived from that source as:
  - linked fundraiser person/company
  - `softCreditType = FUNDRAISER`

Behavior:

- selecting or changing `AppealSource` refreshes that derived fundraiser soft credit
- clearing `AppealSource` clears the derived fundraiser soft credit
- explicit soft-credit input, if provided by a caller, still wins

This is intentionally a narrow current rule for fundraiser attribution.

It should not be treated as the final behavior for all future soft-credit types such as:

- `INTRODUCER`
- `HOST`
- `MATCHER`
- `PARTNER`

Keep these as future design candidates, not as implied current behavior.

## Semantic split from other source fields

This distinction matters:

- `intakeSource`
  - ingestion channel/system
- `provider` / `platform`
  - external system or platform involved
- `sourceAppealName` / `sourceFundName`
  - raw upstream labels or evidence
- `rawProviderEvidence`
  - source evidence payload preserved from intake
- `appealSource`
  - canonical structured child attribution object under `Appeal`

This is separate from soft credit:

- `appealSource`
  - what source/page/channel/route/segment generated the gift
- `soft credit`
  - who should receive relationship recognition for influencing or raising the gift

So `AppealSource` does not replace source evidence.

It is the structured destination after interpretation or mapping.
