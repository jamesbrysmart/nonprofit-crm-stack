import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';
import { GIFT_STAGINGS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-gift-aid-declaration.field';

export const GIFT_AID_DECLARATION_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  'f1b9a59c-d2c6-4fdd-82af-dc44ce8c5e17';

export default defineField({
  universalIdentifier:
    GIFT_AID_DECLARATION_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidDeclaration',
  label: 'Gift Aid declaration',
  icon: 'IconFileCertificate',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftAidDeclarationId',
  },
});
