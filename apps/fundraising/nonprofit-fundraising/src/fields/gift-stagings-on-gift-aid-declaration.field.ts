import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGINGS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    GIFT_STAGINGS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftStagings',
  label: 'Gift staging rows',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
