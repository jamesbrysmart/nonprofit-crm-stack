import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnectionNodes,
  extractMutationRecord,
} from 'src/core-api/core-api-results';
import {
  normalizeDonationFormPublishedConfig,
} from './donation-form-config';
import { resolveStripeProviderConfigKey } from './donation-form-checkout-stripe';
import type { PublishedDonationFormForCheckout } from './donation-form-checkout.types';
import { normalizeString } from 'src/utils/normalize-string';
import { DonationFormSubmissionError } from 'src/donation-forms/donation-form-submission-error';

type DonationFormPublicRecord = {
  id?: string | null;
  publicId?: string | null;
  status?: string | null;
  publishedVersion?: string | null;
  paymentProvider?: string | null;
  providerConfigKey?: string | null;
  publishedConfig?: Record<string, unknown> | null;
};

export const loadPublishedDonationFormForCheckout = async (
  client: CoreApiClient,
  publicId: string,
): Promise<PublishedDonationFormForCheckout> => {
  // The list query returns no rows for an unknown form; the single-record
  // query throws "Record not found" instead.
  const result = await client.query({
    donationForms: {
      __args: {
        first: 1,
        filter: { publicId: { eq: publicId } },
      },
      edges: {
        node: {
          id: true,
          publicId: true,
          status: true,
          publishedVersion: true,
          paymentProvider: true,
          providerConfigKey: true,
          publishedConfig: true,
        },
      },
    },
  });

  const record =
    extractConnectionNodes<DonationFormPublicRecord>(result, 'donationForms')[0] ??
    null;

  if (!record?.id) {
    throw new DonationFormSubmissionError('FORM_UNAVAILABLE', 'Published donation form not found');
  }

  if (normalizeString(record.status) !== 'LIVE') {
    throw new DonationFormSubmissionError('FORM_UNAVAILABLE', 'Donation form is not live');
  }

  const persistedPublicId = normalizeString(record.publicId);
  if (persistedPublicId === '') {
    throw new Error('Donation form is missing a public id');
  }

  if (normalizeString(record.paymentProvider) !== 'STRIPE') {
    throw new Error('Only Stripe donation forms are supported');
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
  });

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
  });
};
