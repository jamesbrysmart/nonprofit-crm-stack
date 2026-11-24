import {
  DONATION_FORM_BOOTSTRAP_ELEMENT_ID,
  type DonationFormClientBootstrap,
  type StripeCheckoutActions,
  type StripeFactory,
} from 'src/donation-forms/embed-client/donation-form-client.types';

const CHECKOUT_SESSION_PATH =
  '/s/donation-forms/create-elements-checkout-session';

const ADDRESS_FIELD_IDS = [
  'addressStreet1',
  'addressCity',
  'addressPostcode',
  'addressCountry',
] as const;

type CheckoutSessionResponse = {
  checkoutSessionClientSecret?: string;
  publishableKey?: string;
  giftStagingId?: string;
  message?: string;
  error?: string;
};

type DonationPayload = {
  publicId: string;
  donationType: string;
  amountMinorUnits: number;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
  donorMailingAddress: Record<string, string> | undefined;
  giftAidRequested: boolean;
  supporterEmailOptOut: boolean;
  attribution: {
    referrer: string | undefined;
    embedContext: { surface: 'iframe' };
  };
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected error occurred.';

export const parseMajorUnitsToMinorUnits = (value: string): number | null => {
  const normalized = value.trim();
  if (normalized === '') {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const minorUnits = Math.round(amount * 100);
  if (Math.abs(minorUnits / 100 - amount) > 0.000001) {
    return null;
  }

  return minorUnits;
};

const requireElement = <TElement extends HTMLElement>(
  doc: Document,
  id: string,
): TElement => {
  const element = doc.getElementById(id);
  if (!element) {
    throw new Error(`Donation form element #${id} is missing`);
  }

  return element as TElement;
};

export const startDonationForm = ({
  bootstrap,
  doc,
  win,
}: {
  bootstrap: DonationFormClientBootstrap;
  doc: Document;
  win: Window & { Stripe?: StripeFactory; fetch: typeof fetch };
}): void => {
  const { config } = bootstrap;
  const currencyCode =
    typeof config.currencyCode === 'string' ? config.currencyCode : 'GBP';
  let donationType: string = bootstrap.donationTypeOptions[0] ?? 'ONE_OFF';

  const form = requireElement<HTMLFormElement>(doc, 'donationForm');
  const amountInput = requireElement<HTMLInputElement>(doc, 'amountMinorUnits');
  const status = requireElement(doc, 'status');
  const errorPanel = requireElement(doc, 'errorPanel');
  const submitButton = requireElement<HTMLButtonElement>(doc, 'submitButton');
  const paymentPanel = requireElement(doc, 'paymentPanel');
  const paymentSummary = requireElement(doc, 'paymentSummary');
  const paymentErrorPanel = requireElement(doc, 'paymentErrorPanel');
  const confirmPaymentButton = requireElement<HTMLButtonElement>(
    doc,
    'confirmPaymentButton',
  );
  const paymentStatus = requireElement(doc, 'paymentStatus');

  const donationTypeButtons = Array.from(
    doc.querySelectorAll<HTMLElement>('[data-donation-type]'),
  );
  const amountButtons = Array.from(
    doc.querySelectorAll<HTMLElement>('[data-amount]'),
  );
  const customAmountInput = doc.getElementById(
    'customAmountMajor',
  ) as HTMLInputElement | null;
  const amountLabelElement = doc.getElementById('amountLabel');
  const successPanel = doc.getElementById('successPanel');
  const thankYouStatus = doc.getElementById('thankYouStatus');
  const paymentHintElement = doc.getElementById('paymentHint');
  const donationSummary = doc.getElementById('donationSummary');
  const changeDonationDetailsButton = doc.getElementById(
    'changeDonationDetailsButton',
  );
  const giftAidRequestedInput = doc.getElementById(
    'giftAidRequested',
  ) as HTMLInputElement | null;
  const addressSection = doc.getElementById('addressSection');
  const addressHint = doc.getElementById('addressHint');

  let activePaymentActions: StripeCheckoutActions | null = null;
  let lastGiftStagingId: string | null = null;

  const isRecurring = () => donationType === 'RECURRING';

  const formatCurrencyAmount = (amountMinorUnits: number): string =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(amountMinorUnits / 100);

  const valueOf = (id: string): string => {
    const element = doc.getElementById(id) as HTMLInputElement | null;

    return element && typeof element.value === 'string'
      ? element.value.trim()
      : '';
  };

  const isChecked = (id: string): boolean =>
    (doc.getElementById(id) as HTMLInputElement | null)?.checked === true;

  const refreshDonationTypeLabels = () => {
    if (amountLabelElement) {
      amountLabelElement.textContent = isRecurring()
        ? 'Choose your monthly amount'
        : 'Choose an amount';
    }

    if (paymentHintElement) {
      paymentHintElement.textContent = isRecurring()
        ? 'Card details stay inside the donation form. Stripe only owns the secure monthly payment fields.'
        : 'Card payment stays inside the donation form. Stripe only owns the secure payment fields.';
    }

    submitButton.textContent = isRecurring()
      ? 'Continue to secure monthly payment'
      : 'Continue to secure payment';

    confirmPaymentButton.textContent = isRecurring()
      ? 'Confirm monthly donation'
      : 'Confirm donation';
  };

  const syncAddressRequirements = () => {
    const giftAidRequested = giftAidRequestedInput?.checked === true;
    const requiresAddress = config.requireAddress === true || giftAidRequested;

    if (addressSection && config.requireAddress !== true) {
      addressSection.hidden = !requiresAddress;
    }

    for (const fieldId of ADDRESS_FIELD_IDS) {
      const field = doc.getElementById(fieldId);
      if (!field) {
        continue;
      }

      if (requiresAddress) {
        field.setAttribute('required', 'required');
      } else {
        field.removeAttribute('required');
      }
    }

    if (addressHint) {
      addressHint.textContent =
        config.requireAddress === true
          ? 'This donation form requires the donor home address.'
          : giftAidRequested
            ? 'Gift Aid needs your home address so the declaration can be recorded credibly for HMRC.'
            : 'If you add Gift Aid, we need your home address so the declaration can be recorded credibly for HMRC.';
    }
  };

  const setSelectedAmountButton = (selectedButton: HTMLElement | null) => {
    for (const candidate of amountButtons) {
      candidate.classList.toggle('is-selected', candidate === selectedButton);
    }
  };

  const clearSelectedAmount = () => {
    setSelectedAmountButton(null);
    amountInput.value = '';
  };

  const teardownPaymentStep = () => {
    activePaymentActions = null;
    lastGiftStagingId = null;
    paymentSummary.textContent = '';
    paymentErrorPanel.innerHTML = '';
    paymentStatus.textContent = 'Waiting for secure payment details.';
    confirmPaymentButton.disabled = false;
    const paymentElementHost = doc.getElementById('payment-element');
    if (paymentElementHost) {
      paymentElementHost.innerHTML = '';
    }
  };

  const renderDonationSummary = (payload: DonationPayload) => {
    if (!donationSummary) {
      return;
    }

    donationSummary.innerHTML =
      '<div><strong>Donation</strong>: ' +
      escapeHtml(formatCurrencyAmount(payload.amountMinorUnits)) +
      (payload.donationType === 'RECURRING' ? ' monthly' : ' one-off') +
      '</div>' +
      '<div><strong>Donor</strong>: ' +
      escapeHtml(
        [payload.donorFirstName, payload.donorLastName]
          .filter(Boolean)
          .join(' ') || 'Not provided',
      ) +
      '</div>' +
      '<div><strong>Email</strong>: ' +
      escapeHtml(payload.donorEmail || 'Not provided') +
      '</div>' +
      (config.giftAidEnabled === true
        ? '<div><strong>Gift Aid</strong>: ' +
          escapeHtml(payload.giftAidRequested ? 'Requested' : 'Not requested') +
          '</div>'
        : '');
  };

  const showPaymentStep = (payload: DonationPayload) => {
    renderDonationSummary(payload);
    form.hidden = true;
    paymentPanel.hidden = false;
  };

  const showDonationStep = () => {
    teardownPaymentStep();
    paymentPanel.hidden = true;
    form.hidden = false;
    submitButton.disabled = false;
    status.textContent = 'Validated by Twenty before secure payment fields load.';
  };

  const extractAddress = (): Record<string, string> | undefined => {
    const fields = {
      addressStreet1: valueOf('addressStreet1'),
      addressStreet2: valueOf('addressStreet2'),
      addressCity: valueOf('addressCity'),
      addressState: valueOf('addressState'),
      addressPostcode: valueOf('addressPostcode'),
      addressCountry: valueOf('addressCountry'),
    };

    return Object.values(fields).some(Boolean) ? fields : undefined;
  };

  const showErrorPanel = (panel: HTMLElement, message: string) => {
    panel.innerHTML =
      '<div class="error-panel">' + escapeHtml(message) + '</div>';
  };

  for (const button of donationTypeButtons) {
    button.addEventListener('click', () => {
      for (const candidate of donationTypeButtons) {
        candidate.classList.remove('is-selected');
      }
      button.classList.add('is-selected');
      donationType = button.getAttribute('data-donation-type') || 'ONE_OFF';
      refreshDonationTypeLabels();
    });
  }

  giftAidRequestedInput?.addEventListener('change', syncAddressRequirements);

  for (const button of amountButtons) {
    button.addEventListener('click', () => {
      setSelectedAmountButton(button);
      if (customAmountInput) {
        customAmountInput.value = '';
      }
      amountInput.value = button.getAttribute('data-amount') || '';
    });
  }

  customAmountInput?.addEventListener('input', () => {
    const customMinorUnits = parseMajorUnitsToMinorUnits(
      customAmountInput.value,
    );

    if (customMinorUnits === null) {
      clearSelectedAmount();
      return;
    }

    setSelectedAmountButton(null);
    amountInput.value = String(customMinorUnits);
  });

  refreshDonationTypeLabels();
  syncAddressRequirements();

  changeDonationDetailsButton?.addEventListener('click', showDonationStep);

  form.addEventListener('submit', async (submitEvent) => {
    submitEvent.preventDefault();
    errorPanel.innerHTML = '';
    paymentErrorPanel.innerHTML = '';

    const payload: DonationPayload = {
      publicId: bootstrap.publicId,
      donationType,
      amountMinorUnits: Number(amountInput.value || '0'),
      donorFirstName: valueOf('donorFirstName'),
      donorLastName: valueOf('donorLastName'),
      donorEmail: valueOf('donorEmail'),
      donorPhone: valueOf('donorPhone'),
      donorMailingAddress: extractAddress(),
      giftAidRequested: isChecked('giftAidRequested'),
      supporterEmailOptOut: isChecked('supporterEmailOptOut'),
      attribution: {
        referrer: doc.referrer || undefined,
        embedContext: { surface: 'iframe' },
      },
    };

    submitButton.disabled = true;
    status.textContent = 'Creating secure payment session…';

    try {
      const response = await win.fetch(CHECKOUT_SESSION_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as CheckoutSessionResponse | null;

      if (
        !response.ok ||
        !result?.checkoutSessionClientSecret ||
        !result.publishableKey
      ) {
        throw new Error(
          result?.message ||
            result?.error ||
            'Unable to create the secure payment session.',
        );
      }

      if (!win.Stripe) {
        throw new Error('Stripe.js did not load');
      }

      const stripe = win.Stripe(result.publishableKey);
      const checkout = stripe.initCheckoutElementsSdk({
        clientSecret: Promise.resolve(result.checkoutSessionClientSecret),
      });
      const paymentElement = checkout.createPaymentElement({
        fields: { billingDetails: { name: 'never' } },
      });

      requireElement(doc, 'payment-element').innerHTML = '';
      paymentElement.mount('#payment-element');

      const loadActionsResult = await checkout.loadActions();
      if (loadActionsResult.type !== 'success') {
        throw new Error(
          loadActionsResult.error?.message ||
            'Stripe secure payment fields failed to initialize.',
        );
      }

      activePaymentActions = loadActionsResult.actions;
      lastGiftStagingId = result.giftStagingId || null;
      const totalAmount =
        loadActionsResult.actions.getSession()?.total?.total?.amount;
      paymentSummary.textContent =
        typeof totalAmount === 'number'
          ? (isRecurring() ? 'Monthly total: ' : 'Total: ') +
            formatCurrencyAmount(totalAmount) +
            '. Secure payment fields loaded.'
          : 'Secure payment fields loaded.';

      showPaymentStep(payload);
      paymentStatus.textContent = isRecurring()
        ? 'Enter card details to confirm your monthly donation.'
        : 'Enter card details to confirm your donation.';
      status.textContent = 'Secure payment fields loaded inside the donation form.';
    } catch (error) {
      submitButton.disabled = false;
      paymentPanel.hidden = true;
      status.textContent = 'The secure payment fields could not be loaded yet.';
      showErrorPanel(errorPanel, getErrorMessage(error));
    }
  });

  confirmPaymentButton.addEventListener('click', async () => {
    paymentErrorPanel.innerHTML = '';

    if (!activePaymentActions) {
      showErrorPanel(paymentErrorPanel, 'Payment details are not ready yet.');
      return;
    }

    confirmPaymentButton.disabled = true;
    paymentStatus.textContent = 'Confirming secure payment…';

    try {
      const result = await activePaymentActions.confirm({
        redirect: 'if_required',
      });

      if (result.type === 'error') {
        throw new Error(result.error?.message || 'Payment confirmation failed.');
      }

      const donationLabel = isRecurring() ? 'monthly donation' : 'donation';
      paymentStatus.textContent =
        'Stripe accepted the payment confirmation. Twenty will confirm the ' +
        donationLabel +
        ' when the webhook arrives.' +
        (lastGiftStagingId
          ? ' GiftStaging ' + lastGiftStagingId + ' is awaiting confirmation.'
          : '');
      form.hidden = true;
      paymentPanel.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
      }
      if (thankYouStatus) {
        thankYouStatus.textContent =
          'Payment confirmation was accepted. Twenty will finalise the ' +
          donationLabel +
          ' when the webhook arrives.';
      }
    } catch (error) {
      confirmPaymentButton.disabled = false;
      paymentStatus.textContent = 'Payment confirmation failed.';
      showErrorPanel(paymentErrorPanel, getErrorMessage(error));
    }
  });
};

export const startDonationFormFromDocument = (
  win: Window & { Stripe?: StripeFactory; fetch: typeof fetch },
): void => {
  const doc = win.document;
  const bootstrapElement = doc.getElementById(DONATION_FORM_BOOTSTRAP_ELEMENT_ID);
  const bootstrap = JSON.parse(
    bootstrapElement?.textContent ?? 'null',
  ) as DonationFormClientBootstrap | null;

  if (!bootstrap) {
    throw new Error('Donation form bootstrap data is missing');
  }

  startDonationForm({ bootstrap, doc, win });
};
