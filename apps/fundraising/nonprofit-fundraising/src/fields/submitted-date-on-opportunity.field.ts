import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const SUBMITTED_DATE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '5d0edc79-0117-41ca-9db8-32f317033bc1';

export default defineField({
  universalIdentifier: SUBMITTED_DATE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE,
  name: 'submittedDate',
  label: 'Submitted date',
  description:
    'When the application or bid was formally submitted to the funder.',
  icon: 'IconCalendar',
  isNullable: true,
  defaultValue: null,
});
