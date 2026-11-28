# Nonprofit Fundraising Marketplace Readiness

Updated: 2026-10-13
Status: Working release plan; existing product workflows are the baseline, release defaults and publication decisions remain open
Working target: readiness and, if gates pass, publication by 2026-10-31

## 1. Goal And Agreed Direction

Prepare the nonprofit fundraising app for public Twenty Marketplace distribution while preserving Imara's existing installation and a future migration path.

On 10 October the user agreed to prioritise Marketplace preparation and leave Imara on its current setup while it completes testing. End of October is a working target, not a fixed launch commitment. The expected low volume of immediate Imara bug reports allows its upgrade to be deferred; it does not establish that migration will be automatic or risk-free.

Preparation can proceed without Imara access. Publication still requires resolving whether its instance-global registration obstructs the public listing. Do not make a complete Imara migration rehearsal a prerequisite for all app preparation.

This is our first public app. Review product assumptions with the user, implement small changes, and reduce optional scope before weakening release checks.

The 13 October review keeps the existing product workflows as the accepted baseline. Prioritise confirmed correctness failures, relevant Twenty compatibility changes and release requirements. Do not reopen feature scope or treat the older hardening backlog as an unverified implementation checklist. Review findings are source evidence until reproduced; new upstream capabilities are not automatically required work.

Initial releases will use assisted implementation from 3Trees Digital, not a self-service promise. App readiness and compatibility take priority over Marketplace marketing copy. Assisted implementation does not remove clean-install, security or configuration requirements.

## 2. Canonical References And Boundaries

This document owns release scope, readiness evidence, decisions, and sequencing. Detailed implementation hardening remains in [APP_HARDENING_BACKLOG.md](APP_HARDENING_BACKLOG.md).

Related guidance:

- [App README](../../apps/fundraising/nonprofit-fundraising/README.md)
- [Extensibility watch](../TWENTY_EXTENSIBILITY_WATCH.md), including the 9 October tooling/runtime assessment
- [Development workflow](TWENTY_APP_DEV_WORKFLOW.md)
- [Deployment runbook](APP_DEPLOYMENT_RUNBOOK.md) and [deployment ledger](APP_DEPLOYMENT_LEDGER.md)
- [Twenty publishing docs](../../services/twenty-core/packages/twenty-docs/developers/extend/apps/operations/publishing.mdx)
- [Twenty CLI README](../../services/twenty-core/packages/twenty-cli/README.md) and [command reference](../../services/twenty-core/packages/twenty-cli/docs/commands.md)
- [SDK build API](../../services/twenty-core/packages/twenty-sdk/docs/build.md)

Constraints:

- Preserve application universalIdentifier and identifiers of retained entities.
- Review intended entity removals for lifecycle/data impact; never reuse retired identifiers.
- No Imara apply, publish, install, uninstall, catalog-sync, upgrade, or other mutation is authorised by this plan.
- Any separately authorised remote inspection must explicitly restore the default remote to localhost and verify it afterward.
- Preserve the intentional system-field helper and unrelated repository changes. The uncommitted SDK 2.37.0 baseline was upgraded to 2.45.0 with explicit approval, as recorded below.
- Treat services/twenty-core as reference-only; do not modify it or stage its pointer.
- Public publication, repository visibility changes, credential changes, external messages, and client operations require separate approval.
- No disposable public Marketplace app is needed. Use isolated local fixtures only where an unresolved question warrants them.

Evidence labels: **source-observed**, **locally checked**, **runtime-proven**, **Imara-observed**, **proposal**, and **decision needed**. Local source is not proof of the code deployed on Twenty Cloud.

## 3. Current Baseline

