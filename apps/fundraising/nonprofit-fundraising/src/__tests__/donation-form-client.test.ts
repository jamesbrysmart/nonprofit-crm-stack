// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDonationFormEmbedDocument } from 'src/donation-forms/build-donation-form-embed-document';
import type { DonationFormRenderConfig } from 'src/donation-forms/donation-form-rendering';
import { DONATION_FORM_CLIENT_SCRIPT } from 'src/donation-forms/embed-client/donation-form-client-script.generated';

type CheckoutReply = { ok: boolean; body: unknown };
type ConfirmReply =
  | { type: 'success' }
  | { type: 'error'; error?: { message?: string } };

const DEFAULT_CONFIG: DonationFormRenderConfig = {
  title: 'Winter appeal',
  mode: 'ONE_OFF_AND_MONTHLY',
  currencyCode: 'GBP',
  amountOptions: [1000, 2500, 5000],
  allowCustomAmount: true,
  minimumAmount: 500,
  giftAidEnabled: true,
};

const SUCCESSFUL_CHECKOUT: CheckoutReply = {
  ok: true,
  body: {
    checkoutSessionClientSecret: 'cs_secret',
    publishableKey: 'pk_test',
    giftStagingId: 'staging-1',
  },
};

// Loads the real embed page and runs the generated client script, as a donor's
// browser would, with Stripe.js and the checkout route stubbed.
const renderDonationForm = ({
  config = DEFAULT_CONFIG,
  checkout = SUCCESSFUL_CHECKOUT,
  confirm = { type: 'success' },
}: {
  config?: DonationFormRenderConfig;
  checkout?: CheckoutReply;
  confirm?: ConfirmReply;
} = {}) => {
  const html = buildDonationFormEmbedDocument({
    publicId: 'df_public_123',
    publishedVersion: 'pub_1',
    config,
  });

  document.open();
  document.write(html);
  document.close();

  const fetchMock = vi.fn(async () => ({
    ok: checkout.ok,
    json: async () => checkout.body,
  }));
  const confirmMock = vi.fn(async () => confirm);
  const mountMock = vi.fn();
  const stripeMock = vi.fn(() => ({
    initCheckoutElementsSdk: () => ({
      createPaymentElement: () => ({ mount: mountMock }),
      loadActions: async () => ({
        type: 'success' as const,
        actions: {
          getSession: () => ({ total: { total: { amount: 2500 } } }),
          confirm: confirmMock,
        },
      }),
    }),
  }));

  Object.assign(window, { fetch: fetchMock, Stripe: stripeMock });
  new Function(DONATION_FORM_CLIENT_SCRIPT)();

  return { fetchMock, confirmMock, mountMock, stripeMock };
};

const byId = <TElement extends HTMLElement = HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`#${id} not found`);
  }

  return element as TElement;
};

const type = (id: string, value: string) => {
  const input = byId<HTMLInputElement>(id);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const fillDonor = () => {
  type('donorFirstName', 'Ada');
  type('donorLastName', 'Lovelace');
  type('donorEmail', 'ada@example.org');
};

const submit = () => byId<HTMLFormElement>('donationForm').requestSubmit();

const sentPayload = (fetchMock: ReturnType<typeof vi.fn>) => {
  const init = fetchMock.mock.calls[0]?.[1] as { body?: string } | undefined;

  return JSON.parse(init?.body ?? 'null') as Record<string, unknown>;
};

describe('donation form client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with the first preset amount and switches on selection', () => {
    renderDonationForm();
    const amountButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-amount]'),
    );

    expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('1000');

    amountButtons[1]?.click();

    expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('2500');
    expect(amountButtons[1]?.classList.contains('is-selected')).toBe(true);
    expect(amountButtons[0]?.classList.contains('is-selected')).toBe(false);
  });

  it('uses a valid custom amount and clears the amount when it becomes invalid', () => {
    renderDonationForm();

    type('customAmountMajor', '12.34');
    expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('1234');
    expect(document.querySelectorAll('[data-amount].is-selected')).toHaveLength(0);

    type('customAmountMajor', '1.234');
    expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('');
  });

  it('relabels the form for monthly giving', () => {
    renderDonationForm();

    byId('donationTypeOptions')
      .querySelector<HTMLButtonElement>('[data-donation-type="RECURRING"]')
      ?.click();

    expect(byId('amountLabel').textContent).toBe('Choose your monthly amount');
    expect(byId('submitButton').textContent).toBe(
      'Continue to secure monthly payment',
    );
  });

  it('shows and requires the home address when Gift Aid is ticked', () => {
    renderDonationForm();
    const giftAid = byId<HTMLInputElement>('giftAidRequested');

    expect(byId('addressSection').hidden).toBe(true);

    giftAid.checked = true;
    giftAid.dispatchEvent(new Event('change'));

    expect(byId('addressSection').hidden).toBe(false);
    expect(byId<HTMLInputElement>('addressStreet1').required).toBe(true);
    expect(byId<HTMLInputElement>('addressPostcode').required).toBe(true);
  });

  it('creates the checkout session and moves to the payment step', async () => {
    const { fetchMock, mountMock, stripeMock } = renderDonationForm();
    fillDonor();
    submit();

    await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));

    expect(fetchMock).toHaveBeenCalledWith(
      '/s/donation-forms/create-elements-checkout-session',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(sentPayload(fetchMock)).toMatchObject({
      publicId: 'df_public_123',
      donationType: 'ONE_OFF',
      amountMinorUnits: 1000,
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada@example.org',
      giftAidRequested: false,
    });
    expect(stripeMock).toHaveBeenCalledWith('pk_test');
    expect(mountMock).toHaveBeenCalledWith('#payment-element');
    expect(byId('donationForm').hidden).toBe(true);
    expect(byId('paymentSummary').textContent).toContain('£25.00');
  });

  it('shows the server error and lets the donor try again', async () => {
    renderDonationForm({
      checkout: {
        ok: false,
        body: { message: 'Donation amount is not allowed' },
      },
    });
    fillDonor();
    submit();

    await vi.waitFor(() =>
      expect(byId('errorPanel').textContent).toContain(
        'Donation amount is not allowed',
      ),
    );
    expect(byId<HTMLButtonElement>('submitButton').disabled).toBe(false);
    expect(byId('paymentPanel').hidden).toBe(true);
  });

  it('confirms payment without redirecting and shows the thank-you', async () => {
    const { confirmMock } = renderDonationForm();
    fillDonor();
    submit();
    await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));

    byId('confirmPaymentButton').click();

    await vi.waitFor(() => expect(byId('successPanel').hidden).toBe(false));
    expect(confirmMock).toHaveBeenCalledWith({ redirect: 'if_required' });
  });

  it('shows a declined payment and keeps the payment step open', async () => {
    renderDonationForm({
      confirm: { type: 'error', error: { message: 'Your card was declined.' } },
    });
    fillDonor();
    submit();
    await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));

    byId('confirmPaymentButton').click();

    await vi.waitFor(() =>
      expect(byId('paymentErrorPanel').textContent).toContain(
        'Your card was declined.',
      ),
    );
    expect(byId<HTMLButtonElement>('confirmPaymentButton').disabled).toBe(false);
    expect(byId('successPanel').hidden).toBe(true);
  });

  it('returns to the donation details with entries kept', async () => {
    renderDonationForm();
    fillDonor();
    submit();
    await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));

    byId('changeDonationDetailsButton').click();

    expect(byId('donationForm').hidden).toBe(false);
    expect(byId('paymentPanel').hidden).toBe(true);
    expect(byId<HTMLInputElement>('donorEmail').value).toBe('ada@example.org');
  });
});
