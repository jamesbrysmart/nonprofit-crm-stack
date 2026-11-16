import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'giftAidDeclarations',
  label: 'Gift Aid declarations',
  icon: 'IconFileCertificate',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
