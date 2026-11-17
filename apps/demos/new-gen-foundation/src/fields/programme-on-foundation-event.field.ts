import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

import { FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/foundation-events-on-programme.field';

export const PROGRAMME_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '1abcdb17-bbd7-401a-b537-c32e3109824a';

export default defineField({
  universalIdentifier: PROGRAMME_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: FieldType.RELATION,
  name: 'programme',
  label: "Programme",
  icon: 'IconMasksTheater',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  relationTargetFieldMetadataUniversalIdentifier: FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'programmeId',
  },
});
