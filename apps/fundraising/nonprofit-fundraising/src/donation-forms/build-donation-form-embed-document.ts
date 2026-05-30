import {
  buildDonationFormCardMarkup,
  buildDonationFormStaticDocument,
  type DonationFormRenderConfig,
} from 'src/donation-forms/donation-form-rendering';
import { resolveDonationFormDonationTypes } from 'src/donation-forms/donation-form-config';

export const buildDonationFormEmbedDocument = ({
  publicId,
  publishedVersion,
  config,
}: {
  publicId: string;
  publishedVersion: string;
  config: DonationFormRenderConfig;
}): string => {
  const cardMarkup = buildDonationFormCardMarkup({
    config,
    publicId,
    publishedVersion,
  });
  const donationTypeOptions = resolveDonationFormDonationTypes(config.mode);

  const scriptMarkup = `<script src="https://js.stripe.com/clover/stripe.js"></script>
    <script>
      const PUBLIC_ID = ${JSON.stringify(publicId)};
      const PUBLISHED_VERSION = ${JSON.stringify(publishedVersion)};
      const CONFIG = ${JSON.stringify(config)};
      const DONATION_TYPE_OPTIONS = ${JSON.stringify(donationTypeOptions)};
      const CURRENCY_CODE =
        typeof CONFIG.currencyCode === 'string' ? CONFIG.currencyCode : 'GBP';
      const donationTypeOptions = DONATION_TYPE_OPTIONS;
      let donationType = donationTypeOptions[0] || 'ONE_OFF';

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
      const successPanel = document.getElementById('successPanel');
      const thankYouStatus = document.getElementById('thankYouStatus');
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

      function escapeHtml(value) {
        return String(value)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

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
          CONFIG.requireAddress === true || giftAidRequested;

        if (addressSection && CONFIG.requireAddress !== true) {
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
            CONFIG.requireAddress === true
              ? 'This donation form requires the donor home address.'
              : giftAidRequested
                ? 'Gift Aid needs your home address so the declaration can be recorded credibly for HMRC.'
                : 'If you add Gift Aid, we need your home address so the declaration can be recorded credibly for HMRC.';
        }
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

      refreshDonationTypeLabels();
      syncAddressRequirements();

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
          supporterEmailOptOut:
            document.getElementById('supporterEmailOptOut')?.checked === true,
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
                currency: CURRENCY_CODE,
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
          form.hidden = true;
          paymentPanel.hidden = true;
          if (successPanel) {
            successPanel.hidden = false;
          }
          if (thankYouStatus) {
            thankYouStatus.textContent =
              'Payment confirmation was accepted. Twenty will finalise the ' +
              (donationType === 'RECURRING' ? 'monthly donation' : 'donation') +
              ' when the webhook arrives.';
          }
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
    </script>`;

  return buildDonationFormStaticDocument({
    cardMarkup,
    config,
    scriptMarkup,
  });
};

export const buildDonationFormEmbedSnippet = ({
  iframeUrl,
}: {
  iframeUrl: string;
}): string =>
  `<iframe src="${iframeUrl
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')}" title="Donation form" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="payment *" style="width:100%;min-height:880px;border:0;background:transparent;"></iframe>`;
