import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { PROGRAMME_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-on-foundation-event.field';

export const FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER =
  '2c111725-b270-4a6d-a109-c5d5da43bee0';

export default defineField({
  universalIdentifier: FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  type: FieldType.RELATION,
  name: 'foundationEvents',
  label: "Events",
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
