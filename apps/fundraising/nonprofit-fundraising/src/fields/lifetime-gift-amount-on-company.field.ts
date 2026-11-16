import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  LIFETIME_GIFT_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
