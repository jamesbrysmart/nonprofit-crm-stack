import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { createHmac, timingSafeEqual } from 'node:crypto';

type StripeRouteProbeResponse = {
  headerKeys: string[];
  hasStripeSignatureHeader: boolean;
  stripeSignaturePreview: string | null;
  bodyType: 'null' | 'string' | 'object' | 'other';
  bodyPreview: string | null;
  bodyKeys: string[];
  stripeEventId: string | null;
  stripeEventType: string | null;
  stripeObjectType: string | null;
  stripeSignatureTimestamp: number | null;
  verificationAttempted: boolean;
  verificationMethod: 'none' | 'raw-string' | 'json-stringify';
  verificationMatched: boolean | null;
  verificationError: string | null;
  isBase64Encoded: boolean;
  method: string;
  path: string;
};

const MAX_PREVIEW_LENGTH = 200;

const truncatePreview = (value: string): string =>
  value.length <= MAX_PREVIEW_LENGTH
    ? value
    : `${value.slice(0, MAX_PREVIEW_LENGTH)}...`;

const buildBodyPreview = (body: unknown): string | null => {
  if (body === null || body === undefined) {
    return null;
  }

  if (typeof body === 'string') {
    return truncatePreview(body);
  }

  if (typeof body === 'object') {
    try {
      return truncatePreview(JSON.stringify(body));
    } catch {
      return '[unserializable object]';
    }
  }

  return truncatePreview(String(body));
};

const getBodyType = (
  body: unknown,
): StripeRouteProbeResponse['bodyType'] => {
  if (body === null || body === undefined) {
    return 'null';
  }

  if (typeof body === 'string') {
    return 'string';
  }

  if (typeof body === 'object') {
    return 'object';
  }

  return 'other';
};

const getBodyKeys = (body: unknown): string[] => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [];
  }

  return Object.keys(body).sort();
};

const getStripeEventField = (
  body: unknown,
  field: 'id' | 'type',
): string | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const value = (body as Record<string, unknown>)[field];
  return typeof value === 'string' && value.length > 0 ? value : null;
};

const getStripeObjectType = (body: unknown): string | null => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  const data = (body as Record<string, unknown>).data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const object = (data as Record<string, unknown>).object;
  if (!object || typeof object !== 'object' || Array.isArray(object)) {
    return null;
  }

  const objectType = (object as Record<string, unknown>).object;
  return typeof objectType === 'string' && objectType.length > 0
    ? objectType
    : null;
};

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
  body: unknown,
): { payload: string | null; method: StripeRouteProbeResponse['verificationMethod'] } => {
  if (typeof body === 'string') {
    return { payload: body, method: 'raw-string' };
  }

  if (body !== null && body !== undefined) {
    try {
      return { payload: JSON.stringify(body), method: 'json-stringify' };
    } catch {
      return { payload: null, method: 'none' };
    }
  }

  return { payload: null, method: 'none' };
};

const verifyStripeSignature = (
  body: unknown,
  stripeSignatureHeader: string | null,
): Pick<
  StripeRouteProbeResponse,
  | 'stripeSignatureTimestamp'
  | 'verificationAttempted'
  | 'verificationMethod'
  | 'verificationMatched'
  | 'verificationError'
> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  if (webhookSecret.length === 0) {
    return {
      stripeSignatureTimestamp: null,
      verificationAttempted: false,
      verificationMethod: 'none',
      verificationMatched: null,
      verificationError: 'missing STRIPE_WEBHOOK_SECRET',
    };
  }

  const { timestamp, signatures } =
    parseStripeSignatureHeader(stripeSignatureHeader);
  const { payload, method } = getVerificationPayload(body);

  if (timestamp === null) {
    return {
      stripeSignatureTimestamp: null,
      verificationAttempted: true,
      verificationMethod: method,
      verificationMatched: false,
      verificationError: 'missing timestamp in stripe-signature header',
    };
  }

  if (signatures.length === 0) {
    return {
      stripeSignatureTimestamp: timestamp,
      verificationAttempted: true,
      verificationMethod: method,
      verificationMatched: false,
      verificationError: 'missing v1 signature in stripe-signature header',
    };
  }

  if (payload === null) {
    return {
      stripeSignatureTimestamp: timestamp,
      verificationAttempted: true,
      verificationMethod: method,
      verificationMatched: false,
      verificationError: 'unable to serialize request body for verification',
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

  return {
    stripeSignatureTimestamp: timestamp,
    verificationAttempted: true,
    verificationMethod: method,
    verificationMatched: matched,
    verificationError: matched
      ? null
      : 'signature mismatch against runtime-visible payload',
  };
};

const handler = async (
  event: RoutePayload<unknown>,
): Promise<StripeRouteProbeResponse> => {
  const headerKeys = Object.keys(event.headers ?? {}).sort();
  const stripeSignature =
    event.headers?.['stripe-signature'] ??
    event.headers?.['Stripe-Signature'] ??
    null;
  const verification = verifyStripeSignature(event.body, stripeSignature);

  const response: StripeRouteProbeResponse = {
    headerKeys,
    hasStripeSignatureHeader:
      typeof stripeSignature === 'string' && stripeSignature.length > 0,
    stripeSignaturePreview:
      typeof stripeSignature === 'string' && stripeSignature.length > 0
        ? truncatePreview(stripeSignature)
        : null,
    bodyType: getBodyType(event.body),
    bodyPreview: buildBodyPreview(event.body),
    bodyKeys: getBodyKeys(event.body),
    stripeEventId: getStripeEventField(event.body, 'id'),
    stripeEventType: getStripeEventField(event.body, 'type'),
    stripeObjectType: getStripeObjectType(event.body),
    stripeSignatureTimestamp: verification.stripeSignatureTimestamp,
    verificationAttempted: verification.verificationAttempted,
    verificationMethod: verification.verificationMethod,
    verificationMatched: verification.verificationMatched,
    verificationError: verification.verificationError,
    isBase64Encoded: event.isBase64Encoded === true,
    method: event.requestContext?.http?.method ?? 'unknown',
    path: event.requestContext?.http?.path ?? 'unknown',
  };

  // Temporary structured log for Stage 1 Stripe runtime validation.
  console.log(
    JSON.stringify({
      event: 'stripe_route_probe_received',
      headerKeys: response.headerKeys,
      hasStripeSignatureHeader: response.hasStripeSignatureHeader,
      bodyType: response.bodyType,
      bodyKeys: response.bodyKeys,
      stripeEventId: response.stripeEventId,
      stripeEventType: response.stripeEventType,
      stripeObjectType: response.stripeObjectType,
      stripeSignatureTimestamp: response.stripeSignatureTimestamp,
      verificationAttempted: response.verificationAttempted,
      verificationMethod: response.verificationMethod,
      verificationMatched: response.verificationMatched,
      verificationError: response.verificationError,
      isBase64Encoded: response.isBase64Encoded,
      method: response.method,
      path: response.path,
    }),
  );

  return response;
};

export default defineLogicFunction({
  universalIdentifier: '75e8b429-9ab0-4f59-a7bb-fe3d6caefc4d',
  name: 'stripe-route-probe',
  description:
    'Temporary probe route for validating Stripe header forwarding and body shape inside Twenty apps.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/route-probe',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['stripe-signature'],
  },
});
