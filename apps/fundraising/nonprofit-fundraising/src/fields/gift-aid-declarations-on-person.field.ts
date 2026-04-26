import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-gift-aid-declaration.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';

export const GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '0f3c46bd-8e8d-4f79-89f6-f555f81ca43b';

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
