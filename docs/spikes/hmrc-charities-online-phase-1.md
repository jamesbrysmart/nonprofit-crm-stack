# HMRC Charities Online Phase 1 Spike

Updated: 2026-04-11  
Status: Active implementation spike  
Audience: Engineering, product, and future implementation handoff

## Purpose

This spike exists to prove the **HMRC Charities Online technical submission path in test** without coupling the work to the current Gift Aid product workflow.

The goal in this phase is to:

- ground the work in exact HMRC source materials;
- prove the split between Charities body validation and Transaction Engine submission handling;
- build a small, isolated claim-body generator from a fixed fixture;
- prepare a clean boundary so later product integration can call into this layer without redesigning it.

This spike is deliberately separate from the current Gift Aid product model where:

- `GiftAidClaimBatch` is the internal operational grouping unit;
- `submitted` means internally finalised and frozen, not yet transmitted to HMRC;
- submitted batches are immutable;
- claimed gifts should preserve frozen evidence for audit/export reproducibility.

That product shape remains the current operational direction. This spike does **not** redefine it unless an HMRC-driven technical constraint forces feedback into the product docs later.

## Out Of Scope

Phase 1 does not try to prove or build:

- live submission;
- HMRC recognition;
- CRM workflow wiring;
- product UI/admin surfaces;
- retries, resumability, or recovery sophistication;
- corrections or post-submission operations;
- redesign of the current Gift Aid product model except where HMRC constraints directly require it.

## Evidence Split

Use two evidence classes and keep them distinct in the implementation and docs.

### 1. Public HMRC sources

These are canonical, shareable references for the spike.

- Basic guide for XML software developers  
  `https://www.gov.uk/guidance/basic-guide-for-xml-software-developers`
- Software development for HMRC: detailed information  
  `https://www.gov.uk/government/collections/software-development-for-hmrc-detailed-information`
- Charities repayment claims support for software developers  
  `https://www.gov.uk/government/collections/charities-online-support-for-software-developers`
- Charities generic technical specifications  
  `https://www.gov.uk/government/publications/charities-generic-technical-specifications`
- Charities technical pack and test service guidance v1.3  
  `https://assets.publishing.service.gov.uk/media/5ba4c920ed915d2be7453849/Charities_technical_pack_v1.3.pdf`
- Charities non-form validation rules v1.3  
  `https://assets.publishing.service.gov.uk/media/5b7d5a2fed915d14d5936d4d/Charities-OnlineValidsV1.3.pdf`
- Additional guidance for software developers, Charities Online service v1.1  
  `https://assets.publishing.service.gov.uk/media/5a7f769140f0b62305b874c6/CharitiesAddGuide_-_V1_1.pdf`
- Charities technical specifications: Gift Aid repayments, RIM artefacts  
  `https://www.gov.uk/government/publications/charities-technical-specifications-gift-aid-repayments-rim-artefacts`
- Charities technical specifications: valid XML samples  
  `https://www.gov.uk/government/publications/charities-technical-specifications-valid-xml-samples`
- Local Test Service and LTS update manager  
  `https://www.gov.uk/government/publications/local-test-service-and-lts-update-manager`
- Transaction Engine support for software developers  
  `https://www.gov.uk/government/collections/government-gateway-support-for-software-developers`
- Transaction Engine: Document Submission Protocol  
  `https://www.gov.uk/government/publications/transaction-engine-document-submission-protocol`
- Support for software developers on the HMRC IRmark  
  `https://www.gov.uk/government/collections/hmrcirmark-support-for-software-developers`

### 2. SDS-issued items

These are environment- or organisation-specific inputs and must be recorded separately from public docs.

- Vendor ID: `9382`
- Test credentials: issued separately by HMRC SDS
- Future live credentials: out of scope for this phase
- SDS email guidance and clarification on test-service roles

## Direct SDS Guidance We Are Treating As Primary Evidence

Per the SDS emails for this organisation:

