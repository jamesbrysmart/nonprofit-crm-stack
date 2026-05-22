const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const STRIPE_COUNTRY_CODES = [
  'AC', 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AT',
  'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI',
  'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY',
  'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO',
  'CR', 'CV', 'CW', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC',
  'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FO', 'FR', 'GA',
  'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ',
  'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'ID',
  'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB',
  'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD',
  'ME', 'MF', 'MG', 'MK', 'ML', 'MM', 'MN', 'MO', 'MQ', 'MR', 'MS', 'MT',
  'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL',
  'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK',
  'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU',
  'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL',
  'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SZ', 'TA', 'TC', 'TD',
  'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV',
  'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VN',
  'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW', 'ZZ',
] as const;

export const buildDonationFormEmbedDocument = ({
  publicId,
}: {
  publicId: string;
}): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Donation form</title>
    <script src="https://js.stripe.com/clover/stripe.js"></script>
    <style>
      :root {
        color-scheme: light;
        --panel: #ffffff;
        --text: #1b2430;
        --muted: #6c7888;
        --line: #d9e1ea;
        --accent: #0d7a5f;
        --accent-soft: #e9f6f2;
      }

      body {
        margin: 0;
        background: linear-gradient(180deg, #f6f8fb 0%, #edf3f8 100%);
        color: var(--text);
        font: 16px/1.5 "Instrument Sans", "Inter", system-ui, sans-serif;
      }

      .shell {
        max-width: 640px;
        margin: 0 auto;
        padding: 24px 16px;
      }

      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 18px 40px rgba(19, 40, 62, 0.08);
      }

      .eyebrow {
        display: inline-flex;
        margin-bottom: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 30px;
        line-height: 1.1;
      }

      p {
        margin: 0;
        color: var(--muted);
      }

      .section {
        margin-top: 24px;
      }

      .label {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .amounts {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .amount {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 10px 14px;
        background: #fff;
        font-weight: 600;
        cursor: pointer;
        transition:
          border-color 120ms ease,
          background 120ms ease,
          color 120ms ease,
          transform 120ms ease;
      }

      .amount:hover {
        transform: translateY(-1px);
        border-color: #b6c4d4;
      }

      .amount.is-selected {
        border-color: var(--accent);
        background: var(--accent);
        color: #fff;
      }

      form {
        margin-top: 24px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field span {
        font-size: 14px;
        font-weight: 600;
      }

      input[type='text'],
      input[type='email'],
      input[type='tel'],
      select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
        font: inherit;
        color: var(--text);
        background: #fff;
      }

      input:focus,
      select:focus {
        outline: 2px solid rgba(13, 122, 95, 0.14);
        outline-offset: 0;
        border-color: var(--accent);
      }

      .hint {
        font-size: 13px;
        color: var(--muted);
      }

      .stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .checkbox {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: #fbfcfe;
      }

      .checkbox input {
        margin-top: 3px;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-top: 24px;
      }

      .button {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        background: var(--accent);
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .button[disabled] {
        opacity: 0.65;
        cursor: wait;
      }

      .status {
        font-size: 14px;
        color: var(--muted);
      }

      .payment-panel {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--line);
      }

      .payment-panel[hidden] {
        display: none;
      }

      #payment-element {
        min-height: 44px;
      }

      .meta {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--line);
        font-size: 14px;
        color: var(--muted);
      }

      .error {
        color: #a12424;
      }

      .error-panel {
        margin-top: 18px;
        border: 1px solid #efc0c0;
        background: #fff6f6;
        color: #842a2a;
        border-radius: 14px;
        padding: 12px 14px;
      }

      .summary {
        margin-top: 12px;
        font-size: 14px;
        color: var(--muted);
      }

      @media (max-width: 640px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card" id="app">
        <div class="eyebrow">Donation form spike</div>
        <h1>Loading donation form…</h1>
        <p>Please wait while the published form configuration is loaded.</p>
      </section>
    </main>
    <script>
      const PUBLIC_ID = ${JSON.stringify(publicId)};
      const COUNTRY_CODES = ${JSON.stringify(STRIPE_COUNTRY_CODES)};

      (async function () {
        const app = document.getElementById('app');

        const response = await fetch(
          '/s/donation-forms/public-config?publicId=' + encodeURIComponent(PUBLIC_ID),
        );
        const payload = await response.json();

        if (!payload || payload.ok !== true) {
          app.innerHTML =
            '<h1 class="error">Form unavailable</h1><p>This donation form is not currently available.</p>';
          return;
        }

        const config = payload.config || {};
        const amountOptions = Array.isArray(config.amountOptions)
          ? config.amountOptions
          : [];
        const currencyCode =
          typeof config.currencyCode === 'string' ? config.currencyCode : 'GBP';
        const normalizedMode =
          typeof config.mode === 'string'
            ? config.mode.toUpperCase()
            : 'ONE_OFF';
        const donationTypeOptions =
          normalizedMode === 'ONE_OFF_AND_MONTHLY' ||
          normalizedMode === 'MONTHLY_AND_ONE_OFF' ||
          normalizedMode === 'MIXED'
            ? ['ONE_OFF', 'RECURRING']
            : normalizedMode === 'RECURRING'
              ? ['RECURRING']
              : ['ONE_OFF'];
        let donationType = donationTypeOptions[0];

        const amountMarkup =
          amountOptions.length > 0
            ? amountOptions
                .map(function (amount, index) {
                  const asNumber = Number(amount);
                  const display = Number.isFinite(asNumber)
                    ? new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency: currencyCode,
                      }).format(asNumber / 100)
                    : String(amount);

                  return (
                    '<button class="amount' +
                    (index === 0 ? ' is-selected' : '') +
                    '" type="button" data-amount="' +
                    escapeHtml(String(asNumber)) +
                    '">' +
                    display +
                    '</button>'
                  );
                })
                .join('')
            : '<button class="amount is-selected" type="button" data-amount="500">£5.00</button>';

        const minimumAmount =
          Number.isFinite(Number(config.minimumAmount)) &&
          Number(config.minimumAmount) > 0
            ? Number(config.minimumAmount)
            : 100;
        const firstAmount =
          amountOptions.length > 0 && Number.isFinite(Number(amountOptions[0]))
            ? Number(amountOptions[0])
            : minimumAmount;
        const amountLabel =
          donationType === 'RECURRING'
            ? 'Choose your monthly amount'
            : 'Choose an amount';
        const securePaymentButtonLabel =
          donationType === 'RECURRING'
            ? 'Continue to secure monthly payment'
            : 'Continue to secure payment';
        const confirmPaymentButtonLabel =
          donationType === 'RECURRING'
            ? 'Confirm monthly donation'
            : 'Confirm donation';
        const paymentHint =
          donationType === 'RECURRING'
            ? 'Card details stay inside the donation form. Stripe only owns the secure monthly payment fields.'
            : 'Card payment stays inside the donation form. Stripe only owns the secure payment fields.';
        const donationTypeMarkup =
          donationTypeOptions.length > 1
            ? '<div class="section">' +
              '<div class="label">Donation type</div>' +
              '<div class="amounts" id="donationTypeOptions">' +
              donationTypeOptions
                .map(function (option, index) {
                  const label =
                    option === 'RECURRING' ? 'Monthly' : 'One-off';

                  return (
                    '<button class="amount' +
                    (index === 0 ? ' is-selected' : '') +
                    '" type="button" data-donation-type="' +
                    escapeHtml(option) +
                    '">' +
                    escapeHtml(label) +
                    '</button>'
                  );
                })
                .join('') +
              '</div>' +
              '</div>'
            : '';
        const giftAidMarkup = config.giftAidEnabled
          ? '<label class="checkbox">' +
            '<input id="giftAidRequested" type="checkbox" />' +
            '<span>I am a UK taxpayer and want to add Gift Aid to this donation.' +
            ' We will ask for your home address so the declaration can be recorded.' +
            (config.giftAidTextVersion
              ? ' <span class="hint">Text version: ' +
                escapeHtml(String(config.giftAidTextVersion)) +
                '</span>'
              : '') +
            '</span>' +
            '</label>'
          : '';
        const showAddressFields =
          config.requireAddress === true || config.giftAidEnabled === true;
        const addressMarkup = showAddressFields
          ? '<div class="section" id="addressSection"' +
            (config.requireAddress === true ? '' : ' hidden') +
            '>' +
            '<div class="label">' +
            escapeHtml(
              config.giftAidEnabled === true ? 'Home address for Gift Aid' : 'Address',
            ) +
            '</div>' +
            '<p class="hint" id="addressHint">' +
            escapeHtml(
              config.requireAddress === true
                ? 'This donation form requires the donor home address.'
                : 'If you add Gift Aid, we need your home address so the declaration can be recorded credibly for HMRC.',
            ) +
            '</p>' +
            '<div class="grid">' +
            fieldMarkup(
              'Building and street',
              'addressStreet1',
              'text',
              config.requireAddress === true,
            ) +
            fieldMarkup(
              'Address line 2 (optional)',
              'addressStreet2',
              'text',
              false,
            ) +
            fieldMarkup(
              'Town or city',
              'addressCity',
              'text',
              config.requireAddress === true,
            ) +
            fieldMarkup('County (optional)', 'addressState', 'text', false) +
            fieldMarkup(
              'Postcode',
              'addressPostcode',
              'text',
              config.requireAddress === true,
            ) +
            countryFieldMarkup(config.requireAddress === true) +
            '</div>' +
            '</div>'
          : '';

        app.innerHTML =
          '<div class="eyebrow">Donation form spike</div>' +
          '<h1>' +
          escapeHtml(config.title || 'Donation form') +
          '</h1>' +
          '<p>' +
          escapeHtml(
            config.description ||
              'Published configuration loaded successfully. Checkout submission is the next spike step.',
          ) +
          '</p>' +
          '<form id="donationForm">' +
          donationTypeMarkup +
          '<div class="section">' +
          '<div class="label" id="amountLabel">' +
          escapeHtml(amountLabel) +
          '</div>' +
          '<div class="amounts" id="amounts">' +
          amountMarkup +
          '</div>' +
          '</div>' +
          '<input type="hidden" id="amountMinorUnits" value="' +
          escapeHtml(String(firstAmount)) +
          '" />' +
          '<div class="section stack">' +
          '<div class="grid">' +
          fieldMarkup('First name', 'donorFirstName', 'text', true) +
          fieldMarkup('Last name', 'donorLastName', 'text', true) +
          fieldMarkup('Email address', 'donorEmail', 'email', true) +
          (config.collectPhone
            ? fieldMarkup('Phone', 'donorPhone', 'tel', false)
            : '') +
          '</div>' +
          addressMarkup +
          giftAidMarkup +
          '</div>' +
          '<div class="actions">' +
          '<button class="button" id="submitButton" type="submit">' +
          escapeHtml(securePaymentButtonLabel) +
          '</button>' +
          '<div class="status" id="status">Validated by Twenty before secure payment fields load.</div>' +
          '</div>' +
          '<div id="errorPanel"></div>' +
          '</form>' +
          '<section id="paymentPanel" class="payment-panel" hidden>' +
          '<div class="label">Secure payment details</div>' +
          '<p class="hint" id="paymentHint">' +
          escapeHtml(paymentHint) +
          '</p>' +
          '<div class="summary" id="paymentSummary"></div>' +
          '<div id="payment-element"></div>' +
          '<div id="paymentErrorPanel"></div>' +
          '<div class="actions">' +
          '<button class="button" id="confirmPaymentButton" type="button">' +
          escapeHtml(confirmPaymentButtonLabel) +
          '</button>' +
          '<div class="status" id="paymentStatus">Waiting for secure payment details.</div>' +
          '</div>' +
          '</section>' +
          '<div class="meta">' +
          'Form: ' +
          escapeHtml(payload.publicId) +
          ' · Version: ' +
          escapeHtml(payload.publishedVersion) +
          '</div>';

        const form = document.getElementById('donationForm');
        const donationTypeButtons = Array.from(
          document.querySelectorAll('[data-donation-type]'),
        );
        const amounts = Array.from(document.querySelectorAll('[data-amount]'));
        const amountInput = document.getElementById('amountMinorUnits');
        const amountLabelElement = document.getElementById('amountLabel');
        const status = document.getElementById('status');
        const errorPanel = document.getElementById('errorPanel');
        const submitButton = document.getElementById('submitButton');
        const paymentPanel = document.getElementById('paymentPanel');
        const paymentSummary = document.getElementById('paymentSummary');
        const paymentHintElement = document.getElementById('paymentHint');
        const paymentErrorPanel = document.getElementById('paymentErrorPanel');
        const confirmPaymentButton = document.getElementById('confirmPaymentButton');
        const paymentStatus = document.getElementById('paymentStatus');
        const giftAidRequestedInput = document.getElementById('giftAidRequested');
        const addressSection = document.getElementById('addressSection');
        const addressHint = document.getElementById('addressHint');
        let activePaymentActions = null;
        let lastGiftStagingId = null;
        const addressFieldIds = [
          'addressStreet1',
          'addressCity',
          'addressPostcode',
          'addressCountry',
        ];

        function refreshDonationTypeLabels() {
          if (amountLabelElement) {
            amountLabelElement.textContent =
              donationType === 'RECURRING'
                ? 'Choose your monthly amount'
                : 'Choose an amount';
          }

          if (paymentHintElement) {
            paymentHintElement.textContent =
              donationType === 'RECURRING'
                ? 'Card details stay inside the donation form. Stripe only owns the secure monthly payment fields.'
                : 'Card payment stays inside the donation form. Stripe only owns the secure payment fields.';
          }

          submitButton.textContent =
            donationType === 'RECURRING'
              ? 'Continue to secure monthly payment'
              : 'Continue to secure payment';

          confirmPaymentButton.textContent =
            donationType === 'RECURRING'
              ? 'Confirm monthly donation'
              : 'Confirm donation';
        }

        function syncAddressRequirements() {
          const giftAidRequested =
            giftAidRequestedInput && giftAidRequestedInput.checked === true;
          const requiresAddress =
            config.requireAddress === true || giftAidRequested;

          if (addressSection && config.requireAddress !== true) {
            addressSection.hidden = !requiresAddress;
          }

          addressFieldIds.forEach(function (fieldId) {
            const field = document.getElementById(fieldId);
            if (!field) {
              return;
            }

            if (requiresAddress) {
              field.setAttribute('required', 'required');
            } else {
              field.removeAttribute('required');
            }
          });

          if (addressHint) {
            addressHint.textContent =
              config.requireAddress === true
                ? 'This donation form requires the donor home address.'
                : giftAidRequested
                  ? 'Gift Aid needs your home address so the declaration can be recorded credibly for HMRC.'
                  : 'If you add Gift Aid, we need your home address so the declaration can be recorded credibly for HMRC.';
          }
        }

        donationTypeButtons.forEach(function (button) {
          button.addEventListener('click', function () {
            donationTypeButtons.forEach(function (candidate) {
              candidate.classList.remove('is-selected');
            });
            button.classList.add('is-selected');
            donationType = button.getAttribute('data-donation-type') || 'ONE_OFF';
            refreshDonationTypeLabels();
          });
        });

        refreshDonationTypeLabels();
        syncAddressRequirements();

        if (giftAidRequestedInput) {
          giftAidRequestedInput.addEventListener('change', function () {
            syncAddressRequirements();
          });
        }

        amounts.forEach(function (button) {
          button.addEventListener('click', function () {
            amounts.forEach(function (candidate) {
              candidate.classList.remove('is-selected');
            });
            button.classList.add('is-selected');
            amountInput.value = button.getAttribute('data-amount') || '';
          });
        });

        form.addEventListener('submit', async function (submitEvent) {
          submitEvent.preventDefault();
          errorPanel.innerHTML = '';
          paymentErrorPanel.innerHTML = '';

          const payload = {
            publicId: PUBLIC_ID,
            donationType: donationType,
            amountMinorUnits: Number(amountInput.value || '0'),
            donorFirstName: valueOf('donorFirstName'),
            donorLastName: valueOf('donorLastName'),
            donorEmail: valueOf('donorEmail'),
            donorPhone: valueOf('donorPhone'),
            donorMailingAddress: extractAddress(),
            giftAidRequested:
              document.getElementById('giftAidRequested')?.checked === true,
            attribution: {
              referrer: document.referrer || undefined,
              embedContext: {
                surface: 'iframe',
              },
            },
          };

          submitButton.disabled = true;
          status.textContent = 'Creating secure payment session…';

          try {
            const response = await fetch(
              '/s/donation-forms/create-elements-checkout-session',
              {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
                body: JSON.stringify(payload),
              },
            );

            const result = await response.json();

            if (
              !response.ok ||
              !result?.checkoutSessionClientSecret ||
              !result?.publishableKey
            ) {
              throw new Error(
                result?.message ||
                  result?.error ||
                  'Unable to create the secure payment session.',
              );
            }

            if (!window.Stripe) {
              throw new Error('Stripe.js did not load');
            }

            const stripe = window.Stripe(result.publishableKey);
            const checkout = stripe.initCheckoutElementsSdk({
              clientSecret: Promise.resolve(result.checkoutSessionClientSecret),
            });
            const paymentElement = checkout.createPaymentElement({
              fields: {
                billingDetails: {
                  name: 'never',
                },
              },
            });

            document.getElementById('payment-element').innerHTML = '';
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
            const session = loadActionsResult.actions.getSession();
            const totalAmount = session?.total?.total?.amount;
            if (typeof totalAmount === 'number') {
              paymentSummary.textContent =
                (donationType === 'RECURRING' ? 'Monthly total: ' : 'Total: ') +
                new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: currencyCode,
                }).format(totalAmount / 100) +
                '. Secure payment fields loaded.';
            } else {
              paymentSummary.textContent = 'Secure payment fields loaded.';
            }

            paymentPanel.hidden = false;
            paymentStatus.textContent =
              donationType === 'RECURRING'
                ? 'Enter card details to confirm your monthly donation.'
                : 'Enter card details to confirm your donation.';
            status.textContent =
              'Secure payment fields loaded inside the donation form.';
          } catch (error) {
            submitButton.disabled = false;
            paymentPanel.hidden = true;
            status.textContent = 'The secure payment fields could not be loaded yet.';
            errorPanel.innerHTML =
              '<div class="error-panel">' +
              escapeHtml(
                error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred.',
              ) +
              '</div>';
          }
        });

        confirmPaymentButton.addEventListener('click', async function () {
          paymentErrorPanel.innerHTML = '';

          if (!activePaymentActions) {
            paymentErrorPanel.innerHTML =
              '<div class="error-panel">Payment details are not ready yet.</div>';
            return;
          }

          confirmPaymentButton.disabled = true;
          paymentStatus.textContent = 'Confirming secure payment…';

          try {
            const result = await activePaymentActions.confirm();

            if (result?.type === 'error') {
              throw new Error(
                result.error?.message || 'Payment confirmation failed.',
              );
            }

            paymentStatus.textContent =
              'Stripe accepted the payment confirmation. Twenty will confirm the ' +
              (donationType === 'RECURRING' ? 'monthly donation' : 'donation') +
              ' when the webhook arrives.' +
              (lastGiftStagingId
                ? ' GiftStaging ' + lastGiftStagingId + ' is awaiting confirmation.'
                : '');
          } catch (error) {
            confirmPaymentButton.disabled = false;
            paymentStatus.textContent = 'Payment confirmation failed.';
            paymentErrorPanel.innerHTML =
              '<div class="error-panel">' +
              escapeHtml(
                error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred.',
              ) +
              '</div>';
          }
        });
      })();

      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

      function fieldMarkup(label, id, type, required) {
        return (
          '<label class="field">' +
          '<span>' +
          escapeHtml(label) +
          (required ? ' *' : '') +
          '</span>' +
          '<input id="' +
          escapeHtml(id) +
          '" type="' +
          escapeHtml(type) +
          '" ' +
          (required ? 'required ' : '') +
          '/>' +
          '</label>'
        );
      }

      function countryFieldMarkup(required) {
        const labels =
          typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
            ? new Intl.DisplayNames(['en'], { type: 'region' })
            : null;
        const options = COUNTRY_CODES.map(function (countryCode) {
          const label = labels ? labels.of(countryCode) || countryCode : countryCode;
          return (
            '<option value="' +
            escapeHtml(countryCode) +
            '"' +
            (countryCode === 'GB' ? ' selected' : '') +
            '>' +
            escapeHtml(label) +
            '</option>'
          );
        }).join('');

        return (
          '<label class="field">' +
          '<span>Country' +
          (required ? ' *' : '') +
          '</span>' +
          '<select id="addressCountry" ' +
          (required ? 'required ' : '') +
          '>' +
          options +
          '</select>' +
          '</label>'
        );
      }

      function valueOf(id) {
        const element = document.getElementById(id);
        return element && typeof element.value === 'string'
          ? element.value.trim()
          : '';
      }

        function extractAddress() {
          const fields = {
            addressStreet1: valueOf('addressStreet1'),
            addressStreet2: valueOf('addressStreet2'),
            addressCity: valueOf('addressCity'),
          addressState: valueOf('addressState'),
          addressPostcode: valueOf('addressPostcode'),
          addressCountry: valueOf('addressCountry'),
        };

        return Object.values(fields).some(Boolean) ? fields : undefined;
      }
    </script>
  </body>
</html>
`;

export const buildDonationFormEmbedSnippet = ({
  iframeUrl,
}: {
  iframeUrl: string;
}): string =>
  `<iframe src="${escapeHtml(iframeUrl)}" title="Donation form" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="payment *" style="width:100%;min-height:880px;border:0;background:transparent;"></iframe>`;
