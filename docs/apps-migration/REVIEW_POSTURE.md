# Twenty Apps Review Posture

Updated: 2026-05-14
Status: Working note
Purpose: Define how app reviews should be framed while Twenty Apps is still an early and evolving platform.

This note is not a product or implementation decision record.

It exists to make sure future reviews apply the right standard when judging current app code, local patterns, and short-term workarounds.

## 1. Platform Posture

- We are building on Twenty Apps as an early platform.
- We expect Twenty Apps to evolve over time.
- We should avoid writing review findings as if the current platform shape is fixed unless the behavior is clearly documented and stable.

This means app reviews should not only ask:

- is this correct today?

They should also ask:

- is this still the right pattern if Twenty closes the current gap?
- is this a sound app pattern, or only a temporary response to a platform limitation?
- what would make us revisit this decision?

## 2. Source Of Truth Hierarchy

When reviewing app behavior or platform fit, use this order:

1. current app-facing Twenty docs and app SDK surface
2. current observed behavior in `services/twenty-core`
3. current app-review docs in `docs/apps-migration/`
4. historical watch/log notes when needed

Important distinction:

- Twenty docs and SDK define the intended app contract.
- `twenty-core` source helps us understand current behavior.
- the app-review docs in `docs/apps-migration/` are where we should record current implications for `nonprofit-fundraising`
- historical watch notes are useful for drift and chronology, but should not be the primary place to infer current app guidance
- `twenty-core` source alone is not enough to treat a pattern as a safe long-term app contract.

If docs, SDK, and observed runtime behavior disagree:

- treat that as a validation question,
- document the mismatch clearly,
- and avoid overcommitting to either side without checking the current platform direction.

## 3. Workaround Policy

Short-term app-owned solutions are acceptable when Twenty does not yet provide the capability we need.

That includes cases where we need to:

- bridge a missing runtime feature,
- coordinate UI behavior ourselves,
- or protect product quality while the host platform matures.

But every workaround should be treated as provisional unless we have a positive reason to keep it even after Twenty adds native support.

When documenting a workaround, capture:

- the higher-level problem it is solving,
- why Twenty does not solve it well enough today,
- why the current workaround is acceptable,
- and what change in Twenty would justify replacing it.

## 4. Review Intent

The goal of app review is not:

- to freeze early patterns,
- to defend minimal metadata or minimal code as an ideology,
- or to overfit to the exact behavior of today’s platform.

The goal is:

- high product quality,
- strong code and runtime boundaries,
- reduced future refactor risk,
- and clear visibility into which current solutions are durable versus provisional.

That means a review finding can legitimately conclude:

- this is a good long-term app pattern,
- this is acceptable for now but should be marked provisional,
- or this should be replaced once Twenty exposes a better native solution.

## 5. Revisit Triggers

Any provisional app pattern should be reviewed again when one of these happens:

- Twenty releases native support for the capability,
- the app SDK exposes a safer or more direct pattern,
- current code starts obscuring Twenty’s real model,
- the workaround adds operational complexity or maintenance burden,
- larger data volumes or more clients make the current pattern fragile,
- or the same workaround starts spreading across multiple features.

The aim is to avoid the common failure mode where a temporary solution remains in place simply because it works well enough and no one reopens the question.

## 6. Review Language Guidance

When writing findings or notes:

- distinguish documented contract from current observed behavior,
- avoid saying a limitation is permanent unless Twenty has clearly said so,
- avoid saying a local workaround is “the architecture” when it is really a temporary platform-gap response,
- and state explicitly when something is provisional.

Preferred language:

- “current observed behavior”
- “documented app contract”
- “working pattern”
- “provisional workaround”
- “revisit if Twenty exposes native support”

Avoid language like:

- “Twenty cannot do this”
- “this is how Twenty Apps works”
- “we should always do it this way”

unless that statement is backed by stable docs or SDK surface and we really intend it as a longer-term rule.

## 7. Current Working Expectation

For this migration, the preferred posture is:

- build high-quality product behavior now,
- accept short-term app-owned solutions where needed,
- keep those solutions narrow and explicit,
- and keep reviewing the latest Twenty platform behavior so we do not carry workarounds forward past their useful life.

This is one reason we continue to pull and review recent Twenty code in `twenty-core`:

- not because implementation details override the docs,
- but because platform movement is part of the architecture risk for an early app ecosystem.

## 8. Where Current Guidance Should Live

Use the docs in `docs/apps-migration/` for the current working position on our app.

In practice:

- `REVIEW_POSTURE.md` defines how to reason about findings
- `APP_HARDENING_REVIEW_RUBRIC.md` defines what to review
- `APP_HARDENING_BACKLOG.md` captures concrete fix-now work
- feature/runtime notes such as donation-form or intake docs capture local implementation direction

Use `docs/TWENTY_EXTENSIBILITY_WATCH.md` mainly for:

- latest upstream baseline snapshots
- version/direction drift
- historical context when a current platform behavior is confusing

Do not rely on the watch doc as the main place for current app recommendations if the same point belongs in the app-review docs more directly.

The right outcome is not “no workarounds.”

The right outcome is:

- no unexamined workarounds,
- no stale workarounds,
- and no accidental dependence on host behavior we do not actually mean to rely on.
