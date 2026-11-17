import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/reverse-relationships-on-person.field';

export const RELATED_PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER =
  '676559cf-fa9c-47ba-9318-ce79b6cb893e';

export default defineField({
  universalIdentifier: RELATED_PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  type: FieldType.RELATION,
  name: 'relatedPerson',
  label: "Related person",
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'relatedPersonId',
  },
});
