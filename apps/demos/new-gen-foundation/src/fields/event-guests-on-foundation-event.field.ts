import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { FOUNDATION_EVENT_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/foundation-event-on-event-guest.field';

export const EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '5aa25b9b-6655-4106-9420-bbc906578be4';

export default defineField({
  universalIdentifier: EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: FieldType.RELATION,
  name: 'eventGuests',
  label: "Guests",
  icon: 'IconTicket',
  relationTargetObjectMetadataUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  relationTargetFieldMetadataUniversalIdentifier: FOUNDATION_EVENT_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
