import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  buildDonationFormEmbedDocument,
} from 'src/donation-forms/build-donation-form-embed-document';
import { buildDonationFormStaticDocument } from 'src/donation-forms/donation-form-rendering';
import { loadPublicDonationFormConfigWithClient } from 'src/logic-functions/get-public-donation-form-config';
import {
  createDonationFormToken,
  readDonationFormTokenSecret,
} from 'src/donation-forms/donation-form-submission-guard';
import { normalizeString } from 'src/utils/normalize-string';
import { createCoreApiClient } from 'src/core-api/rate-limit-retry';

// Twenty serves a bare string route result as text/plain, so the page must declare HTML.
// no-store: each page carries a freshly signed submission token.
const htmlResponse = (document: string) =>
  new Response(document, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const issueFormToken = (publicId: string): string | undefined => {
  const secret = readDonationFormTokenSecret();

  return secret === ''
    ? undefined
    : createDonationFormToken({ secret, publicId, now: new Date() });
};

export const donationFormEmbedFrameHandler = async (
  event: RoutePayload<Record<string, never>>,
): Promise<Response> => {
  const publicId = normalizeString(event.queryStringParameters?.publicId);

  if (publicId === '') {
    throw new Error('Donation form public id is required');
  }

  const payload = await loadPublicDonationFormConfigWithClient(
    createCoreApiClient(),
    publicId,
  );

  if (!payload.ok) {
    return htmlResponse(
      buildDonationFormStaticDocument({
        cardMarkup:
          '<h1>Form unavailable</h1>' +
          '<p>This donation form is not currently available.</p>',
      }),
    );
  }

  return htmlResponse(
    buildDonationFormEmbedDocument({
      publicId: payload.publicId,
      publishedVersion: payload.publishedVersion,
      config: payload.config,
      formToken: issueFormToken(payload.publicId),
    }),
  );
};

export default defineLogicFunction({
  universalIdentifier: '14966e59-0ba2-4f2c-9694-e2da73fef72d',
  name: 'get-donation-form-embed-frame',
  description:
    'Returns the embeddable donation form iframe document for a published donation form.',
  timeoutSeconds: 10,
  handler: donationFormEmbedFrameHandler,
  httpRouteTriggerSettings: {
    path: '/donation-forms/embed-frame',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
