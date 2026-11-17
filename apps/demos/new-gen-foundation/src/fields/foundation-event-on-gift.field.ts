import { defineField, FieldType, RelationType, OnDeleteAction } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-foundation-event.field';

export const FOUNDATION_EVENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  '9f801a2f-e32c-42fc-a898-798dfeb32450';

export default defineField({
  universalIdentifier: FOUNDATION_EVENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'foundationEvent',
  label: "Event",
  icon: 'IconCalendarEvent',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  relationTargetFieldMetadataUniversalIdentifier: GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'foundationEventId',
  },
});