- HMRC has registered the organisation under Vendor ID `9382`.
- Vendor ID `9382` must be quoted in correspondence with the SDS team.
- Vendor ID `9382` must be included in the `<URI>` element of all submissions, in both `TEST` and `LIVE`.
- There is **not** an end-to-end Charities API test service.
- The Local Test Service validates the **body contents** of the submission.
- The External Test Service replicates Transaction Engine submission testing for test submissions, but validates only the **header/submission process side**.

Important constraint: SDS has told us that `<URI>` must contain the Vendor ID, but this note does **not** assume the final `ChannelRouting` shape beyond what is grounded in the public Charities and Transaction Engine documentation.

## How The Public HMRC Materials Are Used

### Cross-cutting XML / transport references

- The Basic guide for XML software developers is the current high-level HMRC guide for XML submissions, test models, and generic endpoint guidance.
- The Software development for HMRC collection is the top-level index linking the current XML support surface, including Charities, Transaction Engine, and IRmark.
- The Transaction Engine collection and DSP publication define the GovTalk submission envelope and message flow used for test and live submissions.
- The HMRC IRmark collection is the canonical source for any required IRmark rules.

### Charities-specific references

- The Charities support collection is the service-specific entry point for this spike.
- The Charities technical pack v1.3 explains the Charities-specific test posture, including the split between LTS and ETS, and the practical test setup expectations.
- The Charities non-form validation rules v1.3 define Charities-specific validation requirements not captured by the XSDs alone.
- The Charities RIM artefacts are the source for schemas and business-rule artefacts used by the claim body.
- The Charities valid XML samples are the canonical sample inputs/messages for local validation and submission-message examples.

## Confirmed Public HMRC Facts To Anchor This Spike

### Test-service split

From the current public HMRC guidance set:

- LTS is the local validator for the **claim body** against schema and business rules.
- ETS is the **submission-process** test surface, not a full Charities end-to-end validation service.
- The Charities technical pack explicitly states that there is no end-to-end Charities test service and that development uses separate services for body validation and submission-process testing.

Current implementation stance after the spike cleanup:

- LTS remains a local validation/testing tool only;
- IRmark generation, GovTalk wrapping, and ETS submission/polling are now self-contained spike logic and are not runtime-coupled to a local LTS install.

### LTS specifics

Grounded in the Charities technical pack v1.3, the Charities collection, and the LTS download page:

- LTS is a downloadable local tool.
- Current public LTS download page lists `LTS 8.3`.
- LTS download requires the developer's 4-digit Vendor ID.
- The Charities tech pack says LTS validates the body and does not perform full GovTalkHeader validation.
- The Charities tech pack also says LTS testing requires a populated `<GatewayTimestamp>` in the GovTalk header.

### ETS / submission-process specifics

Grounded in the Basic guide for XML software developers and the Transaction Engine docs:

- test submission endpoint: `https://test-transaction-engine.tax.service.gov.uk/submission`
- test poll endpoint: `https://test-transaction-engine.tax.service.gov.uk/poll`
- the Transaction Engine DSP document is the governing protocol document for submission, acknowledgement, poll, response, and delete message flow

Note on terminology drift:

- the Charities technical pack v1.3 still refers to older Government Gateway / ISV-site terminology;
- the newer Basic guide gives the current generic XML test endpoints under Transaction Engine naming;
- treat the Basic guide plus the DSP publication as the current source for endpoint naming and protocol flow, while treating the Charities tech pack as the Charities-specific explanation of what the Charities service actually validates.

### ChannelRouting and Vendor ID

Grounded in the Charities non-form validation rules v1.3 and the SDS email:

- `/GovTalkMessage/GovTalkDetails/ChannelRouting/Channel/URI` is mandatory for Charities submissions
- the Charities non-form validation rules say the value should contain a **4-digit vendor ID**
- SDS has explicitly instructed that Vendor ID `9382` must be included in `<URI>` for both `TEST` and `LIVE`
- `/GovTalkMessage/GovTalkDetails/ChannelRouting/Channel/Product` is mandatory
- `/GovTalkMessage/GovTalkDetails/ChannelRouting/Channel/Version` is mandatory

