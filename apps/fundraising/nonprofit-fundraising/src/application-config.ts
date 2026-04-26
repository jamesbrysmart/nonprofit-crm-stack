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
    STRIPE_WEBHOOK_SECRET: {
      universalIdentifier: '3b5602d0-ad2f-4377-affe-a810d390fd35',
      description:
        'Webhook signing secret used for validating inbound Stripe webhook events during app-owned integration testing.',
      isSecret: true,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
