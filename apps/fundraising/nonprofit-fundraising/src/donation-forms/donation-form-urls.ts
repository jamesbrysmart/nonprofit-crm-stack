import { RestApiClient } from 'twenty-client-sdk/rest';

// Public donation form URLs follow Twenty's functions base URL
// (TWENTY_FUNCTIONS_URL): the app's public domain where one applies,
// otherwise `<server>/s`. Never hand-build them from the server URL.
const resolveRouteUrl = (path: string, query?: Record<string, string>) =>
  new RestApiClient().resolveUrl(`/s${path}`, query ? { query } : undefined);

export const buildDonationFormEmbedFrameUrl = (publicId: string): string =>
  resolveRouteUrl('/donation-forms/embed-frame', { publicId });

export const buildDonationFormCheckoutSessionUrl = (): string =>
  resolveRouteUrl('/donation-forms/create-elements-checkout-session');
