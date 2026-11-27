import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

import {
  FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';

export default defineField({
  universalIdentifier: 'ca5cbfbe-f2bd-418b-b8c8-140f6be24644',
  name: 'captureGift',
  label: 'Capture gift',
  type: FieldType.RELATION,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: '4b740c21-6037-4fd6-9df4-63b571c2d831',
  isUIEditable: false,
  isNullable: true,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'captureGiftId',
  },
});
