import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LARGEST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '7257f5d0-182c-4ec2-bc96-bd04ca2d4eb5';

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
