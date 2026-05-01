import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { verifyStripeWebhookEvent } from 'src/stripe/stripe-webhook-verification';

type StripeRouteProbeResponse = {
  headerKeys: string[];
  hasStripeSignatureHeader: boolean;
  stripeSignaturePreview: string | null;
  hasRawBody: boolean;
  rawBodyPreview: string | null;
  bodyType: 'null' | 'string' | 'object' | 'other';
  bodyPreview: string | null;
  bodyKeys: string[];
  stripeEventId: string | null;
  stripeEventType: string | null;
  stripeObjectType: string | null;
  stripeSignatureTimestamp: number | null;
  verificationAttempted: boolean;
  verificationMethod: 'none' | 'event-raw-body' | 'raw-string' | 'json-stringify';
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

const verifyStripeSignature = (
  event: RoutePayload<unknown>,
): Pick<
  StripeRouteProbeResponse,
  | 'stripeSignatureTimestamp'
  | 'verificationAttempted'
  | 'verificationMethod'
  | 'verificationMatched'
  | 'verificationError'
> => {
  const verification = verifyStripeWebhookEvent(event);
  const verificationAttempted =
    verification.ok || verification.reason !== 'missing_webhook_secret';

  return {
    stripeSignatureTimestamp: verification.stripeSignatureTimestamp,
    verificationAttempted,
    verificationMethod:
      typeof event.rawBody === 'string'
        ? 'event-raw-body'
        : typeof event.body === 'string'
          ? 'raw-string'
          : event.body !== null && event.body !== undefined
            ? 'json-stringify'
            : 'none',
    verificationMatched: verification.ok ? true : false,
    verificationError: verification.ok ? null : verification.reason,
  };
};

export const stripeRouteProbeHandler = async (
  event: RoutePayload<unknown>,
): Promise<StripeRouteProbeResponse> => {
  const headerKeys = Object.keys(event.headers ?? {}).sort();
  const stripeSignatureHeader =
    event.headers?.['stripe-signature'] ??
    event.headers?.['Stripe-Signature'] ??
    null;
  const verification = verifyStripeSignature(event);

  const response: StripeRouteProbeResponse = {
    headerKeys,
    hasStripeSignatureHeader:
      typeof stripeSignatureHeader === 'string' &&
      stripeSignatureHeader.length > 0,
    stripeSignaturePreview:
      typeof stripeSignatureHeader === 'string' &&
      stripeSignatureHeader.length > 0
        ? truncatePreview(stripeSignatureHeader)
        : null,
    hasRawBody: typeof event.rawBody === 'string',
    rawBodyPreview:
      typeof event.rawBody === 'string'
        ? truncatePreview(event.rawBody)
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
      hasRawBody: response.hasRawBody,
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
  handler: stripeRouteProbeHandler,
  httpRouteTriggerSettings: {
    path: '/stripe/route-probe',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['stripe-signature'],
  },
});
