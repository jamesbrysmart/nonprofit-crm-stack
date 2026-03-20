import { defineRole } from 'twenty-sdk';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '47fb90ac-aea1-4cbe-ae3d-99f584509a41';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Fundraising Cloud Fit Spike default function role',
  description: 'Fundraising Cloud Fit Spike default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  // Narrow this further once the pass-1 staging object and relation IDs exist.
});
