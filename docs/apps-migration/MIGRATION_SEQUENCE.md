# Fundraising To Twenty Apps Migration Sequence

Updated: 2026-04-06
Status: Outline (`stage-1`)
Purpose: Define a staged migration order so the move into Twenty apps can happen deliberately rather than as a single large port.

## 1. Sequencing Principles

- Migrate the clearest, highest-value pieces first.
- Validate risky assumptions early.
- Avoid porting accidental complexity.

## 2. Prerequisites

- Product review completion.
- Code review completion.
- Shared UI requirements where needed.
- Twenty-app validation spikes.
- Validation of any claimed app-to-service/runtime boundary for specialized integrations once the released Twenty apps framework is available.

## 3. First-Pilot Context

- After initial pilot scoping, the first pilot customer currently points us toward a narrower near-term migration focus:
  - donation intake,
  - Gift Aid,
  - recurring donations,
  - finance-system integration.
- This is useful sequencing context for later migration sessions, not a claim that other fundraising workflows are lower-value or should be abandoned.
- The practical reading is:
  - first-pilot readiness does not require all fundraising functionality to migrate at once,
  - but broader workflow review still matters because some later areas inform how pilot-critical workflows should be shaped.

## 4. Proposed Sequence

- Early proof targets.
- Mid-stage workflow migrations.
- Later or riskier migrations.

In light of the current first-pilot scope, the clearest near-term migration candidates are likely:

- donation intake and the gift-processing/staging behavior needed to support it,
- Gift Aid workflow and supporting HMRC/runtime questions,
- recurring agreements, recurring fulfillment, and recurring health/status review,
- finance-system integration and the accounting handoff it depends on.

Other workflow areas may still need review and selective preparation, but they do not all need to be migrated in the same first pilot tranche.

## 5. Validation Gates

- What must be true before each major stage proceeds.
- Where a workflow depends on specialized integration/runtime behavior, confirm whether the released Twenty app/runtime primitives are sufficient or whether an external adapter remains justified. Treat that as a proof requirement, not a default assumption.

## 6. Risks And Dependencies

- What could block or reshape the sequence.
