import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    REPORTING_CURRENCY: {
      universalIdentifier: '9daa8949-55b1-43f7-acb4-fcf54123d267',
      label: 'Reporting currency',
      description:
        "Three-letter currency code (for example GBP, EUR or USD) that the organisation reports its fundraising in. Donor, appeal and company totals only include gifts with a value in this currency. Choose it before recording gifts; changing it later leaves earlier totals incomplete.",
      isRequired: true,
      isSecret: false,
    },
    GIFT_AID_ENABLED: {
      universalIdentifier: '66f57f86-c15a-4ce8-a71a-87eec88bcf1b',
      description:
        'Enables declaration capture when recording gifts for the Gift Aid extension.',
      value: 'false',
      isSecret: false,
    },
    STRIPE_WEBHOOK_SECRET: {
      universalIdentifier: '7cb88acf-6d52-44cf-9620-e69e992934f3',
      description:
        'Stripe webhook signing secret used to verify inbound public webhook requests.',
      isSecret: true,
    },
    STRIPE_SECRET_KEY: {
      universalIdentifier: '522c09cb-c02b-466f-b064-968220295bc3',
      description:
        'Stripe API secret key used for server-side Stripe calls in the fundraising app.',
      isSecret: true,
    },
    STRIPE_PUBLISHABLE_KEY: {
      universalIdentifier: '8dbbe9cc-a01d-41be-abcb-2ef59e4ad875',
      description:
        'Stripe publishable key exposed to the public donation runtime for Payment Element card collection.',
      isSecret: false,
    },
  },
});
