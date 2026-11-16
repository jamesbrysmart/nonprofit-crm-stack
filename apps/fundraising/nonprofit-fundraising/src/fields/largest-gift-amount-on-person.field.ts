import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  LARGEST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LARGEST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'largestGiftAmount',
  label: 'Largest Gift Amount',
  description:
    'Materialized largest committed gift amount for this donor.',
  icon: 'IconCurrencyPound',
  isNullable: true,
  defaultValue: null,
});
