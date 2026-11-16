import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'personId',
  },
});
