import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { SPONSORSHIP_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/sponsorship-on-foundation-event.field';

export const SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  'aa3b60b9-ee92-4ff8-9887-aaba2d00ae2d';

export default defineField({
  universalIdentifier: SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'sponsoredEvents',
  label: "Sponsored events",
  icon: 'IconCalendarEvent',
  relationTargetObjectMetadataUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  relationTargetFieldMetadataUniversalIdentifier: SPONSORSHIP_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
