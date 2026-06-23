import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LIFETIME_GIFT_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  '7dfe0978-54e4-4504-9a70-df8e50304b04';

export default defineField({
  universalIdentifier:
    LIFETIME_GIFT_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'lifetimeGiftAmount',
  label: 'Lifetime gift amount',
  description:
    'Total cash gift amount received from this company across linked processed gifts.',
  icon: 'IconCurrencyPound',
  isNullable: true,
  defaultValue: null,
});
