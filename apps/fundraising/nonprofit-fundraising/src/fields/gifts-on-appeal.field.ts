import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-gift.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const GIFTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER =
  'fbc61579-83e0-45c4-8db5-6d18c31ee587';

export default defineField({
  universalIdentifier: GIFTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
