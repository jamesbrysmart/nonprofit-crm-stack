import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/event-guests-on-person.field';

export const PERSON_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER =
  '7a0ac792-bd8c-45eb-991d-25687e84b61b';

export default defineField({
  universalIdentifier: PERSON_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  type: FieldType.RELATION,
  name: 'person',
  label: "Person",
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
