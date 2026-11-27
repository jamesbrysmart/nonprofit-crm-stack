import { defineField, FieldType } from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { ACTIVE_GIFT_AID_DRAFT_KEY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ACTIVE_GIFT_AID_DRAFT_KEY_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'activeDraftKey',
  label: 'Active draft key',
  type: FieldType.TEXT,
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  defaultValue: null,
  isUIEditable: false,
  description: 'Unique key for the current Gift Aid draft.',
});
