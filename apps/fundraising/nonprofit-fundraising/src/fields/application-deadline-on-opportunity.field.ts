import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '09cb240d-f633-487f-b696-148b40e99c8e';

export default defineField({
  universalIdentifier:
    APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE,
  name: 'applicationDeadline',
  label: 'Application deadline',
  description:
    'Submission deadline for the application, bid, or funding round.',
  icon: 'IconCalendarEvent',
  isNullable: true,
  defaultValue: null,
});
