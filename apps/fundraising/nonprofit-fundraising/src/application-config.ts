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
    GIFT_AID_ENABLED: {
      universalIdentifier: '66f57f86-c15a-4ce8-a71a-87eec88bcf1b',
      description:
        'Controls whether Gift Aid behavior and UI are active in the fundraising app.',
      // Gift Aid is modeled as an optional capability, but we currently keep
      // it enabled in the app-dev/pilot build so the bounded slice can be
      // exercised before we solve full conditional provisioning.
      value: 'true',
      isSecret: false,
    },
    HMRC_SUBMISSION_ENABLED: {
      universalIdentifier: 'e95cd0b9-714c-4f6d-b4f4-88af35242ad8',
      description:
        'Enables the Gift Aid submission runner inside the fundraising app.',
      value: 'false',
      isSecret: false,
    },
    HMRC_SUBMISSION_ENVIRONMENT: {
      universalIdentifier: '8ee7fc9c-0b8d-4c51-b8cc-6747e23f6d1f',
      description:
        'Gift Aid submission environment for the current workspace (TEST or LIVE).',
      value: 'TEST',
      isSecret: false,
    },
    HMRC_SUBMISSION_MODE: {
      universalIdentifier: '1de9d78e-6eae-48f4-b6be-15db7d941a59',
      description:
        'Gift Aid submission runner mode (mock_success, mock_failure, build_only, or submit_test).',
      value: 'mock_success',
      isSecret: false,
    },
    HMRC_CHARITIES_CONFIG_JSON: {
      universalIdentifier: '44083984-b211-4232-aee7-a94d9c65f2da',
      description:
        'Workspace-level HMRC charity configuration payload used for Gift Aid submission routing.',
      isSecret: true,
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
