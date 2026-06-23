import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  createStripeOneOffGiftStaging,
  type StripeCheckoutSessionCompletedEvent,
  type StripeOneOffGiftStagingResult,
} from 'src/stripe/stripe-one-off-staging';
import {
  updateStripeDonationFormGiftStaging,
  updateStripeDonationFormRecurringInvoicePaymentGiftStaging,
} from 'src/stripe/stripe-donation-form-staging';
import type {
  StripeDonationFormGiftStagingUpdateResult,
  StripeInvoicePaymentPaidEvent,
} from 'src/stripe/stripe-one-off-staging';
import {
  createStripeRecurringGiftStagingForReview,
  createStripeRecurringGiftForConfidentMatch,
  type StripeRecurringCheckoutSessionCompletedEvent,
  type StripeRecurringFulfillmentResult,
  type StripeRecurringUnmatchedStagingResult,
} from 'src/stripe/stripe-recurring-fulfillment';

type StripeObjectRef = string | { id?: string | null } | null | undefined;

type StripeCheckoutSessionLike = {
  metadata?: Record<string, string | null | undefined> | null;
  subscription?: StripeObjectRef;
};

type StripeInvoicePaymentLike = {
  invoice?: StripeObjectRef;
  payment?: {
    payment_intent?: StripeObjectRef;
  } | null;
};

export type TrustedStripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?:
      | StripeCheckoutSessionLike
      | StripeInvoicePaymentLike
      | null;
  } | null;
};

export type StripeEventRoutingResult =
  | {
      action: 'IGNORED';
      reason: 'UNSUPPORTED_EVENT_TYPE';
      eventType: string | null;
    }
  | {
      action: 'CREATE_ONE_OFF_GIFT_STAGING';
      result: StripeOneOffGiftStagingResult;
    }
  | {
      action:
        | 'UPDATE_DONATION_FORM_GIFT_STAGING'
        | 'DONATION_FORM_GIFT_STAGING_MISSING';
      result: StripeDonationFormGiftStagingUpdateResult;
    }
  | {
      action: 'CREATE_RECURRING_GIFT';
      result: StripeRecurringFulfillmentResult;
    }
  | {
      action: 'CREATE_RECURRING_GIFT_STAGING';
      result: StripeRecurringUnmatchedStagingResult;
    };

const normalizeString = (value: string | null | undefined): string =>
  value?.trim() ?? '';

const getStripeObjectId = (value: StripeObjectRef): string | null => {
  if (typeof value === 'string') {
    const normalized = normalizeString(value);

    return normalized === '' ? null : normalized;
  }

  if (value && typeof value === 'object') {
    const normalized = normalizeString(value.id);

    return normalized === '' ? null : normalized;
  }

  return null;
};

const getEventObject = (event: TrustedStripeEvent) => event.data?.object ?? null;

const isStripeCheckoutSessionLike = (
  value: unknown,
): value is StripeCheckoutSessionLike =>
  value !== null &&
  value !== undefined &&
  typeof value === 'object' &&
  ('metadata' in value || 'subscription' in value);

const hasStripeSubscription = (event: TrustedStripeEvent): boolean => {
  const object = getEventObject(event);

  return isStripeCheckoutSessionLike(object)
    ? getStripeObjectId(object.subscription) !== null
    : false;
};

const isDonationFormCheckout = (event: TrustedStripeEvent): boolean => {
  const object = getEventObject(event);

  return isStripeCheckoutSessionLike(object)
    ? normalizeString(object.metadata?.sourceFingerprint) !== ''
    : false;
};

export const routeTrustedStripeEvent = async (
  client: CoreApiClient,
  event: TrustedStripeEvent,
): Promise<StripeEventRoutingResult> => {
  if (event.type === 'invoice_payment.paid') {
    const result =
      await updateStripeDonationFormRecurringInvoicePaymentGiftStaging(
        client,
        event as StripeInvoicePaymentPaidEvent,
      );

    return {
      action: result.updated
        ? 'UPDATE_DONATION_FORM_GIFT_STAGING'
        : 'DONATION_FORM_GIFT_STAGING_MISSING',
      result,
    };
  }

  if (event.type !== 'checkout.session.completed') {
    return {
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: normalizeString(event.type) || null,
    };
  }

  if (isDonationFormCheckout(event)) {
    const result = await updateStripeDonationFormGiftStaging(
      client,
      event as StripeCheckoutSessionCompletedEvent,
    );

    return {
      action: result.updated
        ? 'UPDATE_DONATION_FORM_GIFT_STAGING'
        : 'DONATION_FORM_GIFT_STAGING_MISSING',
      result,
    };
  }

  if (hasStripeSubscription(event)) {
    const recurringEvent = event as StripeRecurringCheckoutSessionCompletedEvent;
    const recurringGiftResult = await createStripeRecurringGiftForConfidentMatch(
      client,
      recurringEvent,
    );

    if (
      !recurringGiftResult.created &&
      recurringGiftResult.reason === 'NO_CONFIDENT_RECURRING_AGREEMENT_MATCH'
    ) {
      return {
        action: 'CREATE_RECURRING_GIFT_STAGING',
        result: await createStripeRecurringGiftStagingForReview(
          client,
          recurringEvent,
        ),
      };
    }

    return {
      action: 'CREATE_RECURRING_GIFT',
      result: recurringGiftResult,
    };
  }

  return {
    action: 'CREATE_ONE_OFF_GIFT_STAGING',
    result: await createStripeOneOffGiftStaging(
      client,
      event as StripeCheckoutSessionCompletedEvent,
    ),
  };
};
