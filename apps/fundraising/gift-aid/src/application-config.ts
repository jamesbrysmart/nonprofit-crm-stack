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
    HMRC_SUBMISSION_ENABLED: {
      universalIdentifier: '4f17f7fc-cb3b-422d-869a-d440243a8b24',
      description:
        'Enables the Gift Aid submission runner in the Gift Aid extension.',
      value: 'false',
      isSecret: false,
    },
    HMRC_SUBMISSION_ENVIRONMENT: {
      universalIdentifier: '55985b86-98fa-488b-9702-9baf06f23307',
      description:
        'Gift Aid submission environment for the current workspace (TEST or LIVE).',
      value: 'TEST',
      isSecret: false,
    },
    HMRC_SUBMISSION_MODE: {
      universalIdentifier: 'c7a8e094-4182-4716-a661-478489be0ba3',
      description:
        'Gift Aid submission runner mode (mock_success, mock_failure, build_only, or submit_test).',
      value: 'mock_success',
      isSecret: false,
    },
    HMRC_CHARITIES_CONFIG_JSON: {
      universalIdentifier: 'ec1cecc1-8d4d-4a40-afd4-bae43daa5a8d',
      description:
        'Workspace-level HMRC charity configuration payload used for Gift Aid submission routing.',
      isSecret: true,
    },
  },
});
