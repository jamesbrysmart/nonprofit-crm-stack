import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreement-on-gift.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const GIFTS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER =
  '8ec4ddf0-8534-46c5-8775-a4df47c537c1';

export default defineField({
  universalIdentifier: GIFTS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
