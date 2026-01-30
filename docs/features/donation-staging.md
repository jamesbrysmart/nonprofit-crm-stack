# Donation Staging: Best Practices & Potential Improvements

This document summarizes best practices and design considerations for implementing a staging process for donation intake in a fundraising CRM. The goal is to ensure data quality, deduplication, and user-friendly workflows before donations are processed into the core system.

## Stage 3 Admin Experience (North Star)

This section describes the intended donation admin experience around staging and processing. It is intentionally
product-level (no UI specification) and is the primary reference point for Stage 3 work.

### Staging is a workstream, not a problem list

Admins encounter a queue of **unprocessed gifts** that represent donations whose meaning is incomplete or uncertain.
The queue is not a failure list; it is a focused workstream of gifts that need clarification before processing. Each
staged gift carries diagnostics that explain why it has not processed (blockers vs warnings and identity confidence),
so admins can move from “what happened?” to “what do I need to decide?” without guesswork.

### Two primary lenses: eligible now vs needs attention

Admins should be able to quickly separate:
- **Eligible now**: no blockers, safe to process immediately (single or bulk).
- **Needs attention**: blockers or low identity confidence require a decision.

Warnings appear in both lists to communicate quality risk without blocking progress.

### Batch-first review for CSV/imports

Batches are trust/intent boundaries. Admins review a batch once, resolve common issues in bulk, and process
confidently:
- See diagnostics summaries for the batch (e.g., “12 missing appeal”, “5 low confidence identity”).
- Apply bulk actions to resolve shared gaps (appeal/fund/opportunity/payout).
- Confirm suggested donors in bulk when identity confidence is weak.
- Process the batch when blockers are resolved.

### Suggested donors are a first-class aid

When identity confidence is weak, the system should surface suggested donors with rationale so admins can confirm the
right match or create a new donor quickly. This applies to both individual review and batch workflows.

### Processing is a deliberate, confidence-building moment

Before processing (single or bulk), admins should see:
- what will happen (rows processed vs deferred),
- why it is safe (eligibility, trust posture, identity confidence),
- what remains unresolved (warnings),
- what needs attention next / suggested actions.

### Corrections are normal and auditable

If a mistake happens after processing (wrong donor, wrong appeal, wrong amount), corrections are handled on the
canonical gift record with audit/history rather than reprocessing. This reduces fear of bulk actions and preserves a
clear decision trail.

## Key Principles

### 1. Unified Staging Model
- Funnel all incoming data (CSV uploads, manual entry, API integrations) into a single staging layer.
- Apply consistent validation and deduplication rules regardless of source.
- Link staged donations to their originating `RecurringAgreement` when available so cadence defaults, coding, and follow-up rules stay consistent.

### 2. Flexible Data Mapping
- Provide mapping templates for external sources (campaign codes, fund IDs, etc.).
- If no match exists, flag and allow on-the-fly creation of campaigns/funds/donors.

### 3. Robust Deduplication
- Use multi-factor and fuzzy matching (name, email, address, phone).
- Apply confidence scoring:
  - Auto-link high-confidence matches.
  - Flag medium-confidence matches for user review.
  - Allow override/create-new if needed.

### 4. Partial Processing & Error Handling
- Support partial processing: process valid records immediately, hold problematic ones in a pending/exception queue.
- Provide an "Import Exceptions" dashboard for easy correction and re-processing.
- Treat recurring installments as auto-process candidates only once their provider confirms payment (e.g., GoCardless `payment_confirmed`); earlier lifecycle events remain staged for review.

### 5. User-Friendly Review UI
- Dashboard style queue with:
  - Summary chips for status, intake source, and gift batch counts so admins can focus on one slice at a time.
  - A lean table (ID, donor, amount, updated, status, source, alerts) with pills and badges instead of dozens of columns.
  - Primary “Review” action that opens a detail drawer; drawer is the work surface for dedupe, coding edits, and processing.
  - Contextual quick actions (e.g., “Process now” only when a row is ready, “Retry” on process failures) surfaced next to each row.

### 6. Audit Trail & Reconciliation
- Maintain an import log linking staging rows to final records.
- Optionally retain processed staging records for a defined period (audit/troubleshooting).

### 7. Real-Time vs. Delayed Processing
- Hybrid approach:
  - Acknowledge donations instantly (e.g. send donor receipt).
  - Still stage data as "Pending Review" for back-office validation before final processing.
  - Recurring agreements advance `nextExpectedAt` based on cadence, but we do **not** create placeholder installment rows; only real payloads (webhook/import/manual) generate staging records.

### 8. Continuous Improvement
- Allow admins to:
  - Adjust duplicate rules and mappings over time.
  - Save and reuse mapping templates.
  - System can learn from repeated merges to improve future matching suggestions.

### 9. Recurring Agreements (MVP alignment)
- Staging payloads accept `recurringAgreementId`, `expectedAt`, and `providerPaymentId` so installments from Stripe, GoCardless, or manual imports map back to their plan.
- `autoProcess` defaults flow from the agreement (`autoProcessEnabled`); admins can override per installment when edge cases arise.
- Missed payments surface by comparing `nextExpectedAt` with the latest posted Gift, keeping the staging layer reactive instead of speculative.

### 10. Near-Term Enhancements (queued)
- Promote `giftBatch` to a first-class UI element: explicit batch cards, batch-level processing, and default coding controls.
- Add donor context panel in manual entry and staging drawer (recent gifts, active recurring agreements) to further cut down duplicates.
- Extend recurring insights in the staging queue (e.g., dedicated recurring view once the batch slice lands).

## Outcome
A modern staging design should:
- Protect data quality (prevent duplicates, ensure valid coding).
- Reduce manual cleanup.
- Support both speed (for donors) and accuracy (for staff).
- Stay flexible to handle multiple input channels and evolving nonprofit needs.
