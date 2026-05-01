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
      status: 'BUILT' | 'SENT';
      submittedToHmrcAt: string;
      lastPolledAt?: string;
      completedAt: string;
      correlationId: string;
      transactionId?: string;
      responseBody: Record<string, unknown>;
    }
  | {
      ok: false;
      status: 'FAILED';
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
  const correlationId = `ga-${snapshot.batch.id}-${Date.now()}`;
  const completedAt = new Date().toISOString();

  if (mode === 'mock_failure') {
    return {
      ok: false,
      status: 'FAILED',
      completedAt,
      correlationId,
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
      status: 'SENT',
      submittedToHmrcAt: completedAt,
      lastPolledAt: completedAt,
      completedAt,
      correlationId,
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
  const gatewayTimestamp = new Date().toISOString();
  const submissionXml = buildProvisionalHmrcCharitiesGovTalkSubmissionXml(
    claimInput,
    {
      correlationId,
      gatewayTimestamp,
      gatewayTest: environment === 'TEST',
    },
  );

  if (mode === 'build_only') {
    return {
      ok: true,
      status: 'BUILT',
      submittedToHmrcAt: completedAt,
      completedAt,
      correlationId,
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
  const pollXml = buildHmrcGovTalkPollXml({
    messageClass: claimInput.identity.messageClass,
    correlationId: submissionAck.correlationId ?? correlationId,
  });
  const pollAck = await client.poll(pollXml);
  const lastPolledAt = new Date().toISOString();

  return {
    ok: true,
    status: 'SENT',
    submittedToHmrcAt,
    lastPolledAt,
    completedAt: lastPolledAt,
    correlationId: pollAck.correlationId ?? submissionAck.correlationId ?? correlationId,
    transactionId: pollAck.transactionId ?? submissionAck.transactionId,
    responseBody: {
      mode,
      environment,
      claimInput,
      submissionXml,
      pollXml,
      submissionAcknowledgement: submissionAck,
      pollAcknowledgement: pollAck,
    },
  };
};