- App package: nonprofit-fundraising 0.1.14.
- Working dependencies: twenty-sdk and twenty-client-sdk 2.45.0, upgraded with user approval from the intentional uncommitted 2.37.0 baseline; committed baseline was 2.19.0.
- The recurring-agreement view uses getFieldUniversalIdentifier in the intentional helper change. Compare resulting identifiers before accepting the toolchain migration.
- Twenty checkout: 0005d7b24a584b859df170f842497a446deeddce (9 October).
- Checkout declares SDK 2.47.0 and standalone twenty CLI 0.4.0.
- The extensibility watch records fetched SDK/runtime stable tags at 2.46.0. A read-only npm registry check on 10 October returned latest SDK/client 2.45.0 and standalone twenty CLI 0.3.0; these are dated observations, not a fresh 13 October registry check. User reported a healthy v2.46.0 app-dev runtime, then a successful reset with all local data declared disposable. Nonprofit fundraising was absent before reset. Post-reset runtime status and first app installation remain to be verified. Git tags, checkout versions and npm latest differ.
- Recorded superproject Twenty pointer remains 31a1c2154695e62a8aaa0b9127241eab08a0f0b8. The checkout difference is pre-existing and must remain unstaged.
- Imara 0.1.14 is the deployment baseline reported in the existing record/conversation, not a fresh remote observation.

The app now has the twenty-app keyword. It still lacks engines.twenty, public listing assets and metadata. Its README is development/pilot material. package.json declares MIT; matching licence material and publication rights require review. Nested app GitHub workflows are not active monorepo workflows.

## 4. Registration And Imara: Current Evidence

### Current behaviour

The [registration service](../../services/twenty-core/packages/twenty-server/src/engine/core-modules/application/application-registration/application-registration.service.ts) still refuses catalog updates when an existing registration with the same universalIdentifier is TARBALL, LOCAL, or OAUTH_ONLY. Existing npm registrations are pinned to their source package. New registrations are created only when the identifier is not already registered.

Therefore:

- Do not expect public npm discovery to convert Imara's tarball registration.
- Do not publish npm 0.1.14 as a source-conversion bridge; that mechanism is absent in this checkout.
- If Imara's registration exists on the Cloud instance serving the intended listing, it may block creation of that listing for the same identifier.
- Publishing on another instance with no identifier collision does not prove visibility on the relevant Cloud instance.
- The Cloud topology, deployed version, existing registration state, and supported resolution remain unverified.
- Keep the same identifier as the working decision. Do not rotate it to bypass the issue.

The [GitHub claim flow](../../services/twenty-core/packages/twenty-server/src/engine/core-modules/application/application-registration/application-registration-claim.service.ts) applies to unowned npm registrations. It is not a tarball-to-npm conversion procedure.

### Narrow pre-publication question

Prepare this for user review before contacting Twenty:

> We have a nonprofit app installed from a private tarball in a Twenty Cloud customer workspace. We want to publish it on npm with the same universalIdentifier while leaving that customer's installed version and runtime unchanged. Current catalog sync skips non-NPM registrations. Can the public listing coexist with that registration on Cloud? If not, what supported registration/ownership change allows listing without upgrading the customer, while retaining their data and future upgrade path?

Obtain the answer early; it can affect October publication even while product work proceeds.

A full Imara inventory and migration rehearsal can wait until its upgrade is being planned, unless specific state is necessary to resolve this listing question. Do not assume a data export alone constitutes a recovery-grade backup. Later migration must account for configuration, identifiers, registration ownership, stored data, artefacts, and a supported recovery procedure.

### Historical conclusions superseded

- Early September: source appeared to reconcile tarball registrations to npm; tests did not cover the manifest-present path adequately.
- 14 September review: identified the listing-state branch/test mismatch.
- 15 September upstream change #25965: explicitly stopped attaching catalog entries to non-npm registrations.
- 10 October review: restriction remains. The earlier same-version bridge and automatic reconciliation experiment are no longer the default plan.

A local registry/CDN fixture remains an option for testing a supported future procedure. APP_REGISTRY_URL and APP_REGISTRY_CDN_URL offer relevant boundaries; upstream integration fixtures should be inspected before building a bespoke harness. No end-to-end migration experiment has been performed.

## 5. Existing Product And Public Release Boundaries

Existing workflows are the product baseline. The release treatment below concerns validation and setup boundaries, not permission to remove features or claims of production certification.

