# Twenty Hacktoberfest 2025 Project Plan

This document contains the planning, architecture, and brainstorming for our Hacktoberfest 2025 submission.

## Chosen Project: The General-Purpose Rollup Engine

### 1. Vision & Hackathon Pitch

Our goal is to build a **General-Purpose Rollup Engine** as a Twenty extension. This engine will allow users to define aggregation rules (SUM, COUNT, etc.) from child objects to parent objects in a simple configuration file.

For the hackathon, we will deliver a fully functional engine that ships with a valuable, pre-configured rollup for a universal use case (summarizing sales Opportunities on the parent Company), demonstrating immediate value to all Twenty users. The extensibility of the engine will be a key feature highlighted in our documentation.

#### Strategic Context

This project directly implements the **"Shared rollup engine"** and provides the foundational data for the **"RFM engine"** described in the `docs/features/campaigns-appeals.md` specification. It is a prerequisite for the advanced donor segmentation and engagement features envisioned for the CRM.

This project serves as the foundational layer for providing accurate, real-time donor summaries, which are critical for effective segmentation and reporting. The trigger-based architecture we are building is a prerequisite for any future summary solution, whether it's based on simple aggregations (like this engine) or more advanced AI-driven analysis.

### 2. Proposed Architecture

#### 2.1. Default Use Case: Gift-to-Person Rollups

The default configuration will provide common rollups for donor engagement and segmentation.

**Required Custom Fields (on `Person` object):**
*   `lifetimeGiftAmount` (Currency)
*   `lifetimeGiftCount` (Number)
*   `lastGiftDate` (Date)
*   `firstGiftDate` (Date)
*   `yearToDateGiftAmount` (Currency)
*   `yearToDateGiftCount` (Number)

#### 2.2. Configuration Schema (`rollups.json`)

A `rollups.json` file will define all rollup rules.

**Example Configuration (Default):**
```json
[
  {
    "parentObject": "person",
    "childObject": "gift",
    "relationField": "donorId",
    "childFilters": [
      {
        "field": "amount.value",
        "operator": "gt",
        "value": 0
      }
    ],
    "aggregations": [
      {
        "type": "SUM",
        "childField": "amount.value",
        "parentField": "lifetimeGiftAmount"
      },
      {
        "type": "COUNT",
        "parentField": "lifetimeGiftCount"
      },
      {
        "type": "MAX",
        "childField": "dateReceived",
        "parentField": "lastGiftDate"
      },
      {
        "type": "MIN",
        "childField": "dateReceived",
        "parentField": "firstGiftDate"
      },
      {
        "type": "SUM",
        "childField": "amount.value",
        "parentField": "yearToDateGiftAmount",
        "filters": [
          {
            "field": "dateReceived",
            "operator": "gte",
            "dynamicValue": "startOfYear"
          }
        ]
      },
      {
        "type": "COUNT",
        "parentField": "yearToDateGiftCount",
        "filters": [
          {
            "field": "dateReceived",
            "operator": "gte",
            "dynamicValue": "startOfYear"
          }
        ]
      }
    ]
  }
]
```

#### 2.3. Triggers & Function Logic

A single serverless function (`calculateRollups`) will be powered by multiple triggers:

*   **`databaseEvent`:** For real-time updates when a `gift` is changed.
*   **`cron`:** For a nightly self-healing job to ensure data accuracy.
*   **`route`:** For on-demand manual recalculation by an administrator.

#### 2.4. Extensibility & Stretch Goals

The documentation will be a key part of the submission, explaining how to extend the engine for other use cases (e.g., sales rollups like `totalWonValue` on the `Company` object).

Stretch goals include supporting more advanced calculations like RFM scoring and complex `AND`/`OR` filters.

---

## Alternative Project Ideas (Future Consideration)

### Idea A: Auto-Merge Engine for Duplicate Records

*   **Problem:** Duplicate contacts are a major pain point in fundraising CRMs.
*   **Vision:** An automated engine that identifies and merges duplicate contact or company records, with high-confidence matches being merged automatically and lower-confidence pairs flagged for review.
*   **Potential Approach:** Triggered by `databaseEvent` on record creation or a nightly `cron` job.

### Idea B: Advanced Stripe Synchronizer

*   **Problem:** Basic Stripe integration misses rich subscription and dunning data.
*   **Vision:** A deeper, two-way synchronizer for Stripe.
*   **Potential Approach:** A function triggered by Stripe webhooks (`route` trigger) to manage recurring donation statuses in Twenty based on Stripe events (e.g., `subscription.canceled`, `invoice.payment_failed`).

### Idea C: AI-Powered Donor Summary

*   **Problem:** A list of transactions doesn't provide a quick, qualitative understanding of a donor's relationship health.
*   **Vision:** An AI-powered "Donor Summary" text field on the Contact record.
*   **Potential Approach:** A function triggered by a `databaseEvent` on a new `Gift`. The function would use an AI/LLM to analyze the donor's full giving history and update a text field with a natural language summary.
