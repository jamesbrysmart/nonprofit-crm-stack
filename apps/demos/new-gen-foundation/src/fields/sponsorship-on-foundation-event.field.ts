import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/sponsored-events-on-opportunity.field';

export const SPONSORSHIP_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '6731c88f-7d62-48a9-a77b-dbec4a69e24d';

export default defineField({
  universalIdentifier: SPONSORSHIP_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: FieldType.RELATION,
  name: 'sponsorship',
  label: "Sponsorship",
  icon: 'IconAward',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'sponsorshipId',
  },
});
