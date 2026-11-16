import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
