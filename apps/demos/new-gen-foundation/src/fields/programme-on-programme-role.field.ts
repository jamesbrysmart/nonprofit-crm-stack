import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

import { PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-roles-on-programme.field';

export const PROGRAMME_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  'daa01e78-14d4-4e7c-ad6f-e7c5d9894833';

export default defineField({
  universalIdentifier: PROGRAMME_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  type: FieldType.RELATION,
  name: 'programme',
  label: "Programme",
  icon: 'IconMasksTheater',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'programmeId',
  },
});
