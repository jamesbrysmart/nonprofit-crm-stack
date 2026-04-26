export const GIFT_AID_DECLARATION_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  'fd3d353e-ee60-48c8-9eb4-f2ad7b6a5449';

import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk';
import { STAGING_REVIEW_ITEMS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER } from './staging-review-items-on-gift-aid-declaration.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export default defineField({
  universalIdentifier:
    GIFT_AID_DECLARATION_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidDeclaration',
  label: 'Gift Aid declaration',
  icon: 'IconFileCertificate',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEMS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftAidDeclarationId',
  },
});
