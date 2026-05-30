import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-source-on-gift.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const GIFTS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '8de11230-41dd-4a14-939a-56ce0f7d020e';

export default defineField({
  universalIdentifier: GIFTS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
