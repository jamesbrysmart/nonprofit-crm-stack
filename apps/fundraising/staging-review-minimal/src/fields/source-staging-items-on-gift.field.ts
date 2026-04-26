import { defineField, FieldType, RelationType } from 'twenty-sdk';
import { COMMITTED_GIFT_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from './committed-gift-on-staging-review-item.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const SOURCE_STAGING_ITEMS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  '4b0d2df0-f5ec-4546-9183-c6bb4d7ee3e5';

export default defineField({
  universalIdentifier:
    SOURCE_STAGING_ITEMS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'sourceStagingItems',
  label: 'Source staging items',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMMITTED_GIFT_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
