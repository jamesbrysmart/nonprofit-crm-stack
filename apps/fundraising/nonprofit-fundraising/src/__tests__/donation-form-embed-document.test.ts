import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildDonationFormEmbedDocument,
  serializeForInlineScript,
} from 'src/donation-forms/build-donation-form-embed-document';

describe('donation form embed runtime', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://crm.example.test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps admin-entered text from breaking out of the inline script', () => {
    const hostile = '</script><script>alert(1)</script><!--';
    const document = buildDonationFormEmbedDocument({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: {
        mode: 'ONE_OFF',
        currencyCode: 'GBP',
        amountOptions: [1000],
        title: hostile,
        description: hostile,
        thankYouMessage: hostile,
        giftAidTextVersion: hostile,
      },
    });

    expect(document).not.toContain('<script>alert(1)');
    expect(document).not.toContain('<!--');
    // Only the Stripe loader, the data block and the client script.
    expect(document.match(/<script\b/g)).toHaveLength(3);
    expect(document.match(/<\/script>/g)).toHaveLength(3);

    const bootstrapBlock = /<script type="application\/json" id="donation-form-bootstrap">([^<]*)<\/script>/.exec(
      document,
    );
    expect(bootstrapBlock).not.toBeNull();
    const bootstrap = JSON.parse(bootstrapBlock?.[1] ?? '') as {
      config: Record<string, unknown>;
    };
    expect(bootstrap.config.thankYouMessage).toBe(hostile);
  });

  it('serializes values for inline scripts without changing their meaning', () => {
    const value = { text: 'a<b>&c\u2028\u2029', amounts: [1, 2] };
    const serialized = serializeForInlineScript(value);

    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(serialized)).toEqual(value);
  });
});
