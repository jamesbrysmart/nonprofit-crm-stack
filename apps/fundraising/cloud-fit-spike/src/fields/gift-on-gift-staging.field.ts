import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';
import { GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-gift.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '63b231b7-cc74-44ba-a2ac-a4e02ca1f526';

export default defineField({
  universalIdentifier: GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gift',
  label: 'Gift',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftId',
  },
});
