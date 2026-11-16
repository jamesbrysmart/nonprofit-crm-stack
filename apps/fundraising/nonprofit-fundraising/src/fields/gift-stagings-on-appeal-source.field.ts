import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGINGS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    GIFT_STAGINGS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftStagings',
  label: 'Gift staging rows',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
