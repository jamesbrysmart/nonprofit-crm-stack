export const STAGING_REVIEW_ITEMS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER =
  '1f602612-01fe-47be-ae3d-ed2aa7b27f82';

import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk';
import { GIFT_AID_DECLARATION_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from './gift-aid-declaration-on-staging-review-item.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export default defineField({
  universalIdentifier:
    STAGING_REVIEW_ITEMS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'stagingReviewItems',
  label: 'Staging review items',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
