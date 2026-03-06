# UI Brief Template (Working)

Updated: 2026-03-03
Status: Working template (`trial`)
Purpose: Standardize how UI work is described so Codex can execute predictably.

Use this for any non-trivial custom UI task.

This template is guidance, not a gate. If a field is unknown during exploratory work, capture it as `open`.

## Template

### 1. Workflow Summary

- Feature/flow:
- Primary user role:
- User goal in one sentence:

### 2. Scope

- In scope:
- Out of scope:

### 3. Required Pattern References

List relevant entries from `docs/ui/PATTERNS.md` (or note new pattern needed).

- Pattern(s):
- Any Twenty UI docs referenced:

### 4. Required States

- Loading:
- Empty:
- Error:
- Success:
- Permissions/edge (if relevant):

### 5. Data and APIs

- Read endpoints:
- Write endpoints:
- Constraints/latency concerns:

### 6. Acceptance Notes (Working)

- What must be true for this slice to be useful:
- What can remain rough/provisional for now:

### 7. Open Questions

- Decision needed now:
- Decision deferred:

### 8. Intentional Divergence (Optional)

- Baseline area being diverged from:
- Why divergence improves this workflow:
- Scope of divergence (`page-specific` or `candidate for reuse`):

## Codex Behavior Rule

If a UI request is missing key brief fields (states, scope, or data/API shape), Codex should call out the missing fields and proceed with clearly stated assumptions when safe to do so.
