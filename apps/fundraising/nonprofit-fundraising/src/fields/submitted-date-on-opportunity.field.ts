import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  SUBMITTED_DATE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