### Charities message-class and namespace details

Grounded in the Charities non-form validation rules v1.3:

- the message class for an individual charity submission is `HMRC-CHAR-CLM`
- `IRheader/Keys/Key/@Type` should be `CHARID` for individual charity submissions

Current spike stance:

- the provisional builder target is `http://www.govtalk.gov.uk/taxation/charities/r68/2`
- reason: the Charities technical pack v1.3 references RIM artefacts `v2.0` and uses `.../r68/2` in its LTS-focused guidance

Important open point:

- the non-form validation rules example shows `.../r68/1`
- this is a known documentation tension to resolve against the actual RIM artefacts and valid sample files before we call the XML builder HMRC-confirmed or LTS-ready

## Phase 1 Success Criteria

Phase 1 is done when all of the following are true:

1. The repo contains a grounded spike note that distinguishes public HMRC references from SDS-issued inputs.
2. The repo documents the LTS vs ETS split clearly enough that a later engineer does not mistake ETS for end-to-end Charities validation.
3. The implementation has a standalone Gift Aid claim fixture that does not depend on current CRM or Gift Aid batch state.
4. The implementation can generate a Charities claim-body XML document from that fixture through a clean, isolated builder boundary.
5. The code structure cleanly separates:
   - claim input contract
   - claim/body generation
   - body validation integration
   - GovTalk / Transaction Engine wrapping
   - ETS submission and polling
6. We have identified the exact upstream HMRC artifacts we will validate against, even if we do not vendor them locally.
7. We can prove one of the following with evidence recorded in the runbook:
   - HMRC sample body passes LTS locally
   - generated fixture submission passes LTS locally
   - ideally both
8. We can construct a GovTalk submission wrapper that includes `ChannelRouting` with Vendor ID `9382`, product, and version fields in the required location.
9. We can submit the wrapped request to ETS test and poll for the response using HMRC-issued test credentials.
10. The repo contains a short local runbook describing how to execute the spike and what each stage does and does not prove.

Current status against these criteria:

- Criteria `1` through `8` are met in this spike branch.
- Criterion `9` is now met:
  - the ETS submission path has been exercised successfully against the real HMRC test endpoint;
  - a valid acknowledgement with `CorrelationID` has been returned;
  - polling has also completed successfully against the real HMRC test poll endpoint.
- Criterion `10` is met for the current LTS-proven path and the current ETS-proven path.

## Local Artifact Policy

Default policy for this spike:

- pin HMRC artifacts to their canonical upstream HMRC URLs;
- do **not** vendor HMRC sample files or schema packs locally unless clearly permitted and genuinely useful;
- keep local repo files limited to:
  - our fixed claim fixture
  - generated XML outputs
  - test helpers
  - runbook notes

If we later vendor any HMRC sample files locally, the doc should record why they were copied, from which canonical source, and on what date.

## Proposed Code Boundary

The technical spike should live in `services/fundraising-service/src/hmrc-charities/` and stay separate from the current product-facing `src/gift-aid/` module.

Phase 1 boundary:

- `fixtures/` holds fixed spike inputs only
- `body/` builds Charities claim-body XML only
- later slices add:
  - `validation/` for LTS interaction
  - `mark/` for IRmark/HMRCmark
  - `govtalk/` for wrapper construction
  - `ets/` for submission and polling

This keeps the likely eventual architectural shape without forcing early Nest wiring or CRM coupling.

## Immediate Next Steps

1. Build a primary fixed claim fixture.
2. Implement the first **provisional** claim XML builder behind a typed input contract.
3. Confirm the provisional `r68/2` target against the actual Charities RIM artefacts and valid sample files before calling the builder LTS-ready.
4. Add the first local runbook once LTS execution is in place.

## Current Implementation Status

Current code status in `services/fundraising-service/src/hmrc-charities/`:

