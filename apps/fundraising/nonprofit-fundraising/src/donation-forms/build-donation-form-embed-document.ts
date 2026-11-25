import {
  buildDonationFormCardMarkup,
  buildDonationFormStaticDocument,
  type DonationFormRenderConfig,
} from 'src/donation-forms/donation-form-rendering';
import { resolveDonationFormDonationTypes } from 'src/donation-forms/donation-form-config';
import { buildDonationFormCheckoutSessionUrl } from 'src/donation-forms/donation-form-urls';
import { DONATION_FORM_CLIENT_SCRIPT } from 'src/donation-forms/embed-client/donation-form-client-script.generated';
import {
  DONATION_FORM_BOOTSTRAP_ELEMENT_ID,
  type DonationFormClientBootstrap,
} from 'src/donation-forms/embed-client/donation-form-client.types';

// A string containing "</script>" or "<!--" would end or alter the surrounding
// script element. Escaping <, > and & (and U+2028/U+2029) keeps the JSON inert.
export const serializeForInlineScript = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');

export const buildDonationFormEmbedDocument = ({
  publicId,
  publishedVersion,
  config,
  formToken,
}: {
  publicId: string;
  publishedVersion: string;
  config: DonationFormRenderConfig;
  formToken?: string;
}): string => {
  const cardMarkup = buildDonationFormCardMarkup({
    config,
    publicId,
    publishedVersion,
  });
  const donationTypeOptions = resolveDonationFormDonationTypes(config.mode);

  const bootstrap: DonationFormClientBootstrap = {
    publicId,
    publishedVersion,
    config,
    donationTypeOptions,
    checkoutUrl: buildDonationFormCheckoutSessionUrl(),
    ...(formToken ? { formToken } : {}),
  };

  // Data and code stay separate: the data block is never executed.
  const scriptMarkup = `<script src="https://js.stripe.com/clover/stripe.js"></script>
    <script type="application/json" id="${DONATION_FORM_BOOTSTRAP_ELEMENT_ID}">${serializeForInlineScript(bootstrap)}</script>
    <script>
${DONATION_FORM_CLIENT_SCRIPT}
    </script>`;

  return buildDonationFormStaticDocument({
    cardMarkup,
    config,
    scriptMarkup,
  });
};
