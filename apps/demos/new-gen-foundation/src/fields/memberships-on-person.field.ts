import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PERSON_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-membership.field';

export const MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '5d539bd6-6909-4c8e-8916-3cfdec1c6eb7';

export default defineField({
  universalIdentifier: MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'memberships',
  label: "Memberships",
  icon: 'IconId',
  relationTargetObjectMetadataUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