- the fixed claim fixture and XML builder are in place as a **provisional spike slice**
- the current XML builder should be treated as an **IR envelope-level draft shape**, not an HMRC-confirmed final structure
- the current provisional builder target is the `r68/2` namespace
- it exists to hold the boundary between typed spike input and XML generation while the exact Charities RIM/sample alignment is still being resolved
- no part of the current builder should be treated as LTS-confirmed until it has been checked against the current RIM artefacts and valid HMRC sample files

Update after LTS proof:

- the generated fixed-fixture submission is now LTS-proven;
- the claim body and GovTalk wrapper shape used for LTS are no longer the main external uncertainty.

Update after ETS proof:

- ETS submission, acknowledgement, and polling are now proven with the technical-pack credential pair:
  - `SenderID = 323412300001`
  - `Value = testing1`
- `Key Type="CHARID">AB12345</Key>` is now evidenced in the successful ETS submission/poll path.
- omitting `GatewayTimestamp` on `submit_request` is now evidenced as the correct ETS request shape for this path.
- the earlier local tooling/runtime issue in the regenerated submit path has now been resolved by removing the spike-era LTS jar dependency from the provisional IRmark path.

## Artifact Grounding Findings

Public HMRC artifacts inspected during this spike:

- valid XML sample archive: `CharitiesValidSamples.zip`
- LTS sample file inside that archive: `LTS Valid Sample/GAValidSample.xml`
- RIM schema archive: `hmrc-charities-v2-0.zip`
- schema files inspected:
  - `r68-v2-0.xsd`
  - `envelope-v2-0-HMRC.xsd`

### Confirmed overall unit for the HMRC valid sample

The HMRC valid LTS sample is a **full `GovTalkMessage` document**, not a bare `IRenvelope`.

Observed structure:

- `GovTalkMessage`
- `EnvelopeVersion`
- `Header`
- `GovTalkDetails`
- `Body`
- `Body/IRenvelope`
- `IRenvelope/IRheader`
- `IRenvelope/R68`

This means the eventual LTS execution path must produce a full GovTalk document, even though the Charities-specific claim content sits inside `Body/IRenvelope`.

### Confirmed `r68-v2-0` IR-envelope structure

From `r68-v2-0.xsd` and the HMRC valid sample:

- namespace target is `http://www.govtalk.gov.uk/taxation/charities/r68/2`
- `IRenvelope` contains exactly:
  - `IRheader`
  - `R68`
- `IRheader` requires:
  - `PeriodEnd`
  - `Sender`
- `IRheader` may include:
  - `Keys`
  - `Principal`
  - `Agent`
  - `DefaultCurrency`
  - `Manifest`
  - `IRmark`
- `R68` requires:
  - one of `AuthOfficial`, `CollAgent`, or `AgtOrNom`
  - `Declaration`
  - either one or more `Claim` elements or `CompressedPart`

### Mismatches found in the earlier provisional builder

The earlier provisional builder diverged from the HMRC artifacts in several important ways:

1. It emitted only `IRenvelope`, while the valid HMRC LTS sample is a full `GovTalkMessage`.
2. It used an invented `PeriodStart` element. The `r68-v2-0` schema uses `PeriodEnd`; there is no `PeriodStart`.
3. It placed contact details inside `Claim`, but the schema/sample put the authorised official in `R68/AuthOfficial`.
4. It used an invented `Repayment/Gift/Sequence/Amount` shape. The actual schema/sample uses repeated `Repayment/GAD` elements with donor details plus `Date` and `Total`.
5. It used `Amount` where the schema/sample use `Total`.
6. It omitted mandatory `Declaration`.
7. It omitted required sender classification in `IRheader/Sender`.
8. It did not yet represent the full LTS submission unit because it had no GovTalk wrapper.

### Builder adjustment decision

Based on the artifacts, the provisional builder should now be treated as:

- a provisional **`r68-v2-0` IR-envelope builder**
- not yet the final LTS submission builder

