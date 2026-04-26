import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';
import { STAGING_REVIEW_ITEMS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER } from './staging-review-items-on-gift-batch.field';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const GIFT_BATCH_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  '6e881851-1441-4dfb-a13b-48d25518fa32';

export default defineField({
  universalIdentifier:
    GIFT_BATCH_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftBatch',
  label: 'Gift batch',
  icon: 'IconStack2',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEMS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftBatchId',
  },
});
