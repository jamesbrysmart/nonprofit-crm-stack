import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractMutationRecord,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import {
  normalizeDonationFormPublishedConfig,
  normalizeDonationFormString,
} from './donation-form-config';
import { resolveStripeProviderConfigKey } from './donation-form-checkout-stripe';
import type { PublishedDonationFormForCheckout } from './donation-form-checkout.types';

type DonationFormPublicRecord = {
  id?: string | null;
  publicId?: string | null;
  status?: string | null;
  publishedVersion?: string | null;
  paymentProvider?: string | null;
  providerConfigKey?: string | null;
  publishedConfig?: Record<string, unknown> | null;
};

const normalizeString = normalizeDonationFormString;

export const loadPublishedDonationFormForCheckout = async (
  client: CoreApiClient,
  publicId: string,
): Promise<PublishedDonationFormForCheckout> => {
  const result = await client.query({
    donationForm: {
      __args: {
        filter: {
          publicId: {
            eq: publicId,
          },
        },
      },
      id: true,
      publicId: true,
      status: true,
      publishedVersion: true,
      paymentProvider: true,
      providerConfigKey: true,
      publishedConfig: true,
    },
  } as any);

  const record =
    extractQueryRecord<DonationFormPublicRecord>(result, 'donationForm') ?? null;

  if (!record?.id) {
    throw new Error('Published donation form not found');
  }

  if (normalizeString(record.status) !== 'LIVE') {
    throw new Error('Donation form is not live');
  }

  const persistedPublicId = normalizeString(record.publicId);
  if (persistedPublicId === '') {
    throw new Error('Donation form is missing a public id');
  }

  if (normalizeString(record.paymentProvider) !== 'STRIPE') {
    throw new Error('Only Stripe donation forms are supported in this spike');
  }

  const publishedVersion = normalizeString(record.publishedVersion);
  if (publishedVersion === '') {
    throw new Error('Donation form is missing a published version');
  }

  const providerConfigKey = resolveStripeProviderConfigKey(record.providerConfigKey);

  const config = normalizeDonationFormPublishedConfig(
    record.publishedConfig ?? null,
  );
  if (!config) {
    throw new Error('Donation form is missing published config');
  }

  return {
    donationFormId: record.id,
    publicId: persistedPublicId,
    publishedVersion,
    providerConfigKey,
    config,
  };
};

export const createGiftStagingRow = async ({
  client,
  input,
}: {
  client: CoreApiClient;
  input: Record<string, unknown>;
}): Promise<string> => {
  const result = await client.mutation({
    createGiftStaging: {
      __args: {
        data: input,
      },
      id: true,
    },
  } as any);

  const giftStagingId = extractMutationRecord<{ id?: string | null }>(
    result,
    'createGiftStaging',
  )?.id;
  if (typeof giftStagingId !== 'string' || giftStagingId.trim() === '') {
    throw new Error('Create gift staging response missing id');
  }

  return giftStagingId.trim();
};

export const updateGiftStagingRow = async ({
  client,
  giftStagingId,
  data,
}: {
  client: CoreApiClient;
  giftStagingId: string;
  data: Record<string, unknown>;
}): Promise<void> => {
  await client.mutation({
    updateGiftStaging: {
      __args: {
        id: giftStagingId,
        data,
      },
      id: true,
    },
  } as any);
};
