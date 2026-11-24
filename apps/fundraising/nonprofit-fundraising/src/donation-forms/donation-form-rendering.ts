import {
  type DonationFormDonationType,
  normalizeDonationFormAmountOptions,
  resolveDonationFormDonationTypes,
} from 'src/donation-forms/donation-form-config';
import { resolveDonationTypeCopy } from 'src/donation-forms/donation-form-copy';
import { DONATION_FORM_RENDER_STYLES } from 'src/donation-forms/donation-form-rendering-styles';
import { getDefaultCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { normalizeString } from 'src/utils/normalize-string';

export type DonationFormRenderDonationType = DonationFormDonationType;

export type DonationFormRenderConfig = {
  title?: string | null;
  description?: string | null;
  primaryColor?: string | null;
  thankYouMessage?: string | null;
  mode?: string | null;
  currencyCode?: string | null;
  amountOptions?: number[] | null;
  allowCustomAmount?: boolean | null;
  minimumAmount?: number | null;
  giftAidEnabled?: boolean | null;
  giftAidTextVersion?: string | null;
  requireAddress?: boolean | null;
  collectPhone?: boolean | null;
};

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

const normalizeHexColor = (value: string | null | undefined): string | null => {
  const normalized = normalizeString(value);
  const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  if (!hexPattern.test(normalized)) {
    return null;
  }

  if (normalized.length === 4) {
    const [, r, g, b] = normalized;

    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return normalized.toLowerCase();
};

const hexToRgb = (
  hexColor: string,
): { red: number; green: number; blue: number } => ({
  red: Number.parseInt(hexColor.slice(1, 3), 16),
  green: Number.parseInt(hexColor.slice(3, 5), 16),
  blue: Number.parseInt(hexColor.slice(5, 7), 16),
});

const mixWithWhite = ({
  hexColor,
  weight,
}: {
  hexColor: string;
  weight: number;
}): string => {
  const { red, green, blue } = hexToRgb(hexColor);
  const clampWeight = Math.max(0, Math.min(1, weight));
  const mixChannel = (channel: number) =>
    Math.round(channel * (1 - clampWeight) + 255 * clampWeight);

  return `#${[mixChannel(red), mixChannel(green), mixChannel(blue)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
};

const resolveThemeVariables = (config: DonationFormRenderConfig): string => {
  const accent = normalizeHexColor(config.primaryColor) ?? '#0d7a5f';
  const accentSoft = mixWithWhite({ hexColor: accent, weight: 0.88 });
  const accentOutline = mixWithWhite({ hexColor: accent, weight: 0.7 });

  return `
      --accent: ${accent};
      --accent-soft: ${accentSoft};
      --accent-outline: ${accentOutline};
    `;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const resolveDonationTypeOptions = (
  value: string | null | undefined,
): DonationFormRenderDonationType[] =>
  resolveDonationFormDonationTypes(value);

const resolveAmountOptions = normalizeDonationFormAmountOptions;

const formatAmount = ({
  amountMinorUnits,
  currencyCode,
}: {
  amountMinorUnits: number;
  currencyCode: string;
}): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMinorUnits / 100);

const formatAmountWithoutCurrencySymbol = ({
  amountMinorUnits,
  currencyCode,
}: {
  amountMinorUnits: number;
  currencyCode: string;
}): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  })
    .format(amountMinorUnits / 100)
    .replace(/[^\d.,-]/g, '')
    .trim();

type FieldAutocomplete =
  | 'given-name'
  | 'family-name'
  | 'email'
  | 'tel'
  | 'address-line1'
  | 'address-line2'
  | 'address-level2'
  | 'address-level1'
  | 'postal-code';

const fieldErrorMarkup = (id: string): string =>
  '<p class="field-error" id="' + escapeHtml(id) + '-error" hidden></p>';

const fieldMarkup = ({
  label,
  id,
  type,
  required,
  autocomplete,
  requiredMessage,
  typeMessage,
}: {
  label: string;
  id: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
  autocomplete: FieldAutocomplete;
  // Donor wording shown in place of the browser's generic validation message.
  requiredMessage?: string;
  typeMessage?: string;
}): string =>
  '<div class="field">' +
  '<label for="' +
  escapeHtml(id) +
  '">' +
  escapeHtml(label) +
  '</label>' +
  fieldErrorMarkup(id) +
  '<input id="' +
  escapeHtml(id) +
  '" name="' +
  escapeHtml(id) +
  '" type="' +
  escapeHtml(type) +
  '" autocomplete="' +
  autocomplete +
  '" aria-describedby="' +
  escapeHtml(id) +
  '-error"' +
  (type === 'email' ? ' spellcheck="false" autocapitalize="off"' : '') +
  (requiredMessage
    ? ' data-error-required="' + escapeHtml(requiredMessage) + '"'
    : '') +
  (typeMessage ? ' data-error-type="' + escapeHtml(typeMessage) + '"' : '') +
  (required ? ' required' : '') +
  ' />' +
  '</div>';

const countryFieldMarkup = (required: boolean): string => {
  const labels =
    typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null;
  const options = STRIPE_COUNTRY_CODES.map((countryCode) => {
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
    '<div class="field">' +
    '<label for="addressCountry">Country</label>' +
    '<select id="addressCountry" name="addressCountry" autocomplete="country"' +
    (required ? ' required' : '') +
    '>' +
    options +
    '</select>' +
    '</div>'
  );
};

const choiceMarkup = ({
  id,
  name,
  value,
  label,
  checked,
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
}): string =>
  '<label class="choice" for="' +
  escapeHtml(id) +
  '">' +
  '<input type="radio" id="' +
  escapeHtml(id) +
  '" name="' +
  escapeHtml(name) +
  '" value="' +
  escapeHtml(value) +
  '"' +
  (checked ? ' checked' : '') +
  ' />' +
  '<span>' +
  escapeHtml(label) +
  '</span>' +
  '</label>';

export const buildDonationFormCardMarkup = ({
  config,
  publicId,
  donationType,
  giftAidRequested,
}: {
  config: DonationFormRenderConfig;
  publicId?: string;
  publishedVersion?: string;
  donationType?: DonationFormRenderDonationType;
  giftAidRequested?: boolean;
}): string => {
  const amountOptions = resolveAmountOptions(config.amountOptions);
  const currencyCode = normalizeString(config.currencyCode).toUpperCase() || getDefaultCurrencyCode();
  const donationTypeOptions = resolveDonationTypeOptions(config.mode);
  const selectedDonationType =
    donationTypeOptions.includes(donationType ?? 'ONE_OFF')
      ? (donationType ?? donationTypeOptions[0] ?? 'ONE_OFF')
      : (donationTypeOptions[0] ?? 'ONE_OFF');
  const selectedGiftAidRequested =
    config.giftAidEnabled === true && giftAidRequested === true;
  const firstAmount =
    amountOptions[0] ??
    (typeof config.minimumAmount === 'number' && config.minimumAmount > 0
      ? config.minimumAmount
      : 500);
  const copy = resolveDonationTypeCopy(selectedDonationType);
  const thankYouMessage =
    normalizeString(config.thankYouMessage) ||
    'Thank you for your donation. Your support helps fund our work.';
  const hasMinimumAmount =
    typeof config.minimumAmount === 'number' && config.minimumAmount > 0;

  const presetAmounts = amountOptions.length > 0 ? amountOptions : [firstAmount];
  const amountChoicesMarkup = presetAmounts
    .map((amount, index) =>
      choiceMarkup({
        id: `amountOption${index}`,
        name: 'amountOption',
        value: String(amount),
        label: formatAmount({ amountMinorUnits: amount, currencyCode }),
        checked: index === 0,
      }),
    )
    .join('');

  const customAmountMarkup =
    config.allowCustomAmount === true
      ? '<div class="field custom-amount">' +
        '<label for="customAmountMajor">Other amount' +
        (hasMinimumAmount
          ? ' <span class="hint" id="customAmountHint">(minimum ' +
            escapeHtml(
              formatAmount({
                amountMinorUnits: config.minimumAmount ?? 0,
                currencyCode,
              }),
            ) +
            ')</span>'
          : '') +
        '</label>' +
        '<div class="custom-amount-input">' +
        '<span class="currency-symbol" aria-hidden="true">' +
        escapeHtml(
          formatAmount({
            amountMinorUnits: 100,
            currencyCode,
          }).replace(/[0-9.,\s-]/g, '') || currencyCode,
        ) +
        '</span>' +
        '<input id="customAmountMajor" name="customAmountMajor" type="text" inputmode="decimal" autocomplete="off" data-error-slot="amount" aria-describedby="' +
        (hasMinimumAmount ? 'customAmountHint ' : '') +
        'amount-error" placeholder="' +
        escapeHtml(
          formatAmountWithoutCurrencySymbol({
            amountMinorUnits: firstAmount,
            currencyCode,
          }),
        ) +
        '" />' +
        '</div>' +
        '</div>'
      : '';

  const donationTypeMarkup =
    donationTypeOptions.length > 1
      ? '<fieldset class="section choice-group" id="donationTypeOptions">' +
        '<legend class="label">How often would you like to give?</legend>' +
        '<div class="choices">' +
        donationTypeOptions
          .map((option) =>
            choiceMarkup({
              id: `donationType${option}`,
              name: 'donationType',
              value: option,
              label: option === 'RECURRING' ? 'Monthly' : 'One-off',
              checked: selectedDonationType === option,
            }),
          )
          .join('') +
        '</div>' +
        '</fieldset>'
      : '';

  const giftAidMarkup =
    config.giftAidEnabled === true
      ? '<div class="checkbox">' +
        '<input id="giftAidRequested" name="giftAidRequested" type="checkbox"' +
        (selectedGiftAidRequested ? ' checked' : '') +
        ' />' +
        '<label for="giftAidRequested">I am a UK taxpayer and want to add Gift Aid to this donation.' +
        ' We will ask for your home address so the declaration can be recorded.' +
        (normalizeString(config.giftAidTextVersion) !== ''
          ? ' <span class="hint">Text version: ' +
            escapeHtml(normalizeString(config.giftAidTextVersion)) +
            '</span>'
          : '') +
        '</label>' +
        '</div>'
      : '';

  const supporterEmailOptOutMarkup =
    '<div class="checkbox">' +
    '<input id="supporterEmailOptOut" name="supporterEmailOptOut" type="checkbox" aria-describedby="supporterEmailOptOutHint" />' +
    '<label for="supporterEmailOptOut">Do not send me supporter emails' +
    '<span class="hint" id="supporterEmailOptOutHint"> This only affects supporter emails such as appeals, newsletters, volunteering asks, campaign updates, and general charity updates. It does not stop receipts or other transactional/admin emails.</span>' +
    '</label>' +
    '</div>';

  const showAddressFields =
    config.requireAddress === true || config.giftAidEnabled === true;
  const requiresAddress =
    config.requireAddress === true || selectedGiftAidRequested;
  const addressMarkup = showAddressFields
    ? '<fieldset class="section" id="addressSection"' +
      (requiresAddress ? '' : ' hidden') +
      '>' +
      '<legend class="label">' +
      escapeHtml(
        config.giftAidEnabled === true ? 'Home address for Gift Aid' : 'Address',
      ) +
      '</legend>' +
      '<p class="hint" id="addressHint">' +
      escapeHtml(
        config.requireAddress === true
          ? 'We need your home address for this donation.'
          : 'Gift Aid requires your home address so we can claim it from HMRC.',
      ) +
      '</p>' +
      '<div class="grid">' +
      fieldMarkup({
        label: 'Building and street',
        requiredMessage: 'Enter the first line of your address',
        id: 'addressStreet1',
        type: 'text',
        required: requiresAddress,
        autocomplete: 'address-line1',
      }) +
      fieldMarkup({
        label: 'Address line 2 (optional)',
        id: 'addressStreet2',
        type: 'text',
        required: false,
        autocomplete: 'address-line2',
      }) +
      fieldMarkup({
        label: 'Town or city',
        requiredMessage: 'Enter your town or city',
        id: 'addressCity',
        type: 'text',
        required: requiresAddress,
        autocomplete: 'address-level2',
      }) +
      fieldMarkup({
        label: 'County (optional)',
        id: 'addressState',
        type: 'text',
        required: false,
        autocomplete: 'address-level1',
      }) +
      fieldMarkup({
        label: 'Postcode',
        requiredMessage: 'Enter your postcode',
        id: 'addressPostcode',
        type: 'text',
        required: requiresAddress,
        autocomplete: 'postal-code',
      }) +
      countryFieldMarkup(requiresAddress) +
      '</div>' +
      '</fieldset>'
    : '';

  // Off-screen rather than display:none so simple bots still fill it; hidden
  // from assistive technology and the tab order, with a name autofill ignores.
  const honeypotMarkup =
    '<div class="nf-hp" aria-hidden="true">' +
    '<label for="nfContactReference">Leave this field empty</label>' +
    '<input id="nfContactReference" name="nf_contact_reference" type="text" tabindex="-1" autocomplete="off" />' +
    '</div>';

  return (
    '<header class="form-header">' +
    '<h1>' +
    escapeHtml(normalizeString(config.title) || 'Donation form') +
    '</h1>' +
    (normalizeString(config.description)
      ? '<p class="intro">' + escapeHtml(normalizeString(config.description)) + '</p>'
      : '') +
    '</header>' +
    '<form id="donationForm" novalidate aria-labelledby="detailsHeading">' +
    '<h2 id="detailsHeading" tabindex="-1"><span class="step">Step 1 of 2</span> Your donation</h2>' +
    '<div class="error-summary" id="errorSummary" tabindex="-1" aria-labelledby="errorSummaryTitle" hidden>' +
    '<h3 id="errorSummaryTitle">Please check the following</h3>' +
    '<ul id="errorSummaryList"></ul>' +
    '</div>' +
    donationTypeMarkup +
    '<fieldset class="section choice-group" id="amountGroup">' +
    '<legend class="label" id="amountLabel">' +
    escapeHtml(copy.amountLegend) +
    '</legend>' +
    fieldErrorMarkup('amount') +
    '<div class="choices" id="amounts">' +
    amountChoicesMarkup +
    '</div>' +
    customAmountMarkup +
    '</fieldset>' +
    '<input type="hidden" id="amountMinorUnits" value="' +
    escapeHtml(String(firstAmount)) +
    '" />' +
    '<fieldset class="section">' +
    '<legend class="label">Your details</legend>' +
    '<div class="grid">' +
    fieldMarkup({
      label: 'First name',
      requiredMessage: 'Enter your first name',
      id: 'donorFirstName',
      type: 'text',
      required: true,
      autocomplete: 'given-name',
    }) +
    fieldMarkup({
      label: 'Last name',
      requiredMessage: 'Enter your last name',
      id: 'donorLastName',
      type: 'text',
      required: true,
      autocomplete: 'family-name',
    }) +
    fieldMarkup({
      label: 'Email address',
      requiredMessage: 'Enter your email address',
      typeMessage: 'Enter an email address like name@example.com',
      id: 'donorEmail',
      type: 'email',
      required: true,
      autocomplete: 'email',
    }) +
    (config.collectPhone === true
      ? fieldMarkup({
          label: 'Phone (optional)',
          id: 'donorPhone',
          type: 'tel',
          required: false,
          autocomplete: 'tel',
        })
      : '') +
    '</div>' +
    '</fieldset>' +
    addressMarkup +
    '<div class="section stack">' +
    giftAidMarkup +
    supporterEmailOptOutMarkup +
    '</div>' +
    honeypotMarkup +
    '<div class="error-panel" id="errorPanel" tabindex="-1" hidden></div>' +
    '<div class="actions">' +
    '<button class="button" id="submitButton" type="submit">Continue to payment</button>' +
    '<p class="status" id="status" role="status"></p>' +
    '</div>' +
    '</form>' +
    '<section id="paymentPanel" class="payment-panel" aria-labelledby="paymentHeading" hidden>' +
    '<h2 id="paymentHeading" tabindex="-1"><span class="step">Step 2 of 2</span> Payment</h2>' +
    '<dl class="summary" id="donationSummary"></dl>' +
    '<button class="link-button" id="changeDonationDetailsButton" type="button">Change donation details</button>' +
    '<p class="hint" id="paymentHint">' +
    escapeHtml(copy.paymentHint) +
    '</p>' +
    '<div id="payment-element"></div>' +
    '<div class="error-panel" id="paymentErrorPanel" tabindex="-1" hidden></div>' +
    '<div class="actions">' +
    '<button class="button" id="confirmPaymentButton" type="button">Donate</button>' +
    '<p class="status" id="paymentStatus" role="status"></p>' +
    '</div>' +
    '</section>' +
    '<section id="successPanel" class="success-panel" aria-labelledby="thankYouHeading" hidden>' +
    '<h2 id="thankYouHeading" tabindex="-1">Thank you</h2>' +
    '<p id="thankYouMessage">' +
    escapeHtml(thankYouMessage) +
    '</p>' +
    '<p class="summary" id="thankYouStatus"></p>' +
    '</section>' +
    '<p class="secure-note">Payments are processed securely by Stripe.</p>' +
    (publicId ? '' : '<div class="meta">Draft visual preview</div>')
  );
};

export const buildDonationFormStaticDocument = ({
  cardMarkup,
  scriptMarkup,
  config,
}: {
  cardMarkup: string;
  scriptMarkup?: string;
  config?: DonationFormRenderConfig;
}): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(normalizeString(config?.title) || 'Donation form')}</title>
    <style>
${DONATION_FORM_RENDER_STYLES}
    </style>
  </head>
  <body>
    <main class="shell" style="${resolveThemeVariables(config ?? {})}">
      <section class="card" id="app">
${cardMarkup}
      </section>
    </main>
${scriptMarkup ?? ''}
  </body>
</html>
`;

export const buildDonationFormPreviewDocument = ({
  config,
  donationType,
  giftAidRequested,
}: {
  config: DonationFormRenderConfig;
  donationType?: DonationFormRenderDonationType;
  giftAidRequested?: boolean;
}): string =>
  buildDonationFormStaticDocument({
    cardMarkup: buildDonationFormCardMarkup({
      config,
      donationType,
      giftAidRequested,
    }),
    config,
  });