That preserves the clean separation between:

- Charities claim content generation
- GovTalk / Transaction Engine wrapping

while still aligning the claim-content builder to the real schema and sample evidence.

### Remaining gaps before LTS

The spike now has a provisional full GovTalk submission builder around the `r68-v2-0` IR-envelope, including a provisional IRmark implementation.

LTS proof still requires follow-up work:

- confirm the provisional IRmark implementation against HMRC/LTS behaviour
- validate the generated output in LTS
- record the exact LTS execution/runbook steps and outcomes

## First LTS Execution Findings

The first repeatable local LTS execution in this spike established the following:

1. LTS 8.3 would not start successfully until `LTS_HOME` was set.
2. The first generated GovTalk file initially contained a nested XML declaration inside `Body`, which LTS rejected with:
   - `The processing instruction target matching "[xX][mM][lL]" is not allowed.`
3. After removing that assembly bug, both:
   - the generated provisional submission file, and
   - HMRC's own `GAValidSample.xml`
   failed in the same way when posted to the local LTS endpoint:
   - `uk.gov.hmrc.aspire.esps.validator.config.ServiceNotRegisteredException: http://www.govtalk.gov.uk/CM/envelope|http://www.govtalk.gov.uk/taxation/charities/r68/2`

Current interpretation:

- the current blocker is no longer the generated XML wrapper shape
- the local LTS 8.3 installation initially needed the Charities `r68/2` rules package installed and a clean restart before validation could proceed

After the Charities rules install and a clean restart:

- HMRC's own `GAValidSample.xml` passed LTS successfully
- the generated provisional submission reached real Charities schema validation
- the first actual schema failure returned by LTS was:
  - `Invalid content found at element 'HMRCref'`
  - expected order inside `Claim` starts with `OrgName` before `HMRCref`

This means the spike has now proven:

- repeatable local file generation
- repeatable LTS startup
- repeatable programmatic LTS submission
- successful validation of HMRC's own sample
- first real schema feedback on the generated file

## LTS Acceptance Evidence

The generated provisional submission file now passes LTS, not just HMRC's sample.

Accepted run evidence from the local LTS response:

- acceptance timestamp: `2026-04-10T14:16:35.016`
- response message code `0000`
- response message code `077001`
- accepted document reference: `AB12345`
- accepted IRmark digest in the response signature reference: `zsWr/40F1y/g/PnS14/2gCUbd94=`
- accepted IRmark receipt reference shown by LTS: `Z3C2X74NAXLS7YH47HJNPD7WQASRW566`

Acceptance interpretation:

- the standalone spike can generate a Charities `HMRC-CHAR-CLM` submission that HMRC LTS accepts
- the accepted path includes:
  - full GovTalk wrapper
  - Vendor ID `9382` in `GovTalkDetails/ChannelRouting/Channel/URI`
  - an IRmark that LTS accepts for the generated submission

This is the first concrete proof point that the standalone payload path is technically viable independently of current product workflow wiring.

## Regression Anchor

The current accepted path is now protected by lightweight regression anchors in code:

- the HMRC sample IRmark is reproduced exactly from the official valid sample
- the generated fixture GovTalk submission keeps the expected wrapper structure
- the generated fixture GovTalk submission currently computes the accepted IRmark digest:
  - `zsWr/40F1y/g/PnS14/2gCUbd94=`

These anchors are intentionally lighter than a full brittle golden-file assertion, but strong enough to catch accidental breakage in:

- GovTalk wrapper shape
- IRmark calculation
- the fixed fixture to submission builder path

## ETS Implementation Start

With the LTS-proven payload path in place, the next active slice is ETS submission and polling.

Current implementation added:

- GovTalk poll builder aligned to the HMRC sample poll message
- Transaction Engine client targeting the HMRC test submission and poll endpoints
- submit and poll scripts that operate on the same LTS-proven GovTalk submission path

First recorded ETS attempt used the public sample/test credentials currently carried in the spike fixture:

