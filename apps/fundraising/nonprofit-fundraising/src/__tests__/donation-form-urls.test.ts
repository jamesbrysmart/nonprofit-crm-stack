import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildDonationFormCheckoutSessionUrl,
  buildDonationFormEmbedFrameUrl,
} from 'src/donation-forms/donation-form-urls';

describe('donation form URLs', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('use the functions URL Twenty injects, such as an isolated public domain', () => {
    vi.stubEnv('TWENTY_API_URL', 'https://crm.example.test');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://donate.charity.example/');

    expect(buildDonationFormEmbedFrameUrl('df_1')).toBe(
      'https://donate.charity.example/donation-forms/embed-frame?publicId=df_1',
    );
    expect(buildDonationFormCheckoutSessionUrl()).toBe(
      'https://donate.charity.example/donation-forms/create-elements-checkout-session',
    );
  });

  it('fall back to the server /s routes when no functions URL is set', () => {
    vi.stubEnv('TWENTY_API_URL', 'http://localhost:2021');
    vi.stubEnv('TWENTY_FUNCTIONS_URL', '');

    expect(buildDonationFormEmbedFrameUrl('df_1')).toBe(
      'http://localhost:2021/s/donation-forms/embed-frame?publicId=df_1',
    );
  });
});
