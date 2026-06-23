import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnectionNodes,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import type { GiftStagingLookupRecord } from 'src/stripe/stripe-intake.types';
import { normalizeString } from 'src/stripe/stripe-intake-utils';

const normalizeGiftStagingLookupRecord = (
  record: unknown,
): GiftStagingLookupRecord | null => {
  if (typeof record !== 'object' || record === null) {
    return null;
  }

  const recordObject = record as {
    id?: unknown;
    rawProviderEvidence?: unknown;
  };

  if (typeof recordObject.id !== 'string' || recordObject.id === '') {
    return null;
  }

  return {
    id: recordObject.id,
    rawProviderEvidence:
      recordObject.rawProviderEvidence &&
      typeof recordObject.rawProviderEvidence === 'object' &&
      !Array.isArray(recordObject.rawProviderEvidence)
        ? (recordObject.rawProviderEvidence as Record<string, unknown>)
        : undefined,
  };
};

export const findGiftStagingById = async (
  client: CoreApiClient,
  giftStagingId: string,
): Promise<GiftStagingLookupRecord | null> => {
  const normalized = normalizeString(giftStagingId);

  if (normalized === '') {
    throw new Error('giftStagingId is required');
  }

  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: {
            eq: normalized,
          },
        },
      },
      id: true,
      rawProviderEvidence: true,
    },
  } as any);

  return normalizeGiftStagingLookupRecord(
    extractQueryRecord(result, 'giftStaging'),
  );
};

export const findGiftStagingRecordBySourceFingerprint = async (
  client: CoreApiClient,
  sourceFingerprint: string,
): Promise<GiftStagingLookupRecord | null> => {
  const normalized = normalizeString(sourceFingerprint);

  if (normalized === '') {
    throw new Error('sourceFingerprint is required');
  }

  const result = await client.query({
    giftStagings: {
      __args: {
        first: 1,
        filter: {
          sourceFingerprint: {
            eq: normalized,
          },
        },
      },
      edges: {
        node: {
          id: true,
          rawProviderEvidence: true,
        },
      },
    },
  } as any);

  return normalizeGiftStagingLookupRecord(
    extractConnectionNodes(result, 'giftStagings')[0],
  );
};

export const findGiftStagingRecordByProviderAgreementId = async (
  client: CoreApiClient,
  providerAgreementId: string,
): Promise<GiftStagingLookupRecord | null> => {
  const normalized = normalizeString(providerAgreementId);

  if (normalized === '') {
    throw new Error('providerAgreementId is required');
  }

  const result = await client.query({
    giftStagings: {
      __args: {
        first: 1,
        filter: {
          providerAgreementId: {
            eq: normalized,
          },
        },
      },
      edges: {
        node: {
          id: true,
          rawProviderEvidence: true,
        },
      },
    },
  } as any);

  return normalizeGiftStagingLookupRecord(
    extractConnectionNodes(result, 'giftStagings')[0],
  );
};

export const findGiftStagingBySourceFingerprint = async (
  client: CoreApiClient,
  sourceFingerprint: string,
): Promise<string | null> => {
  const record = await findGiftStagingRecordBySourceFingerprint(
    client,
    sourceFingerprint,
  );

  return record?.id ?? null;
};
