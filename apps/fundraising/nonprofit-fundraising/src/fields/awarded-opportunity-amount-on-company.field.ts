import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  AWARDED_OPPORTUNITY_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    AWARDED_OPPORTUNITY_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'awardedOpportunityAmount',
  label: 'Awarded opportunity amount',
  description:
    'Total awarded amount across linked opportunities where awarded amount is populated.',
  icon: 'IconCurrencyPound',
  isNullable: true,
  defaultValue: null,
});
