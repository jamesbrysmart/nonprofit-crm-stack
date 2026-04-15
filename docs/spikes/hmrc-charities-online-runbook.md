# HMRC Charities Online Spike Runbook

Updated: 2026-04-11  
Status: Working spike runbook

## Purpose

This runbook records the repeatable local steps for the standalone HMRC Charities Online spike.

It is intentionally narrow:

- generate a fixed provisional GovTalk submission XML file
- submit it to HMRC LTS locally
- capture the current validation outcome clearly

## Scope Notes

- This runbook is for the standalone HMRC spike only.
- It does not represent product workflow integration.
- Passing LTS would prove local validation of the submission content and related checks only.
- It would not prove ETS or full end-to-end Charities processing.
- LTS is a local validation/testing tool only; the normal ETS submission path should not depend on a local extracted LTS install at runtime.

## Prerequisites

- Java installed locally
- HMRC LTS downloaded locally
- `services/fundraising-service` dependencies installed

Current public LTS archive used during this spike:

- `LTS 8.3`
- downloaded locally to `/tmp/LTS8.3.zip`
- extracted locally to `/tmp/hmrc-lts/HMRCTools/LTS`

## Generate The Provisional Submission File

From `services/fundraising-service`:

```bash
npm run hmrc:charities:write-provisional
```

Default output path:

```text
services/fundraising-service/tmp/hmrc-charities/provisional-govtalk-submission.xml
```

Optional arguments:

```bash
npm run hmrc:charities:write-provisional -- --out /absolute/path/output.xml
npm run hmrc:charities:write-provisional -- --gateway-timestamp 2026-04-10T12:00:00.000
```

## Start LTS Locally

Current local command used in this spike:

```bash
cd /tmp/hmrc-lts/HMRCTools/LTS
env LTS_HOME=/tmp/hmrc-lts/HMRCTools/LTS sh RunLTSStandalone.sh
```

Relevant local endpoints:

- UI: `http://localhost:5665/LTS`
- programmatic POST endpoint: `http://localhost:5665/LTS/LTSPostServlet`

## Submit The Generated File To LTS

Current local command used in this spike:

```bash
curl \
  -sS \
  -H 'Content-Type: application/x-binary' \
  -H 'maxWorkForTest: 1' \
  --data-binary @services/fundraising-service/tmp/hmrc-charities/provisional-govtalk-submission.xml \
  http://localhost:5665/LTS/LTSPostServlet
```

## Current Recorded Outcome

Current recorded outcomes from this spike session:

- LTS would not start correctly until `LTS_HOME` was set.
- The first generated submission failed before service routing because the GovTalk `Body` incorrectly contained a nested XML declaration.
- After fixing that assembly bug, both the generated file and HMRC's own sample initially failed because the Charities rules were installed but LTS had not yet been cleanly restarted.
- After the Charities `2014-2015 / 2.0` package was installed and LTS was restarted cleanly:
  - HMRC's `GAValidSample.xml` passed
  - the generated provisional file failed with:

```text
Invalid content found at element 'HMRCref'
DeveloperMessage: cvc-complex-type.2.4.a: Invalid content was found starting with element 'HMRCref'. One of '{"http://www.govtalk.gov.uk/taxation/charities/r68/2":OrgName}' is expected.
```

After iterating through the LTS feedback, the generated provisional file was accepted successfully.

Accepted generated submission evidence:

- accepted timestamp: `2026-04-10T14:16:35.016`
- message code `0000`
- message code `077001`
- accepted document reference: `AB12345`
- accepted IRmark digest: `zsWr/40F1y/g/PnS14/2gCUbd94=`
- accepted IRmark receipt reference: `Z3C2X74NAXLS7YH47HJNPD7WQASRW566`

Observed acceptance text from the response:

```text
HMRC has received the HMRC-CHAR-CLM document ref: AB12345 at 14.16 on 10/04/2026.
```

Current conclusion:

- HMRC's own sample passes LTS
- the generated provisional submission also passes LTS
- the standalone payload path is now LTS-proven

## Next Step

Move to ETS submission and polling using the same LTS-proven GovTalk payload path.

## ETS Submission And Polling

Current HMRC ETS endpoints used by this spike:

- submission: `https://test-transaction-engine.tax.service.gov.uk/submission`
- poll: `https://test-transaction-engine.tax.service.gov.uk/poll`

Grounding references:

- Basic guide for XML software developers
- Transaction Engine: Document Submission Protocol
- Charities valid gateway reflector message samples

### Submit To ETS

From `services/fundraising-service`:

```bash
HMRC_ETS_SENDER_ID='your-test-sender-id' \
HMRC_ETS_PASSWORD='your-test-password' \
npm run hmrc:charities:submit-ets
```

Optional:

```bash
npm run hmrc:charities:submit-ets -- --input /absolute/path/submission.xml
```

Expected output shape:

