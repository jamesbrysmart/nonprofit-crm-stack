import { defineApplicationRole } from 'twenty-sdk/define';
import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Default function role',
  description: 'Default runtime/admin role for the nonprofit fundraising app',
  recordsPermissions: {
    canReadAllRecords: true,
    canUpdateAllRecords: true,
    canSoftDeleteAllRecords: true,
    canDestroyAllRecords: false,
  },
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
});
