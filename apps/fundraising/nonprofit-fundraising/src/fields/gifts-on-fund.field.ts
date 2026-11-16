import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GIFTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
