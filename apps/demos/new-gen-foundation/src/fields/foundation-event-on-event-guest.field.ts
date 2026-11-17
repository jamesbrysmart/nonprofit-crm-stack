import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';

import { EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/event-guests-on-foundation-event.field';

export const FOUNDATION_EVENT_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER =
  '7a151c08-bcde-46f2-8e99-891511475cd7';

export default defineField({
  universalIdentifier: FOUNDATION_EVENT_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  type: FieldType.RELATION,
  name: 'foundationEvent',
  label: "Event",
  icon: 'IconCalendarEvent',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  relationTargetFieldMetadataUniversalIdentifier: EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'foundationEventId',
  },
});
