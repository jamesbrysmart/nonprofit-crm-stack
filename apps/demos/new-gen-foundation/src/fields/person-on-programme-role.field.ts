import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-roles-on-person.field';

export const PERSON_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  'b67440ad-8926-4aa5-bd4b-0e4140ca3523';

export default defineField({
  universalIdentifier: PERSON_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  type: FieldType.RELATION,
  name: 'person',
  label: "Person",
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
