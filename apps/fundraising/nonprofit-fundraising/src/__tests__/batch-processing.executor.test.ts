import { describe, expect, it } from 'vitest';

import {
  buildNewPersonCreateData,
  canProcessBatchRow,
  deriveLinkedDonorEmailUpdate,
  deriveLinkedDonorSupporterEmailOptOutUpdate,
  deriveRecurringCadenceFromProviderEvidence,
} from 'src/batch-processing/batch-processing.executor';
import { resolveAppealSourceParentsForProcessing } from 'src/appeal-sources/appeal-source-processing-resolution';
import { buildGiftPayloadFromRow } from 'src/batch-processing/batch-processing.executor.support';
import type { BatchProcessingRow } from 'src/batch-processing/batch-processing.types';
import type { CoreApiClient } from 'twenty-client-sdk/core';

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
  paymentProviderCustomerId: null,
  providerAgreementId: null,
  providerIntervalUnit: null,
  providerIntervalCount: null,
  donorPhone: null,
  supporterEmailOptOut: null,
  isAnonymousDonor: false,
  rawProviderEvidence: null,
  donorResolutionState: 'UNREVIEWED',
  donor: null,
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

describe('canProcessBatchRow', () => {
  it('allows a ready row with a linked donor', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'CONFIRMED',
          donor: { id: 'person_1' },
        }),
      ),
    ).toBe(true);
  });

  it('allows a ready row with no linked donor when sufficient new-donor evidence is present', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'NEW_DONOR',
          donor: null,
        }),
      ),
    ).toBe(true);
  });

  it('blocks an ambiguous donor row without a linked donor', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'AMBIGUOUS',
          donor: null,
        }),
      ),
    ).toBe(false);
  });

  it('blocks a donorless row when the minimum new-donor evidence is incomplete', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorFirstName: '',
          donorLastName: 'Lovelace',
          donor: null,
        }),
      ),
    ).toBe(false);
  });

  it('allows an explicitly anonymous row without donor evidence', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          donor: null,
          isAnonymousDonor: true,
        }),
      ),
    ).toBe(true);
  });

  it('blocks a payment-gated row until payment is confirmed', () => {
    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'CONFIRMED',
          donor: { id: 'person_1' },
          paymentState: 'AWAITING_PAYMENT',
        }),
      ),
    ).toBe(false);

    expect(
      canProcessBatchRow(
        buildProcessingRow({
          donorResolutionState: 'CONFIRMED',
          donor: { id: 'person_1' },
          paymentState: 'PAYMENT_CONFIRMED',
        }),
      ),
    ).toBe(true);
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

describe('resolveAppealSourceParentsForProcessing', () => {
  it('hydrates the appeal source parent before payload validation', async () => {
    const client = {
      query: async () => ({
        appealSources: {
          edges: [
            {
              node: {
                id: 'source_1',
                appeal: {
                  id: 'appeal_1',
                  defaultFund: {
                    id: 'fund_1',
                    name: 'General fund',
                  },
                },
              },
            },
          ],
        },
      }),
    } as unknown as CoreApiClient;

    const [resolvedRow] = await resolveAppealSourceParentsForProcessing(client, [
      buildProcessingRow({
        donorResolutionState: 'CONFIRMED',
        donor: { id: 'person_1' },
        appeal: {
          id: 'appeal_1',
          name: 'Spring appeal',
        },
        appealSource: {
          id: 'source_1',
          name: 'Spring email',
        },
      }),
    ]);

    expect(resolvedRow.appealSource?.appeal?.id).toBe('appeal_1');
    expect(buildGiftPayloadFromRow(resolvedRow)).toMatchObject({
      appealId: 'appeal_1',
      appealSourceId: 'source_1',
      fundId: 'fund_1',
    });
  });
});
