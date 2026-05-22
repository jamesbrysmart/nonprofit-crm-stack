import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { buildDonationFormEmbedDocument } from 'src/donation-forms/build-donation-form-embed-document';

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const handler = async (event: RoutePayload<Record<string, never>>): Promise<string> => {
  const publicId = normalizeString(event.queryStringParameters?.publicId);

  if (publicId === '') {
    throw new Error('Donation form public id is required');
  }

  return buildDonationFormEmbedDocument({ publicId });
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
