import type {
  GiftAidClaimSubmissionEnvironment,
  GiftAidClaimSubmissionSnapshot,
  MailingAddress,
} from './gift-aid-claim.types';
import { buildHmrcGovTalkPollXml } from 'src/hmrc-charities/ets/govtalk-poll.builder';
import { HmrcTransactionEngineClient } from 'src/hmrc-charities/ets/transaction-engine.client';
import { buildProvisionalHmrcCharitiesGovTalkSubmissionXml } from 'src/hmrc-charities/govtalk/provisional-govtalk-submission.builder';
import type {
  HmrcCharitiesAuthorisedOfficial,
  HmrcCharitiesClaimInput,
  HmrcCharitiesClaimPeriod,
  HmrcCharitiesGiftAidDonation,
  HmrcCharitiesRegulator,
  HmrcCharitiesSoftwareIdentity,
} from 'src/hmrc-charities/types';

type SubmissionMode =
  | 'mock_success'
  | 'mock_failure'
  | 'build_only'
  | 'submit_test';

type HmrcCharitiesConfig = {
  software: HmrcCharitiesSoftwareIdentity;
  gateway: {
    senderId: string;
    password: string;
  };
  charityId: string;
  organisation: {
    hmrcReference: string;
    charityName: string;
  };
  authorisedOfficial: HmrcCharitiesAuthorisedOfficial;
  regulator?: HmrcCharitiesRegulator;
  defaultCurrency?: 'GBP';
};

type SubmissionResult =
  | {
      ok: true;
      status: 'BUILT' | 'RESPONDED';
      submittedToHmrcAt: string;
      lastPolledAt?: string;
      completedAt: string;
      correlationId: string;
      transactionId?: string;
      responseBody: Record<string, unknown>;
    }
  | {
      ok: false;
      status: 'FAILED' | 'TIMED_OUT';
      submittedToHmrcAt?: string;
      lastPolledAt?: string;
      completedAt: string;
      correlationId?: string;
      transactionId?: string;
      failureCode: string;
      failureMessage: string;
      responseBody: Record<string, unknown>;
    };

const normalizeString = (value: string | undefined) => value?.trim() ?? '';

const POLL_MAX_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 1_000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const normalizeMode = (value: string | undefined): SubmissionMode => {
  const normalized = normalizeString(value).toLowerCase();
  if (
    normalized === 'mock_failure' ||
    normalized === 'build_only' ||
    normalized === 'submit_test'
  ) {
    return normalized;
  }

  return 'mock_success';
};

const isSubmissionEnabled = () =>
  normalizeString(process.env.HMRC_SUBMISSION_ENABLED).toLowerCase() === 'true';

