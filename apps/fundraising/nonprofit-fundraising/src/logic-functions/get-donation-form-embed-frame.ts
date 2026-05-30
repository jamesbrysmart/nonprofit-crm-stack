import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  buildDonationFormEmbedDocument,
} from 'src/donation-forms/build-donation-form-embed-document';
import { buildDonationFormStaticDocument } from 'src/donation-forms/donation-form-rendering';
import { loadPublicDonationFormConfigWithClient } from 'src/logic-functions/get-public-donation-form-config';

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const handler = async (event: RoutePayload<Record<string, never>>): Promise<string> => {
  const publicId = normalizeString(event.queryStringParameters?.publicId);

  if (publicId === '') {
    throw new Error('Donation form public id is required');
  }

  const payload = await loadPublicDonationFormConfigWithClient(
    new CoreApiClient(),
    publicId,
  );

  if (!payload.ok) {
    return buildDonationFormStaticDocument({
      cardMarkup:
        '<div class="eyebrow">Donation form spike</div>' +
        '<h1>Form unavailable</h1>' +
        '<p>This donation form is not currently available.</p>',
    });
  }

  return buildDonationFormEmbedDocument({
    publicId: payload.publicId,
    publishedVersion: payload.publishedVersion,
    config: payload.config,
  });
};

export default defineLogicFunction({
  universalIdentifier: '14966e59-0ba2-4f2c-9694-e2da73fef72d',
  name: 'get-donation-form-embed-frame',
  description:
    'Returns the embeddable donation form iframe document for a published donation form.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/embed-frame',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
