import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import { buildDonationFormEmbedSnippet } from 'src/donation-forms/build-donation-form-embed-document';
import {
  normalizeDonationFormConfigObject,
  normalizeDonationFormString,
  validatePublishableDonationFormConfig,
} from 'src/donation-forms/donation-form-config';
import { resolveStripeProviderConfigKey } from 'src/donation-forms/donation-form-checkout-stripe';

export type PublishDonationFormRequest = {
  donationFormId?: string;
};

export type PublishDonationFormResponse = {
  donationFormId: string;
  publicId: string;
  publishedVersion: string;
  status: 'LIVE';
  iframeUrl: string;
  embedSnippet: string;
};

type DonationFormRecord = {
  id?: string | null;
  publicId?: string | null;
  status?: string | null;
  paymentProvider?: string | null;
  providerConfigKey?: string | null;
  config?: Record<string, unknown> | null;
};

const normalizeString = normalizeDonationFormString;

const buildPublicId = (): string => `df_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

const buildPublishedVersion = (): string =>
  `pub_${new Date().toISOString()}_${randomUUID().slice(0, 8)}`;

const buildIframeUrl = (publicId: string): string => {
  const baseUrl = process.env.TWENTY_API_URL?.trim();

  if (!baseUrl) {
    throw new Error('TWENTY_API_URL is required to publish donation form embeds');
  }

  const iframeUrl = new URL('/s/donation-forms/embed-frame', baseUrl);
  iframeUrl.searchParams.set('publicId', publicId);

  return iframeUrl.toString();
};

export const loadDonationFormForPublish = async (
  client: CoreApiClient,
  donationFormId: string,
): Promise<DonationFormRecord | null> => {
  const result = await client.query({
    donationForm: {
      __args: {
        filter: {
          id: {
            eq: donationFormId,
          },
        },
      },
      id: true,
      publicId: true,
      status: true,
      paymentProvider: true,
      providerConfigKey: true,
      config: true,
    },
  } as any);

  return (result?.donationForm as DonationFormRecord | null) ?? null;
};

export const publishDonationFormWithClient = async (
  client: CoreApiClient,
  donationFormId: string,
): Promise<PublishDonationFormResponse> => {
  const existing = await loadDonationFormForPublish(client, donationFormId);

  if (!existing?.id) {
    throw new Error('Donation form not found');
  }

  const paymentProvider = normalizeString(existing.paymentProvider);
  if (paymentProvider !== 'STRIPE') {
    throw new Error('Only Stripe donation forms can be published in this spike');
  }

  const providerConfigKey = resolveStripeProviderConfigKey(existing.providerConfigKey);

  const config = normalizeDonationFormConfigObject(existing.config ?? null);
  if (Object.keys(config).length === 0) {
    throw new Error('Donation form config is required before publishing');
  }
  validatePublishableDonationFormConfig(config);

  const publicId = normalizeString(existing.publicId) || buildPublicId();
  const publishedVersion = buildPublishedVersion();
  const publishedAt = new Date().toISOString();

  await client.mutation({
    updateDonationForm: {
      __args: {
        id: donationFormId,
        data: {
          publicId,
          status: 'LIVE',
          providerConfigKey,
          publishedVersion,
          publishedAt,
          publishedConfig: config,
        },
      },
      id: true,
    },
  } as any);

  const iframeUrl = buildIframeUrl(publicId);
  return {
    donationFormId,
    publicId,
    publishedVersion,
    status: 'LIVE',
    iframeUrl,
    embedSnippet: buildDonationFormEmbedSnippet({ iframeUrl }),
  };
};

const handler = async (
  event: RoutePayload<PublishDonationFormRequest>,
): Promise<PublishDonationFormResponse> => {
  const donationFormId = normalizeString(event.body?.donationFormId);

  if (donationFormId === '') {
    throw new Error('Donation form id is required');
  }

  return publishDonationFormWithClient(new CoreApiClient(), donationFormId);
};

export default defineLogicFunction({
  universalIdentifier: '4f3478bf-ae11-493f-9bc6-e87f88b8cc25',
  name: 'publish-donation-form',
  description:
    'Publishes a donation form by freezing the public config snapshot and stamping a published version token.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/publish',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
