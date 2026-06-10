import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const FUNDING_PERIOD_START_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '7f8e7ca2-28ea-4f6b-b5f0-c2aa77c908a5';

export default defineField({
  universalIdentifier:
    FUNDING_PERIOD_START_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE,
  name: 'fundingPeriodStart',
  label: 'Funding period start',
  description:
    'Start of the funded delivery or coverage period once the opportunity is awarded.',
  icon: 'IconCalendar',
  isNullable: true,
  defaultValue: null,
});