- `SenderID`: `GIFTAIDCHAR`
- password: `testing2`

These are treated in this spike as public HMRC sample/test values, not as organisation-specific SDS-issued credentials.

### Recorded ETS outcomes

#### Attempt 1: full GovTalk submission including `GatewayTimestamp`

Result:

- fatal response from Transaction Engine
- no `CorrelationID`
- `Qualifier`: `error`
- response `Class`: `UndefinedClass`

Observed error:

```text
1001
Parsing Error : Element '{http://www.govtalk.gov.uk/CM/envelope}GatewayTimestamp' has a value which does not match the fixed value defined in the DTD/Schema.
```

Interpretation:

- ETS was rejecting the submission at message parsing time before it reached service authentication;
- the LTS-required `GatewayTimestamp` could not simply be assumed to belong unchanged in the ETS submission path.

#### Attempt 2: same submission path with `GatewayTimestamp` omitted

This was grounded against the HMRC gateway reflector submission sample, which omits `GatewayTimestamp`.

Result:

- Transaction Engine accepted the message far enough to perform gateway/service authentication
- no `CorrelationID`
- `Qualifier`: `error`
- response endpoint: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-11T14:32:32.722`

Observed error:

```text
1046
Authentication Failure. The supplied user credentials failed validation for the requested service.
```

Interpretation:

- this is the first meaningful ETS proof point;
- the current message shape is parseable by ETS once `GatewayTimestamp` is omitted;
- the current blocker is credential validation, not GovTalk parse failure;
- because no acknowledgement was returned, polling cannot proceed yet.

Current ETS status:

- ETS submission path implemented and exercised against the real HMRC test endpoint
- first parse-level issue identified and bypassed
- public/sample credentials in the fixture are not valid for this service path

#### Attempt 3: technical-pack credentials with `GatewayTimestamp` omitted

This retry used the specific Charities technical-pack test credential pair:

- `SenderID`: `323412300001`
- password: `testing1`

The request also retained:

- `Key Type="CHARID">AB12345</Key>`
- omitted `GatewayTimestamp` on `submit_request`

Acknowledgement result:

- `Qualifier`: `acknowledgement`
- `CorrelationID`: `72C91DDE585244948E5E2D89EC15DABF`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/poll`
- response timestamp: `2026-04-15T11:59:11.318`

Poll result:

- `Qualifier`: `response`
- `CorrelationID`: `72C91DDE585244948E5E2D89EC15DABF`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-15T12:03:11.555`
- current extracted response body is empty, but the acknowledgement/poll handshake is proven

Interpretation:

- the HMRC-side ETS blocker is resolved;
- the correct ETS test credential pair for this path is evidenced in practice as `323412300001 / testing1`;
- omitting `GatewayTimestamp` on `submit_request` is also evidenced as the correct ETS request shape;
- the earlier local regeneration issue was caused by a spike-era Java/LTS jar dependency;
- that dependency has now been removed in favour of a self-contained Node-side IRmark calculation for this provisional path.

#### Attempt 4: normal regenerated submit path after removing the LTS runtime dependency

After replacing the Java/LTS-based provisional IRmark helper with a self-contained Node-side calculation, the normal regenerated submit flow was rerun without `--input`.

Credential pair used:

- `SenderID`: `323412300001`
- password: `testing1`

Acknowledgement result:

- `Qualifier`: `acknowledgement`
- `CorrelationID`: `7DDC87759741424FBC83ABA70BB75309`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/poll`
- response timestamp: `2026-04-15T12:24:53.040`

Poll result:

- `Qualifier`: `response`
- `CorrelationID`: `7DDC87759741424FBC83ABA70BB75309`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-15T12:25:05.740`

Current cleaned-up ETS conclusion:

- the normal regenerated submit path is now working again without any local LTS install;
- LTS remains useful for validation/testing only;
- the provisional submission path is now self-contained enough to serve as the reusable spike baseline for further integration work.
