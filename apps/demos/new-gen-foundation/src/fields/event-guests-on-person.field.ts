import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PERSON_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-event-guest.field';

export const EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'e35a6bc8-db01-4d46-8c80-d6c72f1c00f2';

export default defineField({
  universalIdentifier: EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'eventGuests',
  label: "Events attended",
  icon: 'IconTicket',
  relationTargetObjectMetadataUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  relationTargetFieldMetadataUniversalIdentifier: PERSON_ON_EVENT_GUEST_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
