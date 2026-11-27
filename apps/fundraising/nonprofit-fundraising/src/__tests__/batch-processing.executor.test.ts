import { describe, expect, it } from 'vitest';

import {
  buildNewPersonCreateData,
  deriveLinkedDonorEmailUpdate,
  deriveLinkedDonorSupporterEmailOptOutUpdate,
  deriveRecurringCadenceFromProviderEvidence,
} from 'src/batch-processing/batch-processing.executor';
import { buildGiftPayloadFromRow } from 'src/batch-processing/batch-processing.executor.support';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';

describe('deriveRecurringCadenceFromProviderEvidence', () => {
  it.each([
    ['week', 1, 'WEEKLY', 1],
    ['month', 1, 'MONTHLY', 1],
    ['month', 3, 'QUARTERLY', 1],
    ['year', 1, 'ANNUAL', 1],
  ])(
    'maps provider interval %s/%s to %s',
    (providerIntervalUnit, providerIntervalCount, cadence, intervalCount) => {
      expect(
        deriveRecurringCadenceFromProviderEvidence({
          providerIntervalUnit,
          providerIntervalCount,
        }),
      ).toEqual({
        cadence,
        intervalCount,
      });
    },
  );

  it('rejects missing provider interval evidence', () => {
    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: null,
        providerIntervalCount: 1,
      }),
    ).toThrow('Provider recurring interval unit is required');

    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: 'month',
        providerIntervalCount: null,
      }),
    ).toThrow('Provider recurring interval count is required');
  });

  it('rejects intervals that cannot be represented safely yet', () => {
    expect(() =>
      deriveRecurringCadenceFromProviderEvidence({
        providerIntervalUnit: 'day',
        providerIntervalCount: 14,
      }),
    ).toThrow('Unsupported provider recurring interval 14 day');
  });
});

const buildProcessingRow = (
  overrides: Partial<BatchProcessingRow> = {},
): BatchProcessingRow => ({
  id: 'staging_1',
  name: 'Row',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  donorEmail: 'ada@example.com',
  donorMailingAddress: null,
  amount: {
    amountMicros: 10_000_000,
    currencyCode: 'GBP',
  },
  giftDate: '2026-05-01',
  donationType: 'ONE_OFF',
  paymentType: 'CARD',
  externalId: null,
  sourceFingerprint: null,
  providerEventId: null,
  provider: 'STRIPE',
  providerPaymentId: null,
  coveredFeeAmount: null,
  grossPaymentAmount: null,
  processingFeeAmount: null,
  netReceivedAmount: null,
  providerPayoutReference: null,
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  donorPhone: null,
  supporterEmailOptOut: null,
  isAnonymousDonor: false,
  rawProviderEvidence: null,
  appealSourceExternalId: null,
  sourceAppealName: null,
  sourceFundName: null,
  donorResolutionState: 'UNREVIEWED',
  donor: null,
  fund: null,
  appeal: null,
  appealSource: null,
  giftReadyStatus: 'READY_TO_PROCESS',
  paymentState: null,
  processingStatus: 'NOT_PROCESSED',
  errorDetail: null,
  giftAidRequested: false,
  giftAidDeclarationCaptured: false,
  giftAidDeclarationDate: null,
  giftAidCoverageScope: null,
  giftAidDeclarationSource: null,
  giftAidTextVersion: null,
  giftAidDeclaration: null,
  recurringAgreement: null,
  committedGift: null,
  ...overrides,
});

describe('deriveLinkedDonorEmailUpdate', () => {
  it('returns an additive update for a linked donor with a new staged email', () => {
    expect(
      deriveLinkedDonorEmailUpdate(
        buildProcessingRow({
          donorEmail: 'new@example.com',
          donor: {
            id: 'person_1',
            emails: {
              primaryEmail: 'existing@example.com',
              additionalEmails: ['other@example.com'],
            },
          },
        }),
      ),
    ).toEqual({
      donorId: 'person_1',
      emails: {
        primaryEmail: 'existing@example.com',
        additionalEmails: ['other@example.com', 'new@example.com'],
      },
    });
  });

  it('does nothing when the staged email already exists on the linked donor', () => {
    expect(
      deriveLinkedDonorEmailUpdate(
        buildProcessingRow({
          donorEmail: 'EXISTING@example.com',
          donor: {
            id: 'person_1',
            emails: {
              primaryEmail: 'existing@example.com',
              additionalEmails: ['other@example.com'],
            },
          },
        }),
      ),
    ).toBeNull();
  });

  it('does nothing when there is no linked donor or no staged email', () => {
    expect(
      deriveLinkedDonorEmailUpdate(
        buildProcessingRow({
          donor: null,
        }),
      ),
    ).toBeNull();

    expect(
      deriveLinkedDonorEmailUpdate(
        buildProcessingRow({
          donorEmail: '',
          donor: {
            id: 'person_1',
            emails: {
              primaryEmail: 'existing@example.com',
              additionalEmails: [],
            },
          },
        }),
      ),
    ).toBeNull();
  });
});