- raw GovTalk acknowledgement XML
- extracted `Qualifier`
- extracted `CorrelationID`
- extracted `ResponseEndPoint`
- extracted `GatewayTimestamp`

### Poll ETS

From `services/fundraising-service`:

```bash
npm run hmrc:charities:poll-ets -- --correlation-id YOUR_CORRELATION_ID
```

Optional:

```bash
npm run hmrc:charities:poll-ets -- --class HMRC-CHAR-CLM
```

Current status:

- scripts and client are in place
- ETS has now been exercised against the real HMRC test endpoint
- submission acknowledgement and polling are now proven against the real HMRC test endpoint
- the normal regenerated submit path is now also proven without any LTS runtime dependency

### First Recorded ETS Attempt

Current first-attempt credentials used in this spike:

- `HMRC_ETS_SENDER_ID=GIFTAIDCHAR`
- `HMRC_ETS_PASSWORD=testing2`

These are treated here as public/sample HMRC test values, not as organisation-specific SDS-issued credentials.

Attempt sequence and outcomes:

1. Initial ETS submission included `GatewayTimestamp`.
   Result:

```text
1001
Parsing Error : Element '{http://www.govtalk.gov.uk/CM/envelope}GatewayTimestamp' has a value which does not match the fixed value defined in the DTD/Schema.
```

2. ETS submission was retried with `GatewayTimestamp` omitted, matching the HMRC gateway reflector submission sample more closely.
   Result:

```text
1046
Authentication Failure. The supplied user credentials failed validation for the requested service.
```

Observed metadata from the second response:

- `Qualifier`: `error`
- no `CorrelationID`
- response endpoint: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-11T14:32:32.722`

Conclusion after attempt 2:

- the ETS submission path is live and the message now parses at the gateway;
- the current blocker is credentials, not basic GovTalk parse shape;
- polling cannot proceed until ETS returns an acknowledgement with a `CorrelationID`.

### Technical-Pack Credential Retry

The next ETS retry used the Charities technical-pack credential pair:

- `HMRC_ETS_SENDER_ID=323412300001`
- `HMRC_ETS_PASSWORD=testing1`

The submission also retained:

- `Key Type="CHARID">AB12345</Key>`
- omitted `GatewayTimestamp` on `submit_request`

At this point in the spike, the normal regenerated submit path still failed locally in the Java IRmark helper, so this retry was executed by submitting the existing LTS-proven XML through:

```bash
npm run hmrc:charities:submit-ets -- --input /absolute/path/submission.xml
```

Acknowledgement outcome:

- `Qualifier`: `acknowledgement`
- `CorrelationID`: `72C91DDE585244948E5E2D89EC15DABF`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/poll`
- response timestamp: `2026-04-15T11:59:11.318`

Poll command used:

```bash
npm run hmrc:charities:poll-ets -- --correlation-id 72C91DDE585244948E5E2D89EC15DABF
```

Poll outcome:

- `Qualifier`: `response`
- `CorrelationID`: `72C91DDE585244948E5E2D89EC15DABF`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-15T12:03:11.555`
- current extracted response body is empty, but the ETS submission/ack/poll handshake is proven

Current conclusion after the retry:

- the HMRC-side ETS blocker is resolved;
- the correct ETS test credential pair for this path is evidenced in practice as `323412300001 / testing1`;
- omitting `GatewayTimestamp` on `submit_request` is evidenced as the correct ETS request shape;
- the remaining issue at that point was local regeneration of the submission payload via the Java IRmark helper path, not HMRC-side authentication or polling.

### Normal Regenerated Submit Path After Removing The LTS Runtime Dependency

The provisional IRmark calculation has now been replaced with a self-contained Node-side implementation, so the normal regenerated submit path no longer depends on a local LTS install or LTS jars at runtime.

Normal submit command:

```bash
HMRC_ETS_SENDER_ID='323412300001' \
HMRC_ETS_PASSWORD='testing1' \
npm run hmrc:charities:submit-ets
```

Acknowledgement outcome:

- `Qualifier`: `acknowledgement`
- `CorrelationID`: `7DDC87759741424FBC83ABA70BB75309`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/poll`
- response timestamp: `2026-04-15T12:24:53.040`

Poll command:

```bash
npm run hmrc:charities:poll-ets -- --correlation-id 7DDC87759741424FBC83ABA70BB75309
```

Poll outcome:

- `Qualifier`: `response`
- `CorrelationID`: `7DDC87759741424FBC83ABA70BB75309`
- `ResponseEndPoint`: `https://test-transaction-engine.tax.service.gov.uk/submission`
- response timestamp: `2026-04-15T12:25:05.740`

Current cleaned-up conclusion:

- LTS remains a local validation/testing tool only;
- IRmark generation, GovTalk wrapping, and ETS submission/polling are now self-contained spike logic;
- the normal regenerated ETS submit path is now proven end-to-end without the `--input` workaround.
