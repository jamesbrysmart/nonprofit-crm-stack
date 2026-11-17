import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/hosted-events-on-company.field';

export const VENUE_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  'f67b301a-20b0-4075-bd05-a7390c819d69';

export default defineField({
  universalIdentifier: VENUE_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: FieldType.RELATION,
  name: 'venue',
  label: "Venue",
  icon: 'IconBuildingCastle',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'venueId',
  },
});
