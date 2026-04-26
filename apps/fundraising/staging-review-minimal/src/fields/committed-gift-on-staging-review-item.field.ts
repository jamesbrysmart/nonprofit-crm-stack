import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { SOURCE_STAGING_ITEMS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from './source-staging-items-on-gift.field';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const COMMITTED_GIFT_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  '16fa46de-3687-4faa-a679-e9f11d13e4c1';

export default defineField({
  universalIdentifier:
    COMMITTED_GIFT_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'committedGift',
  label: 'Committed gift',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SOURCE_STAGING_ITEMS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'committedGiftId',
  },
});
