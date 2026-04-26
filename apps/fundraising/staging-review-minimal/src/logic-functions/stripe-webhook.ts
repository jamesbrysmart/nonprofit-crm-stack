import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';

type StripeEventBody = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      amount_received?: number;
      amount_total?: number;
      currency?: string;
      customer_details?: {
        name?: string;
        email?: string;
      };
      metadata?: Record<string, string | undefined>;
    };
  };
  raw?: string;
};

type StripeWebhookProbeResponse = {
  received: boolean;
  eventId: string | null;
  eventType: string | null;
  signatureHeaderPresent: boolean;
  webhookSecretConfigured: boolean;
  parsedBodyKind: 'json' | 'raw' | 'empty';
  staged: boolean;
  stagingReviewItemId: string | null;
  notes: string[];
};

const normalizeString = (value: string | undefined | null) => value?.trim() ?? '';

const splitName = (fullName: string) => {
  const trimmed = fullName.trim();

  if (trimmed === '') {
    return {
      firstName: 'Stripe',
      lastName: 'Donor',
    };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(' ') || 'Donor',
  };
};

const formatAmount = (amountMinorUnits?: number) => {
  if (typeof amountMinorUnits !== 'number' || !Number.isFinite(amountMinorUnits)) {
    return '£0.00';
  }

  return `£${(amountMinorUnits / 100).toFixed(2)}`;
};

const handler = async (
  event: RoutePayload<StripeEventBody>,
): Promise<StripeWebhookProbeResponse> => {
  const body = event.body;
  const signatureHeader =
    event.headers['stripe-signature'] ?? event.headers.signature;
  const webhookSecretConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const notes: string[] = [];

  if (!webhookSecretConfigured) {
    notes.push('Stripe webhook secret is not configured.');
  }

  if (!signatureHeader) {
    notes.push('No forwarded Stripe signature header was received.');
  }

  const parsedBodyKind =
    body === null
      ? 'empty'
      : typeof body === 'object' && body !== null && 'raw' in body
        ? 'raw'
        : 'json';

  if (parsedBodyKind !== 'json') {
    notes.push(
      'Route body is not available as parsed JSON; this spike does not attempt raw-body signature verification.',
    );
  } else {
    notes.push(
      'Route body arrived as parsed JSON; this is good enough for a capability probe but not proof of Stripe-signature verification fidelity.',
    );
  }

  const eventId =
    body && typeof body === 'object' && 'id' in body
      ? normalizeString(body.id)
      : '';
  const eventType =
    body && typeof body === 'object' && 'type' in body
      ? normalizeString(body.type)
      : '';

  const stripeObject =
    body && typeof body === 'object' && 'data' in body
      ? body.data?.object
      : undefined;

  if (
    eventType === 'payment_intent.succeeded' ||
    eventType === 'checkout.session.completed'
  ) {
    const donorName = splitName(
      normalizeString(stripeObject?.customer_details?.name) || 'Stripe Donor',
    );
    const donorEmail = normalizeString(stripeObject?.customer_details?.email);
    const amount = formatAmount(
      stripeObject?.amount_received ?? stripeObject?.amount_total,
    );
    const client = new CoreApiClient();
    const result = await client.mutation({
      createStagingReviewItem: {
        __args: {
          data: {
            name: `Stripe ${eventType || 'event'} ${eventId || 'received'}`.trim(),
            donorFirstName: donorName.firstName,
            donorLastName: donorName.lastName,
            ...(donorEmail !== '' ? { donorEmail } : {}),
            amount,
            giftDate: new Date().toISOString(),
            donorResolutionState: 'UNREVIEWED',
            processingOutcome: 'NOT_RUN',
            hasCoreGiftIssue: false,
            isReadyForProcessing: false,
            processingStatus: 'NOT_READY',
            errorDetail: null,
          },
        },
        id: true,
      },
    } as any);

    notes.push(
      'Created a staging review row from the Stripe-like event. This is a speed-first intake probe, not a full production mapping.',
    );

    return {
      received: true,
      eventId: eventId || null,
      eventType: eventType || null,
      signatureHeaderPresent: Boolean(signatureHeader),
      webhookSecretConfigured,
      parsedBodyKind,
      staged: true,
      stagingReviewItemId: result?.createStagingReviewItem?.id ?? null,
      notes,
    };
  }

  notes.push(
    'Received Stripe route call, but event type is not one of the probe intake types so no staging row was created.',
  );

  return {
    received: true,
    eventId: eventId || null,
    eventType: eventType || null,
    signatureHeaderPresent: Boolean(signatureHeader),
    webhookSecretConfigured,
    parsedBodyKind,
    staged: false,
    stagingReviewItemId: null,
    notes,
  };
};

export default defineLogicFunction({
  universalIdentifier: '487f9ac0-2b8f-4f8e-8548-7d11575f79e6',
  name: 'stripe-webhook-probe',
  description:
    'Receives a Stripe-like webhook event inside Twenty apps and creates a staging row for basic intake probing.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/integrations/stripe/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['stripe-signature', 'content-type'],
  },
});
