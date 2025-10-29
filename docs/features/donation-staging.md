# Donation Staging: Best Practices & Potential Improvements

This document summarizes best practices and design considerations for implementing a staging process for donation intake in a fundraising CRM. The goal is to ensure data quality, deduplication, and user-friendly workflows before donations are committed to the core system.

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

### 4. Partial Commit & Error Handling
- Support partial processing: commit valid records immediately, hold problematic ones in a pending/exception queue.
- Provide an "Import Exceptions" dashboard for easy correction and re-processing.
- Treat recurring installments as auto-promote candidates only once their provider confirms payment (e.g., GoCardless `payment_confirmed`); earlier lifecycle events remain staged for review.

### 5. User-Friendly Review UI
- Spreadsheet-like interface with:
  - Color-coded errors and warnings.
  - Inline editing for quick corrections.
  - Click-to-resolve duplicate suggestions.

### 6. Audit Trail & Reconciliation
- Maintain an import log linking staging rows to final records.
- Optionally retain processed staging records for a defined period (audit/troubleshooting).

### 7. Real-Time vs. Delayed Processing
- Hybrid approach:
  - Acknowledge donations instantly (e.g. send donor receipt).
  - Still stage data as "Pending Review" for back-office validation before final commit.
  - Recurring agreements advance `nextExpectedAt` based on cadence, but we do **not** create placeholder installment rows; only real payloads (webhook/import/manual) generate staging records.

### 8. Continuous Improvement
- Allow admins to:
  - Adjust duplicate rules and mappings over time.
  - Save and reuse mapping templates.
  - System can learn from repeated merges to improve future matching suggestions.

### 9. Recurring Agreements (MVP alignment)
- Staging payloads accept `recurringAgreementId`, `expectedAt`, and `providerPaymentId` so installments from Stripe, GoCardless, or manual imports map back to their plan.
- `autoPromote` defaults flow from the agreement (`autoPromoteEnabled`); admins can override per installment when edge cases arise.
- Missed payments surface by comparing `nextExpectedAt` with the latest posted Gift, keeping the staging layer reactive instead of speculative.

## Outcome
A modern staging design should:
- Protect data quality (prevent duplicates, ensure valid coding).
- Reduce manual cleanup.
- Support both speed (for donors) and accuracy (for staff).
- Stay flexible to handle multiple input channels and evolving nonprofit needs.
