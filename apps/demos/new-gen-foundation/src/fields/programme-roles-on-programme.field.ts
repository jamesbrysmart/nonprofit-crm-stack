import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { PROGRAMME_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-on-programme-role.field';

export const PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER =
  '6d7e969f-e143-4c0a-bdd3-9e61efb1e511';

export default defineField({
  universalIdentifier: PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  type: FieldType.RELATION,
  name: 'programmeRoles',
  label: "Artists and roles",
  icon: 'IconMicrophone2',
  relationTargetObjectMetadataUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
