# Fundraising App Testing Strategy

Use this strategy to decide what evidence a change to the nonprofit fundraising app needs. The [app README](../apps/fundraising/nonprofit-fundraising/README.md#local-validation) owns the runnable commands. Use Twenty’s own package checks for core work and the legacy service’s package checks for changes to that service.

## Product guarantees

| Guarantee | What we need to trust |
| --- | --- |
| Financial integrity | Each accepted contribution results in the intended gift once. Intake preserves the amount, currency and payment references. Unpaid or unresolved contributions stay out of committed income. |
| Reporting accuracy | Totals reconcile to independently calculated expectations. Amounts in different currencies are never added directly. Exclusions are visible, and corrections reach all affected totals. |
| Data integrity | Source evidence, gifts, donors, coding and recurring agreements stay correctly linked. Ambiguous matches call for an explicit decision. Persisted outcomes can be reconciled with their inputs. |
| Safe recovery | An interrupted operation leaves enough evidence to tell what committed, what can be retried and what needs reconciliation. Recovery accounts for dependent records and summaries. |
| Permissions and isolation | People can complete the work their role permits. Denied actions leave records unchanged. App functions, provider traffic and secrets stay within the intended workspace and authority. |
| Installation and upgrade continuity | A fresh install produces the intended starting state. Upgrades preserve existing records, stable identities and workspace-owned configuration, with intentional migrations producing a known result. |
| Operational usability | Fundraisers can see what completed, what needs attention and what action is safe next. They can resolve problems the workflow supports and verify the result through the app. |

Use the agreed product policy to make each guarantee concrete. For example, reporting accuracy requires knowing which totals represent gross gifts and which represent net receipts. Supported Twenty versions, Marketplace feature scope and initial workspace defaults belong in the relevant product and release decisions.

## Choose the evidence

Choose the smallest test that can meaningfully establish the behaviour.

Passing offline tests, mocked platform interactions and successful builds
provide local evidence. Verify behaviour that depends on Twenty by exercising
the installed app on Twenty.

| Check | Use it to establish |
| --- | --- |
| Unit | App-owned rules and calculations, such as readiness decisions, Gift Aid eligibility and currency treatment. Use explicit examples with independently derived expected results. |
| Service with test doubles | App orchestration and failure recovery, such as a write committing before its response is lost. Run the real app logic and simulate failures at the external boundary. |
| Component | Behaviour the component owns, such as validation feedback, focus, blocked actions and a retriable error. |
| Installed-app integration | Contracts that depend on Twenty, such as permissions, bulk-write correspondence, persisted relationships and record events. Read back the affected data and use bounded waits for asynchronous outcomes. |
| Browser or provider validation | A small set of journeys that depend on the host, a real provider or an operator’s ability to complete the work. Use known starting data and observable outcomes. Automate a browser journey when it is stable and repeats often enough to justify the upkeep. |

Check user-visible and persisted outcomes at the relevant boundary. Assert call order, request shape or count when it matters to the behaviour, such as preventing a duplicate financial write. Use multiple levels when they establish different parts of the guarantee. A simulated lost response can establish the retry decision, while a real-Twenty check can establish how the resulting records are persisted.

## Maintain the suite

- Update an existing test when the agreed behaviour changes or the test can express the same guarantee more directly.
- Consolidate cases that establish the same outcome at the same boundary. Keep separate cases for distinct risks, especially financial and recovery failures.
- Remove tests for retired behaviour or when another test already provides equivalent evidence. Check what would become unverified before removing a case.
- Add a test for a meaningful gap in evidence. Prefer small fixtures that make the relevant differences obvious.
- When a test needs elaborate setup or mocks of several internals, check whether the code mixes policy, orchestration and I/O. Simplify a boundary when doing so also clarifies the production code.

## Development and release workflow

| When | Evidence to aim for |
| --- | --- |
| Everyday development | Run the relevant focused checks while iterating. Use lint, typecheck and fast tests as appropriate to the change. For docs-only changes, check consistency and links. |
| Consequential change | Identify the affected guarantee and how to verify the normal outcome and meaningful failure paths while designing the change. A sentence in the implementation plan is usually enough. Exercise the installed app when the result depends on Twenty, and use a browser when the outcome depends on the host or operator experience. |
| Release candidate | Rehearse a fresh packaged install and a forward upgrade with retained data. Check a short core journey with an ordinary user and exercise any affected provider flows in release scope. Record the app revision, package identity, relevant toolchain and runtime versions, outcomes and open issues. Follow the [deployment runbook](apps-migration/APP_DEPLOYMENT_RUNBOOK.md) and [Marketplace readiness guidance](apps-migration/MARKETPLACE_READINESS.md) for operational and release-specific decisions. |

Use a persistent development workspace for interactive work and scoped checks
against an installed app. Prefer read-only queries where they establish the
behaviour. Use dedicated records for writes and keep checks that affect shared
workflow state in an isolated workspace. Use disposable targets for
destructive integration runs and isolated state for clean installs and
upgrade rehearsals. Automated cases should create small, deterministic
fixtures. Walkthroughs can use an explicit, rerunnable demo seed. Upgrade
rehearsals need representative records and settings from the previous version.

Destructive setup and cleanup must fail closed. Verify the instance and workspace against a known disposable target independently of the credentials. Stop before any destructive action if the target cannot be verified or its identity differs. Apply the same safety rule to local and CI runs, and make the workflow runnable without interactive or personal credentials when automated.

At handoff, record what was checked, what the result establishes and any relevant evidence still missing. Keep this proportional to the change.
