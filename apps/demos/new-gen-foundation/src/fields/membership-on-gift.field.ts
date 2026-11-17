import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-membership.field';

export const MEMBERSHIP_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  'f37bdaba-a613-4297-8b04-57be8a903fee';

export default defineField({
  universalIdentifier: MEMBERSHIP_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'membership',
  label: "Membership",
  icon: 'IconId',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  relationTargetFieldMetadataUniversalIdentifier: GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'membershipId',
  },
});
