import {
  DONATION_FORM_GENERIC_ERROR_COPY,
  DONATION_FORM_SUBMISSION_ERROR_COPY,
  resolveDonationTypeCopy,
} from 'src/donation-forms/donation-form-copy';
import {
  DONATION_FORM_BOOTSTRAP_ELEMENT_ID,
  DONATION_FORM_RESIZE_MESSAGE_TYPE,
  type DonationFormClientBootstrap,
  type DonationFormResizeMessage,
  type StripeCheckoutActions,
  type StripeFactory,
} from 'src/donation-forms/embed-client/donation-form-client.types';

const CHECKOUT_SESSION_PATH =
  '/s/donation-forms/create-elements-checkout-session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DonationFormWindow = Window & {
  Stripe?: StripeFactory;
  fetch: typeof fetch;
};

type CheckoutSessionResponse = {
  checkoutSessionClientSecret?: string;
  publishableKey?: string;
  code?: string;
};

type FieldError = {
  // The element the error summary link moves focus to.
  target: HTMLElement;
  // The inline error slot, `<id>-error`.
  errorId: string;
  message: string;
};

type DonationPayload = {
  publicId: string;
  formToken: string | undefined;
  contactReference: string;
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

export const parseMajorUnitsToMinorUnits = (value: string): number | null => {
  const normalized = value.trim().replace(/^[^\d.]+/, '').replaceAll(',', '');
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

export const resolveSubmissionErrorMessage = (code: string | undefined) =>
  (code ? DONATION_FORM_SUBMISSION_ERROR_COPY[code] : undefined) ??
  DONATION_FORM_GENERIC_ERROR_COPY;

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
  win: DonationFormWindow;
}): void => {
  const { config } = bootstrap;
  const currencyCode =
    typeof config.currencyCode === 'string' ? config.currencyCode : 'GBP';
  const minimumAmount =
    typeof config.minimumAmount === 'number' && config.minimumAmount > 0
      ? config.minimumAmount
      : null;

  const form = requireElement<HTMLFormElement>(doc, 'donationForm');
  const detailsHeading = requireElement(doc, 'detailsHeading');
  const errorSummary = requireElement(doc, 'errorSummary');
  const errorSummaryList = requireElement(doc, 'errorSummaryList');
  const amountInput = requireElement<HTMLInputElement>(doc, 'amountMinorUnits');
  const amountLabel = requireElement(doc, 'amountLabel');
  const status = requireElement(doc, 'status');
  const errorPanel = requireElement(doc, 'errorPanel');
  const submitButton = requireElement<HTMLButtonElement>(doc, 'submitButton');
  const paymentPanel = requireElement(doc, 'paymentPanel');
  const paymentHeading = requireElement(doc, 'paymentHeading');
  const donationSummary = requireElement(doc, 'donationSummary');
  const paymentHint = requireElement(doc, 'paymentHint');
  const paymentElementHost = requireElement(doc, 'payment-element');
  const paymentErrorPanel = requireElement(doc, 'paymentErrorPanel');
  const confirmPaymentButton = requireElement<HTMLButtonElement>(
    doc,
    'confirmPaymentButton',
  );
  const paymentStatus = requireElement(doc, 'paymentStatus');
  const successPanel = requireElement(doc, 'successPanel');
  const thankYouHeading = requireElement(doc, 'thankYouHeading');
  const thankYouStatus = requireElement(doc, 'thankYouStatus');
  const changeDonationDetailsButton = requireElement(
    doc,
    'changeDonationDetailsButton',
  );
  const customAmountInput = doc.getElementById(
    'customAmountMajor',
  ) as HTMLInputElement | null;
  const giftAidRequestedInput = doc.getElementById(
    'giftAidRequested',
  ) as HTMLInputElement | null;
  const addressSection = doc.getElementById('addressSection');
  const amountRadios = Array.from(
    doc.querySelectorAll<HTMLInputElement>('input[name="amountOption"]'),
  );
  const donationTypeRadios = Array.from(
    doc.querySelectorAll<HTMLInputElement>('input[name="donationType"]'),
  );
  const shell = doc.querySelector<HTMLElement>('.shell') ?? doc.body;

  let donationType: string =
    donationTypeRadios.find((radio) => radio.checked)?.value ??
    bootstrap.donationTypeOptions[0] ??
    'ONE_OFF';
  let activePaymentActions: StripeCheckoutActions | null = null;
  let isSubmitting = false;
  let isConfirming = false;

  const isRecurring = () => donationType === 'RECURRING';

  const formatCurrencyAmount = (amountMinorUnits: number): string =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(amountMinorUnits / 100);

  const fieldInput = (id: string) =>
    doc.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;

  const valueOf = (id: string): string => fieldInput(id)?.value.trim() ?? '';

  const isChecked = (id: string): boolean =>
    (doc.getElementById(id) as HTMLInputElement | null)?.checked === true;

  const requiresAddress = () =>
    config.requireAddress === true || giftAidRequestedInput?.checked === true;

  // The host page sizes the iframe from these messages. The page runs in a
  // sandbox with an opaque origin, so hosts match on event.source instead.
  const postResize = (scrollIntoView = false) => {
    if (win.parent === win) {
      return;
    }

    const message: DonationFormResizeMessage = {
      type: DONATION_FORM_RESIZE_MESSAGE_TYPE,
      height: Math.ceil(shell.getBoundingClientRect().height),
      scrollIntoView,
    };
    win.parent.postMessage(message, '*');
  };

  const moveFocusTo = (element: HTMLElement) => {
    element.focus();
    postResize(true);
  };

  const setStatus = (element: HTMLElement, message: string) => {
    element.textContent = message;
  };

  const showPanelError = (panel: HTMLElement, message: string) => {
    panel.textContent = message;
    panel.hidden = false;
    moveFocusTo(panel);
  };

  const clearPanelError = (panel: HTMLElement) => {
    panel.textContent = '';
    panel.hidden = true;
  };

  const setFieldError = (errorId: string, message: string | null) => {
    const slot = doc.getElementById(`${errorId}-error`);
    if (slot) {
      slot.textContent = message ?? '';
      slot.hidden = message === null;
    }

    const input = errorId === 'amount' ? customAmountInput : fieldInput(errorId);
    if (!input) {
      return;
    }

    if (message === null) {
      input.removeAttribute('aria-invalid');
    } else {
      input.setAttribute('aria-invalid', 'true');
    }
  };

  const clearErrorSummary = () => {
    errorSummary.hidden = true;
    errorSummaryList.replaceChildren();
  };

  const showErrors = (errors: FieldError[]) => {
    const items = errors.map((error) => {
      setFieldError(error.errorId, error.message);

      const link = doc.createElement('a');
      link.href = `#${error.target.id}`;
      link.textContent = error.message;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        error.target.focus();
      });

      const item = doc.createElement('li');
      item.append(link);

      return item;
    });

    errorSummaryList.replaceChildren(...items);
    errorSummary.hidden = false;
    moveFocusTo(errorSummary);
  };

  const validate = (): FieldError[] => {
    const errors: FieldError[] = [];
    const amountMinorUnits = Number(amountInput.value || '0');
    const customText = customAmountInput?.value.trim() ?? '';
    const amountTarget =
      customText !== '' && customAmountInput
        ? customAmountInput
        : (amountRadios.find((radio) => radio.checked) ??
          amountRadios[0] ??
          customAmountInput);

    if (amountTarget) {
      if (customText !== '' && amountMinorUnits <= 0) {
        errors.push({
          target: amountTarget,
          errorId: 'amount',
          message: 'Enter an amount, like 12.50',
        });
      } else if (amountMinorUnits <= 0) {
        errors.push({
          target: amountTarget,
          errorId: 'amount',
          message: 'Choose or enter an amount',
        });
      } else if (
        customText !== '' &&
        minimumAmount !== null &&
        amountMinorUnits < minimumAmount
      ) {
        errors.push({
          target: amountTarget,
          errorId: 'amount',
          message: `Enter an amount of at least ${formatCurrencyAmount(minimumAmount)}`,
        });
      }
    }

    const requireText = (id: string, message: string) => {
      const input = fieldInput(id);
      if (input && valueOf(id) === '') {
        errors.push({ target: input, errorId: id, message });
      }
    };

    requireText('donorFirstName', 'Enter your first name');
    requireText('donorLastName', 'Enter your last name');

    const emailInput = fieldInput('donorEmail');
    const email = valueOf('donorEmail');
    if (emailInput && email === '') {
      errors.push({
        target: emailInput,
        errorId: 'donorEmail',
        message: 'Enter your email address',
      });
    } else if (emailInput && !EMAIL_PATTERN.test(email)) {
      errors.push({
        target: emailInput,
        errorId: 'donorEmail',
        message: 'Enter an email address like name@example.com',
      });
    }

    if (requiresAddress()) {
      requireText('addressStreet1', 'Enter the first line of your address');
      requireText('addressCity', 'Enter your town or city');
      requireText('addressPostcode', 'Enter your postcode');
    }

    return errors;
  };

  const clearAllFieldErrors = () => {
    for (const slot of Array.from(
      doc.querySelectorAll<HTMLElement>('.field-error'),
    )) {
      slot.textContent = '';
      slot.hidden = true;
    }
    for (const input of Array.from(doc.querySelectorAll('[aria-invalid]'))) {
      input.removeAttribute('aria-invalid');
    }
  };

  const refreshDonationTypeCopy = () => {
    const copy = resolveDonationTypeCopy(donationType);
    amountLabel.textContent = copy.amountLegend;
    paymentHint.textContent = copy.paymentHint;
  };

  const syncAddressRequirements = () => {
    const required = requiresAddress();

    if (addressSection && config.requireAddress !== true) {
      addressSection.hidden = !required;
      postResize();
    }

    for (const fieldId of ['addressStreet1', 'addressCity', 'addressPostcode']) {
      const field = fieldInput(fieldId);
      if (!field) {
        continue;
      }

      field.required = required;
      if (!required) {
        setFieldError(fieldId, null);
      }
    }
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

  const renderDonationSummary = (payload: DonationPayload) => {
    const rows: [string, string][] = [
      [
        'Donation',
        formatCurrencyAmount(payload.amountMinorUnits) +
          (isRecurring() ? ' monthly' : ' one-off'),
      ],
      [
        'Name',
        [payload.donorFirstName, payload.donorLastName].join(' ').trim(),
      ],
      ['Email', payload.donorEmail],
    ];

    if (config.giftAidEnabled === true) {
      rows.push(['Gift Aid', payload.giftAidRequested ? 'Yes' : 'No']);
    }

    donationSummary.replaceChildren(
      ...rows.map(([term, detail]) => {
        const row = doc.createElement('div');
        const termElement = doc.createElement('dt');
        const detailElement = doc.createElement('dd');
        termElement.textContent = term;
        detailElement.textContent = detail;
        row.append(termElement, detailElement);

        return row;
      }),
    );
  };

  const teardownPaymentStep = () => {
    activePaymentActions = null;
    clearPanelError(paymentErrorPanel);
    setStatus(paymentStatus, '');
    confirmPaymentButton.disabled = false;
    confirmPaymentButton.textContent = 'Donate';
    paymentElementHost.replaceChildren();
  };

  const showDonationStep = () => {
    teardownPaymentStep();
    paymentPanel.hidden = true;
    form.hidden = false;
    submitButton.disabled = false;
    setStatus(status, '');
    moveFocusTo(detailsHeading);
  };

  const showPaymentStep = (payload: DonationPayload) => {
    renderDonationSummary(payload);
    form.hidden = true;
    paymentPanel.hidden = false;
    moveFocusTo(paymentHeading);
  };

  const showSuccess = () => {
    paymentPanel.hidden = true;
    form.hidden = true;
    successPanel.hidden = false;
    thankYouStatus.textContent = isRecurring()
      ? 'Your monthly donation has been set up.'
      : 'We have received your donation.';
    moveFocusTo(thankYouHeading);
  };

  const showSubmissionError = (code: string | undefined) => {
    showPanelError(errorPanel, resolveSubmissionErrorMessage(code));

    if (code === 'FORM_EXPIRED') {
      const reloadButton = doc.createElement('button');
      reloadButton.type = 'button';
      reloadButton.className = 'button button-secondary';
      reloadButton.textContent = 'Reload the form';
      reloadButton.addEventListener('click', () => win.location.reload());
      errorPanel.append(' ', reloadButton);
    }
  };

  for (const radio of donationTypeRadios) {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        donationType = radio.value;
        refreshDonationTypeCopy();
      }
    });
  }

  for (const radio of amountRadios) {
    radio.addEventListener('change', () => {
      if (!radio.checked) {
        return;
      }

      amountInput.value = radio.value;
      if (customAmountInput) {
        customAmountInput.value = '';
      }
      setFieldError('amount', null);
    });
  }

  customAmountInput?.addEventListener('input', () => {
    setFieldError('amount', null);

    if (customAmountInput.value.trim() === '') {
      const checkedRadio = amountRadios.find((radio) => radio.checked);
      amountInput.value = checkedRadio?.value ?? '';
      return;
    }

    for (const radio of amountRadios) {
      radio.checked = false;
    }

    const customMinorUnits = parseMajorUnitsToMinorUnits(
      customAmountInput.value,
    );
    amountInput.value = customMinorUnits === null ? '' : String(customMinorUnits);
  });

  for (const input of Array.from(
    form.querySelectorAll<HTMLInputElement>('.field input, .field select'),
  )) {
    if (input.id !== 'customAmountMajor') {
      input.addEventListener('input', () => setFieldError(input.id, null));
    }
  }

  giftAidRequestedInput?.addEventListener('change', syncAddressRequirements);
  changeDonationDetailsButton.addEventListener('click', showDonationStep);

  form.addEventListener('submit', async (submitEvent) => {
    submitEvent.preventDefault();
    if (isSubmitting) {
      return;
    }

    clearPanelError(errorPanel);
    clearErrorSummary();
    clearAllFieldErrors();

    const errors = validate();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }

    const payload: DonationPayload = {
      publicId: bootstrap.publicId,
      formToken: bootstrap.formToken,
      contactReference: valueOf('nfContactReference'),
      donationType,
      amountMinorUnits: Number(amountInput.value),
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

    isSubmitting = true;
    submitButton.disabled = true;
    setStatus(status, 'Preparing secure payment…');

    try {
      const response = await win.fetch(CHECKOUT_SESSION_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response
        .json()
        .catch(() => null)) as CheckoutSessionResponse | null;

      if (
        !response.ok ||
        !result?.checkoutSessionClientSecret ||
        !result.publishableKey
      ) {
        submitButton.disabled = false;
        setStatus(status, '');
        showSubmissionError(result?.code);
        return;
      }

      if (!win.Stripe) {
        throw new Error('Stripe.js did not load');
      }

      const checkout = win.Stripe(result.publishableKey).initCheckoutElementsSdk({
        clientSecret: Promise.resolve(result.checkoutSessionClientSecret),
      });
      const paymentElement = checkout.createPaymentElement({
        fields: { billingDetails: { name: 'never' } },
      });
      paymentElementHost.replaceChildren();
      paymentElement.mount('#payment-element');

      const loadActionsResult = await checkout.loadActions();
      if (loadActionsResult.type !== 'success') {
        throw new Error(
          loadActionsResult.error?.message ??
            'Stripe payment fields failed to load',
        );
      }

      activePaymentActions = loadActionsResult.actions;
      const totalAmount =
        loadActionsResult.actions.getSession()?.total?.total?.amount ??
        payload.amountMinorUnits;
      confirmPaymentButton.textContent =
        `Donate ${formatCurrencyAmount(totalAmount)}` +
        (isRecurring() ? ' monthly' : '');

      setStatus(status, '');
      showPaymentStep(payload);
    } catch {
      submitButton.disabled = false;
      paymentPanel.hidden = true;
      setStatus(status, '');
      showSubmissionError(undefined);
    } finally {
      isSubmitting = false;
    }
  });

  confirmPaymentButton.addEventListener('click', async () => {
    if (isConfirming) {
      return;
    }

    clearPanelError(paymentErrorPanel);

    if (!activePaymentActions) {
      showPanelError(
        paymentErrorPanel,
        'The payment details are still loading. Please wait a moment.',
      );
      return;
    }

    isConfirming = true;
    confirmPaymentButton.disabled = true;
    setStatus(paymentStatus, 'Processing your payment…');

    try {
      const result = await activePaymentActions.confirm({
        redirect: 'if_required',
      });

      if (result.type === 'error') {
        throw new Error(
          result.error?.message ??
            'Your payment could not be completed. Please try again.',
        );
      }

      setStatus(paymentStatus, '');
      showSuccess();
    } catch (error) {
      confirmPaymentButton.disabled = false;
      setStatus(paymentStatus, '');
      showPanelError(
        paymentErrorPanel,
        error instanceof Error
          ? error.message
          : 'Your payment could not be completed. Please try again.',
      );
    } finally {
      isConfirming = false;
    }
  });

  refreshDonationTypeCopy();
  syncAddressRequirements();

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => postResize()).observe(shell);
  }
  postResize();
};

export const startDonationFormFromDocument = (win: DonationFormWindow): void => {
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
