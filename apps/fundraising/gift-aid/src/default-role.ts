import { defineApplicationRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: `${APP_DISPLAY_NAME} default function role`,
  description: 'Processes gift eligibility, declarations, claims and submission attempts.',
  recordsPermissions: {
    objects: [
      {
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
        canReadAllRecords: true,
      },
      {
        objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canCreateAllRecords: false,
      },
      {
        objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: true,
        canCreateAllRecords: true,
        // Twenty 2.59 gates record creation on update permission in workspaces
        // that have not enabled separate create permissions.
        canUpdateAllRecords: true,
      },
      {
        objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: true,
        canCreateAllRecords: true,
        canUpdateAllRecords: true,
      },
      {
        objectUniversalIdentifier: GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
        canReadAllRecords: true,
        canCreateAllRecords: true,
        canUpdateAllRecords: true,
      },
    ],
  },
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
});
