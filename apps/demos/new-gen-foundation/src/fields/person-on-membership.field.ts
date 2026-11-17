import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/memberships-on-person.field';

export const PERSON_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER =
  '528739a4-e9fa-4408-ac28-f5352a4a9e50';

export default defineField({
  universalIdentifier: PERSON_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  type: FieldType.RELATION,
  name: 'person',
  label: "Member",
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
