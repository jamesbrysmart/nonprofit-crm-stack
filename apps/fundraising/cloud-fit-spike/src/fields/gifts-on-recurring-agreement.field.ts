import { defineField, FieldType, RelationType } from 'twenty-sdk';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';
import { RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreement-on-gift.field';

export const GIFTS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER =
  'b758ce84-8765-4987-9086-a5794a85be00';

export default defineField({
  universalIdentifier: GIFTS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
