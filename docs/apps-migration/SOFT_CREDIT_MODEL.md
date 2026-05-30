# Soft Credit Model

_Status: working note_  
_Updated: 2026-05-29_

## Purpose

This note records the current v1 modelling direction for soft credit in the fundraising app.

The goal is to support a simple relationship-recognition layer on gifts without introducing a full child `SoftCredit` object too early.

This is intentionally a lightweight, work-in-progress model:

- it reflects the current implementation direction,
- it should help future sessions avoid jumping straight to Salesforce-style multi-credit complexity,
- and it should not be treated as a permanently settled attribution design.

## Definition

Soft credit is an optional relationship on a `Gift` or `GiftStaging` record that identifies the person or organisation who should receive recognition for influencing, raising, introducing, matching, hosting, advocating for, or otherwise helping generate the gift.

This is distinct from:

- the donor / payer
  - the hard credit / legal donor
- `AppealSource`
  - the source/page/channel/segment/route within an appeal

## Current v1 shape

On `Gift`:

- `softCreditPerson`
- `softCreditCompany`
- `softCreditType`

On `GiftStaging`:

- `softCreditPerson`
- `softCreditCompany`
- `softCreditType`

Current type values:

- `FUNDRAISER`
- `INTRODUCER`
- `HOST`
- `MATCHER`
- `ADVOCATE`
- `PARTNER`
- `OTHER`

## Current modelling rules

- Soft credit is optional.
- A gift or staging row can have zero or one soft credit in v1.
- Either `softCreditPerson` or `softCreditCompany` can be set, but not both.
- `softCreditType` is required when a soft-credit relation is set.
- If no soft credit is present, normal gift processing is unchanged.
- Processing copies soft-credit fields from `GiftStaging` to the committed `Gift`.

## What soft credit does not do

Soft credit does not:

- change gift amount
- change donor / payer
- change `Fund`
- change `Appeal`
- change `AppealSource`
- change financial totals
- change canonical fundraising attribution

Instead, it adds a separate relationship-recognition / influence dimension.

## Why this is field-based in v1

We are intentionally using simple fields rather than a child `SoftCredit` object because:

- the current v1 use case is singular recognition, not multiple or weighted credits,
- the staging and committed-gift model already handles intended coding directly on the record,
- and a child object would introduce extra lifecycle, UI, and reporting complexity too early.

This is closer to a lightweight Beacon-style pattern than a full Salesforce-style soft-credit model.

## Deferred concepts

The following are intentionally deferred:

- separate `SoftCredit` child object
- multiple soft credits per gift
- weighted attribution
- credit amount / percentage
- household rules
- team fundraising
- rollups
- split gifts/payments

UI prominence and defaulting are also intentionally deferred, including questions such as:

- whether soft credit should appear prominently in manual entry,
- whether P2P-style workflows should surface it differently,
- whether `AppealSource` or source evidence should suggest a default soft credit,
- and whether future fundraiser-owner fields should prefill it.

## Future migration path

If later product pressure requires multiple or weighted soft credits, this field-based model should migrate cleanly to a child object.

Each gift with a singular v1 soft credit could become one child soft-credit record carrying:

- person/company relation
- type

That keeps the current v1 shape useful without locking the product out of a richer future model.
