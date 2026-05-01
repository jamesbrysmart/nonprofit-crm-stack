import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RoutePayload } from 'twenty-sdk/define';

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const parseStripeSignatureHeader = (
  headerValue: string | null,
): { timestamp: number | null; signatures: string[] } => {
  if (!headerValue) {
    return { timestamp: null, signatures: [] };
  }

  const segments = headerValue
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const segment of segments) {
    const [key, value] = segment.split('=', 2);

    if (!key || !value) {
      continue;
    }

    if (key === 't') {
      const parsed = Number.parseInt(value, 10);
      timestamp = Number.isFinite(parsed) ? parsed : null;
      continue;
    }

    if (key === 'v1') {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
};

const getVerificationPayload = (
  event: RoutePayload<unknown>,
): string | null => {
  if (typeof event.rawBody === 'string') {
    return event.rawBody;
  }

  if (typeof event.body === 'string') {
    return event.body;
  }

  return null;
};

export const getStripeSignatureHeader = (
  event: RoutePayload<unknown>,
): string | null =>
  event.headers?.['stripe-signature'] ??
  event.headers?.['Stripe-Signature'] ??
  null;

export const getStripeEventSummary = (
  event: RoutePayload<unknown>,
): { eventId: string | null; eventType: string | null } => {
  const body = event.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { eventId: null, eventType: null };
  }

  const record = body as Record<string, unknown>;
  const eventId = normalizeString(
    typeof record.id === 'string' ? record.id : undefined,
  );
  const eventType = normalizeString(
    typeof record.type === 'string' ? record.type : undefined,
  );

  return {
    eventId: eventId === '' ? null : eventId,
    eventType: eventType === '' ? null : eventType,
  };
};

export type StripeWebhookVerificationResult =
  | {
      ok: true;
      eventId: string | null;
      eventType: string | null;
      stripeSignatureTimestamp: number | null;
    }
  | {
      ok: false;
      reason:
        | 'missing_webhook_secret'
        | 'missing_stripe_signature'
        | 'missing_signature_timestamp'
        | 'missing_v1_signature'
        | 'missing_verification_payload'
        | 'signature_mismatch';
      eventId: string | null;
      eventType: string | null;
      stripeSignatureTimestamp: number | null;
    };

export const verifyStripeWebhookEvent = (
  event: RoutePayload<unknown>,
): StripeWebhookVerificationResult => {
  const { eventId, eventType } = getStripeEventSummary(event);
  const webhookSecret = normalizeString(process.env.STRIPE_WEBHOOK_SECRET);

  if (webhookSecret === '') {
    return {
      ok: false,
      reason: 'missing_webhook_secret',
      eventId,
      eventType,
      stripeSignatureTimestamp: null,
    };
  }

  const stripeSignatureHeader = getStripeSignatureHeader(event);

  if (!stripeSignatureHeader) {
    return {
      ok: false,
      reason: 'missing_stripe_signature',
      eventId,
      eventType,
      stripeSignatureTimestamp: null,
    };
  }

  const { timestamp, signatures } =
    parseStripeSignatureHeader(stripeSignatureHeader);

  if (timestamp === null) {
    return {
      ok: false,
      reason: 'missing_signature_timestamp',
      eventId,
      eventType,
      stripeSignatureTimestamp: null,
    };
  }

  if (signatures.length === 0) {
    return {
      ok: false,
      reason: 'missing_v1_signature',
      eventId,
      eventType,
      stripeSignatureTimestamp: timestamp,
    };
  }

  const payload = getVerificationPayload(event);

  if (payload === null) {
    return {
      ok: false,
      reason: 'missing_verification_payload',
      eventId,
      eventType,
      stripeSignatureTimestamp: timestamp,
    };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  const matched = signatures.some((signature) => {
    const candidateBuffer = Buffer.from(signature, 'utf8');

    if (candidateBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(candidateBuffer, expectedBuffer);
  });

  if (!matched) {
    return {
      ok: false,
      reason: 'signature_mismatch',
      eventId,
      eventType,
      stripeSignatureTimestamp: timestamp,
    };
  }

  return {
    ok: true,
    eventId,
    eventType,
    stripeSignatureTimestamp: timestamp,
  };
};
