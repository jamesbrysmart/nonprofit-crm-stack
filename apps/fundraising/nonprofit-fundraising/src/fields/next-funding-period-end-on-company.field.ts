import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  NEXT_FUNDING_PERIOD_END_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    NEXT_FUNDING_PERIOD_END_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE,
  name: 'nextFundingPeriodEnd',
  label: 'Next funding period end',
  description:
    'Nearest future funding period end date across linked opportunities.',
  icon: 'IconCalendarOff',
  isNullable: true,
  defaultValue: null,
});
