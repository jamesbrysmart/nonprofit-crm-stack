import { createHmac, timingSafeEqual } from 'node:crypto';
import { DonationFormSubmissionError } from 'src/donation-forms/donation-form-submission-error';
import { normalizeString } from 'src/utils/normalize-string';

// Lightweight, invisible checks on public form submissions. They stop blind
// scripted POSTs and naive form-filling bots; they do not stop a bot driving a
// real browser, and a token can be reused until it expires.
const TOKEN_VERSION = 'v1';
const TOKEN_KEY_LABEL = 'nonprofit-fundraising:donation-form-token:v1';
export const DONATION_FORM_TOKEN_MAX_AGE_SECONDS = 2 * 60 * 60;
const CLOCK_SKEW_SECONDS = 60;

// Derived from the Stripe secret key, which every workspace taking donations
// already configures, so charities have nothing extra to set up.
export const readDonationFormTokenSecret = (): string =>
  normalizeString(process.env.STRIPE_SECRET_KEY);

const signTokenPayload = ({
  secret,
  publicId,
  issuedAtSeconds,
}: {
  secret: string;
  publicId: string;
  issuedAtSeconds: number;
}): string => {
  const key = createHmac('sha256', secret).update(TOKEN_KEY_LABEL).digest();

  return createHmac('sha256', key)
    .update(`${publicId}.${TOKEN_VERSION}.${issuedAtSeconds}`)
    .digest('base64url');
};

export const createDonationFormToken = ({
  secret,
  publicId,
  now,
}: {
  secret: string;
  publicId: string;
  now: Date;
}): string => {
  const issuedAtSeconds = Math.floor(now.getTime() / 1000);

  return `${TOKEN_VERSION}.${issuedAtSeconds}.${signTokenPayload({ secret, publicId, issuedAtSeconds })}`;
};

export type DonationFormTokenCheck = 'VALID' | 'EXPIRED' | 'INVALID';

export const checkDonationFormToken = ({
  token,
  secret,
  publicId,
  now,
}: {
  token: string;
  secret: string;
  publicId: string;
  now: Date;
}): DonationFormTokenCheck => {
  const [version, issuedAtText, signature, ...rest] = token.split('.');
  const issuedAtSeconds = Number(issuedAtText);

  if (
    version !== TOKEN_VERSION ||
    rest.length > 0 ||
    !signature ||
    !Number.isInteger(issuedAtSeconds)
  ) {
    return 'INVALID';
  }

  const expected = Buffer.from(
    signTokenPayload({ secret, publicId, issuedAtSeconds }),
  );
  const candidate = Buffer.from(signature);
  if (
    candidate.length !== expected.length ||
    !timingSafeEqual(candidate, expected)
  ) {
    return 'INVALID';
  }

  const ageSeconds = Math.floor(now.getTime() / 1000) - issuedAtSeconds;
  if (ageSeconds < -CLOCK_SKEW_SECONDS) {
    return 'INVALID';
  }

  return ageSeconds > DONATION_FORM_TOKEN_MAX_AGE_SECONDS ? 'EXPIRED' : 'VALID';
};

export const assertDonationFormSubmissionAllowed = ({
  publicId,
  formToken,
  contactReference,
  secret,
  now,
}: {
  publicId: string;
  formToken: string | undefined;
  contactReference: string | undefined;
  secret: string;
  now: Date;
}): void => {
  if (normalizeString(contactReference) !== '') {
    throw new DonationFormSubmissionError(
      'REJECTED',
      'Donation form honeypot field was filled in',
    );
  }

  // Without a Stripe key the form cannot take payments; checkout reports that.
  if (secret === '') {
    return;
  }

  const result = checkDonationFormToken({
    token: normalizeString(formToken),
    secret,
    publicId,
    now,
  });

  if (result === 'EXPIRED') {
    throw new DonationFormSubmissionError(
      'FORM_EXPIRED',
      'Donation form token has expired',
    );
  }

  if (result === 'INVALID') {
    throw new DonationFormSubmissionError(
      'REJECTED',
      'Donation form token is missing or invalid',
    );
  }
};
