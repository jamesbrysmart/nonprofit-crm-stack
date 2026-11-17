import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { FOUNDATION_EVENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/foundation-event-on-gift.field';

export const GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '9d41eb01-c805-49d5-b85d-dbf9b7d31643';

export default defineField({
  universalIdentifier: GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: FieldType.RELATION,
  name: 'gifts',
  label: "Gifts",
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: FOUNDATION_EVENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