| Area | Current evidence | Proposed release treatment |
| --- | --- | --- |
| Manual gifts, donor matching, staging and batches | Implemented feature modules, front components and unit/integration tests | Core candidate scope; demonstrate end-to-end in a clean workspace |
| Funds, appeals, sources, donor/company rollups and opportunity payments | Existing metadata and app logic | Retain and explain; validate rollup correctness and bounded queries |
| Recurring agreements | Existing records, payment matching and review logic | Describe supported operations precisely; do not imply every payment provider is integrated |
| Stripe and donation forms | Per-workspace public HTTP routes, signed webhook handling, server-side Stripe calls and tests | Candidate scope subject to test-mode installation/payment/replay/failure checks and clear per-workspace setup |
| Optional declaration capture | `GIFT_AID_ENABLED` defaults off. A donation form also needs its own option enabled. Core was verified on Twenty without the extension. | Core Marketplace scope includes the capture option. The [Gift Aid extension](../../apps/fundraising/gift-aid/SETUP.md) owns eligibility, declarations, claims and HMRC submission, with its own validation and release scope. |
| Demo data | Automatic post-install creates donors, gifts, companies, opportunities and other fixtures | Public-release blocker: remove automatic fixture execution or redesign as explicit safe onboarding |
| Stripe diagnostic probe | Temporary unauthenticated diagnostic route remains | Public-release blocker: remove from public surface or explicitly redesign authentication/output |
| Additional integrations, new automation and broad UI redesign | Not necessary to establish current app value | Defer unless a demonstrated launch issue requires them |

Release/setup decisions still needed:

1. Initial audience: recommendation is a limited early release for charities resembling the current UK use case. Assisted implementation by 3Trees Digital is agreed; the precise audience remains open.
2. How Stripe/donation forms behave when workspace credentials are missing. Preserve existing functionality; any proposal to hold back a feature requires an explicit product decision.
3. Installation starting state and any explicit sample-data option.
4. Public name, publisher/support identity, package name, repository and licence.

Do not delete schema entities simply because a feature is not advertised. Restrict unsupported actions deliberately and review any removal separately.

### Routing correction

The [Stripe webhook](../../apps/fundraising/nonprofit-fundraising/src/logic-functions/handle-public-stripe-webhook.ts) uses httpRouteTriggerSettings. Twenty resolves this route's workspace from the request host. The inspected app source has no serverRouteTriggerSettings declarations.

The previous assessment incorrectly applied shared server-route owner-hosting requirements to this webhook. A shared server resolver is not inherently needed for the current per-workspace Stripe configuration. Introducing one would be a separate product/architecture decision.

Publisher ownership and provenance still need decisions. Shared server-route hosting, owner installation and billing requirements apply only if that routing model is adopted.

## 6. Required Work Versus Deferred Improvements

### Public-release requirements

- Resolve automatic fixture seeding and diagnostic exposure.
- Make unsupported/mock submission paths unmistakable and appropriately restricted.
- Review the broad app role against actual workflows; it currently permits read, update and soft delete across objects, but not hard deletion.
- Validate missing/invalid configuration, secret handling, public donation endpoints, Stripe signature checks and duplicate-event behaviour.
- Discovery keyword is now present; complete listing metadata/assets, accurate compatibility range, package contents and licence material.
- Separate public listing/setup/support copy from developer documentation.
- Choose durable npm/repository ownership and an active release workflow.
- Verify fresh installation, retained identifiers and relevant customer workflows.
- Resolve Cloud registration/listing coexistence before publication.

### Recommended release hardening

Use the [hardening backlog](APP_HARDENING_BACKLOG.md) for detailed implementation tasks. Prioritise failures in release journeys and operational recovery over general refactoring.

The backlog documents bounded batch processing (including a 60-row processing boundary and capped loaders). Verify limits in the candidate, test at and beyond them, and disclose supported usage. Do not advertise untested high-volume throughput.

Add repeatable manifest/identifier and package-content checks. Prefer reviewed releases with auto-upgrades initially disabled in our validation workspaces.

### Deferred unless needed for launch

- Broad UI restyling, extracting every large component, new provider integrations.
- Stripe OAuth/Connections redesign or shared server routing.
- User-scoped variables, agents, workflow authoring, inbox notifications.
- Select-all batch semantics or larger processing limits.
- Live HMRC submission certification/completion.
- Imara's installed-app upgrade.

## 7. Bounded Tooling Compatibility Assessment

### Findings From The 13 October Review

