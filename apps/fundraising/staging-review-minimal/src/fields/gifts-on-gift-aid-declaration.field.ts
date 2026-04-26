export const GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER =
  '6f04b3d7-3272-4b09-bf15-48d34c785fa4';

import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk';
import { GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from './gift-aid-declaration-on-gift.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export default defineField({
  universalIdentifier: GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'gifts',
  label: 'Gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
