import { defineApplication } from 'twenty-sdk';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    GIFT_AID_ENABLED: {
      universalIdentifier: '3e57fd5f-74fd-4601-bd72-0a8f44dfd69b',
      description:
        'Controls whether Gift Aid UI surfaces are shown in the fundraising app.',
      value: 'true',
      isSecret: false,
    },
  },
  serverVariables: {
    STRIPE_WEBHOOK_SECRET: {
      description:
        'Webhook signing secret for Stripe route testing. Current spike only checks presence; it does not perform raw-body signature verification.',
      isSecret: true,
      isRequired: false,
    },
    HMRC_SUBMISSION_ENABLED: {
      description:
        'Enables the Gift Aid claim submission probe inside the Twenty app runtime.',
      isSecret: false,
      isRequired: false,
    },
    HMRC_SUBMISSION_ENVIRONMENT: {
      description:
        'Gift Aid submission environment for the current workspace (test or live).',
      isSecret: false,
      isRequired: false,
    },
    HMRC_SUBMISSION_MODE: {
      description:
        'Submission adapter mode for the current spike (mock_success or mock_failure).',
      isSecret: false,
      isRequired: false,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
