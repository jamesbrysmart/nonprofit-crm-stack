import {
  defineField,
  FieldType,
  OnDeleteAction,
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
    PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
