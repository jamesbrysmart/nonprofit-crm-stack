import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { VENUE_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/venue-on-foundation-event.field';

export const HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'caaf8b93-e059-4d35-b1d5-7f8c35f38da0';

export default defineField({
  universalIdentifier: HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'hostedEvents',
  label: "Events hosted",
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  relationTargetFieldMetadataUniversalIdentifier: VENUE_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
