import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-source-on-gift-staging.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const GIFT_STAGINGS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '2184223c-b4db-43b2-b784-3ffad0dcae5b';

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
