import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { MEMBERSHIP_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/membership-on-gift.field';

export const GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER =
  '9536f309-9716-42d3-8d9b-e324031aa327';

export default defineField({
  universalIdentifier: GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  type: FieldType.RELATION,
  name: 'gifts',
  label: "Membership payments",
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEMBERSHIP_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
