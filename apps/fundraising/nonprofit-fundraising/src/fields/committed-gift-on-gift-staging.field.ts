import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { SOURCE_GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/source-gift-stagings-on-gift.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const COMMITTED_GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '3f530cc0-65ad-4345-9cc7-7c4d262ff31e';

export default defineField({
  universalIdentifier: COMMITTED_GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'committedGift',
  label: 'Committed gift',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SOURCE_GIFT_STAGINGS_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'committedGiftId',
  },
});
