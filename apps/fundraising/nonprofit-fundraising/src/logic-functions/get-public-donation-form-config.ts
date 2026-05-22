import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

export type PublicDonationFormConfigResponse =
  | {
      ok: true;
      donationFormId: string;
      publicId: string;
      publishedVersion: string;
      paymentProvider: 'STRIPE';
      config: Record<string, unknown>;
    }
  | {
      ok: false;
      reason:
        | 'missing_public_id'
        | 'not_found'
        | 'not_live'
        | 'missing_published_version'
        | 'missing_published_config';
    };

type DonationFormPublicRecord = {
  id?: string | null;
  publicId?: string | null;
  status?: string | null;
  publishedVersion?: string | null;
  paymentProvider?: string | null;
  publishedConfig?: Record<string, unknown> | null;
};

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

export const loadPublicDonationFormConfigWithClient = async (
  client: CoreApiClient,
  publicId: string,
): Promise<PublicDonationFormConfigResponse> => {
  const normalizedPublicId = normalizeString(publicId);
  if (normalizedPublicId === '') {
    return { ok: false, reason: 'missing_public_id' };
  }

  const result = await client.query({
    donationForm: {
      __args: {
        filter: {
          publicId: {
            eq: normalizedPublicId,
          },
        },
      },
      id: true,
      publicId: true,
      status: true,
      publishedVersion: true,
      paymentProvider: true,
      publishedConfig: true,
    },
  } as any);

  const record = (result?.donationForm as DonationFormPublicRecord | null) ?? null;
  if (!record?.id) {
    return { ok: false, reason: 'not_found' };
  }

  if (normalizeString(record.status) !== 'LIVE') {
    return { ok: false, reason: 'not_live' };
  }

  const publishedVersion = normalizeString(record.publishedVersion);
  if (publishedVersion === '') {
    return { ok: false, reason: 'missing_published_version' };
  }

  const publishedConfig =
    record.publishedConfig &&
    typeof record.publishedConfig === 'object' &&
    !Array.isArray(record.publishedConfig)
      ? record.publishedConfig
      : null;

  if (!publishedConfig) {
    return { ok: false, reason: 'missing_published_config' };
  }

  return {
    ok: true,
    donationFormId: record.id,
    publicId: normalizeString(record.publicId),
    publishedVersion,
    paymentProvider: 'STRIPE',
    config: publishedConfig,
  };
};

const handler = async (
  event: RoutePayload<Record<string, never>>,
): Promise<PublicDonationFormConfigResponse> => {
  const publicId = normalizeString(event.queryStringParameters?.publicId);

  return loadPublicDonationFormConfigWithClient(new CoreApiClient(), publicId);
};

export default defineLogicFunction({
  universalIdentifier: '005b87bd-e4d6-4bf6-8350-9170d28b43ec',
  name: 'get-public-donation-form-config',
  description:
    'Returns the published public-safe configuration for a live donation form identified by its public id.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/public-config',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
