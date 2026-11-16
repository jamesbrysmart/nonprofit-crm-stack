import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'awardedAmount',
  label: 'Awarded amount',
  description:
    'Funding amount committed by the funder once the application or bid is successful.',
  icon: 'IconCurrencyPound',
  isNullable: true,
  defaultValue: null,
});
