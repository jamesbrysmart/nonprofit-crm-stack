import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  COMMITTED_GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  SOURCE_GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SOURCE_GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'sourceGiftStagings',
  label: 'Source gift staging rows',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMMITTED_GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