1. The new standalone CLI and legacy SDK CLI coexist. Both expose a twenty executable; pin and record the executable used in developer scripts and CI.
2. The SDK retains its existing CLI and publish command. The new CLI's app build creates snapshots, while the existing publishing scaffold still invokes yarn twenty app:publish. Do not replace workflow commands mechanically or assume a snapshot is a complete npm distribution.
3. New build APIs fail on TypeScript configuration/project-reference errors that legacy builds could miss. Our tsconfig.json references tsconfig.spec.json, while the separate typecheck config clears references. A passing yarn typecheck alone does not establish compatibility with the new build.
4. The new CLI documentation warns that tooling versions can alter derived permission identifiers. Compare every retained manifest identity, including permissions and system-field references.
5. Current integration setup/tooling assumptions need review: the extensibility watch identifies legacy auth-fixture fields and newer application-scoped client generation.
6. Renderer/event/ref changes warrant browser checks of forms, input focus, keyboard/pointer actions, popups, selected-record commands and side panels.
7. Existing workspace secrets should remain workspace-scoped. New user-scoped variables are not needed merely to modernise the app.

### Tooling selection and completed work

SDK/client 2.45.0, Yarn 4.13.0, Vitest 4.1.11 and the twenty-app keyword are installed and locally checked (section 11). On 26 October, the user approved standalone CLI adoption, superseding the earlier decision to retain the SDK CLI. CLI 2.49.0 is the locally checked baseline. TypeScript configuration and integration bootstrap have been migrated; the real integration lifecycle is deferred because the local workspace is testing another app. Use the [current workflow guide](TWENTY_APP_DEV_WORKFLOW.md) and [pending validation record](APP_HARDENING_BACKLOG.md#deferred-integration-lifecycle-validation). This does not authorise publication or an Imara upgrade.

The SDK package declares Node ^24.5.0 and Twenty >=2.40.0; this is an upstream compatibility constraint, not proof that our workflows work on every such server. Derive engines.twenty from tested runtime/API behaviour. Do not substitute the current dirty tree for Imara's deployed 0.1.14 artefact when checking historical identifiers.

### Relevant July-to-October Twenty changes

Bounded source comparison: app release baseline 9 July through the checked-out Twenty head dated 9 October, reviewed on 13 October. Dates/commits below identify upstream changes, not npm or Cloud deployment dates. Installed package declarations and the sdk/v2.46.0 source boundary were also inspected where relevant. This maps the boundaries our app uses; it does not claim exhaustive review of every upstream commit or runtime proof.

| Upstream change / evidence | Current app exposure | Release action |
| --- | --- | --- |
| REST app-route support, 15 July 79f3a5243a; evolving routing and refresh in twenty-client-sdk/rest | app-route-client.ts and twenty-rest-client.ts manually construct requests/tokens | Compare the installed client's contract; prefer native transport where it removes current duplication. Test route targeting, token refresh and errors; keep domain-facing error messages |
| System views/relations, 20–29 July 1be5a0e54a / 0c545bcdeb; system record pages, 11 August d61114db8a | App-owned views, tabs and deterministic system-field references | Compare retained IDs and review plan output; smoke-test views/relations and record pages. Do not recreate native defaults with new IDs |
| Execution authority, 21 August e23d3c0a60; application-token scoping/admin guards, September–October | Core/metadata calls, broad default role, authenticated actions and unauthenticated webhook execution | Exercise initiating-user restrictions and app authority separately. Verify opportunity metadata reads still work; do not globally elevate calls to make tests pass |
| Widget positions/height behaviour, August–September 942d1ceb44 / d6dc77d198; standalone widgets 654be6189c | Several CANVAS tabs; normal build gives deprecation warnings | Browser-check current layouts; defer conversion unless a release regression warrants it. Standalone widgets are optional |
| Deterministic permission IDs, 16 September 7397723927 | defineApplicationRole and future object/field permission changes | Include derived permission IDs in manifest review; any narrowing must preserve required workflows |
| Application-scoped schema and direct storage upload, 22–23 September 077a83676b / 826a4aaeeb / cd0d84def0 | Typed client generation, development sync and packaged distribution | Test real sync and packaged installation separately; static/unit passes do not prove runtime schema or upload support |
| Required variables / health checks, 21–22 September 5a51f0ddd3 / 294b38f1eb; manifest-owned declarations be6bd4ee86 | Stripe/HMRC variables are already declared in application-config.ts | Verify missing/invalid settings and preserve declarations. Add required/health-check metadata only where compatible with optional assisted setup |
| Programmatic build/typecheck, 28 September 4b26be676d | Parent tsconfig references test project; separate app check excludes it | Resolve project structure and add a deliberate test-source typecheck. Normal build passing does not supersede the observed strict-check TS6305 |
| Selected-record filters, 6 October b2a48824c9; preserved selection 3930fe4cf0 | Bulk commands use explicit useSelectedRecordIds only | Test explicit selections and Select all behaviour. No automatic larger-scope processing; document or clearly reject unsupported selection modes until reviewed |
| Database-event batching and retry APIs, August–September bd46d9de63 / afc37ee6e0 | Rollup event handlers expect individual events; financial writes need safe retries | Keep batching opt-in unless handlers/tests are updated. Do not add automatic write retries before proving idempotency |

New agents, inbox messaging, user-scoped variables, workflow manifests and Connections redesign have no identified release need in the current app. They remain optional product work.

### Current-code findings and required evidence

These priorities come from current source, not the historical refactor order in the backlog.

| Finding | Evidence / impact | Required proof and disposition |
| --- | --- | --- |
| R1: lost creation response caused another creation attempt | Regression invoked the real executor: a mocked server committed then lost its response; old single-row fallback / chunk splitting created duplicates. Contrary to the initial hypothesis, actual donor-update helpers already catch mutation failures | Automatic split/recreate on an unclassified outcome removed; existing failed/review state now instructs reconciliation. Known batch staging:gift IDs remain in writeback-error messages. Local tests pass; runtime recovery and concurrent/manual retries are not yet proved |
| R2: claim totals/readiness used one 200-gift page | Regression reproduced finalisation missing a blocker on page two | Complete membership and needs-review queue now paginate. 200/201, later-page failure, cursor validation and finalisation tests pass; runtime pagination validation outstanding |
| R3: Stripe deduplication uses check-then-create | One-off staging and recurring fulfillment check sourceFingerprint without a declared unique index | Reproduce overlapping deliveries before selecting a supported atomic strategy. Review schema/identity and existing duplicate-data implications before constraints; sequential replay tests are insufficient |
| R4: integration tests install/uninstall arbitrary configured targets | global-setup.ts writes shared test config, ignores initial uninstall result, then uninstalls on teardown | Require explicit disposable-local target/config isolation and verify failure handling before running integration lifecycle |
| R5: tests leave runtime boundaries unproved | Executor tests cover supporting functions, schema test covers presence/standard CRUD; no browser suite | Add failure-path executor tests, schema/identifier assertions and focused role/install/browser validation, not a blanket coverage target |
| R6: release lifecycle still exposes pilot fixtures/probe/mock outcomes | post-install.ts seeds fictional data; stripe-route-probe.ts is public; enabled mock HMRC mode emits submission-style timestamps | Resolve before public distribution. Installation defaults and mock presentation require user review; retained schema/identifiers stay stable |

Broad refactors, mass cast removal and generic abstractions are not release prerequisites. Existing feature folders, native metadata surfaces and shared query boundaries are retained.

No immediate mass frontend rewrite is indicated: the app uses public SDK authoring/front-component exports and client APIs, and the intentional getFieldUniversalIdentifier change matches the current scaffold. There are no app imports of twenty-ui or twenty-sdk/ui. Native UI adoption is therefore a later targeted review, not a prerequisite dependency migration. Browser validation should include the opportunity transition component's metadata-read request as well as record mutations, because static checks do not establish current runtime permissions.

## 8. Implementation And October Work Plan

Proceed in small batches, with evidence recorded in section 11:

| Batch | Work | Acceptance evidence / product boundary |
| --- | --- | --- |
| A — correctness | Implemented and unit-checked: stop unclassified creation retries, retain known reconciliation IDs, and paginate R2 claims. Added tests invoking the real executor and claim finalisation | Lost-response regression causes no second create; donor-enrichment failure preserves confirmed gift; single writeback response/batch error retain known IDs; later-page blockers stop finalisation. Failed creation chunks now require reconciliation rather than automatic isolation/retry |
| B — replay safety | Reproduce R3, select and validate a supported atomic identity/recovery approach | Sequential and concurrent replay, committed-response loss and retry tests. Review metadata constraints/identity changes before implementation |
| C — compatibility and tests | Harden R4 before integration runs; resolve TypeScript project checking; review native REST transport, permissions, generated schema and retained manifest IDs | Checked app/test sources, safe test target, exact runtime/toolchain record, route/auth failure and ordinary-user evidence |
| D — public installation | Review and implement fixture/probe treatment, missing-settings behaviour and mock HMRC boundary | Fresh packaged installation has agreed starting state and no public diagnostic exposure; simulation cannot be mistaken for real submission. Product-visible choices reviewed explicitly |
| E — release validation | User runs slow Twenty commands in their terminal; inspect local plan, fresh install and core/browser journeys, then package/CI/ownership/listing gates | Clean install and retained-record local upgrade validated separately; reviewed distribution and unresolved gates named before public publication |

Batches can overlap where independent, but integration tests depend on a safe harness and public packaged-install approval depends on the agreed lifecycle boundary. Plan confirmation is not approval for public publishing, external contact, Imara operations or schema identity changes. No separate disposable public Marketplace app is needed.

Dates are planning checkpoints, not promises. Move publication if a gate fails; do not weaken checks to meet October.

| Window | Work | Exit evidence |
| --- | --- | --- |
| 13–16 October | Record current compatibility/review evidence; start correctness regression tests/fixes; clarify publisher decisions and upstream listing question | Reproduced failures, bounded fixes, named compatibility/ownership gates |
| 17–23 October | Complete replay/test-safety/compatibility and agreed first-install fixes; prepare packaging and focused CI | Reproducible candidate with financial retry evidence, safe test harness and agreed installation behaviour |
| 24–28 October | Validate clean installs in disposable workspaces, core journeys, optional integrations, package contents and identifiers | Recorded pass/fail results against exact toolchain/runtime versions; critical issues resolved |
| 29–31 October | Review listing/coexistence evidence, release artefact, support readiness and go/no-go | Publish only with explicit approval and completed gates; otherwise retain a ready candidate and name the remaining blocker |

Registration clarification should proceed alongside preparation, with user approval before external contact. Waiting for Imara's functional testing does not block these local stages.

## 9. Candidate Validation And Publication Gates

Candidate checks:

- Run app lint, typecheck and unit tests.
- Build using the selected toolchain; inspect actual distribution files, dependency lock, metadata, assets and absence of secrets/fixtures not intended for public distribution.
- Compare identifiers and schema against an identified 0.1.14 baseline. Confirm whether the original deployed artefact is available; do not silently substitute today's dirty tree.
- Install into an empty disposable workspace; check onboarding, permissions, missing secrets, empty states, no fixtures, and core gift/staging/batch/rollup journeys.
- If Stripe ships, test separate workspace credentials, public donation flows, real test-mode webhook delivery, retries/duplicates and failure recovery.
- Verify the core install with declaration capture off. The [extension validation](../../apps/fundraising/gift-aid/SETUP.md#validation) covers claim preparation and mock submission.
- Exercise frontend behaviour affected by renderer changes.
- Test future version upgrades locally with retained records/configuration. This is distinct from proving Imara's source conversion.

Before public npm publication:

- Package name, repository visibility, licence, support and provenance decisions are settled.
- Public release scope and limitations match actual UI/runtime behaviour.
- The Cloud registration collision/coexistence question has an evidenced answer.
- Any necessary change affecting Imara's registration has separate approval and a supported procedure.
- Candidate artefact and validation record are reviewed.
- First public version is explicitly selected; recommend a new version above 0.1.14 for changed code.
- Recovery/support responsibility and publication observation are assigned.

After approved publication, verify the package, catalog visibility and a fresh non-client installation. Do not upgrade Imara as part of that validation.

## 10. Decision Log

| Decision | Status as of 13 October |
| --- | --- |
| Prioritise Marketplace; leave Imara on current setup | Agreed |
| End-of-October target | Working target, no fixed date or publication authorisation |
| Assisted implementation by 3Trees Digital | Agreed; self-service is not an initial release requirement |
| Retain application and retained entity identifiers | Agreed constraint |
| Automatic same-UID tarball-to-npm reconciliation | Unsupported by inspected current code; superseded plan |
| Same-version npm 0.1.14 bridge | Not recommended; no current conversion mechanism |
| New public version | Recommended; exact version open |
| Existing product workflows | Accepted review baseline; setup/defaults and unsupported submission presentation need explicit decisions |
| npm name/owner, repository visibility, licence, support identity | Open |
| Public GitHub provenance and publisher workspace | Recommended claim-flow approach; ownership decisions open |
| Release SDK/CLI/runtime and engines.twenty | Working SDK/client 2.45.0, SDK CLI, Yarn 4.13.0, Vitest 4.1.11; runtime/reset evidence recorded, range awaits runtime validation |
| Code review and release ordering | Current-state evidence and relevant July–October changes drive batches A–E; old refactor order superseded |
| Cloud listing coexistence | Publication gate; upstream answer needed |
| Imara migration and automatic-upgrade policy | Deferred; preserve evidence and identifiers |

## 11. Validation Record

### 2026-10-10 — Scope and tooling assessment

- Read-only source comparison against Twenty checkout 0005d7b24a.
- Reviewed app config, role, post-install seed, webhook routing, HMRC runner, TypeScript configs, current CLI/build docs and existing hardening/watch notes.
- App code, dependencies and remote configuration unchanged.
- Local baseline checks: yarn lint passed (396 files, zero warnings/errors); yarn typecheck passed; yarn test:unit passed (29 files, 171 tests). These checks used the existing installed dependencies, not a newly selected release toolchain.
- No Docker environment, catalog sync, public publication, Imara inspection, external contact or runtime migration experiment.
- Evidence limitation: a source assessment and local static/unit checks do not establish production Marketplace readiness.
- Follow-up read-only npm metadata check: SDK/client latest 2.45.0, standalone CLI latest 0.3.0. Reviewed scaffold configs, SDK auth config and app integration lifecycle; recorded the proposed first upgrade batch in section 7. No packages installed and no remote configuration inspected or changed.

### 2026-10-10 — Approved app SDK upgrade

- User chose normal app upgrade/build validation rather than further isolated comparison work.
- Updated app SDK/client pins to 2.45.0 and installed with Yarn; app version remains 0.1.14. Existing system-field helper change retained.
- Escalated normal checks passed: yarn lint, yarn typecheck, yarn test:unit (29 files / 171 tests), and yarn twenty dev:build (178 files).
- Build warns that existing CANVAS page-layout tabs are deprecated but still supported. Review their replacement separately; no layout changes were made.
- A previous temporary-copy check using the SDK's stricter typecheck API exposed TS6305 from the parent test-project reference. Normal app checks/build passed; keep this distinction visible when adopting newer build tooling.
- Current scaffold comparison: Yarn 4.13.0, Vitest ^4.0.0, optional twenty-ui, and tsgo via @typescript/native-preview differ from our app. These were assessed, not added. Marketplace keyword and engines.twenty remain outstanding.
- No app sync, integration lifecycle, remote inspection/configuration change, publication or Imara operation. Next validation is a controlled local smoke test on the user-reported Twenty 2.46.0 runtime.

### 2026-10-10 — Release tooling follow-up

- With user approval, updated packageManager to yarn@4.13.0, Vitest to ^4.0.0 (lockfile resolves 4.1.11), and added the twenty-app keyword. App version stays 0.1.14; SDK/client stay 2.45.0.
- Vitest 4 exposed invalid arrow-function constructor mocks and reused spies carrying call history. Corrected constructor implementations in two tests and added per-test spy restoration in the webhook/router suites; production behaviour and test assertions unchanged. See the [Vitest 4 migration guide](https://v4.vitest.dev/guide/migration.html).
- Escalated lint, app typecheck, all 29 unit files / 171 tests, and normal build (178 files) passed.
- Existing CANVAS deprecation warnings remain. Vite also advises explicit ESM config loading and native tsconfig path resolution; no warning suppression or broad config changes were introduced in this batch.
- Verified localhost:2020 OAuth authentication, explicitly set default remote to localhost and verified the configured URL. No Imara endpoint was contacted.
- A local sync preview was started; completion was not recorded. Slow Twenty commands were handed to the user; sync is now paused for code review. This historical validation did not run a reset, integration uninstall harness or public publication. engines.twenty remains deferred until runtime smoke evidence is reviewed.

### 2026-10-13 — Current-state review and plan reconciliation

- User confirmed all app-dev data was disposable and reported successful reset. The app was not installed beforehand; next validation is first installation, not assumed upgrade. No agent-run reset or sync occurred during this review.
- Reviewed current app code/tests and relevant upstream history from July through checkout 0005d7b24a; mapped API, authority, metadata, layout, schema/build, configuration, selection and lifecycle changes in section 7. This is bounded source evidence, not full upstream certification or runtime proof.
- R1–R3 are current-code reliability findings with reproduction outstanding. R4/R5 establish test-safety and coverage gaps. Known fixture/probe/mock release issues remain explicit. No new tests or production fixes were made during this documentation step.
- Inspected existing refactor work: new-gift.front-component.tsx is a 61-line shell, claim-batch queries/rollups are already separated, and the executor has support/effects modules. Retired those stale blanket refactor prescriptions as release priorities; reconciled the unsafe unconditional recursive-fallback advice in APP_HARDENING_BACKLOG.md.
- Documentation checks: repository-relative evidence links, internal status consistency and git diff --check. No runtime/test rerun is necessary for this docs-only step; previous build/unit evidence remains dated 10 October.

### 2026-10-13 — First correctness implementation

- Added real executor/claim-query regression suites. Before fixes, 14 of 17 cases failed; the tests confirmed duplicate creation after lost responses and finalisation ignoring a blocking gift after record 200.
- Corrected the initial donor-update hypothesis: actual donor enrichment helpers catch/log mutation failures, and that regression already passed. No new donor-error fallback was added.
- Removed unclassified automatic chunk splitting / alternate creation after batch failure. Persisted PROCESS_FAILED continues to block normal processing; errorDetail explicitly requests reconciliation before retry. The intentional new-donor/recurring row path remains unchanged. This does not claim atomic idempotency across concurrent calls, manual state resets or process termination.
- Validated response ID count/shape/uniqueness before assigning gifts. Single-row writeback failures preserve the existing successful result; batch writeback errors now retain known staging:gift mappings for recovery.
- Claim membership and needs-review queue follow all cursors and fail on malformed/incomplete responses or repeated/missing continuation cursors. Summaries are not persisted after later-page read failures; page-two blockers prevent finalisation.
- Escalated app checks passed: yarn lint (398 files), yarn typecheck and yarn test:unit (31 files / 188 tests), including all 17 new regression cases. Formatting and git diff --check also completed. The app typecheck still excludes tests as previously recorded; deliberate test-source checking remains in batch C.
- Only executor/query code, two new test files and readiness/backlog notes changed in this batch. Existing dirty changes preserved. No metadata/entity identifiers, runtime workspace, SDK dependencies, Imara state or submodule pointer changed.
- Normal SDK build and local runtime validation remain outstanding for this batch. User runs slow Twenty commands in a separate terminal. Integration harness remains unrun until batch C makes its lifecycle safe.

For future validation, record date, exact app/toolchain/runtime versions, starting state, procedure, result, evidence location and cleanup. Keep secrets and client data out of this document.

## 12. Next Implementation Step

Review batch A's bounded failed-chunk/reconciliation behaviour and run the normal SDK build from the user's terminal. Next reproduce concurrent Stripe delivery for batch B and prepare batch C's safe harness/test-source check before running integration lifecycle tests. Do not infer atomic-write or retry guarantees from mocked API success. User-run sync and first-install validation follow the agreed fixes and lifecycle decisions.

Application edits have not been authorised simply by recording recommendations here. Keep changes reviewable and validate their manifest/lifecycle impact before moving to the next batch.
