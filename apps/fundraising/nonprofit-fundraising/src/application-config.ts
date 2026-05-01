import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-function.role';

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
      universalIdentifier: '2d99d15f-e4c1-4f4f-97a6-cf3ce2c08a46',
      description:
        'JSON configuration for HMRC charities claim building and test submission credentials.',
      isSecret: true,
    },
    STRIPE_WEBHOOK_SECRET: {
      universalIdentifier: '3b5602d0-ad2f-4377-affe-a810d390fd35',
      description:
        'Webhook signing secret used for validating inbound Stripe webhook events during app-owned integration testing.',
      isSecret: true,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
