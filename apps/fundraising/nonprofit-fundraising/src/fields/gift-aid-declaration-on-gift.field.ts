import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-gift-aid-declaration.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  'b4a5f371-14da-4248-b18c-db4b323a8231';

export default defineField({
  universalIdentifier: GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidDeclaration',
  label: 'Gift Aid declaration',
  icon: 'IconFileCertificate',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftAidDeclarationId',
  },
});
