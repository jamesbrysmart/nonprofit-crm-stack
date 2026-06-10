import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  'ff5a97b2-7092-4c3d-b0bc-c75f1b6e40c8';

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
