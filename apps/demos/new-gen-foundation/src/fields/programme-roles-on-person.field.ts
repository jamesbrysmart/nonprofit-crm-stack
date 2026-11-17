import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PERSON_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-programme-role.field';

export const PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'f67d287b-56bc-4f88-a578-5ebf81f80b49';

export default defineField({
  universalIdentifier: PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'programmeRoles',
  label: "Programme roles",
  icon: 'IconMicrophone2',
  relationTargetObjectMetadataUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
