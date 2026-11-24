import { describe, expect, it } from 'vitest';
import {
  buildDonationFormEmbedDocument,
  serializeForInlineScript,
} from 'src/donation-forms/build-donation-form-embed-document';
import { buildDonationFormCardMarkup } from 'src/donation-forms/donation-form-rendering';

describe('donation form embed runtime', () => {
  it('renders a custom amount input when enabled in the published config', () => {
    const markup = buildDonationFormCardMarkup({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: {
        mode: 'ONE_OFF',
        currencyCode: 'GBP',
        amountOptions: [1000, 2500, 5000],
        allowCustomAmount: true,
        minimumAmount: 700,
      },
    });

    expect(markup).toContain('id="customAmountMajor"');
    expect(markup).toContain('(minimum £7.00)');
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

  it('shows no development wording to donors', () => {
    const markup = buildDonationFormCardMarkup({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: { mode: 'ONE_OFF', currencyCode: 'GBP', amountOptions: [1000] },
    });

    expect(markup.toLowerCase()).not.toContain('spike');
    expect(markup).toContain('<h1>Donation form</h1>');
  });
});
