import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  GIFTS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
