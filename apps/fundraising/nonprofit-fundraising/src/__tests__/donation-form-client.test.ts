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
  formToken,
}: {
  config?: DonationFormRenderConfig;
  checkout?: CheckoutReply;
  confirm?: ConfirmReply;
  formToken?: string;
} = {}) => {
  const html = buildDonationFormEmbedDocument({
    publicId: 'df_public_123',
    publishedVersion: 'pub_1',
    config,
    formToken,
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

const choose = (id: string) => {
  const radio = byId<HTMLInputElement>(id);
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
};

const fillDonor = () => {
  type('donorFirstName', 'Ada');
  type('donorLastName', 'Lovelace');
  type('donorEmail', 'ada@example.org');
};

const submit = () => byId<HTMLFormElement>('donationForm').requestSubmit();

const submitAndWaitForPayment = async () => {
  fillDonor();
  submit();
  await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));
};

const sentPayload = (fetchMock: ReturnType<typeof vi.fn>) => {
  const init = fetchMock.mock.calls[0]?.[1] as { body?: string } | undefined;

  return JSON.parse(init?.body ?? 'null') as Record<string, unknown>;
};

describe('donation form client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('choosing an amount', () => {
    it('starts on the first preset amount and follows the selected radio', () => {
      renderDonationForm();

      expect(byId<HTMLInputElement>('amountOption0').checked).toBe(true);
      expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('1000');

      choose('amountOption1');

      expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('2500');
    });

    it('uses a custom amount instead of the presets', () => {
      renderDonationForm();

      type('customAmountMajor', '£12.50');

      expect(byId<HTMLInputElement>('amountMinorUnits').value).toBe('1250');
      expect(
        document.querySelectorAll('input[name="amountOption"]:checked'),
      ).toHaveLength(0);
    });

    it('asks for at least the minimum custom amount', () => {
      const { fetchMock } = renderDonationForm();
      fillDonor();
      type('customAmountMajor', '2');

      submit();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(byId('amount-error').textContent).toBe(
        'Enter an amount of at least £5.00',
      );
      expect(byId('customAmountMajor').getAttribute('aria-invalid')).toBe('true');
    });

    it('relabels the amount for monthly giving', () => {
      renderDonationForm();

      choose('donationTypeRECURRING');

      expect(byId('amountLabel').textContent).toBe('Choose your monthly amount');
    });
  });

  describe('checking the details', () => {
    it('lists every problem in a summary that takes focus', () => {
      const { fetchMock } = renderDonationForm();

      submit();

      expect(fetchMock).not.toHaveBeenCalled();
      expect(byId('errorSummary').hidden).toBe(false);
      expect(document.activeElement).toBe(byId('errorSummary'));
      const messages = Array.from(
        byId('errorSummaryList').querySelectorAll('a'),
      ).map((link) => link.textContent);
      expect(messages).toEqual([
        'Enter your first name',
        'Enter your last name',
        'Enter your email address',
      ]);
      expect(byId('donorFirstName-error').textContent).toBe(
        'Enter your first name',
      );
      expect(byId('donorFirstName').getAttribute('aria-invalid')).toBe('true');
    });

    it('moves focus to the field from the summary link', () => {
      renderDonationForm();
      submit();

      byId('errorSummaryList').querySelector('a')?.click();

      expect(document.activeElement).toBe(byId('donorFirstName'));
    });

    it('clears a field error once the donor edits the field', () => {
      renderDonationForm();
      submit();

      type('donorFirstName', 'Ada');

      expect(byId('donorFirstName-error').hidden).toBe(true);
      expect(byId('donorFirstName').hasAttribute('aria-invalid')).toBe(false);
    });

    it.each(['ada.example.org', 'ada@gmailcom'])(
      'checks the email format of %s',
      (email) => {
        renderDonationForm();
        fillDonor();
        type('donorEmail', email);

        submit();

        expect(byId('donorEmail-error').textContent).toBe(
          'Enter an email address like name@example.com',
        );
      },
    );

    it('shows and requires the home address when Gift Aid is ticked', () => {
      renderDonationForm();
      const giftAid = byId<HTMLInputElement>('giftAidRequested');
      expect(byId('addressSection').hidden).toBe(true);

      giftAid.checked = true;
      giftAid.dispatchEvent(new Event('change'));
      fillDonor();
      submit();

      expect(byId('addressSection').hidden).toBe(false);
      expect(byId<HTMLInputElement>('addressStreet1').required).toBe(true);
      expect(byId('addressPostcode-error').textContent).toBe(
        'Enter your postcode',
      );
    });
  });

  describe('starting the payment', () => {
    it('creates the checkout session and moves focus to the payment step', async () => {
      const { fetchMock, mountMock, stripeMock } = renderDonationForm({
        formToken: 'token-1',
      });

      await submitAndWaitForPayment();

      expect(fetchMock).toHaveBeenCalledWith(
        '/s/donation-forms/create-elements-checkout-session',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(sentPayload(fetchMock)).toMatchObject({
        publicId: 'df_public_123',
        formToken: 'token-1',
        contactReference: '',
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
      expect(document.activeElement).toBe(byId('paymentHeading'));
      expect(byId('confirmPaymentButton').textContent).toBe('Donate £25.00');
      expect(byId('donationSummary').textContent).toContain('Ada Lovelace');
    });

    it('labels a monthly payment', async () => {
      renderDonationForm();
      choose('donationTypeRECURRING');

      await submitAndWaitForPayment();

      expect(byId('confirmPaymentButton').textContent).toBe(
        'Donate £25.00 monthly',
      );
    });

    it('shows donor wording for a refused submission and allows a retry', async () => {
      renderDonationForm({
        checkout: { ok: false, body: { code: 'INVALID_AMOUNT' } },
      });
      fillDonor();
      submit();

      await vi.waitFor(() => expect(byId('errorPanel').hidden).toBe(false));
      expect(byId('errorPanel').textContent).toBe(
        'Please choose a different amount and try again.',
      );
      expect(document.activeElement).toBe(byId('errorPanel'));
      expect(byId<HTMLButtonElement>('submitButton').disabled).toBe(false);
    });

    it('offers a reload when the form has expired', async () => {
      renderDonationForm({
        checkout: { ok: false, body: { code: 'FORM_EXPIRED' } },
      });
      fillDonor();
      submit();

      await vi.waitFor(() => expect(byId('errorPanel').hidden).toBe(false));
      expect(byId('errorPanel').querySelector('button')?.textContent).toBe(
        'Reload the form',
      );
    });

    it('shows a general message when the server fails without a code', async () => {
      renderDonationForm({ checkout: { ok: false, body: null } });
      fillDonor();
      submit();

      await vi.waitFor(() =>
        expect(byId('errorPanel').textContent).toContain(
          'You have not been charged',
        ),
      );
    });

    it('ignores a second submit while the first is in flight', async () => {
      const { fetchMock } = renderDonationForm();
      fillDonor();

      submit();
      submit();

      await vi.waitFor(() => expect(byId('paymentPanel').hidden).toBe(false));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirming the payment', () => {
    it('confirms without redirecting and focuses the thank-you', async () => {
      const { confirmMock } = renderDonationForm();
      await submitAndWaitForPayment();

      byId('confirmPaymentButton').click();

      await vi.waitFor(() => expect(byId('successPanel').hidden).toBe(false));
      expect(confirmMock).toHaveBeenCalledWith({ redirect: 'if_required' });
      expect(document.activeElement).toBe(byId('thankYouHeading'));
      expect(byId('thankYouStatus').textContent).toBe(
        'We have received your donation.',
      );
    });

    it("shows Stripe's decline message and keeps the payment step open", async () => {
      renderDonationForm({
        confirm: { type: 'error', error: { message: 'Your card was declined.' } },
      });
      await submitAndWaitForPayment();

      byId('confirmPaymentButton').click();

      await vi.waitFor(() =>
        expect(byId('paymentErrorPanel').textContent).toBe(
          'Your card was declined.',
        ),
      );
      expect(document.activeElement).toBe(byId('paymentErrorPanel'));
      expect(byId<HTMLButtonElement>('confirmPaymentButton').disabled).toBe(false);
      expect(byId('successPanel').hidden).toBe(true);
    });

    it('returns to the details with entries kept and focus on the heading', async () => {
      renderDonationForm();
      await submitAndWaitForPayment();

      byId('changeDonationDetailsButton').click();

      expect(byId('donationForm').hidden).toBe(false);
      expect(byId('paymentPanel').hidden).toBe(true);
      expect(byId<HTMLInputElement>('donorEmail').value).toBe('ada@example.org');
      expect(document.activeElement).toBe(byId('detailsHeading'));
    });
  });

  describe('embedding', () => {
    it('tells the host page its height and when to scroll it into view', async () => {
      const postMessage = vi.fn();
      vi.spyOn(window, 'parent', 'get').mockReturnValue({
        postMessage,
      } as unknown as Window);

      renderDonationForm();
      await submitAndWaitForPayment();

      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'nonprofit-fundraising:donation-form-resize',
          scrollIntoView: true,
        }),
        '*',
      );
      expect(postMessage.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ height: expect.any(Number) }),
      );
    });

    it('leaves the hidden anti-spam field out of the tab order and accessibility tree', () => {
      renderDonationForm();
      const field = byId<HTMLInputElement>('nfContactReference');

      expect(field.tabIndex).toBe(-1);
      expect(field.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });
});
