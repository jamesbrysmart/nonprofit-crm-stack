import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  GIFTS_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