describe('deriveLinkedDonorSupporterEmailOptOutUpdate', () => {
  it('returns a sticky opt-out update for a linked donor when staged true', () => {
    expect(
      deriveLinkedDonorSupporterEmailOptOutUpdate(
        buildProcessingRow({
          supporterEmailOptOut: true,
          donor: {
            id: 'person_1',
            supporterEmailOptOut: false,
          },
        }),
      ),
    ).toEqual({
      donorId: 'person_1',
      supporterEmailOptOut: true,
    });
  });

  it('does not clear or rewrite when staged value is false, null, or already true', () => {
    expect(
      deriveLinkedDonorSupporterEmailOptOutUpdate(
        buildProcessingRow({
          supporterEmailOptOut: false,
          donor: {
            id: 'person_1',
            supporterEmailOptOut: true,
          },
        }),
      ),
    ).toBeNull();

    expect(
      deriveLinkedDonorSupporterEmailOptOutUpdate(
        buildProcessingRow({
          supporterEmailOptOut: null,
          donor: {
            id: 'person_1',
            supporterEmailOptOut: true,
          },
        }),
      ),
    ).toBeNull();

    expect(
      deriveLinkedDonorSupporterEmailOptOutUpdate(
        buildProcessingRow({
          supporterEmailOptOut: true,
          donor: {
            id: 'person_1',
            supporterEmailOptOut: true,
          },
        }),
      ),
    ).toBeNull();
  });
});

describe('buildNewPersonCreateData', () => {
  it('defaults a new person to false by omitting supporterEmailOptOut unless staged true', () => {
    expect(
      buildNewPersonCreateData(
        buildProcessingRow({
          supporterEmailOptOut: null,
        }),
      ),
    ).not.toHaveProperty('supporterEmailOptOut');

    expect(
      buildNewPersonCreateData(
        buildProcessingRow({
          supporterEmailOptOut: false,
        }),
      ),
    ).not.toHaveProperty('supporterEmailOptOut');
  });

  it('sets supporterEmailOptOut for a new person when staged true', () => {
    expect(
      buildNewPersonCreateData(
        buildProcessingRow({
          supporterEmailOptOut: true,
        }),
      ),
    ).toMatchObject({
      supporterEmailOptOut: true,
    });
  });
});

describe('buildGiftPayloadFromRow', () => {
  it('maps the staged payment type onto the committed gift payload', () => {
    expect(
      buildGiftPayloadFromRow(
        buildProcessingRow({
          donorResolutionState: 'CONFIRMED',
          donor: { id: 'person_1' },
          paymentType: 'DIRECT_DEBIT',
        }),
      ),
    ).toMatchObject({
      paymentType: 'DIRECT_DEBIT',
    });
  });

  it('rejects rows without a payment type', () => {
    expect(() =>
      buildGiftPayloadFromRow(
        buildProcessingRow({
          paymentType: null,
        }),
      ),
    ).toThrow('Payment type is required before batch processing');
  });

  it('marks an explicitly anonymous payload without donor linkage requirements', () => {
    expect(
      buildGiftPayloadFromRow(
        buildProcessingRow({
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          donor: null,
          isAnonymousDonor: true,
        }),
      ),
    ).toMatchObject({
      isAnonymousDonor: true,
    });
  });

  it('rejects explicitly anonymous recurring rows for now', () => {
    expect(() =>
      buildGiftPayloadFromRow(
        buildProcessingRow({
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          donor: null,
          isAnonymousDonor: true,
          providerAgreementId: 'sub_123',
          providerIntervalUnit: 'month',
          providerIntervalCount: 1,
        }),
      ),
    ).toThrow(
      'Anonymous donor gifts are not yet supported for recurring processing',
    );
  });
});
