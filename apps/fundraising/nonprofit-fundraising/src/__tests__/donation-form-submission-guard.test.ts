import { describe, expect, it } from 'vitest';
import {
  DONATION_FORM_TOKEN_MAX_AGE_SECONDS,
  assertDonationFormSubmissionAllowed,
  checkDonationFormToken,
  createDonationFormToken,
} from 'src/donation-forms/donation-form-submission-guard';

const SECRET = 'sk_test_example';
const ISSUED_AT = new Date('2026-11-24T10:00:00Z');
const secondsAfterIssue = (seconds: number) =>
  new Date(ISSUED_AT.getTime() + seconds * 1000);

const token = createDonationFormToken({
  secret: SECRET,
  publicId: 'df_public_123',
  now: ISSUED_AT,
});

describe('donation form submission guard', () => {
  it('accepts a token for the same form within its lifetime', () => {
    expect(
      checkDonationFormToken({
        token,
        secret: SECRET,
        publicId: 'df_public_123',
        now: secondsAfterIssue(DONATION_FORM_TOKEN_MAX_AGE_SECONDS),
      }),
    ).toBe('VALID');
  });

  it('reports an expired token separately so donors can reload', () => {
    expect(
      checkDonationFormToken({
        token,
        secret: SECRET,
        publicId: 'df_public_123',
        now: secondsAfterIssue(DONATION_FORM_TOKEN_MAX_AGE_SECONDS + 1),
      }),
    ).toBe('EXPIRED');
  });

  it.each([
    ['another form', { publicId: 'df_other' }],
    ['another secret', { secret: 'sk_test_other' }],
    ['a tampered timestamp', { token: token.replace(/\.\d+\./, '.1.') }],
    ['a malformed token', { token: 'not-a-token' }],
    ['a token issued in the future', { now: secondsAfterIssue(-3600) }],
  ])('rejects %s', (_label, overrides) => {
    expect(
      checkDonationFormToken({
        token,
        secret: SECRET,
        publicId: 'df_public_123',
        now: secondsAfterIssue(60),
        ...overrides,
      }),
    ).toBe('INVALID');
  });

  it('rejects a filled-in honeypot before checking the token', () => {
    expect(() =>
      assertDonationFormSubmissionAllowed({
        publicId: 'df_public_123',
        formToken: token,
        contactReference: 'https://spam.example',
        secret: SECRET,
        now: secondsAfterIssue(60),
      }),
    ).toThrow(expect.objectContaining({ code: 'REJECTED' }));
  });

  it('rejects a submission without a token', () => {
    expect(() =>
      assertDonationFormSubmissionAllowed({
        publicId: 'df_public_123',
        formToken: undefined,
        contactReference: '',
        secret: SECRET,
        now: secondsAfterIssue(60),
      }),
    ).toThrow(expect.objectContaining({ code: 'REJECTED' }));
  });

  it('asks the donor to reload when the token has expired', () => {
    expect(() =>
      assertDonationFormSubmissionAllowed({
        publicId: 'df_public_123',
        formToken: token,
        contactReference: '',
        secret: SECRET,
        now: secondsAfterIssue(DONATION_FORM_TOKEN_MAX_AGE_SECONDS + 60),
      }),
    ).toThrow(expect.objectContaining({ code: 'FORM_EXPIRED' }));
  });

  it('allows a valid submission', () => {
    expect(() =>
      assertDonationFormSubmissionAllowed({
        publicId: 'df_public_123',
        formToken: token,
        contactReference: '',
        secret: SECRET,
        now: secondsAfterIssue(60),
      }),
    ).not.toThrow();
  });
});
