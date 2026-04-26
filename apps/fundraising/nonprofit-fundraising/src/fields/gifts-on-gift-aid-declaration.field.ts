import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-aid-declaration-on-gift.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER =
  'd0a55a3b-63ff-4a1e-b240-24f8fcbd7032';

export default defineField({
  universalIdentifier: GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
