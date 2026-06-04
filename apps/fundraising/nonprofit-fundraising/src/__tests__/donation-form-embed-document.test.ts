import { describe, expect, it } from 'vitest';
import { buildDonationFormEmbedDocument } from 'src/donation-forms/build-donation-form-embed-document';
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
    expect(markup).toContain('Minimum £7.00');
  });

  it('keeps Stripe confirmation focused on payment details only', () => {
    const document = buildDonationFormEmbedDocument({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: {
        mode: 'ONE_OFF_AND_MONTHLY',
        currencyCode: 'GBP',
        amountOptions: [1000, 2500, 5000],
        allowCustomAmount: true,
        requireAddress: true,
        collectPhone: true,
      },
    });

    expect(document).toContain("redirect: 'if_required'");
    expect(document).not.toContain('updateBillingAddress');
    expect(document).not.toContain('confirmPayload.billingAddress');
    expect(document).not.toContain('updatePhoneNumber');
    expect(document).not.toContain('confirmPayload.phoneNumber');
    expect(document).toContain('customAmountMajor');
  });

  it('uses an explicit two-step flow for donation details and secure payment', () => {
    const document = buildDonationFormEmbedDocument({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: {
        mode: 'ONE_OFF_AND_MONTHLY',
        currencyCode: 'GBP',
        amountOptions: [1000, 2500, 5000],
        allowCustomAmount: true,
        giftAidEnabled: true,
      },
    });

    expect(document).toContain('Step 1');
    expect(document).toContain('Your donation details');
    expect(document).toContain('Step 2');
    expect(document).toContain('Secure payment');
    expect(document).toContain('id="changeDonationDetailsButton"');
    expect(document).toContain('function showPaymentStep(payload)');
    expect(document).toContain('function showDonationStep()');
    expect(document).toContain('form.hidden = true;');
    expect(document).toContain('form.hidden = false;');
    expect(document).toContain("changeDonationDetailsButton.addEventListener('click'");
  });

  it('clears the hidden amount when a custom amount becomes invalid or empty', () => {
    const document = buildDonationFormEmbedDocument({
      publicId: 'df_public_123',
      publishedVersion: 'pub_test_123',
      config: {
        mode: 'ONE_OFF',
        currencyCode: 'GBP',
        amountOptions: [1000, 2500, 5000],
        allowCustomAmount: true,
      },
    });

    expect(document).toContain('function clearSelectedAmount()');
    expect(document).toContain("amountInput.value = '';");
    expect(document).toContain('if (customMinorUnits === null) {');
    expect(document).toContain('clearSelectedAmount();');
  });
});
