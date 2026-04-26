import { defineField, FieldType, RelationType } from 'twenty-sdk';
import { GIFT_BATCH_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from './gift-batch-on-staging-review-item.field';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const STAGING_REVIEW_ITEMS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER =
  '865311e9-706d-4e62-b52f-3d5b35f68354';

export default defineField({
  universalIdentifier:
    STAGING_REVIEW_ITEMS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'stagingReviewItems',
  label: 'Staging review items',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_BATCH_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
