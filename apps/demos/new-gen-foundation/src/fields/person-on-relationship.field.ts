import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/relationships-on-person.field';

export const PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER =
  '092f12c1-696f-4981-8ece-d4ddd1b0c607';

export default defineField({
  universalIdentifier: PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  type: FieldType.RELATION,
  name: 'person',
  label: "Person",
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
