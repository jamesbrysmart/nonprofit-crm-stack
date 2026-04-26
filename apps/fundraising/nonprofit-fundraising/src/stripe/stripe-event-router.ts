import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  createStripeOneOffGiftStaging,
  type StripeCheckoutSessionCompletedEvent,
  type StripeOneOffGiftStagingResult,
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
  subscription?: StripeObjectRef;
};

export type TrustedStripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: StripeCheckoutSessionLike | null;
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

const hasStripeSubscription = (event: TrustedStripeEvent): boolean =>
  getStripeObjectId(event.data?.object?.subscription) !== null;

export const routeTrustedStripeEvent = async (
  client: CoreApiClient,
  event: TrustedStripeEvent,
): Promise<StripeEventRoutingResult> => {
  if (event.type !== 'checkout.session.completed') {
    return {
      action: 'IGNORED',
      reason: 'UNSUPPORTED_EVENT_TYPE',
      eventType: normalizeString(event.type) || null,
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
