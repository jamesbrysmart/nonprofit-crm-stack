import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE,
  name: 'fundingPeriodEnd',
  label: 'Funding period end',
  description:
    'End of the funded delivery or coverage period once the opportunity is awarded.',
  icon: 'IconCalendarOff',
  isNullable: true,
  defaultValue: null,
});
