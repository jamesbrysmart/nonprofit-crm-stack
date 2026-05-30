import {
  type DonationFormDonationType,
  normalizeDonationFormAmountOptions,
  normalizeDonationFormString,
  resolveDonationFormDonationTypes,
} from 'src/donation-forms/donation-form-config';
import { DONATION_FORM_RENDER_STYLES } from 'src/donation-forms/donation-form-rendering-styles';

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

const normalizeString = normalizeDonationFormString;

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

const fieldMarkup = ({
  label,
  id,
  type,
  required,
}: {
  label: string;
  id: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
}): string =>
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
  '</label>';

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
};

export const buildDonationFormCardMarkup = ({
  config,
  publicId,
  publishedVersion,
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
  const currencyCode = normalizeString(config.currencyCode).toUpperCase() || 'GBP';
  const donationTypeOptions = resolveDonationTypeOptions(config.mode);
  const selectedDonationType =
    donationTypeOptions.includes(donationType ?? 'ONE_OFF')
      ? (donationType ?? donationTypeOptions[0] ?? 'ONE_OFF')
      : (donationTypeOptions[0] ?? 'ONE_OFF');
  const selectedGiftAidRequested =
    config.giftAidEnabled === true && giftAidRequested === true;
  const firstAmount =
    amountOptions.length > 0
      ? amountOptions[0]
      : typeof config.minimumAmount === 'number' && config.minimumAmount > 0
        ? config.minimumAmount
        : 500;
  const amountLabel =
    selectedDonationType === 'RECURRING'
      ? 'Choose your monthly amount'
      : 'Choose an amount';
  const securePaymentButtonLabel =
    selectedDonationType === 'RECURRING'
      ? 'Continue to secure monthly payment'
      : 'Continue to secure payment';
  const confirmPaymentButtonLabel =
    selectedDonationType === 'RECURRING'
      ? 'Confirm monthly donation'
      : 'Confirm donation';
  const paymentHint =
    selectedDonationType === 'RECURRING'
      ? 'Card details stay inside the donation form. Stripe only owns the secure monthly payment fields.'
      : 'Card payment stays inside the donation form. Stripe only owns the secure payment fields.';
  const thankYouMessage =
    normalizeString(config.thankYouMessage) ||
    'Thank you for your donation. Your support helps fund our work.';

  const amountMarkup =
    amountOptions.length > 0
      ? amountOptions
          .map((amount, index) => {
            const display = formatAmount({
              amountMinorUnits: amount,
              currencyCode,
            });

            return (
              '<button class="amount' +
              (index === 0 ? ' is-selected' : '') +
              '" type="button" data-amount="' +
              escapeHtml(String(amount)) +
              '">' +
              escapeHtml(display) +
              '</button>'
            );
          })
          .join('')
      : '<button class="amount is-selected" type="button" data-amount="' +
        escapeHtml(String(firstAmount)) +
        '">' +
        escapeHtml(
          formatAmount({ amountMinorUnits: firstAmount, currencyCode }),
        ) +
        '</button>';

  const donationTypeMarkup =
    donationTypeOptions.length > 1
      ? '<div class="section">' +
        '<div class="label">Donation type</div>' +
        '<div class="amounts" id="donationTypeOptions">' +
        donationTypeOptions
          .map((option) => {
            const label = option === 'RECURRING' ? 'Monthly' : 'One-off';

            return (
              '<button class="amount' +
              (selectedDonationType === option ? ' is-selected' : '') +
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

  const giftAidMarkup =
    config.giftAidEnabled === true
      ? '<label class="checkbox">' +
        '<input id="giftAidRequested" type="checkbox"' +
        (selectedGiftAidRequested ? ' checked' : '') +
        ' />' +
        '<span>I am a UK taxpayer and want to add Gift Aid to this donation.' +
        ' We will ask for your home address so the declaration can be recorded.' +
        (normalizeString(config.giftAidTextVersion) !== ''
          ? ' <span class="hint">Text version: ' +
            escapeHtml(normalizeString(config.giftAidTextVersion)) +
            '</span>'
          : '') +
        '</span>' +
        '</label>'
      : '';

  const supporterEmailOptOutMarkup =
    '<label class="checkbox">' +
    '<input id="supporterEmailOptOut" type="checkbox" />' +
    '<span>Do not send me supporter emails' +
    '<span class="hint"> This only affects supporter emails such as appeals, newsletters, volunteering asks, campaign updates, and general charity updates. It does not stop receipts or other transactional/admin emails.</span>' +
    '</span>' +
    '</label>';

  const showAddressFields =
    config.requireAddress === true || config.giftAidEnabled === true;
  const requiresAddress =
    config.requireAddress === true || selectedGiftAidRequested;
  const addressMarkup = showAddressFields
    ? '<div class="section" id="addressSection"' +
      (requiresAddress ? '' : ' hidden') +
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
          : selectedGiftAidRequested
            ? 'Gift Aid needs your home address so the declaration can be recorded credibly for HMRC.'
            : 'If you add Gift Aid, we need your home address so the declaration can be recorded credibly for HMRC.',
      ) +
      '</p>' +
      '<div class="grid">' +
      fieldMarkup({
        label: 'Building and street',
        id: 'addressStreet1',
        type: 'text',
        required: requiresAddress,
      }) +
      fieldMarkup({
        label: 'Address line 2 (optional)',
        id: 'addressStreet2',
        type: 'text',
        required: false,
      }) +
      fieldMarkup({
        label: 'Town or city',
        id: 'addressCity',
        type: 'text',
        required: requiresAddress,
      }) +
      fieldMarkup({
        label: 'County (optional)',
        id: 'addressState',
        type: 'text',
        required: false,
      }) +
      fieldMarkup({
        label: 'Postcode',
        id: 'addressPostcode',
        type: 'text',
        required: requiresAddress,
      }) +
      countryFieldMarkup(requiresAddress) +
      '</div>' +
      '</div>'
    : '';

  return (
    '<div class="eyebrow">Donation form spike</div>' +
    '<h1>' +
    escapeHtml(normalizeString(config.title) || 'Donation form') +
    '</h1>' +
    '<p>' +
    escapeHtml(
      normalizeString(config.description) ||
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
    fieldMarkup({
      label: 'First name',
      id: 'donorFirstName',
      type: 'text',
      required: true,
    }) +
    fieldMarkup({
      label: 'Last name',
      id: 'donorLastName',
      type: 'text',
      required: true,
    }) +
    fieldMarkup({
      label: 'Email address',
      id: 'donorEmail',
      type: 'email',
      required: true,
    }) +
    (config.collectPhone === true
      ? fieldMarkup({
          label: 'Phone',
          id: 'donorPhone',
          type: 'tel',
          required: false,
        })
      : '') +
    '</div>' +
    addressMarkup +
    giftAidMarkup +
    supporterEmailOptOutMarkup +
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
    '<section id="successPanel" class="success-panel" hidden>' +
    '<h2>Thank you</h2>' +
    '<p id="thankYouMessage">' +
    escapeHtml(thankYouMessage) +
    '</p>' +
    '<p class="summary" id="thankYouStatus"></p>' +
    '</section>' +
    '<div class="meta">' +
    (publicId
      ? 'Form: ' + escapeHtml(publicId) + ' · Version: ' + escapeHtml(publishedVersion ?? '')
      : 'Draft visual preview') +
    '</div>'
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
    <title>Donation form</title>
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
