import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/funds-on-programme.field';

export const PROGRAMME_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER =
  '2a07f97d-8bd9-4bba-a7d8-d8d814f01cc8';

export default defineField({
  universalIdentifier: PROGRAMME_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'programme',
  label: "Programme",
  icon: 'IconMasksTheater',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  relationTargetFieldMetadataUniversalIdentifier: FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'programmeId',
  },
});