const parseHmrcConfig = (): HmrcCharitiesConfig => {
  const raw = normalizeString(process.env.HMRC_CHARITIES_CONFIG_JSON);
  if (raw === '') {
    throw new Error('HMRC_CHARITIES_CONFIG_JSON is required for HMRC build/submit modes');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('HMRC_CHARITIES_CONFIG_JSON must be valid JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('HMRC_CHARITIES_CONFIG_JSON must be a JSON object');
  }

  return parsed as HmrcCharitiesConfig;
};

const isUkAddress = (address: MailingAddress) => {
  const country = normalizeString(address?.addressCountry ?? undefined).toUpperCase();
  return country === '' || country === 'GB' || country === 'UK' || country === 'UNITED KINGDOM';
};

const buildDonation = (
  gift: GiftAidClaimSubmissionSnapshot['gifts'][number],
): HmrcCharitiesGiftAidDonation => {
  const firstName = normalizeString(gift.donorFirstName ?? undefined);
  const lastName = normalizeString(gift.donorLastName ?? undefined);
  const giftDate = normalizeString(gift.giftDate ?? undefined);
  const address = gift.donorMailingAddress;
  const house = normalizeString(address?.addressStreet1 ?? undefined);
  const postcode = normalizeString(address?.addressPostcode ?? undefined);

  if (firstName === '' || lastName === '') {
    throw new Error(`Gift ${gift.id} is missing donor name facts required for HMRC submission`);
  }

  if (giftDate === '') {
    throw new Error(`Gift ${gift.id} is missing giftDate required for HMRC submission`);
  }

  if (house === '') {
    throw new Error(`Gift ${gift.id} is missing donor mailing address line 1 required for HMRC submission`);
  }

  if (isUkAddress(address) && postcode === '') {
    throw new Error(`Gift ${gift.id} is missing donor postcode required for HMRC submission`);
  }

  return {
    date: giftDate.slice(0, 10),
    total: (gift.amountMicros / 1_000_000).toFixed(2),
    donor: {
      name: {
        forename: firstName,
        surname: lastName,
      },
      house,
      ...(postcode !== '' ? { postcode } : {}),
      ...(isUkAddress(address) ? {} : { overseas: true }),
    },
  };
};

const buildClaimPeriod = (
  snapshot: GiftAidClaimSubmissionSnapshot,
): HmrcCharitiesClaimPeriod => {
  const giftDates = snapshot.gifts
    .map((gift) => normalizeString(gift.giftDate ?? undefined))
    .filter((value) => value !== '')
    .map((value) => value.slice(0, 10))
    .sort();

  if (giftDates.length === 0) {
    throw new Error('Submission snapshot has no gift dates for claim-period derivation');
  }

  return {
    startDate: giftDates[0],
    endDate: giftDates[giftDates.length - 1],
  };
};

const buildClaimInput = (
  snapshot: GiftAidClaimSubmissionSnapshot,
  config: HmrcCharitiesConfig,
): HmrcCharitiesClaimInput => {
  const donations = snapshot.gifts.map(buildDonation);

  return {
    software: config.software,
    gateway: config.gateway,
    identity: {
      messageClass: 'HMRC-CHAR-CLM',
      charityIdType: 'CHARID',
      charityId: config.charityId,
    },
    organisation: config.organisation,
    authorisedOfficial: config.authorisedOfficial,
    regulator: config.regulator,
    claimPeriod: buildClaimPeriod(snapshot),
    declaration: 'yes',
    defaultCurrency: config.defaultCurrency ?? 'GBP',
    sender: 'Individual',
    donations,
  };
};

export const runGiftAidHmrcSubmission = async (
  snapshot: GiftAidClaimSubmissionSnapshot,
  environment: GiftAidClaimSubmissionEnvironment,
): Promise<SubmissionResult> => {
  if (!isSubmissionEnabled()) {
    throw new Error('HMRC submission probe is disabled');
  }

  const mode = normalizeMode(process.env.HMRC_SUBMISSION_MODE);
  const initialCompletedAt = new Date().toISOString();

  if (mode === 'mock_failure') {
    return {
      ok: false,
      status: 'FAILED',
      completedAt: initialCompletedAt,
      correlationId: undefined,
      failureCode: 'MOCK_FAILURE',
      failureMessage: 'Gift Aid submission adapter configured to fail',
      responseBody: {
        mode,
        accepted: false,
      },
    };
  }

  if (mode === 'mock_success') {
    return {
      ok: true,
      status: 'RESPONDED',
      submittedToHmrcAt: initialCompletedAt,
      lastPolledAt: initialCompletedAt,
      completedAt: initialCompletedAt,
      correlationId: undefined,
      transactionId: `tx-${Date.now()}`,
      responseBody: {
        mode,
        accepted: true,
        environment,
      },
    };
  }

  const config = parseHmrcConfig();
  const claimInput = buildClaimInput(snapshot, config);
  const submissionXml = buildProvisionalHmrcCharitiesGovTalkSubmissionXml(
    claimInput,
    {
      gatewayTimestamp: mode === 'build_only' ? new Date().toISOString() : undefined,
      gatewayTest: environment === 'TEST',
    },
  );

  if (mode === 'build_only') {
    return {
      ok: true,
      status: 'BUILT',
      submittedToHmrcAt: initialCompletedAt,
      completedAt: initialCompletedAt,
      correlationId: undefined,
      responseBody: {
        mode,
        environment,
        claimInput,
        submissionXml,
      },
    };
  }

  const client = new HmrcTransactionEngineClient();
  const submittedToHmrcAt = new Date().toISOString();
  const submissionAck = await client.submit(submissionXml);

  if (submissionAck.qualifier === 'error') {
    return {
      ok: false,
      status: 'FAILED',
      submittedToHmrcAt,
      completedAt: new Date().toISOString(),
      correlationId: submissionAck.correlationId,
      transactionId: submissionAck.transactionId,
      failureCode: submissionAck.errorNumber ?? 'ETS_SUBMISSION_ERROR',
      failureMessage:
        submissionAck.errorText ??
        'HMRC ETS rejected the submission before acknowledgement',
      responseBody: {
        mode,
        environment,
        claimInput,
        submissionXml,
        submissionAcknowledgement: submissionAck,
      },
    };
  }

  const pollCorrelationId = submissionAck.correlationId?.trim();
  if (!pollCorrelationId) {
    return {
      ok: false,
      status: 'FAILED',
      submittedToHmrcAt,
      completedAt: new Date().toISOString(),
      correlationId: undefined,
      transactionId: submissionAck.transactionId,
      failureCode: 'ETS_ACK_MISSING_CORRELATION_ID',
      failureMessage:
        'HMRC ETS did not return a CorrelationID in the submission acknowledgement',
      responseBody: {
        mode,
        environment,
        claimInput,
        submissionXml,
        submissionAcknowledgement: submissionAck,
      },
    };
  }

  const pollXml = buildHmrcGovTalkPollXml({
    messageClass: claimInput.identity.messageClass,
    correlationId: pollCorrelationId,
  });
  const pollAcknowledgements = [];

  for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt += 1) {
    const pollAck = await client.poll(pollXml);
    const lastPolledAt = new Date().toISOString();

    pollAcknowledgements.push({
      attempt,
      qualifier: pollAck.qualifier,
      correlationId: pollAck.correlationId,
      transactionId: pollAck.transactionId,
      responseEndpoint: pollAck.responseEndpoint,
      gatewayTimestamp: pollAck.gatewayTimestamp,
      errorNumber: pollAck.errorNumber,
      errorText: pollAck.errorText,
      rawXml: pollAck.rawXml,
    });

    if (pollAck.qualifier === 'error') {
      return {
        ok: false,
        status: 'FAILED',
        submittedToHmrcAt,
        lastPolledAt,
        completedAt: lastPolledAt,
        correlationId: pollAck.correlationId ?? pollCorrelationId,
        transactionId: pollAck.transactionId ?? submissionAck.transactionId,
        failureCode: pollAck.errorNumber ?? 'ETS_POLL_ERROR',
        failureMessage:
          pollAck.errorText ?? 'HMRC ETS returned an error while polling',
        responseBody: {
          mode,
          environment,
          claimInput,
          submissionXml,
          pollXml,
          submissionAcknowledgement: submissionAck,
          pollAcknowledgements,
        },
      };
    }

    if (pollAck.qualifier === 'response') {
      return {
        ok: true,
        status: 'RESPONDED',
        submittedToHmrcAt,
        lastPolledAt,
        completedAt: lastPolledAt,
        correlationId: pollAck.correlationId ?? pollCorrelationId,
        transactionId: pollAck.transactionId ?? submissionAck.transactionId,
        responseBody: {
          mode,
          environment,
          claimInput,
          submissionXml,
          pollXml,
          submissionAcknowledgement: submissionAck,
          pollAcknowledgements,
        },
      };
    }

    if (attempt < POLL_MAX_ATTEMPTS) {
      await wait(POLL_INTERVAL_MS);
    }
  }

  const completedAt = new Date().toISOString();
  const lastPoll =
    pollAcknowledgements[pollAcknowledgements.length - 1] as
      | {
          correlationId?: string;
          transactionId?: string;
        }
      | undefined;

  return {
    ok: false,
    status: 'TIMED_OUT',
    submittedToHmrcAt,
    lastPolledAt: completedAt,
    completedAt,
    correlationId: lastPoll?.correlationId ?? pollCorrelationId,
    transactionId: lastPoll?.transactionId ?? submissionAck.transactionId,
    failureCode: 'ETS_POLL_TIMEOUT',
    failureMessage:
      'HMRC ETS did not return a terminal response within the polling attempt limit',
    responseBody: {
      mode,
      environment,
      claimInput,
      submissionXml,
      pollXml,
      submissionAcknowledgement: submissionAck,
      pollAcknowledgements,
    },
  };
};
